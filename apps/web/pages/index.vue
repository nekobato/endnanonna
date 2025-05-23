<script lang="ts" setup>
// SEO設定
useSeoMeta({
  title: "End-nanonna - のんのんびより風GIF生成",
  description:
    "アニメ「のんのんびより」のエンディングテーマ風のアニメーションGIFを生成するWebアプリケーション",
  ogTitle: "End-nanonna",
  ogDescription: "のんのんびより風GIF生成アプリ",
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image"
});

// 状態管理
const generatedGif = ref<string | null>(null);
const errorMessage = ref("");

// フォント読み込み
const { loadDefaultFonts } = useFont();

// イベントハンドラー
const handleGifGenerated = (gifUrl: string) => {
  generatedGif.value = gifUrl;
  errorMessage.value = "";
};

const handleError = (error: string) => {
  errorMessage.value = error;
  generatedGif.value = null;
};

// 初期化
onMounted(async () => {
  try {
    await loadDefaultFonts();
  } catch (error) {
    console.error("フォント読み込みエラー:", error);
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card max-w-md w-full fade-in">
      <!-- ヘッダー -->
      <header class="text-center mb-8">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-2"
        >
          End-nanonna
        </h1>
        <p class="text-gray-600 text-sm">のんのんびより風GIF生成</p>
      </header>

      <!-- メインコンテンツ -->
      <main>
        <GifGenerator @generated="handleGifGenerated" @error="handleError" />
      </main>

      <!-- フッター -->
      <footer class="mt-8 text-center text-xs text-gray-500">
        <p>© 2025 End-nanonna</p>
        <p class="mt-1">アニメ「のんのんびより」風のGIFを生成します</p>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// コンポーネント固有のスタイルがあれば追加
</style>
