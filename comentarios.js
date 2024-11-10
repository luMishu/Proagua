function adicionarComentario() {
    const nomeInput = document.getElementById('nomeInput');
    const comentarioInput = document.getElementById('comentarioInput');
    const comentariosUl = document.querySelector('.comentarios');

    const nome = nomeInput.value.trim();
    const comentario = comentarioInput.value.trim();

    if (nome && comentario) {
        const novoComentario = document.createElement('li');
        novoComentario.innerHTML = `<strong>${nome}:</strong> ${comentario}`;
        comentariosUl.appendChild(novoComentario);

 
        nomeInput.value = '';
        comentarioInput.value = '';
    } else {
        alert('Por favor, preencha seu nome e comentário.');
    }
}
