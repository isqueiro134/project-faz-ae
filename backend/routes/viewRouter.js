import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/home.html'));
});

router.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/login.html'));
});

router.get('/cadastro', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/cadastro.html'));
});

router.get('/recuperar-senha', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/recuperarSenha.html'));
});

router.get('/onboarding', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/onboarding.html'));
});

router.get('/dashboard', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/dashboard.html'));
});

export default router;