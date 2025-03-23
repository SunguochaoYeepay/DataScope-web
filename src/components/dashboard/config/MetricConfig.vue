<template>
  <div class="metric-config">
    <v-form @submit.prevent>
      <v-text-field
        v-model="config.title"
        label="标题"
        variant="outlined"
        density="comfortable"
        class="mb-4"
      ></v-text-field>

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
        <v-expansion-panel title="显示设置">
          <template v-slot:text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="config.format"
                  :items="formatOptions"
                  label="数值格式"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="config.precision"
                  :items="[0, 1, 2, 3, 4]"
                  label="小数位数"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="config.showTrend"
                  label="显示趋势"
                  hide-details
                  class="mb-2"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6" v-if="config.showTrend">
                <v-select
                  v-model="config.trendPeriod"
                  :items="trendPeriods"
                  label="趋势周期"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel>

        <v-expansion-panel title="阈值设置">
          <template v-slot:text>
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="config.enableThreshold"
                  label="启用阈值"
                  hide-details
                  class="mb-2"
                ></v-switch>
              </v-col>
              <template v-if="config.enableThreshold">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="config.threshold.warning"
                    type="number"
                    label="警告阈值"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="config.threshold.critical"
                    type="number"
                    label="严重阈值"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
              </template>
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

// 数据源选项
const dataSources = [
  { title: 'MySQL', value: 'mysql' },
  { title: 'PostgreSQL', value: 'postgresql' },
  { title: 'ClickHouse', value: 'clickhouse' },
];

// 格式化选项
const formatOptions = [
  { title: '数字', value: 'number' },
  { title: '百分比', value: 'percentage' },
  { title: '货币', value: 'currency' },
];

// 趋势周期选项
const trendPeriods = [
  { title: '日环比', value: 'day' },
  { title: '周环比', value: 'week' },
  { title: '月环比', value: 'month' },
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
.metric-config {
  max-width: 800px;
  margin: 0 auto;
}
</style>