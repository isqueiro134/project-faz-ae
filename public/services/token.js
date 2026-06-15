// O token de sessão fica em cookie HttpOnly (inacessível ao JS).
// A verificação é feita no servidor via /api/auth/me.

/** Retorna true se houver sessão válida. */
export default async function autenticacao() {
    try {
        const response = await fetch('/api/auth/me');
        return response.ok;
    } catch (error) {
        console.error('Erro ao verificar sessão', error);
        return false;
    }
}
