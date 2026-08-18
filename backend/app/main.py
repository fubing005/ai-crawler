"""FastAPI 应用入口。"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.app.api.v1.page_analyses import router as page_analyses_router
from backend.app.core.errors import AppError
from backend.app.services import page_fetcher


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await page_fetcher.shutdown()


app = FastAPI(title="AI Web Scraper", lifespan=lifespan)
app.include_router(page_analyses_router)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status,
        content={"error": {"code": exc.code, "message": exc.message}},
    )
