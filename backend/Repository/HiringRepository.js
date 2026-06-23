import { randomUUID } from 'crypto';
import connectDB from '../config/db.js';

const db = await connectDB();

function httpError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

const hiringSelect = `SELECT
    h.id,
    h.status,
    h.created_at,
    fp.id AS freelancer_id,
    fp.professional_title,
    fp.category,
    fp.hourly_rate,
    fp.project_rate_min,
    fp.pricing_model,
    fp.availability_status,
    u.full_name AS freelancer_name
FROM freelancer_hirings h
INNER JOIN freelancer_profiles fp ON fp.id = h.freelancer_id
INNER JOIN users u ON u.id = fp.user_id`;

class HiringRepository {
    async listByClientUserId(userId) {
        return db.all(
            `${hiringSelect}
             INNER JOIN client_profiles cp ON cp.id = h.client_id
             WHERE cp.user_id = ?
             ORDER BY h.created_at DESC`,
            [userId],
        );
    }

    async create(clientUserId, freelancerId) {
        if (!freelancerId) throw httpError('Freelancer obrigatorio.', 400);

        await db.exec('BEGIN IMMEDIATE');
        try {
            const client = await db.get(
                'SELECT id FROM client_profiles WHERE user_id = ?',
                [clientUserId],
            );
            if (!client) throw httpError('Ambiente incompativel.', 403);

            const freelancer = await db.get(
                `SELECT id, status, availability_status
                 FROM freelancer_profiles
                 WHERE id = ?`,
                [freelancerId],
            );
            if (!freelancer || freelancer.status !== 'published') {
                throw httpError('Freelancer nao encontrado.', 404);
            }
            if (freelancer.availability_status !== 'available') {
                throw httpError('Este profissional esta indisponivel para contratacao.', 409);
            }

            const hiringId = randomUUID();
            await db.run(
                `INSERT INTO freelancer_hirings (id, client_id, freelancer_id, status)
                 VALUES (?, ?, ?, 'pending')`,
                [hiringId, client.id, freelancer.id],
            );
            const update = await db.run(
                `UPDATE freelancer_profiles
                 SET availability_status = 'busy',
                     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE id = ? AND availability_status = 'available'`,
                [freelancer.id],
            );
            if (update.changes !== 1) {
                throw httpError('Este profissional esta indisponivel para contratacao.', 409);
            }

            await db.exec('COMMIT');
            return db.get(`${hiringSelect} WHERE h.id = ?`, [hiringId]);
        } catch (error) {
            await db.exec('ROLLBACK').catch(() => {});
            if (String(error.message).includes('UNIQUE')) {
                throw httpError('Este profissional esta indisponivel para contratacao.', 409);
            }
            throw error;
        }
    }
}

export default HiringRepository;
