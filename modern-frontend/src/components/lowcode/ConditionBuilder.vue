<template>
  <div class="condition-builder">
    <el-card class="builder-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>查询条件配置</span>
          <div class="header-actions">
            <el-tooltip content="添加条件" placement="top">
              <el-button type="primary" @click="addCondition" size="small">
                <el-icon><Plus /></el-icon>
                添加条件
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>
      
      <div v-if="conditions.length === 0" class="empty-conditions">
        <el-empty description="暂无查询条件" />
        <el-button type="primary" @click="addCondition">
          <el-icon><Plus /></el-icon>
          添加条件
        </el-button>
      </div>
      
      <draggable
        v-else
        v-model="conditions"
        item-key="field"
        handle=".condition-drag-handle"
        ghost-class="condition-ghost"
        chosen-class="condition-chosen"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
          <div class="condition-item">
            <div class="condition-header">
              <el-icon class="condition-drag-handle"><Rank /></el-icon>
              <span>条件 {{ index + 1 }}</span>
              <div class="condition-actions">
                <el-tooltip content="删除条件" placement="top">
                  <el-button 
                    type="danger" 
                    @click="removeCondition(index)" 
                    size="small" 
                    circle 
                    plain
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            
            <div class="condition-content">
              <el-form :model="element" label-position="top">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="字段">
                      <el-select 
                        v-model="element.field" 
                        filterable 
                        placeholder="选择字段"
                        @change="onFieldChange(element, index)"
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
                  <el-col :span="12">
                    <el-form-item label="组件类型">
                      <el-select 
                        v-model="element.component" 
                        placeholder="选择组件类型"
                        @change="onComponentChange(element)"
                      >
                        <el-option
                          v-for="component in getAvailableComponents(element.field)"
                          :key="component.value"
                          :label="component.label"
                          :value="component.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="12">
                    <el-form-item label="默认值">
                      <component
                        :is="getComponentForDefaultValue(element.component)"
                        v-model="element.defaultValue"
                        :placeholder="`设置默认值`"
                        :options="element.props?.options"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label=" ">
                      <el-checkbox v-model="element.required">必填</el-checkbox>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-form-item label=" ">
                      <el-checkbox v-model="element.visible" :true-label="true" :false-label="false">显示</el-checkbox>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-form-item label="排序">
                      <el-input-number v-model="element.order" :min="1" :max="100" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-divider content-position="left">组件属性</el-divider>
                
                <component-props-editor
                  v-model="element.props"
                  :component-type="element.component"
                  :field-type="getFieldType(element.field)"
                />
                
                <el-divider content-position="left">验证规则</el-divider>
                
                <validation-rules-editor
                  v-model="element.validations"
                  :component-type="element.component"
                  :field-type="getFieldType(element.field)"
                />
                
                <el-divider content-position="left">条件依赖</el-divider>
                
                <el-form-item label="依赖字段">
                  <el-select
                    v-model="element.dependencyFields"
                    multiple
                    filterable
                    placeholder="选择依赖字段"
                  >
                    <el-option
                      v-for="field in availableFields.filter(f => f.name !== element.field)"
                      :key="field.name"
                      :label="field.label || field.name"
                      :value="field.name"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item
                  v-if="element.dependencyFields && element.dependencyFields.length > 0"
                  label="显示条件"
                >
                  <el-input
                    v-model="element.showWhen"
                    placeholder="JavaScript条件表达式，例如: field1 === 'value'"
                    type="textarea"
                    :rows="2"
                  />
                  <div class="condition-hint">
                    可使用的字段: {{ element.dependencyFields.join(', ') }}
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </template>
      </draggable>
      
      <div class="builder-actions">
        <el-button @click="resetConditions">重置</el-button>
        <el-button type="primary" @click="saveConditions">保存配置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Plus, Delete, Rank } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ConditionField, ComponentType, ValidationRule } from '@/types/lowcode'
import draggable from 'vuedraggable'
import ComponentPropsEditor from './ComponentPropsEditor.vue'
import ValidationRulesEditor from './ValidationRulesEditor.vue'

// 定义属性
const props = defineProps({
  modelValue: {
    type: Array as () => ConditionField[],
    default: () => []
  },
  availableFields: {
    type: Array as () => any[],
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'save'])

// 本地查询条件数据
const conditions = ref<ConditionField[]>([])

// 初始化本地数据
watch(() => props.modelValue, (newVal) => {
  conditions.value = JSON.parse(JSON.stringify(newVal))
}, { immediate: true, deep: true })

// 添加条件
const addCondition = () => {
  const newCondition: ConditionField = {
    field: '',
    label: '',
    component: 'Input',
    required: false,
    defaultValue: null,
    order: conditions.value.length + 1,
    visible: true,
    props: {},
    validations: [],
    dependencyFields: []
  }
  
  conditions.value.push(newCondition)
}

// 删除条件
const removeCondition = (index: number) => {
  conditions.value.splice(index, 1)
  
  // 更新排序
  conditions.value.forEach((cond, idx) => {
    cond.order = idx + 1
  })
}

// 获取字段类型
const getFieldType = (fieldName: string) => {
  const field = props.availableFields.find(f => f.name === fieldName)
  return field ? field.dataType : 'string'
}

// 根据字段类型获取可用组件
const getAvailableComponents = (fieldName: string) => {
  const fieldType = getFieldType(fieldName)
  
  const components = [
    { label: '输入框', value: 'Input' },
    { label: '文本域', value: 'TextArea' },
    { label: '数字输入', value: 'InputNumber' },
    { label: '下拉选择', value: 'Select' },
    { label: '日期选择', value: 'DatePicker' },
    { label: '日期时间选择', value: 'DateTimePicker' },
    { label: '时间选择', value: 'TimePicker' },
    { label: '开关', value: 'Switch' },
    { label: '单选框', value: 'Radio' },
    { label: '复选框', value: 'Checkbox' },
    { label: '滑块', value: 'Slider' },
    { label: '颜色选择器', value: 'ColorPicker' },
    { label: '级联选择', value: 'Cascader' },
    { label: '树形选择', value: 'TreeSelect' }
  ]
  
  // 根据字段类型过滤出适合的组件
  if (fieldType.toLowerCase().includes('int') || 
      fieldType.toLowerCase().includes('float') || 
      fieldType.toLowerCase().includes('double') || 
      fieldType.toLowerCase().includes('decimal')) {
    return components.filter(c => ['InputNumber', 'Slider', 'Select', 'Radio'].includes(c.value))
  } else if (fieldType.toLowerCase().includes('date') || fieldType.toLowerCase().includes('time')) {
    return components.filter(c => ['DatePicker', 'DateTimePicker', 'TimePicker', 'Input'].includes(c.value))
  } else if (fieldType.toLowerCase() === 'boolean' || fieldType.toLowerCase() === 'tinyint(1)') {
    return components.filter(c => ['Switch', 'Radio', 'Select'].includes(c.value))
  } else if (fieldType.toLowerCase().includes('text')) {
    return components.filter(c => ['TextArea', 'Input', 'Select'].includes(c.value))
  } else if (fieldType.toLowerCase().includes('enum')) {
    return components.filter(c => ['Select', 'Radio', 'Input'].includes(c.value))
  }
  
  return components
}

// 获取默认值组件类型
const getComponentForDefaultValue = (componentType: ComponentType) => {
  const componentMap: Record<ComponentType, string> = {
    'Input': 'el-input',
    'TextArea': 'el-input',
    'InputNumber': 'el-input-number',
    'Select': 'el-select',
    'DatePicker': 'el-date-picker',
    'DateTimePicker': 'el-date-picker',
    'TimePicker': 'el-time-picker',
    'Switch': 'el-switch',
    'Radio': 'el-radio-group',
    'Checkbox': 'el-checkbox-group',
    'Slider': 'el-slider',
    'ColorPicker': 'el-color-picker',
    'Cascader': 'el-cascader',
    'TreeSelect': 'el-tree-select',
    'Upload': 'el-input'
  }
  
  return componentMap[componentType] || 'el-input'
}

// 拖拽结束后更新排序
const onDragEnd = () => {
  conditions.value.forEach((cond, idx) => {
    cond.order = idx + 1
  })
}

// 字段变更
const onFieldChange = (condition: ConditionField, index: number) => {
  const field = props.availableFields.find(f => f.name === condition.field)
  if (field) {
    condition.label = field.label || field.name
    
    // 根据字段类型推荐默认组件
    const fieldType = field.dataType.toLowerCase()
    if (fieldType.includes('int') || fieldType.includes('decimal') || fieldType.includes('float')) {
      condition.component = 'InputNumber'
    } else if (fieldType.includes('date')) {
      condition.component = 'DatePicker'
    } else if (fieldType.includes('time')) {
      condition.component = 'TimePicker'
    } else if (fieldType === 'boolean' || fieldType === 'tinyint(1)') {
      condition.component = 'Switch'
    } else if (fieldType.includes('text')) {
      condition.component = 'TextArea'
    } else if (fieldType.includes('enum')) {
      condition.component = 'Select'
    } else {
      condition.component = 'Input'
    }
    
    // 重置属性和验证规则
    condition.props = {}
    condition.validations = []
    
    // 添加默认验证规则
    if (fieldType.includes('varchar') || fieldType.includes('char')) {
      const length = parseInt(fieldType.match(/\d+/)?.[0] || '255')
      condition.validations.push({
        type: 'maxLength',
        value: length,
        message: `最大长度为${length}个字符`
      })
    }
  }
}

// 组件类型变更
const onComponentChange = (condition: ConditionField) => {
  // 重置属性
  condition.props = {}
  
  // 设置组件默认属性
  switch (condition.component) {
    case 'Input':
      condition.props = {
        allowClear: true,
        placeholder: `请输入${condition.label}`
      }
      break
    case 'TextArea':
      condition.props = {
        allowClear: true,
        placeholder: `请输入${condition.label}`,
        autoSize: { minRows: 2, maxRows: 6 }
      }
      break
    case 'Select':
      condition.props = {
        allowClear: true,
        placeholder: `请选择${condition.label}`,
        options: []
      }
      break
    case 'DatePicker':
      condition.props = {
        type: 'date',
        placeholder: `请选择${condition.label}`,
        format: 'YYYY-MM-DD'
      }
      break
    case 'DateTimePicker':
      condition.props = {
        type: 'datetime',
        placeholder: `请选择${condition.label}`,
        format: 'YYYY-MM-DD HH:mm:ss'
      }
      break
    // 其他组件类型的默认属性...
  }
  
  // 重置默认值
  condition.defaultValue = null
}

// 重置条件
const resetConditions = () => {
  conditions.value = []
}

// 保存条件
const saveConditions = () => {
  // 检查是否有空字段
  const emptyField = conditions.value.find(c => !c.field)
  if (emptyField) {
    ElMessage.error('存在未选择字段的条件，请完善配置')
    return
  }
  
  // 检查字段是否重复
  const fieldNames = conditions.value.map(c => c.field)
  const hasDuplicate = fieldNames.some((field, index) => fieldNames.indexOf(field) !== index)
  if (hasDuplicate) {
    ElMessage.error('存在重复的字段，请检查配置')
    return
  }
  
  // 按照order排序
  const sortedConditions = [...conditions.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  
  // 更新数据并发射事件
  emit('update:modelValue', sortedConditions)
  emit('save', sortedConditions)
  
  ElMessage.success('查询条件配置已保存')
}
</script>

<style lang="scss" scoped>
.condition-builder {
  .builder-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .empty-conditions {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    
    .el-button {
      margin-top: 20px;
    }
  }
  
  .condition-item {
    margin-bottom: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .condition-header {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
      
      .condition-drag-handle {
        cursor: move;
        margin-right: 10px;
        color: #909399;
      }
      
      .condition-actions {
        margin-left: auto;
      }
    }
    
    .condition-content {
      padding: 15px;
    }
  }
  
  .condition-ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }
  
  .condition-chosen {
    background: #f0f9ff;
  }
  
  .field-type {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
  }
  
  .condition-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
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