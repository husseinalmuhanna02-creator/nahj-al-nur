import React, { useState, useRef, useEffect } from 'react';
import { dailySupplications } from '../data/supplications';
import { libraryBooks } from '../data/library';
import { Supplication, LibraryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import PDFViewer from './PDFViewer';
import { 
  Book, 
  BookOpen, 
  ChevronDown,
  ChevronLeft, 
  FileText, 
  Library as LibraryIcon, 
  Search, 
  Type, 
  X,
  User,
  Tag,
  Download,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  CloudDownload,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { offlineAudioService } from '../services/offlineAudio';

// --- Shared Components ---

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <motion.div
    whileHover={onClick ? { scale: 1.01, translateY: -2 } : undefined}
    whileTap={onClick ? { scale: 0.98 } : undefined}
    onClick={onClick}
    className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all hover:bg-white/10 ${className} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </motion.div>
);

const Library: React.FC = () => {
  const [selectedSupplication, setSelectedSupplication] = useState<Supplication | null>(null);
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'أدعية' | 'زيارات' | 'كتب'>('all');
  const [readingFontSize, setReadingFontSize] = useState(24);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      if (selectedSupplication?.audioUrl) {
        const downloaded = await offlineAudioService.isDownloaded(selectedSupplication.audioUrl);
        setIsDownloaded(downloaded);
        
        const src = await offlineAudioService.getAudioSource(selectedSupplication.audioUrl);
        setAudioSrc(src);
      }
    };
    checkStatus();
  }, [selectedSupplication]);

  const handleOfflineSave = async () => {
    if (!selectedSupplication?.audioUrl) return;
    
    if (isDownloaded) {
      const confirmed = window.confirm('هل تريد حذف الملف الصوتي من جهازك؟');
      if (confirmed) {
        await offlineAudioService.removeAudio(selectedSupplication.audioUrl);
        setIsDownloaded(false);
        setAudioSrc(selectedSupplication.audioUrl);
      }
    } else {
      setIsDownloading(true);
      const success = await offlineAudioService.downloadAudio(selectedSupplication.audioUrl);
      if (success) {
        setIsDownloaded(true);
        const src = await offlineAudioService.getAudioSource(selectedSupplication.audioUrl);
        setAudioSrc(src);
      }
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!selectedSupplication) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedSupplication]);

  const togglePlay = () => {
    if (!isOnline && !isDownloaded && selectedSupplication?.audioUrl && !selectedSupplication.audioUrl.startsWith('/')) {
      alert('يجب الاتصال بالإنترنت لتشغيل هذا الملف الصوتي، أو قم بتحميله مسبقاً.');
      return;
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current && Number.isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      const targetTime = audioRef.current.currentTime + seconds;
      if (Number.isFinite(targetTime)) {
        audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, targetTime));
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredSupplications = dailySupplications.filter(item => {
    const matchesSearch = (item.titleAr?.includes(searchTerm)) || (item.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())) || (item.title?.includes(searchTerm));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredBooks = libraryBooks.filter(item => {
    const matchesSearch = 
      item.title.includes(searchTerm) || 
      item.author.includes(searchTerm) || 
      item.category.includes(searchTerm);
    const matchesCategory = activeCategory === 'all' || activeCategory === 'كتب';
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'الكل', icon: <LibraryIcon size={16} /> },
    { id: 'أدعية', label: 'الأدعية', icon: <FileText size={16} /> },
    { id: 'زيارات', label: 'الزيارات', icon: <BookOpen size={16} /> },
    { id: 'كتب', label: 'الكتب', icon: <Book size={16} /> },
  ];

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Force download by fetching and creating a blob URL
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error('Download failed:', error?.message || error);
      // Fallback: open in new tab if blob download fails (CORS issue)
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.mp3`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-transparent text-white overflow-y-auto">
      {/* Header & Search */}
      <div className="max-w-2xl mx-auto mb-8 space-y-6">
        <h2 className="text-3xl font-serif font-bold text-center text-orange-400">نهج النور | المكتبة</h2>
        
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-400 transition-colors" size={20} />
          <input
            type="text"
            placeholder="ابحث عن كتاب، مؤلف، أو دعاء..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pr-12 pl-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-orange-500/50 transition-all font-bold text-right placeholder:text-white/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-end">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <span className="text-sm">{cat.label}</span>
              {cat.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Books Section - Accordion Layout */}
        {(activeCategory === 'all' || activeCategory === 'كتب') && filteredBooks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-orange-400 border-r-2 border-orange-500 pr-3 uppercase tracking-widest text-right">الكتب</h3>
            <div className="grid grid-cols-1 gap-4">
              {filteredBooks.map((book) => {
                const isExpanded = expandedBookId === book.id;
                const hasParts = book.subItems && book.subItems.length > 0;

                return (
                  <GlassCard 
                    key={book.id} 
                    className="flex flex-col"
                  >
                    {/* Header Action */}
                    <div 
                      onClick={() => {
                        if (hasParts) {
                          setExpandedBookId(isExpanded ? null : book.id);
                        } else if (book.url) {
                          setActivePdf({ url: book.url, title: book.title });
                        }
                      }}
                      className="p-5 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        {hasParts ? (
                          <ChevronDown 
                            size={20} 
                            className={`text-white/20 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-orange-400' : ''}`} 
                          />
                        ) : (
                          <ChevronLeft size={18} className="text-white/20 group-hover:text-orange-400" />
                        )}
                        {hasParts && (
                          <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">
                            {book.subItems?.length} أجزاء
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <h4 className="font-bold text-lg text-white group-hover:text-orange-300 transition-colors mb-0.5">{book.title}</h4>
                          <p className="text-sm opacity-40 flex items-center justify-end gap-1">
                            {book.author}
                            <User size={12} />
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                          <Book size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Parts List */}
                    <AnimatePresence>
                      {isExpanded && hasParts && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden bg-white/5 border-t border-white/10"
                        >
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {book.subItems?.map((part) => (
                              <button
                                key={part.id}
                                onClick={() => setActivePdf({ url: part.url, title: `${book.title} - ${part.title}` })}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition-all text-right group/part"
                              >
                                <ChevronLeft size={14} className="text-white/20 group-hover/part:text-orange-400 transition-colors" />
                                <span className="font-bold text-sm text-white/80 group-hover/part:text-white transition-colors">
                                  {part.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Supplications & Ziyarat Section */}
        {(activeCategory === 'all' || activeCategory === 'أدعية' || activeCategory === 'زيارات') && filteredSupplications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-400 border-r-2 border-blue-500 pr-3 uppercase tracking-widest text-right">الأدعية والزيارات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSupplications.map((item) => (
                <GlassCard key={item.id} onClick={() => setSelectedSupplication(item)} className="p-4 flex items-center justify-between group">
                  <ChevronLeft size={18} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                  <div className="flex-1 text-right mr-4">
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.title || item.titleAr}</h4>
                    <p className="text-[10px] opacity-40 uppercase font-mono">{item.category}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    {item.category === 'أدعية' ? <FileText size={20} /> : <BookOpen size={20} />}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {filteredBooks.length === 0 && filteredSupplications.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <Search size={48} className="mx-auto mb-4" />
            <p className="font-bold">عذراً، لم نجد نتائج لـ "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* --- Modals --- */}

      <AnimatePresence>
        {selectedSupplication && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl flex flex-col"
          >
            {/* Modal Header */}
            <header className="p-4 flex items-center justify-between border-b border-white/10 shadow-lg bg-white/5 backdrop-blur-md">
              <button 
                onClick={() => setSelectedSupplication(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90"
              >
                <X size={20} />
              </button>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-orange-400">{selectedSupplication.title || selectedSupplication.titleAr}</h3>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">{selectedSupplication.titleEn}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setReadingFontSize(s => Math.min(s + 4, 60))}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Type size={18} />
                </button>
              </div>
            </header>

            {/* Reading Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative scroll-smooth">
              <div 
                className="max-w-2xl mx-auto text-center leading-[2.5] font-arabic whitespace-pre-line transition-all duration-300 pb-80"
                style={{ fontSize: `${readingFontSize}px` }}
              >
                {selectedSupplication.content || selectedSupplication.contentAr}
              </div>
            </main>

            {/* Custom Modern Audio Player */}
            {selectedSupplication.audioUrl && (
              <div className="fixed bottom-24 left-4 right-4 z-[120]">
                <GlassCard className="max-w-xl mx-auto !bg-zinc-900/60 !backdrop-blur-2xl !border-orange-500/30 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {/* Hidden Audio Element */}
                  {audioSrc && (
                      <audio
                        ref={audioRef}
                        key={audioSrc}
                        src={audioSrc}
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        autoPlay
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onError={() => {
                          console.error("Audio playback error: Failed to load source");
                          setIsPlaying(false);
                        }}
                      />
                  )}

                  {/* Player Controls */}
                  <div className="flex flex-col gap-3">
                    {/* Top Row: Info & Download Controls */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        {/* System Download (Existing) */}
                        <button 
                          onClick={() => handleDownload(selectedSupplication.audioUrl!, selectedSupplication.title || selectedSupplication.titleAr)}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition-all active:scale-95 group"
                          title="تحميل للجهاز"
                        >
                          <Download size={16} />
                        </button>

                        {/* Offline Caching (New) */}
                        <button 
                          onClick={handleOfflineSave}
                          disabled={isDownloading}
                          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 border ${
                            isDownloaded 
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-orange-500/30 hover:text-orange-400'
                          }`}
                          title={isDownloaded ? "حذف من المفضلة (بدون انترنت)" : "حفظ للتشغيل بدون انترنت"}
                        >
                          {isDownloading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : isDownloaded ? (
                            <CheckCircle2 size={18} className="group-hover:hidden" />
                          ) : (
                            <CloudDownload size={18} />
                          )}
                          {isDownloaded && <Trash2 size={18} className="hidden group-hover:block" />}
                        </button>
                      </div>
                      
                      <div className="flex-1 px-4 text-center">
                        <div className="flex flex-col">
                          <p className="text-orange-400 text-xs font-bold truncate">{selectedSupplication.title || selectedSupplication.titleAr}</p>
                          {isDownloaded ? (
                            <span className="text-[8px] text-green-500/60 font-bold">متاح بدون انترنت</span>
                          ) : (!isOnline && selectedSupplication.audioUrl && !selectedSupplication.audioUrl.startsWith('/')) ? (
                            <span className="text-[8px] text-red-500 font-bold animate-pulse">يحتاج للاتصال بالإنترنت</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="w-9" />
                    </div>

                    {/* Middle Row: Progress Slider */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                      />
                      <div className="flex justify-between px-0.5">
                        <span className="text-[9px] font-mono text-white/30">{formatTime(currentTime)}</span>
                        <span className="text-[9px] font-mono text-white/30">{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Main Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => {
                          if (audioRef.current && Number.isFinite(0)) {
                            audioRef.current.currentTime = 0;
                            if (!isPlaying) togglePlay();
                          }
                        }}
                        className="text-white/40 hover:text-white transition-colors p-2"
                        title="إعادة التشغيل"
                      >
                        <RotateCcw size={18} />
                      </button>

                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => seek(-10)}
                          className="text-white/60 hover:text-orange-400 transition-colors p-2"
                          title="تأخير 10 ثوانٍ"
                        >
                          <Rewind size={22} fill="currentColor" fillOpacity={0.1} />
                        </button>

                        <button
                          onClick={togglePlay}
                          className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 hover:bg-orange-400 active:scale-95 transition-all"
                        >
                          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="translate-x-0.5" />}
                        </button>

                        <button 
                          onClick={() => seek(10)}
                          className="text-white/60 hover:text-orange-400 transition-colors p-2"
                          title="تقديم 10 ثوانٍ"
                        >
                          <FastForward size={22} fill="currentColor" fillOpacity={0.1} />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Component */}
      <PDFViewer 
        isOpen={!!activePdf}
        url={activePdf?.url || ''}
        title={activePdf?.title || ''}
        onClose={() => setActivePdf(null)}
      />
    </div>
  );
};

export default Library;
