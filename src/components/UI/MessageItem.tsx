import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, RefreshCw, Edit, Check, X, FileText } from 'lucide-react';
import mermaid from 'mermaid';

// Initialize Mermaid
try {
  mermaid.initialize({ 
    startOnLoad: false, 
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      background: '#0d1117',
      primaryColor: '#58a6ff',
      textColor: '#c9d1d9',
      lineColor: '#30363d'
    }
  });
} catch(e) {
  console.error("Mermaid initialization failed", e);
}

// Diagram component
function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const uniqueId = 'mermaid-' + Math.floor(Math.random() * 1000000);
    let isMounted = true;
    
    const renderChart = async () => {
      try {
        // Clean up leading/trailing white space from chart code
        const cleanChart = chart.trim();
        const { svg: renderedSvg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError('');
        }
      } catch (err: any) {
        console.error("Mermaid Render Error:", err);
        // Clear internal mermaid state parser errors
        const badElement = document.getElementById(uniqueId);
        if (badElement) badElement.remove();
        if (isMounted) {
          setError('Failed to parse Mermaid diagram syntax.');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="text-red-400 bg-red-950/20 p-3 rounded-lg border border-red-500/20 text-xs font-mono my-2">
        ⚠️ {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="text-slate-400 bg-slate-900/50 p-4 rounded-lg border border-white/5 text-xs animate-pulse my-2">
        Rendering system diagram...
      </div>
    );
  }

  return (
    <div 
      className="mermaid-wrapper max-w-full overflow-x-auto bg-slate-950/40 border border-white/10 rounded-xl p-3 my-3 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export interface Message {
  text: string;
  isUser: boolean;
  timestamp: string;
  files?: Array<{ name: string; type: string; size?: number; content: string }>;
  regenerated?: boolean;
}

interface MessageItemProps {
  msg: Message;
  index: number;
  isLast: boolean;
  onEditPrompt: (idx: number, newText: string) => void;
  onRegenerate: (idx: number) => void;
  accentColor: string;
}

export default function MessageItem({
  msg,
  index,
  isLast,
  onEditPrompt,
  onRegenerate,
  accentColor
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);

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
      case 'purple': return 'bg-neon-purple/5 border-neon-purple/20';
      case 'amber': return 'bg-amber-500/5 border-amber-500/20';
      case 'emerald': return 'bg-emerald-500/5 border-emerald-500/20';
      case 'blue': return 'bg-blue-500/5 border-blue-500/20';
      default: return 'bg-neon-cyan/5 border-neon-cyan/20';
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = (code: string, filename: string = 'code-block.txt') => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== msg.text) {
      onEditPrompt(index, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div 
      className={`flex flex-col gap-2 p-4 rounded-xl border max-w-full sm:max-w-[88%] transition-all duration-300 ${
        msg.isUser 
          ? 'bg-white/5 border-white/5 self-end ml-12' 
          : `${getAccentBgClass()} self-start mr-12`
      }`}
    >
      {/* Header Info */}
      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span className="font-semibold tracking-wider font-outfit uppercase">
          {msg.isUser ? 'USER CORE' : 'ASTRA COGNITIVE'}
        </span>
        <div className="flex items-center gap-2 font-inter">
          {msg.regenerated && <span className="text-slate-500 font-medium">Regenerated</span>}
          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Message Content */}
      <div className="text-slate-100 text-sm leading-relaxed overflow-hidden font-inter">
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full mt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full min-h-[80px] bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-slate-100 outline-none focus:border-neon-cyan resize-y"
            />
            <div className="flex gap-2 self-end">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold"
              >
                <X size={12} /> Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-semibold border border-green-500/30"
              >
                <Check size={12} /> Save & Submit
              </button>
            </div>
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                
                if (match && match[1] === 'mermaid') {
                  return <MermaidDiagram chart={codeString} />;
                }

                return match ? (
                  <div className="code-block-container my-3 rounded-lg overflow-hidden border border-white/10">
                    <div className="code-block-header bg-black/50 px-4 py-2 border-b border-white/10 flex justify-between items-center text-xs text-slate-400 font-mono">
                      <span>{match[1]}</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleCopyText()}
                          className="hover:text-white flex items-center gap-1 cursor-pointer"
                          title="Copy Code"
                        >
                          <Copy size={12} />
                          <span>Copy</span>
                        </button>
                        <button 
                          onClick={() => handleDownloadCode(codeString, `code-block.${match[1] === 'javascript' ? 'js' : match[1] === 'typescript' ? 'ts' : match[1] === 'python' ? 'py' : match[1]}`)}
                          className="hover:text-white flex items-center gap-1 cursor-pointer"
                          title="Download Code File"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, padding: '16px', background: '#090d16', fontSize: '13px' }}
                      {...props}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-black/35 px-1.5 py-0.5 rounded text-neon-cyan font-mono text-xs border border-white/5" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {msg.text}
          </ReactMarkdown>
        )}
      </div>

      {/* Uploaded Files display inside message */}
      {msg.files && msg.files.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mt-2.5 border-t border-white/5 pt-2.5">
          {msg.files.map((file, fIdx) => (
            <div 
              key={fIdx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <FileText size={13} className={getAccentTextClass()} />
              <span className="max-w-[150px] truncate">{file.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Utility Actions */}
      {!isEditing && (
        <div className="flex gap-3 justify-end mt-1 border-t border-white/5 pt-2 text-slate-500">
          <button 
            onClick={handleCopyText}
            className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy Message"
          >
            <Copy size={13} />
            <span className="text-[10px] hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {msg.isUser ? (
            <button 
              onClick={() => { setEditText(msg.text); setIsEditing(true); }}
              className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Edit Prompt"
            >
              <Edit size={13} />
              <span className="text-[10px] hidden sm:inline">Edit</span>
            </button>
          ) : (
            (isLast || index === msg.text.length - 1) && (
              <button 
                onClick={() => onRegenerate(index - 1)} // Index of user prompt is usually index - 1
                className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Regenerate AI Response"
              >
                <RefreshCw size={13} />
                <span className="text-[10px] hidden sm:inline">Regenerate</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
