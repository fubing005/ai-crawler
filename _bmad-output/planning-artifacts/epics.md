---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics"]
inputDocuments: ["prd.md", "architecture.md", "ux-design-specification.md", "ux-enhanced-core-experience.md", "ux-visual-foundation.md"]
stepCompleted: "step-02-design-epics"
---

# vscode_bmad_method_test - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for vscode_bmad_method_test, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. AI Page Analysis and Data Extraction (FR1-FR10)**
- FR1: Users can provide a website URL for AI to analyze page structure
- FR2: Users can specify which data fields to extract from a webpage
- FR3: AI can automatically identify page structure and data field locations
- FR4: AI can extract data with 70-80% accuracy for common website types in MVP, improving to 90-95% through user feedback and iteration
  - Accuracy measurement: Manual sampling verification of extracted data against actual webpage content, calculating ratio of correctly identified fields to total fields
  - Error tolerance: Provide manual review and correction functionality, users can manually adjust AI-identified data fields, and system learns from user adjustments
- FR5: AI can recognize common page patterns (product lists, article details, user profiles)
- FR6: AI can understand relationships between data elements
- FR7: Users can view AI analysis results before starting extraction
- FR8: Users can manually adjust AI-identified data fields if needed
- FR9: AI can adapt to website structure changes within 48-72 hours
  - Technical implementation: Continuous monitoring of website structure changes, automatic triggering of re-analysis and model update processes
  - Manual trigger option: Users can manually trigger adaptation process without waiting for automatic adaptation
- FR10: AI can learn from user adjustments for future similar changes

**2. AI Model Provider Configuration (FR11-FR28)**
- FR11: Users can configure multiple AI model providers (local and cloud-based)
- FR12: Users can add local model providers (Ollama) with model name and configuration
- FR13: Users can add cloud model providers (OpenAI, Anthropic, Qwen, Doubao, GLM, Google Gemini) with API key and base URL
- FR14: Users can set priority for each AI model provider
- FR15: Users can configure model-specific parameters (temperature, max tokens, etc.)
- FR16: System can automatically select best AI model based on task complexity
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

**3. User Interface and Interaction (FR29-FR37)**
- FR29: Users can access a desktop application for crawler configuration (executable installation packages: .exe, .msi, .dmg, .deb, .rpm)
- FR30: Users can input URLs through a simple, search-engine-like interface
- FR31: Users can add multiple URLs for batch crawling
- FR32: Users can view real-time crawling progress and status
- FR33: Users can manage and organize crawling tasks
- FR34: Users can view crawling history and results
- FR35: Users can access CLI interface for advanced operations
- FR36: Users can customize interface settings and preferences
- FR37: Users can receive notifications for crawling completion and errors

**4. Data Management and Export (FR38-FR46)**
- FR38: Users can export crawled data in JSON format
- FR39: Users can export crawled data in CSV format
- FR40: Users can export crawled data in Excel format
- FR41: Users can organize data by data source into different tables in PostgreSQL database
- FR42: Users can customize database storage paths
- FR43: Users can view and manage exported data files
- FR44: Users can merge data from multiple crawling tasks
- FR45: Users can filter and search crawled data
- FR46: Users can delete or archive old crawling results

**5. Crawling Task Management (FR47-FR56)**
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

**6. Anti-Crawling and Compliance (FR57-FR66)**
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

**7. Platform and Deployment (FR67-FR76)**
- FR67: Users can install application on Windows 10/11
- FR68: Users can install application on macOS 10.15+
- FR69: Users can install application on Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
- FR70: Users can deploy application using Docker
- FR71: Users can deploy application using Docker Compose
- FR72: Users can deploy application using Kubernetes
- FR73: Users can integrate application into CI/CD pipelines
- FR74: System can check for updates automatically
- FR75: Users can perform offline updates using installation packages
- FR76: System can rollback to previous versions if update fails

**8. System Integration (FR77-FR85)**
- FR77: Users can integrate crawling data into ETL processes
- FR78: Users can load crawling data into data warehouses (Snowflake, BigQuery, Redshift)
- FR79: Users can integrate real-time data streams into Kafka or Kinesis
- FR80: Users can use Python SDK in Jupyter Notebook
- FR81: Users can use Airflow Operator for task scheduling
- FR82: Users can import data directly into Tableau
- FR83: Users can integrate with system schedulers (Windows Task Scheduler, macOS launchd, Linux cron)
- FR84: Users can access REST API for programmatic control
- FR85: Users can configure webhooks for event notifications

**9. Security and Compliance (FR86-FR95)**
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

**10. Community and Collaboration (FR96-FR113)**
- FR96: Users can access a community platform
- FR97: Users can share crawling templates with community
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

**11. Monitoring and Performance (FR114-FR131)**
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

**1. Performance (NFR1-NFR7)**
- NFR1: System shall complete page analysis and data extraction within 8 seconds for 95th percentile
  - Measurement context: From URL input to structured data output, including AI analysis and data extraction
  - Breakdown: Page analysis (3-4 seconds) + Data extraction (4-5 seconds) = Total 7-9 seconds (95th percentile: 8 seconds)
- NFR2: System shall support crawling 100 concurrent users
  - Measurement context: 100 users simultaneously accessing web interface and initiating crawling tasks
- NFR3: System shall handle 1,000 concurrent crawling tasks
  - Measurement context: 1,000 crawling tasks running simultaneously in background queue
  - Note: This is different from concurrent users (NFR2), which refers to users accessing the interface
- NFR4: System shall maintain response time under 200ms for API requests (95th percentile)
- NFR5: System shall support batch crawling of up to 1,000 URLs in a single task
- NFR6: System shall maintain 99.9% uptime during business hours
- NFR7: System shall optimize network requests to minimize bandwidth usage

**2. Security (NFR9-NFR16)**
- NFR9: System shall encrypt all sensitive data at rest using AES-256
  - Performance constraint: Encryption/decryption operations must complete within 100ms per 1MB data chunk
- NFR10: System shall encrypt all data in transit using TLS 1.3
  - Performance constraint: TLS handshake must complete within 3 seconds for 95th percentile
- NFR11: System shall implement role-based access control (RBAC)
  - Performance constraint: Permission checks must complete within 50ms for 95th percentile
- NFR12: System shall log all authentication attempts and (sensitive) data access
  - Performance constraint: Log write operations must complete within 500ms (async logging accepted for non-critical logs)
- NFR13: System shall support multi-factor authentication (MFA)
  - Performance constraint: MFA token verification must complete within 2 seconds for 95th percentile
- NFR14: System shall comply with OWASP Top 10 security standards
- NFR15: System shall perform security audits quarterly
- NFR16: System shall provide data export and deletion capabilities within 30 days of request
  - Performance constraint: Initial response to data export/delete request must occur within 24 hours

**3. Scalability (NFR17-NFR23)**
- NFR17: System shall support horizontal scaling through containerization
  - Performance constraint: Container scaling operations must complete within 5 minutes for typical node additions
- NFR18: System shall handle 10x load growth through horizontal scaling
- NFR19: System shall support distributed crawling across multiple nodes
- NFR20: System shall optimize database queries for large datasets
  - Performance constraint: Query execution time must not exceed 10 seconds for 95th percentile on datasets up to 1M records
- NFR21: System shall implement caching strategies to reduce load
  - Performance constraint: Cache hit ratio must exceed 70% for frequently accessed data
- NFR22: System shall support load balancing for concurrent requests
- NFR23: System shall handle 1 million records per data source without performance degradation

**4. Integration (NFR24-NFR31)**
- NFR24: System shall provide RESTful API with OpenAPI specification
  - Maintenance constraint: OpenAPI specification must be updated within 2 days of API changes
- NFR25: System shall support webhooks for event notifications
  - Performance constraint: Webhook delivery must occur within 10 seconds of event trigger for 95th percentile
- NFR26: System shall provide Python SDK with comprehensive documentation
  - Maintenance constraint: SDK documentation must be synchronized with API changes within 2 days
- NFR27: System shall provide Airflow Operator with examples
  - Maintenance constraint: Example workflows must be tested and updated quarterly
- NFR28: System shall support integration with Snowflake, BigQuery, Redshift
- NFR29: System shall support integration with Kafka, Kinesis for real-time data
- NFR30: System shall provide Docker images for all major platforms
- NFR31: System shall provide Helm Charts for Kubernetes deployment

**5. User Experience Quality (NFR32-NFR39)**
- NFR32: System shall complete user onboarding in under 5 minutes
- NFR33: System shall load main interface within 3 seconds (95th percentile)
- NFR34: System shall support keyboard shortcuts for common operations
- NFR35: System shall provide clear error messages with (actionable) guidance
  - Performance constraint: Error analysis and message generation must complete within 500ms
- NFR36: System shall maintain consistent UI/UX across all platforms
  - Verification constraint: UI/UX consistency must be verified and tested before each release
- NFR37: System shall support dark mode and accessibility features (WCAG 2.1 AA)
- NFR38: System shall provide contextual help and tooltips
  - Performance constraint: Contextual help content must load within 2 seconds for 95th percentile
- NFR39: System shall achieve 80% task completion rate for first-time users

**6. AI Reliability (NFR40-NFR47)**
- NFR40: AI shall achieve 70-80% data accuracy in MVP, improving to 90-95% through user feedback and iteration
  - Accuracy measurement: Manual sampling verification of extracted data against actual webpage content, calculating the ratio of correctly identified fields to total fields
  - Error tolerance: Provide manual review and correction functionality, users can manually adjust AI-identified data fields, and system learns from user adjustments
- NFR41: AI shall adapt to website structure changes within 48-72 hours
  - Technical implementation: Continuous monitoring of website structure changes, automatic triggering of re-analysis and model update processes
  - Manual trigger option: Users can manually trigger adaptation process without waiting for automatic adaptation
- NFR42: AI shall successfully adapt to 90% of website structure changes automatically
- NFR43: AI shall learn from user adjustments for future similar changes
  - Learning constraint: Model updates incorporating user feedback must be deployed within 24 hours of feedback collection
- NFR44: AI shall provide explanations for data extraction decisions
  - Performance constraint: Explanation generation must complete within 3 seconds for 95th percentile
- NFR45: AI shall handle edge cases gracefully with fallback mechanisms
  - Detection constraint: Edge case identification and recovery must be detected and handled within 5 seconds
- NFR46: AI shall maintain consistent performance across different website types
- NFR47: AI shall support manual override when confidence is low

**7. AI Model Provider Performance (NFR48-NFR65)**
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

**8. Maintenance Cost (NFR48-NFR54)**
- NFR48: System shall reduce maintenance time by 70% compared to traditional crawlers
- NFR49: System shall automatically detect and adapt to website structure changes
- NFR50: System shall provide automated error recovery and retry mechanisms
- NFR51: System shall generate actionable error messages for troubleshooting
- NFR52: System shall provide comprehensive logging for issue diagnosis
- NFR53: System shall support automated testing and validation
- NFR54: System shall minimize configuration changes required for new websites

**9. Local Deployment Resources (NFR55-NFR60)**
- NFR55: System shall run on machines with minimum 4GB RAM
- NFR56: System shall run on machines with minimum 2 CPU cores
- NFR57: System shall require maximum 10GB disk space for installation
- NFR58: System shall support offline operation without internet connectivity
- NFR59: System shall cache AI models locally for faster inference
- NFR60: System shall optimize resource usage to not impact user's other work

**10. Anti-Crawling Mechanisms (NFR61-NFR69)**
- NFR61: System shall implement request rate limiting to avoid detection
- NFR62: System shall rotate User-Agent strings for each request
- NFR63: System shall support proxy pool configuration
- NFR64: System shall automatically handle CAPTCHAs with 90% success rate
- NFR65: System shall simulate human behavior patterns (delays, scrolling, mouse movement)
- NFR66: System shall detect and respond to IP blocking
- NFR67: System shall respect robots.txt rules automatically
- NFR68: System shall provide configurable anti-crawling settings
- NFR69: System shall monitor and adapt to anti-crawling countermeasures

### Additional Requirements

**Technical Infrastructure Requirements**
- Playwright Python v1.51.0 integration with Worker Pool pattern for browser automation
- Celery async task processing framework for background crawling tasks
- PostgreSQL database for data storage and organization
- Redis for task queue and caching
- FastAPI async web framework for API endpoints
- Local deployment architecture ensuring data privacy
- Multi-layered anti-crawling strategy (frequency control, UA rotation, IP rotation, CAPTCHA handling)
- Data classification and grading protection mechanism
- Comprehensive audit logging system
- Unified AI model abstraction layer supporting multiple providers
- Automatic fallback mechanism between AI model providers
- Cost-aware model selection and budget management
- Data anonymization options for cloud model usage

**Deployment and Integration Requirements**
- Docker containerization support for all major platforms
- Docker Compose configuration for easy local deployment
- Helm Charts for Kubernetes deployment
- CI/CD pipeline integration support
- System scheduler integration (Windows Task Scheduler, macOS launchd, Linux cron)
- Python SDK for programmatic access
- REST API with OpenAPI specification
- Webhooks for event notifications
- Airflow Operator for workflow integration
- Data warehouse integration (Snowflake, BigQuery, Redshift)
- Real-time data streaming integration (Kafka, Kinesis)

### UX Design Requirements

**Core User Experience Requirements**
- Zero-code experience: Users can input URLs and extract data without writing code
- Search-engine-like simple interface for intuitive operation
- Real-time progress feedback and status visualization during crawling
- Intelligent data preview with inline editing and correction capabilities
- One-click export to JSON, CSV, and Excel formats
- Cross-platform consistency (Windows/macOS/Linux) with unified visual language
- Progressive disclosure of advanced features as user expertise grows
- Template library for common website patterns to reduce learning curve

**Visual Foundation Requirements**
- Design token system with color palette, spacing scales, typography tokens
- Consistent color usage across all components and platforms
- Semantic CSS classes for design pattern consolidation
- Responsive design with breakpoints for different screen sizes
- Dark mode support with high contrast ratios
- Accessibility compliance (WCAG 2.1 AA) with keyboard navigation and screen reader support

**Design Pattern Requirements**
- Loading states with clear progress indication and estimated time remaining
- Error handling UX with actionable guidance and recovery options
- Empty states with helpful guidance and call-to-action
- Focus indicators for keyboard navigation
- Confirmation dialogs for destructive actions (ConfirmActions component)
- Status messages with clear visual hierarchy (StatusMessage component)

**Platform-Specific Requirements**
- Windows: Follow Windows 11 design specifications, native notifications, system tray integration
- macOS: Follow macOS design specifications (San Francisco font, blur effects, rounded corners), native notifications, Dock integration, Touch Bar support
- Linux: Follow GNOME/KDE design specifications, libnotify notifications, system tray integration

**"Aha Moment" Design Requirements**
- Amplify first successful crawling moment with animations and celebration effects
- Highlight zero-code achievement with clear visual feedback
- Guide users to try additional features after initial success
- Showcase time saved compared to traditional crawling methods

### FR Coverage Map

**Epic 1: 用户认证和系统配置**
- FR11: Configure multiple AI model providers
- FR12: Add local model providers (Ollama)
- FR13: Add cloud model providers (OpenAI, Anthropic, Qwen, Doubao, GLM, Google Gemini)
- FR14: Set priority for AI model providers
- FR15: Configure model-specific parameters
- FR16: Automatic AI model selection
- FR17: Manual AI model selection
- FR18: Automatic fallback to backup models
- FR19: View real-time API usage and cost
- FR20: Set monthly cost budget and alerts
- FR21: Cost optimization recommendations
- FR22: Enable/disable data anonymization
- FR23: Data privacy warnings for cloud models
- FR24: Test AI model connectivity
- FR25: Monitor AI model performance metrics
- FR26: Export/import AI model configurations
- FR27: Seamless switching between models
- FR28: Configure different models for different tasks
- FR29: Desktop application access
- FR35: CLI interface access
- FR36: Customize interface settings and preferences
- FR86: Local data storage without cloud upload
- FR87: Sensitive data encryption
- FR88: Strict access control
- FR89: Audit logging
- FR90: Privacy settings configuration
- FR91: Privacy policy documentation

**Epic 2: AI 页面分析和数据提取**
- FR1: Provide website URL for AI analysis
- FR2: Specify data fields to extract
- FR3: Automatic page structure identification
- FR4: AI data extraction (70-80% MVP, 90-95% Post-MVP)
- FR5: Recognize common page patterns
- FR6: Understand data relationships
- FR7: View AI analysis results
- FR8: Manually adjust AI-identified fields
- FR9: AI can adapt to website structure changes within 48-72 hours

**Epic 3: 数据管理和导出**
- FR38: Export data in JSON format
- FR39: Export data in CSV format
- FR40: Export data in Excel format
- FR41: Organize data by source into PostgreSQL tables
- FR42: Customize database storage paths
- FR43: View and manage exported data files
- FR44: Merge data from multiple tasks
- FR45: Filter and search crawled data
- FR46: Delete or archive old results
- FR34: View crawling history and results
- FR95: Data export and deletion on request

**Epic 4: 爬取任务管理和调度**
- FR30: Input URLs through simple, search-engine-like interface
- FR33: Manage and organize crawling tasks
- FR47: Create single-URL crawling tasks
- FR48: Create batch-URL crawling tasks
- FR49: Schedule crawling tasks
- FR50: Set crawling frequency
- FR51: Pause and resume tasks
- FR52: Cancel running tasks
- FR53: View task execution logs
- FR54: Configure task-specific settings
- FR55: Duplicate existing tasks
- FR56: Organize tasks into groups
- FR31: Add multiple URLs for batch crawling
- FR32: View real-time crawling progress

**Epic 5: 反爬虫机制和合规**
- FR57: Request frequency control
- FR58: User-Agent string rotation
- FR59: IP rotation and proxy pools
- FR60: Automatic CAPTCHA handling
- FR61: Human behavior simulation
- FR62: Dynamically loaded websites support
- FR63: Respect robots.txt rules
- FR64: Respect target website terms of service
- FR65: Configure anti-crawling settings
- FR66: Detect and respond to blocking
- FR92: GDPR compliance
- FR93: CCPA compliance
- FR94: Chinese cybersecurity and personal information protection laws compliance

**Epic 6: 平台部署和系统集成**
- FR67: Install on Windows 10/11
- FR68: Install on macOS 10.15+
- FR69: Install on Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
- FR70: Deploy using Docker

- FR71: Deploy using Docker Compose
- FR72: Deploy using Kubernetes
- FR73: Integrate into CI/CD pipelines
- FR74: Automatic update checking
- FR75: Offline updates using installation packages
- FR76: Rollback to previous versions if update fails
- FR77: Integrate data into ETL processes
- FR78: Load data into data warehouses (Snowflake, BigQuery, Redshift)
- FR79: Integrate real-time data streams (Kafka, Kinesis)
- FR80: Use Python SDK in Jupyter Notebook
- FR81: Use Airflow Operator
- FR82: Import data into Tableau
- FR83: Integrate with system schedulers
- FR84: Access REST API
- FR85: Configure webhooks

**Epic 7: 监控和性能优化**
- FR114: Real-time monitoring dashboard
- FR115: Monitor multiple crawling tasks
- FR116: Receive task failure alerts
- FR117: View system resource usage
- FR118: View crawling performance metrics
- FR119: Export monitoring reports
- FR120: Automatic anomaly detection
- FR121: Configure alert thresholds
- FR122: Access historical performance data
- FR123: View system performance metrics
- FR124: Set performance alert thresholds
- FR125: View task execution history
- FR126: View data collection statistics
- FR127: Export performance reports
- FR128: Automatic performance anomaly detection
- FR129: Performance alert notifications
- FR130: Configure alert notification methods
- FR131: Access historical performance data
- FR37: Receive notifications for completion and errors

**Epic 8: 社区和协作**
- FR96: Access community platform
- FR97: Share crawling templates
- FR98: Download shared templates
- FR99: Rate and review templates
- FR100: Provide template feedback
- FR101: Access documentation and tutorials
- FR102: Interact with community members
- FR103: Contribute to community knowledge base
- FR104: Report issues and request features
- FR105: Share crawler templates
- FR106: Browse community template library
- FR107: Download and use community templates
- FR108: Rate and review templates
- FR109: Follow other users
- FR110: View followed users' activities
- FR111: Create collaborative projects
- FR112: Invite users to collaborative projects
- FR113: Assign tasks in collaborative projects

## Epic List

### Epic 1: 用户认证和系统配置

**目标：** 用户可以安装应用、配置 AI 模型提供商、设置系统偏好，并开始使用产品。

**用户成果：**
- 完成应用安装和首次设置
- 配置本地（Ollama）和云端（OpenAI、Anthropic、Qwen 等）AI 模型提供商
- 设置模型优先级和参数
- 配置隐私和安全设置
- 启用数据脱敏选项
- 访问 CLI 接口进行高级操作

**FRs 覆盖：** FR11-FR28, FR29, FR35, FR36, FR86-FR91

**技术备注：**
- 实统一 AI 模型抽象层支持多提供商
- 自动回退机制和成本追踪
- 设置向导引导用户首次配置
- 本地数据存储和 AES-256 加密
- RBAC 和审计日志

**依赖关系：** 无（基础 Epic）

---

### Epic 2: AI 页面分析和数据提取

**目标：** 用户可以输入网址，AI 自动分析页面结构，识别并提取数据字段。

**用户成果：**
- 输入网址进行 AI 分析
- AI 自动识别页面结构和数据字段位置
- 查看 AI 分析结果
- 手动调整 AI 识别的数据字段
- AI 从用户调整中学习
- MVP 阶段 70-80% 准确率，Post-MVP 90-95%

**FRs 覆 fancove：** FR1-FR10

**技术备注：**
- Playwright Python v1.51.0 浏览器自动化
- 页面结构学习算法
- 人工审核和修正功能
- 48-72 小时自适应能力

**依赖关系：** Epic 1（需要 AI 模型配置）

---

### Epic 3: 数据管理和导出

**目标：** 用户可以查看、搜索、过滤、合并和管理爬取的数据，并导出为多种格式。

**用户成果：**
- 查看、搜索和过滤爬取数据
- 合并多个任务的数据
- 导出为 JSON、CSV、Excel 格式
- 按数据源组织到 PostgreSQL 表
- 删除或归档旧结果
- 请求数据导出和删除

**FRs 覆盖：** FR34, FR38-FR46, FR95

**技术备注：**
- PostgreSQL 数据库存储
- 数据按源组织到不同表
- 批量导出支持

**依赖关系：** Epic 2（需要爬取的数据）

---

### Epic 4: 爬取任务管理和调度

**目标：** 用户可以创建、调度、暂停、恢复和管理爬取任务，包括单个和批量 URL。

**用户成果：**
- 创建单个和批量 URL 爬取任务
- 调度任务（定时、频率）
- 暂停、恢复、取消任务
- 查看任务执行日志
- 组织任务到组或类别
- 实时查看爬取进度

**FRs 覆盖：** FR30-FR33, FR47-FR56

**技术备注：**
- Celery 异步任务处理
- Redis 任务队列和缓存
- 系统调度器集成（Windows Task Scheduler、macOS launchd、Linux cron）
- 任务日志和历史记录

**依赖关系：** Epic 2（需要 AI 分析能力）

---

### Epic 5: 反爬虫机制和合规

**目标：** 用户系统自动处理反爬虫机制，遵守 robots.txt 和目标网站服务条款，确保法律合规。

**用户成果：**
- 自动请求频率控制
- User-Agent 和 IP 轮换
- 自动验证码处理
- 人类行为模拟
- 自动遵守 robots.txt
- 遵守 GDPR、CCPA、中国法律法规
- 数据采集前法律合规确认

**FRs 覆盖：** FR57-FR66, FR92-FR94

**技术备注：**
- 多层反爬虫策略
- 代理池配置
- 首次使用法律合规警告
- 数据本地存储和加密

**依赖关系：** Epic 4（需要爬取任务）

---

### Epic 6: 平台部署和系统集成

**目标：** 用户可以在多个平台部署应用，并通过 API、SDK 和集成工具与其他系统交互。

**用户成果：**
- 在 Windows、macOS、Linux 安装应用
- 使用 Docker、Docker Compose、Kubernetes 部署
- 集成到 CI/CD 流程
- 访问 REST API 和 Python SDK
- 集成到数据仓库（Snowflake、BigQuery、Redshift）
- 集成到实时数据流（Kafka、Kinesis）
- 使用 Airflow Operator、Tableau 集成

**FRs 覆盖：** FR67-FR76, FR77-FR85

**技术备注：**
- 跨平台安装包生成
- Docker 镜像和 Helm Charts
- OpenAPI specification
- 系统调度器集成

**依赖关系：** Epic 2（需要爬取功能）

---

### Epic 7: 监控和性能优化

**目标：** 用户可以实时监控系统性能、资源使用情况和爬取任务状态，接收告警通知。

**用户成果：**
- 实时监控仪表板
- 监控多个爬取任务
- 查看系统资源使用（CPU、内存、网络）
- 查看爬取性能指标
- 接收任务失败和性能异常告警
- 导出监控报告
- 访问历史性能数据

**FRs 覆盖：** FR37, FR114-FR131

**技术备注：**
- 实时性能指标收集
- 异常检测算法
- 告警通知系统
- 历史数据存储和查询

**依赖关系：** Epic 4（需要爬取任务）

---

### Epic 8: 社区和协作

**目标：** 用户可以访问社区平台，分享和下载爬取模板，评价和反馈，参与社区互动和协作项目。

**用户成果：**
- 访问社区平台
- 分享和下载爬取模板
- 评价和反馈模板
- 访问文档和教程
- 与社区成员互动
- 创建协作项目和邀请成员
- 关注其他用户并查看活动

**FRs 覆盖：** FR96-FR113

**技术备注：**
- 模板分享和下载系统
- 评价和反馈系统
- 用户关注和活动流
- 协作项目和任务分配


**依赖关系：** Epic 2（需要有效的爬取模板）

---

## Epic Stories 文件引用

以下是每个 Epic 的详细 Stories 文件：

- [Epic 1: 用户认证和系统配置](epic-01-user-auth-and-system-config-stories.md) - 8 个 Stories
- [Epic 2: AI 页面分析和数据提取](epic-02-ai-page-analysis-and-data-extraction-stories.md) - 8 个 Stories
- [Epic 3: 数据管理和导出](epic-03-data-management-export-stories.md) - 9 个 Stories
- [Epic 4: 爬取任务管理和调度](epic-04-crawling-task-management-and-scheduling-stories.md) - 10 个 Stories
- [Epic 5: 反爬虫机制和合规](epic-05-anti-crawling-mechanisms-and-compliance-stories.md) - 10 个 Stories
- [Epic 6: 平台部署和系统集成](epic-06-platform-deployment-and-system-integration-stories.md) - 12 个 Stories
- [Epic 7: 监控和性能优化](epic-07-monitoring-and-performance-optimization-stories.md) - 15 个 Stories
- [Epic 8: 社区和协作](epic-08-community-and-collaboration-stories.md) - 13 个 Stories

**总计：** 85 个 Stories，覆盖所有 131 个功能需求（FR）和 87 个非功能需求（NFR）

---

