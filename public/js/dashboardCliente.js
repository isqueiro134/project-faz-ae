import Auth from '../services/auth.js';

const auth = new Auth();
const context = await auth.context();

if (!context) {
    window.location.href = '/login';
    throw new Error('Nao autenticado.');
}

if (context?.profile_type !== 'client') {
    window.location.href = context?.redirect_to || '/onboarding';
    throw new Error('Ambiente incompativel.');
}

const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function resolvePrice(hiring) {
    const value = hiring.project_rate_min || hiring.hourly_rate;
    if (!value) return 'A combinar';
    const suffix = hiring.pricing_model === 'hourly' ? '/h' : '';
    return `${currency.format(Number(value))}${suffix}`;
}

const statusLabels = {
    pending: 'Pendente',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
};

const controller = {
    hirings: [],

    async init() {
        document.getElementById('dashboard-subtitle').textContent = `Contratações de ${context.user.full_name}.`;
        if (new URLSearchParams(window.location.search).get('contratacao') === 'sucesso') {
            document.getElementById('hiring-success').hidden = false;
        }
        await this.loadHirings();
        this.setupEventListeners();
    },

    async loadHirings() {
        const list = document.getElementById('project-list');
        list.innerHTML = '<div class="dashboard-empty">Carregando contratações...</div>';

        try {
            const response = await fetch('/api/hirings');
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || 'Não foi possível carregar as contratações.');
            this.hirings = result.hirings || [];
            this.renderHirings();
        } catch (error) {
            list.innerHTML = `<div class="dashboard-empty">${escapeHtml(error.message)}</div>`;
        }
    },

    renderHirings() {
        const list = document.getElementById('project-list');
        if (!this.hirings.length) {
            list.innerHTML = '<div class="dashboard-empty">Nenhuma contratação realizada.</div>';
            return;
        }

        list.innerHTML = this.hirings.map((hiring) => `
            <article class="project-card" data-hiring-id="${escapeHtml(hiring.id)}">
                <div class="project-info">
                    <div>
                        <strong>${escapeHtml(hiring.freelancer_name)}</strong>
                        <p class="project-dev">${escapeHtml(hiring.professional_title || 'Perfil profissional')}</p>
                    </div>
                    <span class="status-badge review">${escapeHtml(statusLabels[hiring.status] || hiring.status)}</span>
                </div>
                <div class="project-meta hiring-meta">
                    <span>${escapeHtml(hiring.category || 'Geral')}</span>
                    <span>${escapeHtml(resolvePrice(hiring))}</span>
                </div>
            </article>
        `).join('');
    },

    sendMessage() {
        const input = document.getElementById('chat-input');
        const chatBox = document.getElementById('chat-messages');
        const value = input.value.trim();

        if (!value) return;

        const message = document.createElement('div');
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        message.className = 'bubble sent';
        message.innerHTML = `${value} <br><small>${time}</small>`;
        chatBox.appendChild(message);
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    },

    newProject() {
        alert('Abrir modal de novo projeto...');
    },

    setupEventListeners() {
        document.getElementById('chat-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') this.sendMessage();
        });
    },
};

window.controller = controller;
controller.init();
