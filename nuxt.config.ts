// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxtjs/tailwindcss", "@pinia/nuxt"],
  css: ["~/assets/css/main.scss"],
  devServer: {
    port: 2525
  },
  app: {
    head: {
      meta: [{ name: "robots", content: "noindex, nofollow" }]
    }
  }
});
