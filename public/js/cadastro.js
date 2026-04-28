import Auth from '../services/auth.js';

const form = document.querySelector("#registroForm");
const senha = document.getElementById('password');
const confirma = document.getElementById('confirmarSenha');
const erroMsg = document.getElementById('errorSenha');

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (senha.value !== confirma.value) {
        confirma.classList.add('invalid');
        erroMsg.style.display = 'block';
    } else {
        confirma.classList.remove('invalid');
        erroMsg.style.display = 'none';

        const formData = new FormData(event.target);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
            metadata: {
                full_name: formData.get("name")
            },
        };

        try {
            const result = await new Auth().register(data);

            alert("Cadastro realizado com sucesso!");
            window.location.href = "/login";
            return result;
        } catch (error) {
            console.error(error);
            alert(error.message);
        }

    }
});


// Lógica unificada para mostrar/ocultar senha
document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const isPassword = input.type === 'password';

        input.type = isPassword ? 'text' : 'password';
        this.textContent = isPassword ? 'ocultar' : 'ver';
    });
});