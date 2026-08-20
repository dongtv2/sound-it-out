import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { soundEffects } from '@/services/sound-effects';
import { Volume2, Lock, Mail, Sparkles, ShieldCheck, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@metta.family');
  const [password, setPassword] = useState('Dong1984@');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Vui lòng nhập Email và Mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      soundEffects.playPop();
      await login(email.trim(), password);
      soundEffects.playSuccess();
    } catch (err: unknown) {
      soundEffects.playError();
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại!';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (emailVal: string) => {
    soundEffects.playPop();
    setEmail(emailVal);
    setPassword('Dong1984@');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans">
      {/* Background Image with Dark Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 blur-xs scale-105"
        style={{ backgroundImage: `url('/sound-it-out-portal-bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-slate-900/80" />

      {/* Main Login Box */}
      <div className="relative z-10 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/30 p-2">
            <img src="/logo-icon.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.svg'; }} />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Sound It Out
            </h1>
            <div className="text-xs font-bold text-slate-500 font-mono tracking-tight mt-1">
              sound-it-out.metta.family
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 text-center animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Email tài khoản</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@metta.family"
                className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'}
          </button>
        </form>

        {/* Quick Family Account Selectors */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            Tài khoản gia đình điền sẵn
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFill('admin@metta.family')}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
            >
              <div className="font-black text-emerald-600">Admin</div>
              <div className="text-[10px] text-slate-400 truncate">admin@metta.family</div>
            </button>

            <button
              onClick={() => handleQuickFill('student@metta.family')}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 transition-all cursor-pointer"
            >
              <div className="font-black text-cyan-600">Bé Mai (Student)</div>
              <div className="text-[10px] text-slate-400 truncate">student@metta.family</div>
            </button>
          </div>
        </div>

        {/* Security Disclaimer */}
        <div className="text-center text-[11px] text-slate-400 font-medium">
          🔒 Ứng dụng gia đình riêng tư. Đăng ký tự do bị khóa. Admin cấp tài khoản trực tiếp.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
