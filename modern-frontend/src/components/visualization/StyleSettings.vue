<template>
  <div class="style-settings">
    <el-card class="settings-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>样式设置</span>
          <el-tooltip content="调整图表样式和外观" placement="top">
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      
      <!-- 基础样式设置 -->
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="基础设置" name="basic">
          <div class="setting-section">
            <div class="form-item">
              <div class="form-item-label">标题</div>
              <el-input v-model="localSettings.title" placeholder="输入图表标题" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">副标题</div>
              <el-input v-model="localSettings.subtitle" placeholder="输入副标题" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">背景颜色</div>
              <el-color-picker v-model="localSettings.backgroundColor" show-alpha />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">图例</div>
              <div class="form-item-content">
                <el-switch v-model="localSettings.showLegend" />
                
                <template v-if="localSettings.showLegend">
                  <div class="sub-item">
                    <span>位置</span>
                    <el-select v-model="localSettings.legendPosition" placeholder="选择位置">
                      <el-option label="顶部" value="top" />
                      <el-option label="底部" value="bottom" />
                      <el-option label="左侧" value="left" />
                      <el-option label="右侧" value="right" />
                    </el-select>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </el-collapse-item>
        
        <!-- 动画设置 -->
        <el-collapse-item title="动画效果" name="animation">
          <div class="setting-section">
            <div class="form-item">
              <div class="form-item-label">开启动画</div>
              <el-switch v-model="localSettings.animation.enabled" />
            </div>
            
            <template v-if="localSettings.animation.enabled">
              <div class="form-item">
                <div class="form-item-label">动画时长</div>
                <div class="form-item-content">
                  <el-slider 
                    v-model="localSettings.animation.duration" 
                    :min="200" 
                    :max="2000" 
                    :step="100"
                    show-input
                  />
                </div>
              </div>
              
              <div class="form-item">
                <div class="form-item-label">缓动效果</div>
                <el-select v-model="localSettings.animation.easing">
                  <el-option label="线性" value="linear" />
                  <el-option label="圆滑" value="cubicOut" />
                  <el-option label="弹性" value="elasticOut" />
                  <el-option label="反弹" value="bounceOut" />
                </el-select>
              </div>
              
              <div class="form-item">
                <div class="form-item-label">延迟时间</div>
                <div class="form-item-content">
                  <el-slider 
                    v-model="localSettings.animation.delay" 
                    :min="0" 
                    :max="1000" 
                    :step="50"
                    show-input
                  />
                </div>
              </div>
            </template>
          </div>
        </el-collapse-item>
        
        <!-- 图表内边距 -->
        <el-collapse-item title="内边距" name="padding">
          <div class="setting-section">
            <div class="form-item">
              <div class="form-item-label">上边距</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.padding.top" 
                  :min="0" 
                  :max="100" 
                  :step="5"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">右边距</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.padding.right" 
                  :min="0" 
                  :max="100" 
                  :step="5"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">下边距</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.padding.bottom" 
                  :min="0" 
                  :max="100" 
                  :step="5"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">左边距</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.padding.left" 
                  :min="0" 
                  :max="100" 
                  :step="5"
                  show-input
                />
              </div>
            </div>
          </div>
        </el-collapse-item>
        
        <!-- 颜色设置 -->
        <el-collapse-item title="颜色配置" name="colors">
          <div class="setting-section">
            <div class="form-item">
              <div class="form-item-label">调色板</div>
              <div class="color-palette">
                <div 
                  v-for="(color, index) in localSettings.colors" 
                  :key="index"
                  class="color-item"
                >
                  <el-color-picker v-model="localSettings.colors[index]" />
                  <el-button 
                    class="color-delete" 
                    @click="removeColor(index)" 
                    type="danger" 
                    circle 
                    plain 
                    size="small"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                
                <el-button 
                  class="add-color-btn" 
                  @click="addColor" 
                  type="primary" 
                  plain 
                  size="small"
                >
                  <el-icon><Plus /></el-icon>
                  添加颜色
                </el-button>
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">预设方案</div>
              <div class="color-scheme-list">
                <div 
                  v-for="(scheme, index) in colorSchemes" 
                  :key="index"
                  class="color-scheme"
                  @click="applyColorScheme(scheme.colors)"
                >
                  <div 
                    v-for="color in scheme.colors" 
                    :key="color"
                    class="scheme-color" 
                    :style="{ backgroundColor: color }"
                  ></div>
                  <div class="scheme-name">{{ scheme.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
        
        <!-- 图表特有设置 -->
        <el-collapse-item title="图表特有设置" name="specific">
          <!-- 柱状图设置 -->
          <div v-if="visualizationType === 'bar'" class="setting-section">
            <div class="form-item">
              <div class="form-item-label">柱条宽度</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.barWidth" 
                  :min="10" 
                  :max="100" 
                  :step="1"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">柱条间距</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.barGap" 
                  :min="0" 
                  :max="100" 
                  :step="1"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">堆叠显示</div>
              <el-switch v-model="localSettings.specific.stack" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">水平显示</div>
              <el-switch v-model="localSettings.specific.horizontal" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">显示数值</div>
              <el-switch v-model="localSettings.specific.showValues" />
            </div>
          </div>
          
          <!-- 折线图设置 -->
          <div v-if="visualizationType === 'line'" class="setting-section">
            <div class="form-item">
              <div class="form-item-label">平滑曲线</div>
              <el-switch v-model="localSettings.specific.smooth" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">线条宽度</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.lineWidth" 
                  :min="1" 
                  :max="10" 
                  :step="1"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">线条样式</div>
              <el-select v-model="localSettings.specific.lineType">
                <el-option label="实线" value="solid" />
                <el-option label="虚线" value="dashed" />
                <el-option label="点线" value="dotted" />
              </el-select>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">显示数据点</div>
              <el-switch v-model="localSettings.specific.showSymbol" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">面积填充</div>
              <el-switch v-model="localSettings.specific.showArea" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">堆叠显示</div>
              <el-switch v-model="localSettings.specific.stack" />
            </div>
          </div>
          
          <!-- 饼图设置 -->
          <div v-if="visualizationType === 'pie'" class="setting-section">
            <div class="form-item">
              <div class="form-item-label">内环半径</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.innerRadius" 
                  :min="0" 
                  :max="70" 
                  :step="1"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">外环半径</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.outerRadius" 
                  :min="30" 
                  :max="100" 
                  :step="1"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">显示数值</div>
              <el-switch v-model="localSettings.specific.showValues" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">显示百分比</div>
              <el-switch v-model="localSettings.specific.showPercentage" />
            </div>
            
            <div class="form-item">
              <div class="form-item-label">标签引导线长度</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.labelLineLength" 
                  :min="0" 
                  :max="50" 
                  :step="1"
                  show-input
                />
              </div>
            </div>
          </div>
          
          <!-- 散点图设置 -->
          <div v-if="visualizationType === 'scatter'" class="setting-section">
            <div class="form-item">
              <div class="form-item-label">符号大小</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.symbolSize" 
                  :min="1" 
                  :max="30" 
                  :step="1"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">符号形状</div>
              <el-select v-model="localSettings.specific.symbolType">
                <el-option label="圆形" value="circle" />
                <el-option label="矩形" value="rect" />
                <el-option label="三角形" value="triangle" />
                <el-option label="菱形" value="diamond" />
                <el-option label="箭头" value="arrow" />
              </el-select>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">显示趋势线</div>
              <el-switch v-model="localSettings.specific.showTrendLine" />
            </div>
          </div>
          
          <!-- 雷达图设置 -->
          <div v-if="visualizationType === 'radar'" class="setting-section">
            <div class="form-item">
              <div class="form-item-label">形状</div>
              <el-select v-model="localSettings.specific.shape">
                <el-option label="圆形" value="circle" />
                <el-option label="多边形" value="polygon" />
              </el-select>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">填充透明度</div>
              <div class="form-item-content">
                <el-slider 
                  v-model="localSettings.specific.areaOpacity" 
                  :min="0" 
                  :max="1" 
                  :step="0.1"
                  show-input
                />
              </div>
            </div>
            
            <div class="form-item">
              <div class="form-item-label">显示刻度线</div>
              <el-switch v-model="localSettings.specific.showAxisLine" />
            </div>
          </div>
          
          <!-- 其他图表类型设置 -->
          <div v-else-if="!['bar', 'line', 'pie', 'scatter', 'radar'].includes(visualizationType)" class="setting-section">
            <el-empty description="当前图表类型无特有设置" />
          </div>
        </el-collapse-item>
      </el-collapse>
      
      <div class="settings-actions">
        <el-button @click="resetSettings">重置</el-button>
        <el-button type="primary" @click="applySettings">应用</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { InfoFilled, Delete, Plus } from '@element-plus/icons-vue'
import type { ChartStyleSettings } from '@/types/visualization'

// 属性定义
const props = defineProps({
  modelValue: {
    type: Object as () => ChartStyleSettings,
    required: true
  },
  visualizationType: {
    type: String,
    default: 'bar'
  }
})

// 事件
const emit = defineEmits(['update:modelValue', 'update:style'])

// 活动折叠面板
const activeCollapse = ref(['basic'])

// 本地设置
const localSettings = reactive<ChartStyleSettings>({
  title: '',
  subtitle: '',
  showLegend: true,
  legendPosition: 'bottom',
  backgroundColor: '',
  padding: {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  },
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'cubicOut',
    delay: 0
  },
  colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
  specific: {}
})

// 颜色方案
const colorSchemes = [
  {
    name: '默认',
    colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  },
  {
    name: '冷色调',
    colors: ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3']
  },
  {
    name: '暖色调',
    colors: ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58']
  },
  {
    name: '明亮',
    colors: ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff']
  },
  {
    name: '黑白灰',
    colors: ['#2f4554', '#61a0a8', '#b5c334', '#d4a4eb', '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa']
  },
  {
    name: '浅色',
    colors: ['#b8d2c7', '#c6dbef', '#ceb5cf', '#ddedaa', '#f5c3c5', '#ffffcc', '#e3eaa7', '#b8d4d7', '#e5ccc3']
  }
]

// 监听属性变化
watch(() => props.modelValue, (newVal) => {
  // 深拷贝防止引用问题
  Object.assign(localSettings, JSON.parse(JSON.stringify(newVal)))
  
  // 确保特定图表配置存在
  if (!localSettings.specific) {
    localSettings.specific = {}
  }
  
  // 确保颜色数组存在
  if (!localSettings.colors || !Array.isArray(localSettings.colors) || localSettings.colors.length === 0) {
    localSettings.colors = [...colorSchemes[0].colors]
  }
}, { deep: true, immediate: true })

// 监听图表类型变化，设置默认特定配置
watch(() => props.visualizationType, (newType) => {
  // 重置特定配置
  localSettings.specific = {}
  
  // 根据图表类型设置默认配置
  switch (newType) {
    case 'bar':
      localSettings.specific = {
        barWidth: 40,
        barGap: 30,
        stack: false,
        horizontal: false,
        showValues: false
      }
      break
    case 'line':
      localSettings.specific = {
        smooth: false,
        lineWidth: 2,
        lineType: 'solid',
        showSymbol: true,
        showArea: false,
        stack: false
      }
      break
    case 'pie':
      localSettings.specific = {
        innerRadius: 0,
        outerRadius: 70,
        showValues: true,
        showPercentage: true,
        labelLineLength: 20
      }
      break
    case 'scatter':
      localSettings.specific = {
        symbolSize: 10,
        symbolType: 'circle',
        showTrendLine: false
      }
      break
    case 'radar':
      localSettings.specific = {
        shape: 'polygon',
        areaOpacity: 0.6,
        showAxisLine: true
      }
      break
  }
}, { immediate: true })

// 添加颜色
const addColor = () => {
  // 生成一个随机颜色
  const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`
  localSettings.colors.push(randomColor)
}

// 移除颜色
const removeColor = (index: number) => {
  if (localSettings.colors.length > 1) {
    localSettings.colors.splice(index, 1)
  }
}

// 应用颜色方案
const applyColorScheme = (colors: string[]) => {
  localSettings.colors = [...colors]
}

// 应用设置
const applySettings = () => {
  // 深拷贝防止引用问题
  const settingsCopy = JSON.parse(JSON.stringify(localSettings))
  emit('update:modelValue', settingsCopy)
  emit('update:style', settingsCopy)
}

// 重置设置
const resetSettings = () => {
  // 重置为默认值
  localSettings.title = ''
  localSettings.subtitle = ''
  localSettings.showLegend = true
  localSettings.legendPosition = 'bottom'
  localSettings.backgroundColor = ''
  localSettings.padding = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  }
  localSettings.animation = {
    enabled: true,
    duration: 1000,
    easing: 'cubicOut',
    delay: 0
  }
  localSettings.colors = [...colorSchemes[0].colors]
  
  // 根据图表类型重置特定设置
  switch (props.visualizationType) {
    case 'bar':
      localSettings.specific = {
        barWidth: 40,
        barGap: 30,
        stack: false,
        horizontal: false,
        showValues: false
      }
      break
    case 'line':
      localSettings.specific = {
        smooth: false,
        lineWidth: 2,
        lineType: 'solid',
        showSymbol: true,
        showArea: false,
        stack: false
      }
      break
    case 'pie':
      localSettings.specific = {
        innerRadius: 0,
        outerRadius: 70,
        showValues: true,
        showPercentage: true,
        labelLineLength: 20
      }
      break
    case 'scatter':
      localSettings.specific = {
        symbolSize: 10,
        symbolType: 'circle',
        showTrendLine: false
      }
      break
    case 'radar':
      localSettings.specific = {
        shape: 'polygon',
        areaOpacity: 0.6,
        showAxisLine: true
      }
      break
  }
  
  // 触发更新
  applySettings()
}

// 初始化
onMounted(() => {
  // 初始化本地设置
  if (Object.keys(props.modelValue).length > 0) {
    Object.assign(localSettings, JSON.parse(JSON.stringify(props.modelValue)))
  }
})
</script>

<style lang="scss" scoped>
.style-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-card {
  height: 100%;
  overflow-y: auto;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .form-item-label {
    font-size: 14px;
    color: #606266;
  }
  
  .form-item-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .sub-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    
    span {
      font-size: 14px;
      color: #606266;
      width: 60px;
    }
  }
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  
  .color-item {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .color-delete {
      border: none;
      padding: 2px;
    }
  }
  
  .add-color-btn {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.color-scheme-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  
  .color-scheme {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px;
    width: 100px;
    
    &:hover {
      border-color: #409eff;
    }
    
    .scheme-colors {
      display: flex;
      margin-bottom: 4px;
    }
    
    .scheme-color {
      width: 12px;
      height: 12px;
      margin-right: 2px;
      margin-bottom: 4px;
    }
    
    .scheme-name {
      font-size: 12px;
      color: #606266;
    }
  }
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>