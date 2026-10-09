/**
 * Intent Contract Module
 * Manages the initial goal declaration flow, session goal storage, and top indicator pill.
 */

class IntentContract {
  constructor(options = {}) {
    this.options = Object.assign({
      onGoalSet: null
    }, options);

    this.currentGoal = null;
    this.sessionStartTime = null;
    this.pillElement = null;
    this.modalElement = null;
  }

  async init() {
    // Check if there is already an active goal for this tab session
    const tabGoal = sessionStorage.getItem('entropilo_intent_goal');
    if (tabGoal) {
      this.currentGoal = tabGoal;
      this.sessionStartTime = parseInt(sessionStorage.getItem('entropilo_session_start') || Date.now(), 10);
      this.renderGoalPill();
      if (typeof this.options.onGoalSet === 'function') {
        this.options.onGoalSet(this.currentGoal);
      }
      return this.currentGoal;
    }

    // Otherwise, show the Intent Declaration prompt
    this.showPromptModal();
    return null;
  }

  getGoal() {
    return this.currentGoal || sessionStorage.getItem('entropilo_intent_goal') || 'Browsing';
  }

  getPresetsHtml() {
    const host = window.location.hostname || '';
    if (host.includes('youtube.com')) {
      return `
        <button type="button" class="entropilo-preset-btn" data-goal="Watch educational video or tutorial">🎓 Watch tutorial or educational video</button>
        <button type="button" class="entropilo-preset-btn" data-goal="Listen to podcast or music">🎵 Listen to music / podcast</button>
        <button type="button" class="entropilo-preset-btn" data-goal="Look up specific product review">🔍 Look up specific product review</button>
        <button type="button" class="entropilo-preset-btn" data-goal="Catch up on subscribed channels">📺 Catch up on subscription feed</button>
      `;
    }

    if (host.includes('twitter.com') || host.includes('x.com')) {
      return `
        <button type="button" class="entropilo-preset-btn" data-goal="Check hackathon results">🏆 Check hackathon results</button>
        <button type="button" class="entropilo-preset-btn" data-goal="Message a collaborator">💬 Message a collaborator</button>
        <button type="button" class="entropilo-preset-btn" data-goal="Look up technical announcement">🔍 Look up technical announcement</button>
        <button type="button" class="entropilo-preset-btn" data-goal="Check bookmarks and notifications">📌 Check bookmarks & notifications</button>
      `;
    }

    return `
      <button type="button" class="entropilo-preset-btn" data-goal="Check hackathon results">🏆 Check hackathon results</button>
      <button type="button" class="entropilo-preset-btn" data-goal="Research technical topic">🔬 Research technical topic</button>
      <button type="button" class="entropilo-preset-btn" data-goal="Message a collaborator">💬 Message a collaborator</button>
      <button type="button" class="entropilo-preset-btn" data-goal="Read saved bookmarks">📌 Read saved bookmarks</button>
    `;
  }

  showPromptModal() {
    if (document.getElementById('entropilo-intent-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'entropilo-intent-modal';
    modal.className = 'entropilo-isolated-ui';

    modal.innerHTML = `
      <div class="entropilo-modal-backdrop"></div>
      <div class="entropilo-modal-card">
        <div class="entropilo-modal-header">
          <div class="entropilo-brand">
            <span class="entropilo-icon-dot"></span>
            <span class="entropilo-title">ENTROPILO</span>
          </div>
          <span class="entropilo-tag">Intent Contract</span>
        </div>
        
        <h2 class="entropilo-modal-heading">What is your intention for this visit?</h2>
        <p class="entropilo-modal-desc">
          Declare what you came to accomplish. Entropilo will safeguard your focus and alert you if you drift into autopilot.
        </p>

        <div class="entropilo-presets">
          ${this.getPresetsHtml()}
        </div>

        <form id="entropilo-goal-form">
          <div class="entropilo-input-wrapper">
            <input 
              type="text" 
              id="entropilo-goal-input" 
              placeholder="Or type custom goal (e.g. Find research paper)..." 
              maxlength="100" 
              autocomplete="off" 
              required
            />
          </div>
          
          <div class="entropilo-modal-actions">
            <button type="submit" class="entropilo-btn-primary">
              Set Intention & Begin
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalElement = modal;

    const input = modal.querySelector('#entropilo-goal-input');
    const form = modal.querySelector('#entropilo-goal-form');
    const presetButtons = modal.querySelectorAll('.entropilo-preset-btn');

    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const goal = btn.getAttribute('data-goal');
        input.value = goal;
        this.saveGoal(goal);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        this.saveGoal(val);
      }
    });

    // Auto-focus input
    setTimeout(() => input?.focus(), 150);
  }

  saveGoal(goalText) {
    this.currentGoal = goalText;
    this.sessionStartTime = Date.now();

    sessionStorage.setItem('entropilo_intent_goal', goalText);
    sessionStorage.setItem('entropilo_session_start', String(this.sessionStartTime));

    // Also persist in chrome.storage.local for popup access
    try {
      chrome.storage.local.set({
        lastDeclaredGoal: goalText,
        lastGoalTimestamp: Date.now()
      });
    } catch (e) {
      // Ignore if disconnected
    }

    if (this.modalElement) {
      this.modalElement.classList.add('entropilo-modal-dismiss');
      setTimeout(() => {
        this.modalElement?.remove();
        this.modalElement = null;
      }, 300);
    }

    this.renderGoalPill();

    if (typeof this.options.onGoalSet === 'function') {
      this.options.onGoalSet(this.currentGoal);
    }
  }

  renderGoalPill() {
    if (this.pillElement && this.pillElement.isConnected) {
      const textSpan = this.pillElement.querySelector('.entropilo-pill-goal');
      if (textSpan) textSpan.textContent = this.currentGoal;
      return;
    }

    const pill = document.createElement('div');
    pill.id = 'entropilo-goal-pill';
    pill.className = 'entropilo-isolated-ui';
    pill.innerHTML = `
      <div class="entropilo-pill-content" title="Click to update your intention">
        <span class="entropilo-pill-dot"></span>
        <span class="entropilo-pill-label">Goal:</span>
        <span class="entropilo-pill-goal">${escapeHtml(this.currentGoal)}</span>
        <button type="button" class="entropilo-pill-edit" aria-label="Edit goal">✎</button>
      </div>
    `;

    pill.addEventListener('click', () => {
      this.showPromptModal();
      const input = document.getElementById('entropilo-goal-input');
      if (input) input.value = this.currentGoal;
    });

    document.body.appendChild(pill);
    this.pillElement = pill;
  }

  reset() {
    sessionStorage.removeItem('entropilo_intent_goal');
    sessionStorage.removeItem('entropilo_session_start');
    this.currentGoal = null;
    if (this.pillElement) {
      this.pillElement.remove();
      this.pillElement = null;
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

window.IntentContract = IntentContract;
