<script lang="ts" setup>
interface Props {
  initialText?: string;
}

interface Emits {
  (e: "generated", gifUrl: string): void;
  (e: "error", error: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  initialText: ""
});

const emit = defineEmits<Emits>();

// 状態管理
const inputText = ref(props.initialText);
const errorMessage = ref("");
const showSuccessAnimation = ref(false);
const generationStartTime = ref<number>(0);

// Composables
const { validateText } = useTextValidator();
const {
  generateGif,
  isLoading,
  progress,
  currentStep,
  estimatedTime,
  elapsedTime,
  currentGif,
  error: gifError,
  clearGif
} = useGifGenerator();

// 生成処理
const handleGenerate = async () => {
  errorMessage.value = "";
  clearGif(); // 前回のGIFをクリア

  const validation = validateText(inputText.value);
  if (!validation.isValid) {
    errorMessage.value = validation.error || "エラーが発生しました";
    emit("error", errorMessage.value);
    return;
  }

  try {
    await generateGif({
      text: inputText.value,
      mini: false
    });

    // 生成完了後、currentGifが更新される
  } catch (error) {
    console.error("GIF生成エラー:", error);
    errorMessage.value = "GIF生成に失敗しました";
    emit("error", errorMessage.value);
  }
};

// ミニサイズ生成
const handleGenerateMini = async () => {
  errorMessage.value = "";
  clearGif();

  const validation = validateText(inputText.value);
  if (!validation.isValid) {
    errorMessage.value = validation.error || "エラーが発生しました";
    emit("error", errorMessage.value);
    return;
  }

  try {
    await generateGif({
      text: inputText.value,
      mini: true
    });
  } catch (error) {
    console.error("ミニGIF生成エラー:", error);
    errorMessage.value = "ミニGIF生成に失敗しました";
    emit("error", errorMessage.value);
  }
};

// GIF生成完了の監視
watch(currentGif, (newGif) => {
  if (newGif) {
    emit("generated", newGif);
  }
});

// エラーの監視
watch(gifError, (newError) => {
  if (newError) {
    errorMessage.value = newError;
    emit("error", newError);
  }
});

// 文字数カウント
const characterCount = computed(() => inputText.value.length);
const remainingCount = computed(() => Math.max(0, 7 - characterCount.value));
const isValidLength = computed(() => characterCount.value === 7);

// 時間表示
const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0
    ? `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    : `${remainingSeconds}秒`;
};

const remainingTime = computed(() => {
  if (!isLoading.value || estimatedTime.value === 0) return "";
  const remaining = Math.max(0, estimatedTime.value - elapsedTime.value);
  return formatTime(remaining);
});

const elapsedTimeFormatted = computed(() => formatTime(elapsedTime.value));
</script>

<template>
  <div class="gif-generator space-y-6">
    <!-- 文字入力セクション -->
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
        :disabled="isLoading"
        :error="!!errorMessage"
        @enter="handleGenerate"
      />

      <!-- 文字数表示 -->
      <div class="flex justify-between items-center mt-2 text-xs">
        <span class="text-gray-500"> {{ characterCount }}/7文字 </span>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 rounded-xl p-4"
      >
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-semibold text-red-800 mb-1">
              エラーが発生しました
            </h4>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
            <button
              @click="errorMessage = ''"
              class="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 生成ボタン -->
    <div class="space-y-3">
      <button
        @click="handleGenerate"
        :disabled="isLoading || !isValidLength"
        class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isLoading">通常サイズGIF生成</span>
        <span v-else class="flex items-center justify-center">
          <LoadingSpinner class="mr-2" />
          生成中...
        </span>
      </button>

      <button
        @click="handleGenerateMini"
        :disabled="isLoading || !isValidLength"
        class="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isLoading">ミニサイズGIF生成</span>
        <span v-else class="flex items-center justify-center">
          <LoadingSpinner class="mr-2" />
          生成中...
        </span>
      </button>
    </div>

    <!-- 詳細プログレス表示 -->
    <div v-if="isLoading" class="space-y-4 bg-gray-50 rounded-xl p-4">
      <!-- ステップ表示 -->
      <div class="text-center">
        <h4 class="text-lg font-semibold text-gray-800 mb-2">GIF生成中...</h4>
        <p class="text-sm text-gray-600 mb-3">{{ currentStep }}</p>
      </div>

      <!-- プログレスバー -->
      <div class="space-y-2">
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            class="bg-gradient-to-r from-pink-500 via-orange-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>{{ Math.round(progress) }}% 完了</span>
          <span v-if="remainingTime">残り約 {{ remainingTime }}</span>
        </div>
      </div>

      <!-- 時間情報 -->
      <div
        class="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200"
      >
        <span>経過時間: {{ elapsedTimeFormatted }}</span>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>処理中</span>
        </div>
      </div>

      <!-- アニメーション付きローディングアイコン -->
      <div class="flex justify-center">
        <LoadingSpinner class="w-8 h-8" />
      </div>
    </div>

    <!-- 生成されたGIFの表示 -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
    >
      <div v-if="currentGif && !isLoading" class="space-y-4">
        <div
          class="text-center bg-green-50 rounded-xl p-4 border border-green-200"
        >
          <div class="flex items-center justify-center mb-3">
            <div
              class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-800">生成完了！</h3>
          </div>

          <div class="relative inline-block">
            <img
              :src="currentGif"
              alt="生成されたGIF"
              class="mx-auto rounded-lg shadow-lg max-w-full border-2 border-white"
            />
            <div
              class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <a
            :href="currentGif"
            download="endnanonna.gif"
            class="btn-primary text-center flex items-center justify-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <span>ダウンロード</span>
          </a>
          <button
            @click="clearGif"
            class="btn-secondary flex items-center justify-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            <span>クリア</span>
          </button>
        </div>

        <!-- 共有ボタン（将来の拡張用） -->
        <div class="text-center pt-2">
          <p class="text-xs text-gray-500">
            生成時間: {{ elapsedTimeFormatted }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.gif-generator {
  // コンポーネント固有のスタイル
}
</style>
