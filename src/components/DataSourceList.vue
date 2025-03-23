<!-- 数据源列表组件 -->
<template>
  <div class="datasource-list">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <a-space>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索数据源"
          style="width: 300px"
          @search="handleSearch"
        />
        <a-button type="primary" @click="$emit('add')">
          <template #icon><plus-outlined /></template>
          新建数据源
        </a-button>
        <a-button @click="handleRefresh">
          <template #icon><sync-outlined /></template>
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 数据源列表表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSourceList"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
    >
      <!-- 数据源类型 -->
      <template #type="{ text }">
        <a-tag :color="getTypeColor(text)">{{ text }}</a-tag>
      </template>

      <!-- 连接状态 -->
      <template #status="{ text }">
        <a-badge
          :status="text === 1 ? 'success' : text === 0 ? 'error' : 'default'"
          :text="text === 1 ? '已连接' : text === 0 ? '未连接' : '未知'"
        />
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-tooltip title="编辑">
            <a-button type="link" @click="$emit('edit', record)">
              <template #icon><edit-outlined /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="同步元数据">
            <a-button type="link" @click="handleSync(record)">
              <template #icon><sync-outlined /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="删除">
            <a-popconfirm
              title="确定要删除这个数据源吗？"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger>
                <template #icon><delete-outlined /></template>
              </a-button>
            </a-popconfirm>
          </a-tooltip>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDataSourceStore } from '@/stores/datasource'
import type { DataSourceResponse } from '@/types/api'
import {
  PlusOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 数据源 store
const dataSourceStore = useDataSourceStore()

// 搜索关键字
const searchKeyword = ref('')

// 表格列定义
const columns = [
  {
    title: '数据源名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    slots: { customRender: 'type' },
  },
  {
    title: '主机',
    dataIndex: 'host',
    key: 'host',
    width: 180,
  },
  {
    title: '数据库',
    dataIndex: 'database',
    key: 'database',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    slots: { customRender: 'status' },
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
]

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

// 加载数据源列表
const loadData = async () => {
  await dataSourceStore.loadDataSources({
    pageNum: pagination.value.current,
    pageSize: pagination.value.pageSize,
    keyword: searchKeyword.value,
  })
  pagination.value.total = dataSourceStore.total
}

// 处理表格变化
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

// 处理搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

// 处理刷新
const handleRefresh = () => {
  loadData()
}

// 处理同步元数据
const handleSync = async (record: DataSourceResponse) => {
  try {
    await dataSourceStore.syncMetadata(record.id)
    message.success('元数据同步成功')
  } catch (error) {
    message.error('元数据同步失败')
  }
}

// 处理删除
const handleDelete = async (record: DataSourceResponse) => {
  try {
    await dataSourceStore.deleteDataSource(record.id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

// 获取类型标签颜色
const getTypeColor = (type: string) => {
  switch (type.toUpperCase()) {
    case 'MYSQL':
      return 'blue'
    case 'POSTGRESQL':
      return 'green'
    case 'CLICKHOUSE':
      return 'orange'
    default:
      return 'default'
  }
}

// 计算属性：数据源列表
const dataSourceList = computed(() => dataSourceStore.dataSourceList)
// 计算属性：加载状态
const loading = computed(() => dataSourceStore.loading)

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.datasource-list {
  padding: 24px;
  background: #fff;
  border-radius: 2px;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.ant-table) {
  background: #fff;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
}

:deep(.ant-tag) {
  margin-right: 0;
}

:deep(.ant-badge-status-text) {
  margin-left: 8px;
}
</style> 