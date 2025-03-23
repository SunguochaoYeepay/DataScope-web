<template>
  <div class="text-config">
    <v-form @submit.prevent>
      <v-text-field
        v-model="config.title"
        label="标题"
        variant="outlined"
        density="comfortable"
        class="mb-4"
      ></v-text-field>

      <v-select
        v-model="config.align"
        :items="[
          { title: '左对齐', value: 'left' },
          { title: '居中', value: 'center' },
          { title: '右对齐', value: 'right' }
        ]"
        label="对齐方式"
        variant="outlined"
        density="comfortable"
        class="mb-4"
      ></v-select>

      <v-textarea
        v-model="config.content"
        label="文本内容"
        variant="outlined"
        rows="10"
        class="mb-4"
      ></v-textarea>

      <div class="d-flex justify-end">
        <v-btn
          color="primary"
          :loading="isLoading"
          @click="handleSave"
        >
          保存
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps<{
  modelValue: any;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'save'): void;
}>();

// 配置对象
const config = reactive({
  ...props.modelValue,
});

// 处理保存
const handleSave = () => {
  emit('update:modelValue', { ...config });
  emit('save');
};
</script>

<style scoped>
.text-config {
  max-width: 800px;
  margin: 0 auto;
}
</style>