import autenticacao from "../services/token.js";
import Auth from "../services/auth.js";

if (!autenticacao) {
    window.location.href = "/login";
}

const nomeUsuario = document.getElementById('nomeUsuario');
const continueButton = document.getElementById('continue');

nomeUsuario.addEventListener('change', async () => {
    try {
        const result = await new Auth().getById();

        alert("Login realizado com sucesso!");
        window.location.href = "/onboarding";
        return result;
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
})
continueButton.addEventListener('click', () => {
    window.location.href = "/dashboard";
});