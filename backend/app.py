"""
Entry point for Hugging Face Spaces with Gradio SDK.
Gradio runs on FastAPI under the hood, allowing us to mount all existing
FastAPI REST routes directly while remaining 100% on Hugging Face's Free Tier!
"""
import gradio as gr
from fastapi.middleware.cors import CORSMiddleware
from app.main import app as fastapi_app

# Enable CORS for frontend clients (Vercel, localhost, etc.)
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional minimal Gradio interface (shown if someone opens the Hugging Face space URL in browser)
with gr.Blocks(title="BG Remover API") as demo:
    gr.Markdown(
        """
        # ✂️ BG Remover API
        This Space hosts the **FastAPI + rembg (U²-Net)** AI backend for the **BG Remover** web application.
        
        - **Health Check**: [`/health`](/health)
        - **API Info**: [`/api/info`](/api/info)
        - **Interactive Docs**: [`/docs`](/docs)
        - **Background Removal Endpoint**: `POST /api/remove-background`
        """
    )

# Mount FastAPI app onto Gradio
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
