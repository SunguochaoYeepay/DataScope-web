<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TableColumnType } from 'ant-design-vue';
import { useQueryStore } from '@/stores/query';

const props = defineProps<{
  value: Array<{
    field: string;
    direction: 'asc' | 'desc';
    order: number;
  }>;
  datasourceId: string;
}>();

const emit = defineEmits<{
  (e: 'update:value', value: Array<{
    field: string;
    direction: 'asc' | 'desc';
    order: number;
  }>): void;
}>();

const queryStore = useQueryStore();

// 可用字段列表
const availableFields = ref<Array<{ name: string; label: string }>>([]);

// 监听数据源变化
watch(() => props.datasourceId, async (newId) => {
  if (newId) {
    availableFields.value = await queryStore.getFields(newId);
  } else {
    availableFields.value = [];
  }
}, { immediate: true });

// 表格列定义
const columns = computed<TableColumnType[]>(() => [
  {
    title: '字段',
    dataIndex: 'field',
    key: 'field',
    width: 200,
    slots: { customRender: 'field' },
  },
  {
    title: '排序方向',
    dataIndex: 'direction',
    key: 'direction',
    width: 150,
    slots: { customRender: 'direction' },
  },
  {
    title: '优先级',
    dataIndex: 'order',
    key: 'order',
    width: 100,
    slots: { customRender: 'order' },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    slots: { customRender: 'action' },
  },
]);

// 排序配置列表
const sortingConfig = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value),
});

// 添加排序配置
const handleAdd = () => {
  sortingConfig.value = [
    ...sortingConfig.value,
    {
      field: '',
      direction: 'asc',
      order: sortingConfig.value.length,
    },
  ];
};

// 删除排序配置
const handleRemove = (index: number) => {
  const newConfig = [...sortingConfig.value];
  newConfig.splice(index, 1);
  sortingConfig.value = newConfig;
};
</script>

<template>
  <div class="sorting-config">
    <div class="config-header">
      <span>排序配置</span>
      <a-button type="link" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        添加排序
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="sortingConfig"
      :pagination="false"
      size="small"
    >
      <!-- 字段 -->
      <template #field="{ text, record }">
        <a-select
          v-model:value="record.field"
          style="width: 100%"
          placeholder="请选择字段"
        >
          <a-select-option
            v-for="field in availableFields"
            :key="field.name"
            :value="field.name"
          >
            {{ field.label || field.name }}
          </a-select-option>
        </a-select>
      </template>

      <!-- 排序方向 -->
      <template #direction="{ text, record }">
        <a-select
          v-model:value="record.direction"
          style="width: 100%"
        >
          <a-select-option value="asc">升序</a-select-option>
          <a-select-option value="desc">降序</a-select-option>
        </a-select>
      </template>

      <!-- 优先级 -->
      <template #order="{ text, record }">
        <a-input-number
          v-model:value="record.order"
          :min="0"
          :max="100"
        />
      </template>

      <!-- 操作 -->
      <template #action="{ record, index }">
        <a-space>
          <a-button
            type="link"
            danger
            size="small"
            @click="handleRemove(index)"
          >
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<style lang="scss" scoped>
.sorting-config {
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style>