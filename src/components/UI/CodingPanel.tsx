import React from 'react';
import { Terminal, HelpCircle, ShieldAlert, Zap, FileCheck, RefreshCw } from 'lucide-react';

interface CodingPanelProps {
  onSelectAction: (template: string) => void;
  accentColor: string;
}

export default function CodingPanel({ onSelectAction, accentColor }: CodingPanelProps) {
  const getAccentTextClass = () => {
    switch (accentColor) {
      case 'purple': return 'text-neon-purple';
      case 'amber': return 'text-amber-500';
      case 'emerald': return 'text-emerald-500';
      case 'blue': return 'text-blue-500';
      default: return 'text-neon-cyan';
    }
  };

  const codingActions = [
    {
      label: 'Explain Code',
      icon: <HelpCircle size={13} />,
      template: 'Please explain what this code does step-by-step:\n\n```\n[Paste code here]\n```'
    },
    {
      label: 'Debug Code',
      icon: <ShieldAlert size={13} />,
      template: 'There is a bug in this code. Please help me identify and fix it:\n\n```\n[Paste code here]\n```'
    },
    {
      label: 'Optimize Code',
      icon: <Zap size={13} />,
      template: 'Please optimize this code for better performance, clean architecture, and efficiency:\n\n```\n[Paste code here]\n```'
    },
    {
      label: 'Generate Tests',
      icon: <FileCheck size={13} />,
      template: 'Please write comprehensive unit tests for this code:\n\n```\n[Paste code here]\n```'
    },
    {
      label: 'Convert Language',
      icon: <RefreshCw size={13} />,
      template: 'Please convert this code from [Source Language] to [Target Language]:\n\n```\n[Paste code here]\n```'
    }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 hide-scrollbar w-full border-b border-white/5 pb-2">
      <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${getAccentTextClass()} font-outfit shrink-0`}>
        <Terminal size={11} />
        <span>Coding Assistant:</span>
      </div>
      
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
        {codingActions.map(action => (
          <button
            key={action.label}
            onClick={() => onSelectAction(action.template)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
