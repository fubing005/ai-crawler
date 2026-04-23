---
project_name: 'vscode_bmad_method_test'
user_name: 'Shalabing'
date: '2026-04-21'
lastUpdated: '2026-04-23 - 添加使用指南'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules',
   'quality_rules', 'workflow_rules', 'anti_patterns', 'usage_guide']
existing_patterns_found: 8
status: 'complete'
rule_count: 65
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### 后端技术栈
- **Python**: 3.10+（必须）
- **FastAPI**: 0.100+（异步 Web 框架）
- **SQLAlchemy**: 2.0+（ORM 数据库操作）
- **PostgreSQL**: 15.x（本地数据持久化）
- **Redis**: 7.x（任务队列和缓存）
- **Celery**: 5.3+（异步任务处理）
- **httpx**:（异步 HTTP 客户端）

### 浏览器自动化
- **Playwright**: v1.51.0（唯一选择，ADR-003）
  - 必须使用 Worker Pool 模式管理浏览器实例
  - 每个浏览器实例占用 100-200MB 内存
  - 支持 10-20 个并发浏览器上下文

### 前端技术栈
- **Electron**:（推荐，跨平台桌面应用）
- **Vue.js**: 3.x（可选，如果使用 web 渲染器）
- **TypeScript**:（类型安全）

### AI 模型提供商
- **本地模型**: Ollama（Llama、Mistral、Qwen 等）
- **云端模型**: OpenAI、Anthropic、Qwen（通义千问）、豆包、GLM（智谱AI）、Google Gemini

### 其他依赖
- **BeautifulSoup4 / lxml**:（HTML 解析）
- **PyCryptodome**:（AES-256 加密）

---

## Critical Implementation Rules

### 🤖 AI 模型管理规则（ADR-011、ADR-012、ADR-013、ADR-014、ADR-015、ADR-016）

#### 必须实现的架构
- **统一抽象层**: 必须实现 `AIModelProvider` 接口
  ```python
  class AIModelProvider(ABC):
      @abstractmethod
      async def analyze_page(self, html: str, instructions: str) -> Dict[str, Any]:
          pass
  ```

- **多提供商管理**: 使用 Strategy Pattern 管理多个 AI 提供商
- **自动回退机制**: 主提供商失败时 3 秒内自动回退到备用模型
- **成本追踪**: 实时追踪 token 使用和 API 成本

#### 配置和切换
- 模型切换必须在 5 秒内完成（NFR48）
- 支持热切换，无需重启应用
- 允许用户配置模型特定参数（temperature、max tokens）

#### 数据隐私
- **云端模型警告**: 使用云端模型前必须提供清晰的数据隐私警告
- **数据脱敏**: 必须提供数据脱敏选项（ADR-015）
- **用户同意**: 云端使用前必须获得用户明确同意

---

### 🌐 浏览器自动化规则（ADR-003）

#### 资源管理
- **Worker Pool 模式**: 必须使用 Worker Pool 管理浏览器实例
- **内存限制**: 每个浏览器实例 100-200MB，总内存必须监控
- **并发限制**: 支持 10-20 个并发浏览器上下文
- **实例池**: 实现浏览器实例池，避免频繁创建/销毁

#### 反爬虫机制（ADR-005）
- **多层反爬策略**: 实现以下层级的反爬虫策略
  1. 请求频率控制（可配置延迟）
  2. User-Agent 轮换
  3. IP 轮换和代理池
  4. 验证码自动处理
  5. 行为模拟（随机延迟、鼠标移动、滚动）

- **遵守规则**:
  - 必须遵守 robots.txt
  - 必须遵守目标网站服务条款
  - 必须检测并响应封禁尝试

---

### 🔄 FastAPI 与 Celery 集成规则

#### 异步架构
- **FastAPI**: 使用 async/await 模式
- **Celery**: 使用多进程模式
- **集成要点**: 必须正确处理异步和同步执行模式的转换

#### WebSocket 通信
- 必须使用 WebSocket 实现实时反馈
- 支持实时进度更新（FR32）
- 支持错误实时报告（FR37）
- 管理大量并发 WebSocket 连接（最多 100 个用户）

---

### 🔒 数据安全和隐私规则

#### 加密和存储
- **本地存储**: 所有数据必须存储在本地 PostgreSQL（ADR-001）
- **数据加密**: 敏感数据使用 AES-256 加密
- **传输加密**: 使用 TLS 1.3 传输加密

#### 访问控制
- **RBAC**: 必须实现基于角色的访问控制（NFR11-NFR13）
- **MFA**: 必须支持多因素认证（NFR14）
- **审计日志**: 所有数据访问和操作必须记录审计日志（NFR12）

#### 合规要求
- **中国法规**:
  - 符合《中华人民共和国网络安全法》
  - 符合《中华人民共和国个人信息保护法》
  - 符合《中华人民共和国数据安全法》
- **国际法规**: 符合 GDPR（欧盟）和 CCPA（加州）

---

### 📁 代码组织规则

#### 后端架构（分层）
```
src/backend/
├── api/              # FastAPI 路由和端点
├── core/              # 核心配置和工具
│   ├── config.py      # 应用配置
│   ├── database.py     # 数据库会话
│   ├── celery_app.py  # Celery 应用
│   └── security.py    # 安全相关
├── models/            # SQLAlchemy ORM 模型
├── services/          # 业务逻辑层
│   ├── ai_service.py         # AI 服务
│   ├── crawler_service.py    # 爬虫服务
│   └── data_service.py       # 数据服务
├── tasks/             # Celery 异步任务
├── middleware/        # 中间件
└── utils/            # 工具函数
```

#### 命名约定
- **Python 文件**: `snake_case.py`
- **Python 类**: `PascalCase`
- **Python 函数**: `snake_case`
- **Python 变量**: `snake_case`
- **Python 常量**: `UPPERCASE`
- **数据库表**: `snake_case`（复数）
- **数据库列**: `snake_case`

---

### ⚡ 性能要求

#### 时间目标（NFR1-NFR7）
- **页面分析和数据提取**: 8 秒内完成（95th 百分位）
- **API 响应时间**: 200ms（95th 百分位）
- **模型配置**: 5 秒内完成
- **模型切换**: 5 秒内完成
- **自动回退**: 3 秒内完成

#### 并发目标
- **并发用户**: 100 个
- **并发任务**: 1,000 个
- **数据库连接池**: 最小 5 个连接
- **Redis 连接池**: 最小 10 个连接

---

### 🧪 测试规则

#### 测试结构
- **单元测试**: 使用 pytest
- **覆盖率目标**: > 80%
- **测试文件命名**: `test_*.py`
- **Mock 使用**: 必须 mock 外部依赖（AI API、网络请求）

#### 必须测试的场景
- AI 提供商切换和回退
- 浏览器实例池管理
- 数据加密和解密
- 反爬虫机制
- WebSocket 通信
- 权限和访问控制

---

### 🚫 禁止模式

#### 绝对禁止
1. **硬编码敏感信息**: API 密钥、密码等必须使用环境变量
2. **在前端直接调用数据库**: 必须通过 API 服务层
3. **忽略错误处理**: 必须实现全局错误处理中间件
4. **在全局作用域污染**: 使用局部变量
5. **不测试边界条件**: 测试所有可能的输入
6. **上传数据到云端**: 除非获得用户明确同意

#### 常见陷阱
- 在 FastAPI 路由中直接执行长时间操作 → 使用 Celery 异步任务
- 同步调用异步函数 → 使用 async/await
- 不关闭浏览器实例 → 使用上下文管理器
- 不实现超时处理 → 所有外部调用必须有超时
- 不验证用户输入 → 所有输入必须验证

---

### 📝 文档和注释规则

#### 代码注释
- **语言**: 使用中文注释和文档字符串
- **公共函数**: 必须有 docstring 说明参数和返回值
- **复杂逻辑**: 必须添加注释解释
- **TODO/FIXME**: 必须标记并后续处理

#### 文档要求
- **README.md**: 完整的项目说明和安装指南
- **API 文档**: 使用 OpenAPI 规范
- **架构文档**: 记录架构决策（ADR）

---

### 🎯 AI 准确率目标

#### 准确率要求
- **MVP 阶段**: 70-80%（NFR40）
- **Post-MVP 阶段**: 90-95%（NFR40）
- **自动适应**: 48-72 小时内适应网站结构变化（FR9）
- **置信度评分**: 必须提供 AI 决策的置信度评分（NFR44）

#### 人工审核
- 必须支持用户手动调整 AI 识别的数据字段（FR8）
- 必须从用户调整中学习（FR10）
- 必须提供人工审核流程

---

---

**最后更新：** 2026-04-23
**文档版本：** 2.0.0
**状态：** 已完成并优化

---

## 使用指南

**对于 AI 代理：**

- 实现代码前务必阅读此文件
- 严格遵循所有规则
- 有疑问时，选择更严格的选项
- 新模式出现时更新此文件

**对于开发者：**

- 保持文件精简，专注于代理需求
- 技术栈变更时更新
- 每季度审查过时规则
- 移除随时间变得明显的规则
