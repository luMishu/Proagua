const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'michiura12',
    database: 'proagua'
});


connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados como ID', connection.threadId);
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: 'Erro ao buscar usuário.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        res.json({ message: 'Login bem-sucedido!' });
    });
});


app.post('/cadastro', async (req, res) => {
    const { nome, sobrenome, email, senha, confirmarSenha, genero, bairro } = req.body;

    if (senha !== confirmarSenha) {
        return res.status(400).send('As senhas não correspondem!');
    }

    const hashedSenha = await bcrypt.hash(senha, 10);
    const sql = 'INSERT INTO usuarios (nome, sobrenome, email, senha, genero, bairro) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nome, sobrenome, email, hashedSenha, genero, bairro], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar usuário:', err);
            return res.status(500).send('Erro ao cadastrar usuário. Tente novamente.');
        }
        res.send('Cadastro realizado com sucesso!');
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
