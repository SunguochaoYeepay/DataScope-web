<template>
  <div class="metadata-tree">
    <!-- 工具栏 -->
    <div class="toolbar">
      <a-space>
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索表名"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-button @click="handleRefresh">
          <template #icon><reload-outlined /></template>
          刷新
        </a-button>
      </a-space>
    </div>

    <!-- 树形控件 -->
    <a-tree
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      :tree-data="treeData"
      :field-names="fieldNames"
      :load-data="onLoadData"
      :loading="loading"
      :filter-tree-node="filterTreeNode"
      @select="handleSelect"
    >
      <!-- 自定义节点图标 -->
      <template #icon="{ data }">
        <database-outlined v-if="data.type === 'database'" />
        <table-outlined v-else-if="data.type === 'table'" />
        <field-binary-outlined v-else-if="data.type === 'column'" />
      </template>

      <!-- 自定义节点标题 -->
      <template #title="{ data }">
        <span>
          {{ data.title }}
          <span v-if="data.type === 'column'" class="column-type">
            ({{ data.dataType }})
          </span>
        </span>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  ReloadOutlined,
  DatabaseOutlined,
  TableOutlined,
  FieldBinaryOutlined,
} from '@ant-design/icons-vue';
import { useDataSourceStore } from '@/stores/datasource';

// Props
const props = defineProps<{
  datasourceId: string;
}>();

// Store
const datasourceStore = useDataSourceStore();

// 状态
const loading = ref(false);
const searchText = ref('');
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);

// 字段名映射
const fieldNames = {
  title: 'title',
  key: 'key',
  children: 'children',
};

// 计算属性：树形数据
const treeData = computed(() => {
  const metadata = datasourceStore.metadata[props.datasourceId] || [];
  return formatTreeData(metadata);
});

// 格式化树形数据
const formatTreeData = (metadata: any[]) => {
  return metadata.map((database) => ({
    key: `db-${database.name}`,
    title: database.name,
    type: 'database',
    isLeaf: false,
    children: database.tables?.map((table: any) => ({
      key: `table-${database.name}-${table.name}`,
      title: table.name,
      type: 'table',
      isLeaf: false,
      children: table.columns?.map((column: any) => ({
        key: `column-${database.name}-${table.name}-${column.name}`,
        title: column.name,
        type: 'column',
        dataType: column.dataType,
        isLeaf: true,
      })),
    })),
  }));
};

// 生命周期钩子
onMounted(() => {
  loadMetadata();
});

// 加载元数据
const loadMetadata = async () => {
  try {
    loading.value = true;
    await datasourceStore.loadMetadata(props.datasourceId);
  } catch (err: any) {
    message.error('加载元数据失败');
  } finally {
    loading.value = false;
  }
};

// 处理节点加载
const onLoadData = async (treeNode: any) => {
  if (treeNode.dataRef.children) {
    return;
  }

  try {
    const key = treeNode.dataRef.key;
    const [type, ...parts] = key.split('-');

    if (type === 'db') {
      const database = parts[0];
      await datasourceStore.loadTables(props.datasourceId, database);
    } else if (type === 'table') {
      const [database, table] = parts;
      await datasourceStore.loadColumns(props.datasourceId, database, table);
    }
  } catch (err: any) {
    message.error('加载数据失败');
  }
};

// 处理搜索
const handleSearch = () => {
  // 展开所有节点以便搜索
  if (searchText.value) {
    expandedKeys.value = treeData.value
      .map((node: any) => [
        node.key,
        ...(node.children?.map((child: any) => child.key) || []),
      ])
      .flat();
  } else {
    expandedKeys.value = [];
  }
};

// 处理刷新
const handleRefresh = () => {
  loadMetadata();
};

// 处理选择
const handleSelect = (selectedKeys: string[], { node }: any) => {
  // 可以在这里处理节点选择事件
  console.log('Selected:', node.dataRef);
};

// 过滤树节点
const filterTreeNode = (searchValue: string, node: any) => {
  const { title } = node.dataRef;
  return title.toLowerCase().includes(searchValue.toLowerCase());
};
</script>

<style lang="scss" scoped>
.metadata-tree {
  height: 100%;
  display: flex;
  flex-direction: column;

  .toolbar {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-tree {
    flex: 1;
    overflow: auto;
    padding: 16px;
  }

  .column-type {
    color: #999;
    margin-left: 4px;
  }
}
</style>