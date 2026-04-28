import BaseRepository from "./BaseRepository.js";
import connectDB from '../config/db.js';

const db = await connectDB();

class UserRepository extends BaseRepository {
    async getByEmail(email) {
        try {
            const query = db.get(`SELECT id, email, password_hash FROM users WHERE email = ?`, [email]);    
            const result = await query;
            return result;
        } catch (error) {
            console.error(`✗ Error getting user by email ${email}: ${error.message}`);
            throw error;
        }
    }

    async getAll() {
        try {
            const results = await super.getAll('users', ['id', 'full_name', 'email', 'password_hash']);
            return results;
        } catch (error) {
            console.error(`✗ Error getting all users: ${error.message}`);
            throw error;
        }
    }

    async getById(id) {
        try {
            const result = await super.getById('users', ['id', 'full_name', 'email'], id);
            return result;
        } catch (error) {
            console.error(`✗ Error getting user by id ${id}: ${error.message}`);
            throw error;
        }
    }

    async insertOne(email, password, fullName) {
        try {
            const result = await super.insertOne('users', ['email', 'password_hash', 'full_name'], [email, password, fullName]);
            return result;
        } catch (error) {
            console.error(`✗ Error inserting user: ${error.message}`);
            throw error;
        }
    }

    async updateOne(id, columnsArray, valuesArray) {
        try {
            const result = await super.updateOne('users', columnsArray, valuesArray, id);
            return result;
        } catch (error) {
            console.error(`✗ Error updating user: ${error.message}`);
            throw error;
        }
    }

    async deleteOne(id) {
        try {
            const result = await super.deleteOne('users', id);
            return result;
        } catch (error) {
            console.error(`✗ Error deleting user: ${error.message}`);
            throw error;
        }
    }
}

export default UserRepository;