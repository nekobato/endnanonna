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

// Composables
const { validateText } = useTextValidator();
const {
  generateGif,
  isLoading,
  progress,
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
      />

      <!-- 文字数表示 -->
      <div class="flex justify-between items-center mt-2 text-xs">
        <span class="text-gray-500"> {{ characterCount }}/7文字 </span>
        <span
          v-if="characterCount > 0"
          :class="isValidLength ? 'text-green-500' : 'text-orange-500'"
        >
          残り{{ remainingCount }}文字
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

    <!-- 生成されたGIFの表示 -->
    <div v-if="currentGif && !isLoading" class="space-y-4">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">生成完了！</h3>
        <img
          :src="currentGif"
          alt="生成されたGIF"
          class="mx-auto rounded-lg shadow-lg max-w-full"
        />
      </div>

      <div class="flex space-x-2">
        <a
          :href="currentGif"
          download="endnanonna.gif"
          class="btn-primary flex-1 text-center"
        >
          ダウンロード
        </a>
        <button @click="clearGif" class="btn-secondary flex-1">クリア</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gif-generator {
  // コンポーネント固有のスタイル
}
</style>
