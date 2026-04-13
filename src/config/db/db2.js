import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let _db = null;

export async function conectarBanco() {
    if (_db) return _db;
    
    _db = await open({
        filename: './src/config/db/bd-provisorio.db',
        driver: sqlite3.Database
    });

    await _db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT UNIQUE,
            cpf TEXT UNIQUE,
            senha TEXT
        )
    `);

    const usuarios = await _db.all('SELECT * FROM usuarios');
    console.log("Usuários cadastrados no banco:");
    console.table(usuarios);

    return _db;
}

export async function getDB() {
    if (!_db) return await conectarBanco();
    return _db;
}