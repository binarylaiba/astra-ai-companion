import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Search, Brain, Settings, Pin, Trash2, 
  Folder, FolderOpen, Archive, Star, ChevronDown, ChevronRight, X,
  LayoutDashboard, FileText, Image as ImageIcon, Code, BookOpen, User as UserIcon
} from 'lucide-react';

export interface ChatSummary {
  _id: string;
  title: string;
  folder: string;
  pinned: boolean;
  archived: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface SidebarProps {
  activeModule: string;
  onSelectModule: (mod: string) => void;
  activeChatId: string | null;
  chats: ChatSummary[];
  onSelectChat: (id: string) => void;
  onCreateChat: (folder?: string) => void;
  onUpdateChat: (id: string, updates: Partial<ChatSummary>) => void;
  onDeleteChat: (id: string) => void;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  accentColor: string;
  uploads: any[];
}

export default function Sidebar({
  activeModule,
  onSelectModule,
  activeChatId,
  chats,
  onSelectChat,
  onCreateChat,
  onUpdateChat,
  onDeleteChat,
  onOpenMemory,
  onOpenSettings,
  accentColor,
  uploads
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'Coding': true,
    'Research': true,
    'Personal': true,
    'General': true
  });
  const [showArchived, setShowArchived] = useState(false);

  // Default folders
  const folders = ['General', 'Coding', 'Research', 'Personal'];

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(search.toLowerCase());
    const matchesArchive = showArchived ? chat.archived : !chat.archived;
    return matchesSearch && matchesArchive;
  });

  const pinnedChats = filteredChats.filter(chat => chat.pinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.pinned);

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case 'purple': return 'hover:border-neon-purple/50';
      case 'amber': return 'hover:border-amber-500/50';
      case 'emerald': return 'hover:border-emerald-500/50';
      case 'blue': return 'hover:border-blue-500/50';
      default: return 'hover:border-neon-cyan/50';
    }
  };

  const getAccentBgClass = (isActive: boolean) => {
    if (!isActive) return 'hover:bg-white/5';
    switch (accentColor) {
      case 'purple': return 'bg-neon-purple/20 border-r-2 border-neon-purple';
      case 'amber': return 'bg-amber-500/20 border-r-2 border-amber-500';
      case 'emerald': return 'bg-emerald-500/20 border-r-2 border-emerald-500';
      case 'blue': return 'bg-blue-500/20 border-r-2 border-blue-500';
      default: return 'bg-neon-cyan/20 border-r-2 border-neon-cyan';
    }
  };

  const getAccentTextClass = (isActive: boolean) => {
    if (!isActive) return 'text-slate-400 group-hover:text-white';
    switch (accentColor) {
      case 'purple': return 'text-neon-purple';
      case 'amber': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-neon-cyan';
    }
  };

  const renderChatItem = (chat: ChatSummary) => {
    const isActive = activeChatId === chat._id;
    return (
      <div 
        key={chat._id}
        onClick={() => {
          onSelectModule('chat');
          onSelectChat(chat._id);
        }}
        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${getAccentBgClass(isActive)}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden w-full">
          <MessageSquare size={14} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
          <span className={`truncate ${isActive ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'}`}>
            {chat.title}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateChat(chat._id, { pinned: !chat.pinned });
            }}
            className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
            title={chat.pinned ? "Unpin Chat" : "Pin Chat"}
          >
            <Pin size={11} className={chat.pinned ? 'fill-white text-white' : ''} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateChat(chat._id, { favorite: !chat.favorite });
            }}
            className="p-0.5 text-slate-400 hover:text-amber-400 rounded hover:bg-white/10"
            title={chat.favorite ? "Unfavorite" : "Favorite"}
          >
            <Star size={11} className={chat.favorite ? 'fill-amber-400 text-amber-400' : ''} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateChat(chat._id, { archived: !chat.archived });
            }}
            className="p-0.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-white/10"
            title={chat.archived ? "Unarchive" : "Archive"}
          >
            <Archive size={11} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(chat._id);
            }}
            className="p-0.5 text-slate-400 hover:text-red-400 rounded hover:bg-white/10"
            title="Delete Chat"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'chat', icon: <MessageSquare size={18} />, label: 'AI Chat Core' },
    { id: 'document', icon: <FileText size={18} />, label: 'Document Analyzer' },
    { id: 'image', icon: <ImageIcon size={18} />, label: 'Image Analyzer' },
    { id: 'coding', icon: <Code size={18} />, label: 'Coding Assistant' },
    { id: 'prompts', icon: <BookOpen size={18} />, label: 'Prompt Library' },
    { id: 'profile', icon: <UserIcon size={18} />, label: 'User Profile' }
  ];

  return (
    <div className="flex h-full shrink-0 select-none animate-fade-in pointer-events-auto">
      {/* 1. Left Vertical Rail Module Switcher */}
      <div className="glass-panel !p-2 w-14 flex flex-col items-center gap-3.5 h-full border-r border-white/10 rounded-r-none shrink-0 z-20">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center font-outfit font-black text-black text-xs shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          AG
        </div>
        <div className="w-8 h-px bg-white/10 shrink-0"></div>

        {/* Rail Icons */}
        <div className="flex-1 flex flex-col gap-2.5 w-full items-center">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`p-2.5 rounded-xl transition-all duration-300 relative group cursor-pointer ${
                activeModule === item.id 
                  ? 'bg-white/10 text-white shadow-inner border border-white/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={item.label}
            >
              <span className={activeModule === item.id ? getAccentTextClass(true) : ''}>{item.icon}</span>
              
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-1 px-2.5 py-1 bg-slate-950/95 border border-white/10 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          ))}
        </div>

        <div className="w-8 h-px bg-white/10 shrink-0"></div>

        {/* System modals triggers */}
        <button
          onClick={onOpenMemory}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          title="Memory Manager"
        >
          <Brain size={18} />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* 2. Secondary Contextual Sidebar Panel */}
      {!isCollapsed && (
        <div className="glass-panel w-56 flex flex-col gap-3 h-full border-l-0 border-white/10 rounded-l-none shrink-0 z-10 animate-fade-in !p-4">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="font-outfit text-xs font-black tracking-wider text-white uppercase">
              {activeModule === 'chat' ? 'CHAT MODULE' : activeModule === 'document' ? 'DOC MODULE' : activeModule === 'image' ? 'VISION MODULE' : activeModule === 'coding' ? 'DEVELOPER MODULE' : activeModule === 'prompts' ? 'LIBRARY DECK' : activeModule === 'profile' ? 'CREW DECK' : 'WORKSPACE'}
            </span>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-0.5 text-slate-500 hover:text-white rounded hover:bg-white/10 cursor-pointer"
              title="Collapse Panel"
            >
              <ChevronRight size={13} className="rotate-180" />
            </button>
          </div>

          {/* Conditional Content depending on Module */}
          {activeModule === 'chat' ? (
            /* Traditional Chat sidebar content */
            <div className="flex flex-col gap-3 flex-1 overflow-hidden">
              <button 
                onClick={() => onCreateChat()}
                className={`w-full py-2 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5 font-bold text-xs transition-all duration-300 cursor-pointer ${getAccentBorderClass()}`}
              >
                <Plus size={14} /> New Chat
              </button>

              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats..." 
                  className="w-full bg-black/20 border border-white/5 rounded-lg pl-8 pr-7 py-1.5 text-[11px] text-white outline-none focus:border-white/10 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X size={10} />
                  </button>
                )}
              </div>

              {/* Archive Toggle */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-1">
                <span>CHANNELS</span>
                <button 
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-1 rounded text-[9px] border transition-colors ${showArchived ? 'bg-cyan-950/20 border-cyan-800/30 text-cyan-400' : 'border-white/5 hover:text-white'}`}
                >
                  {showArchived ? 'Active' : 'Archived'}
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 hide-scrollbar">
                {pinnedChats.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase px-1 mb-0.5">PINNED</span>
                    {pinnedChats.map(renderChatItem)}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  {folders.map(folderName => {
                    const folderChats = unpinnedChats.filter(chat => chat.folder === folderName);
                    const isExpanded = expandedFolders[folderName];
                    return (
                      <div key={folderName} className="flex flex-col gap-0.5">
                        <button
                          onClick={() => toggleFolder(folderName)}
                          className="flex items-center justify-between text-[10px] text-slate-400 hover:text-white px-1 py-1 rounded hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="flex items-center gap-1.5">
                            {isExpanded ? <FolderOpen size={12} className="text-neon-cyan" /> : <Folder size={12} className="text-slate-500" />}
                            <span className="font-semibold tracking-wide">{folderName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-slate-600">
                            <span>{folderChats.length}</span>
                            {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="flex flex-col gap-0.5 pl-2.5 border-l border-white/5 ml-2 mt-0.5">
                            {folderChats.length > 0 ? (
                              folderChats.map(renderChatItem)
                            ) : (
                              <span className="text-[9px] text-slate-600 italic px-2 py-0.5">Empty</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {unpinnedChats.filter(chat => !folders.includes(chat.folder)).length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase px-1 mb-0.5">UNCATEGORIZED</span>
                      {unpinnedChats.filter(chat => !folders.includes(chat.folder)).map(renderChatItem)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeModule === 'document' ? (
            /* Document Analyzer sidebar: list of uploaded text/docs */
            <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-1">Source Datasets</span>
              <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 hide-scrollbar">
                {uploads.map(doc => (
                  <div
                    key={doc._id}
                    className="p-2.5 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-1 select-none"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <FileText size={12} className={getAccentTextClass(true)} />
                      <span className="text-[10px] text-slate-200 truncate font-semibold">{doc.fileName}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500">
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                
                {uploads.length === 0 && (
                  <span className="text-[10px] text-slate-500 italic py-4 text-center">No document nodes loaded</span>
                )}
              </div>
            </div>
          ) : activeModule === 'image' ? (
            /* Vision sidebar: display simple vision instructions or image metadata */
            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-1">Vision Node Matrix</span>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 hide-scrollbar">
                {uploads.filter(doc => doc.fileType?.startsWith('image/')).map(doc => (
                  <div key={doc._id} className="p-2 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2">
                    <img src={doc.content} alt={doc.fileName} className="w-8 h-8 object-cover rounded border border-white/10" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] text-slate-200 truncate font-medium">{doc.fileName}</span>
                      <span className="text-[8px] text-slate-500 font-mono">{(doc.fileSize/1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                ))}

                {uploads.filter(doc => doc.fileType?.startsWith('image/')).length === 0 && (
                  <span className="text-[10px] text-slate-500 italic py-4 text-center">No vision layers loaded</span>
                )}
              </div>
            </div>
          ) : (
            /* Default static dashboard details */
            <div className="flex flex-col gap-3 text-xs text-slate-400 leading-relaxed font-inter">
              <p>Your shipboard space workspace is online and fully configured.</p>
              <div className="w-full h-px bg-white/5"></div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Active Sectors</span>
                <span className="text-[10px] text-slate-300 font-semibold">• 9 Workspace Modules</span>
                <span className="text-[10px] text-slate-300 font-semibold">• Groq llama-3.3-70b</span>
                <span className="text-[10px] text-slate-300 font-semibold">• Gemini-1.5-flash stream</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed rail trigger placeholder */}
      {isCollapsed && (
        <div className="absolute left-[58px] top-4 z-30">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 bg-slate-900 border border-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer hover:bg-slate-850"
            title="Expand Sidebar"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
