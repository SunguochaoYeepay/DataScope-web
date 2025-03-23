<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TableColumnType } from 'ant-design-vue';
import { useQueryStore } from '@/stores/query';

const props = defineProps<{
  value: Array<{
    field: string;
    label: string;
    hidden: boolean;
    order: number;
  }>;
  datasourceId: string;
}>();

const emit = defineEmits<{
  (e: 'update:value', value: Array<{
    field: string;
    label: string;
    hidden: boolean;
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
    title: '标签',
    dataIndex: 'label',
    key: 'label',
    width: 200,
    slots: { customRender: 'label' },
  },
  {
    title: '隐藏',
    dataIndex: 'hidden',
    key: 'hidden',
    width: 80,
    slots: { customRender: 'hidden' },
  },
  {
    title: '排序',
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

// 结果列表
const resultColumns = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value),
});

// 添加结果列
const handleAdd = () => {
  resultColumns.value = [
    ...resultColumns.value,
    {
      field: '',
      label: '',
      hidden: false,
      order: resultColumns.value.length,
    },
  ];
};

// 删除结果列
const handleRemove = (index: number) => {
  const newColumns = [...resultColumns.value];
  newColumns.splice(index, 1);
  resultColumns.value = newColumns;
};
</script>

<template>
  <div class="result-columns">
    <div class="config-header">
      <span>结果列表</span>
      <a-button type="link" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        添加结果列
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="resultColumns"
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

      <!-- 标签 -->
      <template #label="{ text, record }">
        <a-input
          v-model:value="record.label"
          placeholder="请输入标签"
        />
      </template>

      <!-- 隐藏 -->
      <template #hidden="{ text, record }">
        <a-switch v-model:checked="record.hidden" />
      </template>

      <!-- 排序 -->
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
.result-columns {
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style>