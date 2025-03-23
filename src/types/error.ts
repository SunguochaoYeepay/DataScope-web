/**
 * 错误码枚举
 */
export enum ErrorCode {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NETWORK_ERROR = -1,
  TIMEOUT = -2,
  INTERNAL_ERROR = 500
}

/**
 * API错误
 */
export class ApiError extends Error {
  code: number;
  data?: any;

  constructor(code: number, message: string, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * 错误处理配置
 */
export interface ErrorHandlerConfig {
  /** 是否显示错误消息 */
  showErrorMessage?: boolean;
  /** 自定义错误处理 */
  customHandler?: (error: ApiError) => void;
  /** 忽略的错误码 */
  ignoreErrors?: number[];
}