<template>
  <div class="result-columns-builder">
    <el-card class="builder-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>结果列配置</span>
          <div class="header-actions">
            <el-tooltip content="添加列" placement="top">
              <el-button type="primary" @click="addColumn" size="small">
                <el-icon><Plus /></el-icon>
                添加列
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>
      
      <div v-if="columns.length === 0" class="empty-columns">
        <el-empty description="暂无结果列" />
        <el-button type="primary" @click="addColumn">
          <el-icon><Plus /></el-icon>
          添加结果列
        </el-button>
      </div>
      
      <draggable
        v-else
        v-model="columns"
        item-key="field"
        handle=".column-drag-handle"
        ghost-class="column-ghost"
        chosen-class="column-chosen"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
          <div class="column-item">
            <div class="column-header">
              <el-icon class="column-drag-handle"><Rank /></el-icon>
              <span>列 {{ index + 1 }}</span>
              <div class="column-actions">
                <el-tooltip content="删除列" placement="top">
                  <el-button 
                    type="danger" 
                    @click="removeColumn(index)" 
                    size="small" 
                    circle 
                    plain
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            
            <div class="column-content">
              <el-form :model="element" label-position="top">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="字段">
                      <el-select 
                        v-model="element.field" 
                        filterable 
                        placeholder="选择字段"
                        @change="() => onFieldChange(element, index)"
                      >
                        <el-option
                          v-for="field in availableFields"
                          :key="field.name"
                          :label="field.label || field.name"
                          :value="field.name"
                        >
                          <span>{{ field.label || field.name }}</span>
                          <span class="field-type">{{ field.dataType }}</span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="12">
                    <el-form-item label="标签">
                      <el-input v-model="element.label" placeholder="输入标签" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="宽度">
                      <el-input-number v-model="element.width" :min="50" :max="500" />
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-form-item label="固定列">
                      <el-select v-model="element.fixed" placeholder="选择位置">
                        <el-option label="不固定" :value="false" />
                        <el-option label="左侧固定" value="left" />
                        <el-option label="右侧固定" value="right" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-form-item label=" ">
                      <el-checkbox v-model="element.visible" :true-label="true" :false-label="false">显示</el-checkbox>
                      <el-checkbox v-model="element.sortable" :true-label="true" :false-label="false">可排序</el-checkbox>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-divider content-position="left">格式化配置</el-divider>
                
                <div v-if="!element.format">
                  <el-button @click="initFormat(element)" type="primary" plain size="small">
                    <el-icon><Setting /></el-icon>
                    配置格式化规则
                  </el-button>
                </div>
                
                <template v-else>
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="格式类型">
                        <el-select v-model="element.format.type" placeholder="选择类型">
                          <el-option label="文本" value="text" />
                          <el-option label="数字" value="number" />
                          <el-option label="日期" value="date" />
                          <el-option label="货币" value="currency" />
                          <el-option label="百分比" value="percent" />
                          <el-option label="自定义" value="custom" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="8" v-if="element.format.type === 'number' || element.format.type === 'currency' || element.format.type === 'percent'">
                      <el-form-item label="精度">
                        <el-input-number v-model="element.format.precision" :min="0" :max="10" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="8" v-if="element.format.type === 'currency'">
                      <el-form-item label="货币符号">
                        <el-input v-model="element.format.prefix" placeholder="例如: ¥" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="8" v-if="element.format.type === 'percent'">
                      <el-form-item label="后缀">
                        <el-input v-model="element.format.suffix" placeholder="例如: %" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="16" v-if="element.format.type === 'date'">
                      <el-form-item label="日期格式">
                        <el-select v-model="element.format.pattern">
                          <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                          <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                          <el-option label="YYYY年MM月DD日" value="YYYY年MM月DD日" />
                          <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                          <el-option label="YYYY-MM-DD HH:mm" value="YYYY-MM-DD HH:mm" />
                          <el-option label="MM-DD HH:mm" value="MM-DD HH:mm" />
                          <el-option label="HH:mm:ss" value="HH:mm:ss" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="16" v-if="element.format.type === 'custom'">
                      <el-form-item label="自定义格式">
                        <el-input v-model="element.format.pattern" placeholder="自定义格式化表达式" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
                
                <el-divider content-position="left">脱敏配置</el-divider>
                
                <div v-if="!element.maskRule">
                  <el-button @click="initMaskRule(element)" type="primary" plain size="small">
                    <el-icon><Lock /></el-icon>
                    配置脱敏规则
                  </el-button>
                </div>
                
                <template v-else>
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="脱敏类型">
                        <el-select v-model="element.maskRule.type" placeholder="选择类型">
                          <el-option label="不脱敏" value="none" />
                          <el-option label="完全脱敏" value="full" />
                          <el-option label="部分脱敏" value="partial" />
                          <el-option label="正则匹配" value="regex" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    
                    <template v-if="element.maskRule.type === 'partial'">
                      <el-col :span="8">
                        <el-form-item label="起始位置">
                          <el-input-number v-model="element.maskRule.start" :min="0" />
                        </el-form-item>
                      </el-col>
                      
                      <el-col :span="8">
                        <el-form-item label="结束位置">
                          <el-input-number v-model="element.maskRule.end" :min="0" />
                        </el-form-item>
                      </el-col>
                      
                      <el-col :span="8">
                        <el-form-item label="掩码字符">
                          <el-input v-model="element.maskRule.mask" placeholder="例如: *" />
                        </el-form-item>
                      </el-col>
                    </template>
                    
                    <el-col :span="16" v-if="element.maskRule.type === 'regex'">
                      <el-form-item label="正则表达式">
                        <el-input v-model="element.maskRule.pattern" placeholder="例如: (?<=.{3}).(?=.*@)" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="8" v-if="element.maskRule.type === 'regex'">
                      <el-form-item label="掩码字符">
                        <el-input v-model="element.maskRule.mask" placeholder="例如: *" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="8" v-if="element.maskRule.type === 'full'">
                      <el-form-item label="掩码字符">
                        <el-input v-model="element.maskRule.mask" placeholder="例如: ******" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </template>
              </el-form>
            </div>
          </div>
        </template>
      </draggable>
      
      <div class="builder-actions">
        <el-button @click="resetColumns">重置</el-button>
        <el-button type="primary" @click="saveColumns">保存配置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Plus, Delete, Rank, Setting, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ResultColumn } from '@/types/lowcode'
import draggable from 'vuedraggable'

// 定义属性
const props = defineProps({
  modelValue: {
    type: Array as () => ResultColumn[],
    default: () => []
  },
  availableFields: {
    type: Array as () => any[],
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'save'])

// 本地列数据
const columns = ref<ResultColumn[]>([])

// 初始化本地数据
watch(() => props.modelValue, (newVal) => {
  columns.value = JSON.parse(JSON.stringify(newVal))
}, { immediate: true, deep: true })

// 添加列
const addColumn = () => {
  const newColumn: ResultColumn = {
    field: '',
    label: '',
    width: 150,
    fixed: false,
    sortable: true,
    visible: true
  }
  
  columns.value.push(newColumn)
}

// 删除列
const removeColumn = (index: number) => {
  columns.value.splice(index, 1)
}

// 字段变更处理
const onFieldChange = (column: ResultColumn, index: number) => {
  const field = props.availableFields.find(f => f.name === column.field)
  if (field) {
    column.label = field.label || field.name
    
    // 根据字段类型设置默认格式化规则
    const fieldType = field.dataType.toLowerCase()
    
    if (fieldType.includes('date')) {
      initFormat(column)
      column.format.type = 'date'
      column.format.pattern = 'YYYY-MM-DD'
    } else if (fieldType.includes('time')) {
      initFormat(column)
      column.format.type = 'date'
      column.format.pattern = 'HH:mm:ss'
    } else if (fieldType.includes('int') || fieldType.includes('decimal') || fieldType.includes('float')) {
      initFormat(column)
      column.format.type = 'number'
      column.format.precision = fieldType.includes('decimal') || fieldType.includes('float') ? 2 : 0
    }
    
    // 根据字段名设置特殊格式化规则
    const fieldName = column.field.toLowerCase()
    
    if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('cost')) {
      initFormat(column)
      column.format.type = 'currency'
      column.format.precision = 2
      column.format.prefix = '¥'
    } else if (fieldName.includes('percent') || fieldName.includes('rate')) {
      initFormat(column)
      column.format.type = 'percent'
      column.format.precision = 2
      column.format.suffix = '%'
    }
    
    // 设置敏感数据脱敏规则
    if (
      fieldName.includes('mobile') || 
      fieldName.includes('phone') || 
      fieldName.includes('email') || 
      fieldName.includes('card') ||
      fieldName.includes('password') ||
      fieldName.includes('id_number')
    ) {
      initMaskRule(column)
      
      if (fieldName.includes('mobile') || fieldName.includes('phone')) {
        column.maskRule.type = 'partial'
        column.maskRule.start = 3
        column.maskRule.end = 7
        column.maskRule.mask = '*'
      } else if (fieldName.includes('email')) {
        column.maskRule.type = 'regex'
        column.maskRule.pattern = '(?<=.{3}).(?=.*@)'
        column.maskRule.mask = '*'
      } else if (fieldName.includes('card')) {
        column.maskRule.type = 'partial'
        column.maskRule.start = 4
        column.maskRule.end = 12
        column.maskRule.mask = '*'
      } else if (fieldName.includes('password')) {
        column.maskRule.type = 'full'
        column.maskRule.mask = '******'
      } else if (fieldName.includes('id_number')) {
        column.maskRule.type = 'partial'
        column.maskRule.start = 6
        column.maskRule.end = 14
        column.maskRule.mask = '*'
      }
    }
  }
}

// 初始化格式化规则
const initFormat = (column: ResultColumn) => {
  if (!column.format) {
    column.format = {
      type: 'text'
    }
  }
}

// 初始化脱敏规则
const initMaskRule = (column: ResultColumn) => {
  if (!column.maskRule) {
    column.maskRule = {
      type: 'none'
    }
  }
}

// 拖拽结束处理
const onDragEnd = () => {
  // 可以在这里处理拖拽后的逻辑
}

// 重置列配置
const resetColumns = () => {
  columns.value = []
}

// 保存列配置
const saveColumns = () => {
  // 检查是否有空字段
  const emptyField = columns.value.find(c => !c.field)
  if (emptyField) {
    ElMessage.error('存在未选择字段的列，请完善配置')
    return
  }
  
  // 更新数据并发射事件
  emit('update:modelValue', columns.value)
  emit('save', columns.value)
  
  ElMessage.success('结果列配置已保存')
}
</script>

<style lang="scss" scoped>
.result-columns-builder {
  .builder-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .empty-columns {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    
    .el-button {
      margin-top: 20px;
    }
  }
  
  .column-item {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .column-header {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
      
      .column-drag-handle {
        cursor: move;
        margin-right: 10px;
        color: #909399;
      }
      
      .column-actions {
        margin-left: auto;
      }
    }
    
    .column-content {
      padding: 15px;
    }
  }
  
  .column-ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }
  
  .column-chosen {
    background: #f0f9ff;
  }
  
  .field-type {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
  }
  
  .builder-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}
</style>