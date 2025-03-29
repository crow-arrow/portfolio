const CACHE_NAME = "my-cache-v1";

const imageFiles = import.meta.glob("/public/images/*.avif", { eager: true });
const iconFiles = import.meta.glob("/public/icons/*.{svg,webp,avif,ico}", {
  eager: true,
});

const imagesToCache = Object.values(imageFiles).map((file) => file.default);
const iconsToCache = Object.values(iconFiles).map((file) => file.default);

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/src/css/style.css",
  "/src/js/main.js",
  "/src/js/popup.js",
  "/fonts/MaterialSymbolsOutlined28pt-Light.woff2",
  "/fonts/MaterialSymbolsOutlined28pt-Medium.woff2",
  "/fonts/MaterialSymbolsOutlined28pt-Regular.woff2",
  "/fonts/MPLUSCodeLatin-Light.woff2",
  "/fonts/MPLUSCodeLatin-Thin.woff2",
  "/fonts/Rubik-Bold.woff2",
  "/fonts/Rubik-Light.woff2",
  ...imagesToCache,
  ...iconsToCache,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((error) => {
        console.error("❌ Caching error:", error);
      })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error(
          "⚠️ Error processing the request:",
          event.request.url,
          error
        );
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
