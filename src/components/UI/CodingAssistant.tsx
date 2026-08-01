import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, HelpCircle, ShieldAlert, Zap, FileCheck, RefreshCw, BookOpen, FileCode,
  Copy, Download, X, Play, Sparkles, Code, Check, Split
} from 'lucide-react';
import MessageItem, { Message } from './MessageItem';

interface CodingAssistantProps {
  onSendMessage: (text: string, attachedFiles: any[]) => void;
  messages: Message[];
  aiGenerating: boolean;
  onStopGenerating: () => void;
  accentColor: string;
}

export default function CodingAssistant({
  onSendMessage,
  messages,
  aiGenerating,
  onStopGenerating,
  accentColor
}: CodingAssistantProps) {
  const [sourceCode, setSourceCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'extractedCode'>('explanation');
  
  const getAccentTextClass = () => {
    switch (accentColor) {
      case 'purple': return 'text-neon-purple';
      case 'amber': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-neon-cyan';
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

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case 'purple': return 'border-neon-purple/50 bg-neon-purple/5';
      case 'amber': return 'border-amber-500/50 bg-amber-500/5';
      case 'emerald': return 'border-emerald-500/50 bg-emerald-500/5';
      case 'blue': return 'border-blue-500/50 bg-blue-500/5';
      default: return 'border-neon-cyan/50 bg-neon-cyan/5';
    }
  };

  // Find the last assistant message
  const lastAiMessage = [...messages].reverse().find(m => !m.isUser);

  // Extract the first code block found inside the AI response markdown
  const extractCodeBlock = (markdownText: string) => {
    const codeRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g;
    const matches = [...markdownText.matchAll(codeRegex)];
    if (matches.length > 0) {
      return matches[0][1];
    }
    return '';
  };

  const extractedCode = lastAiMessage ? extractCodeBlock(lastAiMessage.text) : '';

  useEffect(() => {
    if (extractedCode) {
      setActiveTab('extractedCode');
    } else {
      setActiveTab('explanation');
    }
  }, [extractedCode]);

  const runCodeAction = (actionType: string) => {
    if (!sourceCode.trim()) {
      alert("Please paste your code in the left input panel first.");
      return;
    }

    let promptText = '';
    switch (actionType) {
      case 'explain':
        promptText = `Please explain what this ${language} code does step-by-step with clean summaries:\n\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
        break;
      case 'debug':
        promptText = `Analyze this ${language} code. Find any runtime, syntax, or logical bugs. Correct them and show a clean output along with an explanation of what went wrong:\n\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
        break;
      case 'optimize':
        promptText = `Please optimize this ${language} code for better performance, memory footprint, time complexity, and clean architecture. Provide the optimized code block and list what changes were made:\n\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
        break;
      case 'refactor':
        promptText = `Please refactor this ${language} code using modern best practices, code reusability, proper naming conventions, and clean layout patterns:\n\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
        break;
      case 'test':
        promptText = `Please generate comprehensive unit tests (e.g. using standard frameworks for ${language}) to validate edge cases and main pathways of this code block:\n\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
        break;
      case 'docs':
        promptText = `Add detailed docstrings, inline comments, and JSDoc parameters (or matching language equivalents) explaining what this code block and its methods do:\n\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
        break;
      case 'readme':
        promptText = `Generate a professional, markdown-ready, GitHub-structured README.md for this code structure, outlining installation, use, parameters, and dependencies:\n\n\`\`\`${language}\n${sourceCode}\n\`\`\``;
        break;
      default:
        return;
    }

    onSendMessage(promptText, []);
  };

  const handleCopyCode = () => {
    const codeToCopy = activeTab === 'extractedCode' && extractedCode ? extractedCode : lastAiMessage?.text || '';
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const codeToDownload = extractedCode || lastAiMessage?.text || '';
    if (!codeToDownload) return;
    
    const extMap: Record<string, string> = {
      javascript: 'js', typescript: 'ts', python: 'py',cpp: 'cpp',
      html: 'html', css: 'css', rust: 'rs', go: 'go', sql: 'sql'
    };
    const extension = extMap[language] || 'txt';
    const blob = new Blob([codeToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astra-code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden pointer-events-auto h-full w-full">
      
      {/* Left Column: Code Input & Operations */}
      <div className="flex-[5] flex flex-col bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden h-full gap-3">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-slate-300 font-outfit uppercase flex items-center gap-1.5">
            <Terminal size={14} className={getAccentTextClass()} /> Coding Input Workspace
          </span>
          
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 border border-white/10 text-xs rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-neon-cyan font-mono"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        {/* Large monospaced code editor box */}
        <div className="flex-1 relative border border-white/5 rounded-xl overflow-hidden bg-slate-950/30">
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder="// Paste code block here for analysis...&#10;function calculateOrbit(velocity, altitude) {&#10;  return velocity * altitude * 9.81;&#10;}"
            className="w-full h-full p-4 bg-transparent text-slate-200 text-xs font-mono outline-none resize-none leading-relaxed select-text"
          />
          {sourceCode && (
            <button
              onClick={() => setSourceCode('')}
              className="absolute right-3.5 top-3.5 p-1 rounded-md bg-black/50 text-slate-400 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Action macros buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase font-outfit px-1">Execute Code Macros</span>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'explain', label: 'Explain', desc: 'Walkthrough logic', icon: <HelpCircle size={13} /> },
              { id: 'debug', label: 'Find Bug', desc: 'Locate & fix errors', icon: <ShieldAlert size={13} /> },
              { id: 'optimize', label: 'Optimize', desc: 'Performance tune', icon: <Zap size={13} /> },
              { id: 'refactor', label: 'Refactor', desc: 'Clean architecture', icon: <Split size={13} /> },
              { id: 'test', label: 'Unit Tests', desc: 'Jest/Mocha mock cases', icon: <FileCheck size={13} /> },
              { id: 'docs', label: 'Document', desc: 'Docstring variables', icon: <BookOpen size={13} /> },
              { id: 'readme', label: 'Make README', desc: 'Setup documentation', icon: <FileCode size={13} /> }
            ].map(action => (
              <button
                key={action.id}
                onClick={() => runCodeAction(action.id)}
                disabled={aiGenerating}
                className="flex flex-col items-start gap-1 p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer text-left group disabled:opacity-50"
              >
                <span className={`flex items-center gap-1.5 text-xs font-bold text-white group-hover:${getAccentTextClass()}`}>
                  {action.icon}
                  {action.label}
                </span>
                <span className="text-[8px] text-slate-400 font-inter">{action.desc}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: AI Output */}
      <div className="flex-[5] flex flex-col bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden h-full gap-3">
        {/* Output Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Code size={16} className={getAccentTextClass()} />
            <span className="text-xs font-bold text-white font-outfit uppercase">Synthesized Output Deck</span>
          </div>
          
          {lastAiMessage && (
            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded text-slate-300 transition-colors"
                title="Copy output"
              >
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {extractedCode && (
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded text-slate-300 transition-colors"
                  title="Download File"
                >
                  <Download size={11} />
                  <span>Download</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab switcher if code blocks are extracted */}
        {extractedCode && (
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('extractedCode')}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all border cursor-pointer ${
                activeTab === 'extractedCode'
                  ? getAccentBorderClass()
                  : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Transcribed Code
            </button>
            <button
              onClick={() => setActiveTab('explanation')}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all border cursor-pointer ${
                activeTab === 'explanation'
                  ? getAccentBorderClass()
                  : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Full Response
            </button>
          </div>
        )}

        {/* Output viewport */}
        <div className="flex-1 overflow-y-auto pr-1 hide-scrollbar">
          {aiGenerating && messages[messages.length - 1]?.text === '' ? (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full select-none">
              <RefreshCw className="animate-spin text-neon-cyan mb-3" size={24} />
              <span className="text-xs text-slate-400 font-mono">Synthesizing code refactoring payload...</span>
            </div>
          ) : lastAiMessage ? (
            <div className="p-1 rounded-xl">
              {activeTab === 'extractedCode' && extractedCode ? (
                <pre className="p-4 rounded-xl bg-[#090d16] border border-white/5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed select-text">
                  {extractedCode}
                </pre>
              ) : (
                <MessageItem
                  msg={lastAiMessage}
                  index={0}
                  isLast={true}
                  onEditPrompt={() => {}}
                  onRegenerate={() => {}}
                  accentColor={accentColor}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full text-slate-600">
              <Terminal size={32} className="mb-2 opacity-30" />
              <span className="text-xs font-bold font-outfit uppercase mb-1">COMPILING ENGINE STANDBY</span>
              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                Paste source scripts into the editor, select an operation macro, and hit run to display optimization readouts.
              </p>
            </div>
          )}
        </div>

        {/* Input Stop Abort Row */}
        {aiGenerating && (
          <button
            onClick={onStopGenerating}
            className="w-full py-2 bg-red-500/20 border border-red-500 rounded-xl text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <X size={14} /> STOP PROCESSOR
          </button>
        )}

      </div>

    </div>
  );
}
