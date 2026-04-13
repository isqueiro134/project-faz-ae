document.querySelector("#recuperarSenhaBT").addEventListener('click', async (event) => {

    const user = document.querySelector("#usuario").value;

    try {
        const response = await fetch('/recuperar-senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })

        if (response.ok) {
            const result = await response.json();
        } else {
            console.error("Erro no servidor", response.status);
        }
    } catch (error) {
        console.error("Erro na requisicao", erro);
    }
})