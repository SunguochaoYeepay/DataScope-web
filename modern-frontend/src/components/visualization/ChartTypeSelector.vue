<template>
  <div class="chart-type-selector">
    <h3 class="selector-title">选择图表类型</h3>
    
    <el-tabs v-model="activeTab" class="chart-tabs">
      <el-tab-pane label="基础图表" name="basic">
        <div class="chart-grid">
          <div
            v-for="chart in basicCharts"
            :key="chart.type"
            class="chart-item"
            :class="{ 'is-selected': modelValue === chart.type }"
            @click="selectChart(chart.type)"
          >
            <div class="chart-icon">
              <el-icon :size="32">
                <component :is="chart.icon" />
              </el-icon>
            </div>
            <div class="chart-name">{{ chart.name }}</div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="高级图表" name="advanced">
        <div class="chart-grid">
          <div
            v-for="chart in advancedCharts"
            :key="chart.type"
            class="chart-item"
            :class="{ 'is-selected': modelValue === chart.type }"
            @click="selectChart(chart.type)"
          >
            <div class="chart-icon">
              <el-icon :size="32">
                <component :is="chart.icon" />
              </el-icon>
            </div>
            <div class="chart-name">{{ chart.name }}</div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="表格" name="table">
        <div class="chart-grid">
          <div
            v-for="chart in tableCharts"
            :key="chart.type"
            class="chart-item"
            :class="{ 'is-selected': modelValue === chart.type }"
            @click="selectChart(chart.type)"
          >
            <div class="chart-icon">
              <el-icon :size="32">
                <component :is="chart.icon" />
              </el-icon>
            </div>
            <div class="chart-name">{{ chart.name }}</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <div class="chart-description" v-if="selectedChartInfo">
      <h4>{{ selectedChartInfo.name }}</h4>
      <p>{{ selectedChartInfo.description }}</p>
      <div class="chart-tips">
        <p class="tip-title">适用场景：</p>
        <ul>
          <li v-for="(scenario, index) in selectedChartInfo.scenarios" :key="index">
            {{ scenario }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  PieChart, Histogram, TrendCharts, DataLine, 
  DataAnalysis, Operation, View, SetUp, Grid
} from '@element-plus/icons-vue'

// 图表类型接口
interface ChartTypeInfo {
  type: string
  name: string
  icon: string
  description: string
  scenarios: string[]
  advanced?: boolean
  isTable?: boolean
}

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// 定义组件事件
const emit = defineEmits(['update:modelValue', 'change'])

// 当前活动标签页
const activeTab = ref('basic')

// 图表类型数据
const chartTypes: ChartTypeInfo[] = [
  // 基础图表
  {
    type: 'bar',
    name: '柱状图',
    icon: 'Histogram',
    description: '柱状图用于比较不同类别数据的大小，适合展示分类数据的数量对比。',
    scenarios: [
      '比较不同类别之间的数量差异',
      '显示一段时间内的数据变化',
      '展示排名或优先级'
    ]
  },
  {
    type: 'line',
    name: '折线图',
    icon: 'DataLine',
    description: '折线图用于展示数据在一段时间内的变化趋势，适合连续的时间序列数据。',
    scenarios: [
      '展示数据随时间变化的趋势',
      '比较多个数据系列的变化关系',
      '预测未来走势'
    ]
  },
  {
    type: 'pie',
    name: '饼图',
    icon: 'PieChart',
    description: '饼图用于显示不同类别数据的比例关系，适合展示部分与整体的关系。',
    scenarios: [
      '展示各部分在整体中的占比',
      '比较不同类别的相对大小',
      '显示构成成分的分布情况'
    ]
  },
  {
    type: 'scatter',
    name: '散点图',
    icon: 'Operation',
    description: '散点图用于展示两个变量之间的相关性，适合探索数据的分布规律。',
    scenarios: [
      '分析两个变量之间的相关性',
      '识别数据集中的异常值',
      '研究数据的分布模式'
    ]
  },
  // 高级图表
  {
    type: 'radar',
    name: '雷达图',
    icon: 'DataAnalysis',
    description: '雷达图用于多维度数据的比较，适合展示多个指标的综合评价。',
    scenarios: [
      '比较多个对象在多个维度上的表现',
      '展示个体在不同方面的能力分布',
      '进行综合性能评估'
    ],
    advanced: true
  },
  {
    type: 'funnel',
    name: '漏斗图',
    icon: 'SetUp',
    description: '漏斗图用于展示数据流程中的转化率，适合销售流程或用户行为分析。',
    scenarios: [
      '展示销售转化漏斗',
      '分析用户行为流程',
      '识别流程中的问题环节'
    ],
    advanced: true
  },
  {
    type: 'heatmap',
    name: '热力图',
    icon: 'View',
    description: '热力图用于可视化矩阵数据，通过颜色深浅表示数值大小，适合展示复杂的数据模式。',
    scenarios: [
      '展示大量数据的分布模式',
      '分析相关性矩阵',
      '识别数据中的热点区域'
    ],
    advanced: true
  },
  {
    type: 'treemap',
    name: '矩形树图',
    icon: 'Grid',
    description: '矩形树图用于展示层次结构数据，适合空间有限时展示复杂的层级关系。',
    scenarios: [
      '展示具有层次结构的数据',
      '比较不同类别的大小和占比',
      '分析组织结构或文件系统'
    ],
    advanced: true
  },
  // 表格类型
  {
    type: 'table',
    name: '基础表格',
    icon: 'Grid',
    description: '基础表格用于展示详细的原始数据，支持排序、筛选和分页。',
    scenarios: [
      '展示详细的数据记录',
      '需要精确数值时',
      '数据需要排序或筛选'
    ],
    isTable: true
  },
  {
    type: 'pivot',
    name: '透视表',
    icon: 'DataAnalysis',
    description: '透视表用于多维度数据的交叉分析，可以动态调整行列字段。',
    scenarios: [
      '多维度数据的汇总分析',
      '探索数据的内在关系',
      '动态调整数据视角'
    ],
    isTable: true
  }
]

// 根据类型筛选图表
const basicCharts = computed(() => chartTypes.filter(chart => !chart.advanced && !chart.isTable))
const advancedCharts = computed(() => chartTypes.filter(chart => chart.advanced))
const tableCharts = computed(() => chartTypes.filter(chart => chart.isTable))

// 当前选中的图表信息
const selectedChartInfo = computed(() => {
  return chartTypes.find(chart => chart.type === props.modelValue) || null
})

// 选择图表类型
const selectChart = (type: string) => {
  emit('update:modelValue', type)
  emit('change', type)
  
  // 自动切换到相应的标签页
  const chart = chartTypes.find(c => c.type === type)
  if (chart) {
    if (chart.advanced) {
      activeTab.value = 'advanced'
    } else if (chart.isTable) {
      activeTab.value = 'table'
    } else {
      activeTab.value = 'basic'
    }
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // 根据选中的图表类型自动切换标签页
    const chart = chartTypes.find(c => c.type === newValue)
    if (chart) {
      if (chart.advanced) {
        activeTab.value = 'advanced'
      } else if (chart.isTable) {
        activeTab.value = 'table'
      } else {
        activeTab.value = 'basic'
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.chart-type-selector {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  padding: 16px;
}

.selector-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chart-tabs {
  margin-bottom: 20px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #f5f7fa;
    transform: translateY(-2px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  &.is-selected {
    background-color: #ecf5ff;
    border-color: #409eff;
    color: #409eff;
  }
  
  .chart-icon {
    margin-bottom: 8px;
  }
  
  .chart-name {
    font-size: 14px;
  }
}

.chart-description {
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 16px;
    color: #303133;
  }
  
  p {
    margin-bottom: 16px;
    color: #606266;
    line-height: 1.5;
  }
  
  .chart-tips {
    .tip-title {
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    ul {
      padding-left: 20px;
      margin: 0;
      
      li {
        margin-bottom: 4px;
        color: #606266;
      }
    }
  }
}
</style>