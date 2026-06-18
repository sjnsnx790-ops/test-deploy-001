# Vercel 部署指南

## 快速开始

### 1. 准备代码

```bash
# 克隆或下载代码后
npm install --legacy-peer-deps
```

### 2. 连接 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link
```

### 3. 配置环境变量

在 Vercel Dashboard → Project Settings → Environment Variables 中添加：

| 变量名 | 值 | 必需 |
|--------|-----|------|
| `DATABASE_URL` | MySQL 连接字符串 | 是 |

MySQL 格式：`mysql://用户名:密码@主机:端口/数据库名`

> 免费 MySQL 推荐：[PlanetScale](https://planetscale.com/)、[TiDB Cloud](https://tidbcloud.com/)

### 4. 部署

```bash
vercel --prod
```

或连接 GitHub 仓库后自动部署。

## 项目结构说明

```
/
├── api/              # Vercel Serverless Functions
│   ├── index.ts      # API 入口（Vercel 自动识别）
│   ├── boot.ts       # Hono 应用
│   ├── routers/      # tRPC 路由
│   ├── services/     # 抖音解析服务
│   └── lib/          # 工具函数
├── src/              # 前端 React 代码
├── dist/             # 前端构建输出
├── db/               # 数据库 schema
├── contracts/        # 共享类型
└── vercel.json       # Vercel 配置
```

## 常见问题

### npm install 失败

```bash
npm install --legacy-peer-deps
```

### 数据库连接失败

确保 `DATABASE_URL` 格式正确：
```
mysql://user:password@host:3306/database
```

### API 返回 404

检查 `vercel.json` 中的 `rewrites` 配置是否正确。API 路由应重写到 `/api/index`。
