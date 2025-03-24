<template>
  <div class="chart-preview-container">
    <div class="preview-header">
      <h3 class="preview-title">图表预览</h3>
      <div class="preview-actions">
        <el-tooltip content="刷新图表" placement="top">
          <el-button type="primary" link @click="refreshChart">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="下载图表" placement="top">
          <el-button type="success" link @click="downloadChart">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="全屏预览" placement="top">
          <el-button type="info" link @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div class="preview-content" ref="previewRef">
      <!-- 图表容器 -->
      <div class="chart-container" ref="chartContainerRef">
        <!-- 图表加载中 -->
        <div v-if="loading" class="chart-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>图表渲染中...</span>
        </div>
        
        <!-- 图表错误 -->
        <div v-else-if="error" class="chart-error">
          <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
          <h4>渲染错误</h4>
          <p>{{ error }}</p>
        </div>
        
        <!-- 无数据情况 -->
        <div v-else-if="noDataAvailable" class="chart-empty">
          <el-empty description="暂无数据">
            <template #description>
              <p>请选择数据源并完成数据映射</p>
            </template>
          </el-empty>
        </div>
        
        <!-- 图表渲染 -->
        <div v-else class="chart-view" ref="chartRef"></div>
      </div>
    </div>
    
    <!-- 全屏模式对话框 -->
    <el-dialog
      v-model="fullscreenVisible"
      title="图表全屏预览"
      width="90%"
      fullscreen
      :before-close="closeFullscreen"
      custom-class="chart-fullscreen-dialog"
    >
      <div class="fullscreen-chart-container" ref="fullscreenChartRef"></div>
      <template #footer>
        <div class="fullscreen-footer">
          <el-button type="primary" @click="downloadChartFullscreen">
            <el-icon><Download /></el-icon>
            下载图表
          </el-button>
          <el-button @click="closeFullscreen">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, Download, FullScreen, Loading, 
  CircleCloseFilled, Close 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import {
  BarChart, LineChart, PieChart, ScatterChart,
  RadarChart, FunnelChart, HeatmapChart, TreemapChart
} from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DatasetComponent, TransformComponent,
  ToolboxComponent, MarkLineComponent, MarkPointComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的echarts组件
echarts.use([
  BarChart, LineChart, PieChart, ScatterChart,
  RadarChart, FunnelChart, HeatmapChart, TreemapChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DatasetComponent, TransformComponent,
  ToolboxComponent, MarkLineComponent, MarkPointComponent,
  LabelLayout, UniversalTransition, CanvasRenderer
])

// 定义组件属性
const props = defineProps({
  chartType: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  mappings: {
    type: Object,
    default: () => ({})
  },
  styleSettings: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
const emit = defineEmits(['refresh', 'download', 'error'])

// 引用
const previewRef = ref<HTMLElement | null>(null)
const chartContainerRef = ref<HTMLElement | null>(null)
const chartRef = ref<HTMLElement | null>(null)
const fullscreenChartRef = ref<HTMLElement | null>(null)

// 状态
const error = ref<string>('')
const chartInstance = ref<echarts.ECharts | null>(null)
const fullscreenChartInstance = ref<echarts.ECharts | null>(null)
const fullscreenVisible = ref<boolean>(false)
const chartOptions = ref<any>(null)

// 判断是否有可用数据
const noDataAvailable = computed(() => {
  return !props.data || props.data.length === 0 || !props.mappings || Object.keys(props.mappings).length === 0
})

// 获取图表配置
const generateChartOptions = () => {
  try {
    if (noDataAvailable.value) {
      return null
    }
    
    // 根据图表类型和数据映射生成配置
    const options: any = {
      title: {
        show: !!props.styleSettings.title,
        text: props.styleSettings.title || '',
        subtext: props.styleSettings.subtitle || '',
        left: 'center'
      },
      backgroundColor: props.styleSettings.backgroundColor,
      animation: props.styleSettings.animation?.enabled !== false,
      animationDuration: props.styleSettings.animation?.duration || 1000,
      animationEasing: props.styleSettings.animation?.easing || 'cubicOut',
      animationDelay: props.styleSettings.animation?.delay || 0,
      grid: {
        top: props.styleSettings.padding?.top || 20,
        right: props.styleSettings.padding?.right || 20,
        bottom: props.styleSettings.padding?.bottom || 30,
        left: props.styleSettings.padding?.left || 50,
        containLabel: true
      },
      legend: {
        show: props.styleSettings.showLegend !== false,
        orient: ['left', 'right'].includes(props.styleSettings.legendPosition || '') ? 'vertical' : 'horizontal',
        left: getPositionValue(props.styleSettings.legendPosition, 'left', 'center'),
        top: getPositionValue(props.styleSettings.legendPosition, 'top', 10),
        bottom: getPositionValue(props.styleSettings.legendPosition, 'bottom', 'auto'),
        right: getPositionValue(props.styleSettings.legendPosition, 'right', 'auto')
      },
      tooltip: {
        trigger: ['pie', 'funnel'].includes(props.chartType) ? 'item' : 'axis',
        formatter: getTooltipFormatter()
      },
      color: props.styleSettings.colors || undefined
    }
    
    // 根据图表类型添加特定配置
    switch (props.chartType) {
      case 'bar':
        Object.assign(options, getBarChartOptions())
        break
      case 'line':
        Object.assign(options, getLineChartOptions())
        break
      case 'pie':
        Object.assign(options, getPieChartOptions())
        break
      case 'scatter':
        Object.assign(options, getScatterChartOptions())
        break
      case 'radar':
        Object.assign(options, getRadarChartOptions())
        break
      case 'funnel':
        Object.assign(options, getFunnelChartOptions())
        break
      case 'heatmap':
        Object.assign(options, getHeatmapChartOptions())
        break
      case 'treemap':
        Object.assign(options, getTreemapChartOptions())
        break
      case 'table':
      case 'pivot':
        // 表格类型不使用echarts渲染
        console.warn('表格类型不能使用echarts渲染')
        return null
      default:
        throw new Error(`不支持的图表类型: ${props.chartType}`)
    }
    
    return options
  } catch (err: any) {
    error.value = err.message || '生成图表配置失败'
    emit('error', error.value)
    return null
  }
}

// 辅助函数：获取位置值
const getPositionValue = (position: string | undefined, side: string, defaultValue: any) => {
  if (!position) return defaultValue
  return position === side ? 10 : (side === 'left' || side === 'right' ? 'auto' : defaultValue)
}

// 辅助函数：获取提示框格式化器
const getTooltipFormatter = () => {
  // 根据图表类型返回不同格式的提示框
  return null // 使用默认格式化
}

// 根据图表类型获取特定选项
// 柱状图配置
const getBarChartOptions = () => {
  const xField = props.mappings.x?.[0]
  const yFields = props.mappings.y || []
  const colorField = props.mappings.color?.[0]
  
  if (!xField || yFields.length === 0) {
    throw new Error('柱状图至少需要一个X轴字段和一个Y轴字段')
  }
  
  const xAxisData = getUniqueValues(props.data, xField.name)
  const series = yFields.map((field: any) => {
    const seriesData = xAxisData.map((xValue: any) => {
      const filteredData = props.data.filter((item: any) => item[xField.name] === xValue)
      return aggregateData(filteredData, field)
    })
    
    return {
      name: field.displayName || field.name,
      type: 'bar',
      stack: props.styleSettings.specific?.stack ? 'total' : undefined,
      barWidth: props.styleSettings.specific?.barWidth + '%' || '40%',
      barGap: props.styleSettings.specific?.barGap + '%' || '30%',
      data: seriesData,
      label: {
        show: props.styleSettings.specific?.showValues === true,
        position: 'top'
      }
    }
  })
  
  // 设置X轴和Y轴
  const options: any = {
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: xField.displayName || xField.name,
      axisLabel: {
        rotate: xAxisData.length > 10 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: yFields.length === 1 ? (yFields[0].displayName || yFields[0].name) : ''
    },
    series
  }
  
  // 水平柱状图
  if (props.styleSettings.specific?.horizontal) {
    const temp = options.xAxis
    options.xAxis = options.yAxis
    options.yAxis = temp
    
    options.xAxis.type = 'value'
    options.yAxis.type = 'category'
    options.yAxis.data = xAxisData
    options.yAxis.axisLabel = { rotate: 0 }
  }
  
  return options
}

// 折线图配置
const getLineChartOptions = () => {
  const xField = props.mappings.x?.[0]
  const yFields = props.mappings.y || []
  
  if (!xField || yFields.length === 0) {
    throw new Error('折线图至少需要一个X轴字段和一个Y轴字段')
  }
  
  const xAxisData = getUniqueValues(props.data, xField.name).sort((a, b) => {
    // 尝试日期排序
    const dateA = new Date(a)
    const dateB = new Date(b)
    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
      return dateA.getTime() - dateB.getTime()
    }
    // 尝试数字排序
    if (!isNaN(Number(a)) && !isNaN(Number(b))) {
      return Number(a) - Number(b)
    }
    // 默认字符串排序
    return String(a).localeCompare(String(b))
  })
  
  const series = yFields.map((field: any) => {
    const seriesData = xAxisData.map((xValue: any) => {
      const filteredData = props.data.filter((item: any) => item[xField.name] === xValue)
      return aggregateData(filteredData, field)
    })
    
    return {
      name: field.displayName || field.name,
      type: 'line',
      stack: props.styleSettings.specific?.stack ? 'total' : undefined,
      smooth: props.styleSettings.specific?.smooth === true,
      lineStyle: {
        width: props.styleSettings.specific?.lineWidth || 2,
        type: props.styleSettings.specific?.lineType || 'solid'
      },
      symbol: props.styleSettings.specific?.showSymbol !== false ? 'emptyCircle' : 'none',
      areaStyle: props.styleSettings.specific?.showArea === true ? {} : undefined,
      data: seriesData
    }
  })
  
  return {
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: xField.displayName || xField.name,
      axisLabel: {
        rotate: xAxisData.length > 10 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: yFields.length === 1 ? (yFields[0].displayName || yFields[0].name) : ''
    },
    series
  }
}

// 饼图配置
const getPieChartOptions = () => {
  const dimensionField = props.mappings.x?.[0]
  const valueField = props.mappings.y?.[0]
  
  if (!dimensionField || !valueField) {
    throw new Error('饼图需要一个维度字段和一个数值字段')
  }
  
  const dimensionValues = getUniqueValues(props.data, dimensionField.name)
  const seriesData = dimensionValues.map((dimValue: any) => {
    const filteredData = props.data.filter((item: any) => item[dimensionField.name] === dimValue)
    const aggregatedValue = aggregateData(filteredData, valueField)
    
    return {
      name: dimValue,
      value: aggregatedValue
    }
  })
  
  return {
    series: [
      {
        type: 'pie',
        radius: [
          props.styleSettings.specific?.innerRadius ? `${props.styleSettings.specific.innerRadius}%` : 0,
          `${props.styleSettings.specific?.outerRadius || 80}%`
        ],
        data: seriesData,
        label: {
          show: props.styleSettings.specific?.showValues === true || props.styleSettings.specific?.showPercentage === true,
          formatter: (params: any) => {
            let text = params.name
            if (props.styleSettings.specific?.showValues) {
              text += ': ' + params.value
            }
            if (props.styleSettings.specific?.showPercentage) {
              text += ' (' + params.percent + '%)'
            }
            return text
          }
        },
        labelLine: {
          show: props.styleSettings.specific?.showValues === true || props.styleSettings.specific?.showPercentage === true,
          length: props.styleSettings.specific?.labelLineLength || 20
        }
      }
    ]
  }
}

// 散点图配置
const getScatterChartOptions = () => {
  const xField = props.mappings.x?.[0]
  const yField = props.mappings.y?.[0]
  const sizeField = props.mappings.size?.[0]
  const colorField = props.mappings.color?.[0]
  
  if (!xField || !yField) {
    throw new Error('散点图至少需要X轴和Y轴两个数值字段')
  }
  
  let seriesData
  
  if (colorField) {
    // 按颜色字段分组
    const colorValues = getUniqueValues(props.data, colorField.name)
    
    return {
      xAxis: {
        type: 'value',
        name: xField.displayName || xField.name
      },
      yAxis: {
        type: 'value',
        name: yField.displayName || yField.name
      },
      series: colorValues.map((colorValue: any) => {
        const filteredData = props.data.filter((item: any) => item[colorField.name] === colorValue)
        const data = filteredData.map((item: any) => {
          const point: any[] = [item[xField.name], item[yField.name]]
          if (sizeField) {
            point.push(item[sizeField.name])
          }
          return point
        })
        
        return {
          name: String(colorValue),
          type: 'scatter',
          symbolSize: sizeField ? function(data: any) {
            return Math.sqrt(data[2]) * (props.styleSettings.specific?.symbolSize || 5)
          } : props.styleSettings.specific?.symbolSize || 10,
          symbol: props.styleSettings.specific?.symbolType || 'circle',
          data
        }
      })
    }
  } else {
    // 不分组
    seriesData = props.data.map((item: any) => {
      const point: any[] = [item[xField.name], item[yField.name]]
      if (sizeField) {
        point.push(item[sizeField.name])
      }
      return point
    })
    
    return {
      xAxis: {
        type: 'value',
        name: xField.displayName || xField.name
      },
      yAxis: {
        type: 'value',
        name: yField.displayName || yField.name
      },
      series: [{
        type: 'scatter',
        symbolSize: sizeField ? function(data: any) {
          return Math.sqrt(data[2]) * (props.styleSettings.specific?.symbolSize || 5)
        } : props.styleSettings.specific?.symbolSize || 10,
        symbol: props.styleSettings.specific?.symbolType || 'circle',
        data: seriesData,
        markLine: props.styleSettings.specific?.showTrendLine ? {
          lineStyle: {
            type: 'solid'
          },
          data: [
            {
              type: 'linear',
              name: '趋势线'
            }
          ]
        } : undefined
      }]
    }
  }
}

// 雷达图配置
const getRadarChartOptions = () => {
  return { series: [] } // 示例，需根据实际情况完善
}

// 漏斗图配置
const getFunnelChartOptions = () => {
  return { series: [] } // 示例，需根据实际情况完善
}

// 热力图配置
const getHeatmapChartOptions = () => {
  return { series: [] } // 示例，需根据实际情况完善
}

// 矩形树图配置
const getTreemapChartOptions = () => {
  return { series: [] } // 示例，需根据实际情况完善
}

// 辅助函数：获取唯一值
const getUniqueValues = (data: any[], fieldName: string) => {
  const values = data.map(item => item[fieldName])
  return [...new Set(values)]
}

// 辅助函数：聚合数据
const aggregateData = (data: any[], field: any) => {
  const values = data.map(item => parseFloat(item[field.name])).filter(v => !isNaN(v))
  
  if (values.length === 0) {
    return 0
  }
  
  switch (field.aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'max':
      return Math.max(...values)
    case 'min':
      return Math.min(...values)
    case 'count':
      return values.length
    default:
      // 默认使用sum
      return values.reduce((a, b) => a + b, 0)
  }
}

// 初始化图表
const initChart = (container: HTMLElement | null) => {
  if (!container) return null
  
  // 移除旧实例
  echarts.dispose(container)
  
  // 创建新实例
  const chart = echarts.init(container)
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    chart.resize()
  })
  
  return chart
}

// 渲染图表
const renderChart = () => {
  if (noDataAvailable.value) {
    return
  }
  
  try {
    error.value = ''
    chartOptions.value = generateChartOptions()
    
    if (!chartOptions.value) {
      return
    }
    
    // 确保图表实例已初始化
    if (!chartInstance.value && chartRef.value) {
      chartInstance.value = initChart(chartRef.value)
    }
    
    // 设置图表选项
    if (chartInstance.value) {
      chartInstance.value.setOption(chartOptions.value, true)
    }
  } catch (err: any) {
    error.value = err.message || '渲染图表失败'
    emit('error', error.value)
  }
}

// 刷新图表
const refreshChart = () => {
  renderChart()
  emit('refresh')
}

// 下载图表
const downloadChart = () => {
  if (!chartInstance.value) {
    ElMessage.warning('图表未初始化')
    return
  }
  
  try {
    const dataURL = chartInstance.value.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    
    const link = document.createElement('a')
    link.download = `${props.styleSettings.title || '图表'}_${new Date().getTime()}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    emit('download', dataURL)
    ElMessage.success('图表已下载')
  } catch (err: any) {
    ElMessage.error(`下载失败: ${err.message}`)
  }
}

// 全屏预览
const toggleFullscreen = async () => {
  fullscreenVisible.value = true
  
  // 等待对话框渲染完成
  await nextTick()
  
  // 初始化全屏图表
  if (fullscreenChartRef.value) {
    fullscreenChartInstance.value = initChart(fullscreenChartRef.value)
    
    if (fullscreenChartInstance.value && chartOptions.value) {
      // 复制当前图表配置但调整尺寸
      const fullscreenOptions = { ...chartOptions.value }
      fullscreenChartInstance.value.setOption(fullscreenOptions)
      
      // 手动调整尺寸
      setTimeout(() => {
        fullscreenChartInstance.value?.resize()
      }, 300)
    }
  }
}

// 关闭全屏预览
const closeFullscreen = () => {
  fullscreenVisible.value = false
  
  // 销毁全屏图表实例
  if (fullscreenChartInstance.value) {
    fullscreenChartInstance.value.dispose()
    fullscreenChartInstance.value = null
  }
}

// 在全屏模式下载图表
const downloadChartFullscreen = () => {
  if (!fullscreenChartInstance.value) {
    ElMessage.warning('全屏图表未初始化')
    return
  }
  
  try {
    const dataURL = fullscreenChartInstance.value.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    
    const link = document.createElement('a')
    link.download = `${props.styleSettings.title || '图表'}_fullscreen_${new Date().getTime()}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    emit('download', dataURL)
    ElMessage.success('图表已下载')
  } catch (err: any) {
    ElMessage.error(`下载失败: ${err.message}`)
  }
}

// 监听数据变化
watch([() => props.data, () => props.mappings, () => props.styleSettings, () => props.chartType], () => {
  if (!props.loading) {
    renderChart()
  }
}, { deep: true })

// 监听加载状态
watch(() => props.loading, (newValue) => {
  if (!newValue) {
    // 加载完成后渲染
    renderChart()
  }
})

// 组件挂载时初始化
onMounted(() => {
  renderChart()
})

// 组件卸载时清理
onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  
  if (fullscreenChartInstance.value) {
    fullscreenChartInstance.value.dispose()
    fullscreenChartInstance.value = null
  }
  
  window.removeEventListener('resize', () => {
    chartInstance.value?.resize()
  })
})
</script>

<style lang="scss" scoped>
.chart-preview-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .preview-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  .preview-actions {
    display: flex;
    gap: 8px;
  }
}

.preview-content {
  flex: 1;
  min-height: 300px;
  position: relative;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-view {
  width: 100%;
  height: 100%;
}

.chart-loading,
.chart-error,
.chart-empty {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.chart-loading {
  color: #409eff;
  
  .loading-icon {
    font-size: 36px;
    margin-bottom: 12px;
    animation: rotate 1.2s linear infinite;
  }
}

.chart-error {
  color: #f56c6c;
  text-align: center;
  padding: 20px;
  
  .error-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }
  
  h4 {
    margin: 0 0 8px;
    font-size: 16px;
  }
  
  p {
    margin: 0;
    color: #606266;
  }
}

.fullscreen-chart-container {
  width: 100%;
  height: calc(100vh - 160px);
}

.fullscreen-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>