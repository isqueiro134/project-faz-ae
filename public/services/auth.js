class Auth {
    async register(data) {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Não foi possível criar sua conta.');
        }

        localStorage.setItem('fazAeUser', JSON.stringify(result.user));
        return result;
    }

    async login(data) {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Email ou senha inválidos.');
        }

        localStorage.setItem('fazAeUser', JSON.stringify(result.user));
        return result;
    }

    async context() {
        const response = await fetch('/api/auth/context');
        if (!response.ok) return null;
        return response.json().catch(() => null);
    }

    async selectProfile(profileType) {
        const response = await fetch('/api/profiles/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile_type: profileType }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Nao foi possivel selecionar o perfil.');
        }
        return result;
    }

    async getById(id) {
        const response = await fetch(`/api/users/${id}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Usuário não encontrado.');
        }
        return result;
    }

    /** Retorna o usuário autenticado pelo cookie de sessão, ou null. */
    async me() {
        const response = await fetch('/api/auth/me');
        if (!response.ok) return null;
        const result = await response.json().catch(() => ({}));
        return result.user || null;
    }

    /** Encerra a sessão no servidor e limpa o estado local. */
    async logout() {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || 'Não foi possível encerrar a sessão.');
        }

        localStorage.removeItem('fazAeUser');
        return result;
    }

    /** Solicita recuperação de senha (resposta genérica do backend). */
    async recoverPassword(identifier) {
        const response = await fetch('/api/users/recover-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Não foi possível processar a solicitação.');
        }
        return result;
    }
}

export default Auth;
