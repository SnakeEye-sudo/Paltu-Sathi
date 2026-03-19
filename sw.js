const CACHE_PREFIX = "paltu-sathi";
const CACHE = `${CACHE_PREFIX}-v2026-03-19`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./logo.svg",
  "./favicon.svg",
  "./about.html",
  "./resources.html",
  "./contact.html",
  "./privacy-policy.html",
  "./terms.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (APP_SHELL.some((asset) => url.pathname.endsWith(asset.replace("./", "/")))) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirst(request, fallbackAsset) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await cache.match(fallbackAsset));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const fresh = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fresh;
}
