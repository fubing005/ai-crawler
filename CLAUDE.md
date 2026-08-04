# CLAUDE.md

减少常见大型语言模型编程错误的行为指南。根据需要与项目特定指令合并。

**权衡:** 这些指南倾向于谨慎而不是快速。对于琐碎的事情，可以自行判断。

## 1. 编程前先思考

**别假设。别隐藏困惑。把权衡点显露出来。**

在执行之前：
- 明确说明你的假设。如果不确定，就问清楚。
- 如果有多种解释方式，全部展示——不要悄悄选择其中一个。
- 如果有更简单的方法，要说出来。必要时提出异议。
- 如果有不清楚的地方，就停下来。说出困惑的地方并提出问题。

## 2. 简单至上

**能解决问题的最小代码。没有任何猜测。**

- 不要超过要求的功能。
- 不要为一次性代码做抽象。
- 不要有未被请求的“灵活性”或“可配置性”。
- 不要处理不可能出现的错误情况。
- 如果你写了200行而实际上可以用50行，重写它。

问问自己：“一个高级工程师会觉得这过于复杂吗？”如果会，就简化一下。

## 3. 架构调整

**只碰你必须碰的东西。只收拾你自己的烂摊子。**

在编辑现有代码时：
- 不要“改善”相邻的代码、注释或格式。
- 不要重构那些没坏的东西。
- 遵循现有风格，即使你想做得不一样。
- 如果你注意到无关的死代码，提一下——不要删除它。

当你的更改产生孤立代码时：
- 删除你更改后未使用的导入/变量/函数。
- 除非被要求，否则不要删除已有的死代码。

测试：每一行修改都应该直接对应用户的请求。

## 4. 以目标为导向的执行

**定义成功标准。循环直到验证通过。**

把任务转化为可验证的目标：
- “添加验证” → “为无效输入写测试，然后让测试通过”
- “修复 bug” → “写一个能重现它的测试，然后让测试通过”
- “重构 X” → “确保重构前后测试都能通过”

对于多步骤任务，简单说明一下计划：
```
1. [步骤] → 验证：[检查]
2. [步骤] → 验证：[检查]
3. [步骤] → 验证：[检查]
```

明确的成功标准让你可以独立循环工作。模糊的标准（“让它能用”）则需要不断澄清。

---

**这些指南在以下情况下有效，如果：** 在差异中减少不必要的更改，避免因过度复杂而重写，并且在实现之前先提出澄清问题，而不是在出错之后才问。


## 开发命令

```bash
# 安装依赖
pip install -r requirements.txt
npm install

# 启动开发服务器
python -m uvicorn backend.app.main:app --reload  # 后端 (FastAPI)
npm run dev                                          # 前端 (Vue.js)
npm run dev:electron                                 # Electron 开发模式

# 测试
pytest                                                   # 单元测试
pytest tests/unit/test_example.py::test_name        # 单个测试
pytest -k "test_keyword"                               # 过滤测试
npm run test:e2e                                        # Playwright E2E 测试
npx playwright test                                     # 直接运行 Playwright
npx playwright test tests/e2e/test_file.spec.ts        # 单个 E2E 测试文件

# 数据库
alembic revision --autogenerate -m "description"      # 生成迁移
alembic upgrade head                                    # 应用所有迁移
alembic downgrade -1                                    # 回滚一个迁移

# Celery
celery -A backend.app.tasks.celery_app worker --loglevel=info  # 启动 Celery worker
celery -A backend.app.tasks.celery_app beat --loglevel=info     # 启动 Celery beat

# Docker
docker-compose up -d                                     # 启动所有服务
docker-compose down                                     # 停止所有服务
docker-compose up -d db redis                           # 仅启动 DB 和 Redis
```

## 架构概览

### 核心架构

```
Frontend (Vue.js + Electron)
    ↓ HTTP/WebSocket
FastAPI Backend (async)
    ↓ Task Queue
Celery Workers
    ↓ Browser Pool
Playwright (v1.51.0 Worker Pool)
    → PostgreSQL
```

### 关键架构决策

**Playwright Worker Pool 模式：**
- 浏览器实例在 Celery worker 启动时初始化（而非每个任务）
- 连接池：10-20 个并发实例（可配置）
- 每个实例：100-200MB 内存
- 任务从池中获取连接，完成后返回
- **必需**：任务完成后显式调用 `await browser.close()` 以防止内存泄漏
- **必需**：定期清理未使用的实例

**三级视图策略：**
- 简洁视图（新手）：仅核心功能（URL 输入、结果）
- 仪表板视图（数据工程师）：实时进度、任务管理、数据导出
- 专业视图（开发者）：CLI 集成、API 调试、高级配置

**AI 模型提供商抽象：**
- 统一抽象层支持本地（Ollama）和云端（OpenAI、Anthropic 等）
- 自动回退：主模型故障时 3 秒超时
- 每个提供商的成本跟踪和预算控制

**WebSocket 实时通信：**
- 端点：`/ws/progress/{task_id}`
- 事件：三级视图状态同步的进度更新
- 重连策略：指数退避以避免连接风暴

### 数据流

1. 用户在 Vue.js 中输入 URL → FastAPI 端点
2. 创建 Celery 任务 → 任务在 Redis 中排队
3. Celery worker 从池中获取 Playwright 浏览器
4. 浏览器加载页面 → AI 模型分析结构
5. 结果存储在 PostgreSQL → WebSocket 推送到前端
6. 用户导出数据（JSON/CSV/Excel）

### 技术约束

- **Playwright 版本**：固定在 v1.51.0（未经测试 Worker Pool 模式前不要升级）
- **Python**：需要 3.10+（async/await 改进）
- **FastAPI**：所有路由必须是 `async def`
- **SQLAlchemy**：使用 2.0 语法（`select()` 而非已废弃的 `query()`）
- **Pydantic**：仅 V2（使用 `@dataclass` 装饰器定义模型）

## 代码约定

### 命名

- **Python**：文件、函数、变量使用 `snake_case`；类使用 `PascalCase`
- **Vue.js**：组件使用 `PascalCase`（`UserProfile.vue`），变量使用 `camelCase`，文件名使用 `kebab-case`
- **数据库**：表名使用 `snake_case`（如 `data_sources`），主键带 `_id` 后缀
- **API 端点**：`/api/v1/{resource_plural}`（如 `/api/v1/data-sources`）

### API 响应格式

**成功：**
```json
{ "data": { ... }, "message": "Success" }
```

**错误：**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid input" } }
```

### SQLAlchemy 2.0 模式

```python
# 正确（2.0 语法）
stmt = select(User).where(User.id == user_id)

# 错误（已废弃语法）
session.query(User).filter_by(id=user_id)

# 异步会话（FastAPI 必需）
async def get_user(db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
```

### Pydantic V2 模式

```python
from pydantic import BaseModel, Field

class UserResponse(BaseModel):
    id: int
    name: str = Field(..., min_length=1)
    created_at: datetime

# V2: 使用 model_validate 而非 parse_obj
UserResponse.model_validate(data_dict)
```

## 项目结构要点

```
backend/
├── app/
│   ├── api/           # FastAPI 路由（按资源组织）
│   ├── models/        # SQLAlchemy 模型（使用 2.0 语法）
│   ├── schemas/       # Pydantic V2 schemas
│   ├── services/      # 业务逻辑（模型中不访问数据库）
│   ├── tasks/         # Celery 任务（必须从池使用 Playwright）
│   └── core/          # 配置、依赖项
├── alembic/           # 数据库迁移（版本化）

frontend/
├── src/
│   ├── components/    # Vue 组件（按功能组织）
│   ├── composables/   # Composition API hooks
│   ├── stores/         # Pinia stores（每个功能模块一个）
│   ├── api/            # API 客户端（axios 拦截器）
│   └── utils/          # 工具函数
└── electron/          # Electron 主进程

tests/
├── playwright.config.ts
└── e2e/               # Playwright E2E 测试
```

## 安全注意事项

- **仅本地部署**：数据从不上传到云端（GDPR/CCPA 合规）
- **API 密钥**：存储在系统密钥环中（Windows DPAPI、macOS Keychain、Linux Secret Service）
- **加密**：静态数据 AES-256，传输 TLS 1.3
- **审计日志**：保留 90 天，包括用户 ID、操作类型、时间戳、IP、受影响的数据

## 性能约束

- 页面分析：< 8 秒（95th percentile）
- API 响应：< 200ms（95th percentile）
- WebSocket 送达：< 10 秒（95th percentile）
- 数据库查询：< 10 秒（95th percentile，100 万条记录）
- 加密/解密：< 100ms/1MB

## 规划文档位置

所有规划文档位于 `_bmad-output/planning-artifacts/`：
- `prd.md` - 产品需求文档
- `architecture.md` - 架构设计（包含 16 个 ADR）
- `epics.md` - Epic 分解（15 个 epics，87 个 stories）
- `ux-design-specification.md` - UX 设计规范
- `implementation-readiness-report-2026-05-01.md` - 实施就绪评估

## 项目上下文

AI 代理实施上下文位于 `_bmad-output/project-context.md`，包含：
- 精确的技术栈版本
- 15 个关键实施规则
- 框架特定模式和约定
- 测试和质量指南
- 工作流和反模式规则

在实施任何代码前，AI 代理应阅读此文件以确保与项目标准一致。
