import { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import DatasourcePage from '@/views/datasource/DatasourcePage.vue';
import QueryList from '@/views/query/QueryList.vue';
import QueryForm from '@/views/query/QueryForm.vue';
import QueryExecution from '@/views/query/QueryExecution.vue';
import QueryHistory from '@/views/query/QueryHistory.vue';
import DashboardList from '@/views/dashboard/DashboardList.vue';
import DashboardDetail from '@/views/dashboard/DashboardDetail.vue';
import DashboardEditor from '@/views/dashboard/DashboardEditor.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: {
          title: '首页',
          icon: 'home',
        },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        meta: {
          title: '仪表盘',
          icon: 'dashboard',
        },
        children: [
          {
            path: '',
            name: 'dashboard-list',
            component: DashboardList,
            meta: {
              title: '仪表盘列表',
              parent: 'dashboard',
            },
          },
          {
            path: ':id',
            name: 'dashboard-detail',
            component: DashboardDetail,
            meta: {
              title: '仪表盘详情',
              parent: 'dashboard',
              hidden: true,
            },
          },
          {
            path: ':id/edit',
            name: 'dashboard-editor',
            component: DashboardEditor,
            meta: {
              title: '编辑仪表盘',
              parent: 'dashboard',
              hidden: true,
            },
          },
        ],
      },
      {
        path: 'datasource',
        name: 'datasource',
        component: DatasourcePage,
        meta: {
          title: '数据源管理',
          icon: 'database',
        },
      },
      {
        path: 'query',
        name: 'query',
        meta: {
          title: '查询管理',
          icon: 'code',
        },
        children: [
          {
            path: '',
            name: 'query-list',
            component: QueryList,
            meta: {
              title: '查询列表',
              parent: 'query',
            },
          },
          {
            path: 'create',
            name: 'query-create',
            component: QueryForm,
            meta: {
              title: '新建查询',
              parent: 'query',
              hidden: true,
            },
          },
          {
            path: ':id/edit',
            name: 'query-edit',
            component: QueryForm,
            meta: {
              title: '编辑查询',
              parent: 'query',
              hidden: true,
            },
          },
          {
            path: ':id/execute',
            name: 'query-execute',
            component: QueryExecution,
            meta: {
              title: '执行查询',
              parent: 'query',
              hidden: true,
            },
          },
          {
            path: 'history',
            name: 'query-history',
            component: QueryHistory,
            meta: {
              title: '执行历史',
              parent: 'query',
            },
            // 支持查询ID参数
            beforeEnter: (to, from, next) => {
              if (to.query.queryId) {
                to.meta.title = '查询执行历史';
              }
              next();
            },
          },
        ],
      },
    ],
  },
];

export default routes;