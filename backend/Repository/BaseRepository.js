import supabase from '../config/db.js';

class BaseRepository {
    async getAll(table, columnsArray) {
        try {
            const query = supabase.from(`${table}`).select(`${columnsArray.join()}`).throwOnError();
            const results = await query;
            return results;
        } catch (error) {
            throw error;
        }
    }

    async getById(table, columnsArray, id) {
        try {
            const query = supabase.from(`${table}`).select(`${columnsArray.join()}`).eq('id', `${id}`).throwOnError();
            const result = await query;
            return result;
        } catch (error) {
            throw error;
        }
    }

    async insertOne(table, data) {
        try {
            const query = supabase.from(`${table}`).insert(`${data}`).throwOnError();
            const result = await query;
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default BaseRepository;