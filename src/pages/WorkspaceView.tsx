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
  GraduationCap,
  Globe,
  AlertTriangle,
  TrendingUp,
  Medal,
  Users
} from 'lucide-react';

export const WorkspaceView: React.FC = () => {
  const { activeTab, lists, setActiveListId, studentReports, deleteStudentReport, reviewItems, setActiveTab } = usePractice();
  const { user, familyUsers } = useAuth();

  // State to track if student is in expanded practice mode within Assigned tab
  const [practicingAssignedId, setPracticingAssignedId] = useState<string | null>(null);

  // Sub-tab state for Reports (Leaderboard vs Individual Weakness)
  const [reportSubTab, setReportSubTab] = useState<'leaderboard' | 'individual'>('leaderboard');

  // Filter assigned homework for current student
  const assignedLists = lists.filter(l => 
    l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase())
  );

  // Calculate total items assigned
  const totalAssignedItems = assignedLists.reduce((sum, l) => sum + (l.items?.length || 0), 0);
  const activeAssignedList = lists.find(l => l.id === practicingAssignedId);

  // DYNAMIC REAL LEADERBOARD DATA (Aggregated strictly from real studentReports & reviewItems)
  const leaderboardData = React.useMemo(() => {
    const usersMap: Record<string, { displayName: string; role: string; count: number; correctCount: number; srsMastered: number }> = {};

    // 1. Add logged-in users from familyUsers
    if (familyUsers && familyUsers.length > 0) {
      familyUsers.forEach(u => {
        usersMap[u.displayName.toLowerCase()] = {
          displayName: u.displayName,
          role: u.role === 'student' ? 'Học sinh' : u.role === 'teacher' ? 'Giáo viên' : 'Thành viên gia đình',
          count: 0,
          correctCount: 0,
          srsMastered: 0
        };
      });
    }

    // Always include current logged-in user
    if (user?.displayName && !usersMap[user.displayName.toLowerCase()]) {
      usersMap[user.displayName.toLowerCase()] = {
        displayName: user.displayName,
        role: user.role === 'student' ? 'Học sinh' : 'Thành viên gia đình',
        count: 0,
        correctCount: 0,
        srsMastered: 0
      };
    }

    // 2. Aggregate real interaction metrics from studentReports
    studentReports.forEach(r => {
      const name = (r.studentName || user?.displayName || 'Bé Phúc Trí').trim();
      const key = name.toLowerCase();
      if (!usersMap[key]) {
        usersMap[key] = {
          displayName: name,
          role: 'Học sinh',
          count: 0,
          correctCount: 0,
          srsMastered: 0
        };
      }
      usersMap[key].count += 1;
      if (r.originalText.trim().toLowerCase() === r.correctedText.trim().toLowerCase()) {
        usersMap[key].correctCount += 1;
      }
    });

    // 3. Count mastered SRS review items for current active context
    const currentNameKey = (user?.displayName || 'Bé Phúc Trí').toLowerCase();
    if (usersMap[currentNameKey]) {
      const masteredCount = reviewItems.filter(r => (r.repetitions || 0) >= 2).length;
      usersMap[currentNameKey].srsMastered = masteredCount;
    }

    const list = Object.values(usersMap).sort((a, b) => {
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return b.count - a.count;
    });

    return list;
  }, [studentReports, familyUsers, user, reviewItems]);

  // Diagnostic Weakness Analysis (Group reports by originalText to identify misspellings)
  const weakWordsMap = React.useMemo(() => {
    const map: Record<string, { originalText: string; vi?: string; count: number; listName: string }> = {};
    studentReports.forEach(r => {
      const orig = r.originalText.trim();
      const isMismatch = r.originalText.trim().toLowerCase() !== r.correctedText.trim().toLowerCase();
      if (isMismatch) {
        if (!map[orig]) {
          map[orig] = { originalText: orig, vi: r.correctedVi, count: 0, listName: r.listName };
        }
        map[orig].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [studentReports]);

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

      {/* 4. REPORTS TAB (Parent / Teacher / Admin View: Báo Cáo Chung & Báo Cáo Riêng - Chẩn Đoán Điểm Yếu) */}
      {activeTab === 'reports' && (
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 rounded-2xl">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Báo Cáo Tiến Độ & Chẩn Đoán Điểm Yếu</h1>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Tương tác từ Khu Vực Học Chung & Bài Được Giao được tổng hợp để tìm ra điểm yếu giúp học sinh tiến bộ.
                </p>
              </div>
            </div>

            {/* Sub-tab switcher: Báo Cáo Chung & Bảng Xếp Hạng vs Báo Cáo Riêng & Điểm Yếu */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  setReportSubTab('leaderboard');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  reportSubTab === 'leaderboard'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Báo Cáo Chung & Bảng Xếp Hạng</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  setReportSubTab('individual');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  reportSubTab === 'individual'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Báo Cáo Riêng & Chẩn Đoán Điểm Yếu</span>
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: BÁO CÁO CHUNG & BẢNG XẾP HẠNG HĂNG HÁI */}
          {reportSubTab === 'leaderboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Leaderboard Card */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
                      <span>🏆 Bảng Xếp Hạng Hăng Hái Học Tập (Khu Vực Học Chung)</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      Xếp hạng các học sinh tích cực hoàn thành bài học và duy trì chuỗi học tập đều đặn.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {leaderboardData.length === 0 ? (
                    <div className="col-span-3 text-center py-8 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400 text-xs font-bold">
                      Chưa có dữ liệu làm bài. Học sinh làm bài đầu tiên sẽ xuất hiện trên bảng xếp hạng!
                    </div>
                  ) : (
                    leaderboardData.map((st, idx) => {
                      const isTop1 = idx === 0;
                      const isTop2 = idx === 1;
                      const isTop3 = idx === 2;

                      return (
                        <div
                          key={st.displayName + idx}
                          className={`p-5 rounded-3xl space-y-3 relative overflow-hidden ${
                            isTop1
                              ? 'bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-2 border-amber-400/60 shadow-lg'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-xs ${
                              isTop1 ? 'bg-amber-400 text-slate-950 shadow-md' :
                              isTop2 ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {isTop1 ? '🥇 Hạng 1 (Xuất Sắc)' : isTop2 ? '🥈 Hạng 2' : isTop3 ? '🥉 Hạng 3' : `Hạng ${idx + 1}`}
                            </span>
                            <Medal className={`w-5 h-5 ${isTop1 ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">
                              {st.displayName}
                            </h3>
                            <div className="text-xs font-bold text-slate-400">{st.role}</div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Đúng Chuẩn</div>
                              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{st.correctCount} Câu</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Lượt Làm</div>
                              <div className="text-sm font-black text-amber-600 dark:text-amber-400">{st.count} Lần</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SUB-TAB 2: BÁO CÁO RIÊNG & CHẨN ĐOÁN ĐIỂM YẾU */}
          {reportSubTab === 'individual' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Weakness Diagnostic Section */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      <span>🎯 Chẩn Đoán Điểm Yếu Cần Cải Thiện (Phát Âm & Chính Tả)</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      Danh sách các từ / cụm từ học sinh hay gõ sai nhất để giúp Phụ huynh & Giáo viên kịp thời giao bài bổ trợ.
                    </p>
                  </div>
                </div>

                {weakWordsMap.length === 0 ? (
                  <div className="text-center py-8 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <h3 className="font-black text-sm text-emerald-800 dark:text-emerald-300">Tuyệt Vời! Chưa Phát Hiện Điểm Yếu Nổi Bật</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Học sinh hoàn thành bài học với tỷ lệ chính xác rất cao.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weakWordsMap.slice(0, 5).map((w, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900 dark:text-white font-mono">{w.originalText}</span>
                            {w.vi && <span className="text-xs text-slate-500 font-bold">({w.vi})</span>}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                              ⚠️ Nhập sai {w.count} lần
                            </span>
                          </div>
                          <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                            Gợi ý: Cần thêm từ vựng này vào danh sách Bài Được Giao riêng cho học sinh.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Activity History */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Nhật Ký Chi Tiết Tất Cả Lần Làm Bài
                </h3>

                <div className="space-y-3">
                  {studentReports.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400 font-bold text-xs">
                      Chưa có dữ liệu làm bài. Học sinh luyện tập bài đầu tiên sẽ hiển thị kết quả tại đây!
                    </div>
                  ) : (
                    studentReports.map(report => (
                      <div key={report.id} className="bg-slate-50/60 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
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
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

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
