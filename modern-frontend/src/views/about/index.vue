<template>
  <div class="about">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="about-card">
          <template #header>
            <div class="card-header">
              <h2>关于项目</h2>
            </div>
          </template>
          <div class="card-content">
            <p class="description">
              这是一个基于 Vue 3 + TypeScript + Vite 构建的现代化前端工程，采用了当前最流行的技术栈和最佳实践。
            </p>
            <el-divider>
              <el-icon><Star /></el-icon>
            </el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <h3>
                  <el-icon><Tools /></el-icon>
                  技术栈
                </h3>
                <ul class="feature-list">
                  <li>Vue 3 Composition API</li>
                  <li>TypeScript</li>
                  <li>Vite</li>
                  <li>Vue Router</li>
                  <li>Pinia</li>
                  <li>Element Plus</li>
                </ul>
              </el-col>
              <el-col :span="12">
                <h3>
                  <el-icon><Aim /></el-icon>
                  项目特点
                </h3>
                <ul class="feature-list">
                  <li>TypeScript 类型支持</li>
                  <li>组件自动导入</li>
                  <li>状态管理优化</li>
                  <li>路由配置优化</li>
                  <li>开发体验提升</li>
                  <li>构建性能优化</li>
                </ul>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Star, Tools, Aim } from '@element-plus/icons-vue'
</script>

<style scoped>
.about {
  padding: 20px;
}

.about-card {
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

.description {
  font-size: 1.1em;
  line-height: 1.6;
  color: #606266;
  text-align: center;
  margin: 20px 0;
}

h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
  margin-bottom: 15px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 8px 0;
  color: #606266;
  position: relative;
  padding-left: 20px;
}

.feature-list li::before {
  content: '•';
  color: #409EFF;
  position: absolute;
  left: 0;
  top: 8px;
}
</style>