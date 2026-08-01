import React, { useRef } from 'react';
import { Palette, Trash2, Download, Upload, UserMinus, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  preferences: {
    theme: string;
    accentColor: string;
    fontSize: string;
  };
  onUpdatePreferences: (prefs: { theme?: string; accentColor?: string; fontSize?: string }) => void;
  onClearHistory: () => void;
  onDeleteAccount: () => void;
  onClose: () => void;
  chats: any[];
  onImportChats: (chats: any[]) => void;
}

export default function SettingsModal({
  preferences,
  onUpdatePreferences,
  onClearHistory,
  onDeleteAccount,
  onClose,
  chats,
  onImportChats
}: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes = [
    { value: 'space', label: 'Cosmic Space (Dark)', color: 'bg-[#0B0F1A]' },
    { value: 'dream', label: 'Ethereal Dream (Violet)', color: 'bg-[#1A1025]' },
    { value: 'cyber', label: 'Retro Cyberpunk (Neon)', color: 'bg-[#0d0221]' },
    { value: 'classic-dark', label: 'Classic Onyx (Slate)', color: 'bg-[#0f172a]' },
    { value: 'classic-light', label: 'Classic Pristine (Light)', color: 'bg-[#f8fafc]' }
  ];

  const accents = [
    { value: 'cyan', label: 'Cyan', color: 'bg-cyan-400' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'amber', label: 'Amber', color: 'bg-amber-500' },
    { value: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small (12px)' },
    { value: 'medium', label: 'Medium (14px)' },
    { value: 'large', label: 'Large (16px)' },
    { value: 'xlarge', label: 'Extra Large (18px)' }
  ];

  const handleExportData = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      preferences,
      chats
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astra-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.chats && Array.isArray(data.chats)) {
          onImportChats(data.chats);
          if (data.preferences) {
            onUpdatePreferences(data.preferences);
          }
          alert("Backup imported successfully!");
          onClose();
        } else {
          alert("Invalid backup file: chats array missing.");
        }
      } catch (err) {
        alert("Failed to parse backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const getAccentTextClass = () => {
    switch (preferences.accentColor) {
      case 'purple': return 'text-neon-purple';
      case 'amber': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-neon-cyan';
    }
  };

  const getAccentButtonClass = () => {
    switch (preferences.accentColor) {
      case 'purple': return 'bg-neon-purple hover:bg-neon-purple/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]';
      case 'amber': return 'bg-amber-500 hover:bg-amber-500/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-500/80 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      case 'blue': return 'bg-blue-500 hover:bg-blue-500/80 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      default: return 'bg-neon-cyan hover:bg-neon-cyan/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[6px] flex items-center justify-center p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json"
        className="hidden"
      />
      
      <div className="glass-panel max-w-lg w-full flex flex-col gap-5 border border-white/20 shadow-glow-cyan animate-fade-in pointer-events-auto max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Palette className={`${getAccentTextClass()} animate-pulse`} size={22} />
            <h2 className="font-outfit text-xl font-extrabold tracking-wider text-white">
              SYSTEM PREFERENCES
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Section: Themes */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Visual Core Theme</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {themes.map(t => (
              <button
                key={t.value}
                onClick={() => onUpdatePreferences({ theme: t.value })}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium border text-left cursor-pointer transition-all ${
                  preferences.theme === t.value
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-white/5 bg-black/25 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${t.color} border border-white/10 shrink-0`}></div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Accent Color */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Active Core Accent</span>
          <div className="flex flex-wrap gap-2.5">
            {accents.map(acc => (
              <button
                key={acc.value}
                onClick={() => onUpdatePreferences({ accentColor: acc.value })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                  preferences.accentColor === acc.value
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-white/5 bg-black/25 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${acc.color} shrink-0`}></div>
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Font Size */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Readout Typography Size</span>
          <div className="flex flex-wrap gap-2">
            {fontSizes.map(size => (
              <button
                key={size.value}
                onClick={() => onUpdatePreferences({ fontSize: size.value })}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                  preferences.fontSize === size.value
                    ? 'border-white/40 bg-white/10 text-white shadow-inner'
                    : 'border-white/5 bg-black/25 text-slate-400 hover:text-slate-200'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Data backup */}
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Synchronization & Backup</span>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleExportData}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs cursor-pointer transition-all"
            >
              <Download size={14} />
              Export Conversations
            </button>
            
            <button
              onClick={handleImportClick}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs cursor-pointer transition-all"
            >
              <Upload size={14} />
              Import Backup (.json)
            </button>
          </div>
        </div>

        {/* Section: Security Actions */}
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4 pb-1">
          <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider font-outfit">
            <ShieldAlert size={14} />
            <span>Emergency Protocols</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                if (confirm("Emergency: This will completely delete all conversation history. Proceed?")) {
                  onClearHistory();
                  alert("Chat logs wiped clean.");
                }
              }}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-950/20 text-red-400 hover:bg-red-950/45 border border-red-500/10 hover:border-red-500/30 font-semibold text-xs cursor-pointer transition-all"
            >
              <Trash2 size={14} />
              Wipe Chat Logs
            </button>

            <button
              onClick={() => {
                if (confirm("Caution: This will completely delete your local companion profile and configuration. This action is irreversible. Continue?")) {
                  onDeleteAccount();
                  alert("Profile deleted. System reloading...");
                  window.location.reload();
                }
              }}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-950/20 text-red-400 hover:bg-red-950/45 border border-red-500/10 hover:border-red-500/30 font-semibold text-xs cursor-pointer transition-all"
            >
              <UserMinus size={14} />
              Destroy AI Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
