---
title: Epic 2 - AI驱动的页面分析与数据提取
priority: P0
---

# Epic 2: AI驱动的页面分析与数据提取 (P0)

**用户价值：** 用户输入网址后，AI自动分析页面结构并提取数据，准确率70-80%（MVP），无需编写代码

**FR 覆盖：** FR1-FR11

**UX需求：** UX-DR10（组件系统-AIAnalysisProgress, FieldSelectionList）、AI透明可见、即时反馈即信任

**Story 数量：** 6 Stories

---

## Story 2.1: 网址输入与页面结构分析

作为数据采集人员，
我希望输入网址后系统能自动分析页面结构，
以便我无需编写代码就能了解页面内容和布局。

**Acceptance Criteria:**

**Given** 用户在简洁视图中
**When** 输入网址并点击"分析"
**Then** 显示"正在分析..."进度提示
**And** 8秒内返回分析结果（95th 百分位）

**Given** 页面分析完成
**When** AI 识别到页面类型（产品列表、文章详情、用户表单等）
**Then** 显示页面类型标签
**And** 高亮显示页面主要内容区域
**And** 显示推荐的待提取数据字段

**Given** 用户输入无效网址
**When** URL 格式不正确或无法访问
**Then** 显示明确的错误提示（如"网址格式错误"或"无法访问该网站"）
**And** 提供建议（检查网址拼写、尝试其他网址）

**Given** 页面结构复杂或混乱
**When** AI 无法确定主要内容区域
**Then** 显示"分析结果不确定"提示
**And** 提供手动选择区域的功能

**Requirements Covered:** FR1, FR3, FR5
**Technical Constraints:** NFR1 (页面分析 <8秒 95th), NFR6 (99.9%可用性)

---

## Story 2.2: 数据字段指定与智能提取

作为数据采集人员，
我希望指定需要提取的数据字段并让 AI 自动提取，
以便我能获得结构化的数据而无需手动处理。

**Acceptance Criteria:**

**Given** AI 已完成页面分析
**When** 用户在推荐字段列表中选择或自定义字段
**Then** 显示选中的字段和对应的数据类型

**Given** 用户点击"提取数据"
**When** 开始数据提取过程
**Then** 显示实时提取进度
**And** 提取完成后显示结果预览

**Given** 数据提取完成
**When** MVP 阶段（首次使用常见网站类型）
**Then** 数据准确率达到 70-80%
**And** 标注不确定的字段

**Given** 提取结果包含数据关系（如产品价格、数量、评论数）
**When** 显示结果表格
**Then** 保持字段之间的关联结构
**And** 支持展开/折叠嵌套数据

**Given** 提取结果部分正确
**When** 用户标记错误字段
**Then** 高亮显示错误区域
**And** 提供修正选项

**Requirements Covered:** FR2, FR4, FR6, NFR40
**Technical Constraints:** NFR4 (API响应时间 <200ms), NFR6 (99.9%可用性)

---

## Story 2.3: AI分析结果预览与手动调整

作为数据采集人员，
我希望在开始正式提取前预览 AI 的分析结果并手动调整，
以便确保提取的准确性并优化提取规则。

**Acceptance Criteria:**

**Given** AI 完成页面结构分析
**When** 显示分析结果
**Then** 以可视化方式展示页面元素定位（如高亮框、连接线）

**Given** 用户查看字段定位
**When** 某个字段定位不准确
**Then** 支持用户拖动选择框重新定位
**And** 更新字段关联关系

**Given** 用户需要添加新字段
**When** 在页面中点击或框选新区域
**Then** 自动识别该区域的数据类型（文本、数字、日期、链接等）
**And** 提示输入字段名称

**Given** 用户修改字段定位或添加新字段
**When** AI 基于用户调整更新分析
**Then** 重新计算页面结构识别
**And** 显示"分析已更新"提示

**Given** 用户完成调整
**When** 点击"确认并提取"
**Then** 保存所有调整到当前任务配置
**And** 传递给数据提取模块

**Requirements Covered:** FR7, FR8
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 2.4: AI模型提供商基础配置

作为系统管理员或高级用户，
我希望配置多个 AI 模型提供商（本地和云端），
以便实现高可用性和成本优化。

**Acceptance Criteria:**

**Given** 用户进入"AI 模型配置"页面
**When** 点击"添加提供商"
**Then** 显示提供商类型选择（本地：Ollama；云端：OpenAI, Anthropic, Qwen, Doubao, GLM, Google Gemini）

**Given** 用户选择本地提供商（Ollama）
**When** 输入模型名称和配置（base URL, 端口）
**Then** 提供"测试连接"按钮
**And** 测试成功后保存配置

**Given** 用户选择云端提供商
**When** 输入 API Key 和 base URL
**Then** 系统使用系统密钥环加密存储（架构要求）
**And** 测试连接成功后保存

**Given** 已配置多个提供商
**When** 查看提供商列表
**Then** 显示每个提供商的状态（在线/离线）、响应时间、优先级
**And** 支持拖动调整优先级

**Given** 用户测试连接
**When** 连接失败（API Key 错误、网络问题）
**Then** 显示明确错误信息和解决建议
**And** 保存失败配置供用户重试

**Given** 用户更新现有提供商配置
**When** 系统检测到版本变化
**Then** 自动备份旧配置
**And** 支持回滚到之前版本（架构要求）

**Requirements Covered:** FR11, FR24
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 2.5: 网站结构变化自适应学习

作为长期使用的数据采集人员，
我希望系统能自动适应网站结构的变化并学习我的调整，
以便减少维护工作并保持高提取准确率。

**Acceptance Criteria:**

**Given** 用户使用某网站配置进行爬取
**When** 该网站结构发生变化（CSS 选择器失效、布局改变）
**Then** 系统自动检测变化并尝试重新定位
**And** 在 48-72 小时内完成适应（NFR41）

**Given** AI 尝试重新定位
**When** 能成功找到新的对应元素
**Then** 自动更新配置并记录变化
**And** 通知用户"配置已自动更新"

**Given** AI 重新定位失败
**When** 检测到显著变化但无法确认
**Then** 标记任务为"需要人工确认"
**And** 发送通知给用户

**Given** 用户手动修正配置
**When** 重新定位字段并保存
**Then** AI 记录此次修正模式
**And** 对未来类似网站结构变化应用相同模式

**Given** AI 从用户调整中学习
**When** 遇到相同类型的网站或相似变化模式
**Then** 提高自适应成功率
**And** 90% 的变化能自动处理（NFR42）

**Requirements Covered:** FR9, FR10, NFR41, NFR42, NFR43
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 2.6: 动态网站与JavaScript内容支持

作为数据采集人员，
我希望系统能处理 JavaScript 动态加载的网站，
以便获取单页应用（SPA）和异步加载的内容。

**Acceptance Criteria:**

**Given** 用户输入网址进行页面分析
**When** 系统检测到网站使用大量 JavaScript（如 React、Vue、Angular）
**Then** 使用 Playwright Worker Pool 模式加载页面（架构要求）
**And** 等待所有动态内容加载完成

**Given** 页面包含异步加载内容（懒加载、无限滚动）
**When** AI 分析页面结构
**Then** 支持模拟滚动、点击触发等交互
**And** 等待新内容加载后继续分析

**Given** 页面需要用户交互才能显示内容（点击展开、下拉选择）
**When** 分析过程中遇到交互元素
**Then** 提示用户"需要手动触发"
**And** 支持用户配置交互规则

**Given** 动态内容加载超时
**When** 8 秒内未检测到内容变化
**Then** 提取当前已加载内容
**And** 标记"部分加载完成"

**Given** Playwright 浏览器实例运行中
**When** 任务完成或超时
**Then** 自动清理资源，释放内存
**And** 确保不超过 10-20 并发实例限制（架构要求）

**Requirements Covered:** FR62, Playwright Worker Pool (架构)
**Technical Constraints:** NFR1 (页面分析 <8秒)

---

## Epic 2 完成

**Stories 数量：** 6 Stories
**FR 覆盖：** FR1-FR11 ✅
**UX需求：** UX-DR10, AI透明可见, 即时反馈即信任 ✅
