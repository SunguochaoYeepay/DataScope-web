<template>
  <div class="data-mapping-container">
    <div class="mapping-header">
      <h3 class="mapping-title">数据映射</h3>
      <el-tooltip content="如何映射数据" placement="top">
        <el-button link type="primary" @click="showHelp = true">
          <el-icon><QuestionFilled /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    
    <template v-if="!fields || fields.length === 0">
      <el-empty description="无可用字段，请先选择数据源" />
    </template>
    
    <template v-else>
      <div class="mapping-sections">
        <!-- 字段列表区域 -->
        <div class="fields-panel">
          <div class="panel-header">
            <h4>可用字段</h4>
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索字段" 
              size="small"
              clearable
              :prefix-icon="Search"
            />
          </div>
          
          <el-scrollbar height="300px">
            <div class="field-list">
              <draggable
                :list="availableFields"
                :group="{ name: 'fields', pull: 'clone', put: false }"
                item-key="id"
                :sort="false"
                :clone="cloneField"
                @end="onDragEnd"
              >
                <template #item="{ element }">
                  <div class="field-item" :class="getFieldTypeClass(element)">
                    <el-icon class="field-icon">
                      <component :is="getFieldTypeIcon(element)" />
                    </el-icon>
                    <span class="field-name">{{ element.name }}</span>
                    <span class="field-type">{{ getFieldTypeLabel(element) }}</span>
                  </div>
                </template>
              </draggable>
            </div>
          </el-scrollbar>
        </div>
        
        <!-- 映射区域 -->
        <div class="mapping-zones">
          <h4>将字段拖动到以下区域</h4>
          
          <div class="mapping-groups">
            <!-- 不同图表类型的映射区域通过动态组件加载 -->
            <component 
              :is="mappingComponent" 
              v-if="mappingComponent" 
              v-model:mappings="mappings"
              @change="onMappingChange"
            />
            
            <!-- 默认映射区域 -->
            <template v-else>
              <div 
                v-for="(zone, index) in defaultMappingZones" 
                :key="index"
                class="mapping-zone"
              >
                <div class="zone-header">
                  <span class="zone-name">{{ zone.name }}</span>
                  <span class="zone-required" v-if="zone.required">*必填</span>
                </div>
                
                <draggable
                  :list="getMappingsByZone(zone.key)"
                  group="fields"
                  item-key="id"
                  :sort="true"
                  class="zone-content"
                  :class="{ 'is-required': zone.required && getMappingsByZone(zone.key).length === 0 }"
                  @change="(e) => handleMappingChange(e, zone.key)"
                >
                  <template #item="{ element }">
                    <div class="mapped-field" :class="getFieldTypeClass(element)">
                      <el-icon class="field-icon">
                        <component :is="getFieldTypeIcon(element)" />
                      </el-icon>
                      <span class="field-name">{{ element.name }}</span>
                      <el-button 
                        type="danger" 
                        link 
                        size="small"
                        @click="removeMapping(zone.key, element)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </template>
                  
                  <template #header>
                    <div class="zone-placeholder" v-if="getMappingsByZone(zone.key).length === 0">
                      拖动字段到这里
                    </div>
                  </template>
                </draggable>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 字段配置面板 -->
      <div class="field-settings-panel" v-if="selectedMappedField">
        <div class="panel-header">
          <h4>字段设置: {{ selectedMappedField.name }}</h4>
          <el-button link type="danger" @click="selectedMappedField = null">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <el-form label-position="top" size="small">
          <el-form-item label="显示名称">
            <el-input v-model="selectedMappedField.displayName" placeholder="自定义显示名称" />
          </el-form-item>
          
          <el-form-item label="聚合方式" v-if="isMeasureField(selectedMappedField)">
            <el-select v-model="selectedMappedField.aggregation" style="width: 100%">
              <el-option label="求和" value="sum" />
              <el-option label="平均值" value="avg" />
              <el-option label="计数" value="count" />
              <el-option label="最大值" value="max" />
              <el-option label="最小值" value="min" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="排序方式">
            <el-select v-model="selectedMappedField.sort" style="width: 100%">
              <el-option label="不排序" value="" />
              <el-option label="升序" value="asc" />
              <el-option label="降序" value="desc" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="格式化" v-if="isNumberField(selectedMappedField)">
            <el-select v-model="selectedMappedField.format" style="width: 100%">
              <el-option label="默认" value="" />
              <el-option label="数字(1,234.56)" value="number" />
              <el-option label="百分比(12.34%)" value="percent" />
              <el-option label="货币(¥1,234.56)" value="currency" />
            </el-select>
          </el-form-item>
        </el-form>
        
        <div class="actions">
          <el-button type="primary" @click="applyFieldSettings">应用设置</el-button>
        </div>
      </div>
    </template>
    
    <!-- 帮助对话框 -->
    <el-dialog
      v-model="showHelp"
      title="如何映射数据"
      width="500px"
    >
      <div class="help-content">
        <h4>数据映射说明</h4>
        <p>数据映射是将数据源中的字段映射到图表的各个维度的过程。不同类型的图表需要不同的映射方式：</p>
        
        <h5>基本概念</h5>
        <ul>
          <li><strong>维度</strong>: 通常用于分类数据，例如日期、地区、产品类别等。</li>
          <li><strong>度量</strong>: 通常是需要聚合计算的数值，例如销售额、数量、平均值等。</li>
        </ul>
        
        <h5>常见图表映射</h5>
        <ul>
          <li><strong>柱状图/折线图</strong>: 需要至少一个维度(X轴)和一个度量(Y轴)。</li>
          <li><strong>饼图</strong>: 需要一个维度(扇区)和一个度量(大小)。</li>
          <li><strong>散点图</strong>: 需要两个度量(X轴和Y轴)，可选一个维度(颜色)。</li>
        </ul>
        
        <p>从左侧可用字段列表中拖动字段到右侧对应的区域，即可完成映射。</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  QuestionFilled, Document, Odometer, Calendar, 
  Tickets, ChatLineRound, Delete, Search, Close
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

// 字段类型
enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object'
}

// 区域类型
enum MappingZoneType {
  DIMENSION = 'dimension',
  MEASURE = 'measure',
  COLOR = 'color',
  SIZE = 'size',
  TOOLTIP = 'tooltip'
}

// 聚合类型
enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MAX = 'max',
  MIN = 'min'
}

// 排序类型
enum SortType {
  NONE = '',
  ASC = 'asc',
  DESC = 'desc'
}

// 格式化类型
enum FormatType {
  NONE = '',
  NUMBER = 'number',
  PERCENT = 'percent',
  CURRENCY = 'currency'
}

// 字段接口
interface Field {
  id: string
  name: string
  type: FieldType
  displayName?: string
  aggregation?: AggregationType
  sort?: SortType
  format?: FormatType
}

// 映射区域接口
interface MappingZone {
  key: string
  name: string
  type: MappingZoneType
  required?: boolean
  multiple?: boolean
  maxItems?: number
}

// 定义组件属性
const props = defineProps({
  chartType: {
    type: String,
    required: true
  },
  fields: {
    type: Array as () => Field[],
    default: () => []
  },
  modelValue: {
    type: Object as () => Record<string, Field[]>,
    default: () => ({})
  }
})

// 定义组件事件
const emit = defineEmits(['update:modelValue', 'change'])

// 字段搜索
const searchQuery = ref('')

// 映射管理
const mappings = ref<Record<string, Field[]>>({...props.modelValue})
const selectedMappedField = ref<Field | null>(null)

// 帮助对话框
const showHelp = ref(false)

// 默认映射区域定义
const defaultMappingZones: MappingZone[] = [
  { key: 'x', name: 'X轴', type: MappingZoneType.DIMENSION, required: true },
  { key: 'y', name: 'Y轴', type: MappingZoneType.MEASURE, required: true },
  { key: 'color', name: '颜色', type: MappingZoneType.DIMENSION },
  { key: 'size', name: '大小', type: MappingZoneType.MEASURE },
  { key: 'tooltip', name: '提示信息', type: MappingZoneType.DIMENSION, multiple: true }
]

// 根据图表类型动态加载映射组件
const mappingComponent = computed(() => {
  switch (props.chartType) {
    case 'bar':
    case 'line':
      return null // 使用默认映射区域
    case 'pie':
      return null // 目前没有特殊的饼图映射组件，使用默认
    default:
      return null
  }
})

// 筛选可用字段
const availableFields = computed(() => {
  if (!props.fields) return []
  
  let filtered = [...props.fields]
  
  // 应用搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(field => 
      field.name.toLowerCase().includes(query) || 
      (field.displayName && field.displayName.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

// 获取指定区域的映射字段
const getMappingsByZone = (zone: string) => {
  return mappings.value[zone] || []
}

// 克隆字段（拖拽时用）
const cloneField = (field: Field) => {
  return { ...field }
}

// 处理映射变化
const handleMappingChange = (event: any, zone: string) => {
  // 处理新增的映射
  if (event.added) {
    const addedField = event.added.element
    
    // 初始化默认设置
    if (!addedField.displayName) {
      addedField.displayName = addedField.name
    }
    
    // 为数值类型字段设置默认聚合方式
    if (isNumberField(addedField) && !addedField.aggregation) {
      addedField.aggregation = AggregationType.SUM
    }
  }
  
  onMappingChange()
}

// 映射变更通知
const onMappingChange = () => {
  emit('update:modelValue', {...mappings.value})
  emit('change', {...mappings.value})
}

// 删除映射
const removeMapping = (zone: string, field: Field) => {
  if (mappings.value[zone]) {
    mappings.value[zone] = mappings.value[zone].filter(f => f.id !== field.id)
    onMappingChange()
  }
}

// 拖拽结束后处理
const onDragEnd = () => {
  // 可以在这里添加额外的逻辑
}

// 获取字段类型样式
const getFieldTypeClass = (field: Field) => {
  return `field-type-${field.type}`
}

// 获取字段类型图标
const getFieldTypeIcon = (field: Field) => {
  switch (field.type) {
    case FieldType.STRING:
      return Document
    case FieldType.NUMBER:
      return Odometer
    case FieldType.DATE:
      return Calendar
    case FieldType.BOOLEAN:
      return Tickets
    default:
      return ChatLineRound
  }
}

// 获取字段类型标签
const getFieldTypeLabel = (field: Field) => {
  switch (field.type) {
    case FieldType.STRING:
      return '文本'
    case FieldType.NUMBER:
      return '数值'
    case FieldType.DATE:
      return '日期'
    case FieldType.BOOLEAN:
      return '布尔'
    case FieldType.ARRAY:
      return '数组'
    case FieldType.OBJECT:
      return '对象'
    default:
      return '未知'
  }
}

// 字段类型判断
const isNumberField = (field: Field | null) => {
  return field && field.type === FieldType.NUMBER
}

const isMeasureField = (field: Field | null) => {
  return field && field.type === FieldType.NUMBER
}

// 选择字段进行设置
const selectMappedFieldForSettings = (field: Field) => {
  selectedMappedField.value = { ...field }
}

// 应用字段设置
const applyFieldSettings = () => {
  if (!selectedMappedField.value) return
  
  // 遍历所有映射区域查找并更新字段
  Object.keys(mappings.value).forEach(zone => {
    mappings.value[zone] = mappings.value[zone].map(field => {
      if (field.id === selectedMappedField.value?.id) {
        return { ...selectedMappedField.value }
      }
      return field
    })
  })
  
  onMappingChange()
  selectedMappedField.value = null
}

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    mappings.value = { ...newVal }
  }
}, { deep: true })

// 组件挂载时进行初始化
onMounted(() => {
  // 确保mappings对象具有所有默认区域的空数组
  defaultMappingZones.forEach(zone => {
    if (!mappings.value[zone.key]) {
      mappings.value[zone.key] = []
    }
  })
})
</script>

<style lang="scss" scoped>
.data-mapping-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  padding: 16px;
}

.mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .mapping-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.mapping-sections {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.fields-panel {
  width: 220px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  
  .panel-header {
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
    
    h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
    }
  }
}

.field-list {
  .field-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: move;
    border-bottom: 1px solid #f0f2f5;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .field-icon {
      margin-right: 8px;
    }
    
    .field-name {
      flex: 1;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .field-type {
      font-size: 12px;
      color: #909399;
      margin-left: 8px;
    }
  }
}

.mapping-zones {
  flex: 1;
  
  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #606266;
  }
}

.mapping-groups {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mapping-zone {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  
  .zone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    
    .zone-name {
      font-weight: 500;
      font-size: 14px;
    }
    
    .zone-required {
      font-size: 12px;
      color: #f56c6c;
    }
  }
  
  .zone-content {
    min-height: 60px;
    padding: 8px;
    
    &.is-required {
      border: 1px dashed #f56c6c;
    }
  }
  
  .zone-placeholder {
    color: #909399;
    font-size: 14px;
    text-align: center;
    padding: 12px;
  }
  
  .mapped-field {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    background-color: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .field-icon {
      margin-right: 8px;
    }
    
    .field-name {
      flex: 1;
      font-size: 14px;
    }
  }
}

.field-settings-panel {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    
    h4 {
      margin: 0;
      font-size: 14px;
    }
  }
  
  form {
    padding: 16px;
  }
  
  .actions {
    padding: 0 16px 16px;
    text-align: right;
  }
}

// 字段类型样式
.field-type-string {
  .field-icon {
    color: #67c23a;
  }
}

.field-type-number {
  .field-icon {
    color: #409eff;
  }
}

.field-type-date {
  .field-icon {
    color: #e6a23c;
  }
}

.field-type-boolean {
  .field-icon {
    color: #f56c6c;
  }
}

// 帮助内容样式
.help-content {
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 16px;
  }
  
  h5 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  p {
    line-height: 1.6;
    margin: 8px 0;
  }
  
  ul {
    padding-left: 20px;
    
    li {
      margin-bottom: 6px;
      line-height: 1.5;
    }
  }
}
</style>