import { randomUUID } from 'crypto';
import connectDB from '../config/db.js';

const db = await connectDB();

const profileColumns = {
    category: 'TEXT NULL',
    level: 'TEXT NULL',
    location: 'TEXT NULL',
    languages: "TEXT NOT NULL DEFAULT '[]'",
    tools: "TEXT NOT NULL DEFAULT '[]'",
    niches: "TEXT NOT NULL DEFAULT '[]'",
    project_types: "TEXT NOT NULL DEFAULT '[]'",
    availability: 'TEXT NULL',
    work_model: 'TEXT NULL',
    experience_years: 'INTEGER NULL',
    result_highlight: 'TEXT NULL',
    education: 'TEXT NULL',
    links: "TEXT NOT NULL DEFAULT '{}'",
    portfolio_items: "TEXT NOT NULL DEFAULT '[]'",
    pricing_model: 'TEXT NULL',
    project_rate_min: 'REAL NULL',
    project_rate_max: 'REAL NULL',
    response_time: 'TEXT NULL',
    project_size: 'TEXT NULL',
    urgent_projects: 'INTEGER NOT NULL DEFAULT 0',
    profile_strength: 'INTEGER NOT NULL DEFAULT 0',
    status: "TEXT NOT NULL DEFAULT 'draft'",
    rating_average: 'REAL DEFAULT 0.0',
    total_reviews: 'INTEGER DEFAULT 0',
    completed_jobs: 'INTEGER DEFAULT 0',
};

function parseJson(value, fallback) {
    if (!value) return fallback;

    try {
        return JSON.parse(value);
    } catch (_) {
        return fallback;
    }
}

class FreelancerProfileRepository {
    async ensureColumns() {
        const columns = await db.all(`PRAGMA table_info(freelancer_profiles)`);
        const existing = new Set(columns.map((column) => column.name));

        for (const [name, definition] of Object.entries(profileColumns)) {
            if (!existing.has(name)) {
                await db.run(`ALTER TABLE freelancer_profiles ADD COLUMN ${name} ${definition}`);
            }
        }
    }

    async upsert(data) {
        await this.ensureColumns();

        const userId = data.user_id;
        const row = await db.get(`SELECT id FROM freelancer_profiles WHERE user_id = ?`, [userId]);
        const values = this.mapValues(data);

        await db.run(`UPDATE profiles SET user_type = 'freelancer', bio = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`, [
            values.bio,
            userId,
        ]);

        if (row) {
            await db.run(
                `UPDATE freelancer_profiles SET
                    professional_title = ?,
                    hourly_rate = ?,
                    skills = ?,
                    portfolio_url = ?,
                    category = ?,
                    level = ?,
                    location = ?,
                    languages = ?,
                    tools = ?,
                    niches = ?,
                    project_types = ?,
                    availability = ?,
                    work_model = ?,
                    experience_years = ?,
                    result_highlight = ?,
                    education = ?,
                    links = ?,
                    portfolio_items = ?,
                    pricing_model = ?,
                    project_rate_min = ?,
                    project_rate_max = ?,
                    response_time = ?,
                    project_size = ?,
                    urgent_projects = ?,
                    profile_strength = ?,
                    status = ?,
                    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                 WHERE user_id = ?`,
                [...Object.values(values).slice(0, -1), userId],
            );
        } else {
            await db.run(
                `INSERT INTO freelancer_profiles (
                    id, user_id, professional_title, hourly_rate, skills, portfolio_url,
                    category, level, location, languages, tools, niches, project_types,
                    availability, work_model, experience_years, result_highlight, education,
                    links, portfolio_items, pricing_model, project_rate_min, project_rate_max,
                    response_time, project_size, urgent_projects, profile_strength, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [randomUUID(), userId, ...Object.values(values).slice(0, -1)],
            );
        }

        return { user_id: userId, status: values.status, profile_strength: values.profile_strength };
    }

    async listPublished() {
        await this.ensureColumns();

        const rows = await db.all(
            `SELECT
                fp.id,
                fp.user_id,
                u.full_name,
                p.avatar_url,
                p.bio,
                fp.professional_title,
                fp.category,
                fp.skills,
                fp.location,
                fp.hourly_rate,
                fp.pricing_model,
                fp.project_rate_min,
                fp.project_rate_max,
                fp.rating_average,
                fp.total_reviews,
                fp.completed_jobs,
                fp.availability,
                fp.response_time,
                fp.portfolio_items,
                fp.links
            FROM freelancer_profiles fp
            INNER JOIN users u ON u.id = fp.user_id
            INNER JOIN profiles p ON p.id = fp.user_id
            WHERE fp.status = 'published'
            ORDER BY fp.rating_average DESC, fp.completed_jobs DESC, u.full_name ASC`,
        );

        return rows.map((row) => ({
            ...row,
            skills: parseJson(row.skills, []),
            portfolio_items: parseJson(row.portfolio_items, []),
            links: parseJson(row.links, {}),
        }));
    }

    async findByUserId(userId) {
        await this.ensureColumns();

        const row = await db.get(
            `SELECT
                fp.*,
                p.bio
            FROM freelancer_profiles fp
            INNER JOIN profiles p ON p.id = fp.user_id
            WHERE fp.user_id = ?`,
            [userId],
        );

        if (!row) return null;

        return {
            ...row,
            skills: parseJson(row.skills, []),
            languages: parseJson(row.languages, []),
            tools: parseJson(row.tools, []),
            niches: parseJson(row.niches, []),
            project_types: parseJson(row.project_types, []),
            links: parseJson(row.links, {}),
            portfolio_items: parseJson(row.portfolio_items, []),
            urgent_projects: Boolean(row.urgent_projects),
        };
    }

    mapValues(data) {
        return {
            professional_title: data.professional_title,
            hourly_rate: data.hourly_rate || null,
            skills: JSON.stringify(data.skills || []),
            portfolio_url: data.portfolio_url || null,
            category: data.category,
            level: data.level,
            location: data.location || null,
            languages: JSON.stringify(data.languages || []),
            tools: JSON.stringify(data.tools || []),
            niches: JSON.stringify(data.niches || []),
            project_types: JSON.stringify(data.project_types || []),
            availability: data.availability,
            work_model: data.work_model,
            experience_years: data.experience_years || null,
            result_highlight: data.result_highlight || null,
            education: data.education || null,
            links: JSON.stringify(data.links || {}),
            portfolio_items: JSON.stringify(data.portfolio_items || []),
            pricing_model: data.pricing_model,
            project_rate_min: data.project_rate_min || null,
            project_rate_max: data.project_rate_max || null,
            response_time: data.response_time || null,
            project_size: data.project_size || null,
            urgent_projects: data.urgent_projects ? 1 : 0,
            profile_strength: data.profile_strength || 0,
            status: data.status === 'published' ? 'published' : 'draft',
            bio: data.bio,
        };
    }
}

export default FreelancerProfileRepository;
