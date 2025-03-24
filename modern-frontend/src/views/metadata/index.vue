<script setup lang="ts">
import { ref, onMounted, reactive, computed, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElButton, ElSelect, ElOption, ElInput, ElTooltip } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getTableList, getTableMetadata, refreshDatasourceMetadata, refreshTableMetadata, type TableMetadata } from '../../api/metadata'
import { getDatasourceList, type Datasource } from '../../api/datasource'
import TableDetailDialog from './components/TableDetailDialog.vue'

// 确保在初始化时就有默认状态
const route = useRoute()
const router = useRouter()

// 使用空数组初始化，避免undefined问题
const loading = ref(false)
const refreshing = ref(false)
const datasources = ref<Datasource[]>([]) // 初始化为空数组
const selectedDatasource = ref('')
const tables = ref<TableMetadata[]>([]) // 初始化为空数组
const searchKeyword = ref('')
const selectedTable = ref<TableMetadata | null>(null)
const showTableDetail = ref(false)

// 添加一个状态变量，跟踪是否已经加载过数据
const hasLoadedData = ref(false)

// 过滤表列表 - 确保在组件挂载前不会访问未初始化的数据
const filterTables = computed(() => {
  // 始终确保返回数组 - 即使tables.value未定义或不是数组
  const tableArray = Array.isArray(tables.value) ? tables.value : [];
  
  // 如果没有搜索关键词，返回整个数组
  if (!searchKeyword.value || searchKeyword.value.trim() === '') {
    return tableArray;
  }
  
  // 执行过滤操作
  const keyword = searchKeyword.value.toLowerCase().trim();
  return tableArray.filter(table => {
    if (!table) return false;
    
    // 安全地访问每个属性
    const name = table.name?.toLowerCase() || '';
    const schema = table.schema?.toLowerCase() || '';
    const comment = table.comment?.toLowerCase() || '';
    
    return name.includes(keyword) || 
           schema.includes(keyword) || 
           comment.includes(keyword);
  });
});

// 初始化加载
onMounted(async () => {
  try {
    console.log('元数据页面挂载完成，开始初始化数据...')
    await initData();
  } catch (error) {
    console.error('页面初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
});

// 初始化数据方法，可以被重用
async function initData() {
  try {
    loading.value = true
    console.log('开始加载数据源列表...')
    
    // 加载数据源列表
    const result = await getDatasourceList()
    console.log('数据源列表加载结果:', result)
    
    // 防止undefined或null
    if (!result) {
      datasources.value = []
      ElMessage.warning('未获取到数据源列表')
      return
    }
    
    // 处理不同的响应格式
    if (Array.isArray(result)) {
      datasources.value = result as Datasource[]
    } else if (result && typeof result === 'object' && 'data' in result) {
      datasources.value = Array.isArray(result.data) ? result.data as Datasource[] : []
    } else {
      datasources.value = []
      console.error('数据源响应格式异常:', result)
    }
    
    console.log('数据源列表:', datasources.value)
    
    // 如果存在数据源，默认选择第一个并加载表列表
    if (datasources.value.length > 0) {
      // 确保数据源ID存在且有效
      const firstDatasource = datasources.value[0]
      if (firstDatasource && firstDatasource.id) {
        selectedDatasource.value = firstDatasource.id.toString()
        console.log('已选择数据源:', selectedDatasource.value)
        
        // 确保在状态更新后再加载表列表
        await new Promise(resolve => setTimeout(resolve, 0))
        await loadTables()
      } else {
        console.warn('第一个数据源ID无效:', firstDatasource)
        ElMessage.warning('数据源信息不完整，请检查数据源配置')
      }
      hasLoadedData.value = true
    } else {
      console.warn('没有可用的数据源')
      ElMessage.warning('没有可用的数据源，请先添加数据源')
    }
  } catch (error: any) {
    console.error('初始化元数据管理失败:', error)
    ElMessage.error(`加载数据源列表失败: ${error.message || '未知错误'}`)
    datasources.value = [] // 确保即使出错也有一个有效的空数组
  } finally {
    loading.value = false
  }
}

// 加载表列表
async function loadTables() {
  if (!selectedDatasource.value) {
    console.warn('未选择数据源，清空表列表')
    tables.value = []
    return
  }
  
  try {
    loading.value = true
    console.log('开始加载表列表, 数据源ID:', selectedDatasource.value)
    
    const response = await getTableList(selectedDatasource.value)
    console.log('表列表加载结果:', response)
    
    // 确保response是数组
    if (Array.isArray(response)) {
      tables.value = response
      if (response.length === 0) {
        ElMessage.warning('该数据源暂无表数据')
        console.warn('表列表为空，可能需要刷新元数据')
      } else {
        console.log('成功加载了', response.length, '个表')
      }
    } else {
      console.error('表列表响应格式错误:', response)
      tables.value = []
      ElMessage.error('获取表列表失败：响应格式错误')
    }
  } catch (error: any) {
    console.error('加载表列表失败:', error)
    tables.value = []
    ElMessage.error(`加载表列表失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

// 刷新数据源的所有元数据
async function handleRefreshMetadata() {
  if (!selectedDatasource.value) {
    ElMessage.warning('请先选择数据源')
    return
  }
  
  try {
    refreshing.value = true
    await refreshDatasourceMetadata(selectedDatasource.value)
    ElMessage.success('刷新元数据成功')
    await loadTables()
  } catch (error: any) {
    console.error('刷新元数据失败:', error)
    ElMessage.error(`刷新元数据失败: ${error.message || '未知错误'}`)
  } finally {
    refreshing.value = false
  }
}

// 查看表详情
async function handleViewTableDetail(table: TableMetadata) {
  if (!table || !table.schema || !table.name) {
    console.error('表数据不完整，无法查看详情:', table)
    ElMessage.error('表数据不完整，无法查看详情')
    return
  }

  try {
    loading.value = true
    // 直接使用响应，API已经返回了表对象
    const response = await getTableMetadata(selectedDatasource.value, table.schema, table.name)
    selectedTable.value = response
    showTableDetail.value = !!response
  } catch (error: any) {
    console.error('获取表详情失败:', error)
    ElMessage.error(`获取表详情失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

// 刷新单表元数据
async function handleRefreshTableMetadata(table: TableMetadata) {
  if (!table || !table.schema || !table.name) {
    console.error('表数据不完整，无法刷新元数据:', table)
    ElMessage.error('表数据不完整，无法刷新元数据')
    return
  }

  try {
    refreshing.value = true
    await refreshTableMetadata(selectedDatasource.value, table.schema, table.name)
    ElMessage.success(`刷新表 ${table.schema}.${table.name} 元数据成功`)
    await loadTables()
  } catch (error: any) {
    console.error('刷新表元数据失败:', error)
    ElMessage.error(`刷新表元数据失败: ${error.message || '未知错误'}`)
  } finally {
    refreshing.value = false
  }
}

// 数据源变更
async function handleDatasourceChange() {
  console.log('数据源已变更为:', selectedDatasource.value)
  selectedTable.value = null
  // 先清空表列表避免显示旧数据
  tables.value = []
  // 确保在状态更新后再加载表列表
  await new Promise(resolve => setTimeout(resolve, 0))
  await loadTables()
}

// 重新加载数据
async function handleReloadData() {
  await initData()
}

// 格式化字节大小
function formatSize(bytes: number | undefined) {
  // 确保bytes是有效的数字
  if (bytes === undefined || bytes === null || isNaN(Number(bytes))) {
    return '-'
  }
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = Number(bytes)
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}
</script>

<template>
  <div class="metadata-container">
    <div class="metadata-header">
      <h2>元数据管理</h2>
      <div class="metadata-toolbar">
        <el-select 
          v-model="selectedDatasource" 
          placeholder="选择数据源" 
          @change="handleDatasourceChange"
          :loading="loading"
          class="datasource-select"
        >
          <el-option 
            v-for="ds in (datasources || [])" 
            :key="ds?.id ? ds.id.toString() : ''" 
            :label="ds?.name || ''" 
            :value="ds?.id ? ds.id.toString() : ''" 
          />
        </el-select>
        
        <el-button 
          type="primary" 
          @click="handleRefreshMetadata" 
          :loading="refreshing"
          :disabled="!selectedDatasource"
        >
          刷新元数据
        </el-button>
        
        <el-button 
          type="warning" 
          @click="handleReloadData" 
          :loading="loading"
          :icon="Refresh"
        >
          重新加载
        </el-button>
        
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索表名、模式或注释" 
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <el-card class="table-card" shadow="hover">
      <el-table 
        :data="filterTables" 
        v-loading="loading" 
        style="width: 100%"
        border
        stripe
        highlight-current-row
        element-loading-text="正在加载数据..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
        :empty-text="selectedDatasource 
          ? (hasLoadedData 
              ? (tables.length === 0 
                  ? '暂无表数据，请尝试刷新元数据' 
                  : '未找到符合条件的表') 
              : '加载中...')
          : '请选择数据源'"
      >
        <template #empty>
          <div class="empty-table-container">
            <p>{{ selectedDatasource 
              ? (hasLoadedData 
                  ? (tables.length === 0 
                      ? '暂无表数据，请尝试刷新元数据' 
                      : '未找到符合条件的表') 
                  : '加载中...') 
              : '请选择数据源' }}</p>
            
            <el-button 
              v-if="selectedDatasource && hasLoadedData && tables.length === 0"
              type="primary"
              @click="handleRefreshMetadata"
              :loading="refreshing"
            >
              刷新元数据
            </el-button>
            
            <el-button 
              v-if="selectedDatasource && hasLoadedData"
              type="info"
              @click="loadTables"
              :loading="loading"
            >
              重新加载表数据
            </el-button>
          </div>
        </template>
        
        <el-table-column prop="schema" label="模式" width="120">
          <template #default="scope">
            {{ scope.row?.schema || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="表名" width="180">
          <template #default="scope">
            {{ scope.row?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="注释" min-width="200">
          <template #default="scope">
            {{ scope.row?.comment || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="rowCount" label="行数" width="120">
          <template #default="scope">
            {{ scope.row?.rowCount?.toLocaleString() || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="数据大小" width="120">
          <template #default="scope">
            {{ formatSize(scope.row?.dataSize) }}
          </template>
        </el-table-column>
        <el-table-column label="索引大小" width="120">
          <template #default="scope">
            {{ formatSize(scope.row?.indexSize) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleViewTableDetail(scope.row)"
              text
              v-if="scope.row"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              type="info" 
              @click="handleRefreshTableMetadata(scope.row)"
              :loading="refreshing"
              text
              v-if="scope.row"
            >
              刷新
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 表详情对话框 -->
    <table-detail-dialog
      v-if="showTableDetail && selectedTable"
      v-model="showTableDetail"
      :table="selectedTable"
    />
  </div>
</template>

<style lang="scss" scoped>
.metadata-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.metadata-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.metadata-toolbar {
  display: flex;
  align-items: center;
  gap: 15px;
}

.datasource-select {
  width: 220px;
}

.search-input {
  width: 250px;
}

.table-card {
  flex: 1;
  margin-bottom: 20px;
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
  
  .empty-table-container {
    padding: 40px 0;
    text-align: center;
    
    p {
      margin-bottom: 20px;
      font-size: 16px;
      color: #909399;
    }
    
    .el-button {
      margin: 5px;
    }
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
  }
}

.mr-1 {
  margin-right: 4px;
}
</style>