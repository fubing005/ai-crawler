<template>
  <div class="simple-view">
    <header class="simple-view__header">
      <h1 class="simple-view__title">简洁视图</h1>
      <p class="simple-view__subtitle">
        粘贴网址即可开始爬取
      </p>
    </header>
    <main class="simple-view__body">
      <n-input-group class="simple-view__input-group">
        <n-input
          v-model:value="url"
          placeholder="粘贴网址，例如 https://example.com/product"
          size="large"
          clearable
          aria-label="网址"
        />
        <n-button type="primary" size="large" :loading="loading" @click="onStart">开始爬取</n-button>
      </n-input-group>
      <p v-if="hint" class="simple-view__hint" role="status">{{ hint }}</p>
      <n-empty
        v-else
        class="simple-view__hint"
        description="尚未开始爬取。粘贴网址后将自动分析页面字段。"
        size="small"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NInput, NButton, NInputGroup, NEmpty } from 'naive-ui';

const url = ref('');
const loading = ref(false);
const hint = ref('');

async function onStart() {
  if (!url.value) {
    hint.value = '请先粘贴网址。';
    return;
  }
  try {
    new URL(url.value);
  } catch {
    hint.value = '网址格式不正确，请检查后再试。';
    return;
  }
  loading.value = true;
  hint.value = '正在准备爬取…';
  await new Promise((r) => setTimeout(r, 600));
  hint.value = `已收到网址：${url.value}（完整爬取功能由 Epic 2 交付）`;
  loading.value = false;
}
</script>

<style scoped>
.simple-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #F9FAFB;
  gap: 32px;
}
.simple-view__header { text-align: center; }
.simple-view__title { font-size: 28px; font-weight: 600; color: #1E40AF; margin: 0 0 8px 0; }
.simple-view__subtitle { font-size: 16px; color: #6B7280; margin: 0; }
.simple-view__body { width: 100%; max-width: 720px; }
.simple-view__input-group { display: flex; gap: 8px; }
.simple-view__hint { margin-top: 12px; font-size: 13px; color: #4B5563; text-align: center; }
</style>
