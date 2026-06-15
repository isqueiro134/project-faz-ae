import Auth from '../services/auth.js';

const nomeUsuario = document.getElementById('nomeUsuario');
const continueButton = document.getElementById('continue');
const options = document.querySelectorAll('.option');
let selectedType = 'freelancer';

// Usuário autenticado vem da sessão (cookie). Fallback p/ localStorage.
const auth = new Auth();
const sessionUser = await auth.me();
const user = sessionUser || JSON.parse(localStorage.getItem('fazAeUser') || 'null');
if (sessionUser) localStorage.setItem('fazAeUser', JSON.stringify(sessionUser));

nomeUsuario.textContent = user?.full_name || 'profissional';
document.querySelector('[data-type="freelancer"]')?.classList.add('active');

options.forEach((option) => {
    option.addEventListener('click', () => {
        options.forEach((item) => item.classList.remove('active'));
        option.classList.add('active');
        selectedType = option.dataset.type;
    });
});

continueButton.addEventListener('click', () => {
    window.location.href = selectedType === 'freelancer' ? '/completar-perfil' : '/dashboard';
});
