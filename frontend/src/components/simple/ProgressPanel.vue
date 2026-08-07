<template>
  <div
    class="progress-panel"
    role="status"
    aria-live="polite"
    :data-stage="stage"
  >
    <div class="progress-panel__header">
      <span class="progress-panel__stage">{{ stageLabel }}</span>
      <span class="progress-panel__percent">{{ progress }}%</span>
    </div>
    <n-progress
      type="line"
      :percentage="progress"
      :show-indicator="false"
      :status="progressStatus"
    />
    <n-steps
      size="small"
      :current="step"
      :status="stepStatus"
      class="progress-panel__steps"
    >
      <n-step title="分析页面结构" />
      <n-step title="识别字段" />
      <n-step title="提取数据" />
    </n-steps>
    <div class="progress-panel__meta">
      <span v-if="stage === 'completed'" class="progress-panel__count">
        完成，已获取 {{ extractedCount }} 条数据
      </span>
      <span v-else-if="stage === 'extracting'" class="progress-panel__count">
        AI 找到了 {{ extractedCount }} 个字段
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NProgress, NSteps, NStep } from 'naive-ui';
import type { CrawlStage } from '@/types/analyze';

interface Props {
  progress: number;
  stage: CrawlStage;
  extractedCount: number;
}
const props = defineProps<Props>();

const stageLabel = computed(() => {
  if (props.stage === 'analyzing') return 'AI 正在浏览页面';
  if (props.stage === 'extracting') return '正在为您复制数据';
  if (props.stage === 'completed') return '完成';
  return 'AI 暂时没找到字段';
});

const progressStatus = computed<'success' | 'error' | 'default'>(() => {
  if (props.stage === 'completed') return 'success';
  if (props.stage === 'failed') return 'error';
  return 'default';
});

const step = computed(() => {
  if (props.stage === 'completed') return 3;
  if (props.progress >= 90) return 3;
  if (props.progress >= 60) return 2;
  return 1;
});

const stepStatus = computed<'process' | 'finish' | 'error' | 'wait'>(() => {
  if (props.stage === 'completed') return 'finish';
  if (props.stage === 'failed') return 'error';
  return 'process';
});
</script>

<style scoped>
.progress-panel {
  width: 100%;
  max-width: 800px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #FFFFFF;
}
.progress-panel__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #1E40AF;
}
.progress-panel__percent { font-weight: 600; }
.progress-panel__steps { margin-top: 12px; }
.progress-panel__meta { margin-top: 8px; font-size: 13px; color: #4B5563; }
.progress-panel__count--error { color: #DC2626; }
</style>
