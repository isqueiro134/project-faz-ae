import { SESSION_MAX_AGE_SECONDS } from '../Repository/SessionRepository.js';

const COOKIE_NAME = 'token';
const isProduction = process.env.NODE_ENV === 'production';

/** Lê o header Cookie cru e devolve um objeto { nome: valor }. */
export function parseCookies(req) {
    const header = req.headers?.cookie;
    if (!header) return {};

    return header.split(';').reduce((acc, part) => {
        const index = part.indexOf('=');
        if (index < 0) return acc;
        const name = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();
        if (name) acc[name] = decodeURIComponent(value);
        return acc;
    }, {});
}

/** Lê o token de sessão do cookie da requisição. */
export function getTokenFromReq(req) {
    return parseCookies(req)[COOKIE_NAME] || null;
}

/** Define o cookie HttpOnly de sessão. */
export function setSessionCookie(res, token) {
    const parts = [
        `${COOKIE_NAME}=${encodeURIComponent(token)}`,
        'HttpOnly',
        'Path=/',
        'SameSite=Lax',
        `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    ];
    if (isProduction) parts.push('Secure');
    res.append('Set-Cookie', parts.join('; '));
}

/** Limpa o cookie de sessão. */
export function clearSessionCookie(res) {
    const parts = [
        `${COOKIE_NAME}=`,
        'HttpOnly',
        'Path=/',
        'SameSite=Lax',
        'Max-Age=0',
    ];
    if (isProduction) parts.push('Secure');
    res.append('Set-Cookie', parts.join('; '));
}
