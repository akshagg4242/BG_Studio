"""Image validation utilities."""
import io
import os
from typing import Tuple
from PIL import Image
from fastapi import HTTPException, UploadFile
from app.config import settings


def validate_extension(filename: str) -> None:
    """Validate the file extension."""
    if not filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )


def validate_content_type(content_type: str) -> None:
    """Validate the MIME content type."""
    if content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type '{content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )


def validate_file_size(data: bytes) -> None:
    """Validate the file size against the maximum limit."""
    if len(data) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB} MB."
        )


def validate_image_integrity(data: bytes) -> Tuple[Image.Image, str]:
    """Validate that the bytes represent a valid, openable image."""
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    try:
        image = Image.open(io.BytesIO(data))
        image.verify()  # Detect truncated/corrupt images
        # Re-open after verify (verify exhausts the stream)
        image = Image.open(io.BytesIO(data))
        fmt = image.format or "UNKNOWN"
        return image, fmt
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot open image. File may be corrupt or in an unsupported format. Detail: {str(exc)}"
        )


async def validate_upload(file: UploadFile) -> Tuple[bytes, Image.Image]:
    """Run all validations on an uploaded file and return raw bytes + PIL image."""
    validate_extension(file.filename or "")
    validate_content_type(file.content_type or "")
    data = await file.read()
    validate_file_size(data)
    image, _ = validate_image_integrity(data)
    return data, image
