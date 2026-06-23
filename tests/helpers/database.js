import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function findFreelancerByEmail(email) {
    const db = await open({ filename: process.env.SQLITE_DB_PATH, driver: sqlite3.Database });

    try {
        const profile = await db.get(
            `SELECT
                u.full_name,
                u.email,
                f.professional_title,
                f.category,
                f.hourly_rate,
                f.project_rate_min,
                f.skills,
                f.portfolio_items,
                f.availability_status,
                f.status
             FROM users u
             JOIN freelancer_profiles f ON f.user_id = u.id
             WHERE u.email = ?`,
            [email],
        );

        if (!profile) return null;

        return {
            ...profile,
            skills: JSON.parse(profile.skills || '[]'),
            portfolio_items: JSON.parse(profile.portfolio_items || '[]'),
        };
    } finally {
        await db.close();
    }
}

export async function setFreelancerAvailability(email, availabilityStatus) {
    const db = await open({ filename: process.env.SQLITE_DB_PATH, driver: sqlite3.Database });
    try {
        await db.run(
            `UPDATE freelancer_profiles
             SET availability_status = ?
             WHERE user_id = (SELECT id FROM users WHERE email = ?)`,
            [availabilityStatus, email],
        );
    } finally {
        await db.close();
    }
}

export async function findHiring(clientEmail, freelancerEmail) {
    const db = await open({ filename: process.env.SQLITE_DB_PATH, driver: sqlite3.Database });
    try {
        return db.get(
            `SELECT h.*, fp.availability_status
             FROM freelancer_hirings h
             INNER JOIN client_profiles cp ON cp.id = h.client_id
             INNER JOIN users client_user ON client_user.id = cp.user_id
             INNER JOIN freelancer_profiles fp ON fp.id = h.freelancer_id
             INNER JOIN users freelancer_user ON freelancer_user.id = fp.user_id
             WHERE client_user.email = ? AND freelancer_user.email = ?`,
            [clientEmail, freelancerEmail],
        );
    } finally {
        await db.close();
    }
}

export async function countHiringsForFreelancer(email) {
    const db = await open({ filename: process.env.SQLITE_DB_PATH, driver: sqlite3.Database });
    try {
        const result = await db.get(
            `SELECT COUNT(*) AS total
             FROM freelancer_hirings h
             INNER JOIN freelancer_profiles fp ON fp.id = h.freelancer_id
             INNER JOIN users u ON u.id = fp.user_id
             WHERE u.email = ?`,
            [email],
        );
        return result.total;
    } finally {
        await db.close();
    }
}
