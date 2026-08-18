"""页面结构分析响应模型（Pydantic V2）。"""

from typing import Literal

from pydantic import BaseModel, Field

DetectedType = Literal["ecommerce", "news", "blog", "form", "unknown"]


class AnalyzedField(BaseModel):
    name: str
    selector: str
    confidence: float = Field(ge=0.0, le=1.0)
    sample: str = ""


class PageAnalysis(BaseModel):
    fields: list[AnalyzedField] = []
    page_title: str = ""
    detected_type: DetectedType = "unknown"
    overall_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    main_content_selector: str | None = None
