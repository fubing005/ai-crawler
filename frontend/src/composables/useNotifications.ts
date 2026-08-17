import { ref, computed, onMounted, readonly, type Ref, type ComputedRef } from 'vue';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export interface NotifyOptions {
  body?: string;
  tag?: string;
  icon?: string;
  onClick?: (id: string) => void;
}

export interface UseNotificationsReturn {
  notify: (title: string, options?: NotifyOptions) => Notification | null;
  requestPermission: () => Promise<NotificationPermissionState>;
  permission: Readonly<Ref<NotificationPermissionState>>;
  isSupported: Readonly<ComputedRef<boolean>>;
}

function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && typeof Notification !== 'undefined';
}

// 模块级共享：多组件（SimpleView / SettingsDrawer）调用 useNotifications() 共享同一 permission 状态，
// 避免 SimpleView requestPermission 后 SettingsDrawer 的 alert 状态失真
const isSupported = computed(() => isNotificationSupported());
const permission = ref<NotificationPermissionState>('unsupported');

export function useNotifications(): UseNotificationsReturn {
  onMounted(() => {
    if (isNotificationSupported()) {
      permission.value = Notification.permission;
    } else {
      permission.value = 'unsupported';
    }
  });

  async function requestPermission(): Promise<NotificationPermissionState> {
    if (!isNotificationSupported()) {
      permission.value = 'unsupported';
      return 'unsupported';
    }
    if (permission.value === 'granted' || permission.value === 'denied') {
      return permission.value;
    }
    const result = await Notification.requestPermission();
    permission.value = result;
    return result;
  }

  function notify(title: string, options?: NotifyOptions): Notification | null {
    if (!isNotificationSupported() || permission.value !== 'granted') {
      return null;
    }
    const n = new Notification(title, {
      body: options?.body,
      tag: options?.tag,
      icon: options?.icon
    });
    if (options?.onClick && options.tag) {
      const tag = options.tag;
      const onClick = options.onClick;
      n.onclick = () => onClick(tag);
    }
    return n;
  }

  return {
    notify,
    requestPermission,
    permission: readonly(permission),
    isSupported: readonly(isSupported)
  };
}
