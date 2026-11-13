package br.com.escola.controller;

import br.com.escola.domain.Matricula;
import br.com.escola.domain.Nota;
import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.domain.secondary.ReportHistory;
import br.com.escola.dto.FrequenciaResumoAlunoDTO;
import br.com.escola.repository.MatriculaRepository;
import br.com.escola.repository.NotaRepository;
import br.com.escola.repository.secondary.AuditLogRepository;
import br.com.escola.repository.secondary.ReportHistoryRepository;
import br.com.escola.security.CustomUserDetails;
import br.com.escola.service.FrequenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/aluno")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ALUNO', 'COORDENADOR')")
@Validated
public class AlunoController {

    private final MatriculaRepository matriculaRepository;
    private final NotaRepository notaRepository;
    private final FrequenciaService frequenciaService;
    private final AuditLogRepository auditLogRepository;
    private final ReportHistoryRepository reportHistoryRepository;

    @GetMapping("/meu-boletim")
    public ResponseEntity<?> getMeuBoletim(@AuthenticationPrincipal CustomUserDetails user) {
        List<Matricula> matriculas = matriculaRepository.findByAlunoId(user.getId());
        List<Map<String, Object>> dados = new ArrayList<>();

        for (Matricula m : matriculas) {
            List<Nota> notas = notaRepository.findByMatriculaId(m.getId());
            Map<String, Object> matMap = new HashMap<>();
            matMap.put("turmaNome", m.getTurma().getNome());
            matMap.put("status", m.getStatus().name());
            matMap.put("numeroChamada", m.getNumeroChamada());

            List<Map<String, Object>> listaNotas = new ArrayList<>();
            for (Nota n : notas) {
                FrequenciaResumoAlunoDTO freqResumo = frequenciaService.calcularResumo(m, n.getDisciplina().getId());
                Map<String, Object> nMap = new HashMap<>();
                nMap.put("disciplina", n.getDisciplina().getNome());
                nMap.put("bimestre", n.getBimestre());
                nMap.put("nota1", n.getNota1());
                nMap.put("nota2", n.getNota2());
                nMap.put("trabalho", n.getTrabalho());
                nMap.put("recuperacao", n.getRecuperacao());
                nMap.put("media", n.getMediaBimestre());
                nMap.put("status", n.getStatus());
                nMap.put("taxaPresenca", freqResumo.getTaxaPresenca());
                nMap.put("totalFaltas", freqResumo.getTotalFaltas());
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
}
