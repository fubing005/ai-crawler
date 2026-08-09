<template>
  <article
    class="history-card"
    tabindex="0"
    :aria-label="ariaLabel"
    @keydown.enter.prevent="emit('view')"
  >
    <div class="history-card__status">
      <n-tag :type="tagType" size="small" round>
        <template #icon>
          <n-icon :component="tagIcon" />
        </template>
        {{ tagText }}
      </n-tag>
    </div>

    <div class="history-card__body">
      <h3 class="history-card__title" :title="title">{{ title }}</h3>
      <p class="history-card__time" :title="absoluteTime">{{ relativeTime }}</p>
      <p class="history-card__count">{{ countText }}</p>
    </div>

    <div class="history-card__actions">
      <n-button size="small" type="text" aria-label="查看任务详情" @click="emit('view')">查看</n-button>
      <n-button
        size="small"
        type="text"
        :disabled="exportDisabled"
        aria-label="导出任务数据"
        @click="emit('export')"
      >导出</n-button>
      <n-button
        size="small"
        type="text"
        aria-label="删除任务"
        class="history-card__delete"
        @click="emit('delete')"
      >删除</n-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NTag, NIcon, NButton } from 'naive-ui';
import { CheckmarkCircle, AlertCircle, Reload } from '@vicons/ionicons5';
import { formatRelativeTime, formatAbsoluteTime } from '@/composables/useRelativeTime';
import type { CrawlTaskRecord } from '@/types/crawl';

const props = withDefaults(defineProps<{
  record: CrawlTaskRecord;
  exportDisabled?: boolean;
}>(), {
  exportDisabled: true
});

const emit = defineEmits<{
  view: [];
  export: [];
  delete: [];
}>();

const tagType = computed(() => {
  switch (props.record.status) {
    case 'completed': return 'success' as const;
    case 'failed': return 'error' as const;
    case 'running': return 'info' as const;
    default: return 'default' as const;
  }
});

const tagIcon = computed(() => {
  switch (props.record.status) {
    case 'completed': return CheckmarkCircle;
    case 'failed': return AlertCircle;
    case 'running': return Reload;
    default: return CheckmarkCircle;
  }
});

const tagText = computed(() => {
  switch (props.record.status) {
    case 'completed': return '已完成';
    case 'failed': return '失败';
    case 'running': return '进行中';
    default: return '未知';
  }
});

function deriveTitle(record: CrawlTaskRecord): string {
  if (record.pageTitle && record.pageTitle.trim().length > 0) {
    return record.pageTitle.slice(0, 24);
  }
  try {
    return new URL(record.url).hostname;
  } catch {
    return '未命名任务';
  }
}

const title = computed(() => deriveTitle(props.record));

const relativeTime = computed(() => formatRelativeTime(props.record.completedAt));
const absoluteTime = computed(() => formatAbsoluteTime(props.record.completedAt));

const countText = computed(() =>
  props.record.extractedCount === 0 ? '未提取到数据' : `${props.record.extractedCount} 条数据`
);

const ariaLabel = computed(() =>
  `${title.value} - 状态：${tagText.value} - ${relativeTime.value} - ${countText.value}`
);
</script>

<style scoped>
.history-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}
.history-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.history-card__status { flex: 0 0 auto; }
.history-card__body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.history-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-card__time {
  margin: 0;
  font-size: 12px;
  color: #6B7280;
}
.history-card__count {
  margin: 0;
  font-size: 12px;
  color: #4B5563;
}
.history-card__actions {
  flex: 0 0 auto;
  display: flex;
  gap: 4px;
}
.history-card__delete { color: #DC2626; }
.history-card:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
</style>
