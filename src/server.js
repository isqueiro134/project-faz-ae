import express from 'express';
const app = express();
const path = require('path');

console.log((await pool.query('SELECT * FROM users')).rows);

app.use(express.json());

app.use(express.static('src'));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'src/html/home.html'));
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}...`);
})