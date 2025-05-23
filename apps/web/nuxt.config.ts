// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt"
  ],
  typescript: {
    strict: true,
    typeCheck: true
  },
  css: ["~/assets/css/main.scss"]
});
