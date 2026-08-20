import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// SQLite Database Setup
const dbPath = join(__dirname, 'sound_it_out.db');
const db = new DatabaseSync(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    displayName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    isSuperuser INTEGER DEFAULT 0,
    isStaff INTEGER DEFAULT 0,
    userPermissions TEXT,
    avatarUrl TEXT,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS practice_lists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    learner TEXT,
    by TEXT NOT NULL,
    items TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS review_items (
    id TEXT PRIMARY KEY,
    text TEXT UNIQUE NOT NULL,
    vi TEXT,
    type TEXT NOT NULL,
    correctCount INTEGER DEFAULT 0,
    easeFactor REAL DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    dueDate INTEGER,
    lastCorrectDay TEXT
  );

  CREATE TABLE IF NOT EXISTS student_reports (
    id TEXT PRIMARY KEY,
    listId TEXT NOT NULL,
    listName TEXT NOT NULL,
    originalText TEXT NOT NULL,
    correctedText TEXT NOT NULL,
    correctedVi TEXT,
    studentNote TEXT,
    timestamp INTEGER NOT NULL
  );
`);

// Seed Family Users if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (uid, displayName, email, password, role, isSuperuser, isStaff, userPermissions, avatarUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  // Admin (God-Mode)
  insertUser.run(
    'adm-999',
    'Admin Sound It Out',
    'admin@metta.family',
    'Dong1984@',
    'admin',
    1,
    1,
    JSON.stringify(['*']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=adm999',
    now
  );

  // Student (Bé Mai)
  insertUser.run(
    'stu-101',
    'Bé Mai',
    'student@metta.family',
    'Dong1984@',
    'student',
    0,
    0,
    JSON.stringify(['content.view_list']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=stu101',
    now
  );

  // Teacher (Cô Hương)
  insertUser.run(
    'tch-202',
    'Cô Hương',
    'teacher@metta.family',
    'Dong1984@',
    'teacher',
    0,
    1,
    JSON.stringify(['content.add_list', 'content.change_list', 'reports.view_studentreport']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=tch202',
    now
  );

  // Parent (Bố Tuấn)
  insertUser.run(
    'prt-303',
    'Bố Tuấn',
    'parent@metta.family',
    'Dong1984@',
    'parent',
    0,
    0,
    JSON.stringify(['reports.view_studentreport']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=prt303',
    now
  );
}

// Ensure specific requested accounts exist (phuctri@metta.family & maianh@metta.family)
const checkUserExist = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');

if (checkUserExist.get('phuctri@metta.family').count === 0) {
  db.prepare(`
    INSERT INTO users (uid, displayName, email, password, role, isSuperuser, isStaff, userPermissions, avatarUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'stu-102',
    'Bé Phúc Trí',
    'phuctri@metta.family',
    'Behappy@123',
    'student',
    0,
    0,
    JSON.stringify(['content.view_list']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=phuctri',
    Date.now()
  );
}

if (checkUserExist.get('maianh@metta.family').count === 0) {
  db.prepare(`
    INSERT INTO users (uid, displayName, email, password, role, isSuperuser, isStaff, userPermissions, avatarUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'tch-203',
    'Cô Mai Anh',
    'maianh@metta.family',
    'Behappy@123',
    'teacher',
    0,
    1,
    JSON.stringify(['content.add_list', 'content.change_list', 'reports.view_studentreport']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=maianh',
    Date.now()
  );
}

// Seed Practice Lists if empty
const listCount = db.prepare('SELECT COUNT(*) as count FROM practice_lists').get().count;
if (listCount === 0) {
  const insertList = db.prepare(`
    INSERT INTO practice_lists (id, name, type, learner, by, items, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  insertList.run(
    'list-unit-1',
    'Từ vựng Lớp 7 - Unit 1: Hobbies',
    'words',
    'Bé Mai',
    'teacher',
    JSON.stringify([
      { id: 'u1-1', text: 'hobby', vi: 'sở thích' },
      { id: 'u1-2', text: 'collecting stamps', vi: 'sưu tầm tem' },
      { id: 'u1-3', text: 'gardening', vi: 'làm vườn' },
      { id: 'u1-4', text: 'building models', vi: 'xây dựng mô hình' },
      { id: 'u1-5', text: 'cooking', vi: 'nấu ăn' }
    ]),
    now,
    now
  );

  insertList.run(
    'list-unit-2',
    'Mẫu câu Giao tiếp Hằng ngày',
    'sentences',
    'Bé Mai',
    'teacher',
    JSON.stringify([
      { id: 'u2-1', text: 'What is your favorite hobby?', vi: 'Sở thích yêu thích của bạn là gì?' },
      { id: 'u2-2', text: 'I enjoy reading books in my free time.', vi: 'Tôi thích đọc sách khi rảnh rỗi.' },
      { id: 'u2-3', text: 'Practice makes perfect.', vi: 'Có công mài sắt có ngày nên kim.' }
    ]),
    now,
    now
  );

  insertList.run(
    'list-phonics-vowels',
    'Phonics: Vowel Sounds',
    'words',
    '',
    'admin',
    JSON.stringify([
      { id: 'pv-1', text: 'cat', vi: 'con mèo' },
      { id: 'pv-2', text: 'rain', vi: 'cơn mưa' },
      { id: 'pv-3', text: 'night', vi: 'ban đêm' },
      { id: 'pv-4', text: 'boat', vi: 'con thuyền' }
    ]),
    now,
    now
  );
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'sqlite', domain: 'sound-it-out.metta.family' });
});

// Auth APIs
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

  if (!user) {
    return res.status(401).json({ error: 'Tài khoản không tồn tại. Vui lòng liên hệ Admin gia đình để được cấp tài khoản!' });
  }

  if (password && user.password !== password) {
    return res.status(401).json({ error: 'Mật khẩu không chính xác!' });
  }

  const userProfile = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    isSuperuser: Boolean(user.isSuperuser),
    isStaff: Boolean(user.isStaff),
    userPermissions: JSON.parse(user.userPermissions || '[]'),
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };

  res.json({ success: true, user: userProfile });
});

app.post('/api/auth/change-password', (req, res) => {
  const { uid, oldPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(uid);

  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng!' });
  }

  if (oldPassword && user.password !== oldPassword) {
    return res.status(400).json({ error: 'Mật khẩu cũ không chính xác!' });
  }

  db.prepare('UPDATE users SET password = ? WHERE uid = ?').run(newPassword, uid);
  res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
});

// User Management APIs (Admin Only)
app.get('/api/users', (req, res) => {
  const rows = db.prepare('SELECT uid, displayName, email, role, isSuperuser, isStaff, userPermissions, avatarUrl, createdAt FROM users ORDER BY createdAt DESC').all();
  const users = rows.map(r => ({
    ...r,
    isSuperuser: Boolean(r.isSuperuser),
    isStaff: Boolean(r.isStaff),
    userPermissions: JSON.parse(r.userPermissions || '[]')
  }));
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { displayName, email, password, role, isSuperuser, isStaff, userPermissions } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const uid = `user-${Date.now()}`;
  const now = Date.now();

  try {
    const stmt = db.prepare(`
      INSERT INTO users (uid, displayName, email, password, role, isSuperuser, isStaff, userPermissions, avatarUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      uid,
      displayName || cleanEmail.split('@')[0],
      cleanEmail,
      password || 'Dong1984@',
      role || 'student',
      isSuperuser ? 1 : 0,
      isStaff ? 1 : 0,
      JSON.stringify(userPermissions || []),
      `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${uid}`,
      now
    );
    res.json({ success: true, uid });
  } catch (e) {
    res.status(400).json({ error: 'Email đã tồn tại trong hệ thống!' });
  }
});

app.put('/api/users/:uid', (req, res) => {
  const { uid } = req.params;
  const { displayName, role, isSuperuser, isStaff, userPermissions, password } = req.body;

  if (password) {
    db.prepare('UPDATE users SET displayName = ?, role = ?, isSuperuser = ?, isStaff = ?, userPermissions = ?, password = ? WHERE uid = ?')
      .run(displayName, role, isSuperuser ? 1 : 0, isStaff ? 1 : 0, JSON.stringify(userPermissions || []), password, uid);
  } else {
    db.prepare('UPDATE users SET displayName = ?, role = ?, isSuperuser = ?, isStaff = ?, userPermissions = ? WHERE uid = ?')
      .run(displayName, role, isSuperuser ? 1 : 0, isStaff ? 1 : 0, JSON.stringify(userPermissions || []), uid);
  }
  res.json({ success: true });
});

app.delete('/api/users/:uid', (req, res) => {
  db.prepare('DELETE FROM users WHERE uid = ?').run(req.params.uid);
  res.json({ success: true });
});

// Practice Lists & Lesson Assignment APIs
app.get('/api/lists', (req, res) => {
  const rows = db.prepare('SELECT * FROM practice_lists ORDER BY updatedAt DESC').all();
  const lists = rows.map(r => ({
    ...r,
    items: JSON.parse(r.items || '[]')
  }));
  res.json(lists);
});

app.post('/api/lists', (req, res) => {
  const { id, name, type, learner, by, items } = req.body;
  const listId = id || `list-${Date.now()}`;
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO practice_lists (id, name, type, learner, by, items, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      type = excluded.type,
      learner = excluded.learner,
      by = excluded.by,
      items = excluded.items,
      updatedAt = excluded.updatedAt
  `);

  stmt.run(listId, name || 'Bài học mới', type || 'words', learner || '', by || 'teacher', JSON.stringify(items || []), now, now);
  res.json({ success: true, id: listId });
});

app.delete('/api/lists/:id', (req, res) => {
  db.prepare('DELETE FROM practice_lists WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Spaced Repetition (SRS SM-2) Review Pool APIs
app.get('/api/review', (req, res) => {
  const rows = db.prepare('SELECT * FROM review_items ORDER BY dueDate ASC').all();
  res.json(rows);
});

app.post('/api/review', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Array required' });

  db.exec('DELETE FROM review_items');
  const stmt = db.prepare(`
    INSERT INTO review_items (id, text, vi, type, correctCount, easeFactor, interval, repetitions, dueDate, lastCorrectDay)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    stmt.run(
      item.id || `rev-${Date.now()}-${Math.random()}`,
      item.text,
      item.vi || '',
      item.type || 'words',
      item.correctCount || 0,
      item.easeFactor || 2.5,
      item.interval || 0,
      item.repetitions || 0,
      item.dueDate || Date.now(),
      item.lastCorrectDay || ''
    );
  }
  res.json({ success: true, count: items.length });
});

// Student Reports APIs
app.get('/api/reports', (req, res) => {
  const rows = db.prepare('SELECT * FROM student_reports ORDER BY timestamp DESC').all();
  res.json(rows);
});

app.post('/api/reports', (req, res) => {
  const { id, listId, listName, originalText, correctedText, correctedVi, studentNote, timestamp } = req.body;
  const stmt = db.prepare(`
    INSERT INTO student_reports (id, listId, listName, originalText, correctedText, correctedVi, studentNote, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id || `rep-${Date.now()}`, listId, listName, originalText, correctedText, correctedVi || '', studentNote || '', timestamp || Date.now());
  res.json({ success: true });
});

app.delete('/api/reports/:id', (req, res) => {
  db.prepare('DELETE FROM student_reports WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Sound It Out SQLite Family API Server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use. Reusing running process.`);
  } else {
    console.error('Server error:', err);
  }
});
