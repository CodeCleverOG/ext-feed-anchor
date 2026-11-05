# Contributing

Issues and pull requests are welcome.

## Adding a site

1. Check how the site refreshes. Most use `visibilitychange` or window `focus`, which Feed Anchor already handles. If the site uses something else (timers, `pageshow`, polling), describe it in the PR.
2. Add an entry to `src/sites.js`:
   ```js
   { id: "example", name: "Example", match: "https://www.example.com/*" }
   ```
3. Add the same `match` pattern to `host_permissions` and to **both** `content_scripts` entries in `src/manifest.json`.
4. Add the site to the table in `README.md` and to the description in `store/listing.md`.

> **Heads-up for releases:** adding a new host to `host_permissions` makes Chrome disable the extension for existing users until they approve the new permission. Group new sites into one release. A later option is to move sites to `optional_host_permissions` with a per-site switch.

## Testing a change

1. Load `src/` unpacked from `chrome://extensions` (Developer mode), then click the reload icon after each change.
2. Open the site, scroll down the feed, switch to another tab for a few seconds and come back. The feed should not refresh, and the badge count should go up.
3. Turn the switch off in the popup. Without reloading the page, switch away and back: the site should behave normally (it may refresh). Turn it on again and check that protection resumes.
4. In `chrome://discards`, protected tabs should show **Auto Discardable** unchecked while on, and checked while off.

## Style

Plain JavaScript, no build step and no dependencies. Keep the permissions minimal; store reviewers check them closely.
