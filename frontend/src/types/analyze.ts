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
