import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-gray-500" />
          Free AI Background Removal
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6"
        >
          Remove Image
          <span className="block text-gray-500">Backgrounds in Seconds.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Transform your images with AI-powered background removal. Upload an image,
          let AI do the work, and download a clean transparent PNG instantly.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#upload"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Upload Image
            <ArrowDown className="w-4 h-4" />
          </a>
          <span className="text-sm text-gray-400">JPG, PNG, WebP • Up to 10 MB • No account needed</span>
        </motion.div>

        {/* Before/After Visual Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative flex items-center justify-center gap-0 mx-auto max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
        >
          {/* Original side */}
          <div className="flex-1 relative">
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2 py-1 bg-black/60 text-white text-xs font-medium rounded-md">Original</span>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-56 flex items-center justify-center">
              <div className="w-24 h-32 bg-gradient-to-b from-orange-300 to-orange-400 rounded-2xl shadow-lg flex items-end justify-center pb-2">
                <div className="w-16 h-8 bg-orange-500 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-0.5 h-56 bg-white z-10 shadow-lg" />

          {/* Removed side */}
          <div className="flex-1 relative">
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2 py-1 bg-black/60 text-white text-xs font-medium rounded-md">Removed</span>
            </div>
            <div className="h-56 checkerboard flex items-center justify-center">
              <div className="w-24 h-32 bg-gradient-to-b from-orange-300 to-orange-400 rounded-2xl shadow-lg flex items-end justify-center pb-2" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' }}>
                <div className="w-16 h-8 bg-orange-500 rounded-xl" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
