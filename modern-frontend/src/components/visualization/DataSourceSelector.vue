<template>
  <div class="data-source-selector">
    <h4 class="selector-title">选择数据源</h4>
    <div class="selector-content">
      <el-select
        v-model="selectedDatasource"
        placeholder="请选择数据源"
        filterable
        clearable
        class="selector-input"
        @change="handleChange"
      >
        <el-option
          v-for="item in datasources"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
          <div class="datasource-option">
            <el-icon class="datasource-icon">
              <component :is="getDatasourceIcon(item.type)" />
            </el-icon>
            <div class="datasource-info">
              <div class="datasource-name">{{ item.name }}</div>
              <div class="datasource-type">{{ item.type }}</div>
            </div>
          </div>
        </el-option>
      </el-select>
    </div>

    <el-collapse v-if="selectedDatasource">
      <el-collapse-item title="数据源表" name="tables">
        <div class="datasource-tables" v-loading="tablesLoading">
          <el-input
            v-model="tableSearchKeyword"
            placeholder="搜索表"
            prefix-icon="Search"
            clearable
            class="table-search"
          />
          
          <div v-if="filteredTables.length > 0" class="tables-list">
            <div
              v-for="table in filteredTables"
              :key="table.name"
              class="table-item"
              @click="selectTable(table)"
            >
              <el-icon><Grid /></el-icon>
              <span class="table-name">{{ table.name }}</span>
              <span class="table-rows" v-if="table.rowCount">{{ formatNumber(table.rowCount) }} 行</span>
            </div>
          </div>
          <el-empty v-else description="无可用表" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Grid, Search } from '@element-plus/icons-vue'
import { DataSource, Database, Calendar, DocHide, Document } from '@element-plus/icons-vue'
import { listDataSources } from '@/api/datasource'
import { getTableList } from '@/api/metadata'

const emit = defineEmits(['change', 'tableSelect'])

// 状态
const selectedDatasource = ref('')
const datasources = ref<any[]>([])
const tables = ref<any[]>([])
const tableSearchKeyword = ref('')
const tablesLoading = ref(false)

// 过滤表格
const filteredTables = computed(() => {
  if (!tableSearchKeyword.value) {
    return tables.value
  }
  
  const keyword = tableSearchKeyword.value.toLowerCase()
  return tables.value.filter(table => 
    table.name.toLowerCase().includes(keyword) || 
    table.comment?.toLowerCase().includes(keyword)
  )
})

// 获取数据源列表
const fetchDatasources = async () => {
  try {
    const response = await listDataSources()
    if (response.data && Array.isArray(response.data)) {
      datasources.value = response.data
    } else {
      // 使用模拟数据
      datasources.value = [
        { id: 'mysql-sales', name: 'MySQL 销售数据', type: 'mysql' },
        { id: 'postgres-analytics', name: 'PostgreSQL 分析库', type: 'postgresql' },
        { id: 'snowflake-warehouse', name: 'Snowflake 数据仓库', type: 'snowflake' },
        { id: 'bigquery-events', name: 'BigQuery 事件数据', type: 'bigquery' }
      ]
    }
  } catch (error) {
    console.error('Failed to fetch datasources:', error)
    ElMessage.error('获取数据源列表失败')
    
    // 使用模拟数据
    datasources.value = [
      { id: 'mysql-sales', name: 'MySQL 销售数据', type: 'mysql' },
      { id: 'postgres-analytics', name: 'PostgreSQL 分析库', type: 'postgresql' },
      { id: 'snowflake-warehouse', name: 'Snowflake 数据仓库', type: 'snowflake' },
      { id: 'bigquery-events', name: 'BigQuery 事件数据', type: 'bigquery' }
    ]
  }
}

// 获取表格列表
const fetchTables = async (datasourceId: string) => {
  if (!datasourceId) {
    tables.value = []
    return
  }
  
  tablesLoading.value = true
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
    console.error('Failed to fetch tables:', error)
    ElMessage.error('获取表格列表失败')
    
    // 使用模拟数据
    tables.value = [
      { name: 'customers', comment: '客户信息表', rowCount: 15000, dataSize: 8388608 },
      { name: 'orders', comment: '订单表', rowCount: 50000, dataSize: 16777216 },
      { name: 'products', comment: '产品表', rowCount: 5000, dataSize: 4194304 },
      { name: 'employees', comment: '员工表', rowCount: 500, dataSize: 1048576 },
      { name: 'inventory', comment: '库存表', rowCount: 10000, dataSize: 4194304 },
      { name: 'sales', comment: '销售记录', rowCount: 100000, dataSize: 33554432 }
    ]
  } finally {
    tablesLoading.value = false
  }
}

// 根据数据源类型获取图标
const getDatasourceIcon = (type: string) => {
  const typeMap: Record<string, any> = {
    'mysql': 'DataSource',
    'postgresql': 'DataSource',
    'oracle': 'Database',
    'sqlserver': 'Database',
    'clickhouse': 'DataSource',
    'hive': 'DataSource',
    'csv': 'Document',
    'excel': 'DocHide',
    'json': 'Document',
    'bigquery': 'Database',
    'snowflake': 'Calendar',
    'default': 'DataSource'
  }
  
  return typeMap[type.toLowerCase()] || typeMap.default
}

// 数据源变更
const handleChange = (value: string) => {
  emit('change', value)
  if (value) {
    fetchTables(value)
  } else {
    tables.value = []
  }
}

// 选择表
const selectTable = (table: any) => {
  emit('tableSelect', table)
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toString()
  }
}

// 初始化
onMounted(() => {
  fetchDatasources()
})
</script>

<style lang="scss" scoped>
.data-source-selector {
  margin-bottom: 16px;
}

.selector-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.selector-content {
  margin-bottom: 16px;
}

.selector-input {
  width: 100%;
}

.datasource-option {
  display: flex;
  align-items: center;
  
  .datasource-icon {
    margin-right: 8px;
    font-size: 18px;
  }
  
  .datasource-info {
    flex: 1;
    
    .datasource-name {
      font-size: 14px;
    }
    
    .datasource-type {
      font-size: 12px;
      color: #909399;
    }
  }
}

.datasource-tables {
  .table-search {
    margin-bottom: 12px;
  }
  
  .tables-list {
    max-height: 200px;
    overflow-y: auto;
    
    .table-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .el-icon {
        margin-right: 8px;
        color: #909399;
      }
      
      .table-name {
        flex: 1;
        font-size: 14px;
      }
      
      .table-rows {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>