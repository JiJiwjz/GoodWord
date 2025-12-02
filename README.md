# 📚 单词记忆助手 (GoodWord)

一个基于 AI 的英语单词记忆和考核应用，帮助用户高效记忆单词，轻松备考各类英语考试。

![Node.js](https://img.shields.io/badge/Node. js-20. x-green)
![React](https://img. shields.io/badge/React-19.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC)

## ✨ 功能特性

- 🤖 **AI 智能解析**：输入单词自动获取音标、释义、词性等信息
- 📖 **单词本管理**：支持搜索、筛选、分页浏览
- 🏷️ **考试分类**：自动识别 CET-4/6、雅思、托福、考研词汇
- 📝 **单词考核**：根据中文释义回忆英文单词
- 📊 **学习统计**：记录考核历史和准确率
- 🔄 **智能出题**：避免连续考核重复单词

## 🛠️ 技术栈

### 前端
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Zustand（状态管理）
- React Router 7
- Axios
- Lucide React（图标）

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite 数据库
- 通义千问 API（AI 服务）

## 📦 项目结构

```
GoodWord/
├── backend/                 # 后端服务
│   ├── prisma/             # 数据库模型
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middlewares/    # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── types/          # 类型定义
│   │   ├── utils/          # 工具函数
│   │   └── app.ts          # 应用入口
│   └── package.json
│
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API 服务
│   │   ├── store/          # 状态管理
│   │   ├── types/          # 类型定义
│   │   └── App.tsx         # 应用入口
│   └── package. json
│
├── start.sh                # 启动脚本
├── stop.sh                 # 停止脚本
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.x
- npm >= 10.x

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/GoodWord.git
cd GoodWord
```

### 2.  安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量示例文件
cp backend/.env.example backend/.env

# 编辑 . env 文件，填入你的通义千问 API Key
vim backend/.env
```

### 4.  初始化数据库

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. 启动服务

**开发模式：**

```bash
# 终端 1 - 启动后端
cd backend
npm run dev

# 终端 2 - 启动前端
cd frontend
npm run dev
```

**使用 tmux 后台运行：**

```bash
# 给脚本添加执行权限
chmod +x start.sh stop.sh

# 启动服务
./start.sh

# 停止服务
./stop.sh
```

### 6. 访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

## 🔑 获取通义千问 API Key

1. 访问 [阿里云 DashScope 控制台](https://dashscope. console.aliyun.com/)
2. 登录/注册阿里云账号
3. 开通 DashScope 服务（有免费额度）
4.  在「API-KEY 管理」页面创建 API Key
5.  将 API Key 填入 `backend/.env` 文件

## 📸 功能截图

### 首页
展示单词统计和快速入口

### 添加单词
输入单词，AI 自动获取详细信息

### 单词本
浏览、搜索、筛选已添加的单词

### 单词考核
根据中文释义输入英文单词

### 考核历史
查看历史考核记录和详情

## 📡 API 接口

### 单词相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/words | 添加单词 |
| GET | /api/words | 获取单词列表 |
| GET | /api/words/stats | 获取统计信息 |
| GET | /api/words/:id | 获取单词详情 |
| PUT | /api/words/:id | 更新单词 |
| DELETE | /api/words/:id | 删除单词 |

### 考核相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/quiz/start | 开始考核 |
| POST | /api/quiz/submit | 提交答案 |
| POST | /api/quiz/finish | 结束考核 |
| GET | /api/quiz/history | 获取考核历史 |
| GET | /api/quiz/:sessionId | 获取考核详情 |

## 🔧 配置说明

### 后端配置 (backend/.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DATABASE_URL | 数据库连接地址 | file:./dev.db |
| PORT | 服务端口 | 3000 |
| DASHSCOPE_API_KEY | 通义千问 API Key | - |
| FRONTEND_URL | 前端地址 | http://localhost:5173 |

### 前端配置 (frontend/vite.config.ts)

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| server.host | 监听地址 | 0.0. 0.0 |
| server.port | 服务端口 | 5173 |
| server.proxy | API 代理 | http://localhost:3000 |

## 📝 开发计划

- [ ] 用户登录注册
- [ ] 多用户支持
- [ ] 单词学习模式
- [ ] 艾宾浩斯遗忘曲线复习提醒
- [ ] 导入/导出单词本
- [ ] 移动端适配优化
- [ ] Docker 部署支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [通义千问](https://tongyi. aliyun.com/) - AI 能力支持
- [Tailwind CSS](https://tailwindcss. com/) - UI 框架
- [Lucide](https://lucide. dev/) - 图标库
