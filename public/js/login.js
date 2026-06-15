import Auth from '../services/auth.js';

const loginForm = document.getElementById('loginForm');
const inputSenha = document.getElementById('password');
const btnToggle = document.getElementById('toggleSenha');
const loginMsg = document.getElementById('loginMsg');
const submitBtn = loginForm.querySelector('button[type="submit"]');

/** Exibe mensagem inline (error | success). */
function showMsg(text, type = 'error') {
    loginMsg.textContent = text;
    loginMsg.className = `form-msg show ${type}`;
}

function clearMsg() {
    loginMsg.textContent = '';
    loginMsg.className = 'form-msg';
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMsg();

    const formData = new FormData(event.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    submitBtn.disabled = true;
    try {
        await new Auth().login(data);
        window.location.href = '/onboarding';
    } catch (error) {
        showMsg(error.message);
    } finally {
        submitBtn.disabled = false;
    }
});

// Mostrar/ocultar senha.
btnToggle.addEventListener('click', () => {
    const isPassword = inputSenha.type === 'password';
    inputSenha.type = isPassword ? 'text' : 'password';
    btnToggle.textContent = isPassword ? 'ocultar' : 'ver';
    btnToggle.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
});
