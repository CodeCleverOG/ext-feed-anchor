// Runs in the extension's isolated world. Passes the on/off setting to
// inject.js and forwards "you came back to the tab" events to the background.
(() => {
  const postState = (enabled) =>
    window.postMessage({ __feedAnchor: "state", active: enabled !== false }, location.origin);

  try {
    chrome.storage.local.get("enabled").then(({ enabled }) => postState(enabled)).catch(() => {});
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.enabled) postState(changes.enabled.newValue);
    });
  } catch (err) {
    // Extension was reloaded; refresh the page to reconnect
  }

  window.addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__feedAnchor !== "event") return;
    try {
      chrome.runtime.sendMessage({ kind: "return" }).catch(() => {});
    } catch (err) {
      // Extension was reloaded; refresh the page to reconnect
    }
  });
})();
