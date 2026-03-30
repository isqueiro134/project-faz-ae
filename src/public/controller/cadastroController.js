const form = document.querySelector("#registroForm");
const senha = document.getElementById('senha');
const confirma = document.getElementById('confirmarSenha');
const erroMsg = document.getElementById('errorSenha');

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (senha.value !== confirma.value) {
    confirma.classList.add('invalid');
    erroMsg.style.display = 'block';
  } else {
    confirma.classList.remove('invalid');
    erroMsg.style.display = 'none';

    const formData = new FormData(event.target);
    const dados = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/efetua-cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (response.ok) {
        const result = await response.json();
        console.log("deu certo");
        console.log(result);
      } else {
        console.error("Erro no servidor", response.status);
      }
    } catch (error) {
      console.error("Erro na requisicao", erro);
    }

  }
});


// Lógica unificada para mostrar/ocultar senha
document.querySelectorAll('.toggle-btn').forEach(button => {
  button.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';
    this.textContent = isPassword ? 'ocultar' : 'ver';
  });
});

// Exemplo simples de máscara de CPF (opcional)
document.getElementById('cpf').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);

  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  e.target.value = value;
});