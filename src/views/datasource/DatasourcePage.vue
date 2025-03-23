<template>
  <div class="datasource-page">
    <a-layout>
      <!-- 主内容区 -->
      <a-layout-content class="content">
        <data-source-list
          @select="handleDatasourceSelect"
          @edit="handleDatasourceEdit"
        />
      </a-layout-content>

      <!-- 侧边栏 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        class="sider"
        width="300"
        collapsible
        collapsedWidth="0"
        :trigger="null"
        :style="{ display: selectedDatasource ? 'block' : 'none' }"
      >
        <metadata-tree
          v-if="selectedDatasource"
          :datasource-id="selectedDatasource.id"
        />
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataSourceList from '@/components/datasource/DataSourceList.vue';
import MetadataTree from '@/components/datasource/MetadataTree.vue';

// 状态
const collapsed = ref(false);
const selectedDatasource = ref<any>(null);

// 处理数据源选择
const handleDatasourceSelect = (datasource: any) => {
  selectedDatasource.value = datasource;
  collapsed.value = false;
};

// 处理数据源编辑
const handleDatasourceEdit = (datasource: any) => {
  // 如果编辑的是当前选中的数据源，清空选择
  if (selectedDatasource.value?.id === datasource.id) {
    selectedDatasource.value = null;
  }
};
</script>

<style lang="scss" scoped>
.datasource-page {
  height: 100%;
  background: #fff;

  :deep(.ant-layout) {
    height: 100%;
    background: #fff;
  }

  .sider {
    position: fixed;
    right: 0;
    top: 64px;
    bottom: 0;
    background: #fff;
    border-left: 1px solid #f0f0f0;
    z-index: 100;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
  }

  .content {
    background: #fff;
    transition: all 0.2s;
    margin-right: v-bind("selectedDatasource ? '300px' : '0'");
    padding: 0;
  }
}
</style>