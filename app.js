import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import viewRouter from './backend/routes/viewRouter.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static('public'));
app.use("/", viewRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}...`);
})