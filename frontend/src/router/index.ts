import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { useOnboardingStore } from '@/stores/onboarding';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/components/PrivacyConsent.vue')
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('@/components/WelcomePage.vue')
  },
  {
    path: '/wizard',
    name: 'wizard',
    component: () => import('@/components/FirstTimeWizard.vue')
  },
  {
    path: '/simple-view',
    name: 'simple-view',
    component: () => import('@/views/SimpleView.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

let initialLoaded = false;

// 路由守卫：首次启动先弹隐私同意，再进入欢迎页/向导
router.beforeEach(async (to) => {
  if (!window.electronAPI) return true;
  const onboarding = useOnboardingStore();
  if (!initialLoaded) {
    await onboarding.loadInitial();
    initialLoaded = true;
  }

  if (to.name === 'privacy') return true;
  const consented = onboarding.privacyConsented;
  if (!consented) {
    return { name: 'privacy' };
  }
  if (to.name === 'welcome' && onboarding.wizardSkipped) {
    return { name: 'simple-view' };
  }
  return true;
});

export default router;
