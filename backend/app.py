"""
All-in-one Hugging Face Spaces entry point for BG Remover.
Keeps server process alive and blocking without exiting.
"""
import io
import os
import logging
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

from PIL import Image
import gradio as gr
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove, new_session

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# --- Configuration ---
APP_NAME = "BG Remover API"
APP_VERSION = "1.0.0"
MAX_UPLOAD_SIZE_MB = 10
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

# --- Background Removal Service ---
_executor = ThreadPoolExecutor(max_workers=2)

@lru_cache(maxsize=1)
def _get_session():
    logger.info("Initialising rembg u2net model session...")
    session = new_session("u2net")
    logger.info("rembg model session ready.")
    return session

def _run_removal(image_bytes: bytes) -> bytes:
    session = _get_session()
    output_bytes = remove(image_bytes, session=session)
    img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

async def remove_background_async(image_bytes: bytes) -> bytes:
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _run_removal, image_bytes)

# --- Validation Utilities ---
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
        img = Image.open(io.BytesIO(data))
        img.verify()
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot open image file: {str(exc)}"
        )
    return data

# --- Create Gradio UI with Mounted FastAPI Routes ---
with gr.Blocks(title=APP_NAME) as demo:
    gr.Markdown(
        """
        # ✂️ BG Remover API
        The AI backend is **ONLINE and running**!
        
        - **API Health**: [`/health`](/health)
        - **API Info**: [`/api/info`](/api/info)
        - **Background Removal Endpoint**: `POST /api/remove-background`
        """
    )

# Access Gradio's internal FastAPI app directly
app = demo.app

# Enable CORS for external frontends (Vercel, localhost, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach REST endpoints directly to app
@app.get("/health")
async def health():
    return {"status": "healthy", "service": APP_NAME}

@app.get("/api/info")
async def get_info():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "supported_formats": ["JPEG", "JPG", "PNG", "WebP"],
        "max_upload_size_mb": MAX_UPLOAD_SIZE_MB,
        "model": "u2net (U²-Net)",
        "output_format": "PNG with transparency",
    }

@app.post("/api/remove-background")
async def remove_bg_endpoint(file: UploadFile = File(...)):
    raw_bytes = await validate_upload(file)
    result_bytes = await remove_background_async(raw_bytes)
    return Response(
        content=result_bytes,
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="bg-studio-result.png"'},
    )

# Launch demo and block so process stays alive indefinitely
demo.queue()
demo.launch(ssr_mode=False)
