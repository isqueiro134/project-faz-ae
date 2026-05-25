const form = document.getElementById('profileForm');
const steps = [...document.querySelectorAll('.profile-step')];
const stepButtons = [...document.querySelectorAll('[data-step-button]')];
const backStep = document.getElementById('backStep');
const nextStep = document.getElementById('nextStep');
const publishProfile = document.getElementById('publishProfile');
const formAlert = document.getElementById('formAlert');
const portfolioList = document.getElementById('portfolioList');
const addProject = document.getElementById('addProject');
const strengthValue = document.getElementById('strengthValue');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const bio = document.getElementById('bio');
const bioCount = document.getElementById('bioCount');

const draftKey = 'fazAeFreelancerProfileDraft';
let currentStep = 0;
let portfolioIndex = 0;

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

function splitList(value) {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, index, list) => list.indexOf(item) === index);
}

function getUser() {
    return JSON.parse(localStorage.getItem('fazAeUser') || 'null');
}

function getPortfolioItems() {
    return [...portfolioList.querySelectorAll('.portfolio-item')]
        .map((item) => ({
            title: item.querySelector('[name="project_title"]').value.trim(),
            category: item.querySelector('[name="project_category"]').value.trim(),
            url: item.querySelector('[name="project_url"]').value.trim(),
            description: item.querySelector('[name="project_description"]').value.trim(),
        }))
        .filter((item) => item.title || item.url || item.description);
}

function collectData(status = 'draft') {
    const data = new FormData(form);
    const user = getUser();

    return {
        user_id: user?.id,
        professional_title: data.get('professional_title')?.trim(),
        category: data.get('category'),
        level: data.get('level'),
        location: data.get('location')?.trim(),
        languages: [],
        skills: splitList(data.get('skills') || ''),
        tools: splitList(data.get('tools') || ''),
        niches: splitList(data.get('niches') || ''),
        project_types: [],
        availability: data.get('availability'),
        work_model: data.get('work_model'),
        bio: data.get('bio')?.trim(),
        experience_years: Number(data.get('experience_years')) || null,
        result_highlight: data.get('result_highlight')?.trim(),
        education: null,
        portfolio_url: data.get('portfolio_url')?.trim(),
        links: {
            linkedin: data.get('linkedin')?.trim(),
            portfolio: data.get('portfolio_url')?.trim(),
        },
        portfolio_items: getPortfolioItems(),
        pricing_model: data.get('pricing_model'),
        hourly_rate: Number(data.get('hourly_rate')) || null,
        project_rate_min: Number(data.get('project_rate_min')) || null,
        project_rate_max: null,
        response_time: data.get('response_time'),
        project_size: null,
        urgent_projects: data.get('urgent_projects') === 'on',
        profile_strength: calculateStrength().total,
        status,
    };
}

function calculateStrength() {
    const data = new FormData(form);
    const skills = splitList(data.get('skills') || '');
    const portfolioItems = getPortfolioItems();
    const hasLink = Boolean(data.get('linkedin') || data.get('portfolio_url'));

    const checks = {
        identity: Boolean(data.get('professional_title')?.trim().length >= 10 && data.get('category')),
        skills: skills.length >= 3,
        bio: Boolean(data.get('bio')?.trim().length >= 120),
        portfolio: portfolioItems.length > 0 || hasLink,
        pricing: Boolean(data.get('availability') && data.get('pricing_model') && (data.get('hourly_rate') || data.get('project_rate_min'))),
    };

    const total =
        (checks.identity ? 20 : 0) +
        (checks.skills ? 20 : 0) +
        (checks.bio ? 20 : 0) +
        (checks.portfolio ? 25 : 0) +
        (checks.pricing ? 15 : 0);

    return { checks, total };
}

function renderStrength() {
    const { checks, total } = calculateStrength();
    strengthValue.textContent = `${total}%`;
    strengthBar.style.width = `${total}%`;
    strengthLabel.textContent = total >= 90 ? 'Destaque' : total >= 70 ? 'Competitivo' : total >= 40 ? 'Basico' : 'Incompleto';

    Object.entries(checks).forEach(([key, done]) => {
        document.querySelector(`[data-check="${key}"]`)?.classList.toggle('done', done);
    });
}

function renderStep() {
    steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
    stepButtons.forEach((button, index) => button.classList.toggle('active', index === currentStep));
    backStep.disabled = currentStep === 0;
    nextStep.classList.toggle('hidden', currentStep === steps.length - 1);
    publishProfile.classList.toggle('hidden', currentStep !== steps.length - 1);
}

function addPortfolioItem(item = {}) {
    portfolioIndex += 1;
    const suffix = portfolioIndex;
    const element = document.createElement('div');
    element.className = 'portfolio-item';
    element.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label for="projectTitle${suffix}">Titulo do projeto</label>
                <input id="projectTitle${suffix}" name="project_title" class="input" maxlength="80" placeholder="Ex: Landing page para SaaS" value="${escapeHtml(item.title)}">
            </div>
            <div class="form-group">
                <label for="projectCategory${suffix}">Categoria</label>
                <input id="projectCategory${suffix}" name="project_category" class="input" placeholder="Ex: Desenvolvimento, Design ou Redacao" value="${escapeHtml(item.category)}">
            </div>
        </div>
        <div class="form-group">
            <label for="projectUrl${suffix}">Link do projeto</label>
            <input id="projectUrl${suffix}" name="project_url" class="input" type="url" placeholder="https://..." value="${escapeHtml(item.url)}">
        </div>
        <div class="form-group">
            <label for="projectDescription${suffix}">Descricao</label>
            <textarea id="projectDescription${suffix}" name="project_description" class="input" maxlength="500" rows="4" placeholder="Explique seu papel e o resultado entregue.">${escapeHtml(item.description)}</textarea>
        </div>
    `;
    portfolioList.appendChild(element);
}

function saveDraft() {
    localStorage.setItem(draftKey, JSON.stringify(collectData('draft')));
    renderStrength();
}

function loadDraft() {
    const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
    if (!draft) {
        addPortfolioItem();
        return;
    }

    Object.entries({
        professional_title: draft.professional_title,
        category: draft.category,
        level: draft.level,
        location: draft.location,
        skills: draft.skills?.join(', '),
        tools: draft.tools?.join(', '),
        niches: draft.niches?.join(', '),
        availability: draft.availability,
        work_model: draft.work_model,
        bio: draft.bio,
        experience_years: draft.experience_years,
        result_highlight: draft.result_highlight,
        linkedin: draft.links?.linkedin,
        portfolio_url: draft.portfolio_url,
        pricing_model: draft.pricing_model,
        hourly_rate: draft.hourly_rate,
        project_rate_min: draft.project_rate_min,
        response_time: draft.response_time,
    }).forEach(([name, value]) => {
        const field = form.elements[name];
        if (field && value) field.value = value;
    });

    if (draft.urgent_projects) form.elements.urgent_projects.checked = true;
    (draft.portfolio_items?.length ? draft.portfolio_items : [{}]).forEach(addPortfolioItem);
}

function showMessage(message, success = false) {
    formAlert.textContent = message;
    formAlert.classList.toggle('success', success);
}

async function submitProfile(event) {
    event.preventDefault();
    const profile = collectData('published');

    if (!profile.user_id) {
        showMessage('Faca login novamente para publicar seu perfil.');
        return;
    }

    try {
        const response = await fetch('/api/freelancer-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        });
        const result = await response.json();

        if (!response.ok) {
            const firstError = Object.values(result.errors || {})[0] || result.message || 'Revise os campos destacados.';
            showMessage(firstError);
            return;
        }

        localStorage.removeItem(draftKey);
        showMessage('Perfil publicado. Voce ja pode receber matches melhores.', true);
    } catch (error) {
        showMessage('Nao foi possivel publicar agora. Tente novamente.');
    }
}

loadDraft();
renderStep();
renderStrength();
bioCount.textContent = bio.value.length;

form.addEventListener('input', () => {
    bioCount.textContent = bio.value.length;
    saveDraft();
});
form.addEventListener('change', saveDraft);
form.addEventListener('submit', submitProfile);

addProject.addEventListener('click', () => {
    addPortfolioItem();
    saveDraft();
});

backStep.addEventListener('click', () => {
    if (currentStep > 0) currentStep -= 1;
    renderStep();
});

nextStep.addEventListener('click', () => {
    if (currentStep < steps.length - 1) currentStep += 1;
    renderStep();
});

stepButtons.forEach((button) => {
    button.addEventListener('click', () => {
        currentStep = Number(button.dataset.stepButton);
        renderStep();
    });
});
