import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Terminal, Settings, Brain, Monitor, Sparkles } from 'lucide-react';
import { ChatSummary } from './Sidebar';

interface CommandPaletteProps {
  onClose: () => void;
  chats: ChatSummary[];
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
  onOpenSettings: () => void;
  onOpenMemory: () => void;
  onToggleHologram: () => void;
  onUpdatePreferences: (prefs: { theme: string }) => void;
  accentColor: string;
}

export default function CommandPalette({
  onClose,
  chats,
  onSelectChat,
  onCreateChat,
  onOpenSettings,
  onOpenMemory,
  onToggleHologram,
  onUpdatePreferences,
  accentColor
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAccentTextClass = () => {
    switch (accentColor) {
      case 'purple': return 'text-neon-purple';
      case 'amber': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-neon-cyan';
    }
  };

  const getAccentBgClass = (isSelected: boolean) => {
    if (!isSelected) return 'bg-transparent';
    switch (accentColor) {
      case 'purple': return 'bg-neon-purple/20 text-white border-l-2 border-neon-purple';
      case 'amber': return 'bg-amber-500/20 text-white border-l-2 border-amber-500';
      case 'emerald': return 'bg-emerald-500/20 text-white border-l-2 border-emerald-500';
      case 'blue': return 'bg-blue-500/20 text-white border-l-2 border-blue-500';
      default: return 'bg-neon-cyan/20 text-white border-l-2 border-neon-cyan';
    }
  };

  // Commands definition
  const systemCommands = [
    { icon: <Sparkles size={16} />, label: 'Create New Chat', shortcut: '/new', action: () => { onCreateChat(); onClose(); } },
    { icon: <Brain size={16} />, label: 'Manage Cognitive Memories', shortcut: '/memory', action: () => { onOpenMemory(); onClose(); } },
    { icon: <Settings size={16} />, label: 'Open System Settings', shortcut: '/settings', action: () => { onOpenSettings(); onClose(); } },
    { icon: <Monitor size={16} />, label: 'Toggle Hologram Mode', shortcut: '/hologram', action: () => { onToggleHologram(); onClose(); } },
    { icon: <Terminal size={16} />, label: 'Switch Theme to Cosmic Space', shortcut: '/theme space', action: () => { onUpdatePreferences({ theme: 'space' }); onClose(); } },
    { icon: <Terminal size={16} />, label: 'Switch Theme to Ethereal Dream', shortcut: '/theme dream', action: () => { onUpdatePreferences({ theme: 'dream' }); onClose(); } },
    { icon: <Terminal size={16} />, label: 'Switch Theme to Retro Cyberpunk', shortcut: '/theme cyber', action: () => { onUpdatePreferences({ theme: 'cyber' }); onClose(); } }
  ];

  // Filter items
  const filteredCommands = systemCommands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.shortcut.toLowerCase().includes(query.toLowerCase())
  );

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(query.toLowerCase())
  );

  const totalItems = [...filteredCommands, ...filteredChats];

  useEffect(() => {
    inputRef.current?.focus();
    
    // Close on escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Navigate lists
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems.length) % totalItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalItems[selectedIndex]) {
        executeItem(totalItems[selectedIndex]);
      }
    }
  };

  const executeItem = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item._id) {
      onSelectChat(item._id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px] flex items-start justify-center pt-[15vh] p-4">
      <div 
        onKeyDown={handleKeyDown}
        className="glass-panel max-w-lg w-full flex flex-col gap-4 border border-white/20 shadow-glow-cyan animate-fade-in pointer-events-auto max-h-[60vh] overflow-hidden !p-4"
      >
        {/* Input area */}
        <div className="relative flex items-center border-b border-white/10 pb-3">
          <Search size={18} className="absolute left-3 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or chat title..."
            className="w-full bg-transparent pl-10 pr-4 py-1.5 text-sm text-white font-inter outline-none"
          />
          <span className="text-[10px] bg-white/10 text-slate-400 font-mono font-bold px-2 py-0.5 rounded border border-white/5 uppercase select-none shrink-0">
            ESC
          </span>
        </div>

        {/* List of elements */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 hide-scrollbar">
          {/* Render Commands */}
          {filteredCommands.length > 0 && (
            <div className="flex flex-col gap-0.5 mb-2">
              <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase px-2 py-1">Commands</span>
              {filteredCommands.map((cmd, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={cmd.shortcut}
                    onClick={() => executeItem(cmd)}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${getAccentBgClass(isSelected)}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isSelected ? 'text-white' : 'text-slate-400'}>{cmd.icon}</span>
                      <span className={isSelected ? 'text-white font-medium' : 'text-slate-300'}>{cmd.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-black/40 border border-white/5 px-1.5 py-0.5 rounded">
                      {cmd.shortcut}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Render Chats */}
          {filteredChats.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase px-2 py-1">Conversations</span>
              {filteredChats.map((chat, idx) => {
                const listIdx = filteredCommands.length + idx;
                const isSelected = selectedIndex === listIdx;
                return (
                  <div
                    key={chat._id}
                    onClick={() => executeItem(chat)}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${getAccentBgClass(isSelected)}`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <MessageSquare size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                      <span className={`truncate ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>{chat.title}</span>
                    </div>
                    <span className="text-[8px] text-slate-500 font-inter">
                      {chat.folder || 'Root'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {totalItems.length === 0 && (
            <div className="text-center text-xs text-slate-500 py-6 italic">
              No matching commands or chats found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
