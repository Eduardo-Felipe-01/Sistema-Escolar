# Estimativa de Custo — Educa+ (Sistema de Gestão Escolar Web e Mobile)

---

## 1. Resumo executivo

| Indicador | Valor |
|---|---|
| **Custo total (cenário realista)** | **R$ 328.028,94** |
| Prazo | 5 meses (4 meses de esforço + 1 mês de contingência) |
| Custo mensal médio | R$ 65.605,79 |
| Esforço base (PERT) | 2.432 h → **3.040 h** com 25% de contingência |
| Mão de obra / total | R$ 307.960,83 (**93,9%**) |
| Faixa dos cenários | R$ 294.896,25 (otimista) a R$ 426.589,38 (pessimista) |
| Preço de venda sugerido (se fosse contratado de uma software house) | R$ 499.511,11 |
| Manutenção pós-lançamento | R$ 65.605,79/ano (≈ R$ 5.467,15/mês) |

**Principais riscos de custo:** integração entre os dois back-ends (Python ↔ Java), consistência entre PostgreSQL e MySQL, curva de aprendizado (Kotlin e Spring), retrabalho em RBAC/isolamento de dados e gargalo no Especialista, que é o único que domina Java/arquitetura.

---

## 2. Premissas e perguntas em aberto

### 2.1 Premissas adotadas

| # | PREMISSA | Valor adotado | Motivo |
|---|---|---|---|
| P1 | Moeda / referência | BRL, valores de 2026 | Solicitado |
| P2 | Prazo | 5 meses (1 semestre) | Contexto acadêmico Av1/Av2 |
| P3 | Fase | Versão completa do escopo descrito, **projeto inteiro** (inclui requisitos já concluídos, R$ 5.986,64) | Custo total do produto |
| P4 | Regime | 4 CLT + 1 estagiário (Lei 11.788/2008) | Cenário mais conservador (com encargos) |
| P5 | Salários brutos mensais | Especialista R$ 15.000 · Sênior R$ 10.000 · Pleno R$ 5.000 · Júnior R$ 3.000 · Estagiário R$ 700 (ajuda de custo/bolsa) | **Valores Médios de Mercado** |
| P5a | Estágio | Os R$ 700 foram tratados como bolsa. Somei os itens obrigatórios por lei: auxílio-transporte R$ 220, seguro R$ 30 e recesso proporcional | Lei 11.788/2008, arts. 9º, 12 e 13 |
| P6 | Dedicação | 100% (estágio: 30 h/semana) | Prazo curto |
| P7 | Horas disponíveis/mês | 160 h CLT (20 dias úteis × 8 h, já sem feriados); 120 h estágio | Média anual de dias úteis |
| P8 | Fator de produtividade | **80%** → 128 h/mês CLT; 96 h/mês estágio | Desconta pausas, troca de contexto e ociosidade. Reuniões formais já estão na EAP (item 1.3) |
| P9 | Trabalho | Remoto (sem aluguel), com auxílio home office de R$ 150 | Menor custo indireto |
| P10 | Tributação da empresa | Lucro Presumido | Mostra os encargos de forma explícita |
| P11 | Nuvem | AWS, região São Paulo; câmbio **US$ 1 = R$ 5,50** | Latência e dados no Brasil (LGPD) |
| P12 | Contingência | **25%** | 7 tecnologias, arquitetura poliglota, equipe aprendendo tecnologias novas |
| P13 | Equipamentos | Notebooks da empresa (R$ 7.000, vida útil de 36 meses, cobrados como depreciação) + 1 Android de testes | Custo real de equipar a equipe |
| P14 | Fora do escopo = custo zero | Sem e-mail/SMS/push, sem gateway de pagamento, sem taxas de loja de apps, sem multi-tenant | Regra do prompt |

### 2.2 Perguntas em aberto
1. A equipe será **CLT, PJ ou voluntária/acadêmica**? Em PJ o custo cai cerca de R$ 88 mil (ver seção 9).
2. Quais das 7 tecnologias a equipe **já domina**? Isso altera o item 4.1 (156 h).
3. Haverá **pentest profissional**? Não foi incluído; custaria entre R$ 8 mil e R$ 20 mil a mais.
4. Os notebooks já existem (custo zero) ou precisam ser comprados?
5. Os benefícios (VR R$ 900 + saúde R$ 450 + home office R$ 150) estão corretos?

---

## 3. Custo da equipe

### 3.1 Encargos CLT (Lucro Presumido)

| Componente | % sobre salário |
|---|---|
| INSS patronal | 20,00% |
| RAT/SAT (CNAE 6201-5) | 2,00% |
| Terceiros (Sistema S, salário-educação, INCRA) | 5,80% |
| FGTS | 8,00% |
| **Subtotal encargos sobre folha** | **35,80%** |
| 13º salário (1/12) | 8,33% |
| Férias + 1/3 (1/12 × 4/3) | 11,11% |
| Encargos sobre 13º e férias (19,44% × 35,80%) | 6,96% |
| Provisão de multa rescisória do FGTS (8% × 40%) | 3,20% |
| **Fator total de encargos e provisões** | **65,41%** |

Benefícios fixos por CLT/mês: VR/VA R$ 900 + plano de saúde R$ 450 + auxílio home office R$ 150 = **R$ 1.500**.
Estágio: ajuda de custo R$ 700 + auxílio-transporte R$ 220 + seguro R$ 30 + recesso proporcional R$ 58,33 = **R$ 1.008,33** (sem encargos trabalhistas).

### 3.2 Tabela de custo por perfil

| Perfil | Papel no projeto | Salário/bolsa | Custo mensal total | h produtivas/mês | **Custo/hora** | Horas base | Horas c/ 25% | **Custo no projeto** |
|---|---|---|---|---|---|---|---|---|
| Especialista | Arquitetura, Java/Spring, integração, code review, gestão | R$ 15.000,00 | R$ 26.310,83 | 128 | **R$ 205,55** | 512 | 640 | R$ 131.554,17 |
| Sênior | Python (auth/RBAC), PostgreSQL/MySQL, DevOps | R$ 10.000,00 | R$ 18.040,56 | 128 | **R$ 140,94** | 512 | 640 | R$ 90.202,78 |
| Pleno | Angular/TypeScript, UI/UX | R$ 5.000,00 | R$ 9.770,28 | 128 | **R$ 76,33** | 512 | 640 | R$ 48.851,39 |
| Júnior | App Kotlin | R$ 3.000,00 | R$ 6.462,17 | 128 | **R$ 50,49** | 512 | 640 | R$ 32.310,83 |
| Estagiário | Testes, LaTeX, apoio em UI | R$ 700,00 | R$ 1.008,33 | 96 | **R$ 10,50** | 384 | 480 | R$ 5.041,67 |
| **Total** | | **R$ 33.700,00** | **R$ 61.592,17/mês** | **608** | | **2.432** | **3.040** | **R$ 307.960,83** |


---

## 4. Esforço por tarefa e por perfil (EAP + PERT)

Método: **PERT**, com E = (O + 4M + P) / 6. Custo base = Σ (horas do perfil × custo/hora).

| Cód. | Tarefa | O | M | P | **E** | Esp | Sên | Ple | Jún | Est | Custo base |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Levantamento de requisitos (**concluído**) | 56 | 56 | 56 | 56 | 20 | 6 | 6 | 8 | 16 | R$ 5.986,64 |
| 1.2 | Definição formal de escopo | 30 | 38 | 58 | 40 | 16 | 4 | 4 | 4 | 12 | R$ 4.485,93 |
| 1.3 | Gestão do projeto e cerimônias ágeis | 130 | 164 | 246 | 172 | 60 | 30 | 30 | 32 | 20 | R$ 20.676,98 |
| 2.1 | Wireframes | 42 | 53 | 82 | 56 | 4 | 0 | 32 | 8 | 12 | R$ 3.794,71 |
| 2.2 | Mockups + guia de estilos | 51 | 65 | 97 | 68 | 4 | 0 | 40 | 8 | 16 | R$ 4.447,37 |
| 2.3 | Protótipo de alta fidelidade | 45 | 57 | 87 | 60 | 4 | 0 | 32 | 8 | 16 | R$ 3.836,72 |
| 3.1 | Arquitetura (C4, contratos de API, 2 SGBDs) | 68 | 86 | 128 | 90 | 50 | 24 | 8 | 8 | 0 | R$ 14.674,80 |
| 3.2 | Repositório Git, branching, proteção | 12 | 15 | 24 | 16 | 4 | 8 | 0 | 0 | 4 | R$ 1.991,76 |
| 3.3 | Docker, CI/CD, 3 ambientes | 42 | 53 | 82 | 56 | 8 | 40 | 4 | 4 | 0 | R$ 7.789,36 |
| 4.1 | Curva de aprendizado (7 tecnologias) | 117 | 148 | 227 | 156 | 24 | 24 | 28 | 48 | 32 | R$ 13.212,56 |
| 5.1 | PostgreSQL: modelagem, migrations | 36 | 46 | 68 | 48 | 8 | 40 | 0 | 0 | 0 | R$ 7.282,10 |
| 5.2 | MySQL: auditoria em JSON | 24 | 30 | 48 | 32 | 4 | 28 | 0 | 0 | 0 | R$ 4.768,59 |
| 5.3 | Autenticação/Usuários (Python, JWT, RBAC) | 66 | 84 | 126 | 88 | 8 | 80 | 0 | 0 | 0 | R$ 12.919,77 |
| 5.4 | Acadêmico (Spring: médias, frequência, reprovação) | 81 | 103 | 155 | 108 | 100 | 8 | 0 | 0 | 0 | R$ 21.682,87 |
| 5.5 | Cronograma (API) | 33 | 42 | 63 | 44 | 8 | 36 | 0 | 0 | 0 | R$ 6.718,33 |
| 5.6 | Auditoria e Relatórios (API) | 42 | 53 | 82 | 56 | 16 | 40 | 0 | 0 | 0 | R$ 8.926,53 |
| 5.7 | Integração Python ↔ Java | 47 | 59 | 89 | 62 | 38 | 24 | 0 | 0 | 0 | R$ 11.193,63 |
| 6.1 | Portal base TypeScript | 36 | 46 | 68 | 48 | 0 | 0 | 40 | 0 | 8 | R$ 3.137,24 |
| 6.2 | Dashboard Angular – Professor | 75 | 95 | 145 | 100 | 0 | 0 | 88 | 0 | 12 | R$ 6.843,11 |
| 6.3 | Dashboard Angular – Coordenador | 81 | 103 | 155 | 108 | 0 | 0 | 96 | 0 | 12 | R$ 7.453,75 |
| 7.1 | App: estrutura, autenticação, API segura | 74 | 93 | 142 | 98 | 0 | 8 | 0 | 90 | 0 | R$ 5.671,25 |
| 7.2 | App: telas do Aluno | 68 | 86 | 128 | 90 | 0 | 0 | 0 | 90 | 0 | R$ 4.543,71 |
| 7.3 | App: telas do Professor | 68 | 86 | 128 | 90 | 0 | 0 | 0 | 90 | 0 | R$ 4.543,71 |
| 8.1 | Libras (VLibras web + mobile) | 36 | 46 | 68 | 48 | 0 | 0 | 16 | 24 | 8 | R$ 2.516,97 |
| 8.2 | Daltonismo (paletas, contraste, testes) | 30 | 38 | 58 | 40 | 0 | 0 | 16 | 12 | 12 | R$ 1.953,15 |
| 9.1 | Testes unitários | 75 | 95 | 145 | 100 | 20 | 24 | 16 | 20 | 20 | R$ 9.934,74 |
| 9.2 | Testes de integração/segurança (isolamento, RBAC) | 75 | 95 | 145 | 100 | 16 | 24 | 4 | 4 | 52 | R$ 7.724,90 |
| 9.3 | Code review | 57 | 72 | 111 | 76 | 44 | 20 | 8 | 4 | 0 | R$ 12.675,77 |
| 9.4 | Homologação e UAT | 57 | 72 | 111 | 76 | 12 | 8 | 8 | 8 | 40 | R$ 5.028,84 |
| 9.5 | Correção de bugs e retrabalho | 89 | 112 | 171 | 118 | 20 | 24 | 24 | 30 | 20 | R$ 11.050,24 |
| 10.1 | Relatório técnico em LaTeX (ABNT) | 75 | 95 | 145 | 100 | 16 | 8 | 8 | 8 | 60 | R$ 6.061,12 |
| 10.2 | Apresentação da ferramenta | 24 | 30 | 48 | 32 | 8 | 4 | 4 | 4 | 12 | R$ 2.841,50 |
| | **Total base** | **1.842** | **2.316** | **3.486** | **2.432** | 512 | 512 | 512 | 512 | 384 | **R$ 246.368,67** |
| | **Contingência 25%** | | | | 608 | 128 | 128 | 128 | 128 | 96 | R$ 61.592,16 |
| | **Total com contingência** | | | | **3.040** | 640 | 640 | 640 | 640 | 480 | **R$ 307.960,83** |

### 4.1 Resumo por fase

| Fase | Horas (E) | % horas | Custo base | Custo c/ 25% |
|---|---|---|---|---|
| Qualidade (testes, review, UAT, bugs) | 470 | 19,3% | R$ 46.414,49 | R$ 58.018,12 |
| Back-end (2 linguagens + 2 SGBDs) | 438 | 18,0% | R$ 73.491,83 | R$ 91.864,78 |
| Mobile Kotlin | 278 | 11,4% | R$ 14.758,67 | R$ 18.448,33 |
| Gestão e requisitos | 268 | 11,0% | R$ 31.149,55 | R$ 38.936,93 |
| Front-end web | 256 | 10,5% | R$ 17.434,10 | R$ 21.792,62 |
| Design UX/UI | 184 | 7,6% | R$ 12.078,80 | R$ 15.098,50 |
| Arquitetura/DevOps | 162 | 6,7% | R$ 24.455,93 | R$ 30.569,91 |
| Capacitação | 156 | 6,4% | R$ 13.212,56 | R$ 16.515,70 |
| Documentação (LaTeX e apresentação) | 132 | 5,4% | R$ 8.902,62 | R$ 11.128,28 |
| Acessibilidade | 88 | 3,6% | R$ 4.470,12 | R$ 5.587,65 |
| **Total** | **2.432** | 100% | **R$ 246.368,67** | **R$ 307.960,83** |

---

## 5. Infraestrutura e ferramentas (sem alteração)

### 5.1 Infraestrutura AWS (sa-east-1, US$ 1 = R$ 5,50)

| Ambiente | Recurso | R$/mês | Meses ativos | Total |
|---|---|---|---|---|
| Dev | Docker local nas máquinas da equipe | 0,00 | 1–5 | 0,00 |
| Homologação | EC2 t3.small (Python + Java + bancos em containers) R$ 135 + EBS R$ 25 + IPv4 R$ 20 | **180,00** | 2–5 (4) | 720,00 |
| Produção | EC2 t3.medium + EBS (R$ 295), RDS PostgreSQL (R$ 127), RDS MySQL (R$ 127), S3 + CloudFront (R$ 17), snapshots/tráfego/CloudWatch/IPv4 (R$ 91) | **657,00** | 4–5 (2) | 1.314,00 |
| | SSL Let's Encrypt + Nginx como proxy | 0,00 | | 0,00 |
| | **Total de infraestrutura** | | | **R$ 2.034,00** |

### 5.2 Ferramentas e licenças

| Item | R$/mês | Meses | Total |
|---|---|---|---|
| GitHub Team (5 × US$ 4; proteção de branch em repositório privado) | 110,00 | 5 | 550,00 |
| IntelliJ IDEA Ultimate (1 licença) | 275,00 | 5 | 1.375,00 |
| Figma Professional (2 editores) | 220,00 | 3 | 660,00 |
| Overleaf Standard | 116,00 | 3 | 348,00 |
| Jira Free, GitHub Actions, Sentry, VS Code, Android Studio, VLibras, OWASP ZAP | 0,00 | — | 0,00 |
| **Total de ferramentas** | | | **R$ 2.933,00** |

### 5.3 Custos únicos e indiretos

| Item | Tipo | Valor |
|---|---|---|
| Domínio .com.br | Único (mês 1) | R$ 40,00 |
| Celular Android para testes | Único (mês 1) | R$ 1.200,00 |
| Cursos e treinamentos (R$ 200/pessoa) | Único (mês 1) | R$ 1.000,00 |
| Consultoria LGPD (dados de menores, art. 14) | Único (mês 4) | R$ 3.000,00 |
| Depreciação de notebooks (5 × R$ 7.000 / 36) | Mensal | R$ 972,22 |
| Contabilidade, folha e administrativo | Mensal | R$ 1.000,00 |
| Aluguel, energia, internet / marketing, vendas, suporte | — | Não incluídos |

---

## 6. Fluxo de caixa mensal (realista)

| Mês | Mão de obra | Depreciação | Infra | Ferramentas | Contab./adm. | Únicos | **Total do mês** | **Acumulado** |
|---|---|---|---|---|---|---|---|---|
| 1 | 61.592,17 | 972,22 | 0,00 | 605,00 | 1.000,00 | 2.240,00 | **66.409,39** | 66.409,39 |
| 2 | 61.592,17 | 972,22 | 180,00 | 605,00 | 1.000,00 | 0,00 | **64.349,39** | 130.758,78 |
| 3 | 61.592,17 | 972,22 | 180,00 | 721,00 | 1.000,00 | 0,00 | **64.465,39** | 195.224,17 |
| 4 | 61.592,17 | 972,22 | 837,00 | 501,00 | 1.000,00 | 3.000,00 | **67.902,39** | 263.126,56 |
| 5 | 61.592,17 | 972,22 | 837,00 | 501,00 | 1.000,00 | 0,00 | **64.902,39** | **328.028,94** |
| **Total** | 307.960,83 | 4.861,11 | 2.034,00 | 2.933,00 | 5.000,00 | 5.240,00 | **328.028,94** | |

Fases sugeridas: **M1** escopo, design e arquitetura · **M2–M3** back-end, web e mobile · **M4** integração, acessibilidade e testes · **M5** UAT, correções, LaTeX e apresentação.

---

## 7. Cenários

| Premissa / Item | Otimista | **Realista** | Pessimista |
|---|---|---|---|
| Horas | 2.432 × 1,10 = 2.675 h | 2.432 × 1,25 = 3.040 h | ΣP 3.486 × 1,10 = 3.835 h |
| Prazo (arredondado para meio mês acima) | 4,5 meses | 5 meses | 6,5 meses |
| Infra | Créditos AWS Free Tier (−R$ 1.100) | Preço cheio | +30% e ambientes ativos por mais tempo |
| Mão de obra | R$ 277.164,75 | R$ 307.960,83 | R$ 400.349,08 |
| Depreciação | R$ 4.375,00 | R$ 4.861,11 | R$ 6.319,44 |
| Contabilidade/adm. | R$ 4.500,00 | R$ 5.000,00 | R$ 6.500,00 |
| Custos únicos | R$ 5.240,00 | R$ 5.240,00 | R$ 5.240,00 |
| Infraestrutura | R$ 934,00 | R$ 2.034,00 | R$ 4.276,35 |
| Ferramentas | R$ 2.682,50 | R$ 2.933,00 | R$ 3.904,50 |
| **Total** | **R$ 294.896,25** | **R$ 328.028,94** | **R$ 426.589,38** |
| Variação vs. realista | −10,1% | — | +30,0% |

- **Otimista:** a equipe aprende rápido, há pouco retrabalho e a contingência é de apenas 10%.
- **Pessimista:** todas as tarefas ficam na estimativa pessimista do PERT (atrasos na integração Python ↔ Java e entre os 2 bancos, retrabalho em RBAC, Kotlin e Spring mais lentos), com 10% extra e nuvem 30% mais cara.

---

## 8. Riscos de custo e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Integração Python ↔ Java | Alto | Contratos OpenAPI no mês 1; JWT validado com a mesma chave nos dois serviços; teste de contrato no CI |
| Consistência PostgreSQL ↔ MySQL | Médio | Auditoria por evento assíncrono (outbox); MySQL tratado como somente-anexo |
| Curva de aprendizado | Alto | Spike técnico na semana 1; pareamento Sênior/Júnior no Kotlin |
| Gargalo no Especialista (perfil mais caro, ≈ 43% da folha) | Alto | Sênior revisa o código Java; decisões documentadas (ADRs) |
| Falha de isolamento de dados | Crítico (LGPD, menores) | Testes automatizados de autorização por ID; checagem de ownership no back-end |
| Aumento do escopo | Médio | Lista "fora do escopo" como contrato; controle formal de mudanças |
| Atraso (cada mês extra custa ≈ R$ 64,5 mil) | Alto | Marcos mensais com entregáveis; escopo congelado depois do mês 1 |

---

## 9. Recomendações para reduzir o custo (sem mudar o escopo)

| Ação | Economia estimada |
|---|---|
| Contratar os 4 perfis CLT como **PJ** (salário + 30%, sem encargos e sem benefícios): R$ 60.583,83 → R$ 42.900,00 por mês | **≈ R$ 88.419,17** |
| Empresa no **Simples Nacional** (Anexo III com fator R, sem os 27,8% de INSS + RAT + Terceiros à parte) | ≈ R$ 54.789,17 |
| GitHub Student Pack / Azure for Students / créditos AWS | ≈ R$ 3 mil a R$ 5 mil |
| Juntar homologação e produção numa única VM até o UAT | ≈ R$ 1 mil |
| IntelliJ IDEA gratuito em vez da licença Ultimate | R$ 1.375,00 |
| Biblioteca de componentes pronta (Angular Material) | ≈ 30–40 h de UI |

> [!TIP]
> Em contexto **puramente acadêmico** (equipe não remunerada, notebooks próprios, planos gratuitos/estudantis), o gasto em dinheiro cai para cerca de **R$ 0 a R$ 1.500**. Os R$ 328 mil representam o **custo econômico** das 3.040 horas de trabalho.

---

## 10. Pós-lançamento e projeção SaaS (hipotética)

> [!WARNING]
> O escopo prevê **uma única instituição** (multi-tenant está fora do escopo). A simulação assume **uma instância por colégio**.

| Premissa / Indicador | Valor |
|---|---|
| Preço sugerido | R$ 1.200,00/colégio/mês |
| Impostos sobre a receita (Lucro Presumido) | 14,33% |
| Custo variável por colégio (instância R$ 450 + suporte R$ 150) | R$ 600,00 |
| **Margem de contribuição por colégio** | **R$ 428,04/mês** |
| Margem bruta (sobre a receita líquida) | 41,6% |
| Custo fixo pós-lançamento (manutenção 20% a.a. + contabilidade) | R$ 6.467,15/mês |
| Ponto de equilíbrio (sem contar CAC) | **16 colégios** |
| Crescimento / churn / CAC | +2 colégios/mês · 2%/mês · R$ 2.000 |
| LTV = 428,04 / 0,02 | R$ 21.402,00 (LTV/CAC = 10,7) |
| Payback do CAC | 4,7 meses |
| Break-even operacional (incluindo CAC) | Mês 14, com cerca de 25 colégios |
| **Payback do investimento (R$ 328.028,94)** | **Mês 53** (~4,4 anos), com cerca de 66 colégios |
| ROI em 5 anos | ≈ 42% |

---

## 11. Anexo — fórmulas e cálculos

```text
FATOR_CLT        = 35,80% (folha) + 19,44% (13º+férias) + 6,96% (encargos s/ provisões) + 3,20% (multa FGTS) = 65,41%

CUSTO_MENSAL_CLT = Salário × 1,6541 + 1.500
  Especialista   = 15.000 × 1,6541 + 1.500                      = R$ 26.310,83
  Sênior         = 10.000 × 1,6541 + 1.500                      = R$ 18.040,56
  Pleno          =  5.000 × 1,6541 + 1.500                      = R$  9.770,28
  Júnior         =  3.000 × 1,6541 + 1.500                      = R$  6.462,17
CUSTO_ESTÁGIO    = 700 + 220 + 30 + 700/12                      = R$  1.008,33
FOLHA_MENSAL     = Σ                                            = R$ 61.592,17

HORAS_PROD       = 20 × 8 × 0,80 = 128 h (CLT) | 20 × 6 × 0,80 = 96 h (estágio)
CUSTO_HORA       = Custo mensal / horas produtivas   (ex.: 26.310,83 / 128 = R$ 205,55)
CAPACIDADE       = 4 × 128 + 96                                 = 608 h/mês

PERT             E = (O + 4M + P) / 6      ex.: 5.4 → (81 + 4×103 + 155)/6 = 108 h
ESFORÇO          = 2.432 h × 1,25 = 3.040 h → 3.040 / 608 = 5,0 meses
MÃO_DE_OBRA      = 61.592,17 × 5                                = R$ 307.960,83

TOTAL REALISTA   = 307.960,83 + 2.034 (infra) + 2.933 (ferram.) + 4.861,11 (deprec.)
                   + 5.000 (contab.) + 5.240 (únicos)            = R$ 328.028,94

OTIMISTA         = 61.592,17 × 4,5 + ...                        = R$ 294.896,25
PESSIMISTA       = 61.592,17 × 6,5 + ...                        = R$ 426.589,38

PREÇO_VENDA      = 328.028,94 / (1 − 0,1433 − 0,20)             = R$ 499.511,11
MANUTENÇÃO       = 20% × 328.028,94                             = R$ 65.605,79/ano

PJ               = Σ(salário × 1,30) = 42.900/mês vs CLT 60.583,83/mês → economia × 5 = R$ 88.419,17
SaaS BREAK-EVEN  = 6.467,15 / 428,04 = 15,1 → 16 colégios
```

### Arquivos CSV atualizados (separador `;`, vírgula decimal)
- [educa_equipe.csv](ArquivosCSV/educa_equipe.csv)
- [educa_wbs.csv](ArquivosCSV/educa_wbs.csv)
- [educa_fluxo_caixa.csv](ArquivosCSV/educa_fluxo_caixa.csv)
- [educa_cenarios.csv](ArquivosCSV/educa_cenarios.csv)
