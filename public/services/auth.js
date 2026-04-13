const API_URL = "http://localhost:3000";

class Auth {
    async register(data) {
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.status);
            } else {
                console.error("Erro no servidor", response.status);
            }
        } catch (error) {
            console.error("Erro na requisicao", error);
        }
    }
}

export default Auth;