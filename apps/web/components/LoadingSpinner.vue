<script lang="ts" setup>
type Props = {
  progress?: number;
  message?: string;
};

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  message: "処理中..."
});
</script>

<template>
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p class="message">{{ message }}</p>
    <div v-if="progress > 0" class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-spinner {
  text-align: center;

  .spinner {
    // スピナーアニメーション
  }

  .message {
    margin: 1rem 0;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }
  }
}
</style>
