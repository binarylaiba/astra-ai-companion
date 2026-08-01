import React, { useState, useEffect } from 'react';
import { Brain, Search, Trash2, Plus, X, Tag } from 'lucide-react';

export interface MemoryItem {
  _id: string;
  content: string;
  category: 'preference' | 'topic' | 'goal' | 'note' | 'general';
  createdAt: string;
}

interface MemoryManagerProps {
  onClose: () => void;
  accentColor: string;
}

export default function MemoryManager({ onClose, accentColor }: MemoryManagerProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'topic' | 'goal' | 'note' | 'general'>('general');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/memories');
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (e) {
      console.error("Failed to load memories", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim(), category: newCategory })
      });

      if (res.ok) {
        const savedMemory = await res.json();
        setMemories(prev => [savedMemory, ...prev]);
        setNewContent('');
      }
    } catch (e) {
      console.error("Failed to add memory", e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMemories(prev => prev.filter(m => m._id !== id));
      }
    } catch (e) {
      console.error("Failed to delete memory", e);
    }
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

  const getAccentButtonClass = () => {
    switch (accentColor) {
      case 'purple': return 'bg-neon-purple hover:bg-neon-purple/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]';
      case 'amber': return 'bg-amber-500 hover:bg-amber-500/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-500/80 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      case 'blue': return 'bg-blue-500 hover:bg-blue-500/80 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      default: return 'bg-neon-cyan hover:bg-neon-cyan/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]';
    }
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedTab === 'all' || m.category === selectedTab;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Memories' },
    { value: 'preference', label: 'Preferences' },
    { value: 'topic', label: 'Topics' },
    { value: 'goal', label: 'Goals' },
    { value: 'note', label: 'Notes' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[6px] flex items-center justify-center p-4">
      <div className="glass-panel max-w-2xl w-full flex flex-col gap-5 border border-white/20 shadow-glow-cyan animate-fade-in pointer-events-auto max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Brain className={`${getAccentTextClass()} animate-pulse`} size={22} />
            <h2 className="font-outfit text-xl font-extrabold tracking-wider text-white">
              COGNITIVE MEMORY LOGS
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form to add memory */}
        <form onSubmit={handleAddMemory} className="bg-black/30 p-4 border border-white/5 rounded-xl flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Log New Memory Entry</span>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g. User prefers React over Vue, User's favorite database is MongoDB..."
              className="flex-1 min-h-[40px] bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white font-inter outline-none focus:border-neon-cyan resize-none"
              rows={2}
            />
            
            <div className="flex sm:flex-col justify-between sm:justify-start gap-2.5">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-slate-900 border border-white/10 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-neon-cyan"
              >
                <option value="general">General</option>
                <option value="preference">Preference</option>
                <option value="topic">Topic</option>
                <option value="goal">Goal</option>
                <option value="note">Note</option>
              </select>

              <button
                type="submit"
                className={`py-1.5 px-4 rounded-lg text-xs font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${getAccentButtonClass()}`}
              >
                <Plus size={14} /> Log Data
              </button>
            </div>
          </div>
        </form>

        {/* Search & Filter Tabs */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cognitive records..."
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white font-inter outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Categories Tab Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedTab(cat.value)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all border whitespace-nowrap cursor-pointer ${
                  selectedTab === cat.value
                    ? getAccentBorderClass()
                    : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 hide-scrollbar">
          {loading ? (
            <div className="text-center text-xs text-slate-500 py-6 animate-pulse">
              Syncing memory sectors...
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-8 italic border border-dashed border-white/5 rounded-xl">
              No cognitive records stored in this sector.
            </div>
          ) : (
            filteredMemories.map(mem => (
              <div 
                key={mem._id} 
                className="flex justify-between items-start p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all group"
              >
                <div className="flex flex-col gap-1.5 max-w-[85%]">
                  <p className="text-xs text-slate-200 font-inter">{mem.content}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 border border-white/5 flex items-center gap-1 ${getAccentTextClass()}`}>
                      <Tag size={8} /> {mem.category}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Logged {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMemory(mem._id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Forget Memory"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
