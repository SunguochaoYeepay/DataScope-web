<template>
  <a-modal
    :open="visible"
    :title="editingDatasource ? '编辑数据源' : '新建数据源'"
    width="600px"
    :maskClosable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <!-- 数据源名称 -->
      <a-form-item name="name" label="数据源名称">
        <a-input
          v-model:value="formState.name"
          placeholder="请输入数据源名称"
          allow-clear
        />
      </a-form-item>

      <!-- 数据源类型 -->
      <a-form-item name="type" label="数据源类型">
        <a-select
          v-model:value="formState.type"
          placeholder="请选择数据源类型"
          :options="datasourceTypes"
        />
      </a-form-item>

      <!-- 主机地址 -->
      <a-form-item name="host" label="主机地址">
        <a-input
          v-model:value="formState.host"
          placeholder="请输入主机地址"
          allow-clear
        />
      </a-form-item>

      <!-- 端口号 -->
      <a-form-item name="port" label="端口号">
        <a-input-number
          v-model:value="formState.port"
          placeholder="请输入端口号"
          :min="1"
          :max="65535"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 数据库名称 -->
      <a-form-item name="database" label="数据库名称">
        <a-input
          v-model:value="formState.database"
          placeholder="请输入数据库名称"
          allow-clear
        />
      </a-form-item>

      <!-- 用户名 -->
      <a-form-item name="username" label="用户名">
        <a-input
          v-model:value="formState.username"
          placeholder="请输入用户名"
          allow-clear
        />
      </a-form-item>

      <!-- 密码 -->
      <a-form-item name="password" label="密码">
        <a-input-password
          v-model:value="formState.password"
          placeholder="请输入密码"
          allow-clear
        />
      </a-form-item>

      <!-- 描述 -->
      <a-form-item name="description" label="描述">
        <a-textarea
          v-model:value="formState.description"
          placeholder="请输入数据源描述"
          :rows="3"
          allow-clear
        />
      </a-form-item>
    </a-form>

    <!-- 额外的底部按钮 -->
    <template #footer>
      <a-space>
        <a-button
          :loading="testLoading"
          @click="handleTest"
        >
          测试连接
        </a-button>
        <a-button @click="handleCancel">取消</a-button>
        <a-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { useDataSourceStore } from '@/stores/datasource';

// Props
const props = defineProps<{
  visible: boolean;
  editingDatasource: any;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}>();

// Store
const datasourceStore = useDataSourceStore();

// 表单实例
const formRef = ref<FormInstance>();

// 加载状态
const submitLoading = ref(false);
const testLoading = ref(false);

// 数据源类型选项
const datasourceTypes = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'ClickHouse', value: 'clickhouse' },
];

// 表单状态
const formState = reactive({
  name: '',
  type: undefined,
  host: '',
  port: undefined,
  database: '',
  username: '',
  password: '',
  description: '',
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入数据源名称' }],
  type: [{ required: true, message: '请选择数据源类型' }],
  host: [{ required: true, message: '请输入主机地址' }],
  port: [{ required: true, message: '请输入端口号' }],
  database: [{ required: true, message: '请输入数据库名称' }],
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

// 监听编辑数据源变化
watch(
  () => props.editingDatasource,
  (newVal) => {
    if (newVal) {
      Object.assign(formState, newVal);
    } else {
      // 重置表单
      Object.assign(formState, {
        name: '',
        type: undefined,
        host: '',
        port: undefined,
        database: '',
        username: '',
        password: '',
        description: '',
      });
    }
  },
  { immediate: true }
);

// 处理测试连接
const handleTest = async () => {
  try {
    await formRef.value?.validate();
    testLoading.value = true;
    await datasourceStore.testConnection(formState);
    message.success('连接测试成功');
  } catch (err: any) {
    if (err.errorFields) {
      message.error('请填写完整的连接信息');
    } else {
      message.error(err.message || '连接测试失败');
    }
  } finally {
    testLoading.value = false;
  }
};

// 处理提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    if (props.editingDatasource) {
      await datasourceStore.updateDataSource(props.editingDatasource.id, formState);
      message.success('数据源更新成功');
    } else {
      await datasourceStore.createDataSource(formState);
      message.success('数据源创建成功');
    }

    emit('success');
    emit('update:visible', false);
  } catch (err: any) {
    if (err.errorFields) {
      message.error('请填写必填项');
    } else {
      message.error(err.message || '操作失败');
    }
  } finally {
    submitLoading.value = false;
  }
};

// 处理取消
const handleCancel = () => {
  formRef.value?.resetFields();
  emit('update:visible', false);
};
</script>