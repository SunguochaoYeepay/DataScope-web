<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  House,
  InfoFilled,
  Menu as MenuIcon,
  Expand,
  Fold,
  DataLine,
  Search,
  Platform
} from '@element-plus/icons-vue'

const router = useRouter()
const sidebarCollapsed = ref(false)
const activeMenu = ref('/')

const handleSelect = (key: string) => {
  router.push(key)
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const menuItems = [
  {
    index: '/datasource',
    title: '数据源管理',
    icon: DataLine
  },
  {
    index: '/query',
    title: '查询配置',
    icon: Search
  },
  {
    index: '/visualization',
    title: '可视化展示',
    icon: Platform
  }
]
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarCollapsed ? '64px' : '200px'" class="sidebar">
      <div class="logo-container">
        <img src="/vite.svg" alt="logo" class="logo" />
        <span v-show="!sidebarCollapsed" class="title">DataScope</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="sidebarCollapsed"
        @select="handleSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="toggle-sidebar" @click="toggleSidebar">
            <component :is="sidebarCollapsed ? Expand : Fold" />
          </el-icon>
        </div>
        <div class="header-right">
          <el-menu
            mode="horizontal"
            :default-active="activeMenu"
            @select="handleSelect"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              首页
            </el-menu-item>
            <el-menu-item index="/about">
              <el-icon><InfoFilled /></el-icon>
              关于
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  min-height: 100vh;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b2f3a;
}

.logo {
  width: 24px;
  height: 24px;
}

.title {
  color: #fff;
  font-size: 18px;
  margin-left: 12px;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-sidebar {
  font-size: 20px;
  cursor: pointer;
  padding: 0 15px;
}

.header-right {
  height: 100%;
}

.header-right .el-menu {
  height: 100%;
  border: none;
}

.main-content {
  background-color: #f0f2f5;
  padding: 24px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}
</style>