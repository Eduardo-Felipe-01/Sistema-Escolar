<div align="center">

# 📚 Educa+
### Sistema de Gestão Escolar — Web & Mobile

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Java](https://img.shields.io/badge/Java_Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

<br/>

[![Documentação Formal](https://img.shields.io/badge/📄_Documentação_Formal-Ver_Documento-0D1117?style=for-the-badge&logo=googledocs&logoColor=white)](./docs/Educa%2B_Documentacao_Formal.pdf)
[![Site da Equipe](https://img.shields.io/badge/🌐_Site_da_Equipe-Acessar-0D1117?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sites.google.com/view/educa--mais/p%C3%A1gina-inicial)

---

> **Educa+** é uma plataforma de gestão escolar fullstack (Web e Mobile) que centraliza os processos educacionais essenciais — lançamento de notas, controle de frequência e cronograma — eliminando fluxos manuais e fragmentados. Construída sobre uma arquitetura **Monólito Modular Poliglota**, o sistema integra **7 tecnologias distintas** em um único ecossistema coeso, com controle de acesso hierárquico (RBAC), automações acadêmicas e rastreabilidade completa de auditoria.

---

### 👥 Equipe de Desenvolvimento

| Membro | Papel |
|---|---|
| Alexsander Albino | Desenvolvedor |
| Eduardo Felipe | Desenvolvedor |
| Fernando Gabriel | Desenvolvedor |
| Humberto Alves | Desenvolvedor |
| Ítalo Henrique | Desenvolvedor |

</div>

---

## 📋 Índice

- [Visão Geral e Escopo](#-visão-geral-e-escopo)
- [Arquitetura Híbrida Modular e Tecnologias](#-Arquitetu-Híbrida-Modular-e-Tecnologias)
- [Controle de Acesso (RBAC)](#-controle-de-acesso-rbac)
- [Regras de Negócio e Automações](#-regras-de-negócio-e-automações)
- [Deploy / Execução](#-deploy--execução)
- [📎 Documentação & Links](#-documentação--links)

---


## 🎯 Visão Geral e Escopo

### O Problema

Instituições de ensino frequentemente operam com processos pedagógicos **manuais e fragmentados**: planilhas isoladas para notas, chamadas em papel e cronogramas descentralizados. Essa fragmentação gera retrabalho, inconsistência de dados e ausência de rastreabilidade das ações.

### A Solução

O **Educa+** resolve esse problema ao centralizar, em uma única plataforma Web e Mobile, os processos críticos do dia a dia escolar:

- 📝 **Lançamento de Notas** — Registro digital por disciplina e turma, com cálculo automático de média.
- 📅 **Controle de Frequência** — Chamada digital com apuração automática do percentual de presença.
- 🗓️ **Cronograma Escolar** — Gerenciamento centralizado de horários e calendário acadêmico.
- 👤 **Gestão de Usuários** — Criação, designação e remoção de perfis com controle hierárquico.
- 📊 **Relatórios e Histórico** — Consulta de desempenho individual por aluno, com isolamento por matrícula.
- 🔒 **Auditoria Completa** — Trilha de log imutável para rastrear toda mutação de estado no sistema.

---

### ✅ O que está no escopo (MVP)

| Funcionalidade | Perfis Beneficiados |
|---|---|
| Autenticação segura com JWT + criptografia de senha | Todos |
| Lançamento e retificação de notas | Professor, Coordenador |
| Controle de chamada por turma | Professor, Coordenador |
| Cálculo automático de médias e frequência | Sistema (automático) |
| Reprovação automática por falta | Sistema (automático) |
| Gerenciamento do cronograma escolar | Coordenador |
| Visualização de desempenho individual | Aluno |
| Visão global da escola | Coordenador |
| Auditoria de alterações (log imutável) | Sistema (automático) |
| Acessibilidade: Libras (VLibras) e alto contraste | Todos |

---

### 🚫 O que está fora do escopo (MVP)

> **Atenção:** Os itens abaixo foram **deliberadamente excluídos** do MVP para viabilizar a entrega dentro do prazo de aproximadamente 4 meses. Não representam limitações de design, mas decisões estratégicas de escopo.

- ❌ Funcionamento **offline** (requer conectividade ativa)
- ❌ **Chat interno** entre usuários
- ❌ **Módulo financeiro** e gestão de mensalidades
- ❌ **Biblioteca** virtual ou física
- ❌ **Notificações push**, e-mail ou SMS
- ❌ Integração com sistemas externos (Google Classroom, ERPs, etc.)
- ❌ **Geração de cronograma por IA**
- ❌ Suporte a **múltiplas filiais** (escopo: unidade única)

---

## 🏗️ Arquitetura Híbrida Modular e Tecnologias

O sistema adota o padrão **Arquitetura Híbrida Modular**: uma única aplicação com módulos internos bem delimitados, cada um usando a tecnologia mais adequada para sua responsabilidade. Essa decisão arquitetural foi feita para cumprir o requisito acadêmico de integrar **7 tecnologias distintas** sem incorrer na complexidade operacional de microsserviços.

```
┌─────────────────────────────────────────────────────────────────┐
│                          EDUCA+ SYSTEM                          │
│                                                                 │
│  ┌─────────────────────────── FRONTEND ──────────────────────┐  │
│  │                                                           │  │
│  │  TypeScript (Páginas Estáticas)  │  Angular (Dashboard)  │  │
│  │                                                           │  │
│  │              Kotlin (App Mobile Nativo)                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │ HTTPS / JWT                      │
│  ┌─────────────────────────── BACKEND ───────────────────────┐  │
│  │                                                           │  │
│  │   Python (Auth + Rotas Gerais)                            │  │
│  │   Java Spring Boot (Regras de Negócio + Motor de Cálculo) │  │
│  └───────────────────────────────────────────────────────────┘  │
│                    │                    │                        │
│  ┌─────────────────┴──┐          ┌─────┴──────────────────────┐ │
│  │    PostgreSQL       │          │          MySQL              │ │
│  │  (Banco Principal)  │          │   (Auditoria — Append-Only) │ │
│  └─────────────────────┘          └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

### 🖥️ Camada de Apresentação (Frontend)

| Tecnologia | Responsabilidade | Justificativa |
|---|---|---|
| **TypeScript** | Páginas estáticas (landing, login, informativas) | Tipagem forte e segurança em conteúdo público sem overhead de framework |
| **Angular** | Dashboard administrativo rico (Web) | Framework robusto para SPAs complexas com gerenciamento de estado e módulos |
| **Kotlin** | Aplicativo Mobile nativo | Performance nativa e responsividade para visualização em dispositivos móveis |

---

### ⚙️ Camada de Negócio (Backend)

| Tecnologia | Responsabilidade | Justificativa |
|---|---|---|
| **Python** | Autenticação, gerenciamento de sessão (JWT) e roteamento geral | Velocidade de desenvolvimento para APIs REST, ecossistema maduro de segurança |
| **Java + Spring Boot** | Motor de regras de negócio, cálculos automáticos (médias, frequência, reprovação) | JVM garante performance e confiabilidade para operações críticas e cálculos transacionais |

A comunicação entre as camadas é **Stateless via JWT**, eliminando a necessidade de gerenciamento de sessão no servidor.

---

### 🗄️ Camada de Persistência (Bancos de Dados)

| SGBD | Papel | Premissas |
|---|---|---|
| **PostgreSQL** | Banco principal — dados críticos (usuários, notas, frequências, turmas) | Conformidade **ACID** total; garante atomicidade e consistência em operações como retificação de nota |
| **MySQL** | Banco exclusivo de auditoria | **Append-Only** (imutável): nenhum registro é alterado ou deletado após inserção — apenas leitura e inserção |

> **Premissa ACID (PostgreSQL):** Toda operação que muta estado acadêmico (lançamento ou retificação de nota, alteração de status do aluno) é executada dentro de uma transação atômica. Em caso de falha, o estado anterior é restaurado automaticamente via `ROLLBACK`, preservando a integridade dos dados.

---

## 🔐 Controle de Acesso (RBAC)

O sistema implementa **Role-Based Access Control (RBAC)** com isolamento hierárquico estrito. Cada perfil opera com o conjunto mínimo de permissões necessário para sua função.

### Visão Geral das Permissões

| Operação | 👨‍🎓 Aluno | 👨‍🏫 Professor | 🧑‍💼 Coordenador |
|---|:---:|:---:|:---:|
| Visualizar próprias notas/frequência | ✅ | — | ✅ |
| Visualizar notas de toda a turma | ❌ | ✅ (suas turmas) | ✅ (escola toda) |
| Lançar notas / chamada | ❌ | ✅ (suas turmas) | ✅ |
| Retificar notas (override) | ❌ | ❌ | ✅ |
| Gerenciar cronograma escolar | ❌ | ❌ | ✅ |
| Criar / deletar usuários | ❌ | ❌ | ✅ |
| Designar perfis (Roles) | ❌ | ❌ | ✅ |
| Validar ações de professores | ❌ | ❌ | ✅ |
| Consultar trilha de auditoria | ❌ | ❌ | ✅ |

---

### 👨‍🎓 Perfil Aluno — Princípio do Menor Privilégio

O aluno opera em modo **Read-Only** estrito. O isolamento é garantido por **ID de Matrícula**:

- Consulta exclusiva de suas próprias notas, frequências, histórico e relatórios de desempenho.
- **É tecnicamente impossível** acessar dados de outro aluno, mesmo que a URL seja manipulada — o backend valida o ID de matrícula do token JWT contra o recurso solicitado.
- Nenhuma ação de escrita (POST, PUT, DELETE) é autorizada para este perfil.

---

### 👨‍🏫 Perfil Professor — Escopo por Turma

O professor possui permissão de escrita, porém **delimitada às turmas às quais está vinculado**:

- Lança notas e registra frequência apenas em suas disciplinas e turmas designadas.
- Qualquer mutação de estado (novo lançamento ou edição) é **propagada imediatamente** ao Coordenador via atualização no painel de supervisão.
- Não possui acesso a turmas de outros professores nem a configurações globais da escola.

---

### 🧑‍💼 Perfil Coordenador — Visão Global e Controle Total

O Coordenador possui o nível de acesso mais elevado da hierarquia:

- **Visão consolidada** de toda a escola: todas as turmas, todos os alunos, todos os professores.
- Capacidade de **override de notas** (retificação com registro automático de auditoria).
- Gestão completa do ciclo de vida de usuários: criação, edição, desativação e designação de perfis.
- Gerenciamento centralizado do **cronograma e calendário escolar**.
- Acesso à **trilha de auditoria completa** para rastrear qualquer ação realizada no sistema.

---

### 🔑 Autenticação e Segurança

- **JWT (JSON Web Token):** Comunicação completamente Stateless. O token carrega o `role` e o `id` do usuário, validados em cada requisição pelo backend.
- **Criptografia de Senhas:** Bcrypt ou Argon2id — algoritmos de hash adaptativos com salt, resistentes a ataques de força bruta e rainbow table.
- **HTTPS:** Toda comunicação entre cliente e servidor é obrigatoriamente cifrada.

---

## ⚙️ Regras de Negócio e Automações

### 🧮 Motor Acadêmico Automático

O motor de cálculo, implementado em **Java Spring Boot**, é disparado automaticamente após qualquer evento de lançamento ou atualização de nota/frequência:

```
EVENTO: Professor lança nota ou registra presença
   │
   ▼
[Motor Acadêmico — Java Spring Boot]
   │
   ├─► Recalcula a MÉDIA das notas do aluno na disciplina
   │
   ├─► Recalcula o PERCENTUAL DE FREQUÊNCIA acumulado
   │
   └─► Avalia condição de aprovação:
          │
          ├─ Frequência < mínimo exigido?
          │      └─► Status → "REPROVADO_FALTA" (automático)
          │
          └─ Frequência ≥ mínimo? → Continua avaliação de média
```

- Não há cálculo manual ou dependência de ação humana para apurar médias.
- A reprovação por falta é **irrevogável pelo sistema automático** — apenas o Coordenador pode retificar via override, com registro compulsório em auditoria.

---

### 📋 Trilha de Auditoria Imutável

O banco de dados **MySQL** é dedicado exclusivamente ao registro de auditoria e opera em modo **Append-Only**:

| Campo | Descrição |
|---|---|
| `timestamp` | Data e hora exata da operação (UTC) |
| `executor_id` | ID do usuário que realizou a ação |
| `executor_role` | Perfil do executor no momento da ação |
| `entidade` | Tabela/entidade afetada (ex: `notas`, `frequencias`) |
| `campo_alterado` | Nome do atributo modificado |
| `valor_anterior` | Dado original antes da mutação |
| `valor_novo` | Dado após a mutação |
| `operacao` | Tipo de operação: `INSERT`, `UPDATE`, `STATUS_CHANGE` |

> **Imutabilidade garantida:** Nenhuma aplicação possui permissão de `UPDATE` ou `DELETE` neste banco. Toda tentativa de adulteração gera erro de permissão no nível do SGBD, garantindo a integridade forense da trilha.

---

### ♿ Acessibilidade e Conformidade (LGPD)

- **Libras:** Integração com **VLibras** (ou solução equivalente) para tradução automática de conteúdo em Língua Brasileira de Sinais.
- **Alto Contraste e Daltonismo:** Paletas visuais otimizadas para os três tipos principais:
  - 🔴 **Protanopia** (deficiência na percepção de vermelho)
  - 🟢 **Deuteranopia** (deficiência na percepção de verde)
  - 🔵 **Tritanopia** (deficiência na percepção de azul)
- **LGPD:** Dados pessoais de alunos são isolados por ID de matrícula e nunca expostos entre perfis. Nenhum dado sensível é retornado em payloads além do estritamente necessário para a operação.

---

## 🚀 Deploy / Execução

> **⚠️ Configurações de deploy em breve.**  
> O processo de configuração de ambiente, variáveis de ambiente, orquestração de containers e pipeline de CI/CD está atualmente em definição pela equipe. Esta seção será atualizada assim que as decisões de infraestrutura forem finalizadas.

### Pré-requisitos esperados *(sujeitos a confirmação)*

- [ ] Docker & Docker Compose
- [ ] Node.js (para build do frontend Angular/TypeScript)
- [ ] JDK 17+ (para compilação do backend Java/Spring Boot)
- [ ] Python 3.11+ (para o serviço de autenticação)
- [ ] Android Studio / SDK (para build do app Kotlin)
- [ ] PostgreSQL 15+
- [ ] MySQL 8+

### Instruções de execução

```bash
# ⏳ Em breve — Aguarde a documentação de setup completa.
# As instruções de clone, configuração de variáveis de ambiente (.env),
# build e execução serão disponibilizadas aqui.
```

---

## 📎 Documentação & Links

### Recursos do Projeto

| Recurso | Descrição | Link |
|---|---|---|
| 📄 **Documentação Formal** | Documento técnico completo com requisitos, modelagem e decisões de arquitetura | [Ver documento](./docs/latex_Educa+.pdf) |
| 🌐 **Site da Equipe** | Página oficial da equipe de desenvolvimento | [Acessar site](https://sites.google.com/view/educa--mais/p%C3%A1gina-inicial) |

---

### 📁 Onde o documento está hospedado no repositório

O documento formal está versionado **dentro do próprio repositório**, na pasta `/docs`:

```
educa-plus/
├── docs/
│   └── Educa+_Documentacao_Formal.pdf   ← documento aqui
├── frontend/
├── backend/
└── README.md
```

> **Por que dentro do repositório e não em um link externo (Google Drive, etc.)?**  
> Hospedar o PDF no próprio repositório garante que o documento e o código estejam **sempre sincronizados na mesma versão**. Qualquer atualização no documento é rastreada pelo Git (commit + data), e o link no README nunca quebra por problemas de permissão ou expiração de URL externa.

---

## 📄 Licença

Este projeto foi desenvolvido para fins **acadêmicos**. Informações sobre licenciamento serão definidas pela equipe.


---

<div align="center">

Feito com 💙 pela equipe **Educa+**  
*Alexander · Eduardo · Fernando · Humberto · Ítalo*

</div>
