# ENTROPILO: Presentation Deck Outline (7-8 Slides)

## Slide 1: Title & Opportunity
* **Title:** ENTROPILO — A Goal-Aware Browser Intervention Against Doomscrolling
* **Subtitle:** Restoring Intentional Attention Without Blind Lockouts
* **Opportunity / Problem:** 
  * Time ≠ Attention: Conventional tools (timers, blockers) treat 5 minutes of focused research the same as 5 minutes of mindless scrolling.
  * Frictionless feeds hijack cognitive control; existing blockers trigger irritation, bypasses, or uninstallations.

---

## Slide 2: Problem / Opportunity
* **Core Problem:**
  * Passive autopilot scrolling across YouTube, X/Twitter, and feeds drains focus.
  * Lockouts are punitive; feed erasers remove utility along with distractions.
* **The Opportunity:**
  * Detect *how* a user browses in real-time, not just *how long* they have been present.
  * Contrast observed browsing behavior directly with the user’s declared intention.

---

## Slide 3: Proposed Solution & Core Hypothesis
* **Thesis:** The browser should reflect your attention state, not just count seconds.
* **The Entropilo Trinity:**
  1. **Intent Contract:** Declaring purpose upon session entry.
  2. **Fugue Engine:** Lightweight local behavioral inference of cognitive drift.
  3. **Progressive Entropy & Behavioral Mirror:** Gradual sensory friction + contextual reflection to break trance states non-punitively.

---

## Slide 4: Workflow
1. **Declare Goal:** User opens feed (YouTube / X) and picks or types an intention (e.g., *"Watch tutorial"* or *"Check hackathon results"*).
2. **Observe Signals:** Local Content Script measures scroll velocity, dwell time, and interaction density.
3. **Drift Detection:** If scrolling speed spikes with near-zero pauses or clicks, the Fugue Engine score rises.
4. **Progressive Entropy:** Page subtly desaturates and softens contrast to reduce dopamine feedback loops.
5. **Behavioral Mirror:** Contextual card appears in-feed contrasting stated goal vs. observed stats.
6. **Conscious Decision:** Single-click choice to refocus & reset or close the tab.

---

## Slide 5: Features
* **Zero-Cloud Fugue Engine:** 100% on-device heuristic engine (zero external API latency, zero privacy concerns).
* **Multi-Platform Adapters:** Native in-feed card integration for YouTube (Home, Shorts, Watch) and X/Twitter.
* **Reversible Progressive Entropy:** Smooth CSS degradation (grayscale, contrast, soft media blur) that instantly clears on reset.
* **Intent-Contrast Mirror:** Displays real collected telemetry (e.g., *"Scrolled 42 posts, opened 0 links"*).
* **Developer Demo HUD (`Alt+Shift+E`):** Real-time telemetry overlay for live presentations and instant manual triggers.
* **Built-in EchoNet Simulator:** Full offline sandbox feed for testing without live account dependencies.

---

## Slide 6: Technologies Used
* **Architecture:** Chrome Extension Manifest V3 (MV3).
* **Core Languages:** Modern JavaScript (ES6+), HTML5, CSS3 Isolated Scopes.
* **Background Service:** Ephemeral MV3 Service Worker with reactive badge color/score status.
* **DOM Integration:** MutationObserver, IntersectionObserver, requestAnimationFrame sampling, YouTube `yt-navigate-finish` hooks.
* **Testing:** Node.js custom automated test suite verifying score decay, warmup gates, and reversibility.

---

## Slide 7: Innovation, Feasibility & Impact
* **Innovation:**
  * Shifting from *time-gated barriers* to *behavior-aware reflections*.
  * Psychological grounding: prompts metacognition rather than triggering reactance.
* **Feasibility:**
  * Lightweight (<100KB), zero server infrastructure costs, highly performant (<1ms frame execution).
* **Impact & Future Vision:**
  * Reduces unintentional browsing duration while keeping professional utility intact.
  * Future: Support for Instagram/LinkedIn, custom user sensitivity profiles, and screen-time wellbeing telemetry.

---

## Slide 8: MVP Snapshots, GitHub & Project Demo
* **Live Sandbox Demo:** Built-in offline EchoNet simulator (`simulator/index.html`).
* **Developer Shortcut:** `Alt + Shift + E` toggles the Real-Time Telemetry HUD.
* **GitHub Repository:** `https://github.com/himanshushukla/Entropilo` (or your chosen repository link).
* **Demo Flow:**
  1. Set intention -> 2. Browse purposeful (score stays 0) -> 3. Fast scrolling (entropy builds) -> 4. Mirror reflects goal -> 5. Reset & resume clarity.
