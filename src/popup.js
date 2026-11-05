const $ = (id) => document.getElementById(id);
const anchor = $("anchor");
const toggle = $("toggle");

let enabled = true;

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function showState(on) {
  document.body.classList.toggle("paused", !on);
  toggle.setAttribute("aria-checked", String(on));
  toggle.setAttribute("aria-label", on ? "Protection on" : "Protection paused");
  $("status").textContent = on
    ? "Keeps your place in the feed."
    : "Paused. Feeds can refresh.";
}

// Restart a CSS animation class on an element
function play(el, cls) {
  el.classList.remove("drop", "lift", "go");
  void el.getBoundingClientRect();
  el.classList.add(cls);
}

function animate(on) {
  if (on) {
    play(anchor, "drop");
    document.querySelectorAll(".ripple, .bubble").forEach((el) => play(el, "go"));
  } else {
    play(anchor, "lift");
  }
}
anchor.addEventListener("animationend", (e) => {
  if (e.animationName === "drop" || e.animationName === "lift") anchor.classList.remove("drop", "lift");
});

async function renderStats() {
  const { stats } = await chrome.storage.local.get("stats");
  const s = stats || { since: Date.now(), returns: 0, byDay: {} };
  const todayKey = new Date().toLocaleDateString("en-CA");
  const since = new Date(s.since).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  $("returns").textContent = s.returns.toLocaleString();
  $("today").textContent = ((s.byDay || {})[todayKey] || 0).toLocaleString();
  $("returns-label").textContent = `reloads prevented since ${since}`;
}

async function renderSites() {
  const list = $("sites");
  const rows = await Promise.all(
    SITES.map(async (site) => {
      const tabs = await chrome.tabs.query({ url: site.match });
      let text = "Not open";
      if (!enabled) text = "Paused";
      else if (tabs.length) text = `${plural(tabs.length, "tab")} protected`;
      return { name: site.name, text, on: enabled && tabs.length > 0 };
    })
  );
  list.replaceChildren(
    ...rows.map(({ name, text, on }) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      const state = document.createElement("span");
      label.textContent = name;
      state.textContent = text;
      state.className = on ? "state on" : "state";
      li.append(label, state);
      return li;
    })
  );
}

toggle.addEventListener("click", async () => {
  enabled = !enabled;
  showState(enabled);
  animate(enabled);
  renderSites();
  await chrome.storage.local.set({ enabled });
});

$("reset").addEventListener("click", () => {
  $("reset").hidden = true;
  $("confirm").hidden = false;
});
$("reset-no").addEventListener("click", () => {
  $("confirm").hidden = true;
  $("reset").hidden = false;
});
$("reset-yes").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ kind: "reset" });
  $("confirm").hidden = true;
  $("reset").hidden = false;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.stats) renderStats();
});

(async () => {
  const stored = await chrome.storage.local.get("enabled");
  enabled = stored.enabled !== false;
  showState(enabled); // no animation on open
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("init")));
  await Promise.all([renderStats(), renderSites()]);
})();
