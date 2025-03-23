<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center py-2 px-4">
      <span class="text-truncate">{{ widget.title }}</span>
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-refresh"
        variant="text"
        size="small"
        :loading="isLoading"
        @click="refresh"
      ></v-btn>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            v-bind="props"
          ></v-btn>
        </template>
        <v-list>
          <v-list-item
            prepend-icon="mdi-pencil"
            title="编辑"
            @click="$emit('edit')"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-delete"
            title="删除"
            @click="$emit('delete')"
            color="error"
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <div class="d-flex flex-column align-center justify-center h-100">
        <div class="text-h3 font-weight-bold mb-2">
          {{ formatValue(widget.config.value) }}
        </div>
        <div
          v-if="widget.config.trend"
          class="d-flex align-center"
          :class="getTrendColor(widget.config.trend.type)"
        >
          <v-icon
            :icon="getTrendIcon(widget.config.trend.type)"
            size="small"
            class="mr-1"
          ></v-icon>
          {{ widget.config.trend.value }}%
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  widget: {
    id: string;
    title: string;
    config: {
      value: number;
      format?: string;
      trend?: {
        type: 'up' | 'down';
        value: number;
      };
    };
  };
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'refresh'): void;
}>();

// 格式化数值
const formatValue = (value: number) => {
  const format = props.widget.config.format || '';
  if (format.includes('%')) {
    return value.toFixed(1) + '%';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toFixed(0);
};

// 获取趋势图标
const getTrendIcon = (type: 'up' | 'down') => {
  return type === 'up' ? 'mdi-arrow-up' : 'mdi-arrow-down';
};

// 获取趋势颜色
const getTrendColor = (type: 'up' | 'down') => {
  return type === 'up' ? 'text-success' : 'text-error';
};

// 刷新
const refresh = () => {
  emit('refresh');
};
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>