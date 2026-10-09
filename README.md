# ENTROPILO 🪞

> **A Goal-Aware Browser Intervention Against Doomscrolling**  
> *Time spent is not the same as attention wasted.*

[![Chrome Extension](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)](manifest.json)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-10B981)](#running-tests)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-6366F1)](#privacy--architecture)

---

## 1. Overview & Problem Statement

Conventional digital wellbeing tools rely on crude mechanisms:
* **Timers & Lockouts:** Block a website after 15 minutes, penalizing legitimate research just as harshly as mindless doomscrolling.
* **Feed Erasers:** Strip away all content, rendering platforms useless for updates or announcements.
* **Opening Delays:** Introduce friction when entering an app, but do nothing once a user drifts into autopilot ten minutes later.

**Entropilo** tests a different hypothesis:
> *The browser should not treat every minute equally. Interventions should respond not only to how long a person has been on a site, but to how they are using it.*

When you open a supported feed, you declare an **Intent Contract** (e.g., *"Check hackathon results"*). Entropilo’s local **Fugue Engine** observes real-time interaction signals—scroll velocity, dwell time, and click density. If you drift into ceaseless scrolling, the interface gradually desaturates via **Progressive Entropy**, culminating in an in-feed **Behavioral Mirror** comparing your stated goal against your observed actions.

---

## 2. Core Architecture

```
                                  [ User Opens Feed ]
                                           │
                                           ▼
                                 [ 1. Intent Contract ]
                         "What is your goal for this session?"
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                [ Purposeful Browsing ]              [ Autopilot Scrolling ]
            - Pausing to read (>2s dwell)         - High velocity (>1200 px/s)
            - Opening links / interactions        - Zero links opened / 0 dwell
                        │                                     │
                        ▼                                     ▼
                [ Score: 0 - 30 ]                     [ Fugue Engine Score ]
                Page stays pristine                   - Stage 1: Mild desaturation
                                                      - Stage 2: Color drain + soft blur
                                                      - Stage 3 (Score 80+):
                                                              │
                                                              ▼
                                                   [ 2. Behavioral Mirror ]
                                                "You came to check hackathon results.
                                                 You scrolled 54 posts & opened 0 links.
                                                 Are you still working toward that goal?"
                                                              │
                                        ┌─────────────────────┴─────────────────────┐
                                        ▼                                           ▼
                                  [ Close Tab ]                            [ Refocus & Reset ]
```

### Core Subsystems:
1. **The Fugue Engine (`content/fugue-engine.js`):** Lightweight local behavioral heuristic that tracks scroll velocity via `requestAnimationFrame`, reading pauses, and click rates. Features rolling time windows and an initial warmup grace period to prevent premature false positives.
2. **Progressive Entropy Engine (`content/entropy-engine.js`):** Injects dynamic, bounded CSS rules (`grayscale`, `contrast`, media blur). 100% reversible in 400ms without DOM destruction.
3. **Intent Contract (`content/intent-contract.js`):** Session-level goal prompt with presets and a discreet top indicator pill.
4. **Behavioral Mirror (`content/behavioral-mirror.js`):** In-feed card and sticky bottom reflection banner comparing the stated goal against measured telemetry.
5. **Site Adapters (`content/site-adapters/`):** Dedicated adapters for X/Twitter (`x.com`, `twitter.com`) with fallback for generic feeds.
6. **EchoNet Social Feed Simulator (`simulator/`):** Built-in sandbox social feed for immediate offline demos and testing.

---

## 3. Quick Start: Loading in Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions/` in the URL bar.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the `Entropilo` directory (`/Users/himanshushukla/himanshushukla/Entropilo`).
6. The Entropilo icon will appear in your Chrome toolbar!

---

## 4. Live Hackathon Demo Plan

You can demonstrate Entropilo in under 90 seconds using either **EchoNet Simulator** or **X/Twitter**:

### Demo Option A: Built-in EchoNet Simulator (Recommended for Judges)
1. Click the Entropilo extension icon in Chrome toolbar.
2. Click **"🧪 Open EchoNet Feed Simulator"**.
3. **Step 1 (Intent Contract):** When the prompt appears, click the preset: **"🏆 Check hackathon results"**.
4. **Step 2 (Normal Browsing):** Scroll down slowly, pause on the first post to read, and click a link.
   * *Notice:* The page remains completely clear. Score stays at 0.
5. **Step 3 (The Drift):** Rapidly scroll downward through multiple posts without clicking or pausing.
   * *Notice:* Colors begin to desaturate subtly as the score climbs.
6. **Step 4 (Behavioral Mirror):** As the score passes the threshold, the **Behavioral Mirror** card appears right in the feed:
   * *"You came here to: Check hackathon results"*
   * *"Observed activity: Scrolled past 48 posts • Opened 0 links"*
   * *"Are you still working toward that goal?"*
7. **Step 5 (Conscious Choice):** Click **"Refocus & Reset"**—watch the page instantly restore full color and clarity!

### Demo Option B: On Live Platforms (X / Twitter or YouTube)
1. Open [youtube.com](https://youtube.com) or [x.com](https://x.com).
2. The Intent Contract dialog prompts for your session intention (with tailored presets like *"Watch tutorial / educational video"*).
3. If you watch a video or click a tutorial, score stays clean.
4. If you start endlessly scrolling through the Home feed or YouTube Shorts without watching or clicking, progressive desaturation begins and the Behavioral Mirror card appears in the feed!

---

## 5. Developer HUD & Demo Controls

To make live presentations 100% foolproof:
* **Keyboard Shortcut:** Press `Alt + Shift + E` (or `Option + Shift + E` on Mac) anywhere on a supported page to toggle the **Floating Real-time HUD**.
* **HUD Controls:**
  * **⚡ Trigger Mirror:** Instantly forces the Behavioral Mirror to appear for judges.
  * **+25 Score:** Steps up the Zombification score.
  * **Fast Demo Mode Checkbox:** Reduces the warmup gate from 40s to 6s for lightning-fast 15-second pitch presentations.
  * **Reset:** Instantly resets the engine and clears entropy.

---

## 6. Running Tests

Entropilo includes an automated Node.js test suite verifying the heuristic scoring models, time-gate bounds, decay formulas, and CSS reversibility:

```bash
# Run all test suites
node tests/run-all-tests.js
```

Output:
```
==================================================
       ENTROPILO TEST VERIFICATION SUITE         
==================================================

▶ Executing: tests/fugue-engine.test.js
✅ Test 1 Passed: Initial state properly calibrated
✅ Test 2 Passed: Intentional reading keeps score low
✅ Test 3 Passed: Rapid low-interaction scrolling triggers score climb
✅ Test 4 Passed: Reset fully clears score and cumulative counters
✅ Test 5 Passed: Metrics elapsed time formatting is accurate

▶ Executing: tests/entropy-engine.test.js
✅ Test 1 Passed: Low score leaves page unaffected
✅ Test 2 Passed: Score 65 applies calibrated desaturation
✅ Test 3 Passed: High score applies complete intervention stage with bounds
✅ Test 4 Passed: Reset is 100% reversible and cleans all styles

✔ ALL TEST SUITES PASSED (100% SUCCESS)
```

---

## 7. Privacy & Architecture Guarantees

* **Zero Cloud Telemetry:** No servers, no analytics endpoints, no third-party scripts.
* **No Keylogging:** We never read user typed inputs or messages on the page.
* **Transient Heuristics:** Scroll velocity and dwell samples are kept in a rolling 25-second in-memory buffer that is continuously discarded.
* **Manifest V3 Compliant:** Pure modern service worker architecture with minimal permissions (`storage`, `tabs`, `activeTab`).

---

## 8. Hackathon Judge Q&A Reference

* **Q: Isn't this just a website blocker with animations?**  
  * **A:** No. Conventional blockers use blind timers or URL blocklists. Entropilo measures *how* you browse in real time, contrasting your stated intention against your observed actions to break subconscious autopilot without kicking you off the platform.
* **Q: Why not use an LLM or ML classifier?**  
  * **A:** An explainable, lightweight heuristic executes in <1ms without network calls, API keys, privacy risks, or latency. The goal is friction and self-awareness, not surveillance.
* **Q: What if the user refreshes the page?**  
  * **A:** Session intention and state persist in local session storage, seamlessly restoring context while still allowing conscious reset.
