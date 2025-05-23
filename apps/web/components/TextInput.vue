<script lang="ts" setup>
interface Props {
  modelValue: string;
  placeholder?: string;
  maxLength?: number;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "のんのんびより",
  maxLength: 7
});

const emit = defineEmits<Emits>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>

<template>
  <div class="text-input">
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      @input="handleInput"
      type="text"
      class="input-field"
    />
  </div>
</template>

<style lang="scss" scoped>
.text-input {
  .input-field {
    // スタイル定義
  }
}
</style>
