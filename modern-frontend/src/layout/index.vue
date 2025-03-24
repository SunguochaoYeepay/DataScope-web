<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container">
      <div class="logo-container">
        <h1>DataScope</h1>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        background-color="var(--el-bg-color-page)"
        text-color="var(--el-text-color-primary)"
        active-text-color="var(--el-color-primary)"
        :hover-background-color="'var(--el-color-primary-light-9)'"
        router
      >
        <el-menu-item index="/datasource">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据源管理</span>
        </el-menu-item>
        <el-menu-item index="/metadata">
          <el-icon><Connection /></el-icon>
          <span>元数据管理</span>
        </el-menu-item>
        <el-menu-item index="/query">
          <el-icon><Search /></el-icon>
          <span>查询管理</span>
        </el-menu-item>
        <el-menu-item index="/lowcode">
          <el-icon><MagicStick /></el-icon>
          <span>低代码平台</span>
        </el-menu-item>
        <el-menu-item index="/visualization">
          <el-icon><PieChart /></el-icon>
          <span>可视化管理</span>
        </el-menu-item>
        <el-menu-item index="/export">
          <el-icon><Download /></el-icon>
          <span>数据导出</span>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <small>v{{ version }}</small>
      </div>
    </div>
    
    <!-- 主区域 -->
    <div class="main-container">
      <!-- 头部区域 -->
      <div class="navbar">
        <div class="breadcrumb">
          <!-- 路径导航 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ getPageTitle() }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="right-menu">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-avatar">
              <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="user-name">{{ userName }}</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { DataAnalysis, Search, PieChart, CaretBottom, Connection, MagicStick, Download } from '@element-plus/icons-vue'
import { clearAuthCredentials } from '../api/login'

// 系统版本号
const version = '0.2.0'

const router = useRouter()
const route = useRoute()

// 获取用户名
const userName = computed(() => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.name || user.username || 'Admin'
    }
    return 'Admin'
  } catch (error) {
    return 'Admin'
  }
})

// 获取页面标题
const getPageTitle = () => {
  const { meta } = route
  if (meta && meta.title) {
    return meta.title
  }
  
  // 根据路径返回标题
  const pathMap: Record<string, string> = {
    '/datasource': '数据源管理',
    '/metadata': '元数据管理',
    '/query': '查询管理',
    '/lowcode': '低代码平台',
    '/visualization': '可视化管理',
    '/export': '数据导出'
  }
  
  return pathMap[route.path] || 'DataScope'
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 清除token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // 清除认证头
      clearAuthCredentials()
      
      // 重定向到登录页
      router.push('/login')
    })
  }
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar-container {
  width: 210px;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  height: 100%;
  transition: width 0.28s;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.logo-container h1 {
  font-size: 20px;
  margin: 0;
  font-weight: 600;
  color: var(--el-color-primary);
}

.el-menu-vertical {
  border-right: none;
}

/* 覆盖菜单项悬停样式 */
:deep(.el-menu-item):hover {
  background-color: var(--el-color-primary-light-9) !important;
}

:deep(.el-menu-item).is-active {
  background-color: var(--el-color-primary-light-9);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color-page);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.right-menu {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin-left: 10px;
  margin-right: 5px;
  color: var(--el-text-color-regular);
}

.app-main {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background-color: var(--el-bg-color);
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px 0;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-lighter);
}
</style> 