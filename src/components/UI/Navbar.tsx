import React, { useState } from 'react';
import { 
  Pin, Star, Archive, Monitor, Settings, Info, Edit3, Check, FolderOpen, User, LogIn, ShieldCheck
} from 'lucide-react';
import { ChatSummary } from './Sidebar';

interface NavbarProps {
  activeChat: ChatSummary | null;
  onUpdateChat: (id: string, updates: Partial<ChatSummary>) => void;
  showHologram: boolean;
  onToggleHologram: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  accentColor: string;
  user: any;
  onOpenAuth: () => void;
  onSwitchModule: (mod: string) => void;
}

export default function Navbar({
  activeChat,
  onUpdateChat,
  showHologram,
  onToggleHologram,
  onOpenSettings,
  onOpenAbout,
  accentColor,
  user,
  onOpenAuth,
  onSwitchModule
}: NavbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);

  const folders = ['General', 'Coding', 'Research', 'Personal'];

  const handleStartRename = () => {
    if (!activeChat) return;
    setEditTitle(activeChat.title);
    setIsEditingTitle(true);
  };

  const handleSaveRename = () => {
    if (activeChat && editTitle.trim()) {
      onUpdateChat(activeChat._id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleFolderSelect = (folder: string) => {
    if (activeChat) {
      onUpdateChat(activeChat._id, { folder });
    }
    setShowFolderDropdown(false);
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

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case 'purple': return 'border-neon-purple/50 bg-neon-purple/10 text-neon-purple';
      case 'amber': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
      case 'emerald': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500';
      case 'blue': return 'border-blue-500/50 bg-blue-500/10 text-blue-500';
      default: return 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan';
    }
  };

  return (
    <div className="glass-panel w-full flex items-center justify-between py-2.5 px-5 rounded-2xl border border-white/10 pointer-events-auto shadow-md shrink-0">
      {/* Title & Folder Info */}
      <div className="flex items-center gap-4 overflow-hidden max-w-[50%]">
        {activeChat ? (
          <div className="flex items-center gap-3 w-full animate-fade-in">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                  className="bg-black/40 border border-white/20 rounded px-2 py-0.5 text-xs font-semibold text-white font-inter outline-none focus:border-neon-cyan w-full max-w-[200px]"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 overflow-hidden">
                <h2 className="font-outfit text-sm font-extrabold tracking-wide text-white truncate max-w-[150px] sm:max-w-[250px]">
                  {activeChat.title}
                </h2>
                <button
                  onClick={handleStartRename}
                  className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/5 cursor-pointer"
                  title="Rename Chat"
                >
                  <Edit3 size={11} />
                </button>
              </div>
            )}

            {/* Folder Tag Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded transition-colors cursor-pointer"
                title="Select Folder"
              >
                <FolderOpen size={10} className={getAccentTextClass()} />
                <span>{activeChat.folder || 'Uncategorized'}</span>
              </button>

              {showFolderDropdown && (
                <div className="absolute left-0 mt-1 w-32 bg-slate-900/95 border border-white/10 rounded-lg py-1 shadow-2xl z-50 backdrop-blur-xl">
                  {folders.map(f => (
                    <button
                      key={f}
                      onClick={() => handleFolderSelect(f)}
                      className={`w-full text-left px-2.5 py-1 text-[10px] hover:bg-white/10 transition-colors ${activeChat.folder === f ? getAccentTextClass() : 'text-slate-300'}`}
                    >
                      {f}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFolderSelect('')}
                    className="w-full text-left px-2.5 py-1 text-[10px] hover:bg-white/10 text-slate-500 border-t border-white/5 transition-colors"
                  >
                    Remove Folder
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="font-outfit text-sm font-extrabold tracking-wide text-slate-400 select-none">
              Astra Terminal Standby
            </h2>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {activeChat && (
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            <button
              onClick={() => onUpdateChat(activeChat._id, { pinned: !activeChat.pinned })}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeChat.pinned 
                  ? getAccentBorderClass() 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={activeChat.pinned ? "Pinned" : "Pin Chat"}
            >
              <Pin size={13} className={activeChat.pinned ? 'fill-current' : ''} />
            </button>

            <button
              onClick={() => onUpdateChat(activeChat._id, { favorite: !activeChat.favorite })}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeChat.favorite 
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' 
                  : 'text-slate-400 hover:text-amber-500 hover:bg-white/5'
              }`}
              title={activeChat.favorite ? "Favorited" : "Favorite Chat"}
            >
              <Star size={13} className={activeChat.favorite ? 'fill-current' : ''} />
            </button>

            <button
              onClick={() => onUpdateChat(activeChat._id, { archived: !activeChat.archived })}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeChat.archived 
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' 
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
              }`}
              title={activeChat.archived ? "Archived" : "Archive Chat"}
            >
              <Archive size={13} />
            </button>
          </div>
        )}

        {/* 3D Hologram Toggle */}
        <button
          onClick={onToggleHologram}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all text-[10px] font-semibold cursor-pointer ${
            showHologram 
              ? getAccentBorderClass()
              : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle 3D Holographic Scene"
        >
          <Monitor size={12} className={showHologram ? 'animate-pulse' : ''} />
          <span className="hidden sm:inline">{showHologram ? "Hologram On" : "Hologram Off"}</span>
        </button>

        {/* System modals triggers */}
        <button
          onClick={onOpenAbout}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
          title="System Protocols"
        >
          <Info size={14} />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={14} />
        </button>

        {/* User Authentication Status Indicator */}
        <div className="border-l border-white/10 pl-3">
          {user?.isGuest ? (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${getAccentBorderClass()}`}
              title="Click to sign in to database"
            >
              <LogIn size={11} />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={() => onSwitchModule('profile')}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1 border border-white/10 rounded-lg transition-all cursor-pointer"
              title="View Crew Profile"
            >
              <User size={11} className={getAccentTextClass()} />
              <span className="hidden sm:inline truncate max-w-[80px]">{user.name}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
