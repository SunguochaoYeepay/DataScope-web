<template>
  <div class="query-editor-page">
    <el-alert
      v-if="!apiImplemented"
      type="warning"
      title="查询执行API尚未实现"
      description="后端API未实现查询执行功能，此页面仅展示UI和交互。数据源管理API已实现，可正常加载数据源列表。"
      :closable="false"
      show-icon
      effect="light"
      style="margin-bottom: 16px;"
    />
    
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">SQL查询编辑器</h2>
      </div>
      <div class="header-right">
        <el-select
          v-model="selectedDatasource"
          placeholder="选择数据源"
          filterable
          style="width: 220px;"
          :loading="datasourceLoading"
          @change="handleDatasourceChange"
        >
          <el-option
            v-for="ds in datasources"
            :key="ds.id"
            :label="ds.name"
            :value="ds.id"
          >
            <div class="datasource-option">
              <span>{{ ds.name }}</span>
              <span class="datasource-type">{{ ds.type }}</span>
            </div>
          </el-option>
        </el-select>
        
        <el-button-group>
          <el-tooltip content="保存查询" placement="top">
            <el-button type="primary" @click="handleSaveQuery" :icon="Document" />
          </el-tooltip>
          <el-tooltip content="另存为新查询" placement="top">
            <el-button type="primary" @click="handleSaveAsNew" :icon="DocumentCopy" />
          </el-tooltip>
        </el-button-group>
      </div>
    </div>
    
    <el-space direction="vertical" style="width: 100%;" :size="16" fill>
      <!-- 查询配置卡片 -->
      <el-card shadow="hover" class="query-card">
        <template #header>
          <div class="card-header">
            <span>查询编辑</span>
            <div>
              <el-input
                v-model="queryName"
                placeholder="查询名称"
                style="width: 200px; margin-right: 16px;"
              />
              <el-button
                type="success"
                @click="handleExecuteQuery"
                :loading="executing"
                :disabled="!canExecute"
                :icon="CaretRight"
              >
                执行查询
              </el-button>
            </div>
          </div>
        </template>
        
        <!-- SQL编辑器组件 -->
        <sql-editor
          v-model="sqlQuery"
          :disabled="executing"
          :loading="executing"
          :error="queryError"
          :success="querySuccess"
          height="250px"
          @execute="handleExecuteQuery"
          ref="sqlEditorRef"
        />
      </el-card>
      
      <!-- 查询结果卡片 -->
      <el-card shadow="hover" class="results-card" v-if="hasExecuted || executing">
        <template #header>
          <div class="card-header">
            <span>查询结果</span>
            <div>
              <el-tag v-if="executing" type="info">查询执行中...</el-tag>
              <el-tag v-else-if="queryError" type="danger">{{ queryError }}</el-tag>
              <el-tag v-else-if="hasResults" type="success">查询成功</el-tag>
            </div>
          </div>
        </template>
        
        <query-results
          :results="queryResult"
          :loading="executing"
          :error="queryError"
          :maxHeight="400"
          @export="handleExport"
          ref="resultsRef"
        />
      </el-card>
    </el-space>
    
    <!-- 保存查询对话框 -->
    <el-dialog
      v-model="saveDialogVisible"
      :title="isEditMode ? '保存查询' : '新建查询'"
      width="500px"
      destroy-on-close
    >
      <el-form
        :model="saveForm"
        :rules="saveRules"
        ref="saveFormRef"
        label-width="100px"
      >
        <el-form-item label="查询名称" prop="name">
          <el-input v-model="saveForm.name" placeholder="请输入查询名称" />
        </el-form-item>
        <el-form-item label="数据源" prop="datasourceId">
          <el-select v-model="saveForm.datasourceId" placeholder="请选择数据源" style="width: 100%">
            <el-option
              v-for="ds in datasources"
              :key="ds.id"
              :label="ds.name"
              :value="ds.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="saveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入查询描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSaveQuery" :loading="saving">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Document, DocumentCopy, CaretRight } from '@element-plus/icons-vue'

// 导入自定义组件
import SqlEditor from '../../components/query/SqlEditor.vue'
import QueryResults from '../../components/query/QueryResults.vue'

// 导入API函数
import { getDatasourceList } from '../../api/datasource'
import { 
  executeQuery, 
  getQueryDetail, 
  createQuery, 
  updateQuery 
} from '../../api/query'

// 路由相关
const route = useRoute()
const router = useRouter()

// 编辑器引用
const sqlEditorRef = ref<InstanceType<typeof SqlEditor> | null>(null)
const resultsRef = ref<InstanceType<typeof QueryResults> | null>(null)
const saveFormRef = ref<FormInstance | null>(null)

// 数据源相关
const datasourceLoading = ref(false)
const datasources = ref<any[]>([])
const selectedDatasource = ref<string>('')

// 查询相关
const queryId = ref<string | null>(null)
const queryName = ref<string>('')
const sqlQuery = ref<string>('')
const executing = ref<boolean>(false)
const queryError = ref<string>('')
const querySuccess = ref<string>('')
const queryResult = ref<any>(null)
const hasExecuted = ref<boolean>(false)
const apiImplemented = ref<boolean>(false) // 默认使用mock模式

// 保存查询相关
const isEditMode = ref<boolean>(false)
const saveDialogVisible = ref<boolean>(false)
const saving = ref<boolean>(false)
const saveForm = reactive({
  id: '',
  name: '',
  datasourceId: '',
  description: '',
  sqlTemplate: ''
})

// 保存表单校验规则
const saveRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入查询名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应为2-50个字符', trigger: 'blur' }
  ],
  datasourceId: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ]
})

// 计算属性
const canExecute = computed(() => {
  return selectedDatasource.value && sqlQuery.value.trim() !== ''
})

const hasResults = computed(() => {
  return queryResult.value && queryResult.value.rows && queryResult.value.rows.length > 0
})

// 生成模拟数据源列表
const generateMockDatasources = () => {
  return [
    { id: 'mysql-001', name: 'MySQL生产库', type: 'MySQL', host: '192.168.1.100', port: 3306 },
    { id: 'pg-001', name: 'PostgreSQL分析库', type: 'PostgreSQL', host: '192.168.1.101', port: 5432 },
    { id: 'mysql-002', name: '用户数据库', type: 'MySQL', host: '192.168.1.102', port: 3306 },
    { id: 'oracle-001', name: 'Oracle财务库', type: 'Oracle', host: '192.168.1.103', port: 1521 }
  ]
}

// 生成模拟查询结果
const generateMockQueryResult = (sql: string) => {
  // 根据SQL语句特征生成不同的结果集
  let columns = [];
  let rows = [];
  
  if (sql.toLowerCase().includes('customer') || sql.toLowerCase().includes('用户')) {
    columns = [
      { name: 'id', label: '用户ID', type: 'integer' },
      { name: 'name', label: '用户名', type: 'string' },
      { name: 'email', label: '邮箱', type: 'string' },
      { name: 'register_date', label: '注册日期', type: 'datetime' },
      { name: 'status', label: '状态', type: 'boolean' }
    ];
    
    rows = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      register_date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      status: Math.random() > 0.2
    }));
  } else if (sql.toLowerCase().includes('order') || sql.toLowerCase().includes('订单')) {
    columns = [
      { name: 'order_id', label: '订单ID', type: 'string' },
      { name: 'customer_id', label: '用户ID', type: 'integer' },
      { name: 'amount', label: '金额', type: 'decimal' },
      { name: 'order_date', label: '订单日期', type: 'datetime' },
      { name: 'status', label: '状态', type: 'string' }
    ];
    
    rows = Array.from({ length: 15 }, (_, i) => ({
      order_id: `ORD${100000 + i}`,
      customer_id: Math.floor(Math.random() * 100) + 1,
      amount: parseFloat((Math.random() * 10000).toFixed(2)),
      order_date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
      status: ['已支付', '已发货', '已完成', '已取消'][Math.floor(Math.random() * 4)]
    }));
  } else if (sql.toLowerCase().includes('product') || sql.toLowerCase().includes('商品')) {
    columns = [
      { name: 'product_id', label: '商品ID', type: 'string' },
      { name: 'name', label: '商品名称', type: 'string' },
      { name: 'price', label: '价格', type: 'decimal' },
      { name: 'inventory', label: '库存', type: 'integer' },
      { name: 'category', label: '分类', type: 'string' }
    ];
    
    rows = Array.from({ length: 25 }, (_, i) => ({
      product_id: `PRD${10000 + i}`,
      name: `商品${i + 1}`,
      price: parseFloat((Math.random() * 1000).toFixed(2)),
      inventory: Math.floor(Math.random() * 200),
      category: ['电子产品', '家居', '服装', '食品', '玩具'][Math.floor(Math.random() * 5)]
    }));
  } else {
    // 默认数据集
    columns = [
      { name: 'id', label: 'ID', type: 'integer' },
      { name: 'name', label: '名称', type: 'string' },
      { name: 'created_at', label: '创建时间', type: 'datetime' },
      { name: 'status', label: '状态', type: 'boolean' },
      { name: 'amount', label: '金额', type: 'decimal' }
    ];
    
    rows = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `记录${i + 1}`,
      created_at: new Date().toISOString(),
      status: Math.random() > 0.5,
      amount: parseFloat((Math.random() * 1000).toFixed(2))
    }));
  }
  
  return {
    columns,
    rows,
    executionTime: Math.floor(Math.random() * 500) + 100, // 模拟执行时间100-600ms
    sql
  }
}

// 生命周期钩子
onMounted(async () => {
  // 获取数据源列表
  fetchDatasources()
  
  // 在编辑模式下获取查询详情
  const { id } = route.params
  if (id) {
    queryId.value = id as string
    isEditMode.value = true
    fetchQueryDetail(id as string)
  } else {
    // 在创建模式下设置默认SQL
    sqlQuery.value = 'SELECT * FROM customers LIMIT 10;'
  }
})

// 获取数据源列表
const fetchDatasources = async () => {
  try {
    datasourceLoading.value = true
    
    if (!apiImplemented.value) {
      // 使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载延迟
      datasources.value = generateMockDatasources();
      if (datasources.value.length > 0) {
        selectedDatasource.value = datasources.value[0].id;
      }
    } else {
      // 真实API调用
      const res = await getDatasourceList()
      if (Array.isArray(res)) {
        datasources.value = res
        if (res.length > 0 && !selectedDatasource.value) {
          selectedDatasource.value = res[0].id.toString()
        }
      } else if (res && 'data' in res && Array.isArray(res.data)) {
        datasources.value = res.data
        if (res.data.length > 0 && !selectedDatasource.value) {
          selectedDatasource.value = res.data[0].id.toString()
        }
      } else {
        console.error('获取数据源列表格式错误:', res)
        ElMessage.error('获取数据源列表失败，返回格式错误')
      }
    }
  } catch (error: any) {
    console.error('获取数据源列表失败:', error)
    ElMessage.error(`获取数据源列表失败: ${error.message || '未知错误'}`)
  } finally {
    datasourceLoading.value = false
  }
}

// 获取查询详情
const fetchQueryDetail = async (id: string) => {
  try {
    if (!apiImplemented.value) {
      // 使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 700)); // 模拟加载延迟
      queryName.value = '示例查询 #' + id;
      sqlQuery.value = 'SELECT * FROM customers WHERE status = true LIMIT 20;';
      selectedDatasource.value = datasources.value[0]?.id || '';
      
      // 初始化保存表单
      saveForm.id = id;
      saveForm.name = queryName.value;
      saveForm.datasourceId = selectedDatasource.value;
      saveForm.description = '这是一个示例查询，用于演示查询编辑器功能';
      saveForm.sqlTemplate = sqlQuery.value;
    } else {
      // 真实API调用
      const res = await getQueryDetail(id)
      if (res) {
        queryName.value = res.name || ''
        sqlQuery.value = res.sqlTemplate || ''
        selectedDatasource.value = res.datasourceId?.toString() || ''
        
        // 初始化保存表单
        saveForm.id = id
        saveForm.name = res.name || ''
        saveForm.datasourceId = res.datasourceId?.toString() || ''
        saveForm.description = res.description || ''
        saveForm.sqlTemplate = res.sqlTemplate || ''
      }
    }
  } catch (error: any) {
    console.error('获取查询详情失败:', error)
    ElMessage.error(`获取查询详情失败: ${error.message || '未知错误'}`)
  }
}

// 数据源变更
const handleDatasourceChange = (value: string) => {
  selectedDatasource.value = value
  // 这里可以添加切换数据源时的其他操作，如验证SQL等
}

// 执行查询
const handleExecuteQuery = async () => {
  if (!canExecute.value) {
    ElMessage.warning('请选择数据源并输入SQL查询')
    return
  }
  
  try {
    // 重置状态
    executing.value = true
    queryError.value = ''
    querySuccess.value = ''
    hasExecuted.value = true
    
    // 检查API是否实现
    if (!apiImplemented.value) {
      // 模拟查询执行时间
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 生成模拟数据
      queryResult.value = generateMockQueryResult(sqlQuery.value)
      querySuccess.value = '查询成功(模拟数据)'
    } else {
      // 实际API调用
      const res = await executeQuery({
        datasourceId: selectedDatasource.value,
        sql: sqlQuery.value
      })
      
      queryResult.value = res
      querySuccess.value = '查询成功'
    }
  } catch (error: any) {
    console.error('执行查询失败:', error)
    queryError.value = error.message || '执行查询失败'
    queryResult.value = null
  } finally {
    executing.value = false
  }
}

// 保存查询
const handleSaveQuery = () => {
  if (isEditMode.value) {
    saveForm.id = queryId.value || ''
  }
  
  saveForm.name = queryName.value
  saveForm.datasourceId = selectedDatasource.value
  saveForm.sqlTemplate = sqlQuery.value
  
  saveDialogVisible.value = true
}

// 另存为
const handleSaveAsNew = () => {
  isEditMode.value = false
  saveForm.id = ''
  saveForm.name = queryName.value ? `${queryName.value} (副本)` : ''
  saveForm.datasourceId = selectedDatasource.value
  saveForm.sqlTemplate = sqlQuery.value
  
  saveDialogVisible.value = true
}

// 确认保存查询
const confirmSaveQuery = async () => {
  if (!saveFormRef.value) return
  
  await saveFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        saving.value = true
        
        const saveData = {
          ...saveForm,
          sqlTemplate: sqlQuery.value
        }
        
        if (isEditMode.value && saveForm.id) {
          // 更新现有查询
          await updateQuery(saveForm.id, saveData)
          ElMessage.success('查询更新成功')
        } else {
          // 创建新查询
          const result = await createQuery(saveData)
          if (result && result.id) {
            queryId.value = result.id
            isEditMode.value = true
          }
          ElMessage.success('查询保存成功')
        }
        
        saveDialogVisible.value = false
        queryName.value = saveForm.name
      } catch (error: any) {
        console.error('保存查询失败:', error)
        ElMessage.error(`保存查询失败: ${error.message || '未知错误'}`)
      } finally {
        saving.value = false
      }
    }
  })
}

// 导出处理
const handleExport = (exportInfo: any) => {
  console.log('导出数据:', exportInfo)
  ElMessage.success(`数据已${exportInfo.type === 'csv' ? '导出为CSV' : exportInfo.type === 'excel' ? '导出为Excel' : '复制到剪贴板'}`)
}

// 暴露方法给父组件
defineExpose({
  executeQuery: handleExecuteQuery,
  formatSQL: () => sqlEditorRef.value?.formatSQL(),
  getSql: () => sqlQuery.value
})
</script>

<style lang="scss" scoped>
.query-editor-page {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .header-left {
      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
  }
  
  .query-card {
    margin-bottom: 16px;
  }
  
  .results-card {
    margin-top: 16px;
  }
}

.datasource-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .datasource-type {
    color: #909399;
    font-size: 12px;
  }
}
</style>