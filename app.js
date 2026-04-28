import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import viewRouter from './backend/routes/viewRouter.js';
import userRouter from './backend/routes/userRouter.js';
import connectDB, { closeDB } from './backend/config/db.js';
const app = express();
await connectDB();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static('public'));
app.use("/api/users", userRouter);
app.use("/", viewRouter);

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
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