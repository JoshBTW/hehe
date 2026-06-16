import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, ArrowRight, ArrowLeft, Volume2, VolumeX, Gift, 
  Calendar, RotateCcw, AlertCircle, Smile, HelpCircle
} from 'lucide-react';
import { JournalConfig, Slide } from '../types';
import { romanticThemePlayer } from '../utils/audio';

interface ScrapbookFrameProps {
  config: JournalConfig;
  onSave?: (newConfig: JournalConfig) => void;
}

// Sparkle/Heart particle helper interface
interface HeartParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  emoji: string;
  rotation: number;
}

export default function ScrapbookFrame({ config, onSave }: ScrapbookFrameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [quizSolved, setQuizSolved] = useState(0); // 0 = unanswered, 1 = correct, 2 = incorrect
  const [attempts, setAttempts] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlide = config.slides[currentIdx];

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          if (onSave) {
            const updatedSlides = [...config.slides];
            if (isVideo) {
              updatedSlides[currentIdx] = {
                ...updatedSlides[currentIdx],
                video: event.target.result,
                image: undefined,
              };
            } else {
              updatedSlides[currentIdx] = {
                ...updatedSlides[currentIdx],
                image: event.target.result,
                video: undefined,
              };
            }
            onSave({
              ...config,
              slides: updatedSlides,
            });
            try {
              romanticThemePlayer.playChime();
            } catch (err) {
              console.warn(err);
            }
            spawnParticles(15);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Anniversary date display days
  const getElapsedDays = () => {
    try {
      const anniversary = new Date(config.relationshipDate);
      const today = new Date();
      const diffTime = today.getTime() - anniversary.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  };

  const elapsedDays = getElapsedDays();

  // Handle particle popping (hearts/stars) on delightful events
  const spawnParticles = (amount = 15, isEnding = false) => {
    const emojis = isEnding 
      ? ['❤️', '💖', '💍', '💘', '💕', '🌷', '✨', '🌸'] 
      : ['❤️', '💖', '✨', '💐', '💓'];
    
    const newParticles: HeartParticle[] = Array.from({ length: amount }).map(() => ({
      id: Math.random() + Date.now(),
      x: 35 + Math.random() * 30, // center-ish percentage
      y: 75,
      scale: 0.8 + Math.random() * 1.2,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      rotation: Math.random() * 360 - 180,
    }));

    setParticles(prev => [...prev, ...newParticles]);
    
    // Auto-cleanup particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 4000);
  };

  // Toggle audio play/mute on user gesture
  const toggleMute = () => {
    if (isMuted) {
      romanticThemePlayer.start();
      setIsMuted(false);
      romanticThemePlayer.playChime();
    } else {
      romanticThemePlayer.stop();
      setIsMuted(true);
    }
  };

  // Runaway button mechanism
  const triggerNoEscape = () => {
    romanticThemePlayer.playClick();
    // Generate safe dynamic offset bounds to keep it somewhat in frame but completely unreachable
    const rx = (Math.random() - 0.5) * 240;
    const ry = (Math.random() - 0.5) * 140;
    setNoBtnPos({ x: rx, y: ry });
  };

  const nextSlide = () => {
    if (currentIdx < config.slides.length - 1) {
      romanticThemePlayer.playClick();
      setCurrentIdx(prev => prev + 1);
      // Reset temporary slide state
      setQuizSolved(0);
      setAttempts(0);
      setLetterOpen(false);
      setNoBtnPos({ x: 0, y: 0 });
      spawnParticles(5);
    }
  };

  const prevSlide = () => {
    if (currentIdx > 0) {
      romanticThemePlayer.playClick();
      setCurrentIdx(prev => prev - 1);
      // Reset slide factors
      setQuizSolved(0);
      setAttempts(0);
      setLetterOpen(false);
      setNoBtnPos({ x: 0, y: 0 });
    }
  };

  const handleEnvelopeClick = () => {
    romanticThemePlayer.playChime();
    setEnvelopeOpen(true);
    spawnParticles(20);
    // Auto start music if allowed on envelope break
    if (isMuted) {
      romanticThemePlayer.start();
      setIsMuted(false);
    }
  };

  const handleQuizChoice = (idx: number) => {
    if (idx === activeSlide.correctAnswerIndex) {
      setQuizSolved(1);
      romanticThemePlayer.playChime();
      spawnParticles(25);
    } else {
      setQuizSolved(2);
      setAttempts(a => a + 1);
      romanticThemePlayer.playClick();
    }
  };

  const handleAcceptProposal = () => {
    setProposalAccepted(true);
    romanticThemePlayer.playChime();
    // Continuous fireworks
    spawnParticles(35, true);
    let interval = setInterval(() => {
      spawnParticles(15, true);
    }, 850);
    
    // Stop after several loops
    setTimeout(() => {
      clearInterval(interval);
    }, 5000);
  };

  // Determine slide background color theme
  const getThemeClasses = () => {
    switch (config.themeColor) {
      case 'purple':
        return {
          bg: 'mesh-gradient',
          accent: 'purple',
          cardBorder: 'border-white/50 shadow-purple-900/10',
          btn: 'bg-indigo-600/80 hover:bg-indigo-700/90 text-white shadow-lg backdrop-blur-md hover:scale-[1.03] active:scale-95 transition-all border border-white/20',
          text: 'text-indigo-950',
          seal: 'bg-purple-500/80 hover:bg-purple-600/90 shadow-purple-500/20'
        };
      case 'rose':
        return {
          bg: 'mesh-gradient',
          accent: 'rose',
          cardBorder: 'border-white/50 shadow-rose-900/10',
          btn: 'bg-rose-600/80 hover:bg-rose-700/90 text-white shadow-lg backdrop-blur-md hover:scale-[1.03] active:scale-95 transition-all border border-white/20',
          text: 'text-rose-950',
          seal: 'bg-rose-500/80 hover:bg-rose-600/90 shadow-rose-500/20'
        };
      case 'cream':
        return {
          bg: 'mesh-gradient',
          accent: 'amber',
          cardBorder: 'border-white/50 shadow-amber-950/10',
          btn: 'bg-amber-800/80 hover:bg-amber-900/90 text-white shadow-lg backdrop-blur-md hover:scale-[1.03] active:scale-95 transition-all border border-white/20',
          text: 'text-stone-900',
          seal: 'bg-amber-700/80 hover:bg-amber-800/90 shadow-amber-700/20'
        };
      case 'pink':
      default:
        return {
          bg: 'mesh-gradient',
          accent: 'pink',
          cardBorder: 'border-white/50 shadow-pink-900/10',
          btn: 'bg-pink-600/80 hover:bg-pink-700/90 text-white shadow-lg backdrop-blur-md hover:scale-[1.03] active:scale-95 transition-all border border-white/20',
          text: 'text-pink-950',
          seal: 'bg-pink-500/80 hover:bg-pink-600/90 shadow-pink-500/20'
        };
    }
  };

  const themeTheme = getThemeClasses();

  return (
    <div 
      id="scrapbook-canvas"
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 select-none transition-colors duration-1000 overflow-hidden mesh-gradient"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        className="hidden" 
      />
      
      {/* Tape & Binder Aesthetic Elements on outer background screen */}
      <div className="absolute top-0 inset-x-0 h-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 to-transparent pointer-events-none" />
      
      {/* Sweet Floaties floating up */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.9, y: '85vh', x: `${p.x}vw`, scale: 0.3, rotate: p.rotation }}
            animate={{ 
              opacity: 0, 
              y: '-10vh', 
              x: `${p.x + (Math.sin(p.id) * 12)}vw`, 
              scale: p.scale * 1.5,
              rotate: p.rotation * 2
            }}
            transition={{ duration: 3.5, ease: 'easeOut' }}
            className="absolute text-4xl"
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* Floating Header Audio Widget */}
      <div 
        id="sound-hud-widget"
        className="fixed top-6 left-6 z-30 flex items-center gap-2.5 bg-white/40 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-white/50"
      >
        <button
          onClick={toggleMute}
          className="text-[#9f1239] hover:text-pink-600 hover:scale-110 active:scale-95 transition-all outline-none flex items-center justify-center cursor-pointer"
          title={isMuted ? "Enable Romantic Music" : "Mute Background Music"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-[#9f1239]/50" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#9f1239] animate-pulse" />
          )}
        </button>
        <div className="text-[10px] font-sans font-bold text-rose-800 uppercase tracking-widest block select-none">
          {isMuted ? 'AMBIENT MUSIC MUTED' : 'PLAYING SWEET HEART BEAT'}
        </div>
      </div>

      {/* Page / Progress indicator */}
      <div 
        id="slide-hud-indicator"
        className="fixed top-6 right-6 z-30 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 shadow-md font-sans text-xs font-bold text-rose-800 flex items-center gap-1.5"
      >
        <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
        <span className="uppercase tracking-widest text-[10px]">CHAPTER {currentIdx + 1} / {config.slides.length}</span>
      </div>

      {/* Solid Scrapbook Wooden Table Top style Framed Container */}
      <div 
        id="polaroid-frame-container"
        className="relative w-full max-w-lg z-20"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.95, rotate: (Math.random() - 0.5) * 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.02, rotate: (Math.random() - 0.5) * 3 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full frosted-dark p-6 sm:p-8 flex flex-col relative overflow-hidden select-none aspect-[4/5] justify-between border border-white/60 shadow-2xl rounded-[2rem] ${themeTheme.cardBorder}`}
          >
            {isDragging && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-rose-950/80 backdrop-blur-md border-4 border-dashed border-rose-300 rounded-[2rem] p-6 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20 animate-pulse">
                  <Heart className="w-8 h-8 text-rose-200 fill-rose-200" />
                </div>
                <h4 className="font-sans font-black text-lg text-white mb-1 uppercase tracking-wider">
                  Drop Photo or Video Here! ✨
                </h4>
                <p className="font-serif italic text-rose-200/90 text-sm max-w-[240px]">
                  "Pasting this beautiful memory directly onto this chapter of our story..."
                </p>
              </div>
            )}

            {/* Scrapbook grid line watermark */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none rounded-[1.8rem]" />
            
            {/* Realistic Tape decoration on top edge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-white/40 shadow-sm border-x border-dashed border-white/50 backdrop-blur-[2px] rotate-[1.5deg] z-30 pointer-events-none" />

            {/* Slide Structure Switch */}
            {activeSlide.type === 'envelope' ? (
              // 1. Envelope introduction layout
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 pt-4 h-full">
                {!envelopeOpen ? (
                  <motion.div 
                    initial={{ y: 0 }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    onClick={handleEnvelopeClick}
                    className="w-full max-w-[260px] cursor-pointer group flex flex-col items-center"
                  >
                    {/* Cute interactive envelope illustration model */}
                    <div className="relative w-full aspect-[4/3] bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                      
                      {/* Wax Seal / Heart design */}
                      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl border-3 border-white transform active:scale-90 transition-transform ${themeTheme.seal}`}>
                        🌹
                      </div>

                      {/* Sweet label */}
                      <div className="absolute top-4 left-6 text-[10px] font-sans font-bold text-rose-800 uppercase tracking-widest">
                        TO: {config.partnerName}
                      </div>

                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-rose-950 font-sans font-bold text-xs leading-tight text-center max-w-[140px]">
                        With love from <span className="text-pink-600 block">{config.senderName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-sans font-bold text-rose-800 mt-5 tracking-[0.15em] uppercase group-hover:text-pink-600 transition-colors animate-pulse">
                      Tap Wax Seal to Crack Open...
                    </span>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-5 flex flex-col items-center h-full justify-center"
                  >
                    {(activeSlide.video || activeSlide.image) && (
                      <div 
                        onClick={triggerFileSelect}
                        className="w-[180px] h-[180px] rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-[-2deg] transition-transform hover:rotate-0 hover:scale-105 bg-stone-900/10 cursor-pointer relative group animate-fade-in"
                        title="Click to change photo or video"
                      >
                        {activeSlide.video ? (
                          <video 
                            src={activeSlide.video} 
                            controls={false}
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover select-none" 
                          />
                        ) : (
                          <img 
                            src={activeSlide.image} 
                            alt="Cover illustration" 
                            className="w-full h-full object-cover select-none" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                          Change Media 📸
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <h2 className="font-sans font-extrabold text-2xl tracking-tight text-rose-950">
                        {activeSlide.title}
                      </h2>
                      <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-rose-600">
                        {activeSlide.subtitle}
                      </p>
                    </div>
                    <p className="font-serif italic text-rose-900 text-sm sm:text-base max-w-[320px] leading-relaxed mx-auto">
                      "{activeSlide.description}"
                    </p>
                    
                    <button
                      onClick={nextSlide}
                      className={`px-8 py-3 rounded-full font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5 active:scale-95 transition-all shadow-md mt-2 cursor-pointer ${themeTheme.btn}`}
                    >
                      <span>Next slide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </div>
            ) : activeSlide.type === 'counter' ? (
              // 2. Day count milestone layout
              <div className="flex-1 flex flex-col justify-center text-center space-y-5 h-full items-center">
                
                {(activeSlide.video || activeSlide.image) && (
                  <div 
                    onClick={triggerFileSelect}
                    className="w-[160px] h-[160px] rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-[2deg] hover:scale-105 transition-transform bg-stone-900/10 cursor-pointer relative group animate-fade-in animate-duration-500"
                    title="Click to change photo or video"
                  >
                    {activeSlide.video ? (
                      <video 
                        src={activeSlide.video} 
                        controls={false}
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover select-none" 
                      />
                    ) : (
                      <img 
                        src={activeSlide.image} 
                        alt="Anniversary milestone card" 
                        className="w-full h-full object-cover select-none" 
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                      Change Media 📸
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="font-sans font-extrabold text-xl text-rose-950">{activeSlide.title}</h3>
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-rose-600">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {/* Big Day Counter Numbers - Beautiful Frosted Card */}
                <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl px-6 py-3.5 shadow-lg max-w-[280px] w-full relative">
                  <div className="absolute -top-3.5 right-6 bg-pink-100/90 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full text-[#9f1239] tracking-wider flex items-center gap-0.5 shadow-sm uppercase border border-white/60">
                    ⭐️ SUNSHINE DAYS
                  </div>
                  <div className="text-4xl font-sans font-black text-rose-950 tracking-tight flex items-center justify-center gap-1">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse mr-1" />
                    <span>{elapsedDays}</span>
                  </div>
                  <p className="text-[9px] font-sans font-bold text-rose-700/80 mt-1 uppercase tracking-widest">
                    days since i knew you were her
                  </p>
                </div>

                <p className="font-serif italic text-rose-900 text-sm leading-relaxed max-w-[320px] mx-auto">
                  "{activeSlide.description}"
                </p>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={prevSlide}
                    className="bg-white/40 backdrop-blur-sm border border-white/65 hover:bg-white/60 text-rose-900 font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextSlide}
                    className={`px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${themeTheme.btn}`}
                  >
                    <span>Read memories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ) : activeSlide.type === 'memory' ? (
              // 3. Cute Polaroid Diary memories layout
              <div className="flex-1 flex flex-col justify-between h-full gap-4">
                
                {/* Polaroid Mockup Frame - Soft Glassed look */}
                {(activeSlide.video || activeSlide.image) && (
                  <div 
                    className="bg-white/80 backdrop-blur-md border border-white/60 p-3 pb-8 rounded-2xl shadow-xl rotate-[-1.5deg] hover:rotate-0 hover:scale-[1.03] transition-all max-w-[260px] mx-auto relative group cursor-pointer animate-fade-in" 
                    onClick={triggerFileSelect}
                    title="Click to change photo or video"
                  >
                    <div className="bg-stone-50/50 aspect-square w-full rounded-xl overflow-hidden border border-white/45 bg-stone-900/10 relative">
                      {activeSlide.video ? (
                        <video 
                          src={activeSlide.video} 
                          controls={false}
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="w-full h-full object-cover select-none" 
                        />
                      ) : (
                        <img 
                          src={activeSlide.image} 
                          alt={activeSlide.title} 
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                        Change Media 📸
                      </div>
                    </div>
                    
                    {/* Handwritten Date Label style */}
                    <div className="absolute bottom-2.5 right-4 text-[#9f1239]/80 font-mono text-xs uppercase font-extrabold tracking-widest">
                      {activeSlide.date || 'Our Special Day'}
                    </div>
                    {/* Cute virtual tape tag */}
                    <div className="absolute -top-3.5 left-1/3 -translate-x-1/2 w-14 h-5 bg-white/40 shadow-sm select-none rotate-[-12deg]" />
                  </div>
                )}

                <div className="text-center space-y-1.5 max-w-[340px] mx-auto">
                  <h3 className="font-sans font-extrabold text-lg text-rose-950">{activeSlide.title}</h3>
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-rose-600">
                    {activeSlide.subtitle}
                  </p>
                  <p className="font-serif italic text-rose-900 text-sm leading-relaxed px-0.5">
                    "{activeSlide.description}"
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={prevSlide}
                    className="bg-white/40 backdrop-blur-sm border border-white/65 hover:bg-white/60 text-rose-900 font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextSlide}
                    className={`px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${themeTheme.btn}`}
                  >
                    <span>Up next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ) : activeSlide.type === 'quiz' ? (
              // 4. Romantic Quiz layout
              <div className="flex-1 flex flex-col justify-center space-y-4 h-full">
                
                <div className="text-center space-y-1">
                  <h3 className="font-sans font-extrabold text-lg text-rose-950">{activeSlide.title}</h3>
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-rose-600">
                    {activeSlide.subtitle}
                  </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl p-4 text-center space-y-2">
                  <p className="font-serif italic text-rose-900 text-sm">"{activeSlide.description}"</p>
                  <p className="text-[10px] font-sans font-bold text-rose-800 uppercase tracking-widest pt-1">
                    {activeSlide.quizQuestion || 'Guess my answer:'}
                  </p>
                </div>

                {/* Multiple choice selections */}
                <div className="space-y-2">
                  {activeSlide.quizAnswers?.map((ans, index) => {
                    const isCorrect = index === activeSlide.correctAnswerIndex;
                    return (
                      <button
                        key={index}
                        disabled={quizSolved === 1}
                        onClick={() => handleQuizChoice(index)}
                        className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl border font-bold tracking-wide transition-all duration-300 flex items-center justify-between cursor-pointer ${
                          quizSolved === 1 && isCorrect 
                            ? 'bg-emerald-100/80 border-emerald-400 text-emerald-900 shadow-sm' 
                            : quizSolved === 2 && !isCorrect
                            ? 'bg-white/30 border-stone-200/40 text-stone-500 opacity-60'
                            : 'bg-white/80 border-white/60 text-rose-950 hover:bg-white hover:border-pink-300'
                        }`}
                      >
                        <span>{ans}</span>
                        {quizSolved === 1 && isCorrect && <span className="text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider">✔️ Correct !</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Dialog Card */}
                {quizSolved === 1 ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-xl flex items-start gap-2 max-w-[340px] mx-auto"
                  >
                    <Smile className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-2xs text-emerald-900 font-bold uppercase tracking-wider leading-relaxed">
                      {activeSlide.successMessage || 'Excellent guessing! Open up next chapter!'}
                    </p>
                  </motion.div>
                ) : quizSolved === 2 ? (
                  <motion.div 
                    initial={{ x: [-8, 8, -6, 6, 0] }}
                    transition={{ duration: 0.4 }}
                    className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start gap-2 max-w-[340px] mx-auto"
                  >
                    <AlertCircle className="w-4 h-4 text-[#9f1239] shrink-0 mt-0.5" />
                    <p className="text-2xs text-red-900 font-bold uppercase tracking-wider leading-relaxed">
                      {attempts > 2 
                        ? "Aww, hints? It's the fourth choice, my darling! Try it!" 
                        : "Oops! Not quite. Try again, sweetheart!"}
                    </p>
                  </motion.div>
                ) : null}

                {/* Navigation and state locks */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={prevSlide}
                    className="bg-white/40 backdrop-blur-sm border border-white/65 hover:bg-white/60 text-rose-900 font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={quizSolved !== 1}
                    className={`px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                      quizSolved === 1 ? themeTheme.btn : 'bg-rose-950/20 border border-white/20 text-rose-950/40 cursor-not-allowed shadow-none'
                    }`}
                    title={quizSolved !== 1 ? 'Unlock the quiz first!' : 'Proceed'}
                  >
                    <span>{quizSolved === 1 ? 'Unlocked!' : 'Locked'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ) : activeSlide.type === 'letter' ? (
              // 5. Letter unfold page
              <div className="flex-1 flex flex-col justify-between h-full gap-5">
                
                <div className="text-center space-y-1">
                  <h3 className="font-sans font-extrabold text-xl text-rose-950">{activeSlide.title}</h3>
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-rose-600">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {!letterOpen ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl max-w-[280px] mx-auto w-full relative">
                    <span className="text-4xl">✉️</span>
                    <p className="font-serif italic text-rose-900 text-xs text-center mt-3 mb-4">
                      "{activeSlide.description}"
                    </p>
                    <button
                      onClick={() => {
                        setLetterOpen(true);
                        romanticThemePlayer.playChime();
                      }}
                      className="bg-rose-800/80 hover:bg-rose-900 border border-white/20 text-white font-bold text-[10px] tracking-widest uppercase px-5 py-2.5 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Unfold Handspoken Note
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex-1 overflow-y-auto bg-white/50 border border-white/60 p-4 rounded-xl space-y-2 scrollbar-thin scrollbar-thumb-stone-200 font-sans text-rose-950 text-sm max-h-[220px] text-justify leading-relaxed whitespace-pre-wrap relative"
                  >
                    <div className="absolute top-2 right-2 bg-pink-100/80 text-[8px] text-[#9f1239] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-white/40">
                      From his heart
                    </div>
                    {activeSlide.letterBody}
                  </motion.div>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={prevSlide}
                    className="bg-white/40 backdrop-blur-sm border border-white/65 hover:bg-white/60 text-rose-900 font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextSlide}
                    className={`px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${themeTheme.btn}`}
                  >
                    <span>Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ) : (
              // 6. Proposal Ending Layout
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 h-full">
                
                {!proposalAccepted ? (
                  <>
                    {(activeSlide.video || activeSlide.image) && (
                      <div 
                        onClick={triggerFileSelect}
                        className="w-[140px] h-[140px] rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-[-2deg] mb-1 hover:scale-105 transition-transform bg-stone-900/10 cursor-pointer relative group animate-fade-in animate-duration-500"
                        title="Click to change photo or video"
                      >
                        {activeSlide.video ? (
                          <video 
                            src={activeSlide.video} 
                            controls={false}
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover select-none" 
                          />
                        ) : (
                          <img 
                            src={activeSlide.image} 
                            alt="Ending slide card" 
                            className="w-full h-full object-cover select-none"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                          Change Media 📸
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 max-w-[340px]">
                      <h3 className="font-sans font-black text-2xl text-rose-950">{activeSlide.title}</h3>
                      <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#bc438c]">
                        {activeSlide.subtitle}
                      </p>
                      <p className="font-serif italic text-rose-900 text-xs px-2 leading-relaxed pt-1">
                        "{activeSlide.description}"
                      </p>
                    </div>

                    {/* Highly Interactive Action Buttons with Escape Mechanism */}
                    <div className="relative flex flex-col sm:flex-row gap-4 items-center justify-center pt-3 w-full max-w-[300px]">
                      
                      {/* Yes Choice button */}
                      <button
                        onClick={handleAcceptProposal}
                        className="bg-emerald-600/80 hover:bg-emerald-700/90 text-white font-black text-[11px] tracking-widest uppercase px-8 py-3.5 rounded-full shadow-lg shadow-emerald-900/10 hover:scale-[1.08] active:scale-95 transition-all w-full sm:w-auto border border-white/20 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                        <span>YES! I DO ❤️</span>
                      </button>

                      {/* Escaping No Button with dynamic layout offsets */}
                      <motion.button
                        style={{ x: noBtnPos.x, y: noBtnPos.y }}
                        onMouseEnter={triggerNoEscape}
                        onTouchStart={triggerNoEscape}
                        className="bg-white/30 backdrop-blur-sm hover:bg-white/50 text-rose-800 font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded-full hover:scale-95 transition-all w-full sm:w-auto border border-white/50 cursor-pointer absolute sm:static mt-12 sm:mt-0 z-30"
                      >
                        <span>No 😢</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  // Full confessional acceptance view!
                  <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4 max-w-[340px] flex flex-col items-center justify-center h-full py-2"
                  >
                    <div className="text-7xl animate-bounce">💖👑💐</div>
                    <div className="space-y-1">
                      <h2 className="font-sans font-black text-2xl text-pink-700">Yay! You Said Yes!</h2>
                      <p className="text-[10px] font-sans font-extrabold text-[#bc438c] uppercase tracking-widest">
                        My heart has permanently arrived in paradise!
                      </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 text-justify font-serif italic text-rose-950 text-xs leading-relaxed shadow-sm">
                      "I love you with every beat of my heart, every breath of my lungs, and every thought in my mind. Hand in hand, let's write ten thousand more beautiful chapters together!" <span className="text-red-500 font-bold block pt-1.5 text-right font-sans not-italic text-[10px] tracking-wider uppercase">- Your sweetheart forever ❤️</span>
                    </div>

                    <button
                      onClick={() => {
                        romanticThemePlayer.playClick();
                        setProposalAccepted(false);
                        setCurrentIdx(0);
                        setNoBtnPos({ x: 0, y: 0 });
                      }}
                      className="text-stone-400 hover:text-stone-600 underline font-sans text-[9px] tracking-[0.15em] uppercase cursor-pointer flex items-center gap-1 pt-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Relive memory trail</span>
                    </button>
                  </motion.div>
                )}

                <div className="flex gap-2.5 pt-2">
                  {!proposalAccepted && (
                    <button
                      onClick={prevSlide}
                      className="bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 text-rose-900 font-bold text-[10px] uppercase tracking-widest px-5 py-2 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to start</span>
                    </button>
                  )}
                </div>

              </div>
            )}

            {/* Polaroid bottom border signature credits */}
            <div className="border-t border-white/30 pt-3.5 flex items-center justify-between text-[10px] font-sans font-bold text-rose-800 tracking-widest uppercase select-none">
              <span>FOR {config.partnerName.toUpperCase()}</span>
              <span>FROM {config.senderName.toUpperCase()} ❤️</span>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
