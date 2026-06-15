import Auth from '../services/auth.js';

const botao = document.querySelector('#recuperarSenhaBT');
const campo = document.querySelector('#usuario');
const msg = document.querySelector('#recuperarMsg');

function showMsg(text, type = 'error') {
    msg.textContent = text;
    msg.className = `recuperar-msg show ${type}`;
}

botao.addEventListener('click', async () => {
    const identifier = campo.value.trim();

    if (!identifier) {
        showMsg('Informe seu email ou CPF.');
        campo.focus();
        return;
    }

    botao.disabled = true;
    try {
        const result = await new Auth().recoverPassword(identifier);
        showMsg(result.message, 'success');
    } catch (error) {
        showMsg(error.message);
    } finally {
        botao.disabled = false;
    }
});
