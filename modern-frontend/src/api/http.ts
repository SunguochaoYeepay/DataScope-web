import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// API配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api',
  timeout: 15000, // 延长超时时间到15秒
  auth: {
    username: 'admin',
    password: 'admin123'
  }
}

// 创建axios实例
const http = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json'
  },
  auth: API_CONFIG.auth
})

// 日志函数
const logRequest = (config: InternalAxiosRequestConfig) => {
  console.log('发送请求:', config.method?.toUpperCase(), config.url, config.data || config.params)
  return config
}

const logResponse = (response: AxiosResponse) => {
  console.log('接收响应:', response.status, response.config.url, response.data)
  return response
}

const logError = (error: any) => {
  console.error('请求错误:', 
    error.config?.method?.toUpperCase(), 
    error.config?.url, 
    error.response?.status || error.message,
    error.response?.data || error
  )
  return Promise.reject(error)
}

// 确保API路径正确
function ensureCorrectPath(path: string): string {
  // 记录原始路径
  const originalPath = path;
  
  // 移除开头的斜杠，避免重复
  let normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // 检查是否已经包含api前缀
  const hasApiPrefix = normalizedPath.startsWith('api/');
  
  // 检查是否已经包含v1前缀
  const hasV1Prefix = normalizedPath.startsWith('v1/') || normalizedPath.startsWith('api/v1/');
  
  // 构建正确的路径
  let correctPath = normalizedPath;
  
  // 如果没有v1前缀，添加v1前缀
  if (!hasV1Prefix) {
    if (hasApiPrefix) {
      correctPath = `api/v1/${normalizedPath.substring(4)}`;
    } else {
      correctPath = `v1/${normalizedPath}`;
    }
  }
  
  // 确保以/开头
  correctPath = `/${correctPath}`;
  
  // 如果路径发生了变化，记录日志
  if (correctPath !== originalPath) {
    console.log(`API路径已标准化: ${originalPath} -> ${correctPath}`);
  }
  
  return correctPath;
}

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 记录原始URL
    const originalUrl = config.url;
    
    // 处理URL
    if (config.url) {
      config.url = ensureCorrectPath(config.url);
    }
    
    // 打印请求详情
    console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`, {
      原始URL: originalUrl,
      处理后URL: config.url,
      baseURL: config.baseURL,
      完整URL: `${config.baseURL}${config.url}`,
      数据: config.data,
      参数: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 打印响应信息
    console.log(`接收响应: ${response.status} ${response.config.url}`, {
      数据: response.data,
      headers: response.headers
    });
    
    // 检查响应格式
    if (response.data && typeof response.data === 'object') {
      if ('code' in response.data && 'data' in response.data) {
        // 标准API响应格式
        const apiResponse = response.data;
        
        if (apiResponse.code !== 200) {
          console.warn(`API响应状态码异常: ${apiResponse.code}`, apiResponse.message);
        }
      }
    }
    
    // 直接返回响应数据
    return response.data;
  },
  (error) => {
    // 详细记录错误
    console.error('响应错误:', {
      消息: error.message,
      URL: error.config?.url,
      方法: error.config?.method?.toUpperCase(),
      状态码: error.response?.status,
      响应数据: error.response?.data
    });
    
    // 处理特定错误
    if (error.response) {
      switch (error.response.status) {
        case 404:
          console.error('API不存在:', error.config.url);
          break;
        case 401:
          console.error('认证失败，请检查认证信息');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
      }
    } else if (error.request) {
      console.error('没有收到响应，API可能未实现或服务不可用');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// HTTP方法封装
export const get = <T>(url: string, params?: any) => {
  return http.get<any, T>(url, { params });
};

export const post = <T>(url: string, data?: any) => {
  return http.post<any, T>(url, data);
};

export const put = <T>(url: string, data?: any) => {
  return http.put<any, T>(url, data);
};

export const del = <T>(url: string) => {
  return http.delete<any, T>(url);
};

export default http;