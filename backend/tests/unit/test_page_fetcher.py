"""page_fetcher 单元测试（mock playwright，不启动真实浏览器）。"""

import pytest

import backend.app.services.page_fetcher as pf
from backend.app.core.errors import UnreachableError


class FakeResponse:
    def __init__(self, status):
        self.status = status


class FakePage:
    def __init__(self, goto_result=None, goto_error=None):
        self._goto_result = goto_result or FakeResponse(200)
        self._goto_error = goto_error

    async def goto(self, url, wait_until=None, timeout=None):
        if self._goto_error is not None:
            raise self._goto_error
        return self._goto_result

    async def wait_for_load_state(self, state, timeout=None):
        return None

    async def content(self):
        return "<html><body>x</body></html>"

    async def title(self):
        return "fake title"


class FakeContext:
    def __init__(self, browser, page):
        self.browser = browser
        self.page = page
        self.closed = False

    async def new_page(self):
        return self.page

    async def close(self):
        self.closed = True
        self.browser.contexts_closed += 1


class FakeBrowser:
    def __init__(self, playwright):
        self.playwright = playwright
        self.contexts_closed = 0
        self.closed = False

    async def new_context(self):
        return FakeContext(self, FakePage())

    async def close(self):
        self.closed = True


class FakePlaywright:
    def __init__(self):
        self.browser = FakeBrowser(self)
        self.launches = 0
        self.stopped = False
        self.chromium = self

    async def launch(self, headless=True):
        self.launches += 1
        return self.browser

    async def stop(self):
        self.stopped = True


class FakePlaywrightStarter:
    def __init__(self, playwright):
        self.playwright = playwright

    async def start(self):
        return self.playwright


@pytest.fixture()
def fake_playwright(monkeypatch):
    pw = FakePlaywright()
    monkeypatch.setattr(pf, "async_playwright", lambda: FakePlaywrightStarter(pw))
    pf._browser = None
    pf._playwright = None
    yield pw
    pf._browser = None
    pf._playwright = None


@pytest.mark.asyncio
async def test_browser_singleton_reused(fake_playwright):
    await pf.fetch("https://example.com/a")
    await pf.fetch("https://example.com/b")
    assert fake_playwright.launches == 1


@pytest.mark.asyncio
async def test_context_closed_after_fetch(fake_playwright):
    fetched = await pf.fetch("https://example.com/a")
    assert fetched.page_title == "fake title"
    assert fake_playwright.browser.contexts_closed == 1


@pytest.mark.asyncio
async def test_http_error_status_raises_unreachable(fake_playwright, monkeypatch):
    browser = fake_playwright.browser

    async def new_context():
        return FakeContext(browser, FakePage(goto_result=FakeResponse(404)))

    monkeypatch.setattr(browser, "new_context", new_context)
    with pytest.raises(UnreachableError):
        await pf.fetch("https://example.com/missing")


@pytest.mark.asyncio
async def test_dns_error_raises_unreachable(fake_playwright, monkeypatch):
    browser = fake_playwright.browser

    async def new_context():
        return FakeContext(
            browser,
            FakePage(goto_error=Exception("net::ERR_NAME_NOT_RESOLVED at https://x.example.com")),
        )

    monkeypatch.setattr(browser, "new_context", new_context)
    with pytest.raises(UnreachableError):
        await pf.fetch("https://x.example.com")


@pytest.mark.asyncio
async def test_shutdown_closes_browser_and_is_idempotent(fake_playwright):
    await pf.fetch("https://example.com/a")
    await pf.shutdown()
    assert fake_playwright.browser.closed is True
    assert fake_playwright.stopped is True
    await pf.shutdown()
