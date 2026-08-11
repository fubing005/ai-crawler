<template>
  <div class="smart-url-input">
    <n-input-group class="smart-url-input__group">
      <n-popover
        placement="bottom-start"
        trigger="manual"
        :show="showHistory && historyItems.length > 0"
        :show-arrow="false"
      >
        <template #trigger>
          <n-input
            ref="inputRef"
            v-model:value="url"
            :placeholder="placeholder"
            size="large"
            :status="status"
            :input-props="inputProps"
            clearable
            @keydown.enter.ctrl="onSubmit"
            @keydown.enter.meta="onSubmit"
            @focus="onFocus"
            @blur="onBlur"
          >
            <template #prefix>
              <n-icon :component="GlobeOutline" aria-hidden="true" />
            </template>
          </n-input>
        </template>
        <ul class="smart-url-input__history" role="listbox" aria-label="历史网址">
          <li
            v-for="item in historyItems.slice(0, 5)"
            :key="item.url"
            role="option"
            tabindex="0"
            class="smart-url-input__history-item"
            @click="onHistoryClick(item.url)"
            @keydown.enter.prevent="onHistoryClick(item.url)"
          >
            <span class="smart-url-input__history-host">{{ hostOf(item.url) }}</span>
            <span class="smart-url-input__history-time">{{ formatRelativeTime(item.completedAt) }}</span>
          </li>
        </ul>
      </n-popover>
      <n-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="isInvalid || loading"
        @click="onSubmit"
      >
        {{ buttonText }}
      </n-button>
    </n-input-group>

    <div v-if="examples.length" class="smart-url-input__examples">
      <n-tag
        v-for="example in examples"
        :key="example"
        tabindex="0"
        checkable
        :checked="url === example"
        class="smart-url-input__chip"
        @click="onExampleClick(example)"
        @keydown.enter.prevent="onExampleClick(example)"
      >
        {{ example }}
      </n-tag>
    </div>

    <p
      v-if="isInvalid"
      id="smart-url-error"
      class="smart-url-input__error"
      role="status"
      aria-live="polite"
    >
      网址格式不正确，请检查后再试。
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue';
import { NInput, NButton, NInputGroup, NIcon, NTag, NPopover } from 'naive-ui';
import { GlobeOutline } from '@vicons/ionicons5';
import { formatRelativeTime } from '@/composables/useRelativeTime';

export type UrlStatus = 'empty' | 'valid' | 'invalid' | 'loading';
export type SubmitPhase = 'idle' | 'analyzing' | 'extracting' | 'completed';

export interface HistoryItem {
  url: string;
  completedAt: number;
}

interface Props {
  modelValue: string;
  examples?: string[];
  loading?: boolean;
  phase?: SubmitPhase;
  placeholder?: string;
  ariaLabel?: string;
  historyItems?: HistoryItem[];
}

const props = withDefaults(defineProps<Props>(), {
  examples: () => [],
  loading: false,
  phase: 'idle',
  placeholder: '粘贴网址，例如 https://example.com/product',
  ariaLabel: '网址',
  historyItems: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  submit: [value: string];
}>();

const url = ref<string>(props.modelValue);
const status = ref<UrlStatus>('empty');
const inputRef = ref<InstanceType<typeof NInput> | null>(null);
const showHistory = ref(false);
let blurTimer: number | null = null;

const buttonText = computed(() => {
  if (props.phase === 'analyzing') return '正在分析…';
  if (props.phase === 'extracting') return '正在爬取…';
  if (props.phase === 'completed') return '完成';
  return '开始爬取';
});
const isInvalid = computed(() => status.value === 'invalid');
const inputProps = computed(() => ({
  'aria-label': props.ariaLabel,
  'aria-invalid': isInvalid.value ? 'true' : undefined,
  'aria-describedby': isInvalid.value ? 'smart-url-error' : undefined
}));

function validate(value: string): UrlStatus {
  if (!value || value.trim() === '') return 'empty';
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'invalid';
    if (!parsed.hostname || /\s/.test(parsed.hostname)) return 'invalid';
    return 'valid';
  } catch {
    return 'invalid';
  }
}

function syncStatus(value: string) {
  status.value = props.loading ? 'loading' : validate(value);
}

watch(
  () => props.modelValue,
  (value) => {
    if (value !== url.value) url.value = value;
    syncStatus(value);
  },
  { immediate: true }
);

watch(url, (value) => {
  syncStatus(value);
  emit('update:modelValue', value);
});

watch(
  () => props.loading,
  (loading) => {
    if (loading) status.value = 'loading';
    else status.value = validate(url.value);
  }
);

function onSubmit() {
  if (props.loading) return;
  const next = validate(url.value);
  status.value = next;
  if (next === 'invalid') return;
  emit('submit', url.value.trim());
}

function onExampleClick(example: string) {
  url.value = example;
  emit('update:modelValue', example);
  void nextTick(() => {
    syncStatus(example);
    focusInput();
  });
}

function onFocus() {
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }
  showHistory.value = props.historyItems.length > 0;
}

function onBlur() {
  if (blurTimer) clearTimeout(blurTimer);
  blurTimer = window.setTimeout(() => {
    showHistory.value = false;
    blurTimer = null;
  }, 150);
}

onBeforeUnmount(() => {
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }
});

function onHistoryClick(value: string) {
  url.value = value;
  emit('update:modelValue', value);
  void nextTick(() => {
    try {
      syncStatus(value);
      focusInput();
    } catch (e) {
      console.warn('onHistoryClick error', e);
    } finally {
      showHistory.value = false;
    }
  });
}

function hostOf(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function focusInput() {
  const el = inputRef.value as unknown as { focus?: () => void } | null;
  if (el && typeof el.focus === 'function') el.focus();
}
</script>

<style scoped>
.smart-url-input {
  width: 100%;
  max-width: 800px;
}
.smart-url-input__group { display: flex; }
.smart-url-input__examples {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.smart-url-input__chip {
  cursor: pointer;
}
.smart-url-input__error {
  margin-top: 8px;
  font-size: 13px;
  color: #DC2626;
}
.smart-url-input__history {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  min-width: 240px;
  max-width: 360px;
}
.smart-url-input__history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #1F2937;
  border-radius: 4px;
}
.smart-url-input__history-item:hover,
.smart-url-input__history-item:focus-visible {
  background: #F3F4F6;
  outline: none;
}
.smart-url-input__history-host {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.smart-url-input__history-time {
  flex: 0 0 auto;
  font-size: 12px;
  color: #6B7280;
}
.smart-url-input__chip:focus-visible,
.smart-url-input :deep(.n-button):focus-visible,
.smart-url-input :deep(.n-input .n-input__input-el):focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
</style>
