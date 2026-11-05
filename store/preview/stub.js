// Fake chrome.* API so popup.html can be rendered outside the extension
// for store screenshots. Configure with ?enabled=0&returns=N&today=N&tabs=N&frame=drop:0.3
(() => {
  const q = new URLSearchParams(location.search);
  const num = (k, d) => (q.has(k) ? Number(q.get(k)) : d);
  const since = Date.now() - 12 * 86400000;
  const todayKey = new Date().toLocaleDateString("en-CA");
  const data = {
    enabled: q.get("enabled") !== "0",
    stats: { since, returns: num("returns", 148), byDay: { [todayKey]: num("today", 9) } }
  };
  const pick = (k) => (typeof k === "string" ? { [k]: data[k] } : { ...data });
  window.chrome = {
    storage: {
      local: { get: async (k) => pick(k), set: async (o) => Object.assign(data, o) },
      onChanged: { addListener() {} }
    },
    tabs: { query: async () => Array.from({ length: num("tabs", 2) }, () => ({})) },
    runtime: { sendMessage: async () => ({ ok: true }) }
  };

  // Freeze an animation at a point in time: frame=drop:0.3 or frame=lift:0.2 (seconds)
  if (q.has("frame")) {
    const [name, t] = q.get("frame").split(":");
    const css = name === "drop"
      ? `.anchor{animation:drop .75s cubic-bezier(.45,0,.55,1) both paused!important;animation-delay:-${t}s!important}
         .ripple{animation:ripple .8s ease-out both paused!important;animation-delay:${0.12 - t}s!important}
         .ripple.r2{animation-delay:${0.3 - t}s!important}
         .bubble{animation:bubble 1.2s ease-out both paused!important}
         .b1{animation-delay:${0.45 - t}s!important}.b2{animation-delay:${0.6 - t}s!important}.b3{animation-delay:${0.75 - t}s!important}`
      : `.anchor{animation:lift .6s ease-out both paused!important;animation-delay:-${t}s!important}`;
    document.addEventListener("DOMContentLoaded", () => {
      const s = document.createElement("style");
      s.textContent = css + ".wave{animation:none!important}";
      document.head.append(s);
    });
  }
})();
