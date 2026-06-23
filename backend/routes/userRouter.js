import express from 'express';
import UserRepository from '../Repository/UserRepository.js';
import AuthRepository from '../Repository/AuthRepository.js';
import SessionRepository from '../Repository/SessionRepository.js';
import ProfileRepository from '../Repository/ProfileRepository.js';
import AccountRepository from '../Repository/AccountRepository.js';
import { requireApiAuth } from '../middleware/auth.js';
import { setSessionCookie, clearSessionCookie } from '../utils/cookies.js';

const router = express.Router();

/** Cria a sessão, seta o cookie e devolve o resultado com a sessão. */
async function startSession(res, result) {
    const session = await new SessionRepository().create(result.user.id);
    const context = await new ProfileRepository().getContext(result.user);
    setSessionCookie(res, session.token);
    return { ...result, ...context, session: { expires_at: session.expiresAt } };
}

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await new AuthRepository().signIn(email, password);
        res.status(200).json(await startSession(res, result));
    } catch (error) {
        res.status(error.status || 401).json({ message: error.message });
    }
})

router.delete('/me', requireApiAuth, async (req, res) => {
    try {
        const { reason, details } = req.body;
        await new AccountRepository().closeAccount(req.user.id, reason, details);
        clearSessionCookie(res);
        res.status(200).json({ message: 'Conta encerrada com sucesso.' });
    } catch (error) {
        const status = error.status || 500;
        const message = error.status
            ? error.message
            : 'Não foi possível encerrar sua conta. Tente novamente.';
        res.status(status).json({ message });
    }
});

// MVP: não envia e-mail real. Resposta genérica para não revelar quais contas existem.
router.post("/recover-password", (req, res) => {
    const { identifier } = req.body;
    if (!identifier || !String(identifier).trim()) {
        return res.status(400).json({ message: 'Informe seu email ou CPF.' });
    }
    res.status(200).json({ message: 'Se a conta existir, enviaremos instruções de recuperação.' });
})

router
    .route("/")
    .get(async (req, res) => {
        try {
            const results = await new UserRepository().getAll();
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(async (req, res) => {
        const { email, password, metadata, cpf } = req.body;
        try {
            const result = await new AuthRepository().register(email, password, metadata, cpf);
            res.status(201).json(await startSession(res, result));
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    })

router
    .route("/:id")
    .get(async (req, res) => {
        const { id } = req.params;
        try {
            const result = await new UserRepository().getById(id);
            if (!result) return res.status(404).json({ message: 'Usuário não encontrado.' });
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })


export default router;
