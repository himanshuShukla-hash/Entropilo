/**
 * Entropilo Service Worker (Manifest V3)
 * Handles session coordination, badge feedback, tab lifecycle, and extension actions.
 * Rule: Service workers are ephemeral — persist state in chrome.storage.local.
 */

// Initialize default storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const { config } = await chrome.storage.local.get('config');
  if (!config) {
    await chrome.storage.local.set({
      config: {
        sensitivity: 'balanced', // 'gentle', 'balanced', 'strict'
        demoMode: false,         // Accelerated time-gates for live demos
        showHud: false,          // Real-time developer HUD overlay
        soundEnabled: false
      },
      activeSessions: {}
    });
  }
  await updateBadge(0);
});

// Update badge with score and color
async function updateBadge(score, tabId = null) {
  try {
    const text = score > 0 ? String(Math.round(score)) : '';
    const badgeDetails = { text };
    if (tabId) {
      badgeDetails.tabId = tabId;
    }
    await chrome.action.setBadgeText(badgeDetails);

    let color = '#10B981'; // Green
    if (score >= 80) {
      color = '#EF4444'; // Red (intervention active)
    } else if (score >= 50) {
      color = '#F59E0B'; // Amber (entropy building)
    } else if (score >= 25) {
      color = '#6366F1'; // Indigo (mild activity)
    }

    const colorDetails = { color };
    if (tabId) {
      colorDetails.tabId = tabId;
    }
    await chrome.action.setBadgeBackgroundColor(colorDetails);
  } catch (err) {
    // Tab might have closed; ignore
  }
}

// Runtime message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      const senderTabId = sender?.tab?.id;

      switch (message.action) {
        case 'updateScore': {
          const score = message.score || 0;
          if (senderTabId) {
            await updateBadge(score, senderTabId);
          } else {
            await updateBadge(score);
          }
          sendResponse({ success: true });
          break;
        }

        case 'closeTab': {
          if (senderTabId) {
            await chrome.tabs.remove(senderTabId);
            sendResponse({ success: true });
          } else {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.id) {
              await chrome.tabs.remove(activeTab.id);
            }
            sendResponse({ success: true });
          }
          break;
        }

        case 'openSimulator': {
          const url = chrome.runtime.getURL('simulator/index.html');
          const tab = await chrome.tabs.create({ url });
          sendResponse({ success: true, tabId: tab.id });
          break;
        }

        case 'getTabSession': {
          const key = `session_${senderTabId || 'current'}`;
          const result = await chrome.storage.local.get([key, 'config']);
          sendResponse({ session: result[key] || null, config: result.config });
          break;
        }

        case 'saveTabSession': {
          const key = `session_${senderTabId || 'current'}`;
          await chrome.storage.local.set({ [key]: message.session });
          sendResponse({ success: true });
          break;
        }

        case 'clearTabSession': {
          const key = `session_${senderTabId || 'current'}`;
          await chrome.storage.local.remove(key);
          if (senderTabId) {
            await updateBadge(0, senderTabId);
          }
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[Entropilo SW Error]', error);
      sendResponse({ error: error.message });
    }
  })();

  return true; // Keep channel open for async response
});

// Clean up session storage when a tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const key = `session_${tabId}`;
  await chrome.storage.local.remove(key);
});
