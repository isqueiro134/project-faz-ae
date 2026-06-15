import express from 'express';
import SessionRepository from '../Repository/SessionRepository.js';
import { requireApiAuth } from '../middleware/auth.js';
import { getTokenFromReq, clearSessionCookie } from '../utils/cookies.js';

const router = express.Router();

/** Retorna o usuário autenticado (via cookie de sessão). */
router.get('/me', requireApiAuth, (req, res) => {
    res.status(200).json({ user: req.user });
});

/** Encerra a sessão: remove do banco e limpa o cookie. */
router.post('/logout', async (req, res) => {
    try {
        await new SessionRepository().deleteByToken(getTokenFromReq(req));
    } catch (error) {
        // logout é best-effort; segue limpando o cookie
    }
    clearSessionCookie(res);
    res.status(200).json({ message: 'Sessão encerrada.' });
});

export default router;
