import express from 'express';
import FreelancerProfileRepository from '../Repository/FreelancerProfileRepository.js';
import ProfileRepository from '../Repository/ProfileRepository.js';
import { requireApiAuth } from '../middleware/auth.js';

const router = express.Router();

function validateProfile(data) {
    const errors = {};

    if (!data.user_id) errors.user_id = 'Usuario obrigatorio.';
    if (!data.professional_title || data.professional_title.trim().length < 10) errors.professional_title = 'Informe um titulo com pelo menos 10 caracteres.';
    if (!data.category) errors.category = 'Escolha uma area principal.';
    if (!Array.isArray(data.skills) || data.skills.length < 3) errors.skills = 'Adicione pelo menos 3 habilidades.';
    if (!data.bio || data.bio.trim().length < 120) errors.bio = 'Escreva uma bio com pelo menos 120 caracteres.';
    if (!data.availability) errors.availability = 'Informe sua disponibilidade.';
    if (!data.pricing_model) errors.pricing_model = 'Escolha um modelo de cobranca.';
    if (!data.hourly_rate && !data.project_rate_min) errors.price = 'Informe um valor base.';

    const hasPortfolio = Array.isArray(data.portfolio_items) && data.portfolio_items.length > 0;
    const hasLink = data.links && Object.values(data.links).some((value) => value);
    if (!hasPortfolio && !hasLink) errors.portfolio = 'Adicione um projeto ou link profissional.';

    return errors;
}

router.get('/', requireApiAuth, async (req, res) => {
    try {
        const context = await new ProfileRepository().getContext(req.user);
        if (context.profile_type !== 'client') {
            return res.status(403).json({ message: 'Ambiente incompativel.' });
        }

        const freelancers = await new FreelancerProfileRepository().listPublished();
        return res.status(200).json({ freelancers });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/me', requireApiAuth, async (req, res) => {
    try {
        const context = await new ProfileRepository().getContext(req.user);
        if (context.profile_type !== 'freelancer') {
            return res.status(403).json({ message: 'Ambiente incompativel.' });
        }

        const profile = await new FreelancerProfileRepository().findByUserId(req.user.id);
        return res.status(200).json({ profile });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', requireApiAuth, async (req, res) => {
    // user_id vem da sessão (cookie), nunca do corpo enviado pelo cliente.
    const data = { ...req.body, user_id: req.user.id };
    const errors = data.status === 'published' ? validateProfile(data) : {};

    if (Object.keys(errors).length) {
        return res.status(400).json({ errors });
    }

    try {
        const result = await new FreelancerProfileRepository().upsert(data);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
