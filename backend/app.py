"""
All-in-one Hugging Face Spaces entry point for BG Remover on ZeroGPU.
Uses standard Gradio Blocks with demo.launch() and mounts FastAPI endpoints on demo.app.
"""
import io
import os
import logging
from typing import Optional

from PIL import Image
import gradio as gr
from fastapi import File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove, new_session

# Hugging Face ZeroGPU support
try:
    import spaces
    has_spaces = True
except ImportError:
    has_spaces = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# --- Configuration ---
APP_NAME = "BG Remover API"
APP_VERSION = "1.0.0"
MAX_UPLOAD_SIZE_MB = 10
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

# --- Model Session ---
logger.info("Initializing rembg u2net session...")
session = new_session("u2net")
logger.info("Session ready.")

def _raw_remove(image_input):
    """Core removal function accepting bytes or PIL Image."""
    if isinstance(image_input, bytes):
        output_bytes = remove(image_input, session=session)
        img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    else:
        # PIL Image from Gradio UI
        img = remove(image_input, session=session)
    return img

if has_spaces:
    @spaces.GPU
    def process_image(img):
        return _raw_remove(img)
else:
    def process_image(img):
        return _raw_remove(img)

# --- Validation Utilities for FastAPI ---
async def validate_upload(file: UploadFile) -> bytes:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type '{file.content_type}'. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(data) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE_MB} MB."
        )
    try:
        test_img = Image.open(io.BytesIO(data))
        test_img.verify()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(exc)}")
    return data

# --- Gradio UI ---
with gr.Blocks(title=APP_NAME) as demo:
    gr.Markdown(
        """
        # ✂️ BG Remover AI
        Upload an image to remove its background using U²-Net AI on ZeroGPU.
        """
    )
    with gr.Row():
        input_img = gr.Image(type="pil", label="Upload Image")
        output_img = gr.Image(type="pil", label="Background Removed (Transparent PNG)")
    
    btn = gr.Button("Remove Background", variant="primary")
    btn.click(fn=process_image, inputs=input_img, outputs=output_img)

# --- Attach REST API Routes directly to Gradio's internal FastAPI app ---
api_app = demo.app

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api_app.get("/health")
def health_endpoint():
    return {"status": "healthy", "service": APP_NAME}

@api_app.get("/api/info")
def info_endpoint():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "supported_formats": ["JPEG", "JPG", "PNG", "WebP"],
        "max_upload_size_mb": MAX_UPLOAD_SIZE_MB,
        "model": "u2net (U²-Net)",
        "output_format": "PNG with transparency",
    }

@api_app.post("/api/remove-background")
async def remove_background_endpoint(file: UploadFile = File(...)):
    raw_bytes = await validate_upload(file)
    # Process using the ZeroGPU-decorated function
    output_pil = process_image(raw_bytes)
    buf = io.BytesIO()
    output_pil.save(buf, format="PNG")
    return Response(
        content=buf.getvalue(),
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="bg-studio-result.png"'},
    )

# Standard Gradio launch (Required for Hugging Face ZeroGPU)
demo.queue()
demo.launch()
