import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImageIcon, X, FileImage, AlertCircle, Loader2, Download, RefreshCw } from 'lucide-react';
import type { UploadedFile, ProcessingStatus } from '../types';

interface UploadSectionProps {
  uploadedFile: UploadedFile | null;
  status: ProcessingStatus;
  error: string | null;
  resultUrl: string | null;
  onFileSelect: (file: File) => void;
  onProcess: () => void;
  onReset: () => void;
  onDownload: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadSection({
  uploadedFile, status, error, resultUrl,
  onFileSelect, onProcess, onReset, onDownload,
}: UploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  }, [onFileSelect]);

  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';

  return (
    <section id="upload" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Remove Your Background</h2>
          <p className="text-gray-500">Upload any image and our AI will remove the background instantly.</p>
        </motion.div>

        {/* Upload Zone */}
        {!uploadedFile && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              isDragging ? 'border-gray-900 bg-gray-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />
            <motion.div
              animate={{ scale: isDragging ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Upload className="w-9 h-9 text-gray-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-700 mb-1">
                  {isDragging ? 'Drop it here!' : 'Drag & drop your image'}
                </p>
                <p className="text-gray-400 text-sm">
                  or{' '}
                  <span className="text-gray-900 font-medium underline underline-offset-2">browse your device</span>
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {['JPG', 'PNG', 'WebP'].map((fmt) => (
                  <span key={fmt} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">
                    {fmt}
                  </span>
                ))}
                <span className="text-gray-300 text-xs">•</span>
                <span className="text-gray-400 text-xs">Max 10 MB</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mt-4"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button onClick={onReset} className="ml-auto text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview + Controls */}
        <AnimatePresence>
          {uploadedFile && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6"
            >
              {isComplete && resultUrl ? (
                /* Comparison view */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Original</span>
                      </div>
                      <div className="p-4">
                        <img
                          src={uploadedFile.preview}
                          alt="Original"
                          className="w-full h-64 object-contain rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Result */}
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Background Removed</span>
                      </div>
                      <div className="p-4 checkerboard rounded-b-2xl">
                        <img
                          src={resultUrl}
                          alt="Background Removed"
                          className="w-full h-64 object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={onDownload}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                    <button
                      onClick={onReset}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Process Another Image
                    </button>
                  </div>
                </div>
              ) : (
                /* Preview + Process Button */
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 truncate max-w-[180px]">{uploadedFile.name}</span>
                      </div>
                      <button onClick={onReset} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <img
                        src={uploadedFile.preview}
                        alt="Preview"
                        className="w-full h-64 object-contain rounded-lg"
                      />
                    </div>
                    <div className="px-4 pb-3 flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatBytes(uploadedFile.size)}</span>
                      {uploadedFile.dimensions && (
                        <>
                          <span>•</span>
                          <span>{uploadedFile.dimensions.width} × {uploadedFile.dimensions.height}px</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={onProcess}
                    disabled={isProcessing}
                    className="flex items-center gap-2.5 px-10 py-4 bg-gray-900 text-white font-bold text-base rounded-xl hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      'Remove Background'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Loader */}
        {isProcessing && (
          <div className="mt-6 flex flex-col items-center justify-center py-16 gap-6">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full"
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">AI is removing your background...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
