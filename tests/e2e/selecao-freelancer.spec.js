import { test, expect } from '../fixtures.js';
import {
    countHiringsForFreelancer,
    findHiring,
    setFreelancerAvailability,
} from '../helpers/database.js';
import {
    createAuthenticatedProfile,
    createPublishedFreelancer,
    createUserData,
    loginExistingProfileThroughUi,
    validProfile,
} from '../helpers/freelancer.js';

async function createClientAndLogin(page) {
    const client = createUserData('cliente-selecao');
    await createAuthenticatedProfile(page, 'client', client);
    await page.request.post('/api/auth/logout');
    await loginExistingProfileThroughUi(page, client, '/dashboard-cliente');
    return client;
}

function freelancerCard(page, profileId) {
    return page.locator(`[data-freelancer-id="${profileId}"]`);
}

async function openFreelancerProfile(page, profileId) {
    const card = freelancerCard(page, profileId);
    await card.getByRole('button', { name: 'Ver perfil' }).click();
    await expect(page.locator('#profile-modal')).toBeVisible();
}

test.describe('Seleção de profissional freelancer', () => {
    test('seleciona, contrata e exibe o freelancer no dashboard', async ({ page }) => {
        const selected = await createPublishedFreelancer(page, {
            professionalTitle: 'Especialista em aplicações web',
            category: 'desenvolvimento',
            hourlyRate: '95',
        });
        await createPublishedFreelancer(page, {
            professionalTitle: 'Designer de produtos digitais',
            category: 'design',
        });
        const client = await createClientAndLogin(page);

        await page.goto('/freelancers');
        await page.locator('#category-filter').selectOption('desenvolvimento');
        const card = freelancerCard(page, selected.profile.id);
        await expect(card).toBeVisible();

        await openFreelancerProfile(page, selected.profile.id);
        await page.getByRole('button', { name: 'Escolher freelancer' }).click();
        await expect(page).toHaveURL(new RegExp(`/contratar\\?freelancer_id=${selected.profile.id}$`));
        await expect(page.locator('#hiring-name')).toHaveText(selected.user.fullName);
        await expect(page.locator('#hiring-professional-title')).toHaveText('Especialista em aplicações web');

        const hiringResponse = page.waitForResponse((response) => (
            response.url().endsWith('/api/hirings') && response.request().method() === 'POST'
        ));
        await page.locator('#confirm-hiring').click();
        expect((await hiringResponse).status()).toBe(201);

        await expect(page).toHaveURL(/\/dashboard-cliente\?contratacao=sucesso$/);
        await expect(page.locator('#hiring-success')).toBeVisible();
        const dashboardHiring = page.locator('[data-hiring-id]').filter({ hasText: selected.user.fullName });
        await expect(dashboardHiring).toContainText('Pendente');
        await expect(dashboardHiring).toContainText('R$ 95,00/h');

        const storedHiring = await findHiring(client.email, selected.user.email);
        expect(storedHiring).toMatchObject({
            status: 'pending',
            availability_status: 'busy',
        });
    });

    for (const scenario of [
        { status: 'busy', label: 'Ocupado' },
        { status: 'inactive', label: 'Inativo' },
    ]) {
        test(`informa indisponibilidade para freelancer ${scenario.label.toLowerCase()}`, async ({ page }) => {
            const freelancer = await createPublishedFreelancer(page);
            await setFreelancerAvailability(freelancer.user.email, scenario.status);
            await createClientAndLogin(page);

            await page.goto('/freelancers');
            const card = freelancerCard(page, freelancer.profile.id);
            await expect(card.locator('.availability-badge')).toHaveText(scenario.label);
            await openFreelancerProfile(page, freelancer.profile.id);
            await expect(page.getByRole('button', { name: 'Profissional indisponível' })).toBeDisabled();
            await expect(page.locator('.availability-warning')).toHaveText(/indisponível para contratação/);

            const response = await page.request.post('/api/hirings', {
                data: { freelancer_id: freelancer.profile.id },
            });
            expect(response.status()).toBe(409);
            await expect.poll(() => countHiringsForFreelancer(freelancer.user.email)).toBe(0);
        });
    }

    test('informa ausência de resultados para categoria sem profissionais', async ({ page }) => {
        await createPublishedFreelancer(page, { category: 'desenvolvimento' });
        await createClientAndLogin(page);

        await page.goto('/freelancers');
        await page.locator('#category-filter').selectOption('redacao');

        await expect(page.locator('#freelancer-count')).toHaveText('0 perfis');
        await expect(page.locator('#state-box')).toHaveText('Nenhum freelancer corresponde aos filtros.');
        await expect(page.locator('.freelancer-card')).toHaveCount(0);
    });

    test('exibe corretamente as informações do perfil', async ({ page }) => {
        const freelancer = await createPublishedFreelancer(page, {
            professionalTitle: 'Desenvolvedor de interfaces acessíveis',
            responseTime: 'ate-2h',
        });
        await createClientAndLogin(page);

        await page.goto('/freelancers');
        await openFreelancerProfile(page, freelancer.profile.id);

        const modal = page.locator('#profile-modal');
        await expect(modal.locator('#modal-name')).toHaveText(freelancer.user.fullName);
        await expect(modal).toContainText('Desenvolvedor de interfaces acessíveis');
        await expect(modal).toContainText(validProfile.bio);
        await expect(modal).toContainText(validProfile.category);
        await expect(modal).toContainText('R$ 80,00/h');
        await expect(modal).toContainText(validProfile.availability);
        await expect(modal).toContainText('JavaScript');
        await expect(modal).toContainText(validProfile.projectTitle);
        await expect(modal).toContainText(validProfile.projectDescription);
    });

    test('lista somente publicados e filtra por categoria', async ({ page }) => {
        const developer = await createPublishedFreelancer(page, {
            professionalTitle: 'Desenvolvedor de sistemas web',
            category: 'desenvolvimento',
        });
        const designer = await createPublishedFreelancer(page, {
            professionalTitle: 'Designer de experiências digitais',
            category: 'design',
        });
        const draft = createUserData('freelancer-rascunho');
        await createAuthenticatedProfile(page, 'freelancer', draft);
        await createClientAndLogin(page);

        await page.goto('/freelancers');
        await expect(freelancerCard(page, developer.profile.id)).toBeVisible();
        await expect(freelancerCard(page, designer.profile.id)).toBeVisible();
        await expect(page.locator('.freelancer-card').filter({ hasText: draft.fullName })).toHaveCount(0);

        await page.locator('#category-filter').selectOption('design');
        await expect(freelancerCard(page, designer.profile.id)).toBeVisible();
        await expect(freelancerCard(page, developer.profile.id)).toBeHidden();
        await expect(page.locator('#freelancer-count')).toHaveText(/\d+ perfis/);
    });
});
