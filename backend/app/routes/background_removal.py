"""Background removal API routes."""
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.config import settings
from app.services.remover import remove_background_async
from app.utils.image_validator import validate_upload

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["background-removal"])


@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    """Remove the background from an uploaded image.
    
    Accepts multipart/form-data with a single image file.
    Returns a PNG with transparent background.
    """
    try:
        logger.info(f"Received upload: filename={file.filename}, content_type={file.content_type}")
        raw_bytes, _ = await validate_upload(file)
        result_bytes = await remove_background_async(raw_bytes)
        logger.info("Background removal successful, returning PNG.")
        return Response(
            content=result_bytes,
            media_type="image/png",
            headers={"Content-Disposition": 'attachment; filename="bg-studio-result.png"'}
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Unexpected error during background removal: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred while processing the image.")


@router.get("/info")
async def get_info():
    """Return application information and supported formats."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "supported_formats": ["JPEG", "JPG", "PNG", "WebP"],
        "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_MB,
        "model": "u2net (U²-Net)",
        "output_format": "PNG with transparency"
    }
