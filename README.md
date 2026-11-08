# 🎓 Educa+ - Sistema Integrado de Gestão Escolar

> Plataforma completa de gestão acadêmica e pedagógica com controle de acesso multi-perfil (**Professor**, **Coordenador** e **Aluno**), cálculos automáticos de rendimento e assiduidade, auditoria em banco secundário, inteligência de dados e acessibilidade universal (VLibras e Daltonismo).

---

## 🏛️ Arquitetura:



```
┌──────────────────────────────────────────────────────────┐
│                 Frontend Web: Angular 19                 │
│         (TypeScript, Vanilla CSS Glassmorphism,          │
│          VLibras Oficial e Seletor de Daltonismo)        │
│                 Porta: http://localhost:4200             │
└──────────────┬────────────────────────────┬──────────────┘
               │                            │
      REST / Bearer JWT             Estatísticas & Risco
               ▼                            ▼
┌───────────────────────────────┐ ┌────────────────────────┐
│     Backend Central: Java     │ │  Microserviço Python   │
│         Spring Boot 3         │ │    FastAPI + Pandas    │
│   (Regras de Médias, Faltas,  │ │ (Estatística e Risco)  │
│      Controle de Acesso)      │ │   Porta: 8000 (HTTP)   │
│      Porta: 8080 (HTTP)       │ └────────────────────────┘
└───────┬───────────────┬───────┘
        │               │
  JPA / JDBC    Spring Data Mongo
        ▼               ▼
┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │   MongoDB    │
│  (Porta 5433)│ │ (Porta 27017)│
│ Banco Princ. │ │ Banco Secund.│
│  (Usuários,  │ │  (Auditoria, │
│ Turmas, etc.)│ │  Relatórios) │
└──────────────┘ └──────────────┘
```

### Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | Angular 19 + TypeScript | Interface web responsiva, Glassmorphism, Dark Mode e acessibilidade |
| **Backend Central** | Java 17 + Spring Boot 3 | Regras de negócio, Spring Security JWT, cálculo de médias e assiduidade |
| **Data Analytics** | Python 3 + FastAPI + Pandas | Processamento estatístico de turmas, desvio padrão e predição de risco |
| **Banco Principal** | PostgreSQL 15 | Entidades de negócio (usuários, turmas, disciplinas, notas, presenças) |
| **Banco Secundário** | MongoDB 7.0 | Histórico de auditoria de alterações e registro de relatórios (NoSQL) |
| **Orquestração** | Docker & Docker Compose | Inicialização rápida e padronizada de todo o ecossistema |

---

## 👥 Perfis de Usuários e Funcionalidades

### 👨‍🏫 1. Painel do Professor (Foco Principal)
- **Visão Geral / Dashboard:** Resumo das turmas e disciplinas atribuídas, total de estudantes sob responsabilidade, média global e taxa de presença.
- **Lançamento de Notas em Tempo Real:**
  - Grade dinâmica de avaliações: **N1 (peso 4)**, **N2 (peso 4)**, **Trabalho (peso 2)** e **Recuperação**.
  - **Cálculo Automático Instantâneo:** Recálculo em tempo real da média ponderada `(N1×0.4) + (N2×0.4) + (Trab×0.2)`.
  - Se a média for inferior a 6.0 e o aluno realizar prova de recuperação, a nota de recuperação substitui proporcionalmente a menor avaliação.
  - Atualização imediata do status (`APROVADO`, `RECUPERAÇÃO`, `REPROVADO`).
  - Salvamento com **registro de auditoria** automático gravado no MongoDB secundário.
- **Diário de Frequência & Chamada Escolar:**
  - Registro de presença aula a aula por data selecionada.
  - Botões de status rápido: `[P]` (Presente), `[F]` (Falta), `[FJ]` (Falta Justificada).
  - Botão **"Todos Presentes"** para agilizar a rotina docente.
  - **Reprovação Automática por Falta (< 75%):** Quando a taxa de assiduidade do estudante fica abaixo do mínimo exigido pela LDB (75%), o sistema sinaliza com alerta `⚠️ REPROVADO POR FALTA` e atualiza a situação da matrícula.
- **Emissão de Relatórios com Python Analytics:**
  - Boletim consolidado de desempenho da turma com layout otimizado para impressão / PDF (`window.print()`).
  - Painel de insights do microserviço Python: média, mediana, desvio padrão, distribuição e recomendações pedagógicas automatizadas.

### 👔 2. Painel da Coordenação
- Acompanhamento global de todos os dados e turmas da escola.
- Validação e homologação das ações e relatórios emitidos pelos professores.
- Possibilidade de alterar notas e faltas com registro obrigatório de auditoria.
- Criação e gestão do cronograma escolar e calendário de eventos.
- Gestão de usuários (criação, exclusão e atribuição de perfis: Aluno, Professor ou Coordenador).
- Painel de auditoria global consultando o banco secundário MongoDB.

### 🎓 3. Portal do Aluno
- Visualização das alterações feitas sobre seus próprios dados.
- Visualização do boletim com notas e médias por disciplina e bimestre.
- Histórico transparente de auditoria de alterações ocorridas em suas notas e frequência.
- Acompanhamento de emissão de relatórios escolares referentes à sua matrícula.

---

## ♿ Acessibilidade Universal

O sistema incorpora soluções completas de acessibilidade nativa:

1. **Libras (Língua Brasileira de Sinais):** Integração com o widget oficial do **VLibras** no canto inferior direito da tela para tradução de conteúdos.
2. **Suporte a Daltonismo:** Barra de acessibilidade superior com filtros SVG calibrados:
   - `Normal` (padrão do sistema)
   - `Protanopia` (dificuldade de percepção para tons de vermelho)
   - `Deuteranopia` (dificuldade para tons de verde)
   - `Tritanopia` (dificuldade para tons de azul)
   - `Acromatopsia` (visão monocromática / escala de cinza)
   - `Alto Contraste` (realce de bordas, contraste e luminosidade)
3. **Redimensionamento de Fonte:** Botões `A-` e `A+` para ajustar a escala tipográfica.
4. **Tema Claro / Escuro:** Alternância rápida entre Dark Glassmorphism e Light Theme.

---

## 🔑 Credenciais Pré-configuradas para Testes

O sistema possui uma rotina de carga inicial (`DataInitializationService`) que pré-popula usuários, turmas e notas de exemplo:

| Perfil | Nome | E-mail | Senha |
| :--- | :--- | :--- | :--- |
| **Professor** | Prof. Carlos Alberto Mendes | `prof.carlos@escola.com` | `senha123` |
| **Professor** | Profa. Fernanda Rocha | `prof.fernanda@escola.com` | `senha123` |
| **Coordenador** | Ana Paula Silva | `coord.ana@escola.com` | `senha123` |
| **Aluno** | Lucas Gabriel Oliveira | `aluno.lucas@escola.com` | `senha123` |
| **Aluno** | Beatriz Helena Santos | `aluno.beatriz@escola.com` | `senha123` |
| **Aluno** | Rodrigo Matos Ribeiro | `aluno.rodrigo@escola.com` | `senha123` |

> 💡 **Dica:** Na tela de login há botões de **Acesso Rápido** para preencher instantaneamente os dados de Professor, Coordenador ou Aluno com um clique!

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados e em execução.

### Subindo todo o ecossistema com Docker Compose

Na raiz do projeto, execute:

```bash
docker compose up -d
```

Esse comando inicializa automaticamente os 5 containers:
- `escola-postgres`: PostgreSQL na porta `5433` (mapeada para `5432`)
- `escola-mongodb`: MongoDB na porta `27017`
- `escola-python-analytics`: FastAPI na porta `8000`
- `escola-backend-spring`: Spring Boot na porta `8080`
- `escola-frontend-angular`: Angular + Nginx na porta `4200`

### Acessos no Navegador

- **Aplicação Web (Frontend):** [http://localhost:4200](http://localhost:4200)
- **API Backend Principal (Spring Boot):** [http://localhost:8080](http://localhost:8080)
- **Microserviço Analytics (Python FastAPI):** [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger interativo)

---

## 🧪 Verificação e Testes Integrados

### Teste de Unidade das Regras de Negócio (Java)
```bash
cd backend-spring
./mvnw test
```

### Testando a API via cURL

#### 1. Autenticação (Login do Professor)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prof.carlos@escola.com","senha":"senha123"}'
```

#### 2. Consultar Turmas Atribuídas ao Professor
```bash
curl -H "Authorization: Bearer <SEU_TOKEN>" \
  http://localhost:8080/api/professor/turmas
```

#### 3. Lançamento de Notas com Recálculo de Média
```bash
curl -X POST http://localhost:8080/api/professor/notas \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "matriculaId": 1,
    "disciplinaId": 1,
    "bimestre": 1,
    "nota1": 9.5,
    "nota2": 9.0,
    "trabalho": 10.0,
    "recuperacao": null,
    "observacoes": "Lançamento confirmado"
  }'
```

#### 4. Consultar Auditoria no Banco Secundário (MongoDB)
```bash
docker exec -it escola-mongodb mongosh escola_secundaria \
  --eval "db.audit_logs.find().sort({dataHora: -1}).limit(5)"
```

---

## 📂 Estrutura de Diretórios

```
Sistema-Escolar/
├── docker-compose.yml              # Orquestração geral dos containers
├── README.md                       # Documentação do projeto
├── backend-spring/                 # Backend Java + Spring Boot
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/br/com/escola/
│       ├── config/                 # Configuração Postgres (JPA), MongoDB e Spring Security JWT
│       ├── controller/             # REST Endpoints (Auth, Professor, Aluno, Coordenador)
│       ├── domain/                 # Entidades PostgreSQL (User, Turma, Nota, Frequencia)
│       ├── domain/secondary/       # Documentos MongoDB (AuditLog, ReportHistory)
│       ├── dto/                    # DTOs de requisição e resposta
│       ├── repository/             # Repositórios Spring Data (Postgres JPA & MongoDB)
│       ├── security/               # Filtros JWT e UserDetailsService
│       └── service/                # Business Rules (CalculoMediaService, FrequenciaService, AuditService)
├── python-analytics/               # Microserviço Python de Análise de Dados
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                     # API FastAPI
│   └── services/analytics.py       # Algoritmos Pandas para estatísticas e predição de risco
└── frontend-angular/               # Aplicação Web Angular 19 + TypeScript
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── index.html              # Integração do VLibras e filtros SVG de Daltonismo
        ├── styles.css              # Design System em Vanilla CSS (Glassmorphism & A11y)
        └── app/
            ├── core/               # Guards, interceptors e serviços centrais
            └── modules/
                ├── auth/           # Tela de login e seleção de perfil
                ├── professor/      # PAINEL DO PROFESSOR (Dashboard, Notas, Frequência, Relatórios)
                ├── coordenador/    # Painel da Coordenação
                └── aluno/          # Portal do Aluno
```

---

##
