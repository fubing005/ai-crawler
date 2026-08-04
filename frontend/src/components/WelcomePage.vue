<template>
  <div class="welcome">
    <header class="welcome__hero">
      <h1 class="welcome__logo">AI 爬虫</h1>
      <p class="welcome__tagline">让数据触手可及</p>
      <p class="welcome__hint">
        检查您的电脑是否已准备好 · 预计耗时 5 分钟
      </p>
    </header>

    <main class="welcome__cards">
      <article
        class="welcome__card welcome__card--primary"
        tabindex="0"
        role="button"
        aria-label="快速开始"
        @click="onQuick"
        @keydown.enter="onQuick"
      >
        <div class="welcome__card-icon">⚡</div>
        <h2 class="welcome__card-title">快速开始</h2>
        <p class="welcome__card-desc">
          5 步带您完成首次爬取，自动配置常用选项。
        </p>
        <n-button type="primary" size="large" block>开始</n-button>
      </article>

      <article
        class="welcome__card welcome__card--secondary"
        tabindex="0"
        role="button"
        aria-label="详细配置"
        @click="onDetailed"
        @keydown.enter="onDetailed"
      >
        <div class="welcome__card-icon">⚙️</div>
        <h2 class="welcome__card-title">详细配置</h2>
        <p class="welcome__card-desc">
          手动设置 AI 助手、反爬、存储路径等高级选项。
        </p>
        <n-button tertiary size="large" block>设置</n-button>
      </article>
    </main>

    <footer class="welcome__footer">
      <n-button text tertiary @click="onSkipToSimple">跳过向导，直接进入简洁视图</n-button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { NButton } from 'naive-ui';
import { useOnboardingStore } from '@/stores/onboarding';

const router = useRouter();
const onboarding = useOnboardingStore();

function onQuick() {
  onboarding.setWizardVariant('minimal');
  router.push({ name: 'wizard' });
}

function onDetailed() {
  onboarding.setWizardVariant('detailed');
  router.push({ name: 'wizard' });
}

function onSkipToSimple() {
  onboarding.skipWizard();
  router.replace({ name: 'simple-view' });
}
</script>

<style scoped>
.welcome {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: linear-gradient(180deg, #EFF6FF 0%, #ffffff 100%);
  gap: 40px;
}
.welcome__hero { text-align: center; }
.welcome__logo {
  font-size: 56px;
  font-weight: 700;
  color: #1E40AF;
  letter-spacing: 4px;
  margin: 0 0 8px 0;
}
.welcome__tagline {
  font-size: 20px;
  color: #1F2937;
  margin: 0 0 12px 0;
}
.welcome__hint {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}
.welcome__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 320px));
  gap: 24px;
}
.welcome__card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.welcome__card:hover,
.welcome__card:focus-visible,
.welcome__card:focus {
  border-color: #3B82F6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  background: #EFF6FF;
  outline: none;
}
.welcome__card-icon { font-size: 48px; line-height: 1; }
.welcome__card-title { font-size: 22px; font-weight: 600; margin: 0; color: #1E3A8A; }
.welcome__card-desc { font-size: 14px; color: #6B7280; margin: 0 0 16px 0; text-align: center; }
.welcome__footer { margin-top: 8px; }
</style>
