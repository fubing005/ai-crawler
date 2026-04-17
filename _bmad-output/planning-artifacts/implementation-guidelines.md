# 实施指南

**文档版本：** 1.0  
**创建日期：** 2026-04-17  
**项目：** vscode_bmad_method_test - AI爬虫框架

---

## 📋 目录

1. [项目概述](#项目概述)
2. [AI准确率目标说明](#ai准确率目标说明)
3. [实施优先级](#实施优先级)
4. [技术决策](#技术决策)
5. [开发流程](#开发流程)
6. [环境准备](#环境准备)
7. [开发规范](#开发规范)
8. [测试策略](#测试策略)
9. [部署指南](#部署指南)
10. [常见问题](#常见问题)

---

## 项目概述

本项目是一个基于AI的零代码爬虫框架，旨在让用户无需编写代码即可从网站提取结构化数据。

**核心特性：**
- 🤖 AI驱动的页面结构识别和数据提取
- 🎯 零代码体验，可视化界面操作
- 🔒 本地部署，数据隐私保护
- 📊 多种数据导出格式（CSV、JSON、Excel）
- 🌐 支持多种网站类型（静态、动态、登录页面等）

**技术栈：**
- **后端：** FastAPI + PostgreSQL + Celery + Redis
- **前端：** Vue.js 3 + Ant Design + Vite
- **AI：** 支持多种AI模型（云端和本地）
- **爬虫：** httpx + BeautifulSoup4 + Playwright

---

## AI准确率目标说明

本项目采用**分阶段AI准确率实现策略**，以确保项目在合理的时间内交付MVP版本，同时通过持续优化提升数据质量。

### MVP阶段（70-80%准确率）

**目标：**
- AI准确率：70-80%
- 有效数据率：95%+（通过人工校准实现）

**策略：**
1. **AI基础模型：** 使用成熟的AI模型完成初步数据提取
2. **人工校准机制：** 提供直观的数据预览和校对界面
3. **数据验证：** 自动检测低质量数据并提示用户校对
4. **反馈学习：** 收集用户校对数据，用于模型优化

**实施要点：**
- 提供实时数据预览界面
- 支持快速数据修正和校对
- 显示数据质量指标和置信度
- 保存用户校对历史
- 提供批量校对功能

**验证标准：**
- 70-80%的数据字段提取正确
'通过人工校准，最终有效数据率达到95%+'
- 用户可以在5分钟内校对一个100条数据的数据集

### Post-MVP阶段（95-98%准确率）

**目标：**
- AI准确率：95-98%
- 人工校准需求：减少至5%以下

**策略：**
1. **模型优化：** 基于MVP阶段收集的校对数据重新训练AI模型
2. **反馈学习：** 实现主动学习机制，持续改进模型
3. **自适应提取：** 根据网站特征动态调整提取策略
4. **错误分析：** 分析提取失败的案例，针对性优化

**实施要点：**
- 收集和分析MVP阶段的错误案例
- 实现模型版本管理和A/B测试
- 添加自动模型评估流程
- 开发模型性能监控仪表板
- 支持用户自定义提取规则

**验证标准：**
- 95-98%的数据字段提取正确
- 人工校准需求减少到5%以下
- 模型推理时间保持在3秒内
- 支持1000+种不同网站结构

### 准确率评估方法

**数据集：**
- 使用500个不同类型网站的测试数据集
- 涵盖电商、新闻、社交媒体、企业官网等类别

**评估指标：**
- **字段准确率：** 提取字段与真实值匹配的比例
- **完整性：** 成功提取目标字段的比例
- **置信度：** AI对提取结果的置信度分数
- **用户体验：** 用户完成数据校对所需时间

**评估流程：**
1. 每周运行完整评估
2. 记录各指标的变化趋势
3. 分析错误模式和失败案例
4. 生成评估报告并同步到团队

---

## 实施优先级

### MVP阶段优先级

**实施顺序：**
1. **Epic 1：项目初始化和基础设施**（必须首先完成）
2. **Epic 2：AI页面结构学习和数据提取**（核心功能）
3. **Epic 3：基础反爬虫机制**（支持核心功能）
4. **Epic 4：简单易用的Web界面**（用户界面）
5. **Epic 5：数据导出功能**（输出功能）
6. **Epic 6：数据隐私和合规性**（安全要求）
7. **Epic 7：AI模型选择和配置**（配置功能）

**时间估算：**
- Epic 1：2周
- Epic 2：4周
- Epic 3：2周
- Epic 4：3周
- Epic 5：1周
- Epic 6：2周
- Epic 7：1周

**MVP总时间：** 15周（约3.5个月）

### Post-MVP阶段优先级

**实施顺序：**
1. **Epic 8：复杂的数据清洗和转换**
2. **Epic 9：实时监控和告警系统**
3. **Epic 10：监控和性能功能**
4. **Epic 11：跨平台桌面体验**
5. **Epic 12：社区和协作功能**
6. **Epic 13：性能优化**
7. **Epic 14：国际化和主题**
8. **Epic 15：任务管理和设置**

**实施原则：**
- 基于用户反馈确定优先级
- 每个Epic独立可发布
- 支持渐进式功能增强

---

## 技术决策

### 后端技术栈

**FastAPI框架选择理由：**
- 高性能异步支持，适合I/O密集型爬虫任务
- 自动生成API文档（Swagger UI）
- 类型提示支持，减少运行时错误
- 丰富的中间件生态系统
- 活跃的社区和文档

**PostgreSQL选择理由：**
- 支持复杂查询和关系数据
- 优秀的并发性能
- 成熟的数据复制和备份机制
- 支持JSON数据类型（适合存储爬虫配置）
- 免费开源，降低运营成本

**Celery + Redis选择理由：**
- 支持分布式任务队列
- 任务优先级和调度功能
- 自动重试和错误处理
- 支持任务结果持久化
- 与FastAPI集成良好

### 前端技术栈

**Vue.js 3选择理由：**
- 渐进式框架，易于上手
- 组合式API，逻辑复用性强
- 优秀的性能和响应速度
- 丰富的组件库支持
- TypeScript支持完善

**Ant Design选择理由：**
- 企业级UI组件库，质量稳定
- 丰富的组件类型（表格、表单、图表等）
- 主题定制能力
- 国际化支持
- 详细的使用文档

**Vite选择理由：**
- 快速的开发服务器启动
- 热模块替换（HMR）体验好
- 基于ESM，打包效率高
- 支持TypeScript和JSX
- 插件生态丰富

### AI模型选择

**支持的AI模型：**

**云端模型：**
- OpenAI GPT-4/GPT-3.5：强大的文本理解能力
- Anthropic Claude：长文本处理能力优秀
- Google PaLM：多语言支持好

**本地模型：**
- Meta Llama 2：开源，可本地部署
- Mistral：性能优秀的开源模型
- 专有模型：企业内部定制的模型

**模型选择策略：**
- 默认：根据任务复杂度自动选择
- 用户可配置：支持用户指定模型
- 成本优化：批量处理使用本地模型
- 质量优先：复杂页面使用云端模型

---

## 开发流程

### Story实施流程

**1. Story准备阶段**
- [ ] 确认Story的Acceptance Criteria清晰明确
- [ ] 识别Story依赖的其他Story
- [ ] 估算Story实施时间
- [ ] 创建实施分支：`git checkout -b story/<epic-number>.<story-number>`

**2. 开发实施阶段**
- [ ] 根据Acceptance Criteria实现功能
- [ ] 编写单元测试（覆盖率≥80%）
- [ ] 编写集成测试
- [ ] 更新相关文档（API文档、用户手册）
- [ ] 提交代码到分支

**3. Story验证阶段**
- [ ] 运行所有测试：`pytest`
- [ ] 运行代码质量检查：`flake8`、`black`
- [ ] 验证Acceptance Criteria全部通过
- [ ] 进行代码审查
- [ ] 合并到主分支：`git merge main`

**4. Story完成阶段**
- [ ] 更新Sprint跟踪文档
- [ ] 标记Story为完成状态
- [ ] 通知相关干系人
- [ ] 清理临时分支

### Sprint计划

**Sprint周期：** 2周

**Sprint规划会议：**
- 每Sprint开始时召开
- 回顾上一个Sprint的成果和问题
- 选择本Sprint要完成的Story
- 估算Story工作量
- 分配任务给团队成员

**每日站会：**
- 每天上午15分钟
- 每人汇报：昨天做了什么、今天计划做什么、遇到什么阻碍
- 及时发现和解决问题

**Sprint回顾会议：**
- 每Sprint结束时召开
- 演示完成的功能
- 讨论成功的做法和改进点
- 规划下一个Sprint

---

## 环境准备

### 开发环境要求

**系统要求：**
- 操作系统：Windows 10/11、macOS 10.15+、Ubuntu 18.04+
- Python：3.9+
- Node.js：18+
- PostgreSQL：14+
- Redis：6+
- Git：2.30+

**开发工具：**
- IDE：VS Code、PyCharm、WebStorm
- 数据库客户端：pgAdmin、DBeaver
- API测试工具：Postman、Swagger UI
- 版本控制：Git、GitHub

### 环境安装步骤

**1. 克隆项目**
```bash
git clone https://github.com/your-org/ai-crawler-framework.git
cd ai-crawler-framework
```

**2. 设置Python环境**
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

**3. 设置Node.js环境**
```bash
# 进入前端目录
cd src/frontend

# 安装依赖
npm install

# 返回项目根目录
cd ../..
```

**4. 配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**.env配置示例：**
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/ai_crawler_db

# Redis配置
REDIS_URL=redis://localhost:6379/0

# AI模型配置
DEFAULT_AI_MODEL=openai
OPENAI_API_KEY=your-openai-api-key

# 应用配置
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

**5. 初始化数据库**
```bash
# 运行数据库迁移
python -m alembic upgrade head

# 或使用初始化脚本
python scripts/init_db.py
```

**6. 启动服务**
```bash
# 启动Redis（在单独的终端）
redis-server

# 启动Celery worker（在单独的终端）
celery -A src.backend.core.celery_app worker --loglevel=info

# 启动FastAPI后端
uvicorn src.backend.main:app --reload

# 启动Vue.js前端（在另一个终端）
cd src/frontend
npm run dev
```

---

## 开发规范

### 代码风格规范

**Python代码规范（PEP 8）：**
```bash
# 代码格式化
black src/backend

# 代码检查
flake8 src/backend

# 类型检查
mypy src/backend
```

**JavaScript/TypeScript代码规范：**
```bash
# 代码格式化
prettier --write "src/frontend/**/*.{js,ts,jsx,tsx}"

# 代码检查
eslint src/frontend
```

### Git提交规范

**提交消息格式：**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat`：新功能
- `fix`：Bug修复
- `docs`：文档更新
- `style`：代码格式调整
- `refactor`：代码重构
- `test`：测试相关
- `chore`：构建/工具链相关

**示例：**
```
feat(epic2): 添加AI页面结构分析API

实现了基于AI的页面结构分析功能，支持自动识别
数据字段位置和类型。

Closes #123
```

### API设计规范

**REST端点命名：**
- 使用资源名：`/api/v1/tasks`
- 使用HTTP方法表示操作：GET、POST、PUT、DELETE
- 使用复数形式表示资源集合：`/api/v1/tasks`
- 使用查询参数进行过滤：`/api/v1/tasks?status=pending`

**错误响应格式：**
```json
{
  "error": {
    "code": "INVALID_URL",
    "message": "提供的URL格式不正确",
    "details": {
      "url": "not-a-url"
    }
  }
}
```

---

## 测试策略

### 测试类型

**1. 单元测试**
- 测试单个函数和类的功能
- 使用pytest框架
- 目标覆盖率：80%+

**2. 集成测试**
- 测试多个组件协同工作
- 测试API端点
- 测试数据库操作

**3. 端到端测试**
- 测试完整的用户流程
- 使用Playwright进行浏览器自动化测试
- 测试关键用户路径

**4. 性能测试**
- 测试API响应时间
- 测试数据库查询性能
- 使用locust进行负载测试

### 测试命令

```bash
# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_api.py

# 运行测试并生成覆盖率报告
pytest --cov=src/backend --cov-report=html

# 运行性能测试
locust -f tests/performance/locustfile.py
```

---

## 部署指南

### Docker部署

**构建Docker镜像：**
```bash
# 构建后端镜像
docker build -t ai-crawler-backend:latest -f docker/Dockerfile.backend .

# 构建前端镜像
docker build -t ai-crawler-frontend:latest -f docker/Dockerfile.frontend .
```

**使用Docker Compose启动：**
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

**1. 准备生产环境**
- 配置生产数据库
- 配置Redis集群
- 获取AI模型API密钥
- 配置域名和SSL证书

**2. 部署步骤**
```bash
# 拉取最新代码
git pull origin main

# 安装依赖
pip install -r requirements.txt
npm install

# 运行数据库迁移
python -m alembic upgrade head

# 构建前端
npm run build

# 启动服务
systemctl start ai-crawler-backend
systemctl start ai-crawler-frontend
systemctl start celery-worker
```

**3. 监控和维护**
- 设置日志监控（ELK Stack）
- 设置性能监控（Prometheus + Grafana）
- 配置告警通知
- 定期备份数据库

---

## 常见问题

### 开发相关

**Q：如何运行测试？**
A：使用`pytest`命令运行所有测试，或`pytest tests/test_file.py`运行特定测试。

**Q：如何添加新的AI模型？**
A：在`src/backend/ai/models/`目录下创建新的模型类，继承自`BaseModel`类，并注册到模型工厂。

**Q：如何调试爬虫任务？**
A：使用Celery的`--loglevel=debug`选项启动worker，或在代码中使用`logging.debug()`输出调试信息。

### 部署相关

**Q：如何备份数据库？**
A：使用`pg_dump`命令：`pg_dump ai_crawler_db > backup.sql`

**Q：如何扩展Celery worker？**
A：启动多个worker进程：`celery -A app worker --concurrency=4`

### 性能相关

**Q：如何优化爬虫性能？**
A：
- 增加Celery worker的并发数
- 使用连接池减少数据库连接开销
- 启用Redis缓存
- 使用异步I/O

---

## 附录

### 参考文档

- [FastAPI官方文档](https://fastapi.tiangolo.com/)
- [Vue.js官方文档](https://vuejs.org/)
- [Ant Design组件文档](https://ant.design/)
- [Celery文档](https://docs.celeryproject.org/)
- [PostgreSQL文档](https://www.postgresql.org/docs/)

### 联系方式

- **技术问题：** 开发团队邮箱
- **功能需求：** 产品经理邮箱
- **Bug报告：** GitHub Issues

---

**文档维护：**
本文档应随着项目进展定期更新，确保内容与实际实施保持一致。如有