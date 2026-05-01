---
project_name: 'vscode_bmad_method_test'
user_name: 'Shalabing'
date: '2026-05-01'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 15
optimized_for_llm: true
existing_patterns_found: { 9 }
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Backend
- **Python**: 3.10+（async/await 改进）
- **FastAPI**: 0.100+（所有路由必须 `async def`）
- **SQLAlchemy**: 2.0+（必须使用 `select()` 语法，废弃 `query()`）
- **Pydantic**: 2.0+（使用 `@dataclass` 装饰器，`model_validate` 替代 `parse_obj`）
- **Celery**: 5.3+（任务队列）
- **Redis**: 7.x（缓存/消息队列）

### Frontend
- **Vue.js**: 3.4+ Composition API
- **Naive UI**: 设计系统组件库
- **Pinia**: 状态管理（避免 Vuex）
- **Electron**: 桌面应用框架

### Browser Automation
- **Playwright**: v1.51.0（固定版本，Worker Pool 模式依赖）

### Database
- **PostgreSQL**: 15.x（本地部署）

### Testing
- **pytest**: 单元测试框架

### Deployment
- **Docker**: 容器化
- **Docker Compose**: 多服务编排
- **Electron 打包**: Windows (.exe, .msi), macOS (.dmg, .pkg), Linux (.deb, .rpm)

---

## Critical Implementation Rules

### 1. 代码命名约定

**Python (后端)**:
- 文件和目录：`snake_case`
- 函数和变量：`snake_case`
- 类名：`PascalCase`
- 主键：使用 `id` 后缀（如 `data_source_id`）
- 外键：使用 `{referenced_table}_id` 格式（如 `data_source_id`）
- 索引：`idx_{table}_{columns}` 格式（如 `idx_data_sources_url`）

**Vue.js (前端)**:
- 组件：`PascalCase`（如 `UserProfile.vue`）
- 变量：`camelCase`
- 文件名：`kebab-case`（如 `user-profile.vue`）

### 2. Python 异步编程规范

**FastAPI 路由：**
- 所有路由必须使用 `async def`
- 禁止同步路由（性能影响）

**SQLAlchemy 2.0 语法：**
```python
# 正确（2.0 语法）
stmt = select(User).where(User.id == user_id)
result = await db.execute(stmt)
user = result.scalar_one_or_none()

# 错误（废弃语法）
session.query(User).filter_by(id=user_id)
```

**Pydantic V2 模式：**
```python
from pydantic import BaseModel, Field

class UserResponse(BaseModel):
    id: int
    name: str = Field(..., min_length=1)
    created_at: datetime

# V2: 使用 model_validate 而非 parse_obj
UserResponse.model_validate(data_dict)
```

### 3. 错误处理规范

**HTTP 状态码：**
- 客户端错误：`4xxxx`（如 400, 404）
- 服务端错误：`5xxxx`（如 500, 503）

**错误响应结构：**
```python
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable description",
        "details": { ... }
    }
}
```

### 4. API 约定

**REST 端点**:
- 格式：`/api/v1/{resource_plural}`（如 `/api/v1/data-sources`）
- 查询参数：`snake_case`（如 `?status=active&page=1`）
- 请求体：`snake_case` JSON
- 路径参数：`{resource}_id` 格式

**API 响应格式**:
- 成功：
  ```json
  {
    "data": { ... },
    "message": "Success"
  }
  ```
- 错误：
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input"
    }
  }
  ```

**版本控制**:
- Header: `X-API-Version: v1`（可选，支持向后兼容）

### 5. 浏览器自动化规范

**Worker Pool 模式**：
- 在 Celery worker 启动时初始化 Playwright 实例
- 每个任务从连接池获取浏览器连接
- 任务完成后返回连接到池中
- 池大小：10-20 并发浏览器实例（可配置）
- 资源限制：每个实例 100-200MB 内存

**资源清理**：
- 任务完成后显式调用 `await browser.close()`
- 定期清理未使用的实例

### 6. WebSocket 实时通信

**进度推送端点**：
- 格式：`/ws/progress/{task_id}`
- 事件格式：三级视图状态同步

**重连策略**：
- 连接断开时自动重连
- 指数退避避免连接风暴

### 7. 前端状态管理

**Pinia Store**：
- 按功能模块组织（`useUserStore`, `useTaskStore`）
- 持久化策略：`persist: true`（需要本地存储）
- 避免直接操作状态，通过 actions 修改

**IndexedDB 离线存储**：
- 历史记录缓存
- 用户配置存储
- 离线状态标记

### 8. 测试规范

**测试结构**：
- 单元测试：`tests/unit/test_*.py`
- E2E 测试：`tests/e2e/*.spec.ts`
- 测试函数命名：`test_*`

**Mock 使用**：
- 使用 pytest fixtures 进行依赖注入
- Mock 外部服务（数据库、API、浏览器）
- 避免测试实现细节，测试行为

**测试边界**：
- 单元测试：测试单个函数/类，使用 mock
- 集成测试：测试多个组件交互，使用真实数据库
- E2E 测试：测试完整用户流程，使用真实浏览器

**Playwright E2E 测试**：
- 使用 Playwright v1.51.0 进行端到端测试
- 测试文件：`tests/e2e/*.spec.ts`
- 配置文件：`playwright.config.ts`

### 9. 代码组织规范

**后端结构**：
- `backend/app/api/` - FastAPI 路由（按资源组织）
- `backend/app/models/` - SQLAlchemy 模型（使用 2.0 语法）
- `backend/app/schemas/` - Pydantic V2 schemas
- `backend/app/services/` - 业务逻辑（不在模型中访问数据库）
- `backend/app/tasks/` - Celery 任务（必须从池使用 Playwright）
- `backend/app/core/` - 配置、依赖项
- `backend/alembic/` - 数据库迁移（版本化）

**前端结构**：
- `frontend/src/components/` - Vue 组件（按功能组织）
- `frontend/src/composables/` - Composition API hooks
- `frontend/src/stores/` - Pinia stores（每个功能模块一个）
- `frontend/src/api/` - API 客户端（axios 拦截器）
- `frontend/src/utils/` - 工具函数
- `frontend/electron/` - Electron 主进程

**测试结构**：
- `tests/playwright.config.ts` - Playwright 配置
- `tests/e2e/` - Playwright E2E 测试

### 10. 文档规范

**注释风格**：
- 使用中文注释和文档
- 关键函数添加 docstring
- API 端点添加 OpenAPI 文档

**README 和 API 文档模式**：
- 使用 Markdown 格式
- 包含安装、配置、使用说明
- API 文档使用 OpenAPI/Swagger

### 11. CI/CD 规范

**分支命名**：
- 功能分支：`feature/{feature-name}`
- 修复分支：`fix/{issue-number}`
- 发布分支：`release/{version}`

**提交消息**：
- 格式：`{type}: {brief description}`
- 示例：`feat: add user authentication`
- 必需：Co-Authored-By（包含 AI）

### 12. 数据库规范

**表命名**：
- 表名：`snake_case`（如 `data_sources`, `crawl_tasks`）
- 外键：`{table}_id` 格式

**迁移**：
- 工具：Alembic
- 版本控制：版本化迁移脚本
- 向前兼容：支持数据结构变更

### 13. 安全与合规

**数据加密**：
- 静态数据：AES-256（存储）
- 传输：TLS 1.3
- API Key：系统密钥环存储（Windows DPAPI / macOS Keychain / Linux Secret Service）

**访问控制**：
- RBAC：管理员、操作员、查看者
- MFA：支持（可选）

**审计日志**：
- 保留：90 天
- 内容：用户 ID、操作类型、时间、IP、影响的数据

**隐私**：
- 数据本地存储（不上传云端）
- 用户同意：首次启动显示隐私政策
- 数据删除：30 天内响应请求

### 14. 性能约束

- 页面分析时间：< 8 秒（95th percentile）
- API 响应时间：< 200ms（95th percentile）
- WebSocket 送达：< 10 秒（95th percentile）
- 数据库查询：< 10 秒（95th percentile，100 万条记录）
- 加密/解密：< 100ms/1MB

### 15. 关键反模式（必须避免）

**禁止事项**：
- ❌ 在 FastAPI 路由中使用同步函数（性能影响）
- ❌ 使用 SQLAlchemy 1.x 语法（`query()` 已废弃）
- ❌ 使用 Pydantic V1 语法（`parse_obj()` 已废弃）
- ❌ 在 Celery 任务中创建新的浏览器实例（必须从池获取）
- ❌ 忘记在任务完成后调用 `await browser.close()`（内存泄漏）
- ❌ 升级 Playwright 版本（Worker Pool 模式依赖 v1.51.0）

**必须处理**：
- ✅ WebSocket 连接断开（指数退避重连）
- ✅ AI 模型故障（3秒内自动回退）
- ✅ 数据库连接失败（重试机制）
- ✅ 并发任务（连接池管理）

---

## 已发现的模式

### 1. 数据库迁移策略

- 使用 Alembic 进行版本化迁移
- 每个表变更生成迁移脚本
- 支持向前和向后兼容

### 2. 三级视图策略

- **简洁视图**（新手）：只显示核心功能（输入网址）
- **仪表板视图**（数据工程师）：实时进度、任务管理、数据导出
- **专业视图**（开发者）：CLI 集成、API 调试、高级配置

### 3. AI 模型提供商抽象

- 统一抽象层支持本地（Ollama）和云端（OpenAI、Anthropic 等）
- 自动回退机制（主模型故障时 3 秒内切换）
- 成本跟踪和预算控制

### 4. 反爬虫机制

- 请求频率控制（随机延迟 2-5 秒）
- User-Agent 轮换
- IP 代理池
- CAPTCHA 自动处理
- 人工行为模拟（延迟、滚动、鼠标移动）

---

## 关键架构决策 (ADRs)

1. **ADR-001**: 本地部署架构
2. **ADR-002**: AI 模型选择
3. **ADR-003**: 浏览器自动化框架（Playwright v1.51.0）
4. **ADR-004**: 数据存储组织
5. **ADR-005**: 反爬虫策略
6. **ADR-006**: 性能优化策略
7. **ADR-007**: 安全架构
8. **ADR-008**: 可扩展性架构
9. **ADR-009**: AI 模型部署
10. **ADR-010**: 监控和可观测性
11. **ADR-011**: 多提供商 AI 模型支持
12. **ADR-012**: 统一 AI 模型抽象层
13. **ADR-013**: 多提供商回退策略
14. **ADR-014**: 成本感知模型选择
15. **ADR-015**: 云端模型数据隐私设计
16. **ADR-016**: 混合本地-云端架构

---

## 项目状态

- **已完成文档**：PRD、Architecture、UX Design、Epics & Stories
- **实施就绪评估**：✅ 已完成（已修复 NFR 编号问题）
- **下一阶段**：Sprint Planning → Story Development

---

## 使用指南

**对于 AI 代理：**

- 在实现任何代码之前阅读此文件
- 严格按照文档记录遵循所有规则
- 有疑问时，选择更严格的选项
- 如果出现新模式，更新此文件

**对于人类：**

- 保持此文件精简，专注于代理需求
- 技术栈变更时更新
- 每季度审查以更新过时规则
- 随时间推移删除变得显而易见的规则

**最后更新**: 2026-05-01
