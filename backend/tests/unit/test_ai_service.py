"""HeuristicAnalyzer / analyze_html 单元测试（不启动浏览器、不访问网络）。"""

import pytest

from backend.app.schemas.page_analysis import PageAnalysis
from backend.app.services.ai_service import HeuristicAnalyzer, analyze_html

ECOMMERCE_HTML = """
<html><head><title>示例电商商品页</title></head><body>
<main>
<h1 class="product-title">示例商品名称</h1>
<ul class="product-list">
<li class="product-item"><h3><a href="/p1">商品A</a></h3><span class="price">¥299.00</span><img src="a.jpg" alt="图A"/><p class="desc">描述A</p></li>
<li class="product-item"><h3><a href="/p2">商品B</a></h3><span class="price">¥159.00</span><img src="b.jpg" alt="图B"/><p class="desc">描述B</p></li>
<li class="product-item"><h3><a href="/p3">商品C</a></h3><span class="price">¥89.00</span><img src="c.jpg" alt="图C"/><p class="desc">描述C</p></li>
<li class="product-item"><h3><a href="/p4">商品D</a></h3><span class="price">¥459.00</span><img src="d.jpg" alt="图D"/><p class="desc">描述D</p></li>
</ul>
</main></body></html>
"""

NEWS_HTML = """
<html><head><title>示例新闻</title></head><body>
<article class="story">
<h1>新闻标题</h1>
<time datetime="2026-08-01">2026-08-01</time>
<p>第一段内容，讲述事件经过。</p>
<p>第二段内容，补充背景信息。</p>
</article></body></html>
"""

BLOG_HTML = """
<html><head><title>示例博客</title></head><body>
<article>
<h1>博客标题</h1>
<p>这是一篇较长的博文正文，包含多个段落。</p>
<p>第二个段落继续展开主题。</p>
</article></body></html>
"""

FORM_HTML = """
<html><head><title>注册</title></head><body>
<form class="signup">
<label>用户名<input name="username" type="text" placeholder="请输入用户名"/></label>
<label>邮箱<input name="email" type="email" placeholder="请输入邮箱"/></label>
<label>密码<input name="password" type="password"/></label>
<button type="submit">注册</button>
</form></body></html>
"""


def test_ecommerce_list_detected_with_fields():
    result = analyze_html(ECOMMERCE_HTML)
    assert result.detected_type == "ecommerce"
    with_selector = [f for f in result.fields if f.selector]
    assert len(with_selector) >= 3
    price = next(f for f in result.fields if f.name == "price")
    assert price.sample == "¥299.00"
    assert price.selector == "span.price"


def test_news_article_detected_with_title():
    result = analyze_html(NEWS_HTML)
    assert result.detected_type == "news"
    title = next(f for f in result.fields if f.name == "title")
    assert title.sample == "新闻标题"


def test_form_page_detected_with_controls():
    result = analyze_html(FORM_HTML)
    assert result.detected_type == "form"
    names = [f.name for f in result.fields]
    assert "input_username" in names
    assert "input_email" in names


def test_blog_article_detected():
    result = analyze_html(BLOG_HTML)
    assert result.detected_type == "blog"


def test_empty_html_returns_unknown_low_confidence():
    result = analyze_html("")
    assert result.detected_type == "unknown"
    assert result.overall_confidence < 0.7
    assert result.fields == []
    assert result.main_content_selector is None


def test_short_html_returns_unknown():
    result = analyze_html("<p>x</p>")
    assert result.detected_type == "unknown"
    assert result.overall_confidence < 0.7


def test_pure_text_page_degrades():
    result = analyze_html("只是纯文本内容，没有任何标签结构。")
    assert result.detected_type == "unknown"
    assert result.fields == []
    assert result.overall_confidence < 0.7


def test_deterministic_output():
    first = analyze_html(ECOMMERCE_HTML)
    second = analyze_html(ECOMMERCE_HTML)
    assert first.model_dump() == second.model_dump()


def test_main_content_selector_hits():
    assert analyze_html(ECOMMERCE_HTML).main_content_selector == "main"
    assert analyze_html(NEWS_HTML).main_content_selector == "article.story"
    assert analyze_html(FORM_HTML).main_content_selector == "form.signup"


def test_overall_confidence_bounds():
    for html in (ECOMMERCE_HTML, NEWS_HTML, BLOG_HTML, FORM_HTML, ""):
        conf = analyze_html(html).overall_confidence
        assert 0.0 <= conf <= 1.0
    assert analyze_html(ECOMMERCE_HTML).overall_confidence >= 0.7


def test_sample_truncated_to_40_chars():
    long_text = "字" * 100
    html = f"<html><body><main><h1>标题</h1><p class='desc'>{long_text}</p><ul>" \
           "<li class='it'>项目一</li><li class='it'>项目二</li><li class='it'>项目三</li>" \
           "</ul></main></body></html>"
    result = analyze_html(html)
    for field in result.fields:
        assert len(field.sample) <= 41


@pytest.mark.asyncio
async def test_heuristic_analyzer_async_returns_page_analysis():
    analyzer = HeuristicAnalyzer()
    result = await analyzer.analyze_page(ECOMMERCE_HTML, "https://example.com/product")
    assert isinstance(result, PageAnalysis)
    assert result.detected_type == "ecommerce"
