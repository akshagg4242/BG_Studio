import { motion } from 'framer-motion';
import { Zap, ImageIcon, FileImage, Cpu, MousePointer2, Shield } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'AI-Powered Removal',
    description: 'Uses the U²-Net deep learning model running locally for accurate background detection.',
  },
  {
    icon: MousePointer2,
    title: 'No Manual Editing',
    description: 'Fully automatic — no selection tools, brushes, or manual effort required.',
  },
  {
    icon: FileImage,
    title: 'Transparent PNG Output',
    description: 'Get a clean PNG with a genuine transparent background, not a white fill.',
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Optimised for CPU inference with ONNX Runtime — no GPU required.',
  },
  {
    icon: ImageIcon,
    title: 'Drag & Drop Upload',
    description: 'Simple drag-and-drop or file browse interface. Supports JPG, PNG, and WebP.',
  },
  {
    icon: Shield,
    title: 'No Account Required',
    description: 'Completely free. No sign-up, no API keys, no subscription.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Why BG Studio?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            A powerful, private, and completely free AI background remover — runs entirely on your machine.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                <feature.icon className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
