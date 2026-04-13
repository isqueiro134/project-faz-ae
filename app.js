import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/home.html'));
});

app.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/login.html'));
});

app.get('/cadastro', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/cadastro.html'));
});

app.get('/recuperar-senha', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/recuperarSenha.html'));
});

app.get('/onboarding', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/onboarding.html'));
});

app.get('/dashboard', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public/pages/dashboard.html'));
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}...`);
})