/**
 * Entropilo Content Script Orchestrator
 * Coordinates Site Adapters, Fugue Engine, Entropy Engine, Intent Contract, and Behavioral Mirror.
 */

(function () {
  // Prevent duplicate execution
  if (window.__ENTROPILO_INITIALIZED__) return;
  window.__ENTROPILO_INITIALIZED__ = true;

  console.log('[Entropilo] Initializing goal-aware intervention system...');

  // 1. Select appropriate site adapter
  const currentUrl = window.location.href;
  let adapter;
  if (currentUrl.includes('youtube.com')) {
    adapter = new YouTubeSiteAdapter();
  } else if (currentUrl.includes('twitter.com') || currentUrl.includes('x.com')) {
    adapter = new TwitterSiteAdapter();
  } else {
    adapter = new GenericSiteAdapter();
  }

  // 2. Instantiate core modules
  const entropyEngine = new ProgressiveEntropyEngine();
  let devHud = null;
  let isDemoMode = false;

  // 3. Behavioral Mirror
  const behavioralMirror = new BehavioralMirror({
    adapter,
    onReset: () => handleReset(),
    onCloseTab: () => chrome.runtime.sendMessage({ action: 'closeTab' }),
    onUpdateGoal: () => intentContract.showPromptModal()
  });

  // 4. Intent Contract
  const intentContract = new IntentContract({
    onGoalSet: (goal) => {
      console.log(`[Entropilo] Stated intention set: "${goal}"`);
      fugueEngine.reset();
      updateHud();
    }
  });

  // 5. Fugue Engine
  const fugueEngine = new FugueEngine({
    demoMode: isDemoMode,
    sensitivity: 'balanced'
  });

  // Load saved configuration
  chrome.storage.local.get(['config'], (result) => {
    if (result.config) {
      if (result.config.sensitivity) {
        fugueEngine.setSensitivity(result.config.sensitivity);
      }
      if (typeof result.config.demoMode === 'boolean') {
        isDemoMode = result.config.demoMode;
        fugueEngine.setDemoMode(isDemoMode);
      }
      if (result.config.showHud) {
        toggleHud(true);
      }
    }
  });

  // Fugue Engine event listeners
  fugueEngine.onScoreUpdate = (metrics) => {
    // Apply progressive visual entropy based on the score
    entropyEngine.applyScore(metrics.score);

    // Sync score badge via service worker
    try {
      chrome.runtime.sendMessage({
        action: 'updateScore',
        score: metrics.score
      });
    } catch (e) {
      // Channel may be closed
    }

    // Update Mirror card counts if it is active
    if (behavioralMirror.isVisible) {
      behavioralMirror.updateMetrics(metrics);
    }

    // Update Developer HUD if open
    updateHud(metrics);
  };

  fugueEngine.onThresholdReached = (metrics) => {
    const declaredGoal = intentContract.getGoal();
    behavioralMirror.show(declaredGoal, metrics);
  };

  // Start the engines
  intentContract.init();
  fugueEngine.start();

  // Listen for YouTube SPA transitions
  window.addEventListener('yt-navigate-finish', () => {
    // If user clicked into a specific watch video, record navigation as intentional interaction
    if (window.location.pathname.startsWith('/watch')) {
      fugueEngine.recordEvent('link_click', 2);
    }
    fugueEngine.initPostTracking();
  });

  function handleReset() {
    console.log('[Entropilo] User consciously reset the intervention.');
    entropyEngine.reset();
    behavioralMirror.hide();
    fugueEngine.reset();

    try {
      chrome.runtime.sendMessage({ action: 'updateScore', score: 0 });
    } catch (e) {}

    updateHud();
  }

  // Developer HUD implementation
  function toggleHud(forceState = null) {
    const shouldShow = forceState !== null ? forceState : !devHud;

    if (shouldShow && !devHud) {
      devHud = document.createElement('div');
      devHud.id = 'entropilo-dev-hud';
      devHud.className = 'entropilo-isolated-ui';

      devHud.innerHTML = `
        <div class="entropilo-hud-header">
          <span class="entropilo-hud-title">⚡ ENTROPILO HUD</span>
          <button type="button" class="entropilo-hud-close" id="entropilo-hud-close">&times;</button>
        </div>
        <div class="entropilo-hud-metrics">
          <div class="hud-metric">
            <span class="hud-label">Score</span>
            <span class="hud-value" id="hud-val-score">0 / 100</span>
          </div>
          <div class="hud-metric">
            <span class="hud-label">Stage</span>
            <span class="hud-value" id="hud-val-stage">0 (Clean)</span>
          </div>
          <div class="hud-metric">
            <span class="hud-label">Posts</span>
            <span class="hud-value" id="hud-val-posts">0</span>
          </div>
          <div class="hud-metric">
            <span class="hud-label">Links</span>
            <span class="hud-value" id="hud-val-links">0</span>
          </div>
          <div class="hud-metric">
            <span class="hud-label">Velocity</span>
            <span class="hud-value" id="hud-val-vel">0 px/s</span>
          </div>
          <div class="hud-metric">
            <span class="hud-label">Warmup</span>
            <span class="hud-value" id="hud-val-warmup">Yes</span>
          </div>
        </div>
        <div class="entropilo-hud-controls">
          <button type="button" class="hud-btn primary" id="hud-btn-trigger">⚡ Trigger Mirror</button>
          <button type="button" class="hud-btn" id="hud-btn-add-score">+25 Score</button>
          <button type="button" class="hud-btn" id="hud-btn-reset">Reset</button>
        </div>
        <div class="entropilo-hud-footer">
          <label class="hud-checkbox-label">
            <input type="checkbox" id="hud-demo-mode-cb" ${isDemoMode ? 'checked' : ''} />
            Fast Demo Mode (Short Gate)
          </label>
        </div>
      `;

      devHud.querySelector('#entropilo-hud-close')?.addEventListener('click', () => toggleHud(false));
      devHud.querySelector('#hud-btn-trigger')?.addEventListener('click', () => {
        const goal = intentContract.getGoal();
        fugueEngine.score = 88;
        entropyEngine.applyScore(88);
        behavioralMirror.show(goal, fugueEngine.getMetrics());
      });
      devHud.querySelector('#hud-btn-add-score')?.addEventListener('click', () => {
        fugueEngine.score = Math.min(100, fugueEngine.score + 25);
        fugueEngine.tick();
      });
      devHud.querySelector('#hud-btn-reset')?.addEventListener('click', handleReset);
      devHud.querySelector('#hud-demo-mode-cb')?.addEventListener('change', (e) => {
        isDemoMode = e.target.checked;
        fugueEngine.setDemoMode(isDemoMode);
        chrome.storage.local.get(['config'], (res) => {
          const cfg = res.config || {};
          cfg.demoMode = isDemoMode;
          chrome.storage.local.set({ config: cfg });
        });
      });

      document.body.appendChild(devHud);
      updateHud();
    } else if (!shouldShow && devHud) {
      devHud.remove();
      devHud = null;
    }
  }

  function updateHud(metrics = null) {
    if (!devHud) return;
    const m = metrics || fugueEngine.getMetrics();

    const scoreEl = devHud.querySelector('#hud-val-score');
    const stageEl = devHud.querySelector('#hud-val-stage');
    const postsEl = devHud.querySelector('#hud-val-posts');
    const linksEl = devHud.querySelector('#hud-val-links');
    const velEl = devHud.querySelector('#hud-val-vel');
    const warmupEl = devHud.querySelector('#hud-val-warmup');

    if (scoreEl) {
      scoreEl.textContent = `${m.score} / 100`;
      scoreEl.style.color = m.score >= 80 ? '#EF4444' : m.score >= 50 ? '#F59E0B' : '#10B981';
    }
    if (stageEl) {
      stageEl.textContent = m.stage === 3 ? 'Stage 3 (Mirror)' : m.stage === 2 ? 'Stage 2 (Muted)' : m.stage === 1 ? 'Stage 1 (Subtle)' : 'Stage 0 (Clean)';
    }
    if (postsEl) postsEl.textContent = String(m.postsScrolled);
    if (linksEl) linksEl.textContent = String(m.linksClicked);
    if (velEl) velEl.textContent = `${m.avgVelocity || 0} px/s`;
    if (warmupEl) warmupEl.textContent = m.isWarmingUp ? 'Active (Gated)' : 'Ready';
  }

  // Keyboard shortcut: Alt+Shift+E toggles HUD
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      toggleHud();
    }
  });

  // Listen for messages from extension popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.action) {
      case 'getLiveMetrics': {
        const metrics = fugueEngine.getMetrics();
        sendResponse({
          metrics,
          goal: intentContract.getGoal(),
          isMirrorActive: behavioralMirror.isVisible,
          demoMode: isDemoMode,
          sensitivity: fugueEngine.options.sensitivity
        });
        break;
      }

      case 'triggerMirror': {
        const goal = intentContract.getGoal();
        fugueEngine.score = 88;
        entropyEngine.applyScore(88);
        behavioralMirror.show(goal, fugueEngine.getMetrics());
        sendResponse({ success: true });
        break;
      }

      case 'resetIntervention': {
        handleReset();
        sendResponse({ success: true });
        break;
      }

      case 'toggleHud': {
        toggleHud();
        sendResponse({ success: true, isVisible: !!devHud });
        break;
      }

      case 'setDemoMode': {
        isDemoMode = Boolean(msg.enabled);
        fugueEngine.setDemoMode(isDemoMode);
        sendResponse({ success: true });
        break;
      }

      case 'setSensitivity': {
        fugueEngine.setSensitivity(msg.sensitivity);
        sendResponse({ success: true });
        break;
      }

      case 'updateGoal': {
        intentContract.showPromptModal();
        sendResponse({ success: true });
        break;
      }
    }
    return true;
  });
})();
