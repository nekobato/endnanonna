<script lang="ts" setup>
interface Props {
  modelValue: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "focus"): void;
  (e: "blur"): void;
  (e: "enter"): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "のんのんびより",
  maxLength: 7,
  disabled: false,
  error: false
});

const emit = defineEmits<Emits>();

const inputRef = ref<HTMLInputElement>();
const isFocused = ref(false);
const isComposing = ref(false);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleFocus = () => {
  isFocused.value = true;
  emit("focus");
};

const handleBlur = () => {
  isFocused.value = false;
  emit("blur");
};

const handleCompositionStart = () => {
  isComposing.value = true;
};

const handleCompositionEnd = () => {
  isComposing.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    // IMEで変換中でなく、かつ7文字の場合のみsubmit
    if (!isComposing.value && props.modelValue.length === props.maxLength) {
      emit("enter");
    }
  }
};

// 文字数に応じた動的スタイル
const characterCount = computed(() => props.modelValue.length);
const isComplete = computed(() => characterCount.value === props.maxLength);
const isOverLimit = computed(() => characterCount.value > props.maxLength);

const inputClasses = computed(() => [
  "input-field",
  "w-full px-4 py-3 text-center text-xl font-bold rounded-xl border-2 transition-all duration-300",
  "focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    // 通常状態
    "border-gray-300 focus:border-pink-500 focus:ring-pink-200":
      !props.error && !isComplete.value && !isOverLimit.value,
    // 完了状態
    "border-green-400 bg-green-50 focus:border-green-500 focus:ring-green-200":
      isComplete.value && !props.error,
    // エラー状態
    "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200":
      props.error || isOverLimit.value,
    // 無効状態
    "bg-gray-100 border-gray-200 cursor-not-allowed": props.disabled,
    // フォーカス時の拡大効果
    "transform scale-105": isFocused.value && !props.disabled
  }
]);

// 外部からフォーカスを設定する関数を公開
const focus = () => {
  inputRef.value?.focus();
};

defineExpose({ focus });
</script>

<template>
  <div class="text-input relative">
    <div class="relative">
      <input
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        type="text"
        autocomplete="off"
        spellcheck="false"
      />

      <!-- 文字数インジケーター -->
      <div class="absolute -bottom-6 right-0 flex items-center space-x-2">
        <div class="flex space-x-1">
          <div
            v-for="i in maxLength"
            :key="i"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-200',
              i <= characterCount
                ? isComplete
                  ? 'bg-green-500 scale-110'
                  : isOverLimit
                  ? 'bg-red-500'
                  : 'bg-pink-500'
                : 'bg-gray-300'
            ]"
          ></div>
        </div>
        <span
          :class="[
            'text-xs font-medium',
            isComplete
              ? 'text-green-600'
              : isOverLimit
              ? 'text-red-600'
              : 'text-gray-500'
          ]"
        >
          {{ characterCount }}/{{ maxLength }}
        </span>
      </div>
    </div>

    <!-- 入力ヒント -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isFocused && characterCount === 0"
        class="absolute top-full left-0 right-0 mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700"
      >
        💡 ひらがな・カタカナ・漢字で7文字入力してください
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.text-input {
  .input-field {
    font-family: "Rounded M+ 1c", sans-serif;
    letter-spacing: 0.1em;

    &::placeholder {
      color: #9ca3af;
      font-weight: normal;
    }

    &:disabled {
      &::placeholder {
        color: #d1d5db;
      }
    }
  }
}
</style>
