<template>
  <div
    ref="editorContainer"
    class="monaco-editor-container"
    :style="{ height }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';
import { debounce } from 'lodash-es';

interface Props {
  modelValue?: string;
  language?: string;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  height?: string;
  width?: string;
  readOnly?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
  showFindWidget?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'ready', editor: monaco.editor.IStandaloneCodeEditor): void;
  (e: 'format', value: string): void;
  (e: 'save', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  theme: 'vs',
  height: '300px',
  width: '100%',
  readOnly: false,
  formatOnPaste: true,
  formatOnType: false,
  showFindWidget: true,
});

const emit = defineEmits<Emits>();

const editorContainer = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor;

// 创建编辑器
const createEditor = () => {
  if (!editorContainer.value) return;

  // 基础配置
  const baseOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    folding: true,
    foldingStrategy: 'indentation',
    formatOnPaste: props.formatOnPaste,
    formatOnType: props.formatOnType,
    readOnly: props.readOnly,
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'selection',
    },
    ...props.options,
  };

  // 创建编辑器实例
  editor = monaco.editor.create(editorContainer.value, baseOptions);

  // 监听内容变化
  const debouncedEmit = debounce((value: string) => {
    emit('update:modelValue', value);
    emit('change', value);
  }, 300);

  editor.onDidChangeModelContent(() => {
    const value = editor.getValue();
    debouncedEmit(value);
  });

  // 通知编辑器已就绪
  emit('ready', editor);
};

// 销毁编辑器
const disposeEditor = () => {
  if (editor) {
    editor.dispose();
  }
};

// 更新编辑器内容
const updateContent = () => {
  if (editor) {
    const value = editor.getValue();
    if (value !== props.modelValue) {
      editor.setValue(props.modelValue);
    }
  }
};

// 更新编辑器配置
const updateOptions = () => {
  if (editor) {
    editor.updateOptions(props.options || {});
  }
};

// 格式化代码
const formatCode = () => {
  if (editor) {
    editor.getAction('editor.action.formatDocument')?.run();
    const formattedValue = editor.getValue();
    emit('format', formattedValue);
  }
};

// 保存代码
const saveCode = () => {
  if (editor) {
    const value = editor.getValue();
    emit('save', value);
  }
};

// 显示/隐藏查找框
const toggleFindWidget = () => {
  if (editor) {
    editor.getAction('actions.find')?.run();
  }
};

// 监听属性变化
watch(() => props.modelValue, updateContent);
watch(() => props.options, updateOptions, { deep: true });
watch(() => props.language, (newLang) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel()!, newLang);
  }
});
watch(() => props.theme, (newTheme) => {
  monaco.editor.setTheme(newTheme);
});

// 组件挂载
onMounted(() => {
  createEditor();
  
  // 添加快捷键
  if (editor) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveCode();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      if (props.showFindWidget) {
        toggleFindWidget();
      }
    });
    
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      formatCode();
    });
  }
});

// 组件卸载
onBeforeUnmount(() => {
  disposeEditor();
});

// 暴露编辑器实例和方法
defineExpose({
  editor: () => editor,
  format: formatCode,
  save: saveCode,
  toggleFind: toggleFindWidget,
});
</script>

<style lang="scss" scoped>
.monaco-editor-container {
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  overflow: hidden;

  :deep(.monaco-editor) {
    .margin {
      background: #f5f5f5;
    }
  }
}
</style>