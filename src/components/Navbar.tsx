import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePractice, type SoundItOutTab } from '@/context/PracticeContext';
import { soundEffects } from '@/services/sound-effects';
import { 
  Volume2, 
  Globe,
  Sparkles, 
  User, 
  KeyRound, 
  LogOut, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  ShieldCheck, 
  ChevronDown,
  Edit2,
  X,
  Check
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export const Navbar: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { activeTab, setActiveTab, reviewItems, lists } = usePractice();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '');

  const handleTabClick = (tab: SoundItOutTab) => {
    soundEffects.playPop();
    setActiveTab(tab);
  };

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDisplayName.trim()) return;
    try {
      await updateUser(user.uid, { displayName: newDisplayName.trim() });
      setIsEditNameModalOpen(false);
      soundEffects.playCorrect();
    } catch (err: any) {
      alert('Không thể cập nhật tên: ' + (err.message || err));
    }
  };

  // Count assigned homework for student
  const assignedCount = lists.filter(l => l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase())).length;

  // Count SRS items due today
  const now = Date.now();
  const dueSrsCount = reviewItems.filter(i => !i.dueDate || i.dueDate <= now).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 lg:px-6 py-3 flex items-center justify-between shadow-xs">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabClick('practice')}>
          <div className="relative">
            <img 
              src="/logo-icon.png" 
              alt="Sound It Out Logo" 
              className="w-9 h-9 rounded-xl object-contain bg-white p-1 border border-emerald-500/20 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/favicon.svg';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <div className="text-base font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent leading-none flex items-center gap-1.5">
              <span>Sound It Out</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-0.5">
              May all beings be happy
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation based on User Role */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => handleTabClick('practice')}
            title="Khu vực học chung cho tất cả học sinh tự do ôn luyện & thi đua xếp hạng"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Khu Vực Học Chung</span>
            {dueSrsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-mono font-bold rounded-full animate-pulse">
                {dueSrsCount} SRS
              </span>
            )}
          </button>

          {(user?.role === 'teacher' || user?.role === 'admin' || user?.isSuperuser) && (
            <button
              onClick={() => handleTabClick('composer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
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

        {/* Right User Menu (COMPACT DISPLAY & AUTO-HIDE ON MOUSE LEAVE) */}
        <div 
          className="relative"
          onMouseEnter={() => setProfileMenuOpen(true)}
          onMouseLeave={() => setProfileMenuOpen(false)}
        >
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user?.uid || 'user'}`}
              className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 object-cover"
              alt="avatar"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-slate-800 dark:text-slate-100 max-w-[120px] truncate leading-tight">
                {user?.displayName || 'User'}
              </div>
              <div className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                {user?.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* USER PROFILE DROPDOWN WITH EDIT DISPLAY NAME & AUTO-HIDE */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[140px]">
                    {user?.displayName}
                  </div>
                  <button
                    onClick={() => {
                      setNewDisplayName(user?.displayName || '');
                      setIsEditNameModalOpen(true);
                    }}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                    title="Đổi tên hiển thị"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-slate-500 font-mono truncate">{user?.email}</div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Vai trò: {user?.role}
                  </span>
                </div>
              </div>

              {/* Edit Display Name Quick Action */}
              <button
                onClick={() => {
                  setNewDisplayName(user?.displayName || '');
                  setIsEditNameModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <Edit2 className="w-4 h-4 text-cyan-600" />
                <span>Đổi tên hiển thị</span>
              </button>

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
      </header>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}

      {/* EDIT DISPLAY NAME MODAL */}
      {isEditNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-500" />
                <span>Đổi Tên Hiển Thị</span>
              </h3>
              <button
                onClick={() => setIsEditNameModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDisplayName} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên hiển thị mới
                </label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  placeholder="Ví dụ: Bé Phúc Trí, Cô Mai Anh..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newDisplayName.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
