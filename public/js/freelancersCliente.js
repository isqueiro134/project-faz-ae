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

const categoryOptions = [
    ['desenvolvimento', 'Desenvolvimento de Software'],
    ['design', 'Design'],
    ['redacao', 'Redação'],
];

const availabilityStatus = {
    available: { label: 'Disponível', className: 'available' },
    busy: { label: 'Ocupado', className: 'busy' },
    inactive: { label: 'Inativo', className: 'inactive' },
};

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMoney(value) {
    return value ? currency.format(Number(value)) : 'A combinar';
}

function resolvePrice(freelancer) {
    if (freelancer.pricing_model === 'hourly' && freelancer.hourly_rate) {
        return `${formatMoney(freelancer.hourly_rate)}/h`;
    }

    if (freelancer.project_rate_min && freelancer.project_rate_max) {
        return `${formatMoney(freelancer.project_rate_min)} - ${formatMoney(freelancer.project_rate_max)}`;
    }

    return formatMoney(freelancer.project_rate_min || freelancer.hourly_rate);
}

const controller = {
    freelancers: [],
    selected: null,

    async init() {
        document.getElementById('marketplace-subtitle').textContent = `Profissionais disponiveis para ${context.user.full_name}.`;
        this.setupEventListeners();
        await this.loadFreelancers();
    },

    async loadFreelancers() {
        const stateBox = document.getElementById('state-box');
        stateBox.hidden = false;
        stateBox.textContent = 'Carregando freelancers...';

        try {
            const response = await fetch('/api/freelancer-profile');
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || 'Nao foi possivel carregar freelancers.');
            }

            this.freelancers = result.freelancers || [];
            this.renderCategoryOptions();
            this.renderFreelancers();
        } catch (error) {
            document.getElementById('freelancer-grid').innerHTML = '';
            stateBox.hidden = false;
            stateBox.textContent = error.message;
        }
    },

    renderCategoryOptions() {
        const select = document.getElementById('category-filter');
        const knownValues = new Set(categoryOptions.map(([value]) => value));
        const extraCategories = [...new Set(this.freelancers.map((item) => item.category).filter(Boolean))]
            .filter((category) => !knownValues.has(category))
            .sort()
            .map((category) => [category, category]);
        const categories = [...categoryOptions, ...extraCategories];

        select.innerHTML = '<option value="">Todas</option>' + categories.map(([value, label]) => (
            `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`
        )).join('');
    },

    getFilteredFreelancers() {
        const search = document.getElementById('search-input').value.trim().toLowerCase();
        const category = document.getElementById('category-filter').value;
        const sort = document.getElementById('sort-filter').value;

        const filtered = this.freelancers.filter((freelancer) => {
            const searchable = [
                freelancer.full_name,
                freelancer.professional_title,
                freelancer.category,
                ...(freelancer.skills || []),
            ].join(' ').toLowerCase();

            return (!search || searchable.includes(search)) && (!category || freelancer.category === category);
        });

        return filtered.sort((a, b) => {
            if (sort === 'price') {
                const priceA = Number(a.project_rate_min || a.hourly_rate || Number.MAX_SAFE_INTEGER);
                const priceB = Number(b.project_rate_min || b.hourly_rate || Number.MAX_SAFE_INTEGER);
                return priceA - priceB;
            }

            if (sort === 'name') return a.full_name.localeCompare(b.full_name);

            return Number(b.rating_average || 0) - Number(a.rating_average || 0);
        });
    },

    renderFreelancers() {
        const grid = document.getElementById('freelancer-grid');
        const stateBox = document.getElementById('state-box');
        const freelancers = this.getFilteredFreelancers();

        document.getElementById('freelancer-count').textContent = `${freelancers.length} perfis`;

        if (!freelancers.length) {
            grid.innerHTML = '';
            stateBox.hidden = false;
            stateBox.textContent = this.freelancers.length ? 'Nenhum freelancer corresponde aos filtros.' : 'Nenhum freelancer publicado ainda.';
            return;
        }

        stateBox.hidden = true;
        grid.innerHTML = freelancers.map((freelancer) => this.renderFreelancerCard(freelancer)).join('');
    },

    renderFreelancerCard(freelancer) {
        const skills = (freelancer.skills || []).slice(0, 4).map((skill) => (
            `<span>${escapeHtml(skill)}</span>`
        )).join('');
        const isSelected = this.selected?.id === freelancer.id;
        const availability = availabilityStatus[freelancer.availability_status] || availabilityStatus.available;

        return `
            <article class="freelancer-card ${isSelected ? 'selected' : ''}" data-freelancer-id="${escapeHtml(freelancer.id)}">
                <div class="freelancer-topline">
                    <div class="avatar">${escapeHtml((freelancer.full_name || 'F').charAt(0))}</div>
                    <div>
                        <h2>${escapeHtml(freelancer.full_name)}</h2>
                        <p>${escapeHtml(freelancer.professional_title || 'Perfil profissional')}</p>
                    </div>
                </div>
                <span class="availability-badge ${availability.className}">${availability.label}</span>
                <div class="freelancer-meta">
                    <span><i class="fa-solid fa-layer-group"></i> ${escapeHtml(freelancer.category || 'Geral')}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(freelancer.location || 'Remoto')}</span>
                </div>
                <div class="skill-list">${skills || '<span>Sem habilidades listadas</span>'}</div>
                <div class="freelancer-stats">
                    <strong>${resolvePrice(freelancer)}</strong>
                    <span><i class="fa-solid fa-star"></i> ${Number(freelancer.rating_average || 0).toFixed(1)} (${freelancer.total_reviews || 0})</span>
                </div>
                <button class="btn-primary" type="button" onclick="controller.openModal('${freelancer.id}')">Ver perfil</button>
            </article>
        `;
    },

    openModal(id) {
        const freelancer = this.freelancers.find((item) => item.id === id);
        if (!freelancer) return;
        const availability = availabilityStatus[freelancer.availability_status] || availabilityStatus.available;
        const canHire = freelancer.availability_status === 'available';

        const portfolio = (freelancer.portfolio_items || []).slice(0, 3).map((item) => `
            <li>
                <strong>${escapeHtml(item.title || 'Projeto')}</strong>
                <span>${escapeHtml(item.description || item.url || 'Portfolio informado')}</span>
            </li>
        `).join('');
        const links = Object.entries(freelancer.links || {})
            .filter(([, value]) => value)
            .map(([label, value]) => `<a class="text-link" href="${escapeHtml(value)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`)
            .join('');

        document.getElementById('modal-content').innerHTML = `
            <div class="modal-header">
                <div class="avatar large">${escapeHtml((freelancer.full_name || 'F').charAt(0))}</div>
                <div>
                    <h2 id="modal-name">${escapeHtml(freelancer.full_name)}</h2>
                    <p>${escapeHtml(freelancer.professional_title || 'Perfil profissional')}</p>
                </div>
            </div>
            <p class="modal-bio">${escapeHtml(freelancer.bio || 'Bio ainda nao informada.')}</p>
            <div class="modal-info-grid">
                <span><strong>Categoria</strong>${escapeHtml(freelancer.category || 'Geral')}</span>
                <span><strong>Valor</strong>${resolvePrice(freelancer)}</span>
                <span><strong>Disponibilidade</strong>${escapeHtml(freelancer.availability || 'A combinar')}</span>
                <span><strong>Status</strong>${availability.label}</span>
                <span><strong>Resposta</strong>${escapeHtml(freelancer.response_time || 'A combinar')}</span>
            </div>
            <div class="skill-list modal-skills">
                ${(freelancer.skills || []).map((skill) => `<span>${escapeHtml(skill)}</span>`).join('')}
            </div>
            <div class="portfolio-block">
                <h3>Portfolio</h3>
                <ul>${portfolio || '<li><span>Nenhum projeto listado.</span></li>'}</ul>
                <div class="profile-links">${links}</div>
            </div>
            ${canHire ? '' : '<p class="availability-warning" role="alert">Este profissional está indisponível para contratação.</p>'}
            <button class="btn-primary" type="button" onclick="controller.selectFreelancer('${freelancer.id}')" ${canHire ? '' : 'disabled'}>
                ${canHire ? 'Escolher freelancer' : 'Profissional indisponível'}
            </button>
        `;

        document.getElementById('profile-modal').hidden = false;
    },

    closeModal() {
        document.getElementById('profile-modal').hidden = true;
    },

    selectFreelancer(id) {
        const freelancer = this.freelancers.find((item) => item.id === id);
        if (!freelancer || freelancer.availability_status !== 'available') return;
        window.location.href = `/contratar?freelancer_id=${encodeURIComponent(id)}`;
    },

    renderSelected() {
        const panel = document.getElementById('selected-panel');

        if (!this.selected) {
            panel.hidden = true;
            return;
        }

        document.getElementById('selected-name').textContent = this.selected.full_name;
        document.getElementById('selected-title').textContent = this.selected.professional_title || 'Perfil profissional';
        panel.hidden = false;
    },

    clearSelection() {
        this.selected = null;
        this.renderSelected();
        this.renderFreelancers();
    },

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', () => this.renderFreelancers());
        document.getElementById('category-filter').addEventListener('change', () => this.renderFreelancers());
        document.getElementById('sort-filter').addEventListener('change', () => this.renderFreelancers());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.closeModal();
        });
    },
};

window.controller = controller;
controller.init();
