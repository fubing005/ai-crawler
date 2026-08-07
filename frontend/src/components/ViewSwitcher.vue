<template>
  <div class="view-switcher" role="group" aria-label="视图切换">
    <n-button-group>
      <n-button
        :type="modelValue === 'simple' ? 'primary' : 'default'"
        :aria-pressed="modelValue === 'simple'"
        @click="onSelect('simple')"
      >
        简洁视图
      </n-button>
      <n-button
        :type="modelValue === 'dashboard' ? 'primary' : 'default'"
        aria-disabled="true"
        disabled
        title="由 Epic 4 交付"
        @click="onSelect('dashboard')"
      >
        仪表板视图
      </n-button>
      <n-button
        :type="modelValue === 'professional' ? 'primary' : 'default'"
        aria-disabled="true"
        disabled
        title="由 Epic 4 交付"
        @click="onSelect('professional')"
      >
        专业视图
      </n-button>
    </n-button-group>
  </div>
</template>

<script setup lang="ts">
import { NButton, NButtonGroup } from 'naive-ui';
import { useUiStore, type ViewPreference } from '@/stores/ui';

interface Props {
  modelValue: ViewPreference;
}
const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: ViewPreference] }>();
const uiStore = useUiStore();

function onSelect(view: ViewPreference) {
  if (view === 'simple') {
    if (props.modelValue !== 'simple') {
      emit('update:modelValue', 'simple');
      uiStore.setViewPreference('simple');
    }
  }
}
</script>

<style scoped>
.view-switcher { display: inline-flex; }
.view-switcher :deep(.n-button):focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
</style>
