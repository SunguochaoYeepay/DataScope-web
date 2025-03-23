<template>
  <div class="query-list">
    <a-card :loading="loading">
      <!-- 操作栏 -->
      <div class="operation-bar">
        <a-space>
          <a-input-search
            v-model:value="searchParams.dataSourceId"
            placeholder="请输入数据源ID"
            style="width: 200px"
            @search="(value: string) => handleSearchDataSource(value)"
          />
          <a-select
            v-model:value="searchParams.status"
            style="width: 120px"
            placeholder="请选择状态"
            allowClear
            @change="(value: string) => handleStatusChange(value)"
          >
            <a-select-option value="SUCCESS">已完成</a-select-option>
            <a-select-option value="FAILED">失败</a-select-option>
          </a-select>
          <a-range-picker
            v-model:value="dateRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间', '结束时间']"
            @change="(dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => handleDateRangeChange(dates)"
          />
        </a-space>

        <a-button type="primary" @click="handleCreate">
          <template #icon><PlusOutlined /></template>
          新建查询
        </a-button>
      </div>

      <!-- 查询历史列表 -->
      <a-table
        :columns="columns"
        :data-source="queryHistoryStore.histories"
        :pagination="{
          total: queryHistoryStore.total,
          current: searchParams.page,
          pageSize: searchParams.size,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleViewDetail(record)">
                查看详情
              </a-button>
              <a-button 
                type="link" 
                danger 
                v-if="record.status === 'running'"
                @click="handleCancel(record)"
              >
                取消执行
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 删除确认对话框 -->
    <a-modal
      v-model:open="deleteModalVisible"
      title="删除确认"
      :footer="null"
    >
      <p>确定要删除该查询吗？删除后将无法恢复。</p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import {
  SearchOutlined,
  PlusOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { useQueryHistoryStore, useDataSourceStore } from '@/stores';
import type { QueryHistory, QueryHistoryQuery } from '@/types/query-history';

// 查询状态类型
type QueryStatus = 'SUCCESS' | 'FAILED';

// 查询列表项类型
interface QueryListItem {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  dataSourceName: string;
  status: QueryStatus;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

// 搜索参数
const searchParams = reactive<QueryHistoryQuery>({
  page: 1,
  size: 10,
  userId: 'test-user', // TODO: 从用户状态中获取
  status: undefined,
  startTime: undefined,
  endTime: undefined,
});

const dateRange = ref<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

// 表格列定义
const columns = [
  {
    title: '查询ID',
    dataIndex: 'queryId',
    key: 'queryId',
  },
  {
    title: '执行时间',
    dataIndex: 'executionTime',
    key: 'executionTime',
    customRender: ({ text }: { text: number }) => `${text}ms`,
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '结果数量',
    dataIndex: 'resultCount',
    key: 'resultCount',
  },
  {
    title: '操作',
    key: 'action',
  },
];

// 删除相关
const deleteModalVisible = ref(false);
const deleting = ref(false);
const queryToDelete = ref<QueryListItem>();

const router = useRouter();
const queryHistoryStore = useQueryHistoryStore();
const datasourceStore = useDataSourceStore();

// 加载状态
const loading = ref(false);

// 获取数据源列表
const fetchDataSources = async () => {
  try {
    await datasourceStore.fetchList();
  } catch (error: any) {
    message.error(error.message || '获取数据源列表失败');
  }
};

// 获取查询列表
const fetchQueries = async () => {
  loading.value = true;
  try {
    await queryHistoryStore.fetchHistories(searchParams);
  } catch (error: any) {
    message.error(error.message || '获取查询历史失败');
  } finally {
    loading.value = false;
  }
};

// 搜索数据源
const handleSearchDataSource = (value: string) => {
  searchParams.page = 1;
  searchParams.dataSourceId = value.trim() || undefined;
  fetchQueries();
};

// 状态变更
const handleStatusChange = (value: string) => {
  searchParams.page = 1;
  searchParams.status = value;
  fetchQueries();
};

// 表格变化
const handleTableChange = (pagination: TablePaginationConfig) => {
  searchParams.page = pagination.current || 1;
  searchParams.size = pagination.pageSize || 10;
  fetchQueries();
};

// 新建查询
const handleCreate = () => {
  router.push({ name: 'query-create' });
};

// 查看历史记录
const handleViewDetail = (record: QueryHistory) => {
  console.log('查看详情:', record);
};

// 取消执行
const handleCancel = async (record: QueryHistory) => {
  try {
    message.success('已取消执行');
    await fetchQueries();
  } catch (error: any) {
    message.error(error.message || '取消执行失败');
  }
};

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    SUCCESS: 'success',
    FAILED: 'error',
  };
  return colorMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    SUCCESS: '已完成',
    FAILED: '失败',
  };
  return textMap[status] || status;
};

// 日期范围变化
const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
  if (dates?.[0] && dates?.[1]) {
    searchParams.startTime = dates[0].format('YYYY-MM-DD HH:mm:ss');
    searchParams.endTime = dates[1].format('YYYY-MM-DD HH:mm:ss');
  } else {
    searchParams.startTime = undefined;
    searchParams.endTime = undefined;
  }
  searchParams.page = 1;
  fetchQueries();
};

onMounted(() => {
  fetchDataSources();
  fetchQueries();
});
</script>

<style lang="scss" scoped>
.query-list {
  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :deep(.ant-table) {
    .ant-typography {
      margin-bottom: 0;
      margin-top: 4px;
      color: rgba(0, 0, 0, 0.45);
    }
  }

  :deep(.ant-table-cell) {
    .ant-space {
      flex-wrap: nowrap;
    }
  }
}
</style>