"""POST /api/v1/page-analyses 路由。"""

from urllib.parse import urlparse

from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.core.errors import InvalidURLError
from backend.app.services.ai_service import analyze_url

router = APIRouter(prefix="/api/v1")


class AnalyzeRequest(BaseModel):
    url: str


@router.post("/page-analyses")
async def create_page_analysis(req: AnalyzeRequest) -> dict:
    url = req.url.strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise InvalidURLError("网址格式不正确")
    analysis = await analyze_url(url)
    return {"data": analysis.model_dump(), "message": "Success"}
