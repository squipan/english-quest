/* English Quest — Service Worker
   Caches the app shell so it works fully offline after first load.
   Bump CACHE_NAME whenever you deploy changes so clients update. */
var CACHE_NAME = "english-quest-v9";
var ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./content.js",
  "./i18n.js",
  "./sync.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request).then(function (networkResponse) {
        // Clone immediately, synchronously, before any async gap — once the
        // browser starts delivering networkResponse to the page, the body
        // is locked and a later .clone() throws "body already used".
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
