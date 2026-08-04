export function useStartupTelemetry() {
  const reportStartupTime = (rendererTimeMs: number) => {
    if (typeof window === 'undefined' || !window.electronAPI?.reportStartupTime) {
      return;
    }
    try {
      window.electronAPI.reportStartupTime(rendererTimeMs);
    } catch {
      // 静默失败 — 启动埋点不应阻断业务
    }
  };

  return { reportStartupTime };
}
