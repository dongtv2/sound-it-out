import type { CategoryTag, PracticeList, ReviewItem, StudentReport, UserProfile } from '@/types';

const API_BASE = '/api';

export const api = {
  // Health check
  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth Login
  async login(email: string, password?: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Đăng nhập thất bại');
    }
    return data.user;
  },

  // Change Password
  async changePassword(uid: string, oldPassword?: string, newPassword?: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, oldPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Đổi mật khẩu thất bại');
    }
    return true;
  },

  // User Management (Admin Only)
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getUsers error:', e);
    }
    return [];
  },

  async createUser(user: Partial<UserProfile> & { password?: string }): Promise<boolean> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Tạo tài khoản thất bại');
    }
    return true;
  },

  async updateUser(uid: string, user: Partial<UserProfile> & { password?: string }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(uid)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await res.json().catch(() => ({ success: false, error: 'Máy chủ trả về phản hồi không phải JSON' }));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cập nhật tài khoản thất bại');
      }
      return true;
    } catch (err: any) {
      console.error('API updateUser error:', err);
      throw new Error(err.message || 'Lỗi kết nối máy chủ');
    }
  },

  async deleteUser(uid: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(uid)}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // Practice Lists & Lesson Assignments
  async getLists(): Promise<PracticeList[]> {
    try {
      const res = await fetch(`${API_BASE}/lists`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getLists error:', e);
    }
    return [];
  },

  async saveList(list: PracticeList): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });
      return res.ok;
    } catch (e) {
      console.warn('API saveList error:', e);
      return false;
    }
  },

  async deleteList(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/lists/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.warn('API deleteList error:', e);
      return false;
    }
  },

  // Review Pool (Spaced Repetition)
  async getReviewItems(): Promise<ReviewItem[]> {
    try {
      const res = await fetch(`${API_BASE}/review`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getReviewItems error:', e);
    }
    return [];
  },

  async saveReviewItems(items: ReviewItem[]): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });
      return res.ok;
    } catch (e) {
      console.warn('API saveReviewItems error:', e);
      return false;
    }
  },

  // Student Reports
  async getReports(): Promise<StudentReport[]> {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getReports error:', e);
    }
    return [];
  },

  async addReport(report: StudentReport): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      return res.ok;
    } catch (e) {
      console.warn('API addReport error:', e);
      return false;
    }
  },

  async deleteReport(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.warn('API deleteReport error:', e);
      return false;
    }
  },

  // Dynamic Category Tags Management
  async getCategories(): Promise<CategoryTag[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API getCategories error:', e);
    }
    return [];
  },

  async saveCategory(cat: Partial<CategoryTag>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
      });
      return res.ok;
    } catch (e) {
      console.warn('API saveCategory error:', e);
      return false;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.warn('API deleteCategory error:', e);
      return false;
    }
  }
};
