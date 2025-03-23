<template>
  <div class="query-template">
    <div class="query-template-header">
      <h3>查询模板</h3>
      <a-space>
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索模板"
          style="width: 200px"
          @search="onSearch"
        />
        <a-button type="primary" @click="showCreateTemplate">
          <template #icon><PlusOutlined /></template>
          新建模板
        </a-button>
      </a-space>
    </div>

    <!-- 模板列表 -->
    <a-list
      class="query-template-list"
      :loading="loading"
      :data-source="filteredTemplates"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <div class="query-template-item-title">
                <span>{{ item.name }}</span>
                <a-space>
                  <a-tag v-for="tag in item.tags" :key="tag">{{ tag }}</a-tag>
                </a-space>
              </div>
            </template>
            <template #description>
              <div class="query-template-item-desc">
                <div class="template-desc">{{ item.description || '暂无描述' }}</div>
                <div class="sql-preview">{{ item.sql.slice(0, 100) }}{{ item.sql.length > 100 ? '...' : '' }}</div>
              </div>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-space>
              <a-tooltip title="使用模板">
                <a-button type="link" @click="useTemplate(item)">
                  <template #icon><PlayCircleOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="编辑">
                <a-button type="link" @click="editTemplate(item)">
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="删除">
                <a-popconfirm
                  title="确定要删除这个模板吗？"
                  @confirm="deleteTemplate(item)"
                >
                  <a-button type="link" danger>
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-popconfirm>
              </a-tooltip>
            </a-space>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <!-- 模板编辑对话框 -->
    <a-modal
      v-model:visible="templateModalVisible"
      :title="editingTemplate ? '编辑模板' : '新建模板'"
      @ok="handleSaveTemplate"
      :confirmLoading="saving"
      width="800px"
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
        <a-form-item label="SQL" name="sql" :rules="[{ required: true }]">
          <MonacoEditor
            v-model:value="templateForm.sql"
            language="sql"
            :height="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, PlayCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import MonacoEditor from '../MonacoEditor.vue';
import { useQueryStore } from '@/stores/query';

const queryStore = useQueryStore();
const loading = ref(false);
const searchText = ref('');
const templateModalVisible = ref(false);
const saving = ref(false);
const editingTemplate = ref<any>(null);

// 模板表单
const templateForm = ref({
  name: '',
  description: '',
  tags: [] as string[],
  sql: '',
});

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  const templates = queryStore.queryTemplates;
  if (!searchText.value) return templates;
  
  const search = searchText.value.toLowerCase();
  return templates.filter(template => 
    template.name.toLowerCase().includes(search) ||
    template.description?.toLowerCase().includes(search) ||
    template.tags?.some(tag => tag.toLowerCase().includes(search))
  );
});

// 搜索
const onSearch = (value: string) => {
  searchText.value = value;
};

// 显示创建模板对话框
const showCreateTemplate = () => {
  editingTemplate.value = null;
  templateForm.value = {
    name: '',
    description: '',
    tags: [],
    sql: '',
  };
  templateModalVisible.value = true;
};

// 使用模板
const useTemplate = (template: any) => {
  queryStore.setQuery(template.sql);
  message.success('模板已应用');
};

// 编辑模板
const editTemplate = (template: any) => {
  editingTemplate.value = template;
  templateForm.value = {
    name: template.name,
    description: template.description || '',
    tags: template.tags || [],
    sql: template.sql,
  };
  templateModalVisible.value = true;
};

// 删除模板
const deleteTemplate = async (template: any) => {
  try {
    await queryStore.deleteTemplate(template.id);
    message.success('模板已删除');
  } catch (err: any) {
    message.error('删除失败: ' + err.message);
  }
};

// 保存模板
const handleSaveTemplate = async () => {
  if (!templateForm.value.name || !templateForm.value.sql) {
    message.warning('请填写必填项');
    return;
  }

  saving.value = true;
  try {
    if (editingTemplate.value) {
      await queryStore.updateTemplate(
        editingTemplate.value.id,
        templateForm.value.name,
        templateForm.value.sql,
        templateForm.value.description,
        templateForm.value.tags
      );
      message.success('模板更新成功');
    } else {
      await queryStore.saveTemplate(
        templateForm.value.name,
        templateForm.value.sql,
        templateForm.value.description,
        templateForm.value.tags
      );
      message.success('模板创建成功');
    }
    templateModalVisible.value = false;
  } catch (err: any) {
    message.error('保存失败: ' + err.message);
  } finally {
    saving.value = false;
  }
};

// 组件挂载时加载模板列表
const loadTemplates = async () => {
  loading.value = true;
  try {
    await queryStore.loadQueryTemplates();
  } finally {
    loading.value = false;
  }
};

loadTemplates();
</script>

<style lang="scss" scoped>
.query-template {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .query-template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
    }
  }
  
  .query-template-list {
    flex: 1;
    overflow-y: auto;
    
    :deep(.ant-list-item) {
      padding: 12px 16px;
    }
  }
  
  .query-template-item-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .query-template-item-desc {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .template-desc {
      color: #666;
    }
    
    .sql-preview {
      font-family: monospace;
      color: #999;
    }
  }
}
</style>