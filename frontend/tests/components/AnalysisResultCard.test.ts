import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AnalysisResultCard from '@/components/simple/AnalysisResultCard.vue';
import type { AnalyzeResponse } from '@/types/analyze';

function makeResult(overrides: Partial<AnalyzeResponse> = {}): AnalyzeResponse {
  return {
    fields: [
      { name: 'title', selector: 'h1.product-title', confidence: 0.95, sample: '示例商品名称' },
      { name: 'price', selector: 'span.price', confidence: 0.92, sample: '¥299.00' },
      { name: 'image', selector: 'img.pic', confidence: 0.85, sample: 'https://example.com/img.jpg' }
    ],
    page_title: '示例电商商品页',
    detected_type: 'ecommerce',
    overall_confidence: 0.9,
    main_content_selector: 'ul.product-list',
    ...overrides
  };
}

function mountCard(result: AnalyzeResponse) {
  return mount(AnalysisResultCard, { props: { result } });
}

describe('AnalysisResultCard.vue', () => {
  it('渲染五种页面类型标签文案', () => {
    const cases: [AnalyzeResponse['detected_type'], string][] = [
      ['ecommerce', '电商商品列表'],
      ['news', '新闻资讯'],
      ['blog', '博客文章'],
      ['form', '用户表单'],
      ['unknown', '未识别']
    ];
    for (const [type, label] of cases) {
      const wrapper = mountCard(makeResult({ detected_type: type }));
      expect(wrapper.text()).toContain(label);
    }
  });

  it('置信度按四档映射标签颜色', () => {
    const wrapper = mountCard(
      makeResult({
        fields: [
          { name: 'a', selector: 'a', confidence: 0.95, sample: '' },
          { name: 'b', selector: 'b', confidence: 0.85, sample: '' },
          { name: 'c', selector: 'c', confidence: 0.75, sample: '' },
          { name: 'd', selector: 'd', confidence: 0.5, sample: '' }
        ]
      })
    );
    const tags = wrapper.findAll('.analysis-card__field .n-tag');
    // naive-ui 2.38 通过 CSS 变量渲染类型色，无类型 class
    expect(tags[0].attributes('style')).toContain('--n-text-color: #18a058');
    expect(tags[1].attributes('style')).toContain('--n-text-color: #2080f0');
    expect(tags[2].attributes('style')).toContain('--n-text-color: #f0a020');
    expect(tags[3].attributes('style')).toContain('--n-text-color: #d03050');
  });

  it('渲染推荐字段列表并截断超长示例值', () => {
    const longSample = '长'.repeat(100);
    const wrapper = mountCard(
      makeResult({
        fields: [{ name: 'description', selector: 'div.d', confidence: 0.8, sample: longSample }]
      })
    );
    expect(wrapper.findAll('.analysis-card__field')).toHaveLength(1);
    const sampleEl = wrapper.find('.analysis-card__field-sample');
    expect(sampleEl.text()).toContain('…');
    expect(sampleEl.text().length).toBeLessThanOrEqual(41);
  });

  it('整体置信度低于 0.7 时显示不确定警告且带 role=alert', () => {
    const wrapper = mountCard(makeResult({ overall_confidence: 0.5 }));
    expect(wrapper.text()).toContain('分析结果不确定，建议手动确认要提取的内容');
    expect(wrapper.text()).not.toContain('分析完成');
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  });

  it('整体置信度不低于 0.7 时显示分析完成标签', () => {
    const wrapper = mountCard(makeResult({ overall_confidence: 0.7 }));
    expect(wrapper.text()).toContain('分析完成');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('main_content_selector 为 null 时不渲染主要内容区域行', () => {
    const withRow = mountCard(makeResult());
    expect(withRow.text()).toContain('主要内容区域');
    const withoutRow = mountCard(makeResult({ main_content_selector: null }));
    expect(withoutRow.text()).not.toContain('主要内容区域');
  });

  it('可访问性 aria-label 存在', () => {
    const wrapper = mountCard(makeResult({ overall_confidence: 0.92 }));
    expect(wrapper.find('[aria-label="分析结果"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="置信度 92%"]').exists()).toBe(true);
  });
});
