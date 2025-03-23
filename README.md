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

- 遵循 RESTful 设计风格
- 统一的响应格式
- 标准的错误处理
- 详细的接口文档

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