import { createRouter, createWebHistory } from 'vue-router'
import { useDefaultCredentials } from '../api/login'
import type { Component } from 'vue'

// 引入页面组件
const Login = () => import('../views/login/index.vue')
// @ts-ignore 忽略模块找不到的错误
const Layout = () => import('../layout/index.vue')
const Datasource = () => import('../views/datasource/index.vue')
const Query = () => import('../views/query/index.vue')
const QueryEditor = () => import(/* webpackChunkName: "query-editor" */ '../views/query/editor.vue')
// 使用单独的懒加载语法（添加注释表明组件之间的隔离）
// 通过动态导入确保每个组件是完全独立的块，避免可能的依赖问题
const Visualization = () => import(/* webpackChunkName: "visualization" */ '../views/visualization/index.vue')
const Metadata = () => import(/* webpackChunkName: "metadata" */ '../views/metadata/index.vue')
// 数据导出功能路由
const Export = () => import(/* webpackChunkName: "export" */ '../views/export/index.vue')
// 低代码平台
const LowCode = () => import(/* webpackChunkName: "lowcode" */ '../views/lowcode/index.vue')
// 低代码查询设计器
const QueryDesigner = () => import(/* webpackChunkName: "query-designer" */ '../views/lowcode/QueryDesigner.vue')

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: '/datasource',
    children: [
      {
        path: 'datasource',
        name: 'Datasource',
        component: Datasource,
        meta: { title: '数据源管理', icon: 'database' }
      },
      {
        path: 'query',
        name: 'Query',
        component: Query,
        meta: { title: '查询管理', icon: 'search' }
      },
      {
        path: 'query/editor',
        name: 'QueryEditor',
        component: QueryEditor,
        meta: { title: 'SQL编辑器', icon: 'edit', activeMenu: '/query' }
      },
      {
        path: 'query/editor/:id',
        name: 'EditQuery',
        component: QueryEditor,
        meta: { title: '编辑查询', icon: 'edit', activeMenu: '/query' }
      },
      {
        path: 'lowcode',
        name: 'LowCode',
        component: LowCode,
        meta: { title: '低代码平台', icon: 'magic-stick' }
      },
      {
        path: 'lowcode/query-designer',
        name: 'QueryDesigner',
        component: QueryDesigner,
        meta: { title: '查询设计器', icon: 'connection', activeMenu: '/lowcode' }
      },
      {
        path: 'visualization',
        name: 'Visualization',
        component: Visualization,
        meta: { title: '可视化管理', icon: 'chart' }
      },
      {
        path: 'metadata',
        name: 'Metadata',
        component: Metadata,
        meta: { title: '元数据管理', icon: 'data-analysis' }
      },
      {
        path: 'export',
        name: 'Export',
        component: Export,
        meta: { title: '数据导出', icon: 'download' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 开发环境自动使用默认凭据
  if (import.meta.env.DEV) {
    useDefaultCredentials()
    
    // 检查是否直接访问登录页，如果是开发环境下直接访问登录页，则自动跳转到首页
    if (to.path === '/login' && import.meta.env.VITE_AUTO_LOGIN === 'true') {
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
      
      return next('/')
    }
  }
  
  // 检查是否有token
  const token = localStorage.getItem('token')
  
  if (to.path !== '/login' && !token) {
    // 如果没有token且不是登录页，重定向到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 如果有token且要前往登录页，重定向到首页
    next('/')
  } else {
    // 正常导航
    next()
  }
})

export default router