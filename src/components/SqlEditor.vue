<template>
  <div class="sql-editor">
    <div class="sql-editor-toolbar">
      <a-space>
        <a-tooltip title="执行 (F8)">
          <a-button type="primary" :loading="executing" @click="executeQuery">
            <template #icon><PlayCircleOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="格式化 (Alt+F)">
          <a-button @click="formatSQL">
            <template #icon><AlignLeftOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="注释 (Ctrl+/)">
          <a-button @click="toggleComment">
            <template #icon><CommentOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="查找 (Ctrl+F)">
          <a-button @click="toggleFind">
            <template #icon><SearchOutlined /></template>
          </a-button>
        </a-tooltip>
      </a-space>
    </div>
    
    <MonacoEditor
      ref="monacoRef"
      v-model="sqlContent"
      language="sql"
      :height="height"
      :options="editorOptions"
      @change="handleChange"
      @ready="handleEditorReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type * as Monaco from 'monaco-editor';
import MonacoEditor from './MonacoEditor.vue';
import { PlayCircleOutlined, AlignLeftOutlined, CommentOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import * as monaco from 'monaco-editor';
import { useQueryStore } from '@/stores/query';

// Props 定义
const props = defineProps<{
  modelValue: string;
  height?: string;
  readOnly?: boolean;
  autoComplete?: boolean;
  datasourceId?: string;
}>();

// Emits 定义
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'execute', sql: string): void;
}>();

// 编辑器引用
const monacoRef = ref<InstanceType<typeof MonacoEditor>>();
const executing = ref(false);

// SQL 内容
const sqlContent = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 编辑器配置
const editorOptions = computed<Monaco.editor.IStandaloneEditorConstructionOptions>(() => ({
  readOnly: props.readOnly,
  minimap: { enabled: true },
  lineNumbers: 'on' as const,
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  fontSize: 14,
  tabSize: 2,
  suggestOnTriggerCharacters: props.autoComplete,
}));

// 查询 store
const queryStore = useQueryStore();

// SQL 关键字提示
const setupSQLCompletion = (monacoInstance: typeof Monaco) => {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN',
    'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE',
    'ALTER TABLE', 'DROP TABLE', 'TRUNCATE TABLE',
    'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL',
    'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT',
    'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
    'ASC', 'DESC', 'LIMIT', 'OFFSET'
  ];

  const functions = [
    'COALESCE', 'NULLIF', 'CAST', 'CONVERT',
    'UPPER', 'LOWER', 'TRIM', 'LTRIM', 'RTRIM',
    'SUBSTRING', 'CONCAT', 'LENGTH', 'REPLACE',
    'ROUND', 'CEIL', 'FLOOR', 'ABS',
    'NOW', 'CURRENT_TIMESTAMP', 'DATE', 'DATEADD',
    'DATEDIFF', 'YEAR', 'MONTH', 'DAY',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
  ];

  monacoInstance.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        ...keywords.map(keyword => ({
          label: keyword,
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          detail: '关键字',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        })),
        ...functions.map(func => ({
          label: func,
          kind: monacoInstance.languages.CompletionItemKind.Function,
          insertText: func,
          detail: '函数',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        }))
      ];
      return { suggestions };
    },
  });
};

// 执行 SQL
const executeQuery = async () => {
  const editor = monacoRef.value?.editor();
  if (!editor) return;
  
  const selection = editor.getSelection();
  const sql = selection && !selection.isEmpty()
    ? editor.getModel()?.getValueInRange(selection)
    : sqlContent.value;

  if (!sql?.trim()) {
    message.warning('请输入 SQL 语句');
    return;
  }

  executing.value = true;
  try {
    // 设置数据源
    if (props.datasourceId) {
      queryStore.setSelectedDatasource(props.datasourceId);
    }
    
    // 执行查询
    await queryStore.execute(sql);
  } finally {
    executing.value = false;
  }
};

// 格式化 SQL
const formatSQL = () => {
  monacoRef.value?.format();
};

// 切换注释
const toggleComment = () => {
  const editor = monacoRef.value?.editor();
  if (editor) {
    editor.getAction('editor.action.commentLine')?.run();
  }
};

// 切换查找框
const toggleFind = () => {
  monacoRef.value?.toggleFind();
};

// 处理编辑器内容变化
const handleChange = debounce((value: string) => {
  emit('change', value);
}, 300);

// 编辑器就绪
const handleEditorReady = (editor: Monaco.editor.IStandaloneCodeEditor) => {
  // 添加快捷键
  editor.addCommand(monaco.KeyCode.F8, executeQuery);
};

// 组件挂载
onMounted(() => {
  if (props.autoComplete && monacoRef.value?.editor()) {
    setupSQLCompletion(monaco);
  }
});

// 暴露方法
defineExpose({
  format: formatSQL,
  execute: executeQuery,
  editor: () => monacoRef.value?.editor(),
});
</script>

<style lang="scss" scoped>
.sql-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  
  .sql-editor-toolbar {
    padding: 8px;
    background-color: #fafafa;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
  }
}
</style>