<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TableColumnType } from 'ant-design-vue';
import { useQueryStore } from '@/stores/query';

const props = defineProps<{
  value: Array<{
    field: string;
    label: string;
    type: string;
    required: boolean;
    defaultValue?: string;
    hidden: boolean;
    order: number;
  }>;
  datasourceId: string;
}>();

const emit = defineEmits<{
  (e: 'update:value', value: Array<{
    field: string;
    label: string;
    type: string;
    required: boolean;
    defaultValue?: string;
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
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 150,
    slots: { customRender: 'type' },
  },
  {
    title: '必填',
    dataIndex: 'required',
    key: 'required',
    width: 80,
    slots: { customRender: 'required' },
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue',
    key: 'defaultValue',
    width: 150,
    slots: { customRender: 'defaultValue' },
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

// 条件列表
const conditions = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value),
});

// 添加条件
const handleAdd = () => {
  conditions.value = [
    ...conditions.value,
    {
      field: '',
      label: '',
      type: 'input',
      required: false,
      defaultValue: '',
      hidden: false,
      order: conditions.value.length,
    },
  ];
};

// 删除条件
const handleRemove = (index: number) => {
  const newConditions = [...conditions.value];
  newConditions.splice(index, 1);
  conditions.value = newConditions;
};
</script>

<template>
  <div class="query-conditions">
    <div class="config-header">
      <span>条件列表</span>
      <a-button type="link" @click="handleAdd">
        <template #icon><PlusOutlined /></template>
        添加条件
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="conditions"
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

      <!-- 类型 -->
      <template #type="{ text, record }">
        <a-select
          v-model:value="record.type"
          style="width: 100%"
        >
          <a-select-option value="input">输入框</a-select-option>
          <a-select-option value="select">下拉框</a-select-option>
          <a-select-option value="date">日期选择器</a-select-option>
          <a-select-option value="datetime">日期时间选择器</a-select-option>
          <a-select-option value="number">数字输入框</a-select-option>
        </a-select>
      </template>

      <!-- 必填 -->
      <template #required="{ text, record }">
        <a-switch v-model:checked="record.required" />
      </template>

      <!-- 默认值 -->
      <template #defaultValue="{ text, record }">
        <a-input
          v-model:value="record.defaultValue"
          placeholder="请输入默认值"
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
.query-conditions {
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style>