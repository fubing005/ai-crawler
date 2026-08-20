"""POST /api/v1/page-analyses API 测试（fetcher 与浏览器全部 mock，不依赖网络）。"""

import asyncio

import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.core.errors import UnreachableError
from backend.app.main import app
from backend.app.services import page_fetcher
from backend.app.services import ai_service
from tests.unit.test_ai_service import ECOMMERCE_HTML

VALID_URL = "https://example.com/product"


def _fake_fetch(html=ECOMMERCE_HTML, title="示例电商商品页"):
    async def fetch(url):
        return page_fetcher.FetchedPage(html=html, page_title=title)

    return fetch


@pytest.fixture(autouse=True)
def reset_fetcher():
    page_fetcher._browser = None
    page_fetcher._playwright = None
    ai_service._provider = None
    yield
    page_fetcher._browser = None
    page_fetcher._playwright = None
    ai_service._provider = None


@pytest.mark.asyncio
async def test_valid_url_returns_200_envelope(monkeypatch):
    monkeypatch.setattr(page_fetcher, "fetch", _fake_fetch())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/page-analyses", json={"url": VALID_URL})
    assert res.status_code == 200
    body = res.json()
    assert body["message"] == "Success"
    assert body["data"]["detected_type"] == "ecommerce"
    assert len(body["data"]["fields"]) >= 3
    assert 0.0 <= body["data"]["overall_confidence"] <= 1.0


@pytest.mark.asyncio
async def test_url_surrounding_whitespace_stripped(monkeypatch):
    calls = []

    async def fetch(url):
        calls.append(url)
        return page_fetcher.FetchedPage(html=ECOMMERCE_HTML, page_title="t")

    monkeypatch.setattr(page_fetcher, "fetch", fetch)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/page-analyses", json={"url": f"  {VALID_URL}  "})
    assert res.status_code == 200
    assert calls == [VALID_URL]


@pytest.mark.asyncio
async def test_missing_url_returns_422():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/page-analyses", json={})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_invalid_scheme_returns_400_invalid_url():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/page-analyses", json={"url": "ftp://example.com/x"})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_URL"


@pytest.mark.asyncio
async def test_unreachable_returns_502(monkeypatch):
    async def fetch(url):
        raise UnreachableError("无法访问该网站")

    monkeypatch.setattr(page_fetcher, "fetch", fetch)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/page-analyses", json={"url": VALID_URL})
    assert res.status_code == 502
    assert res.json()["error"]["code"] == "UNREACHABLE"


@pytest.mark.asyncio
async def test_fetch_timeout_error_returns_504(monkeypatch):
    async def fetch(url):
        raise asyncio.TimeoutError()

    monkeypatch.setattr(page_fetcher, "fetch", fetch)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/page-analyses", json={"url": VALID_URL})
    assert res.status_code == 504
    assert res.json()["error"]["code"] == "ANALYSIS_TIMEOUT"


@pytest.mark.asyncio
async def test_slow_fetch_hit_by_wait_for_budget(monkeypatch):
    monkeypatch.setattr(ai_service, "FETCH_TIMEOUT_SECONDS", 0.05)

    async def fetch(url):
        await asyncio.sleep(0.5)
        return page_fetcher.FetchedPage(html=ECOMMERCE_HTML, page_title="t")

    monkeypatch.setattr(page_fetcher, "fetch", fetch)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/page-analyses", json={"url": VALID_URL})
    assert res.status_code == 504
    assert res.json()["error"]["code"] == "ANALYSIS_TIMEOUT"
