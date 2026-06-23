import { expect } from '@playwright/test';

let userSequence = 0;

const biography = 'Desenvolvo solucoes web acessiveis, responsivas e orientadas a resultados para pequenas empresas que precisam melhorar sua presenca digital.';
const projectDescription = 'Desenvolvi toda a interface responsiva, organizei os componentes e melhorei a experiencia de navegacao para aumentar as conversoes do produto.';

function cpfDigit(numbers, factor) {
    const total = numbers.reduce((sum, number) => sum + number * factor--, 0);
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
}

function generateCpf(sequence) {
    const base = String(100_000_000 + sequence).slice(-9).split('').map(Number);
    const firstDigit = cpfDigit(base, 10);
    const secondDigit = cpfDigit([...base, firstDigit], 11);
    return [...base, firstDigit, secondDigit].join('');
}

export function createUserData(prefix = 'usuario') {
    userSequence += 1;
    const unique = `${Date.now()}-${userSequence}`;

    return {
        fullName: `Teste ${prefix} ${userSequence}`,
        email: `${prefix}-${unique}@example.com`,
        cpf: generateCpf(userSequence),
        password: 'SenhaE2E123!',
    };
}

export const validProfile = {
    professionalTitle: 'Desenvolvedor Front-end Freelancer',
    category: 'desenvolvimento',
    level: 'pleno',
    location: 'Remoto, Brasil',
    skills: 'JavaScript, Node.js, HTML, CSS',
    availability: '20-40h',
    workModel: 'remoto',
    bio: biography,
    projectTitle: 'Landing page para plataforma SaaS',
    projectCategory: 'Desenvolvimento',
    projectUrl: 'https://example.com/projeto-saas',
    projectDescription,
    pricingModel: 'hourly',
    hourlyRate: '80',
};

export async function registerThroughUi(page, user) {
    await page.goto('/cadastro');
    await page.locator('#name').fill(user.fullName);
    await page.locator('#email').fill(user.email);
    await page.locator('#cpf').fill(user.cpf);
    await page.locator('#password').fill(user.password);
    await page.locator('#confirmarSenha').fill(user.password);
    await page.locator('input[name="concordo"]').check();

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#registroForm button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login$/);
}

export async function loginThroughUi(page, user) {
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.locator('#loginForm button[type="submit"]').click();
    await expect(page).toHaveURL(/\/onboarding$/);
}

export async function loginExistingProfileThroughUi(page, user, expectedPath) {
    await page.goto('/login');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.locator('#loginForm button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(`${expectedPath.replace('/', '\\/')}$`));
}

export async function selectFreelancerThroughUi(page) {
    await page.locator('[data-type="freelancer"]').click();
    await page.locator('#continue').click();
    await expect(page).toHaveURL(/\/dashboard-freelancer$/);
}

export async function createAuthenticatedProfile(page, profileType, user = createUserData(profileType)) {
    const registration = await page.request.post('/api/users', {
        data: {
            email: user.email,
            password: user.password,
            cpf: user.cpf,
            metadata: { full_name: user.fullName },
        },
    });
    expect(registration.ok()).toBeTruthy();

    const selection = await page.request.post('/api/profiles/select', {
        data: { profile_type: profileType },
    });
    expect(selection.ok()).toBeTruthy();

    return user;
}

export async function createPublishedFreelancer(page, overrides = {}) {
    const user = overrides.user || createUserData('freelancer-publicado');
    await createAuthenticatedProfile(page, 'freelancer', user);

    const profile = {
        professional_title: overrides.professionalTitle || validProfile.professionalTitle,
        category: overrides.category || validProfile.category,
        level: overrides.level || validProfile.level,
        location: overrides.location || validProfile.location,
        skills: overrides.skills || validProfile.skills.split(', '),
        languages: [],
        tools: [],
        niches: [],
        project_types: [],
        availability: overrides.availability || validProfile.availability,
        availability_status: overrides.availabilityStatus || 'available',
        work_model: overrides.workModel || validProfile.workModel,
        bio: overrides.bio || validProfile.bio,
        experience_years: null,
        result_highlight: null,
        education: null,
        portfolio_url: null,
        links: {},
        portfolio_items: [{
            title: overrides.projectTitle || validProfile.projectTitle,
            category: overrides.projectCategory || validProfile.projectCategory,
            url: overrides.projectUrl || validProfile.projectUrl,
            description: overrides.projectDescription || validProfile.projectDescription,
        }],
        pricing_model: overrides.pricingModel || validProfile.pricingModel,
        hourly_rate: Number(overrides.hourlyRate || validProfile.hourlyRate),
        project_rate_min: null,
        project_rate_max: null,
        response_time: overrides.responseTime || 'mesmo-dia',
        project_size: null,
        urgent_projects: false,
        profile_strength: 100,
        status: 'published',
    };

    const response = await page.request.post('/api/freelancer-profile', { data: profile });
    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    return {
        user,
        profile: { ...profile, id: result.id },
    };
}

export async function fillIdentity(page, profile = validProfile) {
    await page.locator('#professionalTitle').fill(profile.professionalTitle);
    await page.locator('#category').selectOption(profile.category);
    await page.locator('#level').selectOption(profile.level);
    await page.locator('#location').fill(profile.location);
}

export async function fillUntilPortfolio(page, profile = validProfile) {
    await fillIdentity(page, profile);
    await page.locator('#nextStep').click();

    await page.locator('#skills').fill(profile.skills);
    await page.locator('#availability').selectOption(profile.availability);
    await page.locator('#workModel').selectOption(profile.workModel);
    await page.locator('#nextStep').click();

    await page.locator('#bio').fill(profile.bio);
    await page.locator('#nextStep').click();
}

export async function fillPortfolio(page, profile = validProfile) {
    await page.locator('[name="project_title"]').first().fill(profile.projectTitle);
    await page.locator('[name="project_category"]').first().fill(profile.projectCategory);
    await page.locator('[name="project_url"]').first().fill(profile.projectUrl);
    await page.locator('[name="project_description"]').first().fill(profile.projectDescription);
}

export async function reachPricing(page, profile = validProfile) {
    await fillUntilPortfolio(page, profile);
    await fillPortfolio(page, profile);
    await page.locator('#nextStep').click();
}

export async function publishValidProfile(page, profile = validProfile) {
    await reachPricing(page, profile);
    await page.locator('#pricingModel').selectOption(profile.pricingModel);
    await page.locator('#hourlyRate').fill(profile.hourlyRate);

    const responsePromise = page.waitForResponse((response) => (
        response.url().endsWith('/api/freelancer-profile') &&
        response.request().method() === 'POST'
    ));

    await page.locator('#publishProfile').click();
    return responsePromise;
}
