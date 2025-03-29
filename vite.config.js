import { VitePWA } from "vite-plugin-pwa";

export default {
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My App",
        short_name: "App",
        start_url: "/",
        display: "standalone",
        description: "My App description",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,svg,avif,png,jpg}"],
      },
    }),
  ],
};
