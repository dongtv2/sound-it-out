import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { CategoryTag, PracticeList, ReviewItem, Dialect, UiLanguage, PracticeItem, PracticeItemType, SrsGrade, StudentReport } from '@/types';
import { api } from '@/services/api';

export type SoundItOutTab = 'practice' | 'composer' | 'assigned' | 'reports' | 'admin';

interface PracticeContextType {
  activeTab: SoundItOutTab;
  setActiveTab: (tab: SoundItOutTab) => void;
  lists: PracticeList[];
  categories: CategoryTag[];
  reviewItems: ReviewItem[];
  studentReports: StudentReport[];
  dialect: Dialect;
  strictMode: boolean;
  uiLang: UiLanguage;
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  addList: (list: PracticeList) => Promise<void>;
  updateList: (list: PracticeList) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addCategory: (cat: Partial<CategoryTag>) => Promise<void>;
  updateCategory: (cat: CategoryTag) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  gradeItem: (item: PracticeItem, gradeOrCorrect: boolean | SrsGrade, type: PracticeItemType) => void;
  clearAllReview: () => void;
  removeReviewItem: (text: string) => void;
  addStudentReport: (report: StudentReport) => Promise<void>;
  deleteStudentReport: (id: string) => Promise<void>;
  setDialect: (d: Dialect) => void;
  setStrictMode: (s: boolean) => void;
  setUiLang: (lang: UiLanguage) => void;
  translateTextMyMemory: (text: string) => Promise<string>;
  fetchIpa: (word: string) => Promise<string>;
  splitTextToPhrases: (text: string, type: PracticeItemType) => string[];
}

const SETTINGS_STORAGE_KEY = 'sound-it-out-settings-v3';

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<SoundItOutTab>('practice');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [dialect, setDialectState] = useState<Dialect>('both');
  const [strictMode, setStrictModeState] = useState<boolean>(false);
  const [uiLang, setUiLangState] = useState<UiLanguage>('vi');

  const [lists, setLists] = useState<PracticeList[]>([]);
  const [categories, setCategories] = useState<CategoryTag[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);

  // Fetch initial data from SQLite Backend API
  const refreshData = async () => {
    try {
      const [dbLists, dbCats, dbReviews, dbReports] = await Promise.all([
        api.getLists(),
        api.getCategories(),
        api.getReviewItems(),
        api.getReports()
      ]);

      if (dbLists && dbLists.length > 0) {
        const sanitizedLists = dbLists.map(l => ({
          ...l,
          items: (l.items || []).map(i => {
            if (!i.vi) return i;
            const matchSlash = i.vi.match(/(.*?)\s*\/([^\/]+)\/\s*(.*)/);
            if (matchSlash) {
              return {
                ...i,
                ipa: i.ipa || `/${matchSlash[2].trim()}/`,
                vi: `${matchSlash[1]} ${matchSlash[3]}`.trim()
              };
            }
            const matchUnclosed = i.vi.match(/(.*?)\s*\/([^\/]+)$/);
            if (matchUnclosed) {
              return {
                ...i,
                ipa: i.ipa || `/${matchUnclosed[2].trim()}/`,
                vi: matchUnclosed[1].trim()
              };
            }
            return i;
          })
        }));

        setLists(sanitizedLists);
        if (!activeListId) {
          setActiveListId(sanitizedLists[0].id);
        }
      }
      if (dbCats) setCategories(dbCats);
      if (dbReviews) setReviewItems(dbReviews);
      if (dbReports) setStudentReports(dbReports);
    } catch (e) {
      console.warn('Lỗi tải dữ liệu SQLite:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Load Settings từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s.dialect) setDialectState(s.dialect);
        if (s.strictMode !== undefined) setStrictModeState(s.strictMode);
        if (s.uiLang) setUiLangState(s.uiLang);
      }
    } catch (e) {}
  }, []);

  const saveSettings = (d: Dialect, s: boolean, u: UiLanguage) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ dialect: d, strictMode: s, uiLang: u }));
    } catch (e) {}
  };

  const setDialect = (d: Dialect) => {
    setDialectState(d);
    saveSettings(d, strictMode, uiLang);
  };
  const setStrictMode = (s: boolean) => {
    setStrictModeState(s);
    saveSettings(dialect, s, uiLang);
  };
  const setUiLang = (u: UiLanguage) => {
    setUiLangState(u);
    saveSettings(dialect, strictMode, u);
  };

  const persistReview = (items: ReviewItem[]) => {
    setReviewItems(items);
    api.saveReviewItems(items);
  };

  // SM-2 Spaced Repetition Algorithm
  const gradeItem = useCallback((item: PracticeItem, gradeOrCorrect: boolean | SrsGrade, type: PracticeItemType) => {
    const cleanW = item.text.trim().toLowerCase();

    let grade: SrsGrade;
    if (typeof gradeOrCorrect === 'boolean') {
      grade = gradeOrCorrect ? 'good' : 'again';
    } else {
      grade = gradeOrCorrect;
    }

    setReviewItems(prev => {
      const existingIdx = prev.findIndex(i => i.text.trim().toLowerCase() === cleanW);

      let currentItem: ReviewItem = existingIdx >= 0 ? { ...prev[existingIdx] } : {
        id: `rev-${Date.now()}-${Math.random()}`,
        text: item.text.trim(),
        vi: item.vi || '',
        type: type,
        correctCount: 0,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        dueDate: Date.now()
      };

      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      if (grade === 'again') {
        currentItem.repetitions = 0;
        currentItem.interval = 1;
        currentItem.dueDate = now + ONE_DAY_MS;
      } else {
        currentItem.correctCount += 1;
        if (currentItem.repetitions === 0) {
          currentItem.interval = 1;
        } else if (currentItem.repetitions === 1) {
          currentItem.interval = 6;
        } else {
          currentItem.interval = Math.round((currentItem.interval || 1) * (currentItem.easeFactor || 2.5));
        }
        currentItem.repetitions = (currentItem.repetitions || 0) + 1;

        if (grade === 'easy') {
          currentItem.easeFactor = Math.min(3.0, (currentItem.easeFactor || 2.5) + 0.15);
          currentItem.interval = Math.round(currentItem.interval * 1.3);
        } else if (grade === 'hard') {
          currentItem.easeFactor = Math.max(1.3, (currentItem.easeFactor || 2.5) - 0.15);
          currentItem.interval = Math.max(1, Math.round(currentItem.interval * 0.8));
        }

        currentItem.dueDate = now + currentItem.interval * ONE_DAY_MS;
        currentItem.lastCorrectDay = new Date().toISOString().split('T')[0];
      }

      let updatedList: ReviewItem[];
      if (existingIdx >= 0) {
        updatedList = [...prev];
        updatedList[existingIdx] = currentItem;
      } else {
        updatedList = [currentItem, ...prev];
      }

      api.saveReviewItems(updatedList);
      return updatedList;
    });
  }, []);

  const clearAllReview = () => persistReview([]);
  const removeReviewItem = (text: string) => {
    persistReview(reviewItems.filter(i => i.text.toLowerCase() !== text.toLowerCase()));
  };

  const addList = async (newList: PracticeList) => {
    await api.saveList(newList);
    setLists(prev => [newList, ...prev]);
    setActiveListId(newList.id);
  };

  const updateList = async (updatedList: PracticeList) => {
    await api.saveList(updatedList);
    setLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
  };

  const deleteList = async (id: string) => {
    await api.deleteList(id);
    setLists(prev => prev.filter(l => l.id !== id));
    if (activeListId === id) {
      setActiveListId(lists.find(l => l.id !== id)?.id || null);
    }
  };

  const addCategory = async (cat: Partial<CategoryTag>) => {
    await api.saveCategory(cat);
    const updatedCats = await api.getCategories();
    if (updatedCats) setCategories(updatedCats);
  };

  const updateCategory = async (cat: CategoryTag) => {
    await api.saveCategory(cat);
    const updatedCats = await api.getCategories();
    if (updatedCats) setCategories(updatedCats);
  };

  const deleteCategory = async (id: string) => {
    await api.deleteCategory(id);
    const [updatedCats, updatedLists] = await Promise.all([
      api.getCategories(),
      api.getLists()
    ]);
    if (updatedCats) setCategories(updatedCats);
    if (updatedLists) setLists(updatedLists);
  };

  const addStudentReport = async (report: StudentReport) => {
    await api.addReport(report);
    setStudentReports(prev => [report, ...prev]);
  };

  const deleteStudentReport = async (id: string) => {
    await api.deleteReport(id);
    setStudentReports(prev => prev.filter(r => r.id !== id));
  };

  // MyMemory Translation Engine
  const translateTextMyMemory = async (text: string): Promise<string> => {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
      const res = await fetch(url);
      if (!res.ok) return '';
      const data = await res.json();
      return data?.responseData?.translatedText || '';
    } catch {
      return '';
    }
  };

  // Split raw paragraph text into practice phrases/sentences
  const splitTextToPhrases = (text: string, type: PracticeItemType): string[] => {
    if (!text.trim()) return [];
    if (type === 'words') {
      return text.split(/[\n,;]+/).map(w => w.trim()).filter(Boolean);
    } else {
      return text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
    }
  };

  // Free Dictionary API IPA Lookup Engine
  const fetchIpa = async (word: string): Promise<string> => {
    if (!word.trim()) return '';
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
      if (!res.ok) return '';
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        for (const entry of data) {
          if (entry.phonetic) return entry.phonetic;
          if (entry.phonetics && entry.phonetics.length > 0) {
            for (const p of entry.phonetics) {
              if (p.text) return p.text;
            }
          }
        }
      }
    } catch {
      return '';
    }
    return '';
  };

  return (
    <PracticeContext.Provider value={{
      activeTab,
      setActiveTab,
      lists,
      categories,
      reviewItems,
      studentReports,
      dialect,
      strictMode,
      uiLang,
      activeListId,
      setActiveListId,
      addList,
      updateList,
      deleteList,
      addCategory,
      updateCategory,
      deleteCategory,
      gradeItem,
      clearAllReview,
      removeReviewItem,
      addStudentReport,
      deleteStudentReport,
      setDialect,
      setStrictMode,
      setUiLang,
      translateTextMyMemory,
      fetchIpa,
      splitTextToPhrases
    }}>
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = (): PracticeContextType => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};
