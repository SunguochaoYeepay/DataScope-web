<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h2>DataScope</h2>
        <p>数据洞察与分析平台</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>

        <el-divider>便捷入口</el-divider>

        <el-form-item>
          <el-button type="success" style="width: 100%" @click="handleQuickLogin">
            <el-icon class="el-icon--left"><Right /></el-icon>一键进入系统（开发模式）
          </el-button>
        </el-form-item>

        <div class="login-tips">
          <p>开发凭据: admin / admin123</p>
        </div>
      </el-form>
      <el-divider>
        <small>DataScope © {{ new Date().getFullYear() }} | v{{ version }}</small>
      </el-divider>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Lock, User, Right } from '@element-plus/icons-vue'
import { login, setAuthCredentials, useDefaultCredentials } from '../../api/login'

// 系统版本号
const version = '0.2.0'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 登录表单
const loginForm = reactive({
  username: 'admin', // 默认值，方便调试
  password: 'admin123' // 默认值，方便调试
})

// 表单校验规则
const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

// 快速登录处理
const handleQuickLogin = () => {
  // 使用默认凭据
  useDefaultCredentials()
  
  // 模拟用户信息和token
  const mockUser = {
    id: 1,
    username: 'admin',
    name: '管理员',
    role: 'admin'
  }
  
  const mockToken = 'Basic YWRtaW46YWRtaW4xMjM='
  
  // 存储token和用户信息
  localStorage.setItem('token', mockToken)
  localStorage.setItem('user', JSON.stringify(mockUser))
  
  ElMessage.success('快速登录成功')
  
  // 跳转到首页
  router.push('/')
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 设置Basic认证头
        setAuthCredentials(loginForm.username, loginForm.password)
        
        // 调用登录API
        const res = await login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        // 存储token和用户信息
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        
        ElMessage.success('登录成功')
        
        // 跳转到首页
        router.push('/')
      } catch (error: any) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败: ' + (error.message || '请检查用户名和密码'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 20px 30px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 28px;
  color: #409eff;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 16px;
  color: #909399;
}

.login-tips {
  text-align: center;
  font-size: 12px;
  color: #b4bccc;
  margin-top: 10px;
}
</style> 