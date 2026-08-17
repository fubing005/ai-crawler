<template>
  <n-drawer
    :show="show"
    :width="480"
    placement="right"
    :auto-focus="true"
    @update:show="onUpdateShow"
  >
    <n-drawer-content title="界面设置" closable>
      <n-form label-placement="left" :label-width="80">
        <n-divider title-placement="left">外观</n-divider>
        <n-form-item label="主题">
          <n-radio-group v-model:value="localTheme" aria-label="主题选择">
            <n-radio value="light">浅色</n-radio>
            <n-radio value="dark">深色</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="语言">
          <n-radio-group v-model:value="localLanguage" aria-label="语言选择">
            <n-radio value="zh-CN">简体中文</n-radio>
            <n-radio value="en" disabled title="即将推出">English</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-divider title-placement="left">通知</n-divider>
        <n-form-item label="桌面通知">
          <n-switch
            v-model:value="localNotificationEnabled"
            aria-label="桌面通知开关"
            :disabled="permission === 'unsupported'"
          />
        </n-form-item>
        <n-form-item label="触发场景">
          <n-checkbox-group
            v-model:value="localScenes"
            aria-label="通知触发场景"
            :aria-describedby="localNotificationEnabled && localScenes.length === 0 ? 'notif-scenes-hint' : undefined"
            :disabled="!localNotificationEnabled"
          >
            <n-checkbox value="onComplete" label="爬取完成时通知" />
            <n-checkbox value="onFailure" label="爬取失败时通知" />
          </n-checkbox-group>
        </n-form-item>
        <n-text
          v-if="localNotificationEnabled && localScenes.length === 0"
          id="notif-scenes-hint"
          type="warning"
        >
          请至少选择一个通知场景，否则不会显示通知
        </n-text>
        <n-alert
          v-if="permission === 'denied'"
          type="warning"
          :show-icon="true"
          role="alert"
          aria-live="assertive"
        >
          系统已拒绝通知权限，请在操作系统设置中允许此应用发送通知
        </n-alert>
        <n-alert
          v-else-if="permission === 'unsupported'"
          type="warning"
          :show-icon="true"
          role="alert"
          aria-live="assertive"
        >
          当前环境不支持桌面通知，请在桌面应用中开启
        </n-alert>

        <n-divider title-placement="left">关于</n-divider>
        <n-form-item label="应用版本">
          <n-text>{{ appVersion }}</n-text>
        </n-form-item>
        <n-form-item label="隐私声明">
          <n-button text type="primary" @click="onOpenPrivacy">查看隐私声明</n-button>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-button
          type="primary"
          :disabled="!isDirty"
          @click="onSave"
        >
          保存
        </n-button>
        <n-button @click="onCancel">取消</n-button>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import {
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NRadioGroup,
  NRadio,
  NDivider,
  NSwitch,
  NCheckboxGroup,
  NCheckbox,
  NText,
  NAlert,
  NButton,
  useMessage
} from 'naive-ui';
import { useSettingsStore, type ThemePreference, type LanguagePreference } from '@/stores/settings';
import { useNotifications } from '@/composables/useNotifications';

interface Props {
  show: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  'open-privacy': [];
}>();

const settingsStore = useSettingsStore();
const message = useMessage();
const { permission } = useNotifications();

const APP_VERSION = '1.0.0';

const localTheme = ref<ThemePreference>(settingsStore.themePreference);
const localLanguage = ref<LanguagePreference>(settingsStore.languagePreference);
const localNotificationEnabled = ref<boolean>(settingsStore.notificationPreference.enabled);
const localScenes = ref<string[]>(
  [
    settingsStore.notificationPreference.onComplete ? 'onComplete' : '',
    settingsStore.notificationPreference.onFailure ? 'onFailure' : ''
  ].filter(Boolean)
);

const appVersion = APP_VERSION;

function syncLocalFromStore() {
  localTheme.value = settingsStore.themePreference;
  localLanguage.value = settingsStore.languagePreference;
  localNotificationEnabled.value = settingsStore.notificationPreference.enabled;
  localScenes.value = [
    settingsStore.notificationPreference.onComplete ? 'onComplete' : '',
    settingsStore.notificationPreference.onFailure ? 'onFailure' : ''
  ].filter(Boolean);
}

watch(
  () => props.show,
  (v) => {
    if (v) syncLocalFromStore();
  },
  { immediate: true }
);

const isDirty = computed(() => {
  return (
    localTheme.value !== settingsStore.themePreference ||
    localLanguage.value !== settingsStore.languagePreference ||
    localNotificationEnabled.value !== settingsStore.notificationPreference.enabled ||
    localScenes.value.includes('onComplete') !== settingsStore.notificationPreference.onComplete ||
    localScenes.value.includes('onFailure') !== settingsStore.notificationPreference.onFailure
  );
});

function onUpdateShow(v: boolean) {
  emit('update:show', v);
}

function onSave() {
  settingsStore.setTheme(localTheme.value);
  settingsStore.setLanguage(localLanguage.value);
  settingsStore.setNotificationPreference({
    enabled: localNotificationEnabled.value,
    onComplete: localScenes.value.includes('onComplete'),
    onFailure: localScenes.value.includes('onFailure')
  });
  emit('update:show', false);
  void nextTick(() => {
    message.success('设置已保存', { duration: 2000 });
  });
}

function onCancel() {
  emit('update:show', false);
}

function onOpenPrivacy() {
  emit('open-privacy');
}

function onKeydownS(e: KeyboardEvent) {
  if (!props.show) return;
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    if (isDirty.value) onSave();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydownS);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydownS);
});
</script>
