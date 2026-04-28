import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import connectDB from '../config/db.js';

const db = await connectDB();

const SALT_BYTES = 16;
const KEY_BYTES = 64;

function hashPassword(plain) {
    const salt = randomBytes(SALT_BYTES);
    const hash = scryptSync(plain, salt, KEY_BYTES);
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(plain, stored) {
    const parts = stored.split(':');
    if (parts.length !== 2) return false;
    const [saltHex, hashHex] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const computed = scryptSync(plain, salt, KEY_BYTES);
    if (expected.length !== computed.length) return false;
    return timingSafeEqual(expected, computed);
}

function resolveFullName(metadata) {
    if (!metadata || typeof metadata !== 'object') return null;
    const name =
        metadata.full_name ??
        metadata.fullName ??
        metadata.name ??
        null;
    return typeof name === 'string' && name.trim() ? name.trim() : null;
}

class AuthRepository {
    /**
     * Cadastra usuário e perfil base (SQLite).
     * @param {string} email
     * @param {string} password
     * @param {object} [metadata] — ex.: { full_name: "Nome" }
     */
    async register(email, password, metadata = {}) {
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedEmail || !password) {
            throw new Error('Email e senha são obrigatórios.');
        }

        const fullName = resolveFullName(metadata) ?? normalizedEmail.split('@')[0] ?? 'Usuário';
        const userId = randomUUID();
        const passwordHash = hashPassword(password);

        await db.exec('BEGIN IMMEDIATE');
        try {
            await db.run(
                `INSERT INTO users (id, full_name, email, password_hash)
                 VALUES (?, ?, ?, ?)`,
                [userId, fullName, normalizedEmail, passwordHash],
            );
            await db.run(`INSERT INTO profiles (id) VALUES (?)`, [userId]);
            await db.exec('COMMIT');
        } catch (err) {
            await db.exec('ROLLBACK').catch(() => {});
            if (err && String(err.message).includes('UNIQUE')) {
                throw new Error('Este email já está cadastrado.');
            }
            throw err;
        }

        return {
            user: {
                id: userId,
                email: normalizedEmail,
                full_name: fullName,
            },
            session: null,
        };
    }

    async signIn(email, password) {
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedEmail || !password) {
            throw new Error('Email e senha são obrigatórios.');
        }

        const row = await db.get(
            `SELECT id, full_name, email, password_hash FROM users WHERE email = ?`,
            [normalizedEmail],
        );

        if (!row || !verifyPassword(password, row.password_hash)) {
            throw new Error('Email ou senha inválidos.');
        }

        return {
            user: {
                id: row.id,
                email: row.email,
                full_name: row.full_name,
            },
            session: null,
        };
    }

    /**
     * Sem sessão server-side persistente; encerramento é tratado no cliente (limpar token/cookie).
     */
    async signOut() {}

        if (error) {
            throw new Error(`[${error.status}]: ${error.message}`);
        }

    /**
     * Sem JWT armazenado no servidor; use middleware futuro ou retorne null até haver sessão.
     */
    async getCurrentSession() {
        return null;
    }
}

export default AuthRepository;