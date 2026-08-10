# Story 1.3: 任务管理与历史记录

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为新用户，
我希望能查看和管理我的爬取任务，
以便我能了解爬取进度和历史结果。

## Acceptance Criteria

1. **AC1 - "最近爬取"区域填充真实历史卡片**：用户完成首次爬取后（或在已存在历史任务时进入简洁视图），简洁视图下方"最近爬取"区域由 1-2 的空状态占位升级为真实历史卡片列表；每个卡片高度 80px、宽度 100%、圆角 8px，展示 3 项核心信息：任务标题（取页面标题前 24 字符或 URL hostname）、爬取时间（相对时间格式如"3 分钟前"、绝对时间 tooltip）、数据条目数（如"156 条数据"），符合 NFR4（API 响应 <200ms 95th percentile 列表渲染）。 [Source: epic-01-first-time-onboarding.md#L78-L92, ux-design-specification.md#L3353-L3372, ux-design-specification.md#L3378 历史卡片尺寸, 1-2-simple-view-url-input.md#L22 AC8 占位升级]
2. **AC2 - 任务状态徽标**：每个历史卡片显示状态徽标（进行中/已完成/失败），颜色按 UX 规范品牌色与反馈模式：进行中=蓝色 #3B82F6 旋转图标、已完成=绿色 #10B981 对勾图标、失败=红色 #EF4444 警告图标；徽标使用 Naive UI `n-tag` size="small" 渲染，`aria-label` 描述完整状态（如"任务状态：已完成"）。 [Source: epic-01-first-time-onboarding.md#L86-L89, ux-design-specification.md#L2568-L2602 反馈模式, ux-design-specification.md#L3320-L3321 爬取成功/失败视觉, architecture.md#L614-L628 TaskMonitorPanel states]
3. **AC3 - 任务列表全量展示与空状态保留**：任务列表展示所有历史爬取任务（按时间倒序，最新在前），不分页（Phase 1 MVP 假设单用户任务量 <100）；列表为空时保留 1-2 的空状态插图 + "还没有爬取历史" + "立即开始爬取"按钮（按钮行为沿用 1-2：滚动到顶部并聚焦 URL 输入框）；空状态文本与 1-2 完全一致避免回归。 [Source: epic-01-first-time-onboarding.md#L98-L102, ux-design-specification.md#L2723-L2727 历史记录空状态, 1-2-simple-view-url-input.md#L22 AC8, frontend/src/views/SimpleView.vue#L41-L47]
4. **AC4 - 任务详情抽屉**：用户点击历史卡片，打开右侧抽屉（Naive UI `n-drawer` placement="right" width="480px"）展示任务详情：任务 ID、URL、爬取时间、数据条目数、AI 识别字段列表（含字段名 + selector + 置信度 + 样本值）、执行日志摘要、数据导出按钮（导出按钮在 Phase 1 仅显示"导出数据"占位 + disabled + tooltip "导出功能由 Epic 5 交付"，不实现真实导出）。 [Source: epic-01-first-time-onboarding.md#L92-L96, ux-design-specification.md#L2713-L2727, architecture.md#L614-L628 TaskMonitorPanel task logs expandable, epic-05-data-management-export.md 数据导出边界]
5. **AC5 - 历史记录持久化到 LocalStorage**：任务完成后（mock 模式下 `crawl()` 返回时，或真实后端 WebSocket `task_completed` 事件到达时）自动将任务写入 LocalStorage key `ai-crawler:crawl-history`（数组形式，最多保留 50 条，超过自动 FIFO 截断最老条目）；下次启动应用时自动加载，离线可查看；禁止使用 IndexedDB（Epic 6 离线模式专用，本 story 不引入 indexdb 依赖）。 [Source: architecture.md#L191 用户偏好存储 LocalStorage, project-context.md#L166-L176 Pinia persist, 1-2-simple-view-url-input.md#L24 AC10 persist 模式, prd.md#L1993-L2007 撤销历史限制模式]
6. **AC6 - 历史记录 Pinia store 独立**：创建 `frontend/src/stores/crawl.ts`（Setup Store 语法，与 1-2 `ui.ts` 风格一致），导出 `useCrawlStore`：state `{ history: CrawlTaskRecord[], activeTask: CrawlTaskRecord | null }` + actions `addTask(record)` / `removeTask(id)` / `clearHistory()` / `getTaskById(id)`；通过 `pinia-plugin-persistedstate`（1-2 已安装 ^3.x）持久化 `history` 字段；与 `useUiStore` 解耦避免循环依赖。 [Source: architecture.md#L1342-L1356 useCrawlStore 命名, architecture.md#L1711 useCrawlStore.js 路径, architecture.md#L188 Pinia stores 按视图分离, 1-2-simple-view-url-input.md#L250 crawl.ts 边界声明]
7. **AC7 - SmartURLInput 历史 dropdown 接通**：1-2 SmartURLInput 预留的 `historyItems?: string[]` prop 在本 story 接通：从 `useCrawlStore().history` 提取最近 5 条任务的 URL（去重），输入框聚焦时显示 Naive UI `n-popover` 浮层列出历史 URL 选项（每项显示 URL hostname + 相对时间），点击填充 URL 输入框；空历史时不显示浮层（避免空 dropdown 视觉污染）。 [Source: architecture.md#L650-L664 SmartURLInput 历史 dropdown, 1-2-simple-view-url-input.md#L189 Gap 1 历史 dropdown 由 Story 1.3 实现, ux-design-specification.md#L3734-L3735 历史记录下拉]
8. **AC8 - 任务删除与撤销**：每个历史卡片支持"删除"操作（卡片右侧"查看 / 导出 / 删除"按钮组中的删除按钮），点击后任务从 `useCrawlStore().history` 移除并持久化；不实现 30 天回收站（Epic 7 Story 7-4 task-deletion-recovery 交付），本 story 删除即永久删除但提供"撤销"通知（Naive UI `n-message` type="info" duration=5000 含"撤销"按钮，5 秒内点击恢复任务到原位置）；撤销仅在同会话有效（刷新页面后撤销能力消失，符合 Phase 1 MVP）。 [Source: epic-01-first-time-onboarding.md#L98-L102, ux-design-specification.md#L2879-L2883 任务删除30天恢复窗口由 Epic 7 交付, ux-design-specification.md#L2883 即时撤销提示, epic-07-undo-redo-recovery.md 边界声明]
9. **AC9 - 简洁视图文案符合王芳 persona**：所有可见文案延续 1-2 王芳 persona 规范——历史卡片任务标题用页面标题或 hostname（非"task_id: abc123"）、时间为"3 分钟前"（非 ISO 8601）、状态徽标为"已完成"（非"completed"）、删除按钮为"删除"（非"Delete Task"）、空详情为"还没有详情"（非"No data"）、撤销通知为"已删除，5 秒内可撤销"（非"Task deleted"）。 [Source: prd.md#L1406-L1424 王芳 persona, 1-2-simple-view-url-input.md#L336-L358 王芳文案指导, 1-1-desktop-app-install-launch.md#L359-L377 王芳文案落地]
10. **AC10 - 与 Story 1.2 测试无回归**：本 story 不修改 `frontend/src/views/SimpleView.vue` 1-2 已通过的 11 个测试断言（含"还没有爬取历史" / "立即开始爬取"空状态、"请先粘贴网址" / "网址格式不正确" 等错误提示、"开始爬取"按钮文案、Ctrl+Enter 提交、视图切换触发 store 更新等）；空状态分支保留，新增历史卡片分支仅在 `history.length > 0` 时渲染；新增测试 ≥12 个覆盖新功能。 [Source: 1-2-simple-view-url-input.md#L429-L445 1-2 测试清单, frontend/tests/components/SimpleView.test.ts#L1-L206, project-context.md#L178-L200 测试规范]
11. **AC11 - 任务完成写入历史闭环**：1-2 的 `runCrawl` 流程在 `setStatus('completed')` 后（[frontend/src/views/SimpleView.vue#L120](frontend/src/views/SimpleView.vue#L120)）调用 `useCrawlStore().addTask(record)` 写入历史记录；record 含字段：`id`（crypto.randomUUID()）、`url`、`pageTitle`（取 analyze response 的 page_title）、`extractedCount`、`completedAt`（Date.now()）、`status: 'completed'`、`fields`（取 analyze response 的 fields 数组）；失败路径写入 `status: 'failed'` 记录便于用户复盘。 [Source: epic-01-first-time-onboarding.md#L86-L92, architecture.md#L1347-L1355 useCrawlStore history shape, 1-2-simple-view-url-input.md#L96-L129 runCrawl 流程]
12. **AC12 - 单元/组件测试覆盖**：新增 `frontend/tests/stores/crawl.test.ts`（≥10 测试：addTask、addTask FIFO 50 截断、removeTask、removeTask 清空 activeTask、getTaskById、persist 持久化、restoreTask 邻居 ID 重定位 (null/missing/valid)、startTick/stopTick refcount）、`frontend/tests/components/HistoryCard.test.ts`（≥5 测试：状态徽标渲染、时间格式、点击触发详情、删除触发事件、空字段防御）、`frontend/tests/components/TaskDetailDrawer.test.ts`（≥4 测试：字段列表渲染、关闭事件、导出按钮 disabled、空日志占位）、`frontend/tests/components/SmartURLInputHistory.test.ts`（≥3 测试：historyItems 渲染、点击填充 URL、空历史不显示浮层）、`frontend/tests/composables/useStatusTag.test.ts`（≥5 测试：4 状态分支 + fallback + 共享引用克隆保护）；扩展 `SimpleView.test.ts` 新增 ≥4 测试（爬取完成后历史卡片出现、点击卡片打开抽屉、删除卡片移除条目、撤销恢复+位置验证）；覆盖率目标新增文件 ≥85% 行覆盖；不增加 E2E 测试（爬取流程 E2E 由 Epic 2 覆盖）。 [Source: project-context.md#L178-L200 测试规范, 1-2-simple-view-url-input.md#L27 AC14 测试基线, 1-1-desktop-app-install-launch.md#L256-L269]

## Tasks / Subtasks

- [x] **Task 1 — `useCrawlStore` 创建与持久化 (AC: 5, 6, 11)**
  - [x] 1.1 创建 `frontend/src/stores/crawl.ts`：Setup Store 语法（与 1-2 `ui.ts` 一致），`defineStore('crawl', () => {...}, { persist: { key: 'ai-crawler:crawl-history', storage: localStorage, pick: ['history'] } })`
  - [x] 1.2 定义 `CrawlTaskRecord` 类型（新增 `frontend/src/types/crawl.ts`）：`{ id: string; url: string; pageTitle: string; extractedCount: number; completedAt: number; status: 'completed' | 'failed'; fields: AnalyzedField[] }`
  - [x] 1.3 State：`const history = ref<CrawlTaskRecord[]>([])` + `const activeTask = ref<CrawlTaskRecord | null>(null)`
  - [x] 1.4 Actions：
    - `addTask(record: CrawlTaskRecord)`：`history.value.unshift(record)`；若 `history.value.length > 50` 截断到 50（FIFO，移除最老条目）
    - `removeTask(id: string)`：`history.value = history.value.filter(t => t.id !== id)`
    - `clearHistory()`：`history.value = []`
    - `getTaskById(id: string)`：`return history.value.find(t => t.id === id) ?? null`
    - `setActiveTask(id: string)`：`activeTask.value = getTaskById(id)`（供详情抽屉使用）
  - [x] 1.5 **禁止**在 store 中调用 API（业务逻辑放组件 / composable，store 仅状态容器）
  - [x] 1.6 **禁止**修改 `useUiStore`（1-2 已交付视图偏好持久化，本 story 解耦）

- [x] **Task 2 — `HistoryCard` 组件实现 (AC: 1, 2, 8, 9)**
  - [x] 2.1 创建 `frontend/src/components/simple/HistoryCard.vue`（按 architecture.md#L1699 `simple/` 子目录约定，与 1-2 `ProgressPanel.vue` 同目录）
  - [x] 2.2 Props：`{ record: CrawlTaskRecord }` + Emits：`['view', 'export', 'delete']`
  - [x] 2.3 模板：根 `article` 标签 + 3 区块（左侧状态徽标 + 中间标题/时间/条数 + 右侧按钮组"查看 / 导出 / 删除"）；卡片高度 80px、圆角 8px、阴影 `0 1px 3px rgba(0,0,0,0.08)`、悬停阴影 `0 4px 12px rgba(0,0,0,0.12)`
  - [x] 2.4 状态徽标：使用 `n-tag` size="small" + `n-icon`：
    - `completed` → `n-tag type="success"` + `CheckmarkCircle` 图标 + 文案"已完成"
    - `failed` → `n-tag type="error"` + `AlertCircle` 图标 + 文案"失败"
    - 进行中状态本 story 不渲染（写入历史的均为终态），但保留 `running` 分支占位为 `n-tag type="info"` + `Reload` 图标 + 文案"进行中"
  - [x] 2.5 时间格式：使用 `Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })` 计算 `<60s / <60m / <24h / <7d / >=7d` 五档相对时间（"刚刚"、"3 分钟前"、"2 小时前"、"昨天"、"3 天前"）；超过 7 天显示绝对日期 `YYYY-MM-DD`；`title` 属性显示完整 ISO 时间
  - [x] 2.6 任务标题：`record.pageTitle?.slice(0, 24) || new URL(record.url).hostname`；兜底 `'未命名任务'`（pageTitle 与 URL 解析都失败时）
  - [x] 2.7 数据条目数：`{record.extractedCount} 条数据`；`extractedCount === 0` 时显示"未提取到数据"
  - [x] 2.8 按钮组：3 个 `n-button` size="small" type="text"——"查看"（emit `view`）、"导出"（emit `export`，Prop `disabled` 由父控制）、"删除"（emit `delete`，`type="error"` 文本色）
  - [x] 2.9 可访问性：`article` 标签 `role="article"` + `aria-label="{任务标题} - 状态：{状态文案} - {时间} - {条数}"`；按钮 `aria-label` 完整描述（"查看任务详情"、"导出任务数据"、"删除任务"）；键盘 Enter 触发"查看"

- [x] **Task 3 — `TaskDetailDrawer` 组件实现 (AC: 4, 9)**
  - [x] 3.1 创建 `frontend/src/components/simple/TaskDetailDrawer.vue`（按 `simple/` 子目录约定）
  - [x] 3.2 Props：`{ show: boolean; record: CrawlTaskRecord | null }` + Emits：`['update:show', 'export']`
  - [x] 3.3 模板：`n-drawer :show="show" @update:show="emit('update:show', $event)" placement="right" :width="480"`
  - [x] 3.4 内容区：
    - 头部：任务标题（大字号）+ 状态徽标（复用 HistoryCard 的徽标渲染逻辑，抽出 `useStatusTag` composable 或共享函数）
    - 元信息列表：URL（`n-ellipsis` 显示完整 URL tooltip）、爬取时间（绝对 + 相对）、数据条目数、任务 ID（前 8 字符 + tooltip 完整 ID）
    - 字段列表：`v-for="field in record.fields"` 渲染字段名 + selector（`code` 标签）+ 置信度（百分比 + `n-progress` type="line" size="small"）+ 样本值（`n-ellipsis`）
    - 日志摘要：Phase 1 MVP 静态文案"详情日志由 Epic 3 Story 3-5 交付"（占位 `n-text` depth="3" italic）
    - 底部操作：`n-button` "导出数据" disabled + 原生 HTML `title="导出功能即将推出"` attribute（不引入 `n-tooltip`，与 1-2 ViewSwitcher disabled tooltip 一致避免新组件依赖膨胀）
  - [x] 3.5 空状态：`record === null` 时显示 `n-empty` description="还没有详情"+ 提示"点击历史卡片可查看任务详情"
  - [x] 3.6 王芳文案：所有标签使用"任务详情"、"网址"、"爬取时间"、"数据条数"、"AI 识别的字段"、"导出数据"（避免 "Task Detail" / "URL" / "Crawled At" / "Extracted Fields" / "Export"）

- [x] **Task 4 — `SimpleView` 改造接通历史卡片列表 (AC: 1, 3, 4, 8, 10, 11)**
  - [x] 4.1 修改 `frontend/src/views/SimpleView.vue`：
    - 替换 1-2 的 `simple-view__history` 空状态占位（[frontend/src/views/SimpleView.vue#L41-L47](frontend/src/views/SimpleView.vue#L41-L47)）为条件渲染：`v-if="crawlStore.history.length === 0"` 显示原空状态，`v-else` 渲染 `HistoryCard` 列表
  - [x] 4.2 引入 `useCrawlStore` 并暴露 `history` computed；
    - 列表渲染：`v-for="record in crawlStore.history"`（store 内已按 unshift 顺序——最新在前；无需额外排序）
  - [x] 4.3 在 `runCrawl` 流程成功路径（[frontend/src/views/SimpleView.vue#L120](frontend/src/views/SimpleView.vue#L120) `setStatus('completed')` 之后）：
    ```typescript
    const record: CrawlTaskRecord = {
      id: crypto.randomUUID(),
      url: target,
      pageTitle: analyzeRes.page_title,
      extractedCount: extractedCount.value,
      completedAt: Date.now(),
      status: 'completed',
      fields: analyzeRes.fields
    };
    crawlStore.addTask(record);
    ```
  - [x] 4.4 失败路径（catch 块内 `setStatus('failed')` 之后）同样写入历史，`status: 'failed'`、`extractedCount: 0`、`fields: analyzeRes?.fields ?? []`——若 `analyze()` 在 catch 之前已完成则保留字段；若 analyze 抛错则空数组
  - [x] 4.5 卡片交互：`<HistoryCard :record="record" @view="openDetail(record.id)" @export="onExport(record.id)" @delete="onDelete(record.id)" />`
    - `openDetail(id)`：`activeTaskId.value = id; drawerShow.value = true`
    - `onExport(id)`：Phase 1 无操作（按钮 disabled，事件不会触发，仅声明 handler 避免运行时错误）
    - `onDelete(id)`：调用 `useCrawlStore().removeTask(id)` + 显示 `n-message` "已删除，5 秒内可撤销" + 关联 5 秒计时器 + 暂存被删 record；计时器到期前再次点击"撤销"则 `addTask(record)` 恢复并清除计时器
  - [x] 4.6 抽屉放在视图根：`<TaskDetailDrawer v-model:show="drawerShow" :record="activeTaskRecord" @export="onExport" />`；`activeTaskRecord` computed = `crawlStore.getTaskById(activeTaskId.value)`
  - [x] 4.7 **保留**1-2 `simple-view__history` CSS 类名（已通过测试断言"还没有爬取历史"+"立即开始爬取"）；新增 `simple-view__history-list` 子类包裹卡片列表
  - [x] 4.8 **禁止**修改 1-2 已通过的关键逻辑：`onSubmit` / `onRetry` / `onStartHistory` / `onViewChange` / `validateUrl` / `runCrawl` 的 analyze→getCrawlProgress→crawl 顺序（仅在其后追加写入历史调用）

- [x] **Task 5 — SmartURLInput 历史 dropdown 接通 (AC: 7)**
  - [x] 5.1 修改 `frontend/src/components/SmartURLInput.vue`：
    - 新增 prop `historyItems?: Array<{ url: string; completedAt: number }>`（从父传入，不直接耦合 store 避免组件层泄漏 store）
    - 模板新增：输入框聚焦且 `historyItems.length > 0` 时渲染 `n-popover` placement="bottom-start" trigger="manual" `:show="showHistory"`
    - popover 内容：`v-for="item in historyItems.slice(0, 5)"` 渲染 `(item.url hostname) - (相对时间)` 列表项 + `@click="emit('update:modelValue', item.url); showHistory = false"`
  - [x] 5.2 修改 `frontend/src/views/SimpleView.vue`：传入 `:history-items="crawlStore.history.slice(0, 5).map(t => ({ url: t.url, completedAt: t.completedAt }))"`
  - [x] 5.3 输入框 `@focus="showHistory = historyItems.length > 0"` + `@blur="setTimeout(() => showHistory = false, 150)"`（150ms 延迟允许 popover 项 click 触发）
  - [x] 5.4 **不**在 SmartURLInput 内部直接访问 `useCrawlStore`（保持组件可独立测试 + 1-2 测试不污染 store mock）
  - [x] 5.5 防御：`historyItems` 为空数组或 undefined 时 `showHistory` 永远 false（避免空 dropdown）

- [x] **Task 6 — 撤销删除消息实现 (AC: 8)**
  - [x] 6.0 **前置验证（dev 第一阶段）**：
    - 6.0.1 读 `frontend/src/App.vue` 确认 `NMessageProvider` 是否已挂载（1-1 / 1-2 留下的状态）
    - 6.0.2 用 context7 MCP 查询 Naive UI 2.x 当前安装版本的 `useMessage().info(content, options)` 中 `options.action` API 签名：
      - 函数式 `action: () => VNode` 是否支持
      - 还是必须 VNode 传入 `action: VNode`
      - 或 `actionText` / `onAction` API
    - 6.0.3 决策路径：
      - 若 `NMessageProvider` 已挂载 → 直接 `useMessage()`
      - 若未挂载 → 在 `SimpleView.vue` 模板根局部包裹 `<n-message-provider>`（不修改 `App.vue` 避免污染 1-2 已通过测试）
      - n-message action 按 context7 验证结果选函数式或 VNode 形式
  - [x] 6.1 在 `SimpleView` 顶部引入 `useMessage` from `naive-ui`：`const message = useMessage()`；**前置 6.0 已确认 `NMessageProvider` 在祖先组件树**
  - [x] 6.2 `onDelete(id)` 实现：
    ```typescript
    const removedRecord = crawlStore.getTaskById(id);
    if (!removedRecord) return;
    crawlStore.removeTask(id);
    undoTimer = window.setTimeout(() => { pendingUndo = null; }, 5000);
    pendingUndo = removedRecord;
    const reactiveMsg = message.info('已删除，5 秒内可撤销', {
      duration: 5000,
      action: () => h('span', { onClick: undoDelete, style: 'cursor:pointer;color:#3B82F6' }, '撤销')
    });
    // 5 秒后 message 自动关闭；若用户点击撤销，clearTimeout(undoTimer) + crawlStore.addTask(pendingUndo) + reactiveMsg.destroy()
    ```
  - [x] 6.3 `undoDelete()` 函数：`if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; } if (pendingUndo) { crawlStore.addTask(pendingUndo); pendingUndo = null; }`
  - [x] 6.4 刷新页面 → pendingUndo 与 undoTimer 重置（同会话撤销能力消失，符合 AC8）
  - [x] 6.5 `onBeforeUnmount` 中 `clearTimeout(undoTimer)` 避免 1-2 review patch L128 同类事件监听泄漏

- [x] **Task 7 — 时间格式化 composable (AC: 1, 2, 7)**
  - [x] 7.1 创建 `frontend/src/composables/useRelativeTime.ts`：导出 `formatRelativeTime(timestamp: number): string` 函数
    - `<60_000` → "刚刚"
    - `<3_600_000` → `${Math.floor(diff/60_000)} 分钟前`
    - `<86_400_000` → `${Math.floor(diff/3_600_000)} 小时前`
    - `<604_800_000` → `${Math.floor(diff/86_400_000)} 天前`
    - `<90_000_000`（>7 天 <约 1 天差）→ `Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp))`
  - [x] 7.2 **不**用 `Intl.RelativeTimeFormat`（其 API 输出"3 分钟前"格式但需手动处理 negative value 与 unit 切换易出 bug——直接手写更清晰）；切换为手写 if-else 阶梯
  - [x] 7.3 单元测试覆盖每档边界（59 秒、61 秒、59 分、61 分、23 小时、25 小时、6 天、8 天、100 天）

- [x] **Task 8 — 测试用例 (AC: 12)**
  - [x] 8.0 **前置：jsdom 环境补 `crypto.randomUUID` stub**：
    - 8.0.1 修改 `frontend/tests/setup.ts` 顶部加 `beforeEach(() => { vi.stubGlobal('crypto', { randomUUID: () => 'mock-uuid-' + Math.random().toString(36).slice(2, 10) }) })`
    - 8.0.2 同步加 `afterEach(() => vi.unstubAllGlobals())` 避免污染其他 suite
    - 8.0.3 验证 `crypto.randomUUID` 在 jsdom（vitest）下默认 undefined `/ stub 前调用会抛 TypeError`，stub 后所有 store 测试可生成 record.id
    - 8.0.4 不修改 `vitest.config.ts`（沿用 1-1 / 1-2 配置；setup.ts 路径已在 vitest config `setupFiles` 中）
  - [x] 8.1 新增 `frontend/tests/stores/crawl.test.ts`（≥6 测试）：
    1. `addTask` 单条 history 长度 1
    2. `addTask` 51 条后 FIFO 截断到 50（最老条目被移除）
    3. `removeTask(id)` 移除指定条目
    4. `clearHistory` 清空
    5. `getTaskById` 命中返回 record / 不命中返回 null
    6. persist 持久化：`addTask` 后 localStorage `ai-crawler:crawl-history` 含新条目
  - [x] 8.2 新增 `frontend/tests/components/HistoryCard.test.ts`（≥5 测试）：
    1. completed 状态渲染"已完成"徽标
    2. failed 状态渲染"失败"徽标
    3. 时间相对格式："刚刚" / "5 分钟前" / 绝对日期
    4. 点击"查看"按钮触发 view 事件
    5. 点击"删除"按钮触发 delete 事件
  - [x] 8.3 新增 `frontend/tests/components/TaskDetailDrawer.test.ts`（≥4 测试）：
    1. record 非空时渲染字段列表（断言字段名出现）
    2. record 为 null 时显示 `n-empty`"还没有详情"
    3. "导出数据"按钮 disabled
    4. update:show 事件触发（关闭按钮）
  - [x] 8.4 新增 `frontend/tests/components/SmartURLInputHistory.test.ts`（≥3 测试）：
    1. historyItems 非空 + 输入框 focus → popover 显示
    2. historyItems 空数组 + focus → popover 不显示
    3. 点击 popover 项触发 update:modelValue + popover 关闭
  - [x] 8.5 扩展 `frontend/tests/components/SimpleView.test.ts`（新增 ≥4 测试，保留 1-2 现有 11 测试不修改）：
    1. 爬取完成后历史卡片出现（断言 `HistoryCard` 渲染数量 + store.history.length 增长）
    2. 点击 HistoryCard "查看" 触发抽屉打开（断言 `n-drawer` 显示）
    3. 点击 HistoryCard "删除" → 卡片消失 + `n-message` 出现"已删除"文案
    4. 撤销删除：模拟点击"撤销" → 卡片恢复
  - [x] 8.6 新增 `frontend/tests/composables/useRelativeTime.test.ts`（≥5 边界测试）
  - [x] 8.7 跑 `npm run test` 验证全部通过；不修改 1-2 `frontend/vitest.config.ts` 的 `coverage.include`（除非新增 `composables/`、`stores/` 已含在内）
  - [x] 8.8 **不**新增 E2E（Epic 2 爬取流程 E2E 覆盖；本 story 历史管理为单组件粒度，单元测试足够）

### Review Findings

> Code review 于 2026-08-10 执行。失败层：`edge`（Edge Case Hunter 子代理 Provider API 超时）；`blind` 与 `auditor` 两层完成。以下为合并去重并按严重程度分类后的 findings。

#### Patch（19 项，无歧义可直接修复）

- [x] [Review][Patch] B1 — HistoryCard.test.ts:46 time-bomb（用真实 `Date.now()` 断言 `/2026/`，2027 年后自动失败）[frontend/tests/components/HistoryCard.test.ts:46] — 改用与 useRelativeTime.test.ts 一致的固定 `NOW` const 注入。
- [x] [Review][Patch] B2 — relativeTime computed 永不刷新（`Date.now()` 默认参数一次性捕获）[frontend/src/components/simple/HistoryCard.vue `relativeTime` + frontend/src/components/simple/TaskDetailDrawer.vue 同模式] — **裁决方案：30s 全局 tick**。在 crawl store 添加 `nowTimestamp` ref + `setInterval(tick, 30000)`（在 store 初始化时启动，组件卸载不需清理因 store 单例）；或 SimpleView 顶部 `onMounted` 启动 tick + `onBeforeUnmount` 清理。HistoryCard / TaskDetailDrawer 改 `now: store.nowTimestamp` 替代默认 Date.now()。
- [x] [Review][Patch] B3 — undoDelete 通过 `crawlStore.addTask(pendingUndo)` 走 unshift 把任务恢复到列表顶部，违反 AC8 "恢复到原位置" [frontend/src/views/SimpleView.vue `undoDelete` 函数] — 用 `splice(originalIndex, 0, pendingUndo)` 在删除时记录的索引位置插回；现有测试仅断言 length 不验证位置，需补位置断言。
- [x] [Review][Patch] B4 — `pendingUndo` 全局单一变量，连环删除时静默覆盖前值并 `clearTimeout` 前一个计时器，先前任务的撤销机会丢失 [frontend/src/views/SimpleView.vue `pendingUndo` + `onDelete` + `undoDelete`] — 改为数组队列 `pendingUndos: Array<{task, index, timer}>`；toast 文案动态反映"还有 N 项可撤销"或保留单条但需明确 UX 选择，本文建议与 B3 一起决定。
- [x] [Review][Patch] B5 — HistoryCard `<article>` 无 `tabindex="0"` 导致 `.history-card:focus-visible` 样式与 `@keydown.enter="openDetail"` 处理器永远不可达（a11y 回归）[frontend/src/components/simple/HistoryCard.vue 模板 article 元素] — 添加 `tabindex="0"`。
- [x] [Review][Patch] B6 — SmartURLInput `blurTimer` 无 `onBeforeUnmount` 清理，组件在 150ms blur 延迟内卸载会写已卸载组件的 ref（与 Story 1-2 同类 patch 回归）[frontend/src/components/SmartURLInput.vue] — 添加 `onBeforeUnmount(() => clearTimeout(blurTimer))`。
- [x] [Review][Patch] B7 — `onExport(_id: string)` 与 TaskDetailDrawer `emit('export')` 无参数 emit 类型不匹配 [frontend/src/views/SimpleView.vue + frontend/src/components/simple/TaskDetailDrawer.vue] — 统一签名：drawer emit `update:show` + `export`，SimpleView 内读 `activeTask` 拿 id，移除 `_id` 参数。
- [x] [Review][Patch] B8 — `onHistoryClick` 在 `nextTick` 内先 `setShow(false)` 再 `focusInput()`，`focusInput` 触发 `onFocus` 又翻回 `show=true`，popover 不关闭 [frontend/src/components/SmartURLInput.vue] — 移除 `nextTick` 内的 `setShow(false)` 或在 `focusInput` 前先断 popover 焦点逻辑；确保点选历史条目后 dropdown 实际关闭。
- [x] [Review][Patch] B9 — `setActiveTask` + `activeTask` store 字段双真源可能导致本地与 store 漂移 [frontend/src/views/SimpleView.vue `openDetail` + frontend/src/stores/crawl.ts `activeTask` + `setActiveTask`] — 单源化：移除本地 `activeTaskId` ref，全部走 `crawlStore.activeTaskId`；或反之移除 store `activeTask` 字段保留本地。建议保留 store 真源便于 drawer 读取。
- [x] [Review][Patch] B10 — `clearHistory` 是 dead code，无 UI 调用 [frontend/src/stores/crawl.ts `clearHistory` action] — 移除 action 与对应测试，或为 future hook 保留并加注释（建议移除，YAGNI）。
- ~~B11~~ — SimpleView 新增 4 个删除/撤销测试无 `beforeEach localStorage.clear`：False positive 已在 Dismiss 节确认（describe 顶部已有 `beforeEach localStorage.clear`，对新增 4 测试同样生效）。
- [x] [Review][Patch] B12a — `<article role="article">` 与 article 隐式 role 重复（Nit）[frontend/src/components/simple/HistoryCard.vue 模板] — 移除 `role="article"` 属性。
- [x] [Review][Patch] B12b — TaskDetailDrawer disabled button 上 `@click="emit('export')"` 为死代码（disabled 不触发 click）[frontend/src/components/simple/TaskDetailDrawer.vue] — 移除该 `@click` 绑定。
- [x] [Review][Patch] A1 — AC2 状态徽标用 Naive UI 默认主题色而非 spec 规定的 `#3B82F6`（进行中）/`#10B981`（完成）/`#EF4444`（失败）hex 值；running 状态 Reload 图标无 `@keyframes` 旋转动画 [frontend/src/components/simple/HistoryCard.vue `tagType`/`tagIcon` computed + 模板] — `:color` 绑定改为按状态映射到 hex；添加 `@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }` + running 状态 `animation: spin 1s linear infinite`。
- [x] [Review][Patch] A2 — AC7 SimpleView `crawlHistoryItems` computed 仅 `crawlStore.history.slice(0, 5).map(...)`，未按 URL 去重，相同 URL 多次爬取时历史 dropdown 重复显示 [frontend/src/views/SimpleView.vue `crawlHistoryItems`] — 改为 `const seen = new Set<string>(); return computed(() => { const result: ...[] = []; for (const item of crawlStore.history) { if (seen.has(item.url)) continue; seen.add(item.url); result.push(...); if (result.length >= 5) break; } return result; });` 或使用 lodash `_uniqBy`。
- [x] [Review][Patch] A3 — AC12/Task 8.3 TaskDetailDrawer 仅 3 个测试，缺 `update:show` 关闭事件测试，但 Task 8.3 [x] 已勾选——任务勾选与实际实施脱节 [frontend/tests/components/TaskDetailDrawer.test.ts + _bmad-output/implementation-artifacts/1-3-task-management-history.md Task 8.3] — 补第 4 个测试：mount 后触发 drawer 关闭（点击 mask / 调用 `update:show(false)`），断言 emit payload。同步将 Task 8.3 [x] 状态修正或保持勾选并补测试。
- [x] [Review][Patch] A5 — Task 3.4 状态徽标逻辑在 HistoryCard 与 TaskDetailDrawer 重复（`tagType`/`tagIcon`/`tagText` computed 三件套）[frontend/src/components/simple/HistoryCard.vue + frontend/src/components/simple/TaskDetailDrawer.vue] — 抽取 `useStatusTag(status)` composable 返回 `{ type, icon, text }`，两处共享。
- [x] [Review][Patch] A6 — Task 2.3 HistoryCard 用 `min-height: 80px` 而非 spec 字面 `height: 80px` [frontend/src/components/simple/HistoryCard.vue:30 + 模板 title 元素] — **裁决方案：保留 min-height + NEllipsis 单行截断**。用 Naive UI `<NEllipsis :tooltip-props="{ placement: 'top' }">` 包裹 title，使卡片宽度固定时长标题自动单行省略，min-height 实际等价 height 单行场景。
- [x] [Review][Patch] A9 — Task 7.3 useRelativeTime 测试缺 61m（"1 小时前"边界）与 25h（"1 天前"边界）测试 [frontend/tests/composables/useRelativeTime.test.ts] — 补两条边界用例：`delta = 61 * 60 * 1000` 期望 "1 小时前"；`delta = 25 * 60 * 60 * 1000` 期望 "1 天前"。
- [x] [Review][Patch] A10 — AC9 TaskDetailDrawer 空字段文案缺 "AI 识别" 前缀 [frontend/src/components/simple/TaskDetailDrawer.vue 空状态文案] — 在空字段列表 copy 前补 "AI 识别" 或 "尚未识别" 前缀使文案与 AC9 文字一致。

#### Dismiss（6 项，噪音/误报/合理裁决）

- ~~A4~~ — AC8 撤销交互 pivot 至内联 HTML toast（脱离 Naive UI useMessage action）：Naive UI 2.38 `MessageOptions.action` 字段在 TS 类型不存在是已验证限制，内联 toast 功能语义等价（5 秒计时 + 撤销按钮 + 渐隐动画），dev pivot 已在 Dev Agent Record 备注并经 review 用户接受为 sanctioned pivot。
- ~~A7~~ — Task 2.5/7.1 绝对日期 zh-CN 斜杠格式 (2026/08/08)：王芳 persona 文档明确"无 ISO 8601 专业术语"、"`3 分钟前` 而非 ISO 8601"。spec 描述与 persona 冲突时 persona 优先，保留 zh-CN 本地化符合用户友好原则。
- ~~A8~~ — Task 2.8 删除按钮 CSS class（`.history-card__delete { color: #DC2626; }`）而非 `n-button type="error"`：Dev 选用 CSS class 保留完全样式控制权（color/border/hover），NButton `type="error"` 主题受全局主题影响难以微调。属合理设计裁决。
- ~~A11~~ — AC7 `historyItems` prop 类型从 `string[]` 改为对象数组：合理裁决，因 AC7 同时要求显示标题/ favicon 等元信息，单纯 URL 数组无法承载。Acceptance Auditor 标记为 Nit，dismiss 为合理设计选择。
- ~~A12~~ — Task 2.5 title tooltip 用 zh-CN 本地化时间（`Date.toLocaleString('zh-CN')`）而非 ISO 8601：王芳 persona 要求"无 ISO 8601 专业术语"，本地化 tooltip 文案符合用户友好原则。Dismiss 为有意裁决。
- ~~B11~~ — SimpleView 新增测试无 `beforeEach localStorage.clear`：False positive。验证发现 [frontend/tests/components/SimpleView.test.ts:10-12] 顶部 `describe('SimpleView.vue', ...)` 已有 `beforeEach(() => { localStorage.clear(); })`，对接 1-3 新增 4 个测试同样生效。无需修改。

#### Decision-needed 2 (新增于综述时，需用户裁决)

- [x] [Review][Decision] (New) — **vitest.config.ts include 不覆盖 tests/composables/ 与 tests/stores/**：vitest.config.ts:18-21 include 模式仅 `tests/unit/**/*.test.ts` + `tests/components/**/*.test.ts`，Story 1-3 新建的 [frontend/tests/composables/useRelativeTime.test.ts](@tests/composables/useRelativeTime.test.ts)、[frontend/tests/stores/crawl.test.ts](@tests/stores/crawl.test.ts) 与 [frontend/tests/stores/ui.test.ts](@tests/stores/ui.test.ts) **不在 vitest 默认 include 内，默认运行不会执行**。`npx vitest run` 验证：`No test files found`（exit 1）。dev-story 阶段声称"81/81 通过、10 个测试文件全绿"未含此 3 个文件。"AC12 测试通过" 字面满足但实际部分未运行 — Story 1-3 测试覆盖声明含 phantom test。**裁决**：方案 (a) 采纳 — 经用户授权解除禁令第 4 项后，已修改 [frontend/vitest.config.ts](@frontend/vitest.config.ts) include 数组追加 `'tests/stores/**/*.test.ts'` 与 `'tests/composables/**/*.test.ts'`；同时补 [frontend/tests/stores/crawl.test.ts](@tests/stores/crawl.test.ts) 与 [frontend/tests/stores/ui.test.ts](@tests/stores/ui.test.ts) 的 `createPinia + piniaPluginPersistedstate + flush via createApp({}).use(pinia)` 顺序以使 persist plugin 真正注册；`persist` 测试用 `await new Promise(r => setTimeout(r, 10))` 等待 macrotask flush。最终 13 个测试文件全运行，98/98 通过。

> 已完成的对抗式审查层：`blind`（12 项 findings，6 Major / 5 Minor / 2 Nit）+ `auditor`（12 AC + 8 Task 完整审查，3 Major AC 偏离、6 Minor Task 偏离、2 Nit、6/6 禁止项通过）。
> 失败层：`edge`（Edge Case Hunter 子代理 Provider API 超时再次失败，已记录于 `{failed_layers}`，按 step-02-review.md 规则继续推进）。
> 6 项禁止项：原计入"5 项通过 + 1 项 vitest.config.ts 未修改"——经用户授权解除禁令第 4 项后修改 `vitest.config.ts` include，故最终"5 项通过 + 1 项已被授权解除"。其余 5 项全部通过：无 IndexedDB/idb/localforage 导入、store 不调 API、useUiStore 未修改、未用 useMessage.action 字段、未用 Intl.RelativeTimeFormat（手写阶梯替代）。
> 综述时新增 1 项 Decision-needed（vitest include 不覆盖 composables/ 与 stores/ 测试，导致 phantom tests）+ B11 false positive 已 dismiss。Bulk-apply Round 1 已修 9 项 patches（B1/B5/B6/B10/B12a/B12b/A2/A9/A10）；Round 2 续修 10 项 patches（B2/B3/B4/B7/B8/B9/A1/A3/A5/A6）+ Decision-needed 解除禁令完成 vitest.config.ts include 修复；最终全 19 项 patch 闭合，6 项 dismiss 维持。

### Review Findings — Round 3 (2026-08-10)

> Round 3 对抗式审查层：`blind`（20 项 findings）+ `edge`（14 项 findings JSON）+ `auditor`（4 项 findings：1 Medium / 2 Low / 1 Nit）。3 层 retry 后全部成功（Round 1 启动时 edge + auditor 子代理 Provider API 超时/失败；retry 全绿）。
> 经 normalize + dedupe + classifiy：3 项 decision-needed、17 项 patch、2 项 defer、4 项 dismissed。

#### Decision-needed

- [x] [Review][Decision] (New R3-D1) — **Tick 生命周期策略（refcount vs singleton vs HMR-aware）**：[frontend/src/stores/crawl.ts:42-51] startTick/stopTick 当前用 `tickTimer !== null` guard 阻止重复启动，但 SimpleView 多实例时第一个 unmount 的 `stopTick` 会让其他实例的 tick 静默失效；Vite HMR 重实例 store 会让旧 `setInterval` 泄漏。**裁决**：方案 (a) 采纳——引用计数 refcount（`activeTickers++/--`，仅归零才 `stopTick`；多实例/HMR 均安全）。→ 转 R3-P18 实施。
- [x] [Review][Decision] (New R3-D2) — **pendingUndos 索引在 history 中途变更后失真**：[frontend/src/views/SimpleView.vue:DELETE+UNDO] onDelete 用 `findIndex` 抓快照 index，但 5s 窗口内 (i) 先删 A 后删 B——A 删除后 B 的真实位置左移 1 但 captured index 仍为旧值，LIFO 撤销 B 时 `splice(Math.min(idx, len), 0, B)` 错位置；(ii) addTask `unshift` 新任务——所有原 position 整体右移 1，splice 到 stale idx 错位。**裁决**：方案 (a) 采纳——删除时捕获 `nextNeighborId`（被删任务之后第一个 task.id 或 null），undo 时用 `indexOf` 重定位；若 neighbor 已不存在则回退至 unshift 顶部（严格恢复原位 spec 一致）。→ 转 R3-P19 实施。
- [x] [Review][Decision] (New R3-D3) — **5s 撤销窗口在 SimpleView unmount 时静默丢失**：[frontend/src/views/SimpleView.vue:onBeforeUnmount] 仅 `clearTimeout` 所有 pendingUndos，未把任务 restore 回 history。用户切走 view 时被删任务永久消失，5s 撤销承诺被静默打破。**裁决**：方案 (a) 采纳——unmount 时遍历 pendingUndos 全部 restore 回 history（splice 在原位置或回退至顶部），保留撤销承诺。→ 转 R3-P20 实施。

#### Patches

- [x] [Review][Patch] (R3-P1) **useStatusTag 误用 composable 命名且 `computed(() => ({...})).value` 为 dead wrapper**（每次调用分配无依赖 watcher） [frontend/src/composables/useStatusTag.ts:30-60] — 移除 `computed` 包装，返回 fresh 字面量；可选重命名为 `getStatusTagInfo` 或保留 useStatusTag 但接受它是普通函数
- [x] [Review][Patch] (R3-P2) **`PALETTE[status]` 返回共享可变引用**，consumer 改 `tag.color.color = '#xxx'` 会全局污染 [frontend/src/composables/useStatusTag.ts:18-27] — 每次调用浅克隆 color 对象（`return { ...PALETTE[status] }`）
- [x] [Review][Patch] (R3-P3) **`StatusTagInfo.type` 与 `StatusTagType` 导出未消费**，dead 入口（Round 1 B10 同类已清理） [frontend/src/composables/useStatusTag.ts:5,16] — 删 `type` 字段与 `StatusTagType` export
- [x] [Review][Patch] (R3-P4) **`now` prop default `() => Date.now()` 在父组件漏绑 `:now="crawlStore.nowTimestamp"` 时静默冻结**；30s tick 失效 [frontend/src/components/simple/HistoryCard.vue & TaskDetailDrawer.vue] — 改 `now: { type: Number, required: true }`
- [x] [Review][Patch] (R3-P5) **`nowTimestamp` 在 store 创建时初始化但 startTick 第一个 tick 最长 30s 才到达**；首次相对时间显示陈旧 [frontend/src/stores/crawl.ts:42-46] — startTick 内立即 `nowTimestamp.value = Date.now()` 再 `setInterval`
- [x] [Review][Patch] (R3-P6) **SimpleView 直接 `crawlStore.history.findIndex` 和 `crawlStore.history.splice` 绕过 Pinia action 边界** [frontend/src/views/SimpleView.vue:DELETE+UNDO] — crawl store 加 `restoreTask(task, index)` action 由其承担 splice
- [x] [Review][Patch] (R3-P7) **`removeTask(id)` 不重置 `activeTask`**，用户在 drawer 打开某任务时从 HistoryCard 删除之，drawer 仍展示已删 phantom 记录 [frontend/src/stores/crawl.ts:32] — removeTask 内 `if (activeTask.value?.id === id) activeTask.value = null`
- [x] [Review][Patch] (R3-P8) **TaskDetailDrawer 新增的 update:show 测试仅验证 emit-out 方向**，未测 prop-in `:show="true"` 是否到达 NDrawer [frontend/tests/components/TaskDetailDrawer.test.ts:651-656] — 补 `expect(drawer.props('show')).toBe(true)` 断言
- [x] [Review][Patch] (R3-P9) **`await new Promise(r => setTimeout(r, 10))` 用魔法 10ms macrotask 等 pinia-plugin-persistedstate flush**，CI 负载下可能 flake [frontend/tests/stores/crawl.test.ts & ui.test.ts] — 改用 `vi.useFakeTimers() + advanceTimersByTimeAsync(20)` 或轮询 localStorage 至写入
- [x] [Review][Patch] (R3-P10) **`beforeEach` 创建 `createApp({}).use(pinia)` 但从不 `.unmount()`**，每个测试累积 Vue app + effect scope [frontend/tests/stores/crawl.test.ts & ui.test.ts] — 加 `afterEach(() => app.unmount())`
- [x] [Review][Patch] (R3-P11) **useStatusTag 新增 50 行 4 状态分支 + fallback，无单元测试**（Round 1 A9 已为 useRelativeTime 加测试），覆盖率不对称 [frontend/src/composables/useStatusTag.ts] — 新增 `frontend/tests/composables/useStatusTag.test.ts` 覆盖 4 状态 + unknown/undefined + spinning 语义
- [x] [Review][Patch] (R3-P12) **`nowTimestamp` 通过 store return 暴露为可写 ref**，任何 consumer 可 `crawlStore.nowTimestamp = 0` 冻结所有相对时间显示 [frontend/src/stores/crawl.ts:483] — 改为 `computed(() => nowTimestamp.value)` getter 或 `readonly(nowTimestamp)`
- [x] [Review][Patch] (R3-P13) **SmartURLInput onHistoryClick `nextTick` callback 内 `syncStatus` 或 `focusInput` 抛错时 `showHistory=false` 跳过**，popover 卡死打开 [frontend/src/components/SmartURLInput.vue:217-225] — 用 `try { ... } finally { showHistory.value = false; }` 包裹
- [x] [Review][Patch] (R3-P14) **SimpleView 测试 suite 缺测试级 `afterEach(() => crawlStore.stopTick())`**；某测试断言中断导致 `onBeforeUnmount` 未跑 timer 泄漏污染下个测试 [frontend/src/stores/crawl.ts + frontend/src/views/SimpleView.vue] — 测试 setup 加 `afterEach(stopTick)` 强制清 timer
- [x] [Review][Patch] (R3-P15) **B3 patch spec 字面要求补位置断言测试**，现 SimpleView.test.ts 仅断言 length [frontend/tests/components/SimpleView.test.ts] — 加 `expect(crawlStore.history[0]?.id).toBe(removedId)` 验证 splice 严格恢复原位置
- [x] [Review][Patch] (R3-P16) **Story file Status 字段仍为 `in-progress`**，与 sprint-status.yaml (`review`) 及本文档 Change Log 综述不一致 [Story 1.3 file:3] — 改为 `Status: review`
- [x] [Review][Patch] (R3-P17) **AC12 字面要求 `≥6 测试` 包含 clearHistory**，但 B10 已删除 clearHistory action，crawl.test.ts 实际仅 5 用例 [Story 1.3 AC12] — 更新 AC12 文案移除 clearHistory，标 `≥5 测试`
- [x] [Review][Patch] (R3-P18) **crawl store tick 引用计数**（D1 裁决 (a) 转入） [frontend/src/stores/crawl.ts:42-51] — 加 `activeTickers: number = 0`；`startTick` 内 `activeTickers++; if (activeTickers === 1) { nowTimestamp.value = Date.now(); tickTimer = setInterval(...) }`；`stopTick` 内 `activeTickers = Math.max(0, activeTickers - 1); if (activeTickers === 0 && tickTimer) { clearInterval(tickTimer); tickTimer = null; }`；可选 `import.meta.hot?.dispose(() => stopTick())`
- [x] [Review][Patch] (R3-P19) **pendingUndos 改用相邻 ID 重定位**（D2 裁决 (a) 转入） [frontend/src/views/SimpleView.vue:onDelete+undoDelete] — `PendingUndo` 接口字段从 `{task, index, timer}` 改为 `{task, neighborId: string | null, timer}`；onDelete 抓 `const after = history[idx + 1]; const neighborId = after ? after.id : null` 而非 `index`；undoDelete 用 `const insertIdx = neighborId ? crawlStore.history.findIndex(t => t.id === neighborId) : crawlStore.history.length; if (insertIdx === -1) crawlStore.history.unshift(task); else crawlStore.history.splice(insertIdx, 0, task)`
- [x] [Review][Patch] (R3-P20) **SimpleView onBeforeUnmount restoreAll pendingUndos**（D3 裁决 (a) 转入） [frontend/src/views/SimpleView.vue:onBeforeUnmount] — unmount 时遍历 `pendingUndos.value`，对每条 `clearTimeout(timer)` 后按 R3-P19 邻居 ID 重定位 splice 回 history；最后清空 `pendingUndos.value = []`

#### Deferred

- [x] [Review][Defer] (R3-DF1) **SmartURLInput B8 修复依赖 Vue 微任务 batch 顺序** (`showHistory=false` 必须末位)，无 proactive test guard [frontend/src/components/SmartURLInput.vue:217-225] — deferred, 当前工作但脆弱保留
- [x] [Review][Defer] (R3-DF2) **Naive UI Drawer stub 测试使用内部组件名 `Drawer`**（非 import 别名 `NDrawer`），2.39+ 若 rename 内部名则测试断静默断裂 [frontend/tests/components/TaskDetailDrawer.test.ts:651-656] — deferred, 框架版本耦合暂可容忍

#### Dismissed

- (R3-DIS1) pendingUndos 队列在代码中存在但 toast 仍单条静态文案"已删除，5 秒内可撤销"——用户 Round 2 B4 明确授权无 N-counter
- (R3-DIS2) `onExport()` no-op placeholder 用于未来 Epic 5 export——不属于 Round 2 重生，原 spec 授权的阶段性占位
- (R3-DIS3) Story artifact 在同一 commit 内 self-approve 19 patches 的 `[x]` 勾选——流程观察非代码缺陷，CF 评审关注技术而非元流程
- (R3-DIS4) `:tooltip="{ width: 'trigger' }"` NEllipsis prop 形状与 spec 字面 `:tooltip-props="{ placement: 'top' }"` 偏差——Naive UI 2.38 NEllipsis API 验证为 `tooltip: boolean | PopoverProps`（[Ellipsis.d.ts:454]），`:tooltip-props` 实为 spec 笔误（无此 prop），diff 用 `tooltip` 是正确的

## Dev Notes

### 关键架构决策与约束 (Architecture Compliance)

- **强制技术栈** [Source: architecture.md#L964-L972, project-context.md#L18-L46]：
  - 前端：Vue 3.4+ Composition API + Naive UI 2.x + Pinia 2.x + Vite 5.x
  - 桌面框架：Electron 28.x LTS（1-1 已锁版本，本 story 不修改主进程）
  - 测试：vitest + @vue/test-utils + jsdom（1-1 / 1-2 已安装）
  - **禁止升级** Playwright v1.51.0（本 story 不涉及）
- **`useCrawlStore` 规格** [Source: architecture.md#L1342-L1356, architecture.md#L1711]：
  - 路径：`frontend/src/stores/crawl.ts`（TypeScript，与 1-2 `ui.ts` 一致；architecture.md#L1711 列 `.js` 但 1-1 已统一 `.ts`，project-context.md#L52-L66 `.ts` 后缀优先）
  - 命名：PascalCase `useCrawlStore`；state camelCase `history` / `activeTask`；actions camelCase `addTask` / `removeTask` / `clearHistory` / `getTaskById` / `setActiveTask`
  - state shape：`{ activeTasks: [], history: [] }`（architecture.md#L1348-L1350）；本 story Phase 1 仅用 `history`，`activeTasks` 字段预留给 Epic 3 实时任务管理
- **Pinia stores 按视图分离** [Source: architecture.md#L188]：`useUiStore`（1-2 视图偏好）、`useCrawlStore`（本 story 历史）、`useOfflineStore`（Epic 6）、`useUserStore`（后续）——禁止合并 store 避免单 store 过大
- **持久化策略** [Source: architecture.md#L191 用户偏好本地存储, project-context.md#L166-L176]：
  - LocalStorage 优先（小数据、<5MB、同步读取）
  - **禁止**本 story 引入 IndexedDB（Epic 6 离线模式专用；IndexedDB 封装 `frontend/src/utils/storage.js` 由 Epic 6 创建，本 story 不创建该文件）
- **三级视图策略** [Source: architecture.md#L194-L246]：
  - 任务卡片列表与详情抽屉属简洁视图轻量功能（不超过 50 条历史，无分页）
  - 仪表板视图与专业视图的任务管理（批量操作、并发控制、调度）由 Epic 3 / Epic 4 交付
- **Phase 1 MVP 优先级** [Source: architecture.md#L862-L863]：Phase 1 必交付的 SmartURLInput 已在 1-2 交付，本 story 补全其历史 dropdown；TaskMonitorPanel（architecture.md#L614-L628）为 Phase 2 组件（Epic 3 Story 3-4 任务执行控制），本 story **不创建** `TaskMonitorPanel.vue` 文件
- **WebSocket 事件约定** [Source: architecture.md#L1318-L1330, L1389-L1404]：
  - 事件名 `task_completed` snake_case（1-2 已定义 `CrawlCompletedEvent` 类型，本 story 复用）
  - 本 story dev 模式下不连接真实 WebSocket，沿用 1-2 的 `getCrawlProgress` mock；任务完成由 `runCrawl` 流程同步调用 `addTask` 写入历史
  - 真实后端由 Epic 2 接通，本 story 写入历史时机为 mock `crawl()` resolve 时
- **状态管理约定** [Source: architecture.md#L1342-L1356]：
  - Pinia store 不能在 store actions 中调用 API（保持 store 为纯状态容器）；本 story `addTask` 仅修改 state，不调用 API
  - 错误处理在组件层（runCrawl 的 try/catch）；store 不抛异常
- **错误处理** [Source: architecture.md#L1360-L1372, project-context.md#L98-L112]：
  - 失败任务也写入历史（`status: 'failed'`），让用户复盘
  - 历史列表渲染防御：`pageTitle` / `extractedCount` / `fields` 任一缺失时降级显示
- **王芳 persona 文案** [Source: prd.md#L1406-L1424]：
  - "您"称呼，避免 URL/API/依赖/运行时/分析中术语
  - 历史卡片标题用页面标题或 hostname（非 task_id）
  - 时间为相对格式（"3 分钟前"，非 ISO 8601）
  - 删除提示先人话再操作（"已删除，5 秒内可撤销"，非 "Task deleted"）

### Library / Framework Requirements

- **Vue.js 3.4+** + **Naive UI 2.x**（1-1 / 1-2 已安装）+ **Pinia 2.x** + **pinia-plugin-persistedstate ^3.x**（1-2 已安装）
- **@vicons/ionicons5** ^0.13.x（1-2 已安装）—— 本 story 新增使用图标：
  - `CheckmarkCircle`（已完成徽标）
  - `AlertCircle`（失败徽标，1-2 已用）
  - `Reload`（进行中徽标占位，未使用但保留分支）
  - `TimeOutline`（历史 dropdown 项前缀，可选）
- **不引入**新依赖（避免 bundle 体积膨胀）；所有用到的组件（`n-drawer`、`n-popover`、`n-tag`、`n-message`、`n-ellipsis`、`n-empty`、`n-button`、`n-icon`、`n-progress`、`n-text`）均 Naive UI 2.x 内置
- **不引入** `axios`（fetch 足够；本 story 不新增 API 调用，沿用 1-2 的 `analyze` / `crawl` / `getCrawlProgress`）
- **不引入** IndexedDB / `idb` / `localforage`（Epic 6 离线存储专用）

### File Structure Requirements

- **新增**：
  - `frontend/src/stores/crawl.ts` — Crawl store 管理历史与活动任务（architecture.md#L1711）
  - `frontend/src/types/crawl.ts` — `CrawlTaskRecord` 类型定义
  - `frontend/src/components/simple/HistoryCard.vue` — 历史卡片组件（architecture.md#L1699 `simple/` 子目录约定）
  - `frontend/src/components/simple/TaskDetailDrawer.vue` — 任务详情抽屉组件
  - `frontend/src/composables/useRelativeTime.ts` — 时间相对格式 composable
  - `frontend/tests/stores/crawl.test.ts` — Store 单元测试
  - `frontend/tests/components/HistoryCard.test.ts` — 组件单元测试
  - `frontend/tests/components/TaskDetailDrawer.test.ts` — 组件单元测试
  - `frontend/tests/components/SmartURLInputHistory.test.ts` — 组件单元测试
  - `frontend/tests/composables/useRelativeTime.test.ts` — composable 单元测试
- **修改**：
  - `frontend/src/views/SimpleView.vue` — 接通 useCrawlStore、渲染历史卡片列表、写入历史、删除/撤销/详情抽屉、SmartURLInput 历史 prop 传入
  - `frontend/src/components/SmartURLInput.vue` — 新增 `historyItems` prop + `n-popover` 历史 dropdown
  - `frontend/tests/components/SimpleView.test.ts` — 追加 ≥4 个新测试用例（保留 1-2 现有 11 测试不修改断言）
- **不创建**（明确边界）：
  - `frontend/src/components/TaskMonitorPanel.vue` — Epic 3 Story 3-4 任务执行控制
  - `frontend/src/components/BatchCrawlConfig.vue` — Epic 3 Story 3-2 批量任务
  - `frontend/src/components/UndoHistoryPanel.vue` — Epic 7 撤销历史
  - `frontend/src/components/DeletedTaskRecovery.vue` — Epic 7 Story 7-4 任务删除恢复
  - `frontend/src/utils/storage.js` — IndexedDB 封装由 Epic 6 创建
  - `frontend/src/api/websocket.ts` — Epic 2 真实 WebSocket 客户端
  - `backend/app/api/v1/crawl_tasks.py` — Epic 3 后端任务路由
  - `backend/app/models/crawl_task.py` — Epic 3 SQLAlchemy 模型
- **不修改**：
  - `frontend/src/main.ts`（pinia-plugin-persistedstate 已注册，新增 store 自动 persist）
  - `frontend/electron/main.ts`（renderer 侧 LocalStorage，不走 IPC；1-1 已交付）
  - `frontend/vitest.config.ts`（1-2 已配置；`composables/` 与 `stores/` 已在 coverage.include 内）
  - `frontend/src/router/index.ts`（简洁视图路由 1-1 已创建）
  - `frontend/src/stores/ui.ts`（1-2 已交付，保持解耦）

### Testing Requirements

- **测试目录** [Source: architecture.md#L1825-L1828, project-context.md#L178-L200]：
  - 单元测试：`frontend/tests/stores/crawl.test.ts`、`frontend/tests/components/HistoryCard.test.ts`、`TaskDetailDrawer.test.ts`、`SmartURLInputHistory.test.ts`
  - Composable 测试：`frontend/tests/composables/useRelativeTime.test.ts`
  - 扩展测试：`frontend/tests/components/SimpleView.test.ts`（追加，不重写）
  - E2E 测试：本 story 不新增 E2E — 启动路径 E2E 由 Story 1.1 覆盖；爬取流程 E2E 由 Epic 2 覆盖
- **覆盖率目标**：新增文件 ≥85% 行覆盖；保留 1-2 `SimpleView.test.ts` 现有 11 测试通过
- **vitest 配置** [Source: 1-1-desktop-app-install-launch.md#L470-L473]：
  - 不修改 `vitest.config.ts` 的 globals 配置（1-1 已禁用 `globals: true` 改用显式 import）
  - 不修改 `tsconfig.json` paths 与 types
  - `coverage.include` 已含 `src/composables/`、`src/stores/`、`src/components/`（如缺则补 `src/components/**/*.{ts,vue}`，但 1-2 已含 `simple/` 子目录）
- **Mock 边界**：
  - `import.meta.env.DEV` 与 `MOCK_BACKEND` 切换走 mock / 真实后端（沿用 1-2 `api/analyze.ts` L8-15 模式，本 story 不修改）
  - **禁止**用 `process.env?.VITE_*`（1-1 review patch L141 已修复）
  - 撤销计时器 `setTimeout` 必须在 `onBeforeUnmount` 中 `clearTimeout` 避免 1-1 review patch L128 同类事件监听泄漏
- **Naive UI 事件名**:
  - `n-drawer` 用 `@update:show` 不用 `@change`（1-2 review patch L129 — Naive UI 2.x `@change` 不触发，`@update:show` 是双向绑定语义）
  - `n-popover` 用 `trigger="manual"` + `:show="..."` 控制避免 1-1 review patch L129 事件绑定问题
  - `n-message` `action` 选项使用函数返回 VNode（`h('span', {...}, '撤销')`），Naive UI 2.x 接受函数式 action
- **测试断言王芳文案**：
  - 历史卡片标题、状态徽标、时间格式、删除通知均使用中文
  - 测试断言 `text` 内不含 "completed" / "failed" / "Task ID" / "Export" 英文（status 字段名英文 OK，可见文案必须中文）
- **测试用 `createTestingPinia`** [Source: 1-2-simple-view-url-input.md#L420-L428]：
  - 所有 `createTestingPinia({ createSpy: vi.fn })`（1-2 修复 3 已落地，本 story 沿用）
  - `useCrawlStore` 在测试中通过 `createTestingPinia` 自动 mock，actions 为 spy；但本 story 测试 `addTask` / `removeTask` 真实逻辑时需用真实 pinia（`createTestingPinia({ stubActions: false })` 或直接 `createPinia()`），避免 spy 拦截真实 state 修改
- **测试用 `n-message` mock**：
  - `useMessage()` 必须在 `n-message-provider` 子组件中使用；测试 mount 时需包裹 `NMessageProvider`，或 mock `useMessage` 返回 `{ info: vi.fn() }` 等
  - 推荐 `global: { plugins: [createTestingPinia(...), NMessageProvider] }` 包裹 mount

### Previous Story Intelligence

**Story 1.2 完成证据与必须延续的模式** [Source: 1-2-simple-view-url-input.md#L430-L467]：
- **可复用基础设施**：
  - `frontend/src/api/analyze.ts` 已实现 `analyze` / `crawl` / `getCrawlProgress` / `testAiProvider`（mock + 真实切换）
  - `frontend/src/types/analyze.ts` 已定义 `AnalyzeResponse` / `AnalyzedField` / `CrawlStage` / `CrawlProgressEvent` / `CrawlCompletedEvent`
  - `frontend/src/mocks/analyze-mock.ts` 已提供 `mockAnalyzeResponse` / `mockExamples` / `mockAnalyzedFields`
  - `frontend/src/stores/ui.ts` 已实现 `useUiStore` Setup Store + persist（视图偏好持久化）
  - `frontend/src/components/SmartURLInput.vue` 已实现 URL 输入 + 验证 + 示例 chip + loading 状态 + phase 文案切换 + 键盘导航；预留 `historyItems?` prop（待本 story 接通）
  - `frontend/src/components/ViewSwitcher.vue` 已实现视图切换器（dashboard/professional disabled）
  - `frontend/src/components/simple/ProgressPanel.vue` 已实现进度面板（n-progress + n-steps）
  - `frontend/src/views/SimpleView.vue` 已实现完整简洁视图（URL 输入 + 进度 + 空状态占位 + 视图切换）；状态机 `idle → analyzing → extracting → completed | failed`
  - `pinia-plugin-persistedstate ^3.2.3` 已安装并在 `main.ts` 注册（1-2 引入）
  - `@vicons/ionicons5 ^0.13.0` 已安装（1-2 引入）
- **必须避免的 1-2 review 错误**（来自 1-2 review patch list）：
  - 1-2 Patch L116 n-steps 3 阶段缺失 → 本 story `TaskDetailDrawer` 用 `n-steps` 时严格按 spec 实现完整阶段，不留中间态缺失
  - 1-2 Patch L120 按钮文案 3 态切换 → 本 story 任何按钮文案状态切换必须完整覆盖 spec 列出的所有状态
  - 1-2 deferred-work.md L5-15 WS 订阅先于 crawl() / mock-task 硬编码 / ViewSwitcher 双重 store 写等 → 本 story 不连接真实 WS（沿用 mock），不引入新的 mock-task 硬编码（用 `crypto.randomUUID()` 生成 record.id），不重复 store 写
  - 1-2 review L268 `setInterval` 必须配对 `clearInterval` → 本 story `setTimeout`（撤销计时器）必须配对 `clearTimeout`，`onBeforeUnmount` 中清理
  - 1-2 review L270 `n-checkbox` 用 `@update:checked`、`n-input` 用 `@update:value` → 本 story `n-drawer` 用 `@update:show`，`n-popover` 用 `trigger="manual"` + `:show`
  - 1-2 review L274 测试断言王芳文案 → 本 story 测试断言所有可见文案中文
  - 1-2 debug 修复 4（L423）SmartURLInput `:input-props` 透传 aria → 本 story 历史 dropdown 测试也注意 aria 属性
- **王芳文案落地模式**（1-2 L440-L443）：
  - 所有可见文案"您"称呼
  - 避免 URL/API/依赖/运行时/分析中术语
  - 进度反馈用百分比 + 简短状态
  - 错误信息先人话再操作
  - **本 story 新增**：历史卡片标题用页面标题（非 task_id）+ 时间相对格式（非 ISO 8601）+ 状态中文（非 completed/failed）+ 删除通知含撤销操作
- **IPC 边界**：
  - 本 story **不修改 main 进程**（1-1 已交付 `electron/main.ts`）
  - 历史记录持久化用 LocalStorage（renderer 侧），不走 IPC（避免给 main 增第 6th handler）
- **`App.vue` 已挂载 `n-message-provider` 验证** [Source: 需 dev 模式启动后确认]：
  - 1-1 / 1-2 已有的 `App.vue` 是否含 `NMessageProvider` 需在 dev 阶段确认；若缺失则在本 story `SimpleView.vue` 顶层包裹 `<NMessageProvider>` 局部使用（避免污染 1-2 已通过测试）

### Git Intelligence Summary

最近相关 commit（7dabf26 完成 Story 1-2 简洁视图与网址输入实施及代码审查修复）— 1-2 已交付前述基础设施。

- 7dabf26 feat(frontend): 完成 Story 1-2 简洁视图与网址输入实施及代码审查修复
- b6300ce feat(frontend): 完成 Story 1-1 桌面应用安装与启动实施及代码审查修复
- a0bcdb7 docs(design): 添加返回按钮设计规范
- a7ec272 docs: update UX design artifacts with enhanced patterns and styling
- 3f30331 docs: 项目文档重组和更新

 actionable insights：
- 1-2 已建立组件命名前缀（`SmartURLInput` 无前缀、`simple/ProgressPanel.vue` 子目录）；本 story `HistoryCard` / `TaskDetailDrawer` 沿用 `simple/` 子目录
- 1-2 测试模式：每个组件独立 `*.test.ts`、`createTestingPinia({ createSpy: vi.fn })`、`vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync` 推进 mock setInterval；本 story 沿用此模式推进 mock 1-2 `getCrawlProgress` 完成以触发历史写入
- 1-2 `import.meta.env.MODE === 'test'` 让 vitest 下 `MOCK_BACKEND` 为真；本 story 不修改该逻辑

### Latest Tech Information

- **`Intl.RelativeTimeFormat` vs 手写阶梯**：
  - `Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })` 输出 "3 分钟前" / "刚刚" 格式
  - 但 API 需要 negative value（`format(-3, 'minute')` 输出"3 分钟前"）+ 手动 unit 切换（minute/hour/day）+ 边界处理易出 off-by-one bug
  - **本 story 选择手写 if-else 阶梯**（[Task 7.2](#task-7--时间格式化-composable-ac-1-2-7)）—— 代码清晰、易测试、bundle 体积更小（10 行 vs Intl polyfill 数 KB）
  - ⚠️ 不用 context7 验证 `Intl.RelativeTimeFormat` 行为（决策已定）
- **`crypto.randomUUID()` 浏览器支持**：
  - Chrome 92+ / Edge 92+ / Firefox 95+ / Safari 15.4+ 支持
  - Electron 28.x（Chromium 122）支持
  - ⚠️ 测试环境 jsdom 默认无 `crypto.randomUUID`——测试中需 mock `globalThis.crypto.randomUUID = () => 'mock-uuid-' + Math.random()` 或用 `vi.stubGlobal`
- **Naive UI 2.x `n-drawer` 行为**：
  - `placement="right"` + `:width="480"` + `:show` 双向绑定 + `@update:show`
  - 关闭按钮自动渲染（`n-drawer` 默认 `closable`）；可通过 `:auto-focus="true"` 自动聚焦首个可聚焦元素
  - ⚠️ 以 context7 查询 Naive UI 2.x `n-drawer` 最新 API 为准
- **Naive UI 2.x `n-message` `action`**：
  - `useMessage().info(content, options)` where `options.action` 可以是 VNode 或函数返回 VNode
  - 5 秒自动关闭由 `duration: 5000` 控制；手动关闭由 message 实例 `destroy()` 控制
  - ⚠️ **Task 6.0 前置**：dev 第一阶段必须用 context7 MCP 查询当前安装的 Naive UI 2.x 版本的 `n-message` action API 签名（函数式 vs VNode 形式）
  - ⚠️ `n-message-provider` 必须在组件树祖先——`App.vue` 1-1 / 1-2 挂载状态需 Task 6.0.1 读取 `frontend/src/App.vue` 确认；未挂载则在 `SimpleView.vue` 顶层局部包裹 `<n-message-provider>`
- **`n-popover` manual trigger**：
  - `trigger="manual"` + `:show="..."` + `@clickoutside="..."`（可选）；本 story 用 `@focus` / `@blur` 控制 show 简化交互
  - ⚠️ popover 在 `n-input` 下方需要 `placement="bottom-start"` 避免 1-2 review 中 SmartURLInput 模式问题
- **`n-ellipsis` 行为**：
  - `n-ellipsis` 默认单行省略；`:line-clamp="2"` 多行省略
  - ⚠️ 长任务标题超 24 字符不应在卡片截断（已用 `pageTitle.slice(0, 24)` 显式截断），详细抽屉中用 `n-ellipsis` 完整显示 + tooltip

### Project Context Reference

[Source: `_bmad-output/project-context.md`] — 实现前必读：
- §1 命名约定（Vue PascalCase 组件、camelCase 变量、TypeScript `.ts` 后缀）[L52-L66]
- §6 WebSocket 实时通信（事件版本控制 `X-Event-Version: v1`；本 story dev 用 mock，生产由 Epic 2 接通）[L156-L164]
- §7 前端状态管理（Pinia 按功能模块组织，`persist: true` 持久化；本 story `useCrawlStore` 设 `persist: { key: 'ai-crawler:crawl-history', pick: ['history'] }`）[L166-L176]
- §8 测试规范（单元测试 `*.test.ts`、Mock 外部服务、测试行为不测实现细节、覆盖率 ≥85%）[L178-L200]
- §9 代码组织（`frontend/src/components/`、`frontend/src/stores/`、`frontend/src/composables/`）[L202-L222]
- §14 性能约束 — API 响应 <200ms 95th percentile（本 story mock 直接返回，无 API 调用新增）；列表渲染 <200ms（50 条卡片渲染）[L278-L284]
- §15 关键反模式 — 本 story 不涉及 Celery/Playwright 反模式，但需注意不在 store actions 中调用 API（反模式延伸）[L286-L301]

### 王芳 Persona — 文案与交互语调指导

[Source: prd.md#L1406-L1424 — 王芳 = 38 岁非技术用户，电商店主，时间紧迫，技术术语陌生]

本 story 的历史卡片、详情抽屉、删除通知等所有用户可见文案，必须按王芳 persona 调整：

- **历史卡片**：
  - ✅ 任务标题："电商网站 - 商品列表" / "新闻网站 - 文章列表"（页面标题或 hostname）
  - ❌ "task_id: abc12345" / "Crawl job #42" / "task_2026-04-30_1430"
  - ✅ 时间："3 分钟前" / "2 小时前" / "昨天" / "2026-04-30"
  - ❌ "2026-04-30T14:30:45.123Z" / "3 minutes ago" / "Invalid Date"
  - ✅ 数据条数："156 条数据" / "未提取到数据"
  - ❌ "156 rows" / "0 records" / "NaN entries"
  - ✅ 状态徽标："已完成" / "失败" / "进行中"
  - ❌ "completed" / "failed" / "running" / "status: SUCCESS"
- **详情抽屉**：
  - ✅ "任务详情" / "网址" / "爬取时间" / "数据条数" / "AI 识别的字段" / "导出数据"
  - ❌ "Task Detail" / "URL" / "Crawled At" / "Records" / "Detected Fields" / "Export"
  - ✅ 空详情："还没有详情" + 提示"点击历史卡片可查看任务详情"
  - ❌ "No data" / "Empty state"
  - ✅ 字段列表标签："字段名" / "选择器" / "置信度" / "样本值"
  - ❌ "Field Name" / "Selector" / "Confidence" / "Sample Value"
  - ✅ 日志摘要占位："详情日志由 Epic 3 交付"（避免 "Epic 3" 术语，改写为"详情日志即将推出"）
  - ❌ "Detailed logs coming in Epic 3"
- **删除通知**：
  - ✅ "已删除，5 秒内可撤销" + 撤销按钮"撤销"
  - ❌ "Task deleted" / "Item removed" / "Undo (5s)"
- **SmartURLInput 历史 dropdown**：
  - ✅ 列表项："example.com - 3 分钟前"
  - ❌ "https://example.com - 3m ago"
  - ✅ 空 history 不显示浮层（避免空 dropdown 视觉污染）
- **避免的术语清单**：URL（用"网址"）、API、中台、依赖、运行时、进程、签名、实例化、序列化、字段（用"内容"或"AI 识别的字段"配合解释）、视图（可用"界面"）、Epic（用"后续版本"）

## Project Structure Notes

- 本 story 全部新增/修改文件位于 `frontend/src/` 与 `frontend/tests/` — 不触及 `backend/` 与 `frontend/electron/`
- 与 Epic 2 Story 2.1 的边界：本 story 沿用 1-1 / 1-2 的 `analyze` / `crawl` / `getCrawlProgress` API（mock 模式），真实后端由 Epic 2 交付；本 story 在 mock `crawl()` resolve 时写入历史，真实后端由 Epic 2 的 `task_completed` WS 事件触发写入（届时需在 WS 客户端接通 `addTask` 调用）— 本 story 写入逻辑封装在 `SimpleView` 组件 `runCrawl` 完成路径，Epic 2 接通 WS 时只需在该位置改为响应 WS 事件
- 与 Epic 3 的边界：任务调度、批量任务、任务执行控制、任务执行日志由 Epic 3 Stories 3-1 ~ 3-5 交付；本 story 仅交付 Phase 1 MVP 的历史记录查看 + 详情 + 删除 + 撤销（同会话），不实现调度、批量、并发控制、详细日志
- 与 Epic 4 的边界：仪表板视图与专业视图的任务管理面板（TaskMonitorPanel 等）由 Epic 4 交付；本 story 仅交付简洁视图内的历史卡片列表
- 与 Epic 5 的边界：数据导出由 Epic 5 交付；本 story TaskDetailDrawer 中"导出数据"按钮 disabled + tooltip"导出功能即将推出"
- 与 Epic 6 的边界：离线模式与 IndexedDB 存储由 Epic 6 交付；本 story 用 LocalStorage（小数据同步读取，符合 Phase 1 规模 <50 条历史）
- 与 Epic 7 的边界：撤销/重做架构、任务删除 30 天恢复、撤销历史面板由 Epic 7 交付；本 story 仅交付同会话 5 秒撤销（不持久化待恢复任务）
- 与 Story 1.4 的边界：1.4 实现 `useSettingsStore`（主题/语言/通知偏好），与本 story 的 `useCrawlStore` 解耦
- **检测到的冲突**：
  1. UX 规范 L3347 "最近爬取"卡片含"查看 / 导出 / 删除"按钮组 vs AC8 要求"删除"触发撤销通知 vs Epic 7 Story 7-4 才正式交付"任务删除 30 天恢复" — 解析：本 story 交付同会话 5 秒撤销（非 30 天回收站），不破坏 Epic 7 后续扩展；Epic 7 实现时可复用本 story 的 `removeTask` action + 增 `recycleBin` state 字段
  2. architecture.md#L1711 `frontend/src/stores/useCrawlStore.js` 为 .js 文件路径 vs project-context.md#L52-L66 TypeScript `.ts` 优先 — 解析：1-1 / 1-2 已统一使用 `.ts`（`stores/onboarding.ts`、`stores/ui.ts`）；本 story 沿用 `stores/crawl.ts`
  3. architecture.md#L1347-L1350 `useCrawlStore` state shape `{ activeTasks: [], history: [] }` vs 本 story 仅用 `history` 字段 — 解析：保留 `activeTasks` 空数组字段（`const activeTasks = ref<CrawlTaskRecord[]>([])`）预留 Epic 3 接通实时任务，避免后续 store 大重构
  4. UX 规范 L3378 "历史记录卡片宽度 100%" vs 简洁视图 `simple-view__body` max-width 800px — 解析：卡片宽度 100% 即相对于 800px 容器，符合简洁视图布局
  5. 1-2 deferred-work.md L12 `onStartHistory` 双 scrollTo 冗余（`bodyRef.scrollTo` + `window.scrollTo`） — 本 story **不修复**该 deferred 项（Epic 2 重写时清理）；保留 1-2 实现不动避免回归 1-2 测试
  6. 1-2 deferred-work.md L4-15 真实 WS 流程延后到 Epic 2 — 本 story 写历史时机为 mock `crawl()` resolve 后，真实 WS 接通由 Epic 2 改造；本 story 在组件层留 `// TODO(Epic 2): replace with WS task_completed event handler` 注释
  7. `n-message` `action` 选项 API 在 Naive UI 2.x 不同版本签名差异（函数 vs VNode）— 解析：dev 阶段以 context7 验证 Naive UI 2.x 当前安装版本的 `n-message` action API；若函数形式不支持则用 VNode `h('span', {...}, '撤销')`
  8. `App.vue` 是否已挂载 `n-message-provider` 未确认 — 解析：dev 阶段先读 `frontend/src/App.vue` 确认；若缺失则改在 `SimpleView.vue` 模板根包裹 `<n-message-provider>` 局部使用（不污染 1-2 已通过测试）
  9. `crypto.randomUUID()` 在 jsdom 测试环境缺失 — 解析：测试 setup 在 `beforeEach` 中 `vi.stubGlobal('crypto', { randomUUID: () => 'mock-uuid-' + Math.random() })`，避免单测试用例分别 stub

## References

- [Source: epic-01-first-time-onboarding.md#L78-L102] — Story 1.3 原始需求与 AC
- [Source: epic-03-crawl-task-management.md#L1-L20] — Epic 3 爬取任务管理范围（本 story 限历史查看）
- [Source: prd.md#L1528-L1529] — FR33 用户管理爬取任务；FR34 用户查看爬取历史与结果
- [Source: prd.md#L1406-L1424] — 王芳 persona（38 岁非技术电商店主）
- [Source: prd.md#L1759-L1821] — NFR1 <8s / NFR4 <200ms / NFR33 <3s
- [Source: architecture.md#L188] — Pinia stores 按视图分离（useCrawlStore 命名）
- [Source: architecture.md#L191] — 用户偏好 LocalStorage 存储
- [Source: architecture.md#L194-L246] — ADR-006 三级视图策略与状态管理
- [Source: architecture.md#L614-L628] — TaskMonitorPanel 组件规格（Epic 3 交付，本 story 不创建）
- [Source: architecture.md#L650-L664] — SmartURLInput 组件规格（含历史 dropdown，本 story 接通）
- [Source: architecture.md#L794-L808] — UndoHistoryPanel 组件规格（Epic 7 交付，本 story 不创建）
- [Source: architecture.md#L862-L863] — Phase 1 MVP 组件优先级
- [Source: architecture.md#L1318-L1330] — WebSocket 事件命名 (snake_case) — task_completed
- [Source: architecture.md#L1342-L1356] — Pinia store 命名与 state 命名规范；useCrawlStore state shape
- [Source: architecture.md#L1360-L1372] — ADR-007 错误处理策略
- [Source: architecture.md#L1389-L1404] — WebSocket 事件版本控制 `X-Event-Version: v1`
- [Source: architecture.md#L1699] — `simple/` 子目录约定（HistoryCard / TaskDetailDrawer 同目录）
- [Source: architecture.md#L1711] — `frontend/src/stores/useCrawlStore.js` 路径（本 story 用 `.ts`）
- [Source: architecture.md#L1772] — Epic 3 与 `frontend/src/stores/crawl.js` 关联
- [Source: ux-design-specification.md#L1067] — 最近任务列表 UX 要求
- [Source: ux-design-specification.md#L2285-L2320] — TaskMonitorPanel 组件 UX 规格（Epic 3）
- [Source: ux-design-specification.md#L2713-L2727] — 空状态和加载状态（历史记录空状态延续 1-2）
- [Source: ux-design-specification.md#L2773-L2789] — Naive UI 集成与自定义模式规则
- [Source: ux-design-specification.md#L2879-L2883] — 任务删除 30 天恢复窗口（Epic 7 交付）
- [Source: ux-design-specification.md#L3333-L3385] — 屏幕 6 简洁视图布局（最近爬取卡片列表）
- [Source: ux-design-specification.md#L3734-L3735] — SmartURLInput 历史记录下拉
- [Source: 1-1-desktop-app-install-launch.md#L256-L269] — Story 1.1 测试规范基线
- [Source: 1-1-desktop-app-install-launch.md#L359-L377] — Story 1.1 王芳文案落地模式
- [Source: 1-1-desktop-app-install-launch.md#L454-L466] — Story 1.1 完成证据与可见文案要求
- [Source: 1-2-simple-view-url-input.md#L13-L29] — Story 1.2 AC1-AC14（本 story 基线，不破坏）
- [Source: 1-2-simple-view-url-input.md#L41-L60] — SimpleView.vue 现有占位与 CSS 类名
- [Source: 1-2-simple-view-url-input.md#L96-L129] — runCrawl 流程（本 story 在 completed/failed 后追加 addTask）
- [Source: 1-2-simple-view-url-input.md#L174-L218] — 关键架构决策与约束
- [Source: 1-2-simple-view-url-input.md#L22-L24] — AC8 历史记录空状态占位由 1.3 升级
- [Source: 1-2-simple-view-url-input.md#L189] — Gap 1 SmartURLInput 历史 dropdown 由 Story 1.3 实现
- [Source: 1-2-simple-view-url-input.md#L250] — `frontend/src/stores/crawl.ts` 边界声明（本 story 交付）
- [Source: 1-2-simple-view-url-input.md#L336-L358] — 王芳 persona 指导
- [Source: 1-2-simple-view-url-input.md#L429-L445] — Story 1.2 完成清单与测试套件
- [Source: 1-2-simple-view-url-input.md#L447-L467] — Story 1.2 文件清单（基础设施复用）
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#L5-L15] — 1-2 deferred WS 边界
- [Source: project-context.md#L18-L46] — 技术栈版本
- [Source: project-context.md#L52-L66] — 命名规范（TypeScript `.ts`）
- [Source: project-context.md#L156-L164] — WebSocket 实时通信约定
- [Source: project-context.md#L166-L176] — Pinia store 持久化
- [Source: project-context.md#L178-L200] — 测试规范
- [Source: project-context.md#L202-L222] — 前端代码组织
- [Source: project-context.md#L286-L301] — 关键反模式禁止项（store 不调 API）

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6) via Claude Code CLI BMAD dev-story workflow

### Debug Log References

- 初次 vitest 运行 25 个测试失败，根因：`useNotification()` 在测试环境缺少 `NNotificationProvider` 祖先组件抛错
- 修复尝试 1（已废弃）：`useNotification` try/catch 包装 + `getCurrentInstance()` 守卫 → 引入通知文本"撤销"断言失败 + 测试逻辑分支不可达
- 最终方案：完全移除 Naive UI notification 依赖，改用 `SimpleView.vue` 模板内原生 HTML toast（`<transition name="fade"><div class="simple-view__undo-toast">` + `undoToastShow` ref + `setTimeout/clearTimeout`），保留 AC8 撤销能力，不依赖 Naive UI Provider
- 测试 stub 命名问题：Naive UI 组件内部 name 是 `Drawer` / `DrawerContent` / `Popover`（非 `NDrawer` 等），按组件外部名 stub 时 `wrapper.text()` 仍空（`<!--teleport start-->` 未渲染 slot）；按内部 name stub 后 slot 正常渲染
- SimpleView `openDetail` 初版仅设本地 `activeTaskId`，未触发 `crawlStore.setActiveTask(id)` → SimpleView 集成测试"打开抽屉"断言 `store.activeTask not null` 失败；补 `crawlStore.setActiveTask(id)` 后通过
- jsdom 默认无 `crypto.randomUUID`，新增 `frontend/tests/setup.ts` 全局 stub（`vi.stubGlobal('crypto', { randomUUID: () => 'mock-uuid-' + Math.random().toString(36).slice(2, 10) })` + `afterEach` 取消 stub）
- TaskDetailDrawer 测试 stubs 过严导致 NDrawer/NDrawerContent slot 内容不渲染，需用带 `name: 'Drawer'` 的对象 stub 让默认 slot 渲染
- Vitest 最终：81 通过 / 0 失败（10 个测试文件）；覆盖率：SimpleView 93.49% / HistoryCard 94.18% / TaskDetailDrawer 99.17% / useRelativeTime 100% / crawl 91.48%，新增文件均 ≥85% 行覆盖目标

### Completion Notes List

- 决策：撤销交互实现路径偏离 Task 6.1-6.3（Naive UI `useMessage().info(content, {action})`）——Naive UI 2.38 `MessageOptions.action` 字段在 TS 类型定义中不存在（context7 调研 `node_modules/naive-ui/types.d.ts` 确认）；改为模板内联 toast 实现同等 AC8 功能（"已删除，5 秒内可撤销"+"撤销"按钮 + 5 秒计时器 + clearTimeout onBeforeUnmount）
- 决策：Task 7.2 采纳——`useRelativeTime` 手写 if-else 阶梯（<60s/分钟前/小时前/天前/>7d 绝对日期），未用 `Intl.RelativeTimeFormat`
- 决策：Round 1 `TaskDetailDrawer` 测试第四项 "update:show 关闭事件"在原 stub 化 NDrawer 后无法触发，已移除；Round 2 A3 修复：通过 `findComponent({ name: 'Drawer' }).vm.$emit('update:show', false)` 触发 stub 的 update 事件，parent listener `@update:show="emit('update:show', $event)"` 转发，断言 `wrapper.emitted('update:show')![0]` = `[false]`
- 决策：A5 抽取 `useStatusTag(status)` composable 至 `frontend/src/composables/useStatusTag.ts`，返回 `{ type, color: {color, borderColor, textColor}, icon, text, spinning }`；HistoryCard 与 TaskDetailDrawer 共享，统一 hex 调色板（#3B82F6/#10B981/#EF4444）与 Reload 图标 spin 标记，避免两处三件套 `tagType`/`tagIcon`/`tagText` 重复
- 决策：B2 采纳"30s 全局 tick"——crawl store 加 `nowTimestamp` ref + `startTick/stopTick` action（`setInterval(tick, 30000)`）；SimpleView `onMounted` 启动 + `onBeforeUnmount` 清理；HistoryCard / TaskDetailDrawer 通过 `now?: number` prop 注入；不通过 Date.now() 默认参数一次性捕获避免 30s 后表盘冻结
- 决策：B3+B4 联动裁决（用户授权）——`pendingUndos: Array<{task, index, timer}>` 数组队列连环撤销，每次删除记录 `crawlStore.history.findIndex(t => t.id === id)` 的原位置；`undoDelete` 取数组末项 `splice(Math.min(originalIndex, history.length), 0, task)` 恢复到原位置（clamp 防越界）；toast 文案保留单条 "已删除，5 秒内可撤销"，未启用 N-counter（按用户选择）
- 决策：B7 drawer `emit('export'): []` 无 payload，SimpleView `onExport()` 不带参数；export 功能 disabled 时 drawer `aria-label="导出数据"` + `disabled` 即可，未来真实导出由 Epic 5 通过 `crawlStore.activeTask?.id` 取 id
- 决策：B8 SmartURLInput `onHistoryClick` 重排：`nextTick` 内 `syncStatus(value) → focusInput() → showHistory.value = false`；focusInput 触发 onFocus 翻 `showHistory=true`，随后 `showHistory=false` 落地最终态；Vue 批处理效果同步在 microtask 内合并，DOM 更新时取最终值 false，popover 关闭
- 决策：B9 单源采纳——SimpleView 移除本地 `activeTaskId` ref 与 `activeTaskRecord` computed，`openDetail(id)` 仅 `crawlStore.setActiveTask(id) + drawerShow=true`；drawer `:record="crawlStore.activeTask"` 直接读 store 单源
- 决策：禁令第 4 项"不修改 vitest.config.ts"经用户授权解除，vitest.config.ts include 追加 `'tests/stores/**/*.test.ts'` 与 `'tests/composables/**/*.test.ts'`，使 stores/composables 测试纳入默认运行；同时 `tests/stores/*.test.ts` 改 `createPinia + pinia.use(plugin) + createApp({}).use(pinia)` 顺序让 plugin 真正注册到 `_p`，persist 测试用 10ms macrotask flush
- `useRelativeTime` 单元测试 `NOW = 2026-08-08T12:00:00` 钉死以避免机器时钟差异；相对时间 5 个分支 + 绝对日期 + formatAbsoluteTime 共 7 个测试
- FIFO 50 上限：`addTask` 通过 `unshift` + `slice(0, 50)` 实现；测试构造 51 条 record 验证截断后最老条目被丢弃
- 王芳文案核对："还未开始爬取"，"3 分钟前"，"已完成"/"失败"，"删除"/"撤销"，"还没有详情"，"已删除，5 秒内可撤销"，"立即开始爬取"——全部中文，无 URL/Task/ISO 8601 泄漏
- Story 1-2 11 个测试全部保留通过（无 SimpleView 改动破坏既有测试）+ 4 个新增测试（爬取完成历史卡片出现 / 查看按钮打开抽屉 / 删除显示撤销通知 / 撤销恢复条目）
- 测试总数：98/98 通过，13 个测试文件全绿（含 stores/composables 之前 phantom 的 3 个文件经 vitest.config.ts include 修复后纳入）；新增 31 个测试（useRelativeTime 7 + HistoryCard 7 + TaskDetailDrawer 4 + SmartURLInputHistory 3 + crawl store 5 + ui store 2 + SimpleView 扩展 4 - 部分继承 1-2）；超过 AC12 ≥12 个新增新功能覆盖目标
- 禁止 IndexedDB（Epic 6 边界）已遵守；localStorage key `ai-crawler:crawl-history` 通过 `pinia-plugin-persistedstate` `pick: ['history']` 仅持久化 history 字段（activeTask / nowTimestamp 不持久化）
- 禁止 store 调用 API 已遵守：`useCrawlStore` 仅 `unshift` / `filter` / `slice` / `findIndex` / `setInterval` / `clearInterval` 操作 state，业务逻辑（analyze / crawl / addTask 时机）在 SimpleView `runCrawl` 内
- 禁止修改 `useUiStore`（1-2 已交付）已遵守；`SimpleView` 通过 `uiStore.viewPreference`（仅读取视图切换）+ `crawlStore`（本 story 新增）双重订阅
- Mock API 沿用 1-2 `analyze` / `crawl` / `getCrawlProgress`（DEV / test 环境 mock）；本 story 不新增 API 调用

### File List

新增：
- `frontend/src/types/crawl.ts` — `CrawlTaskRecord` 与 `CrawlTaskStatus` 类型定义
- `frontend/src/stores/crawl.ts` — useCrawlStore with history（FIFO 50）+ activeTask + nowTimestamp（30s tick）+ 5 actions（addTask/removeTask/getTaskById/setActiveTask/startTick/stopTick）+ persist `'ai-crawler:crawl-history'`
- `frontend/src/composables/useRelativeTime.ts` — `formatRelativeTime(now?)` + `formatAbsoluteTime()` 王芳 zh-CN 文案
- `frontend/src/composables/useStatusTag.ts` — 状态徽标 composable：`useStatusTag(status)` 返回 `{ type, color, icon, text, spinning }`，hex 调色板 #3B82F6/#10B981/#EF4444，HistoryCard 与 TaskDetailDrawer 共享（A5）
- `frontend/src/components/simple/HistoryCard.vue` — 历史卡片：状态徽标（NTag `:color` hex + NIcon spin keyframes）+ NEllipsis 单行截断标题 + `now` prop 接入 30s tick + 查看/导出/删除 三按钮 + a11y tabindex=0
- `frontend/src/components/simple/TaskDetailDrawer.vue` — 右侧抽屉（NDrawer @update:show）：任务标题 / 元信息 dl / AI 识别字段列表 + NProgress / 详情日志占位 / 导出 disabled；接入 useStatusTag + `now` prop + spin keyframes
- `frontend/tests/stores/crawl.test.ts` — 5 测试：addTask / FIFO 截断 / removeTask / getTaskById / persist localStorage（pinia plugin flush via createApp + 10ms macrotask）
- `frontend/tests/components/HistoryCard.test.ts` — 7 测试：状态徽标 / 时间格式 / 绝对日期 / 删除事件 / 查看事件 / 未提取到数据
- `frontend/tests/components/TaskDetailDrawer.test.ts` — 4 测试：字段列表渲染 / 还没有详情空状态 / 导出 disabled / update:show 关闭事件转发
- `frontend/tests/components/SmartURLInputHistory.test.ts` — 3 测试：popover 显示 / popover 不显示 / 点击历史项触发 update:modelValue
- `frontend/tests/composables/useRelativeTime.test.ts` — 7 测试：5 档相对时间 + 绝对日期 + formatAbsoluteTime

修改：
- `frontend/src/components/SmartURLInput.vue` — 新增 `historyItems` prop + `HistoryItem` 类型导出 + NPopover placement="bottom-start" trigger="manual" + onFocus / onBlur / onHistoryClick（B8：focusInput → setShow(false) 顺序确保 popover 关闭）+ scss `__history` / `__history-item` / `__history-host` / `__history-time`
- `frontend/src/views/SimpleView.vue` — 接入 useCrawlStore（B9 单源化：移除本地 `activeTaskId` ref，直接 `crawlStore.activeTask`）；runCrawl 成功 / 失败路径调用 crawlStore.addTask；`onMounted` 启动 `crawlStore.startTick()` + `onBeforeUnmount` 调用 `stopTick()`（B2）；HistoryCard / TaskDetailDrawer `:now="crawlStore.nowTimestamp"`；删除改 `pendingUndos: Array<{task, index, timer}>` 队列（B4）+ `splice(originalIndex, 0, task)` 恢复原位置（B3）；`onExport()` 移除 `_id` 参数（B7）
- `frontend/tests/setup.ts` — beforeEach afterEach crypto.randomUUID stub
- `frontend/tests/components/SimpleView.test.ts` — 4 个新增测试（爬取完成历史卡片出现 / 查看打开抽屉 / 删除显示撤销通知 / 撤销恢复条目）+ 撤销测试改用 `.simple-view__undo-action` 按钮（非 notification link）
- `frontend/vitest.config.ts` — 解除禁令第 4 项裁决下，include 数组追加 `'tests/stores/**/*.test.ts'` 与 `'tests/composables/**/*.test.ts'`（Decision-needed 修复）
- `frontend/tests/stores/crawl.test.ts` + `frontend/tests/stores/ui.test.ts` — 改用 `createPinia() + pinia.use(piniaPluginPersistedstate) + createApp({}).use(pinia)` 顺序让 plugin 真正注册到 `_p` 数组；persist 测试用 `await new Promise(r => setTimeout(r, 10))` 让 macrotask flush

### Change Log

- 2026-08-08 10:41 - Story 1-3 状态从 `ready-for-dev` 改为 `in-progress`，sprint-status.yaml 同步更新
- 2026-08-08 11:13 - Task 1 完成：crawl.ts 类型 + store 创建
- 2026-08-08 11:30 - Task 7 完成：useRelativeTime composable + 单元测试 7 测试
- 2026-08-08 12:40 - Task 2 完成：HistoryCard.vue 组件 + 7 个测试
- 2026-08-08 12:50 - Task 3 完成：TaskDetailDrawer.vue 组件 + 4 个测试
- 2026-08-08 13:00 - Task 5 完成：SmartURLInput 新增 NPopover 历史 dropdown + 3 个测试
- 2026-08-08 13:30 - Task 4 完成：SimpleView 接入 useCrawlStore，runCrawl 写入历史
- 2026-08-08 14:00 - Task 6 完成：撤销删除 toast 实现 + 4 个新增 SimpleView 测试
- 2026-08-08 14:30 - Task 8.0 完成：crypto.randomUUID jsdom stub
- 2026-08-08 16:00 - 初次全量 vitest 运行：25/82 失败（Naive UI notification provider 缺失根因）
- 2026-08-08 17:00 - 修复方案 pivot：从 n-notification 改为模板内联 toast，通过 Naive UI 替代
- 2026-08-08 18:00 - 测试 stub name 调研：按内部组件名（Drawer / Popover）stub 解决 teleport 渲染问题
- 2026-08-09 21:52 - 最终 vitest 运行：81/81 通过，10 个测试文件全绿；覆盖率达标
- 2026-08-09 21:55 - Story 1-3 状态改为 `review`，sprint-status.yaml 同步
- 2026-08-10 07:35 - Review Round 1 完成 9 patches（B1/B5/B6/B10/B12a/B12b/A2/A9/A10）+ Decision-needed 提出禁令解除请求；vitest 97/97 绿
- 2026-08-10 07:50 - Review Round 2 完成 10 patches（B2/B3/B4/B7/B8/B9/A1/A3/A5/A6）：新增 `useStatusTag` composable 共享 hex 调色板与 spin keyframes；crawl store 加 `nowTimestamp` + `startTick`/`stopTick` + SimpleView `onMounted/onBeforeUnmount` 接入 30s 全局 tick；HistoryCard + TaskDetailDrawer 改 `:now` prop 注入；SimpleView 移除本地 `activeTaskId` 改走 `crawlStore.activeTask` 单源；`pendingUndos` 数组队列 + `splice(originalIndex, 0, task)` 恢复原位置；`onExport` 移除 `_id` 参数；SmartURLInput `onHistoryClick` 重排 `focusInput → setShow(false)` 顺序修 popover 关闭 bug；TaskDetailDrawer.test.ts 补第 4 个 `update:show` 测试
- 2026-08-10 07:52 - vitest 最终运行：98/98 通过，13 个测试文件全绿（含 stores/composables/spec 之前 phantom 的 3 个文件经 vitest.config.ts include 修复后纳入）
- 2026-08-10 07:55 - Story 1-3 状态保持 `review`，等待用户决定是否再启 Round 3 code-review 或转 `done`
- 2026-08-10 15:30 - Review Round 3 对抗式审查完成（Blind Hunter 20 + Edge Case Hunter 14 + Acceptance Auditor 4 = 38 raw → 3 decision / 17 patch / 2 defer / 4 dismiss）；3 项 decision-needed 用户全部裁决 (a)：D1 引用计数 refcount、D2 相邻 ID 重定位、D3 onUnmount restoreAll；3 项 decision 转入 patch 后总计 20 项 patch（R3-P1 ~ R3-P20）
- 2026-08-10 15:45 - Review Round 3 全 20 项 patch 批量应用完成：useStatusTag.ts 移除 `computed` 包装 + `StatusTagType`/`type` 字段 + 浅克隆 color 对象（P1/P2/P3）；crawl.ts 加 `computed` getter 封装 nowTimestamp + `activeTickers` refcount + `restoreTask(task, neighborId)` action + startTick 即时刷新（P5/P6/P12/P18/P19 辅助）；HistoryCard.vue + TaskDetailDrawer.vue `now` prop 改必需（P4）；SmartURLInput.vue onHistoryClick `try/finally` 包裹（P13）；SimpleView.vue PendingUndo.neighborId 重构 + onBeforeUnmount restoreAll 循环（P6 调用方/P19/P20/D3）；crawl.test.ts 加 waitForPersist 轮询 + afterEach app.unmount + 5 个新测试覆盖 P7/P14/P15 与 restoreTask 三态（P9/P10/P14/P15/P7 验证）；ui.test.ts 同步 waitForPersist + afterEach 模式（P9/P10）；TaskDetailDrawer.test.ts Drawer stub 加 `props: { show: Boolean }` + 补 prop-in 断言（P8）；新增 useStatusTag.test.ts 6 个单元测试覆盖 PALETTE 4 状态 + fallback + 克隆保护（P11）；SimpleView.test.ts 加 afterEach(stopTick) + 撤销恢复位置断言（P14/P15）；Story file Status: `in-progress` → `review`（P16）；AC12 文案更新移除 clearHistory、新增 useStatusTag.test.ts 与位置断言覆盖（P17）
- 2026-08-10 15:45 - vitest 最终运行：109/109 通过，14 个测试文件全绿（新增 useStatusTag.test.ts +6 测试 + crawl.test.ts +5 测试）
- 2026-08-10 15:45 - Story 1-3 状态保持 `review`，等待用户决定是否再启 Round 4 code-review 或转 `done`
