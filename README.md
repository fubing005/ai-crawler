# AI 驱动的通用爬虫框架

> 让数据采集变得像使用搜索引擎一样简单

## 项目概述

AI 驱动的通用爬虫框架是一个革命性的数据采集工具，通过人工智能自动学习网站结构，彻底改变了传统爬虫的开发和维护方式。

### 核心价值主张

- **零代码体验** - 用户只需输入网址，AI 自动识别页面结构、提取数据
- **智能自适应** - 网站结构变化时自动适应，无需重新编写代码
- **多平台支持** - Windows、macOS、Linux 桌面应用
- **本地部署** - 数据存储在本地 PostgreSQL，完全掌控数据安全
- **三级界面** - 简洁视图（新手）、仪表板视图（数据工程师）、专业视图（开发者）

### 目标用户

- **开发者** - 厌倦重复编写选择器，需要快速集成到现有项目中
- **数据工程师** - 需要高质量、结构化数据源，关注数据质量和调度
- **数据分析师/市场研究人员** - 完全非技术背景，依赖技术团队但资源有限

## 主要功能

### 核心功能

- 🤖 **AI 页面分析** - 自动识别页面结构和数据字段
- 📊 **数据提取** - 支持 JSON、CSV、Excel 格式导出
- 🗂️ **任务管理** - 单网址/批量任务、定时调度、暂停/恢复
- 🛡️ **反爬虫机制** - 请求频率控制、User-Agent 轮换、IP 代理池
- 🔐 **安全与合规** - 本地存储、数据加密、GDPR/CCPA 合规
- 🤝 **社区与协作** - 模板市场、知识共享、用户互动
- 📈 **监控与性能** - 实时仪表板、资源监控、告警通知

### 系统集成

- 🚀 **REST API** - OpenAPI 规范、完整文档
- 🐍 **Python SDK** - Jupyter Notebook 集成
- 🔄 **Airflow Operator** - 任务调度自动化
- 📤 **Webhooks** - 事件通知
- 💾 **数据仓库集成** - Snowflake、BigQuery、Redshift
- 🌊 **实时数据流** - Kafka、Kinesis 集成
- 📊 **Tableau 集成** - 直接导入数据进行分析

### 开发者工具

- 💻 **CLI 接口** - 高级操作和脚本自动化
- 🔧 **API 调试面板** - 交互式 API 测试
- 📝 **代码导出** - 生成可重用的爬虫配置代码

## 技术栈

### 后端

```
Python 3.10+
├── FastAPI 0.100+        # Web 框架
├── SQLAlchemy 2.0+         # ORM
├── Pydantic 2.0+           # 数据验证
├── Celery 5.3+             # 异步任务队列
├── Redis 7.x                # 缓存和消息队列
└── cryptography             # 数据加密
```

### 前端

```
Vue.js 3.4+ Composition API  # 响应式框架
├── Naive UI               # 设计系统组件
├── Pinia                   # 状态管理
├── Electron                # 桌面框架
└── IndexedDB              # 离线存储
```

### 浏览器自动化

```
Playwright v1.51.0          # 跨浏览器自动化
└── Worker Pool 模式         # 10-20 并发实例
```

### 数据库

```
PostgreSQL 15.x              # 本地存储
└── Alembic                 # 数据库迁移
```

### 部署

```
Docker                      # 容器化
Docker Compose              # 多服务编排
Electron 打包              # Windows (.exe, .msi), macOS (.dmg, .pkg), Linux (.deb, .rpm)
```

## 快速开始

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd vscode_bmad_method_test

# 安装依赖
pip install -r requirements.txt

# 配置环境
cp .env.example .env
# 编辑 .env 文件配置数据库连接和 AI 模型

# 启动服务
# 开发环境
python -m uvicorn backend.app.main:app --reload
# 启动前端
npm run dev

# 生产环境
docker-compose up -d
```

### 运行第一个爬取任务

```bash
# 1. 启动应用
npm run dev

# 2. 在简洁视图中输入网址
https://example.com/products

# 3. 查看AI 分析结果
- 页面类型：商品列表
- 推荐字段：商品名称、价格、库存、评分
- 置信度：85%

# 4. 启动数据提取
# 几秒钟后获得结构化数据

# 5. 导出数据
# 支持 JSON、CSV、Excel 格式
```

## 项目结构

```
vscode_bmad_method_test/
├── _bmad/                    # BMad 配置和输出
│   ├── bmm/              # 模块配置
│   └── _output/          # 规划产物
│       ├── planning-artifacts/     # PRD、架构、Epics、UX
│       └── implementation-artifacts/  # 实施产物
├── _bmad-output/              # 项目输出目录
│   ├── planning-artifacts/     # 规划文档
│   │   ├── prd.md
│   │   ├── architecture.md
│   │   ├── epics.md
│   │   ├── ux-design-specification.md
│   │   ├── implementation-readiness-report-2026-05-01.md
│   │   ├── epic-01-first-time-onboarding.md
│   │   ├── epic-02-ai-page-analysis.md
│   │   ├── epic-03-crawl-task-management.md
│   │   ├── epic-04-user-interface-interaction.md
│   │   ├── epic-05-data-management-export.md
│   │   ├── epic-06-offline-mode-persistence.md
│   │   ├── epic-07-undo-redo-recovery.md
│   │   ├── epic-08-ai-model-integration.md
│   │   ├── epic-09-anti-crawling-mechanisms.md
│   │   ├── epic-10-security-compliance.md
│   │   ├── epic-11-desktop-deployment-system-integration.md
│   │   ├── epic-12-monitoring-performance-optimization.md
│   │   ├── epic-13-community-collaboration.md
│   │   ├── epic-14-observability-logging.md
│   │   ├── epic-15-scalability-integration.md
│   │   ├── design-direction-overview.md
│   │   └── wireframe-document.md
│   └── project-context.md    # AI 代理上下文
├── backend/                   # 后端服务
│   ├── app/                # FastAPI 应用
│   ├── api/                # API 路由
│   ├── models/             # SQLAlchemy 模型
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # 业务逻辑
│   ├── tasks/               # Celery 任务
│   └── core/               # 配置、工具
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   ├── composables/    # 组合式 API
│   │   ├── stores/          # Pinia stores
│   │   ├── api/            # API 客户端
│   │   └── utils/          # 工具函数
│   ├── electron/            # Electron 主进程
│   └── tests/              # 测试
├── tests/                    # Playwright 端到端测试
│   ├── playwright.config.ts
│   └── e2e/                # 端到端测试
└── docs/                     # 项目文档
```

## 开发指南

### 代码规范

参考 `project-context.md` 了解详细的编码规范：

- **命名约定**
  - Python: `snake_case` (函数、变量)
  - Vue.js: `PascalCase` (组件), `camelCase` (变量)
  - 文件名: `kebab-case`

- **API 设计**
  - REST 端点: `/api/v1/{resource_plural}`
  - 统一错误响应格式
  - 版本控制: `X-API-Version` header

- **数据库**
  - 表名: `snake_case`
  - 主键: 使用 `_id` 后缀
  - 外键: `{table}_id` 格式

### 提交规范

```bash
# 功能分支
git checkout -b feature/new-feature

# 提交信息
git commit -m "feat: add new feature

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"

# 推送到远程
git push origin feature/new-feature
```

### 测试

```bash
# 运行所有测试
pytest

# 运行 Playwright 端到端测试
npm run test:e2e
```

## 配置说明

### 环境变量

创建 `.env` 文件配置以下变量：

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/ai_crawler

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# AI 模型配置
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
QWEN_API_KEY=sk-...

# 应用配置
APP_ENV=development
LOG_LEVEL=INFO
```

### AI 模型提供商配置

系统支持以下 AI 模型提供商：

**本地模型:**
- Ollama - 无需 API Key，需要本地安装

**云端模型:**
- OpenAI - 需要 API Key
- Anthropic - 需要 API Key  
- Qwen (通义千问) - 需要 API Key
- Doubao (字节跳动) - 需要 API Key
- GLM (智谱) - 需要 API Key
- Google Gemini - 需要 API Key

## 性能要求

- 页面分析与提取: < 8 秒 (95th 百分位)
- API 响应时间: < 200ms (95th 百分位)
- 支持 100 并发用户
- 支持 1,000 并发任务
- 支持批量爬取: 最多 1,000 个 URL

## 安全与合规

- **数据存储**: 本地 PostgreSQL，不上传云端
- **数据加密**: AES-256 (静态), TLS 1.3 (传输)
- **合规标准**: 
  - GDPR (欧盟通用数据保护条例)
  - CCPA (加州消费者隐私法)
  - 中国网络安全法
  - 个人信息保护法

## 项目状态

- **已完成文档**：PRD、Architecture、UX Design、Epics & Stories（15 个 epics，87 个 stories）
- **实施就绪评估**：✅ 已完成（2026-05-01）
- **下一阶段**：Sprint Planning → Story Development

## 文档

### 规划文档 (`_bmad-output/planning-artifacts/`)

**核心文档：**
- `prd.md` - 产品需求文档
- `architecture.md` - 架构设计文档（包含 16 个 ADR）
- `epics.md` - Epic 分解和用户故事（15 个 epics，87 个 stories）
- `ux-design-specification.md` - UX 设计规范

**Epic 分片文档：**
- `epic-01-first-time-onboarding.md` - 首次使用引导
- `epic-02-ai-page-analysis.md` - AI 页面分析
- `epic-03-crawl-task-management.md` - 爬取任务管理
- `epic-04-user-interface-interaction.md` - 用户界面交互
- `epic-05-data-management-export.md` - 数据管理与导出
- `epic-06-offline-mode-persistence.md` - 离线模式与持久化
- `epic-07-undo-redo-recovery.md` - 撤销/重做与恢复
- `epic-08-ai-model-integration.md` - AI 模型集成
- `epic-09-anti-crawling-mechanisms.md` - 反爬虫机制
- `epic-10-security-compliance.md` - 安全与合规
- `epic-11-desktop-deployment-system-integration.md` - 桌面部署与系统集成
- `epic-12-monitoring-performance-optimization.md` - 监控与性能优化
- `epic-13-community-collaboration.md` - 社区与协作
- `epic-14-observability-logging.md` - 可观测性与日志
- `epic-15-scalability-integration.md` - 可扩展性与集成

**设计文档：**
- `design-direction-overview.md` - 设计方向概览
- `wireframe-document.md` - 线框图文档

**其他文档：**
- `product-brief-ai-crawler.md` - 产品简报

### 实施报告 (`_bmad-output/planning-artifacts/`)

- `implementation-readiness-report-2026-05-01.md` - 实施就绪评估报告

### 项目上下文

- `project-context.md` - AI 代理实施规则和约定（15 个关键规则）

## 许可证

本项目采用 MIT 许可证。

## 贡献

欢迎贡献！请参考以下指南：

1. 遵循代码规范 (`project-context.md`)
2. 为新功能创建分支
3. 添加适当的测试
4. 更新相关文档
5. 提交 Pull Request 前确保测试通过

## 常见问题

### 首次使用

1. 确保 Python 3.10+ 已安装
2. 确保 PostgreSQL 15.x 已安装并运行
3. 确保 Redis 7.x 已安装并运行
4. 复制 `.env.example` 为 `.env` 并配置必要的环境变量

### 端到端测试失败

- 确保使用 `npx playwright install` 安装浏览器
- 检查网络连接
- 尝试使用不同的浏览器模式

### AI 模型连接失败

- 检查 API Key 是否正确
- 验证 Base URL 是否可访问
- 检查网络代理设置

## 联系方式

项目作者：Shalabing
项目仓库：https://github.com/fubing005/ai-crawler
问题反馈：https://github.com/fubing005/ai-crawler/issues

## 路线图

```
产品规划 → 架构设计 → UX 设计 → Epic 分解 → 实施就绪评估 → Sprint 规划 → Story 开发 → 测试 → 部署
```

**当前阶段**: 实施就绪评估完成，准备进入 Sprint 规划阶段

---

**最后更新**: 2026-05-01