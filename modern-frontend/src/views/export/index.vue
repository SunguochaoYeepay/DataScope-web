<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  getExportConfigs, 
  searchExportConfigs, 
  createExportConfig, 
  updateExportConfig, 
  deleteExportConfig, 
  executeExport, 
  ExportConfig, 
  ColumnConfig, 
  PageRequest 
} from '../../api/export'
import { getDatasourceList } from '../../api/datasource'
import type { Datasource } from '../../api/datasource'

// 数据源列表
const datasources = ref<Datasource[]>([])
// 导出配置列表
const exportConfigs = ref<ExportConfig[]>([])
// 加载状态
const loading = ref(false)
// 表单对话框可见性
const dialogVisible = ref(false)
// 当前选中的导出配置ID
const currentConfigId = ref<string>('')
// 分页参数
const pagination = reactive<PageRequest>({
  page: 0,
  size: 10
})

// 表单数据
const formData = reactive<ExportConfig>({
  name: '',
  dataSourceId: '',
  tableName: '',
  exportType: 'CSV',
  columnConfig: []
})

// 表单规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dataSourceId: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  tableName: [
    { required: true, message: '请输入表名', trigger: 'blur' }
  ],
  exportType: [
    { required: true, message: '请选择导出类型', trigger: 'change' }
  ]
})

// 表单引用
const formRef = ref<FormInstance>()

// 初始化
onMounted(async () => {
  try {
    loading.value = true
    
    // 加载数据源列表
    const dsResponse = await getDatasourceList()
    
    if (Array.isArray(dsResponse)) {
      datasources.value = dsResponse
    } else if (dsResponse && 'data' in dsResponse) {
      datasources.value = dsResponse.data
    }
    
    // 加载导出配置列表
    await loadExportConfigs()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})

// 加载导出配置列表
const loadExportConfigs = async () => {
  try {
    loading.value = true
    
    const response = await searchExportConfigs({
      pageable: pagination
    })
    
    if (response?.data?.content) {
      exportConfigs.value = response.data.content
    }
  } catch (error) {
    console.error('加载导出配置失败:', error)
    ElMessage.error('加载导出配置失败')
  } finally {
    loading.value = false
  }
}

// 打开创建配置对话框
const openCreateDialog = () => {
  // 重置表单数据
  Object.assign(formData, {
    name: '',
    dataSourceId: '',
    tableName: '',
    exportType: 'CSV',
    columnConfig: []
  })
  
  currentConfigId.value = ''
  dialogVisible.value = true
}

// 打开编辑配置对话框
const openEditDialog = (config: ExportConfig) => {
  // 填充表单数据
  Object.assign(formData, { ...config })
  
  currentConfigId.value = config.id || ''
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (currentConfigId.value) {
      // 更新配置
      const response = await updateExportConfig({
        ...formData,
        id: currentConfigId.value
      })
      
      if (response?.code === 200) {
        ElMessage.success('更新配置成功')
        dialogVisible.value = false
        loadExportConfigs()
      }
    } else {
      // 创建新配置
      const response = await createExportConfig(formData)
      
      if (response?.code === 200) {
        ElMessage.success('创建配置成功')
        dialogVisible.value = false
        loadExportConfigs()
      }
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error('提交失败，请检查表单数据')
  }
}

// 删除配置
const confirmDelete = (id: string) => {
  ElMessageBox.confirm('确定要删除此导出配置吗？删除后不可恢复。', '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteExportConfig(id)
      
      if (response?.code === 200) {
        ElMessage.success('删除成功')
        loadExportConfigs()
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 执行导出
const startExport = async (configId: string) => {
  try {
    loading.value = true
    
    const response = await executeExport(configId)
    
    if (response?.code === 200) {
      ElMessage.success('导出任务已提交')
    }
  } catch (error) {
    console.error('提交导出任务失败:', error)
    ElMessage.error('提交导出任务失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="export-container">
    <el-card class="export-card">
      <template #header>
        <div class="card-header">
          <span>数据导出配置</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>新建导出配置
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="exportConfigs"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="配置名称" min-width="180" />
        <el-table-column prop="tableName" label="表名" min-width="150" />
        <el-table-column label="数据源" min-width="150">
          <template #default="{ row }">
            {{ datasources.find(ds => ds.id === row.dataSourceId)?.name || row.dataSourceId }}
          </template>
        </el-table-column>
        <el-table-column prop="exportType" label="导出类型" min-width="100" />
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="startExport(row.id || '')">
              执行导出
            </el-button>
            <el-button type="info" size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="confirmDelete(row.id || '')">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="100"
          @size-change="loadExportConfigs"
          @current-change="loadExportConfigs"
        />
      </div>
    </el-card>
    
    <!-- 导出配置表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentConfigId ? '编辑导出配置' : '新建导出配置'"
      width="700px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入配置名称" />
        </el-form-item>
        
        <el-form-item label="数据源" prop="dataSourceId">
          <el-select v-model="formData.dataSourceId" placeholder="请选择数据源" style="width: 100%">
            <el-option
              v-for="ds in datasources"
              :key="ds.id || ''"
              :label="ds.name"
              :value="ds.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="表名" prop="tableName">
          <el-input v-model="formData.tableName" placeholder="请输入表名" />
        </el-form-item>
        
        <el-form-item label="导出类型" prop="exportType">
          <el-select v-model="formData.exportType" placeholder="请选择导出类型" style="width: 100%">
            <el-option label="CSV" value="CSV" />
            <el-option label="Excel" value="EXCEL" />
            <el-option label="JSON" value="JSON" />
          </el-select>
        </el-form-item>
        
        <!-- 列配置 - 这里仅做简单展示，实际应该动态加载表的列信息 -->
        <el-form-item label="列配置">
          <el-alert
            title="列配置会在选择表后自动加载"
            type="info"
            :closable="false"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.export-container {
  padding: 20px;
}

.export-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 