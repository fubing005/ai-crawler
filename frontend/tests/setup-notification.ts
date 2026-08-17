import { vi, beforeEach, afterEach } from 'vitest';

type MockNotificationCtor = ((title: string, options?: NotificationOptions) => {
  title: string;
  body: string;
  tag: string;
  onclick: null | (() => void);
  close: ReturnType<typeof vi.fn>;
}) & {
  permission: NotificationPermission;
  requestPermission: ReturnType<typeof vi.fn>;
};

const mockNotification = vi.fn().mockImplementation((title: string, options?: NotificationOptions) => {
  const inst = {
    title,
    body: options?.body ?? '',
    tag: options?.tag ?? '',
    onclick: null as null | (() => void),
    close: vi.fn()
  };
  return inst;
}) as unknown as MockNotificationCtor;
mockNotification.permission = 'default';
mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');

export { mockNotification };

beforeEach(() => {
  vi.stubGlobal('Notification', mockNotification);
});

afterEach(() => {
  vi.unstubAllGlobals();
});
