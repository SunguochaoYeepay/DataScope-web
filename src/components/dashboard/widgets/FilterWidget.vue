<template>
  <v-card class="filter-widget">
    <v-card-title class="d-flex align-center">
      <span>{{ config.title }}</span>
      <v-spacer />
      <v-btn
        v-if="isEditing"
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="$emit('edit')"
      />
    </v-card-title>
    <v-card-text>
      <v-select
        v-if="config.filterType === 'select'"
        v-model="selectedValue"
        :items="config.options"
        :label="config.placeholder"
        :multiple="config.multiple"
        :clearable="config.clearable"
        density="comfortable"
        @update:model-value="handleValueChange"
      />
      <v-text-field
        v-else-if="config.filterType === 'text'"
        v-model="selectedValue"
        :label="config.placeholder"
        :clearable="config.clearable"
        density="comfortable"
        @update:model-value="handleValueChange"
      />
      <v-range-slider
        v-else-if="config.filterType === 'range'"
        v-model="selectedValue"
        :min="config.min"
        :max="config.max"
        :step="config.step"
        :label="config.placeholder"
        density="comfortable"
        @update:model-value="handleValueChange"
      />
      <v-date-picker
        v-else-if="config.filterType === 'date'"
        v-model="selectedValue"
        :label="config.placeholder"
        :range="config.range"
        density="comfortable"
        @update:model-value="handleValueChange"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FilterWidgetConfig } from '@/types/dashboard'

const props = defineProps<{
  config: FilterWidgetConfig
  isEditing?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:value', value: any): void
  (e: 'edit'): void
}>()

const selectedValue = ref(props.config.defaultValue)

watch(() => props.config.defaultValue, (newValue) => {
  selectedValue.value = newValue
})

function handleValueChange(value: any) {
  emit('update:value', value)
}
</script>

<style scoped>
.filter-widget {
  height: 100%;
}
</style> 