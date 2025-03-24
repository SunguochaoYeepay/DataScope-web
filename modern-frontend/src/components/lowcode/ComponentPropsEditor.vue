<template>
  <div class="component-props-editor">
    <el-form :model="localProps" label-position="top">
      <!-- 公共属性 -->
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="占位符">
            <el-input v-model="localProps.placeholder" placeholder="请输入占位符文本" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- Input 输入框属性 -->
      <template v-if="componentType === 'Input'">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="清除按钮">
              <el-switch v-model="localProps.allowClear" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="显示字数">
              <el-switch v-model="localProps.showCount" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="前缀图标">
              <el-select v-model="localProps.prefixIcon" clearable placeholder="选择图标">
                <el-option 
                  v-for="icon in commonIcons" 
                  :key="icon.value"
                  :label="icon.label"
                  :value="icon.value"
                >
                  <div class="icon-option">
                    <el-icon>
                      <component :is="icon.value" />
                    </el-icon>
                    <span>{{ icon.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="后缀图标">
              <el-select v-model="localProps.suffixIcon" clearable placeholder="选择图标">
                <el-option 
                  v-for="icon in commonIcons" 
                  :key="icon.value"
                  :label="icon.label"
                  :value="icon.value"
                >
                  <div class="icon-option">
                    <el-icon>
                      <component :is="icon.value" />
                    </el-icon>
                    <span>{{ icon.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      
      <!-- TextArea 文本域属性 -->
      <template v-if="componentType === 'TextArea'">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="清除按钮">
              <el-switch v-model="localProps.allowClear" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="显示字数">
              <el-switch v-model="localProps.showCount" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最小行数">
              <el-input-number 
                v-model="localProps.autoSize.minRows" 
                :min="1" 
                :max="20" 
                @change="updateAutoSize"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="最大行数">
              <el-input-number 
                v-model="localProps.autoSize.maxRows" 
                :min="1" 
                :max="20" 
                @change="updateAutoSize"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      
      <!-- InputNumber 数字输入框属性 -->
      <template v-if="componentType === 'InputNumber'">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="最小值">
              <el-input-number v-model="localProps.min" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="最大值">
              <el-input-number v-model="localProps.max" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="步长">
              <el-input-number 
                v-model="localProps.step" 
                :min="0.001" 
                :max="1000" 
                :precision="3" 
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="精度">
              <el-input-number 
                v-model="localProps.precision" 
                :min="0" 
                :max="10" 
                :precision="0" 
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="显示控制按钮">
              <el-switch v-model="localProps.controls" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      
      <!-- Select 选择器属性 -->
      <template v-if="componentType === 'Select'">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="清除按钮">
              <el-switch v-model="localProps.allowClear" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="可搜索">
              <el-switch v-model="localProps.filterable" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="可多选">
              <el-switch v-model="localProps.multiple" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 选项列表 -->
        <el-divider content-position="left">选项列表</el-divider>
        
        <div 
          v-for="(option, index) in localProps.options" 
          :key="index"
          class="option-item"
        >
          <el-row :gutter="16">
            <el-col :span="11">
              <el-input 
                v-model="option.label" 
                placeholder="选项标签"
                @change="updateOptions"
              />
            </el-col>
            
            <el-col :span="11">
              <el-input 
                v-model="option.value" 
                placeholder="选项值"
                @change="updateOptions"
              />
            </el-col>
            
            <el-col :span="2">
              <el-button 
                type="danger" 
                circle 
                plain
                @click="removeOption(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-col>
          </el-row>
          
          <div class="option-advanced">
            <el-checkbox 
              v-model="option.disabled" 
              @change="updateOptions"
            >
              禁用
            </el-checkbox>
          </div>
        </div>
        
        <div class="option-actions">
          <el-button type="primary" plain @click="addOption">
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </div>
      </template>
      
      <!-- DatePicker 日期选择器属性 -->
      <template v-if="componentType === 'DatePicker' || componentType === 'DateTimePicker'">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="日期类型">
              <el-select v-model="localProps.type">
                <el-option label="日期" value="date" />
                <el-option label="日期范围" value="daterange" />
                <el-option label="月份" value="month" />
                <el-option label="月份范围" value="monthrange" />
                <el-option label="年份" value="year" />
                <el-option v-if="componentType === 'DateTimePicker'" label="日期时间" value="datetime" />
                <el-option v-if="componentType === 'DateTimePicker'" label="日期时间范围" value="datetimerange" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="格式">
              <el-select v-model="localProps.format">
                <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                <el-option label="YYYY年MM月DD日" value="YYYY年MM月DD日" />
                <el-option v-if="componentType === 'DateTimePicker'" label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                <el-option v-if="componentType === 'DateTimePicker'" label="YYYY-MM-DD HH:mm" value="YYYY-MM-DD HH:mm" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="清除按钮">
              <el-switch v-model="localProps.clearable" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="显示今天按钮">
              <el-switch v-model="localProps.showToday" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8" v-if="componentType === 'DateTimePicker'">
            <el-form-item label="显示时间选择">
              <el-switch v-model="localProps.showTime" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      
      <!-- 其他组件属性... -->
      
      <!-- 自定义属性 -->
      <el-divider content-position="left">自定义属性</el-divider>
      
      <div
        v-for="(value, key) in customProps"
        :key="key"
        class="custom-prop-item"
      >
        <el-row :gutter="16">
          <el-col :span="8">
            <el-input v-model="customPropKeys[key]" placeholder="属性名" @change="updateCustomProps(key)" />
          </el-col>
          
          <el-col :span="14">
            <el-input v-model="customProps[key]" placeholder="属性值" @change="updateCustomProps(key)" />
          </el-col>
          
          <el-col :span="2">
            <el-button 
              type="danger" 
              circle 
              plain
              @click="removeCustomProp(key)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <div class="custom-prop-actions">
        <el-button type="primary" plain @click="addCustomProp">
          <el-icon><Plus /></el-icon>
          添加自定义属性
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { ComponentType } from '@/types/lowcode'

// 定义属性
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  componentType: {
    type: String as () => ComponentType,
    required: true
  },
  fieldType: {
    type: String,
    default: 'string'
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 本地属性
const localProps = reactive<Record<string, any>>({
  placeholder: '',
  // Input
  allowClear: true,
  showCount: false,
  prefixIcon: '',
  suffixIcon: '',
  // TextArea
  autoSize: { minRows: 2, maxRows: 6 },
  // InputNumber
  min: undefined,
  max: undefined,
  step: 1,
  precision: 0,
  controls: true,
  // Select
  filterable: false,
  multiple: false,
  options: [],
  // DatePicker
  type: 'date',
  format: 'YYYY-MM-DD',
  clearable: true,
  showToday: true,
  showTime: false
})

// 自定义属性
const customProps = reactive<Record<string, any>>({})
const customPropKeys = reactive<Record<string, string>>({})

// 常用图标
const commonIcons = [
  { label: '搜索', value: 'Search' },
  { label: '用户', value: 'User' },
  { label: '设置', value: 'Setting' },
  { label: '日历', value: 'Calendar' },
  { label: '时钟', value: 'Clock' },
  { label: '邮件', value: 'Message' },
  { label: '电话', value: 'Phone' },
  { label: '位置', value: 'Location' },
  { label: '星标', value: 'Star' },
  { label: '信息', value: 'InfoFilled' }
]

// 监听属性变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 处理标准属性
    Object.keys(localProps).forEach(key => {
      if (newVal[key] !== undefined) {
        if (key === 'autoSize' && typeof newVal[key] === 'object') {
          localProps.autoSize = {
            minRows: newVal[key].minRows || 2,
            maxRows: newVal[key].maxRows || 6
          }
        } else {
          localProps[key] = newVal[key]
        }
      }
    })
    
    // 处理自定义属性
    Object.keys(newVal).forEach(key => {
      if (!Object.keys(localProps).includes(key)) {
        customProps[key] = newVal[key]
        customPropKeys[key] = key
      }
    })
  }
}, { immediate: true, deep: true })

// 监听本地属性变化
watch(localProps, (newVal) => {
  emitUpdate()
}, { deep: true })

// 更新autoSize
const updateAutoSize = () => {
  if (localProps.autoSize.minRows > localProps.autoSize.maxRows) {
    localProps.autoSize.maxRows = localProps.autoSize.minRows
  }
  emitUpdate()
}

// 添加选项
const addOption = () => {
  if (!localProps.options) {
    localProps.options = []
  }
  
  localProps.options.push({
    label: `选项${localProps.options.length + 1}`,
    value: `option${localProps.options.length + 1}`,
    disabled: false
  })
  
  emitUpdate()
}

// 删除选项
const removeOption = (index: number) => {
  localProps.options.splice(index, 1)
  emitUpdate()
}

// 更新选项
const updateOptions = () => {
  emitUpdate()
}

// 添加自定义属性
const addCustomProp = () => {
  const key = `prop${Object.keys(customProps).length + 1}`
  customProps[key] = ''
  customPropKeys[key] = key
}

// 删除自定义属性
const removeCustomProp = (key: string) => {
  delete customProps[key]
  delete customPropKeys[key]
  emitUpdate()
}

// 更新自定义属性
const updateCustomProps = (key: string) => {
  if (customPropKeys[key] && customPropKeys[key] !== key) {
    const newKey = customPropKeys[key]
    const value = customProps[key]
    
    delete customProps[key]
    customProps[newKey] = value
    delete customPropKeys[key]
    customPropKeys[newKey] = newKey
  }
  
  emitUpdate()
}

// 发射更新事件
const emitUpdate = () => {
  const result: Record<string, any> = {}
  
  // 添加标准属性
  Object.keys(localProps).forEach(key => {
    if (localProps[key] !== undefined && localProps[key] !== null) {
      result[key] = localProps[key]
    }
  })
  
  // 添加自定义属性
  Object.keys(customProps).forEach(key => {
    if (customProps[key] !== undefined && customProps[key] !== null && customProps[key] !== '') {
      result[customPropKeys[key] || key] = customProps[key]
    }
  })
  
  emit('update:modelValue', result)
}

// 初始化
onMounted(() => {
  // 初始化组件特定默认值
  if (props.componentType === 'InputNumber' && props.fieldType) {
    if (props.fieldType.toLowerCase().includes('int')) {
      localProps.precision = 0
      localProps.step = 1
    } else if (props.fieldType.toLowerCase().includes('decimal') || props.fieldType.toLowerCase().includes('float')) {
      localProps.precision = 2
      localProps.step = 0.1
    }
  }
  
  // 初始化Select选项
  if (props.componentType === 'Select' && (!localProps.options || localProps.options.length === 0)) {
    localProps.options = [
      { label: '选项1', value: 'option1', disabled: false },
      { label: '选项2', value: 'option2', disabled: false }
    ]
  }
  
  emitUpdate()
})
</script>

<style lang="scss" scoped>
.component-props-editor {
  .option-item {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    
    .option-advanced {
      margin-top: 8px;
    }
  }
  
  .option-actions, .custom-prop-actions {
    margin-top: 10px;
    margin-bottom: 20px;
  }
  
  .custom-prop-item {
    margin-bottom: 10px;
  }
  
  .icon-option {
    display: flex;
    align-items: center;
    
    .el-icon {
      margin-right: 8px;
    }
  }
}
</style>