import { getDB } from './db/db2.js';

export async function registrarUsuario(req, res) {
    const { nome, email, cpf, senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
        return res.status(400).json({ mensagem: 'As senhas não coincidem!' });
    }

    try {
        const db = await getDB();
        const resultado = await db.run(
            `INSERT INTO usuarios (nome, email, cpf, senha) VALUES (?, ?, ?, ?)`,
            [nome, email, cpf, senha]
        );
        console.log("Usuario " + nome + " cadastrado com sucesso!");
        res.status(201).json({ 
            mensagem: 'Cadastrado com sucesso!', 
            nome: nome,
            id: resultado.lastID 
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ mensagem: 'E-mail ou CPF já cadastrados.' });
        }
        res.status(500).json({ mensagem: 'Erro interno ao salvar no banco.' });
    }
}