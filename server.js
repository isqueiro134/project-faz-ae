import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './src/config/db.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'src/public/pages/home.html'));
});

app.post('/users', async (req, res) => {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
        return res.status(400).json({ error: 'Nome, Email, Senha e Tipo de Usuário são obrigatórios para o cadastro.' });
    }

    const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password, user_type: userType }]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Usuário Cadastrado com sucesso!', data: data[0] });
});

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.static(path.join(__dirname, 'src/public/pages'), {
    extensions: ['html']
}));

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}...`);
})