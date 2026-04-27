import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { getDirname } from '../utils/dirname.js';
import { join } from 'path';
import { readFileSync } from 'fs';

const __dirname = getDirname(import.meta.url);

async function connectDB() {
  try {
    const db = await open({
      filename: './banco.db',
      driver: sqlite3.Database,
    });

    await db.run("PRAGMA foreign_keys = ON");
    await db.run("PRAGMA journal_mode = WAL");

    console.log("---> ✓ Conectado ao SQLite <---");
    return db;
  } catch (error) {
    console.error("---> ✗ Erro ao tentar conectar no SQLite <---");
    console.error(`Detalhes: ${error.message}`);
    throw error;
  }
}

async function createTables() {
  try {
    const db = await connectDB();
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    // Usar EXEC para rodar múltiplas instruções (criação de várias tabelas)
    await db.exec(schemaSql);
    console.log("✓ Tabelas criadas com sucesso");
  } catch (error) {
    console.error("✗ Erro ao tentar criar tabelas");
    console.error(`Detalhes: ${error.message}`);
    throw error;
  }
}

createTables();

export default connectDB;