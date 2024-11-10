document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const sobrenome = document.getElementById('sobrenome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const genero = document.querySelector('input[name="genero"]:checked').value;
    const bairro = document.getElementById('bairro').value;

    if (senha !== confirmarSenha) {
        document.getElementById('mensagemErro').style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, sobrenome, email, senha, confirmarSenha, genero, bairro }),
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html'; 
        } else {
            const errorMessage = await response.text();
            alert('Erro ao cadastrar: ' + errorMessage);
        }
    } catch (error) {
        alert('Erro ao cadastrar: ' + error.message);
    }
});
