import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check, ArrowUpRight, Code, PenTool, BarChart, GraduationCap, Play } from 'lucide-react';

interface PromptLibraryProps {
  onSelectPrompt: (template: string) => void;
  accentColor: string;
}

interface PromptTemplate {
  title: string;
  category: 'coding' | 'writing' | 'analysis' | 'creativity';
  desc: string;
  template: string;
}

export default function PromptLibrary({ onSelectPrompt, accentColor }: PromptLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
      case 'purple': return 'bg-neon-purple text-black hover:bg-neon-purple/80';
      case 'amber': return 'bg-amber-500 text-black hover:bg-amber-500/80';
      case 'emerald': return 'bg-emerald-500 text-black hover:bg-emerald-500/80';
      case 'blue': return 'bg-blue-500 text-black hover:bg-blue-500/80';
      default: return 'bg-neon-cyan text-black hover:bg-neon-cyan/80';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'coding': return <Code size={13} />;
      case 'writing': return <PenTool size={13} />;
      case 'analysis': return <BarChart size={13} />;
      default: return <GraduationCap size={13} />;
    }
  };

  const promptsList: PromptTemplate[] = [
    {
      title: 'Python FastAPI Boilerplate',
      category: 'coding',
      desc: 'Build a standard robust REST API structure with FastAPI.',
      template: 'Please create a comprehensive, production-ready Python FastAPI boilerplate. Include dynamic route parameters, CORS configuration, SQLite integration using SQLAlchemy schemas, error handling middleware, and standard project directory guidelines.'
    },
    {
      title: 'Optimize SQL Performance',
      category: 'coding',
      desc: 'Explain slow SQL query logs and optimize indexing structures.',
      template: 'There is a performance bottleneck in this SQL query. Please review, optimize execution, and explain indexing adjustments:\n\n```sql\nSELECT u.id, u.name, count(o.id) \nFROM users u \nLEFT JOIN orders o ON o.user_id = u.id \nWHERE u.status = \'active\' \nGROUP BY u.id \nHAVING count(o.id) > 5;\n```'
    },
    {
      title: 'Commit Message Formatter',
      category: 'coding',
      desc: 'Format messy changes into standard Conventional Commits.',
      template: 'Please write standard conventional commit logs for these workspace changes. Write one short summary header, list major feature bullet points, and add a BREAKING CHANGE footer if applicable:\n\n- Created AuthModal registration screen\n- Updated user model references in db.js\n- Fixed SSE streaming buffer splits'
    },
    {
      title: 'Construct HTML Landing Page',
      category: 'coding',
      desc: 'Build single file dashboard with pure HTML, Tailwind, and CSS animations.',
      template: 'Construct a complete, single-file responsive dashboard template using HTML5, modern Tailwind CSS classes, glassmorphic headers, a layout grid of widgets, sidebar list navigation, and smooth hover translations.'
    },
    {
      title: 'Marketing Newsletter Copy',
      category: 'writing',
      desc: 'Draft an attention-grabbing sales outreach launch letter.',
      template: 'Please write an engaging, sci-fi cyberpunk-themed marketing newsletter to announce the launch of "Anti Gravity Software 2.0" (the ultimate AI productivity deck). Keep it witty, short (200 words), and end with a high-conversion call to action.'
    },
    {
      title: 'Resume Roast & Review',
      category: 'writing',
      desc: 'Critique resume text and give precise bullet-point suggestions.',
      template: 'Please roast my current software engineer resume. Provide brutal but constructive feedback on grammar, project descriptions, active verbs, technology list structure, and outline five actionable improvements:\n\n[Paste Resume text here]'
    },
    {
      title: 'Competitive Feature Analysis',
      category: 'analysis',
      desc: 'Analyze competitor platforms and construct a markdown table.',
      template: 'Please perform a detailed competitor feature analysis comparing "Anti Gravity Software" against standard alternatives (e.g. Notion AI, ChatGPT, Cursor IDE). Output a clean comparison markdown table, highlight core unique value propositions, and note market gaps.'
    },
    {
      title: 'Explain Complex Algorithms',
      category: 'analysis',
      desc: 'Explain recursive dynamic programming simply using LaTeX.',
      template: 'Please explain the Knapsack dynamic programming algorithm step-by-step. Use mathematical representations in LaTeX to show the transition equations, and write a clean memoized Python solution.'
    },
    {
      title: 'Git Branch naming protocol',
      category: 'creativity',
      desc: 'Generate branch identifiers from feature tickets.',
      template: 'Convert these task tickets into standardized, clean Git branch identifiers following standard patterns (e.g., feat/ticket-name, bugfix/ticket-name):\n\n1. "Fix registration form password field validator fail"\n2. "Add document drag and drop files lists"\n3. "Configure production JWT signature credentials"'
    },
    {
      title: 'Glassmorphism Style Helper',
      category: 'creativity',
      desc: 'Generate gorgeous CSS glassmorphism styles with backdrop filters.',
      template: 'Please design custom CSS variables and class rules for a premium, glowing glassmorphic card panel. Include blur configurations, border transparency gradients, background alpha transparency matching a deep cosmic theme, and hover shadow changes.'
    }
  ];

  const filteredPrompts = promptsList.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCopyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const tabs = [
    { value: 'all', label: 'All Templates' },
    { value: 'coding', label: 'Coding' },
    { value: 'writing', label: 'Writing' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'creativity', label: 'Creativity' }
  ];

  return (
    <div className="flex-1 flex flex-col gap-5 overflow-hidden pointer-events-auto h-full w-full pb-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className={getAccentTextClass()} size={22} />
          <h1 className="font-outfit text-xl font-extrabold tracking-wide text-white">PROMPT TEMPLATE LIBRARY</h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt deck..."
            className="w-full bg-black/20 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-white/20 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 hide-scrollbar">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer whitespace-nowrap transition-all ${
              activeTab === t.value
                ? getAccentBorderClass()
                : 'border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid of Prompt Cards */}
      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4 hide-scrollbar">
        {filteredPrompts.map((p, idx) => (
          <div
            key={idx}
            className="p-5 bg-black/35 border border-white/5 rounded-2xl flex flex-col justify-between gap-3 shadow-md hover:border-white/10 transition-colors group"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-outfit text-sm font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                  {p.title}
                </h3>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5 flex items-center gap-1.5 text-slate-400`}>
                  {getCategoryIcon(p.category)}
                  {p.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
              
              {/* Preview Box */}
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 text-[10px] font-mono text-slate-400 select-text max-h-[80px] overflow-y-auto leading-relaxed hide-scrollbar mt-1">
                {p.template}
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-2.5 items-center justify-end mt-1.5 border-t border-white/5 pt-3">
              <button
                onClick={() => handleCopyPrompt(p.template, idx)}
                className="flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 transition-colors cursor-pointer"
                title="Copy template"
              >
                {copiedIndex === idx ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => onSelectPrompt(p.template)}
                className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${getAccentButtonClass()}`}
              >
                <Play size={10} className="fill-current" />
                <span>Use Template</span>
              </button>
            </div>
          </div>
        ))}

        {filteredPrompts.length === 0 && (
          <div className="col-span-full text-center text-xs text-slate-500 italic py-12">
            No matching prompt templates found
          </div>
        )}
      </div>

    </div>
  );
}
