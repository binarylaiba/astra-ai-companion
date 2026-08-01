import React, { useState, useEffect, useRef } from 'react';
import Sidebar, { ChatSummary } from './components/UI/Sidebar';
import Navbar from './components/UI/Navbar';
import MessageItem, { Message } from './components/UI/MessageItem';
import CodingPanel from './components/UI/CodingPanel';
import MemoryManager, { MemoryItem } from './components/UI/MemoryManager';
import SettingsModal from './components/UI/SettingsModal';
import CommandPalette from './components/UI/CommandPalette';
import AuthModal from './components/UI/AuthModal';
import Dashboard from './components/UI/Dashboard';
import DocumentAnalyzer from './components/UI/DocumentAnalyzer';
import ImageAnalyzer from './components/UI/ImageAnalyzer';
import CodingAssistant from './components/UI/CodingAssistant';
import PromptLibrary from './components/UI/PromptLibrary';
import UserProfile from './components/UI/UserProfile';
import Scene from './components/Scene';
import { Send, Sparkles, Upload, FileText, RefreshCw, X, HelpCircle, Terminal } from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<any>({
    name: 'Guest User',
    isGuest: true,
    preferences: { theme: 'space', accentColor: 'cyan', fontSize: 'medium' }
  });
  const [showAuth, setShowAuth] = useState(false);

  // Active Module Navigation Routing
  const [activeModule, setActiveModule] = useState<string>('dashboard');

  // Navigation & View Modals
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);

  const [showHologram, setShowHologram] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Form & Interaction State
  const [input, setInput] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; type: string; size?: number; content: string }>>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiMood, setAiMood] = useState<'idle' | 'thinking' | 'alert'>('idle');
  const [activeAbortController, setActiveAbortController] = useState<AbortController | null>(null);

  // Preferences & Appearance
  const [preferences, setPreferences] = useState({
    theme: 'space',
    accentColor: 'cyan',
    fontSize: 'medium'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [triggerPulse, setTriggerPulse] = useState(0);

  // Helper to build authorization headers
  const getHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('astra_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 1. Initial configuration, auth fetch, and keyboard listeners
  useEffect(() => {
    checkActiveSession().then(() => {
      fetchPreferences();
      fetchChats();
      fetchMemories();
      fetchUploads();
    });

    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      // Ctrl+N to create chat
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateChat();
        setActiveModule('chat');
      }
      // Ctrl+S to open Settings
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }
      // Escape key closes open modals
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowMemory(false);
        setShowSettings(false);
        setShowAuth(false);
        setAboutOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // 2. Adjust theme & font size dynamically
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
    const sizeMap: Record<string, string> = {
      small: '13px',
      medium: '15px',
      large: '17px',
      xlarge: '19px'
    };
    document.documentElement.style.fontSize = sizeMap[preferences.fontSize] || '15px';
  }, [preferences.theme, preferences.fontSize]);

  // 3. Keep chat scrolled to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiGenerating]);

  // 4. Save drafts in LocalStorage whenever input changes
  useEffect(() => {
    if (activeChatId) {
      setDrafts(prev => ({ ...prev, [activeChatId]: input }));
    }
  }, [input, activeChatId]);

  // 5. Restore draft when switching conversations
  useEffect(() => {
    if (activeChatId) {
      setInput(drafts[activeChatId] || '');
    } else {
      setInput('');
    }
    setAttachedFiles([]);
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // --- Backend Authentication Lifecycles ---

  const checkActiveSession = async () => {
    const token = localStorage.getItem('astra_auth_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.preferences) {
          setPreferences(data.user.preferences);
        }
      } else {
        localStorage.removeItem('astra_auth_token');
      }
    } catch (e) {
      console.warn("Could not authenticate session. Running under offline guest mode.");
    }
  };

  const handleAuthSuccess = (token: string, authUser: any) => {
    localStorage.setItem('astra_auth_token', token);
    setUser(authUser);
    if (authUser.preferences) {
      setPreferences(authUser.preferences);
    }
    // Refresh modules
    fetchPreferences();
    fetchChats(true);
    fetchMemories();
    fetchUploads();
    setActiveModule('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('astra_auth_token');
    setUser({
      name: 'Guest User',
      isGuest: true,
      preferences: { theme: 'space', accentColor: 'cyan', fontSize: 'medium' }
    });
    setPreferences({ theme: 'space', accentColor: 'cyan', fontSize: 'medium' });
    setChats([]);
    setActiveChatId(null);
    setMessages([]);
    setMemories([]);
    setUploads([]);
    setActiveModule('dashboard');
  };

  // --- Backend APIs ---

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/user/preferences', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (e) {
      console.warn("Could not load preferences.");
    }
  };

  const handleUpdatePreferences = async (newPrefs: Partial<typeof preferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChats = async (selectFirst = true) => {
    try {
      const res = await fetch('/api/chats', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
        if (selectFirst && data.length > 0 && !activeChatId) {
          setActiveChatId(data[0]._id);
        }
      }
    } catch (e) {
      console.error("Failed to load chats", e);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (e) {
      console.warn("Could not load memories.");
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await fetch('/api/uploads', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUploads(data);
      }
    } catch (e) {
      console.warn("Could not load uploads.");
    }
  };

  const handleCreateChat = async (folder = '') => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title: 'New Conversation', folder })
      });
      if (res.ok) {
        const newChat = await res.json();
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat._id);
        return newChat._id;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleUpdateChat = async (id: string, updates: Partial<ChatSummary>) => {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setChats(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setChats(prev => prev.filter(c => c._id !== id));
        if (activeChatId === id) {
          setActiveChatId(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/chats', { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        setChats([]);
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/user', { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportChats = (importedChats: any[]) => {
    fetchChats(true);
  };

  // --- Document File Uploader API ---

  const handleUploadFileSave = async (fileObj: { fileName: string; fileType: string; fileSize: number; content: string }) => {
    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(fileObj)
      });
      if (res.ok) {
        const saved = await res.json();
        setUploads(prev => [saved, ...prev]);
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    // Return temporary memory version if offline or fails
    return {
      _id: 'temp-' + Date.now(),
      ...fileObj,
      createdAt: new Date().toISOString()
    };
  };

  const handleUploadFileDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/uploads/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setUploads(prev => prev.filter(u => u._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    const reader = new FileReader();

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.onload = async (event) => {
          const contentStr = event.target?.result as string;
          const parsed = await handleUploadFileSave({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: contentStr
          });
          setAttachedFiles(prev => [...prev, parsed]);
          setIsParsingFile(false);
        };
        reader.readAsText(file);
      } 
      else if (file.type.startsWith('image/')) {
        reader.onload = async (event) => {
          const contentStr = event.target?.result as string;
          const parsed = await handleUploadFileSave({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: contentStr
          });
          setAttachedFiles(prev => [...prev, parsed]);
          setIsParsingFile(false);
        };
        reader.readAsDataURL(file);
      } 
      else {
        reader.onload = async (event) => {
          try {
            const base64Data = event.target?.result as string;
            const res = await fetch('/api/files/parse', {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileData: base64Data
              })
            });

            if (res.ok) {
              const data = await res.json();
              const parsed = await handleUploadFileSave({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                content: data.text
              });
              setAttachedFiles(prev => [...prev, parsed]);
            } else {
              const err = await res.json();
              alert(`Failed to parse file: ${err.error || 'Server error'}`);
            }
          } catch (err: any) {
            alert("Error sending file to parsing backend.");
          } finally {
            setIsParsingFile(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      setIsParsingFile(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  // --- Send Message & SSE Streaming ---

  const handleSendMessage = async (textToSend: string, overrideFiles: any[] | null = null) => {
    const filesList = overrideFiles !== null ? overrideFiles : attachedFiles;
    if (!textToSend.trim() && filesList.length === 0) return;
    if (aiGenerating) return;

    let chatId = activeChatId;
    if (!chatId) {
      chatId = await handleCreateChat();
      if (!chatId) return;
    }

    const currentMsgText = textToSend;
    setInput('');
    if (chatId) {
      setDrafts(prev => ({ ...prev, [chatId!]: '' }));
    }

    const timestamp = new Date().toISOString();
    const newUserMsg: Message = {
      text: currentMsgText,
      isUser: true,
      timestamp,
      files: [...filesList]
    };

    const newAiMsgPlaceholder: Message = {
      text: '',
      isUser: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMsg, newAiMsgPlaceholder]);
    setAttachedFiles([]);
    setAiMood('thinking');
    setTriggerPulse(prev => prev + 1);

    const controller = new AbortController();
    setActiveAbortController(controller);
    setAiGenerating(true);

    try {
      const response = await fetch(`/api/chats/${chatId}/message-stream`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message: currentMsgText, files: newUserMsg.files }),
        signal: controller.signal
      });

      if (!response.body) {
        throw new Error("No response body received from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              if (data.chunk) {
                setMessages(prev => {
                  const copy = [...prev];
                  const lastMsg = copy[copy.length - 1];
                  if (lastMsg && !lastMsg.isUser) {
                    lastMsg.text += data.chunk;
                  }
                  return copy;
                });
              } else if (data.error) {
                setMessages(prev => {
                  const copy = [...prev];
                  const lastMsg = copy[copy.length - 1];
                  if (lastMsg) lastMsg.text = `Error: ${data.error}`;
                  return copy;
                });
              }
            } catch (err) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages(prev => {
          const copy = [...prev];
          const lastMsg = copy[copy.length - 1];
          if (lastMsg && !lastMsg.isUser) {
            lastMsg.text += '\n\n*(Generation stopped by user)*';
          }
          return copy;
        });
      } else {
        console.error("Stream failed:", err);
      }
    } finally {
      setAiGenerating(false);
      setAiMood('idle');
      setActiveAbortController(null);
      fetchChats(false);
      fetchMemories();
    }
  };

  const handleStopGenerating = () => {
    if (activeAbortController) {
      activeAbortController.abort();
    }
  };

  const handleRegenerate = (userMsgIdx: number) => {
    const userMsg = messages[userMsgIdx];
    if (!userMsg || !userMsg.isUser) return;
    setMessages(prev => prev.slice(0, userMsgIdx + 1));
    handleSendMessage(userMsg.text, userMsg.files);
  };

  const handleEditPrompt = (msgIdx: number, newText: string) => {
    setMessages(prev => prev.slice(0, msgIdx));
    handleSendMessage(newText);
  };

  // --- Theme styles helpers ---

  const getAccentGlowClass = () => {
    switch (preferences.accentColor) {
      case 'purple': return 'shadow-glow-purple border-neon-purple/50';
      case 'amber': return 'shadow-[0_0_15px_rgba(245,158,11,0.5)] border-amber-500/50';
      case 'emerald': return 'shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-500/50';
      case 'blue': return 'shadow-[0_0_15px_rgba(59,130,246,0.5)] border-blue-500/50';
      default: return 'shadow-glow-cyan border-neon-cyan/50';
    }
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

  const getAccentBgClass = () => {
    switch (preferences.accentColor) {
      case 'purple': return 'bg-neon-purple/20 border-neon-purple hover:bg-neon-purple';
      case 'amber': return 'bg-amber-500/20 border-amber-500 hover:bg-amber-500';
      case 'emerald': return 'bg-emerald-500/20 border-emerald-500 hover:bg-emerald-500';
      case 'blue': return 'bg-blue-500/20 border-blue-500 hover:bg-blue-500';
      default: return 'bg-neon-cyan/20 border-neon-cyan hover:bg-neon-cyan';
    }
  };

  const activeChat = chats.find(c => c._id === activeChatId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex bg-space-dark text-slate-100 font-inter">
      {/* 3D Hologram Overlay Scene */}
      {showHologram && (
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-auto">
          <Scene 
            gravityMode={false}
            warpMode={aiGenerating}
            scanMode={aiMood === 'thinking'}
            triggerPulse={triggerPulse} 
            onCharacterClick={() => {}}
            aiMood={aiMood}
            tasks={[]}
            onDeleteTask={() => {}}
            theme={preferences.theme}
            chatOpen={true}
            messages={[]}
            onSendMessage={() => {}}
          />
        </div>
      )}

      {/* Primary Workspace Layout Container */}
      <div className="relative inset-0 z-10 w-full h-full flex p-3 gap-3.5 pointer-events-none overflow-hidden">
        
        {/* Left Double-Track Sidebar Switcher */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          activeChatId={activeChatId}
          chats={chats}
          onSelectChat={setActiveChatId}
          onCreateChat={handleCreateChat}
          onUpdateChat={handleUpdateChat}
          onDeleteChat={handleDeleteChat}
          onOpenMemory={() => setShowMemory(true)}
          onOpenSettings={() => setShowSettings(true)}
          accentColor={preferences.accentColor}
          uploads={uploads}
        />

        {/* Center Active Module Viewport Workspace */}
        <div className="flex-1 flex flex-col gap-3.5 h-full overflow-hidden">
          {/* Top Navbar */}
          <Navbar
            activeChat={activeChat}
            onUpdateChat={handleUpdateChat}
            showHologram={showHologram}
            onToggleHologram={() => setShowHologram(!showHologram)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenAbout={() => setAboutOpen(true)}
            accentColor={preferences.accentColor}
            user={user}
            onOpenAuth={() => setShowAuth(true)}
            onSwitchModule={setActiveModule}
          />

          {/* Core Module rendering area */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            
            {activeModule === 'dashboard' && (
              <Dashboard
                user={user}
                chats={chats}
                memories={memories}
                uploads={uploads}
                onSelectChat={setActiveChatId}
                onCreateChat={handleCreateChat}
                onSwitchModule={setActiveModule}
                accentColor={preferences.accentColor}
              />
            )}

            {activeModule === 'chat' && (
              /* Core AI chat screen */
              <div className="flex-1 bg-black/40 backdrop-blur-[10px] border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-inner pointer-events-auto animate-fade-in">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in max-w-lg mx-auto">
                    <Sparkles size={40} className={`${getAccentTextClass()} mb-4 animate-bounce`} />
                    <h1 className="font-outfit text-2xl font-black tracking-wider mb-2">ASTRA AI COMPANION</h1>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      Online and ready. Ask questions, analyze documents, write code, or query long-term memory logs.
                    </p>
                    
                    {/* Suggested prompts cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {[
                        { title: "Quantum Physics", desc: "Explain double slit experiment", text: "Explain the double slit experiment simply using LaTeX for any formulas." },
                        { title: "Optimize Code", desc: "Optimize a recursive loop", text: "Show me how to optimize a recursive Fibonacci function in Python with memoization." },
                        { title: "Software Architecture", desc: "Draw an API workflow", text: "Create a Mermaid diagram showing a simple client-server REST API request/response flow." },
                        { title: "Long-term Memory", desc: "Test memory log extraction", text: "Remember: My favorite software development stack is MERN (Mongo, Express, React, Node)." }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(item.text)}
                          className="text-left p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-xs flex flex-col gap-1 hover:-translate-y-0.5 cursor-pointer shadow-sm"
                        >
                          <span className="font-bold text-white">{item.title}</span>
                          <span className="text-slate-400">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-2.5 hide-scrollbar">
                    {messages.map((msg, idx) => (
                      <MessageItem
                        key={idx}
                        msg={msg}
                        index={idx}
                        isLast={idx === messages.length - 1}
                        onEditPrompt={handleEditPrompt}
                        onRegenerate={handleRegenerate}
                        accentColor={preferences.accentColor}
                      />
                    ))}
                    {aiGenerating && messages[messages.length - 1]?.text === '' && (
                      <div className="flex items-center gap-1.5 p-4 rounded-xl border self-start mr-12 bg-white/5 border-white/5 text-slate-400 text-xs shrink-0">
                        <RefreshCw className="animate-spin text-neon-cyan" size={14} />
                        <span>Astra is formulating response...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {/* Bottom text inputs */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5 mt-auto">
                  <CodingPanel
                    onSelectAction={(tpl) => setInput(tpl)}
                    accentColor={preferences.accentColor}
                  />

                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-1 max-h-[80px] overflow-y-auto">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/15 px-3 py-1.5 rounded-lg text-xs">
                          <FileText size={12} className={getAccentTextClass()} />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button onClick={() => handleRemoveFile(idx)} className="text-slate-400 hover:text-white">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end gap-2.5">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    
                    <button
                      type="button"
                      onClick={handleFileUploadClick}
                      disabled={isParsingFile}
                      className="w-11 h-11 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
                      title="Upload Document"
                    >
                      {isParsingFile ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                    </button>

                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(input);
                        }
                      }}
                      placeholder="Ask a question or paste code..."
                      rows={1}
                      className="flex-1 bg-black/35 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-white/20 transition-colors max-h-[120px] resize-none"
                    />

                    {aiGenerating ? (
                      <button
                        type="button"
                        onClick={handleStopGenerating}
                        className="w-11 h-11 bg-red-500/20 border border-red-500 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        <X size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendMessage(input)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-slate-900 transition-all cursor-pointer shrink-0 ${getAccentBgClass()}`}
                      >
                        <Send size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeModule === 'document' && (
              <DocumentAnalyzer
                uploads={uploads}
                onUploadFile={handleUploadFileSave}
                onDeleteUpload={handleUploadFileDelete}
                onSendMessage={handleSendMessage}
                messages={messages}
                aiGenerating={aiGenerating}
                onStopGenerating={handleStopGenerating}
                accentColor={preferences.accentColor}
              />
            )}

            {activeModule === 'image' && (
              <ImageAnalyzer
                uploads={uploads}
                onUploadFile={handleUploadFileSave}
                onDeleteUpload={handleUploadFileDelete}
                onSendMessage={handleSendMessage}
                messages={messages}
                aiGenerating={aiGenerating}
                onStopGenerating={handleStopGenerating}
                accentColor={preferences.accentColor}
              />
            )}

            {activeModule === 'coding' && (
              <CodingAssistant
                onSendMessage={handleSendMessage}
                messages={messages}
                aiGenerating={aiGenerating}
                onStopGenerating={handleStopGenerating}
                accentColor={preferences.accentColor}
              />
            )}

            {activeModule === 'prompts' && (
              <PromptLibrary
                onSelectPrompt={(tpl) => {
                  setInput(tpl);
                  setActiveModule('chat');
                  // autofocus textarea
                  setTimeout(() => {
                    const textarea = document.querySelector('textarea');
                    textarea?.focus();
                  }, 100);
                }}
                accentColor={preferences.accentColor}
              />
            )}

            {activeModule === 'profile' && (
              <UserProfile
                user={user}
                onLogout={handleLogout}
                onOpenAuth={() => setShowAuth(true)}
                accentColor={preferences.accentColor}
                chats={chats}
                uploads={uploads}
                memories={memories}
              />
            )}

          </div>
        </div>
      </div>

      {/* --- Overlay Modals --- */}

      {/* Registration & Login Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
          accentColor={preferences.accentColor}
        />
      )}

      {/* Memory Manager */}
      {showMemory && (
        <MemoryManager
          onClose={() => setShowMemory(false)}
          accentColor={preferences.accentColor}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onClearHistory={handleClearHistory}
          onDeleteAccount={handleDeleteAccount}
          onClose={() => setShowSettings(false)}
          chats={chats}
          onImportChats={handleImportChats}
        />
      )}

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          chats={chats}
          onSelectChat={setActiveChatId}
          onCreateChat={() => { handleCreateChat(); setActiveModule('chat'); }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenMemory={() => setShowMemory(true)}
          onToggleHologram={() => setShowHologram(!showHologram)}
          onUpdatePreferences={(p) => handleUpdatePreferences(p)}
          accentColor={preferences.accentColor}
        />
      )}

      {/* About System Protocols Modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full flex flex-col gap-5 border border-white/20 shadow-glow-cyan animate-fade-in pointer-events-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="font-outfit text-xl font-extrabold tracking-wider text-neon-cyan flex items-center gap-2">
                🚀 ASTRA.AI SYSTEM OVERVIEW
              </h2>
              <button onClick={() => setAboutOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold">✕</button>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Astra is a highly advanced generative AI workspace companion. Astra provides contextual conversational intelligence, synchronizes task memory, and analyzes document clusters.
            </p>
            
            <div className="flex flex-col gap-3.5 my-1">
              <h3 className="font-outfit text-sm font-bold text-neon-purple tracking-wide">CONSOLE SYSTEMS PROTOCOLS</h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-300 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">💬 Chat Link:</span> Create chats or assign them to folders in the left navigation sidebar.
                </div>
                <div className="flex gap-2 col-span-1 leading-relaxed">
                  <span className="text-neon-cyan font-bold min-w-[120px]">🧠 Cognitive Logs:</span> 
                  <span>Type messages containing things you want Astra to remember, or add facts manually inside the <strong>Memory Manager</strong>.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">⌨️ Command Deck:</span> Press <kbd className="bg-white/10 px-1 py-0.5 rounded font-mono text-[10px] border border-white/10">Ctrl + K</kbd> to launch the command palette.
                </div>
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">📁 Files & Docs:</span> Switch to the Document or Image modules to upload and analyze text/visual sources.
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setAboutOpen(false)}
              className="mt-2 w-full py-2.5 rounded-lg border border-neon-cyan/50 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan text-sm font-bold hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all cursor-pointer text-center"
            >
              DISMISS PROTOCOL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
