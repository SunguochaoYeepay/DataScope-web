<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useDataSourceStore } from '@/stores/datasource';
import { message } from 'ant-design-vue';
import type { DataSourceResponse } from '@/types/api';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  SearchOutlined,
  SyncOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons-vue';

const dataSourceStore = useDataSourceStore();
const searchText = ref('');
const loading = ref(false);

// 表格列定义
const columns = [
  {
    title: '数据源名称',
    dataIndex: 'name',
    key: 'name',
    width: '20%',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: '10%',
  },
  {
    title: '主机',
    dataIndex: 'host',
    key: 'host',
    width: '15%',
  },
  {
    title: '数据库',
    dataIndex: 'database',
    key: 'database',
    width: '15%',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: '10%',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: '20%',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: '10%',
  },
];

// 加载数据源列表
const loadDataSources = async () => {
  loading.value = true;
  try {
    await dataSourceStore.loadDataSources({
      page: 1,
      pageSize: 10,
    });
  } catch (error) {
    message.error('加载数据源列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 同步元数据
const handleSync = async (id: number) => {
  try {
    await dataSourceStore.syncMetadata(id);
    message.success('同步成功');
  } catch (error) {
    message.error('同步失败');
    console.error(error);
  }
};

// 编辑数据源
const handleEdit = (record: DataSourceResponse) => {
  // TODO: 实现编辑功能
};

// 删除数据源
const handleDelete = async (id: number) => {
  try {
    await dataSourceStore.deleteDataSource(id);
    message.success('删除成功');
    await loadDataSources();
  } catch (error) {
    message.error('删除失败');
    console.error(error);
  }
};

// 刷新列表
const handleRefresh = () => {
  loadDataSources();
};

// 搜索数据源
const handleSearch = (value: string) => {
  searchText.value = value;
  // TODO: 实现搜索功能
};

// 新建数据源
const handleCreate = () => {
  // TODO: 实现新建功能
};

onMounted(() => {
  loadDataSources();
});
</script>

<template>
  <div class="page-container">
    <!-- 列表头部 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="数据源名称">
              <a-input
                v-model:value="searchText"
                placeholder="请输入数据源名称"
                allow-clear
              >
                <template #prefix>
                  <SearchOutlined class="site-form-item-icon" />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleSearch(searchText)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => { searchText = ''; handleSearch(''); }">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 列表操作区域 -->
    <div class="table-operator" style="margin-bottom: 16px">
      <a-button type="primary" @click="handleCreate">
        <template #icon><plus-outlined /></template>
        新建数据源
      </a-button>
      <a-button style="margin-left: 8px" @click="handleRefresh">
        <template #icon><reload-outlined /></template>
        刷新
      </a-button>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSourceStore.dataSourceList"
      :loading="loading"
      :pagination="{
        total: dataSourceStore.total,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }"
      row-key="id"
      bordered
    >
      <!-- 状态列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-badge
            :status="record.status === 'active' ? 'success' : 'error'"
            :text="record.status === 'active' ? '正常' : '异常'"
          />
        </template>

        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <a-space>
            <a-tooltip title="同步元数据">
              <a-button type="link" @click="() => handleSync(record.id)">
                <template #icon><sync-outlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-button type="link" @click="() => handleEdit(record)">
                <template #icon><edit-outlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-popconfirm
                title="确定要删除这个数据源吗？"
                @confirm="() => handleDelete(record.id)"
              >
                <a-button type="link" danger>
                  <template #icon><delete-outlined /></template>
                </a-button>
              </a-popconfirm>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  background-color: #fff;
  padding: 24px;
  min-height: 100%;

  .table-page-search-wrapper {
    margin-bottom: 16px;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }

  .table-operator {
    margin-bottom: 16px;
    
    button {
      margin-right: 8px;
    }
  }

  // 响应式调整
  @media screen and (max-width: 480px) {
    padding: 12px;
    
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
}

// 表格内容样式优化
:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background: #fafafa;
  }
  
  .ant-table-tbody > tr:hover > td {
    background: #f5f5f5;
  }
}

// 搜索区域样式
:deep(.ant-form-inline) {
  .ant-form-item {
    margin-bottom: 16px;
    margin-right: 0;
    
    .ant-form-item-label {
      width: 90px;
      text-align: right;
    }
  }
}
</style>