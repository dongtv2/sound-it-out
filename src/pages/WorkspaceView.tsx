import React from 'react';
import { usePractice } from '@/context/PracticeContext';
import { useAuth } from '@/context/AuthContext';
import DictationPractice from '@/components/DictationPractice';
import LessonComposer from '@/components/LessonComposer';
import AdminPortal from '@/pages/AdminPortal';
import { CheckSquare, BarChart3, Trash2, Award, Clock } from 'lucide-react';

export const WorkspaceView: React.FC = () => {
  const { activeTab, lists, setActiveListId, studentReports, deleteStudentReport } = usePractice();
  const { user } = useAuth();

  // Filter assigned homework for student
  const assignedLists = lists.filter(l => 
    l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 dark:bg-slate-950">
      {/* 1. PRACTICE TAB */}
      {activeTab === 'practice' && <DictationPractice />}

      {/* 2. COMPOSER & LESSON MANAGEMENT TAB */}
      {activeTab === 'composer' && <LessonComposer />}

      {/* 3. ASSIGNED HOMEWORK TAB (Student View) */}
      {activeTab === 'assigned' && (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 rounded-2xl">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Bài Được Giao Cho {user?.displayName}</h1>
                <p className="text-xs font-bold text-slate-500">Danh sách bài luyện nghe & viết được giáo viên phân công</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedLists.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-slate-400 font-bold text-xs">
                Hiện tại bạn không có bài tập nào được giao riêng. Hãy chọn bài trong danh mục chính để luyện tập!
              </div>
            ) : (
              assignedLists.map(list => (
                <div key={list.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-cyan-500/30 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                        Bài Được Giao
                      </span>
                      <h3 className="font-black text-base text-slate-900 dark:text-white mt-1.5">{list.name}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{list.items.length} câu / từ vựng</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveListId(list.id);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Bắt Đầu Luyện Tập Ngay
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. REPORTS TAB (Parent / Teacher / Admin View) */}
      {activeTab === 'reports' && (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 rounded-2xl">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Báo Cáo Tiến Độ Học Tập Gia Đình</h1>
                <p className="text-xs font-bold text-slate-500">Lịch sử kết quả luyện nghe và phát âm của các bé</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {studentReports.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-slate-400 font-bold text-xs">
                Chưa có dữ liệu làm bài. Học sinh luyện tập bài đầu tiên sẽ hiển thị kết quả tại đây!
              </div>
            ) : (
              studentReports.map(report => (
                <div key={report.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white">{report.listName}</span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Gốc: <span className="font-mono">{report.originalText}</span> ➔ Gõ: <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{report.correctedText}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteStudentReport(report.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. ADMIN PORTAL TAB */}
      {activeTab === 'admin' && (user?.role === 'admin' || user?.isSuperuser) && (
        <AdminPortal />
      )}
    </div>
  );
};

export default WorkspaceView;
