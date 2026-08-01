import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, X, RefreshCw, Send, Sparkles, HelpCircle, Eye, FileText, Check } from 'lucide-react';
import MessageItem, { Message } from './MessageItem';

interface UploadedFile {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string; // Base64 data URL for images
  createdAt: string;
}

interface ImageAnalyzerProps {
  uploads: UploadedFile[];
  onUploadFile: (file: { fileName: string; fileType: string; fileSize: number; content: string }) => Promise<any>;
  onDeleteUpload: (id: string) => Promise<void>;
  onSendMessage: (text: string, attachedFiles: any[]) => void;
  messages: Message[];
  aiGenerating: boolean;
  onStopGenerating: () => void;
  accentColor: string;
}

export default function ImageAnalyzer({
  uploads,
  onUploadFile,
  onDeleteUpload,
  onSendMessage,
  messages,
  aiGenerating,
  onStopGenerating,
  accentColor
}: ImageAnalyzerProps) {
  const [selectedImg, setSelectedImg] = useState<UploadedFile | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filter uploads to show only images
  const imageUploads = uploads.filter(doc => 
    doc.fileType?.startsWith('image/') || 
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(doc.fileName)
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiGenerating]);

  useEffect(() => {
    if (imageUploads.length > 0 && !selectedImg) {
      setSelectedImg(imageUploads[0]);
    }
  }, [uploads]);

  const getAccentTextClass = () => {
    switch (accentColor) {
      case 'purple': return 'text-neon-purple';
      case 'amber': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-neon-cyan';
    }
  };

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case 'purple': return 'border-neon-purple/50 bg-neon-purple/5 focus:border-neon-purple';
      case 'amber': return 'border-amber-500/50 bg-amber-500/5 focus:border-amber-500';
      case 'emerald': return 'border-emerald-500/50 bg-emerald-500/5 focus:border-emerald-500';
      case 'blue': return 'border-blue-500/50 bg-blue-500/5 focus:border-blue-500';
      default: return 'border-neon-cyan/50 bg-neon-cyan/5 focus:border-neon-cyan';
    }
  };

  const getAccentBgClass = () => {
    switch (accentColor) {
      case 'purple': return 'bg-neon-purple/20 border-neon-purple hover:bg-neon-purple text-neon-purple hover:text-black';
      case 'amber': return 'bg-amber-500/20 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black';
      case 'emerald': return 'bg-emerald-500/20 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black';
      case 'blue': return 'bg-blue-500/20 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black';
      default: return 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black';
    }
  };

  const uploadImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const saved = await onUploadFile({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          content: base64
        });
        setSelectedImg(saved);
      } catch (err) {
        alert("Failed to upload image.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  const submitChat = (presetText?: string) => {
    if (!selectedImg) return;
    const promptText = presetText || chatInput.trim();
    if (!promptText) return;

    // Attach selected image content
    const attachments = [{
      name: selectedImg.fileName,
      type: selectedImg.fileType,
      size: selectedImg.fileSize,
      content: selectedImg.content
    }];

    onSendMessage(promptText, attachments);
    setChatInput('');
  };

  const presets = [
    { label: 'Describe Details', prompt: 'Provide a detailed, step-by-step description of this image, detailing visual elements, layouts, colors, and overall context.' },
    { label: 'Extract Text (OCR)', prompt: 'Perform optical character recognition (OCR) on this image. Extract all readable text word-for-word, preserving line layouts.' },
    { label: 'Analyze Code Screenshot', prompt: 'This is a screenshot of program code. Please transcribe the code block exactly, check for syntax errors or bugs, and provide optimized code.' },
    { label: 'Identify Elements', prompt: 'Identify all key objects, layouts, diagrams, annotations, and logical entities in this image and list them.' }
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden pointer-events-auto h-full w-full">
      
      {/* Left panel: Grid of thumbnails and large previewer with presets */}
      <div className="flex-[4] flex flex-col gap-4 overflow-hidden h-full">
        {/* Upload Slot */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-white/20 bg-black/25 hover:bg-black/35 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="animate-spin text-neon-cyan" size={16} />
              <span>Decoding image array...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className={`mb-0.5 ${getAccentTextClass()}`} size={20} />
              <span className="text-xs font-bold text-white font-outfit uppercase">LOAD VISION CHIP</span>
              <span className="text-[10px] text-slate-400">Upload JPG, PNG, WEBP, or GIF (max 10MB)</span>
            </div>
          )}
        </div>

        {/* Thumbnail Selector Grid */}
        {imageUploads.length > 0 && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 shrink-0">
            <span className="text-[9px] font-bold text-slate-400 font-outfit tracking-wider uppercase px-1">Astra Visual Nodes</span>
            
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {imageUploads.map(img => (
                <div
                  key={img._id}
                  onClick={() => setSelectedImg(img)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border cursor-pointer shrink-0 transition-all ${
                    selectedImg?._id === img._id ? getAccentBorderClass() : 'border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img.content} 
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Forget image node: ${img.fileName}?`)) {
                        onDeleteUpload(img._id);
                        if (selectedImg?._id === img._id) setSelectedImg(null);
                      }
                    }}
                    className="absolute right-1 top-1 p-0.5 bg-black/60 hover:bg-black text-slate-400 hover:text-red-400 rounded transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Preview & Presets Container */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden gap-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
              <Eye size={13} className={getAccentTextClass()} /> Optical Viewport
            </span>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row gap-4 overflow-hidden">
            {/* Real scale image preview */}
            <div className="flex-[6] bg-black/35 rounded-xl border border-white/5 p-2 overflow-hidden flex items-center justify-center relative min-h-[150px]">
              {selectedImg ? (
                <img 
                  src={selectedImg.content} 
                  alt={selectedImg.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-xs text-slate-600 italic flex flex-col items-center gap-2">
                  <ImageIcon size={32} className="opacity-30" />
                  <span>Optic matrix empty. Load an image to start scanning.</span>
                </div>
              )}
            </div>

            {/* Vision Presets */}
            {selectedImg && (
              <div className="flex-[4] flex flex-col gap-2 justify-center">
                <span className="text-[9px] font-bold text-slate-500 font-outfit tracking-wider uppercase mb-1">OPTICAL MACROS</span>
                {presets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => submitChat(p.prompt)}
                    disabled={aiGenerating}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group disabled:opacity-50"
                  >
                    <span>{p.label}</span>
                    <Sparkles size={11} className={`opacity-0 group-hover:opacity-100 transition-opacity ${getAccentTextClass()}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Chat interface */}
      <div className="flex-[5] flex flex-col bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden h-full">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className={getAccentTextClass()} />
            <span className="text-xs font-bold text-white font-outfit uppercase">OPTICAL ANALYSIS LOGS</span>
          </div>
          {selectedImg && (
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/20 px-2.5 py-0.5 rounded border border-cyan-800/30 truncate max-w-[180px]">
              Lens: {selectedImg.fileName}
            </span>
          )}
        </div>

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-2.5 hide-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none max-w-sm mx-auto">
              <Sparkles size={32} className={`${getAccentTextClass()} mb-3 animate-pulse`} />
              <h3 className="font-outfit text-sm font-bold text-white uppercase tracking-wider mb-1">OPTICAL COGNITION LINK</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Ask specific questions about details in the selected picture, diagrams, flowchart logic, or text layout.
              </p>
              {selectedImg && (
                <button
                  onClick={() => submitChat(presets[0].prompt)}
                  className="px-4 py-2 border border-white/10 bg-white/5 rounded-xl text-[10px] font-bold text-slate-200 hover:bg-white/10 transition-colors"
                >
                  🚀 Describe selected image
                </button>
              )}
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageItem
                key={idx}
                msg={msg}
                index={idx}
                isLast={idx === messages.length - 1}
                onEditPrompt={() => {}}
                onRegenerate={() => {}}
                accentColor={accentColor}
              />
            ))
          )}
          
          {aiGenerating && messages[messages.length - 1]?.text === '' && (
            <div className="flex items-center gap-1.5 p-3 rounded-xl border self-start mr-12 bg-white/5 border-white/5 text-slate-400 text-xs shrink-0">
              <RefreshCw className="animate-spin text-neon-cyan" size={12} />
              <span>Scanning optical matrices...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Text Input Row */}
        <div className="flex items-end gap-2 pt-2 border-t border-white/5">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitChat();
              }
            }}
            placeholder={selectedImg ? `Ask about active lens image...` : "Select an image node to scan..."}
            disabled={!selectedImg || aiGenerating}
            rows={1}
            className="flex-1 bg-black/35 border border-white/10 rounded-xl p-3 text-xs text-white font-inter outline-none focus:border-white/20 transition-colors max-h-[80px] resize-none disabled:opacity-50"
          />

          {aiGenerating ? (
            <button
              onClick={onStopGenerating}
              className="w-10 h-10 bg-red-500/20 border border-red-500 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={() => submitChat()}
              disabled={!selectedImg || aiGenerating}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${getAccentBgClass()} disabled:opacity-50`}
            >
              <Send size={16} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
