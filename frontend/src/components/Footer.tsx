import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Scissors className="w-4 h-4 text-gray-900" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-white text-lg">BG Studio</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered background removal. Free, private, and fast — running entirely on your machine.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {['Home', 'Features', 'How It Works', 'FAQ'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Built With</h4>
            <ul className="space-y-2 text-sm">
              {['React + TypeScript', 'FastAPI + Python', 'rembg (U²-Net)', 'Tailwind CSS', 'Framer Motion'].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm">© 2024 BG Studio. All rights reserved.</p>
          <p className="text-xs">Powered by U²-Net AI Model</p>
        </div>
      </div>
    </footer>
  );
}
