import Auth from '../services/auth.js';
import { isValidCpf, normalizeCpf, formatCpf } from '../services/cpf.js';

const form = document.querySelector('#registroForm');
const cpf = document.getElementById('cpf');
const erroCpf = document.getElementById('errorCpf');
const senha = document.getElementById('password');
const confirma = document.getElementById('confirmarSenha');
const erroMsg = document.getElementById('errorSenha');
const submitBtn = form.querySelector('button[type="submit"]');

/** Liga/desliga a mensagem de erro inline de um campo. */
function setFieldError(input, errorEl, show) {
    input.classList.toggle('invalid', show);
    if (errorEl) errorEl.style.display = show ? 'block' : 'none';
}

// Máscara de CPF enquanto digita.
cpf.addEventListener('input', () => {
    cpf.value = formatCpf(cpf.value);
    if (cpf.classList.contains('invalid')) setFieldError(cpf, erroCpf, false);
});

// Validação no front: CPF válido + senhas coincidentes.
function validate() {
    let ok = true;

    const cpfInvalid = !isValidCpf(cpf.value);
    setFieldError(cpf, erroCpf, cpfInvalid);
    if (cpfInvalid) ok = false;

    const senhaInvalid = senha.value !== confirma.value;
    setFieldError(confirma, erroMsg, senhaInvalid);
    if (senhaInvalid) ok = false;

    return ok;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const formData = new FormData(event.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        cpf: normalizeCpf(cpf.value),
        metadata: {
            full_name: formData.get('name'),
        },
    };

    submitBtn.disabled = true;
    try {
        await new Auth().register(data);
        alert('Cadastro realizado com sucesso!');
        window.location.href = '/login';
    } catch (error) {
        // Erro de duplicidade volta do backend (ex.: email/CPF já cadastrado).
        if (/email/i.test(error.message)) setFieldError(document.getElementById('email'), null, true);
        if (/cpf/i.test(error.message)) setFieldError(cpf, erroCpf, true);
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
    }
});

// Mostrar/ocultar senha.
document.querySelectorAll('.toggle-btn').forEach((button) => {
    button.addEventListener('click', function () {
        const input = document.getElementById(this.getAttribute('data-target'));
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        this.textContent = isPassword ? 'ocultar' : 'ver';
    });
});
