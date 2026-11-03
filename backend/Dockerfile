# Use Python 3.11 slim as the base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    U2NET_HOME=/app/.u2net

# Install system dependencies needed for Pillow and OpenCV/image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up user for Hugging Face Spaces (user ID 1000)
RUN useradd -m -u 1000 user
WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download the U²-Net model weights during build so the first user request is instant
RUN python -c "import rembg; rembg.new_session('u2net')"

# Copy application source code
COPY . .

# Set permissions for HF user
RUN chown -R user:user /app
USER user

# Hugging Face Spaces listens on port 7860
EXPOSE 7860

# Start Uvicorn on port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
