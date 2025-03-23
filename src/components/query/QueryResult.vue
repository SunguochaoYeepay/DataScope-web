<template>
  <div class="query-result">
    <!-- 结果统计信息 -->
    <div class="query-result-stats">
      <a-space>
        <a-tag color="blue">执行时间: {{ formatExecutionTime }}</a-tag>
        <a-tag v-if="result?.affectedRows !== undefined" color="green">
          影响行数: {{ result.affectedRows }}
        </a-tag>
        <a-tag v-if="result?.total !== undefined" color="purple">
          总行数: {{ result.total }}
        </a-tag>
      </a-space>
      
      <a-space>
        <a-tooltip title="导出 CSV">
          <a-button @click="exportCSV">
            <template #icon><DownloadOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="复制为 JSON">
          <a-button @click="copyAsJSON">
            <template #icon><CopyOutlined /></template>
          </a-button>
        </a-tooltip>
      </a-space>
    </div>

    <!-- 结果表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :scroll="{ x: 'max-content', y: tableHeight }"
      size="small"
      :pagination="pagination"
      @change="handleTableChange"
      :loading="loading"
    >
      <!-- 自定义列渲染 -->
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex">
          <div :class="getCellClass(text)">
            <template v-if="isJSON(text)">
              <a-typography-paragraph :copyable="{ text: JSON.stringify(text, null, 2) }">
                <pre>{{ JSON.stringify(text, null, 2) }}</pre>
              </a-typography-paragraph>
            </template>
            <template v-else>
              {{ formatCellValue(text) }}
            </template>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { QueryResult } from '@/api/query';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const props = defineProps<{
  result: QueryResult | null;
  loading?: boolean;
  height?: string | number;
}>();

// 表格高度计算
const tableHeight = computed(() => {
  if (typeof props.height === 'number') {
    return props.height - 56; // 减去统计栏高度
  }
  return 400; // 默认高度
});

// 分页配置
const pagination = ref<TablePaginationConfig>({
  current: 1,
  pageSize: 100,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 表格列定义
const columns = computed(() => {
  if (!props.result?.columns) return [];
  return props.result.columns.map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
    ellipsis: true,
    width: 200,
    sorter: true,
  }));
});

// 表格数据源
const dataSource = computed(() => {
  if (!props.result?.rows) return [];
  return props.result.rows.map((row, index) => ({
    key: index,
    ...row,
  }));
});

// 执行时间格式化
const formatExecutionTime = computed(() => {
  const time = props.result?.executionTime || 0;
  return time < 1000 
    ? `${time}ms`
    : `${(time / 1000).toFixed(2)}s`;
});

// 处理表格变化
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = pag;
};

// 格式化单元格值
const formatCellValue = (value: any): string => {
  if (value === null) return 'NULL';
  if (value === undefined) return '';
  if (value instanceof Date) return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

// 判断是否为 JSON 对象
const isJSON = (value: any): boolean => {
  return typeof value === 'object' && value !== null;
};

// 获取单元格样式
const getCellClass = (value: any): string => {
  if (value === null) return 'cell-null';
  if (typeof value === 'number') return 'cell-number';
  if (typeof value === 'boolean') return 'cell-boolean';
  if (value instanceof Date) return 'cell-date';
  return '';
};

// 导出为 CSV
const exportCSV = () => {
  if (!props.result?.rows || !props.result?.columns) {
    message.warning('没有可导出的数据');
    return;
  }

  const headers = props.result.columns.join(',');
  const rows = props.result.rows.map(row => 
    props.result!.columns.map(col => {
      const value = row[col];
      if (value === null) return 'NULL';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }).join(',')
  );

  const csv = [headers, ...rows].join('\\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `query-result-${dayjs().format('YYYYMMDDHHmmss')}.csv`;
  saveAs(blob, filename);
};

// 复制为 JSON
const copyAsJSON = () => {
  if (!props.result?.rows) {
    message.warning('没有可复制的数据');
    return;
  }

  const json = JSON.stringify(props.result.rows, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    message.success('已复制到剪贴板');
  });
};

// 监听结果变化，重置分页
watch(() => props.result, () => {
  pagination.value.current = 1;
});
</script>

<style lang="scss" scoped>
.query-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  
  .query-result-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background-color: #fafafa;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
  }
  
  :deep(.cell-null) {
    color: #999;
    font-style: italic;
  }
  
  :deep(.cell-number) {
    font-family: monospace;
    text-align: right;
  }
  
  :deep(.cell-boolean) {
    font-weight: 500;
  }
  
  :deep(.cell-date) {
    font-family: monospace;
  }
  
  :deep(.ant-table-cell) {
    vertical-align: top;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>