<template>
  <div class="visualization-page">
    <div class="page-header">
      <h2>可视化管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreateVisualization" :icon="Plus">新建可视化</el-button>
        <el-button type="warning" @click="handleReload" :loading="loading" :icon="Refresh">重新加载</el-button>
      </div>
    </div>
    
    <!-- 可视化列表 -->
    <el-card class="main-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">可视化列表</span>
        </div>
      </template>
      
      <el-table 
        v-loading="loading"
        :data="visualizationList"
        stripe
        border
        style="width: 100%"
        empty-text='未添加可视化，请点击"新建可视化"按钮'
      >
        <el-table-column
          prop="name"
          label="名称"
          min-width="150"
        >
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewVisualization(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
        />
        
        <el-table-column
          prop="type"
          label="图表类型"
          min-width="100"
        >
          <template #default="{ row }">
            <el-tag>{{ getChartTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          label="维度字段"
          min-width="120"
        >
          <template #default="{ row }">
            <span>{{ getDimension(row) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          fixed="right"
          width="200"
        >
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                size="small" 
                :icon="View"
                @click="handleViewVisualization(row)"
              >
                查看
              </el-button>
              <el-button 
                type="warning" 
                size="small" 
                :icon="Edit"
                @click="handleEditVisualization(row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                :icon="Delete"
                @click="handleDeleteVisualization(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="可视化预览"
      :width="900"
      destroy-on-close
    >
      <div v-if="currentVisualization">
        <h3>{{ currentVisualization.name }}</h3>
        <p>{{ currentVisualization.description }}</p>
        
        <div style="height: 400px; margin: 20px 0;">
          <div id="preview-chart" style="width: 100%; height: 100%;"></div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="删除确认"
      width="500"
      destroy-on-close
    >
      <div>
        <p>确定要删除可视化 "{{ currentVisualization?.name }}" 吗？此操作不可恢复。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Edit, Delete, View } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getVisualizationList, getVisualizationData, deleteVisualizationById } from '../../api/visualization';
import type { VisualizationConfig } from '../../types/visualization';

// 路由
const router = useRouter();

// 可视化列表数据
const visualizationList = ref<VisualizationConfig[]>([]);
const loading = ref(false);

// 预览相关
const previewDialogVisible = ref(false);
const currentVisualization = ref<VisualizationConfig | null>(null);
let previewChart: echarts.ECharts | null = null;

// 删除确认
const deleteConfirmVisible = ref(false);

// 获取可视化列表
const fetchVisualizationList = async () => {
  loading.value = true;
  try {
    const result = await getVisualizationList();
    visualizationList.value = result;
  } catch (error) {
    console.error('获取可视化列表失败:', error);
    ElMessage.error('获取可视化列表失败');
  } finally {
    loading.value = false;
  }
};

// 重新加载
const handleReload = () => {
  fetchVisualizationList();
};

// 获取图表类型名称
const getChartTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'bar': '柱状图',
    'line': '折线图',
    'pie': '饼图',
    'scatter': '散点图',
    'radar': '雷达图',
    'funnel': '漏斗图',
    'heatmap': '热力图',
    'treemap': '矩形树图',
    'table': '表格',
    'pivot': '透视表'
  };
  return typeMap[type] || type;
};

// 获取维度字段
const getDimension = (visualization: VisualizationConfig) => {
  return visualization.dimension || '未设置';
};

// 新建可视化
const handleCreateVisualization = () => {
  router.push('/visualization/create');
};

// 查看可视化
const handleViewVisualization = async (visualization: VisualizationConfig) => {
  currentVisualization.value = visualization;
  previewDialogVisible.value = true;
  
  try {
    // 等待DOM更新，确保图表容器已渲染
    await nextTick();
    
    // 获取可视化数据
    const chartData = await getVisualizationData(visualization.id!);
    
    // 初始化ECharts
    if (!previewChart) {
      previewChart = echarts.init(document.getElementById('preview-chart')!);
    }
    
    // 生成图表配置
    const options = generateChartOptions(visualization, chartData);
    
    // 设置图表配置
    previewChart.setOption(options);
  } catch (error) {
    console.error('获取可视化数据失败:', error);
    ElMessage.error('获取可视化数据失败');
  }
};

// 编辑可视化
const handleEditVisualization = (visualization: VisualizationConfig) => {
  router.push(`/visualization/edit/${visualization.id}`);
};

// 删除可视化
const handleDeleteVisualization = (visualization: VisualizationConfig) => {
  currentVisualization.value = visualization;
  deleteConfirmVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (!currentVisualization.value?.id) return;
  
  try {
    await deleteVisualizationById(currentVisualization.value.id);
    ElMessage.success('删除成功');
    deleteConfirmVisible.value = false;
    // 重新加载列表
    fetchVisualizationList();
  } catch (error) {
    console.error('删除可视化失败:', error);
    ElMessage.error('删除可视化失败');
  }
};

// 生成图表配置
const generateChartOptions = (visualization: VisualizationConfig, chartData: any) => {
  const { type, options } = visualization;
  
  // 基础配置
  const baseOptions: any = {
    title: {
      text: visualization.title || visualization.name,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: type === 'pie' ? 'item' : 'axis'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10
    }
  };
  
  // 合并用户配置
  const mergedOptions = { ...baseOptions, ...options };
  
  // 添加数据
  if (chartData) {
    if (type === 'pie') {
      // 饼图数据处理
      const seriesData = chartData.rows.map((row: any) => ({
        name: row[visualization.dimension],
        value: row[visualization.metrics[0]]
      }));
      
      mergedOptions.series = [{
        type: 'pie',
        radius: '60%',
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }];
    } else if (type === 'bar' || type === 'line') {
      // 柱状图或折线图数据处理
      const xAxisData = chartData.rows.map((row: any) => row[visualization.dimension]);
      const series = visualization.metrics.map((metric: string, index: number) => {
        const metricLabel = chartData.columns.find((col: any) => col.name === metric)?.label || metric;
        return {
          name: metricLabel,
          type: type,
          data: chartData.rows.map((row: any) => row[metric])
        };
      });
      
      mergedOptions.xAxis = {
        type: 'category',
        data: xAxisData
      };
      
      mergedOptions.yAxis = {
        type: 'value'
      };
      
      mergedOptions.series = series;
    }
  }
  
  return mergedOptions;
};

// 预览对话框关闭时销毁图表
const handlePreviewDialogClose = () => {
  if (previewChart) {
    previewChart.dispose();
    previewChart = null;
  }
};

// 页面加载时获取可视化列表
onMounted(() => {
  fetchVisualizationList();
});
</script>

<style lang="scss" scoped>
.visualization-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
    }
  }
  
  .main-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}
</style>