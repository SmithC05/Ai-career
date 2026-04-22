from fastapi import FastAPI

from app.api.routes import router
from app.config import settings
from app.routers.resume_router import resume_router
from app.routers.interview_router import interview_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI inference service for AI Career Navigator",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(router)
app.include_router(resume_router, prefix="/ai")
app.include_router(interview_router, prefix="/ai")
