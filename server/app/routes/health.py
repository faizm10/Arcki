from fastapi import APIRouter

from ..config import get_settings
from ..services import OpenAIService, FalService

router = APIRouter(tags=["Health"])


@router.get("/")
async def root():
    """Server info."""
    settings = get_settings()
    openai_svc = OpenAIService()
    fal_svc = FalService()

    return {
        "name": "Delta Architecture 3D Generation Server",
        "version": "4.0.0",
        "pipeline": "Text → OpenAI Clean → DALL-E 2D → fal.ai Trellis 3D",
        "output_format": "GLB",
        "services": {
            "openai": "connected" if openai_svc.is_configured else "not configured",
            "fal_ai": "connected" if fal_svc.is_configured else "not configured"
        }
    }


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    openai_svc = OpenAIService()
    fal_svc = FalService()

    return {
        "status": "healthy",
        "openai_configured": openai_svc.is_configured,
        "fal_configured": fal_svc.is_configured
    }
