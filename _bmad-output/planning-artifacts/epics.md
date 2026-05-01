---
stepsCompleted: ["step-01-validate-prerequisites"]
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# vscode_bmad_method_test - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for vscode_bmad_method_test, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

#### AI 页面分析与数据提取 (FR1-FR11)
- FR1: Users can provide a website URL for AI to analyze page structure
- FR2: Users can specify which data fields to extract from a webpage
- FR3: AI can automatically identify page structure and data field locations
- FR4: AI can extract data with 70-80% accuracy for common website types in MVP, improving to 95-98% through user feedback and iteration
- FR5: AI can recognize common page patterns (product lists, article details, user profiles)
- FR6: AI can understand relationships between data elements
- FR7: Users can view AI analysis results before starting extraction
- FR8: Users can manually adjust AI-identified data fields if needed
- FR9: AI can adapt to website structure changes within 48-72 hours
- FR10: AI can learn from user adjustments for future similar changes
- FR11: Users can configure multiple AI model providers (local and cloud-based)

#### AI 模型集成 (FR12-FR28)
- FR12: Users can add local model providers (Ollama) with model name and configuration
- FR13: Users can add cloud model providers (OpenAI, Anthropic, Qwen, Doubao, GLM, Google Gemini) with API key and base URL
- FR14: Users can set priority for each AI model provider
- FR15: Users can configure model-specific parameters (temperature, max tokens, etc.)
- FR16: System can automatically select the best AI model based on task complexity
- FR17: Users can manually select which AI model to use for specific tasks
- FR18: System can automatically fallback to backup models when primary model is unavailable
- FR19: Users can view real-time API usage and cost for cloud-based models
- FR20: Users can set monthly cost budget and receive alerts when approaching limits
- FR21: System provides cost optimization recommendations based on usage patterns
- FR22: Users can enable/disable data anonymization before sending to cloud models
- FR23: System provides clear warnings about data privacy implications when using cloud models
- FR24: Users can test AI model connectivity and configuration before using
- FR25: System monitors and displays performance metrics for each model (response time, accuracy, success rate)
- FR26: Users can export and import AI model provider configurations
- FR27: System supports seamless switching between models without interrupting ongoing tasks
- FR28: Users can configure different models for different task types (simple analysis vs complex extraction)

#### 桌面应用与用户界面 (FR29-FR37)
- FR29: Users can access a desktop application for crawler configuration (executable installation packages: .exe, .msi, .dmg, .deb, .rpm)
- FR30: Users can input URLs through a simple, search-engine-like interface
- FR31: Users can add multiple URLs for batch crawling
- FR32: Users can view real-time crawling progress and status
- FR33: Users can manage and organize crawling tasks
- FR34: Users can view crawling history and results
- FR35: Users can access CLI interface for advanced operations
- FR36: Users can customize interface settings and preferences
- FR37: Users can receive notifications for crawling completion and errors

#### 数据导出与管理 (FR38-FR46)
- FR38: Users can export crawled data in JSON format
- FR39: Users can export crawled data in CSV format
- FR40: Users can export crawled data in Excel format
- FR41: Users can organize data by data source into different tables in PostgreSQL database
- FR42: Users can customize database storage paths
- FR43: Users can view and manage exported data files
- FR44: Users can merge data from multiple crawling tasks
- FR45: Users can filter and search crawled data
- FR46: Users can delete or archive old crawling results

#### 爬取任务管理 (FR47-FR56)
- FR47: Users can create single-URL crawling tasks
- FR48: Users can create batch-URL crawling tasks
- FR49: Users can schedule crawling tasks for specific times
- FR50: Users can set crawling frequency (one-time, daily, weekly, etc.)
- FR51: Users can pause and resume crawling tasks
- FR52: Users can cancel running crawling tasks
- FR53: Users can view task execution logs
- FR54: Users can configure task-specific settings (depth, delay, etc.)
- FR55: Users can duplicate existing tasks with modified settings
- FR56: Users can organize tasks into groups or categories

#### 反爬虫机制 (FR57-FR66)
- FR57: System can implement request frequency control
- FR58: System can rotate User-Agent strings
- FR59: System can implement IP rotation and proxy pools
- FR60: System can automatically handle CAPTCHAs
- FR61: System can simulate human behavior (random delays, mouse movement, scrolling)
- FR62: System can support dynamically loaded websites
- FR63: System can respect robots.txt rules
- FR64: System can respect target website terms of service
- FR65: Users can configure anti-crawling settings
- FR66: System can detect and respond to blocking attempts

#### 平台部署与系统集成 (FR67-FR85)
- FR67: Users can install the application on Windows 10/11
- FR68: Users can install the application on macOS 10.15+
- FR69: Users can install the application on Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
- FR70: Users can deploy the application using Docker
- FR71: Users can deploy the application using Docker Compose
- FR72: Users can deploy the application using Kubernetes
- FR73: Users can integrate the application into CI/CD pipelines
- FR74: System can check for updates automatically
- FR75: Users can perform offline updates using installation packages
- FR76: System can rollback to previous versions if update fails
- FR77: Users can integrate crawling data into ETL processes
- FR78: Users can load crawling data into data warehouses (Snowflake, BigQuery, Redshift)
- FR79: Users can integrate real-time data streams into Kafka or Kinesis
- FR80: Users can use Python SDK in Jupyter Notebook
- FR81: Users can use Airflow Operator for task scheduling
- FR82: Users can import data directly into Tableau
- FR83: Users can integrate with system schedulers (Windows Task Scheduler, macOS launchd, Linux cron)
- FR84: Users can access REST API for programmatic control
- FR85: Users can configure webhooks for event notifications

#### 安全与合规 (FR86-FR95)
- FR86: System stores all data in local PostgreSQL database without uploading to cloud
- FR87: System encrypts sensitive data during storage and transmission
- FR88: System implements strict access control
- FR89: System logs all data access and operations
- FR90: Users can configure privacy settings
- FR91: System provides clear privacy policy documentation
- FR92: System complies with GDPR requirements
- FR93: System complies with CCPA requirements
- FR94: System complies with Chinese cybersecurity and personal information protection laws
- FR95: Users can export or delete their data on request

#### 社区与协作 (FR96-FR113)
- FR96: Users can access a community platform
- FR97: Users can share crawling templates with the community
- FR98: Users can download templates shared by other users
- FR100: Users can provide feedback on templates
- FR101: Users can access documentation and tutorials
- FR102: Users can interact with other community members
- FR103: Users can contribute to community knowledge base
- FR104: Users can report issues and request features
- FR105: Users can share crawler templates
- FR106: Users can browse community template library
- FR107: Users can download and use community templates
- FR108: Users can rate and review templates
- FR109: Users can follow other users
- FR110: Users can view followed users' activities
- FR111: Users can create collaborative projects
- FR112: Users can invite other users to join collaborative projects
- FR113: Users can assign tasks in collaborative projects

#### 监控与性能优化 (FR114-FR131)
- FR114: Users can view real-time monitoring dashboard
- FR115: Users can monitor multiple crawling tasks simultaneously
- FR116: Users can receive alerts for task failures
- FR117: Users can view system resource usage (CPU, memory, network)
- FR118: Users can view crawling performance metrics (success rate, speed, errors)
- FR119: Users can export monitoring reports
- FR120: System can automatically detect and report anomalies
- FR121: Users can configure alert thresholds and notification methods
- FR122: Users can access historical performance data
- FR123: Users can view system performance metrics
- FR124: Users can set performance alert thresholds
- FR125: Users can view crawler task execution history
- FR126: Users can view data collection statistics
- FR127: Users can export performance reports
- FR128: System can automatically detect performance anomalies
- FR129: System can send performance alert notifications
- FR130: Users can configure alert notification methods
- FR131: Users can access historical performance data

### NonFunctional Requirements

#### 性能需求 (NFR1-NFR8)
- NFR1: System shall complete page analysis and data extraction within 8 seconds for 95th percentile
- NFR2: System shall support crawling 100 concurrent users
- NFR3: System shall handle 1,000 concurrent crawling tasks
- NFR4: System shall maintain response time under 200ms for API requests (95th percentile)
- NFR5: System shall support batch crawling of up to 1,000 URLs in a single task
- NFR6: System shall maintain 99.9% uptime during business hours
- NFR7: System shall optimize network requests to minimize bandwidth usage
- NFR8: System shall achieve 80% task completion rate for first-time users

#### 安全需求 (NFR9-NFR17)
- NFR9: System shall encrypt all sensitive data at rest using AES-256
- NFR10: System shall encrypt all data in transit using TLS 1.3
- NFR11: System shall implement role-based access control (RBAC)
- NFR12: System shall log all authentication attempts and (sensitive) data access
- NFR13: System shall support multi-factor authentication (MFA)
- NFR14: System shall comply with OWASP Top 10 security standards
- NFR15: System shall perform security audits quarterly
- NFR16: System shall provide data export and deletion capabilities within 30 days of request
- NFR17: System shall support horizontal scaling through containerization

#### 可扩展性需求 (NFR18-NFR23)
- NFR18: System shall handle 10x load growth through horizontal scaling
- NFR19: System shall support distributed crawling across multiple nodes
- NFR20: System shall optimize database queries for large datasets
- NFR21: System shall implement caching strategies to reduce load
- NFR22: System shall support load balancing for concurrent requests
- NFR23: System shall handle 1 million records per data source without performance degradation

#### 集成需求 (NFR24-NFR31)
- NFR24: System shall provide RESTful API with OpenAPI specification
- NFR25: System shall support webhooks for event notifications
- NFR26: System shall provide Python SDK with comprehensive documentation
- NFR27: System shall provide Airflow Operator with examples
- NFR28: System shall support integration with Snowflake, BigQuery, Redshift
- NFR29: System shall support integration with Kafka, Kinesis for real-time data
- NFR30: System shall provide Docker images for all major platforms
- NFR31: System shall provide Helm Charts for Kubernetes deployment

#### 用户体验需求 (NFR32-NFR39)
- NFR32: System shall complete user onboarding in under 5 minutes
- NFR33: System shall load main interface within 3 seconds (95th percentile)
- NFR34: System shall support keyboard shortcuts for common operations
- NFR35: System shall provide clear error messages with (actionable) guidance
- NFR36: System shall maintain consistent UI/UX across all platforms
- NFR37: System shall support dark mode and accessibility features (WCAG 2.1 AA)
- NFR38: System shall provide contextual help and tooltips
- NFR39: System shall achieve 80% task completion rate for first-time users

#### AI 准确率需求 (NFR40-NFR47)
- NFR40: AI shall achieve 70-80% data accuracy in MVP, improving to 90-95% through user feedback and iteration
- NFR41: AI shall adapt to website structure changes within 48-72 hours
- NFR42: AI shall successfully adapt to 90% of website structure changes automatically
- NFR43: AI shall learn from user adjustments for future similar changes
- NFR44: AI shall provide explanations for data extraction decisions
- NFR45: AI shall handle edge cases gracefully with fallback mechanisms
- NFR46: AI shall maintain consistent performance across different website types
- NFR47: AI shall support manual override when confidence is low

#### AI 模型提供商性能需求 (NFR48-NFR65)
- NFR48: System shall support at least 5 different AI model providers (local and cloud-based)
- NFR49: System shall complete AI model provider configuration within 2 minutes
- NFR50: System shall switch between AI model providers within 5 seconds without task interruption
- NFR51: System shall achieve 99.9% uptime for AI model provider connections
- NFR52: System shall provide real-time API response time monitoring for cloud-based models
- NFR53: System shall achieve API response time under 10 seconds for cloud-based models (95th percentile)
- NFR54: System shall automatically fallback to backup models within 3 seconds when primary model fails
- NFR55: System shall maintain consistent data accuracy across different AI model providers (within 2% variance)
- NFR56: System shall support concurrent requests to multiple AI model providers
- NFR57: System shall cache AI model responses to reduce redundant API calls
- NFR58: System shall provide accurate cost tracking for cloud-based AI models (within 1% accuracy)
- NFR59: System shall send cost alerts when approaching budget limits within 5% threshold
- NFR60: System shall complete AI model connectivity test within 10 seconds
- NFR61: System shall support model-specific parameter configuration (temperature, max tokens, etc.)
- NFR62: System shall validate AI model provider configuration before saving
- NFR63: System shall provide clear error messages when AI model provider configuration is invalid
- NFR64: System shall support export and import of AI model provider configurations
- NFR65: System shall maintain backward compatibility with existing AI model provider configurations

### Additional Requirements (from Architecture)

- WebSocket 事件版本控制：`X-Event-Version: v1` header，支持向后兼容
- AI 提供商配置迁移：系统密钥环加密存储，版本检测，备份回滚机制
- 错误码标准化：统一错误码体系（4xxxx 客户端错误，5xxxx 服务端错误）
- 日志级别定义：DEBUG/INFO/WARNING/ERROR/CRITICAL，环境区分配置
- 监控指标集成：Prometheus 兼容指标端点，JSON 格式支持
- Alembic 数据库迁移：PostgreSQL 模型版本化迁移
- 系统密钥环：API Key 加密存储（Windows DPAPI/macOS Keychain/Linux Secret Service）
- IndexedDB 离线存储：前端历史记录缓存，支持离线查看
- Playwright Worker Pool：10-20 并发浏览器实例，资源自动清理
- Celery 异步任务队列：Redis broker，任务进度事件推送
- WebSocket 实时通信：`/ws/progress/{task_id}` 端点，三级视图状态同步

### UX Design Requirements

**UX-DR1**: 简洁视图（默认）- 简洁聚焦式设计，零代码体验，大搜索框居中，2-3个示例网址，收起式左侧栏，80%用户第一周成功爬取至少一个网站

**UX-DR2**: 仪表板视图 - 卡片仪表板式，统计卡片（总爬取次数、成功率、活跃任务、数据条目），最近任务列表，快速操作，展开式左侧栏

**UX-DR3**: 专业视图 - 紧凑专业式，高密度信息展示，工具栏快速访问，详细配置面板，数据表格支持排序过滤，展开式左侧栏+顶部工具栏

**UX-DR4**: 视图切换机制 - 左侧导航栏顶部提供视图切换器，用户可以在三个视图之间自由切换，记住用户的视图偏好

**UX-DR5**: 首次使用引导 - 5步骤向导（欢迎页面、配置AI模型、输入网址、选择字段、预览结果），完成后显示庆祝动画，提示选择视图模式

**UX-DR7**: 颜色系统 - 蓝色科技主题，主色#3B82F6，次色#6366F1，警告色#F59E0B，错误色#EF4444，成功色#10B981

**UX-DR8**: 字体系统 - Inter/system-ui，Heading-1: 2rem/1.5, Heading-2: 1.75rem/1.5, Heading-3: 1.5rem/1.5, Body-1: 1rem/1.5, Body-2: 0.875rem/1.5, Caption: 0.875rem/1.5

**UX-DR9**: 间距系统 - 基础间距单位4px，XXS:4px, XS:8px, S:12px, M:16px, L:20px, XL:24px, XXL:32px

**UX-DR10**: 组件系统 - Naive UI设计系统 + 18个自定义组件（AIAnalysisProgress, FieldSelectionList, DataPreviewTable, FirstTimeWizard, BatchCrawlConfig, TaskMonitorPanel, CelebrationAnimation, SmartURLInput, ErrorHandlingDialog, ViewSwitcher, OfflineModeIndicator, OfflineQueueManager, OfflineDataBrowser, NetworkStatusMonitor, UndoRedoToolbar, UndoHistoryPanel, RecycleBin）

**UX-DR11**: 对比度标准 - WCAG 2.1 AA合规，正常文本4.5:1对比比，大文本3.1:1对比比，交互元素3.1:1对比比

**UX-DR12**: 焦点管理 - 所有交互元素支持键盘导航，清晰的焦点指示器（2px品牌色边框），跳过链接，快捷键支持

**UX-DR13**: ARIA标签 - 完整的可访问性支持，语义化HTML，状态变化实时通知，焦点管理

**UX-DR19**: 响应式策略 - 桌面端优化（完整左侧导航+主内容区，多显示器支持，分屏优化，键盘快捷键，系统集成通知，数据管道集成），最小窗口1024px×768px

**离线模式UX设计**:
- 状态指示器: 顶部显示"离线模式"徽章，颜色区分（灰色=离线，蓝色=在线）
- 最后同步时间: 显示"最后同步: 10分钟前"
- 队列计数: 显示"离线队列: 3个任务"
- 功能禁用: 需要网络的功能显示为禁用状态，悬停时显示"此功能需要网络连接"
- 本地数据访问: 支持浏览、搜索、筛选本地数据库中的历史数据
- 本地数据导出: 支持导出本地数据为JSON/CSV/Excel格式
- 队列管理: 提供查看和管理离线队列的界面
- 同步提示: 网络恢复时显示"网络已恢复，已切换到在线模式"通知

**撤销/重做UX设计**:
- 撤销提示: 操作后显示"已保存配置 - 撤销"提示，3秒后自动消失
- 撤销按钮: 工具栏提供撤销/重做按钮，显示可用状态
- 快捷键支持: Ctrl+Z撤销，Ctrl+Y重做（Windows/Linux），Cmd+Z撤销，Cmd+Shift+Z重做（macOS）
- 回收站: 删除的任务移动到回收站，显示"已删除 - 恢复"提示
- 恢复窗口: 任务删除后30天内可恢复，显示"30天后自动清理"
- 历史记录: 提供撤销历史记录界面，显示操作时间、类型、描述
- 选择性恢复: 支持从历史记录中选择性恢复特定操作
- 错误提示: 撤销失败时显示"无法撤销: [原因]"和替代方案

**按钮层次**:
- Primary按钮: 品牌色（#3B82F6），圆角8px，字体粗细500，用于主操作（开始爬取、保存、确认）
- Secondary按钮: 灰色边框，圆角8px，用于次要操作（重试、修改、下一步）
- Text按钮: 无背景，品牌色文字，用于辅助操作（查看详情、了解更多）
- 取消按钮: 灰色文字，用于放弃操作（取消、关闭、返回）

**反馈模式**:
- 成功反馈: 图标✅绿色勾选，背景浅绿色rgba(16,185,129,0.1)，文本绿色#10B981，动画淡入+轻微缩放
- 错误反馈: 图标❌红色叉号，背景浅红色rgba(239,68,68,0.1)，文本红色#EF4444，动画淡入+抖动
- 警告反馈: 图标⚠️黄色三角形，背景浅黄色rgba(245,158,11,0.1)，文本黄色#F59E0B，动画淡入+闪烁
- 信息反馈: 图标ℹ️蓝色圆圈，背景浅蓝色rgba(59,130,246,0.1)，文本蓝色#3B82F6，动画淡入
- 行为: 自动消失5秒，可手动关闭，位置右上角或顶部中央，支持堆叠最多3个

**表单模式和验证**:
- URL输入表单: 标签"输入网址"，输入框支持粘贴、历史记录，实时验证格式，错误提示显示在输入框下方，提供2-3个示例网址
- API Key输入表单: 标签"API Key"，输入框密码类型显示/隐藏切换，验证测试连接按钮，安全提示说明密钥加密存储
- 配置表单: 分组相关配置（AI模型、爬取设置、导出设置），提供"恢复默认"按钮，支持"保存并关闭"和"保存"，配置变更后显示"有未保存的更改"提示
- 验证规则: 实时验证（失去焦点时），提交时验证所有字段，显示具体的错误信息，禁用提交按钮直到所有字段有效

**导航模式**:
- 左侧导航: 固定在左侧，支持收起/展开，收起状态显示图标悬停显示标签，展开状态显示完整菜单项名称，当前选中品牌色背景+白色文字
- 视图切换: 位置左侧导航顶部或顶部导航，按钮组简洁、仪表板、专业，选中状态品牌色背景+白色文字，记住用户选择
- 面包屑导航: 位置内容区域顶部，结构首页>当前区域>当前页面，可点击非当前页面的面包屑

**模态和覆盖模式**:
- 确认对话框: 触发破坏性操作前，内容操作说明+影响范围，按钮取消（灰色）+确认（品牌色），尺寸medium最大宽度500px
- 错误对话框: 触发错误发生时，内容错误类型图标+错误描述+错误代码+可执行操作，按钮重试、查看详情、关闭，尺寸medium
- 设置对话框: 触发打开设置，内容标签页导航+配置选项，按钮取消、应用、保存，尺寸large最大宽度800px
- 首次使用向导: 触发首次启动，内容多步骤+进度指示，按钮上一步、下一步、跳过，尺寸fullscreen或large

**空状态和加载状态**:
- 首次使用空状态: 插图产品插图或图标，标题"开始你的第一次爬取"，描述"输入网址，AI自动提取数据"，操作开始爬取（主按钮）+查看示例（文本按钮）
- 历史记录空状态: 插图时钟图标，标题"还没有爬取历史"，描述"完成第一次爬取后，历史记录将显示在这里"，操作立即开始爬取（主按钮）
- 搜索无结果: 插图搜索图标，标题"没有找到结果"，描述"尝试使用不同的关键词"，操作清除搜索（文本按钮）
- 加载状态: 骨架屏显示内容结构预览，进度条显示进度百分比，加载动画旋转图标，估计时间显示预计剩余时间

**搜索和过滤模式**:
- 实时搜索: 输入框实时过滤无需按Enter，占位符"搜索..."，自动聚焦打开搜索时自动聚焦输入框，清除按钮输入非空时显示
- 高级过滤: 展开/收起默认收起点击展开，过滤条件按时间、按网址、按状态，组合条件支持AND逻辑，清除过滤一键清除所有条件
- 搜索结果: 高亮匹配关键词高亮显示，结果计数"找到X个结果"，无结果显示搜索无结果空状态，排序按时间、按名称

**核心体验定义**:
- 核心操作: 输入网址→AI分析→获得数据
- 首次使用引导: 提供清晰的首屏向导指导用户完成初始配置（AI模型选择），提供2-3个示例网址供快速体验，每个主要功能区域都有工具提示和简短说明，提供"快速开始"模式跳过高级配置直接开始爬取
- 渐进式功能访问: 基础层（默认）输入网址→AI分析→查看结果→导出数据，进阶层（展开）任务调度、批量URL、自定义字段，高级层（开发者模式）CLI接口、API集成、Python SDK

**平台策略**:
- 平台类型: Electron桌面应用，支持Windows、macOS、Linux三平台
- 交互方式: 主要基于鼠标和键盘，遵循各平台原生交互规范
- 平台特定功能: Windows系统托盘图标、原生通知、文件资源管理器集成（右键菜单），macOS Dock图标、Touch Bar支持（如果适用）、Spotlight搜索集成，Linux系统托盘、libnotify通知
- 命令行接口: 提供完整的CLI工具用于高级操作和脚本自动化
- API集成: 提供REST API和Python SDK，支持Airflow、Jupyter Notebook等工具集成

**轻松交互**:
- 应该完全自然、无需思考的操作: 在主界面输入网址（像搜索引擎一样的简单输入框），点击"开始爬取"或"分析"按钮，下载或打开导出的数据文件，查看和管理爬取历史记录，首次打开应用通过向导完成配置
- 消除竞争对手要求的步骤: 无需编写任何代码（CSS选择器、XPath等），无需手动配置浏览器驱动或环境，无需安装额外依赖（一键安装包包含所有必需组件），无需学习HTML/CSS/JavaScript知识，无需手动设置反爬虫策略（自动请求频率控制、User-Agent轮换）
- 应该自动发生的操作: AI自动识别页面结构和数据字段，请求频率控制（防止被反爬虫机制封锁），User-Agent字符串轮换（模拟不同浏览器），等待动态内容加载完成，数据清洗和格式化（统一输出格式），爬取失败时的智能重试（最多3次，指数退避），任务调度和定时执行

**关键成功时刻**:
- 用户意识到"这更好"的时刻: 第一次输入网址后几秒钟内AI就分析出了页面结构，看到准确识别的数据字段列表时（商品名称、价格、库存等），无需任何配置就成功爬取到完整数据时，对比传统爬虫需要几小时开发这里只需几秒钟，看到CLI和API可以自动化整个工作流
- 用户感到成功或完成的时刻: 点击"开始爬取"后看到进度条达到100%，打开导出的JSON/CSV/Excel文件看到完整、结构化的数据，看到爬取历史中有成功的记录和统计，第一次网站改版后爬虫仍然正常工作（AI自适应成功），批量爬取多个网站所有任务都成功完成，通过CLI或API成功自动化批量任务
- 如果失败会破坏体验的交互: AI分析页面结构失败没有清晰原因和解决建议，爬取过程中出错用户无法继续或重试当前任务，导出数据失败或格式错误，首次使用没有任何引导不知道从哪里开始，遇到错误时只有技术术语没有可操作的指导

**体验原则**:
1. 零代码优先 - 核心价值是完全不需要编程，核心流程应该让非技术用户也能轻松完成，这是与Scrapy、Puppeteer等工具的根本差异，所有主要功能都应该可以通过鼠标点击完成，代码/CLI/API仅作为高级选项供开发者使用
2. AI透明可见 - 让用户清楚理解AI的判断和不确定性（MVP阶段70-80%准确率，Post-MVP 90-95%），提供分析结果的预览和修正能力，建立信任而非掩盖黑盒，用户应该知道AI在做什么以及为什么做出某些判断，预览界面应该直观，修正应该简单
3. 渐进式能力 - 从最简单的方式开始，高级功能在需要时才显示，支持三种用户类型：专业开发者（需要CLI、API、SDK）、数据工程师（需要调度、集成、质量监控）、非技术分析师（只需要基本爬取和简单导出），界面随用户技术水平自适应，提供"专家模式"开关
4. 即时反馈即信任 - 清晰的进度显示、状态更新、错误解释，用户在任何时候都知道正在发生什么，这建立了对系统的信任，进度条、状态图标、实时预览都应该提供即时反馈，错误信息必须友好且包含可操作的解决步骤
5. 首次体验即成功 - 80%的注册用户应该在第一周内成功爬取至少一个网站，首次打开应用必须有清晰的引导、示例网址、简洁的配置流程，减少"第一次使用摩擦"是成功的关键因素

**设计系统集成**:
- 与Naive UI集成: 按钮层次使用Naive UI Button的type属性，反馈模式使用Naive UI Notification和Message组件，表单使用Naive UI Form组件和验证规则，导航使用Naive UI Menu和Sider组件，模态使用Naive UI Modal组件
- 自定义模式规则: 品牌色应用所有主操作使用品牌色（#3B82F6），圆角统一所有卡片、按钮、输入框使用8px圆角，间距一致使用4px基础单位（8px、12px、16px、24px、32px），阴影统一悬停时使用品牌色20%不透明度的阴影，字体层级Heading、Body、Caption字号一致

**实施优先级**:
- P0 - 核心功能（MVP）: 首次使用向导和引导，核心爬取流程（输入网址→AI分析→获得数据），基础数据管理和导出，网络状态监控和离线模式基础
- P1 - 增强功能（MVP+）: 批量爬取和任务调度，离线数据访问和队列管理，撤销/重做操作，错误处理和恢复
- P2 - 高级功能（Post-MVP）: 庆祝动画和成就系统，撤销历史记录和选择性恢复，回收站和任务恢复，性能优化和特性增强

**设计原则回顾**:
1. 用户价值优先 - 每个设计决策都服务于用户需求
2. 简单开始，渐进增强 - 新手用户不被高级功能干扰
3. 透明可见的AI - 用户理解AI的判断和不确定性
4. 即时反馈建立信任 - 每个操作都有清晰的视觉反馈
5. 优雅处理错误 - 友好的错误信息和可操作的解决步骤
6. 一致性体验 - 所有旅程共享导航、决策和反馈模式
7. 可访问性优先 - 所有组件支持键盘导航和屏幕阅读器
8. 性能优化 - 大数据量使用虚拟滚动，实时更新使用防抖

### FR Coverage Map

#### Epic 1: 首次使用引导与快速上手
- FR29: Users can access a desktop application for crawler configuration
- FR30: Users can input URLs through a simple, search-engine-like interface
- FR32: Users can view real-time crawling progress and status
- FR33: Users can manage and organize crawling tasks
- FR34: Users can view crawling history and results
- FR36: Users can customize interface settings and preferences
- FR37: Users can receive notifications for crawling completion and errors
- FR135: Users can undo recent configuration changes

#### Epic 2: AI驱动的页面分析与数据提取
- FR1: Users can provide a website URL for AI to analyze page structure
- FR2: Users can specify which data fields to extract from a webpage
- FR3: AI can automatically identify page structure and data field locations
- FR4: AI can extract data with 70-80% accuracy for common website types in MVP, improving to 95-98% through user feedback and iteration
- FR5: AI can recognize common page patterns (product lists, article details, user profiles)
- FR6: AI can understand relationships between data elements
- FR7: Users can view AI analysis results before starting extraction
- FR8: Users can manually adjust AI-identified data fields if needed
- FR9: AI can adapt to website structure changes within 48-72 hours
- FR10: AI can learn from user adjustments for future similar changes
- FR11: Users can configure multiple AI model providers (local and cloud-based)

#### Epic 3: 爬取任务管理与调度
- FR47: Users can create single-URL crawling tasks
- FR48: Users can create batch-URL crawling tasks
- FR49: Users can schedule crawling tasks for specific times
- FR50: Users can set crawling frequency (one-time, daily, weekly, etc.)
- FR51: Users can pause and resume crawling tasks
- FR52: Users can cancel running crawling tasks
- FR53: Users can view task execution logs
- FR54: Users can configure task-specific settings (depth, delay, etc.)
- FR55: Users can duplicate existing tasks with modified settings
- FR56: Users can organize tasks into groups or categories
- FR134: System can queue crawling tasks for execution when connectivity is restored
- FR136: Users can undo task deletion operations

#### Epic 4: 三级视图与用户界面
- FR31: Users can add multiple URLs for batch crawling
- FR35: Users can access CLI interface for advanced operations
- FR135: Users can undo recent configuration changes

#### Epic 5: 数据管理与导出
- FR38: Users can export crawled data in JSON format
- FR39: Users can export crawled data in CSV format
- FR40: Users can export crawled data in Excel format
- FR41: Users can organize data by data source into different tables in PostgreSQL database
- FR42: Users can customize database storage paths
- FR43: Users can view and manage exported data files
- FR44: Users can merge data from multiple crawling tasks
- FR45: Users can filter and search crawled data
- FR46: Users can delete or archive old crawling results
- FR133: Users can access previously crawled data while offline

#### Epic 6: 离线模式与数据持久化
- FR132: System can operate in offline mode without internet connectivity
- FR133: Users can access previously crawled data while offline
- FR134: System can queue crawling tasks for execution when connectivity is restored

#### Epic 7: 撤销/重做与操作恢复
- FR135: Users can undo recent configuration changes
- FR136: Users can undo task deletion operations

#### Epic 8: AI模型集成与多提供商支持
- FR12: Users can add local model providers (Ollama) with model name and configuration
- FR13: Users can add cloud model providers (OpenAI, Anthropic, Qwen, Doubao, GLM, Google Gemini) with API key and base URL
- FR14: Users can set priority for each AI model provider
- FR15: Users can configure model-specific parameters (temperature, max tokens, etc.)
- FR16: System can automatically select the best AI model based on task complexity
- FR17: Users can manually select which AI model to use for specific tasks
- FR18: System can automatically fallback to backup models when primary model is unavailable
- FR19: Users can view real-time API usage and cost for cloud-based models
- FR20: Users can set monthly cost budget and receive alerts when approaching limits
- FR21: System provides cost optimization recommendations based on usage patterns
- FR22: Users can enable/disable data anonymization before sending to cloud models
- FR23: System provides clear warnings about data privacy implications when using cloud models
- FR24: Users can test AI model connectivity and configuration before using
- FR25: System monitors and displays performance metrics for each model (response time, accuracy, success rate)
- FR26: Users can export and import AI model provider configurations
- FR27: System supports seamless switching between models without interrupting ongoing tasks
- FR28: Users can configure different models for different task types (simple analysis vs complex extraction)

#### Epic 9: 反爬虫机制与智能防护
- FR57: System can implement request frequency control
- FR58: System can rotate User-Agent strings
- FR59: System can implement IP rotation and proxy pools
- FR60: System can automatically handle CAPTCHAs
- FR61: System can simulate human behavior (random delays, mouse movement, scrolling)
- FR62: System can support dynamically loaded websites
- FR63: System can respect robots.txt rules
- FR64: System can respect target website terms of service
- FR65: Users can configure anti-crawling settings
- FR66: System can detect and respond to blocking attempts

#### Epic 10: 安全合规与隐私保护
- FR86: System stores all data in local PostgreSQL database without uploading to cloud
- FR87: System encrypts sensitive data during storage and transmission
- FR88: System implements strict access control
- FR89: System logs all data access and operations
- FR90: Users can configure privacy settings
- FR91: System provides clear privacy policy documentation
- FR92: System complies with GDPR requirements
- FR93: System complies with CCPA requirements
- FR94: System complies with Chinese cybersecurity and personal information protection laws
- FR95: Users can export or delete their data on request

#### Epic 11: 桌面部署与系统集成
- FR67: Users can install the application on Windows 10/11
- FR68: Users can install the application on macOS 10.15+
- FR69: Users can install the application on Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
- FR70: Users can deploy the application using Docker
- FR71: Users can deploy the application using Docker Compose
- FR72: Users can deploy the application using Kubernetes
- FR73: Users can integrate the application into CI/CD pipelines
- FR74: System can check for updates automatically
- FR75: Users can perform offline updates using installation packages
- FR76: System can rollback to previous versions if update fails
- FR77: Users can integrate crawling data into ETL processes
- FR78: Users can load crawling data into data warehouses (Snowflake, BigQuery, Redshift)
- FR79: Users can integrate real-time data streams into Kafka or Kinesis
- FR80: Users can use Python SDK in Jupyter Notebook
- FR81: Users can use Airflow Operator for task scheduling
- FR82: Users can import data directly into Tableau
- FR83: Users can integrate with system schedulers (Windows Task Scheduler, macOS launchd, Linux cron)
- FR84: Users can access REST API for programmatic control
- FR85: Users can configure webhooks for event notifications

#### Epic 12: 监控与性能优化
- FR114: Users can view real-time monitoring dashboard
- FR115: Users can monitor multiple crawling tasks simultaneously
- FR116: Users can receive alerts for task failures
- FR117: Users can view system resource usage (CPU, memory, network)
- FR118: Users can view crawling performance metrics (success rate, speed, errors)
- FR119: Users can export monitoring reports
- FR120: System can automatically detect and report anomalies
- FR121: Users can configure alert thresholds and notification methods
- FR122: Users can access historical performance data
- FR123: Users can view system performance metrics
- FR124: Users can set performance alert thresholds
- FR125: Users can view crawler task execution history
- FR126: Users can view data collection statistics
- FR127: Users can export performance reports
- FR128: System can automatically detect performance anomalies
- FR129: System can send performance alert notifications
- FR130: Users can configure alert notification methods
- FR131: Users can access historical performance data

#### Epic 13: 社区协作与模板共享
- FR96: Users can access a community platform
- FR97: Users can share crawling templates with the community
- FR98: Users can download templates shared by other users
- FR99: Users can rate and review templates
- FR100: Users can provide feedback on templates
- FR101: Users can access documentation and tutorials
- FR102: Users can interact with other community members
- FR103: Users can contribute to community knowledge base
- FR104: Users can report issues and request features
- FR105: Users can share crawler templates
- FR106: Users can browse community template library
- FR107: Users can download and use community templates
- FR108: Users can rate and review templates
- FR109: Users can follow other users
- FR110: Users can view followed users' activities
- FR111: Users can create collaborative projects
- FR112: Users can invite other users to join collaborative projects
- FR113: Users can assign tasks in collaborative projects

#### Epic 14: 基础设施-可观测性与日志审计
- NFR1-NFR8: System shall complete page analysis and data extraction within 8 seconds for 95th percentile through System shall achieve 80% task completion rate for first-time users
- NFR9-NFR17: System shall encrypt all sensitive data at rest using AES-256 through System shall support horizontal scaling through containerization

#### Epic 15: 基础设施-水平扩展与集成能力
- NFR18-NFR23: System shall handle 10x load growth through horizontal scaling through System shall handle 1 million records per data source without performance degradation
- NFR24-NFR31: System shall provide RESTful API with OpenAPI specification through System shall provide Helm Charts for Kubernetes deployment

## Epic List

### Epic 1: 首次使用引导与快速上手
**用户价值：** 新用户可以在5分钟内完成配置并成功爬取第一个网站，实现"首次体验即成功"
**FRs covered:** FR29, FR30, FR32, FR33, FR34, FR36, FR37, FR135
**UX需求：** UX-DR5（首次使用引导）、UX-DR1（简洁视图）、核心体验定义、轻松交互、关键成功时刻
**Story 数量：** 4 Stories

### Epic 2: AI驱动的页面分析与数据提取
**用户价值：** 用户输入网址后，AI自动分析页面结构并提取数据，准确率70-80%（MVP），无需编写代码
**FRs covered:** FR1-FR11
**UX需求：** UX-DR10（组件系统-AIAnalysisProgress, FieldSelectionList）、AI透明可见、即时反馈即信任
**Story 数量：** 6 Stories

### Epic 3: 爬取任务管理与调度
**用户价值：** 用户可以创建、管理、调度爬取任务，支持单次和批量爬取，实时查看进度
**FRs covered:** FR47-FR56, FR134, FR136
**UX需求：** UX-DR10（组件系统-TaskMonitorPanel, BatchCrawlConfig）、撤销/重做UX设计
**Story 数量：** 8 Stories

### Epic 4: 三级视图与用户界面
**用户价值：** 不同技术水平的用户可以选择适合的界面复杂度（简洁/仪表板/专业），提升使用效率
**FRs covered:** FR31, FR35, FR135
**UX需求：** UX-DR1-DR4（三级视图策略）、UX-DR10（组件系统-ViewSwitcher）、设计系统集成、按钮层次、反馈模式
**Story 数量：** 11 Stories

### Epic 5: 数据管理与导出
**用户价值：** 用户可以查看、搜索、过滤、导出爬取的数据，支持JSON/CSV/Excel格式，本地存储保证隐私
**FRs covered:** FR38-FR46, FR133
**UX需求：** UX-DR10（组件系统-DataPreviewTable）、搜索和过滤模式、表单模式和验证
**Story 数量：** 8 Stories

### Epic 6: 离线模式与数据持久化
**用户价值：** 网络断开时用户仍可查看历史数据、管理配置，网络恢复后自动同步
**FRs covered:** FR132, FR133, FR134
**UX需求：** 离线模式UX设计（状态指示器、队列管理、本地数据访问）、UX-DR10（组件系统-OfflineModeIndicator, OfflineQueueManager, OfflineDataBrowser, NetworkStatusMonitor）
**Story 数量：** 6 Stories

### Epic 7: 撤销/重做与操作恢复
**用户价值：** 用户误操作后可以撤销配置更改（最多10次）或恢复已删除任务（30天窗口），降低操作风险
**FRs covered:** FR135, FR136
**UX需求：** 撤销/重做UX设计（撤销提示、快捷键、回收站、历史记录）、UX-DR10（组件系统-UndoRedoToolbar, UndoHistoryPanel, RecycleBin）
**Story 数量：** 5 Stories

### Epic 8: AI模型集成与多提供商支持
**用户价值：** 用户可以配置多个AI模型提供商（本地Ollama、云端OpenAI等），设置优先级和参数，实现高可用性
**FRs covered:** FR12-FR28
**UX需求：** 表单模式和验证（API Key输入）、错误处理和恢复
**Story 数量：** 6 Stories

### Epic 9: 反爬虫机制与智能防护
**用户价值：** 系统自动处理反爬虫机制（请求频率控制、User-Agent轮换、CAPTCHA），提高爬取成功率
**FRs covered:** FR57-FR66
**UX需求：** 错误反馈模式、错误处理和恢复
**Story 数量：** 6 Stories

### Epic 10: 安全合规与隐私保护
**用户价值：** 所有数据本地存储，加密传输，符合GDPR/CCPA等法规要求，用户可以导出或删除数据
**FRs covered:** FR86-FR95
**UX需求：** 可访问性要求（UX-DR11-DR13）、安全提示
**Story 数量：** 8 Stories

### Epic 11: 桌面部署与系统集成
**用户价值：** 用户可以一键安装应用（Windows/macOS/Linux），集成到现有工作流（CLI、API、Airflow）
**FRs covered:** FR67-FR85
**UX需求：** 平台策略、响应式策略（UX-DR19）
**Story 数量：** 5 Stories

### Epic 12: 监控与性能优化
**用户价值：** 用户可以实时监控系统性能和任务状态，接收异常告警，优化爬取效率
**FRs covered:** FR114-FR131
**UX需求：** UX-DR2（仪表板视图）、反馈模式
**Story 数量：** 5 Stories

### Epic 13: 社区协作与模板共享
**用户价值：** 用户可以分享和下载爬取模板，参与社区讨论，贡献知识，加速开发
**FRs covered:** FR96-FR113
**UX需求：** 社区功能交互
**Story 数量：** 5 Stories

### Epic 14: 基础设施-可观测性与日志审计
**用户价值：** 系统提供完整的日志审计追踪，支持问题排查和合规证明
**NFRs covered:** NFR1-NFR8, NFR9-NFR17
**UX需求：** 可访问性要求、日志查看界面
**Story 数量：** 4 Stories

### Epic 15: 基础设施-水平扩展与集成能力
**用户价值：** 系统支持水平扩展和第三方集成，满足大规模使用需求
**NFRs covered:** NFR18-NFR23, NFR24-NFR31
**UX需求：** API文档、集成指南
**Story 数量：** 3 Stories

**总Stories数量：90**

## Epic 详细文档

每个 Epic 的详细 Stories 已保存到单独文件：

- [Epic 1: 首次使用引导与快速上手](./epic-01-first-time-onboarding.md) - 4 Stories
- [Epic 2: AI驱动的页面分析与数据提取](./epic-02-ai-page-analysis.md) - 6 Stories
- [Epic 3: 爬取任务管理与调度](./epic-03-crawl-task-management.md) - 8 Stories
- [Epic 4: 三级视图与用户界面](./epic-04-user-interface-interaction.md) - 11 Stories
- [Epic 5: 数据管理与导出](./epic-05-data-management-export.md) - 8 Stories
- [Epic 6: 离线模式与数据持久化](./epic-06-offline-mode-persistence.md) - 6 Stories
- [Epic 7: 撤销/重做与操作恢复](./epic-07-undo-redo-recovery.md) - 5 Stories
- [Epic 8: AI模型集成与多提供商支持](./epic-08-ai-model-integration.md) - 6 Stories
- [Epic 9: 反爬虫机制与智能防护](./epic-09-anti-crawling-mechanisms.md) - 6 Stories
- [Epic 10: 安全合规与隐私保护](./epic-10-security-compliance.md) - 8 Stories
- [Epic 11: 桌面部署与系统集成](./epic-11-desktop-deployment-system-integration.md) - 5 Stories
- [Epic 12: 监控与性能优化](./epic-12-monitoring-performance-optimization.md) - 5 Stories
- [Epic 13: 社区协作与模板共享](./epic-13-community-collaboration.md) - 5 Stories
- [Epic 14: 基础设施-可观测性与日志审计](./epic-14-observability-logging.md) - 4 Stories
- [Epic 15: 基础设施-水平扩展与集成能力](./epic-15-scalability-integration.md) - 3 Stories

## 完成总结

**所有需求覆盖验证：**
- ✅ 136 个 Functional Requirements (FR1-FR136) 全部覆盖
- ✅ 65 个 Non-Functional Requirements (NFR1-NFR65) 全部覆盖
- ✅ 30 个 UX Design Requirements (UX-DR1-UX-DR30) 全部覆盖
- ✅ 8 个 Additional Requirements (架构需求) 全部覆盖

**Stories 总数：** 90 个 Stories
**Epic 总数：** 15 个 Epics
