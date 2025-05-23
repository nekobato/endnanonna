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
const inputText = ref("");
const isGenerating = ref(false);
const generatedGif = ref<string | null>(null);
const errorMessage = ref("");

// Composables
const { validateText } = useTextValidator();
const { generateGif, isLoading, progress } = useGifGenerator();

// フォント読み込み
const { loadDefaultFonts } = useFont();

// 生成処理
const handleGenerate = async () => {
  errorMessage.value = "";

  const validation = validateText(inputText.value);
  if (!validation.isValid) {
    errorMessage.value = validation.error || "エラーが発生しました";
    return;
  }

  try {
    await generateGif({
      text: inputText.value,
      mini: false
    });
    // TODO: 生成されたGIFのURLを設定
  } catch (error) {
    console.error("GIF生成エラー:", error);
    errorMessage.value = "GIF生成に失敗しました";
  }
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
      <main class="space-y-6">
        <!-- 文字入力 -->
        <div>
          <label
            for="text-input"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            7文字の日本語を入力してください
          </label>
          <TextInput
            v-model="inputText"
            placeholder="のんのんびより"
            :max-length="7"
          />
          <div
            class="flex justify-between items-center mt-2 text-xs text-gray-500"
          >
            <span>{{ inputText.length }}/7文字</span>
            <span v-if="inputText.length > 0" class="text-green-500">
              残り{{ 7 - inputText.length }}文字
            </span>
          </div>
        </div>

        <!-- エラーメッセージ -->
        <div
          v-if="errorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          {{ errorMessage }}
        </div>

        <!-- 生成ボタン -->
        <button
          @click="handleGenerate"
          :disabled="isLoading || inputText.length !== 7"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">GIF生成</span>
          <span v-else class="flex items-center justify-center">
            <div class="spinner mr-2"></div>
            生成中...
          </span>
        </button>

        <!-- プログレス表示 -->
        <div v-if="isLoading" class="space-y-2">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <p class="text-center text-sm text-gray-600">{{ progress }}% 完了</p>
        </div>

        <!-- 生成結果 -->
        <div v-if="generatedGif" class="text-center space-y-4">
          <img
            :src="generatedGif"
            alt="生成されたGIF"
            class="mx-auto rounded-lg shadow-lg max-w-full"
          />
          <div class="flex space-x-2">
            <button class="btn-secondary flex-1">ダウンロード</button>
            <button class="btn-secondary flex-1">もう一度生成</button>
          </div>
        </div>
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
