import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CrawlTaskRecord } from '@/types/crawl';

const HISTORY_LIMIT = 50;

export const useCrawlStore = defineStore(
  'crawl',
  () => {
    const history = ref<CrawlTaskRecord[]>([]);
    const activeTasks = ref<CrawlTaskRecord[]>([]);
    const activeTask = ref<CrawlTaskRecord | null>(null);

    function addTask(record: CrawlTaskRecord): void {
      history.value.unshift(record);
      if (history.value.length > HISTORY_LIMIT) {
        history.value = history.value.slice(0, HISTORY_LIMIT);
      }
    }

    function removeTask(id: string): void {
      history.value = history.value.filter((t) => t.id !== id);
      activeTasks.value = activeTasks.value.filter((t) => t.id !== id);
      if (activeTask.value?.id === id) activeTask.value = null;
    }

    function getTaskById(id: string): CrawlTaskRecord | null {
      return history.value.find((t) => t.id === id) ?? null;
    }

    function setActiveTask(id: string): void {
      activeTask.value = getTaskById(id);
    }

    return {
      history,
      activeTasks,
      activeTask,
      addTask,
      removeTask,
      getTaskById,
      setActiveTask
    };
  },
  {
    persist: {
      key: 'ai-crawler:crawl-history',
      storage: localStorage,
      pick: ['history']
    }
  }
);
