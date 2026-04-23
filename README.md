# AI 驱动的通用爬虫框架

> **愿景：** 让任何人都能轻松获取所需数据，释放数据的无限价值

## 项目简介

AI 驱动的通用爬虫框架通过人工智能自动学习网站结构，彻底改变传统爬虫的开发和维护方式。与需要手动编写选择器的传统爬虫工具（Scrapy、Puppeteer、BeautifulSoup）不同，我们的产品利用 AI 大模型在网页理解方面的突破，让开发者只需提供目标网址，AI 就能自动识别页面结构、提取数据，**零代码体验**，让数据采集前所未有的简单和高效。

### 核心价值

- ✨ **零代码体验**：无需编写任何代码，只需自然提供网址
- 🤖 **AI 驱动**：利用大语言模型理解网页结构和内容
- 🔒 **本地部署**：数据完全本地化，保护隐私和合规性
- 🌐 **通用性**：适用于各种网站和数据类型
- 🚀 **易用性**：像使用搜索引擎一样简单

## 项目状态

当前项目处于 **实现准备就绪** 状态。所有规划文档已完成，所有实现就绪问题已解决，准备进入 Phase 4 开发阶段。

### 已完成工作

- ✅ **产品需求文档（PRD）** - 完整的功能和非功能需求定义
- ✅ **架构设计文档** - 完整的技术架构和关键决策
- ✅ **Epic 和 Story 分解** - 15 个 Epic，87 个 Story，100% 需求覆盖
- ✅ **UX 设计规范** - 完整的用户体验设计指南
- ✅ **实现就绪评估** - 所有 6 个关键问题已解决
- ✅ **项目上下文** - AI 优化的实现指南

## 技术栈

### 后端
- **Python** 3.10+
- **FastAPI** 0.100+ - 现代高性能 Web 框架
- **SQLAlchemy** 2.0+ - ORM 数据库操作
- **PostgreSQL** 15.x - 数据持久化
- **Redis** 7.x - 任务队列和缓存
- **Celery** 5.3+ - 异步任务处理
- **httpx** - 异步 HTTP 客户端
- **BeautifulSoup4 / lxml** - HTML 解析
- **Playwright Python v1.51.0** - 动态内容处理

### 前端
- **Vue.js** 3.x - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** 5.x - 下一代前端构建工具
- **Ant Design Vue** - 企业级 UI 组件库
- **Pinia** - Vue.js 状态管理

### AI 集成
- 支持本地模型：Ollama
- 支持云端模型：OpenAI、Anthropic、Qwen、Doubao、GLM、Google Gemini
- 模型切换和回退机制
- 目标准确率：MVP 70-80%，Post-MVP 90-95%

## 项目文档

### 项目上下文

[`project-context.md`](project-context.md) - AI 优化的项目上下文
- ✅ 包含 65 条关键实施规则
- ✅ 涵盖 8 个核心部分：技术栈、语言规则、框架规则、测试规则、质量规则、工作流规则、反模式、使用指南
- ✅ 已针对 LLM 上下文效率优化
- ✅ 包含使用指南供 AI 代理和开发者参考
- **最后更新：** 2026-04-23

### 规划文档

所有规划文档位于 `_bmad-output/planning-artifacts/` 目录：

| 文档 | 描述 | 状态 |
|------|------|------|
| [`prd.md`](_bmad-output/planning-artifacts/prd.md) | 产品需求文档（PRD）- 131 个功能需求，87 个非功能需求 | ✅ 完成 |
| [`architecture.md`](_bmad-output/planning-artifacts/architecture.md) | 架构设计文档 - 技术栈、架构模式、关键决策 | ✅ 完成 |
| [`epics.md`](_bmad-output/planning-artifacts/epics.md) | Epic 和 Story 分解 - 15 Epic，87 Story，100% 需求覆盖 | ✅ 完成 |
| [`ux-design-specification.md`](_bmad-output/planning-artifacts/ux-design-specification.md) | UX 设计规范 - 用户体验设计指南 | ✅ 完成 |
| [`implementation-readiness-report-2026-04-21.md`](_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-21.md) | 实现就绪评估报告 | ✅ 完成 |

### 实现文档

| 文档 | 描述 | 状态 |
|------|------|------|
| [`project-context.md`](project-context.md) | AI 优化的项目上下文 - 65 条关键规则，8 个实现部分 | ✅ 已完成并优化 |

## 功能特性

### 核心功能（MVP）

- 🤖 **AI 页面结构学习和数据提取**
  - AI 自动分析页面结构，识别数据字段
  - 支持多种网站类型（电商、新闻门户、博客、企业官网、视频网站）
  - 数据准确率目标：MVP 70-80%，Post-MVP 优化至 90-95%（分阶段实现）
  - 人工修正机制：用户可手动调整 AI 识别结果

- 🛡️ **基础反爬虫机制**
  - 请求频率控制
  - User-Agent 轮换
  - 随机延迟
  - IP 轮换和代理池
  - 验证码自动识别

- 💻 **简单易用的 Web 界面**
  - 零代码体验：渐进式披露策略
  - 智能默认值：基于网址自动识别网站类型
  - 自然语言交互：支持自然
  - 可视化配置：拖拽、勾选框、滑块等直观操作

- 📊 **数据导出功能**
  - 支持 JSON、CSV、Excel 等多种格式
  - 方便集成到现有数据处理管道

- 💾 **本地部署和 PostgreSQL 数据库存储**
  - 所有数据存储在本地
  - 满足数据隐私法规要求

### Post-MVP 功能

- 🔍 **复杂的数据清洗和转换**
- 📈 **实时监控和告警系统**
- 🔐 **高级反爬虫策略**
- 🌐 **社区驱动
  - 用户分享爬取模板和经验
  - 形成社区驱动的生态系统
  - 网络效应：用得越多，AI 越智能

## 架构概览

### 分层架构

```
┌─────────────────────────────────────┐
│     Web UI Layer (Vue.js 3)       │
│  ┌──────────────┐  ┌────────────┐ │
│  │  User View   │  │ Admin View │ │
│  └──────────────┘  └────────────┘ │
└─────────────────────────────────────┘
            ↓ REST API
┌─────────────────────────────────────┐
│   Application Layer (FastAPI)       │
│  ┌──────────────┐  ┌────────────┐ │
│  │  API Routes   │  │ Business   │  │
│  │  │              │  │ Logic      │  │
│  └──────────────┘  └────────────┘ │
└─────────────────────────────────────┘
            ↓ Service Calls
┌─────────────────────────────────────┐
│     AI/ML Layer (Celery Tasks)      │
│  ┌──────────────┐  ┌────────────┐ │
│  │  Crawler     │  │ AI Models  │  │
│  │  Service     │  │ Service    │  │
│  └──────────────┘  └────────────┘ │
└─────────────────────────────────────┘
            ↓ Data Access
┌─────────────────────────────────────┐
│  Infrastructure Layer                │
│  ┌──────────┐  ┌──────────────┐   │
│  │PostgreSQL│  │    Redis     │   │
│  └──────────┘  └──────────────┘   │
└─────────────────────────────────────┘
```

### 目录结构

```
vscode_bmad_method_test/
├── src/
│   ├── backend/
│   │   ├── api/              # FastAPI 路由和端点
│   │   ├── core/              # 核心配置和工具
│   │   ├── models/            # SQLAlchemy ORM 模型
│   │   ├── services/          # 业务逻辑层
│   │   ├── tasks/             # Celery 异步任务
│   │   └── middleware/         # 中间件
│   ├── frontend/
│   │   ├── components/       # Vue.js 组件
│   │   ├── pages/            # 页面
│   │   ├── services/         # API 客户端
│   │   ├── store/            # Pinia 状态管理
│   │   └── styles/           # 样式系统
│   ├── tests/                  # 测试
│   ├── docs/                   # 文档
│   └── scripts/                # 脚本工具
├── _bmad-output/
│   └── planning-artifacts/     # 规划文档
├── data/                       # 数据存储
├── migrations/                 # 数据库迁移
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

## Epic 总览

项目包含 15 个 Epic，覆盖所有功能需求：

| Epic | 标题 | Story 数 | 优先级 |
|------|------|----------|--------|
| Epic 1 | 快速启动和部署系统 | 8 | P0 |
| Epic 2 | AI 页面结构学习和数据提取 | 8 | P0 |
| Epic 3 | 爬取任务调度和管理 | 8 | P0 |
| Epic 4 | 用户界面和交互 | 8 | P0 |
| Epic 5 | 数据管理和导出 | 8 | P0 |
| Epic 6 | 安全和合规 | 6 | P0 |
| Epic 7 | AI 模型集成 | 9 | P0 |
| Epic 8 | 系统集成 | 5 | P1 |
| Epic 9 | 跨平台兼容性和打包 | 5 | P1 |
| Epic 10 | 监控和性能优化 | 5 | P1 |
| Epic 11 | 文档和开发者指南 | 5 | P1 |
| Epic 12 | 社区和协作 | 5 | P2 |
| Epic 13 | 响应速度和交互体验优化 | 4 | P1 |
| Epic 14 | 可扩展性和云部署 | 4 | P1 |
| Epic 15 | 任务管理和设置 | 10 | P0 |

**总计：** 87 个 Story，131 个功能需求（FR），87 个非功能需求（NFR）

## 成功标准

### 用户成功
- 🎯 **爬取成功率**：70-80% 的常见网站类型首次爬取成功
  - 数据准确率：MVP 70-80%，Post-MVP 优化至 90-95%（分阶段实现）
  - 人工修正机制：提供审核和修正功能
  - ⚡ **顿悟时刻**：第一次成功爬取新网站，意识到"这太简单了！"
- 🔄 **AI 自适应能力**：
  - 网站结构变化后，AI 在 48-72 小时内自动适应
  - 90% 的情况下自动适应，只有 10% 需要人工干预
  - AI 能够从用户调整中学习

### 业务成功
- 👥 **用户增长**：
  - 3 个月目标：1000 用户
  - 12 个月目标：10000 用户
- 😊 **用户满意度**：NPS 达到 50+
- 📊 **用户采用率**：80% 的注册用户在第一周内成功爬取至少一个网站

### 技术成功
- 🛠️ **维护成本降低**：与传统爬虫相比，维护时间减少 70% 以上

## 性能目标

- ⏱️ **API 响应时间**：< 200ms（95th 百分位）
- 📄 **页面分析和数据提取**：< 8 秒（95th 百分位）
- 👥 **支持并发用户**：100
- 📝 **支持并发任务**：1,000
- 🖥️ **首屏加载时间**：< 3 秒
- ⚡ **交互响应时间**：< 500ms

## 合规性和安全



### 数据隐私
- 🔒 **本地部署**：所有数据存储在本地 PostgreSQL 数据库中，不会上传到云端
- 🔐 **数据加密**：敏感数据在存储和传输过程中进行加密（AES-256）
- 📋 **访问控制**：实施严格的访问控制
- 📝 **审计日志**：记录所有数据访问和操作

### 合规性
- 🌍 **GDPR**（欧盟通用数据保护条例）
- 🇺🇸 **CCPA**（加州消费者隐私法案）
- 🇨🇳 **中国网络安全法和个人信息保护法**
- 🤖 **遵守 robots.txt**：严格遵守目标网站的服务条款和 robots.txt 规范

## 部署方式

### 支持的部署方式
- 💻 **本地安装**：Windows 10/11、macOS 10.15+、Linux（Ubuntu 20.04+、CentOS 7+、Debian 10+）
- 🐳 **Docker**：容器化部署
- 🐋 **Docker Compose**：多容器编排
- ☸️ **Kubernetes**：云原生部署
- 🔄 **CI/CD 集成**：支持自动化部署和更新

### 快速开始

```bash
# 克隆项目
git clone https://github.com/fubing005/ai-agent-spider.git
cd ai-agent-spider

# 使用 Docker Compose 启动
docker-compose up -d

# 访问 Web 界面
open http://localhost:8000
```

## 开发指南

### 前置要求
- Python 3.10+
- Node.js 18+
- PostgreSQL 15.x
- Redis 7.x

### 安装依赖

```bash
# 后端依赖
pip install -r requirements.txt

# 前端依赖
cd src/frontend
npm install
```

### 运行开发服务器

```bash
# 后端（FastAPI）
cd src/backend
uvicorn main:app --reload

# 前端（Vue.js + Vite）
cd src/frontend
npm run dev
```

### 运行测试

```bash
# 后端测试
cd src/backend
pytest --cov=.

# 前端测试
cd src/frontend
npm run test
```

### 代码规范

- **Python**：遵循 PEP 8 规范，使用 Black 格式化
- **TypeScript**：使用 ESLint + Prettier
- **提交信息**：使用 Conventional Commits 规范

## 测试策略

- **单元测试覆盖率**：> 80%
- **测试框架**：
  - 后端：pytest
  - 前端：Vitest
- **集成测试**：所有 Epic 必须有对应的测试
- **E2E 测试**：关键用户旅程的端到端测试

## 文档

- ✅ [产品需求文档（PRD）](_bmad-output/planning-artifacts/prd.md) - 完整的功能和非功能需求
- ✅ [架构设计文档](_bmad-output/planning-artifacts/architecture.md) - 技术架构和关键决策
- ✅ [Epic 和 Story 分解](_bmad-output/planning-artifacts/epics.md) - 实现计划
- ✅ [UX 设计规范](_bmad-output/planning-artifacts/ux-design-specification.md) - 用户体验设计
- ✅ [项目上下文](project-context.md) - AI 优化的实现指南

## 贡献指南

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息。

## 联系方式

- **项目作者**：Shalabing
- **项目仓库**：https://github.com/fubing005/ai-agent-spider
- **问题反馈**：https://github.com/fubing005/ai-agent-spider/issues

## 致谢

感谢所有为本项目做出贡献的开发者！

---

**最后更新：** 2026-04-21  
**项目状态：** 实现准备就绪（Phase 4 开发阶段）  
**文档版本：** 1.0.0
