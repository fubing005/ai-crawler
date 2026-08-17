<template>
  <div class="simple-view">
    <header class="simple-view__header">
      <h1 class="simple-view__title">简洁视图</h1>
      <p class="simple-view__subtitle">
        粘贴网址即可开始爬取
      </p>
    </header>

    <main class="simple-view__body" ref="bodyRef">
      <SmartURLInput
        v-model="url"
        :examples="examples"
        :loading="loading"
        :phase="state"
        :history-items="crawlHistoryItems"
        @submit="onSubmit"
      />

      <p v-if="hint" class="simple-view__hint" role="status">{{ hint }}</p>

      <p v-else-if="state === 'idle'" class="simple-view__hint">
        尚未开始爬取。粘贴网址后将自动分析页面字段。
      </p>

      <ProgressPanel
        v-if="state === 'analyzing' || state === 'extracting' || state === 'completed' || state === 'failed'"
        :progress="progress"
        :stage="state"
        :extracted-count="extractedCount"
      />

      <button
        v-if="state === 'failed'"
        type="button"
        class="simple-view__retry"
        @click="onRetry"
      >
        重试
      </button>

      <section class="simple-view__history">
        <n-empty v-if="crawlStore.history.length === 0" description="还没有爬取历史" size="small">
          <template #extra>
            <n-button text type="primary" @click="onStartHistory">立即开始爬取</n-button>
          </template>
        </n-empty>
        <div v-else class="simple-view__history-list">
          <HistoryCard
            v-for="record in crawlStore.history"
            :key="record.id"
            :record="record"
            :now="crawlStore.nowTimestamp"
            @view="openDetail(record.id)"
            @export="onExport"
            @delete="onDelete(record.id)"
          />
        </div>
      </section>
    </main>

    <transition name="fade">
      <div
        v-if="undoToastShow"
        class="simple-view__undo-toast"
        role="status"
        aria-live="polite"
      >
        <span class="simple-view__undo-text">已删除，5 秒内可撤销</span>
        <button
          type="button"
          class="simple-view__undo-action"
          aria-label="撤销删除"
          @click="undoDelete"
        >撤销</button>
      </div>
    </transition>

    <footer class="simple-view__footer">
      <ViewSwitcher
        :model-value="uiStore.viewPreference"
        @update:model-value="onViewChange"
      />
      <n-button quaternary circle aria-label="打开设置" @click="openSettings">
        <template #icon>
          <n-icon><SettingsOutline /></n-icon>
        </template>
      </n-button>
    </footer>

    <TaskDetailDrawer
      v-model:show="drawerShow"
      :record="crawlStore.activeTask"
      :now="crawlStore.nowTimestamp"
      @export="onExport"
    />

    <SettingsDrawer v-model:show="settingsDrawerShow" @open-privacy="openPrivacy" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, h } from 'vue';
import { NEmpty, NButton, NIcon, useNotification as useNaiveNotification } from 'naive-ui';
import { SettingsOutline } from '@vicons/ionicons5';
import { useRouter } from 'vue-router';
import SmartURLInput from '@/components/SmartURLInput.vue';
import ViewSwitcher from '@/components/ViewSwitcher.vue';
import ProgressPanel from '@/components/simple/ProgressPanel.vue';
import HistoryCard from '@/components/simple/HistoryCard.vue';
import TaskDetailDrawer from '@/components/simple/TaskDetailDrawer.vue';
import SettingsDrawer from '@/components/SettingsDrawer.vue';
import { useUiStore, type ViewPreference } from '@/stores/ui';
import { useCrawlStore } from '@/stores/crawl';
import { useSettingsStore } from '@/stores/settings';
import { useNotifications } from '@/composables/useNotifications';
import { analyze, crawl, getCrawlProgress } from '@/api/analyze';
import { mockExamples, mockAnalyzedFields } from '@/mocks/analyze-mock';
import type { CrawlTaskRecord } from '@/types/crawl';

type State = 'idle' | 'analyzing' | 'extracting' | 'completed' | 'failed';

interface PendingUndo {
  task: CrawlTaskRecord;
  neighborId: string | null;
  timer: number;
}

const uiStore = useUiStore();
const crawlStore = useCrawlStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const naiveNotification = useNaiveNotification();
const { notify: notifyDesktop, requestPermission, permission: notificationPermission } = useNotifications();
const settingsDrawerShow = ref(false);

const url = ref('');
const loading = ref(false);
const state = ref<State>('idle');
const progress = ref(0);
const extractedCount = ref(0);
const hint = ref('');
const bodyRef = ref<HTMLElement | null>(null);
const examples = mockExamples;

const drawerShow = ref(false);
const pendingUndos = ref<PendingUndo[]>([]);
const undoToastShow = computed(() => pendingUndos.value.length > 0);

const crawlHistoryItems = computed(() => {
  const seen = new Set<string>();
  const result: { url: string; completedAt: number }[] = [];
  for (const t of crawlStore.history) {
    if (seen.has(t.url)) continue;
    seen.add(t.url);
    result.push({ url: t.url, completedAt: t.completedAt });
    if (result.length >= 5) break;
  }
  return result;
});

let abortController: AbortController | null = null;

function setStatus(s: State) { state.value = s; }

function buildRecord(target: string, status: 'completed' | 'failed', pageTitle: string, count: number, fields: CrawlTaskRecord['fields']): CrawlTaskRecord {
  return {
    id: crypto.randomUUID(),
    url: target,
    pageTitle,
    extractedCount: count,
    completedAt: Date.now(),
    status,
    fields
  };
}

async function runCrawl(target: string) {
  loading.value = true;
  hint.value = '';
  abortController?.abort();
  abortController = new AbortController();
  setStatus('analyzing');
  progress.value = 0;
  extractedCount.value = 0;

  let analyzeRes: Awaited<ReturnType<typeof analyze>> | null = null;

  try {
    analyzeRes = await analyze(target, { signal: abortController.signal });
    const fields = analyzeRes.fields.length
      ? analyzeRes.fields.map((f) => f.name)
      : mockAnalyzedFields;

    await getCrawlProgress(
      'mock-task',
      (p, stage, count) => {
        progress.value = p;
        if (stage === 'completed') {
          setStatus('completed');
          progress.value = 100;
          extractedCount.value = count;
        } else {
          setStatus(stage === 'analyzing' ? 'analyzing' : 'extracting');
          extractedCount.value = count;
        }
      },
      { signal: abortController.signal }
    );

    await crawl(target, fields, { signal: abortController.signal });

    setStatus('completed');
    progress.value = 100;
    const record = buildRecord(target, 'completed', analyzeRes.page_title, extractedCount.value, analyzeRes.fields);
    crawlStore.addTask(record);
    if (settingsStore.notificationPreference.enabled && settingsStore.notificationPreference.onComplete) {
      void (async () => {
        try {
          if (notificationPermission.value !== 'granted') await requestPermission();
          if (notificationPermission.value === 'granted') {
            notifyDesktop('爬取完成', {
              body: `${record.pageTitle} · 共 ${record.extractedCount} 条数据`,
              tag: record.id,
              onClick: (id: string) => {
                crawlStore.setActiveTask(id);
                drawerShow.value = true;
              }
            });
          }
        } catch {
          // 静默降级：通知失败不影响主流程
        }
      })();
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    setStatus('failed');
    hint.value = 'AI 暂时没找到字段，请稍后再试。';
    const failedFields = analyzeRes?.fields ?? [];
    const failedRecord = buildRecord(target, 'failed', analyzeRes?.page_title ?? '', 0, failedFields);
    crawlStore.addTask(failedRecord);
    if (settingsStore.notificationPreference.enabled && settingsStore.notificationPreference.onFailure) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      const errSummary = rawMsg.length > 80 ? rawMsg.slice(0, 80) + '…' : rawMsg;
      void (async () => {
        try {
          if (notificationPermission.value !== 'granted') await requestPermission();
          if (notificationPermission.value === 'granted') {
            notifyDesktop('爬取失败', {
              body: `${errSummary}，点击查看详情`,
              tag: failedRecord.id,
              onClick: (id: string) => {
                crawlStore.setActiveTask(id);
                drawerShow.value = true;
              }
            });
          }
        } catch {
          // 静默降级：通知失败不影响主流程
        }
      })();
      const notif = naiveNotification.error({
        title: '爬取失败',
        content: errSummary,
        duration: 0,
        meta: '点击重试或关闭',
        action: () =>
          h('span', { style: 'display: flex; gap: 8px;' }, [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => {
                  onRetry();
                  notif.close();
                }
              },
              { default: () => '重试' }
            ),
            h(NButton, { size: 'small', onClick: () => notif.close() }, { default: () => '关闭' })
          ])
      });
    }
  } finally {
    loading.value = false;
  }
}

function validateUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (!parsed.hostname || /\s/.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function onSubmit(value: string) {
  if (!value || value.trim() === '') {
    hint.value = '请先粘贴网址。';
    return;
  }
  if (!validateUrl(value)) {
    hint.value = '网址格式不正确，请检查后再试。';
    return;
  }
  hint.value = '';
  void runCrawl(value.trim());
}

function onRetry() {
  const value = url.value;
  if (!value || value.trim() === '') {
    hint.value = '请先粘贴网址。';
    return;
  }
  if (!validateUrl(value)) {
    hint.value = '网址格式不正确，请检查后再试。';
    return;
  }
  void runCrawl(value.trim());
}

function onStartHistory() {
  bodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  void nextTick(() => {
    const input = bodyRef.value?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
  });
}

function onViewChange(view: ViewPreference) {
  uiStore.setViewPreference(view);
}

function openDetail(id: string) {
  crawlStore.setActiveTask(id);
  drawerShow.value = true;
}

function openSettings() {
  settingsDrawerShow.value = true;
}

function openPrivacy() {
  router.push({ name: 'privacy' });
}

function onKeyDownGlobal(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === ',') {
    e.preventDefault();
    settingsDrawerShow.value = true;
  }
}

function onExport(): void {
  // Phase 1 placeholder — export disabled in drawer/HistoryCard; kept to satisfy emit wiring.
  // Drawer export emit is no-arg; activeTask id would be read from crawlStore.activeTask?.id if needed.
}

function onDelete(id: string) {
  const idx = crawlStore.history.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const removed = crawlStore.history[idx];
  const neighborId = crawlStore.getNeighborId(id);
  crawlStore.removeTask(id);
  const timer = window.setTimeout(() => {
    pendingUndos.value = pendingUndos.value.filter((p) => p.timer !== timer);
  }, 5000);
  pendingUndos.value.push({ task: removed, neighborId, timer });
}

function undoDelete() {
  const last = pendingUndos.value.pop();
  if (!last) return;
  clearTimeout(last.timer);
  crawlStore.restoreTask(last.task, last.neighborId);
}

onMounted(() => {
  crawlStore.startTick();
  window.addEventListener('keydown', onKeyDownGlobal);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDownGlobal);
  abortController?.abort();
  crawlStore.stopTick();
  for (const p of [...pendingUndos.value].reverse()) {
    try {
      clearTimeout(p.timer);
      crawlStore.restoreTask(p.task, p.neighborId);
    } catch (e) {
      console.error('restoreTask failed during unmount', e);
    }
  }
  pendingUndos.value = [];
});
</script>

<style scoped>
.simple-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 24px;
  background: #F9FAFB;
  gap: 32px;
}
.simple-view__header { text-align: center; }
.simple-view__title { font-size: 28px; font-weight: 600; color: #1E40AF; margin: 0 0 8px 0; }
.simple-view__subtitle { font-size: 16px; color: #6B7280; margin: 0; }
.simple-view__body {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.simple-view__hint { margin-top: 4px; font-size: 13px; color: #4B5563; }
.simple-view__history { margin-top: 16px; }
.simple-view__history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.simple-view__footer {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.9);
  padding: 8px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.simple-view__retry {
  align-self: center;
  padding: 6px 16px;
  border: 1px solid #3B82F6;
  border-radius: 6px;
  background: #FFFFFF;
  color: #3B82F6;
  cursor: pointer;
}
.simple-view__retry:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
.simple-view__undo-toast {
  position: fixed;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(31, 41, 55, 0.92);
  color: #FFFFFF;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  font-size: 13px;
}
.simple-view__undo-action {
  background: transparent;
  border: none;
  color: #60A5FA;
  cursor: pointer;
  padding: 0;
  font-size: 13px;
  font-weight: 500;
}
.simple-view__undo-action:focus-visible {
  outline: 2px solid #60A5FA;
  outline-offset: 2px;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
