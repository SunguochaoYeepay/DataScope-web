<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  value: {
    pageSize: number;
    current: number;
    total?: number;
  };
}>();

const emit = defineEmits<{
  (e: 'update:value', value: {
    pageSize: number;
    current: number;
    total?: number;
  }): void;
}>();

// 分页配置
const paginationConfig = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value),
});

// 页码选项
const pageSizeOptions = ['10', '20', '50', '100'];

// 处理页码变化
const handlePageChange = (page: number, pageSize: number) => {
  paginationConfig.value = {
    ...paginationConfig.value,
    current: page,
    pageSize,
  };
};
</script>

<template>
  <div class="pagination-config">
    <div class="config-header">
      <span>分页配置</span>
    </div>
    <div class="config-content">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="每页条数">
              <a-select
                v-model:value="paginationConfig.pageSize"
                :options="pageSizeOptions.map(size => ({
                  value: Number(size),
                  label: `${size} 条/页`
                }))"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="当前页码">
              <a-input-number
                v-model:value="paginationConfig.current"
                :min="1"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pagination-config {
  .config-header {
    margin-bottom: 16px;
  }

  .config-content {
    padding: 16px;
    background-color: #fafafa;
    border-radius: 4px;
  }
}
</style>