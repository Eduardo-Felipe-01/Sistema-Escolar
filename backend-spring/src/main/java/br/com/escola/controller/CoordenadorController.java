package br.com.escola.controller;

import br.com.escola.domain.*;
import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.domain.secondary.ReportHistory;
import br.com.escola.dto.LancamentoNotaRequest;
import br.com.escola.dto.LancamentoNotaResponse;
import br.com.escola.security.CustomUserDetails;
import br.com.escola.service.CoordenadorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coordenador")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COORDENADOR')")
@Validated
public class CoordenadorController {

    private final CoordenadorService coordenadorService;

    @GetMapping("/estatisticas-gerais")
    public ResponseEntity<?> getEstatisticas() {
        return ResponseEntity.ok(coordenadorService.getEstatisticas());
    }

    // --- USUÁRIOS ---
    @GetMapping("/usuarios")
    public ResponseEntity<List<User>> listarUsuarios() {
        return ResponseEntity.ok(coordenadorService.listarUsuarios());
    }

    @PostMapping("/usuarios")
    public ResponseEntity<User> criarUsuario(
            @RequestBody User user,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(coordenadorService.criarUsuario(
                user, currentUser.getId(), currentUser.getNome(), httpRequest.getRemoteAddr()));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<User> atualizarUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(coordenadorService.atualizarUsuario(
                id, payload, currentUser.getId(), currentUser.getNome(), httpRequest.getRemoteAddr()));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deletarUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        coordenadorService.deletarUsuario(id, currentUser.getId(), currentUser.getNome(), httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    // --- CRONOGRAMAS ---
    @GetMapping("/cronograma")
    public ResponseEntity<List<Cronograma>> listarCronograma() {
        return ResponseEntity.ok(coordenadorService.listarCronograma());
    }

    @PostMapping("/cronograma")
    public ResponseEntity<Cronograma> criarCronograma(
            @RequestBody Cronograma cronograma,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(coordenadorService.criarCronograma(
                cronograma, currentUser.getId(), currentUser.getNome(), httpRequest.getRemoteAddr()));
    }

    @DeleteMapping("/cronograma/{id}")
    public ResponseEntity<Void> deletarCronograma(@PathVariable Long id) {
        coordenadorService.deletarCronograma(id);
        return ResponseEntity.noContent().build();
    }

    // --- TURMAS ---
    @GetMapping("/turmas")
    public ResponseEntity<List<Turma>> listarTurmas() {
        return ResponseEntity.ok(coordenadorService.listarTurmas());
    }

    @PostMapping("/turmas")
    public ResponseEntity<Turma> criarTurma(@RequestBody Turma turma) {
        return ResponseEntity.ok(coordenadorService.criarTurma(turma));
    }

    @PutMapping("/turmas/{id}")
    public ResponseEntity<Turma> atualizarTurma(@PathVariable Long id, @RequestBody Turma turma) {
        return ResponseEntity.ok(coordenadorService.atualizarTurma(id, turma));
    }

    @DeleteMapping("/turmas/{id}")
    public ResponseEntity<Void> deletarTurma(@PathVariable Long id) {
        coordenadorService.deletarTurma(id);
        return ResponseEntity.noContent().build();
    }

    // --- DISCIPLINAS ---
    @GetMapping("/disciplinas")
    public ResponseEntity<List<Disciplina>> listarDisciplinas() {
        return ResponseEntity.ok(coordenadorService.listarDisciplinas());
    }

    @PostMapping("/disciplinas")
    public ResponseEntity<Disciplina> criarDisciplina(@RequestBody Disciplina disciplina) {
        return ResponseEntity.ok(coordenadorService.criarDisciplina(disciplina));
    }

    @PutMapping("/disciplinas/{id}")
    public ResponseEntity<Disciplina> atualizarDisciplina(@PathVariable Long id, @RequestBody Disciplina disciplina) {
        return ResponseEntity.ok(coordenadorService.atualizarDisciplina(id, disciplina));
    }

    @DeleteMapping("/disciplinas/{id}")
    public ResponseEntity<Void> deletarDisciplina(@PathVariable Long id) {
        coordenadorService.deletarDisciplina(id);
        return ResponseEntity.noContent().build();
    }

    // --- MATRÍCULAS ---
    @PostMapping("/turmas/{turmaId}/matricular/{alunoId}")
    public ResponseEntity<Matricula> matricularAluno(
            @PathVariable Long turmaId,
            @PathVariable Long alunoId,
            @RequestParam(required = false) Integer numeroChamada) {
        return ResponseEntity.ok(coordenadorService.matricularAluno(turmaId, alunoId, numeroChamada));
    }

    @DeleteMapping("/matriculas/{matriculaId}")
    public ResponseEntity<Void> desmatricularAluno(@PathVariable Long matriculaId) {
        coordenadorService.desmatricularAluno(matriculaId);
        return ResponseEntity.noContent().build();
    }

    // --- VÍNCULOS ---
    @GetMapping("/vinculos")
    public ResponseEntity<List<TurmaDisciplinaProfessor>> listarVinculos() {
        return ResponseEntity.ok(coordenadorService.listarVinculos());
    }

    @PostMapping("/vinculos")
    public ResponseEntity<TurmaDisciplinaProfessor> vincularProfessor(
            @RequestParam Long turmaId,
            @RequestParam Long disciplinaId,
            @RequestParam Long professorId) {
        return ResponseEntity.ok(coordenadorService.vincularProfessor(turmaId, disciplinaId, professorId));
    }

    @DeleteMapping("/vinculos/{id}")
    public ResponseEntity<Void> desvincularProfessor(@PathVariable Long id) {
        coordenadorService.desvincularProfessor(id);
        return ResponseEntity.noContent().build();
    }

    // --- NOTAS ---
    @PutMapping("/notas/{notaId}")
    public ResponseEntity<LancamentoNotaResponse> alterarNotaComoCoordenador(
            @PathVariable Long notaId,
            @Valid @RequestBody LancamentoNotaRequest request,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(coordenadorService.alterarNotaComoCoordenador(
                notaId, request, user.getId(), httpRequest.getRemoteAddr()));
    }

    // --- RELATÓRIOS E AUDITORIA ---
    @GetMapping("/relatorios")
    public ResponseEntity<List<ReportHistory>> listarRelatorios() {
        return ResponseEntity.ok(coordenadorService.listarRelatorios());
    }

    @PostMapping("/validar-relatorio/{reportId}")
    public ResponseEntity<ReportHistory> validarRelatorio(
            @PathVariable String reportId,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        User coordUser = User.builder().id(user.getId()).nome(user.getNome()).build();
        return ResponseEntity.ok(coordenadorService.validarRelatorio(reportId, coordUser, httpRequest.getRemoteAddr()));
    }

    @GetMapping("/auditoria")
    public ResponseEntity<List<AuditLog>> listarAuditoria() {
        return ResponseEntity.ok(coordenadorService.listarAuditoria());
    }
}
