<script setup lang="ts">
// App.vue作为根组件，只需要渲染路由视图
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}

/* 布局相关样式 */
.app-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.el-header {
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

.nav-menu {
  padding: 0 20px;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
  flex: 1;
  overflow: auto;
}
</style>
