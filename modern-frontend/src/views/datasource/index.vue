<template>
  <div class="datasource-page">
    <el-layout>
      <!-- 主内容区 -->
      <el-main class="content">
        <el-card class="main-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据源列表</span>
              <el-button type="primary" size="default" @click="handleAdd" :icon="Plus">新增数据源</el-button>
            </div>
          </template>
          <el-table 
            :data="datasourceList" 
            style="width: 100%" 
            border 
            stripe
            highlight-current-row
            v-loading="tableLoading"
            element-loading-text="加载中..."
            element-loading-background="rgba(255, 255, 255, 0.7)"
          >
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column prop="type" label="类型" min-width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.type === 'MYSQL' ? 'primary' : 'success'"
                  effect="plain"
                  size="small"
                >
                  {{ scope.row.type === 'MYSQL' ? 'MySQL' : 'PostgreSQL' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="host" label="主机地址" min-width="140" />
            <el-table-column prop="port" label="端口" width="80" />
            <el-table-column prop="databaseName" label="数据库" min-width="120" />
            <el-table-column fixed="right" label="操作" width="150">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEdit(scope.row)" text>
                  编辑
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
      width="500px"
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
        <el-form-item label="数据源名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="数据源类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择数据源类型" style="width: 100%">
            <el-option label="MySQL" value="MYSQL" />
            <el-option label="PostgreSQL" value="POSTGRESQL" />
          </el-select>
        </el-form-item>
        <el-form-item label="主机地址" prop="host">
          <el-input v-model="form.host" placeholder="请输入主机地址" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="form.port" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item label="数据库" prop="databaseName">
          <el-input v-model="form.databaseName" placeholder="请输入数据库名称" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="warning" @click="handleTestConnection" :loading="testLoading">
            <el-icon><Connection /></el-icon>测试连接
          </el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            <el-icon><Check /></el-icon>确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDatasourceList,
  getDatasourceDetail,
  createDatasource,
  updateDatasource,
  deleteDatasource,
  testDatasourceConnection
} from '../../api/datasource'
import type { Datasource } from '../../api/datasource'
import { Plus, Edit, Delete, Connection, Check } from '@element-plus/icons-vue'

// 定义API响应类型
interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
  code?: number;
  [key: string]: any;
}

// 数据源列表
const datasourceList = ref<Datasource[]>([])
const tableLoading = ref(false)
const testLoading = ref(false)
const submitLoading = ref(false)

// 表单相关
const dialogVisible = ref(false)
const formTitle = ref('新增数据源')
const formRef = ref<FormInstance>()
const form = reactive<Datasource>({
  name: '',
  type: '',
  host: '',
  port: '',
  databaseName: '',
  username: '',
  password: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  databaseName: [{ required: true, message: '请输入数据库名称', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

// 加载数据源列表
const loadDatasourceList = async () => {
  tableLoading.value = true
  
  try {
    const result = await getDatasourceList()
    // 处理不同的API响应格式
    if (Array.isArray(result)) {
      datasourceList.value = result
    } else {
      const res = result as ApiResponse<Datasource[]>
      datasourceList.value = res.data || []
    }
  } catch (error: any) {
    ElMessage.error('加载数据源列表失败: ' + error.message)
    datasourceList.value = []
  } finally {
    tableLoading.value = false
  }
}

// 新增数据源
const handleAdd = () => {
  formTitle.value = '新增数据源'
  Object.assign(form, {
    name: '',
    type: '',
    host: '',
    port: '',
    databaseName: '',
    username: '',
    password: ''
  })
  dialogVisible.value = true
}

// 编辑数据源
const handleEdit = async (row: Datasource) => {
  formTitle.value = '编辑数据源'
  tableLoading.value = true
  
  try {
    const result = await getDatasourceDetail(row.id as string | number)
    
    if (typeof result === 'object') {
      const res = result as ApiResponse<Datasource>
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

// 删除数据源
const handleDelete = (row: Datasource) => {
  ElMessageBox.confirm(
    `确定要删除数据源 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      icon: Delete
    }
  ).then(async () => {
    tableLoading.value = true
    
    try {
      await deleteDatasource(row.id as string | number)
      ElMessage.success('删除成功')
      loadDatasourceList()
    } catch (error: any) {
      ElMessage.error('删除失败: ' + error.message)
    } finally {
      tableLoading.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 测试连接
const handleTestConnection = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      testLoading.value = true
      
      try {
        console.log('测试连接表单数据:', JSON.stringify(form))
        
        // 确保测试请求中包含名称字段
        const testParams = {
          id: form.id,
          name: form.name || `测试连接_${new Date().getTime()}`,
          type: form.type,
          host: form.host,
          port: form.port,
          databaseName: form.databaseName,
          username: form.username,
          password: form.password || ''
        }
        
        console.log('发送测试连接请求参数:', JSON.stringify(testParams))
        console.log('测试连接方法:', form.id ? 'POST /v1/datasources/{id}/test' : 'POST /v1/datasources?action=test-connection')
        
        const result = await testDatasourceConnection(testParams)
        console.log('测试连接响应:', JSON.stringify(result))
        
        // 处理不同响应结构
        let isSuccess = false
        
        if (result === true) {
          isSuccess = true
        } else if (typeof result === 'object') {
          const res = result as ApiResponse<boolean>
          isSuccess = res.success === true || res.data === true
        }
          
        if (isSuccess) {
          ElMessage.success('连接成功')
        } else {
          ElMessage.error('连接失败')
        }
      } catch (error: any) {
        console.error('测试连接失败:', error)
        // 详细记录错误信息
        if (error.response) {
          console.error('错误响应状态:', error.response.status)
          console.error('错误响应数据:', error.response.data)
          console.error('错误请求配置:', error.config)
        }
        ElMessage.error('连接失败: ' + (error.message || error.response?.data?.message || '未知错误'))
      } finally {
        testLoading.value = false
      }
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        console.log('提交数据源表单数据:', JSON.stringify(form))
        
        if (form.id) {
          await updateDatasource(form)
          ElMessage.success('更新成功')
        } else {
          await createDatasource(form)
          ElMessage.success('创建成功')
        }
        
        dialogVisible.value = false
        loadDatasourceList()
      } catch (error: any) {
        console.error('保存数据源失败:', error)
        ElMessage.error('保存失败: ' + (error.message || error.response?.data?.message || '未知错误'))
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 组件挂载时加载数据源列表
loadDatasourceList()
</script>

<style lang="scss" scoped>
.datasource-page {
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
    }
  }
}
</style>