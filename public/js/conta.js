import Auth from '../services/auth.js';
import Account from '../services/account.js';

const auth = new Auth();
const context = await auth.context();

if (!context) {
    window.location.href = '/login';
    throw new Error('Não autenticado.');
}

const configurations = {
    client: {
        label: 'Cliente',
        navigation: [
            { label: 'Dashboard', icon: 'fa-house', href: '/dashboard-cliente' },
            { label: 'Publicar Projeto', icon: 'fa-briefcase' },
            { label: 'Meus Projetos', icon: 'fa-layer-group' },
            { label: 'Freelancers', icon: 'fa-user-group', href: '/freelancers' },
            { label: 'Mensagens', icon: 'fa-comment', iconStyle: 'fa-regular' },
            { label: 'Conta', icon: 'fa-gear', href: '/conta', active: true },
        ],
        intro: 'Ao encerrar sua conta de cliente, os seguintes dados serão excluídos definitivamente:',
        impacts: [
            'Seus dados de acesso e perfil de cliente.',
            'Todos os projetos publicados e as propostas recebidas nesses projetos.',
            'Avaliações escritas ou recebidas e suas sessões ativas.',
            'Mensagens e comunicações vinculadas à conta quando esses recursos forem disponibilizados.',
        ],
    },
    freelancer: {
        label: 'Freelancer',
        navigation: [
            { label: 'Dashboard', icon: 'fa-house', href: '/dashboard-freelancer' },
            { label: 'Buscar Projetos', icon: 'fa-magnifying-glass' },
            { label: 'Propostas', icon: 'fa-file-signature' },
            { label: 'Meu Perfil', icon: 'fa-user', href: '/perfil' },
            { label: 'Mensagens', icon: 'fa-comment', iconStyle: 'fa-regular' },
            { label: 'Conta', icon: 'fa-gear', href: '/conta', active: true },
        ],
        intro: 'Ao encerrar sua conta de freelancer, os seguintes dados serão excluídos definitivamente:',
        impacts: [
            'Seus dados de acesso e perfil profissional.',
            'Portfólio, habilidades, preços e demais informações profissionais.',
            'Propostas enviadas, avaliações e suas sessões ativas.',
            'Mensagens e comunicações vinculadas à conta quando esses recursos forem disponibilizados.',
        ],
    },
    none: {
        label: 'Conta',
        navigation: [
            { label: 'Dashboard', icon: 'fa-house', href: '/dashboard' },
            { label: 'Publicar Projeto', icon: 'fa-briefcase', href: '/publicar-projeto' },
            { label: 'Meus Projetos', icon: 'fa-layer-group', href: '/meus-projetos' },
            { label: 'Freelancers', icon: 'fa-user-group', href: '/freelancers' },
            { label: 'Mensagens', icon: 'fa-comment', iconStyle: 'fa-regular', href: '/mensagens' },
            { label: 'Conta', icon: 'fa-gear', href: '/conta', active: true },
        ],
        intro: 'Ao encerrar sua conta, os seguintes dados serão excluídos definitivamente:',
        impacts: [
            'Seus dados de cadastro e acesso.',
            'Informações preenchidas durante o onboarding.',
            'Todas as sessões ativas da conta.',
        ],
    },
};

const profileType = context.profile_type || 'none';
const configuration = configurations[profileType] || configurations.none;
const form = document.getElementById('closeAccountForm');
const reason = document.getElementById('closureReason');
const details = document.getElementById('closureDetails');
const detailsLabel = document.getElementById('detailsLabel');
const submitButton = document.getElementById('closeAccountButton');
const alert = document.getElementById('accountAlert');

document.getElementById('accountProfileLabel').textContent = configuration.label;
document.getElementById('accountImpactIntro').textContent = configuration.intro;

const navigation = document.getElementById('accountNavigation');
configuration.navigation.forEach((item) => {
    const listItem = document.createElement('li');
    const icon = document.createElement('i');
    icon.className = `${item.iconStyle || 'fa-solid'} ${item.icon}`;

    if (item.active) listItem.classList.add('active');

    if (item.href) {
        const link = document.createElement('a');
        link.href = item.href;
        link.append(icon, document.createTextNode(` ${item.label}`));
        listItem.appendChild(link);
    } else {
        listItem.append(icon, document.createTextNode(` ${item.label}`));
    }

    navigation.appendChild(listItem);
});

const impactList = document.getElementById('accountImpactList');
configuration.impacts.forEach((impact) => {
    const item = document.createElement('li');
    item.textContent = impact;
    impactList.appendChild(item);
});

function updateFormState() {
    const isOther = reason.value === 'other';
    const hasRequiredDetails = !isOther || Boolean(details.value.trim());

    details.required = isOther;
    details.setAttribute('aria-required', String(isOther));
    detailsLabel.textContent = isOther
        ? 'Detalhes e sugestões *'
        : 'Detalhes e sugestões (opcional)';
    submitButton.disabled = !reason.value || !hasRequiredDetails;
}

reason.addEventListener('change', updateFormState);
details.addEventListener('input', updateFormState);

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateFormState();
    if (submitButton.disabled) return;

    submitButton.disabled = true;
    reason.disabled = true;
    details.disabled = true;
    alert.textContent = 'Encerrando sua conta...';
    alert.className = 'account-alert show';

    try {
        await new Account().close({
            reason: reason.value,
            details: details.value,
        });
        localStorage.removeItem('fazAeUser');
        window.location.assign('/');
    } catch (error) {
        reason.disabled = false;
        details.disabled = false;
        alert.textContent = error.message;
        alert.className = 'account-alert show error';
        updateFormState();
    }
});

updateFormState();
