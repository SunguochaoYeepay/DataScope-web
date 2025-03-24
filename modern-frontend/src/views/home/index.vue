<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <h2>欢迎使用</h2>
            </div>
          </template>
          <div class="card-content">
            <el-row :gutter="20" class="feature-list">
              <el-col :span="8">
                <el-card class="feature-card" shadow="hover">
                  <template #header>
                    <div class="feature-header">
                      <el-icon><Monitor /></el-icon>
                      <span>现代化技术栈</span>
                    </div>
                  </template>
                  <div class="feature-content">
                    <p>Vue 3 + TypeScript + Vite</p>
                    <p>Element Plus UI 框架</p>
                    <p>Pinia 状态管理</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" shadow="hover">
                  <template #header>
                    <div class="feature-header">
                      <el-icon><Setting /></el-icon>
                      <span>完整工程化</span>
                    </div>
                  </template>
                  <div class="feature-content">
                    <p>ESLint + Prettier 代码规范</p>
                    <p>Vitest 单元测试</p>
                    <p>自动化构建部署</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" shadow="hover">
                  <template #header>
                    <div class="feature-header">
                      <el-icon><Connection /></el-icon>
                      <span>最佳实践</span>
                    </div>
                  </template>
                  <div class="feature-content">
                    <p>组件化开发</p>
                    <p>响应式设计</p>
                    <p>性能优化</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Monitor, Setting, Connection } from '@element-plus/icons-vue'
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: #409EFF;
}

.feature-list {
  margin-top: 20px;
}

.feature-card {
  height: 100%;
  transition: all 0.3s ease;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
  color: #409EFF;
}

.feature-content {
  padding: 10px 0;
}

.feature-content p {
  margin: 8px 0;
  color: #606266;
}
</style>