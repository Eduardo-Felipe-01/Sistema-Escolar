package br.com.escola.controller;

import br.com.escola.domain.Cronograma;
import br.com.escola.domain.Disciplina;
import br.com.escola.domain.Frequencia;
import br.com.escola.domain.Matricula;
import br.com.escola.domain.Nota;
import br.com.escola.domain.Role;
import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.domain.secondary.ReportHistory;
import br.com.escola.dto.FrequenciaResumoAlunoDTO;
import br.com.escola.repository.CronogramaRepository;
import br.com.escola.repository.DisciplinaRepository;
import br.com.escola.repository.FrequenciaRepository;
import br.com.escola.repository.MatriculaRepository;
import br.com.escola.repository.NotaRepository;
import br.com.escola.repository.secondary.AuditLogRepository;
import br.com.escola.repository.secondary.ReportHistoryRepository;
import br.com.escola.security.CustomUserDetails;
import br.com.escola.service.FrequenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/aluno")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ALUNO', 'COORDENADOR')")
public class AlunoController {

    private final MatriculaRepository matriculaRepository;
    private final NotaRepository notaRepository;
    private final FrequenciaRepository frequenciaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final FrequenciaService frequenciaService;
    private final AuditLogRepository auditLogRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final CronogramaRepository cronogramaRepository;

    @GetMapping("/meu-boletim")
    public ResponseEntity<?> getMeuBoletim(@AuthenticationPrincipal CustomUserDetails user) {
        List<Matricula> matriculas = matriculaRepository.findByAlunoId(user.getId());
        List<Map<String, Object>> dados = new ArrayList<>();

        for (Matricula m : matriculas) {
            List<Nota> notas = notaRepository.findByMatriculaId(m.getId());
            Map<String, Object> matMap = new HashMap<>();
            matMap.put("turmaId", m.getTurma().getId());
            matMap.put("turmaNome", m.getTurma().getNome());
            matMap.put("anoLetivo", m.getTurma().getAnoLetivo());
            matMap.put("turno", m.getTurma().getTurno());
            matMap.put("sala", m.getTurma().getSala());
            matMap.put("status", m.getStatus().name());
            matMap.put("numeroChamada", m.getNumeroChamada());

            List<Map<String, Object>> listaNotas = new ArrayList<>();
            for (Nota n : notas) {
                FrequenciaResumoAlunoDTO freqResumo = frequenciaService.calcularResumo(m, n.getDisciplina().getId());
                Map<String, Object> nMap = new HashMap<>();
                nMap.put("disciplinaId", n.getDisciplina().getId());
                nMap.put("disciplina", n.getDisciplina().getNome());
                nMap.put("bimestre", n.getBimestre());
                nMap.put("nota1", n.getNota1());
                nMap.put("nota2", n.getNota2());
                nMap.put("trabalho", n.getTrabalho());
                nMap.put("recuperacao", n.getRecuperacao());
                nMap.put("media", n.getMediaBimestre());
                nMap.put("status", n.getStatus());
                nMap.put("taxaPresenca", freqResumo.getTaxaPresenca());
                nMap.put("totalPresencas", freqResumo.getTotalPresencas());
                nMap.put("totalFaltas", freqResumo.getTotalFaltas());
                nMap.put("totalAulas", freqResumo.getTotalAulas());
                nMap.put("reprovadoPorFalta", freqResumo.getReprovadoPorFalta());
                listaNotas.add(nMap);
            }
            matMap.put("notas", listaNotas);
            dados.add(matMap);
        }

        return ResponseEntity.ok(dados);
    }

    @GetMapping("/meu-historico")
    public ResponseEntity<List<AuditLog>> getMeuHistorico(@AuthenticationPrincipal CustomUserDetails user) {
        // Aluno visualiza alterações feitas sobre seus próprios dados (por alunoId ou usuarioId)
        List<AuditLog> logs = auditLogRepository.findByAlunoIdOrUsuarioIdOrderByDataHoraDesc(user.getId(), user.getId());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/meus-relatorios")
    public ResponseEntity<List<ReportHistory>> getMeusRelatorios(@AuthenticationPrincipal CustomUserDetails user) {
        // Aluno visualiza as emissões de relatórios referentes a ele ou à sua turma
        List<Long> turmaIds = matriculaRepository.findByAlunoId(user.getId())
                .stream()
                .map(m -> m.getTurma().getId())
                .collect(Collectors.toList());
        List<ReportHistory> relatorios = reportHistoryRepository.findByAlunoIdOrTurmaIdInOrderByDataEmissaoDesc(user.getId(), turmaIds);
        return ResponseEntity.ok(relatorios);
    }

    @GetMapping("/meus-relatorios/{reportId}/detalhes")
    public ResponseEntity<Map<String, Object>> getDetalhesRelatorioAluno(
            @PathVariable String reportId,
            @AuthenticationPrincipal CustomUserDetails user) {
        ReportHistory rep = reportHistoryRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado: " + reportId));

        List<Matricula> matriculas = matriculaRepository.findByAlunoId(user.getId());
        if (matriculas.isEmpty()) {
            throw new AccessDeniedException("Estudante não possui matrícula vinculada.");
        }

        Matricula matricula = matriculas.stream()
                .filter(m -> rep.getTurmaId() != null && m.getTurma().getId().equals(rep.getTurmaId()))
                .findFirst()
                .orElse(null);

        boolean isCoordenador = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Role.ROLE_COORDENADOR.name()));

        if (matricula == null) {
            if (Objects.equals(rep.getAlunoId(), user.getId()) || isCoordenador) {
                matricula = matriculas.get(0);
            } else {
                throw new AccessDeniedException("Acesso negado: este relatório não pertence à sua turma ou matrícula.");
            }
        }

        final Matricula matFinal = matricula;
        Disciplina disciplina = null;
        if (rep.getDisciplinaNome() != null && !rep.getDisciplinaNome().isBlank()) {
            disciplina = disciplinaRepository.findAll().stream()
                    .filter(d -> d.getNome().equalsIgnoreCase(rep.getDisciplinaNome()))
                    .findFirst()
                    .orElse(null);
        }
        if (disciplina == null) {
            List<Nota> todasNotas = notaRepository.findByMatriculaId(matFinal.getId());
            if (!todasNotas.isEmpty()) {
                disciplina = todasNotas.get(0).getDisciplina();
            } else {
                disciplina = disciplinaRepository.findAll().stream().findFirst().orElse(null);
            }
        }

        Long discId = disciplina != null ? disciplina.getId() : 1L;
        List<Nota> notasDisciplina = notaRepository.findByMatriculaIdAndDisciplinaId(matFinal.getId(), discId)
                .stream()
                .sorted(Comparator.comparing(Nota::getBimestre))
                .collect(Collectors.toList());

        double somaMedias = 0.0;
        int countMedias = 0;
        List<Map<String, Object>> avaliacoes = new ArrayList<>();
        for (Nota n : notasDisciplina) {
            if (n.getMediaBimestre() != null) {
                somaMedias += n.getMediaBimestre();
                countMedias++;
            }
            Map<String, Object> nMap = new HashMap<>();
            nMap.put("bimestre", n.getBimestre());
            nMap.put("nota1", n.getNota1());
            nMap.put("nota2", n.getNota2());
            nMap.put("trabalho", n.getTrabalho());
            nMap.put("recuperacao", n.getRecuperacao());
            nMap.put("mediaBimestre", n.getMediaBimestre());
            nMap.put("status", n.getStatus());
            nMap.put("observacoes", n.getObservacoes());
            avaliacoes.add(nMap);
        }

        double mediaGeral = countMedias > 0 ? Math.round((somaMedias / countMedias) * 100.0) / 100.0 : 0.0;
        FrequenciaResumoAlunoDTO freqResumo = frequenciaService.calcularResumo(matFinal, discId);

        List<Map<String, Object>> diarioFrequencia = frequenciaRepository
                .findByMatriculaIdAndDisciplinaId(matFinal.getId(), discId)
                .stream()
                .sorted(Comparator.comparing(Frequencia::getData).reversed())
                .map(f -> {
                    Map<String, Object> fMap = new HashMap<>();
                    fMap.put("data", f.getData());
                    fMap.put("aulasNoDia", f.getAulasNoDia());
                    fMap.put("presencas", f.getPresencas());
                    fMap.put("faltas", f.getFaltas());
                    fMap.put("justificada", Boolean.TRUE.equals(f.getJustificada()));
                    fMap.put("observacao", f.getObservacao());
                    return fMap;
                })
                .collect(Collectors.toList());

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", rep.getId());
        payload.put("tipoRelatorio", rep.getTipoRelatorio());
        payload.put("dataEmissao", rep.getDataEmissao());
        payload.put("emitidoPor", rep.getUsuarioNome());
        payload.put("statusValidacao", rep.getStatusValidacao());
        payload.put("validadoPor", rep.getValidadoPor());
        payload.put("dataValidacao", rep.getDataValidacao());

        payload.put("turmaNome", matFinal.getTurma().getNome());
        payload.put("anoLetivo", matFinal.getTurma().getAnoLetivo());
        payload.put("turno", matFinal.getTurma().getTurno());
        payload.put("sala", matFinal.getTurma().getSala());
        payload.put("disciplinaNome", disciplina != null ? disciplina.getNome() : rep.getDisciplinaNome());
        payload.put("disciplinaCodigo", disciplina != null ? disciplina.getCodigo() : "DISC-01");
        payload.put("cargaHoraria", disciplina != null ? disciplina.getCargaHoraria() : 80);

        payload.put("alunoNome", matFinal.getAluno().getNome());
        payload.put("alunoEmail", matFinal.getAluno().getEmail());
        payload.put("alunoMatricula", matFinal.getAluno().getMatricula());
        payload.put("numeroChamada", matFinal.getNumeroChamada());
        payload.put("statusMatricula", matFinal.getStatus().name());

        payload.put("mediaGeral", mediaGeral);
        payload.put("taxaPresenca", freqResumo.getTaxaPresenca());
        payload.put("totalAulas", freqResumo.getTotalAulas());
        payload.put("totalPresencas", freqResumo.getTotalPresencas());
        payload.put("totalFaltas", freqResumo.getTotalFaltas());
        payload.put("reprovadoPorFalta", freqResumo.getReprovadoPorFalta());
        payload.put("avaliacoes", avaliacoes);
        payload.put("frequencias", diarioFrequencia);

        return ResponseEntity.ok(payload);
    }

    @GetMapping("/cronograma")
    @PreAuthorize("hasAnyRole('ALUNO', 'PROFESSOR', 'COORDENADOR')")
    public ResponseEntity<List<Cronograma>> getCronograma() {
        return ResponseEntity.ok(cronogramaRepository.findAll(Sort.by(Sort.Direction.ASC, "dataInicio")));
    }
}
