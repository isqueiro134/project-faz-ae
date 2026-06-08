# Plano de Testes – Plataforma Faz Aê

# 1. Introdução

## Objetivo

Este documento define os testes necessários para validar o funcionamento da plataforma Faz Aê, garantindo que os principais fluxos de negócio estejam operando corretamente e que os requisitos funcionais do MVP sejam atendidos.

O foco da validação está nos fluxos críticos da aplicação:

* Cadastro de usuários;
* Login e autenticação;
* Onboarding;
* Dashboard;
* Publicação de projetos;
* Comunicação entre cliente e freelancer;
* Acompanhamento de projetos;
* Gestão financeira;
* Avaliações.

---

# 2. Escopo dos Testes

Serão executados:

## Testes Funcionais

Validação dos requisitos de negócio.

## Testes de Integração

Validação da comunicação entre:

* Frontend
* Backend
* Banco de Dados SQLite

## Testes de Interface

Validação visual das telas.

## Testes de Validação

Verificação de campos obrigatórios e regras de negócio.

---

# 3. Ambiente de Testes

## Frontend

HTML, CSS e JavaScript

## Backend

Node.js + Express

## Banco de Dados

SQLite

## Navegadores

* Google Chrome
* Microsoft Edge
* Mozilla Firefox

---

# 4. Critérios de Aprovação

Um teste será considerado aprovado quando:

* Executar sem erros críticos;
* Apresentar o comportamento esperado;
* Persistir corretamente os dados quando necessário;
* Exibir mensagens adequadas ao usuário.

---

# 5. Casos de Teste

## CT-01 – Acesso à Landing Page

### Objetivo

Validar carregamento da página inicial.

### Passos

1. Acessar o sistema.
2. Verificar exibição da página inicial.

### Resultado Esperado

* Logo exibida.
* Botões "Entrar" e "Cadastrar-se".
* Sessões informativas carregadas.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-02 – Cadastro com Dados Válidos

### Objetivo

Validar criação de conta.

### Passos

1. Acessar cadastro.
2. Informar:

   * Nome
   * E-mail
   * CPF válido
   * Telefone
   * Senha
3. Aceitar termos.
4. Confirmar cadastro.

### Resultado Esperado

Conta criada com sucesso.

### Evidência

Captura da tela de confirmação.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-03 – Cadastro com Campos Vazios

### Objetivo

Validar obrigatoriedade dos campos.

### Passos

1. Acessar cadastro.
2. Deixar campos obrigatórios vazios.
3. Tentar cadastrar.

### Resultado Esperado

Sistema impede envio e exibe mensagens de validação.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-04 – Cadastro com CPF Inválido

### Objetivo

Validar regra de CPF.

### Passos

1. Informar CPF inválido.
2. Confirmar cadastro.

### Resultado Esperado

Sistema rejeita cadastro.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-05 – Login com Credenciais Válidas

### Objetivo

Validar autenticação.

### Passos

1. Acessar login.
2. Informar credenciais válidas.
3. Confirmar acesso.

### Resultado Esperado

Usuário redirecionado ao dashboard.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-06 – Login com Senha Inválida

### Objetivo

Validar tratamento de erro.

### Passos

1. Informar senha incorreta.
2. Confirmar acesso.

### Resultado Esperado

Mensagem de erro exibida.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-07 – Persistência da Sessão

### Objetivo

Validar manutenção da autenticação.

### Passos

1. Efetuar login.
2. Atualizar página.

### Resultado Esperado

Usuário permanece autenticado.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-08 – Conclusão do Onboarding

### Objetivo

Validar atualização do perfil.

### Passos

1. Acessar onboarding.
2. Preencher informações.
3. Salvar.

### Resultado Esperado

Perfil atualizado no banco.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-09 – Carregamento do Dashboard

### Objetivo

Validar acesso ao painel principal.

### Passos

1. Efetuar login.
2. Acessar dashboard.

### Resultado Esperado

Dashboard exibido corretamente.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-10 – Visualização de Projetos

### Objetivo

Validar listagem de projetos.

### Passos

1. Abrir dashboard.
2. Verificar projetos ativos.

### Resultado Esperado

Projetos exibidos corretamente.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-11 – Criação de Novo Projeto

### Objetivo

Validar publicação de projetos.

### Passos

1. Selecionar "Novo Projeto".
2. Preencher:

   * Título
   * Descrição
   * Categoria
   * Habilidades
   * Orçamento
   * Prazo
3. Publicar.

### Resultado Esperado

Projeto registrado no banco.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-12 – Upload de Arquivos

### Objetivo

Validar envio de anexos.

### Passos

1. Selecionar arquivo.
2. Realizar upload.

### Resultado Esperado

Arquivo anexado com sucesso.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-13 – Validação de Limite de Arquivos

### Objetivo

Validar restrições de upload.

### Passos

1. Tentar enviar mais de 5 arquivos.
2. Tentar enviar arquivo acima do limite.

### Resultado Esperado

Sistema bloqueia operação.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-14 – Envio de Proposta

### Objetivo

Validar candidatura a projetos.

### Passos

1. Selecionar projeto.
2. Preencher proposta.
3. Enviar.

### Resultado Esperado

Proposta registrada.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-15 – Comunicação Cliente/Freelancer

### Objetivo

Validar troca de mensagens.

### Passos

1. Abrir chat.
2. Enviar mensagem.

### Resultado Esperado

Mensagem registrada e exibida.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-16 – Atualização do Timeline

### Objetivo

Validar acompanhamento do projeto.

### Passos

1. Alterar status do projeto.
2. Atualizar andamento.

### Resultado Esperado

Timeline atualizada.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-17 – Resumo Financeiro

### Objetivo

Validar cálculo financeiro.

### Passos

1. Acessar dashboard.
2. Consultar resumo financeiro.

### Resultado Esperado

Valores corretos apresentados.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

## CT-18 – Avaliação de Freelancer

### Objetivo

Validar sistema de avaliações.

### Passos

1. Finalizar projeto.
2. Avaliar freelancer.

### Resultado Esperado

Avaliação registrada.

### Status

☐ Não Executado
☐ Aprovado
☐ Reprovado

---

# 6. Testes de Integração

## TI-01 – Frontend → API

Validar comunicação entre formulários e endpoints.

## TI-02 – API → Banco

Validar persistência dos dados.

## TI-03 – Cadastro Completo

Cadastro → Banco → Login

## TI-04 – Publicação de Projeto

Frontend → Backend → SQLite

## TI-05 – Comunicação

Chat → API → Banco

---

# 7. Não Conformidades Encontradas na Auditoria

Durante a análise técnica preliminar foram identificados:

* API_URL apontando para localhost em produção;
* Inconsistências em chamadas GET/POST;
* Recuperação de senha incompleta;
* Onboarding parcialmente implementado;
* Persistência de sessão não finalizada;
* Dashboard com dados simulados em alguns componentes.

Esses itens devem ser corrigidos antes da homologação final do sistema.

---

# 8. Critério de Aceitação do MVP

O MVP será considerado aprovado quando o seguinte fluxo for executado sem falhas:

Landing Page
→ Cadastro
→ Login
→ Onboarding
→ Dashboard
→ Publicação de Projeto
→ Envio de Proposta
→ Comunicação
→ Acompanhamento do Projeto
→ Avaliação Final

Todos os dados devem ser persistidos corretamente no banco de dados e recuperados sem inconsistências.
