import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePractice } from '@/context/PracticeContext';
import { soundEffects } from '@/services/sound-effects';
import type { UserProfile, UserRole } from '@/types';
import { ttsService } from '@/services/tts-service';
import { 
  Users, 
  Settings, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Edit, 
  KeyRound, 
  Check, 
  Crown, 
  Sparkles, 
  Globe, 
  Volume2, 
  CheckCircle2,
  Lock,
  Play,
  Zap
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, familyUsers, createUser, updateUser, deleteUser } = useAuth();
  const { lists, deleteList, studentReports, deleteStudentReport, dialect, setDialect, strictMode, setStrictMode, srsSettings, updateSrsSettings, reviewItems, clearAllReview, ttsSettings, updateTtsSettings } = usePractice();

  const [adminTab, setAdminTab] = useState<'users' | 'settings' | 'catalog' | 'reports' | 'srs' | 'tts'>('users');
  const [testText, setTestText] = useState('Sound It Out makes English listening and dictation learning fun and effective!');

  // New User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Dong1984@');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newUserError, setNewUserError] = useState<string | null>(null);

  // Edit User State
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('student');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError(null);

    if (!newEmail.trim()) {
      setNewUserError('Vui lòng nhập Email!');
      return;
    }

    try {
      soundEffects.playPop();
      await createUser({
        displayName: newDisplayName.trim() || newEmail.split('@')[0],
        email: newEmail.trim().toLowerCase(),
        password: newPassword || 'Dong1984@',
        role: newRole,
        isSuperuser: newRole === 'admin',
        isStaff: newRole === 'admin' || newRole === 'teacher'
      });
      soundEffects.playSuccess();
      setShowAddUserModal(false);
      setNewDisplayName('');
      setNewEmail('');
      setNewPassword('Dong1984@');
    } catch (err: unknown) {
      soundEffects.playError();
      const message = err instanceof Error ? err.message : 'Lỗi tạo tài khoản!';
      setNewUserError(message);
    }
  };

  const handleUpdateRole = async (uid: string, role: UserRole) => {
    soundEffects.playPop();
    await updateUser(uid, {
      role,
      isSuperuser: role === 'admin',
      isStaff: role === 'admin' || role === 'teacher'
    });
    setEditingUid(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 p-8 rounded-3xl text-white border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-500/20 rounded-2xl border border-purple-400/30">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">Admin Portal Gia Đình</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/30 border border-purple-400/40 text-purple-300">
                  God-Mode Privileges
                </span>
              </div>
              <p className="text-xs font-bold text-purple-200/80 mt-1">
                Quản lý tài khoản gia đình, phân quyền RBAC, cấu hình hệ thống sound-it-out.metta.family
              </p>
            </div>
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="flex items-center gap-2 mt-8 border-t border-purple-500/20 pt-6 overflow-x-auto">
          <button
            onClick={() => { soundEffects.playPop(); setAdminTab('users'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'users'
                ? 'bg-white text-purple-950 shadow-lg'
                : 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Thành Viên & Phân Quyền ({familyUsers.length})</span>
          </button>

          <button
            onClick={() => { soundEffects.playPop(); setAdminTab('settings'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'settings'
                ? 'bg-white text-purple-950 shadow-lg'
                : 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>2. Cấu Hình Hệ Thống</span>
          </button>

          <button
            onClick={() => { soundEffects.playPop(); setAdminTab('catalog'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'catalog'
                ? 'bg-white text-purple-950 shadow-lg'
                : 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Bài Học & Giao Bài ({lists.length})</span>
          </button>

          <button
            onClick={() => { soundEffects.playPop(); setAdminTab('reports'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'reports'
                ? 'bg-white text-purple-950 shadow-lg'
                : 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4. Báo Cáo Tiến Độ ({studentReports.length})</span>
          </button>

          <button
            onClick={() => { soundEffects.playPop(); setAdminTab('srs'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'srs'
                ? 'bg-white text-purple-950 shadow-lg'
                : 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>5. Cấu Hình SRS SM-2 ({reviewItems.length})</span>
          </button>

          <button
            onClick={() => { soundEffects.playPop(); setAdminTab('tts'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'tts'
                ? 'bg-white text-purple-950 shadow-lg'
                : 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
            }`}
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>6. Cấu Hình TTS Native</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS & RBAC MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Quản Lý Tài Khoản Gia Đình</span>
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Ứng dụng riêng cho gia đình. Không có đăng ký tự do, Admin trực tiếp khởi tạo và cấp tài khoản.
              </p>
            </div>

            <button
              onClick={() => { soundEffects.playPop(); setShowAddUserModal(true); }}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cấp Tài Khoản Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black">
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Vai trò (Role)</th>
                  <th className="py-3 px-4">Đặc quyền</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {familyUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${u.uid}`} className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100" alt="avatar" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          {u.displayName}
                          {u.isSuperuser && <span title="Superuser (God-Mode)"><Crown className="w-3.5 h-3.5 text-amber-500" /></span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">UID: {u.uid}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      {editingUid === u.uid ? (
                        <select
                          value={editRole}
                          onChange={e => handleUpdateRole(u.uid, e.target.value as UserRole)}
                          className="px-2.5 py-1 rounded-xl border border-purple-500 bg-purple-50 dark:bg-purple-950 text-xs font-bold"
                        >
                          <option value="admin">admin</option>
                          <option value="teacher">teacher</option>
                          <option value="student">student</option>
                          <option value="parent">parent</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'teacher'
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                            : u.role === 'student'
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {u.isSuperuser && <span className="px-2 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">God-Mode</span>}
                        {u.isStaff && <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 font-bold">Staff</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingUid(u.uid); setEditRole(u.role); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Đổi vai trò"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.uid !== user?.uid && (
                          <button
                            onClick={() => deleteUser(u.uid)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM SETTINGS */}
      {adminTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>Cấu Hình Hệ Thống & Tên Miền</span>
            </h2>
            <p className="text-xs font-bold text-slate-500">Cấu hình tên miền thương hiệu sound-it-out.metta.family & tùy chọn giọng đọc phát âm</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>Giọng Đọc Phát Âm Mặc Định (Dialect)</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setDialect('us')}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    dialect === 'us' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Mỹ (en-US)
                </button>
                <button
                  onClick={() => setDialect('uk')}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    dialect === 'uk' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Anh (en-GB)
                </button>
                <button
                  onClick={() => setDialect('both')}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    dialect === 'both' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Cả Hai (Both)
                </button>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-500" />
                <span>Chế Độ Kiểm Tra Chặt Chẽ (Strict Mode)</span>
              </h3>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-bold">Yêu cầu phân biệt chữ hoa/thường và dấu câu khi kiểm tra dictation</span>
                <button
                  onClick={() => setStrictMode(!strictMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    strictMode ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${strictMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LESSON CATALOG & ASSIGNMENTS */}
      {adminTab === 'catalog' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Danh Mục Bài Học & Phân Công Giao Bài</span>
            </h2>
            <p className="text-xs font-bold text-slate-500">Quản lý toàn bộ danh sách bài học và phân công bài giao cho các bé trong gia đình</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lists.map(list => (
              <div key={list.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{list.name}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{list.items.length} từ / câu • Loại: {list.type}</div>
                  </div>
                  <button
                    onClick={() => deleteList(list.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Được giao cho: <b className="text-purple-600 dark:text-purple-400">{list.learner || 'Tất cả'}</b></span>
                  <span className="text-slate-400">Bởi: {list.by}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FAMILY REPORTS */}
      {adminTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Báo Cáo Học Tập Gia Đình</span>
            </h2>
            <p className="text-xs font-bold text-slate-500">Lịch sử và điểm số kết quả dictation của các bé</p>
          </div>

          {studentReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">Chưa có báo cáo học tập nào được ghi nhận.</div>
          ) : (
            <div className="space-y-3">
              {studentReports.map(rep => (
                <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{rep.listName}</div>
                    <div className="text-xs text-slate-500 mt-1">Gốc: <span className="font-mono">{rep.originalText}</span> ➔ Học sinh gõ: <span className="font-mono font-bold text-emerald-600">{rep.correctedText}</span></div>
                  </div>
                  <button
                    onClick={() => deleteStudentReport(rep.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SRS SPACED REPETITION CONFIGURATION & MANAGEMENT */}
      {adminTab === 'srs' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Cấu Hình Thuật Toán Spaced Repetition (SuperMemo-2 SM-2)</span>
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Tối ưu hóa khả năng ghi nhớ dài hạn của học sinh bằng thuật toán lặp lại ngắt quãng khoa học.
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn XÓA TOÀN BỘ KHO TỪ SRS để làm sạch tiến độ học tập?')) {
                  soundEffects.playPop();
                  clearAllReview();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-black flex items-center gap-1.5 hover:bg-rose-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa / Reset Kho SRS</span>
            </button>
          </div>

          {/* SRS Pool Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Tổng Số Từ Trong Kho</span>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-100">{reviewItems.length} <span className="text-xs font-bold">từ</span></div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">🔥 Level 1 (Cần Ôn Gấp)</span>
              <div className="text-2xl font-black text-rose-900 dark:text-rose-100">
                {reviewItems.filter(r => (r.repetitions || 0) <= 1).length} <span className="text-xs font-bold">từ</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">⚡ Level 2 (Cần Củng Cố)</span>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-100">
                {reviewItems.filter(r => (r.repetitions || 0) >= 2 && (r.repetitions || 0) <= 3).length} <span className="text-xs font-bold">từ</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">✅ Level 3 (Đã Thuộc Tốt)</span>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
                {reviewItems.filter(r => (r.repetitions || 0) >= 4).length} <span className="text-xs font-bold">từ</span>
              </div>
            </div>
          </div>

          {/* Form Settings Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Setting 1: Daily Limit */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Số Từ Ôn Tập Tối Đa / Ngày
                </label>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-mono font-black">
                  {srsSettings.dailyReviewLimit} từ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Giới hạn số từ tối đa giao cho học sinh trong 1 phiên ôn tập để tránh quá tải não bộ.
              </p>
              <select
                value={srsSettings.dailyReviewLimit}
                onChange={e => updateSrsSettings({ dailyReviewLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value={10}>10 từ / ngày (Nhẹ nhàng)</option>
                <option value={20}>20 từ / ngày (Khuyên dùng chuẩn)</option>
                <option value={30}>30 từ / ngày (Cấp tốc)</option>
                <option value={50}>50 từ / ngày (Chuyên sâu)</option>
                <option value={999}>Không giới hạn (Ôn toàn bộ)</option>
              </select>
            </div>

            {/* Setting 2: Initial Ease Factor */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Hệ Số Ghi Nhớ Ban Đầu (Ease Factor)
                </label>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-mono font-black">
                  EF = {srsSettings.initialEaseFactor}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Hệ số lặp lại ngắt quãng SuperMemo-2. Giá trị càng cao, khoảng thời gian giãn cách giữa các lần lặp càng nhanh tăng.
              </p>
              <select
                value={srsSettings.initialEaseFactor}
                onChange={e => updateSrsSettings({ initialEaseFactor: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value={2.0}>2.0 (Lặp dày đặc - Học kỹ)</option>
                <option value={2.5}>2.5 (Tiêu chuẩn SM-2 khuyên dùng)</option>
                <option value={2.8}>2.8 (Lặp nhanh - Cho học sinh giỏi)</option>
              </select>
            </div>

            {/* Setting 3: Auto-Collect Failed Items */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  Tự Động Gom Từ Gõ Sai Vào Kho SRS
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Khi học sinh nhập sai trong các bài học chính, hệ thống tự động đưa từ đó vào Kho SRS để nhắc lặp lại.
                </p>
              </div>
              <input
                type="checkbox"
                checked={srsSettings.autoCollectFailed}
                onChange={e => updateSrsSettings({ autoCollectFailed: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* Setting 4: Auto-Prompt Due Banner */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  Tự Động Nhắc Nhở Ôn Bài Đầu Buổi Học
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Hiển thị banner gợi ý ôn các từ đến hạn ngay khi học sinh mở trang luyện tập.
                </p>
              </div>
              <input
                type="checkbox"
                checked={srsSettings.autoPromptDue}
                onChange={e => updateSrsSettings({ autoPromptDue: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* Setting 5: Strict Priority Mode */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-4 md:col-span-2">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                  Chế Độ Ưu Tiên Từ Ôn Gấp (Strict Priority Mode)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Tự động đẩy các từ Level 1 (🔥 Ôn gấp) lên đầu danh sách ôn tập trước khi chuyển sang các từ đã lặp nhiều lần.
                </p>
              </div>
              <input
                type="checkbox"
                checked={srsSettings.strictPriorityMode}
                onChange={e => updateSrsSettings({ strictPriorityMode: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
              />
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: TTS SYSTEM VOICE CONFIGURATION */}
      {adminTab === 'tts' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-500" />
                <span>🔊 Cấu Hình Giọng Đọc TTS Native (Text-To-Speech)</span>
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Lựa chọn mô hình và chất giọng tiếng Anh chuẩn bản xứ (Native US / UK / AU) cho câu và từ vựng.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                ttsService.speak(testText, ttsSettings);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Thử Giọng Đọc Mẫu</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Setting 1: Engine Selection */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Công Nghệ & Engine Giọng Đọc
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Chọn giữa giọng đọc tự nhiên High-Definition của hệ điều hành hoặc luồng Audio Cloud fallback.
              </p>
              <select
                value={ttsSettings.engine}
                onChange={e => updateTtsSettings({ engine: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
              >
                <option value="browser_native">🌐 Web Speech API (Google / Apple / Microsoft HD Natural Voices - Khuyên Dùng)</option>
                <option value="openai_tts">🤖 OpenAI Audio Speech API (Generative Studio AI Voices - Giọng Đọc AI Đỉnh Cao)</option>
                <option value="google_tts_cdn">⚡ Cloud Audio Stream Fallback (Google Audio CDN API)</option>
              </select>
            </div>

            {/* Setting 2: Accent Selection */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Chất Giọng Bản Xứ Mặc Định (Native Accent)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Tự động chọn giọng đọc bản xứ theo khu vực ưu tiên khi học sinh luyện nghe.
              </p>
              <select
                value={ttsSettings.accent}
                onChange={e => updateTtsSettings({ accent: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
              >
                <option value="en-US">🇺🇸 Tiếng Anh - Mỹ (Native US English - Standard Accent)</option>
                <option value="en-GB">🇬🇧 Tiếng Anh - Anh (Native UK English - Received Pronunciation)</option>
                <option value="en-AU">🇦🇺 Tiếng Anh - Úc (Native Australian English)</option>
              </select>
            </div>

            {/* Setting 3: Voice Selection */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Mô Hình Giọng Đọc Cụ Thể (Voice Model)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Danh sách giọng đọc tự nhiên cài đặt sẵn trên máy tính / thiết bị của bạn.
              </p>
              <select
                value={ttsSettings.voiceName || 'auto'}
                onChange={e => updateTtsSettings({ voiceName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
              >
                <option value="auto">✨ Tự Động Chọn Giọng Chuẩn Nhất (Google / Natural / Samantha)</option>
                {ttsService.getAllEnglishVoices().map((v, i) => (
                  <option key={v.name + i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Setting 4: Speech Rate */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Tốc Độ Đọc Tiêu Chuẩn (Speech Speed)
                </label>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-black">
                  {ttsSettings.rate}x
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Tốc độ đọc từ vựng và câu đàm thoại. Mặc định 0.9x để học sinh nghe rõ từng âm tiết.
              </p>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={ttsSettings.rate}
                onChange={e => updateTtsSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Setting 5: OpenAI Specific Configuration */}
            {ttsSettings.engine === 'openai_tts' && (
              <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-4 md:col-span-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
                  <h3 className="text-xs font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Cấu Hình Chi Tiết Mô Hình Giọng Đọc OpenAI AI</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white uppercase">Studio Neural AI</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* OpenAI Voice Selection */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block mb-1">Mẫu Giọng Đọc OpenAI Voice</label>
                    <select
                      value={ttsSettings.openaiVoice || 'nova'}
                      onChange={e => updateTtsSettings({ openaiVoice: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
                    >
                      <option value="nova">🌟 Nova (Ấm áp, biểu cảm - Nữ Mỹ khuyên dùng)</option>
                      <option value="shimmer">✨ Shimmer (Rõ ràng, năng động - Nữ Mỹ)</option>
                      <option value="alloy">💎 Alloy (Trung tính, tự nhiên - Chuẩn)</option>
                      <option value="echo">🗣️ Echo (Trầm ấm, điềm tĩnh - Nam)</option>
                      <option value="onyx">🎙️ Onyx (Giọng Nam trầm quyến rũ)</option>
                      <option value="fable">📖 Fable (Giọng đọc truyện truyền cảm)</option>
                    </select>
                  </div>

                  {/* OpenAI Quality Model */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block mb-1">Mô Hình Chất Lượng (Model)</label>
                    <select
                      value={ttsSettings.openaiModel || 'tts-1'}
                      onChange={e => updateTtsSettings({ openaiModel: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
                    >
                      <option value="tts-1">⚡ tts-1 (Tối ưu tốc độ & phản hồi nhanh)</option>
                      <option value="tts-1-hd">🎧 tts-1-hd (Chất lượng Studio âm thanh gốc HD)</option>
                    </select>
                  </div>

                  {/* OpenAI API Key */}
                  <div>
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block mb-1">OpenAI API Key (Tùy chọn)</label>
                    <input
                      type="password"
                      value={ttsSettings.openaiApiKey || ''}
                      onChange={e => updateTtsSettings({ openaiApiKey: e.target.value })}
                      placeholder="sk-proj-..."
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Bỏ trống nếu đã cấu hình trong env server.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Test Sentence Textbox */}
          <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
            <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
              Văn Bản Thử Giọng Đọc (Test Sentence / Word)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={e => setTestText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
              />
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  ttsService.speak(testText, ttsSettings);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-emerald-500"
              >
                <Volume2 className="w-4 h-4" />
                <span>Phát Âm</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Create Family Member User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Cấp Tài Khoản Gia Đình Mới</h3>

            {newUserError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-600">
                {newUserError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  placeholder="Ví dụ: Bé Bi"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Ví dụ: bi@metta.family"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Mật khẩu ban đầu</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mặc định: Dong1984@"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Vai trò (Role)</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                >
                  <option value="student">student (Học sinh)</option>
                  <option value="teacher">teacher (Giáo viên)</option>
                  <option value="parent">parent (Phụ huynh)</option>
                  <option value="admin">admin (Quản trị viên)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black shadow-md"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
