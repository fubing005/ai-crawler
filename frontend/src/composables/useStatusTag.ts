import type { Component } from 'vue';
import { CheckmarkCircle, AlertCircle, Reload } from '@vicons/ionicons5';

export type CrawlStatus = 'completed' | 'failed' | 'running';

export interface StatusTagInfo {
  color: { color: string; borderColor: string; textColor: string };
  icon: Component;
  text: string;
  spinning: boolean;
}

type StatusTagEntry = StatusTagInfo;

const PALETTE: Record<CrawlStatus, StatusTagEntry> = {
  completed: {
    color: { color: '#10B981', borderColor: '#10B981', textColor: '#FFFFFF' },
    icon: CheckmarkCircle,
    text: '已完成',
    spinning: false
  },
  failed: {
    color: { color: '#EF4444', borderColor: '#EF4444', textColor: '#FFFFFF' },
    icon: AlertCircle,
    text: '失败',
    spinning: false
  },
  running: {
    color: { color: '#3B82F6', borderColor: '#3B82F6', textColor: '#FFFFFF' },
    icon: Reload,
    text: '进行中',
    spinning: true
  }
};

const FALLBACK: StatusTagEntry = {
  color: { color: '#6B7280', borderColor: '#6B7280', textColor: '#FFFFFF' },
  icon: CheckmarkCircle,
  text: '未知',
  spinning: false
};

Object.freeze(PALETTE);
Object.freeze(FALLBACK);

function cloneEntry(entry: StatusTagEntry): StatusTagInfo {
  return {
    color: { ...entry.color },
    icon: entry.icon,
    text: entry.text,
    spinning: entry.spinning
  };
}

export function useStatusTag(status: CrawlStatus | string | null | undefined): StatusTagInfo {
  if (!status || !(status in PALETTE)) return cloneEntry(FALLBACK);
  return cloneEntry(PALETTE[status as CrawlStatus]);
}
