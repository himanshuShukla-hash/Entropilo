/**
 * The Fugue Engine
 * Lightweight local behavioral heuristic that estimates mindless scrolling vs intentional browsing.
 * Measures scroll velocity, dwell time, and interaction density over rolling windows.
 * Excludes cloud telemetry and heavy ML models.
 */

class FugueEngine {
  constructor(options = {}) {
    this.options = Object.assign({
      windowDurationMs: 25000,    // 25-second rolling observation window
      gracePeriodMs: 40000,       // 40-second initial grace period (warm-up gate)
      demoGracePeriodMs: 6000,    // 6-second grace period when Demo Mode is active
      tickIntervalMs: 600,        // Update tick every 600ms
      sensitivity: 'balanced',    // 'gentle', 'balanced', 'strict'
      demoMode: false,
    }, options);

    // Running state
    this.score = 0;               // 0 to 100
    this.sessionStartTime = Date.now();
    this.lastTickTime = Date.now();
    this.lastScrollTime = Date.now();
    this.lastScrollY = window.scrollY;
    this.isDwelling = false;
    this.dwellStartTime = Date.now();

    // Cumulative stats
    this.stats = {
      postsScrolled: 0,
      linksClicked: 0,
      totalInteractions: 0,
      maxVelocity: 0,
      dwellPeriods: 0,
      totalDwellTimeMs: 0
    };

    // Rolling events buffer: { timestamp, type, value }
    this.rollingEvents = [];

    // Animation frame handle for scroll sampling
    this.rafId = null;
    this.timerId = null;
    this.isTicking = false;

    // Callbacks
    this.onScoreUpdate = null;
    this.onThresholdReached = null;

    // Bind event handlers
    this.handleScroll = this.handleScroll.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.tick = this.tick.bind(this);

    // Track viewed posts with IntersectionObserver
    this.postObserver = null;
    this.seenPosts = new WeakSet();
  }

  start() {
    this.sessionStartTime = Date.now();
    this.lastTickTime = Date.now();
    this.lastScrollTime = Date.now();
    this.lastScrollY = window.scrollY;
    this.isDwelling = true;
    this.dwellStartTime = Date.now();

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    document.addEventListener('click', this.handleClick, { capture: true, passive: true });
    document.addEventListener('keydown', this.handleKeyDown, { passive: true });

    this.initPostTracking();

    this.isTicking = true;
    this.timerId = setInterval(this.tick, this.options.tickIntervalMs);
  }

  stop() {
    this.isTicking = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.postObserver) {
      this.postObserver.disconnect();
      this.postObserver = null;
    }

    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  reset() {
    this.score = 0;
    this.sessionStartTime = Date.now();
    this.lastTickTime = Date.now();
    this.rollingEvents = [];
    this.stats.postsScrolled = 0;
    this.stats.linksClicked = 0;
    this.stats.totalInteractions = 0;
    this.stats.totalDwellTimeMs = 0;
    this.stats.dwellPeriods = 0;

    if (typeof this.onScoreUpdate === 'function') {
      this.onScoreUpdate(this.getMetrics());
    }
  }

  setDemoMode(enabled) {
    this.options.demoMode = Boolean(enabled);
  }

  setSensitivity(sensitivity) {
    if (['gentle', 'balanced', 'strict'].includes(sensitivity)) {
      this.options.sensitivity = sensitivity;
    }
  }

  initPostTracking() {
    if (!('IntersectionObserver' in window)) return;

    this.postObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !this.seenPosts.has(entry.target)) {
          this.seenPosts.add(entry.target);
          this.stats.postsScrolled += 1;
          this.recordEvent('post_view', 1);
        }
      }
    }, { threshold: 0.4 });

    this.observeNewPosts();
  }

  observeNewPosts() {
    if (!this.postObserver) return;
    const posts = document.querySelectorAll('article, [role="article"], .post-card');
    posts.forEach(post => {
      if (!this.seenPosts.has(post)) {
        this.postObserver.observe(post);
      }
    });
  }

  handleScroll() {
    const now = Date.now();
    if (this.rafId) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      const currentY = window.scrollY;
      const deltaY = Math.abs(currentY - this.lastScrollY);
      const deltaTime = Math.max(10, now - this.lastScrollTime);
      const velocityPxSec = (deltaY / deltaTime) * 1000;

      // End dwell state if scrolling actively
      if (deltaY > 15) {
        if (this.isDwelling) {
          const dwellDuration = now - this.dwellStartTime;
          if (dwellDuration > 1200) {
            this.stats.totalDwellTimeMs += dwellDuration;
            this.stats.dwellPeriods += 1;
            this.recordEvent('dwell', dwellDuration);
          }
          this.isDwelling = false;
        }
      }

      this.lastScrollY = currentY;
      this.lastScrollTime = now;
      this.stats.maxVelocity = Math.max(this.stats.maxVelocity, velocityPxSec);

      this.recordEvent('scroll_velocity', velocityPxSec);
      this.observeNewPosts();
    });
  }

  handleClick(e) {
    const now = Date.now();
    this.stats.totalInteractions += 1;
    this.recordEvent('interaction', 1);

    // Check if clicked element or parent is a link
    const link = e.target.closest('a');
    if (link && link.href) {
      this.stats.linksClicked += 1;
      this.recordEvent('link_click', 1);
    }
  }

  handleKeyDown(e) {
    // Only count intentional navigation or keyboard interaction
    if (['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'PageUp', 'j', 'k'].includes(e.key)) {
      this.stats.totalInteractions += 1;
      this.recordEvent('interaction', 0.5);
    }
  }

  recordEvent(type, value) {
    const now = Date.now();
    this.rollingEvents.push({ timestamp: now, type, value });
  }

  cleanRollingEvents(now) {
    const cutoff = now - this.options.windowDurationMs;
    this.rollingEvents = this.rollingEvents.filter(ev => ev.timestamp >= cutoff);
  }

  tick() {
    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000; // seconds
    this.lastTickTime = now;

    // Check if user has paused scrolling -> entering dwell mode
    if (!this.isDwelling && (now - this.lastScrollTime > 1200)) {
      this.isDwelling = true;
      this.dwellStartTime = now;
    }

    this.cleanRollingEvents(now);

    // Compute rolling window metrics
    let totalVelocity = 0;
    let velocitySamples = 0;
    let totalDwellMs = 0;
    let interactions = 0;
    let linkClicks = 0;

    for (const ev of this.rollingEvents) {
      if (ev.type === 'scroll_velocity') {
        totalVelocity += ev.value;
        velocitySamples += 1;
      } else if (ev.type === 'dwell') {
        totalDwellMs += ev.value;
      } else if (ev.type === 'interaction') {
        interactions += ev.value;
      } else if (ev.type === 'link_click') {
        linkClicks += ev.value;
      }
    }

    // Add currently active dwell time
    if (this.isDwelling) {
      totalDwellMs += (now - this.dwellStartTime);
    }

    const avgVelocity = velocitySamples > 0 ? (totalVelocity / velocitySamples) : 0;
    const dwellRatio = Math.min(1, totalDwellMs / this.options.windowDurationMs);

    // Normalize signals into 0..1 zombification factors:
    // 1. Velocity factor: 0 at <= 150 px/s, 1 at >= 1200 px/s
    const velocityFactor = Math.min(1, Math.max(0, (avgVelocity - 150) / 1050));

    // 2. Low dwell factor: high when user doesn't stop to read (dwellRatio near 0)
    const lowDwellFactor = Math.max(0, 1 - (dwellRatio * 1.5));

    // 3. Low interaction factor: high when user never clicks or opens links
    const interactionScore = Math.min(1, (interactions * 0.25) + (linkClicks * 0.75));
    const lowInteractionFactor = Math.max(0, 1 - interactionScore);

    // Sensitivity multipliers
    let sensitivityMult = 1.0;
    if (this.options.sensitivity === 'gentle') sensitivityMult = 0.7;
    if (this.options.sensitivity === 'strict') sensitivityMult = 1.35;
    if (this.options.demoMode) sensitivityMult = 2.4; // Responsive demo mode

    // Composite instant drift factor (0 to 1)
    const driftIndex = (
      (velocityFactor * 0.40) +
      (lowDwellFactor * 0.35) +
      (lowInteractionFactor * 0.25)
    ) * sensitivityMult;

    // Check warmup gate
    const sessionAge = now - this.sessionStartTime;
    const effectiveGracePeriod = this.options.demoMode
      ? this.options.demoGracePeriodMs
      : this.options.gracePeriodMs;

    const isWarmingUp = sessionAge < effectiveGracePeriod;

    // Update cumulative score:
    // If driftIndex > 0.45: score climbs
    // If driftIndex < 0.40 or purposeful browsing (e.g. dwell, link clicked): score decays
    if (driftIndex > 0.45 && !isWarmingUp) {
      const riseRate = (driftIndex - 0.45) * 12.0; // pts per sec
      this.score = Math.min(100, this.score + (riseRate * dt));
    } else if (isWarmingUp) {
      // In warm-up grace period, score climbs slowly and caps at 25
      if (driftIndex > 0.5) {
        this.score = Math.min(25, this.score + (2 * dt));
      } else {
        this.score = Math.max(0, this.score - (4 * dt));
      }
    } else {
      // Decay score when user is reading or engaged
      const decayRate = 6.0 + (dwellRatio * 5.0) + (linkClicks * 15.0);
      this.score = Math.max(0, this.score - (decayRate * dt));
    }

    const metrics = this.getMetrics();
    metrics.avgVelocity = Math.round(avgVelocity);
    metrics.dwellRatio = Math.round(dwellRatio * 100);
    metrics.driftIndex = Math.round(driftIndex * 100);
    metrics.isWarmingUp = isWarmingUp;

    if (typeof this.onScoreUpdate === 'function') {
      this.onScoreUpdate(metrics);
    }

    if (this.score >= 80 && typeof this.onThresholdReached === 'function') {
      this.onThresholdReached(metrics);
    }
  }

  getMetrics() {
    const elapsedSec = Math.max(1, Math.round((Date.now() - this.sessionStartTime) / 1000));
    let stage = 0;
    if (this.score >= 80) stage = 3;      // Intervention
    else if (this.score >= 60) stage = 2; // Moderate entropy
    else if (this.score >= 40) stage = 1; // Subtle entropy

    return {
      score: Math.round(this.score),
      stage,
      postsScrolled: this.stats.postsScrolled,
      linksClicked: this.stats.linksClicked,
      totalInteractions: this.stats.totalInteractions,
      elapsedSec,
      elapsedFormatted: this.formatTime(elapsedSec),
      maxVelocity: Math.round(this.stats.maxVelocity)
    };
  }

  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }
}

window.FugueEngine = FugueEngine;
