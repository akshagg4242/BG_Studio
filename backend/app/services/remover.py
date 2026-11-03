"""Background removal service using rembg."""
import io
import logging
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from typing import Optional

from PIL import Image
from rembg import remove, new_session

logger = logging.getLogger(__name__)

# Thread pool for CPU-bound inference tasks
_executor = ThreadPoolExecutor(max_workers=2)


@lru_cache(maxsize=1)
def _get_session():
    """Lazily initialise and cache the rembg model session (u2net)."""
    logger.info("Initialising rembg u2net model session ...")
    session = new_session("u2net")
    logger.info("rembg model session ready.")
    return session


def _run_removal(image_bytes: bytes) -> bytes:
    """Blocking background-removal call executed in the thread pool."""
    session = _get_session()
    output_bytes = remove(image_bytes, session=session)
    # Ensure the result is a valid RGBA PNG
    img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


async def remove_background_async(image_bytes: bytes) -> bytes:
    """Asynchronously remove the background from image bytes.
    Runs the CPU-intensive work in a thread pool so FastAPI's event loop
    is not blocked.
    """
    import asyncio
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(_executor, _run_removal, image_bytes)
    return result
