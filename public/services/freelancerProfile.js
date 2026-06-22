class FreelancerProfile {
    async me() {
        const response = await fetch('/api/freelancer-profile/me');
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Nao foi possivel carregar seu perfil.');
        }
        return result.profile || null;
    }

    /** Publica/atualiza o perfil de freelancer. Lança Error (com .errors) em falha. */
    async save(data) {
        const response = await fetch('/api/freelancer-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(result.message || 'Revise os campos destacados.');
            error.errors = result.errors || null;
            throw error;
        }
        return result;
    }
}

export default FreelancerProfile;
