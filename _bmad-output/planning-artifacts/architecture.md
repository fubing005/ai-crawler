---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
workflowType: 'architecture'
lastStep: 9
status: 'complete'
completedAt: '2026-04-28'
inputDocuments:
  - product-brief-ai-crawler.md
  - product-brief-ai-crawler-distillate.md
  - prd.md
  - ux-design-specification.md
  - research/technical-playwright-integration-research-2026-04-18.md
workflowType: 'architecture'
project_name: 'vscode_bmad_method_test'
user_name: 'Shalabing'
date: '2026-04-28'
adrCount: 9
enhancements:
  - "添加 ADR-005: WebSocket 事件版本控制"
  - "添加 ADR-006: 三级界面状态管理"
  - "添加 ADR-007: 错误处理策略"
  - "添加 ADR-008: 离线架构模式"
  - "添加 ADR-009: 撤销/重做机制"
  - "更新 Gap Analysis: 所有 Important Gaps 已解决"
  - "更新 Requirements Coverage: 100% FR 覆盖（136 个 FR）"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Architecture Decision Records (ADRs)

本节记录架构设计决策，解释关键技术选择及其理由。

### ADR-001: 选择 PostgreSQL 作为数据库

**状态**: 已接受

**背景**:
- PRD 要求本地部署满足 GDPR、CCPA、中国网络安全法等合规要求
- 爬虫数据包含半结构化内容（网页 HTML、提取字段、元数据）
- 需要支持按数据源组织存储
- Python 生态首选数据库

**决策**: 使用 PostgreSQL 15.x 作为主数据库

**理由**:
1. **本地部署合规**: 支持本地安装和部署，满足数据不出境要求
2. **JSON 数据类型**: 原生支持 `jsonb` 存储，适合网页半结构化数据
3. **Full-Text 搜索**: 内置全文搜索功能，便于数据检索
4. **事务完整性**: ACID 保证，确保爬取事务数据一致性
5. **Python 生态**: `asyncpg`、`SQLAlchemy 2.0` 支持良好
6. **开源免费**: 无商业许可成本

**替代方案及拒绝理由**:
- **SQLite**: 缺少并发写入支持，不适合多用户场景
- **MySQL/MariaDB**: JSON 支持不如 PostgreSQL 完善
- **MongoDB**: 事务支持较弱，ACID 保证不完善

**影响范围**:
- Epic 3: 数据管理 & 导出
- Epic 5: 数据导出
- Epic 6: 安全与合规
- 所有数据访问层（SQLAlchemy 模型）

**实施位置**:
- 数据库连接配置: `backend/app/core/database.py`
- 模型定义: `backend/app/api/v1/models/`
- 迁移脚本: `backend/alembic/versions/`

### ADR-002: AI 提供商配置包含技术名称

**背景**:
- PRD 要求支持 8 个 AI 提供商（Ollama、OpenAI、Anthropic 等）
- 不同提供商有不同 API 格式和认证方式
- 用户需要明确选择和使用特定模型

**决策**: FRs 中明确列出所有 AI 提供商名称

**理由**:
- 这是**能力定义**而非实现细节泄露
- 用户需要知道支持哪些具体提供商
- 各提供商有不同的 API 配置要求（API Key、Base URL 等）

**技术约束说明**:
- FR12: `Users can add local model providers (Ollama)` - 明确本地提供商
- FR13: `Users can add cloud model providers (OpenAI, Anthropic, Qwen, Doubao, GLM, Google Gemini)` - 明确云端提供商

**影响范围**:
- Epic 7: AI 模型集成
- AI 提供商抽象层: `backend/app/services/ai_service.py`

### ADR-003: 部署选项包含具体工具

**背景**:
- 用户需要灵活的部署方式
- 不同用户有不同的基础设施偏好
- MVP 阶段需要提供主流部署选项

**决策**: FRs 中明确列出 Docker、Docker Compose、Kubernetes 部署选项

**理由**:
- 这是**部署能力**定义，允许用户选择合适的部署方式
- 不同工具有不同的使用场景：
  - Docker: 适合单机快速部署
  - Docker Compose: 适合本地开发和小规模部署
  - Kubernetes: 适合云原生和大规模部署

**技术约束说明**:
- FR70: `Users can deploy the application using Docker`
- FR71: `Users can deploy the application using Docker Compose`
- FR72: `Users can deploy the application using Kubernetes`

**影响范围**:
- Epic 8: 桌面部署 & 系统集成
- 部署脚本和文档

### ADR-004: 集成选项列出具体系统

**背景**:
- 数据工程师需要将爬取结果集成到现有数据处理管道
- 不同组织使用不同的数据仓库和消息队列
- 明确支持的工具范围有助于用户评估兼容性

**决策**: FRs 中列出具体的数据仓库、流处理工具、可视化工具

**理由**:
- 这是**集成能力**定义，描述用户期望的集成目标
- 用户需要知道支持哪些工具才能评估适用性
- 这些是主流工具，代表技术类别而非强制选择

**技术约束说明**:
- FR78: `Users can load crawling data into data warehouses (Snowflake, BigQuery, Redshift)` - 数据仓库类别
- FR79: `Users can integrate real-time data streams into Kafka or Kinesis` - 消息队列类别
- FR82: `Users can import data directly into Tableau` - 可视化工具类别

**影响范围**:
- Epic 5: 数据管理 & 导出
- 数据导出接口: `backend/app/api/v1/crawl_results.py`

### ADR-005: WebSocket 事件版本控制

**状态**: 已接受

**背景**:
- 实时进度同步依赖 WebSocket 事件
- 事件格式可能随产品迭代而变更
- 需要向后兼容性保证

**决策**: 使用 Header 进行版本控制，MVP 使用 v1

**理由**:
- Header 版本控制避免 URL 破坏性变更
- MVP 阶段保持简单，v1 足够使用
- 客户端可检测版本不兼容

**技术实现**:
- Header 格式: `X-Event-Version: v1`
- 破坏性变更: 升级到 v2，客户端需支持
- 实施位置: `backend/app/api/v1/websocket/__init__.py`

**影响范围**:
- Epic 3: 任务调度
- Epic 4: 实时更新

### ADR-006: 三级界面状态管理

**状态**: 已接受

**背景**:
- PRD 要求三级界面策略（简洁/仪表板/专业）
- UX 设计规范要求满足所有用户类型：非技术用户、数据工程师、开发者
- 不同视图需要不同的状态管理策略
- 确保状态同步和一致性

**决策**: 使用 Pinia stores 分离视图状态 + WebSocket 同步 + 用户偏好存储

**理由**:
- 简洁视图：最小化状态，本地存储，聚焦核心操作
- 仪表板视图：实时进度，WebSocket 监听，任务管理
- 专业视图：缓存 + WebSocket + IndexedDB，精确控制和批量操作
- 用户偏好存储：记住用户选择的视图偏好

**技术实现**:
- **Pinia stores 按视图分离**: `useCrawlStore`, `useUiStore`, `useUserStore`, `useOfflineStore`
- **WebSocket 事件统一分发到对应 stores**: 实时进度同步
- **IndexedDB 用于专业视图离线缓存**: 支持离线浏览
- **用户偏好存储**: LocalStorage 存储视图偏好
- **视图切换组件**: ViewSwitcher 组件管理视图切换

**三级视图策略**:

**简洁视图（默认）**:
- **设计基础**: 简洁聚焦式
- **目标用户**: 非技术用户、首次用户
- **状态管理**: 最小化状态，本地存储
- **核心功能**: 聚焦核心操作，零代码体验
- **信息密度**: 低密度，突出核心操作
- **特点**: 
  - 大搜索框居中，类似搜索引擎体验
  - 提供 2-3 个示例网址供快速体验
  - 收起式左侧栏，悬停展开
  - 80% 用户在第一周内成功爬取至少一个网站

**仪表板视图**:
- **设计基础**: 卡片仪表板式
- **目标用户**: 数据工程师、有经验用户
- **状态管理**: 实时进度，WebSocket 监听
- **核心功能**: 任务监控、数据预览、快速访问
- **信息密度**: 中等密度，平衡信息和操作
- **特点**:
  - 实时状态和统计
  - 查看所有运行和完成的任务
  - 常用功能一键可达
  - 数据可视化优先

**专业视图（开发者模式）**:
- **设计基础**: 紧凑专业式
- **目标用户**: 开发者、高级用户
- **状态管理**: 缓存 + WebSocket + IndexedDB
- **核心功能**: 精确控制、批量操作、高级配置
- **信息密度**: 高密度，最大化信息展示
- **特点**:
  - 一屏展示更多信息，效率优先
  - 支持批量爬取和导出
  - 工具栏快速访问功能
  - 详细配置面板，所有选项可见

**视图切换实现**:
- **视图切换器**: ViewSwitcher 组件，支持在简洁、仪表板、专业视图之间切换
- **用户偏好存储**: LocalStorage 存储用户选择的视图偏好
- **状态同步**: WebSocket 事件统一分发到对应 stores
- **无缝切换**: 视图切换时保持状态一致性

**实施位置**:
- 前端: `frontend/src/stores/crawl.js` (爬取状态管理)
- 前端: `frontend/src/stores/ui.js` (UI 状态管理)
- 前端: `frontend/src/stores/user.js` (用户状态管理)
- 前端: `frontend/src/stores/offline.js` (离线状态管理)
- 前端: `frontend/src/components/ViewSwitcher.vue` (视图切换器)
- 前端: `frontend/src/views/SimpleView.vue` (简洁视图)
- 前端: `frontend/src/views/DashboardView.vue` (仪表板视图)
- 前端: `frontend/src/views/ProfessionalView.vue` (专业视图)

**影响范围**:
- Epic 4: 用户界面 & 交互
- `frontend/src/stores/`
- `frontend/src/views/`

### ADR-007: 错误处理策略

**状态**: 已接受

**背景**:
- AI 分析、网络请求、浏览器操作都可能失败
- 用户需要清晰的错误信息和可操作的恢复步骤
- 系统需要区分用户错误和系统错误

**决策**: 统一错误码体系 + 分类错误处理 + 友好用户消息

**理由**:
- 统一错误码便于追踪和调试
- 分类错误处理（AI、网络、数据库、验证）
- 用户友好消息 vs 技术日志分离

**技术实现**:
- 错误码体系：4xxxx（客户端）+ 5xxxx（服务端）
- 全局异常处理器：`app.exception_handler`
- 前端全局拦截：`axios.interceptors`

**影响范围**:
- 所有 Epic
- `backend/app/core/errors.py` + `frontend/src/api/client.js`

### ADR-008: 离线架构模式

**状态**: 已接受

**背景**:
- PRD 要求支持离线查看历史记录（FR132, FR133, FR134）
- UX 设计规范要求完整的离线模式支持，确保用户在网络不稳定或无网络环境下仍能使用系统的核心功能
- 需要保证离线状态下的数据一致性和用户体验

**决策**: 三层离线策略 + IndexedDB 本地存储 + 网络状态检测 + 状态持久化

**理由**:
- IndexedDB 提供大容量本地存储（适合历史数据缓存）
- 网络状态检测实现自动离线/在线模式切换
- 离线队列保证网络恢复后自动执行任务
- 本地数据访问支持离线浏览、搜索、筛选
- 状态持久化确保应用关闭后离线状态和队列能够恢复

**技术实现**:
- **网络状态检测**: `navigator.onLine` + `window.addEventListener('online'/'offline')`
- **离线存储**: IndexedDB 存储历史任务、数据、配置
- **离线队列**: 本地队列存储待执行任务，网络恢复后自动提交
- **状态同步**: 网络恢复时自动同步最新数据
- **离线数据导出**: 支持导出本地数据为 JSON/CSV/Excel 格式
- **状态持久化**: 离线状态和队列在应用关闭后保存，下次启动时恢复

**三层离线策略**:
1. **离线模式检测**: 自动检测网络状态，无缝切换在线/离线模式
2. **离线数据访问**: 支持浏览、搜索、筛选本地历史数据
3. **离线任务队列**: 网络断开时任务排队，网络恢复后自动执行

**离线模式特性**:
- **自动检测**: 系统自动检测网络状态，无缝切换在线/离线模式
- **离线数据访问**: 支持浏览、搜索、筛选本地数据库中的历史数据
- **离线数据导出**: 支持导出本地数据为 JSON/CSV/Excel 格式
- **离线任务队列**: 网络断开时创建的任务自动加入队列，网络恢复后自动执行
- **状态持久化**: 离线状态和队列在应用关闭后保存，下次启动时恢复
- **清晰提示**: 界面明确标注"离线模式"状态，显示最后同步时间和队列任务数

**离线模式限制**:
- 创建新爬取任务需要网络连接（除非使用本地 AI 模型如 Ollama）
- AI 页面分析需要网络连接（除非使用本地 AI 模型）
- 社区功能（模板分享、下载）需要网络连接

**离线模式 UX 设计**:
- **状态指示器**: 顶部显示"离线模式"徽章，颜色区分（灰色=离线，蓝色=在线）
- **最后同步时间**: 显示"最后同步: 10分钟前"，让用户知道数据新鲜度
- **队列计数**: 显示"离线队列: 3个任务"，让用户知道待处理任务
- **功能禁用**: 需要网络的功能显示为禁用状态，悬停时显示"此功能需要网络连接"
- **同步提示**: 网络恢复时显示"网络已恢复，已切换到在线模式"通知

**实施位置**:
- 前端: `frontend/src/utils/offline.js` (网络状态检测)
- 前端: `frontend/src/utils/storage.js` (IndexedDB 封装)
- 前端: `frontend/src/stores/offline.js` (离线状态管理)
- 前端: `frontend/src/components/OfflineModeIndicator.vue` (离线模式状态显示)
- 前端: `frontend/src/components/OfflineQueueManager.vue` (离线队列管理)
- 前端: `frontend/src/components/OfflineDataBrowser.vue` (离线数据访问)
- 前端: `frontend/src/components/NetworkStatusMonitor.vue` (网络状态监控)
- 后端: `backend/app/api/v1/offline.py` (离线队列管理)

**影响范围**:
- Epic 3: 爬取任务管理 (Story 3.7 - 离线任务队列管理)
- Epic 4: 用户界面 & 交互 (离线模式 UI)
- Epic 5: 数据管理 & 导出 (Story 5.8 - 离线数据访问)
- Epic 8: 桌面部署与系统集成 (Story 8.5 - 离线模式支持)

### ADR-009: 撤销/重做机制

**状态**: 已接受

**背景**:
- PRD 要求支持撤销配置更改（FR135）和恢复误删的任务（FR136）
- UX 设计规范要求提供可逆的操作体验，减少误操作风险
- 用户需要撤销/重做功能来建立操作的安全感

**决策**: 命令模式 + 历史栈 + 软删除机制 + 键盘快捷键支持

**理由**:
- 命令模式封装操作，支持撤销/重做
- 历史栈记录操作序列，可回溯到任意状态
- 软删除机制提供恢复窗口（30天）
- 限制历史栈大小防止内存溢出
- 键盘快捷键提升操作效率

**技术实现**:
- **配置撤销**: 最多撤销 10 次配置更改，使用命令模式
- **任务恢复**: 软删除机制，30 天恢复窗口
- **历史栈**: 使用栈结构存储操作命令
- **状态快照**: 关键操作前保存状态快照
- **键盘快捷键**: Ctrl+Z 撤销，Ctrl+Y 重做（Windows/Linux），Cmd+Z 撤销，Cmd+Shift+Z 重做（macOS）
- **撤销历史记录**: 提供撤销历史记录界面，支持选择性恢复
- **错误处理**: 撤销失败时显示错误原因和替代方案

**配置撤销实现**:
```javascript
// 命令模式示例
class ConfigCommand {
  constructor(oldConfig, newConfig) {
    this.oldConfig = oldConfig
    this.newConfig = newConfig
    this.timestamp = new Date()
    this.description = `配置更改: ${this.getDescription()}`
  }

  execute() {
    applyConfig(this.newConfig)
  }

  undo() {
    applyConfig(this.oldConfig)
  }

  getDescription() {
    // 生成操作描述
    return "AI 模型配置"
  }
}

// 历史栈管理
const configHistory = []
const MAX_HISTORY = 10

function executeConfigCommand(command) {
  command.execute()
  configHistory.push(command)
  if (configHistory.length > MAX_HISTORY) {
    configHistory.shift()
  }
  showUndoNotification(command.description)
}

function undoConfig() {
  const command = configHistory.pop()
  if (command) {
    try {
      command.undo()
      showSuccessNotification("已恢复到操作前的状态")
      return true
    } catch (error) {
      showErrorNotification(`无法撤销: ${error.message}`)
      // 提供替代方案
      showAlternativeSolution(error)
      return false
    }
  }
  return false
}

function redoConfig() {
  // 重做逻辑
}
```

**任务恢复实现**:
- **软删除**: 标记 `deleted_at` 字段而非物理删除
- **恢复窗口**: 30 天后自动清理软删除记录
- **回收站**: 提供回收站界面查看和恢复已删除任务
- **选择性恢复**: 支持从历史记录中选择性恢复特定操作

**撤销/重做 UX 设计要点**:
- **撤销提示**: 操作后显示"已保存配置 - 撤销"提示，3秒后自动消失
- **撤销按钮**: 工具栏提供撤销/重做按钮，显示可用状态
- **快捷键支持**: Ctrl+Z 撤销，Ctrl+Y 重做（Windows/Linux），Cmd+Z 撤销，Cmd+Shift+Z 重做（macOS）
- **回收站**: 删除的任务移动到回收站，显示"已删除 - 恢复"提示
- **恢复窗口**: 任务删除后30天内可恢复，显示"30天后自动清理"
- **历史记录**: 提供撤销历史记录界面，显示操作时间、类型、描述
- **选择性恢复**: 支持从历史记录中选择性恢复特定操作
- **错误提示**: 撤销失败时显示"无法撤销: [原因]"和替代方案

**实施位置**:
- 前端: `frontend/src/stores/config.js` (配置历史栈)
- 前端: `frontend/src/stores/tasks.js` (任务软删除)
- 前端: `frontend/src/components/UndoRedoToolbar.vue` (撤销/重做工具栏)
- 前端: `frontend/src/components/UndoHistoryPanel.vue` (撤销历史记录)
- 前端: `frontend/src/components/RecycleBin.vue` (任务删除恢复)
- 后端: `backend/app/api/v1/config.py` (配置撤销 API)
- 后端: `backend/app/api/v1/crawl_tasks.py` (任务恢复 API)
- 数据库: `crawl_tasks.deleted_at` 字段 (软删除标记)

**影响范围**:
- Epic 3: 爬取任务管理 (Story 3.8 - 任务删除撤销功能)
- Epic 4: 用户界面 & 交互 (Story 4.11 - 配置撤销功能)

---

## Component Strategy & Implementation Roadmap

### Component System Overview

**Design System Choice**: Naive UI

**Platform Context**: Electron desktop application (Vue.js frontend)

**Core Goal**: Ensure long-term iteration capability for feature enhancements

### Component Strategy

**Naive UI Available Components**:

Basic UI Components:
- Button (various variants: primary, secondary, text, quaternary)
- Input/InputGroup
- Select
- Card
- List/ListItem
- DataTable/Tree
- Progress/ProgressCircle/Bar
- Steps/Step
- Notification/Message
- Modal/Dialog
- Tabs/TabPane
- Menu/MenuItem
- Dropdown
- Tooltip
- Popover
- Form/FormValidation
- Switch
- Checkbox/Radio
- TreeSelect/Cascader
- DynamicTags
- Statistic/CountTo
- Badge/Tag
- Drawer/Sider
- Collapse/CollapseItem
- Timeline
- Result (empty state, error state)
- Avatar
- Pagination
- Spin
- Skeleton
- BackTop
- Anchor
- Affix
- VirtualList

**Component Gap Analysis**:

1. **Gap 1** - AI Analysis Progress Component: Naive UI Progress is suitable for basic progress, but lacks detailed step display, estimated time, and current data source name
2. **Gap 2** - Field Selection List Component: Naive UI DataTable does not support inline editing, confidence display, batch selection, and field type icons
3. **Gap 3** - First-Time Wizard Component: Naive UI Steps needs extension to support example URLs, configuration suggestions, and contextual help
4. **Gap 4** - Smart URL Input Component: Naive UI AutoComplete does not support history, example selection, smart suggestions, and validation status
5. **Gap 5** - Celebration Animation Component: Naive UI does not provide confetti effects, data statistics display, and achievement animations

### Custom Components

#### AIAnalysisProgress

**Purpose**: Display real-time progress of AI page structure analysis

**Use Cases**: AI analysis phase in first crawl, regular crawl, batch crawl

**Structure**: Progress bar + percentage + current step text + estimated time + cancel button

**States**: default (analyzing), success (completed), error (failed), warning (warning)

**Variants**: compact (sidebar), detailed (main interface)

**Accessibility**: `role="progressbar"` + ARIA values + state change notifications

**Implementation Location**: `frontend/src/components/AIAnalysisProgress.vue`

---

#### FieldSelectionList

**Purpose**: Display list of fields identified by AI, support selection and correction

**Use Cases**: After AI analysis completes, user selects fields to extract

**Structure**: Field name + preview value + confidence + type icon + checkbox + edit button

**States**: selected (checked), unselected (unchecked), editing (being edited), loading (validating)

**Variants**: compact (compact), detailed (detailed), inline (inline editing)

**Accessibility**: Unique ID + ARIA labels + keyboard navigation + selection state

**Implementation Location**: `frontend/src/components/FieldSelectionList.vue`

---

#### DataPreviewTable

**Purpose**: Display crawl result preview, support editing, filtering, sorting

**Use Cases**: View and edit data after crawl completion

**Structure**: Data table + table header + table content + row operations + field status icons

**States**: default (normal), editing (being edited), loading (loading), empty (empty state)

**Variants**: compact (compact), standard (standard), expanded (expanded), card (card view)

**Accessibility**: Semantic table elements + sort status + keyboard navigation

**Implementation Location**: `frontend/src/components/DataPreviewTable.vue`

---

#### FirstTimeWizard

**Purpose**: Guide new users through first-time configuration and first crawl

**Use Cases**: First application launch

**Structure**: Step indicator + welcome page + configuration steps + example URLs + progress display

**States**: active (current step), completed (completed), disabled (disabled)

**Variants**: minimal (minimal), detailed (detailed)

**Accessibility**: ARIA labels + current step indicator + keyboard navigation + form labels

**Implementation Location**: `frontend/src/components/FirstTimeWizard.vue`

---

#### BatchCrawlConfig

**Purpose**: Configure batch crawl tasks

**Use Cases**: Batch crawling multiple websites

**Structure**: URL input area + URL list + global configuration + AI model selection + start button

**States**: valid (valid), invalid (invalid), pending (waiting for validation)

**Variants**: modal (dialog), page (page), embedded (embedded)

**Accessibility**: Input labels + validation status + error descriptions

**Implementation Location**: `frontend/src/components/BatchCrawlConfig.vue`

---

#### TaskMonitorPanel

**Purpose**: Display real-time status of multiple tasks

**Use Cases**: Batch crawl, background task monitoring

**Structure**: Task list + overall progress + resource usage + task logs (expandable)

**States**: running (running), completed (completed), failed (failed), waiting (waiting), paused (paused)

**Variants**: compact (compact), detailed (detailed), dashboard (dashboard)

**Accessibility**: Status icon labels + progress bar ARIA attributes

**Implementation Location**: `frontend/src/components/TaskMonitorPanel.vue`

---

#### CelebrationAnimation

**Purpose**: Celebration effect for first success, batch success

**Use Cases**: First crawl success, batch task all success

**Structure**: Confetti/fireworks animation + data statistics + success message + action buttons

**States**: playing (playing), paused (paused), completed (completed)

**Variants**: mini (small size), full (large size)

**Accessibility**: Animation disable support + ARIA live notifications

**Implementation Location**: `frontend/src/components/CelebrationAnimation.vue`

---

#### SmartURLInput

**Purpose**: Smart input box supporting URL validation, example selection, history

**Use Cases**: All scenarios requiring URL input

**Structure**: Input box + example URLs + history dropdown + validation status indicator

**States**: empty (empty), valid (valid), invalid (invalid), loading (validating)

**Variants**: standalone (standalone), compact (compact), with-suggestions (with suggestions)

**Accessibility**: Input labels + validation status descriptions + listbox ARIA attributes

**Implementation Location**: `frontend/src/components/SmartURLInput.vue`

---

#### ErrorHandlingDialog

**Purpose**: Display errors and provide executable actions

**Use Cases**: All error scenarios

**Structure**: Error type icon + error description + error code + impact scope + executable action list

**States**: error (error), warning (warning), info (info)

**Variants**: modal (dialog), inline (inline), fullscreen (fullscreen)

**Accessibility**: Dialog role + ARIA live notifications + focus management

**Implementation Location**: `frontend/src/components/ErrorHandlingDialog.vue`

---

#### ViewSwitcher

**Purpose**: Switch between simple, dashboard, professional views

**Use Cases**: All view scenarios

**Structure**: View button group + selected state indicator + view description (tooltip)

**States**: active (selected), inactive (unselected)

**Variants**: compact (compact button), labeled (with labels)

**Accessibility**: Button group role + selected state + label descriptions

**Implementation Location**: `frontend/src/components/ViewSwitcher.vue`

---

#### OfflineModeIndicator

**Purpose**: Display current network status and offline mode information

**Use Cases**: All interfaces, when network status changes

**Structure**: Status badge + network status icon + last sync time + offline queue count

**States**: online (online), offline (offline), syncing (syncing)

**Variants**: compact (compact), detailed (detailed), banner (banner)

**Accessibility**: Status change ARIA live notifications + status descriptions

**Implementation Location**: `frontend/src/components/OfflineModeIndicator.vue`

---

#### OfflineQueueManager

**Purpose**: Manage tasks in offline queue

**Use Cases**: Offline mode, after network recovery

**Structure**: Queue task list + queue statistics + execution control + task details

**States**: idle (idle), executing (executing), paused (paused), completed (completed)

**Variants**: modal (dialog), panel (panel), drawer (drawer)

**Accessibility**: List role + task status labels + keyboard navigation

**Implementation Location**: `frontend/src/components/OfflineQueueManager.vue`

---

#### OfflineDataBrowser

**Purpose**: Browse, search, filter local database historical data

**Use Cases**: Offline mode, data management

**Structure**: Data table + search box + filter + pagination + export button

**States**: loading (loading), loaded (loaded), empty (empty), error (error)

**Variants**: compact (compact), standard (standard), full (full)

**Accessibility**: Table semantics + search labels + filter status descriptions

**Implementation Location**: `frontend/src/components/OfflineDataBrowser.vue`

---

#### NetworkStatusMonitor

**Purpose**: Monitor network status and automatically switch online/offline mode

**Use Cases**: Application launch, network status changes

**Structure**: Network detection + status switching + notification display + queue execution

**States**: monitoring (monitoring), switching (switching), stable (stable)

**Variants**: background (background), visible (visible)

**Accessibility**: Status change ARIA live notifications + network status descriptions

**Implementation Location**: `frontend/src/components/NetworkStatusMonitor.vue`

---

#### UndoRedoToolbar

**Purpose**: Provide toolbar for undo/redo operations

**Use Cases**: Configuration changes, task deletion, data modification

**Structure**: Undo button + redo button + history button + shortcut hints

**States**: enabled (available), disabled (disabled)

**Variants**: compact (compact), labeled (with labels), icon-only (icon only)

**Accessibility**: Button group role + available status + shortcut hints

**Implementation Location**: `frontend/src/components/UndoRedoToolbar.vue`

---

#### UndoHistoryPanel

**Purpose**: Display undo history, support selective recovery

**Use Cases**: View undo history, selective recovery of operations

**Structure**: History list + operation details + recovery button + clear button

**States**: empty (empty), populated (has records), loading (loading)

**Variants**: modal (dialog), drawer (drawer), panel (panel)

**Accessibility**: List role + operation type labels + keyboard navigation

**Implementation Location**: `frontend/src/components/UndoHistoryPanel.vue`

---

#### RecycleBin

**Purpose**: Display deleted tasks, support recovery

**Use Cases**: After task deletion, recover deleted tasks

**Structure**: Deleted task list + recovery button + permanent delete button + clear button

**States**: empty (empty), populated (has records), expiring (about to expire)

**Variants**: modal (dialog), page (page), drawer (drawer)

**Accessibility**: List role + recovery window hint + keyboard navigation

**Implementation Location**: `frontend/src/components/RecycleBin.vue`

---

### Component Implementation Strategy

**Design Token Consistency**:

- All custom components use Naive UI theme variables (colors, spacing, fonts)
- Follow Naive UI component conventions and interaction patterns
- Maintain visual consistency with Naive UI

**Accessibility First**:

- All components support keyboard navigation
- All interactive elements have clear focus states
- All dynamic content changes notify screen readers via ARIA live
- Color contrast meets WCAG 2.1 AA standards

**Performance Optimization**:

- DataPreviewTable supports virtual scrolling for large datasets
- TaskMonitorPanel uses debouncing for real-time updates
- CelebrationAnimation uses GPU-accelerated animations

**Progressive Enhancement**:

- Basic functionality available in all browsers
- Advanced features enabled in supporting browsers
- Animations and transitions can be disabled via system preferences

---

### Implementation Roadmap

**Phase 1 - Core Components (MVP)**:

1. **SmartURLInput** - First-time journey, regular crawl journey
2. **FirstTimeWizard** - First-time journey
3. **AIAnalysisProgress** - All crawl journeys
4. **FieldSelectionList** - Regular crawl journey
5. **NetworkStatusMonitor** - Network status monitoring (offline mode foundation)
6. **OfflineModeIndicator** - Offline mode status display

**Phase 2 - Support Components (MVP+)**:

7. **DataPreviewTable** - Regular crawl, data management
8. **TaskMonitorPanel** - Batch crawl
9. **ErrorHandlingDialog** - All journeys
10. **ViewSwitcher** - All views
11. **OfflineDataBrowser** - Offline data access
12. **OfflineQueueManager** - Offline queue management
13. **UndoRedoToolbar** - Undo/redo operations

**Phase 3 - Enhancement Components (Post-MVP)**:

14. **BatchCrawlConfig** - Batch crawl
15. **CelebrationAnimation** - First success, batch success
16. **UndoHistoryPanel** - Undo history records
17. **RecycleBin** - Task deletion recovery
18. Performance optimization and feature enhancements

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

**Functional Requirements:**

AI 页面结构学习与数据提取是核心功能，要求达到 70-80%（MVP）至 90-95%（Post-MVP）的准确率。系统需提供零代码体验，用户只需输入网址即可获得结构化数据。

**关键技术架构需求：**
- 多 AI 提供商支持：本地 Ollama + 云端 OpenAI/Anthropic/Qwen/Doubao/GLM/Google/Custom
- 统一抽象层：3 秒超时自动回退机制
- 浏览器自动化：Playwright v1.51.0，Worker Pool 模式
- 任务调度：Celery 异步任务队列
- 三级界面策略：简洁视图（新手）→ 仪表板视图（数据工程师）→ 专业视图（开发者）

**数据管理需求：**
- 本地 PostgreSQL 存储（满足合规性要求）
- 数据导出：JSON、CSV、Excel
- 按数据源组织存储
- 支持数据预览、搜索、过滤
- 离线数据访问：支持离线浏览、搜索、筛选本地数据（FR133）

**离线功能需求：**
- 离线模式支持：自动检测网络状态，切换离线/在线模式（FR132）
- 离线任务队列：网络断开时任务排队，网络恢复后自动执行（FR134）
- 离线数据访问：支持离线查看已爬取的历史数据（FR133）

**撤销/恢复需求：**
- 配置撤销：最多撤销 10 次配置更改（FR135）
- 任务恢复：软删除机制，30 天恢复窗口（FR136）

**Non-Functional Requirements:**

**性能要求：**
- 页面分析时间：< 8 秒（95th percentile）
- 支持 100 并发用户
- 每个浏览器实例：100-200MB 内存
- 支持 10-20 并发浏览器上下文

**准确率要求：**
- MVP 阶段：70-80%，提供人工审核和修正
- Post-MVP 阶段：90-95%
- AI 自适应：网站结构变化后 48-72 小时内自动适应

**合规性要求：**
- GDPR、CCPA、中国网络安全法、个人信息保护法
- 数据本地存储（境内）
- 敏感数据加密（AES-256）
- 传输加密（TLS 1.3）
- 审计日志（保留 90 天）

**可访问性要求：**
- WCAG 2.1 AA 标准
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式支持

**Scale & Complexity:**

- Primary domain: 桌面应用 + 后端 API + AI 集成
- Complexity level: **中等偏高**
- Estimated architectural components: 8-10 个主要组件

**复杂度驱动因素：**
- ✅ AI 技术集成（多提供商、自动回退）
- ✅ 跨平台桌面应用（Electron）
- ✅ 复杂状态管理（前端三级视图 + 后端任务进度）
- ✅ 严格合规性要求（四套法规）
- ✅ 实时同步需求（WebSocket 进度事件）
- ✅ 浏览器资源管理（Worker Pool 模式）

### Technical Constraints & Dependencies

**强制技术栈：**
- 后端：Python 3.10+ + FastAPI 0.100+ + SQLAlchemy 2.0+
- 任务队列：Celery 5.3+ + Redis 7.x
- 浏览器自动化：Playwright v1.51.0（固定版本）
- 数据库：PostgreSQL 15.x（本地部署）
- 前端：Vue.js + Naive UI
- 桌面框架：Electron

**关键约束：**
- 本地部署（非云端、非 SaaS）
- 数据不离开用户机器
- Playwright 必须使用 Worker Pool 模式
- 支持离线查看历史记录（核心爬取需在线）

**依赖关系：**
- FastAPI ← Playwright（异步集成）
- Celery ← Playwright（任务执行）
- Vue.js ← Naive UI（设计系统）
- Electron ← Vue.js（桌面打包）

### Cross-Cutting Concerns Identified

**1. AI 模型管理**
- 多提供商统一抽象接口
- 自动回退机制（3 秒超时）
- API Key 安全管理（加密存储）
- 成本控制（用量跟踪）

**2. 反爬虫机制**
- 请求频率控制
- User-Agent 轮换
- 随机延迟
- 验证码识别（Post-MVP）

**3. 数据隐私与合规**
- 本地存储保证
- 敏感数据识别和标记
- 用户同意管理
- 数据删除和导出

**4. 实时进度同步**
- WebSocket 事件推送
- 三级视图状态同步
- 离线状态处理

**5. 错误处理与恢复**
- AI 分析失败处理
- 网络错误重试
- 浏览器崩溃恢复
- 友好错误信息

**6. 性能与资源管理**
- Worker Pool 浏览器实例复用
- 虚拟滚动（大数据集）
- 内存泄漏防护
- 资源使用监控

**7. 离线功能管理**
- 网络状态检测和自动切换
- IndexedDB 本地数据存储
- 离线任务队列管理
- 离线/在线数据同步

**8. 撤销/恢复机制**
- 配置更改撤销（命令模式）
- 任务软删除和恢复
- 历史栈管理
- 状态快照和回滚
## Core Architectural Decisions (PRD 明确的技术选择)

### 决策优先级分析

**Critical Decisions (阻塞实施):**
- 无 - PRD 已明确所有关键技术选择

**Important Decisions (塑造架构):**
- 所有架构决策已由 PRD 确定

**Deferred Decisions (Post-MVP):**
- 验证码识别服务
- 社区分享和模板市场
- 高级反爬虫策略（IP 池、行为模拟）

### 数据架构

**数据库选择：** PostgreSQL 15.x
- **版本：** 15.x（本地部署，PRD 明确要求）
- **理由：** 本地部署合规要求 + JSON 数据类型支持 + Full-Text 搜索能力
- **影响：** Epic 3 (数据管理 & 导出), Epic 5 (数据导出)

**数据模型策略：** 按数据源组织
- **方案：** `data_source_id` 作为主键，每个数据源独立表
- **理由：** PRD 要求按数据源组织存储，便于管理和查询
- **影响：** Epic 2 (AI 页面分析), Epic 3 (爬取任务管理)

**验证策略：** AI 准确率 < 95% 时触发人工审核
- **方案：** AI 提取后计算置信度，< 95% 标记为"需人工审核"
- **理由：** MVP 70-80% 准确率目标，需要人机协同
- **影响：** Epic 4 (用户界面 - 简洁视图), Epic 6 (安全与合规)

### AI 模型管理

**提供商抽象层：** 统一接口策略
- **版本：** FastAPI 0.100+ 异步实现
- **方案：**
  ```python
  # 伪代码 - 抽象接口
  class AIProvider(ABC):
      async def analyze_page(self, html: str) -> PageAnalysis: ...
      async def get_model(self) -> str: ...
  
  class OpenAIProvider(AIProvider): ...
  class OllamaProvider(AIProvider): ...
  ```
- **理由：** 支持 8 个提供商（Ollama、OpenAI、Anthropic、Qwen、Doubao、GLM、Google、Custom）
- **影响：** Epic 7 (AI 模型集成)

**自动回退机制：** 3 秒超时切换
- **方案：** asyncio.wait_for(..., timeout=3.0) 包装所有 AI 调用
- **理由：** PRD 明确要求 3 秒超时自动回退
- **影响：** Epic 2 (AI 页面分析), Epic 7 (AI 模型集成)

**API Key 安全存储：** 加密存储
- **方案：** 系统密钥环（Windows DPAPI/macOS Keychain/Linux Secret Service）
- **理由：** 本地部署，必须保护敏感信息
- **影响：** Epic 1 (用户认证 & 系统配置), Epic 6 (安全与合规)

### 前端架构

**状态管理：** 三级视图 + WebSocket 同步
- **版本：** Vue.js 3.4+ Composition API
- **方案：**
  - 简洁视图：只存储本地状态
  - 仪表板视图：WebSocket 监听进度事件
  - 专业视图：WebSocket + 本地缓存（IndexedDB）
- **理由：** PRD 要求三级界面策略 + 实时进度同步
- **影响：** Epic 4 (用户界面 & 交互)

**WebSocket 通信：** 进度事件推送
- **版本：** FastAPI WebSocket + native WebSocket API
- **方案：** `/ws/progress/{task_id}` 端点推送爬取进度
- **理由：** 实时同步爬取状态到仪表板/专业视图
- **影响：** Epic 3 (任务调度), Epic 4 (实时更新)

**离线支持：** IndexedDB 历史记录缓存
- **方案：** 前端 IndexedDB 存储历史记录，离线可查看
- **理由：** PRD 要求支持离线查看历史记录
- **影响：** Epic 4 (离线功能)

### 浏览器自动化

**Worker Pool 模式：** 浏览器实例复用
- **版本：** Playwright v1.51.0 + Celery 5.3+
- **方案：**
  ```python
  # Celery worker 配置
  worker_pool_size = 10-20  # 可配置
  browser_per_worker = 1
  ```
- **理由：** PRD 明确要求 Worker Pool 模式，每个实例 100-200MB
- **影响：** Epic 2 (AI 页面分析), Epic 3 (任务调度)

**资源清理策略：** 防内存泄漏
- **方案：** 任务完成后显式 `await browser.close()`，定期清理未使用实例
- **理由：** 长期运行必须防止内存泄漏
- **影响：** Epic 2 (浏览器资源管理)

### 安全与合规

**敏感数据加密：** AES-256 存储
- **版本：** cryptography 库 + Fernet 加密
- **方案：** 敏感字段（姓名、电话、邮箱）加密后存储到 PostgreSQL
- **理由：** 中国个人信息保护法要求
- **影响：** Epic 6 (安全与合规)

**用户同意管理：** 明确同意机制
- **方案：** 首次启动显示隐私政策，用户勾选"我同意"方可使用
- **理由：** GDPR、个人信息保护法要求明确同意
- **影响：** Epic 1 (首次使用流程), Epic 6 (合规性)

**审计日志：** 90 天保留
- **方案：** PostgreSQL 表 `audit_logs`，每日清理 > 90 天记录
- **理由：** 数据安全法要求
- **影响：** Epic 6 (安全与合规)

### 决策影响分析

**实施顺序：**
1. 数据架构（PostgreSQL 模型设计）
2. AI 模型抽象层（8 个提供商）
3. 浏览器自动化（Playwright Worker Pool）
4. 前端状态管理（三级视图）
5. WebSocket 通信（进度推送）
6. 安全与合规（加密、审计日志）

**跨组件依赖：**
- AI 模型层 → 依赖 ← FastAPI（异步调用）
- Celery → 依赖 ← Playwright（任务执行）
- WebSocket → 依赖 ← 任务进度事件
- 前端 → 依赖 ← WebSocket（状态同步）
- 离线缓存 → 依赖 ← IndexedDB（浏览器本地存储）


## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 15 个领域 AI 代理可能做出不同选择

**架构师角色：**
- **Pragmatic Paul（务实架构师）**：关注实用性和开发效率
- **Security Sam（安全架构师）**：关注漏洞防护和合规性
- **Scalability Sara（可扩展性架构师）**：关注未来扩展和性能
- **Maintainability Maria（可维护性架构师）**：关注长期代码健康

### Naming Patterns

**架构师辩论：数据库命名约定**

- **Paul 观点：** 使用 `snake_case` 最符合 Python 生态和 PEP 8，IDE 自动补全友好
- **Sam 警告：** 列名使用 `_id` 后缀可能被误认为主键，建议 `pk_` 前缀
- **Sara 建议：** 索引名 `idx_table_columns` 便于索引命名空间管理
- **Maria 偏好：** 保持一致性比争论后缀更重要

**决策： snake_case，后缀 `_id` 用于外键**

**理由：** Python 生态标准 + 明确语义区别主键/外键，Sam 的安全担忧可通过文档缓解（主键明确标注）

**Database Naming Conventions:**
- 表名：snake_case 复数（`data_sources`, `crawl_tasks`）
- 列名：snake_case（`data_source_id`, `created_at`）
- 外键：`{referenced_table}_id`（`data_source_id`）
- 索引：`idx_{table}_{columns}`（`idx_data_sources_url`）

**API 命名约定：**

- **Paul 观点：** `/api/v1/{resource_plural}` 符合 REST 约定
- **Sam 建议：** 版本号在路径中可能被反向代理缓存，建议 Header `X-API-Version: v1`
- **Sara 关注：** 保持 URL 简短，`data-sources` vs `data-source-management`
- **Maria 平衡：** Header 版本控制更灵活，但路径版本更直观

**决策：路径 `/api/v1/{resource_plural}`，Header 版本可选**

**理由：** MVP 阶段优先直观性，后续可扩展 Header 版本

**API Naming Conventions:**
- REST 端点：`/api/v1/{resource_plural}`（`/api/v1/data-sources`）
- 路由参数：`{resource}_id`（`/{data_source_id}`）
- 查询参数：snake_case（`?status=active&page=1`）
- 头部：`X-Custom-Header`（`X-Request-ID`）

**代码命名约定：**

- **Paul 观点：** Python PEP 8，Vue.js 驼峰/帕斯卡各自遵守社区规范
- **Sara 关注：** 文件名一致性（kebab-case）便于跨平台
- **Maria 要求：** 组件和函数命名必须对应（UserProfile.vue ← getUserProfile）

**决策：Python snake_case，Vue.js PascalCase 组件/ camelCase 变量，文件名 kebab-case**

**Code Naming Conventions:**
- Python：snake_case 函数/变量，PascalCase 类
- Vue.js：PascalCase 组件（UserProfile.vue），camelCase 变量
- 文件名：kebab-case（user-profile.vue, ai-service.py）

### Structure Patterns

**项目组织辩论：**

- **Paul 观点：** 按功能组织（feature-based）更符合领域驱动设计
- **Sam 建议：** 按类型组织（type-based）便于快速定位文件
- **Sara 关注：** 混合模式（核心共享 + 功能隔离）
- **Maria 偏好：** PRD 已明确三级界面策略，按功能组织更匹配

**决策：按功能组织，共享组件单独管理**

**理由：** 领域驱动 + PRD 三级视图需求，类型组织可通过搜索补偿

**Project Organization:**
```
backend/
├── app/
│   ├── api/          # FastAPI 路由
│   ├── models/       # SQLAlchemy 模型
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # 业务逻辑
│   ├── core/         # 配置、依赖
│   └── tasks/        # Celery 任务
├── tests/
└── alembic/          # 数据库迁移

frontend/
├── src/
│   ├── components/   # Vue 组件（按功能分组）
│   ├── composables/  # Composition API hooks
│   ├── stores/       # Pinia stores
│   ├── api/          # API 调用
│   └── utils/        # 工具函数
└── tests/
```

### Format Patterns

**API 响应格式辩论：**

- **Paul 观点：** `{"data": ..., "error": ...}` 统一结构，客户端易于解析
- **Sam 警告：** 错误堆栈暴露可能泄露内部结构，区分用户/系统错误
- **Sara 关注：** 成功响应 `message` 字段可能被忽略，保持简洁
- **Maria 要求：** HTTP 状态码 + 业务错误码双重验证

**决策：统一包装器，系统错误不暴露堆栈**

**API Response Formats:**
```json
// 成功响应
{
  "data": { ... },
  "message": "Success"
}

// 错误响应
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

**数据交换格式：**

- **Paul 观点：** 后端 snake_case，前端 camelCase，后端统一最安全
- **Sam 建议：** 布尔用 `true/false`，`1/0` 可能被某些库误解析
- **Sara 关注：** null vs 空字符串必须一致
- **Maria 要求：** 日期 ISO 8601 标准避免时区混乱

**决策：后端 snake_case，前端自动转换；布尔 true/false；null 统一处理；日期 ISO 8601**

**Data Exchange Formats:**
- JSON 字段：snake_case（后端），前端自动转换 camelCase
- 布尔：true/false
- Null：null
- 日期：ISO 8601（`2026-04-26T10:00:00Z`）

### Communication Patterns

**WebSocket 事件辩论：**

- **Paul 观点：** `crawl_progress`, `task_completed` 简洁易懂
- **Sam 警告：** 事件需版本控制，客户端兼容性
- **Sara 关注：** 事件类型枚举避免拼写错误
- **Maria 偏好：** 后端枚举 + 前端 TypeScript 类型检查

**决策：事件 snake_case，枚举类型定义**

**WebSocket Events:**
```json
// 事件命名：snake_case
{
  "event": "crawl_progress",
  "data": {
    "task_id": "uuid",
    "progress": 75,
    "current_url": "..."
  }
}
```

**状态管理辩论：**

- **Paul 观点：** Pinia 不可变更新符合 Vue 3 最佳实践
- **Sam 建议：** 全局 loading 状态更统一，避免散布各组件
- **Sara 关注：** Store 分离（crawl、ui、user）避免单一 Store 过大
- **Maria 要求：** 三级视图对应不同 Store 结构

**决策：Pinia 不可变更新，按视图分离 Store**

**State Management (Pinia):**
```javascript
// Store 命名：PascalCase
// Actions：camelCase
// State：camelCase
export const useCrawlStore = defineStore('crawl', {
  state: () => ({
    activeTasks: [],
    history: []
  }),
  actions: {
    async startTask(task) { ... }
  }
})
```

### Process Patterns

**错误处理辩论：**

- **Paul 观点：** FastAPI `app.exception_handler` 统一处理
- **Sam 警告：** 生产环境不返回详细堆栈
- **Sara 关注：** 错误日志和用户消息分离
- **Maria 要求：** HTTP 状态码语义正确（400 vs 422）

**决策：全局异常处理 + 环境区分日志**

**Error Handling:**
- Python：统一异常处理（`app.exception_handler`）
- 前端：全局错误拦截（`axios.interceptors`）
- 用户友好消息（非技术细节）

**加载状态辩论：**

- **Paul 观点：** `isLoading` + `isSaving` + `isDeleting` 明确语义
- **Sam 建议：** 全局 loading overlay 防止重复 UI
- **Sara 关注：** 局部 loading 提升感知响应速度
- **Maria 平衡：** 全局防误触 + 局部优化体验

**决策：明确语义的局部状态，重大操作全局 overlay**

**Loading States:**
- 前端：`isLoading` + `isSaving` + `isDeleting`
- 本地状态，不持久化

### Extended Architecture Specifications

**WebSocket 事件版本控制：**
- **Header 格式：** `X-Event-Version: v1`
- **版本策略：** MVP 使用 v1，向后兼容到 v1.x
- **破坏性变更：** 需要 v2 标识，客户端需支持版本检测
- **实施位置：** `backend/app/api/v1/websocket/__init__.py`

```python
# WebSocket 连接示例
ws = new WebSocket(`ws://localhost:8000/ws/progress/${taskId}`)
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  if (data.version !== 'v1') {
    console.warn('Incompatible event version:', data.version)
  }
})
```

**AI 提供商配置迁移策略：**
- **配置存储：** 系统密钥环（加密）
- **版本字段：** `ai_providers.config_version`
- **迁移检查：** 启动时检测版本不匹配
- **回滚机制：** 保留旧配置备份（`.bak` 后缀）
- **实施位置：** `backend/app/core/security.py`

```python
# 配置迁移流程
def migrate_config(old_version: str, new_version: str) -> None:
    try:
        # 尝试迁移
        migrated = migration_handlers[old_version](load_config())
        save_config(migrated)
        backup_config(old_version)
    except Exception as e:
        # 迁移失败，使用备份
        restore_config(old_version)
        raise ConfigMigrationError(f"Migration failed: {e}")
```

**错误码标准化表：**
- **实施位置：** `backend/app/core/errors.py`

```python
from enum import IntEnum

class ErrorCode(IntEnum):
    """统一错误码体系 (4xxxx: 客户端错误, 5xxxx: 服务端错误)"""
    
    # 通用错误 40000-40099
    INVALID_INPUT = 40001
    VALIDATION_ERROR = 40002
    MISSING_REQUIRED_FIELD = 40003
    UNAUTHORIZED = 40004
    FORBIDDEN = 40005
    
    # AI 相关错误 50000-50099
    AI_TIMEOUT = 50001
    AI_PROVIDER_ERROR = 50002
    AI_RATE_LIMITED = 50003
    AI_INVALID_RESPONSE = 50004
    
    # 爬虫相关错误 50100-50199
    BROWSER_CRASH = 50101
    PAGE_LOAD_TIMEOUT = 50102
    ROBOTS_TXT_BLOCKED = 50103
    ANTI_CRAWLER_DETECTED = 50104
    
    # 数据库错误 50200-50299
    DATABASE_CONNECTION_FAILED = 50201
    DATA_INTEGRITY_ERROR = 50202
    QUERY_TIMEOUT = 50203

class APIError(Exception):
    def __init__(self, code: ErrorCode, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details or {}
    
    def to_dict(self) -> dict:
        return {
            "error": {
                "code": self.code.name,
                "code_value": int(self.code),
                "message": self.message,
                "details": self.details
            }
        }
```

**日志级别定义：**
- **实施位置：** `backend/app/core/logging.py`

```python
import logging
from enum import StrEnum

class LogLevel(StrEnum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

# 日志级别使用指南
LOG_LEVEL_GUIDELINES = {
    LogLevel.DEBUG: "调试信息，仅开发环境（函数参数、中间值）",
    LogLevel.INFO: "常规信息，生产环境（任务开始/完成、状态变更）",
    LogLevel.WARNING: "警告信息，不影响功能（重试、降级、配置缺失）",
    LogLevel.ERROR: "错误信息，需要人工干预（AI 失败、浏览器崩溃、网络错误）",
    LogLevel.CRITICAL: "严重错误，系统不可用（数据库连接失败、配置错误）"
}

def setup_logging(level: LogLevel = LogLevel.INFO, environment: str = "production"):
    """配置日志系统"""
    log_level = getattr(logging, level)
    
    if environment == "development":
        log_level = logging.DEBUG
    
    handlers = {
        "default": {
            "formatter": "detailed",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
            "level": log_level,
        },
    }
    
    # 生产环境添加文件处理器
    if environment == "production":
        handlers["file"] = {
            "formatter": "simple",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "level": logging.INFO,
        }
    
    return handlers
```

**监控指标集成点：**
- **实施位置：** `backend/app/api/v1/metrics.py`
- **端点：** `GET /api/v1/metrics`
- **暴露指标：**
  - `active_tasks`: 当前活跃任务数
  - `ai_accuracy_rate`: AI 分析准确率（移动平均）
  - `browser_pool_memory`: 浏览器池内存占用（MB）
  - `queue_size`: Celery 队列待处理任务数
  - `avg_page_analysis_time`: 平均页面分析时间（秒）

```python
from prometheus_client import Counter, Histogram, Gauge
from fastapi import APIRouter

router = APIRouter(prefix="/metrics", tags=["metrics"])

# Prometheus 指标定义
active_tasks_gauge = Gauge('active_tasks', 'Number of active crawl tasks')
ai_requests_total = Counter('ai_requests_total', 'Total AI API requests', ['provider', 'status'])
page_analysis_time = Histogram('page_analysis_seconds', 'Page analysis duration')
browser_memory_gauge = Gauge('browser_memory_mb', 'Browser pool memory usage in MB')

@router.get("/")
async def get_metrics():
    """获取系统指标（兼容 Prometheus 和 JSON 格式）"""
    return {
        "active_tasks": active_tasks_gauge._value.get(),
        "ai_requests_total": {
            "success": ai_requests_total.labels(provider="*", status="success")._value.get(),
            "failure": ai_requests_total.labels(provider="*", status="failure")._value.get(),
        },
        "page_analysis_time_seconds": {
            "avg": page_analysis_time.observe.__wrapped__.sum,
            "count": page_analysis_time.observe.__wrapped__.count,
        },
        "browser_memory_mb": browser_memory_gauge._value.get(),
        "queue_size": get_celery_queue_size(),
    }

@router.get("/prometheus")
async def prometheus_metrics():
    """Prometheus 格式指标（用于 Grafana 等监控系统）"""
    from prometheus_client import generate_latest
    from prometheus_client.core import REGISTRY
    return Response(generate_latest(REGISTRY), media_type="text/plain")
```

### Enforcement Guidelines

**All AI Agents MUST:**
- 遵循 PEP 8（Python）和 Vue.js 风格指南
- API 响应必须包含 `{data, error}` 结构
- 数据库迁移使用 Alembic
- 前端状态使用 Pinia（避免 Vuex）

### Pattern Examples

**Good Examples:**
```python
# API 端点
@router.get("/data-sources")
async def list_data_sources(skip: int = 0, limit: int = 100):
    ...

# 数据库模型
class CrawlTask(Base):
    __tablename__ = "crawl_tasks"
    task_id = Column(UUID(as_uuid=True), primary_key=True)
    data_source_id = Column(UUID, ForeignKey("data_sources.id"))
```

**Anti-Patterns:**
```python
# ❌ 避免混合命名
@router.get("/DataSources")  # 应为小写

# ❌ 避免驼峰命名数据库列
column_name = "userId"  # 应为 user_id
```


## Project Structure & Boundaries

### Complete Project Directory Structure

```
vscode_bmad_method_test/
├── README.md
├── .gitignore
├── .env.example
├── pyproject.toml                    # Python 项目配置
├── package.json                     # Electron + 前端配置
├── requirements.txt                  # Python 依赖
├── requirements-dev.txt
│
├── backend/                          # FastAPI 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI 应用入口
│   │   ├── config.py                  # 配置管理
│   │   ├── dependencies.py              # 依赖注入容器
│   │   │
│   │   ├── api/                      # REST API 路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py               # API 依赖
│   │   │   │
│   │   │   ├── v1/                     # API v1 路由
│   │   │   │   ├── __init__.py
│   │   │   │   │
│   │   │   │   │   ├── data_sources.py      # 数据源 CRUD
│   │   │   │   │   ├── crawl_tasks.py       # 爬取任务 CRUD
│   │   │   │   │   ├── crawl_results.py     # 爬取结果 CRUD
│   │   │   │   │   ├── ai_providers.py     # AI 提供商管理
│   │   │   │   │   ├── users.py            # 用户认证
│   │   │   │   │   └── audit_logs.py        # 审计日志
│   │   │   │   │
│   │   │   │   ├── models/                    # SQLAlchemy 模型
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── data_source.py
│   │   │   │   │   ├── crawl_task.py
│   │   │   │   │   ├── crawl_result.py
│   │   │   │   │   └── base.py              # 基础模型类
│   │   │   │   │
│   │   │   │   ├── schemas/                   # Pydantic schemas
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── data_source.py
│   │   │   │   │   ├── crawl_task.py
│   │   │   │   │   └── crawl_result.py
│   │   │   │   │
│   │   │   │   ├── services/                   # 业务逻辑层
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── ai_service.py       # AI 分析服务
│   │   │   │   │   ├── crawl_service.py    # 爬取服务
│   │   │   │   │   ├── encryption_service.py # 加密服务
│   │   │   │   │   ├── compliance_service.py # 合规检查服务
│   │   │   │   │   └── offline_service.py  # 离线队列管理服务
│   │   │   │   │
│   │   │   │   ├── core/                      # 核心配置
│   │   │   │   │   ├── security.py           # 安全配置（系统密钥环）
│   │   │   │   │   ├── database.py          # 数据库连接
│   │   │   │   │   └── settings.py          # 应用设置
│   │   │   │   │
│   │   │   │   └── tasks/                     # Celery 异步任务
│   │   │   │       ├── __init__.py
│   │   │   │       ├── crawler.py            # Playwright 爬取任务
│   │   │   │       └── celery_app.py         # Celery 配置
│   │   │   │
│   │   │   ├── tests/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── unit/
│   │   │   │   └── integration/
│   │   │   │
│   │   │   └── alembic/                   # 数据库迁移
│   │   │       ├── versions/
│   │   │       └── env.py
│   │   │
│   └── Dockerfile                    # 后端 Docker 配置
│
├── frontend/                           # Vue.js + Electron 前端
│   ├── electron/                      # Electron 主进程
│   │   ├── main.js                  # Electron 入口
│   │   ├── preload.js              # 预加载脚本
│   │   └── package.json
│   │
│   ├── src/
│   │   ├── main.js                 # Vue 应用入口
│   │   ├── App.vue
│   │   │
│   │   ├── components/               # Vue 组件（按功能分组）
│   │   │   ├── simple/            # 简洁视图组件
│   │   │   │   ├── QuickStartWizard.vue
│   │   │   │   └── DataPreviewPanel.vue
│   │   │   ├── dashboard/          # 仪表板视图组件
│   │   │   │   ├── CrawlTaskList.vue
│   │   │   │   ├── ProgressMonitor.vue
│   │   │   │   └── DataExport.vue
│   │   │   └── professional/        # 专业视图组件
│   │   │       ├── AdvancedFilters.vue
│   │   │       └── CodeExport.vue
│   │   │
│   │   ├── composables/             # Pinia Composition API
│   │   │   ├── useCrawlStore.js
│   │   │   ├── useUiStore.js
│   │   │   └── useUserStore.js
│   │   │
│   │   ├── stores/                  # Pinia stores
│   │   │   ├── crawl.js
│   │   │   ├── ui.js
│   │   │   ├── user.js
│   │   │   ├── config.js            # 配置历史栈管理
│   │   │   └── offline.js           # 离线状态管理
│   │   │
│   │   ├── api/                     # API 客户端
│   │   │   ├── client.js              # Axios 配置
│   │   │   ├── data-sources.js
│   │   │   ├── crawl-tasks.js
│   │   │   └── websocket.js          # WebSocket 客户端
│   │   │
│   │   ├── utils/                   # 工具函数
│   │   │   ├── storage.js            # IndexedDB 离线存储
│   │   │   ├── offline.js            # 网络状态检测和离线管理
│   │   │   ├── formatters.js         # 数据格式化（snake_case ↔ camelCase）
│   │   │   └── validators.js         # 前端验证
│   │   │
│   │   └── assets/                  # 静态资源
│   │
│   ├── tests/
│   │   └── package.json
│
└── docker-compose.yml                  # 开发环境编排
```

### Architectural Boundaries

**API Boundaries:**
- 后端通过 `/api/v1/` 暴露 REST 端点
- WebSocket 通过 `/ws/progress/{task_id}` 推送进度事件
- 前端通过 `api/` 模块调用后端，不直接访问数据库

**Component Boundaries:**
- Vue 组件通过 props 通信，组件间避免直接耦合
- Pinia stores 管理共享状态，组件通过 composables 访问
- WebSocket 事件通过 Pinia action 分发到 store

**Service Boundaries:**
- `ai_service` 抽象层隔离 AI 提供商差异
- `crawl_service` 封装 Playwright 操作
- `encryption_service` 集中处理所有加密逻辑

**Data Boundaries:**
- SQLAlchemy 模型是唯一数据访问层
- 服务层通过模型访问数据库，不允许 SQL 注入
- 外部数据通过 API 服务层访问

### Requirements to Structure Mapping

**Feature/Epic Mapping:**

| Epic | 目录位置 | 关键文件 |
|-------|-----------|----------|
| Epic 1 - 用户认证 & 系统配置 | `backend/app/api/v1/users.py`, `frontend/src/components/simple/QuickStartWizard.vue` |
| Epic 2 - AI 页面分析 | `backend/app/services/ai_service.py`, `backend/app/tasks/crawler.py` |
| Epic 3 - 爬取任务管理 | `backend/app/api/v1/crawl_tasks.py`, `frontend/src/stores/crawl.js` |
| Epic 4 - 用户界面 & 交互 | `frontend/src/components/` (三级视图), `frontend/src/stores/ui.js` |
| Epic 5 - 数据管理 & 导出 | `backend/app/api/v1/crawl_results.py`, `frontend/src/components/dashboard/DataExport.vue` |
| Epic 6 - 安全与合规 | `backend/app/services/compliance_service.py`, `backend/app/core/security.py` |
| Epic 7 - AI 模型集成 | `backend/app/api/v1/ai_providers.py`, `backend/app/services/ai_service.py` |

**Cross-Cutting Concerns:**

- **认证系统**: `backend/app/core/security.py` + `frontend/src/stores/user.js`
- **WebSocket 通信**: `backend/app/api/v1/websocket/` + `frontend/src/api/websocket.js`
- **AI 抽象层**: `backend/app/services/ai_service.py` 统一接口
- **数据加密**: `backend/app/services/encryption_service.py` 集中处理
- **离线功能**: `backend/app/services/offline_service.py` + `frontend/src/utils/offline.js` + `frontend/src/stores/offline.js`
- **撤销机制**: `frontend/src/stores/config.js` (配置撤销) + `frontend/src/stores/tasks.js` (任务软删除)

### Integration Points

**Internal Communication:**
- FastAPI 通过依赖注入访问服务层
- Celery 任务通过 `services.crawl_service` 调用 Playwright
- Vue 组件通过 Pinia stores 共享状态

**External Integrations:**
- **AI 提供商**: OpenAI、Anthropic、Ollama、Qwen、Doubao、GLM、Google API
- **浏览器自动化**: Playwright v1.51.0 (固定版本）
- **数据库**: PostgreSQL 15.x（本地）
- **任务队列**: Redis 7.x（Celery broker）

**Data Flow:**
```
用户操作 → Vue 组件 → Pinia Store → API 客户端 → FastAPI 路由
→ 服务层 → SQLAlchemy 模型 → PostgreSQL

爬取任务 → Celery Queue → Worker Pool → Playwright 浏览器
→ AI 服务 → AI 提供商 API → 页面分析 → 结果存储

进度事件 → Celery Event → FastAPI WebSocket → 前端 WebSocket 客户端
→ Pinia Store → Vue 组件（仪表板/专业视图）
```

### File Organization Patterns

**Configuration Files:**
- `backend/requirements.txt` - Python 生产依赖
- `frontend/package.json` - 前端依赖和脚本
- `.env.example` - 环境变量模板
- `docker-compose.yml` - 开发环境编排

**Source Organization:**
- 后端按功能模块（api、models、schemas、services、tasks）
- 前端按类型分层（components、composables、stores、api、utils）
- 测试与源码同目录结构

**Test Organization:**
- `backend/tests/unit/` - 单元测试
- `backend/tests/integration/` - 集成测试
- `frontend/tests/` - 组件测试

**Asset Organization:**
- `frontend/src/assets/` - 静态资源（logo、icons）
- Electron 打包输出在 `dist/`

### Development Workflow Integration

**Development Server Structure:**
- 后端通过 `uvicorn backend.app.main:app --reload` 启动
- 前端通过 `npm run dev` 启动（Vite + Electron）
- Celery 通过 `celery -A backend.app.tasks.celery_app worker` 启动

**Build Process Structure:**
- 后端通过 `uvicorn` 直接运行，无需单独构建
- 前端通过 `vite` 构建，Electron 打包输出到 `dist/`

**Deployment Structure:**
- 本地部署：Electron 生成 `.exe`/`.dmg`/`.deb` 安装包
- 数据库：PostgreSQL 本地安装（使用 Alembic 迁移）


## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- 所有技术选择兼容（Python 3.10+ + FastAPI 0.100+ + SQLAlchemy 2.0+）
- Playwright v1.51.0 与 Celery 5.3+ 异步兼容
- Vue.js + Naive UI + Electron 组合成熟
- 无版本冲突或依赖问题

**Pattern Consistency:**
- 实施模式支持所有架构决策（PEP 8 snake_case, Vue.js 风格指南）
- 命名约定跨前后端一致（后端 snake_case, 前端自动转换）
- WebSocket 事件格式与状态管理模式一致

**Structure Alignment:**
- 项目结构支持三级视图策略（simple/dashboard/professional 目录）
- 边界明确定义（API、组件、服务、数据）
- 集成点正确结构化（WebSocket、Celery、Playwright）

---

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
| Epic | 架构支持 | 状态 | Stories |
|------|---------|------|---------|
| Epic 1 - 用户认证 & 系统配置 | ✅ 系统密钥环 + 首次使用流程 | 完成 | 6 Stories |
| Epic 2 - AI 页面分析 | ✅ AI 抽象层 + Playwright Worker Pool | 完成 | 8 Stories |
| Epic 3 - 爬取任务管理 | ✅ Celery 任务队列 + WebSocket 进度 + 离线队列 | 完成 | 8 Stories |
| Epic 4 - 用户界面 & 交互 | ✅ 三级视图组件 + Pinia stores + 配置撤销 | 完成 | 11 Stories |
| Epic 5 - 数据管理 & 导出 | ✅ PostgreSQL 模型 + 数据导出 API + 离线访问 | 完成 | 8 Stories |
| Epic 6 - 安全与合规 | ✅ 加密服务 + 审计日志 + 用户同意 | 完成 | 5 Stories |
| Epic 7 - AI 模型集成 | ✅ 8 个提供商抽象层 | 完成 | 5 Stories |
| Epic 8 - 桌面部署与系统集成 | ✅ 多平台安装包 + Docker/K8s + 离线模式 | 完成 | 5 Stories |
| **总计** | **✅ 完全覆盖** | **完成** | **56 Stories** |

**Functional Requirements Coverage:**
- ✅ AI 页面结构学习和数据提取
- ✅ 零代码桌面应用
- ✅ 多 AI 提供商支持（8 个）
- ✅ 数据导出（JSON、CSV、Excel）
- ✅ 批量爬取与任务调度
- ✅ 三级界面策略
- ✅ 离线模式支持（FR132）
- ✅ 离线数据访问（FR133）
- ✅ 离线任务队列（FR134）
- ✅ 配置撤销功能（FR135）
- ✅ 任务删除恢复（FR136）
- ✅ 100% FR 覆盖（136 个功能需求）

**Non-Functional Requirements Coverage:**
- ✅ 性能：Worker Pool 模式 + 异步处理
- ✅ 准确率：MVP 70-80%，Post-MVP 90-95%
- ✅ 合规：GDPR + CCPA + 中国网络安全法 + 个人信息保护法
- ✅ 可访问性：WCAG 2.1 AA

---

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ 所有关键决策已文档化，含版本号
- ✅ 实施模式全面（命名、结构、格式、通信、流程）
- ✅ Good/Anti-Patterns 示例提供
- ✅ 架构师角色辩论支持决策合理性

**Structure Completeness:**
- ✅ 完整目录树定义（backend/frontend 分离）
- ✅ 所有文件和目录命名明确
- ✅ 集成点详细映射（数据流图）
- ✅ Epic 到目录位置映射表

**Pattern Completeness:**
- ✅ 15 个冲突点已识别和解决
- ✅ 命名约定全面（数据库、API、代码）
- ✅ 通信模式完整（WebSocket、Pinia、API）
- ✅ 流程模式覆盖（错误处理、加载状态）

---

### Gap Analysis Results

**Critical Gaps:** 无 ✅

**Important Gaps:** 已解决 ✅
- ~~WebSocket 事件版本控制~~ → 已添加 ADR-005
- ~~AI 提供商配置迁移~~ → 已在架构文档中说明
- ~~三级界面状态管理~~ → 已添加 ADR-006
- ~~错误处理策略~~ → 已添加 ADR-007
- ~~离线架构模式~~ → 已添加 ADR-008
- ~~撤销/重做机制~~ → 已添加 ADR-009

**Nice-to-Have Gaps:**
1. **API 文档生成** - 建议 OpenAPI/Swagger 自动生成
2. **日志标准化** - ✅ 已在架构文档中统一（backend/app/core/logging.py）
3. **监控指标** - ✅ 已在架构文档中定义（backend/app/api/v1/metrics.py）

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] 项目上下文已深入分析
- [x] 规模和复杂度已评估（中等偏高）
- [x] 技术约束已识别
- [x] 跨领域关注点已映射（6 个）

**✅ Architectural Decisions**
- [x] 关键决策已文档化（含版本号）
- [x] 技术栈已完全指定（Python + FastAPI + Vue.js + Playwright + PostgreSQL）
- [x] 集成模式已定义（WebSocket、Celery、AI 抽象层）
- [x] 性能考虑已解决（Worker Pool、异步处理）
- [x] 离线架构模式已定义（ADR-008）
- [x] 撤销/重做机制已定义（ADR-009）

**✅ Implementation Patterns**
- [x] 命名约定已建立（4 个架构师角色辩论）
- [x] 结构模式已定义（功能组织）
- [x] 通信模式已指定（API、WebSocket、Pinia）
- [x] 流程模式已文档化（错误处理、加载状态）

**✅ Project Structure**
- [x] 完整目录结构已定义（backend/frontend）
- [x] 组件边界已建立（API、服务、数据）
- [x] 集成点已映射（Epic → 目录）
- [x] 需求到结构映射已完成

---

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** 高 - 基于 PRD 明确的技术选择和全面的架构决策

**Key Strengths:**
- PRD 已指定完整技术栈，无决策空白
- 实施模式有 4 个架构师角色辩论支持，合理性充分
- 项目结构清晰，Epic 映射完整
- 合规性要求全面覆盖（4 套法规）
- 离线功能架构完整（三层离线策略 + IndexedDB）
- 撤销/恢复机制完善（命令模式 + 软删除）

**Areas for Future Enhancement:**
- WebSocket 事件版本控制（Post-MVP）
- API 文档自动生成（OpenAPI）
- 监控指标集成（Prometheus）

---

### Implementation Handoff

**AI Agent Guidelines:**
- 严格遵循所有架构决策（特别是 PRD 明确的版本号）
- 一致使用实施模式（PEP 8、Vue.js 风格指南）
- 尊重项目结构和边界（backend/frontend 分离）
- 参考本文档解决所有架构问题

**First Implementation Priority:**
1. 数据库模型设计（Alembic 迁移）
2. AI 提供商抽象层（8 个提供商接口）
3. Playwright Worker Pool 配置
4. 三级视图 Vue 组件
5. 离线功能基础架构（IndexedDB + 网络状态检测）
6. 撤销/恢复机制（配置历史栈 + 任务软删除）

