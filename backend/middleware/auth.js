import SessionRepository from '../Repository/SessionRepository.js';
import { getTokenFromReq, clearSessionCookie } from '../utils/cookies.js';

const sessions = new SessionRepository();

/** Resolve o usuário da sessão (ou null) e anexa em req.user. */
async function resolveUser(req) {
    const token = getTokenFromReq(req);
    const user = await sessions.findUserByToken(token);
    req.user = user;
    return user;
}

/** Protege rotas de PÁGINA: sem sessão válida → redireciona para /login. */
export async function requirePageAuth(req, res, next) {
    try {
        const user = await resolveUser(req);
        if (!user) {
            clearSessionCookie(res);
            return res.redirect('/login');
        }
        return next();
    } catch (error) {
        clearSessionCookie(res);
        return res.redirect('/login');
    }
}

/** Protege rotas de API: sem sessão válida → 401 JSON. */
export async function requireApiAuth(req, res, next) {
    try {
        const user = await resolveUser(req);
        if (!user) {
            clearSessionCookie(res);
            return res.status(401).json({ message: 'Não autenticado.' });
        }
        return next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
