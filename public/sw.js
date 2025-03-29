const CACHE_NAME = "my-cache-v1";

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
  "/images/logo.svg",
  "/images/profile.avif",
  "/images/co-pa.avif",
  "/images/coming_soon_2.avif",
  "/images/copa.avif",
  "/images/jinn-1.avif",
  "/images/jinn-2.avif",
  "/images/jinn-3.avif",
  "/images/jinn-4.avif",
  "/images/jinn-5.avif",
  "/images/jinn-6.avif",
  "/images/jinn-7.avif",
  "/images/jinn-8.avif",
  "/images/jinn-9.avif",
  "/images/jinn-10.avif",
  "/images/jinn-full.avif",
  "/images/portfolio.avif",
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
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("🚀 Кешируем файлы:", FILES_TO_CACHE); // Логируем список файлов
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((error) => {
        console.error("❌ Ошибка кеширования:", error);
      })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("🔍 Запрос:", event.request.url);
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          console.log("✅ Отдаем из кеша:", event.request.url);
        } else {
          console.log("🌐 Загружаем с сервера:", event.request.url);
        }
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error("⚠️ Ошибка обработки запроса:", event.request.url, error);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log("📦 Доступные кеши:", cacheNames);
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("🗑 Удаляем кеш:", name);
            return caches.delete(name);
          })
      );
    })
  );
});
