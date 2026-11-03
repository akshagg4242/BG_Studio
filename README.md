# BG Studio — AI-Powered Background Remover

A complete, full-stack AI background removal web application. Upload any image, let a locally-running U²-Net deep learning model remove the background, and download a clean transparent PNG — all without an internet connection or third-party API.

---

## Features

- 🤖 **AI-powered removal** — U²-Net model via `rembg`, runs 100% locally
- 🖼️ **Transparent PNG output** — genuine alpha channel, not a white fill
- ⚡ **CPU inference** — works without a GPU using ONNX Runtime
- 🎯 **Drag & drop upload** — simple, modern interface
- 🔒 **Zero storage** — images are processed in memory and never saved
- 📱 **Responsive design** — works on desktop, tablet, and mobile
- 🆓 **No account required** — completely free and open

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v3, Framer Motion |
| Icons | Lucide React |
| Backend | Python 3.11, FastAPI, Uvicorn |
| AI Model | rembg (U²-Net), ONNX Runtime |
| Image Processing | Pillow (PIL) |

---

## Project Architecture

```
Browser (React + Vite)
       │
       │  POST /api/remove-background  (multipart/form-data)
       ▼
FastAPI Server (Python)
  ├── Image validation (extension, MIME, size, integrity)
  ├── Thread pool executor (offloads CPU-bound work)
  └── rembg remove() → PIL RGBA PNG → Response bytes
       │
       │  image/png (binary)
       ▼
Browser displays result + checkerboard preview + download
```

---

## Folder Structure

```
BGremover/
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── UploadSection.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── Footer.tsx
│   │   ├── hooks/
│   │   │   └── useBackgroundRemoval.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS
│   │   ├── config.py           # Settings from .env
│   │   ├── routes/
│   │   │   └── background_removal.py
│   │   ├── services/
│   │   │   └── remover.py      # rembg integration
│   │   └── utils/
│   │       └── image_validator.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Installation & Setup

### Prerequisites

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **npm** (bundled with Node.js)

Verify installations:
```powershell
python --version   # Python 3.11.x
node --version     # v18.x or higher
npm --version
```

---

### Backend Setup

```powershell
# 1. Navigate to the backend directory
cd D:\Projects\BGremover\backend

# 2. Create a Python virtual environment
python -m venv venv

# 3. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 4. (If execution policy blocks activation)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 5. Install all dependencies
pip install -r requirements.txt

# 6. Copy environment file
Copy-Item .env.example .env
```

> **Note:** The first time you run the backend after installing `rembg`, it will automatically download the U²-Net model (~170 MB) from the internet and cache it in `%USERPROFILE%\.u2net\`. Subsequent runs are instant.

---

### Frontend Setup

```powershell
# 1. Navigate to the frontend directory
cd D:\Projects\BGremover\frontend

# 2. Install Node.js dependencies
npm install

# 3. The .env file should already exist with:
#    VITE_API_URL=http://localhost:8000
```

---

## Running the Application

You need **two terminal windows** running simultaneously.

### Terminal 1 — Backend

```powershell
cd D:\Projects\BGremover\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

### Terminal 2 — Frontend

```powershell
cd D:\Projects\BGremover\frontend
npm run dev
```

The website will be available at: `http://localhost:5173`

---

## API Documentation

### `GET /`
Returns a welcome message and API status.

**Response:**
```json
{
  "message": "Welcome to BG Remover API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

---

### `GET /health`
Health check endpoint.

**Response:**
```json
{ "status": "healthy", "service": "BG Remover API" }
```

---

### `GET /api/info`
Returns application information and supported formats.

**Response:**
```json
{
  "name": "BG Remover API",
  "version": "1.0.0",
  "supported_formats": ["JPEG", "JPG", "PNG", "WebP"],
  "max_upload_size_mb": 10,
  "model": "u2net (U²-Net)",
  "output_format": "PNG with transparency"
}
```

---

### `POST /api/remove-background`
**Main endpoint.** Accepts an image and returns a transparent PNG.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` — the image file

**Response:**
- Content-Type: `image/png`
- Body: Binary PNG with transparent background

**Error Responses:**
| Status | Cause |
|--------|-------|
| 400 | Invalid extension, unsupported MIME type, empty file, corrupt image |
| 413 | File exceeds 10 MB limit |
| 500 | Unexpected processing error |

---

## Supported Image Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| JPEG | `.jpg`, `.jpeg` | Most common photo format |
| PNG | `.png` | Already supports transparency |
| WebP | `.webp` | Modern web format |

**Maximum upload size:** 10 MB

---

## Troubleshooting

### PowerShell execution policy error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Backend not connecting
- Ensure the backend is running on port 8000
- Check that `VITE_API_URL=http://localhost:8000` is set in `frontend/.env`
- Verify firewall is not blocking port 8000

### Model download fails on first run
- Ensure internet connectivity when first starting the backend
- The model is cached at `%USERPROFILE%\.u2net\u2net.onnx` (~170 MB)
- Once downloaded, no internet is needed

### `pip install` fails for `onnxruntime`
```powershell
pip install --upgrade pip
pip install onnxruntime
```

### CORS errors in browser
- Ensure the backend is running before the frontend
- Check `ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:5173`

### Image processing is slow
- U²-Net on CPU typically takes 2–10 seconds depending on image size and hardware
- Resize very large images before uploading for faster processing

### `rembg` model not found
Delete the cached model and let it re-download:
```powershell
Remove-Item "$env:USERPROFILE\.u2net" -Recurse -Force
```
Then restart the backend.

---

## License

MIT License — free to use, modify, and distribute.
