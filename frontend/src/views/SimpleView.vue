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

      <section v-if="state === 'idle'" class="simple-view__history">
        <n-empty description="还没有爬取历史" size="small">
          <template #extra>
            <n-button text type="primary" @click="onStartHistory">立即开始爬取</n-button>
          </template>
        </n-empty>
      </section>
    </main>

    <footer class="simple-view__footer">
      <ViewSwitcher
        :model-value="uiStore.viewPreference"
        @update:model-value="onViewChange"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick } from 'vue';
import { NEmpty, NButton } from 'naive-ui';
import SmartURLInput from '@/components/SmartURLInput.vue';
import ViewSwitcher from '@/components/ViewSwitcher.vue';
import ProgressPanel from '@/components/simple/ProgressPanel.vue';
import { useUiStore, type ViewPreference } from '@/stores/ui';
import { analyze, crawl, getCrawlProgress } from '@/api/analyze';
import { mockExamples, mockAnalyzedFields } from '@/mocks/analyze-mock';
import type { CrawlStage } from '@/types/analyze';

type State = 'idle' | 'analyzing' | 'extracting' | 'completed' | 'failed';

const uiStore = useUiStore();

const url = ref('');
const loading = ref(false);
const state = ref<State>('idle');
const progress = ref(0);
const extractedCount = ref(0);
const hint = ref('');
const bodyRef = ref<HTMLElement | null>(null);
const examples = mockExamples;

let abortController: AbortController | null = null;

function setStatus(s: State) { state.value = s; }

async function runCrawl(target: string) {
  loading.value = true;
  hint.value = '';
  abortController?.abort();
  abortController = new AbortController();
  setStatus('analyzing');
  progress.value = 0;
  extractedCount.value = 0;

  try {
    const analyzeRes = await analyze(target, { signal: abortController.signal });
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
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    setStatus('failed');
    hint.value = 'AI 暂时没找到字段，请稍后再试。';
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

onBeforeUnmount(() => {
  abortController?.abort();
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
</style>
