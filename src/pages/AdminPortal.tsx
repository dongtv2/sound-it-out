import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePractice } from '@/context/PracticeContext';
import { soundEffects } from '@/services/sound-effects';
import type { UserProfile, UserRole } from '@/types';
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
  Lock
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, familyUsers, createUser, updateUser, deleteUser } = useAuth();
  const { lists, deleteList, studentReports, deleteStudentReport, dialect, setDialect, strictMode, setStrictMode } = usePractice();

  const [adminTab, setAdminTab] = useState<'users' | 'settings' | 'catalog' | 'reports'>('users');

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
                Quản lý tài khoản gia đình, phân quyền RBAC, cấu hình domain sound-it-out.metta.family & CSDL SQLite
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
