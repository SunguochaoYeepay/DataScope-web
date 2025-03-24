<template>
  <div class="dashboard-page">
    <el-alert
      type="warning"
      title="仪表盘管理API尚未实现"
      description="后端API未实现仪表盘管理功能，此页面暂时不可用。数据源管理API已实现，请先使用数据源功能。"
      :closable="false"
      show-icon
      effect="light"
      style="margin-bottom: 20px;"
    />
    
    <div class="page-header">
      <h2>仪表盘管理</h2>
      <el-button type="primary" @click="handleCreateDashboard">新建仪表盘</el-button>
    </div>
    
    <!-- 仪表盘列表 -->
    <el-empty v-if="dashboardList.length === 0" description="暂无仪表盘" />
    
    <div v-else class="dashboard-list">
      <el-row :gutter="20">
        <el-col v-for="item in dashboardList" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card" @click="handleViewDashboard(item.id)">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description || '暂无描述' }}</p>
            <div class="card-footer">
              <span>创建时间: {{ formatDate(item.createdAt) }}</span>
              <el-button-group>
                <el-button size="small" icon="Edit" @click.stop="handleEditDashboard(item.id)"></el-button>
                <el-button size="small" icon="Delete" @click.stop="handleDeleteDashboard(item.id)"></el-button>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDashboardList, deleteDashboard } from '../../api/dashboard'
import type { Dashboard } from '../../api/dashboard'
import { useRouter } from 'vue-router'

const router = useRouter()
const dashboardList = ref<Dashboard[]>([])
const loading = ref(false)

// 获取仪表盘列表
const fetchDashboardList = async () => {
  loading.value = true
  try {
    const response = await getDashboardList()
    dashboardList.value = response || []
  } catch (error: any) {
    const errorMessage = error.error || error.message || '获取仪表盘列表失败'
    ElMessage.error(errorMessage)
    dashboardList.value = []
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

// 查看仪表盘
const handleViewDashboard = (id: number) => {
  router.push(`/dashboard/view/${id}`)
}

// 创建仪表盘
const handleCreateDashboard = () => {
  router.push('/dashboard/create')
}

// 编辑仪表盘
const handleEditDashboard = (id: number) => {
  router.push(`/dashboard/edit/${id}`)
}

// 删除仪表盘
const handleDeleteDashboard = (id: number) => {
  ElMessageBox.confirm('确定要删除该仪表盘吗？此操作不可逆', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteDashboard(String(id))
      ElMessage.success('删除成功')
      fetchDashboardList()
    } catch (error: any) {
      const errorMessage = error.error || error.message || '删除失败'
      ElMessage.error(errorMessage)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchDashboardList()
})
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-list {
  margin-top: 20px;
}

.dashboard-card {
  height: 200px;
  margin-bottom: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.dashboard-card h3 {
  margin-top: 0;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}
</style> 