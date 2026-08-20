import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePractice, type SoundItOutTab } from '@/context/PracticeContext';
import { soundEffects } from '@/services/sound-effects';
import { 
  Volume2, 
  Sparkles, 
  User, 
  KeyRound, 
  LogOut, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Layers,
  ChevronDown
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab, reviewItems, lists } = usePractice();
  const [darkMode, setDarkMode] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const toggleDarkMode = () => {
    soundEffects.playPop();
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleTabClick = (tab: SoundItOutTab) => {
    soundEffects.playPop();
    setActiveTab(tab);
  };

  // Count assigned homework for student
  const assignedCount = lists.filter(l => l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase())).length;

  // Count SRS items due today
  const now = Date.now();
  const dueSrsCount = reviewItems.filter(i => !i.dueDate || i.dueDate <= now).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabClick('practice')}>
          <div className="relative">
            <img 
              src="/logo-icon.png" 
              alt="Sound It Out Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-emerald-500/20 shadow-sm"
              onError={(e) => {
                // Fallback to favicon
                (e.target as HTMLImageElement).src = '/favicon.svg';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent leading-none flex items-center gap-1.5">
              <span>Sound It Out</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-0.5">
              sound-it-out.metta.family
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation based on User Role */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => handleTabClick('practice')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Luyện Âm Dictation</span>
            {dueSrsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-mono font-bold rounded-full animate-pulse">
                {dueSrsCount} SRS
              </span>
            )}
          </button>

          {(user?.role === 'teacher' || user?.role === 'admin' || user?.isSuperuser) && (
            <button
              onClick={() => handleTabClick('composer')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'composer'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Soạn & Giao Bài</span>
            </button>
          )}

          {user?.role === 'student' && (
            <button
              onClick={() => handleTabClick('assigned')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Bài Được Giao</span>
              {assignedCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500 text-white font-mono font-bold rounded-full">
                  {assignedCount}
                </span>
              )}
            </button>
          )}

          {(user?.role === 'parent' || user?.role === 'teacher' || user?.role === 'admin' || user?.isSuperuser) && (
            <button
              onClick={() => handleTabClick('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Báo Cáo Tiến Độ</span>
            </button>
          )}

          {(user?.role === 'admin' || user?.isSuperuser) && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          )}
        </nav>

        {/* Right Actions & User Menu */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Đổi giao diện Sáng / Tối"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400 fill-amber-400" /> : <Moon className="w-5 h-5 text-emerald-600 fill-emerald-600" />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <img
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user?.uid || 'user'}`}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 object-cover"
                alt="avatar"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                  {user?.displayName || 'User'}
                </div>
                <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{user?.displayName}</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{user?.email}</div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      Vai trò: {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Đổi mật khẩu</span>
                </button>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
