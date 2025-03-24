<template>
  <div class="visualization-type-selector">
    <h4 class="selector-title">选择图表类型</h4>
    
    <div class="chart-types-grid">
      <div 
        v-for="type in chartTypes" 
        :key="type.value"
        class="chart-type-item"
        :class="{ 'is-active': modelValue === type.value }"
        @click="handleSelect(type.value)"
      >
        <div class="chart-type-icon">
          <el-icon v-if="type.icon"><component :is="type.icon" /></el-icon>
          <img v-else-if="type.imgSrc" :src="type.imgSrc" alt="" />
        </div>
        <div class="chart-type-name">{{ type.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BarChart, LineChart, PieChart, Histogram, TrendCharts, Grid, Operation } from '@element-plus/icons-vue'

// 属性定义
const props = defineProps({
  modelValue: {
    type: String,
    default: 'bar'
  }
})

// 事件
const emit = defineEmits(['update:modelValue', 'change'])

// 图表类型数据
const chartTypes = [
  { value: 'bar', label: '柱状图', icon: 'BarChart' },
  { value: 'line', label: '折线图', icon: 'LineChart' },
  { value: 'pie', label: '饼图', icon: 'PieChart' },
  { value: 'scatter', label: '散点图', icon: 'Operation' },
  { value: 'radar', label: '雷达图', imgSrc: '/icons/radar-chart.svg' },
  { value: 'funnel', label: '漏斗图', imgSrc: '/icons/funnel-chart.svg' },
  { value: 'heatmap', label: '热力图', imgSrc: '/icons/heatmap-chart.svg' },
  { value: 'treemap', label: '矩形树图', imgSrc: '/icons/treemap-chart.svg' },
  { value: 'table', label: '表格', icon: 'Grid' },
  { value: 'pivot', label: '透视表', icon: 'TrendCharts' }
]

// 选择图表类型
const handleSelect = (type: string) => {
  emit('update:modelValue', type)
  emit('change', type)
}
</script>

<style lang="scss" scoped>
.visualization-type-selector {
  margin-bottom: 16px;
}

.selector-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.chart-types-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.chart-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #409eff;
    color: #409eff;
  }
  
  &.is-active {
    border-color: #409eff;
    background-color: #ecf5ff;
    color: #409eff;
  }
  
  .chart-type-icon {
    font-size: 24px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      width: 24px;
      height: 24px;
    }
  }
  
  .chart-type-name {
    margin-top: 4px;
    font-size: 12px;
    text-align: center;
  }
}
</style>