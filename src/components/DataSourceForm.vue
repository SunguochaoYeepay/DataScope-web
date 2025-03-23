<!-- 数据源表单组件 -->
<template>
  <a-modal
    :visible="visible"
    :title="dataSource ? '编辑数据源' : '新建数据源'"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <!-- 数据源名称 -->
      <a-form-item
        label="数据源名称"
        name="name"
        :validate-trigger="['change', 'blur']"
      >
        <a-input
          v-model:value="formState.name"
          placeholder="请输入数据源名称"
          :maxlength="50"
          show-count
        />
      </a-form-item>

      <!-- 数据源类型 -->
      <a-form-item
        label="数据源类型"
        name="type"
      >
        <a-select
          v-model:value="formState.type"
          placeholder="请选择数据源类型"
        >
          <a-select-option value="MYSQL">MySQL</a-select-option>
          <a-select-option value="POSTGRESQL">PostgreSQL</a-select-option>
          <a-select-option value="CLICKHOUSE">ClickHouse</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 主机地址 -->
      <a-form-item
        label="主机地址"
        name="host"
      >
        <a-input
          v-model:value="formState.host"
          placeholder="请输入主机地址"
          :maxlength="100"
        />
      </a-form-item>

      <!-- 端口号 -->
      <a-form-item
        label="端口号"
        name="port"
      >
        <a-input-number
          v-model:value="formState.port"
          placeholder="请输入端口号"
          :min="1"
          :max="65535"
          style="width: 100%"
        />
      </a-form-item>

      <!-- 数据库名称 -->
      <a-form-item
        label="数据库名称"
        name="database"
      >
        <a-input
          v-model:value="formState.database"
          placeholder="请输入数据库名称"
          :maxlength="100"
        />
      </a-form-item>

      <!-- 用户名 -->
      <a-form-item
        label="用户名"
        name="username"
      >
        <a-input
          v-model:value="formState.username"
          placeholder="请输入用户名"
          :maxlength="50"
        />
      </a-form-item>

      <!-- 密码 -->
      <a-form-item
        label="密码"
        name="password"
      >
        <a-input-password
          v-model:value="formState.password"
          placeholder="请输入密码"
          :maxlength="100"
        />
      </a-form-item>

      <!-- 描述 -->
      <a-form-item
        label="描述"
        name="description"
      >
        <a-textarea
          v-model:value="formState.description"
          placeholder="请输入描述信息"
          :maxlength="200"
          :auto-size="{ minRows: 2, maxRows: 6 }"
          show-count
        />
      </a-form-item>
    </a-form>

    <!-- 测试连接按钮 -->
    <template #footer>
      <a-space>
        <a-button :loading="testing" @click="handleTest">测试连接</a-button>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Form } from 'ant-design-vue'
import { useDataSourceStore } from '@/stores/datasource'
import type { DataSourceResponse, DataSourceCreateRequest } from '@/types/api'
import { message } from 'ant-design-vue'

const useForm = Form.useForm

// Props 定义
const props = defineProps<{
  visible: boolean
  dataSource: DataSourceResponse | null
}>()

// Emits 定义
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

// 数据源 store
const dataSourceStore = useDataSourceStore()

// 表单状态
const formState = reactive<DataSourceCreateRequest>({
  name: '',
  type: 'MYSQL',
  host: '',
  port: 3306,
  database: '',
  username: '',
  password: '',
  description: '',
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入数据源名称' },
    { max: 50, message: '数据源名称不能超过50个字符' },
  ],
  type: [{ required: true, message: '请选择数据源类型' }],
  host: [{ required: true, message: '请输入主机地址' }],
  port: [{ required: true, message: '请输入端口号' }],
  database: [{ required: true, message: '请输入数据库名称' }],
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
}

// 表单实例
const formRef = ref()
const { validate, validateInfos } = useForm(formState, rules)

// 加载状态
const loading = ref(false)
// 测试连接状态
const testing = ref(false)

// 监听数据源变化，更新表单数据
watch(
  () => props.dataSource,
  (newVal) => {
    if (newVal) {
      Object.assign(formState, newVal)
    } else {
      Object.assign(formState, {
        name: '',
        type: 'MYSQL',
        host: '',
        port: 3306,
        database: '',
        username: '',
        password: '',
        description: '',
      })
    }
  },
  { immediate: true }
)

// 处理表单提交
const handleSubmit = async () => {
  try {
    await validate()
    loading.value = true

    if (props.dataSource) {
      // 更新数据源
      const updateData = {
        ...formState,
        id: props.dataSource.id,
      }
      await dataSourceStore.updateDataSource(props.dataSource.id, updateData)
      message.success('更新成功')
    } else {
      // 创建数据源
      await dataSourceStore.createDataSource(formState)
      message.success('创建成功')
    }

    emit('success')
    emit('update:visible', false)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理测试连接
const handleTest = async () => {
  try {
    await validate()
    testing.value = true
    await dataSourceStore.testConnection(formState)
    message.success('连接成功')
  } catch (error) {
    console.error('测试连接失败:', error)
  } finally {
    testing.value = false
  }
}

// 处理取消
const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-input-number) {
  width: 100%;
}
</style> 