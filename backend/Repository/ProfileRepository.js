import { randomUUID } from 'crypto';
import connectDB from '../config/db.js';

const db = await connectDB();

function resolveRedirect(profileType) {
    if (profileType === 'client') return '/dashboard-cliente';
    if (profileType === 'freelancer') return '/dashboard-freelancer';
    return '/onboarding';
}

class ProfileRepository {
    async getContext(user) {
        const [baseProfile, clientProfile, freelancerProfile] = await Promise.all([
            db.get(`SELECT * FROM profiles WHERE id = ?`, [user.id]),
            db.get(`SELECT * FROM client_profiles WHERE user_id = ?`, [user.id]),
            db.get(`SELECT * FROM freelancer_profiles WHERE user_id = ?`, [user.id]),
        ]);

        const profileType = clientProfile ? 'client' : freelancerProfile ? 'freelancer' : null;

        return {
            user,
            profile_type: profileType,
            has_profile: Boolean(profileType),
            redirect_to: resolveRedirect(profileType),
            base_profile: baseProfile || null,
            profile: profileType === 'client' ? clientProfile : freelancerProfile || null,
        };
    }

    async updateBaseProfile(userId, data) {
        await db.run(
            `UPDATE profiles
             SET avatar_url = ?, bio = ?, phone = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
             WHERE id = ?`,
            [
                data.avatar_url?.trim() || null,
                data.bio?.trim() || null,
                data.phone?.trim() || null,
                userId,
            ],
        );

        return db.get(`SELECT * FROM profiles WHERE id = ?`, [userId]);
    }

    async selectProfile(userId, profileType) {
        if (!['client', 'freelancer'].includes(profileType)) {
            const error = new Error('Tipo de perfil invalido.');
            error.status = 400;
            throw error;
        }

        const context = await this.getContext({ id: userId });
        if (context.has_profile) {
            const error = new Error('Usuario ja possui perfil cadastrado.');
            error.status = 409;
            throw error;
        }

        await db.exec('BEGIN IMMEDIATE');
        try {
            await db.run(`INSERT OR IGNORE INTO profiles (id, user_type) VALUES (?, NULL)`, [userId]);
            await db.run(
                `UPDATE profiles
                 SET user_type = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE id = ?`,
                [profileType, userId],
            );

            if (profileType === 'client') {
                await db.run(
                    `INSERT INTO client_profiles (id, user_id) VALUES (?, ?)`,
                    [randomUUID(), userId],
                );
            } else {
                await db.run(
                    `INSERT INTO freelancer_profiles (id, user_id, status) VALUES (?, ?, 'draft')`,
                    [randomUUID(), userId],
                );
            }

            await db.exec('COMMIT');
        } catch (error) {
            await db.exec('ROLLBACK').catch(() => {});
            throw error;
        }

        return {
            profile_type: profileType,
            has_profile: true,
            redirect_to: resolveRedirect(profileType),
        };
    }
}

export default ProfileRepository;
