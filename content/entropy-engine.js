/**
 * Progressive Entropy Engine
 * Manages reversible visual degradation via extension-controlled CSS rules.
 * Does NOT destroy DOM nodes — applies bounded, reversible CSS filters with smooth transitions.
 */

class ProgressiveEntropyEngine {
  constructor() {
    this.styleId = 'entropilo-entropy-styles';
    this.currentScore = 0;
    this.isApplied = false;
    this.ensureStyleElement();
  }

  ensureStyleElement() {
    let el = document.getElementById(this.styleId);
    if (!el) {
      el = document.createElement('style');
      el.id = this.styleId;
      el.setAttribute('data-extension', 'entropilo');
      (document.head || document.documentElement).appendChild(el);
    }
    return el;
  }

  applyScore(score) {
    this.currentScore = Math.max(0, Math.min(100, score));

    if (this.currentScore < 35) {
      this.clear();
      return;
    }

    const styleEl = this.ensureStyleElement();

    // Calculate bounded degradation values
    // Grayscale: 0% at 35 -> up to 85% at 100
    const grayFactor = Math.min(85, Math.round(((this.currentScore - 35) / 65) * 85));

    // Contrast: 100% at 35 -> down to 78% at 100
    const contrastFactor = Math.max(78, Math.round(100 - (((this.currentScore - 35) / 65) * 22)));

    // Media blur: 0px at 50 -> up to 3px at 100
    let mediaBlur = 0;
    if (this.currentScore > 50) {
      mediaBlur = Math.min(3.0, (((this.currentScore - 50) / 50) * 3.0)).toFixed(1);
    }

    // Saturation reduction
    const satFactor = Math.max(20, Math.round(100 - (((this.currentScore - 35) / 65) * 80)));

    // Subtle vignette when score > 75
    const vignetteOpacity = this.currentScore >= 75
      ? Math.min(0.35, ((this.currentScore - 75) / 25) * 0.35).toFixed(2)
      : 0;

    styleEl.textContent = `
      html.entropilo-active body {
        filter: grayscale(${grayFactor}%) contrast(${contrastFactor}%) saturate(${satFactor}%) !important;
        transition: filter 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      html.entropilo-active img,
      html.entropilo-active video {
        filter: blur(${mediaBlur}px) !important;
        transition: filter 0.8s ease !important;
      }

      /* Protect extension UI from visual disruption */
      #entropilo-intent-modal,
      #entropilo-mirror-container,
      .entropilo-isolated-ui,
      #entropilo-dev-hud {
        filter: none !important;
        backdrop-filter: none !important;
      }

      ${vignetteOpacity > 0 ? `
      html.entropilo-active::before {
        content: "" !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        pointer-events: none !important;
        z-index: 999990 !important;
        box-shadow: inset 0 0 100px rgba(0, 0, 0, ${vignetteOpacity}) !important;
        transition: box-shadow 0.8s ease !important;
      }
      ` : ''}
    `;

    document.documentElement.classList.add('entropilo-active');
    this.isApplied = true;
  }

  clear() {
    const styleEl = document.getElementById(this.styleId);
    if (styleEl) {
      styleEl.textContent = '';
    }
    document.documentElement.classList.remove('entropilo-active');
    this.isApplied = false;
  }

  reset() {
    this.currentScore = 0;
    this.clear();
  }
}

window.ProgressiveEntropyEngine = ProgressiveEntropyEngine;
