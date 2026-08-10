import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CrawlTaskRecord } from '@/types/crawl';

const HISTORY_LIMIT = 50;
const TICK_INTERVAL_MS = 30_000;

export const useCrawlStore = defineStore(
  'crawl',
  () => {
    const history = ref<CrawlTaskRecord[]>([]);
    const activeTasks = ref<CrawlTaskRecord[]>([]);
    const activeTask = ref<CrawlTaskRecord | null>(null);
    const nowTimestamp = ref<number>(Date.now());
    const nowTick = computed(() => nowTimestamp.value);

    let tickTimer: ReturnType<typeof setInterval> | null = null;
    let activeTickers = 0;

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

    function restoreTask(task: CrawlTaskRecord, neighborId: string | null): void {
      if (neighborId === null) {
        history.value.push(task);
        return;
      }
      const insertIdx = history.value.findIndex((t) => t.id === neighborId);
      if (insertIdx === -1) {
        history.value.unshift(task);
        return;
      }
      history.value.splice(insertIdx, 0, task);
    }

    function startTick(): void {
      activeTickers++;
      if (tickTimer === null) {
        nowTimestamp.value = Date.now();
        tickTimer = setInterval(() => {
          nowTimestamp.value = Date.now();
        }, TICK_INTERVAL_MS);
      }
    }

    function stopTick(): void {
      activeTickers = Math.max(0, activeTickers - 1);
      if (activeTickers === 0 && tickTimer !== null) {
        clearInterval(tickTimer);
        tickTimer = null;
      }
    }

    return {
      history,
      activeTasks,
      activeTask,
      nowTimestamp: nowTick,
      addTask,
      removeTask,
      getTaskById,
      setActiveTask,
      restoreTask,
      startTick,
      stopTick
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
