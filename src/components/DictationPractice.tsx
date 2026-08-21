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
  const { lists, categories, activeListId, setActiveListId, dialect, gradeItem, reviewItems } = usePractice();
  const { user } = useAuth();

  // Search & Filter State in Aside Left
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

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
  const [imgError, setImgError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = practiceItems[currentIndex] || { text: 'Welcome', vi: 'Chào mừng' };

  // Reset imgError when current item changes
  useEffect(() => {
    setImgError(false);
  }, [currentIndex, currentItem.id, currentItem.imageUrl]);

  // Filtered Lists Logic
  const filteredLists = useMemo(() => {
    return lists.filter(l => {
      // 1. Search Query
      const query = searchQuery.trim().toLowerCase();
      const cleanName = l.name.replace(/^Langmaster:\s*/i, '').replace(/^3000 words:\s*/i, '');
      const matchesSearch = !query || cleanName.toLowerCase().includes(query) || (l.items && l.items.some(i => i.text.toLowerCase().includes(query) || (i.vi && i.vi.toLowerCase().includes(query))));

      // 2. Dynamic Category Filter
      if (!matchesSearch) return false;
      if (filterCategory !== 'all') {
        if (filterCategory === 'assigned') {
          return l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase());
        }
        return l.tag === filterCategory || (filterCategory === '3000words' && (l.id.includes('langmaster') || l.name.startsWith('3000 words:')));
      }

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
    if (!userInput.trim()) return;

    const target = currentItem.text.trim();
    const input = userInput.trim();
    const correct = target.toLowerCase() === input.toLowerCase();

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

      // Find longest matching prefix to avoid typing from scratch
      let matchLen = 0;
      while (
        matchLen < input.length &&
        matchLen < target.length &&
        input[matchLen].toLowerCase() === target[matchLen].toLowerCase()
      ) {
        matchLen++;
      }

      const correctPrefix = userInput.slice(0, matchLen);

      // Auto-hide wrong answer hint after 3 seconds, preserving the correct prefix!
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setShowWrongHint(false);
        setUserInput(correctPrefix); // Keep correct prefix intact!
        setIsAnswered(false); // Enable input to fix from error!
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
    <div className="w-full px-4 lg:px-8 py-6">
      {/* 3-COLUMN BALANCED FULLPAGE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ASIDE LEFT: Danh sách bài học & Tìm kiếm thông minh */}
        <aside className="lg:col-span-3 space-y-4 sticky top-20">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col max-h-[calc(100vh-110px)]">
            
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

            {/* Dynamic Category Filter Pills */}
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

              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.slug)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    filterCategory === c.slug
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}

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
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredLists.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800">
                  Không tìm thấy bài học phù hợp.
                </div>
              ) : (
                filteredLists.map(l => {
                  const isSelected = !isSrsMode && activeList?.id === l.id;
                  const isAssignedToMe = l.learner && user?.displayName && l.learner.toLowerCase().includes(user.displayName.toLowerCase());
                  const cleanName = l.name.replace(/^Langmaster:\s*/i, '').replace(/^3000 words:\s*/i, '');
                  const tag = l.tag || (l.id.includes('langmaster') ? '3000words' : l.id.includes('counting-star') ? 'music' : l.id.includes('phonics') ? 'phonics' : 'curriculum');

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
                          {cleanName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Tag Category Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            tag === '3000words' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                            tag === 'music' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' :
                            tag === 'phonics' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          }`}>
                            {tag === '3000words' ? '3000 Words' : tag === 'music' ? 'Bài hát' : tag === 'phonics' ? 'Phonics' : 'Giáo trình'}
                          </span>

                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {l.type === 'words' ? 'Từ vựng' : 'Mẫu câu'} ({l.items?.length || 0})
                          </span>
                          {isAssignedToMe && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 flex items-center gap-1">
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
        <main className="lg:col-span-6 space-y-3.5">
          
          {/* Top Bar Stats */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {isSrsMode ? '⭐ Ôn tập Kho SRS Tự Động' : activeList?.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[11px] font-black">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Chuỗi: {streak}</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[11px] font-black">
                <Trophy className="w-3.5 h-3.5" />
                <span>Thuộc: {completedCount}</span>
              </div>

              {reviewItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveListId('srs-review-pool');
                    setCurrentIndex(0);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-black text-[11px] shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Ôn Ngay ({reviewItems.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Flashcard Practice Area */}
          {practiceItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md">
              <BrainCircuit className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Chưa có bài tập trong danh sách này</h3>
              <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
                Hãy chọn bài tập khác ở thanh bên trái hoặc chọn Phiên Ôn Tập SM-2 bên phải!
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / practiceItems.length) * 100}%` }}
                />
              </div>

              {/* Audio Player & Controls */}
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <button
                  onClick={() => speakText(currentItem.text)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                >
                  <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 group-hover:animate-bounce" />
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => speakText(currentItem.text)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Phát lại âm thanh</span>
                  </button>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  <select
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="text-[11px] font-bold text-slate-500 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value={1.0}>1.0x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={0.5}>0.5x</option>
                  </select>
                </div>

                {/* EXPANDED FULL-WIDTH VIETNAMESE MEANING TEXTBOX & IPA & IMAGE */}
                <div className="w-full max-w-xl mx-auto space-y-2.5">
                  {/* Image Illustration if available and valid */}
                  {currentItem.imageUrl && !imgError && (
                    <div className="w-full max-h-32 sm:max-h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                      <img 
                        src={currentItem.imageUrl} 
                        alt={currentItem.text} 
                        className="w-full h-full object-cover" 
                        onError={() => setImgError(true)}
                      />
                    </div>
                  )}

                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 border border-amber-500/20 dark:border-amber-500/30 text-center shadow-xs space-y-0.5">
                    <div className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      Nghĩa Tiếng Việt & Phiên Âm
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2 flex-wrap">
                      <span>{currentItem.vi || 'Chưa có bản dịch'}</span>
                      {currentItem.ipa && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                          {currentItem.ipa.startsWith('/') ? currentItem.ipa : `/${currentItem.ipa}/`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note / Hint Tip Box */}
                  {currentItem.note && (
                    <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-[11px] font-bold text-blue-700 dark:text-blue-300 text-center flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Ghi chú: {currentItem.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* INTERACTIVE WORD & LETTER SLOT GUIDE (_ _ _  _ _ _ _ _  _ _ _) */}
              <div className="w-full max-w-xl mx-auto p-3 bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                {/* Letter Slots */}
                <div className="flex flex-wrap items-center justify-center gap-y-1.5 gap-x-3 py-0.5">
                  {currentItem.text.split(' ').map((word, wordIdx, wordArr) => {
                    let wordStartCharIdx = 0;
                    for (let w = 0; w < wordIdx; w++) {
                      wordStartCharIdx += wordArr[w].length + 1;
                    }

                    return (
                      <div key={wordIdx} className="flex items-center gap-1">
                        {word.split('').map((char, charIdx) => {
                          const globalIdx = wordStartCharIdx + charIdx;
                          const isTyped = globalIdx < userInput.length;
                          const userChar = userInput[globalIdx];
                          const isMatch = isTyped && userChar && userChar.toLowerCase() === char.toLowerCase();
                          const isError = isTyped && !isMatch;

                          return (
                            <div
                              key={charIdx}
                              className={`w-6 h-8 sm:w-7 sm:h-9 rounded-lg flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all shadow-xs ${
                                isMatch
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 ring-1 ring-emerald-400'
                                  : isError
                                  ? 'bg-rose-500 text-white ring-2 ring-rose-400 animate-pulse'
                                  : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                              }`}
                            >
                              {isTyped ? (userChar || char) : '_'}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* EXPANDED SPELLING INPUT FORM & WRONG ANSWER FEEDBACK */}
              <form onSubmit={handleSubmitSpelling} className="w-full max-w-xl mx-auto space-y-3">
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
                        ? "Sửa lại vị trí bị sai..."
                        : "Nhập lại chính tả tiếng Anh bạn nghe được..."
                    }
                    className={`w-full px-4 py-3 text-center text-base sm:text-lg font-black rounded-2xl border-2 transition-all focus:outline-none ${
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
        <aside className="lg:col-span-3 space-y-4 sticky top-20">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col max-h-[calc(100vh-110px)]">
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

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
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
