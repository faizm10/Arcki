from .generation import router as generation_router
from .files import router as files_router
from .health import router as health_router

__all__ = ["generation_router", "files_router", "health_router"]
