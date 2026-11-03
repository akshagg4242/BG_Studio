import { Client } from '@gradio/client';
import type { ApiInfoResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://akshagg4242-bg-remover-api.hf.space';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Remove background using the official @gradio/client when hosted on Hugging Face Spaces,
 * with graceful fallback to standard multipart POST for local development.
 */
export async function removeBackground(file: File): Promise<Blob> {
  // If pointed at Hugging Face Spaces, use the official Gradio Client
  if (API_URL.includes('hf.space') || API_URL.includes('huggingface.co')) {
    try {
      const spaceSource = API_URL.includes('akshagg4242') ? 'akshagg4242/bg-remover-api' : API_URL;
      const client = await Client.connect(spaceSource);
      const result = await client.predict('/process_image', {
        img: file,
      });

      // Gradio returns an object with url or data
      const outputData = (result as { data: unknown[] }).data[0];
      if (typeof outputData === 'object' && outputData !== null && 'url' in outputData) {
        const fileRes = await fetch((outputData as { url: string }).url);
        return await fileRes.blob();
      } else if (typeof outputData === 'string' && outputData.startsWith('data:')) {
        const res = await fetch(outputData);
        return await res.blob();
      } else if (outputData instanceof Blob) {
        return outputData;
      }
    } catch (gradioErr) {
      console.warn('Gradio client request failed, falling back to direct POST:', gradioErr);
    }
  }

  // Standard REST POST fallback (for local development or custom servers)
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = API_URL ? `${API_URL}/api/remove-background` : '/api/remove-background';
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const json = await response.json();
      errorMessage = json.detail || errorMessage;
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(response.status, errorMessage);
  }
  return response.blob();
}

export async function getApiInfo(): Promise<ApiInfoResponse> {
  return {
    name: 'BG Remover API',
    version: '1.0.0',
    supported_formats: ['JPEG', 'JPG', 'PNG', 'WebP'],
    max_upload_size_mb: 10,
    model: 'u2net (U²-Net)',
    output_format: 'PNG with transparency',
  };
}

export async function checkHealth(): Promise<boolean> {
  return true;
}
