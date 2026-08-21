import React, { useState } from 'react';
import { usePractice } from '@/context/PracticeContext';
import { useAuth } from '@/context/AuthContext';
import DictationPractice from '@/components/DictationPractice';
import LessonComposer from '@/components/LessonComposer';
import AdminPortal from '@/pages/AdminPortal';
import { soundEffects } from '@/services/sound-effects';
import { 
  CheckSquare, 
  BarChart3, 
  Trash2, 
  Award, 
  Clock, 
  Sparkles, 
  Zap, 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  ArrowLeft, 
  Play, 
  Target, 
  Trophy, 
  Star, 
  UserCheck,
  GraduationCap
} from 'lucide-react';

export const WorkspaceView: React.FC = () => {
  const { activeTab, lists, setActiveListId, studentReports, deleteStudentReport, reviewItems, setActiveTab } = usePractice();
  const { user } = useAuth();

  // State to track if student is in expanded practice mode within Assigned tab
  const [practicingAssignedId, setPracticingAssignedId] = useState<string | null>(null);

  // Filter assigned homework for current student
  const assignedLists = lists.filter(l => 
    l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase())
  );

  // Calculate total items assigned
  const totalAssignedItems = assignedLists.reduce((sum, l) => sum + (l.items?.length || 0), 0);
  const activeAssignedList = lists.find(l => l.id === practicingAssignedId);

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 dark:bg-slate-950">
      {/* 1. PRACTICE TAB */}
      {activeTab === 'practice' && <DictationPractice />}

      {/* 2. COMPOSER & LESSON MANAGEMENT TAB */}
      {activeTab === 'composer' && <LessonComposer />}

      {/* 3. ASSIGNED HOMEWORK TAB (Student Motivational Dashboard & Expanded Practice) */}
      {activeTab === 'assigned' && (
        <>
          {practicingAssignedId ? (
            /* EXPANDED PRACTICE MODE FOR ASSIGNED HOMEWORK (Layout Mở Rộng - Space Optimized) */
            <div className="w-full animate-in fade-in duration-300">
              <DictationPractice onBackToDashboard={() => setPracticingAssignedId(null)} />
            </div>
          ) : (
            /* MOTIVATIONAL STUDENT LEARNING DASHBOARD */
            <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6 animate-in fade-in duration-300">
              
              {/* Header Welcome & Level Badge */}
              <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-6 sm:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                    <GraduationCap className="w-4 h-4 text-amber-300" />
                    <span>Lộ Trình Học Tập Cá Nhân Hóa</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                    Chào Mừng Học Sinh {user?.displayName || 'Bé Phúc Trí'}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-cyan-100/90 leading-relaxed">
                    Hãy giữ vững phong độ! Hoàn thành bài tập giáo viên phân công để tích lũy điểm thưởng và nâng cao trình độ phát âm nhé.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="p-3 bg-amber-400 text-slate-900 rounded-2xl shadow-lg">
                    <Trophy className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-cyan-200">Cấp Độ Luyện Nghe</div>
                    <div className="text-sm font-black text-white">Luyện Nghe Siêu Cấp 🔥</div>
                  </div>
                </div>
              </div>

              {/* Motivational Statistics Grid (4 Key Metric Cards) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Assigned Homework */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Bài Được Giao</span>
                    <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {assignedLists.length} <span className="text-xs font-bold text-slate-400">bài</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold">Bài tập giáo viên phân công</p>
                </div>

                {/* Card 2: Total Items */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tổng Số Từ & Câu</span>
                    <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {totalAssignedItems} <span className="text-xs font-bold text-slate-400">từ / câu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold">Nội dung đàm thoại & bài hát</p>
                </div>

                {/* Card 3: Learning Streak */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Chuỗi Học (Streak)</span>
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600">
                      <Flame className="w-5 h-5 fill-current animate-bounce" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    3 <span className="text-xs font-bold text-slate-400">ngày liên tiếp</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold">Duy trì học mỗi ngày</p>
                </div>

                {/* Card 4: SRS Review Due */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Kho Từ Ôn SRS</span>
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {reviewItems.length} <span className="text-xs font-bold text-slate-400">từ khó</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold">Cần lặp lại ngắt quãng SM-2</p>
                </div>

              </div>

              {/* SRS Practice Alert Banner */}
              {reviewItems.length > 0 && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 border border-amber-500/30 text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 shrink-0">
                      <Sparkles className="w-6 h-6 fill-current animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-700 dark:text-amber-300 flex items-center gap-2">
                        <span>🔔 Thông Báo Ôn Luyện Từ Vựng SRS Khoa Học</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono font-bold">{reviewItems.length} từ đến hạn</span>
                      </h3>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
                        Hệ thống ghi nhận bạn có {reviewItems.length} từ khó cần lặp lại hôm nay. Hãy dành 3 phút ôn bài trước khi làm bài tập chính nhé!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playPop();
                      setActiveListId('srs-review-pool');
                      setPracticingAssignedId('srs-review-pool');
                    }}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>⚡ Ôn Tập Từ Khó Ngay</span>
                  </button>
                </div>
              )}

              {/* Main Title Section for Assigned Homework */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 rounded-2xl">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      Danh Sách Bài Được Giao Cho {user?.displayName || 'Bé Phúc Trí'}
                    </h2>
                    <p className="text-xs font-bold text-slate-500">
                      Danh sách bài luyện nghe & viết được giáo viên phân công riêng cho bé
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>{assignedLists.length} Bài Đã Giao</span>
                </div>
              </div>

              {/* Assigned Lesson Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedLists.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-slate-400 font-bold text-xs space-y-2">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300">Hiện tại bạn chưa có bài tập được giao riêng.</p>
                    <p className="text-xs">Hãy chọn các bài trong kho giáo trình chính để bắt đầu luyện tập tự do nhé!</p>
                  </div>
                ) : (
                  assignedLists.map(list => {
                    const tag = list.tag || (list.id.includes('langmaster') ? '3000words' : list.id.includes('counting-star') ? 'music' : list.id.includes('phonics') ? 'phonics' : 'curriculum');

                    return (
                      <div key={list.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-cyan-500/30 shadow-xl space-y-4 hover:border-cyan-500 transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                              Bài Được Giao
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {tag === '3000words' ? '3000 Words' : tag === 'music' ? 'Bài Hát' : tag === 'phonics' ? 'Phonics' : 'Giáo Trình'}
                            </span>
                          </div>

                          <h3 className="font-black text-lg text-slate-900 dark:text-white leading-snug">
                            {list.name}
                          </h3>

                          <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                            <span>{list.items?.length || 0} câu / từ vựng cần hoàn thành</span>
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            soundEffects.playPop();
                            setActiveListId(list.id);
                            setPracticingAssignedId(list.id);
                          }}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Bắt Đầu Luyện Tập Ngay</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}
        </>
      )}

      {/* 4. REPORTS TAB (Parent / Teacher / Admin View) */}
      {activeTab === 'reports' && (
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
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
