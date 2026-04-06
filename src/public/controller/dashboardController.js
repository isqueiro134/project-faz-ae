import autenticacao from "./token";

if (!autenticacao) {
    window.location.href = "/home";
}

try {
      const response = await fetch('/dados-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      })

      if (response.ok) {
        const result = await response.json();
      } else {
        console.error("Erro no servidor", response.status);
      }
    } catch (error) {
      console.error("Erro na requisicao", erro);
    }