# DataScope UI

DataScope 是一个现代化的数据查询和可视化平台的前端项目。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Ant Design Vue
- Axios
- Vue Router
- Pinia

## 项目结构

```
src/
├── api/          # API 接口定义
├── assets/       # 静态资源
├── components/   # 通用组件
├── composables/  # 组合式函数
├── constants/    # 常量定义
├── layouts/      # 布局组件
├── plugins/      # 插件配置
├── router/       # 路由配置
├── services/     # 业务服务
├── stores/       # 状态管理
├── styles/       # 全局样式
├── types/        # 类型定义
├── utils/        # 工具函数
└── views/        # 页面组件
```

## 开发规范

### API 规范

#### 请求格式

所有 API 请求需遵循以下规范：

1. 基础路由
- 所有 API 路由以 `/api/v1` 开头
- 避免重复的路由前缀

2. 查询参数
- 分页参数使用 `current` 和 `size`
- 排序参数使用 `order: 'asc' | 'desc'`
- 过滤参数使用 `filters` 对象

3. 响应格式
```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PaginationResponse<T> extends ApiResponse<{
  records: T[];
  total: number;
  current: number;
  size: number;
}> {}
```

4. 错误处理
- 统一使用 `ApiError` 类处理错误
- 错误码和消息定义在 `errors.ts` 中

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写单元测试

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

## 文档

- [API 设计规范](./docs/sys-rule/api-standard.md)
- [开发规范](./docs/sys-rule/dev-standard.md)
- [部署指南](./docs/sys-rule/deploy-guide.md)

## 贡献指南

1. Fork 本仓库
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

[MIT](./LICENSE)