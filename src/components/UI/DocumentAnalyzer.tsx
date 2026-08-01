import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, X, RefreshCw, Send, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import MessageItem, { Message } from './MessageItem';

interface UploadedDoc {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  createdAt: string;
}

interface DocumentAnalyzerProps {
  uploads: UploadedDoc[];
  onUploadFile: (file: { fileName: string; fileType: string; fileSize: number; content: string }) => Promise<any>;
  onDeleteUpload: (id: string) => Promise<void>;
  onSendMessage: (text: string, attachedFiles: any[]) => void;
  messages: Message[];
  aiGenerating: boolean;
  onStopGenerating: () => void;
  accentColor: string;
}

export default function DocumentAnalyzer({
  uploads,
  onUploadFile,
  onDeleteUpload,
  onSendMessage,
  messages,
  aiGenerating,
  onStopGenerating,
  accentColor
}: DocumentAnalyzerProps) {
  const [selectedDoc, setSelectedDoc] = useState<UploadedDoc | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiGenerating]);

  // Set the first uploaded doc as selected by default if nothing selected yet
  useEffect(() => {
    if (uploads.length > 0 && !selectedDoc) {
      setSelectedDoc(uploads[0]);
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

  const parseAndSaveFile = async (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.onload = async (e) => {
          const txt = e.target?.result as string;
          await onUploadFile({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: txt
          });
          setIsUploading(false);
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          await onUploadFile({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: base64
          });
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        // PDF & DOCX parsed by backend
        reader.onload = async (e) => {
          try {
            const base64Data = e.target?.result as string;
            const parseRes = await fetch('/api/files/parse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileData: base64Data
              })
            });

            if (parseRes.ok) {
              const data = await parseRes.json();
              await onUploadFile({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                content: data.text
              });
            } else {
              const err = await parseRes.json();
              alert(`Parsing Error: ${err.error || 'Server error'}`);
            }
          } catch (err) {
            alert('Failed to connect to parser service.');
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseAndSaveFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseAndSaveFile(file);
  };

  const submitChat = () => {
    if (!chatInput.trim() && !selectedDoc) return;
    
    // Attach selected document to AI prompt context explicitly
    const attachedFiles = selectedDoc ? [{
      name: selectedDoc.fileName,
      type: selectedDoc.fileType,
      size: selectedDoc.fileSize,
      content: selectedDoc.content
    }] : [];

    const promptText = chatInput.trim() || `Please review this document and summarize the core key findings and structure.`;
    
    onSendMessage(promptText, attachedFiles);
    setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden pointer-events-auto h-full w-full">
      
      {/* Left panel: Uploader & File list / Text view */}
      <div className="flex-[4] flex flex-col gap-4 overflow-hidden h-full">
        {/* Upload Box */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            dragOver ? getAccentBorderClass() : 'border-white/10 hover:border-white/20 bg-black/25 hover:bg-black/35'
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt,image/*"
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="animate-spin text-neon-cyan" size={18} />
              <span>Analyzing file layout and extracting vectors...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className={`mb-1 ${getAccentTextClass()}`} size={24} />
              <span className="text-xs font-bold text-white font-outfit">UPLOAD DOCUMENT SECTOR</span>
              <span className="text-[10px] text-slate-400">Drag & Drop or Click to browse (PDF, DOCX, TXT, Image)</span>
            </div>
          )}
        </div>

        {/* Workspace: File list / Reader split */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-300 font-outfit uppercase">Data Cluster Repositories</span>
            <span className="text-[10px] text-slate-500 font-bold">{uploads.length} nodes loaded</span>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row gap-4 overflow-hidden">
            {/* Scrollable file list */}
            <div className="flex-[3] overflow-y-auto flex flex-col gap-1.5 pr-1 border-r border-white/5 sm:max-h-full max-h-[150px] hide-scrollbar">
              {uploads.map(doc => (
                <div
                  key={doc._id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`flex justify-between items-center p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    selectedDoc?._id === doc._id 
                      ? getAccentBorderClass()
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full">
                    <FileText size={14} className={selectedDoc?._id === doc._id ? getAccentTextClass() : 'text-slate-400'} />
                    <span className="text-xs text-slate-200 group-hover:text-white truncate font-medium max-w-[120px]">
                      {doc.fileName}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove document cluster: ${doc.fileName}?`)) {
                        onDeleteUpload(doc._id);
                        if (selectedDoc?._id === doc._id) setSelectedDoc(null);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Data Cluster"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {uploads.length === 0 && (
                <div className="text-center text-xs text-slate-600 italic py-6">
                  No files uploaded
                </div>
              )}
            </div>

            {/* Selected File text preview */}
            <div className="flex-[5] flex flex-col overflow-hidden h-full">
              {selectedDoc ? (
                <div className="flex flex-col overflow-hidden h-full gap-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span className="truncate max-w-[150px]">Node: {selectedDoc.fileName}</span>
                    <span>{(selectedDoc.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  
                  <div className="flex-1 bg-black/35 rounded-xl border border-white/5 p-3 overflow-y-auto text-slate-300 text-xs font-mono leading-relaxed select-text hide-scrollbar">
                    {selectedDoc.content || 'File content is empty or unextractable.'}
                  </div>
                  
                  <div className="text-[9px] text-slate-500 text-right">
                    Vector character count: {selectedDoc.content.length}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/5 rounded-xl text-slate-600">
                  <FileText size={24} className="mb-2 opacity-50" />
                  <span className="text-xs italic">Select a node from the list to preview extracted payload</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Chatbox dedicated to Document */}
      <div className="flex-[5] flex flex-col bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden h-full">
        
        {/* Active Doc Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className={getAccentTextClass()} />
            <span className="text-xs font-bold text-white font-outfit uppercase">Cognitive Document Thread</span>
          </div>
          {selectedDoc && (
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/20 px-2.5 py-0.5 rounded border border-cyan-800/30 truncate max-w-[180px]">
              Target: {selectedDoc.fileName}
            </span>
          )}
        </div>

        {/* Message Feed list */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-2.5 hide-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none max-w-sm mx-auto">
              <Sparkles size={32} className={`${getAccentTextClass()} mb-3 animate-pulse`} />
              <h3 className="font-outfit text-sm font-bold text-white uppercase tracking-wider mb-1">Interactive Vector Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Ask specific questions about the active document. Astra will parse, retrieve relevant nodes, and synthesize response structures.
              </p>
              
              {selectedDoc && (
                <button
                  onClick={submitChat}
                  className="px-4 py-2 border border-white/10 bg-white/5 rounded-xl text-[10px] font-bold text-slate-200 hover:bg-white/10 transition-colors"
                >
                  🧬 Generate Document Summary
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
              <span>Analyzing layout vectors...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Text Input box */}
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
            placeholder={selectedDoc ? `Ask about "${selectedDoc.fileName}"...` : "Select a document to begin chatting..."}
            disabled={!selectedDoc || aiGenerating}
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
              onClick={submitChat}
              disabled={!selectedDoc || aiGenerating}
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
