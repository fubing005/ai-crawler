import type { AnalyzedField } from './analyze';

export type CrawlTaskStatus = 'completed' | 'failed' | 'running';

export interface CrawlTaskRecord {
  id: string;
  url: string;
  pageTitle: string;
  extractedCount: number;
  completedAt: number;
  status: CrawlTaskStatus;
  fields: AnalyzedField[];
}
