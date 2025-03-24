<script setup lang="ts">
import { ref, computed, watchEffect, onBeforeUnmount } from 'vue'
import { ElDrawer, ElTabs, ElTabPane, ElTable, ElTableColumn, ElDescriptions, ElDescriptionsItem, ElTag, ElButton, ElTooltip, ElInput, ElSelect, ElOption } from 'element-plus'
import type { TableMetadata, ColumnMetadata, IndexMetadata } from '../../../api/metadata'
import { previewTableData, type DataPreviewRequest, type DataPreviewResponse } from '../../../api/preview'

// 组件属性
const props = defineProps<{
  modelValue: boolean,
  table: TableMetadata
}>()

// 事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 抽屉显示状态
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 获取表字段列表
const columns = computed(() => {
  if (!props.table || !props.table.columnMap) return []
  return Object.values(props.table.columnMap).sort((a: ColumnMetadata, b: ColumnMetadata) => {
    return (a.ordinalPosition || 0) - (b.ordinalPosition || 0)
  })
})

// 类型格式化显示
function formatColumnType(column: ColumnMetadata): string {
  let result = column.type
  
  if (column.length) {
    result += `(${column.length})`
  } else if (column.precision) {
    result += `(${column.precision})`
  }
  
  return result
}

// 格式化大小
function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return '-'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 当前活动的标签页
const activeTab = ref('columns')

// 清理函数，确保组件销毁前清理引用
onBeforeUnmount(() => {
  // 释放资源，避免内存泄漏或DOM引用问题
  activeTab.value = 'columns'
})

// 关闭抽屉
function handleClose() {
  emit('update:modelValue', false)
}

// 预览相关的响应式变量
const previewLoading = ref(false)
const previewRows = ref<Record<string, any>[]>([])
const previewColumns = ref<ColumnMetadata[]>([])
const previewError = ref('')
const previewConfig = ref({
  sampleSize: 100,
  orderBy: '',
  desc: false,
})

// 预览数据函数
async function loadPreviewData() {
  if (!props.table) return
  
  try {
    previewLoading.value = true
    previewError.value = ''
    
    const request: DataPreviewRequest = {
      dataSourceId: props.table.dataSourceId,
      schema: props.table.schema,
      tableName: props.table.name,
      sampleSize: previewConfig.value.sampleSize,
      orderBy: previewConfig.value.orderBy || undefined,
      desc: previewConfig.value.desc,
    }
    
    const response = await previewTableData(request)
    if (response && response.data) {
      previewColumns.value = response.data.columns
      previewRows.value = response.data.rows
    } else {
      previewError.value = '预览数据返回格式错误'
    }
  } catch (error: any) {
    console.error('加载预览数据失败:', error)
    previewError.value = `加载预览数据失败: ${error.message || '未知错误'}`
  } finally {
    previewLoading.value = false
  }
}

// 重置预览配置
function resetPreviewConfig() {
  previewConfig.value = {
    sampleSize: 100,
    orderBy: '',
    desc: false,
  }
  loadPreviewData()
}

// 监听抽屉显示状态，当打开时自动加载预览数据
watchEffect(() => {
  if (drawerVisible.value && activeTab.value === 'preview') {
    loadPreviewData()
  }
})
</script>

<template>
  <el-drawer
    v-if="table"
    v-model="drawerVisible"
    :title="`表详情：${table?.schema || ''}.${table?.name || ''}`"
    size="70%"
    destroy-on-close
    direction="rtl"
    @close="handleClose"
  >
    <div class="drawer-content">
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="表名" :span="2">
              {{ table?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="模式" :span="1">
              {{ table?.schema || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="注释" :span="1">
              {{ table?.comment || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="行数">
              {{ table?.rowCount?.toLocaleString() || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="数据大小">
              {{ formatSize(table?.dataSize) }}
            </el-descriptions-item>
            <el-descriptions-item label="索引大小">
              {{ formatSize(table?.indexSize) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        
        <!-- 字段列表 -->
        <el-tab-pane label="字段列表">
          <el-table :data="columns" style="width: 100%" border max-height="500px" size="default">
            <el-table-column prop="name" label="字段名" min-width="150" />
            <el-table-column label="类型" min-width="120">
              <template #default="scope">
                {{ formatColumnType(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="注释" min-width="180" />
            <el-table-column label="允许空值" width="90" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.nullable ? 'success' : 'danger'" effect="plain">
                  {{ scope.row.nullable ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="主键" width="70" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.primaryKey" type="primary" effect="dark">主键</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="自增" width="70" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.autoIncrement" type="warning" effect="plain">自增</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="defaultValue" label="默认值" min-width="120">
              <template #default="scope">
                {{ scope.row.defaultValue || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 索引信息 -->
        <el-tab-pane label="索引信息">
          <div v-if="table?.indices && table.indices.length > 0">
            <el-table :data="table.indices" style="width: 100%" border max-height="500px" size="default">
              <el-table-column prop="name" label="索引名" min-width="180" />
              <el-table-column label="唯一索引" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.unique ? 'success' : 'info'" effect="plain">
                    {{ scope.row.unique ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="cardinality" label="基数" min-width="120">
                <template #default="scope">
                  {{ scope.row.cardinality?.toLocaleString() || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="索引大小" min-width="120">
                <template #default="scope">
                  {{ formatSize(scope.row.indexSize) }}
                </template>
              </el-table-column>
              <el-table-column label="索引字段" min-width="200">
                <template #default="scope">
                  <el-tag 
                    v-for="column in scope.row.columns" 
                    :key="column"
                    type="info"
                    effect="light"
                    class="index-column-tag"
                  >
                    {{ column }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-else class="empty-indices">
            <p>该表没有索引信息</p>
          </div>
        </el-tab-pane>
        
        <!-- 数据预览 -->
        <el-tab-pane label="数据预览" name="preview">
          <div class="preview-toolbar">
            <el-input
              v-model.number="previewConfig.sampleSize"
              type="number"
              :min="1"
              :max="1000"
              placeholder="样本大小"
              style="width: 150px"
            >
              <template #prepend>样本大小</template>
            </el-input>
            
            <el-select
              v-model="previewConfig.orderBy"
              placeholder="排序字段"
              clearable
              style="width: 200px; margin-left: 10px"
            >
              <el-option
                v-for="col in columns"
                :key="col.name"
                :label="col.name"
                :value="col.name"
              />
            </el-select>
            
            <el-select
              v-if="previewConfig.orderBy"
              v-model="previewConfig.desc"
              style="width: 120px; margin-left: 10px"
            >
              <el-option :value="false" label="升序" />
              <el-option :value="true" label="降序" />
            </el-select>
            
            <el-button
              type="primary"
              :loading="previewLoading"
              @click="loadPreviewData"
              style="margin-left: 10px"
            >
              刷新预览
            </el-button>
            
            <el-button
              @click="resetPreviewConfig"
              style="margin-left: 10px"
            >
              重置
            </el-button>
          </div>
          
          <div v-if="previewError" class="preview-error">
            {{ previewError }}
          </div>
          
          <el-table
            v-else
            :data="previewRows"
            style="width: 100%"
            border
            max-height="500px"
            size="default"
            v-loading="previewLoading"
          >
            <el-table-column
              v-for="col in previewColumns"
              :key="col.name"
              :prop="col.name"
              :label="col.name"
              :min-width="120"
            >
              <template #header>
                <el-tooltip
                  v-if="col.comment"
                  :content="col.comment"
                  placement="top"
                >
                  <span>{{ col.name }}</span>
                </el-tooltip>
                <span v-else>{{ col.name }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <template #footer>
      <div style="flex: auto; text-align: right; padding: 10px 20px;">
        <el-button @click="drawerVisible = false">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.drawer-content {
  padding: 0 20px;
}

.index-column-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.empty-indices {
  text-align: center;
  padding: 30px;
  color: #909399;
}

.preview-toolbar {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.preview-error {
  text-align: center;
  padding: 30px;
  color: #f56c6c;
  background-color: #fef0f0;
  border-radius: 4px;
  margin: 10px 0;
}
</style>