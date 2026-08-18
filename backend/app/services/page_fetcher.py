"""Playwright 页面获取服务：模块级懒加载单例 browser，每请求独立 context。"""

from typing import NamedTuple

from playwright.async_api import async_playwright

from backend.app.core.errors import UnreachableError, AnalysisTimeoutError

_playwright = None
_browser = None

_NET_ERROR_KEYWORDS = ("net::ERR", "SSL", "CERT", "ERR_NAME_NOT_RESOLVED", "ERR_CONNECTION")


class FetchedPage(NamedTuple):
    html: str
    page_title: str


async def _get_browser():
    global _playwright, _browser
    if _browser is None:
        _playwright = await async_playwright().start()
        _browser = await _playwright.chromium.launch(headless=True)
    return _browser


async def fetch(url: str) -> FetchedPage:
    browser = await _get_browser()
    context = await browser.new_context()
    try:
        page = await context.new_page()
        try:
            response = await page.goto(url, wait_until="domcontentloaded", timeout=5000)
        except Exception as exc:
            _raise_navigation_error(exc)
        if response is not None and response.status >= 400:
            raise UnreachableError("无法访问该网站")
        try:
            await page.wait_for_load_state("networkidle", timeout=2000)
        except Exception:
            pass
        html = await page.content()
        title = await page.title()
        return FetchedPage(html=html, page_title=title)
    finally:
        await context.close()


def _raise_navigation_error(exc: Exception) -> None:
    message = str(exc)
    if "Timeout" in type(exc).__name__ or "Timeout" in message:
        raise AnalysisTimeoutError("分析超时，请稍后再试") from exc
    if any(keyword in message for keyword in _NET_ERROR_KEYWORDS):
        raise UnreachableError("无法访问该网站") from exc
    raise UnreachableError("无法访问该网站") from exc


async def shutdown() -> None:
    global _playwright, _browser
    if _browser is not None:
        await _browser.close()
        _browser = None
    if _playwright is not None:
        await _playwright.stop()
        _playwright = None
