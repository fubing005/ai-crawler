<template>
  <div
    class="analysis-card"
    role="region"
    aria-label="分析结果"
  >
    <div class="analysis-card__header">
      <n-tag :type="typeTagType" size="medium">{{ typeLabel }}</n-tag>
      <n-tag v-if="isConfident" type="success" size="medium">分析完成</n-tag>
    </div>

    <n-alert
      v-if="!isConfident"
      type="warning"
      role="alert"
      :show-icon="true"
      class="analysis-card__warning"
    >
      分析结果不确定，建议手动确认要提取的内容
    </n-alert>

    <div class="analysis-card__row">
      <span class="analysis-card__label">整体置信度</span>
      <span
        class="analysis-card__value"
        :aria-label="`置信度 ${confidencePercent}%`"
      >{{ confidencePercent }}%</span>
    </div>

    <div v-if="result.main_content_selector" class="analysis-card__row">
      <span class="analysis-card__label">主要内容区域</span>
      <n-text depth="3" class="analysis-card__value">已定位主要内容区域</n-text>
    </div>

    <div class="analysis-card__section-title">推荐字段</div>
    <ul class="analysis-card__fields">
      <li
        v-for="field in result.fields"
        :key="field.name"
        class="analysis-card__field"
      >
        <span class="analysis-card__field-name">{{ field.name }}</span>
        <span
          class="analysis-card__field-sample"
          :title="field.sample"
        >{{ truncatedSample(field.sample) }}</span>
        <n-tag
          :type="confidenceTagType(field.confidence)"
          size="small"
          :aria-label="`置信度 ${Math.round(field.confidence * 100)}%`"
        >{{ Math.round(field.confidence * 100) }}%</n-tag>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NAlert, NTag, NText } from 'naive-ui';
import type { AnalyzeResponse } from '@/types/analyze';

interface Props {
  result: AnalyzeResponse;
}
const props = defineProps<Props>();

const TYPE_LABELS: Record<AnalyzeResponse['detected_type'], string> = {
  ecommerce: '电商商品列表',
  news: '新闻资讯',
  blog: '博客文章',
  form: '用户表单',
  unknown: '未识别'
};

const typeLabel = computed(() => TYPE_LABELS[props.result.detected_type] ?? '未识别');
const typeTagType = computed<'success' | 'info' | 'warning' | 'error'>(() => {
  if (props.result.detected_type === 'unknown') return 'warning';
  return 'info';
});

const confidencePercent = computed(() => Math.round(props.result.overall_confidence * 100));
const isConfident = computed(() => props.result.overall_confidence >= 0.7);

function confidenceTagType(confidence: number): 'success' | 'info' | 'warning' | 'error' {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.8) return 'info';
  if (confidence >= 0.7) return 'warning';
  return 'error';
}

function truncatedSample(sample: string): string {
  return sample.length > 40 ? `${sample.slice(0, 40)}…` : sample;
}
</script>

<style scoped>
.analysis-card {
  width: 100%;
  max-width: 800px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #FFFFFF;
}
.analysis-card__header {
  display: flex;
  gap: 8px;
  align-items: center;
}
.analysis-card__warning {
  margin-top: 12px;
}
.analysis-card__row {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
}
.analysis-card__label {
  color: #4B5563;
}
.analysis-card__value {
  color: #111827;
  font-weight: 500;
}
.analysis-card__section-title {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1E40AF;
}
.analysis-card__fields {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.analysis-card__field {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  padding: 8px 12px;
  border: 1px solid #F3F4F6;
  border-radius: 6px;
  background: #FAFAFA;
}
.analysis-card__field-name {
  min-width: 90px;
  font-weight: 600;
  color: #111827;
}
.analysis-card__field-sample {
  flex: 1;
  color: #6B7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
