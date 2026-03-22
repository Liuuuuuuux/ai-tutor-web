# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI Tutor Web - 基于费曼学习法的智能辅导学习平台前端项目。

## 常用命令

```bash
# 开发
pnpm dev          # 启动开发服务器 (端口 3000)

# 构建
pnpm build        # TypeScript 类型检查 + Vite 构建

# 代码质量
pnpm lint         # ESLint 检查
pnpm lint:fix     # ESLint 自动修复
pnpm format       # Prettier 格式化
```

## 技术栈

- **React 19** + **TypeScript 5.9**
- **Vite 8** - 构建工具
- **Ant Design 5** - UI 组件库（中文 locale）
- **Tailwind CSS** - 样式（preflight 已禁用以兼容 Ant Design）
- **Zustand** - 状态管理
- **TanStack Query v5** - 数据请求缓存
- **React Router DOM v7** - 路由
- **Axios** - HTTP 客户端
- **SSE** - 流式聊天（用于 AI 对话）

## 架构

### 目录结构

```
src/
├── api/           # API 请求模块（每个模块导出独立函数）
├── components/    # 共享组件（ChatBox, KnowledgeTree, Layout）
├── features/      # 功能模块/页面（按功能划分）
├── hooks/         # 自定义 hooks（useSSE, useLearningProgress）
├── stores/        # Zustand stores（userStore, learningStore）
└── types/         # TypeScript 类型定义
```

### API 层

- `src/api/client.ts` - Axios 实例配置，包含请求/响应拦截器
- 统一响应格式: `{ code: number, data: T, message: string }`
- 请求自动添加 `X-User-Id` 头（从 localStorage 读取）
- 后端 API 代理: `/api` -> `http://localhost:8080`

### 状态管理

- `useUserStore` - 用户状态（userId 存储在 localStorage）
- `useLearningStore` - 学习会话状态（当前会话、消息、流式状态）

### 流式聊天

使用 SSE 实现与 AI 的流式对话：

- `useSSE` hook 处理 SSE 连接
- 端点: `POST /api/learning-sessions/{sessionId}/chat`

### 路由结构

- `/login` - 登录页（PublicRoute 守卫）
- 其他路由需要登录（PrivateRoute 守卫）
- 主要功能: 首页、学习目标、学习资料、学习统计、试卷生成

## 开发配置

- 路径别名: `@` -> `./src`
- 开发服务器端口: 3000
- Git hooks: Husky + lint-staged（提交时自动 lint + format）

## 后端代码

后端代码位置：E:\code\ai-tutor
