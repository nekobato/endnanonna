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
const { generateGif, isLoading, progress } = useGifGenerator();

// 生成処理
const handleGenerate = async () => {
  errorMessage.value = "";

  const validation = validateText(inputText.value);
  if (!validation.isValid) {
    errorMessage.value = validation.error || "エラーが発生しました";
    emit("error", errorMessage.value);
    return;
  }

  try {
    const result = await generateGif({
      text: inputText.value,
      mini: false
    });

    if (result) {
      emit("generated", result);
    }
  } catch (error) {
    console.error("GIF生成エラー:", error);
    errorMessage.value = "GIF生成に失敗しました";
    emit("error", errorMessage.value);
  }
};

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
    <button
      @click="handleGenerate"
      :disabled="isLoading || !isValidLength"
      class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="!isLoading">GIF生成</span>
      <span v-else class="flex items-center justify-center">
        <LoadingSpinner class="mr-2" />
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
  </div>
</template>

<style lang="scss" scoped>
.gif-generator {
  // コンポーネント固有のスタイル
}
</style>
