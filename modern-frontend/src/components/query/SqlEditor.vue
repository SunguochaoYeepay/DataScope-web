<template>
  <div class="sql-editor-container" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-tooltip content="执行查询 (Ctrl+Enter)" placement="top">
          <el-button type="primary" size="small" @click="executeQuery" :disabled="disabled || !sqlValue.trim()" :loading="loading">
            <el-icon><CaretRight /></el-icon>
            执行
          </el-button>
        </el-tooltip>
        <el-button size="small" @click="formatSQL" :disabled="disabled || !sqlValue.trim()">
          <el-icon><Operation /></el-icon>
          格式化
        </el-button>
        <el-button size="small" @click="handleClear" :disabled="disabled || !sqlValue.trim()">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏编辑'" placement="top">
          <el-button size="small" @click="toggleFullscreen" :disabled="disabled">
            <el-icon><FullScreen v-if="!isFullscreen" /><Minus v-else /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div class="editor-main" ref="editorContainer">
      <!-- 使用v-show而不是v-if确保编辑器实例不会被销毁重建 -->
      <div class="editor-wrapper" v-show="!disabled"></div>
      <!-- 当编辑器被禁用时显示纯文本 -->
      <div class="editor-disabled" v-show="disabled">
        <pre>{{ sqlValue }}</pre>
      </div>
    </div>
    
    <div class="editor-footer">
      <div class="editor-status">
        <span v-if="charCount">字符数: {{ charCount }}</span>
        <span v-if="rowCount">行数: {{ rowCount }}</span>
      </div>
      <div class="editor-hints">
        <el-tag v-if="loading" type="info" size="small">查询执行中...</el-tag>
        <el-tag v-else-if="error" type="danger" size="small">{{ error }}</el-tag>
        <el-tag v-else-if="success" type="success" size="small">{{ success }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits, nextTick } from 'vue'
import { CaretRight, Operation, Delete, FullScreen, Minus } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
// 动态导入monaco编辑器
import * as monaco from 'monaco-editor'
// SQL格式化库
import sqlFormatter from 'sql-formatter'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  autoFocus: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: String,
    default: '请输入SQL查询...',
  },
  height: {
    type: String,
    default: '300px',
  },
  language: {
    type: String,
    default: 'sql',
  },
  theme: {
    type: String,
    default: 'vs', // 'vs', 'vs-dark', 'hc-black'
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  error: {
    type: String,
    default: '',
  },
  success: {
    type: String,
    default: '',
  }
})

const emit = defineEmits([
  'update:modelValue',
  'execute',
  'change',
  'format',
  'clear',
])

const sqlValue = ref(props.modelValue)
const editor = ref<monaco.editor.IStandaloneCodeEditor | null>(null)
const editorContainer = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const charCount = ref(0)
const rowCount = ref(0)

// 监听值的变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== sqlValue.value) {
    sqlValue.value = newValue
    if (editor.value) {
      editor.value.setValue(newValue)
    }
  }
}, { immediate: true })

// 监听禁用状态变化
watch(() => props.disabled, (newValue) => {
  if (editor.value) {
    editor.value.updateOptions({ readOnly: newValue })
  }
}, { immediate: true })

// 初始化编辑器
onMounted(async () => {
  await nextTick()
  const container = editorContainer.value?.querySelector('.editor-wrapper')
  if (!container) return
  
  // 基础配置
  const defaultOptions = {
    value: sqlValue.value,
    language: props.language,
    theme: props.theme,
    readOnly: props.disabled,
    minimap: { enabled: true },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    contextmenu: true,
    lineNumbers: 'on',
    folding: true,
    roundedSelection: true,
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    suggestOnTriggerCharacters: true
  }
  
  // 创建编辑器实例
  editor.value = monaco.editor.create(container as HTMLElement, {
    ...defaultOptions,
    ...props.options,
  })
  
  // 自动聚焦
  if (props.autoFocus && !props.disabled) {
    editor.value.focus()
  }
  
  // 设置高度
  updateEditorHeight()
  
  // 编辑器内容变化事件
  editor.value.onDidChangeModelContent(() => {
    if (editor.value) {
      const value = editor.value.getValue()
      sqlValue.value = value
      emit('update:modelValue', value)
      emit('change', value)
      
      // 更新统计信息
      updateStats()
    }
  })
  
  // 执行快捷键: Ctrl+Enter
  editor.value.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    if (!props.disabled && sqlValue.value.trim()) {
      executeQuery()
    }
  })
  
  // 初始设置占位符
  if (!sqlValue.value && props.placeholder) {
    setPlaceholder()
  }
  
  // 初始化统计信息
  updateStats()
})

// 组件销毁前清理
onUnmounted(() => {
  if (editor.value) {
    editor.value.dispose()
  }
})

// 设置编辑器高度
const updateEditorHeight = () => {
  if (editor.value && editorContainer.value) {
    const containerHeight = isFullscreen.value
      ? window.innerHeight - 120  // 全屏时减去工具栏和状态栏的高度
      : props.height ? props.height : '300px'
    
    editorContainer.value.style.height = typeof containerHeight === 'number'
      ? `${containerHeight}px`
      : containerHeight
    
    editor.value.layout()
  }
}

// 切换全屏显示
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  // 等DOM更新后调整编辑器尺寸
  nextTick(() => {
    updateEditorHeight()
    if (editor.value) {
      editor.value.layout()
      editor.value.focus()
    }
  })
}

// 统计字符数和行数
const updateStats = () => {
  if (editor.value) {
    const content = editor.value.getValue()
    charCount.value = content.length
    rowCount.value = content.split('\n').length
  }
}

// 设置占位符
const setPlaceholder = () => {
  if (editor.value && props.placeholder) {
    const placeholderDecoration = editor.value.createDecorationsCollection([{
      range: new monaco.Range(1, 1, 1, 1),
      options: {
        isWholeLine: true,
        className: 'sql-editor-placeholder',
        glyphMarginClassName: 'sql-editor-placeholder',
        hoverMessage: { value: '' }
      }
    }])
    
    // 当输入内容时，删除占位符
    editor.value.onDidChangeModelContent(() => {
      const content = editor.value?.getValue() || ''
      if (content && placeholderDecoration) {
        placeholderDecoration.clear()
      }
    })
  }
}

// 执行SQL查询
const executeQuery = () => {
  if (props.disabled || !sqlValue.value.trim()) return
  
  // 将当前SQL传递给父组件处理
  emit('execute', sqlValue.value)
}

// 格式化SQL
const formatSQL = () => {
  if (props.disabled || !sqlValue.value.trim()) return
  
  try {
    const formatted = sqlFormatter.format(sqlValue.value, {
      language: 'mysql', // 可以根据需要选择不同的SQL方言
      tabWidth: 2,
      uppercaseKeywords: true,
      linesBetweenQueries: 2
    })
    
    if (editor.value) {
      editor.value.setValue(formatted)
      emit('update:modelValue', formatted)
      emit('format', formatted)
      ElMessage.success('SQL格式化成功')
    }
  } catch (error) {
    console.error('SQL格式化失败:', error)
    ElMessage.error('SQL格式化失败，请检查SQL语法')
  }
}

// 清空编辑器
const handleClear = () => {
  if (props.disabled) return
  
  ElMessageBox.confirm('确定要清空当前SQL吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (editor.value) {
      editor.value.setValue('')
      sqlValue.value = ''
      emit('update:modelValue', '')
      emit('clear')
      ElMessage.success('已清空')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 外部方法 - 可以被父组件调用
defineExpose({
  focus: () => editor.value?.focus(),
  setValue: (value: string) => {
    sqlValue.value = value
    editor.value?.setValue(value)
  },
  getValue: () => editor.value?.getValue() || '',
  formatSQL,
  executeQuery,
  clearContent: handleClear,
  getEditor: () => editor.value
})
</script>

<style lang="scss" scoped>
.sql-editor-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
  
  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background-color: #fff;
    border: none;
    border-radius: 0;
  }
  
  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    
    .toolbar-left {
      display: flex;
      gap: 8px;
    }
    
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }
  
  .editor-main {
    flex: 1;
    overflow: hidden;
    position: relative;
    height: v-bind('props.height');
    
    .editor-wrapper {
      width: 100%;
      height: 100%;
    }
    
    .editor-disabled {
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 10px;
      background-color: #f8f9fb;
      
      pre {
        margin: 0;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        font-size: 14px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
  
  .editor-footer {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
    background-color: #f5f7fa;
    border-top: 1px solid #dcdfe6;
    font-size: 12px;
    color: #909399;
    
    .editor-status {
      display: flex;
      gap: 10px;
    }
  }
}

/* 编辑器占位符样式 */
:deep(.sql-editor-placeholder) {
  &::before {
    content: attr(data-placeholder);
    color: #999;
    position: absolute;
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>