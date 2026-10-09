# Chrome Web Store Listing — Entropilo

> Last Updated: 2026-10-09

## Store Listing

**Extension Name** [REQUIRED]
Entropilo — Goal-Aware Browsing Intervention

**Short Description** [REQUIRED]
Interrupts mindless doomscrolling by contrasting your stated intention with observed browsing behavior in real time.

**Detailed Description** [REQUIRED]
Entropilo is a privacy-first browser intervention that helps you stay mindful while browsing social media and information feeds.

Conventional website blockers treat every minute the same: five minutes of intentional research is blocked just like five minutes of mindless scrolling. Entropilo takes a different approach. When you open a supported feed, you declare what you came to accomplish. Entropilo then observes your interaction patterns locally—evaluating scroll speed, reading pauses, and link engagement—to detect when purposeful browsing drifts into autopilot.

Key Features:
- Intent Contract: State what you came to do before you begin (e.g. "Check hackathon results" or "Message a teammate").
- Fugue Engine: A lightweight, purely local behavioral heuristic that distinguishes rapid skimming from intentional reading.
- Progressive Entropy: If you drift into mindless scrolling, colors gently desaturate and contrast softens, naturally reducing dopamine friction without breaking the page.
- Behavioral Mirror: An in-feed reflection card that shows your original goal right alongside your observed actions ("You came here to find an announcement. You scrolled past 50 posts and opened 0 links. Are you still working toward that goal?").
- Conscious Exit & Reset: Easily reset the intervention when you refocus, or close the tab with a single click.

How to Use:
1. Open X/Twitter or test in the built-in EchoNet simulator.
2. Enter your session goal in the Intent Contract prompt.
3. Browse normally. When you read, click links, or interact intentionally, the page stays completely clean.
4. If you drift into endless rapid scrolling, notice the gentle visual cue and the Behavioral Mirror reminder.
5. Choose to close the tab or consciously reset and refocus.

Privacy & On-Device Processing:
Entropilo operates 100% locally on your machine. It does not record keystrokes, does not collect personal data, requires no user account, and sends zero telemetry to the cloud.

Support & Feedback:
Open source and community driven. Report issues or contribute suggestions via our GitHub repository.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Interrupts mindless doomscrolling by contrasting the user's declared goal with their observed browsing activity.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ✅ Specified | Intent Contract Modal |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ✅ Specified | Progressive Entropy Transition |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ✅ Specified | In-Feed Behavioral Mirror Card |
| Screenshot 4 | 1280×800 or 640×400 | ✅ Specified | Live Telemetry Action Popup |
| Screenshot 5 | 1280×800 or 640×400 | ✅ Specified | Built-in Feed Simulator |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Drafted | |
| Marquee Promo Tile | 1400×560 | ⬜ Drafted | |

### Screenshot Notes
- Screenshot 1: Shows the clean Intent Contract popup when opening a social feed with quick preset goals.
- Screenshot 2: Shows the subtle desaturation occurring when a user begins endless scrolling.
- Screenshot 3: Shows the high-contrast Behavioral Mirror card directly in the feed contrasting stated goal vs observed posts/links.
- Screenshot 4: Shows the extension popup showing live Zombification Score, scroll velocity, and dwell time.
- Screenshot 5: Shows the EchoNet sandbox test environment included with the extension.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Stores the user's declared session intention, sensitivity settings, and local session metrics in `chrome.storage.local`. No data leaves the browser. |
| `tabs` | permissions | Required to close the active tab when the user clicks "Done — Close Tab" in the Behavioral Mirror and to open the local simulator tab. |
| `activeTab` | permissions | Grants temporary access to interact with the currently focused tab when the user opens the action popup. |
| `https://twitter.com/*` | host_permissions | Allows the content script to observe scroll velocity, dwell time, and inject the Behavioral Mirror card into Twitter timelines. |
| `https://x.com/*` | host_permissions | Allows the content script to observe scroll velocity, dwell time, and inject the Behavioral Mirror card into X timelines. |
| `https://www.youtube.com/*` | host_permissions | Allows the content script to observe scroll velocity, dwell time, and inject the Behavioral Mirror card into YouTube feeds and Shorts. |
| `https://youtube.com/*` | host_permissions | Allows the content script to observe scroll velocity, dwell time, and inject the Behavioral Mirror card into YouTube feeds and Shorts. |
| `http://localhost/*` | host_permissions | Allows developers and testers to test Entropilo on local sandbox servers. |
| `http://127.0.0.1/*` | host_permissions | Allows developers and testers to test Entropilo on local IP addresses. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

All behavioral scoring (scroll velocity, reading dwell time, link clicks) is calculated in memory inside the local tab content script. No user data, text inputs, browsing history, or personal identifiers are stored externally or transmitted over the network.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | None | No |
| Health info | No | No | None | No |
| Financial info | No | No | None | No |
| Authentication info | No | No | None | No |
| Personal communications | No | No | None | No |
| Location | No | No | None | No |
| Web history | No | No | None | No |
| User activity | Transient | No | Local scroll/dwell estimation only | No |
| Website content | No | No | None | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
`https://github.com/himanshushukla/entropilo/blob/main/PRIVACY.md`

## Distribution

**Visibility**: Public
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]
Entropilo Team

**Contact Email** [REQUIRED]
contact@entropilo.dev

**Homepage URL** [RECOMMENDED]
https://github.com/himanshushukla/entropilo

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-10-09 | Initial hackathon release: Fugue Engine, Intent Contract, Progressive Entropy, Behavioral Mirror, and EchoNet Feed Simulator. | Ready for Packaging |
