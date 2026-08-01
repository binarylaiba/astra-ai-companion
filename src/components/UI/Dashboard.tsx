import React from 'react';
import { 
  Sparkles, MessageSquare, FileText, Image, Code, Brain, BookOpen, 
  User, Activity, Calendar, ArrowRight, Upload, Plus 
} from 'lucide-react';
import { ChatSummary } from './Sidebar';
import { MemoryItem } from './MemoryManager';

interface DashboardProps {
  user: any;
  chats: ChatSummary[];
  memories: MemoryItem[];
  uploads: any[];
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
  onSwitchModule: (module: string) => void;
  accentColor: string;
}

export default function Dashboard({
  user,
  chats,
  memories,
  uploads,
  onSelectChat,
  onCreateChat,
  onSwitchModule,
  accentColor
}: DashboardProps) {
  
  const getGreeting = () => {
    const hr = new Date().getHours();
    const name = user?.name || 'User';
    if (hr < 12) return `🌌 Good Morning, ${name}`;
    if (hr < 18) return `✨ Good Afternoon, ${name}`;
    return `🛰️ Good Evening, ${name}`;
  };

  const getAccentTextClass = () => {
    switch (accentColor) {
      case 'purple': return 'text-neon-purple';
      case 'amber': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-neon-cyan';
    }
  };

  const getAccentGlowClass = () => {
    switch (accentColor) {
      case 'purple': return 'shadow-[0_0_20px_rgba(168,85,247,0.15)] border-neon-purple/20';
      case 'amber': return 'shadow-[0_0_20px_rgba(245,158,11,0.15)] border-amber-500/20';
      case 'emerald': return 'shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/20';
      case 'blue': return 'shadow-[0_0_20px_rgba(59,130,246,0.15)] border-blue-500/20';
      default: return 'shadow-[0_0_20px_rgba(34,211,238,0.15)] border-neon-cyan/20';
    }
  };

  const getAccentBgClass = () => {
    switch (accentColor) {
      case 'purple': return 'bg-neon-purple/20 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black';
      case 'amber': return 'bg-amber-500/20 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black';
      case 'emerald': return 'bg-emerald-500/20 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black';
      case 'blue': return 'bg-blue-500/20 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black';
      default: return 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black';
    }
  };

  const getModuleIcon = (mod: string) => {
    switch (mod) {
      case 'chat': return <MessageSquare size={16} />;
      case 'document': return <FileText size={16} />;
      case 'image': return <Image size={16} />;
      case 'coding': return <Code size={16} />;
      case 'prompts': return <BookOpen size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const quickActions = [
    { name: 'AI Chat Core', desc: 'Converse with Astra companion', module: 'chat', icon: <MessageSquare size={20} /> },
    { name: 'Doc Analyzer', desc: 'Scan and digest text files', module: 'document', icon: <FileText size={20} /> },
    { name: 'Image Vision', desc: 'Extract data from uploads', module: 'image', icon: <Image size={20} /> },
    { name: 'Coding Deck', desc: 'Refactor and write unit tests', module: 'coding', icon: <Code size={20} /> },
    { name: 'Prompt Deck', desc: 'Execute pre-engineered templates', module: 'prompts', icon: <BookOpen size={20} /> }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 hide-scrollbar pointer-events-auto h-full pb-4">
      
      {/* Greeting Header Card */}
      <div className={`p-6 rounded-2xl border bg-black/40 backdrop-blur-[15px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${getAccentGlowClass()}`}>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-outfit text-2xl md:text-3xl font-black tracking-wide text-white">
            {getGreeting()}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Welcome to the Anti Gravity AI Workspace. Your shipboard cognitive terminal is active. Launch channels, query data clusters, or optimize development segments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateChat}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2 cursor-pointer ${getAccentBgClass()}`}
          >
            <Plus size={14} /> New Chat
          </button>
          
          <button
            onClick={() => onSwitchModule('chat')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
          >
            Open Chat Feed
          </button>
        </div>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { name: 'ACTIVE CHANNELS', count: chats.length, detail: 'Conversations saved', icon: <MessageSquare size={16} /> },
          { name: 'COGNITIVE LOGS', count: memories.length, detail: 'Long-term memories', icon: <Brain size={16} /> },
          { name: 'DATA UPLOADS', count: uploads.length, detail: 'Parsed source files', icon: <FileText size={16} /> },
          { name: 'AUTH SECTOR', count: user?.isGuest ? 'GUEST' : 'SECURE', detail: user?.isGuest ? 'Mock local storage' : 'JWT Database verified', icon: <User size={16} /> }
        ].map((stat, idx) => (
          <div key={idx} className="bg-black/35 border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase font-outfit">{stat.name}</span>
              <span className="text-xl font-extrabold text-white font-outfit leading-none py-0.5">{stat.count}</span>
              <span className="text-[10px] text-slate-400">{stat.detail}</span>
            </div>
            <div className={`p-3 bg-white/5 border border-white/5 rounded-xl shrink-0 ${getAccentTextClass()}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Module Navigation Deck */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold text-slate-400 font-outfit uppercase tracking-wider px-1">WORKSPACE OPERATIONS</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {quickActions.map(action => (
            <button
              key={action.module}
              onClick={() => onSwitchModule(action.module)}
              className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:-translate-y-1 transition-all text-left flex flex-col gap-2 cursor-pointer group shadow-sm"
            >
              <div className={`p-2 bg-black/40 border border-white/10 w-fit rounded-lg ${getAccentTextClass()} group-hover:scale-105 transition-transform`}>
                {action.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white font-outfit group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  {action.name} <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{action.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Grid Workspace details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 shrink-0">
        
        {/* Card: Recent conversations */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-3.5 max-h-[300px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
              <MessageSquare size={13} className={getAccentTextClass()} /> Recent Conversations
            </span>
            <button
              onClick={() => onSwitchModule('chat')}
              className="text-[10px] font-semibold text-slate-500 hover:text-white transition-colors"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 hide-scrollbar">
            {chats.slice(0, 4).map(chat => (
              <div
                key={chat._id}
                onClick={() => { onSwitchModule('chat'); onSelectChat(chat._id); }}
                className="flex justify-between items-center px-3.5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer group border border-white/5"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <MessageSquare size={14} className="text-slate-400 group-hover:text-white" />
                  <span className="text-xs text-slate-200 font-medium group-hover:text-white truncate max-w-[180px]">
                    {chat.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {chat.folder && (
                    <span className="text-[8px] bg-black/40 border border-white/5 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-slate-400">
                      {chat.folder}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-500">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            
            {chats.length === 0 && (
              <div className="text-center text-xs text-slate-500 italic py-6">
                No active conversations
              </div>
            )}
          </div>
        </div>

        {/* Card: Latest Memories */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-3.5 max-h-[300px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
              <Brain size={13} className={getAccentTextClass()} /> Cognitive Memory Snapshots
            </span>
            <button
              onClick={() => onSwitchModule('chat')} // Memories can open MemoryManager via command palette/sidebar, but we switch to chat to access
              className="text-[10px] font-semibold text-slate-500 hover:text-white transition-colors"
            >
              Examine System
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 hide-scrollbar">
            {memories.slice(0, 3).map(mem => (
              <div
                key={mem._id}
                className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-1"
              >
                <p className="text-xs text-slate-200 font-inter">{mem.content}</p>
                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                  <span>Category: {mem.category}</span>
                  <span>Logged {new Date(mem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {memories.length === 0 && (
              <div className="text-center text-xs text-slate-500 italic py-8 border border-dashed border-white/5 rounded-xl">
                No cognitive log sectors recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Card: Document Upload nodes */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-3.5 max-h-[300px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
              <FileText size={13} className={getAccentTextClass()} /> Uploaded Data Nodes
            </span>
            <button
              onClick={() => onSwitchModule('document')}
              className="text-[10px] font-semibold text-slate-500 hover:text-white transition-colors"
            >
              Analyze Docs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 hide-scrollbar">
            {uploads.slice(0, 3).map(doc => (
              <div
                key={doc._id}
                onClick={() => onSwitchModule('document')}
                className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-slate-400 group-hover:text-white" />
                  <span className="text-xs text-slate-300 truncate max-w-[150px] group-hover:text-white font-medium">
                    {doc.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-slate-500">
                    {(doc.fileSize / 1024).toFixed(1)} KB
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {uploads.length === 0 && (
              <div className="text-center text-xs text-slate-500 italic py-8 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-1">
                <span>No document datasets loaded.</span>
                <button
                  onClick={() => onSwitchModule('document')}
                  className="text-[9px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Upload size={10} /> Upload File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card: Quick prompts deck */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-3.5 max-h-[300px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
              <BookOpen size={13} className={getAccentTextClass()} /> Recommended Prompts
            </span>
            <button
              onClick={() => onSwitchModule('prompts')}
              className="text-[10px] font-semibold text-slate-500 hover:text-white transition-colors"
            >
              Prompt Deck
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 hide-scrollbar">
            {[
              { title: "Generate Unit Test", desc: "Build unit tests for code blocks", text: "Please write comprehensive unit tests for this code:\n\n```\n[Paste code here]\n```" },
              { title: "Bug Finder (Debug)", desc: "Identify security and logical bugs", text: "There is a bug in this code. Please help me identify and fix it:\n\n```\n[Paste code here]\n```" },
              { title: "Mermaid Flowchart", desc: "Generate system structure diagram", text: "Create a Mermaid diagram showing a simple client-server REST API request/response flow." }
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSwitchModule('chat');
                  // We can copy this template message directly into AI input
                  const ta = document.querySelector('textarea');
                  if (ta) {
                    ta.value = prompt.text;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.focus();
                  }
                }}
                className="text-left p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-xs flex justify-between items-center cursor-pointer group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">{prompt.title}</span>
                  <span className="text-slate-400 text-[10px]">{prompt.desc}</span>
                </div>
                <ArrowRight size={12} className="text-slate-500 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
