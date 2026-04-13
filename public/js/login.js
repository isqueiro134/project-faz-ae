const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/efetua-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })

        if (response.ok) {
            const result = await response.json();
            console.log("deu certo");
            console.log(result);
        } else {
            console.error("Erro no servidor", response.status);
        }
    } catch (error) {
        console.error("Erro na requisicao", erro);
    }
})

const inputSenha = document.getElementById('senha');
const btnToggle = document.getElementById('toggleSenha');


// Lógica de mostrar/ocultar senha
btnToggle.addEventListener('click', () => {
    const isPassword = inputSenha.type === 'password';
    inputSenha.type = isPassword ? 'text' : 'password';
    btnToggle.textContent = isPassword ? 'ocultar' : 'ver';
    btnToggle.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
});