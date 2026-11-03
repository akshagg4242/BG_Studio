import type { ApiInfoResponse } from '../types';

// Use empty string to leverage Vite proxy, or fallback to VITE_API_URL or http://localhost:8000
const API_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse(response: Response): Promise<Response> {
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
  return response;
}

export async function removeBackground(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/remove-background`, {
    method: 'POST',
    body: formData,
  });

  await handleResponse(response);
  return response.blob();
}

export async function getApiInfo(): Promise<ApiInfoResponse> {
  const response = await fetch(`${API_URL}/api/info`);
  await handleResponse(response);
  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
