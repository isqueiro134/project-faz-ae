import Auth from '../services/auth.js';

const nomeUsuario = document.getElementById('nomeUsuario');
const continueButton = document.getElementById('continue');
const options = document.querySelectorAll('.option');
let selectedType = 'freelancer';

const auth = new Auth();
const context = await auth.context();

if (!context) {
    window.location.href = '/login';
    throw new Error('Nao autenticado.');
}

if (context?.has_profile) {
    window.location.href = context.redirect_to;
    throw new Error('Perfil ja selecionado.');
}

nomeUsuario.textContent = context?.user?.full_name || 'profissional';
document.querySelector('[data-type="freelancer"]')?.classList.add('active');

options.forEach((option) => {
    option.addEventListener('click', () => {
        options.forEach((item) => item.classList.remove('active'));
        option.classList.add('active');
        selectedType = option.dataset.type;
    });
});

continueButton.addEventListener('click', async () => {
    continueButton.disabled = true;
    try {
        const profileType = selectedType === 'cliente' ? 'client' : 'freelancer';
        const result = await auth.selectProfile(profileType);
        window.location.href = result.redirect_to;
    } catch (error) {
        alert(error.message);
        continueButton.disabled = false;
    }
});
