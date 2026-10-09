/**
 * Behavioral Mirror Intervention
 * Injects a contextual card and sticky reflection banner contrasting the declared goal with observed activity.
 * Designed to break autopilot through self-reflection rather than punitive lockout.
 */

class BehavioralMirror {
  constructor(options = {}) {
    this.options = Object.assign({
      adapter: null,
      onReset: null,
      onCloseTab: null,
      onUpdateGoal: null
    }, options);

    this.cardElement = null;
    this.bannerElement = null;
    this.isVisible = false;
  }

  show(goal, metrics) {
    if (this.isVisible) {
      this.updateMetrics(metrics);
      return;
    }

    this.isVisible = true;
    const card = this.createCardElement(goal, metrics);
    this.cardElement = card;

    // Use site adapter to inject into the active feed
    if (this.options.adapter) {
      this.options.adapter.insertMirrorCard(card);
    } else {
      document.body.prepend(card);
    }

    // Also mount sticky bottom intervention banner for guaranteed visibility
    this.mountBottomBanner(goal, metrics);
  }

  createCardElement(goal, metrics) {
    const card = document.createElement('div');
    card.id = 'entropilo-mirror-container';
    card.className = 'entropilo-mirror-card entropilo-isolated-ui';

    const safeGoal = escapeHtml(goal || 'Browsing');
    const postsCount = metrics?.postsScrolled || 0;
    const linksCount = metrics?.linksClicked || 0;
    const timeFormatted = metrics?.elapsedFormatted || '2m';

    card.innerHTML = `
      <div class="entropilo-mirror-inner">
        <div class="entropilo-mirror-badge">
          <span class="entropilo-pulse-dot"></span>
          <span>BEHAVIORAL MIRROR ACTIVATED</span>
        </div>

        <h3 class="entropilo-mirror-title">Has your browsing drifted?</h3>
        
        <div class="entropilo-contrast-box">
          <div class="entropilo-contrast-item declared">
            <span class="entropilo-contrast-label">🎯 Your Declared Goal:</span>
            <span class="entropilo-contrast-value">"${safeGoal}"</span>
          </div>
          
          <div class="entropilo-contrast-item observed">
            <span class="entropilo-contrast-label">📊 Observed Browsing Activity:</span>
            <div class="entropilo-metrics-row">
              <div class="entropilo-metric-pill">
                <strong>${postsCount}</strong> posts scrolled
              </div>
              <div class="entropilo-metric-pill">
                <strong>${linksCount}</strong> links opened
              </div>
              <div class="entropilo-metric-pill">
                <strong>${timeFormatted}</strong> active session
              </div>
            </div>
          </div>
        </div>

        <p class="entropilo-mirror-prompt">
          Your interaction pattern looks like mindless scrolling. Are you still working toward your goal?
        </p>

        <div class="entropilo-mirror-actions">
          <button type="button" class="entropilo-btn-close-tab" id="entropilo-btn-close">
            🚪 Done — Close Tab
          </button>
          <button type="button" class="entropilo-btn-refocus" id="entropilo-btn-refocus">
            🔄 Refocus & Reset
          </button>
          <button type="button" class="entropilo-btn-update-goal" id="entropilo-btn-update">
            ✏️ Change Goal
          </button>
        </div>
      </div>
    `;

    this.bindActionHandlers(card);
    return card;
  }

  mountBottomBanner(goal, metrics) {
    if (document.getElementById('entropilo-bottom-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'entropilo-bottom-banner';
    banner.className = 'entropilo-isolated-ui';

    const safeGoal = escapeHtml(goal || 'Browsing');
    const posts = metrics?.postsScrolled || 0;

    banner.innerHTML = `
      <div class="entropilo-banner-inner">
        <div class="entropilo-banner-info">
          <span class="entropilo-banner-tag">Autopilot Detected</span>
          <span class="entropilo-banner-text">
            Goal: <strong>"${safeGoal}"</strong> • Scrolled past <strong>${posts} posts</strong> without opening links.
          </span>
        </div>
        <div class="entropilo-banner-actions">
          <button type="button" class="entropilo-banner-btn-secondary" id="entropilo-banner-close">Close Tab</button>
          <button type="button" class="entropilo-banner-btn-primary" id="entropilo-banner-reset">Refocus & Reset</button>
        </div>
      </div>
    `;

    const closeBtn = banner.querySelector('#entropilo-banner-close');
    const resetBtn = banner.querySelector('#entropilo-banner-reset');

    closeBtn?.addEventListener('click', () => this.handleCloseTab());
    resetBtn?.addEventListener('click', () => this.handleReset());

    document.body.appendChild(banner);
    this.bannerElement = banner;
  }

  bindActionHandlers(container) {
    const closeBtn = container.querySelector('#entropilo-btn-close');
    const refocusBtn = container.querySelector('#entropilo-btn-refocus');
    const updateBtn = container.querySelector('#entropilo-btn-update');

    closeBtn?.addEventListener('click', () => this.handleCloseTab());
    refocusBtn?.addEventListener('click', () => this.handleReset());
    updateBtn?.addEventListener('click', () => this.handleUpdateGoal());
  }

  updateMetrics(metrics) {
    if (!this.cardElement) return;
    const postsCount = metrics?.postsScrolled || 0;
    const linksCount = metrics?.linksClicked || 0;
    const timeFormatted = metrics?.elapsedFormatted || '1m';

    const pillContainer = this.cardElement.querySelector('.entropilo-metrics-row');
    if (pillContainer) {
      pillContainer.innerHTML = `
        <div class="entropilo-metric-pill"><strong>${postsCount}</strong> posts scrolled</div>
        <div class="entropilo-metric-pill"><strong>${linksCount}</strong> links opened</div>
        <div class="entropilo-metric-pill"><strong>${timeFormatted}</strong> active session</div>
      `;
    }
  }

  handleCloseTab() {
    if (typeof this.options.onCloseTab === 'function') {
      this.options.onCloseTab();
    } else {
      chrome.runtime.sendMessage({ action: 'closeTab' });
    }
  }

  handleReset() {
    this.hide();
    if (typeof this.options.onReset === 'function') {
      this.options.onReset();
    }
  }

  handleUpdateGoal() {
    if (typeof this.options.onUpdateGoal === 'function') {
      this.options.onUpdateGoal();
    }
  }

  hide() {
    this.isVisible = false;
    if (this.cardElement) {
      this.cardElement.remove();
      this.cardElement = null;
    }
    if (this.bannerElement) {
      this.bannerElement.remove();
      this.bannerElement = null;
    }
    if (this.options.adapter) {
      this.options.adapter.removeMirrorCard();
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

window.BehavioralMirror = BehavioralMirror;
