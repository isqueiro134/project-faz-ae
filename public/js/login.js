import Auth from '../services/auth.js';

const loginForm = document.getElementById('loginForm');
const inputSenha = document.getElementById('senha');
const btnToggle = document.getElementById('toggleSenha');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    try {
        const result = await new Auth().login(data);

        alert("Login realizado com sucesso!");
        window.location.href = "/onboarding";
        return result;
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
})

// Lógica de mostrar/ocultar senha
btnToggle.addEventListener('click', () => {
    const isPassword = inputSenha.type === 'password';
    inputSenha.type = isPassword ? 'text' : 'password';
    btnToggle.textContent = isPassword ? 'ocultar' : 'ver';
    btnToggle.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
});