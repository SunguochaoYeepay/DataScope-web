<!-- 数据源管理页面 -->
<template>
  <div class="datasource-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <a-page-header
        title="数据源管理"
        :breadcrumb="{ routes }"
      >
        <template #extra>
          <a-space>
            <a-button>
              <template #icon><question-circle-outlined /></template>
              帮助
            </a-button>
          </a-space>
        </template>
      </a-page-header>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 数据源列表 -->
      <data-source-list
        @add="showDataSourceForm()"
        @edit="showDataSourceForm($event)"
      />

      <!-- 数据源表单弹窗 -->
      <data-source-form
        v-model:visible="formVisible"
        :data-source="currentDataSource"
        @success="handleFormSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import DataSourceList from '@/components/DataSourceList.vue'
import DataSourceForm from '@/components/DataSourceForm.vue'
import type { DataSourceResponse } from '@/types/api'

// 面包屑路由
const routes = [
  {
    path: '/',
    breadcrumbName: '首页',
  },
  {
    path: '/datasource',
    breadcrumbName: '数据源管理',
  },
]

// 表单弹窗可见性
const formVisible = ref(false)
// 当前编辑的数据源
const currentDataSource = ref<DataSourceResponse | null>(null)

// 显示数据源表单
const showDataSourceForm = (dataSource?: DataSourceResponse) => {
  currentDataSource.value = dataSource || null
  formVisible.value = true
}

// 处理表单提交成功
const handleFormSuccess = () => {
  formVisible.value = false
  currentDataSource.value = null
}
</script>

<style scoped>
.datasource-page {
  height: 100%;
  background: #f0f2f5;
}

.page-header {
  background: #fff;
  padding: 16px 0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.page-header :deep(.ant-page-header) {
  padding: 0 24px;
}

.page-content {
  padding: 24px;
  min-height: calc(100% - 96px);
}

:deep(.ant-pro-page-container-children-content) {
  margin: 24px;
}
</style> 