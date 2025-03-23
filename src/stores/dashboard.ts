import { defineStore } from 'pinia';
import type { Dashboard, DashboardState, DashboardFilter } from '@/types/dashboard';
import {
  getDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  toggleFavorite,
  shareToUsers,
} from '@/api/dashboard';
import { message } from 'ant-design-vue';

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    dashboards: [],
    loading: false,
    error: null,
  }),

  getters: {
    filteredDashboards(): (filter: DashboardFilter) => Dashboard[] {
      return (filter: DashboardFilter) => {
        let result = [...this.dashboards];

        // 按类型筛选
        if (filter.type !== 'all') {
          switch (filter.type) {
            case 'created':
              result = result.filter(d => d.creator.id === '1'); // TODO: 替换为实际用户ID
              break;
            case 'favorite':
              result = result.filter(d => d.favorite);
              break;
            case 'shared':
              // TODO: 实现共享筛选逻辑
              break;
          }
        }

        // 搜索
        if (filter.search) {
          const search = filter.search.toLowerCase();
          result = result.filter(
            d =>
              d.name.toLowerCase().includes(search) ||
              d.description?.toLowerCase().includes(search)
          );
        }

        // 排序
        if (filter.sortBy) {
          result.sort((a, b) => {
            switch (filter.sortBy) {
              case 'updated':
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
              case 'created':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              case 'name':
                return a.name.localeCompare(b.name);
              case 'views':
                return b.views - a.views;
              default:
                return 0;
            }
          });
        }

        return result;
      };
    },
  },

  actions: {
    async fetchDashboards() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getDashboards({});
        this.dashboards = response.data.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取仪表盘列表失败';
        message.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDashboard(id: string) {
      try {
        const response = await getDashboard(id);
        const index = this.dashboards.findIndex(d => d.id === id);
        if (index > -1) {
          this.dashboards[index] = response.data;
        } else {
          this.dashboards.push(response.data);
        }
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '获取仪表盘详情失败';
        message.error(errorMessage);
        throw error;
      }
    },

    async createDashboard(data: Partial<Dashboard>) {
      try {
        const response = await createDashboard(data);
        this.dashboards.unshift(response.data);
        message.success('创建成功');
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '创建仪表盘失败';
        message.error(errorMessage);
        throw error;
      }
    },

    async updateDashboard(id: string, data: Partial<Dashboard>) {
      try {
        const response = await updateDashboard(id, data);
        const index = this.dashboards.findIndex(d => d.id === id);
        if (index > -1) {
          this.dashboards[index] = response.data;
        }
        message.success('更新成功');
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '更新仪表盘失败';
        message.error(errorMessage);
        throw error;
      }
    },

    async deleteDashboard(id: string) {
      try {
        await deleteDashboard(id);
        const index = this.dashboards.findIndex(d => d.id === id);
        if (index > -1) {
          this.dashboards.splice(index, 1);
        }
        message.success('删除成功');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '删除仪表盘失败';
        message.error(errorMessage);
        throw error;
      }
    },

    async toggleFavorite(id: string) {
      try {
        await toggleFavorite(id);
        const dashboard = this.dashboards.find(d => d.id === id);
        if (dashboard) {
          dashboard.favorite = !dashboard.favorite;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '操作失败';
        message.error(errorMessage);
        throw error;
      }
    },

    async shareToUsers(id: string, userIds: string[]) {
      try {
        await shareToUsers(id, userIds);
        message.success('分享成功');
      } catch (error) {
        message.error('分享失败');
        throw error;
      }
    },
  },
});