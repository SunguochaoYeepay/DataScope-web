<template>
  <div class="query-history">
    <div class="query-history-header">
      <h3>查询历史</h3>
      <a-button type="link" @click="refresh">
        <template #icon><ReloadOutlined /></template>
        刷新
      </a-button>
    </div>

    <a-list
      class="query-history-list"
      :loading="loading"
      :data-source="histories"
      :pagination="{
        total: total,
        current: current,
        pageSize: size,
        onChange: handlePageChange,
        onShowSizeChange: handleSizeChange
      }"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <div class="query-history-item-title">
                <span class="sql-preview">{{ item.sql.slice(0, 100) }}{{ item.sql.length > 100 ? '...' : '' }}</span>
                <a-tag :color="getStatusColor(item.status)">{{ item.status }}</a-tag>
              </div>
            </template>
            <template #description>
              <div class="query-history-item-desc">
                <span>执行时间: {{ formatTime(item.executedAt) }}</span>
                <span>耗时: {{ formatDuration(item.executionTime) }}</span>
                <span v-if="item.affectedRows !== undefined">影响行数: {{ item.affectedRows }}</span>
              </div>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-space>
              <a-tooltip title="重新执行">
                <a-button type="link" @click="rerunQuery(item)">
                  <template #icon><PlayCircleOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="复制 SQL">
                <a-button type="link" @click="copySQL(item.sql)">
                  <template #icon><CopyOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="保存为模板">
                <a-button type="link" @click="showSaveTemplate(item)">
                  <template #icon><SaveOutlined /></template>
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <!-- 保存模板对话框 -->
    <a-modal
      v-model:visible="saveTemplateVisible"
      title="保存为模板"
      @ok="handleSaveTemplate"
      :confirmLoading="savingTemplate"
    >
      <a-form :model="templateForm" layout="vertical">
        <a-form-item label="模板名称" name="name" :rules="[{ required: true }]">
          <a-input v-model:value="templateForm.name" placeholder="请输入模板名称" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="templateForm.description" placeholder="请输入模板描述" />
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="templateForm.tags"
            mode="tags"
            placeholder="请输入标签"
            :token-separators="[',']"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQueryStore } from '@/stores/query';
import { message } from 'ant-design-vue';
import { ReloadOutlined, PlayCircleOutlined, CopyOutlined, SaveOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { getUserQueryHistories } from '../../api/query-history';
import type { QueryHistory } from '../../types/query-history';
import { QueryHistoryStatus } from '../../types/query-history';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const queryStore = useQueryStore();
const loading = ref(false);
const saveTemplateVisible = ref(false);
const savingTemplate = ref(false);
const histories = ref<QueryHistory[]>([]);
const total = ref(0);
const current = ref(1);
const size = ref(10);

// 分页配置
const pagination = {
  pageSize: 10,
  size: 'small',
};

// 模板表单
const templateForm = ref({
  name: '',
  description: '',
  tags: [] as string[],
  sql: '',
});

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'running':
      return 'processing';
    default:
      return 'default';
  }
};

// 格式化时间
const formatTime = (time: string | Date) => {
  return dayjs(time).fromNow();
};

// 格式化执行时长
const formatDuration = (time: number) => {
  return time < 1000 
    ? `${time}ms`
    : `${(time / 1000).toFixed(2)}s`;
};

// 刷新历史记录
const refresh = async () => {
  loading.value = true;
  try {
    const response = await getUserQueryHistories('test-user', {
      status: QueryHistoryStatus.SUCCESS,
      current: current.value,
      size: size.value
    });
    histories.value = response.records;
    total.value = response.total;
  } catch (error) {
    console.error('Failed to fetch query histories:', error);
  } finally {
    loading.value = false;
  }
};

// 重新执行查询
const rerunQuery = (item: any) => {
  queryStore.setQuery(item.sql);
  queryStore.execute();
};

// 复制 SQL
const copySQL = async (sql: string) => {
  try {
    await navigator.clipboard.writeText(sql);
    message.success('SQL 已复制到剪贴板');
  } catch (err) {
    message.error('复制失败');
  }
};

// 显示保存模板对话框
const showSaveTemplate = (item: any) => {
  templateForm.value = {
    name: '',
    description: '',
    tags: [],
    sql: item.sql,
  };
  saveTemplateVisible.value = true;
};

// 保存模板
const handleSaveTemplate = async () => {
  if (!templateForm.value.name) {
    message.warning('请输入模板名称');
    return;
  }

  savingTemplate.value = true;
  try {
    await queryStore.saveTemplate(
      templateForm.value.name,
      templateForm.value.description,
      templateForm.value.tags
    );
    saveTemplateVisible.value = false;
    message.success('模板保存成功');
  } finally {
    savingTemplate.value = false;
  }
};

const handlePageChange = (page: number) => {
  current.value = page;
  refresh();
};

const handleSizeChange = (pageSize: number) => {
  size.value = pageSize;
  current.value = 1;
  refresh();
};

onMounted(() => {
  refresh();
});
</script>

<style lang="scss" scoped>
.query-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .query-history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
    }
  }
  
  .query-history-list {
    flex: 1;
    overflow-y: auto;
    
    :deep(.ant-list-item) {
      padding: 12px 16px;
    }
  }
  
  .query-history-item-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .sql-preview {
      font-family: monospace;
      color: #666;
    }
  }
  
  .query-history-item-desc {
    display: flex;
    gap: 16px;
    color: #999;
  }
}
</style>