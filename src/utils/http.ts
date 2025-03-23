import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { message } from 'ant-design-vue';
import type { ApiResponse } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true,
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 添加请求ID
    config.headers['X-Request-ID'] = uuidv4();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const res = response.data;
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 未登录或 token 过期
          message.error('请重新登录');
          // 清除 token
          localStorage.removeItem('token');
          // 跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error(error.message);
    }
    return Promise.reject(error);
  }
);

// HTTP 工具类
export const http = {
  get<T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosInstance.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosInstance.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosInstance.put(url, data, config);
  },

  delete<T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosInstance.delete(url, config);
  },
};