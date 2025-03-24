<template>
  <div class="visualization-designer-container">
    <el-row :gutter="16" class="designer-row">
      <!-- 数据源选择与字段映射 -->
      <el-col :span="layoutConfig.dataPanel" class="designer-panel">
        <el-card class="design-card data-mapping-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>数据源与映射</span>
              <el-popover
                placement="right"
                :width="300"
                trigger="click"
              >
                <template #reference>
                  <el-button type="primary" link>
                    <el-icon><InfoFilled /></el-icon>
                  </el-button>
                </template>
                <h4>数据映射说明</h4>
                <p>选择数据源并将字段拖拽到对应的映射区域，以配置图表的数据展示方式。</p>
                <ul>
                  <li><strong>X轴/类别</strong>: 维度字段，如日期、地区等</li>
                  <li><strong>Y轴/数值</strong>: 度量字段，如销量、利润等</li>
                  <li><strong>颜色</strong>: 用于区分不同系列的字段</li>
                  <li><strong>大小</strong>: 用于散点图等表示点大小的字段</li>
                </ul>
              </el-popover>
            </div>
          </template>
          
          <data-source-selector @change="handleDataSourceChange" />
          
          <visualization-type-selector 
            v-model="selectedType"
            @change="handleTypeChange"
          />
          
          <div class="data-mapping-container">
            <field-mapping
              :fields="availableFields"
              :mappings="dataMappings"
              :allowed-mappings="allowedMappings"
              @update:mappings="updateMappings"
            />
          </div>
        </el-card>
      </el-col>
      
      <!-- 中间预览区域 -->
      <el-col :span="layoutConfig.previewPanel" class="designer-panel">
        <chart-preview
          v-if="selectedType !== 'table' && selectedType !== 'pivot'"
          :chart-type="selectedType"
          :data="previewData"
          :mappings="dataMappings"
          :style-settings="styleSettings"
          :loading="loading"
          @refresh="refreshPreview"
          @error="handlePreviewError"
        />
        
        <div v-else class="table-preview-container">
          <h3>表格预览</h3>
          <div class="table-container">
            <el-table
              v-if="previewData.length > 0"
              :data="previewData.slice(0, 10)"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column 
                v-for="field in tableColumns" 
                :key="field.name"
                :prop="field.name"
                :label="field.displayName || field.name"
              />
            </el-table>
            <el-empty v-else description="暂无数据" />
          </div>
        </div>
      </el-col>
      
      <!-- 样式设置区域 -->
      <el-col :span="layoutConfig.stylePanel" class="designer-panel">
        <style-settings
          v-model="styleSettings"
          :visualization-type="selectedType"
          @update:style="updateStyleSettings"
        />
      </el-col>
    </el-row>
    
    <div class="action-bar">
      <el-button @click="cancelDesign">取消</el-button>
      <el-button type="primary" @click="saveVisualization">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import DataSourceSelector from './DataSourceSelector.vue'
import VisualizationTypeSelector from './VisualizationTypeSelector.vue'
import FieldMapping from './FieldMapping.vue'
import StyleSettings from './StyleSettings.vue'
import ChartPreview from './ChartPreview.vue'
import { getQueryResults } from '@/api/query'
import { getDatasourceTableColumns } from '@/api/metadata'
import type { FieldDefinition, DataMapping, ChartStyleSettings } from '@/types/visualization'

// 路由
const router = useRouter()

// 状态
const loading = ref(false)
const selectedType = ref('bar')
const selectedDataSource = ref<string>('')
const availableFields = ref<FieldDefinition[]>([])
const previewData = ref<any[]>([])
const dataMappings = reactive<DataMapping>({
  x: [],
  y: [],
  color: [],
  size: [],
  detail: []
})
const styleSettings = reactive<ChartStyleSettings>({
  title: '',
  subtitle: '',
  showLegend: true,
  legendPosition: 'bottom',
  backgroundColor: '',
  padding: {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  },
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'cubicOut',
    delay: 0
  },
  colors: [],
  specific: {}
})

// 布局配置
const layoutConfig = reactive({
  dataPanel: 6,
  previewPanel: 12,
  stylePanel: 6
})

// 表格列
const tableColumns = computed(() => {
  if (selectedType.value === 'table') {
    return availableFields.value
  }
  
  const mappedFields: FieldDefinition[] = []
  Object.values(dataMappings).forEach(fields => {
    fields.forEach(field => {
      if (!mappedFields.some(f => f.name === field.name)) {
        mappedFields.push(field)
      }
    })
  })
  
  return mappedFields.length > 0 ? mappedFields : availableFields.value
})

// 根据图表类型确定允许的映射类型
const allowedMappings = computed(() => {
  switch (selectedType.value) {
    case 'bar':
    case 'line':
      return ['x', 'y', 'color']
    case 'pie':
      return ['x', 'y']
    case 'scatter':
      return ['x', 'y', 'size', 'color']
    case 'radar':
      return ['x', 'y', 'color']
    case 'heatmap':
      return ['x', 'y', 'color']
    case 'funnel':
      return ['x', 'y']
    case 'treemap':
      return ['x', 'y', 'color']
    case 'table':
    case 'pivot':
      return ['detail']
    default:
      return ['x', 'y']
  }
})

// 处理数据源变更
const handleDataSourceChange = async (datasourceId: string) => {
  selectedDataSource.value = datasourceId
  
  if (!datasourceId) {
    availableFields.value = []
    previewData.value = []
    return
  }
  
  loading.value = true
  try {
    // 获取字段信息
    const response = await getDatasourceTableColumns(datasourceId)
    
    if (response.data && Array.isArray(response.data)) {
      availableFields.value = response.data.map(col => ({
        name: col.name,
        displayName: col.comment || col.name,
        dataType: col.dataType,
        isNumeric: ['int', 'bigint', 'decimal', 'float', 'double'].includes(col.dataType.toLowerCase()),
        isDate: col.dataType.toLowerCase().includes('date') || col.dataType.toLowerCase().includes('time'),
        isString: col.dataType.toLowerCase().includes('char') || col.dataType.toLowerCase() === 'text'
      }))
    } else {
      availableFields.value = []
    }
    
    // 获取预览数据
    await refreshPreview()
  } catch (error) {
    console.error('Failed to load data source fields:', error)
    ElMessage.error('加载数据源字段失败')
    availableFields.value = []
    previewData.value = []
  } finally {
    loading.value = false
  }
}

// 处理图表类型变更
const handleTypeChange = (type: string) => {
  selectedType.value = type
  
  // 重置样式设置中的图表特定配置
  styleSettings.specific = {}
  
  // 根据图表类型设置默认样式
  switch (type) {
    case 'bar':
      styleSettings.specific = {
        barWidth: 40,
        barGap: 30,
        stack: false,
        horizontal: false,
        showValues: false
      }
      break
    case 'line':
      styleSettings.specific = {
        smooth: false,
        lineWidth: 2,
        lineType: 'solid',
        showSymbol: true,
        showArea: false,
        stack: false
      }
      break
    case 'pie':
      styleSettings.specific = {
        innerRadius: 0,
        outerRadius: 70,
        showValues: true,
        showPercentage: true,
        labelLineLength: 20
      }
      break
    case 'scatter':
      styleSettings.specific = {
        symbolSize: 10,
        symbolType: 'circle',
        showTrendLine: false
      }
      break
  }
}

// 更新数据映射
const updateMappings = (mappings: DataMapping) => {
  Object.keys(mappings).forEach(key => {
    dataMappings[key as keyof DataMapping] = mappings[key as keyof DataMapping]
  })
}

// 更新样式设置
const updateStyleSettings = (settings: ChartStyleSettings) => {
  Object.assign(styleSettings, settings)
}

// 刷新预览数据
const refreshPreview = async () => {
  if (!selectedDataSource.value) {
    previewData.value = []
    return
  }
  
  loading.value = true
  try {
    // 构建查询
    const query = {
      datasourceId: selectedDataSource.value,
      limit: 1000,
      sql: `SELECT * FROM ${selectedDataSource.value} LIMIT 1000`
    }
    
    const response = await getQueryResults(query)
    
    if (response.data && Array.isArray(response.data)) {
      previewData.value = response.data
    } else {
      // 使用模拟数据进行测试
      previewData.value = generateMockData()
    }
  } catch (error) {
    console.error('Failed to load preview data:', error)
    ElMessage.error('加载预览数据失败')
    // 使用模拟数据
    previewData.value = generateMockData()
  } finally {
    loading.value = false
  }
}

// 处理预览错误
const handlePreviewError = (error: string) => {
  console.error('Chart preview error:', error)
  ElMessage.error(`图表预览错误: ${error}`)
}

// 生成模拟数据
const generateMockData = () => {
  // 根据可用字段生成模拟数据
  if (availableFields.value.length === 0) {
    return []
  }
  
  const mockData = []
  const numericFields = availableFields.value.filter(f => f.isNumeric)
  const categoryFields = availableFields.value.filter(f => !f.isNumeric)
  
  for (let i = 0; i < 50; i++) {
    const item: Record<string, any> = {}
    
    // 为每个字段生成模拟值
    availableFields.value.forEach(field => {
      if (field.isNumeric) {
        item[field.name] = Math.floor(Math.random() * 1000)
      } else if (field.isDate) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 365))
        item[field.name] = date.toISOString().split('T')[0]
      } else {
        const categories = ['类别A', '类别B', '类别C', '类别D', '类别E']
        item[field.name] = categories[Math.floor(Math.random() * categories.length)]
      }
    })
    
    mockData.push(item)
  }
  
  return mockData
}

// 保存可视化
const saveVisualization = () => {
  // TODO: 实现保存逻辑
  ElMessage.success('可视化已保存')
  router.push('/dashboard')
}

// 取消设计
const cancelDesign = () => {
  router.back()
}

// 初始化
onMounted(() => {
  // 设置默认图表类型
  handleTypeChange('bar')
  
  // 生成模拟数据以便快速预览
  previewData.value = generateMockData()
})
</script>

<style lang="scss" scoped>
.visualization-designer-container {
  height: calc(100vh - 120px);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.designer-row {
  flex: 1;
  overflow: hidden;
}

.designer-panel {
  height: 100%;
  padding-bottom: 16px;
}

.design-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .el-card__body {
    flex: 1;
    overflow: auto;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-mapping-container {
  margin-top: 16px;
}

.table-preview-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  padding: 16px;
  height: 100%;
  
  h3 {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  .table-container {
    height: calc(100% - 40px);
    overflow: auto;
  }
}

.action-bar {
  padding: 16px 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style> 