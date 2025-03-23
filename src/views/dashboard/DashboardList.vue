# DashboardList.vue
<template>
  <div class="dashboard-list">
    <!-- 顶部操作栏 -->
    <div class="header-bar">
      <div class="left">
        <h2 class="title">仪表盘</h2>
        <span class="subtitle">创建和管理数据可视化仪表盘</span>
      </div>
      <div class="right">
        <a-button type="primary" @click="handleCreate">
          <template #icon><PlusOutlined /></template>
          创建仪表盘
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <a-card class="filter-card" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="搜索仪表盘"
            style="width: 100%"
          />
        </a-col>
        <a-col :span="8">
          <a-select
            v-model:value="filterType"
            style="width: 100%"
            placeholder="筛选类型"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="created">我创建的</a-select-option>
            <a-select-option value="favorite">我收藏的</a-select-option>
            <a-select-option value="shared">共享给我的</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-select
            v-model:value="sortBy"
            style="width: 100%"
            placeholder="排序方式"
          >
            <a-select-option value="updated">最近更新</a-select-option>
            <a-select-option value="created">最近创建</a-select-option>
            <a-select-option value="name">名称</a-select-option>
            <a-select-option value="views">访问次数</a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </a-card>

    <!-- 仪表盘列表 -->
    <a-row :gutter="[16, 16]" class="dashboard-grid">
      <a-col
        v-for="dashboard in filteredDashboards"
        :key="dashboard.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <a-card
          :hoverable="true"
          class="dashboard-card"
          @click="handleView(dashboard)"
        >
          <template #cover>
            <div class="card-cover">
              <img
                :src="dashboard.thumbnail || '/images/dashboard-placeholder.png'"
                :alt="dashboard.name"
              />
            </div>
          </template>
          <template #actions>
            <StarOutlined
              :class="{ 'favorite': dashboard.favorite }"
              @click.stop="toggleFavorite(dashboard)"
            />
            <EditOutlined @click.stop="handleEdit(dashboard)" />
            <ShareAltOutlined @click.stop="handleShare(dashboard)" />
            <DeleteOutlined @click.stop="handleDelete(dashboard)" />
          </template>
          <a-card-meta :title="dashboard.name">
            <template #description>
              <div class="dashboard-meta">
                <div class="description">{{ dashboard.description || '暂无描述' }}</div>
                <div class="info">
                  <span class="time">
                    <ClockCircleOutlined /> {{ formatDate(dashboard.updatedAt) }}
                  </span>
                  <span class="views">
                    <EyeOutlined /> {{ dashboard.views }}
                  </span>
                  <span class="creator">
                    <UserOutlined /> {{ dashboard.creator?.name }}
                  </span>
                </div>
              </div>
            </template>
          </a-card-meta>
        </a-card>
      </a-col>

      <!-- 空状态 -->
      <a-col v-if="filteredDashboards.length === 0" :span="24">
        <a-empty
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          :description="getEmptyMessage()"
        >
          <template #extra>
            <a-button type="primary" @click="handleCreate">
              创建仪表盘
            </a-button>
          </template>
        </a-empty>
      </a-col>
    </a-row>

    <!-- 删除确认对话框 -->
    <a-modal
      v-model:visible="deleteDialog"
      title="删除仪表盘"
      @ok="confirmDelete"
      :confirmLoading="isDeleting"
      okType="danger"
    >
      <p>确定要删除仪表盘"{{ selectedDashboard?.name }}"吗？此操作无法撤销。</p>
    </a-modal>

    <!-- 分享对话框 -->
    <a-modal
      v-model:visible="shareDialog"
      title="分享仪表盘"
      @ok="confirmShare"
      :confirmLoading="isSharing"
    >
      <a-tabs v-model:activeKey="shareTab">
        <a-tab-pane key="link" tab="链接分享">
          <a-form layout="vertical">
            <a-form-item>
              <a-input-group compact>
                <a-input
                  v-model:value="shareLink"
                  readonly
                  style="width: calc(100% - 80px)"
                />
                <a-button type="primary" @click="copyShareLink">复制</a-button>
              </a-input-group>
            </a-form-item>
            <a-form-item>
              <a-switch
                v-model:checked="shareConfig.requirePassword"
                checkedChildren="需要密码"
                unCheckedChildren="无需密码"
              />
            </a-form-item>
            <a-form-item v-if="shareConfig.requirePassword">
              <a-input-password
                v-model:value="shareConfig.password"
                placeholder="请输入访问密码"
              />
            </a-form-item>
            <a-form-item>
              <a-switch
                v-model:checked="shareConfig.enableExpiry"
                checkedChildren="设置有效期"
                unCheckedChildren="永久有效"
              />
            </a-form-item>
            <a-form-item v-if="shareConfig.enableExpiry">
              <a-date-picker
                v-model:value="shareConfig.expiryDate"
                style="width: 100%"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="user" tab="指定用户">
          <a-form layout="vertical">
            <a-form-item>
              <a-select
                v-model:value="selectedUsers"
                mode="multiple"
                placeholder="选择要分享的用户"
                style="width: 100%"
                :options="userOptions"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message, Empty } from 'ant-design-vue'
import {
  PlusOutlined,
  StarOutlined,
  EditOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()

// 状态
const searchQuery = ref('')
const filterType = ref('all')
const sortBy = ref('updated')
const deleteDialog = ref(false)
const shareDialog = ref(false)
const isDeleting = ref(false)
const isSharing = ref(false)
const selectedDashboard = ref<any>(null)
const shareTab = ref('link')
const shareLink = ref('')
const shareConfig = ref({
  requirePassword: false,
  password: '',
  enableExpiry: false,
  expiryDate: null,
})
const selectedUsers = ref([])

// 模拟数据
const dashboards = ref([
  {
    id: '1',
    name: '示例仪表盘',
    description: '这是一个示例仪表盘',
    thumbnail: '',
    favorite: false,
    views: 100,
    updatedAt: '2024-03-22 12:00:00',
    createdAt: '2024-03-22 12:00:00',
    shared: false,
    creator: {
      name: 'Admin',
    },
  },
])

// 用户选项
const userOptions = ref([
  { label: '用户1', value: '1' },
  { label: '用户2', value: '2' },
  { label: '用户3', value: '3' },
])

// 计算属性
const filteredDashboards = computed(() => {
  let result = [...dashboards.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    result = result.filter(d => 
      d.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 类型过滤
  switch (filterType.value) {
    case 'created':
      result = result.filter(d => d.creator.name === 'Admin')
      break
    case 'favorite':
      result = result.filter(d => d.favorite)
      break
    case 'shared':
      result = result.filter(d => d.shared)
      break
  }

  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'updated':
        return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
      case 'created':
        return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      case 'name':
        return a.name.localeCompare(b.name)
      case 'views':
        return b.views - a.views
      default:
        return 0
    }
  })

  return result
})

// 方法
const handleCreate = () => {
  router.push('/dashboard/create')
}

const handleView = (dashboard: any) => {
  router.push(`/dashboard/${dashboard.id}`)
}

const handleEdit = (dashboard: any) => {
  router.push(`/dashboard/${dashboard.id}/edit`)
}

const handleShare = (dashboard: any) => {
  selectedDashboard.value = dashboard
  shareDialog.value = true
  shareLink.value = `${window.location.origin}/share/dashboard/${dashboard.id}`
}

const handleDelete = (dashboard: any) => {
  selectedDashboard.value = dashboard
  deleteDialog.value = true
}

const toggleFavorite = (dashboard: any) => {
  dashboard.favorite = !dashboard.favorite
  message.success(dashboard.favorite ? '已添加到收藏' : '已取消收藏')
}

const confirmDelete = async () => {
  if (!selectedDashboard.value) return
  
  isDeleting.value = true
  try {
    // TODO: 调用删除 API
    message.success('删除成功')
    deleteDialog.value = false
  } catch (error: any) {
    message.error('删除失败：' + error.message)
  } finally {
    isDeleting.value = false
  }
}

const confirmShare = async () => {
  if (!selectedDashboard.value) return
  
  isSharing.value = true
  try {
    // TODO: 调用分享 API
    message.success('分享成功')
    shareDialog.value = false
  } catch (error: any) {
    message.error('分享失败：' + error.message)
  } finally {
    isSharing.value = false
  }
}

const copyShareLink = () => {
  navigator.clipboard.writeText(shareLink.value)
  message.success('链接已复制到剪贴板')
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getEmptyMessage = () => {
  switch (filterType.value) {
    case 'created':
      return '您还没有创建任何仪表盘'
    case 'favorite':
      return '您还没有收藏任何仪表盘'
    case 'shared':
      return '没有共享给您的仪表盘'
    default:
      return '暂无仪表盘'
  }
}
</script>

<style lang="scss" scoped>
.dashboard-list {
  padding: 24px;

  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .left {
      .title {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }

      .subtitle {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }

  .filter-card {
    margin-bottom: 24px;
  }

  .dashboard-grid {
    .dashboard-card {
      height: 100%;

      .card-cover {
        height: 160px;
        overflow: hidden;
        background-color: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .dashboard-meta {
        .description {
          margin-bottom: 8px;
          color: rgba(0, 0, 0, 0.45);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .info {
          display: flex;
          align-items: center;
          color: rgba(0, 0, 0, 0.45);
          font-size: 12px;

          > span {
            display: flex;
            align-items: center;
            margin-right: 16px;

            .anticon {
              margin-right: 4px;
            }
          }
        }
      }

      :deep(.ant-card-actions) {
        .favorite {
          color: #faad14;
        }
      }
    }
  }
}
</style>