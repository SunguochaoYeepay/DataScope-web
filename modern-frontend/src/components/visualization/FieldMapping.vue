<template>
  <div class="field-mapping">
    <template v-if="fields.length > 0">
      <div class="field-section">
        <h4 class="section-title">可用字段</h4>
        <div class="field-list">
          <div 
            v-for="field in fields" 
            :key="field.name"
            class="field-item"
            draggable="true"
            @dragstart="handleDragStart($event, field)"
          >
            <el-tag 
              class="field-tag"
              :type="getFieldTagType(field)"
              effect="plain"
            >
              <el-icon class="field-icon">
                <component :is="getFieldIcon(field)" />
              </el-icon>
              <span class="field-name">{{ field.displayName || field.name }}</span>
              <span class="field-type">{{ field.dataType }}</span>
            </el-tag>
          </div>
        </div>
      </div>
      
      <div class="mapping-section">
        <h4 class="section-title">数据映射</h4>
        <div class="mapping-containers">
          <div 
            v-for="(name, index) in allowedMappings" 
            :key="name"
            class="mapping-container"
            :class="{ 'mapping-container-active': isDraggingOver === name }"
            @dragover.prevent="handleDragOver($event, name)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, name)"
          >
            <div class="mapping-header">
              <span class="mapping-name">{{ getMappingName(name) }}</span>
              <el-tooltip 
                :content="getMappingDescription(name)" 
                placement="top"
              >
                <el-icon class="mapping-info"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="mapping-content">
              <template v-if="mappings[name] && mappings[name].length > 0">
                <div 
                  v-for="(field, fIndex) in mappings[name]" 
                  :key="`${name}-${field.name}-${fIndex}`"
                  class="mapped-field"
                >
                  <el-tag 
                    :type="getFieldTagType(field)"
                    closable
                    @close="removeField(name, fIndex)"
                  >
                    <span class="mapped-field-name">{{ field.displayName || field.name }}</span>
                    
                    <template v-if="name === 'y' && field.isNumeric">
                      <el-select 
                        v-model="field.aggregation" 
                        size="small"
                        class="aggregation-select"
                        @click.stop
                      >
                        <el-option label="求和" value="sum" />
                        <el-option label="平均值" value="avg" />
                        <el-option label="最大值" value="max" />
                        <el-option label="最小值" value="min" />
                        <el-option label="计数" value="count" />
                      </el-select>
                    </template>
                  </el-tag>
                </div>
              </template>
              <div v-else class="mapping-placeholder">
                <el-icon><Plus /></el-icon>
                <span>拖拽字段至此</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <el-empty v-else description="无可用字段，请先选择数据源" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { InfoFilled, Plus, Document, Calendar, Opportunity, Link } from '@element-plus/icons-vue'
import type { FieldDefinition, DataMapping } from '@/types/visualization'

// 属性定义
const props = defineProps({
  fields: {
    type: Array as () => FieldDefinition[],
    required: true
  },
  mappings: {
    type: Object as () => DataMapping,
    required: true
  },
  allowedMappings: {
    type: Array as () => string[],
    default: () => ['x', 'y', 'color', 'size', 'detail']
  }
})

// 事件
const emit = defineEmits(['update:mappings'])

// 状态
const isDraggingOver = ref<string | null>(null)
const draggingField = ref<FieldDefinition | null>(null)

// 拖拽开始
const handleDragStart = (event: DragEvent, field: FieldDefinition) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(field))
    draggingField.value = field
  }
}

// 拖拽悬停
const handleDragOver = (event: DragEvent, mappingType: string) => {
  isDraggingOver.value = mappingType
}

// 拖拽离开
const handleDragLeave = () => {
  isDraggingOver.value = null
}

// 放置
const handleDrop = (event: DragEvent, mappingType: string) => {
  event.preventDefault()
  isDraggingOver.value = null
  
  if (!event.dataTransfer) return
  
  try {
    const fieldData = event.dataTransfer.getData('application/json')
    if (!fieldData) return
    
    const field = JSON.parse(fieldData) as FieldDefinition
    
    // 检查字段是否已经映射
    let isAlreadyMapped = false
    Object.keys(props.mappings).forEach(key => {
      if (props.mappings[key].some(f => f.name === field.name)) {
        isAlreadyMapped = true
      }
    })
    
    // 为度量字段设置默认聚合方式
    if (mappingType === 'y' && field.isNumeric && !field.aggregation) {
      field.aggregation = 'sum'
    }
    
    // 添加到映射
    const updatedMappings = { ...props.mappings }
    
    // 对于单值映射，替换现有映射
    const isSingleValueMapping = ['size'].includes(mappingType)
    
    if (isSingleValueMapping) {
      updatedMappings[mappingType] = [field]
    } else {
      if (!updatedMappings[mappingType]) {
        updatedMappings[mappingType] = []
      }
      updatedMappings[mappingType].push(field)
    }
    
    emit('update:mappings', updatedMappings)
  } catch (error) {
    console.error('Error during drop handling:', error)
  }
}

// 移除字段
const removeField = (mappingType: string, index: number) => {
  const updatedMappings = { ...props.mappings }
  updatedMappings[mappingType].splice(index, 1)
  emit('update:mappings', updatedMappings)
}

// 获取映射名称
const getMappingName = (mappingType: string) => {
  const nameMap: Record<string, string> = {
    x: 'X轴/类别',
    y: 'Y轴/数值',
    color: '颜色',
    size: '大小',
    detail: '明细'
  }
  
  return nameMap[mappingType] || mappingType
}

// 获取映射描述
const getMappingDescription = (mappingType: string) => {
  const descriptionMap: Record<string, string> = {
    x: 'X轴字段或类别维度，通常是时间、地区等分类字段',
    y: 'Y轴字段或数值度量，通常是数值字段，可以设置聚合方式',
    color: '用于区分数据系列的颜色映射字段',
    size: '用于表示数据点大小的字段，仅用于散点图等',
    detail: '用于详细展示的字段，主要用于表格展示'
  }
  
  return descriptionMap[mappingType] || ''
}

// 获取字段图标
const getFieldIcon = (field: FieldDefinition) => {
  if (field.isDate) {
    return 'Calendar'
  } else if (field.isNumeric) {
    return 'Opportunity'
  } else if (field.isString) {
    return 'Document'
  } else {
    return 'Link'
  }
}

// 获取字段标签类型
const getFieldTagType = (field: FieldDefinition) => {
  if (field.isNumeric) {
    return 'success'
  } else if (field.isDate) {
    return 'warning'
  } else if (field.isString) {
    return 'info'
  } else {
    return ''
  }
}
</script>

<style lang="scss" scoped>
.field-mapping {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  
  .field-item {
    cursor: grab;
    
    &:active {
      cursor: grabbing;
    }
    
    .field-tag {
      display: flex;
      align-items: center;
      
      .field-icon {
        margin-right: 4px;
      }
      
      .field-name {
        margin-right: 4px;
      }
      
      .field-type {
        font-size: 12px;
        opacity: 0.7;
      }
    }
  }
}

.mapping-containers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mapping-container {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  transition: all 0.3s;
  
  &.mapping-container-active {
    border-color: #409eff;
    background-color: #ecf5ff;
  }
}

.mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .mapping-name {
    font-weight: 500;
    font-size: 14px;
  }
  
  .mapping-info {
    cursor: help;
    color: #909399;
  }
}

.mapping-content {
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mapping-placeholder {
  width: 100%;
  height: 100%;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
  
  .el-icon {
    font-size: 18px;
    margin-bottom: 4px;
  }
}

.mapped-field {
  .el-tag {
    display: flex;
    align-items: center;
    
    .mapped-field-name {
      margin-right: 4px;
    }
    
    .aggregation-select {
      margin-left: 4px;
      width: 80px;
    }
  }
}
</style>