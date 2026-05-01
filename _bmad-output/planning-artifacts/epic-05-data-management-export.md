---
title: Epic 5 - 数据管理与导出
priority: P0
---

# Epic 5: 数据管理与导出 (P0)

**用户价值：** 用户可以查看、搜索、过滤、导出爬取的数据，支持JSON/CSV/Excel格式，本地存储保证隐私

**FR 覆盖：** FR38-FR46, FR133

**UX需求：** UX-DR10（组件系统-DataPreviewTable）、搜索和过滤模式、表单模式和验证

**Story 数量：** 8 Stories

---

## Story 5.1: 数据导出功能

作为数据采集人员，
我希望将爬取的数据导出为常用格式，
以便后续分析和使用。

**Acceptance Criteria:**

**Given** 任务已完成并显示结果
**When** 用户点击"导出"
**Then** 显示导出格式选择（JSON、CSV、Excel .xlsx）

**Given** 用户选择 JSON 格式
**When** 点击确认导出
**Then** 生成结构化的 JSON 文件
**And** 保持原始数据结构和关系

**Given** 用户选择 CSV 格式
**When** 数据包含嵌套结构
**Then** 展平嵌套数据或创建关联 CSV 文件
**And** 添加表头行

**Given** 用户选择 Excel 格式
**When** 导出大量数据
**Then** 自动分页（每个 sheet 最多 100 万行）
**And** 保留数据类型（数字、日期、文本）
**And** 正确处理 UTF-8 编码和中文字符

**Given** 导出完成
**When** 文件生成成功
**Then** 显示"导出成功"提示
**And** 显示文件保存位置
**And** 提供"打开文件夹"按钮

**Requirements Covered:** FR38, FR39, FR40
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 5.2: PostgreSQL 数据存储

作为数据采集人员，
我希望数据按来源组织存储到本地 PostgreSQL 数据库，
以便高效查询和管理大量数据。

**Acceptance Criteria:**

**Given** 任务完成数据采集
**When** 数据准备存储
**Then** 根据数据源自动创建或更新表结构
**And** 使用 Alembic 迁移系统管理表版本（架构要求）

**Given** 数据包含复杂结构（嵌套对象、数组）
**When** 映射到 PostgreSQL 表
**Then** 创建关联表（主表 + 子表）
**And** 添加外键约束

**Given** 数据库表已存在
**When** 检测到结构变化
**Then** 自动生成 Alembic 迁移脚本
**And** 支持手动执行迁移

**Given** 用户查看数据库内容
**When** 访问数据管理页面
**Then** 显示按数据源组织的表列表
**And** 每个表显示记录数和最后更新时间

**Given** 数据库包含大量数据
**When** 查询或导出
**Then** 性能无明显下降（支持 100 万记录/数据源）
**And** 查询响应时间 < 200ms（95th 百分位）

**Requirements Covered:** FR41, NFR20, NFR23, Alembic数据库迁移 (架构)
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 5.3: 自定义存储路径

作为数据采集人员，
我希望自定义数据库存储路径，
以便管理磁盘空间和数据组织。

**Acceptance Criteria:**

**Given** 用户进入数据管理设置
**When** 选择"存储路径"配置
**Then** 显示当前数据库路径
**And** 提供"浏览"选择新路径

**Given** 用户选择新路径
**When** 确认更改
**Then** 显示警告"更改存储路径需要移动现有数据"
**And** 提供选项：移动数据或仅应用新路径

**Given** 用户选择移动数据
**When** 确认移动操作
**Then** 将现有数据库文件复制到新位置
**And** 更新配置文件指向新路径

**Given** 用户选择仅应用新路径
**When** 确认设置
**Then** 下次启动时使用新路径创建数据库
**And** 旧数据保留在原位置（可手动删除）

**Given** 用户选择的路径无效
**When** 路径不存在或无写权限
**Then** 显示明确错误提示
**And** 恢复到原路径或提示重新选择

**Requirements Covered:** FR42
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 5.4: 数据文件管理

作为数据采集人员，
我希望查看和管理导出的数据文件，
以便跟踪历史导出和重新使用数据。

**Acceptance Criteria:**

**Given** 用户进入数据管理页面
**When** 查看"导出历史"标签
**Then** 显示导出文件列表
**And** 每个文件显示：文件名、格式、大小、创建时间、关联任务

**Given** 用户查看文件列表
**When** 使用筛选和排序
**Then** 支持按格式筛选（JSON/CSV/Excel）
**And** 支持按时间或大小排序

**Given** 用户需要查看文件内容
**When** 点击文件或"预览"按钮
**Then** 在浏览器中预览（JSON/CSV）或下载预览
**And** Excel 文件显示前 100 行预览

**Given** 用户需要删除导出文件
**When** 选择文件并点击删除
**Then** 显示确认对话框
**And** 确认后删除文件并更新列表

**Given** 用户需要重新导出
**When** 点击"重新导出"按钮
**Then** 使用原任务配置重新执行导出
**And** 生成新文件（不覆盖原文件）

**Requirements Covered:** FR43
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 5.5: 数据合并与筛选

作为数据采集人员，
我希望合并多个任务的数据并支持筛选搜索，
以便整合和查找特定数据。

**Acceptance Criteria:**

**Given** 用户有多个相似任务的数据
**When** 选择任务并点击"合并"
**Then** 显示合并预览（总记录数、字段映射）
**And** 询问是否合并重复记录

**Given** 用户确认合并
**When** 执行合并操作
**Then** 创建合并后的新数据集
**And** 保留原任务数据不变

**Given** 用户需要筛选数据
**When** 查看数据预览或管理页面
**Then** 显示筛选选项（按字段、值范围、日期）
**And** 支持组合多个筛选条件

**Given** 用户输入搜索关键词
**When** 在数据列表中搜索
**Then** 实时显示匹配记录
**And** 高亮匹配字段

**Given** 用户查看数据库表
**When** 执行复杂查询
**Then** 支持保存查询模板
**And** 下次直接加载模板

**Given** 数据包含大量记录
**When** 筛选或搜索
**Then** 分页显示结果（每页 100 条）
**And** 显示总记录数和当前页码

**Requirements Covered:** FR44, FR45
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 5.6: 数据归档与删除

作为数据采集人员，
我希望删除或归档旧的爬取数据，
以便释放存储空间并保持数据整洁。

**Acceptance Criteria:**

**Given** 用户查看数据管理页面
**When** 选择旧数据或任务
**Then** 显示"删除"和"归档"选项

**Given** 用户选择删除
**When** 点击删除按钮
**Then** 显示警告"删除后无法恢复"
**And** 显示占用存储空间大小

**Given** 用户确认删除
**When** 执行删除操作
**Then** 删除关联的数据库记录和文件
**And** 更新数据库表结构（如果表为空）

**Given** 用户选择归档
**When** 点击归档按钮
**Then** 将数据移动到归档目录
**And** 保留元数据（任务信息、时间戳）

**Given** 用户查看归档数据
**When** 切换到"归档"视图
**Then** 显示已归档任务列表
**And** 支持"恢复"操作

**Given** 用户恢复归档数据
**When** 点击恢复按钮
**Then** 将数据移回主数据库
**And** 标记为可查询状态

**Given** 磁盘空间不足
**When** 系统检测到空间警告
**Then** 提示用户清理旧数据
**And** 显示占用空间最大的任务列表

**Requirements Covered:** FR46
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 5.7: Excel 导出高级特性

作为数据采集人员，
我希望 Excel 导出支持高级特性（多 sheet、日期格式、编码处理），
以便在 Excel 中进行数据分析和处理。

**Acceptance Criteria:**

**Given** 导出大量数据到 Excel
**When** 超过 Excel 单个 sheet 限制（约 100 万行）
**Then** 自动分页到多个 sheets
**And** 每个sheet命名为"数据_1", "数据_2"等

**Given** 数据包含日期字段
**When** 导出到Excel
**Then** 日期格式化为Excel可识别格式
**And** 支持Excel日期排序和筛选

**Given** 数据包含特殊字符或中文字符
**When** 导出到Excel
**Then** 正确处理UTF-8编码
**And** 中文字符正常显示

**Given** Excel 文件包含多个 sheets
**When** 用户打开文件
**Then** 每个 sheet 包含表头
**And** 表头与数据类型正确映射

**Requirements Covered:** FR40
**Technical Constraints:** NFR6 (99.9%可用性)

---

## Story 5.8: 离线数据访问

作为数据采集人员，
我希望在网络断开时能够查看已爬取的数据，
以便不因网络问题影响数据分析和使用。

**Acceptance Criteria:**

**Given** 用户在网络断开状态下
**When** 进入数据管理页面
**Then** 显示本地数据库中的所有数据
**And** 标注"离线模式，仅显示本地数据"

**Given** 用户在离线状态
**When** 查看已爬取的数据
**Then** 支持浏览、搜索、筛选本地数据
**And** 显示数据预览（前 100 条记录）

**Given** 用户在离线状态
**When** 需要导出数据
**Then** 支持导出本地数据为 JSON/CSV/Excel
**And** 显示"离线导出完成"提示

**Given** 用户在离线状态
**When** 尝试创建新的爬取任务
**Then** 显示"网络断开，无法创建新任务"提示
**And** 提供选项：加入离线队列或等待网络恢复

**Given** 网络恢复连接
**When** 用户在数据管理页面
**Then** 自动同步最新数据状态
**And** 显示"网络已恢复，数据已同步"通知

**Given** 离线期间有新数据
**When** 网络恢复后
**Then** 自动更新数据列表
**And** 显示新增数据的数量

**Given** 用户在离线状态
**When** 查看数据统计
**Then** 显示本地数据统计（总记录数、数据源数量）
**And** 标注"最后同步时间"

**Requirements Covered:** FR133
**Technical Constraints:** NFR6 (99.9%可用性), IndexedDB离线存储 (架构)

---

## Epic 5 完成

**Stories 数量：** 8 Stories
**FR 覆盖：** FR38-FR46, FR133 ✅
**UX需求：** UX-DR10, 搜索和过滤模式, 表单模式和验证 ✅
