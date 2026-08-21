import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../sound_it_out.db');
const db = new DatabaseSync(dbPath);

const email = 'hami@metta.family';
const check = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (!check) {
  db.prepare(`
    INSERT INTO users (uid, displayName, email, password, role, isSuperuser, isStaff, userPermissions, avatarUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'stu-103',
    'Bé Hà Mi',
    email,
    '311218',
    'student',
    0,
    0,
    JSON.stringify(['content.view_list']),
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=hami',
    Date.now()
  );
  console.log('Successfully created account hami@metta.family with password 311218!');
} else {
  // Update password if exists
  db.prepare('UPDATE users SET password = ?, displayName = ? WHERE email = ?').run('311218', 'Bé Hà Mi', email);
  console.log('Successfully updated account hami@metta.family with password 311218!');
}

const allUsers = db.prepare('SELECT uid, displayName, email, role, password FROM users').all();
console.log('Current users in SQLite DB:', allUsers);
