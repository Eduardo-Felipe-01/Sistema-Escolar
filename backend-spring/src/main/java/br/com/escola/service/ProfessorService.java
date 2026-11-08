package br.com.escola.service;

import br.com.escola.domain.*;
import br.com.escola.domain.secondary.ReportHistory;
import br.com.escola.dto.*;
import br.com.escola.repository.*;
import br.com.escola.repository.secondary.ReportHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessorService {

    private final UserRepository userRepository;
    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final TurmaDisciplinaProfessorRepository tdpRepository;
    private final MatriculaRepository matriculaRepository;
    private final NotaRepository notaRepository;
    private final FrequenciaRepository frequenciaRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final CalculoMediaService calculoMediaService;
    private final FrequenciaService frequenciaService;
    private final AuditService auditService;

    public void validarVinculo(Long professorId, Long turmaId, Long disciplinaId) {
        User user = userRepository.findById(professorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + professorId));
        if (user.getRole() == Role.ROLE_COORDENADOR) {
            return; // Coordenador tem acesso irrestrito
        }
        boolean vinculado = tdpRepository.existsByTurmaIdAndDisciplinaIdAndProfessorId(turmaId, disciplinaId, professorId);
        if (!vinculado) {
            throw new AccessDeniedException("Professor não possui vínculo atribuído com esta turma e disciplina");
        }
    }

    @Transactional(readOnly = true)
    public List<TurmaResumoDTO> getTurmas(Long professorId) {
        User user = userRepository.findById(professorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        List<TurmaDisciplinaProfessor> vinculos;
        if (user.getRole() == Role.ROLE_COORDENADOR) {
            vinculos = tdpRepository.findAll();
        } else {
            vinculos = tdpRepository.findByProfessorId(professorId);
        }

        List<TurmaResumoDTO> resultado = new ArrayList<>();
        for (TurmaDisciplinaProfessor v : vinculos) {
            int totalAlunos = matriculaRepository.findByTurmaIdOrderByNumeroChamadaAsc(v.getTurma().getId()).size();
            resultado.add(TurmaResumoDTO.builder()
                    .id(v.getTurma().getId())
                    .nome(v.getTurma().getNome())
                    .anoLetivo(v.getTurma().getAnoLetivo())
                    .turno(v.getTurma().getTurno())
                    .sala(v.getTurma().getSala())
                    .disciplinaId(v.getDisciplina().getId())
                    .disciplinaNome(v.getDisciplina().getNome())
                    .totalAlunos(totalAlunos)
                    .build());
        }
        return resultado;
    }

    @Transactional(readOnly = true)
    public List<LancamentoNotaResponse> getNotasTurma(Long turmaId, Long disciplinaId, Integer bimestre, Long professorId) {
        validarVinculo(professorId, turmaId, disciplinaId);

        List<Matricula> matriculas = matriculaRepository.findByTurmaIdOrderByNumeroChamadaAsc(turmaId);
        Disciplina disciplina = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada"));

        List<LancamentoNotaResponse> resultado = new ArrayList<>();

        for (Matricula m : matriculas) {
            Optional<Nota> optNota = notaRepository.findByMatriculaIdAndDisciplinaIdAndBimestre(
                    m.getId(), disciplinaId, bimestre);

            if (optNota.isPresent()) {
                Nota n = optNota.get();
                resultado.add(LancamentoNotaResponse.builder()
                        .id(n.getId())
                        .matriculaId(m.getId())
                        .alunoId(m.getAluno().getId())
                        .alunoNome(m.getAluno().getNome())
                        .numeroChamada(m.getNumeroChamada())
                        .disciplinaId(disciplina.getId())
                        .disciplinaNome(disciplina.getNome())
                        .bimestre(bimestre)
                        .nota1(n.getNota1())
                        .nota2(n.getNota2())
                        .trabalho(n.getTrabalho())
                        .recuperacao(n.getRecuperacao())
                        .mediaBimestre(n.getMediaBimestre())
                        .status(n.getStatus())
                        .observacoes(n.getObservacoes())
                        .build());
            } else {
                resultado.add(LancamentoNotaResponse.builder()
                        .id(null)
                        .matriculaId(m.getId())
                        .alunoId(m.getAluno().getId())
                        .alunoNome(m.getAluno().getNome())
                        .numeroChamada(m.getNumeroChamada())
                        .disciplinaId(disciplina.getId())
                        .disciplinaNome(disciplina.getNome())
                        .bimestre(bimestre)
                        .nota1(null)
                        .nota2(null)
                        .trabalho(null)
                        .recuperacao(null)
                        .mediaBimestre(null)
                        .status("PENDENTE")
                        .observacoes("")
                        .build());
            }
        }

        return resultado;
    }

    @Transactional("postgresTransactionManager")
    public LancamentoNotaResponse salvarNota(LancamentoNotaRequest req, Long professorId, String ipOrigem) {
        Matricula matricula = matriculaRepository.findById(req.getMatriculaId())
                .orElseThrow(() -> new IllegalArgumentException("Matrícula não encontrada: " + req.getMatriculaId()));

        validarVinculo(professorId, matricula.getTurma().getId(), req.getDisciplinaId());

        Disciplina disciplina = disciplinaRepository.findById(req.getDisciplinaId())
                .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada: " + req.getDisciplinaId()));

        User autor = userRepository.findById(professorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário autor não encontrado"));

        // Cálculo automático da média e status
        CalculoMediaService.ResultadoMedia res = calculoMediaService.calcular(
                req.getNota1(), req.getNota2(), req.getTrabalho(), req.getRecuperacao());

        Optional<Nota> optExistente = notaRepository.findByMatriculaIdAndDisciplinaIdAndBimestre(
                matricula.getId(), disciplina.getId(), req.getBimestre());

        Nota nota;
        String dadosAnteriores = "{}";
        String acao;

        if (optExistente.isPresent()) {
            nota = optExistente.get();
            acao = "ALTERACAO_NOTA";
            dadosAnteriores = String.format("{\"n1\":%s,\"n2\":%s,\"trab\":%s,\"rec\":%s,\"media\":%s}",
                    nota.getNota1(), nota.getNota2(), nota.getTrabalho(), nota.getRecuperacao(), nota.getMediaBimestre());
        } else {
            nota = Nota.builder()
                    .matricula(matricula)
                    .disciplina(disciplina)
                    .bimestre(req.getBimestre())
                    .build();
            acao = "LANCAMENTO_NOTA";
        }

        nota.setNota1(req.getNota1());
        nota.setNota2(req.getNota2());
        nota.setTrabalho(req.getTrabalho());
        nota.setRecuperacao(req.getRecuperacao());
        nota.setMediaBimestre(res.media());
        nota.setStatus(res.status());
        nota.setObservacoes(req.getObservacoes());
        nota.setDataAtualizacao(LocalDateTime.now());

        Nota salva = notaRepository.save(nota);

        String dadosNovos = String.format("{\"n1\":%s,\"n2\":%s,\"trab\":%s,\"rec\":%s,\"media\":%s,\"status\":\"%s\"}",
                salva.getNota1(), salva.getNota2(), salva.getTrabalho(), salva.getRecuperacao(), salva.getMediaBimestre(), salva.getStatus());

        // Registrar auditoria no MongoDB
        auditService.registrar(
                autor.getId(),
                autor.getNome(),
                autor.getRole().name(),
                acao,
                "Nota",
                salva.getId(),
                dadosAnteriores,
                dadosNovos,
                ipOrigem
        );

        return LancamentoNotaResponse.builder()
                .id(salva.getId())
                .matriculaId(matricula.getId())
                .alunoId(matricula.getAluno().getId())
                .alunoNome(matricula.getAluno().getNome())
                .numeroChamada(matricula.getNumeroChamada())
                .disciplinaId(disciplina.getId())
                .disciplinaNome(disciplina.getNome())
                .bimestre(salva.getBimestre())
                .nota1(salva.getNota1())
                .nota2(salva.getNota2())
                .trabalho(salva.getTrabalho())
                .recuperacao(salva.getRecuperacao())
                .mediaBimestre(salva.getMediaBimestre())
                .status(salva.getStatus())
                .observacoes(salva.getObservacoes())
                .build();
    }

    @Transactional(readOnly = true)
    public List<FrequenciaResumoAlunoDTO> getResumoFrequenciaTurma(Long turmaId, Long disciplinaId, Long professorId) {
        validarVinculo(professorId, turmaId, disciplinaId);

        List<Matricula> matriculas = matriculaRepository.findByTurmaIdOrderByNumeroChamadaAsc(turmaId);
        List<FrequenciaResumoAlunoDTO> lista = new ArrayList<>();

        for (Matricula m : matriculas) {
            lista.add(frequenciaService.calcularResumo(m, disciplinaId));
        }

        return lista;
    }

    @Transactional(readOnly = true)
    public List<Frequencia> getFrequenciasData(Long turmaId, Long disciplinaId, LocalDate data, Long professorId) {
        validarVinculo(professorId, turmaId, disciplinaId);
        return frequenciaRepository.findByTurmaAndDisciplinaAndData(turmaId, disciplinaId, data);
    }

    @Transactional("postgresTransactionManager")
    public void salvarFrequencias(LancamentoFrequenciaBatchRequest req, Long professorId, String ipOrigem) {
        validarVinculo(professorId, req.getTurmaId(), req.getDisciplinaId());

        User autor = userRepository.findById(professorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Disciplina disciplina = disciplinaRepository.findById(req.getDisciplinaId())
                .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada"));

        for (LancamentoFrequenciaItemDTO item : req.getItens()) {
            Matricula matricula = matriculaRepository.findById(item.getMatriculaId())
                    .orElseThrow(() -> new IllegalArgumentException("Matrícula não encontrada: " + item.getMatriculaId()));

            Optional<Frequencia> optFreq = frequenciaRepository.findByMatriculaIdAndDisciplinaIdAndData(
                    matricula.getId(), disciplina.getId(), req.getData());

            Frequencia freq;
            String dadosAnteriores = "{}";
            if (optFreq.isPresent()) {
                freq = optFreq.get();
                dadosAnteriores = String.format("{\"p\":%d,\"f\":%d,\"j\":%b}", freq.getPresencas(), freq.getFaltas(), freq.getJustificada());
            } else {
                freq = Frequencia.builder()
                        .matricula(matricula)
                        .disciplina(disciplina)
                        .data(req.getData())
                        .build();
            }

            freq.setAulasNoDia(req.getAulasNoDia() != null ? req.getAulasNoDia() : 1);
            freq.setPresencas(item.getPresencas() != null ? item.getPresencas() : 0);
            freq.setFaltas(item.getFaltas() != null ? item.getFaltas() : 0);
            freq.setJustificada(item.getJustificada() != null && item.getJustificada());
            freq.setObservacao(item.getObservacao());

            Frequencia salva = frequenciaRepository.save(freq);

            // Verificar se atinge limite de reprovação automática por falta
            frequenciaService.verificarEAtualizarReprovacaoPorFalta(matricula, disciplina.getId());

            String dadosNovos = String.format("{\"p\":%d,\"f\":%d,\"j\":%b}", salva.getPresencas(), salva.getFaltas(), salva.getJustificada());

            // Gravar auditoria no MongoDB
            auditService.registrar(
                    autor.getId(),
                    autor.getNome(),
                    autor.getRole().name(),
                    "LANCAMENTO_FREQUENCIA",
                    "Frequencia",
                    salva.getId(),
                    dadosAnteriores,
                    dadosNovos,
                    ipOrigem
            );
        }
    }

    @Transactional(value = "postgresTransactionManager", readOnly = true)
    public Map<String, Object> gerarRelatorioTurma(Long turmaId, Long disciplinaId, Long professorId) {
        validarVinculo(professorId, turmaId, disciplinaId);

        User autor = userRepository.findById(professorId).orElseThrow();
        Turma turma = turmaRepository.findById(turmaId).orElseThrow();
        Disciplina disciplina = disciplinaRepository.findById(disciplinaId).orElseThrow();

        List<Matricula> matriculas = matriculaRepository.findByTurmaIdOrderByNumeroChamadaAsc(turmaId);
        List<Map<String, Object>> alunosRelatorio = new ArrayList<>();

        double somaMedias = 0.0;
        int totalNotas = 0;
        int aprovados = 0;
        int emRecuperacao = 0;
        int reprovados = 0;

        for (Matricula m : matriculas) {
            List<Nota> notasAluno = notaRepository.findByMatriculaIdAndDisciplinaId(m.getId(), disciplinaId);
            FrequenciaResumoAlunoDTO freq = frequenciaService.calcularResumo(m, disciplinaId);

            double mediaGeral = 0.0;
            if (!notasAluno.isEmpty()) {
                double soma = notasAluno.stream().mapToDouble(n -> n.getMediaBimestre() != null ? n.getMediaBimestre() : 0.0).sum();
                mediaGeral = Math.round((soma / notasAluno.size()) * 100.0) / 100.0;
                somaMedias += mediaGeral;
                totalNotas++;
            }

            if (mediaGeral >= 6.0 && !freq.getReprovadoPorFalta()) {
                aprovados++;
            } else if (mediaGeral >= 4.0 && !freq.getReprovadoPorFalta()) {
                emRecuperacao++;
            } else {
                reprovados++;
            }

            Map<String, Object> aMap = new HashMap<>();
            aMap.put("matriculaId", m.getId());
            aMap.put("alunoId", m.getAluno().getId());
            aMap.put("nome", m.getAluno().getNome());
            aMap.put("numeroChamada", m.getNumeroChamada());
            aMap.put("mediaGeral", mediaGeral);
            aMap.put("taxaPresenca", freq.getTaxaPresenca());
            aMap.put("reprovadoPorFalta", freq.getReprovadoPorFalta());
            aMap.put("statusMatricula", m.getStatus().name());
            alunosRelatorio.add(aMap);
        }

        double mediaTurma = totalNotas > 0 ? Math.round((somaMedias / totalNotas) * 100.0) / 100.0 : 0.0;

        // Registrar emissão de relatório no MongoDB
        try {
            ReportHistory relatorioHist = ReportHistory.builder()
                    .usuarioId(autor.getId())
                    .usuarioNome(autor.getNome())
                    .tipoRelatorio("BOLETIM_TURMA")
                    .parametros(String.format("turmaId=%d,disciplinaId=%d", turmaId, disciplinaId))
                    .statusValidacao("VALIDADO_AUTOMATICO")
                    .dataEmissao(LocalDateTime.now())
                    .build();
            reportHistoryRepository.save(relatorioHist);
        } catch (Exception e) {
            log.warn("Aviso: Falha ao gravar histórico de relatório no MongoDB: {}", e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("turmaNome", turma.getNome());
        response.put("disciplinaNome", disciplina.getNome());
        response.put("anoLetivo", turma.getAnoLetivo());
        response.put("professorNome", autor.getNome());
        response.put("mediaGeralTurma", mediaTurma);
        response.put("totalAlunos", matriculas.size());
        response.put("aprovados", aprovados);
        response.put("emRecuperacao", emRecuperacao);
        response.put("reprovados", reprovados);
        response.put("alunos", alunosRelatorio);
        response.put("emitidoEm", LocalDateTime.now());

        return response;
    }
}
