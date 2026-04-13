
export default async function autenticacao() {
    try {
        const meuToken = getCookie('token');
        const response = await fetch('/autenticacao-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: meuToken })
        })

        if (response.ok) {
            const result = await response.json();
            return true;
        } else {
            console.error("Erro no servidor", response.status);
            return false;
        }
    } catch (error) {
        console.error("Erro na requisicao", erro);
        return false;
    }
}
