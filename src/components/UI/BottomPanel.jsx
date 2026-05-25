import React from 'react';
import { RotateCcw, ArrowDownToLine, Rocket, Scan, Palette, Music, VolumeX, MessageSquare, HelpCircle } from 'lucide-react';

export default function BottomPanel({ gravityMode, onToggleGravity, warpMode, onToggleWarp, scanMode, onToggleScan, theme, setTheme, musicPlaying, onToggleMusic, chatOpen, onToggleChat, aboutOpen, onToggleAbout }) {
  const themes = ['space', 'dream', 'cyber'];
  const nextTheme = () => {
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 px-8 py-4 rounded-full glass-panel !w-auto pointer-events-auto">
      
      <button 
        className={`p-2 rounded-full transition-colors cursor-pointer ${scanMode ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        title="Toggle Holographic Scan"
        onClick={onToggleScan}
      >
        <Scan size={20} />
      </button>

      <button 
        className={`p-2 rounded-full transition-colors cursor-pointer ${warpMode ? 'text-neon-purple drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        title="Toggle Warp Speed"
        onClick={onToggleWarp}
      >
        <Rocket size={20} />
      </button>
      
      <button 
        className={`p-2 rounded-full transition-colors cursor-pointer ${gravityMode ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        title="Toggle Gravity Mode"
        onClick={onToggleGravity}
      >
        <ArrowDownToLine size={20} />
      </button>

      <button 
        className={`p-2 rounded-full transition-colors cursor-pointer ${chatOpen ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        title="Toggle Comm Link"
        onClick={onToggleChat}
      >
        <MessageSquare size={20} />
      </button>

      <button 
        className={`p-2 rounded-full transition-colors cursor-pointer ${musicPlaying ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        title="Toggle Generative Ambient Chords"
        onClick={onToggleMusic}
      >
        {musicPlaying ? <Music size={20} className="animate-pulse" /> : <VolumeX size={20} />}
      </button>
      
      <div className="w-px h-6 bg-white/20 self-center mx-2"></div>
      
      <button 
        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title={`Current Theme: ${theme}. Click to change.`}
        onClick={nextTheme}
      >
        <Palette size={20} className={theme === 'cyber' ? 'text-neon-cyan' : theme === 'dream' ? 'text-neon-purple' : ''} />
      </button>

      <button 
        className={`p-2 rounded-full transition-colors cursor-pointer ${aboutOpen ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        title="System Information & Commands"
        onClick={onToggleAbout}
      >
        <HelpCircle size={20} />
      </button>

      <button 
        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title="Reset Scene"
        onClick={() => window.location.reload()}
      >
        <RotateCcw size={20} />
      </button>

    </div>
  );
}
