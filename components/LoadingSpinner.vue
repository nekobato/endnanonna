<script lang="ts" setup>
type Props = {
  progress?: number;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success";
};

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  message: "処理中...",
  size: "md",
  variant: "primary"
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-6 h-6";
    case "lg":
      return "w-12 h-12";
    default:
      return "w-8 h-8";
  }
});

const colorClasses = computed(() => {
  switch (props.variant) {
    case "secondary":
      return "border-blue-500";
    case "success":
      return "border-green-500";
    default:
      return "border-pink-500";
  }
});
</script>

<template>
  <div class="loading-spinner flex flex-col items-center justify-center">
    <!-- アニメーション付きスピナー -->
    <div class="relative">
      <div
        :class="[
          'border-4 border-gray-200 rounded-full animate-spin',
          sizeClasses,
          colorClasses
        ]"
        style="border-top-color: currentColor"
      ></div>

      <!-- 内側の装飾 -->
      <div
        :class="[
          'absolute inset-2 border-2 border-gray-100 rounded-full animate-pulse',
          props.size === 'sm'
            ? 'inset-1'
            : props.size === 'lg'
            ? 'inset-3'
            : 'inset-2'
        ]"
      ></div>
    </div>

    <!-- メッセージ -->
    <p
      v-if="message"
      class="mt-3 text-sm text-gray-600 font-medium animate-pulse"
    >
      {{ message }}
    </p>

    <!-- プログレスバー（オプション） -->
    <div v-if="progress > 0" class="mt-2 w-full max-w-xs">
      <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          class="h-1.5 rounded-full transition-all duration-300 ease-out"
          :class="colorClasses.replace('border-', 'bg-')"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="text-xs text-gray-500 text-center mt-1">
        {{ Math.round(progress) }}%
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-spinner {
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
