import { useState, useCallback, useRef } from 'react';
import type { UploadedFile, ProcessingStatus } from '../types';
import { removeBackground, ApiError } from '../services/api';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function useBackgroundRemoval() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported format. Please use JPG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  };

  const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });

  const selectFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Revoke previous URLs
    if (uploadedFile?.preview) URL.revokeObjectURL(uploadedFile.preview);
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }

    const preview = URL.createObjectURL(file);
    const dimensions = await loadImageDimensions(file);

    setUploadedFile({ file, preview, name: file.name, size: file.size, dimensions });
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, [uploadedFile]);

  const processImage = useCallback(async () => {
    if (!uploadedFile || status === 'processing') return;

    setStatus('processing');
    setError(null);
    setResultUrl(null);

    try {
      const blob = await removeBackground(uploadedFile.file);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultUrl(url);
      setStatus('complete');
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Failed to connect to the server. Please ensure the backend is running.';
      setError(message);
      setStatus('error');
    }
  }, [uploadedFile, status]);

  const reset = useCallback(() => {
    if (uploadedFile?.preview) URL.revokeObjectURL(uploadedFile.preview);
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setUploadedFile(null);
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, [uploadedFile]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'bg-studio-result.png';
    a.click();
  }, [resultUrl]);

  return {
    uploadedFile,
    status,
    resultUrl,
    error,
    selectFile,
    processImage,
    reset,
    downloadResult,
  };
}
