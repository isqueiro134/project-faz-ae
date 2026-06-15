# AGENTS.md

# CRÍTICO
NUNCA narre passos internos.

PROIBIDO:
- "vou analisar"
- "agora vou"
- "encontrei"
- "vou verificar"
- explicar raciocínio
- explicar planejamento

## Objetivo
Economizar tokens e evitar respostas longas.

## Regras
- responder de forma objetiva
- evitar explicações desnecessárias
- mostrar apenas código alterado
- não reescrever arquivos inteiros
- usar diffs sempre que possível
- evitar repetição
- modificar apenas o necessário
- preservar arquitetura existente
- evitar gerar documentação longa
- evitar exemplos extras sem solicitação

## Projeto

O Faz Aê é um marketplace de serviços freelance. A aplicação conecta clientes que publicam demandas com freelancers que podem oferecer serviços, enviar propostas e acompanhar trabalhos.

## Estado Atual

- Frontend em HTML, CSS e JavaScript puro.
- Backend em Node.js com Express.
- Módulos JavaScript usando ES Modules.
- Banco de dados: SQLite.
- Configuração por variáveis de ambiente com `dotenv`.
- Páginas atuais: home, login, cadastro, recuperação de senha, onboarding e dashboard.
- API principal atual: `/api/users`.

## Persistência

SQLite é a única camada de persistência definida para o projeto.

- A conexão fica em `backend/config/db.js`.
- O schema fica em `backend/config/schema.sql`.
- O caminho do banco deve vir de `SQLITE_DB_PATH`.
- O caminho padrão é `./banco.db`.
- Novas features devem criar ou alterar tabelas no schema SQLite.
- Repositórios devem usar SQL nativo pela conexão central do projeto.

## Stack Mantida

Mantenha as tecnologias atuais:

- HTML
- CSS
- JavaScript
- Node.js
- Express
- SQLite

Não introduza frameworks ou serviços externos sem pedido explícito.

## Direção Futura

As próximas evoluções previstas são:

- autenticar usuários com dados persistidos no SQLite;
- finalizar login, logout e recuperação de senha;
- concluir onboarding de cliente/freelancer;
- evoluir dashboard com dados reais;
- adicionar entidades de jobs, propostas, avaliações e mensagens;
- criar seeds para ambiente de desenvolvimento;
- adicionar validações, testes e padronização de respostas da API.

## Padrões De Trabalho

- Preserve mudanças locais existentes.
- Antes de alterar código, entenda os arquivos relacionados.
- Prefira mudanças pequenas e coerentes com a estrutura atual.
- Use Conventional Commits quando criar commits.
- Não altere branches remotas, faça push ou crie PR sem pedido explícito.
- Evite refatorações amplas sem necessidade direta.

## Validação Recomendada

Ao mexer no backend:

- rodar `npm run dev`;
- validar inicialização do SQLite;
- testar rotas alteradas;
- conferir busca global por referências obsoletas antes de finalizar.

Ao mexer no frontend:

- verificar caminhos de scripts e estilos;
- testar o fluxo no navegador;
- manter HTML, CSS e JavaScript simples e consistentes.
