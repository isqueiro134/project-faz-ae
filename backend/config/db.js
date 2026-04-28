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
    filename: './banco.db',
    driver: sqlite3.Database,
  });

  await db.run('PRAGMA foreign_keys = ON');
  await db.run('PRAGMA journal_mode = WAL');

  console.log('---> ✓ Conectado ao SQLite <---');
  return db;
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
