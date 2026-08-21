export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
export type PracticeItemType = 'words' | 'sentences';
export type Dialect = 'us' | 'uk' | 'both';
export type UiLanguage = 'vi' | 'en';
export type SrsGrade = 'again' | 'hard' | 'good' | 'easy';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  isSuperuser?: boolean;
  isStaff?: boolean;
  userPermissions?: string[];
  avatarUrl?: string;
  createdAt?: number;
}

export interface CategoryTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  description?: string;
  createdAt?: number;
}

export interface PracticeItem {
  id?: string;
  text: string;
  vi?: string;
  ipa?: string;        // Phiên âm quốc tế (e.g. /stɑːr/)
  imageUrl?: string;   // URL Hình ảnh minh họa
  note?: string;       // Ghi chú/Hướng dẫn học tập
  tags?: string[];     // Thẻ tag gắn cho từ/câu
  audioUrl?: string;
}

export interface PracticeList {
  id: string;
  name: string;
  type: PracticeItemType;
  tag?: string;      // Category tag slug e.g. '3000words', 'music', 'phonics', 'curriculum', 'general'
  learner?: string; // Assigned student name (e.g. 'Bé Mai')
  by: string;      // Author
  items: PracticeItem[];
  createdAt?: number;
  updatedAt?: number;
}

export interface ReviewItem {
  id?: string;
  text: string;
  vi?: string;
  type: PracticeItemType;
  correctCount: number;
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
  dueDate?: number;
  lastCorrectDay?: string;
}

export interface StudentReport {
  id: string;
  listId: string;
  listName: string;
  originalText: string;
  correctedText: string;
  correctedVi?: string;
  studentNote?: string;
  studentName?: string;
  studentUid?: string;
  timestamp: number;
}

export interface SrsSettings {
  dailyReviewLimit: number;
  autoCollectFailed: boolean;
  autoPromptDue: boolean;
  initialEaseFactor: number;
  intervalMultiplier: number;
  strictPriorityMode: boolean;
}
