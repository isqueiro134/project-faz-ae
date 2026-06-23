import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import viewRouter from './backend/routes/viewRouter.js';
import userRouter from './backend/routes/userRouter.js';
import authRouter from './backend/routes/authRouter.js';
import freelancerRouter from './backend/routes/freelancer.js';
import hiringRouter from './backend/routes/hiringRouter.js';
import profileRouter from './backend/routes/profileRouter.js';
import connectDB, { closeDB } from './backend/config/db.js';
const app = express();
await connectDB();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mapeia arquivos HTML para suas rotas "bonitas" (que aplicam autenticação).
const PAGE_ROUTES = {
    'home.html': '/',
    'index.html': '/',
    'login.html': '/login',
    'cadastro.html': '/cadastro',
    'recuperarSenha.html': '/recuperar-senha',
    'onboarding.html': '/onboarding',
    'completarPerfil.html': '/perfil',
    'conta.html': '/conta',
    'dashboard.html': '/dashboard',
    'dashboardCliente.html': '/dashboard-cliente',
    'dashboardFreelancer.html': '/dashboard-freelancer',
    'freelancersCliente.html': '/freelancers',
    'contratarFreelancer.html': '/contratar',
};

// Impede acesso direto a /pages/*.html (e /index.html), forçando o uso das rotas protegidas.
app.use((req, res, next) => {
    const match = req.path.match(/\/([^/]+\.html)$/i);
    if (match && PAGE_ROUTES[match[1]]) {
        return res.redirect(PAGE_ROUTES[match[1]]);
    }
    next();
});

app.use(express.static('public'));
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/freelancer-profile", freelancerRouter);
app.use("/api/hirings", hiringRouter);
app.use("/", viewRouter);

const PORT = process.env.PORT;

export const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}...`);
});

let shuttingDown = false;

/** Encerra HTTP e depois fecha o SQLite (singleton). */
async function gracefulShutdown(server) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log("\n---> Encerrando servidor e conexão com o banco...");

    try {
        await new Promise((resolve) => server.close(() => resolve()));
        await closeDB();
        console.log("---> ✓ Conexão com SQLite fechada com sucesso.");
        process.exit(0);
    } catch (err) {
        console.error("---> ✗ Erro ao encerrar:", err);
        try {
            await closeDB();
        } catch (_) {
            /* noop */
        }
        process.exit(1);
    }
}
  
  // 2. Escutando os sinais do sistema operacional
  // SIGINT: Acionado pelo Ctrl+C no terminal
  process.on('SIGINT', () => gracefulShutdown(server));
  
  // SIGTERM: Acionado por serviços de hospedagem (como Heroku, Docker, PM2)
  process.on('SIGTERM', () => gracefulShutdown(server));
