<template>
  <div class="lowcode-page">
    <el-card class="main-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">低代码开发平台</span>
          <span class="card-subtitle">无需编码，快速构建数据应用</span>
        </div>
      </template>

      <div class="tool-cards">
        <el-card class="tool-card" shadow="hover" @click="$router.push('/lowcode/query-designer')">
          <div class="card-icon">
            <el-icon :size="40" color="#409EFF"><Connection /></el-icon>
          </div>
          <div class="card-content">
            <h3>查询设计器</h3>
            <p>零代码构建数据查询界面，支持复杂查询条件、结果列配置和数据展示</p>
            <el-button type="primary" plain>
              进入设计器
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
        
        <el-card class="tool-card disabled" shadow="hover">
          <div class="card-icon">
            <el-icon :size="40" color="#909399"><Grid /></el-icon>
          </div>
          <div class="card-content">
            <h3>表单设计器 <el-tag size="small">即将推出</el-tag></h3>
            <p>快速创建数据录入表单，支持多种控件类型、字段验证和提交处理</p>
            <el-button type="info" plain disabled>
              即将推出
            </el-button>
          </div>
        </el-card>
        
        <el-card class="tool-card disabled" shadow="hover">
          <div class="card-icon">
            <el-icon :size="40" color="#909399"><DataAnalysis /></el-icon>
          </div>
          <div class="card-content">
            <h3>仪表盘设计器 <el-tag size="small">即将推出</el-tag></h3>
            <p>可视化方式创建多图表仪表盘，支持数据联动、过滤器和自动刷新</p>
            <el-button type="info" plain disabled>
              即将推出
            </el-button>
          </div>
        </el-card>
      </div>
      
      <!-- 已创建的查询设计列表 -->
      <div class="existing-designs" v-if="queryDesigns.length > 0">
        <el-divider content-position="left">
          <div class="divider-content">
            <el-icon><List /></el-icon>
            已创建的查询设计
          </div>
        </el-divider>
        
        <el-table :data="queryDesigns" border stripe style="width: 100%">
          <el-table-column prop="name" label="查询名称" min-width="150">
            <template #default="{ row }">
              <el-link type="primary" @click="openQueryDesign(row.id)">{{ row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="220" />
          <el-table-column prop="tableName" label="数据表" min-width="120" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="180">
            <template #default="{ row }">
              {{ formatDate(row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" plain @click="openQueryDesign(row.id)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" plain @click="showDeleteConfirm(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-divider>
        <el-icon><MagicStick /></el-icon>
      </el-divider>
      
      <div class="features">
        <h3>低代码平台特性</h3>
        <ul class="feature-list">
          <li>
            <el-icon color="#67C23A"><Check /></el-icon>
            <span>零代码开发，非技术用户也能轻松使用</span>
          </li>
          <li>
            <el-icon color="#67C23A"><Check /></el-icon>
            <span>所见即所得的设计体验，拖拽式界面构建</span>
          </li>
          <li>
            <el-icon color="#67C23A"><Check /></el-icon>
            <span>丰富的组件库，满足各种业务场景需求</span>
          </li>
          <li>
            <el-icon color="#67C23A"><Check /></el-icon>
            <span>自动生成API调用代码，无缝对接后端服务</span>
          </li>
          <li>
            <el-icon color="#67C23A"><Check /></el-icon>
            <span>配置即应用，一键发布，免部署运维</span>
          </li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Connection, Grid, DataAnalysis, MagicStick, ArrowRight, Check, Edit, Delete, List } from '@element-plus/icons-vue'
import { getQueryDesigns, deleteQueryDesign } from '../../api/lowcode'
import type { QueryDesign } from '../../types/lowcode'

const router = useRouter()
const queryDesigns = ref<QueryDesign[]>([])
const loading = ref(false)

// 获取查询设计列表
const fetchQueryDesigns = async () => {
  loading.value = true
  try {
    const res = await getQueryDesigns()
    if (res.code === 0 && res.data) {
      queryDesigns.value = res.data
    } else {
      ElMessage.error(res.message || '获取查询设计列表失败')
    }
  } catch (error) {
    console.error('获取查询设计列表出错:', error)
    ElMessage.error('获取查询设计列表出错')
  } finally {
    loading.value = false
  }
}

// 打开查询设计
const openQueryDesign = (id: string) => {
  router.push(`/lowcode/query-designer?id=${id}`)
}

// 显示删除确认对话框
const showDeleteConfirm = (row: QueryDesign) => {
  ElMessageBox.confirm(
    `确定要删除查询设计 "${row.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      handleDeleteQueryDesign(row.id)
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 删除查询设计
const handleDeleteQueryDesign = async (id: string) => {
  try {
    const res = await deleteQueryDesign(id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      // 重新获取列表
      fetchQueryDesigns()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除查询设计出错:', error)
    ElMessage.error('删除查询设计出错')
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

// 页面加载时获取查询设计列表
onMounted(() => {
  fetchQueryDesigns()
})
</script>

<style lang="scss" scoped>
.lowcode-page {
  padding: 20px;
  
  .main-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    
    .card-title {
      font-size: 20px;
      font-weight: 600;
    }
    
    .card-subtitle {
      margin-left: 16px;
      color: #909399;
      font-size: 14px;
    }
  }
  
  .tool-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    
    .tool-card {
      width: calc(33.33% - 14px);
      min-width: 300px;
      display: flex;
      transition: all 0.3s;
      cursor: pointer;
      
      &:not(.disabled):hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
      
      &.disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      .card-icon {
        padding: 24px 16px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      }
      
      .card-content {
        flex: 1;
        padding: 20px 20px 20px 0;
        
        h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        p {
          margin-top: 0;
          margin-bottom: 20px;
          color: #606266;
          line-height: 1.5;
        }
      }
    }
  }
  
  .existing-designs {
    margin: 30px 0;
    
    .divider-content {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    
    .el-table {
      margin-top: 16px;
      border-radius: 4px;
      overflow: hidden;
    }
  }
  
  .features {
    margin-top: 20px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      
      li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        
        .el-icon {
          flex-shrink: 0;
        }
      }
    }
  }
  
  @media (max-width: 1200px) {
    .tool-cards .tool-card {
      width: calc(50% - 10px);
    }
    
    .features .feature-list {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 768px) {
    .tool-cards .tool-card {
      width: 100%;
    }
  }
}
</style>