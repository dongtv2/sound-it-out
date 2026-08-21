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
  CheckCircle2, 
  Wand2,
  Tag,
  Image as ImageIcon,
  FileText,
  Volume2
} from 'lucide-react';

export const LessonComposer: React.FC = () => {
  const { 
    lists, 
    categories, 
    addList, 
    updateList, 
    deleteList, 
    addCategory, 
    deleteCategory, 
    translateTextMyMemory, 
    splitTextToPhrases 
  } = usePractice();
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

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('emerald');

  const startCreateNew = () => {
    soundEffects.playPop();
    setEditingListId(null);
    setListName('');
    setListType('words');
    setListTag(categories[0]?.slug || 'curriculum');
    setAssignLearner('Bé Phúc Trí');
    setRawText('');
    setStagedItems([]);
  };

  const startEditList = (list: PracticeList) => {
    soundEffects.playPop();
    setEditingListId(list.id);
    setListName(list.name);
    setListType(list.type);
    setListTag(list.tag || categories[0]?.slug || 'curriculum');
    setAssignLearner(list.learner || '');
    setStagedItems(list.items || []);
    setRawText('');
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    soundEffects.playPop();

    const slug = newCatName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    await addCategory({
      name: newCatName.trim(),
      slug,
      color: newCatColor,
      icon: 'tag'
    });

    setNewCatName('');
    setIsCatModalOpen(false);
    setListTag(slug);
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
          vi: vi || p,
          ipa: '',
          imageUrl: '',
          note: ''
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
      { 
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, 
        text: '', 
        vi: '', 
        ipa: '', 
        imageUrl: '', 
        note: '' 
      }
    ]);
  };

  const handleUpdateStagedItem = (index: number, key: keyof PracticeItem, val: string) => {
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
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span>Quản Lý Phân Loại</span>
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs">✕</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-slate-400">Danh mục trong SQLite:</div>
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{c.name} ({c.slug})</span>
                  {c.id !== 'cat-general' && (
                    <button onClick={() => deleteCategory(c.id)} className="text-slate-400 hover:text-rose-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                required
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Tên phân loại mới..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">Hủy</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black">Tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Kho Bài Học ({lists.length})</span>
              </h2>
              <button onClick={startCreateNew} className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Mới</span>
              </button>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {lists.map(l => (
                <div key={l.id} className={`p-3 rounded-2xl border ${editingListId === l.id ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{l.name}</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditList(l)} className="p-1.5 text-slate-400 hover:text-emerald-500"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteList(l.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveList} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Tên bài học</label>
                <input type="text" required value={listName} onChange={e => setListName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Loại nội dung</label>
                <select value={listType} onChange={e => setListType(e.target.value as PracticeItemType)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold">
                  <option value="words">Từ vựng</option>
                  <option value="sentences">Mẫu câu</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300">Phân loại</label>
                  <button type="button" onClick={() => setIsCatModalOpen(true)} className="text-[11px] font-bold text-emerald-600 underline">+ Quản lý</button>
                </div>
                <select value={listTag} onChange={e => setListTag(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold">
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <textarea rows={3} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="Nhập danh sách từ/câu..." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono" />
              <button type="button" onClick={handleParseAndTranslate} disabled={isTranslating} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2">
                <Languages className="w-4 h-4" /> {isTranslating ? 'Đang dịch...' : 'Tách & Dịch'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase">Danh sách ({stagedItems.length})</h3>
                <button type="button" onClick={handleAddManualItem} className="text-xs font-bold text-emerald-600 underline">Thêm thủ công</button>
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {stagedItems.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">{idx + 1}</span>
                      <input type="text" value={item.text} onChange={e => handleUpdateStagedItem(idx, 'text', e.target.value)} placeholder="Tiếng Anh" className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-xs font-bold" />
                      <input type="text" value={item.vi} onChange={e => handleUpdateStagedItem(idx, 'vi', e.target.value)} placeholder="Tiếng Việt" className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-xs font-bold" />
                      <button type="button" onClick={() => handleRemoveStagedItem(idx)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-8">
                      <div className="relative flex items-center">
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                        <input type="text" value={item.ipa || ''} onChange={e => handleUpdateStagedItem(idx, 'ipa', e.target.value)} placeholder="IPA" className="w-full pl-8 pr-2 py-1 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-[11px]" />
                      </div>
                      <div className="relative flex items-center">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                        <input type="text" value={item.imageUrl || ''} onChange={e => handleUpdateStagedItem(idx, 'imageUrl', e.target.value)} placeholder="Link Hình" className="w-full pl-8 pr-2 py-1 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-[11px]" />
                      </div>
                      <div className="relative flex items-center">
                        <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                        <input type="text" value={item.note || ''} onChange={e => handleUpdateStagedItem(idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full pl-8 pr-2 py-1 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-[11px]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button type="submit" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center gap-2">
                <Save className="w-4 h-4" /> <span>{editingListId ? 'Cập Nhật' : 'Lưu Vào SQLite'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonComposer;
