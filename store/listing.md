# Chrome Web Store listing — Feed Anchor

Copy these into the Developer Dashboard. Images are in this folder.

## Store listing tab

**Name:** Feed Anchor

**Summary (≤132 chars):**
Keeps your social feed where you left it. Stops auto-refresh when you return to the tab. Currently supports LinkedIn and X.

**Category:** Productivity  **Language:** English

**Description:**
```
Your feed stays where you left it.

Some sites reload the feed every time you come back to the tab. If you were halfway through a post, or left a tab open to read later, it's gone. Feed Anchor stops that.

HOW IT WORKS
• On supported sites, the page sees the tab as always visible and focused, so it has no reason to refresh.
• Chrome's Memory Saver won't unload those tabs in the background.
• Pause or resume with one tap. It applies instantly, with no page reload.
• See at a glance which tabs are protected.

SUPPORTED SITES
• LinkedIn
• X (Twitter)
More platforms are coming.

PRIVATE BY DESIGN
• No data collection, analytics or tracking.
• No network requests. Everything stays on your device.
• Open source (MIT): https://github.com/CodeCleverOG/ext-feed-anchor

Feed Anchor is an independent project and is not affiliated with or endorsed by LinkedIn or X.
```

**Images:**
- Store icon: `src/icons/icon128.png`
- Screenshots (1280×800): `store/screenshot-1.png`, `store/screenshot-2.png`
- Small promo tile (440×280): `store/promo-440x280.png`

**Homepage URL:** https://github.com/CodeCleverOG/ext-feed-anchor
**Support URL:** https://github.com/CodeCleverOG/ext-feed-anchor/issues

## Privacy practices tab

**Single purpose:**
Stops supported social sites from automatically refreshing the feed when the user returns to the tab, so the user keeps their place.

**Permission justifications:**

- `storage` — Saves the user's on/off setting locally. Nothing leaves the device.
- Host permissions `https://www.linkedin.com/*` and `https://x.com/*` — Needed to run the extension's content scripts on LinkedIn and X, the only sites it acts on, and to mark open tabs on those sites as not auto-discardable so Chrome's Memory Saver doesn't reload them.
- Content script in the page's main world (`inject.js`) — It runs inside the supported site's page context so the site sees the tab as always visible and focused. It overrides `document.hidden`, `document.visibilityState` and `document.hasFocus()`, and stops `visibilitychange` and window-level `focus`/`blur` events before the page's listeners receive them. This is what keeps the site from reloading the feed when the user returns. It does not read or change page content, and it sends nothing off the device. A second isolated-world script (`bridge.js`) only passes the user's on/off setting to it.

**Remote code:** No, I am not using remote code. All JavaScript is packaged in the extension.

**Data usage:** tick none of the data types (the extension collects no user data). Then certify all three statements:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** https://github.com/CodeCleverOG/ext-feed-anchor/blob/main/PRIVACY.md

## Distribution tab
- Visibility: Public
- Regions: All
- Pricing: Free
