import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does AI background removal work?',
    a: 'BG Studio uses the U²-Net deep learning model via the rembg library. The model analyses each pixel to classify it as foreground (subject) or background, then generates a transparent mask applied to your image.',
  },
  {
    q: 'Which image formats are supported?',
    a: 'You can upload JPG, JPEG, PNG, and WebP images up to 10 MB. The output is always a transparent PNG.',
  },
  {
    q: 'Will the downloaded image have a transparent background?',
    a: 'Yes. The output is a genuine PNG with an alpha (transparency) channel. When you open it in any image editor or browser it will display with a transparent background, not white.',
  },
  {
    q: 'Is my uploaded image stored on the server?',
    a: 'No. Images are processed entirely in memory and are never written to disk or stored on any server. Your privacy is fully respected.',
  },
  {
    q: 'Do I need to install any software?',
    a: 'To run the application locally you need Python 3.11+ and Node.js. The backend handles all AI inference — no browser plugins or client-side AI is required.',
  },
  {
    q: 'Does it work on images with complex backgrounds?',
    a: 'U²-Net is trained on a wide variety of images. It performs best on subjects with clear contrast against the background, but generally handles complex scenes well.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="about" className="py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500">Everything you need to know about BG Studio.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
