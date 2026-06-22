import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requirePageAuth } from '../middleware/auth.js';
import ProfileRepository from '../Repository/ProfileRepository.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/home.html'));
});

router.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/login.html'));
});

router.get('/cadastro', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/cadastro.html'));
});

router.get('/recuperar-senha', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/recuperarSenha.html'));
});

router.get('/onboarding', requirePageAuth, async (req, res) => {
    const context = await new ProfileRepository().getContext(req.user);
    if (context.has_profile) return res.redirect(context.redirect_to);
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/onboarding.html'));
});

router.get('/perfil', requirePageAuth, async (req, res) => {
    const context = await new ProfileRepository().getContext(req.user);
    if (context.profile_type !== 'freelancer') return res.redirect(context.redirect_to);
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/completarPerfil.html'));
});

router.get('/dashboard', requirePageAuth, (req, res) => {
    res.redirect('/dashboard-cliente');
});

router.get('/dashboard-cliente', requirePageAuth, async (req, res) => {
    const context = await new ProfileRepository().getContext(req.user);
    if (context.profile_type !== 'client') return res.redirect(context.redirect_to);
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/dashboardCliente.html'));
});

router.get('/freelancers', requirePageAuth, async (req, res) => {
    const context = await new ProfileRepository().getContext(req.user);
    if (context.profile_type !== 'client') return res.redirect(context.redirect_to);
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/freelancersCliente.html'));
});

router.get('/dashboard-freelancer', requirePageAuth, async (req, res) => {
    const context = await new ProfileRepository().getContext(req.user);
    if (context.profile_type !== 'freelancer') return res.redirect(context.redirect_to);
    res.status(200).sendFile(path.join(__dirname, '../../public/pages/dashboardFreelancer.html'));
});

export default router;
