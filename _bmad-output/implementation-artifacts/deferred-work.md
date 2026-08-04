# Deferred Work

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
