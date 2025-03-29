const CACHE_NAME = "my-cache-v1";

// Файлы, которые будем кешировать
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
  "/public/images/logo.svg",
  "/public/images/profile.avif",
  "/public/images/co-pa.avif",
  "/public/images/coming_soon_2.avif",
  "/public/images/copa.avif",
  "/public/images/jinn-1.avif",
  "/public/images/jinn-2.avif",
  "/public/images/jinn-3.avif",
  "/public/images/jinn-4.avif",
  "/public/images/jinn-5.avif",
  "/public/images/jinn-6.avif",
  "/public/images/jinn-7.avif",
  "/public/images/jinn-8.avif",
  "/public/images/jinn-9.avif",
  "/public/images/jinn-10.avif",
  "/public/images/jinn-full.avif",
  "/public/images/portfolio.avif",
  "/icons/favicon.ico",
  "/icons/Canva.svg",
  "/icons/chatgpt.svg",
  "/icons/confluence.svg",
  "/icons/css.svg",
  "/icons/discord.svg",
  "/icons/elementor.svg",
  "/icons/figma.webp",
  "/icons/git.svg",
  "/icons/google.svg",
  "/icons/hamburger.svg",
  "/icons/html5.svg",
  "/icons/jira.svg",
  "/icons/kanban.svg",
  "/icons/klaviyo.svg",
  "/icons/Microsoft_365.webp",
  "/icons/microsoft.svg",
  "/icons/miro.svg",
  "/icons/mongodb.svg",
  "/icons/mySQL.webp",
  "/icons/notion.svg",
  "/icons/photoshop.svg",
  "/icons/PostCSS.svg",
  "/icons/postgresql.svg",
  "/icons/React.svg",
  "/icons/redux.svg",
  "/icons/scrum.svg",
  "/icons/slack.svg",
  "/icons/slider-revolution.avif",
  "/icons/tailwind_css.svg",
  "/icons/tui.webp",
  "/icons/vite.svg",
  "/icons/vitest.webp",
  "/icons/wordpress.svg",
  "/icons/zoom.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cash files...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
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
