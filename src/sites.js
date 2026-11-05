// Supported sites. To add one, add an entry here and add its `match`
// pattern to `host_permissions` and both `content_scripts` in manifest.json.
self.SITES = [
  { id: "linkedin", name: "LinkedIn", match: "https://www.linkedin.com/*" },
  { id: "x", name: "X (Twitter)", match: "https://x.com/*" }
];

self.siteForUrl = (url) =>
  self.SITES.find((s) => url && url.startsWith(s.match.replace(/\*$/, "")));
