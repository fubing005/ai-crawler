const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const WEEK = 604_800_000;

export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  if (diff < MINUTE) return '刚刚';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} 分钟前`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)} 天前`;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(timestamp));
}

export function formatAbsoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
