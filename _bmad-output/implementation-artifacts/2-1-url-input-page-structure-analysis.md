# Story 2.1: 网址输入与页面结构分析

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为数据采集人员，
我希望输入网址后系统能自动分析页面结构，
以便我无需编写代码就能了解页面内容和布局。

## Acceptance Criteria

1. **AC1 - 分析触发与 8 秒预算**: 用户在简洁视图输入网址点击"开始爬取"（既有 `runCrawl` 路径）后，前端立即显示"正在分析..."进度提示（复用 1-2 已交付的 `ProgressPanel`，stage `analyzing`）；真实后端全链路（页面获取 + 结构分析）在 **8 秒内返回（95th 百分位，NFR1）**；后端以 `asyncio.wait_for(..., timeout=7.5)` 强制总预算 7.5s（预留 0.5s 传输余量），超时返回错误码 `ANALYSIS_TIMEOUT`，前端展示"分析超时，请稍后再试"。**本 story 是项目第一个后端 story**：`backend/` 目录尚不存在，需从零搭建最小 FastAPI 服务（不含 Celery / Redis / PostgreSQL，见 Dev Notes 边界声明）。 [Source: epic-02-ai-page-analysis.md#L26-L29, prd.md#L1759 NFR1, architecture.md#L1082-L1085 超时包装, project-context.md#L280 性能约束]

2. **AC2 - 页面类型标签 + 主要内容区域 + 推荐字段**: 分析完成后，后端返回 `detected_type`（页面类型）、`main_content_selector`（主要内容区域 CSS 选择器）、`overall_confidence`（整体置信度 0-1）、`fields[]`（推荐字段：name / selector / confidence / sample）；简洁视图在分析阶段结束后、提取阶段开始前，显示**分析结果卡片**（新组件 `AnalysisResultCard`）：(a) 页面类型标签（`n-tag`）：`ecommerce`→"电商商品列表"、`news`→"新闻资讯"、`blog`→"博客文章"、`form`→"用户表单"、`unknown`→"未识别"；(b) 主要内容区域选择器以信息行展示（Phase 1 非可视化高亮，**可视化高亮框/连接线由 Story 2-3 交付**）；(c) 推荐字段列表（字段名 + 示例值 + 置信度，置信度颜色按 UX 规范四档：≥90% 绿 / 80-89% 蓝 / 70-79% 黄 / <70% 红）。 [Source: epic-02-ai-page-analysis.md#L31-L35, architecture.md#L524-L538 AIAnalysisProgress/字段展示, ux-design-specification.md#L3188-L3242 分析结果卡片与置信度颜色, ux-design-specification.md#L3239-L3242]

3. **AC3 - 无效网址错误处理**: 两级错误：(a) **格式错误** - 前端 `validateUrl`（1-2 已实现）拦截，显示"网址格式不正确"，不发起后端请求；(b) **无法访问** - 后端页面获取失败（DNS 失败 / 连接拒绝 / SSL 错误 / HTTP 4xx-5xx）返回 HTTP 502 + 错误码 `UNREACHABLE`，前端显示"无法访问该网站"，两种错误均附建议文案"请检查网址拼写，或尝试其他网址"；错误提示使用 1-2 既有 `hint` 区域 + `n-alert` type="error" 模式，`role="alert"`。后端错误响应结构统一为 `{ "error": { "code": "...", "message": "..." } }`（project-context API 约定），成功响应统一为 `{ "data": {...}, "message": "Success" }` 信封，前端 API 层负责解包。 [Source: epic-02-ai-page-analysis.md#L37-L40, project-context.md#L99-L138 错误结构与响应格式, ux-design-specification.md#L4405-L4413 表单验证 aria]

4. **AC4 - 分析结果不确定降级**: 当 AI 返回 `overall_confidence < 0.7`（UX 状态机：>70% 完成、50-70% 警告）时：分析结果卡片显示 `n-alert` type="warning" 文案"分析结果不确定，建议手动确认要提取的内容"；卡片内字段列表仍展示（用户可勾选/取消字段作为 Phase 1 手动手段）；**区域级可视化手动框选由 Story 2-3 交付**（2-3 AC："支持用户拖动选择框重新定位"），本 story 不实现拖拽/框选/点击定位交互，该边界记入 `deferred-work.md`。整体置信度 ≥0.7 时显示 `n-tag` type="success""分析完成"。 [Source: epic-02-ai-page-analysis.md#L42-L45, ux-design-specification.md#L4220-L4224 状态转换 置信度阈值, epic-02-ai-page-analysis.md#L103-L107 2-3 拖动定位边界]

5. **AC5 - 后端 API 契约**: 创建 `POST /api/v1/page-analyses`（REST 复数资源命名，project-context 约定；**废弃 1-2 客户端预留的 `GET /api/v1/analyze?url=` 形式**，前端 `analyze.ts` 真实分支同步改造）：请求体 `{ "url": string }`（Pydantic V2 校验，非法 URL 返回 400 `INVALID_URL`）；响应 200 信封 `data` 为分析结果（见 AC2 字段）；路由 `async def`；服务结构：`backend/app/api/v1/page_analyses.py`（路由）→ `backend/app/services/ai_service.py`（分析服务 + `AIProvider` 抽象）→ `backend/app/services/page_fetcher.py`（Playwright 页面获取）。**Phase 1 默认分析器为 `HeuristicAnalyzer`（确定性 DOM 启发式：标题层级、重复结构聚类、常见 class/语义标签模式）**，不调用外部 AI API；`AIProvider` 抽象接口（`async def analyze_page(html: str, url: str) -> PageAnalysis`）按 architecture.md#L1070-L1078 伪代码预留，真实提供商（Ollama / OpenAI 等）+ 密钥环存储 + 配置 UI 由 Story 2-4 交付。 [Source: architecture.md#L1065-L1085 AI 抽象层, architecture.md#L1771 Epic 2 实施位置, project-context.md#L114-L141 API 约定, epic-02-ai-page-analysis.md#L126-L164 Story 2.4 边界]

6. **AC6 - Playwright 页面获取与资源清理**: `page_fetcher.py` 使用 **playwright（Python 版）async API + chromium**：模块级懒加载单例 browser（首次请求 `launch()`），每请求独立 `browser_context` + `page`，导航 `wait_until="domcontentloaded"`，导航后额外等待 `networkidle` 最多 2s（尽力而为，超时不再等待）；请求结束 `await context.close()`（**必需，防内存泄漏，project-context 反模式**）；FastAPI `lifespan` shutdown 时 `await browser.close()`（**必需**）；单实例内存预算 100-200MB；**本 story 不引入 Celery Worker Pool / 连接池**（同步分析请求在 FastAPI 事件循环内完成，池化由 Epic 3 爬取任务交付，见边界声明）。Python playwright 版本固定 `1.51.0`（与 Node 侧一致）。 [Source: project-context.md#L145-L154 Worker Pool 规范, project-context.md#L288-L294 反模式 忘记 close, architecture.md#L1114-L1130 浏览器自动化]

7. **AC7 - 前端 API 层改造与 mock 边界**: 改造 [frontend/src/api/analyze.ts](frontend/src/api/analyze.ts)：(a) `analyze()` 真实分支改 `POST /api/v1/page-analyses`，解包信封 `res.data.data`，非 2xx 时读取 `error.code` 抛带码错误，调用方映射王芳文案（`INVALID_URL`→"网址格式错误"、`UNREACHABLE`→"无法访问该网站"、`ANALYSIS_TIMEOUT`→"分析超时，请稍后再试"、其他→"分析失败，请稍后再试"）；(b) `MOCK_BACKEND` 判定收紧为 `import.meta.env.MODE === 'test' || import.meta.env.VITE_MOCK_BACKEND === 'true'`（**移除 `DEV` 强制 mock**，开发模式默认走真实后端，`VITE_MOCK_BACKEND=true` 可退回 mock）；(c) `crawl()` 与 `getCrawlProgress()` **保持 mock 不动**（真实提取 + WebSocket 进度由 Story 2-2 交付，本 story 仅 `analyze()` 真实化）；(d) dev 代理 `/api/v1 → http://localhost:8000` 已在 [electron.vite.config.ts#L53-L65](frontend/electron.vite.config.ts) 配置，勿重复配置；(e) `types/analyze.ts` 扩展：`detected_type` 联合类型增加 `'form'`，`AnalyzeResponse` 增加 `overall_confidence: number`、`main_content_selector: string | null`，`mockAnalyzeResponse` 同步补齐新字段保持类型完整。 [Source: frontend/src/api/analyze.ts#L12-L28, deferred-work.md L15-L16 mock-task 边界, frontend/electron.vite.config.ts#L53-L65]

8. **AC8 - AnalysisResultCard 组件与 SimpleView 集成**: 新组件 `frontend/src/components/simple/AnalysisResultCard.vue`：props `{ result: AnalyzeResponse }`，emits 无（纯展示）；展示页面类型标签、整体置信度、主要内容区域选择器信息行、字段列表（名称 + sample 截断 40 字符 + 置信度颜色标签）、不确定警告（AC4）；可访问性：`role="region"` + `aria-label="分析结果"`，置信度数值含 `aria-label`（如"置信度 92%"），警告区 `role="alert"`；王芳文案全中文（"页面类型"/"整体置信度"/"推荐字段"/"主要内容区域"/"分析完成"/"分析结果不确定..."）。SimpleView 集成：`analyze()` 返回后、`getCrawlProgress()` 之前挂载卡片（`v-if="analysisResult"`），`runCrawl` 重新开始时清除上一轮卡片与失败提示；**不修改 FirstTimeWizard**（向导 step 4 有自己的字段展示，`analyze()` 签名不变故向导自动受益于真实后端，无需改动）。 [Source: ux-design-specification.md#L3188-L3242, ux-design-specification.md#L3235-L3236, prd.md#L1406-L1424 王芳 persona]

9. **AC9 - 与 Story 1-1/1-2/1-3/1-4 无回归**: 不修改既有 149 项 vitest 断言的语义：`SmartURLInput` / `ViewSwitcher` / `HistoryCard` / `TaskDetailDrawer` / `ProgressPanel` / `SettingsDrawer` / `FirstTimeWizard` 组件不动；`runCrawl` 仅插入"保存 analyze 结果 + 挂载卡片"与错误文案映射，`analyze -> getCrawlProgress('mock-task') -> crawl` 既有顺序**本 story 不重排**（WS 重排属 2-2，见 deferred-work.md L14）；既有测试在 `MODE==='test'` 下仍走 mock 分支（mock 响应补齐新字段后类型兼容）；新增后端 Python 代码不触碰 frontend 构建链。 [Source: 1-4-interface-settings-notifications.md#L421 全量 149/149, deferred-work.md#L14-L15]

10. **AC10 - 后端测试覆盖（pytest）**: 新建 `tests/unit/`（root，与 frontend `tests/e2e` 分离）：(a) `test_ai_service.py` ≥8 项 - `HeuristicAnalyzer` 对电商列表 HTML fixture 识别出重复结构字段（≥3 字段含 selector）、对文章页识别 title/正文、对表单页识别 form 控件、空/超短 HTML 返回 unknown + 低置信度、`overall_confidence` 计算、`main_content_selector` 命中、纯文本页降级、确定性（同输入同输出）；(b) `test_analyze_api.py` ≥7 项 - 合法 URL 200 信封结构、缺 url 422、非法 URL 400 `INVALID_URL`、fetcher 抛 `UnreachableError` → 502 `UNREACHABLE`、`asyncio.TimeoutError` → `ANALYSIS_TIMEOUT`（fetcher 全部 monkeypatch mock，**单元测试不启动真实浏览器**）；(c) `test_page_fetcher.py` ≥3 项 - 单例 browser 复用（mock playwright）、请求后 context.close 被调用、lifespan shutdown 调 browser.close。pytest + pytest-asyncio + httpx（`AsyncClient` + `ASGITransport`）；运行命令 `pytest tests/unit`。 [Source: project-context.md#L180-L193 测试规范, CLAUDE.md 测试命令]

11. **AC11 - 前端测试覆盖（vitest）**: (a) 新建 `frontend/tests/components/AnalysisResultCard.test.ts` ≥7 项 - 五种 detected_type 标签文案、置信度四档颜色 class/tag type、字段列表渲染 + sample 截断、`overall_confidence < 0.7` 警告文案与 `role="alert"`、≥0.7 成功标签、`main_content_selector === null` 时信息行不渲染、`aria-label` 存在；(b) 扩展 `SimpleView.test.ts` ≥4 项 - 分析完成后卡片挂载（含页面类型标签）、`runCrawl` 重新开始清除旧卡片、analyze reject（UNREACHABLE）显示"无法访问该网站" + 建议文案、ANALYSIS_TIMEOUT 文案；(c) 新建 `frontend/tests/api/analyze.test.ts` ≥4 项 - 真实分支 POST 调用 + 信封解包（stub `fetch`）、非 2xx 抛含 code 错误、`MODE==='test'` 走 mock 分支（800ms 后返回补齐新字段的 mock）、abort signal 传递。全量 vitest 回归通过。 [Source: project-context.md#L180-L200, 1-4 story AC14 测试基线模式]

12. **AC12 - 王芳 persona 文案**: 全部用户可见文案中文、零技术术语泄漏（禁 "URL"/"selector"/"timeout"/"API"/"HTTP"）："正在分析..."（既有）、"分析完成"、"分析结果不确定，建议手动确认要提取的内容"、"网址格式不正确"、"无法访问该网站"、"分析超时，请稍后再试"、"请检查网址拼写，或尝试其他网址"、"页面类型"、"整体置信度"、"推荐字段"、"主要内容区域"、"电商商品列表"/"新闻资讯"/"博客文章"/"用户表单"/"未识别"；`main_content_selector` 原始 CSS 选择器串**不直接展示给用户**，展示为"已定位主要内容区域"（选择器串仅存于数据层供 2-3 使用）。 [Source: prd.md#L1406-L1424, 1-2/1-3/1-4 王芳文案先例]

## Tasks / Subtasks

- [x] **Task 0 - dev 第一阶段调研与版本验证 (AC: 5, 6)**
  - [x] 0.1 用 context7 MCP 验证 Python playwright 1.51.0 async API（`async_playwright().start()`、`browser.new_context()`、`page.goto` wait_until 取值）与 FastAPI lifespan 现行写法（`asynccontextmanager` + `FastAPI(lifespan=...)`），记录到 Debug Log
  - [x] 0.2 `pip show playwright` 确认安装 1.51.0 + `playwright install chromium` 下载浏览器（Windows 环境）

- [x] **Task 1 - 后端骨架搭建 (AC: 1, 3, 5)**
  - [x] 1.1 新建 `requirements.txt`（根目录，与 CLAUDE.md 约定一致）：`fastapi`、`uvicorn[standard]`、`pydantic>=2`、`playwright==1.51.0`、`pytest`、`pytest-asyncio`、`httpx`
  - [x] 1.2 `backend/app/main.py`：FastAPI 实例 + `lifespan`（shutdown 时 `await page_fetcher.shutdown()`）+ 路由注册；`backend/app/api/v1/page_analyses.py`：`POST /api/v1/page-analyses`，`async def`，Pydantic V2 请求模型 `AnalyzeRequest(BaseModel)` 字段 `url: str`（HttpUrl 或自定义校验）
  - [x] 1.3 错误处理：自定义异常 `InvalidURLError`(400) / `UnreachableError`(502) / `AnalysisTimeoutError`(504) + FastAPI exception_handlers 统一输出 `{ "error": { "code", "message" } }`；成功经 ` { "data": ..., "message": "Success" }` 信封
  - [x] 1.4 URL 前置校验（scheme http/https），失败抛 `InvalidURLError`

- [x] **Task 2 - page_fetcher 服务 (AC: 1, 6)**
  - [x] 2.1 `backend/app/services/page_fetcher.py`：模块级单例 `_browser` 懒加载；`async def fetch(url: str) -> FetchedPage`（返回 html + page_title）；每请求 `new_context()` + 结束 `await context.close()`（try/finally）
  - [x] 2.2 导航 `goto(url, wait_until="domcontentloaded", timeout=5000)`，随后 `wait_for_load_state("networkidle", timeout=2000)` 包 try/except 吞超时
  - [x] 2.3 导航异常映射：`net::ERR_NAME_NOT_RESOLVED`/连接拒绝/SSL → `UnreachableError`；HTTP 状态 ≥400 → `UnreachableError`；总包装 `asyncio.wait_for(..., timeout=7.5)` → `asyncio.TimeoutError` 上抛
  - [x] 2.4 `async def shutdown()`：`await _browser.close()` + `await playwright.stop()`（幂等，None 检查）

- [x] **Task 3 - ai_service 分析服务 (AC: 2, 4, 5)**
  - [x] 3.1 `backend/app/schemas/page_analysis.py`：Pydantic V2 响应模型 `PageAnalysis`（`fields: list[AnalyzedField]`、`page_title: str`、`detected_type: Literal['ecommerce','news','blog','form','unknown']`、`overall_confidence: float`、`main_content_selector: str | None`）
  - [x] 3.2 `AIProvider` ABC：`async def analyze_page(self, html: str, url: str) -> PageAnalysis`（architecture.md#L1070 伪代码对齐，字段签名加 `url` 供启发式域名线索）
  - [x] 3.3 `HeuristicAnalyzer(AIProvider)`：纯函数式确定性 DOM 启发式（BeautifulSoup `bs4` 或 stdlib `html.parser`——**优先 stdlib，避免新增依赖**）；识别：`<title>`、h1/h2 标题、重复兄弟结构聚类（同类 class 列表项≥3 视为列表主体）、价格/日期/链接/图片模式（正则 + 标签名）、`<form>` 控件（input/label 对）；`main_content_selector` 取最大文本密度容器的推断选择器（语义标签 article/main 优先，否则最深重复结构父级 class）；`overall_confidence` = 命中信号加权（无任何命中 < 0.7 → uncertain）
  - [x] 3.4 `backend/app/services/ai_service.py` 编排：`fetch -> analyze_page`，Phase 1 provider 固定 `HeuristicAnalyzer`（工厂函数 `get_provider()` 预留 2-4 扩展点，仅返回 heuristic）

- [x] **Task 4 - 前端类型与 API 层改造 (AC: 7)**
  - [x] 4.1 `types/analyze.ts`：`detected_type` 加 `'form'`；`AnalyzeResponse` 加 `overall_confidence: number` + `main_content_selector: string | null`；`mockAnalyzeResponse` 补 `overall_confidence: 0.9`、`main_content_selector: 'ul.product-list'`
  - [x] 4.2 `api/analyze.ts` `analyze()` 真实分支：`POST /api/v1/page-analyses` JSON body；2xx 解包 `(await res.json()).data`；非 2xx 解析 `body.error.code` 抛 `new Error(code)`（Error message 携带 code，调用方映射文案）；signal 透传
  - [x] 4.3 `MOCK_BACKEND` 收紧：删除 `import.meta.env.DEV ||`，保留 `MODE === 'test' || VITE_MOCK_BACKEND === 'true'`
  - [x] 4.4 `crawl()` / `getCrawlProgress()` / `testAiProvider()` 一律不动（2-2 范围）

- [x] **Task 5 - AnalysisResultCard 组件 (AC: 2, 4, 8, 12)**
  - [x] 5.1 新建 `frontend/src/components/simple/AnalysisResultCard.vue`：纯展示 props `{ result: AnalyzeResponse }`；页面类型 `n-tag`（类型→文案映射表组件内常量）、`overall_confidence` 百分比展示、`main_content_selector` 非 null 时显示"已定位主要内容区域"信息行（`n-text` depth="3"）、字段列表（`n-list` 或简单 div 行：名称 + 截断 sample + 置信度 `n-tag`，颜色映射 ≥0.9 success / ≥0.8 info / ≥0.7 warning / <0.7 error）
  - [x] 5.2 uncertain 分支：`overall_confidence < 0.7` → `n-alert` type="warning" "分析结果不确定，建议手动确认要提取的内容"（`role="alert"`）；否则 `n-tag` type="success" "分析完成"
  - [x] 5.3 可访问性：根 `role="region"` + `aria-label="分析结果"`；置信度数值 `aria-label="置信度 N%"`

- [x] **Task 6 - SimpleView 集成 (AC: 1, 3, 8, 9)**
  - [x] 6.1 新增 `const analysisResult = ref<AnalyzeResponse | null>(null)`；`runCrawl` 开头置 null（清除旧卡片）；`await analyze(target)` 成功后 `analysisResult.value = analyzeRes`
  - [x] 6.2 模板：`ProgressPanel` 之后、历史列表之前 `<AnalysisResultCard v-if="analysisResult && state !== 'failed'" :result="analysisResult" />`（failed 时隐藏避免与错误提示并存）
  - [x] 6.3 catch 块错误映射：按 Error message 中的 code 映射 AC12 文案写入既有 `hint` + `n-alert`；无法识别的 code 走"分析失败，请稍后再试"；**AbortError 早退逻辑不动**（1-2/1-4 既有）
  - [x] 6.4 **不动**：`getCrawlProgress('mock-task', ...)` 调用、`crawl(target, fields)` 调用、通知触发、`pendingUndos`、`onRetry`/`onSubmit`/`onStartHistory`/`onViewChange`

- [x] **Task 7 - 后端测试 (AC: 10)**
  - [x] 7.1 `tests/unit/test_ai_service.py` ≥8 项（HTML fixture 字符串内联，断言确定性）
  - [x] 7.2 `tests/unit/test_analyze_api.py` ≥7 项（monkeypatch `page_fetcher.fetch` 与 provider，`httpx.AsyncClient(transport=ASGITransport(app))`）
  - [x] 7.3 `tests/unit/test_page_fetcher.py` ≥3 项（mock playwright 模块级对象）
  - [x] 7.4 `pytest tests/unit` 全绿；确认不依赖网络与真实浏览器

- [x] **Task 8 - 前端测试 (AC: 11)**
  - [x] 8.1 `frontend/tests/components/AnalysisResultCard.test.ts` ≥7 项
  - [x] 8.2 扩展 `frontend/tests/components/SimpleView.test.ts` ≥4 项（mock 模式下 analyze 补齐新字段后卡片渲染、失败文案映射）
  - [x] 8.3 新建 `frontend/tests/api/analyze.test.ts` ≥4 项（`vi.stubGlobal('fetch', ...)`，测完恢复；MODE==='test' mock 分支用 `vi.useFakeTimers` 推进 800ms）
  - [x] 8.4 全量 `npm run test`（frontend 目录）回归通过

- [x] **Task 9 - 文档与状态 (AC: 全部)**
  - [x] 9.1 `deferred-work.md` 追加 2-1 边界项：区域级可视化手动框选（→2-3）、crawl/WS 真实化（→2-2）、Celery Worker Pool（→Epic 3）、AI 真实提供商（→2-4）、后端打包进 Electron sidecar（→Epic 11）、AIAnalysisProgress 完整组件（步骤文本/预计时间/取消按钮，本 story 复用 ProgressPanel，→Epic 4 组件体系）
  - [x] 9.2 不修改 planning-artifacts 任何文档与 1-x story 文件
  - [x] 9.3 填写本文件 Dev Agent Record

## Dev Notes

### 关键架构决策与边界声明（本 story 最大风险区）

1. **首个后端 story，最小化骨架**：`backend/` 从零创建，**只引入 FastAPI + playwright**，**不引入** Celery / Redis / PostgreSQL / SQLAlchemy / Alembic / WebSocket。理由：2-1 的"分析"是单请求 <8s 同步语义，无需队列；架构规定的 Worker Pool / `/ws/progress/{task_id}` 服务于长时爬取任务，属 Epic 3 / 2-2。引入即违反"简单至上"。
2. **Phase 1 分析器为确定性启发式，不接真 AI**：`HeuristicAnalyzer` 本地 DOM 分析，离线可测、确定性输出。`AIProvider` 抽象接口按 architecture 伪代码预留，2-4 接真实提供商 + 3 秒回退 + 密钥环。**不要在 2-1 引入 openai/httpx-llm 等任何 AI SDK**。
3. **信封契约**：后端按 project-context 返回 `{data, message}` / `{error: {code, message}}`；前端 `analyze.ts` 解包后吐裸 `AnalyzeResponse` 给组件层（组件层不感知信封）。
4. **端点变更**：`GET /api/v1/analyze?url=`（1-2 预留，从未有真实后端实现）→ `POST /api/v1/page-analyses`。旧形式无任何调用方依赖真实实现，直接改造无兼容负担。
5. **mock 边界重画**：开发模式默认真实后端（删除 DEV 强制 mock）；`crawl`/`getCrawlProgress`/`testAiProvider` 保持 mock 至 2-2。`FirstTimeWizard` 调 `analyze()` 无签名变化，自动真实化，不修改向导代码。
6. **置信度阈值对齐 UX 状态机**：>0.7 完成、<0.7 警告（ux-design-specification.md#L4220-L4224 的 50-70% 警告带下探到 <70% 判定，Phase 1 单阈值简化）。

### 技术栈版本

- Python 3.10+ / FastAPI 0.100+（全路由 `async def`）/ Pydantic V2（`model_validate`，禁 `parse_obj`）
- playwright（Python）== 1.51.0（版本锁定，勿升级）
- HTML 解析优先 stdlib `html.parser`（零新依赖）；仅当实现严重受阻才允许 `beautifulsoup4` 入 requirements
- 前端：Vue 3.4 / Naive UI 2.38（`n-tag` / `n-alert` / `n-text`）/ Vitest 2.0.5 + jsdom
- 后端测试：pytest + pytest-asyncio + httpx `AsyncClient`（`ASGITransport`）

### 文件路径清单（全部新建除标注）

```
requirements.txt                          # 根目录
backend/__init__.py
backend/app/__init__.py
backend/app/main.py                       # FastAPI + lifespan
backend/app/api/__init__.py
backend/app/api/v1/__init__.py
backend/app/api/v1/page_analyses.py       # POST 路由
backend/app/schemas/__init__.py
backend/app/schemas/page_analysis.py      # Pydantic V2 模型
backend/app/services/__init__.py
backend/app/services/page_fetcher.py      # Playwright 单例获取
backend/app/services/ai_service.py        # AIProvider + HeuristicAnalyzer + 编排
backend/app/core/__init__.py
backend/app/core/errors.py                # 异常 + 错误码
tests/unit/test_ai_service.py
tests/unit/test_analyze_api.py
tests/unit/test_page_fetcher.py
frontend/src/components/simple/AnalysisResultCard.vue
frontend/tests/components/AnalysisResultCard.test.ts
frontend/tests/api/analyze.test.ts        # 新目录 tests/api
frontend/src/api/analyze.ts               # 修改
frontend/src/types/analyze.ts             # 修改
frontend/src/mocks/analyze-mock.ts        # 修改（补字段）
frontend/src/views/SimpleView.vue         # 修改
frontend/tests/components/SimpleView.test.ts  # 扩展
```

### 后端代码模式

```python
# SQLAlchemy 本 story 不用；错误处理模式：
class AppError(Exception):
    code = "INTERNAL_ERROR"; status = 500
class InvalidURLError(AppError):
    code = "INVALID_URL"; status = 400
class UnreachableError(AppError):
    code = "UNREACHABLE"; status = 502
class AnalysisTimeoutError(AppError):
    code = "ANALYSIS_TIMEOUT"; status = 504

# 路由（async def 强制）：
@router.post("/page-analyses")
async def create_page_analysis(req: AnalyzeRequest) -> dict:
    html, title = await page_fetcher.fetch(str(req.url))
    analysis = await get_provider().analyze_page(html, str(req.url))
    return {"data": analysis.model_dump(), "message": "Success"}
```

### 上一 story 情报（1-4，2026-08-17 done）

- 全量 vitest 基线 **149/149**（17 文件）——2-1 完成后必须保持全绿
- Naive UI stub 用内部 name（`Drawer` 非 `NDrawer`）；`n-notification` teleport 到 body 断言用 `document.body.textContent`
- vitest setupFiles 现指向 `tests/setup-notification.ts`（Notification 桩 beforeEach 注册）；本 story 不动 setup 文件
- pinia persist 测试 flush 模式（`createApp({}).use(pinia)` + 10ms macrotask）——本 story 不涉新 store，无需应用
- `feedback_naive_ui_2_38_message_no_action.md`：`useMessage().info` 无 action 字段——本 story 纯提示不用 action

### Git 情报

最近 5 commit 全为 Epic 1 story 完成（1-1~1-4），无后端先例；2-1 为前后端首度并存的第一个 commit，`requirements.txt` 与 `backend/` 均为仓库新增。前端提交信息风格：`feat(frontend): 完成 Story ...`——本 story 建议拆两条：`feat(backend): ...` + `feat(frontend): ...`。

### 防御性边界（禁止事项）

- **禁止**引入 Celery / Redis / PostgreSQL / SQLAlchemy / Alembic / WebSocket（分别属 Epic 3 / 2-2）
- **禁止**接入任何真实 AI 提供商 SDK 或网络 AI 调用（2-4 范围）
- **禁止**升级或改用 Node 侧 playwright 版本；Python 侧锁定 1.51.0
- **禁止**修改 `SmartURLInput` / `FirstTimeWizard` / `ProgressPanel` / 1-3 与 1-4 全部组件与 store 接口
- **禁止**重排 `runCrawl` 的 analyze→getCrawlProgress→crawl 顺序（deferred-work L14 明示 Epic 2 = 2-2 处理）
- **禁止**在单元测试启动真实 chromium 或访问网络（fetcher 全 mock）
- **禁止**把 CSS 选择器 / HTTP 状态码 / 异常类名等任何技术串渲染给用户（AC12）
- **禁止**修改 planning-artifacts 与 1-x story 文件
- **禁止**给前端新增 npm 依赖（无新增组件库需求）

### 检测到的潜在冲突与决策

1. **epic AC"高亮显示页面主要内容区域" vs 2-3"可视化定位"** - 解析：2-1 交付数据层 `main_content_selector` + 文案级展示（"已定位主要内容区域"），可视化高亮框属 2-3（其 AC 明确"高亮框、连接线、拖动"）；避免 2-1 造半套可视化编辑器。
2. **epic AC4"提供手动选择区域的功能" vs 2-3 全量手动调整** - 解析：2-1 以"字段勾选级手动手段 + 不确定警告"满足最小可用，区域级框选/拖拽 defer 2-3，记入 deferred-work.md。若 PM 复评不认可此收窄，2-3 提前吸收。
3. **architecture.md#L1771 将 `backend/app/tasks/crawler.py` 列为 Epic 2 位置** - 解析：tasks/ 属 Celery 爬取任务（2-2 / Epic 3 才需要），2-1 不创建空目录占位。
4. **1-2 客户端 `GET /api/v1/analyze` 与 project-context REST 约定冲突** - 解析：约定权威，改 POST 复数资源端点；旧 GET 从未有真实实现，零迁移成本。
5. **`MOCK_BACKEND` 移除 DEV 分支对开发体验的影响** - 解析：开发者需先起 uvicorn 才能调试完整流程；保留 `VITE_MOCK_BACKEND=true` 逃生门（electron.vite.config.ts bypass 已支持）。
6. **detected_type 联合类型扩展 `'form'` 的兼容性** - 解析：grep 确认 `detected_type` 仅在 types/mock/api 层流转，组件仅 wizard 间接消费 fields；扩联合类型向后兼容。

### References

- [epic-02-ai-page-analysis.md#L18-L49](_bmad-output/planning-artifacts/epic-02-ai-page-analysis.md) - Story 2.1 规范 4 条 BDD + FR1/FR3/FR5 + NFR1/NFR6
- [prd.md#L1486-L1492](_bmad-output/planning-artifacts/prd.md) - FR1/FR3/FR5 原文；[#L1759-L1768](_bmad-output/planning-artifacts/prd.md) NFR1 8 秒 / NFR3 并发
- [architecture.md#L1065-L1085](_bmad-output/planning-artifacts/architecture.md) - AIProvider 抽象 + 3s 回退
- [architecture.md#L1114-L1130](_bmad-output/planning-artifacts/architecture.md) - 浏览器自动化资源清理
- [architecture.md#L514-L556](_bmad-output/planning-artifacts/architecture.md) - 自定义组件缺口（AIAnalysisProgress / FieldSelectionList 归属）
- [architecture.md#L1770-L1781](_bmad-output/planning-artifacts/architecture.md) - Epic→文件映射
- [ux-design-specification.md#L2205-L2233](_bmad-output/planning-artifacts/ux-design-specification.md) - AIAnalysisProgress/FieldSelectionList 规格（本 story 仅用其数据形态）
- [ux-design-specification.md#L3188-L3249](_bmad-output/planning-artifacts/ux-design-specification.md) - 分析结果卡片布局 + 置信度颜色四档
- [ux-design-specification.md#L3754-L3793](_bmad-output/planning-artifacts/ux-design-specification.md) - 分析状态交互规格
- [ux-design-specification.md#L4220-L4227](_bmad-output/planning-artifacts/ux-design-specification.md) - 置信度状态转换阈值
- [ux-design-specification.md#L4398-L4413](_bmad-output/planning-artifacts/ux-design-specification.md) - 加载/验证 aria 模式
- [project-context.md#L114-L154](_bmad-output/project-context.md) - API 约定 + Worker Pool
- [project-context.md#L286-L301](_bmad-output/project-context.md) - 反模式清单
- [1-4-interface-settings-notifications.md](_bmad-output/implementation-artifacts/1-4-interface-settings-notifications.md) - 上一 story 情报与 149 测试基线
- [deferred-work.md#L12-L24](_bmad-output/implementation-artifacts/deferred-work.md) - Epic 2 待接管项（mock-task / WS 重排）
- [frontend/src/api/analyze.ts](frontend/src/api/analyze.ts) / [frontend/src/types/analyze.ts](frontend/src/types/analyze.ts) / [frontend/src/mocks/analyze-mock.ts](frontend/src/mocks/analyze-mock.ts) - 既有契约
- [frontend/src/views/SimpleView.vue#L178-L239](frontend/src/views/SimpleView.vue) - runCrawl 集成点
- [frontend/electron.vite.config.ts#L53-L65](frontend/electron.vite.config.ts) - dev 代理已配置
- [memory/feedback_naive_ui_stub_internal_name.md](C:/Users/Administrator/.claude/projects/d--Code-claude-code-claude-bmad-method-test/memory/feedback_naive_ui_stub_internal_name.md) 等四条既有记忆 - 测试已知坑

## Dev Agent Record

### Agent Model Used

GLM-5.2 (Claude Code)

### Debug Log References

- Task 0: `pip show playwright` 确认 1.51.0 已安装；Python async API（`async_playwright().start()` / `browser.new_context()` / `goto wait_until="domcontentloaded"`）与 FastAPI lifespan（`asynccontextmanager` + `FastAPI(lifespan=...)`）按现行版本写法实现
- pytest FakePlaywright mock 结构修复（FakePlaywrightStarter 包装 async_playwright 返回对象的 `.start()` 协议）
- vitest `analyze.test.ts` mock 分支用例失败修复：`await Promise.all([p, a])[0]` 优先级错误（对 Promise 对象取 [0] 恒 undefined），改 `(await Promise.all([p, a]))[0]`

### Completion Notes List

- 后端从零搭建：FastAPI + lifespan + `POST /api/v1/page-analyses`，错误信封 `{error:{code,message}}`，成功信封 `{data,message}`
- `page_fetcher.py`：模块级懒加载单例 browser、每请求独立 context + try/finally close、`asyncio.wait_for(..., 7.5)` 总预算、networkidle 2s 尽力等待、shutdown 幂等
- `HeuristicAnalyzer`：stdlib `html.parser` 零新依赖，确定性输出；`AIProvider` ABC + `get_provider()` 工厂预留 2-4
- 前端：`analyze()` 真实分支 POST 化 + 信封解包 + 错误码透传；`MOCK_BACKEND` 收紧为 `MODE==='test' || VITE_MOCK_BACKEND==='true'`（移除 DEV 强制 mock）；`crawl()`/`getCrawlProgress()` 未动
- 新组件 `AnalysisResultCard.vue`（纯展示，五类型标签、置信度四档色、sample 40 字符截断、<0.7 警告 role=alert、region/aria-label）；SimpleView 挂载于 analyze 成功后、getCrawlProgress 前，`runCrawl` 开头清空
- 测试基线：pytest 24/24（tests/unit 3 文件）；vitest 166/166（20 文件，含 AnalysisResultCard 7 项、SimpleView 集成 4 项、api/analyze 5 项）；1-x 既有断言零回归
- 边界项已记入 deferred-work.md（2-3 可视化框选 / 2-2 crawl+WS / Epic 3 池化 / 2-4 真实 AI / Epic 11 sidecar / Epic 4 AIAnalysisProgress）

### File List

新建：
- requirements.txt
- backend/__init__.py、backend/app/__init__.py
- backend/app/main.py
- backend/app/api/__init__.py、backend/app/api/v1/__init__.py、backend/app/api/v1/page_analyses.py
- backend/app/schemas/__init__.py、backend/app/schemas/page_analysis.py
- backend/app/services/__init__.py、backend/app/services/page_fetcher.py、backend/app/services/ai_service.py
- backend/app/core/__init__.py、backend/app/core/errors.py
- tests/unit/__init__.py、tests/unit/test_ai_service.py、tests/unit/test_analyze_api.py、tests/unit/test_page_fetcher.py
- conftest.py
- frontend/src/components/simple/AnalysisResultCard.vue
- frontend/tests/components/AnalysisResultCard.test.ts
- frontend/tests/components/SimpleView.analysis-card.test.ts
- frontend/tests/api/analyze.test.ts

修改：
- frontend/src/api/analyze.ts（analyze 真实分支 POST 化 + MOCK_BACKEND 收紧）
- frontend/src/types/analyze.ts（detected_type 加 'form'；AnalyzeResponse 加 overall_confidence / main_content_selector）
- frontend/src/mocks/analyze-mock.ts（补新字段）
- frontend/src/views/SimpleView.vue（analysisResult 状态 + 卡片挂载 + 错误文案映射）
- frontend/vitest.config.ts（include 加 tests/api）
- _bmad-output/implementation-artifacts/deferred-work.md（2-1 边界项）
- _bmad-output/implementation-artifacts/sprint-status.yaml（Story 2-1 状态）
