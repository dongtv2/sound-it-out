import React, { useState, useEffect, useRef } from 'react';
import { usePractice } from '@/context/PracticeContext';
import { soundEffects } from '@/services/sound-effects';
import type { PracticeItem, SrsGrade } from '@/types';
import { 
  Volume2, 
  RotateCcw, 
  Check, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  Flame, 
  Trophy, 
  ListMusic, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  ArrowRight 
} from 'lucide-react';

export const DictationPractice: React.FC = () => {
  const { lists, activeListId, setActiveListId, dialect, gradeItem, reviewItems } = usePractice();

  // Find active list or fallback to SRS Review Pool mode
  const isSrsMode = activeListId === 'srs-review-pool';
  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  const practiceItems: PracticeItem[] = isSrsMode 
    ? reviewItems.map(r => ({ id: r.id, text: r.text, vi: r.vi }))
    : (activeList?.items || []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentItem = practiceItems[currentIndex] || { text: 'Welcome', vi: 'Chào mừng' };

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
    setShowHint(false);
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
    } else {
      soundEffects.playError();
      setStreak(0);
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

  const nextItem = () => {
    soundEffects.playPop();
    if (currentIndex < practiceItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      soundEffects.triggerConfetti();
      setCurrentIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Stats & Deck Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <select
              value={activeListId || ''}
              onChange={e => {
                soundEffects.playPop();
                setActiveListId(e.target.value);
                setCurrentIndex(0);
              }}
              className="bg-transparent text-sm font-black text-slate-900 dark:text-white border-none focus:outline-none cursor-pointer pr-2"
            >
              {lists.map(l => (
                <option key={l.id} value={l.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {l.name} ({l.items.length} phần)
                </option>
              ))}
              <option value="srs-review-pool" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold">
                ⭐ Kho Từ Cần Ôn Tập SRS ({reviewItems.length} từ)
              </option>
            </select>
            <div className="text-xs font-bold text-slate-500">
              {isSrsMode ? 'Thuật toán Spaced Repetition SM-2' : `Loại: ${activeList?.type === 'words' ? 'Từ vựng' : 'Mẫu câu'}`}
            </div>
          </div>
        </div>

        {/* Streak & Mastery Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-black">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Chuỗi: {streak}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-black">
            <Trophy className="w-4 h-4" />
            <span>Đã thuộc: {completedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Dictation Flashcard Card */}
      {practiceItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <BrainCircuit className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Chưa có dữ liệu bài học</h3>
          <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto">
            Vui lòng chuyển sang tab "Soạn & Giao Bài" để thêm từ vựng hoặc bài học đầu tiên!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
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

              {/* Speed Toggle */}
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

            {/* Hint & Vietnamese Meaning */}
            <div className="pt-2">
              {showHint ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs font-bold text-amber-700 dark:text-amber-300 animate-in fade-in duration-150">
                  💡 Nghĩa: <b>{currentItem.vi || 'Không có bản dịch'}</b>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Gợi ý nghĩa Tiếng Việt</span>
                </button>
              )}
            </div>
          </div>

          {/* Spelling Input Form */}
          <form onSubmit={handleSubmitSpelling} className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                disabled={isAnswered}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Nhập lại chính tả từ/câu bạn nghe được..."
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
                {/* Result Feedback Banner */}
                <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}>
                  {isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
                  <div>
                    <div className="font-black text-sm">
                      {isCorrect ? 'Chính xác! Bạn làm rất tốt!' : `Chưa chính xác. Đáp án đúng: "${currentItem.text}"`}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      Nghĩa Tiếng Việt: {currentItem.vi}
                    </div>
                  </div>
                </div>

                {/* Spaced Repetition Grading Buttons */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider">
                    Đánh giá mức độ thuộc (Spaced Repetition SM-2)
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleSrsGrade('again')}
                      className="py-2.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Chưa thuộc (Again)
                    </button>
                    <button
                      onClick={() => handleSrsGrade('hard')}
                      className="py-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Hơi khó (Hard)
                    </button>
                    <button
                      onClick={() => handleSrsGrade('good')}
                      className="py-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Khá tốt (Good)
                    </button>
                    <button
                      onClick={() => handleSrsGrade('easy')}
                      className="py-2.5 rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Rất dễ (Easy)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default DictationPractice;
