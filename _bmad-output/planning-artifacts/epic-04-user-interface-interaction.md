---
title: Epic 4 - 三级视图与用户界面
priority: P0
---

# Epic 4: 三级视图与用户界面 (P0)

**用户价值：** 不同技术水平的用户可以选择适合的界面复杂度（简洁/仪表板/专业），提升使用效率

**FR 覆盖：** FR31, FR35, FR135

**UX需求：** UX-DR1-DR4（三级视图策略）、UX-DR10（组件系统-ViewSwitcher）、设计系统集成、按钮层次、反馈模式

**Story 数量：** 11 Stories

---

## Story 4.1: 简洁视图设计与实现

作为新手用户，
我希望看到简洁直观的界面，
以便快速上手并完成基本操作。

**Acceptance Criteria:**

**Given** 用户首次进入系统
**When** 默认显示简洁视图
**Then** 核心功能（输入网址）占据主要位置
**And** 高级功能隐藏在"更多"菜单中

**Given** 简洁视图布局
**When** 用户在 1366x768 或 1920x1080 分辨率下使用
**Then** 界面元素清晰可辨，无重叠或截断
**And** 布局自适应窗口大小

**Given** 简洁视图主界面
**When** 查看页面布局
**Then** 大搜索框居中，类似搜索引擎体验
**And** 提供 2-3 个示例网址供快速体验
**And** 左侧导航栏收起状态，悬停展开
**And** 最小化干扰，只显示核心功能

**Given** 用户调整窗口大小
**When** 窗口缩放
**Then** 界面布局重新排列适应
**And** 核心功能始终可见

**Requirements Covered:** UX-DR1, UX-DR19
**Technical Constraints:** NFR33 (主界面加载 <3秒)

---

## Story 4.2: 仪表板视图设计与实现

作为数据工程师，
我希望看到任务管理面板和实时监控，
以便高效管理多个爬取任务。

**Acceptance Criteria:**

**Given** 用户切换到仪表板视图
**When** 进入该视图
**Then** 显示卡片布局，统计卡片（总爬取次数、成功率、活跃任务、数据量）
**And** 显示最近任务列表，包含任务状态和进度
**And** 显示快速操作（新建任务、导入配置、查看文档）
**And** 左侧导航栏展开状态

**Given** 仪表板视图主界面
**When** 查看页面布局
**Then** 卡片仪表板式设计
**And** 信息密度中等，平衡信息和操作
**And** 实时状态和统计数据显示
**And** 查看所有运行和完成的任务
**And** 一键访问常用功能
**And** 数据可视化优先

**Given** 用户在仪表板视图
**When** 查看任务监控
**Then** 显示任务执行进度
**And** 显示数据预览
**And** 显示快速访问入口

**Requirements Covered:** UX-DR2, UX-DR19
**Technical Constraints:** NFR4 (API响应时间 <200ms)

---

## Story 4.3: 专业视图设计与实现

作为开发者或高级用户，
我希望看到完整的控制台和高级配置，
以便进行精确控制和批量操作。

**Acceptance Criteria:**

**Given** 用户切换到专业视图
**When** 进入该视图
**Then** 显示多面板布局，包含 API 调试器、CLI 终端、配置编辑器
**And** 显示高级功能（代码导出、自定义配置、性能分析）
**And** 左侧导航栏展开状态 + 顶部工具栏
**And** 可定制侧边栏

**Given** 专业视图主界面
**When** 查看页面布局
**Then** 紧凑专业式设计
**And** 高密度信息展示，最大化信息显示
**And** 效率优先，支持批量爬取和导出
**And** 工具栏快速访问功能
**And** 详细配置面板
**And** 数据表格支持排序过滤

**Given** 用户在专业视图
**When** 查看高级功能
**Then** 显示 CLI 集成入口
**And** 显示 API 调试面板
**And** 显示高级配置选项
**And** 显示代码导出功能

**Requirements Covered:** UX-DR3, UX-DR19
**Technical Constraints:** NFR4 (API响应时间 <200ms)

---

## Story 4.4: 视图切换器组件

作为用户，
我希望能够在三个视图之间自由切换，
以便根据当前任务选择最适合的界面。

**Acceptance Criteria:**

**Given** 用户在任何视图中
**When** 点击视图切换按钮（简洁/仪表板/专业）
**Then** 界面立即切换到对应视图
**And** 保持当前任务和数据状态

**Given** 用户查看视图切换器
**When** 查看组件位置
**Then** 显示在左侧导航栏顶部或顶部导航
**And** 按钮组包含简洁、仪表板、专业三个选项
**And** 选中状态显示品牌色背景 + 白色文字

**Given** 用户切换视图
**When** 之前配置了特定视图的偏好
**Then** 自动应用该视图的个性化设置
**And** 保存视图切换历史

**Given** 用户选择视图
**When** 系统记住用户选择
**Then** 下次启动时自动进入上次选择的视图
**And** 保存到本地存储

**Requirements Covered:** UX-DR4, UX-DR10 (ViewSwitcher组件)
**Technical Constraints:** NFR4 (API响应时间 <200ms)

---

## Story 4.5: 批量URL输入界面

作为数据采集人员，
我希望在简洁视图中添加多个网址，
以便批量处理相似网站。

**Acceptance Criteria:**

**Given** 用户在简洁视图
**When** 点击"批量添加"
**Then** 切换到批量输入模式
**And** 显示文本区域支持粘贴多个网址

**Given** 用户输入多个网址
**When** 每行一个网址或以逗号分隔
**Then** 系统验证每个网址格式
**And** 高亮显示无效网址

**Given** 用户完成批量输入
**When** 点击"创建任务"
**Then** 创建批量爬取任务
**And** 显示任务数量和状态

**Requirements Covered:** FR31
**Technical Constraints:** NFR4 (API响应时间 <200ms)

---

## Story 4.6: CLI接口集成

作为开发者或高级用户，
我希望使用命令行接口进行高级操作，
以便集成到脚本或自动化工作流。

**Acceptance Criteria:**

**Given** 用户打开终端或命令提示
**When** 运行 `ai-crawler --help`
**Then** 显示可用命令列表和参数说明

**Given** 用户使用 CLI 创建任务
**When** 执行 `ai-crawler create --url https://example.com`
**Then** 返回任务 ID 和状态
**And** 任务加入执行队列

**Given** 用户查询任务状态
**When** 执行 `ai-crawler status <task-id>`
**Then** 显示任务当前状态、进度百分比
**And** 显示最近 5 条日志

**Given** 用户批量创建任务
**When** 执行 `ai-crawler batch --file urls.txt`
**Then** 读取文件并创建多个任务
**And** 显示创建成功和失败的任务数

**Given** 用户导出数据
**When** 执行 `ai-crawler export <task-id> --format json`
**Then** 导出指定任务的数据到指定格式
**And** 显示输出文件路径

**Given** 用户在专业视图
**When** 点击"CLI 集成"帮助
**Then** 显示常用命令示例
**And** 提供复制到剪贴板功能

**Requirements Covered:** FR35
**Technical Constraints:** NFR4 (API响应时间 <200ms)

---

## Story 4.7: 按钮层次系统

作为用户，
我希望看到清晰的按钮层次，
以便快速识别主要操作和次要操作。

**Acceptance Criteria:**

**Given** 用户查看界面中的按钮
**When** 查看按钮样式
**Then** Primary按钮使用品牌色（#3B82F6），圆角8px，字体粗细500
**And** Secondary按钮使用灰色边框，圆角8px
**And** Text按钮无背景，品牌色文字
**And** 取消按钮使用灰色文字

**Given** 用户查看主要操作
**When** 查看开始爬取、保存、确认等操作
**Then** 使用Primary按钮样式
**And** 在界面中突出显示

**Given** 用户查看次要操作
**When** 查看重试、修改、下一步等操作
**Then** 使用Secondary按钮样式
**And** 在界面中适度显示

**Given** 用户查看辅助操作
**When** 查看查看详情、了解更多等操作
**Then** 使用Text按钮样式
**And** 在界面中低调显示

**Given** 用户查看放弃操作
**When** 查看取消、关闭、返回等操作
**Then** 使用取消按钮样式
**And** 在界面中清晰显示

**Requirements Covered:** UX-DR10 (按钮层次)
**Technical Constraints:** NFR36 (一致UI/UX)

---

## Story 4.8: 反馈模式系统

作为用户，
我希望看到清晰的反馈信息，
以便了解操作结果和系统状态。

**Acceptance Criteria:**

**Given** 用户操作成功
**When** 查看反馈
**Then** 显示图标✅绿色勾选
**And** 背景浅绿色rgba(16,185,129,0.1)
**And** 文本绿色#10B981
**And** 动画淡入+轻微缩放

**Given** 用户操作失败
**When** 查看反馈
**Then** 显示图标❌红色叉号
**And** 背景浅红色rgba(239,68,68,0.1)
**And** 文本红色#EF4444
**And** 动画淡入+抖动

**Given** 用户操作有警告
**When** 查看反馈
**Then** 显示图标⚠️黄色三角形
**And** 背景浅黄色rgba(245,158,11,0.1)
**And** 文本黄色#F59E0B
**And** 动画淡入+闪烁

**Given** 用户查看信息提示
**When** 查看反馈
**Then** 显示图标ℹ️蓝色圆圈
**And** 背景浅蓝色rgba(59,130,246,0.1)
**And** 文本蓝色#3B82F6
**And** 动画淡入

**Given** 反馈显示
**When** 查看行为
**Then** 自动消失5秒
**And** 可手动关闭
**And** 位置右上角或顶部中央
**And** 支持堆叠最多3个

**Requirements Covered:** UX-DR10 (反馈模式)
**Technical Constraints:** NFR35 (清晰错误信息)

---

## Story 4.9: 表单模式和验证

作为用户，
我希望看到清晰的表单和验证提示，
以便正确输入信息。

**Acceptance Criteria:**

**Given** 用户查看URL输入表单
**When** 查看表单元素
**Then** 显示标签"输入网址"
**And** 输入框支持粘贴、历史记录
**And** 实时验证格式
**And** 错误提示显示在输入框下方
**And** 提供2-3个示例网址

**Given** 用户查看API Key输入表单
**When** 查看表单元素
**Then** 显示标签"API Key"
**And** 输入框密码类型显示/隐藏切换
**And** 验证测试连接按钮
**And** 安全提示说明密钥加密存储

**Given** 用户查看配置表单
**When** 查看表单元素
**Then** 分组相关配置（AI模型、爬取设置、导出设置）
**And** 提供"恢复默认"按钮
**And** 支持"保存并关闭"和"保存"
**And** 配置变更后显示"有未保存的更改"提示

**Given** 用户输入表单
**When** 验证规则
**Then** 实时验证（失去焦点时）
**And** 提交时验证所有字段
**And** 显示具体的错误信息
**And** 禁用提交按钮直到所有字段有效

**Requirements Covered:** UX-DR10 (表单模式和验证)
**Technical Constraints:** NFR35 (清晰错误信息)

---

## Story 4.10: 导航模式系统

作为用户，
我希望看到清晰的导航结构，
以便快速访问不同功能区域。

**Acceptance Criteria:**

**Given** 用户查看左侧导航
**When** 查看导航元素
**Then** 固定在左侧
**And** 支持收起/展开
**And** 收起状态显示图标悬停显示标签
**And** 展开状态显示完整菜单项名称
**And** 当前选中品牌色背景+白色文字

**Given** 用户查看视图切换
**When** 查看切换元素
**Then** 位置左侧导航顶部或顶部导航
**And** 按钮组简洁、仪表板、专业
**And** 选中状态品牌色背景+白色文字
**And** 记住用户选择

**Given** 用户查看面包屑导航
**When** 查看导航元素
**Then** 位置内容区域顶部
**And** 结构首页>当前区域>当前页面
**And** 可点击非当前页面的面包屑

**Requirements Covered:** UX-DR10 (导航模式)
**Technical Constraints:** NFR36 (一致UI/UX)

---

## Story 4.11: 配置撤销功能

作为用户，
我希望能够撤销最近的配置更改，
以便避免误操作导致配置错误。

**Acceptance Criteria:**

**Given** 用户修改配置（如界面设置、AI 模型配置等）
**When** 保存配置更改
**Then** 系统记录配置快照到历史记录
**And** 显示"配置已保存"提示

**Given** 用户需要撤销配置更改
**When** 点击"撤销"按钮或使用快捷键（Ctrl+Z）
**Then** 恢复到上一个配置快照
**And** 显示"已撤销配置更改"通知
**And** 界面立即应用恢复的配置

**Given** 用户连续修改配置
**When** 多次点击"撤销"
**Then** 按时间倒序逐步恢复配置
**And** 最多支持撤销最近 10 次配置更改

**Given** 用户查看配置历史
**When** 进入设置页面的"历史记录"标签
**Then** 显示配置更改时间线
**And** 每个条目显示：时间、更改类型、预览

**Given** 用户需要恢复到特定历史版本
**When** 选择历史记录中的某个版本
**Then** 显示该版本的配置预览
**And** 确认后恢复到该版本

**Given** 用户在离线状态
**When** 修改配置
**Then** 配置保存到本地（IndexedDB）
**And** 支持离线撤销操作

**Given** 配置撤销后
**When** 用户重新加载页面
**Then** 恢复后的配置保持有效
**And** 不丢失撤销历史

**Requirements Covered:** FR135
**Technical Constraints:** NFR4 (API响应时间 <200ms), IndexedDB离线存储 (架构)

---

## Epic 4 完成

**Stories 数量：** 11 Stories
**FR 覆盖：** FR31, FR35, FR135 ✅
**UX需求：** UX-DR1-DR4, UX-DR10, 设计系统集成, 按钮层次, 反馈模式 ✅
