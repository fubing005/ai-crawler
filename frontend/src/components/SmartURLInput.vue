<template>
  <div class="smart-url-input">
    <n-input-group class="smart-url-input__group">
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
      >
        <template #prefix>
          <n-icon :component="GlobeOutline" aria-hidden="true" />
        </template>
      </n-input>
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
import { ref, watch, computed, nextTick } from 'vue';
import { NInput, NButton, NInputGroup, NIcon, NTag } from 'naive-ui';
import { GlobeOutline } from '@vicons/ionicons5';

export type UrlStatus = 'empty' | 'valid' | 'invalid' | 'loading';
export type SubmitPhase = 'idle' | 'analyzing' | 'extracting' | 'completed';

interface Props {
  modelValue: string;
  examples?: string[];
  loading?: boolean;
  phase?: SubmitPhase;
  placeholder?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  examples: () => [],
  loading: false,
  phase: 'idle',
  placeholder: '粘贴网址，例如 https://example.com/product',
  ariaLabel: '网址'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  submit: [value: string];
}>();

const url = ref<string>(props.modelValue);
const status = ref<UrlStatus>('empty');
const inputRef = ref<InstanceType<typeof NInput> | null>(null);

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
.smart-url-input__chip:focus-visible,
.smart-url-input :deep(.n-button):focus-visible,
.smart-url-input :deep(.n-input .n-input__input-el):focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
</style>
