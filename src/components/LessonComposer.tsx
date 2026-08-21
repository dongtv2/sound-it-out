import React, { useState } from 'react';
import { usePractice } from '@/context/PracticeContext';
import { useAuth } from '@/context/AuthContext';
import { soundEffects } from '@/services/sound-effects';
import type { PracticeList, PracticeItem, PracticeItemType } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Sparkles, 
  BookOpen, 
  Languages, 
  UserCheck, 
  Layers, 
  CheckCircle2, 
  Wand2 
} from 'lucide-react';

export const LessonComposer: React.FC = () => {
  const { lists, addList, updateList, deleteList, translateTextMyMemory, splitTextToPhrases } = usePractice();
  const { user, familyUsers } = useAuth();

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [listName, setListName] = useState('');
  const [listType, setListType] = useState<PracticeItemType>('words');
  const [listTag, setListTag] = useState<string>('curriculum');
  const [assignLearner, setAssignLearner] = useState('Bé Phúc Trí');
  const [rawText, setRawText] = useState('');
  const [stagedItems, setStagedItems] = useState<PracticeItem[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const startCreateNew = () => {
    soundEffects.playPop();
    setEditingListId(null);
    setListName('');
    setListType('words');
    setListTag('curriculum');
    setAssignLearner('Bé Phúc Trí');
    setRawText('');
    setStagedItems([]);
  };

  const startEditList = (list: PracticeList) => {
    soundEffects.playPop();
    setEditingListId(list.id);
    setListName(list.name);
    setListType(list.type);
    setListTag(list.tag || 'curriculum');
    setAssignLearner(list.learner || '');
    setStagedItems(list.items || []);
    setRawText('');
  };

  const handleParseAndTranslate = async () => {
    if (!rawText.trim()) return;
    soundEffects.playPop();
    setIsTranslating(true);

    try {
      const phrases = splitTextToPhrases(rawText, listType);
      const parsed: PracticeItem[] = [];

      for (let i = 0; i < phrases.length; i++) {
        const p = phrases[i];
        const vi = await translateTextMyMemory(p);
        parsed.push({
          id: `item-${Date.now()}-${i}`,
          text: p,
          vi: vi || p
        });
      }
      setStagedItems(prev => [...prev, ...parsed]);
      setRawText('');
      soundEffects.playCorrect();
    } catch (e) {
      console.warn('Lỗi phân tích văn bản:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAddManualItem = () => {
    soundEffects.playPop();
    setStagedItems(prev => [
      ...prev,
      { id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, text: '', vi: '' }
    ]);
  };

  const handleUpdateStagedItem = (index: number, key: 'text' | 'vi', val: string) => {
    setStagedItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  const handleRemoveStagedItem = (index: number) => {
    soundEffects.playPop();
    setStagedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;
    if (stagedItems.length === 0) return;

    soundEffects.playPop();
    const validItems = stagedItems.filter(i => i.text.trim().length > 0);

    const listPayload: PracticeList = {
      id: editingListId || `list-${Date.now()}`,
      name: listName.trim(),
      type: listType,
      tag: listTag,
      learner: assignLearner.trim(),
      by: user?.displayName || 'teacher',
      items: validItems,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (editingListId) {
      await updateList(listPayload);
      setSuccessMessage('Đã cập nhật bài học thành công!');
    } else {
      await addList(listPayload);
      setSuccessMessage('Đã tạo bài học mới và lưu vào CSDL SQLite!');
    }

    soundEffects.playSuccess();
    soundEffects.triggerConfetti();

    setTimeout(() => {
      setSuccessMessage(null);
      startCreateNew();
    }, 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Trình Soạn & Giao Bài Học</span>
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              Soạn bài học mới, tự động tách văn bản & dịch nghĩa, giao bài trực tiếp cho học sinh
            </p>
          </div>
        </div>

        <button
          onClick={startCreateNew}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Bài Học Mới</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/50 rounded-2xl text-sm font-black text-emerald-600 dark:text-emerald-300 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List Catalog & Edit Select */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Danh Mục Bài Học ({lists.length})</span>
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {lists.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-bold">
                  Chưa có bài học nào. Hãy khởi tạo bài đầu tiên!
                </div>
              ) : (
                lists.map(list => (
                  <div
                    key={list.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      editingListId === list.id
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {list.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {list.type === 'words' ? 'Từ vựng' : 'Mẫu câu'}
                          </span>
                          {list.learner && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                              Giao: {list.learner}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditList(list)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Sửa bài"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteList(list.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Xóa bài"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>{list.items.length} phần từ/câu</span>
                      <span>Tác giả: {list.by}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Editor Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveList} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" />
                <span>{editingListId ? 'Chỉnh Sửa Bài Học' : 'Soạn Bài Học Mới'}</span>
              </h2>
              {editingListId && (
                <button
                  type="button"
                  onClick={startCreateNew}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Hủy sửa
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Tên bài học</label>
                <input
                  type="text"
                  required
                  value={listName}
                  onChange={e => setListName(e.target.value)}
                  placeholder="Ví dụ: Unit 1: Hobbies"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Loại nội dung</label>
                <select
                  value={listType}
                  onChange={e => setListType(e.target.value as PracticeItemType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="words">Từ vựng (Words & Phonics)</option>
                  <option value="sentences">Mẫu câu (Sentences)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Phân loại bài học (Category Tag)</label>
                <select
                  value={listTag}
                  onChange={e => setListTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="curriculum">📚 Chương trình học chính (Curriculum)</option>
                  <option value="3000words">📖 Bộ từ 3000 từ vựng (3000 Words)</option>
                  <option value="music">🎵 Âm nhạc & Bài hát (Music & Songs)</option>
                  <option value="phonics">🔤 Ngữ âm (Phonics & Sounds)</option>
                  <option value="general">⚙️ Khác (General)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-cyan-500" />
                    <span>Giao bài cho học sinh cụ thể (Lấy từ CSDL SQLite)</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    ({familyUsers.length} tài khoản trong DB)
                  </span>
                </label>
                <select
                  value={assignLearner}
                  onChange={e => setAssignLearner(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">-- Tất cả học sinh (Để trống cho tất cả mọi người) --</option>
                  {familyUsers.map(u => (
                    <option key={u.uid} value={u.displayName}>
                      {u.displayName} ({u.email} - {u.role === 'student' ? 'Học sinh' : u.role === 'teacher' ? 'Giáo viên' : 'Admin'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Smart NLP & Batch Paste Section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-emerald-500" />
                <span>Nhập nhanh văn bản (Tự động tách câu & dịch MyMemory)</span>
              </label>
              <textarea
                rows={3}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={listType === 'words' ? "Dán danh sách từ phân tách bằng dấu phẩy hoặc xuống dòng:\nhobby, collecting stamps, gardening" : "Dán đoạn văn tiếng Anh:\nWhat is your favorite hobby? I enjoy reading books."}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleParseAndTranslate}
                disabled={isTranslating || !rawText.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-slate-800 transition-colors"
              >
                <Languages className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>{isTranslating ? 'Đang phân tích & dịch...' : 'Tách Văn Bản & Dịch Tự Động'}</span>
              </button>
            </div>

            {/* Staged Dictation Items Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Danh sách từ / câu ({stagedItems.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddManualItem}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm ô thủ công</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {stagedItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">{idx + 1}</span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={e => handleUpdateStagedItem(idx, 'text', e.target.value)}
                      placeholder="Tiếng Anh (ví dụ: hobby)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={item.vi || ''}
                      onChange={e => handleUpdateStagedItem(idx, 'vi', e.target.value)}
                      placeholder="Tiếng Việt (ví dụ: sở thích)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStagedItem(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={stagedItems.length === 0 || !listName.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{editingListId ? 'Lưu Cập Nhật Bài Học' : 'Lưu Bài Học Vào SQLite DB'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonComposer;
