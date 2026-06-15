const nomeUsuario = document.getElementById('nomeUsuario');
const continueButton = document.getElementById('continue');
const options = document.querySelectorAll('.option');
let selectedType = 'freelancer';

const user = JSON.parse(localStorage.getItem('fazAeUser') || 'null');
const firstName = user?.full_name.split(' ')[0];
nomeUsuario.textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() || 'profissional';
document.querySelector('[data-type="freelancer"]')?.classList.add('active');

options.forEach((option) => {
    option.addEventListener('click', () => {
        options.forEach((item) => item.classList.remove('active'));
        option.classList.add('active');
        selectedType = option.dataset.type;
    });
});

continueButton.addEventListener('click', () => {
    window.location.href = selectedType === 'freelancer' ? "/completar-perfil" : "/dashboard";
});
