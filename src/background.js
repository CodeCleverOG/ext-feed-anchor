importScripts("sites.js");

const BRAND = "#0f766e";
const MATCHES = SITES.map((s) => s.match);

const fresh = () => ({ since: Date.now(), returns: 0, byDay: {} });
const today = () => new Date().toLocaleDateString("en-CA");

async function isEnabled() {
  const { enabled } = await chrome.storage.local.get("enabled");
  return enabled !== false;
}

// Serialize writes so quick events don't overwrite each other
let queue = Promise.resolve();
function mutate(fn) {
  queue = queue.then(async () => {
    const { stats = fresh() } = await chrome.storage.local.get("stats");
    fn(stats);
    const days = Object.keys(stats.byDay).sort();
    while (days.length > 30) delete stats.byDay[days.shift()];
    await chrome.storage.local.set({ stats });
  }).catch(console.error);
  return queue;
}

async function updateBadge() {
  const [{ stats }, enabled] = await Promise.all([chrome.storage.local.get("stats"), isEnabled()]);
  if (!enabled) {
    await chrome.action.setBadgeText({ text: "OFF" });
    await chrome.action.setBadgeBackgroundColor({ color: "#9ca3af" });
    return;
  }
  const n = stats ? stats.returns : 0;
  await chrome.action.setBadgeText({ text: !n ? "" : n > 999 ? "1k+" : String(n) });
  await chrome.action.setBadgeBackgroundColor({ color: BRAND });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.kind === "return") {
    isEnabled().then((on) => {
      if (!on) return;
      mutate((s) => {
        s.returns++;
        const d = today();
        s.byDay[d] = (s.byDay[d] || 0) + 1;
      });
    });
  } else if (msg.kind === "reset") {
    queue = queue.then(() => chrome.storage.local.set({ stats: fresh() }));
    queue.then(() => sendResponse({ ok: true }));
    return true;
  }
});

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
  if (area !== "local") return;
  if (changes.enabled) applyToAllTabs();
  if (changes.enabled || changes.stats) updateBadge();
});

async function init() {
  await applyToAllTabs();
  await updateBadge();
}
chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);
