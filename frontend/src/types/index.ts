export interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  dimensions?: { width: number; height: number };
}

export interface ProcessingState {
  isProcessing: boolean;
  isComplete: boolean;
  error: string | null;
  resultUrl: string | null;
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  supported_formats: string[];
  max_upload_size_mb: number;
  model: string;
  output_format: string;
}

export interface ApiErrorResponse {
  detail: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'complete' | 'error';
