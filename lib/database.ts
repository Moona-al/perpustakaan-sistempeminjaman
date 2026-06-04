/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql, { Pool } from 'mysql2/promise';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  bookId: string;
  bookTitle: string;
  coverImage?: string;
  studentName: string;
  studentUsername: string;
  borrowDate: string;   // ISO string
  dueDate: string;      // ISO string
  returnDate: string | null;
  status: 'borrowed' | 'returned' | 'late';
  fine: number;
}

export interface Student {
  username: string;
  name: string;
  class: string;
}

// ─── Singleton (safe for Next.js hot-reload in dev) ─────────────────────────

const g = global as typeof globalThis & {
  _mysqlPool?: Pool;
  _mysqlReady?: boolean;
};

const SEED_USERS: Student[] = [
  { username: 'hapis', name: 'Hapis', class: 'XII-RPL-1' },
  { username: 'alfian', name: 'Alfian Fadillah', class: 'XII-RPL-1' },
  { username: 'sadiq', name: 'Sadiq', class: 'XI-TKJ-2' },
  { username: 'rakha', name: 'Rakha', class: 'X-RPL-2' },
];

// ─── Connection ──────────────────────────────────────────────────────────────

export async function getDb(): Promise<Pool> {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'perpus_app';

  if (!g._mysqlPool) {
    // 1. Koneksi awal tanpa database untuk membuat DB jika belum ada
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // 2. Koneksi pool utama ke database
    g._mysqlPool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  if (!g._mysqlReady) {
    await _initTables(g._mysqlPool);
    g._mysqlReady = true;
  }

  return g._mysqlPool;
}

// ─── Init & Seed ─────────────────────────────────────────────────────────────

async function _initTables(pool: Pool) {
  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      username   VARCHAR(100) UNIQUE NOT NULL,
      name       VARCHAR(255) NOT NULL,
      class      VARCHAR(50) NOT NULL DEFAULT 'XII-RPL-1',
      password   VARCHAR(255) NOT NULL DEFAULT 'user321',
      role       VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id               VARCHAR(100) PRIMARY KEY,
      book_id          VARCHAR(100) NOT NULL,
      book_title       VARCHAR(255) NOT NULL,
      cover_image      TEXT,
      student_name     VARCHAR(255) NOT NULL,
      student_username VARCHAR(100) NOT NULL,
      borrow_date      VARCHAR(100) NOT NULL,
      due_date         VARCHAR(100) NOT NULL,
      return_date      VARCHAR(100),
      status           VARCHAR(50) NOT NULL DEFAULT 'borrowed',
      fine             INT NOT NULL DEFAULT 0,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed users once if empty
  const [rows] = await pool.query<any[]>('SELECT COUNT(*) as cnt FROM users');
  const count = Number(rows[0].cnt);
  if (count === 0) {
    for (const u of SEED_USERS) {
      await pool.query(
        `INSERT INTO users (username, name, class, password, role)
         VALUES (?, ?, ?, 'user321', 'user')`,
        [u.username, u.name, u.class]
      );
    }
  }
}

// ─── Fine Calculation (applied in-memory after DB read) ─────────────────────

function applyLateFines(txs: Transaction[]): Transaction[] {
  const now = new Date();
  return txs.map(tx => {
    if (tx.status === 'borrowed' || tx.status === 'late') {
      const due = new Date(tx.dueDate);
      if (now > due) {
        const days = Math.ceil((now.getTime() - due.getTime()) / 86_400_000);
        return { ...tx, status: 'late' as const, fine: days * 1000 };
      }
    }
    return tx;
  });
}

// ─── Row mappers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTransaction(r: any): Transaction {
  return {
    id: String(r.id),
    bookId: String(r.book_id),
    bookTitle: String(r.book_title),
    coverImage: r.cover_image ? String(r.cover_image) : undefined,
    studentName: String(r.student_name),
    studentUsername: String(r.student_username),
    borrowDate: String(r.borrow_date),
    dueDate: String(r.due_date),
    returnDate: r.return_date ? String(r.return_date) : null,
    status: r.status as Transaction['status'],
    fine: Number(r.fine),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStudent(r: any): Student {
  return {
    username: String(r.username),
    name: String(r.name),
    class: String(r.class),
  };
}

// ─── Transaction Queries ─────────────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const pool = await getDb();
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM transactions ORDER BY created_at DESC`
  );
  return applyLateFines(rows.map(toTransaction));
}

export async function upsertTransaction(tx: Transaction): Promise<void> {
  const pool = await getDb();
  await pool.query(
    `
      INSERT INTO transactions
        (id, book_id, book_title, cover_image,
         student_name, student_username,
         borrow_date, due_date, return_date, status, fine)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        book_id          = VALUES(book_id),
        book_title       = VALUES(book_title),
        cover_image      = VALUES(cover_image),
        student_name     = VALUES(student_name),
        student_username = VALUES(student_username),
        borrow_date      = VALUES(borrow_date),
        due_date         = VALUES(due_date),
        return_date      = VALUES(return_date),
        status           = VALUES(status),
        fine             = VALUES(fine)
    `,
    [
      tx.id, tx.bookId, tx.bookTitle, tx.coverImage ?? null,
      tx.studentName, tx.studentUsername,
      tx.borrowDate, tx.dueDate, tx.returnDate ?? null,
      tx.status, tx.fine,
    ]
  );
}

export async function deleteTransactionById(id: string): Promise<boolean> {
  const pool = await getDb();
  const [result] = await pool.query<any>(
    `DELETE FROM transactions WHERE id = ?`,
    [id]
  );
  return (result.affectedRows ?? 0) > 0;
}

// ─── Student / User Queries ───────────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  const pool = await getDb();
  const [rows] = await pool.query<any[]>(
    `SELECT username, name, class FROM users WHERE role = 'user' ORDER BY name`
  );
  return rows.map(toStudent);
}

export async function upsertStudent(s: Student): Promise<void> {
  const pool = await getDb();
  await pool.query(
    `
      INSERT INTO users (username, name, class, password, role)
      VALUES (?, ?, ?, 'user321', 'user')
      ON DUPLICATE KEY UPDATE
        name  = VALUES(name),
        class = VALUES(class)
    `,
    [s.username.toLowerCase().trim(), s.name.trim(), s.class]
  );
}

export async function getUserByUsername(username: string): Promise<any | null> {
  const pool = await getDb();
  const [rows] = await pool.query<any[]>(
    `SELECT id, username, name, class, password, role, created_at FROM users WHERE username = ?`,
    [username.toLowerCase().trim()]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export async function getUsers(): Promise<any[]> {
  const pool = await getDb();
  const [rows] = await pool.query<any[]>(
    `SELECT id, username, name, class, password, role, created_at FROM users ORDER BY created_at DESC`
  );
  return rows;
}

export async function createUser(u: { username: string; name: string; class: string; password?: string; role?: string }): Promise<void> {
  const pool = await getDb();
  const password = u.password || 'user321';
  const role = u.role || 'user';
  await pool.query(
    `
      INSERT INTO users (username, name, class, password, role)
      VALUES (?, ?, ?, ?, ?)
    `,
    [u.username.toLowerCase().trim(), u.name.trim(), u.class, password, role]
  );
}

export async function deleteUserById(id: string | number): Promise<boolean> {
  const pool = await getDb();
  const [result] = await pool.query<any>(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );
  return (result.affectedRows ?? 0) > 0;
}

export async function updateUserProfile(
  userId: number,
  oldUsername: string,
  name: string,
  username: string,
  password?: string
): Promise<void> {
  const pool = await getDb();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Update user info
    if (password) {
      await conn.query(
        `UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?`,
        [name.trim(), username.toLowerCase().trim(), password, userId]
      );
    } else {
      await conn.query(
        `UPDATE users SET name = ?, username = ? WHERE id = ?`,
        [name.trim(), username.toLowerCase().trim(), userId]
      );
    }

    // 2. Update transactions associated with student_username
    await conn.query(
      `UPDATE transactions SET student_name = ?, student_username = ? WHERE student_username = ?`,
      [name.trim(), username.toLowerCase().trim(), oldUsername.toLowerCase().trim()]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}


