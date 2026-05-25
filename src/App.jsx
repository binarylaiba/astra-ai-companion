import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import LeftPanel from './components/UI/LeftPanel';
import BottomPanel from './components/UI/BottomPanel';
import RightPanel from './components/UI/RightPanel';
import Visualizer from './components/UI/Visualizer';
import { playClick, playThinking, startAmbient, stopAmbient, updateAmbientTheme } from './utils/AudioEngine';

export default function App() {
  const [gravityMode, setGravityMode] = useState(false);
  const [warpMode, setWarpMode] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aiMood, setAiMood] = useState('idle'); // 'idle', 'thinking', 'alert'
  const [tasks, setTasks] = useState([]);
  
  const [messages, setMessages] = useState([
    { text: "Greetings, user. I am online and synced. Type 'Remember: [task]' to add a floating memory.", isUser: false }
  ]);
  const [theme, setTheme] = useState('space');
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    updateAmbientTheme(theme);
  }, [theme]);

  const handleToggleMusic = () => {
    playClick();
    if (musicPlaying) {
      stopAmbient();
      setMusicPlaying(false);
    } else {
      startAmbient(theme);
      setMusicPlaying(true);
    }
  };

  const handleToggleAbout = () => {
    playClick();
    setAboutOpen(!aboutOpen);
  };

  const [triggerPulse, setTriggerPulse] = useState(0);

  const handleSendMessage = async (text) => {
    playClick();
    playThinking();
    setMessages(prev => [...prev, { text, isUser: true }]);
    setTriggerPulse(prev => prev + 1);
    setAiMood('thinking');
    
    // Check for "Remember:" command
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith('remember:')) {
      const taskText = text.substring(9).trim();
      if (taskText) {
        setTimeout(() => {
          setTasks(prev => [...prev, { id: Date.now(), text: taskText }]);
          setMessages(prev => [...prev, { 
            text: `Memory secured: "${taskText}". Orbiting core.`, 
            isUser: false 
          }]);
          setAiMood('alert'); // Gold/Amber lighting
          setTimeout(() => setAiMood('idle'), 2000);
        }, 1200);
        return;
      }
    }

    // Real AI Processing via our Node.js Backend
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error(`Server Error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
      setAiMood('idle');
    } catch (error) {
      console.error(error);
      // Fallback to Mock Responses if the server is down or error occurs
      setTimeout(() => {
        const mockResponses = [
          "(Mock Mode) Processing your request...",
          "(Mock Mode) Data synchronized.",
          "(Mock Mode) Fascinating inquiry.",
          "(Mock Mode) Adjusting parameters.",
          "(Mock Mode) I am operating in simulation mode. Backend server unreachable."
        ];
        setMessages(prev => [...prev, { 
          text: mockResponses[Math.floor(Math.random() * mockResponses.length)], 
          isUser: false 
        }]);
        setAiMood('idle');
      }, 1000);
    }
  };

  const handleCharacterClick = () => {
    playClick();
    setTriggerPulse(prev => prev + 1);
    setChatOpen(!chatOpen);
    setAiMood('thinking');
    setScanMode(true);
    setTimeout(() => {
      setAiMood('idle');
      setScanMode(false);
    }, 2000);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setAiMood('alert');
    setMessages(prev => [...prev, { 
      text: "Memory deleted via Singularity event.", 
      isUser: false 
    }]);
    setTimeout(() => setAiMood('idle'), 2000);
  };

  return (
    <div className="relative w-full h-full font-inter overflow-hidden bg-space-dark text-white">
      <div className="absolute inset-0 z-0">
        <Scene 
          gravityMode={gravityMode}
          warpMode={warpMode}
          scanMode={scanMode}
          triggerPulse={triggerPulse} 
          onCharacterClick={handleCharacterClick}
          aiMood={aiMood}
          tasks={tasks}
          onDeleteTask={handleDeleteTask}
          theme={theme}
          chatOpen={chatOpen}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none p-8 flex justify-between">
        <LeftPanel mood={aiMood} />
        
        <Visualizer active={aiMood === 'thinking' || aiMood === 'alert'} />
        
        {/* HUD 2D Chat Overlay */}
        {chatOpen && (
          <div className="absolute right-8 top-8 bottom-32 z-20 pointer-events-none flex items-stretch">
            <RightPanel messages={messages} onSendMessage={handleSendMessage} />
          </div>
        )}
        
        <BottomPanel 
          gravityMode={gravityMode} onToggleGravity={() => setGravityMode(!gravityMode)} 
          warpMode={warpMode} onToggleWarp={() => setWarpMode(!warpMode)}
          scanMode={scanMode} onToggleScan={() => setScanMode(!scanMode)}
          theme={theme} setTheme={setTheme}
          musicPlaying={musicPlaying} onToggleMusic={handleToggleMusic}
          chatOpen={chatOpen} onToggleChat={() => { playClick(); setChatOpen(!chatOpen); }}
          aboutOpen={aboutOpen} onToggleAbout={handleToggleAbout}
        />
      </div>

      {/* 2D HUD About/Info Modal Overlay */}
      {aboutOpen && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full flex flex-col gap-5 border border-white/20 shadow-glow-cyan animate-fade-in pointer-events-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="font-outfit text-xl font-extrabold tracking-wider text-neon-cyan flex items-center gap-2">
                🚀 ASTRA.AI SYSTEM OVERVIEW
              </h2>
              <button 
                onClick={handleToggleAbout}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Astra is a highly advanced generative AI companion. Operating as a shipboard system interface, Astra provides contextual conversational intelligence, synchronizes task memory rings, and generates soothing cosmic synthesizer audio directly in your browser.
            </p>
            
            <div className="flex flex-col gap-3.5 my-1">
              <h3 className="font-outfit text-sm font-bold text-neon-purple tracking-wide">CONSOLE SYSTEMS PROTOCOLS</h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-300 max-h-48 overflow-y-auto pr-1 hide-scrollbar">
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">💬 Chat Link:</span> Click Astra's body or the Message icon at the bottom to open the communications hologram.
                </div>
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">🎙️ Voice Link:</span> Press the microphone in the chat panel to speak your questions instead of typing.
                </div>
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">🧠 Orbital Memories:</span> Type <code className="bg-white/5 px-1.5 py-0.5 rounded text-amber-400">Remember: [task]</code> to orbit floating memory orbs. Drag-and-drop them with your mouse, and throw them into the **Black Hole Singularity** to erase them.
                </div>
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">🌌 Cosmic Controls:</span> Toggle gravity (Arrow down) to ground objects, warp speed (Rocket) to accelerate particles, or holographic scan (Scan grid).
                </div>
                <div className="flex gap-2">
                  <span className="text-neon-cyan font-bold">🎵 Ambient Synth:</span> Turn on the Music toggle in the bottom panel to play a procedural space ambient synthesizer that morphs its waveforms and notes to match the Space, Dream, or Cyberpunk theme palettes.
                </div>
              </div>
            </div>
            
            <button
              onClick={handleToggleAbout}
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
