<template>
  <div class="privacy-consent">
    <n-card class="privacy-consent__card" :bordered="false" size="large">
      <template #header>
        <h1 class="privacy-consent__title">隐私保护说明</h1>
      </template>
      <n-tabs
        v-model:value="activeTab"
        type="line"
        animated
        :tabs-padding="0"
      >
        <n-tab-pane name="summary" tab="摘要">
          <div class="privacy-consent__section">
            <p class="privacy-consent__lead">
              我们重视您的隐私。本应用在您的电脑上运行，
              所有爬取到的数据都保存在本地，不会上传到任何云端服务器。
            </p>
            <ul class="privacy-consent__list">
              <li>不收集您的个人身份信息</li>
              <li>不向我们的服务器发送使用数据</li>
              <li>API 密钥使用系统密钥环加密保存</li>
              <li>静态数据使用 AES-256 加密</li>
            </ul>
            <n-collapse>
              <n-collapse-item title="查看完整隐私政策" name="full">
                <div class="privacy-consent__full">
                  <p>本应用遵循 GDPR（欧盟通用数据保护条例）、CCPA（加州消费者隐私法）以及中华人民共和国个人信息保护法（PIPL）。</p>
                  <p>首次使用前请确认您已阅读并同意上述政策。您可以随时在设置中查看完整文本，并选择退出数据采集（如有）。</p>
                </div>
              </n-collapse-item>
            </n-collapse>
          </div>
        </n-tab-pane>
        <n-tab-pane name="full" tab="完整政策">
          <div class="privacy-consent__full">
            <p>完整政策文本由 PM 团队后续交付。本占位仅作首次确认用途。</p>
            <p>关键词：本地部署、零上传、加密存储、90 天审计日志、可删除。</p>
          </div>
        </n-tab-pane>
      </n-tabs>

      <div class="privacy-consent__actions">
        <n-checkbox v-model:checked="agreed" class="privacy-consent__agree">
          我已阅读并同意隐私政策
        </n-checkbox>
        <div class="privacy-consent__buttons">
          <n-button tertiary @click="onDecline">拒绝并退出</n-button>
          <n-button
            type="primary"
            :disabled="!agreed"
            @click="onAccept"
            aria-label="同意并进入应用"
          >同意并开始</n-button>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NCard, NTabs, NTabPane, NButton, NCheckbox, NCollapse, NCollapseItem } from 'naive-ui';
import { useOnboardingStore } from '@/stores/onboarding';

const router = useRouter();
const onboarding = useOnboardingStore();
const activeTab = ref<'summary' | 'full'>('summary');
const agreed = ref(false);

onMounted(async () => {
  if (!onboarding.privacyConsented) {
    await onboarding.loadInitial();
  }
});

async function onAccept() {
  if (!agreed.value) return;
  await onboarding.acceptPrivacy();
  router.replace({ name: 'welcome' });
}

function onDecline() {
  onboarding.declinePrivacy();
  // 仅通过 IPC 通知 Main 进程退出；不在 renderer 侧执行 window.close() 避免竞态
  if (window.electronAPI) {
    try {
      window.electronAPI.reportStartupTime(-1);
    } catch {
      // 静默
    }
  }
  // UI 显示提示（Main 进程 quit 会在 IPC 触发后立即关闭窗口）
  agreed.value = false;
  alert('已拒绝隐私协议。应用即将退出。');
}
</script>

<style scoped>
.privacy-consent {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #EFF6FF 0%, #ffffff 100%);
  padding: 32px;
  box-sizing: border-box;
}
.privacy-consent__card {
  max-width: 720px;
  width: 100%;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  border-radius: 12px;
}
.privacy-consent__title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #1E3A8A;
}
.privacy-consent__section { padding: 8px 0; }
.privacy-consent__lead {
  font-size: 15px;
  line-height: 1.75;
  color: #1F2937;
  margin-bottom: 16px;
}
.privacy-consent__list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}
.privacy-consent__list li {
  position: relative;
  padding-left: 24px;
  font-size: 14px;
  line-height: 2;
  color: #374151;
}
.privacy-consent__list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #3B82F6;
  font-weight: 700;
}
.privacy-consent__full {
  font-size: 13px;
  line-height: 1.75;
  color: #4B5563;
}
.privacy-consent__actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.privacy-consent__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
