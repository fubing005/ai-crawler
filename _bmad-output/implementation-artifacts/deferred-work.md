# Deferred Work

## Deferred from: Story 2-1 网址输入与页面结构分析 (2026-08-18)

- 区域级可视化手动框选/高亮框/连接线/拖动定位 - 2-1 仅交付数据层 `main_content_selector` + 文案级展示（"已定位主要内容区域"），可视化交互由 Story 2-3 交付（其 AC 明确"高亮框、连接线、拖动"）
- `crawl()` / `getCrawlProgress()` 仍走 mock 分支 - 真实提取端点 + WebSocket 进度由 Story 2-2 交付；`runCrawl` 的 analyze -> getCrawlProgress('mock-task') -> crawl 顺序本 story 未重排（deferred-work L14 既有项）
- Celery Worker Pool / 浏览器连接池 - 2-1 同步分析请求在 FastAPI 事件循环内完成，池化由 Epic 3 爬取任务交付
- AI 真实提供商（Ollama / OpenAI 等）+ 密钥环存储 + 配置 UI - Phase 1 分析器为 `HeuristicAnalyzer` 确定性启发式，`AIProvider` 抽象已预留，由 Story 2-4 交付
- 后端打包进 Electron sidecar - 2-1 后端以独立 uvicorn 进程运行，打包集成由 Epic 11 交付
- AIAnalysisProgress 完整组件（步骤文本/预计时间/取消按钮）- 2-1 复用 1-2 已交付 `ProgressPanel` stage `analyzing`，完整组件归 Epic 4 组件体系

## Deferred from: code review of 1-3-task-management-history (2026-08-10 — Round 4)

- setActiveTask / nowTimestamp 30s tick 触发 pinia-plugin-persistedstate $subscribe 冗余 localStorage 序列化 [frontend/src/stores/crawl.ts] — `pick: ['history']` 限制写入字段，但 $subscribe 仍触发 history 完整序列化。pref concern 非 spec violation。deferred: Phase 2 性能优化阶段处理（可加 `paths` 选项或 shallow 兼容）

## Deferred from: code review of 1-3-task-management-history (2026-08-10 — Round 3)

- SmartURLInput B8 修复依赖 Vue 微任务 batch 顺序 — `showHistory=false` 必须放在 nextTick callback 末位以胜出 onFocus→`showHistory=true` 竞争；无 proactive test guard，Vue scheduler 若变更行为则回归 [frontend/src/components/SmartURLInput.vue:217-225] — deferred: 当前工作但脆弱保留，可在 Vue 3.5+ 升级或出现回归时补 `SmartURLInput.history-close.test.ts`
- Naive UI Drawer stub 测试使用内部组件名 `Drawer`（非 import 别名 `NDrawer`） — Naive UI 2.39+ 若 rename 内部名则 TaskDetailDrawer 测试 `findComponent({ name: 'Drawer' })` 静默断裂 [frontend/tests/components/TaskDetailDrawer.test.ts:651-656] — deferred: 框架版本耦合暂可容忍，2.39 升级时复核

## Deferred from: code review of 1-2-simple-view-url-input (2026-08-07 — second pass)

- WS 订阅先于 crawl() 任务创建 — `runCrawl` 顺序 `await getCrawlProgress('mock-task')` 后再 `await crawl(...)`，真实后端中 WS 连接到尚未创建的 task_id [frontend/src/views/SimpleView.vue:97-118] — deferred: 真实 WS 流程由 Epic 2 重排为 `crawl → 取 task_id → getCrawlProgress(task_id)`
- 硬编码 `'mock-task'` taskId 泄漏到真实后端分支 — `getCrawlProgress('mock-task', ...)` 字面 taskId 与 `crawl()` 返回 `{ rows: N }` 不携带 task_id 不匹配 [frontend/src/views/SimpleView.vue:103, frontend/src/api/analyze.ts:103] — deferred: 真实 task_id 由 Epic 2 通过 `crawl()` 响应或独立 endpoint 取得
- ViewSwitcher 单次 click 三重 store 写 — 子组件 onSelect 既 emit 又 `uiStore.setViewPreference('simple')`，父 SimpleView onViewChange 再次 `setViewPreference(view)` [frontend/src/components/ViewSwitcher.vue:44-51 + frontend/src/views/SimpleView.vue:179-181] — deferred: pinia ref 同值多次赋值仅触发一次 watcher——localStorage 仍单写，属设计气味非 bug；Epic 4 视图完整接入后或可整组重构
- onSelect 仪表板/专业 branch 静默 no-op — `if (view === 'simple')` 是唯一处理分支；当前 disabled button 保证不可达 [frontend/src/components/ViewSwitcher.vue:44-51] — deferred: Epic 4 实现仪表板/专业视图组件时补 handler + 路由切换
- WebSocket 收到非法 payload 后未 ws.close() — JSON.parse 抛错时 reject 但未关闭 socket [frontend/src/api/analyze.ts:119-121] — deferred: WS 路径 Epic 2 实现真实客户端时统一处理
- WebSocket onclose 早于 onerror 静默 resolve（重申）— onerror=reject 与 onclose=resolve；某些环境下 onclose 先触发会让真实网络错误被 resolve 吞掉 [frontend/src/api/analyze.ts:121-124] — deferred, pre-existing — 与首次评审 deferred-work.md 重复，Epic 2 修复
- 测试环境强制 MOCK_BACKEND（MODE==='test' + vitest define 'true' 双重冗余）— 阻止 vitest 下写真实后端集成测试 [frontend/src/api/analyze.ts:11-13 + frontend/vitest.config.ts:7-9] — deferred: Epic 2 引入真实后端集成测试时再决定 test runner 分层
- onStartHistory 双 scrollTo 冗余 — bodyRef.scrollTo + window.scrollTo；CSS 无 overflow，bodyRef 调用必为 no-op [frontend/src/views/SimpleView.vue:170-177] — deferred: cosmetic 死代码可清理
- getCrawlProgress abort 时 resolve 而非 reject — 非对称契约，调用方无法区分 abort 与正常完成 [frontend/src/api/analyze.ts:74,99] — deferred: 改 reject 需调用方同步加 AbortError 过滤，契约变更属 Epic 2 WS 整体重构范畴
- SmartURLInput 与 SimpleView 两层验证边界不一致 — 子组件仅拦 invalid，empty 仍 emit；父再校 empty。两层边界微妙不同 [frontend/src/components/SmartURLInput.vue:142-148 + frontend/src/views/SimpleView.vue:144-155] — deferred: 设计选择，Epic 4 表单模式标准化时复核
- WS 路径无前置 aborted signal 检查 — mock 路径 L74 有早退保护，WS 分支 L102-127 入口无同保护 [frontend/src/api/analyze.ts:102-127] — deferred: WS 路径全部由 Epic 2 接管

## Deferred from: code review of 1-2-simple-view-url-input (2026-08-06)

- mock analyze/crawl 忽略 AbortSignal — 组件卸载后 mock setTimeout 仍回调 ref，Vue 警告 "state update on unmounted component"。真实后端 + signal 处理由 Epic 2 实现 [frontend/src/api/analyze.ts:17,29] — deferred: 当前 mock 模式下不可由 signal 取消，需 Epic 2 真实后端集成层修
- WebSocket onclose 早于 onerror 静默 resolve — MOCK_BACKEND=true 时不可达，mock setInterval 解析无 ws 路径。真实 WebSocket 错误处理由 Epic 2 修 [frontend/src/api/analyze.ts:122-124] — deferred: 当前未连接真实 ws，Epic 2 实现真实 WebSocket 客户端时复核

## Deferred from: code review of 1-1-desktop-app-install-launch (2026-08-03)

- dependencyCheckPromise 字段冗余 — 仅一次 await 使用可省，可内联到 whenReady 调用 [frontend/electron/main.ts:20, 198-201]
- 启动埋点 T2 = performance.now() 不是从 renderer 起起始时刻 — 与 Story Task 3.5 严格口径略偏差，可接受 [frontend/src/App.vue:21]
- FirstTimeWizard stepStatus computed 永远 `'process'` — Naive UI n-steps status 不更新视觉差异 [frontend/src/components/FirstTimeWizard.vue:227]
- FirstTimeWizard 进度恢复不完整 — 恢复 currentStep 到 Step 4 时不重新触发 analyze，导致空字段列表 [frontend/src/components/FirstTimeWizard.vue:238-255]
- WelcomePage 卡片双重可点击 — article role=button + 内嵌 n-button 重复焦点，a11y 退化 [frontend/src/components/WelcomePage.vue:11-26]
- PrivacyConsent 完整政策占位文本 — 需 PM 后续补完整政策文案与链接 [frontend/src/components/PrivacyConsent.vue:36-40]
- vitest.config coverage include 仅 services/composables/api/stores — 不含 main/preload/components/router/views，覆盖率统计不全 [frontend/vitest.config.ts:19-23]
- tests/setup.ts 自建 jsdom 与 vitest environment:jsdom 重复 — 可移除 setup.ts 中自建 dom [frontend/tests/setup.ts:4-27, frontend/vitest.config.ts:14]
- electron-vite.config.ts renderer root:'.' 与 outDir:'dist-renderer' 配合 — 需 electron-vite 实测验证 output 路径 [frontend/electron.vite.config.ts:38-44]
