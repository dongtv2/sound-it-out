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

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT 'emerald',
    icon TEXT DEFAULT 'tag',
    description TEXT,
    createdAt INTEGER NOT NULL
  );
`);

// Seed default categories if empty
try {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount === 0) {
    const seedCats = [
      { id: 'cat-3000words', name: '3000 Words', slug: '3000words', color: 'emerald', icon: 'book', description: 'Bộ 3000 từ vựng Oxford thông dụng' },
      { id: 'cat-music', name: 'Âm Nhạc', slug: 'music', color: 'purple', icon: 'music', description: 'Bài hát & Luyện nghe qua nhạc' },
      { id: 'cat-phonics', name: 'Ngữ Âm Phonics', slug: 'phonics', color: 'amber', icon: 'volume-2', description: 'Quy tắc phát âm & Đánh vần Phonics' },
      { id: 'cat-curriculum', name: 'Giáo Trình', slug: 'curriculum', color: 'blue', icon: 'graduation-cap', description: 'Bài học chương trình sách giáo khoa' },
      { id: 'cat-general', name: 'Khác', slug: 'general', color: 'slate', icon: 'tag', description: 'Chủ đề chung' }
    ];
    const insertCat = db.prepare('INSERT INTO categories (id, name, slug, color, icon, description, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const now = Date.now();
    seedCats.forEach(c => insertCat.run(c.id, c.name, c.slug, c.color, c.icon, c.description, now));
  }
} catch (e) {
  console.warn('Categories init warning:', e);
}

// Clean up old dummy users if present
db.prepare("DELETE FROM users WHERE email IN ('student@metta.family', 'teacher@metta.family', 'parent@metta.family')").run();

// Ensure active real family accounts exist
const checkUserExist = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');

if (checkUserExist.get('admin@metta.family').count === 0) {
  db.prepare(`
    INSERT INTO users (uid, displayName, email, password, role, isSuperuser, isStaff, userPermissions, avatarUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'adm-999',
    'Admin Sound It Out',
    'admin@metta.family',
    'Dong1984@',
    'admin',
    1,
    1,
    JSON.stringify(['*']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=adm999',
    Date.now()
  );
}

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
    'Tất cả',
    'teacher',
    JSON.stringify([
      { id: 'pv-1', text: 'cat', vi: 'con mèo' },
      { id: 'pv-2', text: 'bed', vi: 'cái giường' },
      { id: 'pv-3', text: 'pig', vi: 'con heo' },
      { id: 'pv-4', text: 'sun', vi: 'mặt trời' }
    ]),
    now,
    now
  );
}

// Ensure Counting Stars song lesson exists
const checkListExist = db.prepare('SELECT COUNT(*) as count FROM practice_lists WHERE id = ?');
if (checkListExist.get('list-counting-star').count === 0) {
  const countingStarsItems = [
    { id: "cs-1", text: "Lately, I've been, I've been losing sleep", vi: "Dạo này tôi bị mất ngủ" },
    { id: "cs-2", text: "Dreaming about the things that we could be", vi: "Mơ về những điều chúng ta có thể trở thành" },
    { id: "cs-3", text: "But baby, I've been, I've been praying hard", vi: "Nhưng em yêu, tôi đã cầu nguyện rất nhiều" },
    { id: "cs-4", text: "Sitting, no more counting dollars", vi: "Ngồi đây, không còn đếm tiền bạc nữa" },
    { id: "cs-5", text: "We'll be counting stars", vi: "Chúng ta sẽ đếm những vì sao" },
    { id: "cs-6", text: "Yeah, we'll be counting stars", vi: "Vâng, chúng ta sẽ đếm những vì sao" },
    { id: "cs-7", text: "I see this life like a swinging vine", vi: "Tôi thấy cuộc đời như một cành dây leo đung đưa" },
    { id: "cs-8", text: "Swing my heart across the line", vi: "Đưa trái tim tôi vượt qua ranh giới" },
    { id: "cs-9", text: "And my face is flashing signs", vi: "Và khuôn mặt tôi bừng sáng những tín hiệu" },
    { id: "cs-10", text: "Seek it out and you shall find", vi: "Hãy tìm kiếm rồi bạn sẽ thấy" },
    { id: "cs-11", text: "Old, but I'm not that old", vi: "Già rồi, nhưng tôi chưa già đến thế" },
    { id: "cs-12", text: "Young, but I'm not that bold", vi: "Trẻ trung, nhưng tôi không quá táo bạo" },
    { id: "cs-13", text: "I don't think the world is sold", vi: "Tôi không nghĩ thế giới này đã bị bán đứng" },
    { id: "cs-14", text: "I'm just doing what we're told", vi: "Tôi chỉ đang làm những gì được bảo" },
    { id: "cs-15", text: "I feel something so right", vi: "Tôi cảm thấy một điều thật đúng đắn" },
    { id: "cs-16", text: "Doing the wrong thing", vi: "Khi làm một điều sai trái" },
    { id: "cs-17", text: "I feel something so wrong", vi: "Tôi cảm thấy một điều thật sai trái" },
    { id: "cs-18", text: "Doing the right thing", vi: "Khi làm một điều đúng đắn" },
    { id: "cs-19", text: "I couldn't lie, couldn't lie, couldn't lie", vi: "Tôi không thể nói dối, không thể nói dối" },
    { id: "cs-20", text: "Everything that kills me makes me feel alive", vi: "Mọi thứ dằn xé tôi lại khiến tôi cảm thấy mình đang sống" },
    { id: "cs-21", text: "I feel the love and I feel it burn", vi: "Tôi cảm nhận tình yêu và cảm thấy nó rực cháy" },
    { id: "cs-22", text: "Down this river, every turn", vi: "Xuôi theo dòng sông này, qua từng khúc ngoặt" },
    { id: "cs-23", text: "Hope is a four-letter word", vi: "Hy vọng là một từ bốn chữ cái" },
    { id: "cs-24", text: "Make that money, watch it burn", vi: "Kiếm tiền ra rồi nhìn nó tan biến" },
    { id: "cs-25", text: "Everything that downs me makes me wanna fly", vi: "Mọi thứ kéo tôi xuống lại khiến tôi muốn bay lên" },
    { id: "cs-26", text: "Take that money", vi: "Hãy cầm lấy số tiền đó" },
    { id: "cs-27", text: "Watch it burn", vi: "Nhìn nó bùng cháy" },
    { id: "cs-28", text: "Sink in the river", vi: "Chìm xuống dòng sông" },
    { id: "cs-29", text: "The lessons are learnt", vi: "Những bài học đã được rút ra" },
    { id: "cs-30", text: "Everything that kills me", vi: "Mọi thứ dằn xé tôi" },
    { id: "cs-31", text: "Makes feel alive", vi: "Khiến tôi cảm thấy mình sống động" }
  ];

  db.prepare(`
    INSERT INTO practice_lists (id, name, type, learner, by, items, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'list-counting-star',
    'Bài hát - Counting star',
    'sentences',
    'Bé Phúc Trí',
    'maianh@metta.family',
    JSON.stringify(countingStarsItems),
    Date.now(),
    Date.now()
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
  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE uid = ?').get(uid);

    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng!' });
    }

    const displayName = req.body.displayName !== undefined ? req.body.displayName : existingUser.displayName;
    const role = req.body.role !== undefined ? req.body.role : existingUser.role;
    const isSuperuser = req.body.isSuperuser !== undefined ? (req.body.isSuperuser ? 1 : 0) : existingUser.isSuperuser;
    const isStaff = req.body.isStaff !== undefined ? (req.body.isStaff ? 1 : 0) : existingUser.isStaff;
    const userPermissions = req.body.userPermissions !== undefined 
      ? (typeof req.body.userPermissions === 'string' ? req.body.userPermissions : JSON.stringify(req.body.userPermissions)) 
      : existingUser.userPermissions;
    const password = req.body.password !== undefined ? req.body.password : existingUser.password;

    db.prepare(`
      UPDATE users 
      SET displayName = ?, role = ?, isSuperuser = ?, isStaff = ?, userPermissions = ?, password = ? 
      WHERE uid = ?
    `).run(displayName, role, isSuperuser, isStaff, userPermissions, password, uid);

    res.json({ success: true, message: 'Cập nhật tài khoản thành công!' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật CSDL: ' + err.message });
  }
});

app.delete('/api/users/:uid', (req, res) => {
  db.prepare('DELETE FROM users WHERE uid = ?').run(req.params.uid);
  res.json({ success: true });
});

app.get('/api/lists', (req, res) => {
  const rows = db.prepare('SELECT * FROM practice_lists ORDER BY updatedAt DESC').all();
  const lists = rows.map(r => {
    let items = JSON.parse(r.items || '[]');

    // Guarantee that every item has its IPA separated from VI
    items = items.map(item => {
      if (!item.vi) return item;

      // Pattern 1: match /.../ in vi e.g. "Khí hậu /'klaɪ.mət/"
      const matchSlash = item.vi.match(/(.*?)\s*\/([^\/]+)\/\s*(.*)/);
      if (matchSlash) {
        return {
          ...item,
          ipa: item.ipa || `/${matchSlash[2].trim()}/`,
          vi: `${matchSlash[1]} ${matchSlash[3]}`.trim()
        };
      }

      // Pattern 2: match unclosed /... at end e.g. "Dự báo thời tiết /'fɔː.kɑːs"
      const matchUnclosed = item.vi.match(/(.*?)\s*\/([^\/]+)$/);
      if (matchUnclosed) {
        return {
          ...item,
          ipa: item.ipa || `/${matchUnclosed[2].trim()}/`,
          vi: matchUnclosed[1].trim()
        };
      }

      return item;
    });

    return {
      ...r,
      items
    };
  });
  res.json(lists);
});

app.post('/api/lists', (req, res) => {
  const { id, name, type, tag, learner, by, items } = req.body;
  const listId = id || `list-${Date.now()}`;
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO practice_lists (id, name, type, tag, learner, by, items, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      type = excluded.type,
      tag = excluded.tag,
      learner = excluded.learner,
      by = excluded.by,
      items = excluded.items,
      updatedAt = excluded.updatedAt
  `);

  stmt.run(listId, name || 'Bài học mới', type || 'words', tag || 'general', learner || '', by || 'teacher', JSON.stringify(items || []), now, now);
  res.json({ success: true, id: listId });
});

app.delete('/api/lists/:id', (req, res) => {
  db.prepare('DELETE FROM practice_lists WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Categories Management APIs (Dynamic Category Tags CRUD)
app.get('/api/categories', (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY createdAt ASC').all();
  res.json(rows);
});

app.post('/api/categories', (req, res) => {
  const { id, name, slug, color, icon, description } = req.body;
  const catId = id || `cat-${Date.now()}`;
  const cleanSlug = (slug || name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const now = Date.now();

  try {
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, slug, color, icon, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        slug = excluded.slug,
        color = excluded.color,
        icon = excluded.icon,
        description = excluded.description
    `);

    stmt.run(catId, name || 'Phân loại mới', cleanSlug || catId, color || 'emerald', icon || 'tag', description || '', now);
    res.json({ success: true, id: catId, slug: cleanSlug });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Tên phân loại hoặc mã slug đã tồn tại trong CSDL!' });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  const catId = req.params.id;
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
  if (cat) {
    // Relink affected practice lists to 'general' category
    db.prepare('UPDATE practice_lists SET tag = ? WHERE tag = ? OR tag = ?').run('general', cat.slug, cat.name);
    db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
  }
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
