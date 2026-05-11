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
|-- app.js
|-- package.json
|-- .env.example
|-- banco.db
|-- backend/
|   |-- config/
|   |   |-- db.js
|   |   `-- schema.sql
|   |-- Repository/
|   |   |-- BaseRepository.js
|   |   |-- AuthRepository.js
|   |   `-- UserRepository.js
|   |-- routes/
|   |   |-- userRouter.js
|   |   `-- viewRouter.js
|   `-- utils/
|       `-- dirname.js
`-- public/
    |-- pages/
    |-- css/
    |-- js/
    `-- services/
```

## Pré-requisitos

- Node.js 20+ recomendado
- npm 10+

## Configuração do Ambiente

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` com base no exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Configure as variáveis:

```env
PORT=3000
SQLITE_DB_PATH=./banco.db
```

## Banco de Dados SQLite

O arquivo `backend/config/db.js`:

- abre conexão com o banco definido em `SQLITE_DB_PATH`;
- usa `./banco.db` como caminho padrão;
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

### Rotas de páginas

- `GET /` -> `home.html`
- `GET /login` -> `login.html`
- `GET /cadastro` -> `cadastro.html`
- `GET /recuperar-senha` -> `recuperarSenha.html`
- `GET /onboarding` -> `onboarding.html`
- `GET /dashboard` -> `dashboard.html`

### API de usuários

Base: `/api/users`

- `GET /api/users`
  - busca usuário por `id` enviado atualmente no corpo da requisição.
- `POST /api/users`
  - cria registro de usuário com `email`, `password` e `metadata`.

Exemplo de payload:

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

O `schema.sql` define tabelas relacionais para usuários, perfis, clientes, freelancers, jobs, propostas e avaliações, com chaves estrangeiras e constraints para integridade dos dados.

## Estado Atual

O projeto usa SQLite como banco de dados. A camada de repositórios deve consultar e persistir dados usando SQL nativo por meio da conexão definida em `backend/config/db.js`.

Próximos passos recomendados:

- finalizar os endpoints consumidos pelo frontend;
- padronizar rotas REST, como `GET /api/users/:id`;
- adicionar validação de entrada;
- adicionar scripts de lint, testes e seed.

## Scripts npm

- `npm run dev` -> inicia o servidor com `node --watch app.js`
- `npm test` -> placeholder

## Equipe

- Isaque Oliveira
- Enzo Miashita
- Pedro Gama
- Ícaro Alexandre

## Licença

ISC.
