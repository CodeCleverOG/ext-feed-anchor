importScripts("sites.js");

const MATCHES = SITES.map((s) => s.match);

async function isEnabled() {
  const { enabled } = await chrome.storage.local.get("enabled");
  return enabled !== false;
}

// The badge only appears while paused, as a reminder that protection is off
async function updateBadge() {
  const on = await isEnabled();
  await chrome.action.setBadgeText({ text: on ? "" : "OFF" });
  await chrome.action.setBadgeBackgroundColor({ color: "#9ca3af" });
}

// Keep Chrome's Memory Saver from unloading supported tabs while active
function setDiscardable(tab, discardable) {
  if (tab.id != null && siteForUrl(tab.url) && tab.autoDiscardable !== discardable) {
    chrome.tabs.update(tab.id, { autoDiscardable: discardable }).catch(() => {});
  }
}

async function applyToAllTabs() {
  const on = await isEnabled();
  const tabs = await chrome.tabs.query({ url: MATCHES });
  tabs.forEach((t) => setDiscardable(t, !on));
}

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!info.url && info.status !== "complete") return;
  if (await isEnabled()) setDiscardable(tab, false);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled) {
    applyToAllTabs();
    updateBadge();
  }
});

async function init() {
  await applyToAllTabs();
  await updateBadge();
}
chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(async () => {
  // Counters from earlier versions are no longer used
  await chrome.storage.local.remove("stats");
  await init();
});
