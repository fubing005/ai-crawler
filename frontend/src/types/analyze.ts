export interface AnalyzedField {
  name: string;
  selector: string;
  confidence: number;
  sample: string;
}

export interface AnalyzeResponse {
  fields: AnalyzedField[];
  page_title: string;
  detected_type: 'ecommerce' | 'news' | 'blog' | 'unknown';
}

export type CrawlStage = 'analyzing' | 'extracting' | 'completed' | 'failed';

export interface CrawlProgressEvent {
  event: 'crawl_progress';
  data: {
    task_id: string;
    progress: number;
    stage: CrawlStage;
    extracted_count: number;
  };
}

export interface CrawlCompletedEvent {
  event: 'task_completed';
  data: {
    task_id: string;
    extracted_count: number;
  };
}
