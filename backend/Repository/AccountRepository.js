import { randomUUID } from 'crypto';
import connectDB from '../config/db.js';

const db = await connectDB();

export const ACCOUNT_CLOSURE_REASONS = new Set([
    'no_longer_uses',
    'difficult_to_use',
    'missing_features',
    'service_quality',
    'privacy',
    'another_account',
    'other',
]);

function httpError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function validateClosureData(reason, details) {
    const normalizedReason = typeof reason === 'string' ? reason.trim() : '';
    const normalizedDetails = typeof details === 'string' ? details.trim() : '';

    if (!ACCOUNT_CLOSURE_REASONS.has(normalizedReason)) {
        throw httpError('Selecione um motivo válido para encerrar a conta.', 400);
    }
    if (normalizedReason === 'other' && !normalizedDetails) {
        throw httpError('Descreva o outro motivo para encerrar a conta.', 400);
    }
    if (normalizedDetails.length > 1000) {
        throw httpError('A descrição deve ter no máximo 1.000 caracteres.', 400);
    }

    return {
        reason: normalizedReason,
        details: normalizedDetails || null,
    };
}

async function getExistingTables() {
    const rows = await db.all(
        `SELECT name FROM sqlite_master WHERE type = 'table'`,
    );
    return new Set(rows.map((row) => row.name));
}

async function ensureAccountWasRemoved(userId, tables) {
    const checks = [
        ['users', 'id'],
        ['sessions', 'user_id'],
        ['profiles', 'id'],
        ['client_profiles', 'user_id'],
        ['freelancer_profiles', 'user_id'],
        ['jobs', 'client_id'],
        ['proposals', 'freelancer_id'],
    ];

    for (const [table, column] of checks) {
        if (!tables.has(table)) continue;
        const row = await db.get(
            `SELECT 1 AS found FROM ${table} WHERE ${column} = ? LIMIT 1`,
            [userId],
        );
        if (row) throw new Error(`Falha ao remover dados da tabela ${table}.`);
    }

    if (tables.has('reviews')) {
        const review = await db.get(
            `SELECT 1 AS found
             FROM reviews
             WHERE from_user_id = ? OR to_user_id = ?
             LIMIT 1`,
            [userId, userId],
        );
        if (review) throw new Error('Falha ao remover avaliações da conta.');
    }
}

class AccountRepository {
    async closeAccount(userId, reason, details) {
        const closure = validateClosureData(reason, details);
        const tables = await getExistingTables();

        await db.exec('BEGIN IMMEDIATE');
        try {
            const [clientProfile, freelancerProfile] = await Promise.all([
                tables.has('client_profiles')
                    ? db.get(`SELECT 1 FROM client_profiles WHERE user_id = ?`, [userId])
                    : null,
                tables.has('freelancer_profiles')
                    ? db.get(`SELECT 1 FROM freelancer_profiles WHERE user_id = ?`, [userId])
                    : null,
            ]);

            const profileType = clientProfile && freelancerProfile
                ? 'both'
                : clientProfile
                    ? 'client'
                    : freelancerProfile
                        ? 'freelancer'
                        : 'none';

            await db.run(
                `INSERT INTO account_closure_feedback (id, reason, details, profile_type)
                 VALUES (?, ?, ?, ?)`,
                [randomUUID(), closure.reason, closure.details, profileType],
            );

            if (tables.has('reviews')) {
                if (tables.has('jobs')) {
                    await db.run(
                        `DELETE FROM reviews
                         WHERE from_user_id = ?
                            OR to_user_id = ?
                            OR job_id IN (SELECT id FROM jobs WHERE client_id = ?)`,
                        [userId, userId, userId],
                    );
                } else {
                    await db.run(
                        `DELETE FROM reviews WHERE from_user_id = ? OR to_user_id = ?`,
                        [userId, userId],
                    );
                }
            }

            const result = await db.run(`DELETE FROM users WHERE id = ?`, [userId]);
            if (result.changes !== 1) {
                throw httpError('Conta não encontrada.', 404);
            }

            await ensureAccountWasRemoved(userId, tables);
            await db.exec('COMMIT');

            return { profile_type: profileType };
        } catch (error) {
            await db.exec('ROLLBACK').catch(() => {});
            throw error;
        }
    }
}

export default AccountRepository;
