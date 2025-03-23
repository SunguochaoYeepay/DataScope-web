<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="config.title"
          label="标题"
          density="comfortable"
          @update:model-value="handleConfigChange"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="config.placeholder"
          label="占位文本"
          density="comfortable"
          @update:model-value="handleConfigChange"
        />
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="config.filterType"
          :items="filterTypes"
          label="过滤器类型"
          density="comfortable"
          @update:model-value="handleConfigChange"
        />
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="config.clearable"
          label="允许清空"
          density="comfortable"
          @update:model-value="handleConfigChange"
        />
      </v-col>
      <template v-if="config.filterType === 'select'">
        <v-col cols="12">
          <v-switch
            v-model="config.multiple"
            label="允许多选"
            density="comfortable"
            @update:model-value="handleConfigChange"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="optionsText"
            label="选项列表（每行一个）"
            auto-grow
            density="comfortable"
            @update:model-value="handleOptionsChange"
          />
        </v-col>
      </template>
      <template v-if="config.filterType === 'range'">
        <v-col cols="6">
          <v-text-field
            v-model.number="config.min"
            label="最小值"
            type="number"
            density="comfortable"
            @update:model-value="handleConfigChange"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="config.max"
            label="最大值"
            type="number"
            density="comfortable"
            @update:model-value="handleConfigChange"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model.number="config.step"
            label="步长"
            type="number"
            density="comfortable"
            @update:model-value="handleConfigChange"
          />
        </v-col>
      </template>
      <template v-if="config.filterType === 'date'">
        <v-col cols="12">
          <v-switch
            v-model="config.range"
            label="日期范围"
            density="comfortable"
            @update:model-value="handleConfigChange"
          />
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FilterWidgetConfig } from '@/types/dashboard'

const props = defineProps<{
  modelValue: FilterWidgetConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterWidgetConfig): void
}>()

const config = ref<FilterWidgetConfig>({ ...props.modelValue })
const optionsText = ref(props.modelValue.options?.join('\n') || '')

const filterTypes = [
  { title: '下拉选择', value: 'select' as const },
  { title: '文本输入', value: 'text' as const },
  { title: '数值范围', value: 'range' as const },
  { title: '日期选择', value: 'date' as const },
]

watch(() => props.modelValue, (newValue) => {
  config.value = { ...newValue }
  if (newValue.filterType === 'select') {
    optionsText.value = newValue.options?.join('\n') || ''
  }
}, { deep: true })

function handleConfigChange() {
  emit('update:modelValue', { ...config.value })
}

function handleOptionsChange() {
  config.value.options = optionsText.value
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line)
  handleConfigChange()
}
</script> 