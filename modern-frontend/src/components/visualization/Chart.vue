<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineExpose } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  // 图表类型：bar, line, pie, scatter
  type: {
    type: String,
    required: true
  },
  // 图表标题
  title: {
    type: String,
    default: ''
  },
  // 图表数据
  data: {
    type: Array,
    required: true
  },
  // 维度字段
  dimension: {
    type: String,
    required: true
  },
  // 指标字段
  metrics: {
    type: Array,
    required: true
  },
  // 图表高度
  height: {
    type: String,
    default: '400px'
  },
  // 图表宽度
  width: {
    type: String,
    default: '100%'
  }
})

const chartContainer = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return
  
  // 销毁已有实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartContainer.value)
  
  // 更新图表
  updateChart()
}

// 更新图表配置和数据
const updateChart = () => {
  if (!chartInstance) return
  
  const option = generateChartOption()
  chartInstance.setOption(option)
}

// 根据图表类型生成对应的配置
const generateChartOption = () => {
  const { type, title, data, dimension, metrics } = props
  
  // 提取维度数据
  const dimensionData = data.map(item => item[dimension])
  
  // 基础配置
  const baseOption: any = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: metrics,
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    }
  }
  
  // 根据图表类型生成特定配置
  switch (type) {
    case 'bar':
      return generateBarOption(baseOption, dimensionData)
    case 'line':
      return generateLineOption(baseOption, dimensionData)
    case 'pie':
      return generatePieOption(title)
    case 'scatter':
      return generateScatterOption(baseOption, dimensionData)
    default:
      return baseOption
  }
}

// 生成柱状图配置
const generateBarOption = (baseOption: any, dimensionData: any[]) => {
  baseOption.xAxis = {
    type: 'category',
    data: dimensionData,
    axisLabel: {
      rotate: 45
    }
  }
  
  baseOption.yAxis = {
    type: 'value'
  }
  
  baseOption.series = props.metrics.map(metric => ({
    name: metric,
    type: 'bar',
    data: props.data.map(item => item[metric])
  }))
  
  return baseOption
}

// 生成折线图配置
const generateLineOption = (baseOption: any, dimensionData: any[]) => {
  baseOption.xAxis = {
    type: 'category',
    data: dimensionData
  }
  
  baseOption.yAxis = {
    type: 'value'
  }
  
  baseOption.series = props.metrics.map(metric => ({
    name: metric,
    type: 'line',
    data: props.data.map(item => item[metric])
  }))
  
  return baseOption
}

// 生成饼图配置
const generatePieOption = (title: string) => {
  // 饼图只支持单个指标
  const metric = props.metrics[0]
  
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: props.data.map(item => item[props.dimension])
    },
    series: [
      {
        name: metric,
        type: 'pie',
        radius: '50%',
        center: ['50%', '50%'],
        data: props.data.map(item => ({
          name: item[props.dimension],
          value: item[metric]
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

// 生成散点图配置
const generateScatterOption = (baseOption: any, dimensionData: any[]) => {
  // 散点图需要至少两个指标
  const metrics = props.metrics.slice(0, 2)
  
  baseOption.xAxis = {
    type: 'value',
    name: metrics[0]
  }
  
  baseOption.yAxis = {
    type: 'value',
    name: metrics[1]
  }
  
  baseOption.series = [{
    type: 'scatter',
    name: `${metrics[0]} / ${metrics[1]}`,
    data: props.data.map(item => [item[metrics[0]], item[metrics[1]]]),
    symbolSize: 10
  }]
  
  return baseOption
}

// 窗口大小变化时重绘图表
const resizeChart = () => {
  chartInstance?.resize()
}

// 暴露方法给父组件
defineExpose({
  updateChart,
  resizeChart
})

// 监听数据变化
watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true }
)

// 监听图表类型变化
watch(
  () => props.type,
  () => {
    updateChart()
  }
)

// 组件挂载时初始化图表
onMounted(() => {
  initChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', resizeChart)
})

// 组件卸载时销毁图表实例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  // 移除事件监听
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
.chart-container {
  width: v-bind(width);
  height: v-bind(height);
}
</style>