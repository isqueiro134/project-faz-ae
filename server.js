const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

app.use(express.static('src'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/home.html'));
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}...`);
})