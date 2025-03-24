import { get, post, put, del } from './http';

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
}

export interface Dashboard {
  id: number;
  name: string;
  description: string;
  layout: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  public: boolean;
}

export interface DashboardCreateRequest {
  name: string;
  description: string;
  layout: string;
  public?: boolean;
}

export interface DashboardUpdateRequest {
  name?: string;
  description?: string;
  layout?: string;
  public?: boolean;
}

/**
 * 获取仪表盘列表
 * 注意：后端API尚未实现，此接口目前返回404错误
 */
export async function getDashboardList() {
  try {
    return await get<Dashboard[]>('/v1/dashboards');
  } catch (error) {
    console.error('仪表盘API未实现:', error);
    return Promise.reject({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      path: "/api/v1/dashboards"
    } as ApiErrorResponse);
  }
}

/**
 * 获取仪表盘详情
 * 注意：后端API尚未实现，此接口目前返回404错误
 */
export async function getDashboardDetail(id: string) {
  try {
    return await get<Dashboard>(`/v1/dashboards/${id}`);
  } catch (error) {
    console.error('仪表盘API未实现:', error);
    return Promise.reject({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      path: `/api/v1/dashboards/${id}`
    } as ApiErrorResponse);
  }
}

/**
 * 创建仪表盘
 * 注意：后端API尚未实现，此接口目前返回404错误
 */
export async function createDashboard(dashboard: DashboardCreateRequest) {
  try {
    return await post<Dashboard>('/v1/dashboards', dashboard);
  } catch (error) {
    console.error('仪表盘API未实现:', error);
    return Promise.reject({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      path: "/api/v1/dashboards"
    } as ApiErrorResponse);
  }
}

/**
 * 更新仪表盘
 * 注意：后端API尚未实现，此接口目前返回404错误
 */
export async function updateDashboard(id: string, dashboard: DashboardUpdateRequest) {
  try {
    return await put<Dashboard>(`/v1/dashboards/${id}`, dashboard);
  } catch (error) {
    console.error('仪表盘API未实现:', error);
    return Promise.reject({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      path: `/api/v1/dashboards/${id}`
    } as ApiErrorResponse);
  }
}

/**
 * 删除仪表盘
 * 注意：后端API尚未实现，此接口目前返回404错误
 */
export async function deleteDashboard(id: string) {
  try {
    return await del<void>(`/v1/dashboards/${id}`);
  } catch (error) {
    console.error('仪表盘API未实现:', error);
    return Promise.reject({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      path: `/api/v1/dashboards/${id}`
    } as ApiErrorResponse);
  }
}