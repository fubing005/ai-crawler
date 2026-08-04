<template>
  <n-config-provider :locale="zhCN" :theme="theme">
    <n-message-provider>
      <n-notification-provider>
        <router-view />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { zhCN, darkTheme, type GlobalTheme } from 'naive-ui';
import { useStartupTelemetry } from '@/composables/useStartupTelemetry';

const theme = ref<GlobalTheme | null>(null);
const { reportStartupTime } = useStartupTelemetry();

onMounted(() => {
  // did-finish-load 近似：renderer 已 mounted，回传 Main 进程合成 startup_ms
  const t2 = performance.now();
  reportStartupTime(t2);
});
</script>
