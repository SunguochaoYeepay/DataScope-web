<template>
  <div class="validation-rules-editor">
    <div 
      v-for="(rule, index) in localRules" 
      :key="index"
      class="rule-item"
    >
      <el-row :gutter="16">
        <el-col :span="8">
          <el-select 
            v-model="rule.type" 
            placeholder="规则类型"
            @change="() => updateRule(index)"
          >
            <el-option 
              v-for="type in availableValidationTypes" 
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-col>
        
        <el-col :span="10" v-if="showValueInput(rule.type)">
          <component 
            :is="getValueComponent(rule.type)"
            v-model="rule.value"
            :placeholder="getValuePlaceholder(rule.type)"
            @change="() => updateRule(index)"
          />
        </el-col>
        
        <el-col :span="10" v-else>
          <el-input disabled placeholder="无需参数" />
        </el-col>
        
        <el-col :span="4">
          <el-tooltip content="删除规则" placement="top">
            <el-button 
              type="danger" 
              @click="removeRule(index)" 
              circle 
              plain
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </el-col>
      </el-row>
      
      <el-row :gutter="16" class="rule-message">
        <el-col :span="24">
          <el-input 
            v-model="rule.message" 
            placeholder="错误提示信息"
            @change="() => updateRule(index)"
          />
        </el-col>
      </el-row>
    </div>
    
    <div class="rule-actions">
      <el-button type="primary" plain @click="addRule">
        <el-icon><Plus /></el-icon>
        添加验证规则
      </el-button>
      
      <el-button v-if="localRules.length > 0" @click="clearRules" plain>
        清空规则
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { ValidationRule, ComponentType, ValidationType } from '@/types/lowcode'

// 定义属性
const props = defineProps({
  modelValue: {
    type: Array as () => ValidationRule[],
    default: () => []
  },
  componentType: {
    type: String as () => ComponentType,
    default: 'Input'
  },
  fieldType: {
    type: String,
    default: 'string'
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 本地验证规则数据
const localRules = ref<ValidationRule[]>([])

// 监听属性变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localRules.value = JSON.parse(JSON.stringify(newVal))
  } else {
    localRules.value = []
  }
}, { immediate: true, deep: true })

// 可用的验证类型
const validationTypes = [
  { label: '必填', value: 'required' },
  { label: '最小值', value: 'min' },
  { label: '最大值', value: 'max' },
  { label: '最小长度', value: 'minLength' },
  { label: '最大长度', value: 'maxLength' },
  { label: '正则表达式', value: 'pattern' },
  { label: '邮箱格式', value: 'email' },
  { label: 'URL格式', value: 'url' },
  { label: '自定义函数', value: 'custom' }
]

// 根据组件类型和字段类型过滤可用的验证类型
const availableValidationTypes = computed(() => {
  const fieldType = props.fieldType.toLowerCase()
  const componentType = props.componentType
  
  // 对于数字类型，应该使用min和max验证
  if (fieldType.includes('int') || fieldType.includes('float') || fieldType.includes('decimal') || componentType === 'InputNumber') {
    return validationTypes.filter(type => 
      !['minLength', 'maxLength', 'email', 'url'].includes(type.value)
    )
  }
  
  // 对于日期类型
  if (fieldType.includes('date') || fieldType.includes('time') || ['DatePicker', 'DateTimePicker', 'TimePicker'].includes(componentType)) {
    return validationTypes.filter(type => 
      !['minLength', 'maxLength', 'pattern', 'email', 'url'].includes(type.value)
    )
  }
  
  // 对于布尔类型
  if (fieldType === 'boolean' || componentType === 'Switch') {
    return validationTypes.filter(type => ['required'].includes(type.value))
  }
  
  // 默认返回所有验证类型
  return validationTypes
})

// 添加规则
const addRule = () => {
  const newRule: ValidationRule = {
    type: getDefaultRuleType(),
    value: getDefaultRuleValue(getDefaultRuleType()),
    message: getDefaultRuleMessage(getDefaultRuleType())
  }
  
  localRules.value.push(newRule)
  emitUpdate()
}

// 删除规则
const removeRule = (index: number) => {
  localRules.value.splice(index, 1)
  emitUpdate()
}

// 清空规则
const clearRules = () => {
  localRules.value = []
  emitUpdate()
}

// 更新规则
const updateRule = (index: number) => {
  const rule = localRules.value[index]
  
  // 如果规则类型变更，更新默认值和消息
  if (rule.value === undefined) {
    rule.value = getDefaultRuleValue(rule.type)
  }
  
  if (!rule.message) {
    rule.message = getDefaultRuleMessage(rule.type)
  }
  
  emitUpdate()
}

// 获取默认规则类型
const getDefaultRuleType = (): ValidationType => {
  const fieldType = props.fieldType.toLowerCase()
  const componentType = props.componentType
  
  if (fieldType.includes('int') || fieldType.includes('float') || fieldType.includes('decimal') || componentType === 'InputNumber') {
    return 'min'
  }
  
  if (fieldType.includes('varchar') || fieldType.includes('char') || fieldType.includes('text')) {
    return 'maxLength'
  }
  
  return 'required'
}

// 获取默认规则值
const getDefaultRuleValue = (type: ValidationType): any => {
  const fieldType = props.fieldType.toLowerCase()
  
  switch (type) {
    case 'required':
      return true
    case 'min':
      return 0
    case 'max':
      return 999999
    case 'minLength':
      return 1
    case 'maxLength':
      // 尝试从字段类型中提取长度，例如 varchar(255)
      const lengthMatch = fieldType.match(/\((\d+)\)/)
      return lengthMatch ? parseInt(lengthMatch[1]) : 255
    case 'pattern':
      return ''
    case 'email':
    case 'url':
      return true
    case 'custom':
      return 'function(value) { return true; }'
    default:
      return null
  }
}

// 获取默认规则消息
const getDefaultRuleMessage = (type: ValidationType): string => {
  switch (type) {
    case 'required':
      return '该字段不能为空'
    case 'min':
      return '不能小于最小值'
    case 'max':
      return '不能大于最大值'
    case 'minLength':
      return '长度不能小于最小长度'
    case 'maxLength':
      return '长度不能超过最大长度'
    case 'pattern':
      return '格式不符合要求'
    case 'email':
      return '请输入有效的电子邮箱'
    case 'url':
      return '请输入有效的URL'
    case 'custom':
      return '自定义验证未通过'
    default:
      return ''
  }
}

// 是否显示值输入框
const showValueInput = (type: ValidationType): boolean => {
  return type !== 'email' && type !== 'url'
}

// 获取值输入组件
const getValueComponent = (type: ValidationType): string => {
  switch (type) {
    case 'min':
    case 'max':
    case 'minLength':
    case 'maxLength':
      return 'el-input-number'
    case 'pattern':
    case 'custom':
      return 'el-input'
    case 'required':
      return 'el-switch'
    default:
      return 'el-input'
  }
}

// 获取值占位符
const getValuePlaceholder = (type: ValidationType): string => {
  switch (type) {
    case 'min':
      return '最小值'
    case 'max':
      return '最大值'
    case 'minLength':
      return '最小长度'
    case 'maxLength':
      return '最大长度'
    case 'pattern':
      return '正则表达式'
    case 'required':
      return '是否必填'
    case 'custom':
      return '自定义验证函数'
    default:
      return ''
  }
}

// 发送更新事件
const emitUpdate = () => {
  emit('update:modelValue', localRules.value)
}
</script>

<style lang="scss" scoped>
.validation-rules-editor {
  .rule-item {
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    
    .rule-message {
      margin-top: 8px;
    }
  }
  
  .rule-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
}
</style>