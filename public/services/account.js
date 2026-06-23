class Account {
    async close(data) {
        const response = await fetch('/api/users/me', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Não foi possível encerrar sua conta.');
        }

        return result;
    }
}

export default Account;
