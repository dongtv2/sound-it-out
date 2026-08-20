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

export interface PracticeItem {
  id?: string;
  text: string;
  vi?: string;
  audioUrl?: string;
}

export interface PracticeList {
  id: string;
  name: string;
  type: PracticeItemType;
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
  timestamp: number;
}
