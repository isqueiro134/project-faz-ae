import connectDB from '../config/db.js';
const db = await connectDB();

class BaseRepository {
    async getAll(table, columnsArray) {
        try {
            const query = db.all(`SELECT ${columnsArray.join()} FROM ${table}`);
            const results = await query;
            return results;
        } catch (error) {
            console.error(`✗ Error getting all from ${table}: ${error.message}`);
            throw error;
        }
    }

    async getById(table, columnsArray, id) {
        try {
            const query = db.get(`SELECT ${columnsArray.join()} FROM ${table} WHERE id = ?`, [id]);
            const result = await query;
            return result;
        } catch (error) {
            console.error(`✗ Error getting by id ${id} from ${table}: ${error.message}`);
            throw error;
        }
    }

    async insertOne(table, columnsArray, valuesArray) {
        try {
            const query = db.run(`INSERT INTO ${table} (${columnsArray.join(',')}) VALUES (${valuesArray.join(',')})`);
            const result = await query;
            return result.lastID;
        } catch (error) {
            console.error(`✗ Error inserting into ${table}: ${error.message}`);
            throw error;
        }
    }

    async updateOne(table, columnsArray, valuesArray, id) {
        try {
            const query = db.run(`UPDATE ${table} SET ${columnsArray.join(' = ?, ')} = ? WHERE id = ?`, [...valuesArray, id]);
            const result = await query;
            return result.changes;
        } catch (error) {
            console.error(`✗ Error updating ${table} by id ${id}: ${error.message}`);
            throw error;
        }
    }

    async deleteOne(table, id) {
        try {
            const query = db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
            return query.changes;
        } catch (error) {
            console.error(`✗ Error deleting ${table} by id ${id}: ${error.message}`);
            throw error;
        }
    }
}

export default BaseRepository;