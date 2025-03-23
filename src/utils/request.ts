import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { message } from 'ant-design-vue';
import type { RequestConfig } from '../types/request';
import type { ApiResponse, DownloadResponse, QueryParams } from '../types/api';
import { ApiError, ErrorCode } from '../types/error';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeInput } from '../utils/security';

/**
 * 默认请求配置
 * @description 定义了基础URL、超时时间和默认请求头
 */
const DEFAULT_CONFIG: RequestConfig = {
  baseURL: 'http://localhost:8080/api/v1',  // 基础URL已包含api/v1前缀
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * 规范化 URL，移除重复的 API 前缀
 */
function normalizeUrl(url: string): string {
  // 移除开头的斜杠
  url = url.replace(/^\/+/, '');
  // 移除重复的 v1 前缀
  url = url.replace(/^v1\//, '');
  return url;
}

/**
 * HTTP请求工具类
 * @description 封装了基于 axios 的 HTTP 请求方法，提供了以下功能：
 * 1. 统一的请求/响应拦截
 * 2. 统一的错误处理
 * 3. 支持请求重试
 * 4. 支持取消请求
 * 5. 支持文件下载
 */
class Request {
  private instance: AxiosInstance;

  constructor(config: RequestConfig = {}) {
    this.instance = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    });
    this.setupInterceptors();
  }

  /**
   * 设置请求/响应拦截器
   * @private
   */
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证信息
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // 添加请求ID用于链路追踪
        const requestId = uuidv4();
        config.headers['X-Request-ID'] = requestId;

        // 防止XSS攻击：对请求参数进行转义
        if (config.params) {
          config.params = sanitizeInput(config.params);
        }
        if (config.data) {
          config.data = sanitizeInput(config.data);
        }

        // 移除重复的 v1 前缀
        if (config.url?.includes('/v1/')) {
          config.url = config.url.replace('/v1/', '/');
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 获取后端返回的响应头
        const requestId = response.headers['x-request-id'];
        const timestamp = response.headers['x-response-time'] || new Date().toISOString();

        // 处理特定状态码
        switch (response.status) {
          case 201: // Created - POST 创建资源成功
            if (response.data && typeof response.data === 'object') {
              // 如果后端已经返回了标准格式的响应
              if ('code' in response.data && 'message' in response.data && 'data' in response.data) {
                return {
                  ...response,
                  data: {
                    ...response.data,
                    code: ErrorCode.CREATED,
                    requestId: response.data.requestId || requestId,
                    timestamp: response.data.timestamp || timestamp
                  }
                };
              }
            }
            // 如果后端返回的不是标准格式，则包装成标准格式
            return {
              ...response,
              data: {
                code: ErrorCode.CREATED,
                message: 'Created successfully',
                data: response.data,
                requestId,
                timestamp
              }
            };

          case 204: // No Content - DELETE 删除资源成功
            return {
              ...response,
              data: {
                code: ErrorCode.NO_CONTENT,
                message: 'Deleted successfully',
                data: null,
                requestId,
                timestamp
              }
            };

          case 200: // OK - GET 查询成功 / PUT、PATCH 更新成功
            if (response.data && typeof response.data === 'object') {
              // 如果后端已经返回了标准格式的响应
              if ('code' in response.data && 'message' in response.data && 'data' in response.data) {
                return {
                  ...response,
                  data: {
                    ...response.data,
                    requestId: response.data.requestId || requestId,
                    timestamp: response.data.timestamp || timestamp
                  }
                };
              }
            }
            // 如果后端返回的不是标准格式，则包装成标准格式
            return {
              ...response,
              data: {
                code: ErrorCode.SUCCESS,
                message: 'Success',
                data: response.data,
                requestId,
                timestamp
              }
            };

          default:
            throw new ApiError(ErrorCode.BAD_REQUEST, `Unexpected status code: ${response.status}`);
        }
      },
      (error) => {
        // 获取请求ID和时间戳
        const requestId = error.response?.headers?.['x-request-id'] || 
                         error.config?.headers?.['x-request-id'];
        const timestamp = error.response?.headers?.['x-response-time'] || 
                         new Date().toISOString();

        if (!error.response) {
          return Promise.reject({
            code: ErrorCode.NETWORK_ERROR,
            message: '无法连接到服务器，请确认后端服务是否已启动',
            data: null,
            requestId,
            timestamp
          } as ApiResponse<null>);
        }

        const { status, data } = error.response;

        // 如果后端返回了标准格式的错误响应，直接使用
        if (data && typeof data === 'object' && 
            'code' in data && 'message' in data) {
          return Promise.reject({
            ...data,
            requestId: data.requestId || requestId,
            timestamp: data.timestamp || timestamp
          } as ApiResponse<null>);
        }

        // 否则包装成标准格式
        const errorResponse: ApiResponse<null> = {
          code: status,
          message: data?.message || '请求失败，请稍后重试',
          data: null,
          requestId,
          timestamp
        };

        switch (status) {
          case 400:
            errorResponse.message = '请求参数错误';
            break;
          case 401:
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            errorResponse.message = '未授权或登录已过期';
            break;
          case 403:
            errorResponse.message = '没有权限访问该资源';
            break;
          case 404:
            errorResponse.message = '请求的资源不存在';
            break;
          case 500:
            errorResponse.message = '服务器内部错误';
            break;
          default:
            break;
        }

        return Promise.reject(errorResponse);
      }
    );
  }

  /**
   * 发送GET请求
   * @param url - 请求地址
   * @param params - 查询参数，符合QueryParams接口定义
   * @returns 返回Promise，resolve时返回T类型数据，reject时抛出ApiError
   * @throws {ApiError} 当响应格式不正确时抛出
   */
  public async get<T>(url: string, params?: QueryParams): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(normalizeUrl(url), { params });
    if (response.data.data === undefined) {
      throw new ApiError(ErrorCode.BAD_REQUEST, '响应数据格式错误');
    }
    return response.data.data as T;
  }

  /**
   * 发送POST请求
   * @param url - 请求地址
   * @param data - 请求体数据
   * @returns 返回Promise，resolve时返回T类型数据，reject时抛出ApiError
   * @throws {ApiError} 当响应格式不正确时抛出
   */
  public async post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(normalizeUrl(url), data);
    if (response.data.data === undefined) {
      throw new ApiError(ErrorCode.BAD_REQUEST, '响应数据格式错误');
    }
    return response.data.data as T;
  }

  /**
   * 发送PUT请求 - 全量更新
   * @param url - 请求地址
   * @param data - 请求体数据
   * @returns 返回Promise，resolve时返回T类型数据，reject时抛出ApiError
   * @throws {ApiError} 当响应格式不正确时抛出
   */
  public async put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(normalizeUrl(url), data);
    if (response.data.data === undefined) {
      throw new ApiError(ErrorCode.BAD_REQUEST, '响应数据格式错误');
    }
    return response.data.data as T;
  }

  /**
   * 发送PATCH请求 - 部分更新
   * @param url - 请求地址
   * @param data - 请求体数据
   * @returns 返回Promise，resolve时返回T类型数据，reject时抛出ApiError
   * @throws {ApiError} 当响应格式不正确时抛出
   */
  public async patch<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(normalizeUrl(url), data);
    if (response.data.data === undefined) {
      throw new ApiError(ErrorCode.BAD_REQUEST, '响应数据格式错误');
    }
    return response.data.data as T;
  }

  /**
   * 发送DELETE请求
   * @param url - 请求地址
   * @param data - 请求体数据（可选）
   * @returns 返回Promise，resolve时返回T类型数据，reject时抛出ApiError
   * @throws {ApiError} 当响应格式不正确时抛出
   */
  public async delete<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(normalizeUrl(url), { data });
    if (response.data.data === undefined && response.status !== 204) {
      throw new ApiError(ErrorCode.BAD_REQUEST, '响应数据格式错误');
    }
    return response.data.data as T;
  }

  /**
   * 文件下载
   * @param url - 下载地址
   * @param params - 查询参数
   * @returns 返回Promise，resolve时返回DownloadResponse
   */
  public async download(url: string, params?: QueryParams): Promise<DownloadResponse> {
    const response = await this.instance.get(normalizeUrl(url), {
      params,
      responseType: 'blob',
      headers: {
        Accept: 'application/octet-stream'
      }
    });
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? decodeURIComponent(contentDisposition.split('filename=')[1])
      : 'download';
    return {
      filename,
      data: new Blob([response.data]),
    };
  }
}

// 导出单例实例
export default new Request();