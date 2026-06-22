import FreelancerProfile from '../services/freelancerProfile.js';
import Auth from '../services/auth.js';

// Usuário autenticado vem da sessão (cookie); fallback p/ localStorage.
let sessionUser = null;
const auth = new Auth();
const context = await auth.context();

if (!context) {
    window.location.href = '/login';
    throw new Error('Nao autenticado.');
}

if (context.profile_type !== 'freelancer') {
    window.location.href = context.redirect_to || '/onboarding';
    throw new Error('Ambiente incompativel.');
}

sessionUser = context.user;

const form = document.getElementById('profileForm');
const baseProfileForm = document.getElementById('baseProfileForm');
const baseProfileAlert = document.getElementById('baseProfileAlert');
const steps = [...document.querySelectorAll('.profile-step')];
const stepButtons = [...document.querySelectorAll('[data-step-button]')];
const backStep = document.getElementById('backStep');
const nextStep = document.getElementById('nextStep');
const publishProfile = document.getElementById('publishProfile');
const profileEditActions = document.getElementById('profileEditActions');
const saveProfileChanges = document.getElementById('saveProfileChanges');
const discardProfileChanges = document.getElementById('discardProfileChanges');
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
let savedProfile = null;
let profileSnapshot = null;
let isApplyingProfileData = false;

const selectValueMaps = {
    category: {
        'Design e Criatividade': 'design',
        'Desenvolvimento e Tecnologia': 'desenvolvimento',
        'Marketing e Conteudo': 'redacao',
        'Marketing e Conteúdo': 'redacao',
        'Video e Animacao': 'design',
        'Vídeo e Animação': 'design',
    },
    availability: {
        'Até 10h por semana': 'ate-10h',
        'Ate 10h por semana': 'ate-10h',
        '10h por semana': 'ate-10h',
        '15h por semana': '10-20h',
        '20h por semana': '20-40h',
        '25h por semana': '20-40h',
        '30h por semana': '20-40h',
        '40h por semana': '20-40h',
    },
    pricing_model: {
        project: 'fixed',
        fixed: 'fixed',
        hourly: 'hourly',
        both: 'both',
    },
    response_time: {
        'Responde em ate 2 horas': 'ate-2h',
        'Responde em até 2 horas': 'ate-2h',
        'Responde no mesmo dia': 'mesmo-dia',
        'No mesmo dia': 'mesmo-dia',
        'Responde em ate 4 horas': '24h',
        'Responde em até 4 horas': '24h',
        'Responde em ate 6 horas': '24h',
        'Responde em até 6 horas': '24h',
        'Responde em ate 8 horas': '24h',
        'Responde em até 8 horas': '24h',
        'Responde em ate 24 horas': '24h',
        'Responde em até 24 horas': '24h',
    },
};

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

function setFieldValue(name, value) {
    const field = form.elements[name];
    if (!field || value === null || value === undefined || value === '') return;
    const fieldValue = selectValueMaps[name]?.[value] || value;

    if (field.tagName === 'SELECT') {
        const exactOption = [...field.options].find((option) => option.value === String(fieldValue));
        if (exactOption) {
            field.value = exactOption.value;
        }
        return;
    }

    field.value = fieldValue;
}

function resolvePortfolioLink(profile) {
    return profile.portfolio_url ||
        profile.links?.portfolio ||
        profile.links?.github ||
        profile.links?.behance ||
        profile.links?.website ||
        profile.links?.vimeo ||
        profile.links?.instagram ||
        '';
}

function normalizePortfolioItem(item = {}) {
    return {
        title: item.title || item.project_title || item.projectTitle || item.name || '',
        category: item.category || item.project_category || item.projectCategory || savedProfile?.category || '',
        url: item.url || item.project_url || item.projectUrl || item.link || resolvePortfolioLink(savedProfile || {}),
        description: item.description || item.project_description || item.projectDescription || '',
    };
}

function getUser() {
    return sessionUser;
}

function getInitials(name) {
    return String(name || 'FA')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
}

function renderBaseProfile(profile = {}) {
    const avatar = document.getElementById('profileAvatar');
    document.getElementById('profileName').textContent = sessionUser.full_name || 'Freelancer';
    document.getElementById('profileEmail').textContent = sessionUser.email || '';
    document.getElementById('emailVerified').textContent = profile.email_verified ? 'Email verificado' : 'Email não verificado';
    document.getElementById('phoneVerified').textContent = profile.phone_verified ? 'Telefone verificado' : 'Telefone não verificado';
    document.getElementById('profileVerified').textContent = profile.is_verified ? 'Perfil verificado' : 'Perfil não verificado';

    avatar.textContent = profile.avatar_url ? '' : getInitials(sessionUser.full_name);
    avatar.style.backgroundImage = profile.avatar_url ? `url("${profile.avatar_url}")` : '';

    Object.entries({
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        bio: profile.bio,
    }).forEach(([name, value]) => {
        const field = baseProfileForm.elements[name];
        if (field) field.value = value || '';
    });
}

function showBaseProfileMessage(message, success = false) {
    baseProfileAlert.textContent = message;
    baseProfileAlert.classList.toggle('success', success);
}

async function submitBaseProfile(event) {
    event.preventDefault();

    const data = new FormData(baseProfileForm);
    try {
        const response = await fetch('/api/profiles/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                avatar_url: data.get('avatar_url')?.trim(),
                phone: data.get('phone')?.trim(),
                bio: data.get('bio')?.trim(),
            }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'Não foi possível salvar os dados gerais.');

        renderBaseProfile(result.profile);
        form.elements.bio.value = result.profile?.bio || '';
        bioCount.textContent = bio.value.length;
        renderStrength();
        if (savedProfile) {
            savedProfile.bio = result.profile?.bio || '';
            profileSnapshot = normalizeProfileForCompare(collectData('published'));
            updateProfileEditActions();
        }
        showBaseProfileMessage('Dados gerais salvos.', true);
    } catch (error) {
        showBaseProfileMessage(error.message || 'Não foi possível salvar os dados gerais.');
    }
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

function hasCompletePortfolioItem() {
    return [...portfolioList.querySelectorAll('.portfolio-item')].some((item) => {
        const title = item.querySelector('[name="project_title"]');
        const category = item.querySelector('[name="project_category"]');
        const url = item.querySelector('[name="project_url"]');
        const description = item.querySelector('[name="project_description"]');

        return (
            title.value.trim().length >= 3 &&
            category.value.trim().length >= 3 &&
            url.value.trim() &&
            url.checkValidity() &&
            description.value.trim().length >= 80
        );
    });
}

function isValidOptionalUrl(field) {
    return Boolean(field?.value?.trim() && field.checkValidity());
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
        languages: savedProfile?.languages || [],
        skills: splitList(data.get('skills') || ''),
        tools: splitList(data.get('tools') || ''),
        niches: splitList(data.get('niches') || ''),
        project_types: savedProfile?.project_types || [],
        availability: data.get('availability'),
        work_model: data.get('work_model'),
        bio: data.get('bio')?.trim(),
        experience_years: Number(data.get('experience_years')) || null,
        result_highlight: data.get('result_highlight')?.trim(),
        education: savedProfile?.education || null,
        portfolio_url: data.get('portfolio_url')?.trim(),
        links: {
            ...(savedProfile?.links || {}),
            linkedin: data.get('linkedin')?.trim(),
            portfolio: data.get('portfolio_url')?.trim(),
        },
        portfolio_items: getPortfolioItems(),
        pricing_model: data.get('pricing_model'),
        hourly_rate: Number(data.get('hourly_rate')) || null,
        project_rate_min: Number(data.get('project_rate_min')) || null,
        project_rate_max: savedProfile?.project_rate_max || null,
        response_time: data.get('response_time'),
        project_size: savedProfile?.project_size || null,
        urgent_projects: data.get('urgent_projects') === 'on',
        profile_strength: calculateStrength().total,
        status,
    };
}

function normalizeProfileForCompare(profile) {
    return JSON.stringify({
        professional_title: profile.professional_title || '',
        category: profile.category || '',
        level: profile.level || '',
        location: profile.location || '',
        languages: profile.languages || [],
        skills: profile.skills || [],
        tools: profile.tools || [],
        niches: profile.niches || [],
        project_types: profile.project_types || [],
        availability: profile.availability || '',
        work_model: profile.work_model || '',
        bio: profile.bio || '',
        experience_years: profile.experience_years || null,
        result_highlight: profile.result_highlight || '',
        education: profile.education || null,
        portfolio_url: profile.portfolio_url || '',
        links: profile.links || {},
        portfolio_items: profile.portfolio_items || [],
        pricing_model: profile.pricing_model || '',
        hourly_rate: profile.hourly_rate || null,
        project_rate_min: profile.project_rate_min || null,
        project_rate_max: profile.project_rate_max || null,
        response_time: profile.response_time || '',
        project_size: profile.project_size || null,
        urgent_projects: Boolean(profile.urgent_projects),
    });
}

function updateProfileEditActions() {
    if (!profileSnapshot || isApplyingProfileData) {
        profileEditActions.classList.add('hidden');
        return;
    }

    const currentSnapshot = normalizeProfileForCompare(collectData('published'));
    profileEditActions.classList.toggle('hidden', currentSnapshot === profileSnapshot);
}

function calculateStrength() {
    const data = new FormData(form);
    const skills = splitList(data.get('skills') || '');
    const tools = splitList(data.get('tools') || '');
    const niches = splitList(data.get('niches') || '');
    const hourlyRate = Number(data.get('hourly_rate')) || 0;
    const projectRateMin = Number(data.get('project_rate_min')) || 0;

    const checks = {
        identity: Boolean(
            data.get('professional_title')?.trim().length >= 10 &&
            data.get('category') &&
            data.get('level') &&
            data.get('location')?.trim().length >= 4
        ),
        skills: Boolean(skills.length >= 3 && data.get('availability') && data.get('work_model')),
        bio: Boolean(data.get('bio')?.trim().length >= 120),
        portfolio: hasCompletePortfolioItem(),
        pricing: Boolean(data.get('pricing_model') && (hourlyRate > 0 || projectRateMin > 0)),
        tools: tools.length >= 2,
        niches: niches.length >= 1,
        experience: Boolean(Number(data.get('experience_years')) > 0 && data.get('result_highlight')?.trim().length >= 10),
        links: isValidOptionalUrl(form.elements.linkedin) || isValidOptionalUrl(form.elements.portfolio_url),
        response: Boolean(data.get('response_time')),
        priceRange: hourlyRate > 0 && projectRateMin > 0,
    };

    const total = Math.min(100,
        (checks.identity ? 14 : 0) +
        (checks.skills ? 14 : 0) +
        (checks.bio ? 14 : 0) +
        (checks.portfolio ? 14 : 0) +
        (checks.pricing ? 14 : 0) +
        (checks.tools ? 5 : 0) +
        (checks.niches ? 5 : 0) +
        (checks.experience ? 5 : 0) +
        (checks.links ? 5 : 0) +
        (checks.response ? 5 : 0) +
        (checks.priceRange ? 5 : 0)
    );

    return { checks, total };
}

function renderStrength() {
    const { checks, total } = calculateStrength();
    strengthValue.textContent = `${total}%`;
    strengthBar.style.width = `${total}%`;
    strengthLabel.textContent = total === 100
        ? 'Completo'
        : total >= 90
            ? 'Destaque, faltam detalhes'
            : total >= 75
                ? 'Pronto para uso, ainda incompleto'
                : total >= 40
                    ? 'Básico'
                    : 'Incompleto';

    Object.entries(checks).forEach(([key, done]) => {
        document.querySelector(`[data-check="${key}"]`)?.classList.toggle('done', done);
    });
}

function renderStep() {
    steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
    stepButtons.forEach((button, index) => button.classList.toggle('active', index === currentStep));
    backStep.disabled = currentStep === 0;
    nextStep.classList.toggle('hidden', currentStep === steps.length - 1);
    publishProfile.classList.toggle('hidden', currentStep !== steps.length - 1 || Boolean(profileSnapshot));
}

function setInvalid(field, invalid) {
    if (!field) return;
    field.classList.toggle('invalid', invalid);
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}

function resetStepValidation(stepIndex) {
    steps[stepIndex].querySelectorAll('.input.invalid').forEach((field) => setInvalid(field, false));
}

function requireField(field, errors, message) {
    const rawValue = field?.value || '';
    const trimmedValue = rawValue.trim();
    const minLength = Number(field?.getAttribute('minlength')) || 0;
    const invalid = !trimmedValue || trimmedValue.length < minLength || !field.checkValidity();
    setInvalid(field, invalid);
    if (invalid) errors.push({ field, message });
}

function validateUrl(field, errors, message) {
    if (!field?.value?.trim()) return;
    const invalid = !field.checkValidity();
    setInvalid(field, invalid);
    if (invalid) errors.push({ field, message });
}

function validatePortfolio(errors) {
    const items = [...portfolioList.querySelectorAll('.portfolio-item')];
    let hasCompleteProject = false;

    items.forEach((item) => {
        const title = item.querySelector('[name="project_title"]');
        const category = item.querySelector('[name="project_category"]');
        const url = item.querySelector('[name="project_url"]');
        const description = item.querySelector('[name="project_description"]');

        const titleValid = title.value.trim().length >= 3;
        const categoryValid = category.value.trim().length >= 3;
        const urlValid = url.value.trim() && url.checkValidity();
        const descriptionValid = description.value.trim().length >= 80;

        setInvalid(title, !titleValid);
        setInvalid(category, !categoryValid);
        setInvalid(url, !urlValid);
        setInvalid(description, !descriptionValid);

        if (titleValid && categoryValid && urlValid && descriptionValid) {
            hasCompleteProject = true;
        }
    });

    if (!hasCompleteProject) {
        const firstField = portfolioList.querySelector('.portfolio-item .input');
        errors.push({
            field: firstField,
            message: 'Preencha pelo menos um projeto com título, categoria, link válido e descrição de 80 caracteres.',
        });
    }
}

function validateStep(stepIndex) {
    const errors = [];
    const data = new FormData(form);
    resetStepValidation(stepIndex);

    if (stepIndex === 0) {
        requireField(form.elements.professional_title, errors, 'Informe um título profissional com pelo menos 10 caracteres.');
        requireField(form.elements.category, errors, 'Escolha sua área principal.');
        requireField(form.elements.level, errors, 'Escolha seu nível profissional.');
        requireField(form.elements.location, errors, 'Informe sua localização ou remoto com pelo menos 4 caracteres.');
    }

    if (stepIndex === 1) {
        const skillsInvalid = splitList(data.get('skills') || '').length < 3;
        setInvalid(form.elements.skills, skillsInvalid);
        if (skillsInvalid) {
            errors.push({ field: form.elements.skills, message: 'Adicione pelo menos 3 habilidades separadas por vírgula.' });
        }
        requireField(form.elements.availability, errors, 'Informe sua disponibilidade semanal.');
        requireField(form.elements.work_model, errors, 'Escolha seu modelo de trabalho.');
    }

    if (stepIndex === 2) {
        requireField(form.elements.bio, errors, 'Escreva uma biografia com pelo menos 120 caracteres.');
        validateUrl(form.elements.linkedin, errors, 'Informe um link válido para o LinkedIn.');
        validateUrl(form.elements.portfolio_url, errors, 'Informe um link válido para o portfolio.');
    }

    if (stepIndex === 3) {
        validatePortfolio(errors);
    }

    if (stepIndex === 4) {
        requireField(form.elements.pricing_model, errors, 'Escolha um modelo de cobrança.');
        const hasPrice = Number(form.elements.hourly_rate.value) > 0 || Number(form.elements.project_rate_min.value) > 0;
        setInvalid(form.elements.hourly_rate, !hasPrice);
        setInvalid(form.elements.project_rate_min, !hasPrice);
        if (!hasPrice) {
            errors.push({ field: form.elements.hourly_rate, message: 'Informe valor por hora ou valor inicial por projeto.' });
        }
    }

    if (errors.length) {
        showMessage(errors[0].message);
        errors[0].field?.focus();
        return false;
    }

    showMessage('');
    return true;
}

function canNavigateTo(stepIndex) {
    if (stepIndex <= currentStep) return true;

    for (let index = 0; index < stepIndex; index += 1) {
        if (!validateStep(index)) {
            currentStep = index;
            renderStep();
            return false;
        }
    }

    return true;
}

function addPortfolioItem(item = {}) {
    portfolioIndex += 1;
    const suffix = portfolioIndex;
    const element = document.createElement('div');
    element.className = 'portfolio-item';
    element.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label for="projectTitle${suffix}">Titulo do projeto *</label>
                <input id="projectTitle${suffix}" name="project_title" class="input" maxlength="80" placeholder="Ex: Landing page para SaaS" value="${escapeHtml(item.title)}">
            </div>
            <div class="form-group">
                <label for="projectCategory${suffix}">Categoria *</label>
                <input id="projectCategory${suffix}" name="project_category" class="input" placeholder="Ex: Desenvolvimento, Design ou Redacao" value="${escapeHtml(item.category)}">
            </div>
        </div>
        <div class="form-group">
            <label for="projectUrl${suffix}">Link do projeto *</label>
            <input id="projectUrl${suffix}" name="project_url" class="input" type="url" placeholder="https://..." value="${escapeHtml(item.url)}">
        </div>
        <div class="form-group">
            <label for="projectDescription${suffix}">Descricao *</label>
            <textarea id="projectDescription${suffix}" name="project_description" class="input" maxlength="500" rows="4" placeholder="Explique seu papel e o resultado entregue.">${escapeHtml(item.description)}</textarea>
        </div>
    `;
    portfolioList.appendChild(element);
}

function applyProfileData(profile) {
    isApplyingProfileData = true;
    Object.entries({
        professional_title: profile.professional_title,
        category: profile.category,
        level: profile.level,
        location: profile.location,
        skills: profile.skills?.join(', '),
        tools: profile.tools?.join(', '),
        niches: profile.niches?.join(', '),
        availability: profile.availability,
        work_model: profile.work_model,
        bio: profile.bio,
        experience_years: profile.experience_years,
        result_highlight: profile.result_highlight,
        linkedin: profile.links?.linkedin,
        portfolio_url: resolvePortfolioLink(profile),
        pricing_model: profile.pricing_model,
        hourly_rate: profile.hourly_rate,
        project_rate_min: profile.project_rate_min,
        response_time: profile.response_time,
    }).forEach(([name, value]) => setFieldValue(name, value));

    form.elements.urgent_projects.checked = Boolean(profile.urgent_projects);
    portfolioList.innerHTML = '';
    (profile.portfolio_items?.length ? profile.portfolio_items : [{}]).map(normalizePortfolioItem).forEach(addPortfolioItem);
    bioCount.textContent = bio.value.length;
    renderStrength();
    isApplyingProfileData = false;
}

function hasSavedProfileData(profile) {
    return Boolean(
        profile?.status === 'published' ||
        profile?.professional_title ||
        profile?.bio ||
        profile?.portfolio_items?.length
    );
}

function saveDraft() {
    localStorage.setItem(draftKey, JSON.stringify(collectData('draft')));
    renderStrength();
    updateProfileEditActions();
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
    }).forEach(([name, value]) => setFieldValue(name, value));

    if (draft.urgent_projects) form.elements.urgent_projects.checked = true;
    (draft.portfolio_items?.length ? draft.portfolio_items : [{}]).map(normalizePortfolioItem).forEach(addPortfolioItem);
}

async function loadInitialProfile() {
    try {
        const profile = await new FreelancerProfile().me();
        if (hasSavedProfileData(profile)) {
            savedProfile = profile;
            localStorage.removeItem(draftKey);
            applyProfileData(profile);
            profileSnapshot = normalizeProfileForCompare(collectData('published'));
            updateProfileEditActions();
            return;
        }
    } catch (_) {
        showMessage('Nao foi possivel carregar seu perfil salvo agora.');
    }

    loadDraft();
}

function showMessage(message, success = false) {
    formAlert.textContent = message;
    formAlert.classList.toggle('success', success);
}

function validateAllSteps() {
    for (let index = 0; index < steps.length; index += 1) {
        if (!validateStep(index)) {
            currentStep = index;
            renderStep();
            return false;
        }
    }

    return true;
}

async function persistPublishedProfile(successMessage) {
    const profile = collectData('published');

    if (!profile.user_id) {
        showMessage('Faça login novamente para publicar seu perfil.');
        return false;
    }

    try {
        await new FreelancerProfile().save(profile);
        savedProfile = await new FreelancerProfile().me();
        localStorage.removeItem(draftKey);
        if (savedProfile) applyProfileData(savedProfile);
        profileSnapshot = normalizeProfileForCompare(collectData('published'));
        updateProfileEditActions();
        showMessage(successMessage, true);
        return true;
    } catch (error) {
        const firstError = error.errors ? Object.values(error.errors)[0] : error.message;
        showMessage(firstError || 'Não foi possível publicar agora. Tente novamente.');
        return false;
    }
}

async function saveProfileEdition() {
    if (!validateAllSteps()) return;
    await persistPublishedProfile('Alterações salvas.');
}

function discardProfileEdition() {
    if (!savedProfile) return;
    localStorage.removeItem(draftKey);
    applyProfileData(savedProfile);
    profileSnapshot = normalizeProfileForCompare(collectData('published'));
    updateProfileEditActions();
    showMessage('Alterações descartadas.', true);
}

async function submitProfile(event) {
    event.preventDefault();

    if (!validateStep(currentStep)) return;
    await persistPublishedProfile('Perfil publicado. Você já pode receber matches melhores.');
}

renderBaseProfile(context.base_profile || {});
await loadInitialProfile();
renderStep();
renderStrength();
bioCount.textContent = bio.value.length;

baseProfileForm.addEventListener('submit', submitBaseProfile);
saveProfileChanges.addEventListener('click', saveProfileEdition);
discardProfileChanges.addEventListener('click', discardProfileEdition);
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
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length - 1) currentStep += 1;
    renderStep();
});

stepButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const targetStep = Number(button.dataset.stepButton);
        if (!canNavigateTo(targetStep)) return;
        currentStep = targetStep;
        renderStep();
    });
});
