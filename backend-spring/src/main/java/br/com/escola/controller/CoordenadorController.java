package br.com.escola.controller;

import br.com.escola.domain.*;
import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.domain.secondary.ReportHistory;
import br.com.escola.dto.LancamentoNotaRequest;
import br.com.escola.dto.LancamentoNotaResponse;
import br.com.escola.repository.*;
import br.com.escola.repository.secondary.AuditLogRepository;
import br.com.escola.repository.secondary.ReportHistoryRepository;
import br.com.escola.security.CustomUserDetails;
import br.com.escola.service.ProfessorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/coordenador")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COORDENADOR')")
public class CoordenadorController {

    private final UserRepository userRepository;
    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final CronogramaRepository cronogramaRepository;
    private final AuditLogRepository auditLogRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final ProfessorService professorService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/estatisticas-gerais")
    public ResponseEntity<?> getEstatisticas() {
        long totalUsuarios = userRepository.count();
        long totalTurmas = turmaRepository.count();
        long totalDisciplinas = disciplinaRepository.count();
        List<User> professores = userRepository.findByRole(Role.ROLE_PROFESSOR);
        List<User> alunos = userRepository.findByRole(Role.ROLE_ALUNO);

        return ResponseEntity.ok(Map.of(
                "totalUsuarios", totalUsuarios,
                "totalTurmas", totalTurmas,
                "totalDisciplinas", totalDisciplinas,
                "totalProfessores", professores.size(),
                "totalAlunos", alunos.size()
        ));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<User>> listarUsuarios() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/usuarios")
    public ResponseEntity<User> criarUsuario(@RequestBody User user) {
        user.setSenha(passwordEncoder.encode(user.getSenha() != null ? user.getSenha() : "senha123"));
        user.setAtivo(true);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cronograma")
    public ResponseEntity<List<Cronograma>> listarCronograma() {
        return ResponseEntity.ok(cronogramaRepository.findAll());
    }

    @PostMapping("/cronograma")
    public ResponseEntity<Cronograma> criarCronograma(@RequestBody Cronograma cronograma) {
        return ResponseEntity.ok(cronogramaRepository.save(cronograma));
    }

    @PutMapping("/notas/{notaId}")
    public ResponseEntity<LancamentoNotaResponse> alterarNotaComoCoordenador(
            @PathVariable Long notaId,
            @Valid @RequestBody LancamentoNotaRequest request,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        // Coordenador alterando notas com registro de auditoria
        return ResponseEntity.ok(professorService.salvarNota(request, user.getId(), httpRequest.getRemoteAddr()));
    }

    @PostMapping("/validar-relatorio/{reportId}")
    public ResponseEntity<ReportHistory> validarRelatorio(
            @PathVariable Long reportId,
            @AuthenticationPrincipal CustomUserDetails user) {
        ReportHistory rep = reportHistoryRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado: " + reportId));
        rep.setStatusValidacao("VALIDADO_COORDENADOR");
        rep.setValidadoPor(user.getNome());
        rep.setDataValidacao(LocalDateTime.now());
        return ResponseEntity.ok(reportHistoryRepository.save(rep));
    }

    @GetMapping("/auditoria")
    public ResponseEntity<List<AuditLog>> listarAuditoria() {
        return ResponseEntity.ok(auditLogRepository.findTop50ByOrderByDataHoraDesc());
    }
}
