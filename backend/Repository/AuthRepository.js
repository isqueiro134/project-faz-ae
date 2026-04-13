import { supabase } from "../config/db";

class AuthRepository {
    // 1. Register
    async register(email, password, metadata) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: metadata }
        });

        if (error) {
            throw new Error(`[${error.status}]: ${error.message}`);
        }

        return data;
    }

    // 2. Sign In
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(`[${error.status}]: ${error.message}`);
        }

        return data;
    }

    // 3. Logout
    async signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(`[${error.status}]: ${error.message}`);
        }

    }

    // 4. Reset Password
    async resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            throw new Error(`[${error.status}]: ${error.message}`);
        }

        return data;
    }

    // 5. Get Current Session (Este é síncrono ou retorna direto, raramente falha)
    async getCurrentSession() {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new Error(`[${error.status}]: ${error.message}`);
        }

        return data.session;
    }
}

export default AuthRepository;