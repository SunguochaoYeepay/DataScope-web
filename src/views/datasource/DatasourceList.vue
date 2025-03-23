<template>
  <div class="datasource-list">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <a-space>
        <a-input-search
          v-model:value="queryParams.keyword"
          placeholder="搜索数据源"
          style="width: 250px"
          @search="handleSearch"
        />
        <a-select
          v-model:value="queryParams.type"
          placeholder="数据源类型"
          style="width: 150px"
          allowClear
          @change="handleSearch"
        >
          <a-select-option value="MYSQL">MySQL</a-select-option>
          <a-select-option value="DB2">DB2</a-select-option>
        </a-select>
        <a-select
          v-model:value="queryParams.status"
          placeholder="状态"
          style="width: 150px"
          allowClear
          @change="handleSearch"
        >
          <a-select-option value="enabled">正常</a-select-option>
          <a-select-option value="disabled">未启用</a-select-option>
          <a-select-option value="connection_failed">连接失败</a-select-option>
        </a-select>
      </a-space>
      <a-button type="primary" @click="handleCreate">
        <template #icon><PlusOutlined /></template>
        新建数据源
      </a-button>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="datasourceStore.list"
      :loading="datasourceStore.loading"
      :pagination="{
        total: datasourceStore.total,
        current: datasourceStore.current,
        pageSize: datasourceStore.pageSize,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条记录`,
      }"
      @change="handleTableChange"
      row-key="id"
    >
      <!-- 数据源类型 -->
      <template #type="{ text }">
        <a-tag :color="text === 'MYSQL' ? 'blue' : 'purple'">{{ text }}</a-tag>
      </template>

      <!-- 状态 -->
      <template #status="{ text }">
        <a-tag :color="getStatusColor(text)">{{ getStatusText(text) }}</a-tag>
      </template>

      <!-- 操作 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" size="small" @click="handleEdit(record)">
            编辑
          </a-button>
          <a-button type="link" size="small" @click="handleTest(record)">
            测试连接
          </a-button>
          <a-button type="link" size="small" @click="handleSync(record)">
            同步元数据
          </a-button>
          <a-popconfirm
            title="确定要删除该数据源吗？"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" size="small" danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>

    <!-- 测试连接结果弹窗 -->
    <a-modal
      v-model:open="testModalVisible"
      title="测试连接结果"
      :footer="null"
      width="500px"
    >
      <a-result
        :status="testResult.success ? 'success' : 'error'"
        :title="testResult.success ? '连接成功' : '连接失败'"
        :sub-title="testResult.message"
      >
        <template #extra>
          <a-button type="primary" @click="testModalVisible = false">
            确定
          </a-button>
        </template>
      </a-result>
      <div v-if="testResult.details" class="test-details">
        <pre>{{ testResult.details }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import { useDataSourceStore } from '@/stores';
import type { 
  DataSource, 
  DataSourceType, 
  DataSourceStatus, 
  DataSourceQueryParams,
  TestConnectionResult 
} from '@/types/datasource';
import { DATA_SOURCE_STATUS, DATA_SOURCE_STATUS_TEXT, DATA_SOURCE_STATUS_STYLE } from '@/constants/status';

const router = useRouter();
const datasourceStore = useDataSourceStore();

// 查询参数
const queryParams = reactive<DataSourceQueryParams>({
  keyword: '',
  type: undefined,
  status: undefined,
  pageSize: 10,
  current: 1,
});

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
  },
  {
    title: '主机',
    dataIndex: 'host',
    key: 'host',
    width: 150,
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 100,
  },
  {
    title: '数据库',
    dataIndex: 'databaseName',
    key: 'databaseName',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200,
  }
];

// 测试连接相关
const testModalVisible = ref(false);
const testResult = ref<TestConnectionResult>({
  success: false,
  message: '',
});

// 获取状态颜色
const getStatusColor = (status: DataSourceStatus) => {
  return DATA_SOURCE_STATUS_STYLE[status];
};

// 获取状态文本
const getStatusText = (status: DataSourceStatus) => {
  return DATA_SOURCE_STATUS_TEXT[status];
};

// 搜索
const handleSearch = () => {
  queryParams.current = 1;
  fetchList();
};

// 表格变化
const handleTableChange: TableProps['onChange'] = (pagination) => {
  if (pagination.current) {
    queryParams.current = pagination.current;
  }
  if (pagination.pageSize) {
    queryParams.pageSize = pagination.pageSize;
  }
  fetchList();
};

// 获取列表数据
const fetchList = () => {
  datasourceStore.fetchList(queryParams);
};

// 新建数据源
const handleCreate = () => {
  router.push({ name: 'datasource-create' });
};

// 编辑数据源
const handleEdit = (record: DataSource) => {
  router.push({
    name: 'datasource-edit',
    params: { id: record.id },
  });
};

// 测试连接
const handleTest = async (record: DataSource) => {
  try {
    const result = await datasourceStore.testConnection({
      name: record.name,
      type: record.type,
      host: record.host,
      port: record.port,
      databaseName: record.databaseName,
      username: record.username,
      password: '', // 需要用户重新输入密码
    });
    testResult.value = result as TestConnectionResult;
    testModalVisible.value = true;
  } catch (error: any) {
    message.error(error.message || '测试连接失败');
  }
};

// 同步元数据
const handleSync = async (record: DataSource) => {
  try {
    await datasourceStore.syncMetadata(record.id);
    message.success('同步成功');
    fetchList(); // 刷新列表
  } catch (error: any) {
    message.error(error.message || '同步失败');
  }
};

// 删除数据源
const handleDelete = async (record: DataSource) => {
  try {
    await datasourceStore.delete(record.id);
    message.success('删除成功');
    fetchList(); // 刷新列表
  } catch (error: any) {
    message.error(error.message || '删除失败');
  }
};

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.datasource-list {
  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .test-details {
    margin-top: 16px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>