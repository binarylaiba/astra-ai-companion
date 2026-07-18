import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, VolumeX } from 'lucide-react';

export default function RightPanel({ messages, onSendMessage, voiceEnabled, onToggleVoice }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev + " " + transcript).trim());
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
  }, [SpeechRecognition]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const toggleMic = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert("Your browser doesn't support Web Speech API. Try Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="glass-panel w-[350px] flex flex-col gap-4 pointer-events-auto relative">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <h3 className="font-outfit text-lg text-neon-cyan">Comm Link</h3>
        <button 
          onClick={onToggleVoice}
          type="button"
          className={`p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer ${
            voiceEnabled ? 'text-neon-cyan' : 'text-slate-500'
          }`}
          title={voiceEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
        >
          {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      <div className="h-48 overflow-y-auto flex flex-col gap-3 pr-2 hide-scrollbar">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg text-sm leading-relaxed max-w-[85%] ${
              msg.isUser 
                ? 'bg-neon-purple/10 border-r-2 border-neon-purple self-end text-right' 
                : 'bg-neon-cyan/10 border-l-2 border-neon-cyan self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <button 
          onClick={toggleMic}
          type="button"
          className={`w-12 border rounded-lg flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-red-500/30 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Mic size={18} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk to AI..."
          className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white font-inter outline-none focus:border-neon-cyan transition-colors"
        />
        <button 
          type="submit"
          className="w-12 bg-neon-purple/20 border border-neon-purple rounded-lg flex items-center justify-center text-white hover:bg-neon-purple hover:shadow-glow-purple transition-all"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
