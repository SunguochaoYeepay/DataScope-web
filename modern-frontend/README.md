# DataScope Web - Modern Frontend

本项目是DataScope的现代前端实现，基于Vue 3 + TypeScript + Vite。

## 功能特性

- 数据源管理：支持MySQL和PostgreSQL数据源的添加、编辑、删除和测试连接
- 元数据管理：支持查看和刷新数据表元数据，包括表结构和索引信息
- 数据预览：支持预览数据表的内容，支持分页和条件筛选
- 查询管理：支持SQL查询的编写、保存和执行，支持参数化查询
- 可视化管理：支持基于查询结果创建多种类型的可视化图表，包括柱状图、折线图、饼图和散点图
- 低代码平台：支持非开发人员通过图形化界面快速创建数据查询界面与数据展示
  - 查询设计器：无需编码创建数据查询界面
  - 表单设计器：(即将推出) 快速创建数据录入表单
  - 仪表盘设计器：(即将推出) 创建多图表交互式仪表盘

## API接口

前端与后端通过RESTful API进行交互，主要包括以下模块：

- 数据源API (`/api/datasource.ts`): 管理数据源的增删改查和连接测试
- 元数据API (`/api/metadata.ts`): 获取和刷新数据表的元数据信息
- 数据预览API (`/api/preview.ts`): 预览数据表内容
- 查询API (`/api/query.ts`): 管理SQL查询的创建、执行和结果获取
- 可视化API (`/api/visualization.ts`): 管理可视化图表的创建和数据获取

## 开发调试

### 环境配置

本项目使用Vite作为构建工具，并使用环境变量文件管理不同环境的配置：

- `.env`: 通用配置
- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

主要配置项：

- `VITE_API_BASE_URL`: API请求的基础路径，默认为 `/api`
- `VITE_AUTO_LOGIN`: 是否自动登录，开发环境下可设为 `true`
- `VITE_USE_MOCK`: 是否使用模拟数据

### 后端API访问

默认情况下，开发服务器会将 `/api` 请求代理到 `http://localhost:8082`。可以在 `vite.config.ts` 中修改代理配置。

### 临时访问凭据

为方便开发调试，API请求中已临时配置了默认的HTTP Basic认证头：

```
Authorization: Basic YWRtaW46YWRtaW4xMjM=
```

该认证头等同于用户名 `admin` 和密码 `admin123` 的Base64编码。

认证头配置在 `src/api/http.ts` 文件中。在生产环境中需要移除此默认配置，改为正常的登录认证流程。

### 安装依赖

```bash
npm install
```

### 开发环境启动

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 项目结构

- `/src/api`: API接口定义
- `/src/components`: 通用组件
  - `/src/components/lowcode`: 低代码相关组件
  - `/src/components/visualization`: 可视化相关组件
- `/src/views`: 页面组件
  - `/src/views/lowcode`: 低代码平台页面
- `/src/router`: 路由配置
- `/src/store`: 状态管理
- `/src/utils`: 工具函数
- `/src/assets`: 静态资源
- `/src/types`: TypeScript类型定义

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## 数据源API集成

### API认证与调试

前端应用通过代理连接到后端API服务，当前配置如下：

- 开发环境API地址：http://localhost:8082/api
- 代理配置：所有`/api`请求会被转发到后端服务
- 认证方式：Basic Authentication
- 默认账号：`admin` / `admin123`

### 数据源连接测试功能

数据源支持两种连接测试方式：

1. 测试已保存的数据源连接: 
   - 接口：`POST /api/v1/datasources/{id}/test`
   - 请求体：空对象 `{}`
   - 需要数据源ID

2. 测试尚未保存的数据源配置:
   - 接口：`POST /api/v1/datasources?action=test-connection`
   - 需要提供完整的数据源配置，**必须包含name字段**
   - 示例请求体：
     ```json
     {
       "name": "测试连接",
       "type": "MYSQL",
       "host": "localhost",
       "port": 3306,
       "databaseName": "test",
       "username": "root",
       "password": "password"
     }
     ```

> **注意**：所有API请求必须包含API前缀`/api`，在前端代码中，路径格式应为`/api/v1/xxx`。例如，使用`/api/v1/datasources`，实际请求会发送到`http://localhost:8082/api/v1/datasources`。

### 调试数据源问题

前端集成了增强的日志记录功能，方便调试数据源连接问题：

- 控制台会记录所有API请求和响应详情
- 数据源表单提交和测试操作会输出详细表单数据
- 错误信息会包含服务器响应的详细错误说明

如果遇到数据源连接问题，请检查：
1. 网络连接和代理配置
2. 后端服务是否正常运行（端口8082）
3. 认证凭据是否正确（admin/admin123）
4. 数据源配置是否准确（类型、主机、端口等）
5. 请求路径是否包含正确的前缀（/api/v1/...）

### API路径配置最佳实践

在使用API时，请注意以下几点避免常见问题：

1. **避免重复的API前缀**：
   - 错误示例: `/api/api/v1/datasources` (双重前缀)
   - 正确示例: `/api/v1/datasources`

2. **正确使用API路径格式**：
   - 所有API请求应使用 `/api/v1/xxx` 格式
   - HTTP客户端配置了正确的基础路径，最终请求将发送到后端API

3. **路径自动修正**：
   - 系统会自动检测并修复 `/api/api/` 这样的双重前缀
   - 控制台会记录路径修正日志，帮助您发现和修复问题

如果您遇到404错误，请检查控制台日志，寻找可能存在的路径问题。

## 项目说明
DataScope现代前端项目，基于Vue 3、TypeScript和Element Plus构建，提供数据源管理、查询配置、可视化和仪表盘等功能。

## 接口实现状态

当前系统API接口实现状态：

| 模块 | 接口状态 | 备注 |
| --- | --- | --- |
| 数据源管理 | ✅ 已实现 | 支持创建、编辑、删除和测试连接 |
| 元数据管理 | ⚠️ 模拟数据 | 后端API未实现，使用前端模拟数据 |
| 查询管理 | ⚠️ 模拟数据 | 后端未提供`/api/v1/queries`接口，使用前端模拟数据 |
| 可视化管理 | ⚠️ 模拟数据 | 后端未提供`/api/v1/visualizations`接口，使用前端模拟数据 |
| 低代码平台 | ✅ 前端已实现 | 包含查询设计器等低代码工具，使用模拟数据 |
| 仪表盘管理 | ❌ 未实现 | 后端未提供`/api/v1/dashboards`接口 |

## API路径说明

所有API请求应使用以下格式的路径：

```
/api/v1/{资源名称}
```

例如：
- 数据源列表：`GET /api/v1/datasources`
- 数据源详情：`GET /api/v1/datasources/{id}`
- 测试数据源连接：`POST /api/v1/datasources/{id}/test`
- 测试未保存的数据源连接：`POST /api/v1/datasources?action=test-connection`

请确保所有API请求包含`/api`前缀。

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm run test
```

## 技术栈
- Vue 3
- TypeScript
- Vite
- Element Plus
- Axios
- ECharts

## API常见问题排查

如果遇到API请求问题，请检查以下几点：

1. 确认API前缀是否正确，所有请求应使用`/api/v1/xxx`格式
2. 检查后端服务是否正常运行（默认地址为`http://localhost:8082`）
3. 验证认证信息是否正确（开发环境使用Basic认证：`admin:admin123`）
4. 检查请求方法是否正确（GET、POST、PUT、DELETE）
5. 对于未实现的API（查询、可视化、仪表盘），需等待后端开发完成

## 未实现功能的临时处理

对于后端尚未实现的功能模块，前端已添加警告提示，并已实现模拟数据结构和API接口，待后端实现后可直接对接。
