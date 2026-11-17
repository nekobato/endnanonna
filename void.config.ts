import { defineConfig } from "void/config";

export default defineConfig({
  output: "static",
  head: {
    title: "えんどなのんな - のんのんびより風GIF生成",
    htmlAttrs: { lang: "ja" },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "アニメ「のんのんびより」のエンディングテーマ風のアニメーションGIFを生成するWebアプリケーション"
      },
      { property: "og:title", content: "えんどなのんな" },
      { property: "og:description", content: "のんのんびより風GIF生成アプリ" },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  },
  worker: {
    compatibility_date: "2026-11-17",
    compatibility_flags: ["nodejs_compat"]
  },
  cloudflare: {
    account_id: "42db971ff95e560fd0e710d0e28ae655",
    name: "endnanonna",
    workers_dev: true,
    preview_urls: true
  }
});
