import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { getDirname } from '../utils/dirname.js';
import { join } from 'path';
import { readFileSync } from 'fs';

const __dirname = getDirname(import.meta.url);

/** @type {Promise<import('sqlite').Database> | null} */
let connectionPromise = null;

async function openConnection() {
  const db = await open({
    filename: process.env.SQLITE_DB_PATH || './banco.db',
    driver: sqlite3.Database,
  });

  await db.run('PRAGMA foreign_keys = ON');
  await db.run('PRAGMA journal_mode = WAL');

  await runMigrations(db);

  console.log('---> ✓ Conectado ao SQLite <---');
  return db;
}

/**
 * Migrações idempotentes para bancos já existentes.
 * `schema.sql` cobre instalações novas; aqui ajustamos bancos antigos.
 */
async function runMigrations(db) {
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`);

  const columns = await db.all('PRAGMA table_info(users)');
  if (!columns.some((column) => column.name === 'cpf')) {
    await db.run('ALTER TABLE users ADD COLUMN cpf TEXT');
  }
  await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)');

  await db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  await db.run('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');

  await db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY NOT NULL,
    avatar_url TEXT NULL,
    bio TEXT NULL,
    phone TEXT UNIQUE NULL,
    email_verified INTEGER DEFAULT 0,
    phone_verified INTEGER DEFAULT 0,
    is_verified INTEGER DEFAULT 0,
    user_type TEXT NULL CHECK(user_type IN ('client', 'freelancer', 'both')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS client_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    tax_id TEXT UNIQUE NULL,
    total_published_jobs INTEGER DEFAULT 0,
    total_paid_jobs INTEGER DEFAULT 0,
    rating_average REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    company_name TEXT NULL,
    website_url TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    professional_title TEXT NULL,
    hourly_rate REAL NULL,
    skills TEXT DEFAULT '[]',
    portfolio_url TEXT NULL,
    category TEXT NULL,
    level TEXT NULL,
    location TEXT NULL,
    languages TEXT NOT NULL DEFAULT '[]',
    tools TEXT NOT NULL DEFAULT '[]',
    niches TEXT NOT NULL DEFAULT '[]',
    project_types TEXT NOT NULL DEFAULT '[]',
    availability TEXT NULL,
    work_model TEXT NULL,
    experience_years INTEGER NULL,
    result_highlight TEXT NULL,
    education TEXT NULL,
    links TEXT NOT NULL DEFAULT '{}',
    portfolio_items TEXT NOT NULL DEFAULT '[]',
    pricing_model TEXT NULL,
    project_rate_min REAL NULL,
    project_rate_max REAL NULL,
    response_time TEXT NULL,
    project_size TEXT NULL,
    urgent_projects INTEGER NOT NULL DEFAULT 0,
    profile_strength INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    rating_average REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
  )`);
}

/**
 * Retorna sempre a mesma instância de banco (singleton).
 */
async function connectDB() {
  if (!connectionPromise) {
    connectionPromise = openConnection().catch((err) => {
      connectionPromise = null;
      console.error('---> ✗ Erro ao tentar conectar no SQLite <---');
      console.error(`Detalhes: ${err.message}`);
      throw err;
    });
  }
  return connectionPromise;
}

/**
 * Fecha a conexão singleton (ex.: graceful shutdown).
 * Permite nova conexão em `connectDB()` depois disso (ex.: testes).
 */
export async function closeDB() {
  if (!connectionPromise) return;
  const p = connectionPromise;
  connectionPromise = null;
  try {
    const db = await p;
    await db.close();
  } catch (err) {
    console.error('---> ✗ Erro ao fechar SQLite:', err);
    throw err;
  }
}

async function createTables() {
  try {
    const db = await connectDB();
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    await db.exec(schemaSql);
    console.log('✓ Tabelas criadas com sucesso');
  } catch (error) {
    console.error('✗ Erro ao tentar criar tabelas');
    console.error(`Detalhes: ${error.message}`);
    throw error;
  }
}

// createTables();

export default connectDB;
