<script lang="ts" setup>
// グローバル設定
useHead({
  htmlAttrs: {
    lang: "ja"
  },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" }
  ]
});
</script>

<template>
  <div id="app">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
/* グローバルスタイルはmain.scssで管理 */
</style>
