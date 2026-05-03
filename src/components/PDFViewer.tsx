import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-3xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/50 border-b border-white/10">
            <button 
              onClick={onClose} 
              className="px-4 py-2 hover:bg-white/5 rounded-xl transition-colors font-bold text-sm text-white/70"
            >
              إغلاق
            </button>
            
            <div className="text-center">
              <h3 className="font-bold text-orange-400 text-sm md:text-base truncate max-w-[200px] md:max-w-md">
                {title}
              </h3>
            </div>

            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </a>
          </div>

          {/* Iframe for PDF browsing */}
          <div className="flex-1 bg-zinc-900 overflow-hidden relative">
            {url && (
              <iframe 
                src={`${url}#toolbar=0`}
                className="w-full h-full border-none"
                title={title}
                loading="lazy"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PDFViewer;
