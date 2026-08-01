import React from 'react';
import { User, LogOut, ShieldCheck, Database, Key, Activity, MessageSquare, Brain, FileText } from 'lucide-react';
import { ChatSummary } from './Sidebar';
import { MemoryItem } from './MemoryManager';

interface UserProfileProps {
  user: any;
  onLogout: () => void;
  onOpenAuth: () => void;
  accentColor: string;
  chats: ChatSummary[];
  uploads: any[];
  memories: MemoryItem[];
}

export default function UserProfile({
  user,
  onLogout,
  onOpenAuth,
  accentColor,
  chats,
  uploads,
  memories
}: UserProfileProps) {
  
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
      case 'purple': return 'shadow-[0_0_15px_rgba(168,85,247,0.15)] border-neon-purple/20';
      case 'amber': return 'shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-500/20';
      case 'emerald': return 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20';
      case 'blue': return 'shadow-[0_0_15px_rgba(59,130,246,0.15)] border-blue-500/20';
      default: return 'shadow-[0_0_15px_rgba(34,211,238,0.15)] border-neon-cyan/20';
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

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-y-auto pr-1 hide-scrollbar h-full w-full pointer-events-auto pb-4">
      
      {/* Left panel: Profile card and actions */}
      <div className="flex-[4] flex flex-col gap-4">
        {/* Profile Card */}
        <div className={`bg-black/45 border rounded-2xl p-6 flex flex-col items-center text-center gap-4 ${getAccentGlowClass()}`}>
          {/* Hologram style avatar */}
          <div className="relative w-20 h-20 rounded-full border border-white/20 bg-slate-950 flex items-center justify-center overflow-hidden avatar-spin">
            <User size={36} className={`relative z-10 ${getAccentTextClass()}`} />
          </div>

          <div className="flex flex-col">
            <h2 className="font-outfit text-lg font-black text-white">{user?.name || 'User'}</h2>
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider mt-0.5 uppercase">
              {user?.isGuest ? 'GUEST CONTEXT' : `CREW INDEX: ${user?.username}`}
            </span>
          </div>

          <div className="w-full h-px bg-white/5 my-1"></div>

          <div className="w-full flex flex-col gap-2.5 text-left text-xs text-slate-300 font-inter">
            <div className="flex justify-between">
              <span className="text-slate-500">Security Access:</span>
              <span className="font-semibold text-white">{user?.isGuest ? 'Level 0 (Guest)' : 'Level 4 (Authorized)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Email:</span>
              <span className="font-semibold text-white truncate max-w-[150px]">{user?.email || 'N/A (Local Session)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Local Vector Nodes:</span>
              <span className="font-semibold text-white">{uploads.length} uploaded</span>
            </div>
          </div>

          <div className="w-full h-px bg-white/5 my-1"></div>

          {user?.isGuest ? (
            <button
              onClick={onOpenAuth}
              className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${getAccentBgClass()}`}
            >
              <ShieldCheck size={14} /> Establish JWT Profile
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white border border-red-500/25 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} /> Close Profile Session
            </button>
          )}
        </div>

        {/* Database cluster status */}
        <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col gap-3 shadow-md">
          <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
            <Database size={13} className={getAccentTextClass()} /> Storage Node Cluster
          </span>

          <div className="flex flex-col gap-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 justify-between">
              <span>Primary Engine Status:</span>
              {user?.isGuest ? (
                <span className="text-amber-500 font-bold bg-amber-950/20 px-2 py-0.5 border border-amber-500/20 rounded">
                  Mock Local Session
                </span>
              ) : (
                <span className="text-green-400 font-bold bg-green-950/20 px-2 py-0.5 border border-green-500/20 rounded">
                  Mongoose MongoDB
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed mt-1">
              Guest profiles write to client-side localStorage. Establish a JWT profile to migrate logs into secure MongoDB cloud storage.
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Statistics & Logs */}
      <div className="flex-[6] flex flex-col gap-4">
        {/* UI Activity Log stats */}
        <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
            <Activity size={13} className={getAccentTextClass()} /> Workspace Productivity Stats
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Conversations', val: chats.length, icon: <MessageSquare size={14} /> },
              { label: 'Uploaded Nodes', val: uploads.length, icon: <FileText size={14} /> },
              { label: 'Cognitive Facts', val: memories.length, icon: <Brain size={14} /> }
            ].map(stat => (
              <div key={stat.label} className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">{stat.label}</span>
                  <span className="text-xl font-black text-white font-outfit mt-0.5">{stat.val}</span>
                </div>
                <div className={`p-2 bg-white/5 rounded-lg border border-white/5 ${getAccentTextClass()}`}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials & System Keys preview */}
        <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col gap-3 shadow-md flex-1">
          <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
            <Key size={13} className={getAccentTextClass()} /> Core API Navigational Keys
          </span>

          <div className="flex flex-col gap-3 mt-1 text-xs text-slate-300 font-inter">
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white">Google Gemini API</span>
                <span className="text-[10px] text-slate-400">Primary multimodal vision processor</span>
              </div>
              <span className="text-[10px] text-green-400 font-bold bg-green-950/20 border border-green-500/25 px-2.5 py-0.5 rounded uppercase">
                Active Config
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white">Groq API (Llama-3.3-70b)</span>
                <span className="text-[10px] text-slate-400">High velocity text engine processor</span>
              </div>
              <span className="text-[10px] text-green-400 font-bold bg-green-950/20 border border-green-500/25 px-2.5 py-0.5 rounded uppercase">
                Active Config
              </span>
            </div>

            <div className="w-full h-px bg-white/5 my-1"></div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-outfit">Active Cryptographic Session Token (JWT)</span>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[9px] font-mono text-slate-400 break-all select-text leading-relaxed max-h-24 overflow-y-auto hide-scrollbar">
                {localStorage.getItem('astra_auth_token') || 'No active JWT session token found. Session running under Guest protocols.'}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
