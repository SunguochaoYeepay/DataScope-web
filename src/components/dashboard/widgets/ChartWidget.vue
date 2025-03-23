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
      <div ref="chartContainer" style="width: 100%; height: 100%"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  widget: {
    id: string;
    title: string;
    config: {
      chartType: string;
      options: EChartsOption;
    };
  };
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'refresh'): void;
}>();

const chartContainer = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value);
    chart.setOption(props.widget.config.options);
  }
};

// 刷新图表
const refresh = () => {
  emit('refresh');
};

// 监听配置变化
watch(
  () => props.widget.config,
  () => {
    if (chart) {
      chart.setOption(props.widget.config.options);
    }
  },
  { deep: true }
);

// 生命周期钩子
onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

// 处理窗口大小变化
const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>