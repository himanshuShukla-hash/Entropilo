/**
 * Entropilo Popup Controller
 * Connects to the active tab, displays real-time signals, and provides demo controls.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const currentGoalEl = document.getElementById('current-goal');
  const scoreValEl = document.getElementById('score-val');
  const scoreBarEl = document.getElementById('score-bar');
  const stageTagEl = document.getElementById('stage-tag');
  const scoreDescEl = document.getElementById('score-desc');
  const statusTextEl = document.getElementById('status-text');
  const statusBadgeEl = document.getElementById('status-badge');

  const sigPostsEl = document.getElementById('sig-posts');
  const sigLinksEl = document.getElementById('sig-links');
  const sigVelocityEl = document.getElementById('sig-velocity');
  const sigTimeEl = document.getElementById('sig-time');

  const btnEditGoal = document.getElementById('btn-edit-goal');
  const btnReset = document.getElementById('btn-reset');
  const btnForceMirror = document.getElementById('btn-force-mirror');
  const btnOpenSimulator = document.getElementById('btn-open-simulator');

  const selectSensitivity = document.getElementById('select-sensitivity');
  const cbDemoMode = document.getElementById('cb-demo-mode');
  const cbShowHud = document.getElementById('cb-show-hud');

  let activeTabId = null;

  // 1. Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;

  // 2. Load stored config
  const { config, lastDeclaredGoal } = await chrome.storage.local.get(['config', 'lastDeclaredGoal']);
  if (config) {
    if (config.sensitivity) selectSensitivity.value = config.sensitivity;
    if (typeof config.demoMode === 'boolean') cbDemoMode.checked = config.demoMode;
    if (typeof config.showHud === 'boolean') cbShowHud.checked = config.showHud;
  }
  if (lastDeclaredGoal) {
    currentGoalEl.textContent = `"${lastDeclaredGoal}"`;
  }

  // 3. Poll active tab for real-time metrics
  async function fetchTabMetrics() {
    if (!activeTabId) return;

    try {
      const response = await chrome.tabs.sendMessage(activeTabId, { action: 'getLiveMetrics' });
      if (response && response.metrics) {
        statusTextEl.textContent = 'Monitoring';
        statusBadgeEl.style.color = '#10B981';

        const m = response.metrics;
        const score = m.score || 0;

        scoreValEl.textContent = score;
        scoreBarEl.style.width = `${score}%`;

        // Update color and stage
        if (score >= 80) {
          scoreValEl.style.color = '#EF4444';
          scoreBarEl.style.backgroundColor = '#EF4444';
          stageTagEl.textContent = 'Stage 3: Mirror Active';
          stageTagEl.style.background = 'rgba(239, 68, 68, 0.2)';
          stageTagEl.style.color = '#EF4444';
          scoreDescEl.textContent = 'Intervention triggered. Reflection requested.';
        } else if (score >= 60) {
          scoreValEl.style.color = '#F59E0B';
          scoreBarEl.style.backgroundColor = '#F59E0B';
          stageTagEl.textContent = 'Stage 2: Mindless Scrolling';
          stageTagEl.style.background = 'rgba(245, 158, 11, 0.2)';
          stageTagEl.style.color = '#F59E0B';
          scoreDescEl.textContent = 'Progressive entropy: saturation dropping.';
        } else if (score >= 40) {
          scoreValEl.style.color = '#818CF8';
          scoreBarEl.style.backgroundColor = '#818CF8';
          stageTagEl.textContent = 'Stage 1: Mild Drift';
          stageTagEl.style.background = 'rgba(99, 102, 241, 0.2)';
          stageTagEl.style.color = '#818CF8';
          scoreDescEl.textContent = 'Subtle visual softness beginning.';
        } else {
          scoreValEl.style.color = '#10B981';
          scoreBarEl.style.backgroundColor = '#10B981';
          stageTagEl.textContent = 'Stage 0: Purposeful';
          stageTagEl.style.background = 'rgba(16, 185, 129, 0.2)';
          stageTagEl.style.color = '#10B981';
          scoreDescEl.textContent = 'Browsing purposefully. Entropy dormant.';
        }

        sigPostsEl.textContent = m.postsScrolled || 0;
        sigLinksEl.textContent = m.linksClicked || 0;
        sigVelocityEl.textContent = `${m.avgVelocity || 0} px/s`;
        sigTimeEl.textContent = m.elapsedFormatted || '0s';

        if (response.goal) {
          currentGoalEl.textContent = `"${response.goal}"`;
        }
      }
    } catch (err) {
      // Content script is not running on this page (e.g. chrome:// or unsupported site)
      statusTextEl.textContent = 'Inactive';
      statusBadgeEl.style.color = '#94A3B8';
      statusBadgeEl.style.borderColor = '#64748B';
    }
  }

  await fetchTabMetrics();
  const pollInterval = setInterval(fetchTabMetrics, 800);
  window.addEventListener('unload', () => clearInterval(pollInterval));

  // 4. Action Handlers
  btnEditGoal.addEventListener('click', async () => {
    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { action: 'updateGoal' });
        window.close();
      } catch (e) {}
    }
  });

  btnReset.addEventListener('click', async () => {
    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { action: 'resetIntervention' });
        await fetchTabMetrics();
      } catch (e) {}
    }
  });

  btnForceMirror.addEventListener('click', async () => {
    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { action: 'triggerMirror' });
        window.close();
      } catch (e) {}
    }
  });

  btnOpenSimulator.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'openSimulator' });
    window.close();
  });

  // 5. Settings Handlers
  selectSensitivity.addEventListener('change', async (e) => {
    const val = e.target.value;
    const { config = {} } = await chrome.storage.local.get('config');
    config.sensitivity = val;
    await chrome.storage.local.set({ config });
    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { action: 'setSensitivity', sensitivity: val });
      } catch (e) {}
    }
  });

  cbDemoMode.addEventListener('change', async (e) => {
    const checked = e.target.checked;
    const { config = {} } = await chrome.storage.local.get('config');
    config.demoMode = checked;
    await chrome.storage.local.set({ config });
    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { action: 'setDemoMode', enabled: checked });
      } catch (e) {}
    }
  });

  cbShowHud.addEventListener('change', async (e) => {
    const checked = e.target.checked;
    const { config = {} } = await chrome.storage.local.get('config');
    config.showHud = checked;
    await chrome.storage.local.set({ config });
    if (activeTabId) {
      try {
        await chrome.tabs.sendMessage(activeTabId, { action: 'toggleHud' });
      } catch (e) {}
    }
  });
});
