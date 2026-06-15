import { randomUUID, randomBytes } from 'crypto';
import connectDB from '../config/db.js';

const db = await connectDB();

/** Duração da sessão: 7 dias (em segundos). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

class SessionRepository {
    /** Cria uma sessão opaca e retorna { token, expiresAt }. */
    async create(userId) {
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

        await db.run(
            `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
            [randomUUID(), userId, token, expiresAt],
        );

        return { token, expiresAt };
    }

    /** Retorna o usuário da sessão se o token for válido e não expirado; senão null. */
    async findUserByToken(token) {
        if (!token) return null;

        const row = await db.get(
            `SELECT s.token, s.expires_at, u.id, u.full_name, u.email
             FROM sessions s
             JOIN users u ON u.id = s.user_id
             WHERE s.token = ?`,
            [token],
        );

        if (!row) return null;

        if (new Date(row.expires_at).getTime() <= Date.now()) {
            await this.deleteByToken(token);
            return null;
        }

        return { id: row.id, full_name: row.full_name, email: row.email };
    }

    async deleteByToken(token) {
        if (!token) return;
        await db.run(`DELETE FROM sessions WHERE token = ?`, [token]);
    }
}

export default SessionRepository;
