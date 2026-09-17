export type Role = 'ROLE_ALUNO' | 'ROLE_PROFESSOR' | 'ROLE_COORDENADOR';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: Role;
  matricula?: string;
  token?: string;
}

export interface TurmaResumo {
  id: number;
  nome: string;
  anoLetivo: number;
  turno: string;
  sala: string;
  disciplinaId: number;
  disciplinaNome: string;
  totalAlunos: number;
}

export interface NotaAluno {
  id?: number;
  matriculaId: number;
  alunoId: number;
  alunoNome: string;
  numeroChamada: number;
  disciplinaId: number;
  disciplinaNome: string;
  bimestre: number;
  nota1: number | null;
  nota2: number | null;
  trabalho: number | null;
  recuperacao: number | null;
  mediaBimestre: number | null;
  status: string; // 'APROVADO' | 'RECUPERACAO' | 'REPROVADO' | 'PENDENTE'
  observacoes?: string;
}

export interface FrequenciaAluno {
  matriculaId: number;
  alunoId: number;
  alunoNome: string;
  numeroChamada: number;
  totalPresencas: number;
  totalFaltas: number;
  totalAulas: number;
  taxaPresenca: number;
  reprovadoPorFalta: boolean;
  // Estado local para a chamada do dia selecionado
  presencaHoje?: number; // 1 = Presente, 0 = Falta
  justificadaHoje?: boolean;
}
