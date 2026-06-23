import Auth from '../services/auth.js';

const logoutButton = document.querySelector('[data-logout]');

logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    logoutButton.setAttribute('aria-busy', 'true');

    try {
        await new Auth().logout();
        window.location.assign('/');
    } catch (error) {
        logoutButton.disabled = false;
        logoutButton.removeAttribute('aria-busy');
        window.alert(error.message || 'Não foi possível sair. Tente novamente.');
    }
});
