const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');

const app = express();


const db = mysql.createConnection({
  host: 'localhost', 
  user: 'root', 
  password: 'michiura12', 
  database: 'proagua', 
});


db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));


app.post('/cadastro', (req, res) => {
  const { nome, sobrenome, email, senha, genero, bairro } = req.body;

 
  db.query('INSERT INTO usuarios (nome, sobrenome, email, senha, genero, bairro) VALUES (?, ?, ?, ?, ?, ?)', 
  [nome, sobrenome, email, senha, genero, bairro], (err, result) => {
    if (err) {
      return res.status(500).send('Erro ao cadastrar usuário.');
    }
   
    res.status(200).send('Cadastro realizado com sucesso!');
  });
});

function avaliarDenuncia(descricao) {
  const palavrasProibidas = ['trote', 'brincadeira', 'fake', 'engano'];
  const contemTrote = palavrasProibidas.some(palavra => descricao.toLowerCase().includes(palavra));

  if (contemTrote) {
    return -2; 
  }

  if (descricao.length < 30) {
    return -1; 
  }

  return 1; 
}

app.post('/enviar_denuncia', (req, res) => {
  const { email, Tipo_denuncia, descricao } = req.body;


  db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send('Erro ao acessar o banco de dados.');

    if (results.length === 0) {
      return res.status(404).send('Usuário não encontrado.');
    }

    const user = results[0];
    let score = user.score || 0;
    let sendCount = user.sendCount || 0;
    let rejectedCount = user.rejectedCount || 0;

    const scoreChange = avaliarDenuncia(descricao);
    sendCount += 1;

    if (scoreChange < 0) {
      rejectedCount += 1;
      let mensagemErro = 'Sua mensagem não será enviada. ';
      
      if (scoreChange === -2) {
        mensagemErro += 'Identificamos que a mensagem contém termos que não são aceitos.';
      } else if (descricao.length < 30) {
        mensagemErro += 'A descrição da denúncia deve ter pelo menos 30 caracteres.';
      }

    
      db.query('UPDATE usuarios SET sendCount = ?, rejectedCount = ? WHERE email = ?', [sendCount, rejectedCount, email], err => {
        if (err) return res.status(500).send('Erro ao atualizar o usuário.');
      });

      return res.status(400).send(mensagemErro);
    }

    score += scoreChange;


    if (score < -4) {
      return res.status(403).send('Você foi temporariamente bloqueado de enviar denúncias devido a comportamentos inadequados.');
    }

   
    db.query('UPDATE usuarios SET score = ?, sendCount = ? WHERE email = ?', [score, sendCount, email], async (err) => {
      if (err) return res.status(500).send('Erro ao atualizar o usuário.');

     
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'proagua372@gmail.com', 
          pass: 'bxfv nslw unlf glad', 
        },
      });

      let mailOptions = {
        from: email,
        to: 'proagua372@gmail.com', 
        subject: `Denúncia de ${Tipo_denuncia}`,
        text: `Denúncia recebida:\n\nDescrição: ${descricao}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Denúncia enviada com sucesso!');
      } catch (error) {
        console.error('Erro ao enviar o email:', error);
        res.status(500).send('Erro ao enviar a denúncia.');
      }
    });
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
