// Runs in the page's own context (MAIN world) at document_start.
// While active, the page always sees itself as visible and focused, so it has
// no trigger to reload the feed when you come back to the tab.
(() => {
  if (window.__feedAnchorLoaded) return;
  window.__feedAnchorLoaded = true;

  const proto = Document.prototype;
  const original = {};
  for (const prop of ["hidden", "webkitHidden", "visibilityState", "webkitVisibilityState"]) {
    const d = Object.getOwnPropertyDescriptor(proto, prop);
    if (d && d.get) original[prop] = d.get;
  }
  const realHasFocus = proto.hasFocus;

  const realState = () => {
    try { return original.visibilityState.call(document); } catch (e) { return "unknown"; }
  };

  const isTop = window === window.top;
  let active = true;
  let lastState = realState();

  // Only the main page reports, so embedded frames don't create duplicates
  const sendReturn = () => {
    if (isTop) window.postMessage({ __feedAnchor: "event", type: "return" }, location.origin);
  };

  // Report visible/focused while active; pass through the real values while paused
  const fake = { hidden: false, webkitHidden: false, visibilityState: "visible", webkitVisibilityState: "visible" };
  for (const prop of Object.keys(fake)) {
    Object.defineProperty(proto, prop, {
      configurable: true,
      get() {
        if (active) return fake[prop];
        if (original[prop]) return original[prop].call(this);
        const state = realState();
        return prop.endsWith("isibilityState") ? state : state === "hidden";
      }
    });
  }
  proto.hasFocus = function () {
    return active ? true : realHasFocus.call(this);
  };

  // Swallow visibility events before the site's listeners see them
  const onVisibility = (e) => {
    let cameBack = false;
    if (e.type === "visibilitychange") {
      const now = realState();
      cameBack = lastState === "hidden" && now === "visible";
      lastState = now;
    }
    if (!active) return;
    e.stopImmediatePropagation();
    if (cameBack) sendReturn();
  };
  for (const type of ["visibilitychange", "webkitvisibilitychange"]) {
    window.addEventListener(type, onVisibility, true);
    document.addEventListener(type, onVisibility, true);
  }

  // Swallow window-level focus/blur only (leave input fields alone)
  const onWindowFocus = (e) => {
    if (active && (e.target === window || e.target === document)) e.stopImmediatePropagation();
  };
  window.addEventListener("focus", onWindowFocus, true);
  window.addEventListener("blur", onWindowFocus, true);

  // On/off switch, sent by bridge.js
  window.addEventListener("message", (e) => {
    if (e.source !== window || !e.data || e.data.__feedAnchor !== "state") return;
    active = e.data.active !== false;
    lastState = realState();
  });
})();
