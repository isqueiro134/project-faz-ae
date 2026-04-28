# Projeto Faz Aê

Marketplace de serviços freelance desenvolvido para o Projeto Integrador, com frontend em HTML/CSS/JavaScript e backend em Node.js + Express.

## Visão Geral

O objetivo do projeto é conectar clientes e freelancers por meio de uma plataforma web com:

- cadastro e autenticação de usuários;
- onboarding de perfil;
- dashboard;
- base de dados relacional para usuários, perfis, jobs, propostas e avaliações.

## Stack Tecnológica

- **Backend:** Node.js, Express
- **Banco de dados:** SQLite (`sqlite` + `sqlite3`)
- **Frontend:** HTML, CSS, JavaScript puro
- **Configuração:** dotenv
- **Módulos:** ES Modules (`"type": "module"`)

## Estrutura do Projeto

```text
projeto-faz-ae/
├── app.js
├── package.json
├── .env.example
├── banco.db
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── schema.sql
│   ├── Repository/
│   │   ├── BaseRepository.js
│   │   ├── AuthRepository.js
│   │   └── UserRepository.js
│   ├── routes/
│   │   ├── userRouter.js
│   │   └── viewRouter.js
│   └── utils/
│       └── dirname.js
└── public/
    ├── pages/
    ├── css/
    ├── js/
    └── services/
```

## Pré-requisitos

- Node.js 20+ (recomendado 22+)
- npm 10+

## Configuração do Ambiente

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd projeto-faz-ae
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` com base no exemplo:

```bash
cp .env.example .env
```

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

4. Defina ao menos a variável abaixo no `.env`:

```env
PORT=3000
```

> Observação: o `.env.example` ainda contém variáveis legadas do Supabase. O backend atual já usa SQLite para inicialização do schema.

## Banco de Dados (SQLite)

O arquivo `backend/config/db.js`:

- abre conexão com o SQLite em `./banco.db`;
- habilita `foreign_keys`;
- aplica `journal_mode = WAL`;
- lê e executa o schema de `backend/config/schema.sql`.

Para inicializar/criar tabelas manualmente:

```bash
node backend/config/db.js
```

## Executando o Projeto

Inicie em modo desenvolvimento:

```bash
npm run dev
```

Servidor:

- `http://localhost:<PORT>`

Com `PORT=3000`:

- `http://localhost:3000`

## Rotas Disponíveis

### Rotas de páginas (View Router)

- `GET /` -> `home.html`
- `GET /login` -> `login.html`
- `GET /cadastro` -> `cadastro.html`
- `GET /recuperar-senha` -> `recuperarSenha.html`
- `GET /onboarding` -> `onboarding.html`
- `GET /dashboard` -> `dashboard.html`

### Rotas de API (Users)

Base: `/api/users`

- `GET /api/users`
  - busca usuário por `id` (enviado atualmente no corpo da requisição).
- `POST /api/users`
  - cria registro de usuário com `email`, `password` e `metadata`.

Exemplo de payload (`POST /api/users`):

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "metadata": {
    "full_name": "Nome do Usuário"
  }
}
```

## Modelo de Dados

O `schema.sql` define as tabelas:

- `users`
- `profiles`
- `client_profiles`
- `freelancer_profiles`
- `jobs`
- `proposals`
- `reviews`

Com relacionamentos via chaves estrangeiras e constraints para garantir integridade dos dados.

## Estado Atual do Projeto

O projeto está em transição de uma camada antiga baseada em Supabase para SQLite. Por isso, algumas classes em `backend/Repository/` ainda referenciam `supabase` e devem ser adaptadas para consultas SQL nativas.

Itens recomendados para próximos passos:

- refatorar `BaseRepository`, `AuthRepository` e `UserRepository` para SQLite;
- atualizar `.env.example` removendo variáveis legadas;
- padronizar rotas REST (ex.: usar `GET /api/users/:id` em vez de `GET` com body);
- adicionar scripts de lint, testes e seed.

## Scripts npm

- `npm run dev` -> inicia o servidor com `node --watch app.js`
- `npm test` -> placeholder (ainda não implementado)

## Equipe

- Isaque Oliveira
- Enzo Miashita
- Pedro Gama
- Ícaro Alexandre

## Licença

ISC.
