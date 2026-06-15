import { defineConfig } from 'vite';

export default defineConfig({
  // Define que a pasta 'public' é a raiz dos arquivos do seu site
  root: './public', 
  server: {
    port: 5173,
    // Faz o Vite redirecionar os pedidos de banco de dados para o seu Node.js
    proxy: {
      '/api': 'http://localhost:3000', 
    }
  }
});