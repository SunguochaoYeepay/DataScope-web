<template>
  <div class="query-page">
    <el-alert
      type="warning"
      title="查询管理API尚未实现"
      description="后端API未实现查询管理功能，此页面暂时不可用。数据源管理API已实现，请先使用数据源功能。"
      :closable="false"
      show-icon
      effect="light"
      style="margin-bottom: 20px;"
    />
    <el-layout>
      <!-- 主内容区 -->
      <el-main class="content">
        <el-card class="main-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">查询配置列表</span>
              <div class="header-actions">
                <el-button type="primary" @click="handleNewEditor">
                  <el-icon><EditPen /></el-icon>SQL编辑器
                </el-button>
                <el-button type="success" size="default" @click="handleAdd" :icon="Plus">新增查询</el-button>
                <el-button type="warning" @click="$router.push('/lowcode/query-designer')">
                  <el-icon><MagicStick /></el-icon>低代码查询设计器
                </el-button>
              </div>
            </div>
          </template>
          <el-table 
            :data="queryList" 
            style="width: 100%" 
            v-loading="tableLoading"
            border 
            stripe
            highlight-current-row
            element-loading-text="加载中..."
            element-loading-background="rgba(255, 255, 255, 0.7)"
            empty-text="暂无数据"
          >
            <el-table-column prop="name" label="查询名称" min-width="120" />
            <el-table-column prop="datasource" label="数据源" min-width="120" />
            <el-table-column prop="createTime" label="创建时间" min-width="160" />
            <el-table-column prop="updateTime" label="更新时间" min-width="160" />
            <el-table-column fixed="right" label="操作" width="200">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEdit(scope.row)" text>
                  编辑
                </el-button>
                <el-button size="small" type="success" @click="handleExecute(scope.row)" text>
                  执行
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row)" text>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-layout>

    <!-- 新增/编辑表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formTitle"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="查询名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入查询名称" />
        </el-form-item>
        <el-form-item label="数据源" prop="datasourceId">
          <el-select v-model="form.datasourceId" placeholder="请选择数据源" style="width: 100%">
            <el-option
              v-for="item in datasourceList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="SQL语句" prop="sqlTemplate">
          <el-input
            v-model="form.sqlTemplate"
            type="textarea"
            :rows="6"
            placeholder="请输入SQL语句"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            <el-icon><Check /></el-icon>确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 查询结果弹窗 -->
    <el-drawer
      v-model="resultVisible"
      title="查询结果"
      size="80%"
      destroy-on-close
      direction="rtl"
    >
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else-if="error" class="error-container">
        <el-empty :description="error" />
      </div>
      <div v-else-if="!queryResult || queryResult.rows.length === 0" class="empty-container">
        <el-empty description="暂无数据" />
      </div>
      <div v-else class="result-container">
        <div class="result-header">
          <span>共 {{ queryResult.rows.length }} 条记录</span>
        </div>
        <el-table :data="queryResult.rows" style="width: 100%" border stripe>
          <el-table-column
            v-for="column in queryResult.columns"
            :key="column.name"
            :prop="column.name"
            :label="column.label || column.name"
            min-width="150"
          />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { EditPen, Plus, Check, Delete, MagicStick } from '@element-plus/icons-vue'
import {
  getQueryList,
  getQueryDetail,
  createQuery,
  updateQuery,
  deleteQuery,
  executeQuery,
  getQueryFields
} from '../../api/query'
import { getDatasourceList } from '../../api/datasource'
import type { Query, QueryParameter, QueryResult, QueryExecuteRequest } from '../../api/query'
import type { Datasource } from '../../api/datasource'

// 定义API响应类型
interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
  code?: number;
  [key: string]: any;
}

// 路由实例
const router = useRouter()

// 表单相关
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const form = reactive<Query>({
  id: '',
  name: '',
  datasourceId: '',
  sqlTemplate: ''
})

// 数据加载
const tableLoading = ref(false)
const queryList = ref<Query[]>([])
const datasourceList = ref<Datasource[]>([])

// 查询结果相关接口
interface ColumnDefinition {
  name: string;
  label?: string;
  type?: string;
}

interface QueryResultType {
  columns: ColumnDefinition[];
  rows: Record<string, any>[];
  total?: number;
  executionTime?: number;
  sql?: string;
}

// 查询结果相关
const resultVisible = ref(false)
const loading = ref(false)
const error = ref('')
const queryResult = ref<QueryResultType | null>(null)

// 计算属性
const formTitle = computed(() => isEdit.value ? '编辑查询' : '新增查询')

// 表单校验规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入查询名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应为2-50个字符', trigger: 'blur' }
  ],
  datasourceId: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  sqlTemplate: [
    { required: true, message: '请输入SQL语句', trigger: 'blur' }
  ]
})

// 生命周期钩子
onMounted(async () => {
  await Promise.all([
    loadQueryList(),
    loadDatasourceList()
  ])
})

// 加载查询列表
const loadQueryList = async () => {
  tableLoading.value = true
  
  try {
    const result = await getQueryList()
    if (Array.isArray(result)) {
      queryList.value = result
    } else {
      const res = result as ApiResponse<Query[]>
      queryList.value = res.data || []
    }
  } catch (error: any) {
    ElMessage.error('加载查询列表失败: ' + error.message)
    queryList.value = []
  } finally {
    tableLoading.value = false
  }
}

// 加载数据源列表
const loadDatasourceList = async () => {
  try {
    const result = await getDatasourceList()
    if (Array.isArray(result)) {
      datasourceList.value = result
    } else {
      const res = result as ApiResponse<Datasource[]>
      datasourceList.value = res.data || []
    }
  } catch (error: any) {
    ElMessage.error('加载数据源列表失败: ' + error.message)
    datasourceList.value = []
  }
}

// 打开SQL编辑器页面
const handleNewEditor = () => {
  router.push('/query/editor')
}

// 新增查询
const handleAdd = () => {
  isEdit.value = false
  form.id = ''
  form.name = ''
  form.datasourceId = ''
  form.sqlTemplate = ''
  
  dialogVisible.value = true
}

// 编辑查询
const handleEdit = async (row: Query) => {
  isEdit.value = true
  tableLoading.value = true
  
  try {
    // 转换id为字符串确保类型安全
    const id = row.id ? String(row.id) : ''
    const result = await getQueryDetail(id)
    
    if (typeof result === 'object') {
      const res = result as ApiResponse<Query>
      if (res.data) {
        Object.assign(form, res.data)
      } else {
        Object.assign(form, result)
      }
    }
    
    dialogVisible.value = true
  } catch (error: any) {
    ElMessage.error('加载详情失败: ' + error.message)
  } finally {
    tableLoading.value = false
  }
}

// 执行查询
const handleExecute = async (row: any) => {
  try {
    loading.value = true
    resultVisible.value = true
    error.value = ''
    
    const res = await executeQuery({
      datasourceId: row.datasourceId,
      sql: row.sqlTemplate
    })
    
    // 确保结果是正确格式
    if (res && (Array.isArray(res.rows) || Array.isArray(res.columns))) {
      queryResult.value = res as QueryResultType
    } else if (res && 'data' in res && typeof res.data === 'object') {
      queryResult.value = res.data as QueryResultType
    } else {
      queryResult.value = {
        columns: [],
        rows: []
      }
      throw new Error('返回数据格式错误')
    }
  } catch (error: any) {
    console.error('执行查询失败:', error)
    error.value = error.message || '执行查询失败'
  } finally {
    loading.value = false
  }
}

// 删除查询
const handleDelete = async (row: Query) => {
  try {
    await ElMessageBox.confirm('确认删除该查询吗？', '提示', {
      type: 'warning',
      icon: Delete
    })
    
    tableLoading.value = true
    
    try {
      // 转换id为字符串确保类型安全
      const id = row.id ? String(row.id) : ''
      await deleteQuery(id)
      ElMessage.success('删除成功')
      loadQueryList()
    } catch (error: any) {
      ElMessage.error('删除失败: ' + error.message)
    } finally {
      tableLoading.value = false
    }
  } catch (error) {
    // 取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        if (isEdit.value) {
          // 转换id为字符串确保类型安全
          const id = String(form.id)
          const formData = {
            name: form.name,
            description: form.description,
            datasourceId: String(form.datasourceId),
            sqlTemplate: form.sqlTemplate,
            timeout: form.timeout,
            parameters: form.parameters
          }
          await updateQuery(id, formData)
          ElMessage.success('更新成功')
        } else {
          const formData = {
            name: form.name,
            description: form.description,
            datasourceId: String(form.datasourceId),
            sqlTemplate: form.sqlTemplate,
            timeout: form.timeout,
            parameters: form.parameters
          }
          await createQuery(formData)
          ElMessage.success('创建成功')
        }
        
        dialogVisible.value = false
        loadQueryList()
      } catch (error: any) {
        ElMessage.error('保存失败: ' + error.message)
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.query-page {
  height: 100%;
  background: #fff;

  .content {
    padding: 20px;
  }

  .main-card {
    transition: all 0.3s;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 18px;
    font-weight: 500;
  }

  .query-result {
    width: 100%;
  }

  .result-info {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .no-result {
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialog-footer {
    padding: 20px 0 0;
    text-align: right;
    
    button {
      margin-left: 10px;
      transition: all 0.3s;
    }
  }
  
  :deep(.el-table) {
    margin-top: 10px;
    border-radius: 4px;
    overflow: hidden;
    
    .el-table__row {
      transition: all 0.2s;
    }
  }
  
  :deep(.el-button) {
    transition: all 0.3s;
    
    &.is-text {
      margin-right: 8px;
      padding: 5px 8px;
    }
    
    &.is-text:hover {
      background-color: rgba(64, 158, 255, 0.1);
      
      &.el-button--danger {
        background-color: rgba(245, 108, 108, 0.1);
      }
      
      &.el-button--success {
        background-color: rgba(103, 194, 58, 0.1);
      }
    }
  }
}
</style>