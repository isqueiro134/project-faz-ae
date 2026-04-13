import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// import { supabase } from './src/config/db.js';

import { conectarBanco } from './src/config/db/db2.js';
import { registrarUsuario } from './src/config/cadastro.js';
let db;

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'src/public/pages/home.html'));
});

app.post('/efetua-cadastro', registrarUsuario);

app.post('/efetua-login', (req, res) => {
    const { usuario, senha} = req.body;
    console.log("Dados recebidos (login): ", req.body);

    res.status(200).json({ mensagem: 'Logado com sucesso!', usuario: usuario });
});

app.post('/dados-dashboard', (req, res) => {
    const { usuario, senha} = req.body;
    console.log("Dados recebidos (login): ", req.body);

    res.status(200).json({ mensagem: 'Logado com sucesso!', usuario: usuario });
});

app.post('/recuperar-senha', (req, res) => {
    const { usuario, senha} = req.body;
    console.log("Dados recebidos (login): ", req.body);

    res.status(200).json({ mensagem: 'Logado com sucesso!', usuario: usuario });
});

app.post('/autenticacao-usuario', (req, res) => {
    const { usuario, senha} = req.body;
    console.log("Dados recebidos (login): ", req.body);

    res.status(200).json({ mensagem: 'Logado com sucesso!', usuario: usuario });
});

// app.post('/users', async (req, res) => {
//     const { name, email, password, userType } = req.body;

//     if (!name || !email || !password || !userType) {
//         return res.status(400).json({ error: 'Nome, Email, Senha e Tipo de Usuário são obrigatórios para o cadastro.' });
//     }

//     const { data, error } = await supabase
//     .from('users')
//     .insert([{ name, email, password, user_type: userType }]);

//     if (error) {
//         return res.status(500).json({ error: error.message });
//     }

//     return res.status(201).json({ message: 'Usuário Cadastrado com sucesso!', data: data[0] });
// });

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'src/public')));
app.use(express.static(path.join(__dirname, 'src/public/pages'), {
    extensions: ['html']
}));

async function iniciar() {
    try {
        await conectarBanco();
        app.listen(3000, () => console.log("Servidor online em http://localhost:3000"));
    } catch (error) {
        console.error("Erro ao iniciar o servidor:", error);
    }
}

iniciar();