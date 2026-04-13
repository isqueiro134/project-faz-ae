import BaseRepository from "./BaseRepository.js";

class UserRepository extends BaseRepository {
    async getAll() {
        try {
            const results = await super.getAll('profiles', ['id', 'full_name', 'user_type']);
            return results;
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            const result = await super.getById('profiles', ['id', 'full_name', 'user_type'], id);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default UserRepository;