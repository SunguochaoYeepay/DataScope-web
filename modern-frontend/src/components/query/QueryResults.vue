<template>
  <div class="query-results-container">
    <div class="results-header">
      <div class="results-stats">
        <template v-if="results && results.rows">
          <el-tag type="info" size="small">共 {{ results.rows.length }} 条记录</el-tag>
          <el-tag type="info" size="small">查询耗时: {{ results.executionTime || '未知' }}ms</el-tag>
        </template>
      </div>
      <div class="results-actions">
        <el-button-group>
          <el-tooltip content="导出CSV" placement="top">
            <el-button type="primary" size="small" :icon="Download" @click="exportCSV" :disabled="!canExport"/>
          </el-tooltip>
          <el-tooltip content="导出Excel" placement="top">
            <el-button type="success" size="small" :icon="Document" @click="exportExcel" :disabled="!canExport"/>
          </el-tooltip>
          <el-tooltip content="复制为JSON" placement="top">
            <el-button type="info" size="small" :icon="CopyDocument" @click="copyAsJSON" :disabled="!canExport"/>
          </el-tooltip>
        </el-button-group>
      </div>
    </div>
    
    <div class="results-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="results-loading">
        <el-skeleton :rows="10" animated />
      </div>
      
      <!-- 错误信息 -->
      <div v-else-if="error" class="results-error">
        <el-alert
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
      </div>
      
      <!-- 空数据状态 -->
      <div v-else-if="!results || !results.rows || results.rows.length === 0" class="results-empty">
        <el-empty description="暂无数据" />
      </div>
      
      <!-- 数据表格 -->
      <el-table
        v-else
        :data="results.rows"
        border
        stripe
        style="width: 100%"
        height="100%"
        :max-height="maxHeight"
        :cell-class-name="cellClassName"
        table-layout="auto"
      >
        <!-- 表格列 - 动态生成 -->
        <el-table-column
          v-for="column in results.columns"
          :key="column.name"
          :prop="column.name"
          :label="column.label || column.name"
          :width="getColumnWidth(column)"
          :sortable="column.sortable !== false"
          :formatter="column.formatter"
          show-overflow-tooltip
        >
          <template #default="scope">
            <span v-if="isNull(scope.row[column.name])">NULL</span>
            <span v-else-if="isBoolean(scope.row[column.name])">
              {{ scope.row[column.name] ? 'TRUE' : 'FALSE' }}
            </span>
            <span v-else>{{ scope.row[column.name] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch } from 'vue'
import { Document, Download, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

// 列定义接口
interface ColumnDefinition {
  name: string
  label?: string
  type?: string
  width?: number | string
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => any
}

// 查询结果接口
interface QueryResult {
  columns: ColumnDefinition[]
  rows: Record<string, any>[]
  executionTime?: number
  sql?: string
  affectedRows?: number
  timestamp?: number
}

const props = defineProps({
  results: {
    type: Object as () => QueryResult | null,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  maxHeight: {
    type: [String, Number],
    default: '100%'
  }
})

const emit = defineEmits(['export'])

// 计算属性: 是否可以导出数据
const canExport = computed(() => {
  return props.results?.rows && props.results.rows.length > 0
})

// 判断值是否为null或undefined
const isNull = (value: any): boolean => {
  return value === null || value === undefined
}

// 判断值是否为布尔类型
const isBoolean = (value: any): boolean => {
  return typeof value === 'boolean'
}

// 根据列类型获取列宽度
const getColumnWidth = (column: ColumnDefinition): string | number => {
  if (column.width) {
    return column.width
  }
  
  // 根据列类型设置默认宽度
  switch (column.type?.toLowerCase()) {
    case 'boolean':
      return 100
    case 'number':
    case 'integer':
    case 'float':
    case 'decimal':
      return 120
    case 'date':
    case 'time':
    case 'datetime':
      return 150
    default:
      return 'auto'
  }
}

// 设置单元格类名
const cellClassName = ({ row, column, rowIndex, columnIndex }: any): string => {
  const value = row[column.property]
  if (isNull(value)) {
    return 'cell-null'
  } else if (typeof value === 'number') {
    return 'cell-number'
  } else if (typeof value === 'boolean') {
    return 'cell-boolean'
  } else if (value instanceof Date) {
    return 'cell-date'
  }
  return ''
}

// 导出为CSV
const exportCSV = () => {
  if (!props.results?.rows || props.results.rows.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  try {
    // 获取列标题
    const headers = props.results.columns.map(col => col.label || col.name)
    
    // 构建CSV内容
    let csvContent = headers.join(',') + '\n'
    
    // 添加数据行
    props.results.rows.forEach(row => {
      const rowValues = props.results.columns.map(col => {
        const value = row[col.name]
        // 处理不同类型的值
        if (isNull(value)) return 'NULL'
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
        return value
      })
      csvContent += rowValues.join(',') + '\n'
    })
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // 设置下载属性
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    link.setAttribute('href', url)
    link.setAttribute('download', `query-results-${timestamp}.csv`)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 通知父组件
    emit('export', { type: 'csv', data: csvContent })
    
    ElMessage.success('CSV导出成功')
  } catch (error) {
    console.error('导出CSV失败:', error)
    ElMessage.error('导出CSV失败，请重试')
  }
}

// 导出Excel
const exportExcel = () => {
  if (!props.results?.rows || props.results.rows.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  try {
    // 准备工作表数据
    const wsData = [
      // 列标题行
      props.results.columns.map(col => col.label || col.name)
    ]
    
    // 添加数据行
    props.results.rows.forEach(row => {
      const rowValues = props.results.columns.map(col => {
        const value = row[col.name]
        return isNull(value) ? 'NULL' : value
      })
      wsData.push(rowValues)
    })
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'QueryResults')
    
    // 导出Excel文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    XLSX.writeFile(wb, `query-results-${timestamp}.xlsx`)
    
    // 通知父组件
    emit('export', { type: 'excel', data: wb })
    
    ElMessage.success('Excel导出成功')
  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error('导出Excel失败，请重试')
  }
}

// 复制为JSON
const copyAsJSON = () => {
  if (!props.results?.rows || props.results.rows.length === 0) {
    ElMessage.warning('没有可复制的数据')
    return
  }
  
  try {
    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(props.results.rows, null, 2)
    
    // 复制到剪贴板
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        ElMessage.success('已复制JSON数据到剪贴板')
      })
      .catch((error) => {
        console.error('剪贴板复制失败:', error)
        ElMessage.error('复制失败，请重试')
      })
  } catch (error) {
    console.error('JSON转换失败:', error)
    ElMessage.error('JSON转换失败，请重试')
  }
}

// 对外暴露方法
defineExpose({
  exportCSV,
  exportExcel,
  copyAsJSON
})
</script>

<style lang="scss" scoped>
.query-results-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    
    .results-stats {
      display: flex;
      gap: 8px;
    }
  }
  
  .results-content {
    flex: 1;
    overflow: auto;
    position: relative;
    
    .results-loading,
    .results-error,
    .results-empty {
      padding: 20px;
    }
  }
}

/* 自定义表格单元格样式 */
:deep(.el-table) {
  .cell-null {
    color: #909399;
    font-style: italic;
  }
  
  .cell-number {
    font-family: monospace;
    text-align: right;
  }
  
  .cell-boolean {
    font-weight: bold;
  }
  
  .cell-date {
    color: #409eff;
  }
}
</style>