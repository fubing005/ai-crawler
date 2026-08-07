import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ViewPreference = 'simple' | 'dashboard' | 'professional';

export const useUiStore = defineStore(
  'ui',
  () => {
    const viewPreference = ref<ViewPreference>('simple');

    function setViewPreference(value: ViewPreference) {
      viewPreference.value = value;
    }

    return { viewPreference, setViewPreference };
  },
  {
    persist: {
      key: 'ai-crawler:view-preference',
      storage: localStorage,
      pick: ['viewPreference']
    }
  }
);
