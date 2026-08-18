"""页面结构分析服务：AIProvider 抽象 + Phase 1 确定性启发式分析器。"""

import asyncio
import re
from abc import ABC, abstractmethod
from collections import defaultdict
from html.parser import HTMLParser

from backend.app.core.errors import AnalysisTimeoutError
from backend.app.schemas.page_analysis import AnalyzedField, PageAnalysis
from backend.app.services import page_fetcher

FETCH_TIMEOUT_SECONDS = 7.0

_PRICE_PATTERN = re.compile(r"[¥$€]\s*\d[\d,.]*")
_DATE_PATTERN = re.compile(r"\d{4}[-/年]\d{1,2}[-/月]\d{1,2}|datetime", re.IGNORECASE)
_VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}
_LIST_TAGS = {"li", "div", "article", "tr", "a", "section"}


class AIProvider(ABC):
    @abstractmethod
    async def analyze_page(self, html: str, url: str) -> PageAnalysis:
        """分析页面 HTML，返回结构化分析结果。"""


class _Node:
    __slots__ = ("tag", "attrs", "children", "parent")

    def __init__(self, tag: str, attrs: dict | None = None, parent=None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children: list = []
        self.parent = parent

    @property
    def classes(self) -> list[str]:
        return (self.attrs.get("class") or "").split()

    def text(self) -> str:
        parts = []
        for child in self.children:
            if isinstance(child, str):
                parts.append(child)
            else:
                parts.append(child.text())
        return " ".join(p for p in (s.strip() for s in parts) if p)

    def iter_elements(self):
        for child in self.children:
            if not isinstance(child, str):
                yield child
                yield from child.iter_elements()


class _TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = _Node("root")
        self._stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = _Node(tag, dict(attrs), self._stack[-1])
        self._stack[-1].children.append(node)
        if tag not in _VOID_TAGS:
            self._stack.append(node)

    def handle_startendtag(self, tag, attrs):
        node = _Node(tag, dict(attrs), self._stack[-1])
        self._stack[-1].children.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self._stack) - 1, 0, -1):
            if self._stack[i].tag == tag:
                del self._stack[i:]
                return

    def handle_data(self, data):
        stripped = data.strip()
        if stripped:
            self._stack[-1].children.append(stripped)


def _find_all(root: _Node, tag: str) -> list[_Node]:
    return [node for node in root.iter_elements() if node.tag == tag]


def _selector_for(node: _Node) -> str:
    if node.classes:
        return f"{node.tag}.{node.classes[0]}"
    return node.tag


def _find_largest_cluster(root: _Node) -> tuple[_Node | None, list[_Node]]:
    best_parent, best_items = None, []
    best_score = 0
    seen_parents = set()
    for node in root.iter_elements():
        if id(node) in seen_parents:
            continue
        groups: dict[tuple, list] = defaultdict(list)
        for child in node.children:
            if isinstance(child, _Node) and child.tag in _LIST_TAGS:
                groups[(child.tag, tuple(child.classes))].append(child)
        for (tag, _), items in groups.items():
            if len(items) < 3:
                continue
            for item in items:
                seen_parents.add(id(item))
            score = sum(len(item.text()) for item in items)
            if score > best_score:
                best_score = score
                best_parent, best_items = node, items
    return best_parent, best_items


class HeuristicAnalyzer(AIProvider):
    async def analyze_page(self, html: str, url: str) -> PageAnalysis:
        return analyze_html(html, url)


def analyze_html(html: str, url: str = "") -> PageAnalysis:
    builder = _TreeBuilder()
    builder.feed(html)
    root = builder.root

    page_title = _extract_title(root)
    forms = _find_all(root, "form")
    form_controls = _collect_form_controls(forms)
    cluster_parent, cluster_items = _find_largest_cluster(root)
    semantic_main = _find_semantic_main(root)

    price_match = _PRICE_PATTERN.search(root.text())
    has_date = bool(_DATE_PATTERN.search(root.text()) or _find_date_attr(root))
    article_nodes = _find_all(root, "article")

    detected_type = _detect_type(
        form_controls=form_controls,
        cluster_items=cluster_items,
        price_match=price_match,
        has_date=has_date,
        article_nodes=article_nodes,
    )

    fields = _build_fields(
        root=root,
        cluster_items=cluster_items,
        form_controls=form_controls,
        price_match=price_match,
        semantic_main=semantic_main,
    )

    main_content_selector = _main_content_selector(semantic_main, cluster_parent, forms)

    overall = _overall_confidence(
        detected_type=detected_type,
        fields=fields,
        cluster_items=cluster_items,
        form_controls=form_controls,
        semantic_main=semantic_main,
    )

    return PageAnalysis(
        fields=fields,
        page_title=page_title,
        detected_type=detected_type,
        overall_confidence=overall,
        main_content_selector=main_content_selector,
    )


def _extract_title(root: _Node) -> str:
    for title_node in _find_all(root, "title"):
        if title_node.text():
            return title_node.text()
    for h1 in _find_all(root, "h1"):
        if h1.text():
            return h1.text()
    return ""


def _find_semantic_main(root: _Node) -> _Node | None:
    for tag in ("article", "main"):
        nodes = _find_all(root, tag)
        if nodes:
            return max(nodes, key=lambda n: len(n.text()))
    return None


def _collect_form_controls(forms: list[_Node]) -> list[_Node]:
    controls = []
    for form in forms:
        for node in form.iter_elements():
            if node.tag in ("input", "textarea", "select"):
                controls.append(node)
    return controls


def _find_date_attr(root: _Node) -> bool:
    return any("datetime" in node.attrs for node in root.iter_elements())


def _detect_type(*, form_controls, cluster_items, price_match, has_date, article_nodes) -> str:
    if len(form_controls) >= 2:
        return "form"
    if price_match and cluster_items:
        return "ecommerce"
    if article_nodes and has_date:
        return "news"
    if article_nodes or (cluster_items and len(cluster_items) >= 3):
        return "blog"
    return "unknown"


def _field(name: str, selector: str, confidence: float, sample: str) -> AnalyzedField:
    return AnalyzedField(
        name=name, selector=selector, confidence=confidence, sample=sample[:40]
    )


def _build_fields(*, root, cluster_items, form_controls, price_match, semantic_main) -> list[AnalyzedField]:
    fields: list[AnalyzedField] = []

    h1_nodes = _find_all(root, "h1")
    if h1_nodes and h1_nodes[0].text():
        fields.append(_field("title", _selector_for(h1_nodes[0]), 0.9, h1_nodes[0].text()))

    if cluster_items:
        first = cluster_items[0]
        headings = [n for n in first.iter_elements() if n.tag in ("h2", "h3", "h4")]
        if headings and headings[0].text():
            fields.append(_field("item_title", _selector_for(headings[0]), 0.8, headings[0].text()))
        links = [n for n in first.iter_elements() if n.tag == "a" and n.text()]
        if links:
            fields.append(_field("link", _selector_for(links[0]), 0.8, links[0].text()))
        images = [n for n in first.iter_elements() if n.tag == "img"]
        if images:
            sample = images[0].attrs.get("alt") or images[0].attrs.get("src") or ""
            fields.append(_field("image", _selector_for(images[0]), 0.8, sample))
        if price_match:
            price_node = _find_price_node(cluster_items[0]) or _find_price_node(root)
            if price_node is not None:
                match = _PRICE_PATTERN.search(price_node.text())
                if match:
                    fields.append(
                        _field("price", _selector_for(price_node), 0.85, match.group(0))
                    )
        desc = _find_description(cluster_items[0])
        if desc is not None:
            fields.append(_field("description", _selector_for(desc), 0.7, desc.text()))
    elif semantic_main is not None:
        paragraphs = [n for n in semantic_main.iter_elements() if n.tag == "p" and n.text()]
        if paragraphs:
            fields.append(
                _field("content", _selector_for(paragraphs[0]), 0.8, paragraphs[0].text())
            )

    if form_controls:
        seen = set()
        for control in form_controls:
            name = control.attrs.get("name") or control.attrs.get("id") or control.attrs.get("type") or control.tag
            if name in seen:
                continue
            seen.add(name)
            fields.append(
                _field(f"input_{name}", _selector_for(control), 0.75, control.attrs.get("placeholder", ""))
            )

    return fields


def _find_price_node(scope: _Node) -> _Node | None:
    for node in scope.iter_elements():
        if _PRICE_PATTERN.search(node.text()):
            for child in node.iter_elements():
                if _PRICE_PATTERN.search(child.text()):
                    return child
            return node
    return None


def _find_description(scope: _Node) -> _Node | None:
    candidates = [
        n for n in scope.iter_elements()
        if n.tag in ("p", "div") and not _PRICE_PATTERN.search(n.text()) and n.text()
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda n: len(n.text()))


def _main_content_selector(semantic_main, cluster_parent, forms) -> str | None:
    if semantic_main is not None:
        return _selector_for(semantic_main)
    if cluster_parent is not None:
        return _selector_for(cluster_parent)
    if forms:
        return _selector_for(forms[0])
    return None


def _overall_confidence(*, detected_type, fields, cluster_items, form_controls, semantic_main) -> float:
    if detected_type == "unknown" or not fields:
        return 0.3
    score = 0.4
    if cluster_items:
        score += 0.2
    if form_controls:
        score += 0.2
    if semantic_main is not None:
        score += 0.1
    score += min(0.25, 0.05 * len(fields))
    return min(round(score, 2), 0.95)


_provider: AIProvider | None = None


def get_provider() -> AIProvider:
    global _provider
    if _provider is None:
        _provider = HeuristicAnalyzer()
    return _provider


async def analyze_url(url: str) -> PageAnalysis:
    try:
        fetched = await asyncio.wait_for(page_fetcher.fetch(url), timeout=FETCH_TIMEOUT_SECONDS)
    except asyncio.TimeoutError as exc:
        raise AnalysisTimeoutError("分析超时，请稍后再试") from exc
    provider = get_provider()
    return await provider.analyze_page(fetched.html, url)
