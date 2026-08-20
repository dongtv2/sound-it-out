import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { soundEffects } from '@/services/sound-effects';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      soundEffects.playPop();
      await login(email.trim(), password);
      soundEffects.playSuccess();
    } catch (err: unknown) {
      soundEffects.playError();
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu!';
      setError(message);
    } finally {
      setLoading(false);
    }
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
      <div className="relative z-10 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/30 p-2">
            <img 
              src="/logo-icon.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.svg'; }} 
            />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Sound It Out
            </h1>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-1">
              May all beings be happy
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 text-center animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {/* Clean & Secure Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              Email tài khoản
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nhap-email@metta.family"
                className="w-full px-4 py-3.5 pl-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 pl-10 pr-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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

        {/* Security Disclaimer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Ứng dụng gia đình riêng tư. Bảo mật tuyệt đối.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
