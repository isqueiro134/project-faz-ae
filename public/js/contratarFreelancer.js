import Auth from '../services/auth.js';

const context = await new Auth().context();

if (!context) {
    window.location.href = '/login';
    throw new Error('Nao autenticado.');
}

if (context.profile_type !== 'client') {
    window.location.href = context.redirect_to || '/onboarding';
    throw new Error('Ambiente incompativel.');
}

const freelancerId = new URLSearchParams(window.location.search).get('freelancer_id');
const state = document.getElementById('hiring-state');
const summary = document.getElementById('hiring-summary');
const alert = document.getElementById('hiring-alert');
const confirmButton = document.getElementById('confirm-hiring');
let freelancer = null;

const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function resolvePrice(profile) {
    const value = profile.project_rate_min || profile.hourly_rate;
    if (!value) return 'A combinar';
    const suffix = profile.pricing_model === 'hourly' ? '/h' : '';
    return `${currency.format(Number(value))}${suffix}`;
}

function showError(message) {
    alert.textContent = message;
    confirmButton.disabled = true;
}

function renderProfile(profile) {
    document.getElementById('hiring-avatar').textContent = (profile.full_name || 'F').charAt(0).toUpperCase();
    document.getElementById('hiring-name').textContent = profile.full_name;
    document.getElementById('hiring-professional-title').textContent = profile.professional_title || 'Perfil profissional';
    document.getElementById('hiring-category').textContent = profile.category || 'Geral';
    document.getElementById('hiring-price').textContent = resolvePrice(profile);
    document.getElementById('hiring-availability').textContent = profile.availability || 'A combinar';
    document.getElementById('hiring-bio').textContent = profile.bio || 'Bio não informada.';
    state.hidden = true;
    summary.hidden = false;

    if (profile.availability_status !== 'available') {
        showError('Este profissional está indisponível para contratação.');
        return;
    }

    confirmButton.disabled = false;
}

async function loadFreelancer() {
    if (!freelancerId) {
        state.textContent = 'Freelancer não informado.';
        return;
    }

    try {
        const response = await fetch(`/api/freelancer-profile/${encodeURIComponent(freelancerId)}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'Não foi possível carregar o profissional.');
        freelancer = result.freelancer;
        renderProfile(freelancer);
    } catch (error) {
        state.textContent = error.message;
    }
}

confirmButton.addEventListener('click', async () => {
    if (!freelancer) return;

    confirmButton.disabled = true;
    alert.textContent = '';
    try {
        const response = await fetch('/api/hirings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ freelancer_id: freelancer.id }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'Não foi possível confirmar a contratação.');
        window.location.href = '/dashboard-cliente?contratacao=sucesso';
    } catch (error) {
        showError(error.message);
    }
});

await loadFreelancer();
