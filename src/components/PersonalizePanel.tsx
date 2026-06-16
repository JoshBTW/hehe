import React, { useState } from 'react';
import { 
  Settings, Save, Copy, Check, RotateCcw, Plus, Trash2, Heart, Calendar, X, HelpCircle
} from 'lucide-react';
import { JournalConfig, Slide, ThemeColor } from '../types';
import { DEFAULT_CONFIG, encodeConfig, PRESET_IMAGES } from '../data';

interface PersonalizePanelProps {
  config: JournalConfig;
  onSave: (newConfig: JournalConfig) => void;
  onReset: () => void;
}

export default function PersonalizePanel({ config, onSave, onReset }: PersonalizePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [partnerName, setPartnerName] = useState(config.partnerName);
  const [senderName, setSenderName] = useState(config.senderName);
  const [relationshipDate, setRelationshipDate] = useState(config.relationshipDate);
  const [themeColor, setThemeColor] = useState<ThemeColor>(config.themeColor);
  const [slides, setSlides] = useState<Slide[]>(config.slides);
  const [copied, setCopied] = useState(false);

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `custom-${Date.now()}`,
      type: 'memory',
      title: 'Our New Special Moment',
      subtitle: 'Where was this taken?',
      description: 'Write about a beautiful memory, inside joke, or milestone you shared together here...',
      image: PRESET_IMAGES.couple,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setSlides([...slides, newSlide]);
  };

  const handleUpdateSlide = (id: string, updatedFields: Partial<Slide>) => {
    setSlides(slides.map(slide => slide.id === id ? { ...slide, ...updatedFields } : slide));
  };

  const handleDeleteSlide = (id: string) => {
    // Avoid deleting essential pages like start envelope and ending proposal if we want to keep structure
    if (slides.length <= 2) {
      alert("Please keep at least 2 slides for your journey!");
      return;
    }
    setSlides(slides.filter(slide => slide.id !== id));
  };

  const handleSave = () => {
    const updated: JournalConfig = {
      partnerName,
      senderName,
      relationshipDate,
      themeColor,
      musicEnabled: config.musicEnabled,
      slides,
    };
    onSave(updated);
    setIsOpen(false);
  };

  const generateShareLink = () => {
    const updated: JournalConfig = {
      partnerName,
      senderName,
      relationshipDate,
      themeColor,
      musicEnabled: config.musicEnabled,
      slides,
    };
    const hash = encodeConfig(updated);
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}#story=${hash}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      alert("Failed to copy automatically. Here is your link:\n" + shareUrl);
    });
  };

  return (
    <>
      {/* Settings Toggle Button */}
      <button
        id="personalize-toggle-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-white/40 backdrop-blur-md text-[#9f1239] shadow-lg p-3.5 rounded-full hover:scale-110 active:scale-95 transition-all outline-none border border-white/50 flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-widest z-40 cursor-pointer shadow-rose-900/10"
        title="Personalize Love Letter"
      >
        <Settings className="w-5 h-5 animate-spin-slow text-rose-700" />
        <span>Personalize Journal</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          id="personalize-modal-overlay"
          className="fixed inset-0 bg-rose-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            id="personalize-modal-container"
            className="bg-white/80 backdrop-blur-xl border border-white/60 w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/40 bg-white/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                <h3 className="font-sans font-black text-lg text-rose-950">Love Scrapbook Customizer</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Couple Basics */}
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50 space-y-4 shadow-sm">
                <h4 className="font-sans font-bold text-rose-900 border-b border-white/65 pb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" /> General Love Config
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-rose-900/80 mb-1">Your Partner's Name</label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      className="w-full text-stone-800 text-sm border border-stone-200 rounded-lg p-2 focus:ring-2 focus:ring-pink-300 focus:outline-none bg-white/40"
                      placeholder="e.g. My Princess"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-900/80 mb-1">Your Name (Sender)</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full text-stone-800 text-sm border border-stone-200 rounded-lg p-2 focus:ring-2 focus:ring-pink-300 focus:outline-none bg-white/40"
                      placeholder="e.g. Your Prince"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-rose-900/80 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-700" /> Relationship Anniversary
                    </label>
                    <input
                      type="date"
                      value={relationshipDate}
                      onChange={(e) => setRelationshipDate(e.target.value)}
                      className="w-full text-stone-800 text-sm border border-stone-200 rounded-lg p-2 focus:ring-2 focus:ring-pink-300 focus:outline-none bg-white/40"
                    />
                    <span className="text-[10px] text-rose-800 font-semibold mt-1 block">Used to count "Our Days Together" dynamically.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-900/80 mb-1">Journal Scrapbook Theme</label>
                    <div className="flex gap-2.5 pt-1">
                      {(['pink', 'purple', 'rose', 'cream'] as ThemeColor[]).map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setThemeColor(col)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative ${
                            col === 'pink' ? 'bg-pink-100 border-pink-400' :
                            col === 'purple' ? 'bg-purple-100 border-purple-400' :
                            col === 'rose' ? 'bg-rose-100 border-rose-400' :
                            'bg-amber-50 border-stone-300'
                          } ${themeColor === col ? 'scale-110 ring-2 ring-rose-500/20 shadow-md' : 'scale-90 hover:scale-100'}`}
                          title={`Theme: ${col}`}
                        >
                          {themeColor === col && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs">❤️</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shareable Section */}
              <div className="bg-pink-100/40 backdrop-blur-sm border border-pink-200/50 p-4 rounded-2xl space-y-2">
                <h4 className="font-sans font-semibold text-pink-850 text-sm flex items-center gap-1.5">
                  ✨ Instant Shareable Link for Her
                </h4>
                <p className="text-xs text-pink-900 leading-relaxed font-serif italic">
                  Design your slides below, edit memories with your shared dates and local jokes. When you are done, click "Generate Private Link". It will copy a special URL to your clipboard containing all your details, ready to send to her! No signup required.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={generateShareLink}
                    className="bg-pink-600/80 hover:bg-pink-700/90 text-white font-bold text-[10px] tracking-widest uppercase px-5 py-2.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer border border-white/20"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied link!' : 'Generate She-Link'}</span>
                  </button>
                </div>
              </div>

              {/* Memory Slides Customizer */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/50 pb-2">
                  <h4 className="font-sans font-bold text-rose-950 text-sm flex items-center gap-2">
                    📖 Step-by-Step Slides Selection ({slides.length})
                  </h4>
                  <button
                    onClick={handleAddSlide}
                    className="text-xs text-pink-700 hover:text-pink-850 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Memory Slide
                  </button>
                </div>

                <div className="space-y-4">
                  {slides.map((slide, idx) => (
                    <div 
                      key={slide.id} 
                      className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm relative group hover:border-pink-200 transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                          Slide #{idx + 1} &middot; <span className="uppercase text-[10px]">{slide.type}</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <select
                            value={slide.type}
                            onChange={(e) => handleUpdateSlide(slide.id, { type: e.target.value as any })}
                            className="text-stone-600 text-xs border border-stone-200 rounded p-1 bg-stone-50 outline-none"
                          >
                            <option value="envelope">🔑 Cover Envelope</option>
                            <option value="counter">⏳ Anniversary Day Count</option>
                            <option value="memory">📝 Beautiful Polaroid Memory</option>
                            <option value="letter">📧 Heartsong Letter</option>
                            <option value="quiz">🧩 Sweet Trivia Check</option>
                            <option value="ending">💍 Final Question Proposal</option>
                          </select>
                          
                          <button
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="text-stone-400 hover:text-red-500 p-1 rounded-md hover:bg-stone-50 transition-colors cursor-pointer"
                            title="Delete Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Common fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">Slide Title</label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => handleUpdateSlide(slide.id, { title: e.target.value })}
                            className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-stone-50"
                            placeholder="e.g. Cherry Blossoms"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">Slide Subtitle / Date</label>
                          <input
                            type="text"
                            value={slide.subtitle || ''}
                            onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                            className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-stone-50"
                            placeholder="e.g. October 12, 2024"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Description / Narration</label>
                        <textarea
                          rows={2}
                          value={slide.description}
                          onChange={(e) => handleUpdateSlide(slide.id, { description: e.target.value })}
                          className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-stone-50 resize-none"
                          placeholder="Tell the beautiful story or add romantic background details..."
                        />
                      </div>

                      {/* Image selector */}
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Slide Image (Unsplash or Custom Link)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={slide.image || ''}
                            onChange={(e) => handleUpdateSlide(slide.id, { image: e.target.value, video: undefined })}
                            className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-stone-50"
                            placeholder="Paste image web address (https://...)"
                          />
                          <select
                            value={slide.image === PRESET_IMAGES.cover ? 'cover' : slide.image === PRESET_IMAGES.couple ? 'couple' : slide.image === PRESET_IMAGES.polaroid ? 'polaroid' : 'custom'}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === 'cover') handleUpdateSlide(slide.id, { image: PRESET_IMAGES.cover, video: undefined });
                              else if (v === 'couple') handleUpdateSlide(slide.id, { image: PRESET_IMAGES.couple, video: undefined });
                              else if (v === 'polaroid') handleUpdateSlide(slide.id, { image: PRESET_IMAGES.polaroid, video: undefined });
                            }}
                            className="text-stone-600 text-xs border border-stone-200 rounded px-1.5 bg-stone-50 outline-none"
                          >
                            <option value="cover">🌸 Preset Letter Cover</option>
                            <option value="couple">✨ Preset Cozy Couple</option>
                            <option value="polaroid">📸 Preset Polaroid Frame</option>
                            <option value="custom">🔗 Custom Link</option>
                          </select>
                        </div>
                      </div>

                      {/* Video selector */}
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Slide Video (Optional - Web Link or base64)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={slide.video || ''}
                            onChange={(e) => handleUpdateSlide(slide.id, { video: e.target.value, image: undefined })}
                            className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-stone-50"
                            placeholder="Paste video URL or drag-drop file onto slide cards"
                          />
                        </div>
                      </div>

                      {/* File Uploader button inside customizer */}
                      <div className="bg-stone-50 p-2 text-center rounded-lg border border-dashed border-stone-200">
                        <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">Upload Photo or Video file</label>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const isVideo = file.type.startsWith('video/');
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target && typeof event.target.result === 'string') {
                                  if (isVideo) {
                                    handleUpdateSlide(slide.id, { video: event.target.result, image: undefined });
                                  } else {
                                    handleUpdateSlide(slide.id, { image: event.target.result, video: undefined });
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-[10px] text-stone-600 w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                        />
                      </div>

                      {/* Slide-specific Type Fields */}
                      {slide.type === 'letter' && (
                        <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg space-y-2">
                          <label className="block text-[10px] font-semibold text-amber-800 uppercase tracking-wide">Handspoken Letter Body (Lines separated by space or newline)</label>
                          <textarea
                            rows={3}
                            value={slide.letterBody || ''}
                            onChange={(e) => handleUpdateSlide(slide.id, { letterBody: e.target.value })}
                            className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-white resize-none"
                            placeholder="Write the deeply emotional, secrets, and feelings of your love..."
                          />
                        </div>
                      )}

                      {slide.type === 'quiz' && (
                        <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-lg space-y-2">
                          <label className="block text-[10px] font-semibold text-indigo-800 uppercase tracking-wide">Love Trivia Check</label>
                          <div>
                            <label className="block text-[9px] text-stone-500 mb-0.5">Quiz Question</label>
                            <input
                              type="text"
                              value={slide.quizQuestion || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { quizQuestion: e.target.value })}
                              className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-white"
                              placeholder="e.g. What is my favorite movie to watch with you?"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] text-stone-500">Answers Options (4 items)</label>
                            {Array.from({ length: 4 }).map((_, optIdx) => {
                              const opts = slide.quizAnswers || ['', '', '', ''];
                              return (
                                <div key={optIdx} className="flex items-center gap-1.5">
                                  <input
                                    type="radio"
                                    name={`correct-${slide.id}`}
                                    checked={slide.correctAnswerIndex === optIdx}
                                    onChange={() => handleUpdateSlide(slide.id, { correctAnswerIndex: optIdx })}
                                    className="accent-pink-500"
                                  />
                                  <input
                                    type="text"
                                    value={opts[optIdx] || ''}
                                    onChange={(e) => {
                                      const copy = [...opts];
                                      copy[optIdx] = e.target.value;
                                      handleUpdateSlide(slide.id, { quizAnswers: copy });
                                    }}
                                    className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-white"
                                    placeholder={`Option ${optIdx + 1}`}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div>
                            <label className="block text-[9px] text-stone-500 mb-0.5">Success Congratulations Popnote</label>
                            <input
                              type="text"
                              value={slide.successMessage || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { successMessage: e.target.value })}
                              className="w-full text-stone-800 text-xs border border-stone-200 rounded p-1.5 bg-white"
                              placeholder="Congrats! I love you so much!"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer containing Save & Reset */}
            <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm("Reset everything block back to original default layout? Doing this removes any current custom memory edit.")) {
                    onReset();
                    setIsOpen(false);
                    // Force refresh to reload initial config
                    window.location.reload();
                  }
                }}
                className="text-stone-500 hover:text-stone-700 hover:bg-stone-200/60 transition-colors px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 active:scale-95 border border-stone-300 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white text-stone-600 hover:text-stone-800 hover:bg-stone-50 border border-stone-200 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 hover:shadow-md cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Slides</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
