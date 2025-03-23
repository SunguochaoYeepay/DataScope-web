import request from '@/utils/request';
import type { Dashboard } from '@/types/dashboard';

export interface DashboardQuery {
  type?: string;
  search?: string;
  sortBy?: string;
  current?: number;
  pageSize?: number;
}

export interface DashboardResponse {
  code: string;
  message: string;
  data: Dashboard;
}

export interface DashboardListResponse {
  code: string;
  message: string;
  data: {
    total: number;
    pageNum: number;
    pageSize: number;
    data: Dashboard[];
  };
}

// 获取仪表盘列表
export async function getDashboards(params: DashboardQuery): Promise<DashboardListResponse> {
  // 临时使用模拟数据
  return {
    code: '200',
    message: 'success',
    data: {
      total: 1,
      pageNum: 1,
      pageSize: 10,
      data: [
        {
          id: '1',
          name: '示例仪表盘',
          description: '这是一个示例仪表盘',
          favorite: false,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: {
            id: '1',
            name: 'admin',
            avatar: '',
          },
        },
      ],
    },
  };
}

// 获取仪表盘详情
export async function getDashboard(id: string): Promise<DashboardResponse> {
  return request.get(`/v1/dashboards/${id}`);
}

// 创建仪表盘
export async function createDashboard(data: Partial<Dashboard>): Promise<DashboardResponse> {
  return request.post('/v1/dashboards', data);
}

// 更新仪表盘
export async function updateDashboard(id: string, data: Partial<Dashboard>): Promise<DashboardResponse> {
  return request.put(`/v1/dashboards/${id}`, data);
}

// 删除仪表盘
export async function deleteDashboard(id: string): Promise<void> {
  return request.delete(`/v1/dashboards/${id}`);
}

// 收藏/取消收藏仪表盘
export async function toggleFavorite(id: string): Promise<void> {
  return request.post(`/v1/dashboards/${id}/favorite`);
}

// 获取分享链接
export async function getShareLink(id: string): Promise<{ link: string }> {
  return request.get(`/v1/dashboards/${id}/share`);
}

// 分享给指定用户
export async function shareToUsers(id: string, userIds: string[]): Promise<void> {
  return request.post(`/v1/dashboards/${id}/share`, { userIds });
}