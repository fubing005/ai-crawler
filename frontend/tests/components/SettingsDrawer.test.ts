import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick, defineComponent } from 'vue';
import { NMessageProvider } from 'naive-ui';
import SettingsDrawer from '@/components/SettingsDrawer.vue';
import { useSettingsStore } from '@/stores/settings';
import { mockNotification } from '../setup-notification';

const mocks = vi.hoisted(() => ({ messageSpy: vi.fn() }));

vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('naive-ui')>();
  return {
    ...actual,
    useMessage: () => ({ success: mocks.messageSpy })
  };
});

function mountDrawer(show: boolean) {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });

  const Host = defineComponent({
    components: { SettingsDrawer, NMessageProvider },
    props: { show: { type: Boolean, required: true } },
    emits: ['update:show', 'open-privacy'],
    template: `
      <NMessageProvider>
        <SettingsDrawer
          :show="show"
          @update:show="$emit('update:show', $event)"
          @open-privacy="$emit('open-privacy')"
        />
      </NMessageProvider>
    `
  });

  const wrapper = mount(Host, {
    props: { show },
    global: {
      plugins: [pinia],
      stubs: {
        Drawer: {
          name: 'Drawer',
          props: {
            show: Boolean,
            width: [Number, String],
            placement: String,
            autoFocus: Boolean
          },
          template: '<div><slot /></div>'
        },
        DrawerContent: {
          name: 'DrawerContent',
          props: {
            title: String,
            closable: Boolean
          },
          template: '<div><slot name="title" /><slot /><slot name="footer" /></div>'
        },
        Form: { name: 'Form', template: '<form><slot /></form>' },
        FormItem: { name: 'FormItem', template: '<div class="form-item"><slot /></div>' },
        Divider: { name: 'Divider', template: '<div><slot /></div>' },
        RadioGroup: {
          name: 'RadioGroup',
          props: {
            value: String,
            ariaLabel: String
          },
          emits: ['update:value'],
          provide() {
            return {
              radioGroupCtx: {
                currentValue: () => this.value,
                select: (v: string) => this.$emit('update:value', v)
              }
            };
          },
          template: '<div class="radio-group" :data-value="value"><slot /></div>'
        },
        Radio: {
          name: 'Radio',
          props: {
            value: String,
            disabled: Boolean,
            title: String
          },
          inject: { radioGroupCtx: { default: null } },
          computed: {
            checked(): boolean {
              return !!this.radioGroupCtx && this.radioGroupCtx.currentValue() === this.value;
            }
          },
          methods: {
            onChange() {
              if (!this.disabled && this.radioGroupCtx) {
                this.radioGroupCtx.select(this.value);
              }
            }
          },
          template:
            '<input type="radio" class="radio" :value="value" :disabled="disabled" :title="title" :checked="checked" @change="onChange" />'
        },
        Switch: {
          name: 'Switch',
          props: {
            value: Boolean,
            disabled: Boolean,
            ariaLabel: String
          },
          template:
            '<button type="button" class="switch" :disabled="disabled" :aria-label="ariaLabel" @click="$emit(\'update:value\', !value)" />',
          emits: ['update:value']
        },
        CheckboxGroup: {
          name: 'CheckboxGroup',
          props: {
            value: Array,
            disabled: Boolean,
            ariaLabel: String
          },
          emits: ['update:value'],
          provide() {
            return {
              checkboxGroupCtx: {
                currentValue: () => this.value,
                toggle: (v: string) => {
                  const arr = [...(this.value as string[])];
                  const idx = arr.indexOf(v);
                  if (idx >= 0) arr.splice(idx, 1);
                  else arr.push(v);
                  this.$emit('update:value', arr);
                }
              }
            };
          },
          template: '<div class="checkbox-group" :data-disabled="String(disabled)"><slot /></div>'
        },
        Checkbox: {
          name: 'Checkbox',
          props: {
            value: String,
            label: String
          },
          inject: { checkboxGroupCtx: { default: null } },
          computed: {
            checked(): boolean {
              return !!this.checkboxGroupCtx && (this.checkboxGroupCtx.currentValue() as string[]).includes(this.value);
            }
          },
          methods: {
            onChange() {
              if (this.checkboxGroupCtx) this.checkboxGroupCtx.toggle(this.value);
            }
          },
          template:
            '<input type="checkbox" class="checkbox" :value="value" :checked="checked" @change="onChange" />'
        },
        Text: { name: 'Text', template: '<span class="text"><slot /></span>' },
        Alert: {
          name: 'Alert',
          props: {
            type: String,
            showIcon: Boolean,
            role: String
          },
          template: '<div class="alert" :data-type="type"><slot /></div>'
        },
        Button: {
          name: 'Button',
          props: {
            type: String,
            disabled: Boolean,
            text: Boolean
          },
          template:
            '<button type="button" class="btn" :disabled="disabled" :data-type="type" @click="$emit(\'click\')"><slot /></button>',
          emits: ['click']
        }
      }
    }
  });
  return wrapper;
}

describe('SettingsDrawer.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNotification.mockClear();
    mockNotification.permission = 'granted';
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
    mocks.messageSpy.mockClear();
  });

  it('renders 外观 / 通知 / 关于 group labels', () => {
    const wrapper = mountDrawer(true);
    expect(wrapper.text()).toContain('外观');
    expect(wrapper.text()).toContain('通知');
    expect(wrapper.text()).toContain('关于');
  });

  it('主题 default is light; radio click changes local only (store untouched before save)', async () => {
    const wrapper = mountDrawer(true);
    const store = useSettingsStore();
    expect(store.themePreference).toBe('light');
    const darkRadio = wrapper.findAll('input.radio').find((r) => (r.element as HTMLInputElement).value === 'dark');
    expect(darkRadio).toBeTruthy();
    await darkRadio!.trigger('change');
    await nextTick();
    const radioGroup = wrapper.find('.radio-group');
    expect(radioGroup.attributes('data-value')).toBe('dark');
    expect(store.themePreference).toBe('light');
  });

  it('语言 English radio is disabled with title=即将推出', () => {
    const wrapper = mountDrawer(true);
    const enRadio = wrapper.findAll('input.radio').find((r) => (r.element as HTMLInputElement).value === 'en');
    expect(enRadio).toBeTruthy();
    expect((enRadio!.element as HTMLInputElement).disabled).toBe(true);
    expect((enRadio!.element as HTMLInputElement).title).toBe('即将推出');
  });

  it('通知 switch off disables checkbox group', async () => {
    const wrapper = mountDrawer(true);
    const checkboxGroup = wrapper.find('.checkbox-group');
    expect(checkboxGroup.attributes('data-disabled')).toBe('false');
    const switchBtn = wrapper.find('.switch');
    expect(switchBtn.exists()).toBe(true);
    await switchBtn.trigger('click');
    await nextTick();
    const checkboxGroup2 = wrapper.find('.checkbox-group');
    expect(checkboxGroup2.attributes('data-disabled')).toBe('true');
  });

  it('保存 button disabled when no modifications', () => {
    const wrapper = mountDrawer(true);
    const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('保存'));
    expect(saveBtn).toBeTruthy();
    expect((saveBtn!.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('保存 click writes store and emits update:show=false', async () => {
    const wrapper = mountDrawer(true);
    const store = useSettingsStore();
    const darkRadio = wrapper.findAll('input.radio').find((r) => (r.element as HTMLInputElement).value === 'dark');
    await darkRadio!.trigger('change');
    await nextTick();
    const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('保存'));
    expect((saveBtn!.element as HTMLButtonElement).disabled).toBe(false);
    await saveBtn!.trigger('click');
    await nextTick();
    await nextTick();
    expect(store.themePreference).toBe('dark');
    expect(wrapper.emitted('update:show')?.some((e) => e[0] === false)).toBe(true);
    expect(mocks.messageSpy).toHaveBeenCalledWith('设置已保存', { duration: 2000 });
  });

  it('取消 click closes drawer without writing store', async () => {
    const wrapper = mountDrawer(true);
    const store = useSettingsStore();
    const initialTheme = store.themePreference;
    const darkRadio = wrapper.findAll('input.radio').find((r) => (r.element as HTMLInputElement).value === 'dark');
    await darkRadio!.trigger('change');
    await nextTick();
    const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes('取消'));
    await cancelBtn!.trigger('click');
    expect(store.themePreference).toBe(initialTheme);
    expect(wrapper.emitted('update:show')?.some((e) => e[0] === false)).toBe(true);
    expect(mocks.messageSpy).not.toHaveBeenCalled();
  });

  it('update:show=false forwarded when NDrawer emits it (Esc behavior)', async () => {
    const wrapper = mountDrawer(true);
    const drawer = wrapper.findComponent({ name: 'Drawer' });
    expect(drawer.exists()).toBe(true);
    drawer.vm.$emit('update:show', false);
    await nextTick();
    expect(wrapper.emitted('update:show')?.some((e) => e[0] === false)).toBe(true);
  });

  it('renders denied warning when permission === denied', async () => {
    mockNotification.permission = 'denied';
    const wrapper = mountDrawer(true);
    await nextTick();
    const alert = wrapper.find('.alert');
    expect(alert.exists()).toBe(true);
    expect(alert.attributes('data-type')).toBe('warning');
    expect(wrapper.text()).toContain('系统已拒绝通知权限');
  });

  it('renders unsupported warning when Notification API not defined', async () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    Object.defineProperty(globalThis, 'Notification', { value: undefined, configurable: true, writable: true });
    try {
      const wrapper = mountDrawer(true);
      await nextTick();
      const alert = wrapper.find('.alert');
      expect(alert.exists()).toBe(true);
      expect(wrapper.text()).toContain('当前环境不支持桌面通知');
    } finally {
      (globalThis as { Notification?: unknown }).Notification = original;
    }
  });

  it('renders no alert when permission === granted', async () => {
    mockNotification.permission = 'granted';
    const wrapper = mountDrawer(true);
    await nextTick();
    const alert = wrapper.find('.alert');
    expect(alert.exists()).toBe(false);
  });

  it('查看隐私声明 button emits open-privacy', async () => {
    const wrapper = mountDrawer(true);
    const privacyBtn = wrapper.findAll('button').find((b) => b.text().includes('查看隐私声明'));
    expect(privacyBtn).toBeTruthy();
    await privacyBtn!.trigger('click');
    expect(wrapper.emitted('open-privacy')).toBeTruthy();
  });

  it('shows warning text when notifications enabled but no scenes selected', async () => {
    const wrapper = mountDrawer(true);
    expect(wrapper.text()).not.toContain('请至少选择一个通知场景');
    // 默认 scenes: ['onFailure']；取消勾选 onFailure -> 空 scenes + enabled -> 显示警告
    const failureCheckbox = wrapper
      .findAll('input.checkbox')
      .find((c) => (c.element as HTMLInputElement).value === 'onFailure');
    expect(failureCheckbox).toBeTruthy();
    await failureCheckbox!.trigger('change');
    await nextTick();
    expect(wrapper.text()).toContain('请至少选择一个通知场景，否则不会显示通知');
  });
});
