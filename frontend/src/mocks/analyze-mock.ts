import type { AnalyzeResponse } from '@/types/analyze';

export const mockAnalyzeResponse: AnalyzeResponse = {
  page_title: '示例电商商品页',
  detected_type: 'ecommerce',
  fields: [
    { name: 'title', selector: 'h1.product-title', confidence: 0.95, sample: '示例商品名称' },
    { name: 'price', selector: 'span.price', confidence: 0.92, sample: '¥299.00' },
    { name: 'image', selector: 'img.product-image', confidence: 0.88, sample: 'https://example.com/img.jpg' },
    { name: 'description', selector: 'div.description', confidence: 0.85, sample: '示例商品描述…' }
  ]
};

export const mockExamples: string[] = [
  'https://example.com/product',
  'https://news.example.com/article',
  'https://blog.example.com/post'
];

export const mockAnalyzedFields: string[] = mockAnalyzeResponse.fields.map((f) => f.name);
