import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePractice } from '@/context/PracticeContext';
import { useAuth } from '@/context/AuthContext';
import { soundEffects } from '@/services/sound-effects';
import type { PracticeItem, SrsGrade } from '@/types';
import { 
  Volume2, 
  RotateCcw, 
  Flame, 
  Trophy, 
  ListMusic, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  BookOpen,
  Sparkles,
  UserCheck,
  Clock,
  EyeOff,
  Search,
  X,
  Filter,
  Zap,
  Check
} from 'lucide-react';

export const DictationPractice: React.FC = () => {
  const { lists, activeListId, setActiveListId, dialect, gradeItem, reviewItems } = usePractice();
  const { user } = useAuth();

  // Search & Filter State in Aside Left
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | '3000' | 'sentences' | 'assigned'>('all');

  // Find active list or fallback to SRS Review Pool mode
  const isSrsMode = activeListId === 'srs-review-pool';
  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  const practiceItems: PracticeItem[] = isSrsMode 
    ? reviewItems.map(r => ({ id: r.id, text: r.text, vi: r.vi }))
    : (activeList?.items || []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showWrongHint, setShowWrongHint] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const inputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = practiceItems[currentIndex] || { text: 'Welcome', vi: 'Chào mừng' };

  // Filtered Lists Logic
  const filteredLists = useMemo(() => {
    return lists.filter(l => {
      // 1. Search Query
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || l.name.toLowerCase().includes(query) || (l.items && l.items.some(i => i.text.toLowerCase().includes(query) || (i.vi && i.vi.toLowerCase().includes(query))));

      // 2. Category Filter
      if (!matchesSearch) return false;
      if (filterCategory === '3000') return l.name.startsWith('3000 words:');
      if (filterCategory === 'sentences') return l.type === 'sentences';
      if (filterCategory === 'assigned') return l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase());
      
      return true;
    });
  }, [lists, searchQuery, filterCategory, user]);

  // Web Speech API Audio Player
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    utterance.lang = dialect === 'uk' ? 'en-GB' : 'en-US';

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowWrongHint(false);
    setIsRetrying(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    if (currentItem?.text) {
      speakText(currentItem.text);
    }
  }, [currentIndex, activeListId]);

  const handleSubmitSpelling = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !userInput.trim()) return;

    const target = currentItem.text.trim().toLowerCase();
    const input = userInput.trim().toLowerCase();
    const correct = target === input;

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      soundEffects.playCorrect();
      setStreak(prev => prev + 1);
      setCompletedCount(prev => prev + 1);
      setShowWrongHint(false);
    } else {
      soundEffects.playError();
      setStreak(0);
      setShowWrongHint(true);

      // Auto-hide wrong answer hint after 3 seconds to prompt recall memory!
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setShowWrongHint(false);
        setUserInput('');
        setIsAnswered(false); // Enable input for re-typing from memory!
        setIsRetrying(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 3000);
    }
  };

  const handleSrsGrade = (grade: SrsGrade) => {
    soundEffects.playPop();
    gradeItem(currentItem, grade, activeList?.type || 'words');

    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      soundEffects.triggerConfetti();
      setCurrentIndex(0);
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 lg:px-8 py-6">
      {/* 3-COLUMN BALANCED LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ASIDE LEFT: Danh sách bài học & Tìm kiếm thông minh */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-emerald-500" />
                  <span>Danh Sách Bài Học</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {filteredLists.length}/{lists.length}
                </span>
              </h2>
            </div>

            {/* Smart Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm chủ đề, từ vựng..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Tất cả ({lists.length})
              </button>
              <button
                onClick={() => setFilterCategory('3000')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  filterCategory === '3000'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                3000 Words
              </button>
              <button
                onClick={() => setFilterCategory('sentences')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  filterCategory === 'sentences'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Mẫu câu
              </button>
              {user?.displayName && (
                <button
                  onClick={() => setFilterCategory('assigned')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    filterCategory === 'assigned'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Giao bạn
                </button>
              )}
            </div>

            {/* Scrollable Lesson List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredLists.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800">
                  Không tìm thấy bài học phù hợp.
                </div>
              ) : (
                filteredLists.map(l => {
                  const isSelected = !isSrsMode && activeList?.id === l.id;
                  const isAssignedToMe = l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase());

                  return (
                    <div
                      key={l.id}
                      onClick={() => {
                        soundEffects.playPop();
                        setActiveListId(l.id);
                        setCurrentIndex(0);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 shadow-md ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {l.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {l.type === 'words' ? 'Từ vựng' : 'Mẫu câu'} ({l.items?.length || 0})
                          </span>
                          {isAssignedToMe && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              <span>Giao bạn</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* CENTER MAIN WORKSPACE */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* TOP AUTOMATED SM-2 SMART REVIEW BANNER */}
          {reviewItems.length > 0 && (
            <div 
              onClick={() => {
                soundEffects.playPop();
                setActiveListId('srs-review-pool');
                setCurrentIndex(0);
              }}
              className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 p-4 rounded-3xl text-white shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Zap className="w-6 h-6 text-amber-200 animate-pulse" />
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-wider text-amber-100 flex items-center gap-2">
                    <span>🔥 Ôn Tập Thông Minh SM-2 Tự Động</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/30 text-white text-[10px]">Auto Queue</span>
                  </div>
                  <div className="text-xs font-bold text-white/90 mt-0.5">
                    Hệ thống đã tự động gom {reviewItems.length} từ cần ôn hôm nay cho bạn!
                  </div>
                </div>
              </div>

              <button className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs shadow-md group-hover:bg-amber-100 transition-colors flex items-center gap-1.5 shrink-0">
                <span>Ôn Ngay ({reviewItems.length})</span>
              </button>
            </div>
          )}

          {/* Top Bar Stats */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                {isSrsMode ? '⭐ Ôn tập Kho SRS Tự Động' : activeList?.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-black">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>Chuỗi: {streak}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                <Trophy className="w-4 h-4" />
                <span>Thuộc: {completedCount}</span>
              </div>
            </div>
          </div>

          {/* Flashcard Practice Area */}
          {practiceItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
              <BrainCircuit className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Chưa có bài tập trong danh sách này</h3>
              <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
                Hãy chọn bài tập khác ở thanh bên trái hoặc chọn Phiên Ôn Tập SM-2 bên phải!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / practiceItems.length) * 100}%` }}
                />
              </div>

              {/* Audio Player & Controls */}
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <button
                  onClick={() => speakText(currentItem.text)}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                >
                  <Volume2 className="w-10 h-10 group-hover:animate-bounce" />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => speakText(currentItem.text)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Phát lại âm thanh</span>
                  </button>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  <select
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="text-xs font-bold text-slate-500 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value={1.0}>Tốc độ 1.0x</option>
                    <option value={0.75}>Chậm 0.75x</option>
                    <option value={0.5}>Rất chậm 0.5x</option>
                  </select>
                </div>

                {/* EXPANDED FULL-WIDTH VIETNAMESE MEANING TEXTBOX */}
                <div className="w-full max-w-xl mx-auto p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl text-center shadow-xs">
                  <div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider mb-0.5">
                    Nghĩa Tiếng Việt
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {currentItem.vi || 'Chưa có bản dịch'}
                  </div>
                </div>
              </div>

              {/* EXPANDED SPELLING INPUT FORM & WRONG ANSWER FEEDBACK */}
              <form onSubmit={handleSubmitSpelling} className="w-full max-w-xl mx-auto space-y-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    disabled={isAnswered && isCorrect}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder={
                      isRetrying
                        ? "Gõ lại từ/câu bạn vừa nhớ từ gợi ý..."
                        : "Nhập lại chính tả tiếng Anh bạn nghe được..."
                    }
                    className={`w-full px-5 py-4 text-center text-lg font-black rounded-2xl border-2 transition-all focus:outline-none ${
                      isAnswered
                        ? isCorrect
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100'
                          : 'border-rose-500 bg-rose-50/50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-100'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500'
                    }`}
                  />
                </div>

                {!isAnswered ? (
                  <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    Kiểm Tra Đáp Án
                  </button>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* CORRECT FEEDBACK BANNER */}
                    {isCorrect && (
                      <div className="p-4 rounded-2xl flex items-center gap-3 border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-6 h-6 shrink-0" />
                        <div>
                          <div className="font-black text-sm">Chính xác! Bạn làm rất tốt!</div>
                          <div className="text-xs opacity-80 mt-0.5">
                            Nghĩa Tiếng Việt: {currentItem.vi}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WRONG ANSWER HINT BANNER WITH 3-SECOND AUTO-HIDE & ANTI-COPY-PASTE PROTECTION */}
                    {!isCorrect && showWrongHint && (
                      <div className="w-full max-w-xl mx-auto p-4 rounded-2xl flex items-center gap-3 border bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-md animate-in fade-in zoom-in-95 duration-150">
                        <XCircle className="w-6 h-6 shrink-0 text-rose-500" />
                        
                        {/* ANTI-COPY-PASTE & UNSELECTABLE CONTAINER */}
                        <div 
                          className="flex-1 select-none pointer-events-none"
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onCopy={e => e.preventDefault()}
                          onCut={e => e.preventDefault()}
                          onContextMenu={e => e.preventDefault()}
                        >
                          <div className="font-black text-sm">
                            Chưa chính xác. Đáp án đúng: <span className="font-mono font-black underline tracking-wide">"{currentItem.text}"</span>
                          </div>
                          <div className="text-xs font-bold opacity-80 mt-0.5 flex items-center gap-1">
                            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                            <span>Gợi ý sẽ tự động ẩn sau 3 giây để bạn nhớ lại & gõ lại!</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SRS SM-2 GRADING BUTTONS WHEN CORRECT */}
                    {isCorrect && (
                      <div className="space-y-2">
                        <div className="text-xs font-black text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider">
                          Đánh giá mức độ thuộc (Spaced Repetition SM-2)
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSrsGrade('again')}
                            className="py-2.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            Chưa thuộc (Again)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSrsGrade('hard')}
                            className="py-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            Hơi khó (Hard)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSrsGrade('good')}
                            className="py-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            Khá tốt (Good)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSrsGrade('easy')}
                            className="py-2.5 rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            Rất dễ (Easy)
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </form>
            </div>
          )}
        </main>

        {/* ASIDE RIGHT: ⭐ Kho Từ Cần Ôn Tập SRS & Nút Ôn Tập Tự Động */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Kho Từ Ôn Tập SM-2</span>
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                Tự động tổng hợp từ tất cả các bài học
              </p>
            </div>

            {/* Smart Auto-Queue Trigger Button */}
            <div
              onClick={() => {
                soundEffects.playPop();
                setActiveListId('srs-review-pool');
                setCurrentIndex(0);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSrsMode
                  ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/40 shadow-md ring-1 ring-amber-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-400 bg-slate-50/50 dark:bg-slate-950/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <div>
                    <h3 className="font-black text-xs text-slate-900 dark:text-white">⭐ Nút Ôn Tập Tự Động</h3>
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Gom toàn bộ từ đến hạn</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                  {reviewItems.length} từ
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {reviewItems.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800">
                  Kho SRS đang trống. Chấm điểm bài tập để tự động lưu từ khó!
                </div>
              ) : (
                reviewItems.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">{item.text}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Lặp: {item.repetitions || 0}</span>
                      </span>
                    </div>
                    {item.vi && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {item.vi}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default DictationPractice;
