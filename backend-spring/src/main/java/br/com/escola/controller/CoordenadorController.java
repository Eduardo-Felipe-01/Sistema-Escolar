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
import br.com.escola.service.AuditService;
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
    private final AuditService auditService;
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
    public ResponseEntity<User> criarUsuario(
            @RequestBody User user,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        user.setSenha(passwordEncoder.encode(user.getSenha() != null && !user.getSenha().isBlank() ? user.getSenha() : "senha123"));
        user.setAtivo(true);
        if (user.getRole() == null) {
            user.setRole(Role.ROLE_ALUNO);
        }
        User salvo = userRepository.save(user);

        auditService.registrar(
                currentUser.getId(),
                currentUser.getNome(),
                Role.ROLE_COORDENADOR.name(),
                salvo.getRole() == Role.ROLE_ALUNO ? salvo.getId() : null,
                "CRIACAO_USUARIO",
                "Usuario",
                salvo.getId(),
                "{}",
                String.format("{\"nome\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}", salvo.getNome(), salvo.getEmail(), salvo.getRole()),
                httpRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<User> atualizarUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        User existente = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        String dadosAnteriores = String.format("{\"nome\":\"%s\",\"role\":\"%s\"}", existente.getNome(), existente.getRole());

        if (payload.containsKey("nome") && payload.get("nome") != null && !payload.get("nome").isBlank()) {
            existente.setNome(payload.get("nome"));
        }
        if (payload.containsKey("email") && payload.get("email") != null && !payload.get("email").isBlank()) {
            existente.setEmail(payload.get("email"));
        }
        if (payload.containsKey("role") && payload.get("role") != null) {
            existente.setRole(Role.valueOf(payload.get("role")));
        }
        if (payload.containsKey("matricula")) {
            existente.setMatricula(payload.get("matricula"));
        }
        if (payload.containsKey("telefone")) {
            existente.setTelefone(payload.get("telefone"));
        }

        User salvo = userRepository.save(existente);

        auditService.registrar(
                currentUser.getId(),
                currentUser.getNome(),
                Role.ROLE_COORDENADOR.name(),
                salvo.getRole() == Role.ROLE_ALUNO ? salvo.getId() : null,
                "ALTERACAO_PERFIL_USUARIO",
                "Usuario",
                salvo.getId(),
                dadosAnteriores,
                String.format("{\"nome\":\"%s\",\"role\":\"%s\"}", salvo.getNome(), salvo.getRole()),
                httpRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(salvo);
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deletarUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        userRepository.findById(id).ifPresent(u -> {
            userRepository.deleteById(id);
            auditService.registrar(
                    currentUser.getId(),
                    currentUser.getNome(),
                    Role.ROLE_COORDENADOR.name(),
                    "EXCLUSAO_USUARIO",
                    "Usuario",
                    id,
                    String.format("{\"nome\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}", u.getNome(), u.getEmail(), u.getRole()),
                    "{}",
                    httpRequest.getRemoteAddr()
            );
        });
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cronograma")
    public ResponseEntity<List<Cronograma>> listarCronograma() {
        return ResponseEntity.ok(cronogramaRepository.findAll());
    }

    @PostMapping("/cronograma")
    public ResponseEntity<Cronograma> criarCronograma(
            @RequestBody Cronograma cronograma,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        Cronograma salvo = cronogramaRepository.save(cronograma);
        auditService.registrar(
                currentUser.getId(),
                currentUser.getNome(),
                Role.ROLE_COORDENADOR.name(),
                "CRIACAO_CRONOGRAMA",
                "Cronograma",
                salvo.getId(),
                "{}",
                String.format("{\"titulo\":\"%s\",\"tipo\":\"%s\",\"inicio\":\"%s\",\"fim\":\"%s\"}",
                        salvo.getTitulo(), salvo.getTipo(), salvo.getDataInicio(), salvo.getDataFim()),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(salvo);
    }

    @DeleteMapping("/cronograma/{id}")
    public ResponseEntity<Void> deletarCronograma(@PathVariable Long id) {
        cronogramaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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

    @GetMapping("/relatorios")
    public ResponseEntity<List<ReportHistory>> listarRelatorios() {
        return ResponseEntity.ok(reportHistoryRepository.findTop50ByOrderByDataEmissaoDesc());
    }

    @PostMapping("/validar-relatorio/{reportId}")
    public ResponseEntity<ReportHistory> validarRelatorio(
            @PathVariable String reportId,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        ReportHistory rep = reportHistoryRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado: " + reportId));
        rep.setStatusValidacao("VALIDADO_COORDENADOR");
        rep.setValidadoPor(user.getNome());
        rep.setDataValidacao(LocalDateTime.now());
        ReportHistory salvo = reportHistoryRepository.save(rep);

        auditService.registrar(
                user.getId(),
                user.getNome(),
                Role.ROLE_COORDENADOR.name(),
                rep.getAlunoId(),
                "VALIDACAO_COORDENADOR",
                "Relatorio",
                rep.getTurmaId() != null ? rep.getTurmaId() : 1L,
                "{\"status\":\"PENDENTE\"}",
                String.format("{\"tipo\":\"%s\",\"turma\":\"%s\",\"disciplina\":\"%s\",\"status\":\"VALIDADO_COORDENADOR\"}",
                        rep.getTipoRelatorio(),
                        rep.getTurmaNome() != null ? rep.getTurmaNome() : "-",
                        rep.getDisciplinaNome() != null ? rep.getDisciplinaNome() : "-"),
                httpRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(salvo);
    }

    @GetMapping("/auditoria")
    public ResponseEntity<List<AuditLog>> listarAuditoria() {
        return ResponseEntity.ok(auditLogRepository.findTop50ByOrderByDataHoraDesc());
    }
}
