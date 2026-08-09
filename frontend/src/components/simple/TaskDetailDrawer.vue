<template>
  <n-drawer
    :show="show"
    :width="480"
    placement="right"
    @update:show="emit('update:show', $event)"
  >
    <n-drawer-content :title="'任务详情'" closable>
      <div v-if="record" class="task-detail">
        <header class="task-detail__header">
          <h2 class="task-detail__title">{{ title }}</h2>
          <n-tag :type="tagType" size="small" round>
            <template #icon>
              <n-icon :component="tagIcon" />
            </template>
            {{ tagText }}
          </n-tag>
        </header>

        <dl class="task-detail__meta">
          <div class="task-detail__row">
            <dt>网址</dt>
            <dd><n-ellipsis :line-clamp="1" :tooltip="{ width: 'trigger' }">{{ record.url }}</n-ellipsis></dd>
          </div>
          <div class="task-detail__row">
            <dt>爬取时间</dt>
            <dd>{{ absoluteTime }}（{{ relativeTime }}）</dd>
          </div>
          <div class="task-detail__row">
            <dt>数据条数</dt>
            <dd>{{ record.extractedCount === 0 ? '未提取到数据' : record.extractedCount + ' 条数据' }}</dd>
          </div>
          <div class="task-detail__row">
            <dt>任务编号</dt>
            <dd :title="record.id">{{ record.id.slice(0, 8) }}</dd>
          </div>
        </dl>

        <section class="task-detail__fields">
          <h3 class="task-detail__section-title">AI 识别的字段</h3>
          <ul v-if="record.fields.length" class="task-detail__field-list">
            <li v-for="field in record.fields" :key="field.name" class="task-detail__field-item">
              <div class="task-detail__field-row">
                <span class="task-detail__field-name">{{ field.name }}</span>
                <code class="task-detail__field-selector">{{ field.selector }}</code>
              </div>
              <div class="task-detail__field-row">
                <span class="task-detail__field-label">置信度</span>
                <n-progress
                  type="line"
                  size="small"
                  :percentage="Math.round(field.confidence * 100)"
                  :show-indicator="true"
                />
              </div>
              <div class="task-detail__field-row">
                <span class="task-detail__field-label">样本值</span>
                <n-ellipsis :line-clamp="2" :tooltip="{ width: 'trigger' }">{{ field.sample || '（无样本）' }}</n-ellipsis>
              </div>
            </li>
          </ul>
          <p v-else class="task-detail__empty-fields">AI 还没有识别到字段</p>
        </section>

        <section class="task-detail__log">
          <h3 class="task-detail__section-title">执行日志</h3>
          <n-text depth="3" italic>详情日志即将推出</n-text>
        </section>
      </div>

      <n-empty v-else description="还没有详情" size="small">
        <template #extra>
          <n-text depth="3">点击历史卡片可查看任务详情</n-text>
        </template>
      </n-empty>

      <template #footer>
        <n-button
          type="primary"
          disabled
          title="导出功能即将推出"
          aria-label="导出数据"
        >导出数据</n-button>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  NDrawer,
  NDrawerContent,
  NTag,
  NIcon,
  NEllipsis,
  NProgress,
  NText,
  NEmpty,
  NButton
} from 'naive-ui';
import { CheckmarkCircle, AlertCircle, Reload } from '@vicons/ionicons5';
import { formatRelativeTime, formatAbsoluteTime } from '@/composables/useRelativeTime';
import type { CrawlTaskRecord } from '@/types/crawl';

const props = defineProps<{
  show: boolean;
  record: CrawlTaskRecord | null;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  export: [];
}>();

const tagType = computed(() => {
  switch (props.record?.status) {
    case 'completed': return 'success' as const;
    case 'failed': return 'error' as const;
    case 'running': return 'info' as const;
    default: return 'default' as const;
  }
});

const tagIcon = computed(() => {
  switch (props.record?.status) {
    case 'completed': return CheckmarkCircle;
    case 'failed': return AlertCircle;
    case 'running': return Reload;
    default: return CheckmarkCircle;
  }
});

const tagText = computed(() => {
  switch (props.record?.status) {
    case 'completed': return '已完成';
    case 'failed': return '失败';
    case 'running': return '进行中';
    default: return '未知';
  }
});

const title = computed(() => {
  const r = props.record;
  if (!r) return '';
  if (r.pageTitle && r.pageTitle.trim().length > 0) return r.pageTitle;
  try { return new URL(r.url).hostname; } catch { return '未命名任务'; }
});

const relativeTime = computed(() =>
  props.record ? formatRelativeTime(props.record.completedAt) : ''
);
const absoluteTime = computed(() =>
  props.record ? formatAbsoluteTime(props.record.completedAt) : ''
);
</script>

<style scoped>
.task-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.task-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.task-detail__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
}
.task-detail__meta {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.task-detail__row {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.task-detail__row dt {
  flex: 0 0 80px;
  color: #6B7280;
}
.task-detail__row dd {
  margin: 0;
  flex: 1 1 auto;
  color: #1F2937;
  word-break: break-all;
}
.task-detail__section-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
}
.task-detail__field-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.task-detail__field-item {
  padding: 8px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.task-detail__field-row {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #4B5563;
}
.task-detail__field-name {
  font-weight: 600;
  color: #1F2937;
}
.task-detail__field-selector {
  background: #F3F4F6;
  padding: 1px 6px;
  border-radius: 3px;
  font-family: ui-monospace, monospace;
  font-size: 11px;
}
.task-detail__field-label { color: #6B7280; }
.task-detail__empty-fields {
  margin: 0;
  font-size: 13px;
  color: #6B7280;
}
</style>
