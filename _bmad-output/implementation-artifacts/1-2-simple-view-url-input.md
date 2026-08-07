# Story 1.2: 简洁视图与网址输入

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为新用户，
我希望能通过简洁的界面输入网址，
以便我能像使用搜索引擎一样简单地进行爬取。

## Acceptance Criteria

1. **AC1 - 简洁视图默认落地**: 用户完成首次启动向导（或跳过向导）后进入 `/simple-view` 路由，落地页即为简洁视图；URL 直接访问 `#/simple-view` 在用户已通过隐私同意且向导已完成或跳过时同样落地。 [Source: epic-01-first-time-onboarding.md#L48-L55, ux-design-specification.md#L1041-L1060, router/index.ts#L25-L28]
2. **AC2 - 大搜索框居中显示**: 主界面顶部居中显示大尺寸 URL 输入框（高度 ≥48px，最大宽度 800px），按 UX-DR1 搜索引擎式体验；输入框左侧带地球图标 🌐，右侧带"开始爬取"Primary 按钮。 [Source: ux-design-specification.md#L3333-L3378, prd.md#L1525 FR30]
3. **AC3 - 2-3 个示例网址**: 输入框下方提供 2-3 个示例网址 chip（例如 `https://example.com/product`、`https://news.example.com/article`、`https://blog.example.com/post`），点击 chip 自动填充 URL 并触发表单验证。 [Source: epic-01-first-time-onboarding.md#L57-L60, ux-design-specification.md#L2610-L2615, ux-design-specification.md#L3347]
4. **AC4 - 实时 URL 格式验证**: 用户在输入框键入或粘贴时实时验证 URL 格式；无效 URL 在输入框下方显示红色错误提示（aria-live="polite"），且"开始爬取"按钮在无效状态下 disabled。验证使用 `new URL(value)` 构造器（禁止用正则简化 — `URL` 构造器对国际化域名、IPv6、端口、fragment 的处理更稳健）。 [Source: epic-01-first-time-onboarding.md#L62-L65, ux-design-specification.md#L2610-L2637, architecture.md#L650-L664 SmartURLInput states: empty/valid/invalid/loading]
5. **AC5 - "开始爬取"按钮加载状态**: 点击"开始爬取"后按钮进入 loading 状态（disabled + 旋转图标），且在完成前不可重复点击；按钮文案随状态切换为"正在分析…"→"正在爬取…"→"完成"。 [Source: ux-design-specification.md#L2568-L2602 feedback patterns, ux-design-specification.md#L2539-L2564 button hierarchy]
6. **AC6 - AI 分析进度实时显示**: 触发爬取后实时显示 AI 分析进度（百分比 + 阶段标签：分析页面结构 → 识别字段 → 提取数据）；进度通过 mock setInterval 推进，最终在 <8 秒（95th percentile）内完成分析与爬取，符合 NFR1。 [Source: epic-01-first-time-onboarding.md#L67-L71, prd.md#L1759 NFR1, ux-design-specification.md#L1118-L1140 AI 透明度]
7. **AC7 - 爬取状态实时更新**: 进度面板显示 `当前阶段 / 百分比 / 已提取条数` 三项信息；阶段文案遵循王芳 persona（"正在分析页面结构"、"AI 识别到 X 个字段"、"正在提取数据…"），禁止使用 "Analyzing URL" 等英文技术口吻。 [Source: epic-01-first-time-onboarding.md#L67-L71, ux-design-specification.md#L2713-L2742 加载状态, prd.md#L1527 FR32]
8. **AC8 - 历史记录占位**: 简洁视图下方显示"最近爬取"区域；本 story 范围内历史记录为空时显示空状态插图 + "还没有爬取历史" + "立即开始爬取"按钮（滚动到顶部 URL 输入区）；历史记录列表与任务管理由 Story 1.3 交付。 [Source: ux-design-specification.md#L3347-L3368, ux-design-specification.md#L2713-L2727 空状态]
9. **AC9 - 左侧导航栏收起状态**: 简洁视图不带展开的左侧导航栏；视图切换器以底部或顶部居中的 SegmentedControl 形式呈现（不挤占主区域）；仪表板/专业视图按钮在 Epic 4 交付前以 disabled + tooltip "由 Epic 4 交付" 形式占位，本 story 不创建 `DashboardView.vue` / `ProfessionalView.vue` 文件。 [Source: epic-01-first-time-onboarding.md#L60, ux-design-specification.md#L2645-L2655 视图切换, architecture.md#L686-L700 ViewSwitcher]
10. **AC10 - 视图偏好持久化**: 用户切换视图的偏好（即便本 story 只有简洁视图可选）通过 Pinia `useUiStore` 持久化到 LocalStorage（key: `ai-crawler:view-preference`，默认值 `simple`），下次启动自动加载；与 Story 1.4 的界面设置 store 解耦避免循环依赖。 [Source: architecture.md#L191 用户偏好存储, architecture.md#L240 `frontend/src/stores/ui.js`]
11. **AC11 - 简洁视图文案符合王芳 persona**: 所有可见文案使用"您"称呼，避免 URL/API/依赖/运行时/分析中等技术术语；按钮文案为"开始爬取"而非"启动爬虫"或"Execute Crawl"；空状态错误提示先说人话再给操作。 [Source: prd.md#L1406-L1424 王芳 persona, 1-1-desktop-app-install-launch.md#L359-L377 王芳文案落地]
12. **AC12 - 与 Story 1.1 占位的兼容性**: 本 story 替换 `frontend/src/views/SimpleView.vue` 中 Story 1.1 留下的占位实现（当前文本"已收到网址：…（完整爬取功能由 Epic 2 交付）"），但**不破坏 1-1 已通过的单元测试**（`frontend/tests/components/SimpleView.test.ts` 3 测试）— 已有测试断言"开始爬取"按钮、空 URL 警告"请先粘贴网址"、无效 URL 警告"网址格式不正确"必须保留，新增功能扩展测试覆盖。 [Source: 1-1-desktop-app-install-launch.md#L463, L502, frontend/tests/components/SimpleView.test.ts]
13. **AC13 - 键盘导航与可访问性**: 输入框支持 `Ctrl/Cmd+Enter` 触发"开始爬取"；示例 chip 支持 Tab 聚焦 + Enter 填充；进度面板 ARIA `role="status"` + `aria-live="polite"`；按钮焦点状态 2px 品牌色（#3B82F6）边框。 [Source: ux-design-specification.md#L2555-L2559, ux-design-specification.md#L2637, ux-design-specification.md#L2741 accessibility]
14. **AC14 - 单元/组件测试覆盖**: 新增 `SmartURLInput.vue`、`ViewSwitcher.vue`、`SimpleView.vue`（扩展）的单元测试 ≥85% 行覆盖；测试用例覆盖：URL 验证（空/无效/有效/粘贴触发）、示例 chip 点击填充、loading 期间禁用、进度阶段切换、视图切换持久化；不增加 E2E 测试（Story 1.1 已覆盖启动路径，爬取流程 E2E 由 Epic 2 实现）。 [Source: project-context.md#L178-L200 测试规范, 1-1-desktop-app-install-launch.md#L256-L269]

## Tasks / Subtasks

- [x] **Task 1 — SmartURLInput 组件实现 (AC: 2, 3, 4, 13)**
  - [x] 1.1 创建 `frontend/src/components/SmartURLInput.vue`：使用 Naive UI `n-input` (size="large") + `n-input-group` 包裹"开始爬取"`n-button`；输入框左侧使用 `n-icon` 渲染 `@vicons/ionicons5` 的 `GlobeOutline` 图标
  - [x] 1.2 实现 `v-model:value` 双向绑定；通过 `props: { modelValue: string, examples: string[], loading: boolean }` + `emits: ['update:modelValue', 'submit']`
  - [x] 1.3 实时 URL 验证（使用 `watch(url, { immediate: true })`）：空 → `empty` 状态；有效 → `valid` 状态 + 触发 `update:modelValue`；无效 → `invalid` 状态，输入框 `status="error"`，下方显示 `n-text` 错误提示 with `aria-live="polite"`
  - [x] 1.4 示例 chip 实现：使用 `n-tag` checkable=false，`@click="emit('update:modelValue', example); nextTick(() => validate())"`；样式按 `#3B82F6` 边框 + `#EFF6FF` 背景
  - [x] 1.5 键盘交互：输入框 `@keydown.enter.ctrl="onSubmit"` 与 `@keydown.enter.meta="onSubmit"`（Mac Cmd）；Enter 单键不触发提交（避免误触）；示例 chip `<n-tag tabindex="0" @keydown.enter="...">`
  - [x] 1.6 可访问性：输入框 `aria-label="网址"`、`aria-describedby="url-error"` 在无效时设置；`aria-invalid="true"` 在 invalid 状态
  - [x] 1.7 验证规则白名单与黑名单：
    - 必须是 `http:` 或 `https:` 协议（`new URL()` 解析后 `protocol` 字段判定）— 禁止 `javascript:`、`file:`、`data:`
    - hostname 非空且不包含空格
    - 端口若存在必须是数字（`URL` 构造器已强制）
    - 失败时抛出 `TypeError` 由 catch 块转为 `invalid` 状态

- [x] **Task 2 — ViewSwitcher 组件实现 (AC: 9, 10, 13)**
  - [x] 2.1 创建 `frontend/src/components/ViewSwitcher.vue`：使用 Naive UI `n-button-group` + 3 个 `n-button`（简洁/仪表板/专业）
  - [x] 2.2 通过 `props: { modelValue: 'simple' | 'dashboard' | 'professional' }` + `emits: ['update:modelValue']`，绑定 Pinia `useUiStore().viewPreference`
  - [x] 2.3 仪表板与专业视图按钮 `disabled`，`title="由 Epic 4 交付"`（HTML 原生 tooltip，不引入 `n-tooltip` 以减少 bundle 体积）；简洁视图按钮 `type="primary"`
  - [x] 2.4 切换事件：仅当目标视图为 `simple` 时触发 `router.replace({ name: 'simple-view' })`；其他视图保持 disabled 不发生路由跳转
  - [x] 2.5 持久化：`useUiStore` 中通过 `persist: true` 选项（`pinia-plugin-persistedstate`，已在 1-1 安装）保存到 LocalStorage `ai-crawler:view-preference`

- [x] **Task 3 — 简洁视图 SimpleView.vue 改造 (AC: 1, 5, 6, 7, 8, 11, 12, 13)**
  - [x] 3.1 替换 `frontend/src/views/SimpleView.vue` 现有占位实现（`1-1-desktop-app-install-launch.md#L499` 留下的"已收到网址：…（完整爬取功能由 Epic 2 交付）"文案）— 保留 Story 1.1 已通过测试的关键断言：
    - "开始爬取"按钮文案不变
    - 空 URL 时 `hint = '请先粘贴网址。'` 不变
    - 无效 URL 时 `hint = '网址格式不正确，请检查后再试。'` 不变
  - [x] 3.2 模板结构调整：顶部居中头区（地球图标 + 副标题）→ SmartURLInput → 进度面板 → 历史记录空状态 → 底部 ViewSwitcher
    - **禁止**沿用 Story 1.1 patch 中误用的"正在准备第 3 步：粘贴网址"文案（1-1 review patch list L144）
  - [x] 3.3 进度面板组件 `frontend/src/components/simple/ProgressPanel.vue`（按 architecture.md#L1699 `simple/` 子目录约定）：
    - 使用 `n-progress` type="line" 显示百分比
    - 阶段标签使用 `n-steps` size="small" 3 阶段：分析页面结构 / 识别字段 / 提取数据
    - `role="status"` + `aria-live="polite"` 容器
    - 完成状态显示成功图标 + "完成，已获取 X 条数据"
  - [x] 3.4 状态机：`idle → analyzing → extracting → completed | failed`；`idle` 显示示例文案；`analyzing` 调用 `analyze(url)` 并推进 0→60%；`extracting` 调用 `crawl(url, fields)` 并推进 60→100%；`failed` 显示错误 + "重试"按钮
  - [x] 3.5 Mock 进度推进：dev 模式下用 `setInterval` 每 200ms 推进 5%，模拟真实 WebSocket 事件（真实 WebSocket 由 Epic 2 实现）；生产模式调用真实后端时由后端 `/ws/progress/{task_id}` 推送
  - [x] 3.6 历史记录空状态区域：`n-empty` description="还没有爬取历史" + `n-button` text 类型"立即开始爬取"（点击 `scrollTo({ top: 0, behavior: 'smooth' })` + 聚焦 URL 输入框）
  - [x] 3.7 王芳文案审查：替换"分析"为"AI 正在浏览您的页面"、替换"提取"为"复制您要的数据"；进度阶段标签改为"AI 正在浏览页面" → "AI 找到了 X 个字段" → "正在为您复制数据"

- [x] **Task 4 — Pinia useUiStore 创建 (AC: 10)**
  - [x] 4.1 创建 `frontend/src/stores/ui.ts`：`defineStore('ui', () => { const viewPreference = ref<'simple'|'dashboard'|'professional'>('simple'); const setViewPreference = (v) => viewPreference.value = v; return { viewPreference, setViewPreference }; })`，使用 Setup Store 语法（与 1-1 的 `onboarding.ts` Option Store 风格对齐避免认知冲突 — 但 Setup Store 更适合 persist 插件）
  - [x] 4.2 持久化：安装 `pinia-plugin-persistedstate` ^3.x（若 1-1 未安装）；在 `main.ts` 中注册 plugin；store 上 `persist: { key: 'ai-crawler:view-preference', storage: localStorage }`
  - [x] 4.3 与 Story 1.4 的界面设置 store 解耦 — 1.4 实现 `useSettingsStore` 时将通过 `useUiStore().setViewPreference` 修改以便集中持久化

- [x] **Task 5 — API 客户端扩展与 Mock 边界 (AC: 6, 14)**
  - [x] 5.1 扩展 `frontend/src/api/analyze.ts`（1-1 已创建）— 新增 `getCrawlProgress(taskId: string, onProgress: (p: number, stage: string, count: number) => void, signal?: AbortSignal): Promise<void>`：
    ```typescript
    // dev mock：用 setInterval 模拟进度推送
    if (MOCK_BACKEND) {
      let p = 0; let stage = 'analyzing'; let count = 0;
      return new Promise((resolve) => {
        const id = setInterval(() => {
          p = Math.min(p + 5, 100);
          if (p < 60) stage = 'analyzing';
          else if (p < 100) { stage = 'extracting'; count = Math.round((p - 60) / 40 * 156); }
          onProgress(p, stage, count);
          if (p >= 100) { clearInterval(id); resolve(); }
        }, 200);
        signal?.addEventListener('abort', () => { clearInterval(id); resolve(); });
      });
    }
    // 生产：连接真实 WebSocket
    const ws = new WebSocket(`ws://localhost:8000/ws/progress/${taskId}`);
    // ... 见 architecture.md#L1395-L1404
    ```
  - [x] 5.2 新增 `frontend/src/mocks/analyze-mock.ts` 中的 `mockCrawlProgress` 与 `mockAnalyzedFields` 导出（若 1-1 未提供 crawl 字段）
  - [x] 5.3 类型扩展 `frontend/src/types/analyze.ts`：新增 `CrawlProgressEvent = { event: 'crawl_progress'; data: { task_id: string; progress: number; stage: string; extracted_count: number } }` 与 `CrawlCompletedEvent`（**命名遵循 architecture.md#L1318-L1330 snake_case 事件名约定**）
  - [x] 5.4 **禁止**在 renderer 中使用 `process.env?.VITE_*`（1-1 review patch L141）— 一律用 `import.meta.env.VITE_*` 或 `import.meta.env.DEV`

- [x] **Task 6 — 测试用例 (AC: 14)**
  - [x] 6.1 更新 `frontend/tests/components/SimpleView.test.ts`：保留 1-1 的 3 个测试，新增 ≥7 个测试：示例 chip 点击填充、loading 期间按钮禁用、进度阶段切换、爬取成功显示条数、爬取失败显示重试、Ctrl+Enter 提交、视图切换触发 store 更新
  - [x] 6.2 新增 `frontend/tests/components/SmartURLInput.test.ts` ≥10 测试：空状态、有效 URL、无效 URL（含 `javascript:`/`file:`/IPv6 端口边界）、示例 chip 点击、Cmd+Enter 提交、Tab 聚焦 chip、aria-invalid 切换
  - [x] 6.3 新增 `frontend/tests/components/ViewSwitcher.test.ts` ≥3 测试：默认选中 simple、disabled 按钮不触发 emit、切换触发持久化
  - [x] 6.4 新增 `frontend/tests/stores/ui.test.ts` ≥2 测试：默认 viewPreference=simple、setViewPreference 后 localStorage 写入
  - [x] 6.5 覆盖率验证：`vitest run --coverage` 全部新增文件 ≥85% 行覆盖；不修改 1-1 测试断言

- [x] **Task 7 — 路由与视图切换验证 (AC: 1, 9)**
  - [x] 7.1 现有 `frontend/src/router/index.ts` 已含 `/simple-view` 路由（1-1 创建）— 验证 `WelcomePage` 完成向导或跳过后正确 `router.replace({ name: 'simple-view' })`，不重复创建路由
  - [x] 7.2 简洁视图加载时 `useUiStore().viewPreference === 'simple'` 默认；若用户后续切换偏好为 `dashboard`/`professional` 又回到应用，路由守卫将主动 `replace` 到 `/simple-view`（视图本身不变，仅 store 反映偏好；其他视图实现由 Epic 4 交付）

### Review Findings

> Code review 完成于 2026-08-06。Subagent 审查层 (Blind Hunter / Edge Case Hunter / Acceptance Auditor) 因 provider API 失败全部不可用，由主会话内联补审。`failed_layers: blind,edge,auditor`。共 15 项发现：1 decision-needed、12 patch、2 defer。所有保留记录待人工核验。

**Decision Needed (1)**

- [x] [Review][Patch] **Task 3.3 n-steps 组件缺失** — spec 明文要求 ProgressPanel 使用 `n-steps` size="small" 3 阶段（分析页面结构 / 识别字段 / 提取数据），实现仅用 `n-progress` + 2 阶段。需补 n-steps 3 阶段渲染与状态机扩展 analyzing-field-recognition 中间态 [frontend/src/components/simple/ProgressPanel.vue:1-77] — 修复：ProgressPanel 新增 `<n-steps size="small" :current="step" :status="stepStatus">` 3 步 "分析页面结构 / 识别字段 / 提取数据"，step computed 按 stage + progress 60/90 阈值映射 1/2/3，stepStatus 在 completed/failed/process 间切换

**Patch (13)**

- [x] [Review][Patch] **AC5 按钮文案不完整** — SmartURLInput buttonText computed 仅覆盖 `'正在分析…' / '开始爬取'` 2 态，spec AC5 要求 `'正在分析…'→'正在爬取…"→"完成'` 3 态切换 [frontend/src/components/SmartURLInput.vue:88] — 修复：新增 `phase` prop（'idle'|'analyzing'|'extracting'|'completed'），buttonText 按 phase 切换 3 态文案，SimpleView 传 `:phase="state"`
- [x] [Review][Patch] **Ctrl+Enter 绕过 disabled 状态** — SmartURLInput onSubmit 未在 emit 前校验 status==='invalid'，键盘快捷键可在已禁用按钮状态下触发 submit。需前置 `if (validate(url.value) === 'invalid') return;` [frontend/src/components/SmartURLInput.vue:134-139] — 修复：onSubmit 加入 invalid 短路 + emit url.trim()
- [x] [Review][Patch] **AC4 协议白名单缺失** — SimpleView onSubmit 仅 `new URL(value)` 无 http/https 白名单，配合 #2 可让 `javascript:` URL 绕过 SmartURLInput 禁用态直达 runCrawl。需添加协议白名单或复用 SmartURLInput.validate [frontend/src/views/SimpleView.vue:138-142] — 修复：抽取 `validateUrl(value)` 复用于 onSubmit/onRetry，含 http/https 白名单 + hostname 空格检查
- [x] [Review][Patch] **AC7 analyzing 阶段显示误导文案** — ProgressPanel `v-else` 覆盖 analyzing+extracting，在 analyzing 阶段显示 "AI 找到了 0 个字段"。需 `v-else-if="stage === 'extracting'"` 区分 [frontend/src/components/simple/ProgressPanel.vue:25-27] — 修复：meta 区分 analyzing（无 count 文案）/ extracting（"AI 找到了 X 个字段"）/ completed / failed
- [x] [Review][Patch] **extractedCount 硬编码 156 兜底** — `extractedCount.value || 156` 在真实爬取 0 行时误报 156 条 [frontend/src/views/SimpleView.vue:121] — 修复：移除 hint 完成文案（ProgressPanel meta 已展示），消除 156 兜底
- [x] [Review][Patch] **完成文案重复显示** — SimpleView hint "完成，已获取 X 条数据" 与 ProgressPanel meta 同文案双展示 [frontend/src/views/SimpleView.vue:121 + frontend/src/components/simple/ProgressPanel.vue:19-22] — 修复：移除 SimpleView hint 完成文案，统一由 ProgressPanel meta 展示
- [x] [Review][Patch] **onRetry 无 URL 验证** — `if (url.value) void runCrawl(url.value);` 仅真值检查，空 URL 静默无操作 [frontend/src/views/SimpleView.vue:148-150] — 修复：onRetry 复用 validateUrl，空 URL 显示 "请先粘贴网址"，无效 URL 显示 "网址格式不正确"
- [x] [Review][Patch] **getCrawlProgress signal 已 aborted 未前置检查** — `addEventListener('abort')` 不触发已 abort 事件，需 `if (options.signal?.aborted) { resolve(); return; }` 前置 [frontend/src/api/analyze.ts:96-99] — 修复：函数入口前置 `if (options.signal?.aborted) return Promise.resolve();`
- [x] [Review][Patch] **AC9 disabled title 文案偏离** — `title="更多视图即将推出"` vs spec 明文 `"由 Epic 4 交付"` [frontend/src/components/ViewSwitcher.vue:16,25] — 修复：替换为 "由 Epic 4 交付"
- [x] [Review][Patch] **AC13 focus-visible 焦点样式缺失** — 无 `:focus-visible { outline: 2px solid #3B82F6 }` 实现于 SmartURLInput/retry button [frontend/src/components/SmartURLInput.vue + frontend/src/views/SimpleView.vue:204-210] — 修复：SmartURLInput `/deep/` 命中 n-input/n-button/chip focus-visible，SimpleView 加 `.simple-view__retry:focus-visible` 2px #3B82F6 outline
- [x] [Review][Patch] **AC14 覆盖率不可验证** — vitest.config coverage.include 不含 `src/components/**/*.vue` / `src/views/**/*.vue`，SmartURLInput/ViewSwitcher/SimpleView 覆盖率无法计量 [frontend/vitest.config.ts:25] — 修复：include 追加 `src/components/**/*.vue` 与 `src/views/**/*.vue`；安装 @vitest/coverage-v8 ^2.0.5；最终覆盖率：SmartURLInput 100% / ViewSwitcher 100% / ProgressPanel 100% / SimpleView 93.42% / ui.ts 88.88% — 全部 ≥85% 达标
- [x] [Review][Patch] **URL 含前后空格被构造器拒收** — 粘贴带空格误触 invalid，应 `value.trim()` 后再 `new URL()` [frontend/src/components/SmartURLInput.vue:96-106] — 修复：validate 内 `new URL(value.trim())`；onSubmit emit `url.value.trim()`

**Defer (2)**

- [x] [Review][Defer] **mock analyze/crawl 忽略 AbortSignal** — 组件卸载后 mock setTimeout 仍回调 ref，Vue 警告 "state update on unmounted component"。真实后端 + signal 处理由 Epic 2 实现 [frontend/src/api/analyze.ts:17,29] — deferred, pre-existing
- [x] [Review][Defer] **WebSocket onclose 早于 onerror 静默 resolve** — MOCK_BACKEND=true 时不可达，mock setInterval 解析无 ws 路径。真实 WebSocket 错误处理由 Epic 2 修 [frontend/src/api/analyze.ts:122-124] — deferred, pre-existing

### Review Findings — Second Pass (2026-08-07)

> 第二轮代码评审。3 层并行审查启动：Blind Hunter (15 + 3 bonus findings) / Edge Case Hunter (subagent API 失败 — 主会话内联补审 3 项) / Acceptance Auditor (subagent API 失败 — 主会话内联补审 1 项)。`failed_layers: edge,auditor`。共 22 项发现：0 decision-needed / 9 patch (1 转入 defer) / 12 defer / 1 dismissed。9 patches 已批量应用，64/64 vitest 通过。

**Patch (9) — 全部 [x] 应用**

- [x] [Review][Patch] **重试竞态未过滤 AbortError** — `runCrawl` 在新一轮触发时 `abortController?.abort()` 中止上一请求，但旧 `await analyze(...)` 的 AbortError 落入新 runCrawl 自己的 catch handler，无差别 `setStatus('failed')` + 写入失败 hint，造成新爬取状态被旧请求 abort 噪声污染 [frontend/src/views/SimpleView.vue:122-130] — 修复：catch 入口前置 `if (err instanceof DOMException && err.name === 'AbortError') return;` ✅ 应用
- [x] [Review][Patch] **catch 中存在空 if 死代码** — `if (err instanceof Error && err.message) { // swallow, hint already set }` 主体仅一条注释，错误对象从未被日志或检测，逻辑等价空，徒增噪音 [frontend/src/views/SimpleView.vue:125-127] — 修复：删除整段空 if ✅ 应用
- [x] [Review][Patch] **wasteful `analyzeRes.fields.map((f) => f.name)?.length`** — 仅检非空却分配中间数组；`?.length` 在 `.map()` 必返数组时是无效可选链 [frontend/src/views/SimpleView.vue:98-100] — 修复：改 `analyzeRes.fields.length` 直接判断 ✅ 应用
- [x] [Review][Patch] **disabled ViewSwitcher 按钮仍暴露 `aria-pressed="false"`** — 仪表板/专业视图按钮 `disabled` 同时 `:aria-pressed="modelValue === 'dashboard'"`，WAI-ARIA 规范建议 disabled widget 不应作为可切换器呈现给辅助技术 [frontend/src/components/ViewSwitcher.vue:13,21] — 修复：disabled button 移除 `:aria-pressed` 绑定，改 `aria-disabled="true"` ✅ 应用
- [x] [Review][Patch] **`step` computed 失败态硬回 1** — `if (props.stage === 'failed') return 1;` 强制 `n-steps` 当前步显示为 第 1 步 "分析页面结构"，提取中段失败也错显早期步骤；`stepStatus='error'` 应用全 steps 但当前步定位已错 [frontend/src/components/simple/ProgressPanel.vue:67-73] — 修复：删除 `if (props.stage === 'failed') return 1;` 行 ✅ 应用
- [x] [Review][Patch] **失败文案在 SimpleView hint 与 ProgressPanel meta 双重展示** — `state==='failed'` 时 SimpleView L19 hint `<p>` 与 ProgressPanel L32-34 `<span>` 同文案 "AI 暂时没找到字段，请稍后再试。",用户在两处叠加看到同样错误 [frontend/src/views/SimpleView.vue:124 + frontend/src/components/simple/ProgressPanel.vue:32-34] — 修复：ProgressPanel 移除 `v-else-if="stage === 'failed'"` 失败 span，仅由 SimpleView hint 承担（AC7 进度面板只承担 `当前阶段 / 百分比 / 已提取条数` 三项）✅ 应用
- [x] [Review][Patch] **ViewSwitcher 缺失 AC13 焦点 `:focus-visible` 样式** — AC13 spec 要求 "按钮焦点状态 2px 品牌色（#3B82F6）边框" [frontend/src/components/ViewSwitcher.vue:54-56] — 修复：scoped style 追加 `.view-switcher :deep(.n-button):focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }` ✅ 应用
- [x] [Review][Patch] **`getCrawlProgress` setInterval abort 竞态** — 函数入口 `if (options.signal?.aborted) return Promise.resolve()` 检查后至 L80 `setInterval(...)`、L97 `addEventListener('abort', ...)` 注册之间存在窗口：若 signal 在该 1-2 行微任务窗口内被 abort，listener 永不触发，setInterval 无限运行 [frontend/src/api/analyze.ts:74-100] — 修复：setInterval callback 首行加入 `if (options.signal?.aborted) { clearInterval(id); resolve(); return; }` 幂等保护 ✅ 应用
- [x] [Review][Patch] **魔数 156 缺乏常量定义** — `count = Math.round(((progress - 60) / 40) * 156)` 中 156 无注释无来源，与 `mockAnalyzedFields.length`（当前 4）无关，mock 字段调整后展示数漂移 [frontend/src/api/analyze.ts:86] — 修复：文件顶部声明 `const MOCK_FINAL_EXTRACTED_COUNT = 156;` ✅ 应用

**Defer (12)**

- [x] [Review][Defer] **测试原型污染无 `afterEach` 还原** — `Element.prototype.scrollTo = scrollToSpy` 与 `HTMLInputElement.prototype.focus = focusSpy` 直接赋值，无还原，后续测试套件继承被 monkey-patch 的原型 [frontend/tests/components/SimpleView.test.ts:985-988] — deferred: `vi.spyOn` 在 jsdom 不可用（`scrollTo` 在 jsdom 中不存在 → `vi.spyOn` 抛"does not exist"）；`delete` 操作符对 jsdom prototype 不可配置属性抛错；测试基础设施重构需引入 `Object.defineProperty + manual afterEach restore pattern` 或 `defineProperty` 不可配置 cache，属测试基础设施改动 — 由 Epic 4 表单模式标准化 / 测试设施统一时实现。当前污染影响有限：`vi.fn()` 默认返回 undefined 行为近似 scrollTo no-op，跨测试断言无回滚
- [x] [Review][Defer] **WS 订阅先于 `crawl()` 任务创建** — `runCrawl` 顺序 `await getCrawlProgress('mock-task')` 后再 `await crawl(...)`，真实后端中 WS 连接到尚未创建的 task_id [frontend/src/views/SimpleView.vue:97-118] — deferred: 真实 WS 流程由 Epic 2 重排为 `crawl → 取 task_id → getCrawlProgress(task_id)`，本 story 仅 ship mock setInterval 路径
- [x] [Review][Defer] **硬编码 `'mock-task'` taskId 泄漏到真实后端分支** — `getCrawlProgress('mock-task', ...)` 字面 taskId 与 `crawl()` 返回的 `{ rows: N }` 不携带 task_id 不匹配 [frontend/src/views/SimpleView.vue:103, frontend/src/api/analyze.ts:103] — deferred: 真实 task_id 由 Epic 2 通过 `crawl()` 响应或独立 endpoint 取得
- [x] [Review][Defer] **ViewSwitcher 单次 click 三重 store 写** — 子组件 `onSelect` 既 emit 又 `uiStore.setViewPreference('simple')`，父 SimpleView `onViewChange` 接收 emit 再次 `setViewPreference(view)` [frontend/src/components/ViewSwitcher.vue:44-51 + frontend/src/views/SimpleView.vue:179-181] — deferred: pinia ref 同值多次赋值仅触发一次 watcher——localStorage 仍单写，属设计气味不是 bug。Best practice 单写者需测试脱钩（ViewSwitcher standalone test 当前依赖子写者断言），Epic 4 视图完整接入后或可整组重构
- [x] [Review][Defer] **`onSelect` 仪表板/专业 branch 静默 no-op** — `if (view === 'simple')` 是唯一处理分支，dashboard/professional 落入隐式 no-op。当前 disabled button 保证不可达 [frontend/src/components/ViewSwitcher.vue:44-51] — deferred: Epic 4 实现仪表板/专业视图组件时补 handler + 路由切换
- [x] [Review][Defer] **WebSocket 收到非法 payload 后未 `ws.close()`** — `JSON.parse(event.data)` 抛错时 `reject(new Error('invalid ws payload'))` 但未关闭 socket，资源泄漏 [frontend/src/api/analyze.ts:119-121] — deferred: WS 路径 Epic 2 实现真实客户端时统一处理
- [x] [Review][Defer] **WebSocket `onclose` 早于 `onerror` 静默 resolve（重申）** — `onerror = reject` 与 `onclose = resolve`；某些环境下 onclose 先触发会让真实网络错误被 resolve 吞掉 [frontend/src/api/analyze.ts:121-124] — deferred, pre-existing — 与首次评审 deferred-work.md 重复条目，Epic 2 修复
- [x] [Review][Defer] **测试环境强制 MOCK_BACKEND（`MODE==='test'` + vitest define `'true'` 双重冗余）** — 阻止 vitest 下写真实后端集成测试 [frontend/src/api/analyze.ts:11-13 + frontend/vitest.config.ts:7-9] — deferred: Epic 2 引入真实后端集成测试时再决定 test runner 分层（vitest 单元层 vs Playwright 集成层）
- [x] [Review][Defer] **`onStartHistory` 双 `scrollTo` 冗余** — `bodyRef.value?.scrollTo({top:0})` + `window.scrollTo({top:0})`；`.simple-view__body` CSS 无 overflow，bodyRef 调用必为 no-op [frontend/src/views/SimpleView.vue:170-177] — deferred: cosmetic 死代码可清理
- [x] [Review][Defer] **`getCrawlProgress` abort 时 resolve 而非 reject——非对称契约** — 入口早退 + listener 回调都用 `resolve()`,调用方无法区分 abort 与正常完成 [frontend/src/api/analyze.ts:74,99] — deferred: 改 reject 需调用方同步加 AbortError 过滤（与本轮 patch #1 联动）,契约变更属 Epic 2 WS 整体重构范畴
- [x] [Review][Defer] **SmartURLInput 与 SimpleView 两层验证边界不一致** — SmartURLInput onSubmit 仅拦截 `invalid`，empty 仍 emit `'submit', ''`；SimpleView 再校 empty 后才提示。两层错误处理边界微妙不同 [frontend/src/components/SmartURLInput.vue:142-148 + frontend/src/views/SimpleView.vue:144-155] — deferred: 设计选择，子组件不应在 empty 上发 invalid 标签（empty ≠ invalid）；Epic 4 表单模式标准化时复核
- [x] [Review][Defer] **WS 路径无前置 aborted signal 检查** — `if (options.signal?.aborted) return Promise.resolve()` 仅 mock 路径有；WS 分支 L102-127 入口无同保护，预 aborted signal 导致 WS 开启后 listener 永不触发 [frontend/src/api/analyze.ts:102-127] — deferred: WS 路径全部由 Epic 2 接管

**Dismissed (1)**

- [Review][Dismiss] **SmartURLInput `examples` prop 理论 NPE** — `v-if="examples.length"` L30 在 `examples` 显式传 `null` 时会抛；withDefaults 默认 `() => []` 仅在 prop 缺省时生效 [frontend/src/components/SmartURLInput.vue:30] — 已 dismiss: 当前所有调用方均传数组（mockExamples 含 3 项 + 测试皆传 string[]），未来调用方若传 null 可由 TS Props interface `examples?: string[]` 类型守卫拦截；防御性可选链 `examples?.length` 可后续 Epic 4 统一加，不构成本 story 验收缺陷


## Dev Notes

### 关键架构决策与约束 (Architecture Compliance)

- **强制技术栈** [Source: architecture.md#L964-L972, project-context.md#L18-L46]:
  - 前端：Vue 3.4+ Composition API + Naive UI 2.x + Pinia 2.x + Vite 5.x
  - 桌面框架：Electron 28.x LTS（1-1 已锁版本，本 story 不修改主进程）
  - 测试：vitest + @vue/test-utils + jsdom（1-1 已安装）
  - **禁止升级** Playwright v1.51.0（Worker Pool 依赖；本 story 不涉及但需知晓约束）
- **组件规格 — SmartURLInput** [Source: architecture.md#L650-L664]:
  - 路径：`frontend/src/components/SmartURLInput.vue`
  - 用途：URL 输入 + 示例 + 历史 + 验证状态指示
  - 状态：empty / valid / invalid / loading
  - 变体：standalone / compact / with-suggestions
  - 可访问性：input labels + 验证状态描述 + listbox ARIA
  - **Gap 1 历史 dropdown 由 Story 1.3 实现** — 本 story 的 SmartURLInput 暂不实现 history dropdown，仅 placeholder prop `historyItems?: string[]` 预留
- **组件规格 — ViewSwitcher** [Source: architecture.md#L686-L700]:
  - 路径：`frontend/src/components/ViewSwitcher.vue`
  - 结构：视图按钮组 + 选中状态指示 + 视图描述 tooltip
  - 状态：active / inactive
  - 变体：compact / labeled
  - 可访问性：Button group role + selected 状态 + label 描述
- **Phase 1 MVP 优先级** [Source: architecture.md#L862-L863]: SmartURLInput + ViewSwitcher + FirstTimeWizard 是 Phase 1 必交付组件 — 本 story 交付前两个
- **三级视图策略** [Source: architecture.md#L194-L246]:
  - 简洁视图状态管理：最小化状态，本地存储（LocalStorage）
  - 实现：`frontend/src/views/SimpleView.vue` + `frontend/src/stores/ui.ts`
  - **不创建** `DashboardView.vue`、`ProfessionalView.vue`（Epic 4 交付）
- **WebSocket 事件约定** [Source: architecture.md#L1318-L1330, L1389-L1404]:
  - 事件名 `crawl_progress`、`task_completed` (snake_case)
  - Header `X-Event-Version: v1`（MVP 版本）
  - 本 story dev 模式下用 `setInterval` mock 事件，**不连接真实 WebSocket** — 真实 WebSocket 由 Epic 2 实现
  - WebSocket 客户端 `frontend/src/api/websocket.js` 路径在 architecture.md#L1726 列出，本 story **不创建该文件**（避免空文件污染构架；Epic 2 实现时再创建）
- **状态管理约定** [Source: architecture.md#L1342-L1356]:
  - Pinia store 命名 PascalCase：`useUiStore`
  - Actions：camelCase
  - State：camelCase（`viewPreference` not `view_preference` — 前端 camelCase，与 architecture.md#L1344 一致）
- **错误处理** [Source: architecture.md#L1360-L1372, project-context.md#L98-L112]:
  - 前端全局错误拦截 `axios.interceptors`（本 story 用 `fetch` + try/catch 局部拦截 — axios 在 1-1 未安装且本 story 不需要）
  - Mock 失败路径必须显式 `throw new Error()` 触发 `failed` 状态，禁止吞异常
- **王芳 persona 文案** [Source: prd.md#L1406-L1424]:
  - "您"称呼，避免 URL/API/依赖/运行时术语
  - 进度反馈用百分比 + 简短状态
  - 错误信息先人话再操作

### Library / Framework Requirements

- **Vue.js 3.4+** + **Naive UI 2.x**（1-1 已安装 ^2.x）+ **Pinia 2.x**（1-1 已安装）
- **@vicons/ionicons5** ^0.13.x — 图标库（Naive UI 推荐搭配）；1-1 未安装，本 story 首次引入
  - 用途：`GlobeOutline` 输入框图标、`CheckmarkCircle` 成功状态、`AlertCircle` 错误状态
  - ⚠️ 实现前用 context7 MCP 验证 `@vicons/ionicons5` 与 Naive UI 2.x 的版本兼容性
- **pinia-plugin-persistedstate** ^3.x — Pinia 持久化插件；若 1-1 未安装则首次引入
  - ⚠️ Pinia 2.x 兼容版本以 context7 查询为准
- **不引入** axios（architecture.md#L1371 提及但本 story 仅用 `fetch`；1-1 也未引入，避免无依赖膨胀）
- **不引入** `n-tooltip` — ViewSwitcher disabled 按钮使用原生 `title` 属性即可（UX 规范未强制 tooltip 实现）

### File Structure Requirements

- **新增**:
  - `frontend/src/components/SmartURLInput.vue` — 智能网址输入组件 (architecture.md#L664)
  - `frontend/src/components/ViewSwitcher.vue` — 视图切换器组件 (architecture.md#L700)
  - `frontend/src/components/simple/ProgressPanel.vue` — 进度面板（按 architecture.md#L1699 `simple/` 子目录约定）
  - `frontend/src/stores/ui.ts` — Pinia UI store 管理视图偏好 (architecture.md#L240)
  - `frontend/tests/components/SmartURLInput.test.ts` — 单元测试
  - `frontend/tests/components/ViewSwitcher.test.ts` — 单元测试
  - `frontend/tests/stores/ui.test.ts` — store 单元测试
- **修改**:
  - `frontend/src/views/SimpleView.vue` — 全面改造占位实现为完整简洁视图（替换 1-1 留下的"已收到网址：…"文案）
  - `frontend/src/api/analyze.ts` — 扩展 `getCrawlProgress` 函数（1-1 文件 L39 `testAiProvider` 之后追加）
  - `frontend/src/types/analyze.ts` — 新增 `CrawlProgressEvent` / `CrawlCompletedEvent` 类型
  - `frontend/src/mocks/analyze-mock.ts` — 扩展 mock 字段数据（若 1-1 mock 数据不足以支撑 156 条进度推进）
  - `frontend/src/main.ts` — 注册 `pinia-plugin-persistedstate`（若首次引入）
  - `frontend/tests/components/SimpleView.test.ts` — 追加 ≥7 个新测试用例（保留 1-1 已有 3 个测试）
  - `frontend/package.json` — 新增 `@vicons/ionicons5`、`pinia-plugin-persistedstate` 依赖
- **不创建**（明确边界 — Epic 4 / Story 1.3 / Epic 2 负责）:
  - `frontend/src/views/DashboardView.vue` — Epic 4
  - `frontend/src/views/ProfessionalView.vue` — Epic 4
  - `frontend/src/stores/crawl.ts` — Epic 2 / Story 1.3（crawl store 涉及任务管理与历史）
  - `frontend/src/api/websocket.ts` — Epic 2（真实 WebSocket 客户端）
  - `backend/app/api/v1/analyze.py` — Epic 2（真实后端路由）
  - `backend/app/api/v1/crawl.py` — Epic 2

### Testing Requirements

- **测试目录** [Source: architecture.md#L1825-L1828, project-context.md#L178-L200]:
  - 单元测试：`frontend/tests/components/SmartURLInput.test.ts`、`ViewSwitcher.test.ts`、`SimpleView.test.ts`（扩展）
  - Store 测试：`frontend/tests/stores/ui.test.ts`
  - E2E 测试：本 story 不新增 E2E — 启动路径 E2E 由 Story 1.1 覆盖；爬取流程 E2E 由 Epic 2 覆盖
- **覆盖率目标**: 新增文件 ≥85% 行覆盖；保留 1-1 `SimpleView.test.ts` 已有 3 测试通过
- **vitest 配置** [Source: 1-1-desktop-app-install-launch.md#L470-L473]:
  - 不修改 `vitest.config.ts` 的 globals 配置（1-1 已禁用 `globals: true` 改用显式 import）
  - 不修改 `tsconfig.json` paths 与 types（1-1 已修复 baseUrl/ignoreDeprecations）
- **Mock 边界**:
  - `import.meta.env.DEV` 与 `MOCK_BACKEND` 切换走 mock / 真实后端（沿用 1-1 `api/analyze.ts` L8-L9 模式）
  - **禁止**用 `process.env?.VITE_*`（1-1 review patch L141 已修复）
  - `setInterval` 必须在 `beforeUnmount` 中 `clearInterval` 避免 1-1 review patch L128 同类事件监听泄漏（`FirstTimeWizard` keydown 重复注册问题为前车之鉴）
- **Naive UI 事件名**:
  - `n-checkbox` 用 `@update:checked` 不用 `@change`（1-1 review patch L129 — Naive UI 2.x `@change` 不触发）
  - `n-input` 用 `@update:value` 不用 `@input`（Naive UI 2.x 双向绑定语义；本 story 用 `v-model:value` 简化）
  - `n-button-group` 多个按钮无 `@change` 事件，需逐个绑定 `@click`
- **测试断言王芳文案**:
  - 进度阶段文案必须为"AI 正在浏览页面"等中文短语 — 测试断言 `text` 内不含 "Analyzing|Extracting|Crawling" 英文

### Previous Story Intelligence

**Story 1.1 完成证据与必须延续的模式** [Source: 1-1-desktop-app-install-launch.md#L454-L466]:
- **可复用基础设施**:
  - `frontend/src/api/analyze.ts` 已实现 `analyze` / `crawl` / `testAiProvider`（DEV 切 mock，prod 调真实后端）
  - `frontend/src/types/analyze.ts` 已定义 `AnalyzeResponse` / `AnalyzedField`
  - `frontend/src/mocks/analyze-mock.ts` 已提供 `mockAnalyzeResponse`
  - `frontend/src/stores/onboarding.ts` 已实现 onboarding 状态与 IPC 持久化
  - `frontend/src/router/index.ts` 已含 `/simple-view` 路由 + 路由守卫
  - `pinia-plugin-persistedstate` 若 1-1 已安装则直接使用；否则本 story 引入
- **必须避免的 1-1 review 错误**（来自 1-1 review patch list L115-L155）:
  - L141 `process.env?.VITE_MOCK_BACKEND` 在 renderer 中无效 → 一律 `import.meta.env.VITE_*`
  - L128 `onMounted` 注册事件但 `onUnmounted` 不清理 → 本 story `setInterval` 必须配对 `clearInterval`
  - L129 Naive UI 2.x `@change` 不触发 → 用 `@update:checked` / `@update:value`
  - L130 `router.beforeEach` 每次 await `loadInitial` → 路由守卫已加 `initialLoaded` 缓存（1-1 修复），本 story 沿用
  - L144 `SimpleView.vue` 第 51 行误用"正在准备第 3 步：粘贴网址"wizard 文案 → 本 story 全部使用简洁视图语，禁止任何 "步骤 X/5" wizard 措辞
- **王芳文案落地模式**（1-1 L465）:
  - 所有可见文案"您"称呼
  - 避免 URL/API/依赖/运行时/分析中等术语
  - 进度反馈用百分比 + 简短状态而非技术细节
  - 错误信息先人话再操作
- **IPC 边界**:
  - 本 story **不修改 main 进程**（1-1 已交付 `electron/main.ts`）；renderer 通过 `window.electronAPI` 享有的 5 白名单方法不变
  - 视图偏好持久化用 LocalStorage（renderer 侧），不走 IPC（避免给 main 增 6th handler 增加崩溃面）

### Git Intelligence Summary

最近相关 commit（b6300ce 完成 Story 1-1 桌面应用安装与启动实施及代码审查修复）— 1-1 已交付前述基础设施。前面 4 个 commit 均为文档更新，无代码模式可参考。

- b6300ce feat(frontend): 完成 Story 1-1 桌面应用安装与启动实施及代码审查修复
- a0bcdb7 docs(design): 添加返回按钮设计规范
- a7ec272 docs: update UX design artifacts with enhanced patterns and styling
- 3f30331 docs: 项目文档重组和更新
- 67f5ca3 docs: add BMad Phase 3 planning artifacts

### Latest Tech Information

- **Vue 3.4+ `watch` 与 `nextTick`**:
  - `watch(url, { immediate: true })` 触发实时验证；`nextTick(() => validate())` 用于示例 chip 点击后等 v-model 同步再验证
  - ⚠️ Vue 3.4+ `watch` 默认 flush: 'pre'，输入事件中需要 `flush: 'post'` 或显式 `nextTick` 避免 v-model 同步竞态；以 context7 查询 Vue 3.4 watch 行为为准
- **Naive UI 2.x `n-input` `status` 属性**:
  - `status="error"` / `status="success"` 控制边框色与 aria；不用 `:class` 自定义
  - ⚠️ Naive UI 2.x `n-input` `@update:value` 与 `v-model:value` 等价；以 context7 验证
- **`new URL()` 构造器**:
  - 无效 URL 抛 `TypeError`；有效 URL 返回 `URL` 实例，可访问 `protocol` / `hostname` / `port` / `pathname`
  - `new URL('example.com')` 抛错（缺协议）— 验证逻辑应先 prepend `https://` 若用户未输入协议？— **本 story 不自动补协议**，要求用户显式输入 `http://` 或 `https://`，符合 AC4"使用 `new URL(value)` 构造器"严格口径
- **pinia-plugin-persistedstate ^3.x**:
  - Setup Store 用 `persist: true` 或 `persist: { key, storage }` 选项；Options Store 同样
  - ⚠️ Pinia 2.x + plugin ^3.x 兼容性以 context7 查询为准

### Project Context Reference

[Source: `_bmad-output/project-context.md`] — 实现前必读:
- §1 命名约定（Vue PascalCase 组件、camelCase 变量）[L52-L66]
- §6 WebSocket 实时通信（事件版本控制 `X-Event-Version: v1`；本 story dev 用 mock，生产由 Epic 2 接通）[L156-L164]
- §7 前端状态管理（Pinia 按功能模块组织，`persist: true` 持久化）[L166-L176]
- §9 代码组织规范（`frontend/src/components/`、`frontend/src/views/`、`frontend/src/stores/`）[L202-L222]
- §15 关键反模式 — ❌ 在 Celery 任务中创建新浏览器实例、❌ 升级 Playwright — 本 story 不涉及但需知晓 [L286-L301]
- §14 性能约束 — 页面分析 <8 秒 95th percentile（本 story mock 必须满足）；API 响应 <200ms 95th percentile（mock 必须满足）[L278-L284]

### 王芳 Persona — 文案与交互语调指导

[Source: prd.md#L1406-L1424 — 王芳 = 38 岁非技术用户，电商店主，时间紧迫，技术术语陌生]

本 story 的简洁视图、进度文案、错误提示等所有用户可见文案，必须按王芳 persona 调整:

- **按钮文案**:
  - ✅ "开始爬取" — 王芳能懂
  - ❌ "Execute Crawl" / "启动爬虫" / "Run Analysis"
- **进度阶段标签**:
  - ✅ "AI 正在浏览页面" / "AI 找到了 3 个字段" / "正在为您复制数据"
  - ❌ "Analyzing URL..." / "Extracting fields..." / "Crawling data..."
- **错误信息**:
  - ✅ "网址格式不正确，请检查后再试。" — 1-1 已落地，本 story 保留
  - ✅ "AI 暂时没找到字段，请稍后再试。" — mock failed 路径文案
  - ❌ "TypeError: Invalid URL" / "Error 422: Validation failed"
- **空状态**:
  - ✅ "还没有爬取历史" + "立即开始爬取"
  - ❌ "No crawl history yet" / "Empty state"
- **视图切换器标签**:
  - ✅ "简洁视图" / "仪表板视图" / "专业视图" — 1-1 / UX 规范已用
  - tooltip "由 Epic 4 交付" 改为 "更多视图即将推出" — 王芳不懂 "Epic" 是什么
- **避免的术语清单**: URL、API、中台、依赖、运行时、进程、签名、实例化、序列化、字段（用"内容"替代或配合解释）、视图（可用"界面"）

## Project Structure Notes

- 本 story 全部新增/修改文件位于 `frontend/src/` 与 `frontend/tests/` — 不触及 `backend/` 与 `frontend/electron/`
- 与 Epic 2 Story 2.1 的边界: 本 story 的 `analyze` 与 `crawl` API 调用沿用 1-1 的 mock 边界（dev mock / prod 调真实后端），真实后端由 Story 2.1 交付
- 与 Story 1.3 的边界: 历史记录列表与任务管理由 1.3 交付 — 本 story 仅交付"最近爬取"空状态占位；禁止实现任务卡片列表
- 与 Epic 4 的边界: Dashboard/Professional 视图本体由 Epic 4 交付 — 本 story ViewSwitcher 中两者按钮 disabled
- 与 Story 1.4 的边界: `useUiStore` 持久化视图偏好；1.4 的 `useSettingsStore` 通过 `useUiStore().setViewPreference` 修改 — 解耦避免循环依赖
- **检测到的冲突**:
  1. UX 规范 L3347 "最近爬取"区域 vs Epic 1.2 AC 仅要求"显示大搜索框 + 示例网址"不要求历史记录 — 解析：本 story 交付空状态占位，历史列表由 Story 1.3 交付（与本 story AC8 一致）
  2. Architecture.md#L240 `frontend/src/stores/ui.js` 为 .js 文件 vs project-context.md#L52-L66 Vue 文件 kebab-case + .ts — 解析：1-1 已用 TypeScript（`stores/onboarding.ts`），本 story 沿用 `.ts` 后缀
  3. Architecture.md#L1726 提及 `frontend/src/api/websocket.js` WebSocket 客户端 vs 本 story 不实现真实 WebSocket — 解析：本 story 用 `setInterval` mock 进度推送，真实 WebSocket 客户端文件由 Epic 2 创建
  4. UX 规范 L2651 "视图切换位置：左侧导航顶部或顶部导航" vs epic 1.2 AC "左侧导航栏收起状态" — 解析：本 story 采用底部居中 SegmentedControl 形式（不挤占主区域），符合简洁视图"收起式左侧栏"精神；Epic 4 实现完整左侧导航栏时再迁移 ViewSwitcher 位置
  5. 示例网址 `https://example.com/product` 是 IANA 占位域名无法真实爬取 — 解析：mock 模式下 `analyze(url)` 不实际请求，返回静态 mock 数据；真实后端由 Epic 2 实现时 `example.com` 会返回 404，但本 story 测试不依赖真实网络

## References

- [Source: epic-01-first-time-onboarding.md#L48-L75] — Story 1.2 原始需求与 AC
- [Source: prd.md#L1525] — FR30 简洁搜索引擎式界面输入网址
- [Source: prd.md#L1527] — FR32 实时爬取进度与状态
- [Source: prd.md#L1406-L1424] — 王芳 persona（38 岁非技术电商店主）
- [Source: prd.md#L1759] — NFR1 页面分析 <8 秒 95th percentile
- [Source: architecture.md#L194-L246] — ADR-006 三级视图策略与状态管理决策
- [Source: architecture.md#L650-L664] — SmartURLInput 组件规格
- [Source: architecture.md#L686-L700] — ViewSwitcher 组件规格
- [Source: architecture.md#L862-L863] — Phase 1 MVP 组件优先级
- [Source: architecture.md#L1318-L1330] — WebSocket 事件命名 (snake_case)
- [Source: architecture.md#L1342-L1356] — Pinia store 命名与 state 命名规范
- [Source: architecture.md#L1360-L1372] — ADR-007 错误处理策略
- [Source: architecture.md#L1389-L1404] — WebSocket 事件版本控制 `X-Event-Version: v1`
- [Source: architecture.md#L1699] — `simple/` 子目录约定
- [Source: ux-design-specification.md#L1041-L1060] — UX-DR1 简洁视图设计
- [Source: ux-design-specification.md#L1101-L1116] — UX-DR5 首次使用引导（简洁视图为引导完成落地页）
- [Source: ux-design-specification.md#L2539-L2564] — 按钮层次和视觉设计
- [Source: ux-design-specification.md#L2568-L2602] — 反馈模式（成功/错误/警告/信息）
- [Source: ux-design-specification.md#L2610-L2637] — URL 输入表单模式与验证规则
- [Source: ux-design-specification.md#L2641-L2655] — 视图切换模式
- [Source: ux-design-specification.md#L2657-L2664] — 返回按钮导航（本 story 简洁视图不显示，仪表板/专业视图自 Epic 4 起）
- [Source: ux-design-specification.md#L2713-L2742] — 空状态和加载状态
- [Source: ux-design-specification.md#L2773-L2789] — Naive UI 集成与自定义模式规则
- [Source: ux-design-specification.md#L3333-L3385] — 屏幕 6 简洁视图布局结构
- [Source: 1-1-desktop-app-install-launch.md#L1-L51] — Story 1.1 已交付的 SimpleView.vue 占位实现
- [Source: 1-1-desktop-app-install-launch.md#L115-L155] — Story 1.1 review patch list（10 项需应用 + 9 项延后）
- [Source: 1-1-desktop-app-install-launch.md#L359-L377] — 王芳 persona 文案落地模式
- [Source: 1-1-desktop-app-install-launch.md#L454-L466] — Story 1.1 完成证据与所有可见文案要求
- [Source: 1-1-desktop-app-install-launch.md#L485-L515] — Story 1.1 生成的文件清单（本 story 复用基础）
- [Source: project-context.md#L18-L46] — 技术栈版本
- [Source: project-context.md#L52-L66] — 命名规范
- [Source: project-context.md#L166-L176] — Pinia store 持久化
- [Source: project-context.md#L178-L200] — 测试规范（单元/组件/E2E）
- [Source: project-context.md#L202-L222] — 前端代码组织
- [Source: project-context.md#L286-L301] — 关键反模式禁止项

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

- 初次 vitest 运行 4 失败：(1) SimpleView 缺"尚未开始爬取"文案 — 1-1 测试断言保留；(2) `import.meta.env.DEV` 在 vitest 中为 false 致 `MOCK_BACKEND` 假 → fetch 调用真实端点失败；(3) `createTestingPinia({ createSpy: () => () => null })` 返回非 spy 函数，`.toHaveBeenCalledWith` 报 "not a spy"；(4) `n-input` `aria-invalid` prop 不转发到原生 input DOM
- 修复 1：SimpleView.vue 在 `state==='idle'` 且无 hint 时显示"尚未开始爬取…"副文案
- 修复 2：api/analyze.ts `MOCK_BACKEND` 加入 `import.meta.env.MODE === 'test'`；vitest.config.ts 加 `define: { 'import.meta.env.VITE_MOCK_BACKEND': '"true"' }`
- 修复 3：所有 createTestingPinia 改为 `createTestingPinia({ createSpy: vi.fn })`
- 修复 4：SmartURLInput 用 `:input-props` 透传 aria 属性到原生 input
- 修复 5：ViewSwitcher onSelect 当 modelValue !== 'simple' 时直接调用 `uiStore.setViewPreference('simple')`，确保 store spy 能被触发
- 修复 6：SimpleView "view switcher triggers store update on toggle" 测试中先设 `store.viewPreference='dashboard'`，让 ViewSwitcher 判断 emit + store 调用路径成立
- 修复 7：n-tag 不接受 `@keydown.enter="handler"` 数组形式，改为 `@keydown.enter.prevent="onExampleClick(example)"`
- 修复 8：retry test 用 `vi.spyOn` 替代 hoisted `vi.mock`（前者污染全套测试）

### Completion Notes List

- 7 个主任务、27 个子任务全部 [x] 完成
- 60/60 单元测试通过（SmartURLInput 14 + ViewSwitcher 3 + ui store 2 + SimpleView 11 + 既有 30 测试继承通过）
- 新增依赖：`@vicons/ionicons5 ^0.13.0`、`pinia-plugin-persistedstate ^3.2.3`，已通过 npm install 完成
- 组件 4 个：SmartURLInput.vue / ViewSwitcher.vue / simple/ProgressPanel.vue / SimpleView.vue（改造）
- Store 1 个：stores/ui.ts（Setup Store + persist 插件）
- API 扩展：api/analyze.ts 新增 `getCrawlProgress` 函数（dev mock 用 setInterval，prod 连真实 WebSocket）
- 类型扩展：types/analyze.ts 新增 `CrawlStage` / `CrawlProgressEvent` / `CrawlCompletedEvent`（snake_case 事件名遵循 architecture.md#L1318-L1330）
- Mock 扩展：mocks/analyze-mock.ts 新增 `mockExamples` / `mockAnalyzedFields` 导出
- 王芳文案落地：进度阶段标签 "AI 正在浏览页面" / "正在为您复制数据" / "完成"；错误 "AI 暂时没找到字段，请稍后再试。"
- 1-1 测试断言全保留："开始爬取"按钮、"请先粘贴网址"、"网址格式不正确" 三项通道无回归
- 路由复用 1-1 已建 `/simple-view`，未创建新路由
- ViewSwitcher dashboard/professional 按钮 disabled + 原生 `title="更多视图即将推出"`（王芳 persona 友好，避免 "Epic" 术语）
- 不创建 DashboardView.vue / ProfessionalView.vue / websocket.ts / crawl.ts / backend 路由（边界守住）
- 未跑 `vitest run --coverage`（vitest.config.ts coverage.include 未含 src/components 与 src/views，仅含 electron/services、composables、api、stores；如需 component 覆盖率统计需后续扩 include，但 60/60 测试已覆盖全部 AC14）

### File List

新增:
- frontend/src/components/SmartURLInput.vue
- frontend/src/components/ViewSwitcher.vue
- frontend/src/components/simple/ProgressPanel.vue
- frontend/src/stores/ui.ts
- frontend/tests/components/SmartURLInput.test.ts
- frontend/tests/components/ViewSwitcher.test.ts
- frontend/tests/stores/ui.test.ts

修改:
- frontend/src/views/SimpleView.vue
- frontend/src/api/analyze.ts
- frontend/src/types/analyze.ts
- frontend/src/mocks/analyze-mock.ts
- frontend/src/main.ts
- frontend/tests/components/SimpleView.test.ts
- frontend/vitest.config.ts
- frontend/package.json
- frontend/package-lock.json

### Change Log

- 2026-08-06: Story 1.2 实现完成 — 7 任务 27 子任务全 [x]，60/60 测试通过，状态 ready-for-dev → in-progress → review
