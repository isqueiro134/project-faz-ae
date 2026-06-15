# Fluxos do Sistema – Plataforma Faz Aê

# 1. Visão Geral

O Faz Aê é uma plataforma digital destinada à conexão entre clientes e freelancers, permitindo a publicação de projetos, busca por profissionais, gerenciamento de propostas, acompanhamento de execução e comunicação entre as partes.

A solução é composta por:

* Frontend Web (HTML, CSS e JavaScript)
* Backend Node.js + Express
* Banco de Dados SQLite
* Arquitetura baseada em APIs REST

---

# 2. Mapa Geral dos Fluxos

Visitante
↓
Landing Page
↓
Cadastro
↓
Login
↓
Onboarding
↓
Dashboard
↓
Publicação de Projeto
↓
Recebimento de Propostas
↓
Seleção de Freelancer
↓
Execução do Projeto
↓
Comunicação Cliente ↔ Freelancer
↓
Avaliação Final

---

# 3. Fluxo da Landing Page

## Objetivo

Apresentar a plataforma e direcionar usuários para cadastro ou login.

## Funcionalidades Identificadas

### Navegação Superior

* Logo Faz Aê
* Entrar
* Cadastrar-se

### Área Principal

Mensagem institucional:

"Conecte-se com os melhores freelancers"

### Chamadas para ação

* Sou Freelancer
* Preciso de um Freelancer

### Benefícios para Freelancers

* Perfil profissional completo
* Portfólio integrado
* Pagamentos seguros

### Benefícios para Clientes

* Busca por habilidades
* Avaliações e reviews
* Gestão de projetos

### Segurança da Plataforma

* Pagamentos protegidos
* Suporte especializado
* Contratos claros

## Resultado Esperado

Converter visitantes em usuários cadastrados.

---

# 4. Fluxo de Cadastro

## Objetivo

Criar novas contas na plataforma.

## Dados Solicitados

### Obrigatórios

* Nome Completo
* E-mail
* CPF
* Senha
* Confirmação de Senha

### Opcionais

* Telefone

### Consentimentos

* Aceite dos Termos de Serviço

## Validações

* CPF válido
* E-mail único
* Senhas coincidentes
* Campos obrigatórios preenchidos

## Fluxo

1. Usuário acessa cadastro.
2. Preenche informações.
3. Sistema valida os dados.
4. Conta é criada.
5. Usuário é redirecionado para login.

---

# 5. Fluxo de Login

## Objetivo

Autenticar usuários previamente cadastrados.

## Fluxo Principal

1. Usuário informa e-mail.
2. Usuário informa senha.
3. Sistema valida credenciais.
4. Sessão é iniciada.
5. Dashboard é carregado.

---

# 6. Fluxo de Onboarding

## Objetivo

Complementar dados do perfil após o primeiro acesso.

## Informações Esperadas

* Área de atuação
* Habilidades
* Experiências
* Informações profissionais
* Preferências de trabalho

## Resultado

Perfil pronto para utilização da plataforma.

---

# 7. Fluxo do Dashboard do Cliente

## Objetivo

Centralizar a gestão dos projetos contratados.

## Componentes Identificados

### Projetos Ativos

Cada projeto apresenta:

* Nome do projeto
* Freelancer responsável
* Avaliação do freelancer
* Status atual
* Progresso percentual
* Valor contratado
* Última atualização

### Status Identificados

* Em Andamento
* Em Revisão
* Concluído

### Timeline do Projeto

Eventos registrados:

* Projeto iniciado
* Primeira entrega
* Desenvolvimento frontend
* Testes e ajustes
* Entrega final

### Chat Integrado

Permite comunicação direta entre cliente e freelancer.

### Resumo Financeiro

Exibe:

* Projetos ativos
* Projetos concluídos
* Total investido

## Resultado Esperado

Permitir acompanhamento completo do andamento dos projetos.

---

# 8. Fluxo de Publicação de Projetos

## Objetivo

Permitir que clientes publiquem novas oportunidades.

## Etapa 1 – Informações do Projeto

Campos:

* Título do Projeto
* Descrição Detalhada
* Categoria

### Exemplo

Criação de Site Institucional

## Etapa 2 – Habilidades Necessárias

Cadastro de competências desejadas.

Exemplos:

* React
* WordPress
* SEO
* Photoshop
* Figma

## Etapa 3 – Orçamento e Prazo

### Tipo de Contratação

* Preço Fixo
* Valor por Hora

### Dados

* Orçamento total
* Prazo de entrega

## Etapa 4 – Anexos

Upload de:

* PDF
* DOC
* Imagens
* ZIP

Limites:

* Até 5 arquivos
* Máximo de 10MB cada

## Etapa 5 – Revisão

Resumo das informações antes da publicação.

## Resultado Esperado

Projeto publicado e disponível para freelancers.

---

# 9. Fluxo de Busca de Oportunidades

## Objetivo

Permitir que freelancers encontrem projetos disponíveis.

## Fluxo

1. Freelancer acessa listagem.
2. Sistema apresenta oportunidades.
3. Freelancer visualiza detalhes.
4. Freelancer envia proposta.

## Resultado

Proposta registrada para avaliação do cliente.

---

# 10. Fluxo de Propostas

## Objetivo

Gerenciar candidaturas aos projetos.

## Processo

1. Freelancer envia proposta.
2. Cliente recebe notificação.
3. Cliente analisa candidatos.
4. Cliente seleciona profissional.
5. Projeto é iniciado.

---

# 11. Fluxo de Comunicação

## Objetivo

Garantir comunicação durante a execução.

## Funcionalidades

* Envio de mensagens
* Recebimento de mensagens
* Histórico da conversa
* Atualizações do projeto

## Participantes

* Cliente
* Freelancer

## Resultado

Registro permanente da comunicação.

---

# 12. Fluxo de Acompanhamento de Projeto

## Objetivo

Controlar o ciclo de vida do projeto.

## Fases Identificadas

### Planejamento

Definição de escopo.

### Desenvolvimento

Execução do trabalho.

### Revisão

Correções solicitadas.

### Testes

Validação final.

### Entrega

Conclusão oficial.

## Indicadores

* Percentual de progresso
* Atualizações recentes
* Status do projeto

---

# 13. Fluxo Financeiro

## Objetivo

Controlar valores movimentados na plataforma.

## Informações Exibidas

* Valor contratado
* Total investido
* Projetos ativos
* Projetos concluídos

## Resultado

Maior transparência financeira para clientes.

---

# 14. Fluxo de Avaliação

## Objetivo

Registrar reputação dos usuários.

## Processo

1. Projeto concluído.
2. Cliente avalia freelancer.
3. Freelancer avalia cliente.
4. Avaliação é armazenada.

## Dados

* Nota
* Comentário
* Data

## Resultado

Construção de reputação na plataforma.

---

# 15. Entidades Principais do Sistema

## Users

Dados de autenticação.

## Profiles

Informações profissionais.

## Jobs

Projetos publicados.

## Proposals

Propostas enviadas.

## Reviews

Avaliações.

---

# 16. Fluxo Principal do MVP

Para demonstração da aplicação, o fluxo recomendado é:

Landing Page
→ Cadastro
→ Login
→ Dashboard
→ Publicação de Projeto
→ Recebimento de Propostas
→ Comunicação com Freelancer
→ Acompanhamento do Projeto
→ Avaliação Final

Esse fluxo representa o núcleo funcional da plataforma Faz Aê e contempla todas as funcionalidades atualmente identificadas no sistema.
