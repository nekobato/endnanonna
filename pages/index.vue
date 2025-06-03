<script lang="ts" setup>
// SEO設定
useSeoMeta({
  title: "えんどなのんな - のんのんびより風GIF生成",
  description:
    "アニメ「のんのんびより」のエンディングテーマ風のアニメーションGIFを生成するWebアプリケーション",
  ogTitle: "えんどなのんな",
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
  <div
    class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
  >
    <!-- 背景装飾 -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- 浮遊する装飾要素 -->
      <div
        class="absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 animate-float"
      ></div>
      <div
        class="absolute top-32 right-16 w-16 h-16 bg-orange-200 rounded-full opacity-25 animate-float-delayed"
      ></div>
      <div
        class="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-15 animate-float"
      ></div>
      <div
        class="absolute bottom-32 right-10 w-18 h-18 bg-blue-200 rounded-full opacity-20 animate-float-delayed"
      ></div>

      <!-- 雲のような装飾 -->
      <div
        class="absolute top-16 left-1/3 w-32 h-16 bg-white opacity-10 rounded-full animate-drift"
      ></div>
      <div
        class="absolute bottom-24 right-1/4 w-28 h-14 bg-white opacity-15 rounded-full animate-drift-reverse"
      ></div>
    </div>

    <div class="card max-w-md w-full fade-in relative z-10">
      <!-- ヘッダー -->
      <header class="text-center mb-8">
        <div class="relative inline-block">
          <h1
            class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-green-500 bg-clip-text text-transparent mb-2 animate-gradient"
          >
            えんどなのんな
          </h1>
          <!-- キラキラエフェクト -->
          <div
            class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-75 animate-twinkle"
          ></div>
          <div
            class="absolute top-1 -left-3 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-twinkle-delayed"
          ></div>
        </div>
        <p class="text-gray-600 text-sm font-medium">のんのんびより風GIF生成</p>
        <div
          class="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-500"
        >
          <span>✨</span>
          <span>7文字でオリジナルGIFを作成</span>
          <span>✨</span>
        </div>
      </header>

      <!-- メインコンテンツ -->
      <main>
        <GifGenerator @generated="handleGifGenerated" @error="handleError" />
      </main>

      <!-- フッター -->
      <footer class="mt-8 text-center text-xs text-gray-500 space-y-1">
        <p>アニメ「のんのんびより」風のGIFを生成します</p>
        <div
          class="flex items-center justify-center space-x-4 mt-3 pt-3 border-t border-gray-200"
        >
          <span class="flex items-center space-x-1">
            <span class="w-2 h-2 bg-pink-400 rounded-full"></span>
            <span>高品質</span>
          </span>
          <span class="flex items-center space-x-1">
            <span class="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>無料</span>
          </span>
          <span class="flex items-center space-x-1">
            <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>簡単</span>
          </span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// コンポーネント固有のスタイルがあれば追加
</style>
