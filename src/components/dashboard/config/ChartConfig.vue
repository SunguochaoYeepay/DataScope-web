<template>
  <div class="chart-config">
    <v-form @submit.prevent>
      <v-text-field
        v-model="config.title"
        label="标题"
        variant="outlined"
        density="comfortable"
        class="mb-4"
      ></v-text-field>

      <v-select
        v-model="config.chartType"
        :items="chartTypes"
        label="图表类型"
        variant="outlined"
        density="comfortable"
        class="mb-4"
      ></v-select>

      <v-select
        v-model="config.dataSource"
        :items="dataSources"
        label="数据源"
        variant="outlined"
        density="comfortable"
        class="mb-4"
      ></v-select>

      <v-textarea
        v-model="config.query"
        label="查询语句"
        variant="outlined"
        rows="5"
        class="mb-4"
      ></v-textarea>

      <v-expansion-panels variant="accordion">
        <v-expansion-panel title="图表选项">
          <template v-slot:text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="config.options.legend"
                  label="显示图例"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="config.options.tooltip"
                  label="显示提示框"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="config.options.dataZoom"
                  label="启用缩放"
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel>

        <v-expansion-panel title="数据映射">
          <template v-slot:text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="config.mapping.x"
                  :items="columns"
                  label="X轴"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="config.mapping.y"
                  :items="columns"
                  label="Y轴"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="config.mapping.series"
                  :items="columns"
                  label="系列"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel>

        <v-expansion-panel title="样式设置">
          <template v-slot:text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="config.style.theme"
                  :items="themes"
                  label="主题"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-color-picker
                  v-model="config.style.colors"
                  label="配色方案"
                  multiple
                  show-swatches
                  swatches-max-height="200"
                ></v-color-picker>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          :loading="isLoading"
          @click="handlePreview"
          class="mr-2"
        >
          预览
        </v-btn>
        <v-btn
          color="primary"
          :loading="isLoading"
          @click="handleSave"
        >
          保存
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps<{
  modelValue: any;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'preview'): void;
  (e: 'save'): void;
}>();

// 图表类型选项
const chartTypes = [
  { title: '折线图', value: 'line' },
  { title: '柱状图', value: 'bar' },
  { title: '饼图', value: 'pie' },
  { title: '散点图', value: 'scatter' },
  { title: '雷达图', value: 'radar' },
];

// 数据源选项
const dataSources = [
  { title: 'MySQL', value: 'mysql' },
  { title: 'PostgreSQL', value: 'postgresql' },
  { title: 'ClickHouse', value: 'clickhouse' },
];

// 主题选项
const themes = [
  { title: '默认', value: 'default' },
  { title: '暗色', value: 'dark' },
  { title: '浅色', value: 'light' },
];

// 模拟列选项
const columns = [
  { title: '日期', value: 'date' },
  { title: '销量', value: 'sales' },
  { title: '利润', value: 'profit' },
  { title: '地区', value: 'region' },
];

// 配置对象
const config = reactive({
  ...props.modelValue,
});

// 处理预览
const handlePreview = () => {
  emit('preview');
};

// 处理保存
const handleSave = () => {
  emit('update:modelValue', { ...config });
  emit('save');
};
</script>

<style scoped>
.chart-config {
  max-width: 800px;
  margin: 0 auto;
}
</style>