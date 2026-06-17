import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import connectDB from '../config/db.js';
import { isValidCpf, normalizeCpf } from '../utils/cpf.js';

const db = await connectDB();

const SALT_BYTES = 16;
const KEY_BYTES = 64;

/** Erro com status HTTP para o router mapear na resposta. */
function httpError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

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
    async register(email, password, metadata = {}, cpf = null) {
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedEmail || !password) {
            throw httpError('Email e senha são obrigatórios.', 400);
        }

        const normalizedCpf = normalizeCpf(cpf);
        if (!normalizedCpf) throw httpError('CPF é obrigatório.', 400);
        if (!isValidCpf(normalizedCpf)) throw httpError('CPF inválido.', 400);

        const fullName = resolveFullName(metadata) ?? normalizedEmail.split('@')[0] ?? 'Usuário';
        const userId = randomUUID();
        const passwordHash = hashPassword(password);

        await db.exec('BEGIN IMMEDIATE');
        try {
            await db.run(
                `INSERT INTO users (id, full_name, email, cpf, password_hash)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, fullName, normalizedEmail, normalizedCpf, passwordHash],
            );
            await db.run(`INSERT INTO profiles (id, user_type) VALUES (?, NULL)`, [userId]);
            await db.exec('COMMIT');
        } catch (err) {
            await db.exec('ROLLBACK').catch(() => {});
            const message = String(err && err.message);
            if (message.includes('UNIQUE') && message.includes('cpf')) {
                throw httpError('Este CPF já está cadastrado.', 409);
            }
            if (message.includes('UNIQUE')) {
                throw httpError('Este email já está cadastrado.', 409);
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
            throw httpError('Email e senha são obrigatórios.', 400);
        }

        const row = await db.get(
            `SELECT id, full_name, email, password_hash FROM users WHERE email = ?`,
            [normalizedEmail],
        );

        if (!row || !verifyPassword(password, row.password_hash)) {
            throw httpError('Email ou senha inválidos.', 401);
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

    /**
     * Sem JWT armazenado no servidor; use middleware futuro ou retorne null até haver sessão.
     */
    async getCurrentSession() {
        return null;
    }
}

export default AuthRepository;
