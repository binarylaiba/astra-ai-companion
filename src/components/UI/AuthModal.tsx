import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
  accentColor: string;
}

export default function AuthModal({ onClose, onAuthSuccess, accentColor }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      case 'purple': return 'bg-neon-purple hover:bg-neon-purple/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] text-black';
      case 'amber': return 'bg-amber-500 hover:bg-amber-500/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] text-black';
      case 'emerald': return 'bg-emerald-500 hover:bg-emerald-500/80 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] text-black';
      case 'blue': return 'bg-blue-500 hover:bg-blue-500/80 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] text-black';
      default: return 'bg-neon-cyan hover:bg-neon-cyan/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] text-black';
    }
  };

  const getAccentBorderClass = () => {
    switch (accentColor) {
      case 'purple': return 'border-neon-purple/35 focus:border-neon-purple';
      case 'amber': return 'border-amber-500/35 focus:border-amber-500';
      case 'emerald': return 'border-emerald-500/35 focus:border-emerald-500';
      case 'blue': return 'border-blue-500/35 focus:border-blue-500';
      default: return 'border-neon-cyan/35 focus:border-neon-cyan';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { name, username, email, password }
      : { usernameOrEmail: email, password }; // frontend email input doubles as username field in login

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.token, data.user);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Stellar connection timeout. Check API server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[8px] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full flex flex-col gap-5 border border-white/20 shadow-glow-cyan animate-fade-in pointer-events-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className={getAccentTextClass()} size={22} />
            <h2 className="font-outfit text-lg font-extrabold tracking-wider text-white">
              {isRegister ? 'SYSTEM REGISTRATION' : 'SECURITY LOGIN'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-500/25 p-3 rounded-xl text-xs font-medium">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Display Name</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Commander Shepard"
                  className={`w-full bg-black/35 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-inter outline-none transition-colors ${getAccentBorderClass()}`}
                />
              </div>
            </div>
          )}

          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Username</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. shepard_n7"
                  required
                  className={`w-full bg-black/35 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-inter outline-none transition-colors ${getAccentBorderClass()}`}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {isRegister ? 'Email Address' : 'Email or Username'}
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRegister ? "e.g. shepard@alliance.mil" : "Enter email or username"}
                required
                className={`w-full bg-black/35 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-inter outline-none transition-colors ${getAccentBorderClass()}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Access Code (Password)</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full bg-black/35 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-inter outline-none transition-colors ${getAccentBorderClass()}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${getAccentBgClass()} disabled:opacity-50`}
          >
            {loading ? 'Decrypting Session...' : isRegister ? 'Establish N7 Protocol' : 'Authenticate Session'}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center text-xs text-slate-400 border-t border-white/5 pt-3">
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button 
                onClick={() => setIsRegister(false)}
                className={`font-bold hover:underline cursor-pointer ${getAccentTextClass()}`}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New crew member?{' '}
              <button 
                onClick={() => setIsRegister(true)}
                className={`font-bold hover:underline cursor-pointer ${getAccentTextClass()}`}
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
