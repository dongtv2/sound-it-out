import React, { useState, useMemo } from 'react';
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
  Volume2,
  Search,
  X,
  ListMusic,
  UploadCloud
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
  // Sub-Tab state: 'text' (Nhập nhanh văn bản) vs 'images' (Upload/Drag Drop nhiều ảnh max 10)
  const [composerInputTab, setComposerInputTab] = useState<'text' | 'images'>('text');

  // Tab 2: Batch Upload Image State
  interface StagedImageUpload {
    id: string;
    file: File;
    previewUrl: string;
    suggestedText: string;
    vi: string;
    ipa: string;
  }

  const [uploadedImages, setUploadedImages] = useState<StagedImageUpload[]>([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const handleImageFilesSelect = (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanText = rawName.replace(/[-_]/g, ' ').replace(/\d+/g, '').trim();

        setUploadedImages(prev => {
          if (prev.length >= 10) return prev;
          return [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              file,
              previewUrl: dataUrl,
              suggestedText: cleanText || 'word',
              vi: '',
              ipa: ''
            }
          ];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveUploadedImage = (id: string) => {
    soundEffects.playPop();
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUpdateUploadedImageText = (id: string, newText: string) => {
    setUploadedImages(prev => prev.map(img => img.id === id ? { ...img, suggestedText: newText } : img));
  };

  const handleBatchProcessImages = async () => {
    if (uploadedImages.length === 0) return;
    soundEffects.playPop();
    setIsProcessingImages(true);

    try {
      const newItems: PracticeItem[] = [];

      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        const text = img.suggestedText.trim();
        if (!text) continue;

        const vi = await translateTextMyMemory(text);

        newItems.push({
          id: `item-${Date.now()}-${i}`,
          text: text,
          vi: vi || img.vi || text,
          ipa: img.ipa || '',
          imageUrl: img.previewUrl,
          note: `Từ ảnh: ${img.file.name}`
        });
      }

      setStagedItems(prev => [...prev, ...newItems]);
      setUploadedImages([]);
      soundEffects.playCorrect();
    } catch (err) {
      console.warn('Lỗi xử lý ảnh:', err);
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Search & Filter state for Aside Left (Kho bài học)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Category Tag Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('emerald');

  // Filtered lists logic for Aside Left
  const filteredLists = useMemo(() => {
    return lists.filter(l => {
      const query = searchQuery.trim().toLowerCase();
      const cleanName = l.name.replace(/^Langmaster:\s*/i, '').replace(/^3000 words:\s*/i, '');
      const matchesSearch = !query || cleanName.toLowerCase().includes(query) || (l.items && l.items.some(i => i.text.toLowerCase().includes(query) || (i.vi && i.vi.toLowerCase().includes(query))));

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
      const updatedItem = { ...next[index], [key]: val };

      // Auto-extract IPA if user pastes or types "/.../" inside the VI translation input
      if (key === 'vi' && val) {
        const ipaMatch = val.match(/\s*\/([^\/]+)\/\s*/);
        if (ipaMatch) {
          updatedItem.ipa = `/${ipaMatch[1].trim()}/`;
          updatedItem.vi = val.replace(/\s*\/([^\/]+)\/\s*/, ' ').trim();
        }
      }

      next[index] = updatedItem;
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
      {/* SUCCESS NOTIFICATION */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {/* CATEGORY TAG MODAL */}
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
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black">Tạo Phân Loại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPOSER WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ASIDE LEFT: KHO BÀI HỌC VỚI BỘ LỌC VÀ TÌM KIẾM THÔNG MINH */}
        <aside className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col max-h-[calc(100vh-110px)]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>Kho Bài Học</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {filteredLists.length}/{lists.length}
                </span>
              </h2>
              <button 
                onClick={startCreateNew} 
                className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-xs hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mới</span>
              </button>
            </div>

            {/* Smart Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm chủ đề, từ vựng..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
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
            <div className="space-y-2 max-h-[calc(100vh-310px)] overflow-y-auto pr-1">
              {filteredLists.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-bold bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800">
                  Không tìm thấy bài học phù hợp.
                </div>
              ) : (
                filteredLists.map(l => {
                  const isEditing = editingListId === l.id;
                  const cleanName = l.name.replace(/^Langmaster:\s*/i, '').replace(/^3000 words:\s*/i, '');
                  const tag = l.tag || 'curriculum';

                  return (
                    <div 
                      key={l.id} 
                      className={`p-3 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {cleanName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {l.type === 'words' ? 'Từ vựng' : 'Mẫu câu'} ({l.items?.length || 0})
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {tag}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => startEditList(l)} 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Sửa bài"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xoá bài học "${cleanName}" khỏi CSDL?`)) {
                                deleteList(l.id);
                              }
                            }} 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                            title="Xoá bài"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* MAIN STAGE: EDITOR FORM WITH TABLE GRID FOR STAGED ITEMS */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveList} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>{editingListId ? 'Chỉnh Sửa Bài Học SQLite' : 'Soạn Bài Học Mới'}</span>
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

            {/* Form Top Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Tên bài học</label>
                <input 
                  type="text" 
                  required 
                  value={listName} 
                  onChange={e => setListName(e.target.value)} 
                  placeholder="Ví dụ: Unit 1: Hobbies"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">Loại nội dung</label>
                <select 
                  value={listType} 
                  onChange={e => setListType(e.target.value as PracticeItemType)} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="words">Từ vựng (Words & Phonics)</option>
                  <option value="sentences">Mẫu câu (Sentences)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300">Phân loại bài học (Category Tag)</label>
                  <button 
                    type="button" 
                    onClick={() => setIsCatModalOpen(true)} 
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    + Quản lý Phân loại
                  </button>
                </div>
                <select 
                  value={listTag} 
                  onChange={e => setListTag(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name} ({c.description || c.slug})</option>
                  ))}
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

            {/* SUB-TABS: TAB 1 (NHẬP VĂN BẢN) vs TAB 2 (UPLOAD RẤT NHIỀU ẢNH MAX 10) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              
              {/* Tab Selector Headers */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setComposerInputTab('text')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    composerInputTab === 'text'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>TAB 1: Nhập Nhanh Văn Bản (Tách câu & Dịch MyMemory)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setComposerInputTab('images')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    composerInputTab === 'images'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>TAB 2: Upload / Drag Drop Nhiều Ảnh (Tối đa 10 hình)</span>
                  {uploadedImages.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-amber-400 text-slate-950 rounded-full font-mono font-bold">
                      {uploadedImages.length}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: TEXT PASTE & AUTO PARSE */}
              {composerInputTab === 'text' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-emerald-500" />
                    <span>Dán danh sách từ hoặc văn bản tiếng Anh</span>
                  </label>
                  <textarea 
                    rows={3} 
                    value={rawText} 
                    onChange={e => setRawText(e.target.value)} 
                    placeholder={listType === 'words' ? "Dán danh sách từ phân tách bằng dấu phẩy hoặc xuống dòng:\nhobby, collecting stamps, gardening" : "Dán đoạn văn tiếng Anh:\nWhat is your favorite hobby? I enjoy reading books."}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                  <button 
                    type="button" 
                    onClick={handleParseAndTranslate} 
                    disabled={isTranslating || !rawText.trim()} 
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-slate-800 transition-colors"
                  >
                    <Languages className="w-4 h-4 text-emerald-400" /> 
                    <span>{isTranslating ? 'Đang phân tích & dịch...' : 'Tách Văn Bản & Dịch Tự Động'}</span>
                  </button>
                </div>
              )}

              {/* TAB 2: MULTI-IMAGE DRAG & DROP UPLOAD (MAX 10) */}
              {composerInputTab === 'images' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  
                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDraggingImages(true); }}
                    onDragLeave={() => setIsDraggingImages(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDraggingImages(false);
                      if (e.dataTransfer.files) handleImageFilesSelect(e.dataTransfer.files);
                    }}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                      isDraggingImages
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-cyan-500/60'
                    }`}
                  >
                    <input
                      type="file"
                      id="image-upload-input"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files) handleImageFilesSelect(e.target.files);
                      }}
                    />
                    <label htmlFor="image-upload-input" className="cursor-pointer space-y-2 block">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 mx-auto flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          Kéo thả nhiều ảnh vào đây hoặc <span className="text-cyan-600 underline">bấm để chọn file ảnh</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                          Hỗ trợ tối đa 10 bức hình (PNG, JPG, WEBP, GIF). Tên file ảnh sẽ tự động được sử dụng làm từ/câu gợi ý!
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Staged Uploaded Images List */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          Ảnh đã tải lên ({uploadedImages.length}/10 bức hình):
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadedImages([])}
                          className="text-[11px] font-bold text-rose-500 hover:underline"
                        >
                          Xóa tất cả ảnh
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {uploadedImages.map((img) => (
                          <div key={img.id} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3 relative group">
                            <img
                              src={img.previewUrl}
                              alt={img.suggestedText}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="text-[9px] font-mono text-slate-400 truncate">{img.file.name}</div>
                              <input
                                type="text"
                                value={img.suggestedText}
                                onChange={e => handleUpdateUploadedImageText(img.id, e.target.value)}
                                placeholder="Từ / Cần dịch (EN)"
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveUploadedImage(img.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg shrink-0"
                              title="Gỡ ảnh này"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Process Images Button */}
                      <button
                        type="button"
                        onClick={handleBatchProcessImages}
                        disabled={isProcessingImages}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-black text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>
                          {isProcessingImages 
                            ? 'Đang phân tích ảnh, tạo phiên âm & dịch tự động...' 
                            : `⚡ Phân Tích ${uploadedImages.length} Ảnh, Tạo Phiên Âm & Dịch Tự Động`}
                        </span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* STAGED ITEMS TABLE GRID LAYOUT: Từ/Câu | IPA | Nghĩa | Note | Hình ảnh */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Danh Sách Từ / Câu Trong Bài ({stagedItems.length})</span>
                </h3>
                <button 
                  type="button" 
                  onClick={handleAddManualItem} 
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-xs hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Ô Thủ Công</span>
                </button>
              </div>

              {/* Table Grid Structure */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-[460px] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-3 text-center w-10">#</th>
                        <th className="py-3 px-3 min-w-[160px]">Từ / Câu (EN)</th>
                        <th className="py-3 px-3 min-w-[120px]">Phiên Âm (IPA)</th>
                        <th className="py-3 px-3 min-w-[160px]">Bản Dịch (VI)</th>
                        <th className="py-3 px-3 min-w-[140px]">Ghi Chú (Note)</th>
                        <th className="py-3 px-3 min-w-[160px]">Hình Ảnh (URL)</th>
                        <th className="py-3 px-3 text-center w-12">Xoá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-bold">
                      {stagedItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-medium">
                            Chưa có từ / câu nào. Hãy dán đoạn văn phía trên hoặc nhấn "Thêm Ô Thủ Công"!
                          </td>
                        </tr>
                      ) : (
                        stagedItems.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-950/80 transition-colors">
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={item.text}
                                onChange={e => handleUpdateStagedItem(idx, 'text', e.target.value)}
                                placeholder="Tiếng Anh (star)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={item.ipa || ''}
                                onChange={e => handleUpdateStagedItem(idx, 'ipa', e.target.value)}
                                placeholder="IPA (/stɑːr/)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={item.vi || ''}
                                onChange={e => handleUpdateStagedItem(idx, 'vi', e.target.value)}
                                placeholder="Tiếng Việt (ngôi sao)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={item.note || ''}
                                onChange={e => handleUpdateStagedItem(idx, 'note', e.target.value)}
                                placeholder="Ghi chú / Mẹo"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1.5">
                                {item.imageUrl ? (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.text} 
                                    className="w-7 h-7 rounded-md object-cover border border-slate-200 dark:border-slate-800 shrink-0" 
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <input
                                  type="text"
                                  value={item.imageUrl || ''}
                                  onChange={e => handleUpdateStagedItem(idx, 'imageUrl', e.target.value)}
                                  placeholder="URL ảnh (hoặc để trống)"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveStagedItem(idx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                title="Xoá hàng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
