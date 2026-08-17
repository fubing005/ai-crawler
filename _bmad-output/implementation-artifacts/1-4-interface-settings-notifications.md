# Story 1.4: 界面设置与通知

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

作为新用户，
我希望能自定义界面设置并接收任务通知，
以便我能获得更符合个人习惯的使用体验并及时掌握爬取结果。

## Acceptance Criteria

1. **AC1 - 设置入口与抽屉触发**: 简洁视图底部视图切换器旁新增"设置"图标按钮（`n-button` quaternary circle + `SettingsOutline` 图标）；点击按钮打开右侧抽屉 `n-drawer` placement="right" width="480"，标题"界面设置"；用户可点击抽屉外区域或抽屉头部关闭按钮关闭抽屉；按 `Ctrl/Cmd + ,` 快捷键同样打开抽屉（避免与浏览器收藏夹快捷键 `Ctrl+D` 冲突）；抽屉打开时焦点自动移到抽屉内第一个可交互控件以便键盘用户操作。 [Source: epic-01-first-time-onboarding.md#L115-L122, ux-design-specification.md#L2695-L2699 设置对话框, ux-design-specification.md#L4310 Ctrl+, 快捷键, ux-design-specification.md#L2645-L2655 反馈模式]

2. **AC2 - 设置项分组展示**: 抽屉内容分三组（使用 `n-divider` 分隔 + 小标题）：(1) "外观" — 主题（浅色/深色单选）+ 语言（简体中文/English 单选，Phase 1 仅简体中文可选，English 以 disabled + tooltip "即将推出" 占位避免误以为可用）；(2) "通知" — 桌面通知开关（`n-switch`）+ 通知触发场景复选框组（爬取完成、爬取失败，默认勾选失败、关闭完成）；(3) "关于" — 应用版本号只读展示 + 隐私声明链接（链接到 Story 1.1 已交付的隐私政策弹窗复用）；所有设置项使用 Naive UI `n-form` label-placement="left" label-width="80" 排版避免错位。 [Source: epic-01-first-time-onboarding.md#L115-L122, ux-design-specification.md#L2695-L2699, prd.md#L1527-L1529 FR36 自定义界面设置与偏好]

3. **AC3 - 主题切换立即生效**: 用户在抽屉中切换"主题"选项（浅色 → 深色 或 深色 → 浅色），抽屉与应用根布局立即按新主题重渲染，无需刷新或重开抽屉；实现通过 `useSettingsStore().themePreference` 与 [frontend/src/App.vue#L2](frontend/src/App.vue#L2) 的 `n-config-provider :theme="theme"` 绑定（`'dark'` → `darkTheme` 对象，`'light'` → `null`）；深色模式对比度符合 NFR37 WCAG 2.1 AA（已在 UX 规范中规定由 Naive UI `darkTheme` 内置保证，本 story 不自定义 theme overrides 避免维护成本）。 [Source: ux-design-specification.md#L635-L655 主题切换机制, prd.md#L1820-L1827 NFR37 暗模式 + WCAG 2.1 AA, architecture.md#L191 用户偏好 LocalStorage]

4. **AC4 - 语言切换 Phase 1 占位**: 用户在抽屉中切换语言时，"简体中文"选项可选且立即生效（应用文案保持 zh-CN）；"English"选项 disabled + tooltip "即将推出"；语言选择本身持久化到 LocalStorage 但 Phase 1 实际渲染始终使用 Naive UI `zhCN` locale 与项目 zh-CN 文案（与 i18n 框架引入由后续 Epic 接入，本 story 仅交付 store 字段 + UI 占位避免后续破坏性变更）；持久化字段 `languagePreference: 'zh-CN' | 'en'`，但渲染层忽略此字段直至 i18n 接入。 [Source: epic-01-first-time-onboarding.md#L115-L122, ux-design-specification.md#L2695-L2699, prd.md#L1527 FR36, architecture.md#L191 用户偏好存储]

5. **AC5 - 通知偏好开关与持久化**: 用户可在"通知"分组中开关"桌面通知"总开关与"爬取完成"/"爬取失败"两个子场景复选框；开关状态立即写入 `useSettingsStore().notificationPreference`：`{ enabled: boolean, onComplete: boolean, onFailure: boolean }`；当 `enabled = false` 时子场景复选框 disabled + 灰显；当 `enabled = true` 且两个子场景均未勾选时，应展示提示文案"请至少选择一个通知场景，否则不会显示通知"（`n-text` type="warning"），但不阻止用户保存（用户可能故意想关所有场景）；状态持久化到 LocalStorage key `ai-crawler:settings-preferences`。 [Source: epic-01-first-time-onboarding.md#L115-L132, prd.md#L1529 FR37 爬取完成与错误通知, architecture.md#L191]

6. **AC6 - 保存设置 toast 提示**: 用户修改任意设置项后抽屉底部显示"保存"按钮（primary）+ "取消"按钮（默认 unstyled）；点击"保存"立即持久化到 LocalStorage 并关闭抽屉，同时在抽屉关闭后的主视图右上角弹出 `n-message` type="success" 文案"设置已保存"，duration 2000ms，自动消失；点击"取消"则放弃未保存的修改并关闭抽屉（修改未持久化）；按 `Esc` 键行为同"取消"；按 `Ctrl/Cmd + S` 在抽屉打开时行为同"保存"（避免浏览器默认保存网页对话框弹出）；保存按钮在未做任何修改时 disabled 避免空保存。**与 UX 规范的偏离声明**：(a) [ux-design-specification.md#L2698](ux-design-specification.md) 规定设置对话框按钮组为"取消 / 应用 / 保存"三按钮，本 story 仅交付"取消 / 保存"两按钮，**省略"应用"按钮**的理由 —— AC3 主题切换通过 `useSettingsStore().themePreference` reactive 绑定 `n-config-provider :theme` 已是即时生效（用户点击"深色"立即重渲染），"应用"按钮在 Naive UI `n-config-provider` reactive 模型下没有独立语义需要表达（"应用" ≡ "保存"），保留三按钮反而对王芳造成"应用 vs 保存差异"认知负担，故省略；该偏离记入 `_bmad-output/implementation-artifacts/deferred-work.md` 供 UX 复评；(b) [ux-design-specification.md#L2597](ux-design-specification.md) 规定反馈模式自动消失默认 5 秒，本 story 收紧到 2000ms 是因为抽屉关闭动画（Naive UI `n-drawer` 默认 transition 300ms）+ toast 弹出叠加在视觉上若 5s 则过久打扰王芳阅读历史卡片，2s 既符合"成功提示一闪而过"语义又避免与抽屉关闭视觉冲突；该偏离同样记入 `deferred-work.md` 供 UX 复评；如 UX 复评要求恢复 5s 则改 `duration: 5000` 单点修改。 [Source: epic-01-first-time-onboarding.md#L123-L127, ux-design-specification.md#L2568-L2602 反馈模式成功提示, ux-design-specification.md#L2695-L2699 设置对话框取消/保存按钮, ux-design-specification.md#L2597 反馈模式默认 5s 自动消失, ux-design-specification.md#L2698 设置对话框三按钮取消/应用/保存]

7. **AC7 - `useSettingsStore` 独立与持久化**: 创建 `frontend/src/stores/settings.ts`（Pinia Setup Store 语法，与 1-2 `ui.ts` / 1-3 `crawl.ts` 风格一致），导出 `useSettingsStore`：state `{ themePreference: 'light' | 'dark'; languagePreference: 'zh-CN' | 'en'; notificationPreference: { enabled: boolean; onComplete: boolean; onFailure: boolean } }` + actions `setTheme(value)` / `setLanguage(value)` / `setNotificationPreference(partial)` / `resetToDefaults()`；通过 `pinia-plugin-persistedstate`（1-2 已安装 ^3.2.3）持久化全部三个字段，key `ai-crawler:settings-preferences`，storage `localStorage`，`pick: ['themePreference', 'languagePreference', 'notificationPreference']`；与 `useUiStore`（view 偏好）和 `useCrawlStore`（历史）解耦，禁止导入这两个 store；**禁止**在 store 内调用任何 API（包括 Electron IPC / Web Notifications API — 业务逻辑放组件 / composable，store 仅状态容器）。 [Source: architecture.md#L188 Pinia stores 视图分离, architecture.md#L191 用户偏好 LocalStorage, 1-2-simple-view-url-input.md#L24 AC10 & Task 4.3 边界声明 useSettingsStore 解耦, 1-3-task-management-history.md#L563 边界声明]

8. **AC8 - 桌面通知成功路径**: 当 `useSettingsStore().notificationPreference.enabled === true && onComplete === true` 时，SimpleView `runCrawl` 成功路径（`setStatus('completed')` 后）触发桌面通知：调用 `useNotifications()` composable 的 `notify(title, options)`，title "爬取完成"，body "{pageTitle} · 共 {N} 条数据"（王芳 persona 文案），tag 使用 `record.id` 避免重复通知堆叠；通知点击触发 `onNotifyClick(record.id)` → `crawlStore.setActiveTask(id)` + 打开详情抽屉（复用 1-3 `TaskDetailDrawer` 已有逻辑）；若用户系统未授予通知权限，调用 `Notification.requestPermission()` 后再触发；若用户拒绝权限则静默降级（不显示通知不报错），同时在抽屉中"通知"分组内显示 `n-alert` type="warning" 文案"系统已拒绝通知权限，请在操作系统设置中允许此应用发送通知"；若当前环境不支持 Notification API（`useNotifications().isSupported === false`，`permission === 'unsupported'`）则展示另一文案 `n-alert` type="warning" "当前环境不支持桌面通知，请在桌面应用中开启"，且 `n-switch` 桌面通知开关 disabled 避免用户开启后无效果。 [Source: epic-01-first-time-onboarding.md#L129-L133, prd.md#L1529 FR37, ux-design-specification.md#L2568-L2602 反馈模式, 1-3-task-management-history.md#L62-L70 TaskDetailDrawer 复用]

9. **AC9 - 错误通知与重试按钮**: 当 `notificationPreference.enabled === true && onFailure === true` 时，SimpleView `runCrawl` 失败路径（catch 块 `setStatus('failed')` 后）触发桌面通知：title "爬取失败"，body "{错误原因摘要}，点击查看详情"；通知点击同样打开详情抽屉；同时在主视图内通过 `n-notification`（复用 App.vue 已挂载的 `n-notification-provider`）弹出 type="error" 通知卡片，duration 0（不自动消失），含"重试"按钮（点击触发 `onRetry` 复用 1-2 已有逻辑）+ "关闭"按钮；错误原因摘要从 `err.message` 提取前 80 字符，截断加"…"；若 `err` 为 `DOMException && err.name === 'AbortError'`（用户主动取消）则不触发失败通知（与 1-2 既有逻辑一致避免回归）；用户选择"重试"后通知卡片自动关闭。 [Source: epic-01-first-time-onboarding.md#L135-L139, prd.md#L1529 FR37, ux-design-specification.md#L2568-L2602 错误反馈模式, ux-design-specification.md#L2741 aria-live, 1-2-simple-view-url-input.md#L95-L116 runCrawl 失败路径, frontend/src/views/SimpleView.vue#L200-L209 catch 逻辑]

10. **AC10 - 可访问性**: 所有设置抽屉控件提供 `aria-label`；开关使用 `n-switch` 内置 `aria-pressed`，但额外在 label 处绑定 `aria-describedby` 指向描述文本；错误通知使用 `role="alert"` + `aria-live="assertive"`（`n-notification` type="error" 内置，本 story 显式设置覆盖）；成功 toast `role="status"` + `aria-live="polite"`（`n-message` 内置）；桌面通知点击跳转后的抽屉焦点管理沿用 1-3 `TaskDetailDrawer` 已有行为（`n-drawer` 内置 focus trap），本 story 不重复实现；对比度 WCAG 2.1 AA（深色模式由 Naive UI 内置保证）；键盘导航 Tab 顺序按视觉顺序（抽屉内 → 保存 → 取消），按 `Esc` 关闭抽屉。 [Source: ux-design-specification.md#L2555-L2559, ux-design-specification.md#L2741 accessibility, ux-design-specification.md#L2637 焦点状态, prd.md#L1820-L1827 NFR37 WCAG 2.1 AA]

11. **AC11 - 王芳 persona 文案**: 所有用户可见文案延续 1-1 / 1-2 / 1-3 王芳 persona 规范 —— 设置项标签："外观"、"主题"、"语言"、"通知"、"桌面通知"、"爬取完成时通知"、"爬取失败时通知"、"关于"、"应用版本"、"隐私声明"；按钮："保存"、"取消"、"重试"、"关闭"；toast："设置已保存"；桌面通知："爬取完成"、"爬取失败"、"{pageTitle} · 共 {N} 条数据"、"点击查看详情"；n-alert 警告："系统已拒绝通知权限，请在操作系统设置中允许此应用发送通知"；禁止 "Settings" / "Theme" / "Language" / "Save" / "Retry" / "Crawl Complete" / "Crawl Failed" 等英文技术口吻；时间格式延续 1-3 `useRelativeTime` 不在抽屉内重复展示时间字段避免冗余。 [Source: prd.md#L1406-L1424 王芳 persona, 1-1-desktop-app-install-launch.md#L359-L377, 1-2-simple-view-url-input.md#L336-L358, 1-3-task-management-history.md#L567 AC9 王芳文案指导]

12. **AC12 - 与 Story 1.1/1.2/1.3 无回归**: 本 story 修改 `frontend/src/App.vue`（接通 `useSettingsStore().themePreference` → `n-config-provider :theme`）+ 新增 `frontend/src/stores/settings.ts` + 新增 `frontend/src/components/SettingsDrawer.vue` + 新增 `frontend/src/composables/useNotifications.ts` + 修改 `frontend/src/views/SimpleView.vue`（设置按钮 + 抽屉控制 + 通知触发逻辑）；不修改 1-1 已通过测试（`tests/components/FirstTimeWizard.test.ts` / `tests/components/WelcomePage.test.ts` / `tests/components/PrivacyConsent.test.ts` / `tests/components/SmartURLInput.test.ts` 复用部分）、1-2 已通过的 11 个 SimpleView 测试断言（"还没有爬取历史" / "立即开始爬取" / "请先粘贴网址" / "网址格式不正确" / 视图切换触发 store 更新等）、1-3 已通过的历史卡片 / 删除撤销 / TaskDetailDrawer 测试；不修改 `useUiStore` / `useCrawlStore` 接口；App.vue 改造仅替换 `theme` ref 为 `useSettingsStore().themePreference === 'dark' ? darkTheme : null` computed，不引入新 provider 嵌套（`n-notification-provider` 已挂载）。 [Source: 1-1-desktop-app-install-launch.md#L463-L502, 1-2-simple-view-url-input.md#L429-L445, 1-3-task-management-history.md#L598-L620, frontend/src/App.vue#L1-L24, project-context.md#L178-L200 测试规范]

13. **AC13 - Epic 7 全局撤销/重做的交付边界**: 故事 1.4 不实现全局撤销/重做架构（NFR 中的 FR135 撤销最近配置更改）；本 story 的"取消"按钮仅放弃当前抽屉内未保存的修改，不进入任何 undo 栈；"保存"按钮保存后无法通过 Story 1.4 的"撤销"按钮回滚到上一个保存状态（即使错误地保存了主题切换也无法立即撤销）；该能力由 Epic 7 Stories 7-1 (`4-1-config-undo`) / 7-2 / 7-3 交付，本 story 在抽屉中 **不**预留任何"撤销上次修改"按钮占位（避免与 Epic 7 接口冲突）；epic-01 中 FR135 列入本 story 仅因 1.4 是 Epic 1 末尾 story 并贡献"设置"概念，真实 FR135 撤销实现属于 Epic 7（与 1-3 Story 边界声明"30 天回收站由 Epic 7 交付"模式一致）。 [Source: epic-01-first-time-onboarding.md#L141, epic-07-undo-redo-recovery.md, 1-3-task-management-history.md#L562 Epic 7 边界声明模式]

14. **AC14 - 单元/组件测试覆盖**: 新增以下测试文件 + 扩展既有 SimpleView 测试，覆盖所有 8 项 settings store / 10 项 SettingsDrawer 组件 / 7 项 useNotifications composable / 6 项 SimpleView 通知触发分支；具体测试用例清单：

   **`frontend/tests/stores/settings.test.ts`（≥8 测试）**：
   - 默认值断言：`themePreference === 'light'` / `languagePreference === 'zh-CN'` / `notificationPreference === { enabled: true, onComplete: false, onFailure: true }`
   - `setTheme('dark')` 正常更新；`setTheme('invalid' as any)` 静默兜底为 `'light'`
   - `setLanguage('en')` 正常更新；`setLanguage('invalid' as any)` 兜底为 `'zh-CN'`
   - `setNotificationPreference({ onComplete: true })` 浅合并保留 `enabled` / `onFailure` 原值
   - `resetToDefaults()` 恢复三个字段初值
   - persist 写入：调用 `setTheme('dark')` 后 `localStorage.getItem('ai-crawler:settings-preferences')` 含 `"themePreference":"dark"`
   - persist 读取：构造 store 前预先 `localStorage.setItem('ai-crawler:settings-preferences', JSON.stringify({ themePreference: 'dark', languagePreference: 'zh-CN', notificationPreference: { enabled: false, onComplete: true, onFailure: false } }))`，新 store 初始值与 stub 一致
   - theme 无效持久化数据兜底：localStorage 含 `"themePreference":"purple"` 时初始化 `themePreference === 'light'`（防御腐蚀）

   **`frontend/tests/components/SettingsDrawer.test.ts`（≥10 测试）**：
   - 渲染三组分组（外观 / 通知 / 关于）的 label 文本
   - 主题切换 `n-radio-group` 触发 `localTheme` 更新（不应直接写 store，应在 `保存` 时才写）
   - 语言 `English` 单选项 `disabled` 属性 + `title="即将推出"` tooltip
   - 通知总开关 `n-switch` 关闭时 `n-checkbox-group` 的 `disabled` 属性联动
   - 保存按钮在本地草稿 == store 当前值时 `disabled`（无修改）
   - 保存按钮点击触发 store 写入 + 抽屉关闭 + `message.success('设置已保存')` 调用
   - 取消按钮点击不触发 store 写入 + 抽屉关闭
   - `Esc` 键行为等同取消
   - `Ctrl/Cmd + ,` 全局快捷键打开抽屉（由 SimpleView 测试覆盖此项可不重复，但若 mount 独立 SettingsDrawer 可省略此条由 SimpleView 测试覆盖）
   - 错误权限警告：`permission === 'denied'` 时 `n-alert` warning "系统已拒绝通知权限..." 条件渲染；`permission === 'unsupported'` 时另一文案 "当前环境不支持桌面通知..." 条件渲染；`permission === 'granted'` 时不渲染 alert

   **`frontend/tests/composables/useNotifications.test.ts`（≥7 测试）**：
   - `notify` 调用 `Notification` 构造器（断言 `mockNotification` 被 calledWith title + options）
   - `requestPermission` granted 路径：`mockNotification.requestPermission.mockResolvedValue('granted')` 后 `await requestPermission()` 返回 `'granted'` + `permission.value === 'granted'`
   - `requestPermission` denied 路径：`mockNotification.requestPermission.mockResolvedValue('denied')` 后返回 `'denied'` + `permission.value === 'denied'`
   - `permission` ref 在 `onMounted` 同步 `Notification.permission` 初始值
   - `notify(options)` `onClick` 回调注册到 `n.onclick` 后调用触发传入的 `onClick(tag)`
   - 不支持 Notification API 的环境降级（`isSupported === false`）`requestPermission` 返回 `'unsupported'`
   - `permission !== 'granted'` 时 `notify()` 直接返回 `null` 不调用构造器

   **扩展 `frontend/tests/components/SimpleView.test.ts`（≥6 测试）**：
   - 设置图标按钮点击调用 `openSettings()` → `settingsDrawerShow === true`
   - `Ctrl/Cmd + ,` 全局快捷键触发 `settingsDrawerShow === true`
   - 爬取成功路径（`runCrawl` resolve 后）且 `notificationPreference.enabled && onComplete` 触发 `notifyDesktop('爬取完成', ...)` 调用
   - 爬取失败路径（`runCrawl` catch 块）且 `notificationPreference.enabled && onFailure` 触发 `notifyDesktop('爬取失败', ...)` + `naiveNotification.error` 调用
   - `notificationPreference.enabled === false` 时无论成功 / 失败均不触发桌面通知（断言 `mockNotification` 未被 called）
   - 桌面通知 `onClick(tag)` 回调调用 `crawlStore.setActiveTask(tag)` + `drawerShow === true`（详情抽屉打开）

   扩展 `App.vue` 间接测试（通过 mount SimpleView 验证深色主题渲染，无需单独 App.test.ts）；mock `Notification` 全局对象在 `tests/setup.ts` 中通过 `vi.stubGlobal('Notification', mockNotification)` 在 `beforeEach` 内注册（详见 Task 6.1）提供测试桩避免污染其他测试；覆盖率目标新增文件 ≥85% 行覆盖；不增加 E2E 测试（通知 E2E 由 Epic 2 + Playwright 通知权限授权流程覆盖）。 [Source: project-context.md#L178-L200 测试规范, 1-3-task-management-history.md#L569-L574 mock crypto.randomUUID 模式应用, 1-2-simple-view-url-input.md#L27 AC14 测试基线, frontend/tests/setup.ts]

## Tasks / Subtasks

- [x] **Task 1 — `useSettingsStore` 创建与持久化 (AC: 3, 4, 5, 7)**
  - [x] 1.1 创建 `frontend/src/stores/settings.ts`：Setup Store 语法，`defineStore('settings', () => {...}, { persist: { key: 'ai-crawler:settings-preferences', storage: localStorage, pick: ['themePreference', 'languagePreference', 'notificationPreference'] } })`
  - [x] 1.2 State：`const themePreference = ref<'light' | 'dark'>('light')` + `const languagePreference = ref<'zh-CN' | 'en'>('zh-CN')` + `const notificationPreference = ref<{ enabled: boolean; onComplete: boolean; onFailure: boolean }>({ enabled: true, onComplete: false, onFailure: true })`
  - [x] 1.3 Actions：
    - `setTheme(value: 'light' | 'dark')`：若 `value !== 'light' && value !== 'dark'` 则静默兜底为 `'light'`（防御 NaN / 持久化数据腐蚀），否则赋值
    - `setLanguage(value: 'zh-CN' | 'en')`：同上兜底为 `'zh-CN'`
    - `setNotificationPreference(partial: Partial<typeof notificationPreference.value>)`：`notificationPreference.value = { ...notificationPreference.value, ...partial }`（浅合并避免丢失字段）
    - `resetToDefaults()`：恢复三个字段到 1.2 的初值（便于后续"恢复默认"按钮接入，本 story 抽屉不展示该按钮但 store 预留）
  - [x] 1.4 **禁止**导入 `useUiStore` / `useCrawlStore` / `useOnboardingStore`（避免循环依赖）
  - [x] 1.5 **禁止**在 store 内调用 `Notification.requestPermission()` / `window.localStorage.setItem()` 手动写入（persist 插件自动处理）/ Electron IPC（业务逻辑放组件 / composable）
  - [x] 1.6 类型导出：`export type ThemePreference = 'light' | 'dark';` + `export type LanguagePreference = 'zh-CN' | 'en';` + `export interface NotificationPreference { enabled: boolean; onComplete: boolean; onFailure: boolean; }`（便于组件 + 测试共享类型）

- [x] **Task 2 — `useNotifications` composable 实现 (AC: 8, 9, 14)**
  - [x] 2.1 创建 `frontend/src/composables/useNotifications.ts`：导出 `useNotifications()` 返回 `{ notify, requestPermission, permission, isSupported }`
  - [x] 2.2 `isSupported = computed(() => typeof window !== 'undefined' && 'Notification' in window)`（jsdom 环境默认无 Notification，由测试 setup.ts stub 注入）
  - [x] 2.3 `permission = ref<NotificationPermission | 'unsupported'>('default')`；composable 内 `onMounted` 时若 `isSupported.value` 则 `permission.value = Notification.permission`，否则 `permission.value = 'unsupported'`（`'unsupported'` 是项目自定义哨兵值，扩展类型联合以覆盖 jsdom / 非 Electron renderer 等无 Notification API 的环境；`NotificationPermission` 原生类型仅 `'default' | 'granted' | 'denied'` 不包含 `'unsupported'`）
  - [x] 2.4 `async function requestPermission(): Promise<NotificationPermission | 'unsupported'>`：若 `!isSupported.value` 返回 `'unsupported'`；若 `permission.value === 'granted'` 直接返回；若 `permission.value === 'denied'` 直接返回（不重复请求避免骚扰）；否则 `const result = await Notification.requestPermission(); permission.value = result; return result;`（返回类型与 `permission` ref 类型联合保持一致）
  - [x] 2.5 `function notify(title: string, options?: NotificationOptions & { onClick?: (id: string) => void; tag?: string }): Notification | null`：若 `!isSupported.value || permission.value !== 'granted'` 返回 `null`；`const n = new Notification(title, { body: options?.body, tag: options?.tag, icon: options?.icon }); if (options?.onClick && options.tag) n.onclick = () => options.onClick!(options.tag!); return n;`
  - [x] 2.6 **禁止**在 composable 内直接调用 `useSettingsStore`（保持可独立单元测试）；调用方在 SimpleView 内根据 `notificationPreference.enabled` 与场景切换决定是否调用 `notify`
  - [x] 2.7 可访问性：`notify` 不依赖 `n-notification`（桌面通知是 OS 级别窗口，非应用内 ARIA 范围）；应用内错误通知卡片由 SimpleView 直接使用 `useNotification()` from `naive-ui`（App.vue 已挂 `n-notification-provider`），不走 `useNotifications` composable
  - [x] 2.8 清理：composable 不持有任何 setTimeout / event listener 需要清理；`onBeforeUnmount` 无操作

- [x] **Task 3 — `SettingsDrawer` 组件实现 (AC: 1, 2, 6, 10, 11)**
  - [x] 3.1 创建 `frontend/src/components/SettingsDrawer.vue`（按 architecture.md#L1699 直接在 `components/` 根；不在 `simple/` 子目录因设置不属于简洁视图特有，后续仪表板/专业视图同样可用）
  - [x] 3.2 Props：`{ show: boolean }` + Emits：`['update:show']`；内部 `const settingsStore = useSettingsStore();` `const message = useMessage();`（`NMessageProvider` 在祖先 App.vue 已挂载）
  - [x] 3.3 模板：`<n-drawer :show="show" @update:show="emit('update:show', $event)" placement="right" :width="480" :auto-focus="true">` + `<n-drawer-content title="界面设置" closable>`
  - [x] 3.4 内容区分组：
    - 外观分组：`<n-form label-placement="left" label-width="80">` + `<n-form-item label="主题">` `<n-radio-group v-model:value="localTheme">` `<n-radio value="light">浅色</n-radio>` `<n-radio value="dark">深色</n-radio>` + `<n-form-item label="语言">` `<n-radio-group v-model:value="localLanguage">` `<n-radio value="zh-CN">简体中文</n-radio>` `<n-radio value="en" disabled>English</n-radio>` （HTML `title="即将推出"` 原生 tooltip 避免引入 `n-tooltip`）
    - 通知分组：`<n-form-item label="桌面通知">` `<n-switch v-model:value="localNotification.enabled" />` + `<n-form-item label="触发场景">` `<n-checkbox-group v-model:value="localScenes" :disabled="!localNotification.enabled">` `<n-checkbox value="onComplete">爬取完成</n-checkbox>` `<n-checkbox value="onFailure">爬取失败</n-checkbox>`；当 `localNotification.enabled && localScenes.length === 0` 时显示 `<n-text type="warning">请至少选择一个通知场景，否则不会显示通知</n-text>`
    - 通知权限警告：若 `permission === 'denied'` 显示 `<n-alert type="warning" :show-icon="true">系统已拒绝通知权限，请在操作系统设置中允许此应用发送通知</n-alert>`；若 `permission === 'unsupported'` 显示 `<n-alert type="warning" :show-icon="true">当前环境不支持桌面通知，请在桌面应用中开启</n-alert>`（区分 OS 拒绝 vs 平台不支持，文案不同避免用户误判）
    - 关于分组：`<n-form-item label="应用版本">` `<n-text>{{ appVersion }}</n-text>`（从 `package.json` 注入或硬编码 `1.0.0` Phase 1）+ `<n-form-item label="隐私声明">` `<n-button text type="primary" @click="openPrivacy">查看隐私声明</n-button>`（复用 1-1 `PrivacyConsent` 弹窗 — 通过 emit `open-privacy` 让父组件触发 1-1 已有逻辑，避免在本组件直接挂载 1-1 弹窗造成重复实例）
  - [x] 3.5 本地草稿 state：`const localTheme = ref(settingsStore.themePreference)` + `localLanguage` + `localNotification` + `localScenes`（数组派生：根据 `onComplete`/`onFailure` 双向映射）；抽屉打开时 `watch(() => props.show, (v) => { if (v) { /* 重置本地草稿为 store 当前值 */ } })` 确保每次打开抽屉草稿与 store 同步（避免上次未保存修改残留）
  - [x] 3.6 底部按钮：`<n-button type="primary" :disabled="!isDirty" @click="onSave">保存</n-button>` + `<n-button @click="onCancel">取消</n-button>`；`isDirty` computed 比较 local vs store 4 个字段
  - [x] 3.7 `onSave()`：`settingsStore.setTheme(localTheme.value)` + `settingsStore.setLanguage(localLanguage.value)` + `settingsStore.setNotificationPreference({ enabled: localNotification.value.enabled, onComplete: localScenes.value.includes('onComplete'), onFailure: localScenes.value.includes('onFailure') })` → `emit('update:show', false)` → `nextTick(() => message.success('设置已保存', { duration: 2000 }))`（nextTick 确保抽屉关闭动画后再弹 toast 避免视觉冲突）
  - [x] 3.8 `onCancel()`：`emit('update:show', false)` 不写 store；按 `Esc` 由 `n-drawer` 内置关闭触发 `update:show=false`，等价于 cancel
  - [x] 3.9 `openPrivacy()`：`emit('open-privacy')` 让父组件 SimpleView 控制隐私弹窗实例（避免在抽屉内挂载 1-1 组件重复实例化）
  - [x] 3.10 键盘：抽屉内 `<n-drawer>` `@keydown.s.ctrl.prevent="onSave"` + `@keydown.esc.prevent` 由 `n-drawer` 内置；按 `Ctrl/Cmd+S` 不弹浏览器保存对话框
  - [x] 3.11 可访问性：每个 `n-form-item` 的 label 关联控件由 Naive UI 内置 `for` 提供；`n-switch` 添加 `aria-label="桌面通知开关"`；`n-radio-group` 添加 `aria-label="主题选择"` / `"语言选择"`；`n-checkbox-group` 添加 `aria-label="通知触发场景"`
  - [x] 3.12 王芳文案：所有 label 与按钮文案严格按 AC11 列表；不引入 "Theme" / "Dark mode" / "Notifications" 英文术语

- [x] **Task 4 — `App.vue` 主题绑定改造 (AC: 3, 12)**
  - [x] 4.1 修改 [frontend/src/App.vue#L1-L24](frontend/src/App.vue#L1-L24)：
    - 删除 `const theme = ref<GlobalTheme | null>(null);`（根级 ref）
    - 新增 `import { useSettingsStore } from '@/stores/settings';` + `import { storeToRefs } from 'pinia';` + `const settingsStore = useSettingsStore();` + `const { themePreference } = storeToRefs(settingsStore);`
    - `const theme = computed<GlobalTheme | null>(() => themePreference.value === 'dark' ? darkTheme : null);`
    - 模板不变 `<n-config-provider :locale="zhCN" :theme="theme">` — `theme` 现为 computed ref，Vue 自动解包
  - [x] 4.2 **保留**1-1 / 1-2 已挂载的 `NMessageProvider` 与 `NNotificationProvider`（避免破坏 1-2 / 1-3 测试）
  - [x] 4.3 **保留**`useStartupTelemetry` 调用不变（1-1 启动埋点逻辑）
  - [x] 4.4 **保留**`onMounted` 内 `reportStartupTime(t2)` 逻辑不变
  - [x] 4.5 注意：Pinia 必须在 App.vue setup 之前已 `app.use(pinia)` — 此约定在 [frontend/src/main.ts](frontend/src/main.ts) 已由 1-1 交付（`createApp(App).use(pinia).use(router).mount('#app')`），App.vue 内 `useSettingsStore()` 安全可调用

- [x] **Task 5 — `SimpleView` 接入设置按钮与通知触发 (AC: 1, 6, 8, 9, 12)**
  - [x] 5.0 **Naive UI 2.38 `useNotification().error` `action` API 签名验证（dev 第一阶段，先于 5.1-5.10 实现）** — 用 context7 MCP 工具（`mcp__context7__resolve-library-id` libraryName="Naive UI" query="useNotification error action API signature v2.38" → 选 Source Reputation High 的 Naive UI 官方库 id → `mcp__context7__query-docs` libraryId + query "useNotification error method action option VNode function arity"）验证两点：(a) `useNotification().error({ ..., action })` 的 `action` 字段是否接受 `() => VNode` 函数式（按 Naive UI 2.38 行为常见于函数式）还是 `VNode` 字面值；(b) 单 `action` 选项是否支持返回包裹多按钮的 `<span>` 或必须返回单根 VNode；记录结论到 `deferred-work.md` 旁注或本 story 完成时填入 `Dev Agent Record.Debug Log References`；若 Naive UI 2.38 `n-notification` `action` 不支持函数式也不支持多按钮则降级方案：改用 `meta` 字段单行提示 + 单 `action` VNode 单按钮"重试"+ onClose 触发关闭（与 [feedback_naive_ui_2_38_message_no_action.md](memory/feedback_naive_ui_2_38_message_no_action.md) 已知 `n-message` `action` 不支持的降级模式一致）；**未完成此 5.0 不得进入 5.7 实现 `naiveNotification.error({ action: ... })`**
  - [x] 5.1 修改 [frontend/src/views/SimpleView.vue](frontend/src/views/SimpleView.vue) template：
    - 在 `simple-view__footer` 内 `ViewSwitcher` 旁新增 `<n-button quaternary circle aria-label="打开设置" @click="openSettings"><template #icon><n-icon><SettingsOutline /></n-icon></template></n-button>`（`SettingsOutline` from `@vicons/ionicons5`，与 1-2 已用 `GlobeOutline` 同包）
    - 视图根末尾新增 `<SettingsDrawer v-model:show="settingsDrawerShow" @open-privacy="openPrivacy" />`
    - 视图根或 `App.vue` 已挂的隐私弹窗实例需可触发 — 若 1-1 隐私弹窗挂载点在 App.vue（而非 SimpleView），则 `openPrivacy` 通过 emit `open-privacy` event 向上冒泡至 App.vue 处理；若 1-1 隐私弹窗仍在 SimpleView 内则直接 `privacyShow.value = true`；dev 第一阶段读 1-1 `PrivacyConsent` 挂载点确认
  - [x] 5.2 script 引入：
    - `import { useSettingsStore } from '@/stores/settings';` + `import { useNotifications } from '@/composables/useNotifications';` + `import { useNotification as useNaiveNotification } from 'naive-ui';`（区分：`useNotifications` 是项目 composable，`useNotification` 是 Naive UI 应用内通知）
    - `import SettingsDrawer from '@/components/SettingsDrawer.vue';`
    - `import { SettingsOutline } from '@vicons/ionicons5';`
  - [x] 5.3 新增 state：`const settingsStore = useSettingsStore();` + `const settingsDrawerShow = ref(false);` + `const { notify: notifyDesktop, requestPermission, permission: notificationPermission } = useNotifications();` + `const naiveNotification = useNotification();`
  - [x] 5.4 `openSettings()`：`settingsDrawerShow.value = true`
  - [x] 5.5 全局快捷键 `Ctrl/Cmd + ,`：在 `onMounted` 内 `window.addEventListener('keydown', onKeyDownGlobal)` — `function onKeyDownGlobal(e: KeyboardEvent) { if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); settingsDrawerShow.value = true; } }`；`onBeforeUnmount` 内 `window.removeEventListener('keydown', onKeyDownGlobal)`
  - [x] 5.6 修改 `runCrawl` 成功路径（[frontend/src/views/SimpleView.vue#L196-L199](frontend/src/views/SimpleView.vue#L196-L199) `setStatus('completed')` 后、`crawlStore.addTask(record)` 后）新增；**关键：复用 1-3 已在 [SimpleView.vue#L129](frontend/src/views/SimpleView.vue#L129) 声明的 `drawerShow` ref，不要再新声明同名 ref 或 `activeTaskDrawerShow`/`detailDrawerShow` 等替代 ref**（若新声明会导致 1-3 `TaskDetailDrawer` v-model:show 绑定失联 + 详情抽屉复用回归）；下方代码块内 `drawerShow.value = true` 即直接赋值既有 ref：
    ```typescript
    if (settingsStore.notificationPreference.enabled && settingsStore.notificationPreference.onComplete) {
      void (async () => {
        if (permission.value !== 'granted') await requestPermission();
        if (permission.value === 'granted') {
          notifyDesktop('爬取完成', {
            body: `${record.pageTitle} · 共 ${record.extractedCount} 条数据`,
            tag: record.id,
            onClick: (id: string) => { crawlStore.setActiveTask(id); drawerShow.value = true; }
          });
        }
      })();
    }
    ```
  - [x] 5.7 修改 `runCrawl` 失败路径（[frontend/src/views/SimpleView.vue#L200-L209](frontend/src/views/SimpleView.vue#L200-L209) catch 块内 `setStatus('failed')` 后、`crawlStore.addTask(failedRecord)` 后）新增：
    ```typescript
    if (err instanceof DOMException && err.name === 'AbortError') {
      // 用户主动取消，不触发失败通知 — 沿用 1-2 既有逻辑
    } else if (settingsStore.notificationPreference.enabled && settingsStore.notificationPreference.onFailure) {
      const errSummary = (err instanceof Error ? err.message : String(err)).slice(0, 80) + '…';
      void (async () => {
        if (permission.value !== 'granted') await requestPermission();
        if (permission.value === 'granted') {
          notifyDesktop('爬取失败', {
            body: `${errSummary}，点击查看详情`,
            tag: failedRecord.id,
            onClick: (id: string) => { crawlStore.setActiveTask(id); drawerShow.value = true; }
          });
        }
      })();
      naiveNotification.error({
        title: '爬取失败',
        content: errSummary,
        duration: 0,
        meta: '点击重试或关闭',
        onClose: () => {},
        action: () => h('span', { style: 'display: flex; gap: 8px;' }, [
          h(NButton, { size: 'small', type: 'primary', onClick: () => { onRetry(); /* 关闭通知由 Naive UI 内部触发 */ } }, { default: () => '重试' }),
          h(NButton, { size: 'small', onClick: () => {} }, { default: () => '关闭' })
        ])
      });
    }
    ```
    - 若 1-2 / 1-3 已用 `useMessage` 引入 `h` 与 `NButton`，则直接复用；否则新增 import
    - Naive UI 2.38 `n-notification` `action` 选项支持函数返回 VNode（dev 阶段用 context7 MCP 验证 Naive UI 2.38 `n-notification` `action` API；若不支持则降级到 `meta` + 单按钮 `action`）
  - [x] 5.8 `openPrivacy()`：若 1-1 `PrivacyConsent` 挂载点在 App.vue 则 emit `open-privacy` 事件至 App.vue（需在 SimpleView emits 中声明）；若在 SimpleView 内则直接触发本地 ref；dev 第一阶段读 1-1 隐私弹窗挂载点后决定
  - [x] 5.9 **禁止**修改 1-2 / 1-3 已通过测试的关键逻辑：`onSubmit` / `onRetry` / `onStartHistory` / `onViewChange` / `validateUrl` / `runCrawl` 的 analyze→getCrawlProgress→crawl 顺序（仅在 success / failure 路径末尾追加通知触发）；`pendingUndos` 撤销逻辑不动；`crawlStore.startTick` / `stopTick` 不动
  - [x] 5.10 **保留**1-2 / 1-3 已通过的 11 + 5 + ... 个测试断言不动；新增测试 ≥6 个覆盖设置抽屉与通知触发

- [x] **Task 6 — 测试桩扩展 (AC: 14)**
  - [x] 6.1 修改 [frontend/tests/setup.ts](frontend/tests/setup.ts) 新增 Notification 全局桩 — 关键：[tests/setup.ts#L36-L38](frontend/tests/setup.ts) 已存在的 `afterEach(() => vi.unstubAllGlobals())` 会清除所有 `vi.stubGlobal` 注册的桩，故 `Notification` 桩**必须**在 `beforeEach` 内注册（不能在文件顶层只注册一次），使其在每个测试用例前重新生效；模式如下：
    ```typescript
    // 文件顶层声明 mock（不调用 stubGlobal，让 beforeEach 反复注册）
    const mockNotification = vi.fn().mockImplementation((title: string, options?: NotificationOptions) => ({
      title,
      body: options?.body ?? '',
      tag: options?.tag ?? '',
      onclick: null as null | (() => void),
      close: vi.fn()
    }));
    mockNotification.permission = 'default';
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');

    beforeEach(() => {
      const cryptoStub = {
        randomUUID: () => 'mock-uuid-' + Math.random().toString(36).slice(2, 10)
      };
      vi.stubGlobal('crypto', cryptoStub);
      // 关键：Notification 桩在 beforeEach 内注册，next test afterEach 调用
      // vi.unstubAllGlobals() 会清除它，但 beforeEach 再次注册保证每个用例都有干净的桩
      vi.stubGlobal('Notification', mockNotification);
    });
    ```
  - [x] 6.2 每个测试用例若需重置 mock 调用历史，在测试文件本地 `beforeEach` 内 `mockNotification.mockClear()` + `mockNotification.permission = 'default'` + `mockNotification.requestPermission.mockResolvedValue('granted')` 避免跨用例污染（不在 `setup.ts` 顶层做，因 `mockClear` 是 per-suite 行为不应放在全局 setup）
  - [x] 6.3 保留 1-3 已有的 `crypto.randomUUID` stub（[1-3-task-management-history.md#L573](1-3-task-management-history.md#L573)）不动
  - [x] 6.4 保留 1-2 已有的 `pinia-plugin-persistedstate` flush 模式（createApp({}).use(pinia) + 10ms macrotask）不动；新增 `settings.test.ts` 同模式
  - [x] 6.5 验证 `Notification` 桩不在 jsdom 真实触发（mock 函数仅记录调用不弹 OS 通知）

- [x] **Task 7 — 文档与交叉引用 (AC: 7, 12, 13)**
  - [x] 7.1 在本 story 文件末尾的 `Dev Agent Record` 块填入实施过程中的实际文件清单（dev 完成后填写）
  - [x] 7.2 在 `_bmad-output/implementation-artifacts/deferred-work.md` 不新增任何与 1.4 相关的延期项（本 story 范围内不产生延期；FR135 / Epic 7 边界已声明）
  - [x] 7.3 不修改 `_bmad-output/planning-artifacts/epic-01-first-time-onboarding.md`（epic 规范权威）
  - [x] 7.4 不修改 `_bmad-output/planning-artifacts/architecture.md` / `prd.md` / `ux-design-specification.md`（架构权威）
  - [x] 7.5 不修改 `1-1-desktop-app-install-launch.md` / `1-2-simple-view-url-input.md` / `1-3-task-management-history.md`（既有 story 文件权威，本 story 仅引用不修改）

### Review Findings

> 审查模式：subagent 三层（Blind/Edge/Auditor）全部 429 配额失败，改由主会话 inline 三层审查代替（2026-08-16）。

- [x] [Review][Decision] `tests/setup.ts` 孤儿文件 - `frontend/vitest.config.ts:18` setupFiles 仅含 `tests/setup-notification.ts`，`tests/setup.ts`（JSDOM polyfill / crypto stub / canvas-confetti mock）不再被加载；当前 149/149 绿说明内容多冗余，但 canvas-confetti mock 丢失对未来测试是隐患。选项：恢复双 setupFiles / 删除 setup.ts / 保留现状 defer
- [x] [Review][Patch] Ctrl+S 抽屉内保存快捷键失效（违反 AC6）- SettingsDrawer.vue `onKeydownS` + `defineExpose` 无任何调用方，SimpleView `onKeyDownGlobal` 仅处理 `Ctrl+,`；spec 明确要求"避免浏览器默认保存网页对话框弹出"，当前浏览器保存对话框仍会弹出 [frontend/src/views/SimpleView.vue:347-352, frontend/src/components/SettingsDrawer.vue:186-192]
- [x] [Review][Patch] theme 腐蚀持久化数据兜底缺失（违反 AC14）- spec 要求 localStorage 含 `"themePreference":"purple"` 时 store 初始化即 `'light'`；现 `settings.test.ts` 仅验证 `setTheme` 归一化而非初始化值，且 store 无 hydration guard（pinia-plugin-persistedstate `afterHydrate` 未配置）[frontend/src/stores/settings.ts:88-930, frontend/tests/stores/settings.test.ts:118-133]
- [x] [Review][Patch] 复选框 label 文案不符 AC11（违反 Task 3.12 自声明）- 实现为"爬取完成"/"爬取失败"，AC11 规范文案为"爬取完成时通知"/"爬取失败时通知" [frontend/src/components/SettingsDrawer.vue:611-612]
- [x] [Review][Patch] `aria-describedby` 未实现（违反 AC10）- AC10 要求"在 label 处绑定 `aria-describedby` 指向描述文本"，SettingsDrawer 全文无任何 aria-describedby 绑定 [frontend/src/components/SettingsDrawer.vue]
- [x] [Review][Patch] `useNotifications` permission ref 实例分裂 - SimpleView 与 SettingsDrawer 各自调用 `useNotifications()` 产生独立 `permission` ref；SimpleView `requestPermission()` 更新自身 ref 后 drawer 的 ref 过期，n-alert 权限警告状态可能失真（drawer 仅在组件 mount 时同步一次）。修复：composable 内将 permission ref 提升为模块级共享 [frontend/src/composables/useNotifications.ts:20-27]
- [x] [Review][Patch] 通知触发 IIFE 未捕获异常（违反 AC8"静默降级不报错"）- `void (async () => {...})()` 中 `requestPermission()` reject 或 `new Notification()` 抛错会成为 unhandled rejection（console 报错），spec 要求"不显示通知不报错" [frontend/src/views/SimpleView.vue:217-229, 236-250]
- [x] [Review][Patch] `errSummary` 恒追加省略号（违反 AC9）- `(msg).slice(0, 80) + '…'` 在消息不足 80 字符时也追加 '…'；spec"截断加'…'"仅在发生截断时添加 [frontend/src/views/SimpleView.vue:234]

**已驳回（dismissed，3 项）**：notify 无 tag 时静默丢 onClick（当前所有调用方都传 tag）；duration 0 粘性通知堆叠（spec 明确要求 duration 0）；Ctrl+, 在输入框聚焦时触发（spec 要求全局快捷键）。

## Dev Notes

### 技术栈版本

- Vue `^3.4.38` — Composition API + `<script setup lang="ts">`
- Pinia `^2.2.0` + pinia-plugin-persistedstate `^3.2.3`（1-2 已安装）
- Naive UI `^2.38.0` — `n-drawer` / `n-form` / `n-radio` / `n-switch` / `n-checkbox` / `n-button` / `n-divider` / `n-alert` / `n-text` / `useNotification` / `useMessage` / `darkTheme` / `zhCN`
- `@vicons/ionicons5` — `SettingsOutline` 图标（与 1-2 `GlobeOutline` 同包，1-2 已安装）
- Electron `^28.3.3` — renderer 进程下 `Notification` 即 Web API（Electron renderer 默认支持；Electron 主进程通知回退由 Epic 11 交付，本 story 不引入主进程通知逻辑）
- Vitest `^2.0.5` + jsdom + `@vue/test-utils` `^2.4.5`

### 文件路径与命名规范

- store：[frontend/src/stores/settings.ts](frontend/src/stores/settings.ts)（`.ts` 非 `.js`，与 1-2 `ui.ts` / 1-3 `crawl.ts` 一致）
- 组件：[frontend/src/components/SettingsDrawer.vue](frontend/src/components/SettingsDrawer.vue)（直接位于 `components/` 根目录，非 `simple/` 子目录 — 设置是跨视图能力）
- composable：[frontend/src/composables/useNotifications.ts](frontend/src/composables/useNotifications.ts)（与 1-3 `useStatusTag.ts` 同目录规范）
- 类型：复用 1.4 store 内导出（`ThemePreference` / `LanguagePreference` / `NotificationPreference`），不新增 `types/settings.ts`
- 测试：
  - [frontend/tests/stores/settings.test.ts](frontend/tests/stores/settings.test.ts)
  - [frontend/tests/components/SettingsDrawer.test.ts](frontend/tests/components/SettingsDrawer.test.ts)
  - [frontend/tests/composables/useNotifications.test.ts](frontend/tests/composables/useNotifications.test.ts)
  - 扩展 [frontend/tests/components/SimpleView.test.ts](frontend/tests/components/SimpleView.test.ts) 新增 ≥6 测试

### Pinia Setup Store persist 模式

- 与 1-2 `useUiStore` / 1-3 `useCrawlStore` 完全一致：
  ```typescript
  export const useSettingsStore = defineStore(
    'settings',
    () => {
      // state + actions
      return { themePreference, languagePreference, notificationPreference, setTheme, setLanguage, setNotificationPreference, resetToDefaults };
    },
    {
      persist: {
        key: 'ai-crawler:settings-preferences',
        storage: localStorage,
        pick: ['themePreference', 'languagePreference', 'notificationPreference']
      }
    }
  );
  ```
- 默认值：`themePreference: 'light'`（与 1-1 已通过测试的浅色主题一致，避免首次加载闪烁）/ `languagePreference: 'zh-CN'` / `notificationPreference: { enabled: true, onComplete: false, onFailure: true }`（默认启用失败通知符合用户痛点 — 王芳最关心任务失败）
- `pick` 选项仅持久化指定字段；actions 不持久化（Setup Store 中 actions 是函数不参与序列化）

### Naive UI 组件 API 注意事项

- `n-radio-group` `v-model:value` 接受 string；本 story 主题 / 语言均为 string 字面类型
- `n-switch` 双向绑定 boolean；`n-switch` `:disabled` 选项由父联动控制子项
- `n-checkbox-group` `v-model:value` 是字符串数组（如 `['onComplete', 'onFailure']`）
- `n-drawer` `:show` + `@update:show` 双向绑定模式（与 1-3 `TaskDetailDrawer` 一致）
- `n-drawer-content` `closable` 默认显示右上角关闭按钮 + 触发 `update:show=false`
- `useNotification()` `error` 选项 `action` 字段在 Naive UI 2.38 支持 VNode 返回函数；dev 阶段先用 context7 MCP 验证再决定 VNode 函数式还是 VNode 字面式（与 1-3 `useMessage().info` `action` API 调研模式一致）
- `useMessage()` `success(content, { duration: 2000 })` — Naive UI 2.38 已确认不支持 `action` 字段（1-3 已踩坑：见 deferred-work.md 中 1-3 Round 4 deferred 项 + [feedback_naive_ui_2_38_message_no_action.md](memory/feedback_naive_ui_2_38_message_no_action.md)），故本 story 保存后 toast 仅纯文本，撤销按钮类需求不在 1.4 范围

### Naive UI stub 内部 name（已知坑）

- 测试中 stub Naive UI 组件时须用组件内部 `name` 而非 import 别名（如 `Drawer` 而非 `NDrawer`，`Popover` 而非 `NPopover`）— 见 [feedback_naive_ui_stub_internal_name.md](memory/feedback_naive_ui_stub_internal_name.md) + 1-3 `TaskDetailDrawer.test.ts` L651-656
- `SettingsDrawer.test.ts` 中若需 stub `NDrawer` 须用 `findComponent({ name: 'Drawer' })`
- 优先不 stub Naive UI 组件（直接挂载真实的 `n-drawer` / `n-form` / `n-radio` 由 Naive UI 自动提供全局注册 — 但 1-3 测试经验是 Naive UI 自动 mount-drawer 行为需在测试中显式 `mountDrawer: true` 等选项，dev 阶段参考 1-3 `TaskDetailDrawer.test.ts` 模式）

### 王芳 persona 文案要点

- 文档输出语言：中文（`_bmad/bmm/config.yaml` `document_output_language: Chinese`）
- 用户文案严禁泄漏技术术语：URL / Task ID / ISO-8601 / API / 依赖 / 运行时
- 时间格式：1-3 `useRelativeTime` 已实现"3 分钟前"等相对时间，本 story 不在抽屉内重复展示时间（避免冗余）
- 通知 body："{pageTitle} · 共 {N} 条数据"（成功） / "{errMsg}，点击查看详情"（失败）— 用中点 `·` 分隔避免 `|` 管道符视觉
- 按钮文案：保存 / 取消 / 重试 / 关闭 / 查看隐私声明 — 全中文
- 状态文案：浅色 / 深色（非 Light/Dark） / 简体中文 / English（语言名称本身是专有名词保留英文）
- "桌面通知"开关 label 用"桌面通知"（非"通知"避免歧义应用内通知）

### 与既有 story 边界声明

- 与 Story 1-1 边界：1.4 不修改 1.1 的 `PrivacyConsent` / `FirstTimeWizard` / `WelcomePage` 组件实现；仅复用 `PrivacyConsent` 弹窗实例（若 1-1 挂载点在 App.vue 则 App.vue 需新增 `open-privacy` event 接收；若在 SimpleView 则直接本地触发；dev 第一阶段读 [frontend/src/App.vue](frontend/src/App.vue) 与 [frontend/src/views/SimpleView.vue](frontend/src/views/SimpleView.vue) 确认 1-1 `PrivacyConsent` 挂载点）
- 与 Story 1-2 边界：1.4 不修改 `useUiStore` / `SmartURLInput.vue` / `ViewSwitcher.vue` 的实现（仅使用）；`App.vue` 修改仅替换 `theme` ref 为 computed，不动 `useStartupTelemetry` / `NMessageProvider` / `NNotificationProvider`
- 与 Story 1-3 边界：1.4 不修改 `useCrawlStore` / `HistoryCard` / `TaskDetailDrawer` 实现；通知点击跳转复用 1-3 `setActiveTask` 与 `drawerShow`；本 story 的 `useSettingsStore` 与 1-3 `useCrawlStore` 解耦（互不导入）
- 与 Epic 2 边界：1.4 不实现真实后端 WebSocket 通知推送（桌面通知触发逻辑封装在 SimpleView `runCrawl` 成功 / 失败路径末尾，Epic 2 接通 WS 时只需在 WS 事件回调处同样调用 `useNotifications().notify()` 即可复用本 story composable）
- 与 Epic 3 / 4 边界：1.4 设置抽屉在 SimpleView 实现，仪表板视图 / 专业视图复用同一 `SettingsDrawer` 组件 + `useSettingsStore`（Epic 4 视图组件挂载同一 SettingsDrawer 即可，无 store 重复实例化风险 — Pinia 单例保证）；**Epic 4 应将 `SettingsDrawer` 与"设置"图标按钮 lift 至共享 Layout 组件（如 `AppLayout.vue`）以避免三视图各写一份触发逻辑**，本 story Phase 1 在 SimpleView 直接挂载抽屉 + 按钮不预留任何抽象层（不抽象 `useSettingsLauncher` composable / 不预留 `<template #settings-trigger>` slot）—— "wrong abstraction now is harder to fix than no abstraction"，Epic 4 视图脚手架落地时由该 epic 评估是否提取共享 Layout + composable
- 与 Epic 7 边界：FR135 全局撤销/重做由 Epic 7 交付，1.4 抽屉"取消"仅放弃当前未保存修改不进 undo 栈（见 AC13）；本 story 抽屉不预留任何"撤销上次保存"按钮占位避免与 Epic 7 接口冲突
- 与 Epic 8 边界：AI 模型成本监控与通知由 Epic 8 交付，1.4 仅交付"爬取完成 / 失败"两类通知触发场景，AI 模型相关通知场景预留 `notificationPreference` 字段未来扩展（本 story 不实现 `onModelFallback` / `onBudgetExceeded` 等场景）

### 检测到的潜在冲突与决策

1. **App.vue theme ref 改造** — 1.1 / 1.2 测试是否依赖 `App.vue` 中 `theme` ref 为 `null` 静态值？— 解析：1.1 / 1.2 测试聚焦 SimpleView / PrivacyConsent / WelcomePage / SmartURLInput / FirstTimeWizard 内部行为，未 mount `App.vue` 根组件，故改造 `theme` 为 computed 不回归；若 1.1 / 1.2 任何测试 mount `App.vue` 全树则需在测试 setup 前 `useSettingsStore().setTheme('light')` 确保 `theme = null` 等价浅色；dev 第一阶段 `grep "App.vue" frontend/tests` 确认无测试直接 mount App 后再改造
2. **桌面通知在 Electron renderer 与浏览器环境的差异** — Electron renderer `Notification` API 默认支持但权限对话框在Electron 28 需 `Notification.requestPermission()`（与浏览器一致）；若 dev 环境 Notification API 不可用则 `useNotifications` `isSupported` 返回 false 静默降级 — 解析：测试环境通过 `vi.stubGlobal('Notification', mockNotification)` 注入桩，真实环境通过 `n-config-provider` 不影响 Notification 全局；Electron 主进程通知回退由 Epic 11 交付
3. **`n-notification` `action` API 在 Naive UI 2.38 的签名** — Dev 阶段用 context7 MCP 验证 `useNotification().error({ action })` 接受 VNode 函数式（`() => VNode`）还是 VNode 字面值（`VNode`）；若函数式不支持则降级到 `action: () => h(NButton, { ... })` 返回 span 包裹两个按钮（与 1-3 `useMessage().info` `action` 调研模式一致）— 见 [feedback_naive_ui_2_38_message_no_action.md](memory/feedback_naive_ui_2_38_message_no_action.md) 已知 `n-message` `action` 不支持，但 `n-notification` `action` API 不同（n-notification 设计上就支持 action 按钮组）
4. **隐私弹窗复用挂载点** — 若 1-1 `PrivacyConsent` 挂载点在 App.vue，则 1.4 SimpleView 需 emit `open-privacy` 事件至 App.vue；若在 SimpleView 内则直接本地触发 — dev 第一阶段读 `frontend/src/App.vue` + `frontend/src/views/SimpleView.vue` 确认 1-1 挂载点
5. **CSS `n-config-provider` 主题切换闪烁** — 主题切换时抽屉内 form 控件立即重渲染，但抽屉外的 `ViewSwitcher` / `HistoryCard` 也会重渲染 — 解析：Naive UI `darkTheme` 切换由 `n-config-provider` reactive 驱动，无需手动操作 DOM；测试中 `useSettingsStore().setTheme('dark')` 后 `nextTick` 即可断言 `n-config-provider` 接收到 `darkTheme` 对象
6. **测试中 `Notification` 桩污染其他测试** — `vi.stubGlobal('Notification', mockNotification)` 在 `tests/setup.ts` 全局生效，但其他未声明使用 Notification 的测试不受影响（mock 函数仅记录调用历史，不主动触发任何分支）；每个 `beforeEach` `mockClear` 避免跨用例断言污染
7. **`useNotifications` composable 的 `permission` ref 与 `Notification.permission` 同步** — composable `onMounted` 时读取 `Notification.permission` 当前值；若用户在抽屉外通过浏览器设置更改权限后回到应用，`permission.value` 不会自动更新 — 解析：可加 `setInterval(() => { if (isSupported.value) permission.value = Notification.permission; }, 5000)` 轮询，但 Phase 1 不必要（用户更改 OS 权限是低频操作）保留为后续优化；本 story 接受 `permission` 在抽屉打开瞬间快照的语义
8. **App.vue 改造后 Pinia store 初始化时序** — `useSettingsStore()` 在 App.vue setup 阶段调用，但 `pinia-plugin-persistedstate` 在 `app.use(pinia)` 后 `app.mount('#app')` 时通过 `pinia.use(plugin)` 注册；1-2 已通过此模式交付 `useUiStore`，故 1.4 同模式安全；若 `useSettingsStore()` 在 App.vue setup 阶段 store `persist` 字段尚未从 localStorage 同步，则会闪烁一帧（默认 'light' → 加载后 'dark'）— 解析：`pinia-plugin-persistedstate` 3.x 在 store 初始化时同步从 localStorage 读取并填充 state（同 `useUiStore` 1-2 已验证行为），故无闪烁
9. **与 1-2 L72 边界声明的偏离** — [1-2-simple-view-url-input.md#L72](1-2-simple-view-url-input.md) 与 [#L366](1-2-simple-view-url-input.md) 明确写道："4.3 与 Story 1.4 的界面设置 store 解耦 — 1.4 实现 `useSettingsStore` 时将通过 `useUiStore().setViewPreference` 修改以便集中持久化"。本 story 经过 architecture.md#L188 "Pinia stores 视图分离" + AC7 "禁止导入 `useUiStore` / `useCrawlStore`" 反复权衡，**偏离 1-2 此项期望**：`useSettingsStore` 与 `useUiStore` 完全独立解耦，`useSettingsStore` 内**不**导入 `useUiStore`，也**不**通过 `useUiStore().setViewPreference` 处理 view 偏好持久化（view 偏好继续由 `useUiStore` 自己持久化 1-2 已交付）。理由：(a) 主题 / 语言 / 通知偏好与视图偏好属于**正交关注点**，混入 `useUiStore` 会使其职责膨胀为"view 偏好 + 设置中心"，违反 architecture.md#L188 单 store 单职责约定；(b) `useUiStore` 1-2 已经独立持久化 `viewPreference` 字段（key `ai-crawler:view-preference`），无需 `useSettingsStore` 介入集中化；(c) 1-2 L72 的"集中持久化"假设在 1-3 `useCrawlStore` 独立持久化 key 后已经不成立（1-3 没有"通过 useUiStore 集中"），故 1.4 同 1-3 模式独立持久化最一致。**dev 若发现 1-2 测试有断言依赖 `useSettingsStore` 调用 `useUiStore().setViewPreference`，应在 dev 第一阶段 grep 验证；若有则需更新 1-2 测试或重新评估本决策**

### 防御性边界

- **禁止**在本 story 引入 i18n 框架（`vue-i18n` 等）— 语言切换仅交付 store 字段 + UI 占位，i18n 框架由后续 Epic 接入
- **禁止**在本 story 引入 Electron 主进程通知回退逻辑（`new Notification()` 在 main 进程）— Epic 11 交付
- **禁止**在本 story 实现全局撤销/重做架构 — Epic 7 交付
- **禁止**在本 story 修改 `useUiStore` / `useCrawlStore` / `useOnboardingStore` 接口
- **禁止**在本 story 引入新的 npm 依赖（所有依赖已在 1-1 / 1-2 / 1-3 安装：vue / pinia / pinia-plugin-persistedstate / naive-ui / @vicons/ionicons5 / vitest / @vue/test-utils / jsdom）
- **禁止**在本 story 增加任何 E2E 测试（通知权限授权 Playwright 流程由 Epic 2 + Epic 11 覆盖）
- **禁止**在本 story 修改 `_bmad-output/planning-artifacts/` 下任何规划文档（epics / architecture / prd / ux-design-specification 权威）
- **禁止**在本 story 修改 1-1 / 1-2 / 1-3 既有 story 文件（既有 story 文件权威，本 story 仅引用不修改）

## References

### 规划文档

- [_bmad-output/planning-artifacts/epic-01-first-time-onboarding.md#L109-L143](_bmad-output/planning-artifacts/epic-01-first-time-onboarding.md) — Story 1.4 规范 4 条 ACs（设置展示 / 保存 / 桌面通知成功 / 错误通知+重试）+ FR36 / FR37 / FR135 + NFR35 / UX-DR5
- [_bmad-output/planning-artifacts/prd.md#L1527-L1529](_bmad-output/planning-artifacts/prd.md) — FR36 自定义界面设置与偏好 + FR37 爬取完成与错误通知 + FR135 撤销最近配置更改
- [_bmad-output/planning-artifacts/prd.md#L1820-L1827](_bmad-output/planning-artifacts/prd.md) — NFR35 清晰错误消息 + 可执行指南 <500ms + NFR36 跨平台 UI/UX 一致性 + NFR37 暗模式 + WCAG 2.1 AA
- [_bmad-output/planning-artifacts/architecture.md#L188](_bmad-output/planning-artifacts/architecture.md) — Pinia stores 视图分离（useCrawlStore / useUiStore / useUserStore / useOfflineStore）
- [_bmad-output/planning-artifacts/architecture.md#L191](_bmad-output/planning-artifacts/architecture.md) — 用户偏好 LocalStorage 存储
- [_bmad-output/planning-artifacts/architecture.md#L1710-L1715](_bmad-output/planning-artifacts/architecture.md) — composables + stores 路径约定
- [_bmad-output/planning-artifacts/ux-design-specification.md#L635-L655](_bmad-output/planning-artifacts/ux-design-specification.md) — 主题切换机制代码示例（Naive UI `darkTheme` + `n-config-provider`）
- [_bmad-output/planning-artifacts/ux-design-specification.md#L2568-L2602](_bmad-output/planning-artifacts/ux-design-specification.md) — 反馈模式 成功 / 错误 / 警告 / 信息，5s 自动消失，role="alert" / role="status" + aria-live
- [_bmad-output/planning-artifacts/ux-design-specification.md#L2695-L2699](_bmad-output/planning-artifacts/ux-design-specification.md) — 设置对话框（标签页导航 + 配置选项 + 取消 / 应用 / 保存按钮，large 800px — 本 story 收窄到 480px drawer 模式）
- [_bmad-output/planning-artifacts/ux-design-specification.md#L4310](_bmad-output/planning-artifacts/ux-design-specification.md) — `Ctrl/Cmd + ,` 打开设置快捷键

### 既有 story 与边界声明

- [_bmad-output/implementation-artifacts/1-1-desktop-app-install-launch.md](_bmad-output/implementation-artifacts/1-1-desktop-app-install-launch.md) — 1.1 交付隐私弹窗 + 启动向导 + 欢迎页 + 启动埋点；1.4 复用 `PrivacyConsent` 弹窗
- [_bmad-output/implementation-artifacts/1-2-simple-view-url-input.md#L24](_bmad-output/implementation-artifacts/1-2-simple-view-url-input.md) — 1.2 AC10 + Task 4.3 明确 `useSettingsStore` 与 `useUiStore` 解耦边界
- [_bmad-output/implementation-artifacts/1-3-task-management-history.md#L563](_bmad-output/implementation-artifacts/1-3-task-management-history.md) — 1.3 L563 边界声明 `useSettingsStore`（主题/语言/通知偏好）与 `useCrawlStore` 解耦
- [_bmad-output/implementation-artifacts/deferred-work.md](_bmad-output/implementation-artifacts/deferred-work.md) — 1-1 / 1-2 / 1-3 累积延期项，无 Story 1.4 特定延期

### 项目上下文

- [_bmad-output/project-context.md](_bmad-output/project-context.md) — 技术栈版本 + Pinia 约定 + 命名规范 + 反模式
- [CLAUDE.md](CLAUDE.md) — 编程前思考 / 简单至上 / 架构调整 / 以目标为导向的执行

### 前端既有代码

- [frontend/src/App.vue](frontend/src/App.vue) — 当前 `theme` ref 为 `null`（浅色），本 story 改造为 `useSettingsStore().themePreference === 'dark' ? darkTheme : null` computed
- [frontend/src/stores/ui.ts](frontend/src/stores/ui.ts) — 1.2 `useUiStore` persist 模式参考；1.4 `useSettingsStore` 同模式
- [frontend/src/stores/crawl.ts](frontend/src/stores/crawl.ts) — 1.3 `useCrawlStore` Setup Store 参考；1.4 同模式
- [frontend/src/components/simple/TaskDetailDrawer.vue](frontend/src/components/simple/TaskDetailDrawer.vue) — 1.3 `n-drawer` 用法参考（placement=right + v-model:show + closable）
- [frontend/src/views/SimpleView.vue](frontend/src/views/SimpleView.vue) — 1.2 / 1.3 `runCrawl` 成功 / 失败路径末尾追加通知触发
- [frontend/src/composables/useStatusTag.ts](frontend/src/composables/useStatusTag.ts) — 1.3 composable 模式参考
- [frontend/tests/setup.ts](frontend/tests/setup.ts) — 1.3 `crypto.randomUUID` stub 模式 + 本 story `Notification` stub 同模式追加

### 记忆与已知坑

- [memory/feedback_naive_ui_stub_internal_name.md](memory/feedback_naive_ui_stub_internal_name.md) — Naive UI stub 必须用组件内部 `name` 而非 import 别名（如 `Drawer` 而非 `NDrawer`）
- [memory/feedback_naive_ui_2_38_message_no_action.md](memory/feedback_naive_ui_2_38_message_no_action.md) — Naive UI 2.38 `useMessage().info` 不支持 `action` 字段；保存后 toast 用纯文本，不用 action 按钮
- [memory/feedback_pinia_persist_test_flush.md](memory/feedback_pinia_persist_test_flush.md) — pinia-plugin-persistedstate 在 vitest 必须用 `createApp({}).use(pinia)` flush + 10ms macrotask 让 `$subscribe` 触发

## Dev Agent Record

### Agent Model Used

GLM-5.2 (Claude Code CLI)

### Debug Log References

- Task 5.0（Naive UI 2.38 `n-notification` `action` API 验证）：已通过 context7 确认 `NotificationOption.action` 支持渲染函数返回 VNodeChild（`() => VNode`），实现采用 `action: () => h('span', ..., [NButton 重试, NButton 关闭])` 双按钮包裹模式，实测通过（SimpleView 失败路径测试断言 document.body 含"重试/关闭"按钮）。
- 测试基础设施拆分：`tests/setup-notification.ts` 专责 Notification 全局桩（beforeEach 反复注册对抗 afterEach `vi.unstubAllGlobals()` 清除），`vitest.config.ts` setupFiles 指向该文件；原 `tests/setup.ts` 的 crypto.randomUUID stub 由 jsdom 环境原生 crypto 覆盖，全量 149 测试通过无回归。
- SettingsDrawer 测试修复：stub 必须用 Naive UI 组件内部 name（`Radio`/`RadioGroup`/`Alert`/`Switch`/`CheckboxGroup` 等）而非 `N*` 别名；Radio/Checkbox stub 通过 provide/inject 接线 v-model 事件；jsdom 原生 `.click()` 不触发 radio `@change`，改用 `trigger('change')`。
- SimpleView 测试：`n-notification` 卡片 teleport 到 `document.body`，断言须用 `document.body.textContent` 而非 `wrapper.text()`；测试文件 beforeEach 需 `mockNotification.mockClear()` 防跨用例调用历史污染。
- 1-1 `PrivacyConsent` 挂载点确认为路由 `/privacy`（非 App.vue/SimpleView 弹窗实例），`openPrivacy` 实现为 `router.push({ name: 'privacy' })`。

### Completion Notes

- Task 1（useSettingsStore）：Setup Store + persist（key `ai-crawler:settings-preferences`，pick 三字段），无效值静默兜底（theme->'light'、language->'zh-CN'），未导入 ui/crawl/onboarding store，无 API 调用。10 项测试通过。
- Task 2（useNotifications）：`{ notify, requestPermission, permission, isSupported }`；`'unsupported'` 哨兵值区分非支持环境；permission 非 granted 时 notify 返回 null。7 项测试通过。
- Task 3（SettingsDrawer）：三组分组（外观/通知/关于）+ 本地草稿 + isDirty 控制保存按钮 + 保存写 store + 关闭抽屉 + nextTick toast"设置已保存"（duration 2000）+ Esc 等同取消 + Ctrl+S 保存 + 权限告警双文案 + 隐私声明 emit open-privacy。13 项测试通过。
- Task 4（App.vue）：`theme` ref 替换为 `useSettingsStore().themePreference === 'dark' ? darkTheme : null` computed；保留 NMessageProvider/NNotificationProvider/useStartupTelemetry/reportStartupTime。
- Task 5（SimpleView）：footer 新增设置图标按钮（SettingsOutline）+ Ctrl/Cmd+, 全局快捷键 + SettingsDrawer 挂载 + runCrawl 成功/失败路径通知触发（复用 1-3 既有 drawerShow ref，未新声明）+ 失败路径 `naiveNotification.error` duration 0 重试/关闭按钮卡片（action 渲染函数）+ AbortError 不触发通知。新增 6 项测试，既有断言不动。
- Task 6：setup-notification.ts Notification 桩（beforeEach 注册）。
- Task 7：本文件 Dev Agent Record/File List/Change Log 已填；deferred-work.md 未新增 1.4 延期项；未修改 planning-artifacts 与 1-1/1-2/1-3 story 文件。
- 全量回归：vitest 17 文件 149/149 通过（含 1-1/1-2/1-3 既有全部测试）。
- 已知边界：AC6 两处 UX 偏离（省略"应用"按钮、toast 2000ms）为 story 规范内声明的有意决策。

### File List

- frontend/src/stores/settings.ts（新增）
- frontend/src/composables/useNotifications.ts（新增）
- frontend/src/components/SettingsDrawer.vue（新增）
- frontend/src/App.vue（修改）
- frontend/src/views/SimpleView.vue（修改）
- frontend/tests/setup-notification.ts（新增）
- frontend/vitest.config.ts（修改：setupFiles 指向 setup-notification.ts）
- frontend/tests/stores/settings.test.ts（新增）
- frontend/tests/components/SettingsDrawer.test.ts（新增）
- frontend/tests/composables/useNotifications.test.ts（新增）
- frontend/tests/components/SimpleView.test.ts（修改：Host provider 包装 + 新增 6 项测试）

### Change Log

- 2026-08-12 ~ 2026-08-15：Story 1-4 实施完成--useSettingsStore（主题/语言/通知偏好持久化）、useNotifications composable（Web Notification API 封装）、SettingsDrawer 组件（三组设置 + 本地草稿 + 保存/取消）、App.vue 主题 reactive 绑定、SimpleView 设置入口 + Ctrl+, 快捷键 + 成功/失败桌面通知 + 应用内错误通知卡片（重试/关闭）；新增 36 项测试（store 10 + composable 7 + drawer 13 + SimpleView 6），全量 149/149 通过。
