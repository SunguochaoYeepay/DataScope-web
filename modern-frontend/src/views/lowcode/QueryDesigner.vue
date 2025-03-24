<template>
  <div class="query-designer-container">
    <el-page-header @back="goBack" title="低代码" content="查询界面设计器" />
    
    <el-form class="designer-form" label-position="top">
      <el-form-item label="查询名称">
        <el-input v-model="queryConfig.name" placeholder="请输入查询名称" />
      </el-form-item>
      
      <el-form-item label="查询描述">
        <el-input v-model="queryConfig.description" type="textarea" :rows="2" placeholder="请输入查询描述" />
      </el-form-item>
    </el-form>
    
    <el-row :gutter="20">
      <!-- 数据源配置区域 -->
      <el-col :span="24">
        <el-card class="mb-20" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据源配置</span>
            </div>
          </template>
          
          <el-form label-position="top">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="数据源">
                  <el-select 
                    v-model="selectedDataSource" 
                    placeholder="选择数据源"
                    filterable
                    @change="handleDataSourceChange"
                  >
                    <el-option
                      v-for="source in dataSources"
                      :key="source.id"
                      :label="source.name"
                      :value="source.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="表">
                  <el-select 
                    v-model="selectedTable"
                    placeholder="选择数据表"
                    filterable
                    @change="handleTableChange"
                  >
                    <el-option
                      v-for="table in tables"
                      :key="table.name"
                      :label="table.name"
                      :value="table.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="API配置">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-input 
                    v-model="queryConfig.api.url"
                    placeholder="API URL"
                    @change="generateApiUrl"
                  >
                    <template #prepend>
                      <el-select v-model="queryConfig.api.method" style="width: 100px">
                        <el-option label="GET" value="GET" />
                        <el-option label="POST" value="POST" />
                      </el-select>
                    </template>
                  </el-input>
                </el-col>
                
                <el-col :span="12" v-if="selectedTable">
                  <el-button @click="generateApiUrl" type="primary">
                    <el-icon><Refresh /></el-icon>
                    生成API URL
                  </el-button>
                  
                  <el-button @click="testApi" type="success">
                    <el-icon><Check /></el-icon>
                    测试接口
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 查询设计区域 -->
      <el-col :span="24">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="查询条件" name="conditions">
            <condition-builder 
              v-model="queryConfig.conditions"
              :available-fields="tableFields"
              @save="handleConditionsSave"
            />
          </el-tab-pane>
          
          <el-tab-pane label="结果列" name="results">
            <result-columns-builder
              v-model="queryConfig.results"
              :available-fields="tableFields"
              @save="handleResultsSave"
            />
          </el-tab-pane>
          
          <el-tab-pane label="操作按钮" name="operations">
            <el-empty description="操作按钮配置 (即将推出)" />
          </el-tab-pane>
          
          <el-tab-pane label="分页设置" name="pagination">
            <el-card>
              <el-form label-position="top">
                <el-form-item label="启用分页">
                  <el-switch v-model="queryConfig.pagination.enable" />
                </el-form-item>
                
                <el-form-item label="每页记录数" v-if="queryConfig.pagination.enable">
                  <el-input-number v-model="queryConfig.pagination.pageSize" :min="5" :max="1000" />
                </el-form-item>
                
                <el-form-item label="可选每页记录数" v-if="queryConfig.pagination.enable">
                  <el-select v-model="queryConfig.pagination.pageSizeOptions" multiple>
                    <el-option label="5条/页" :value="5" />
                    <el-option label="10条/页" :value="10" />
                    <el-option label="20条/页" :value="20" />
                    <el-option label="50条/页" :value="50" />
                    <el-option label="100条/页" :value="100" />
                    <el-option label="200条/页" :value="200" />
                    <el-option label="500条/页" :value="500" />
                    <el-option label="1000条/页" :value="1000" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
          
          <el-tab-pane label="默认排序" name="sorting">
            <el-card>
              <el-form label-position="top">
                <el-form-item label="排序字段">
                  <el-select 
                    v-model="queryConfig.sortInfo.field" 
                    placeholder="选择排序字段"
                    filterable
                  >
                    <el-option
                      v-for="field in sortableFields"
                      :key="field.field"
                      :label="field.label"
                      :value="field.field"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="排序方式">
                  <el-radio-group v-model="queryConfig.sortInfo.order">
                    <el-radio label="asc">升序</el-radio>
                    <el-radio label="desc">降序</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
          
          <el-tab-pane label="预览" name="preview">
            <el-empty description="预览功能 (即将推出)" />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    
    <div class="actions-footer">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" @click="saveQueryConfig">保存配置</el-button>
      <el-button type="success" @click="saveAndPreview">保存并预览</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ConditionBuilder from '@/components/lowcode/ConditionBuilder.vue'
import ResultColumnsBuilder from '@/components/lowcode/ResultColumnsBuilder.vue'
import type { QueryConfig, ConditionField, ResultColumn } from '@/types/lowcode'
import { listDataSources } from '@/api/datasource'
import { getTableList, getTableMetadata } from '@/api/metadata'

// 路由
const router = useRouter()

// 活动标签
const activeTab = ref('conditions')

// 数据源相关
const dataSources = ref<any[]>([])
const tables = ref<any[]>([])
const tableFields = ref<any[]>([])
const selectedDataSource = ref('')
const selectedTable = ref('')

// 查询配置
const queryConfig = reactive<QueryConfig>({
  name: '',
  description: '',
  conditions: [],
  results: [],
  operations: [],
  pagination: {
    enable: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  sortInfo: {
    field: '',
    order: 'desc'
  },
  api: {
    url: '',
    method: 'GET'
  }
})

// 可排序字段
const sortableFields = computed(() => {
  return queryConfig.results.filter(column => column.sortable)
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载数据源列表
const loadDataSources = async () => {
  try {
    const response = await listDataSources()
    
    if (response.data && Array.isArray(response.data)) {
      dataSources.value = response.data
    } else {
      // 使用模拟数据
      dataSources.value = [
        { id: 'mysql-sales', name: 'MySQL 销售数据', type: 'mysql' },
        { id: 'postgres-analytics', name: 'PostgreSQL 分析库', type: 'postgresql' },
        { id: 'snowflake-warehouse', name: 'Snowflake 数据仓库', type: 'snowflake' },
        { id: 'bigquery-events', name: 'BigQuery 事件数据', type: 'bigquery' }
      ]
    }
  } catch (error) {
    console.error('Failed to load data sources:', error)
    ElMessage.error('加载数据源列表失败')
    
    // 使用模拟数据
    dataSources.value = [
      { id: 'mysql-sales', name: 'MySQL 销售数据', type: 'mysql' },
      { id: 'postgres-analytics', name: 'PostgreSQL 分析库', type: 'postgresql' },
      { id: 'snowflake-warehouse', name: 'Snowflake 数据仓库', type: 'snowflake' },
      { id: 'bigquery-events', name: 'BigQuery 事件数据', type: 'bigquery' }
    ]
  }
}

// 数据源变更处理
const handleDataSourceChange = async (datasourceId: string) => {
  selectedTable.value = ''
  tables.value = []
  tableFields.value = []
  
  if (!datasourceId) return
  
  try {
    const response = await getTableList(datasourceId)
    
    if (response.data && Array.isArray(response.data)) {
      tables.value = response.data
    } else {
      // 使用模拟数据
      tables.value = [
        { name: 'customers', comment: '客户信息表', rowCount: 15000, dataSize: 8388608 },
        { name: 'orders', comment: '订单表', rowCount: 50000, dataSize: 16777216 },
        { name: 'products', comment: '产品表', rowCount: 5000, dataSize: 4194304 },
        { name: 'employees', comment: '员工表', rowCount: 500, dataSize: 1048576 },
        { name: 'inventory', comment: '库存表', rowCount: 10000, dataSize: 4194304 },
        { name: 'sales', comment: '销售记录', rowCount: 100000, dataSize: 33554432 }
      ]
    }
  } catch (error) {
    console.error('Failed to load tables:', error)
    ElMessage.error('加载表格列表失败')
    
    // 使用模拟数据
    tables.value = [
      { name: 'customers', comment: '客户信息表', rowCount: 15000 },
      { name: 'orders', comment: '订单表', rowCount: 50000 },
      { name: 'products', comment: '产品表', rowCount: 5000 },
      { name: 'employees', comment: '员工表', rowCount: 500 },
      { name: 'inventory', comment: '库存表', rowCount: 10000 },
      { name: 'sales', comment: '销售记录', rowCount: 100000 }
    ]
  }
}

// 表格变更处理
const handleTableChange = async (tableName: string) => {
  tableFields.value = []
  
  if (!selectedDataSource.value || !tableName) return
  
  try {
    const response = await getTableMetadata(selectedDataSource.value, tableName)
    
    if (response.data && response.data.columns) {
      tableFields.value = response.data.columns.map((col: any) => ({
        name: col.name,
        label: col.comment || col.name,
        dataType: col.dataType,
        isNumeric: ['int', 'bigint', 'decimal', 'float', 'double'].includes(col.dataType.toLowerCase()),
        isDate: col.dataType.toLowerCase().includes('date') || col.dataType.toLowerCase().includes('time'),
        isString: col.dataType.toLowerCase().includes('char') || col.dataType.toLowerCase() === 'text'
      }))
    } else {
      // 使用模拟数据
      const mockFields = generateMockFieldsForTable(tableName)
      tableFields.value = mockFields
    }
    
    // 重置查询配置
    queryConfig.conditions = []
    queryConfig.results = []
    
    // 自动生成结果列配置
    queryConfig.results = tableFields.value.map(field => ({
      field: field.name,
      label: field.label,
      width: 150,
      fixed: false,
      sortable: true,
      visible: true
    }))
    
    // 生成API URL
    generateApiUrl()
    
  } catch (error) {
    console.error('Failed to load table fields:', error)
    ElMessage.error('加载表字段失败')
    
    // 使用模拟数据
    const mockFields = generateMockFieldsForTable(tableName)
    tableFields.value = mockFields
  }
}

// 生成表的模拟字段
const generateMockFieldsForTable = (tableName: string) => {
  const fields = []
  
  // 所有表都有ID字段
  fields.push({
    name: 'id',
    label: 'ID',
    dataType: 'int',
    isNumeric: true,
    isDate: false,
    isString: false
  })
  
  // 根据表名生成合适的字段
  if (tableName === 'customers') {
    fields.push(
      {
        name: 'name',
        label: '客户姓名',
        dataType: 'varchar(100)',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'email',
        label: '电子邮箱',
        dataType: 'varchar(100)',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'phone',
        label: '电话号码',
        dataType: 'varchar(20)',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'address',
        label: '地址',
        dataType: 'varchar(200)',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'create_time',
        label: '创建时间',
        dataType: 'datetime',
        isNumeric: false,
        isDate: true,
        isString: false
      }
    )
  } else if (tableName === 'orders') {
    fields.push(
      {
        name: 'order_no',
        label: '订单号',
        dataType: 'varchar(50)',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'customer_id',
        label: '客户ID',
        dataType: 'int',
        isNumeric: true,
        isDate: false,
        isString: false
      },
      {
        name: 'order_date',
        label: '订单日期',
        dataType: 'date',
        isNumeric: false,
        isDate: true,
        isString: false
      },
      {
        name: 'amount',
        label: '金额',
        dataType: 'decimal(10,2)',
        isNumeric: true,
        isDate: false,
        isString: false
      },
      {
        name: 'status',
        label: '状态',
        dataType: 'varchar(20)',
        isNumeric: false,
        isDate: false,
        isString: true
      }
    )
  } else if (tableName === 'products') {
    fields.push(
      {
        name: 'name',
        label: '产品名称',
        dataType: 'varchar(100)',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'description',
        label: '描述',
        dataType: 'text',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'price',
        label: '价格',
        dataType: 'decimal(10,2)',
        isNumeric: true,
        isDate: false,
        isString: false
      },
      {
        name: 'inventory',
        label: '库存',
        dataType: 'int',
        isNumeric: true,
        isDate: false,
        isString: false
      }
    )
  } else {
    // 默认字段
    fields.push(
      {
        name: 'name',
        label: '名称',
        dataType: 'varchar(100)',
        isNumeric: false,
        isDate: false,
        isString: true
      },
      {
        name: 'create_time',
        label: '创建时间',
        dataType: 'datetime',
        isNumeric: false,
        isDate: true,
        isString: false
      }
    )
  }
  
  return fields
}

// 生成API URL
const generateApiUrl = () => {
  if (!selectedDataSource.value || !selectedTable.value) return
  
  queryConfig.api.url = `/api/v1/data/${selectedDataSource.value}/${selectedTable.value}`
  ElMessage.success('已生成API URL')
}

// 测试API
const testApi = () => {
  if (!queryConfig.api.url) {
    ElMessage.error('请先生成API URL')
    return
  }
  
  ElMessage.success('API测试成功')
}

// 处理查询条件保存
const handleConditionsSave = (conditions: ConditionField[]) => {
  queryConfig.conditions = conditions
}

// 处理结果列保存
const handleResultsSave = (results: ResultColumn[]) => {
  queryConfig.results = results
}

// 保存查询配置
const saveQueryConfig = () => {
  if (!queryConfig.name) {
    ElMessage.error('请输入查询名称')
    return
  }
  
  if (!selectedDataSource.value || !selectedTable.value) {
    ElMessage.error('请选择数据源和表')
    return
  }
  
  // TODO: 保存查询配置到后端
  
  ElMessage.success('查询配置已保存')
}

// 保存并预览
const saveAndPreview = () => {
  saveQueryConfig()
  activeTab.value = 'preview'
}

// 初始化
onMounted(() => {
  loadDataSources()
})
</script>

<style lang="scss" scoped>
.query-designer-container {
  padding: 20px;
  
  .designer-form {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .mb-20 {
    margin-bottom: 20px;
  }
  
  .actions-footer {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>