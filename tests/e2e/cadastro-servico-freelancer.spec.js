import { test, expect } from '../fixtures.js';
import { findFreelancerByEmail } from '../helpers/database.js';
import {
    createAuthenticatedProfile,
    createUserData,
    fillIdentity,
    fillPortfolio,
    fillUntilPortfolio,
    loginThroughUi,
    publishValidProfile,
    reachPricing,
    registerThroughUi,
    selectFreelancerThroughUi,
    validProfile,
} from '../helpers/freelancer.js';

test.describe('Cadastro de serviço freelancer', () => {
    test('cadastra, persiste e exibe um perfil freelancer para clientes', async ({ page }) => {
        const freelancer = createUserData('freelancer-valido');

        await registerThroughUi(page, freelancer);
        await loginThroughUi(page, freelancer);
        await selectFreelancerThroughUi(page);
        await page.goto('/perfil');

        const response = await publishValidProfile(page);
        expect(response.ok()).toBeTruthy();
        await expect(page.locator('#formAlert')).toHaveText(/Perfil publicado/);

        const storedProfile = await findFreelancerByEmail(freelancer.email);
        expect(storedProfile).toMatchObject({
            full_name: freelancer.fullName,
            professional_title: validProfile.professionalTitle,
            category: validProfile.category,
            hourly_rate: 80,
            status: 'published',
        });
        expect(storedProfile.skills).toEqual(['JavaScript', 'Node.js', 'HTML', 'CSS']);
        expect(storedProfile.portfolio_items).toEqual([
            {
                title: validProfile.projectTitle,
                category: validProfile.projectCategory,
                url: validProfile.projectUrl,
                description: validProfile.projectDescription,
            },
        ]);

        await page.request.post('/api/auth/logout');
        await createAuthenticatedProfile(page, 'client', createUserData('cliente'));
        await page.goto('/freelancers');

        const card = page.locator('.freelancer-card').filter({ hasText: freelancer.fullName });
        await expect(card).toBeVisible();
        await expect(card).toContainText(validProfile.professionalTitle);
        await expect(card).toContainText(validProfile.category);
        await expect(card).toContainText(/R\$\s*80,00\/h/);
    });

    const emptyFieldCases = [
        {
            name: 'título vazio',
            field: '#professionalTitle',
            message: /Informe um título profissional/,
            prepare: async (page) => fillIdentity(page),
            submit: async (page) => {
                await page.locator('#professionalTitle').fill('');
                await page.locator('#nextStep').click();
            },
        },
        {
            name: 'categoria vazia',
            field: '#category',
            message: /Escolha sua área principal/,
            prepare: async (page) => fillIdentity(page),
            submit: async (page) => {
                await page.locator('#category').selectOption('');
                await page.locator('#nextStep').click();
            },
        },
        {
            name: 'descrição vazia',
            field: '[name="project_description"]',
            message: /Preencha pelo menos um projeto/,
            prepare: async (page) => {
                await fillUntilPortfolio(page);
                await fillPortfolio(page);
            },
            submit: async (page) => {
                await page.locator('[name="project_description"]').first().fill('');
                await page.locator('#nextStep').click();
            },
        },
        {
            name: 'preço vazio',
            field: '#hourlyRate',
            message: /Informe valor por hora ou valor inicial por projeto/,
            prepare: async (page) => {
                await reachPricing(page);
                await page.locator('#pricingModel').selectOption('hourly');
            },
            submit: async (page) => page.locator('#publishProfile').click(),
        },
    ];

    for (const scenario of emptyFieldCases) {
        test(`impede publicação com ${scenario.name}`, async ({ page }) => {
            const freelancer = await createAuthenticatedProfile(page, 'freelancer');
            await page.goto('/perfil');
            await scenario.prepare(page);
            await scenario.submit(page);

            const field = page.locator(scenario.field).first();
            await expect(page.locator('#formAlert')).toHaveText(scenario.message);
            await expect(field).toHaveAttribute('aria-invalid', 'true');
            await expect(field).toBeFocused();

            const storedProfile = await findFreelancerByEmail(freelancer.email);
            expect(storedProfile.status).toBe('draft');
        });
    }

    test('impede letras no campo de preço', async ({ page }) => {
        const freelancer = await createAuthenticatedProfile(page, 'freelancer');
        await page.goto('/perfil');
        await reachPricing(page);
        await page.locator('#pricingModel').selectOption('hourly');

        const hourlyRate = page.locator('#hourlyRate');
        await hourlyRate.pressSequentially('abc');
        await expect(hourlyRate).toHaveValue('');
        await page.locator('#publishProfile').click();

        await expect(page.locator('#formAlert')).toHaveText(/Informe valor por hora ou valor inicial por projeto/);
        await expect(hourlyRate).toHaveAttribute('aria-invalid', 'true');

        const storedProfile = await findFreelancerByEmail(freelancer.email);
        expect(storedProfile.status).toBe('draft');
    });

    test.skip('upload inválido — não aplicável enquanto o perfil aceitar somente URLs', async () => {});
});
