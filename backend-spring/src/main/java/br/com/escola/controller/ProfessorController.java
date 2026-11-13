package br.com.escola.controller;

import br.com.escola.domain.Frequencia;
import br.com.escola.dto.*;
import br.com.escola.security.CustomUserDetails;
import br.com.escola.service.ProfessorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professor")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PROFESSOR', 'COORDENADOR')")
@Validated
public class ProfessorController {

    private final ProfessorService professorService;

    @GetMapping("/turmas")
    public ResponseEntity<List<TurmaResumoDTO>> getMinhasTurmas(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(professorService.getTurmas(user.getId()));
    }

    @GetMapping("/turmas/{turmaId}/disciplinas/{disciplinaId}/bimestres/{bimestre}/notas")
    public ResponseEntity<List<LancamentoNotaResponse>> getNotasTurma(
            @PathVariable Long turmaId,
            @PathVariable Long disciplinaId,
            @PathVariable @Min(1) @Max(4) Integer bimestre,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(professorService.getNotasTurma(turmaId, disciplinaId, bimestre, user.getId()));
    }

    @PostMapping("/notas")
    public ResponseEntity<LancamentoNotaResponse> salvarNota(
            @Valid @RequestBody LancamentoNotaRequest request,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(professorService.salvarNota(request, user.getId(), clientIp));
    }

    @GetMapping("/turmas/{turmaId}/disciplinas/{disciplinaId}/frequencia-resumo")
    public ResponseEntity<List<FrequenciaResumoAlunoDTO>> getResumoFrequencia(
            @PathVariable Long turmaId,
            @PathVariable Long disciplinaId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(professorService.getResumoFrequenciaTurma(turmaId, disciplinaId, user.getId()));
    }

    @GetMapping("/turmas/{turmaId}/disciplinas/{disciplinaId}/frequencia-dia")
    public ResponseEntity<List<Frequencia>> getFrequenciaDia(
            @PathVariable Long turmaId,
            @PathVariable Long disciplinaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(professorService.getFrequenciasData(turmaId, disciplinaId, data, user.getId()));
    }

    @PostMapping("/frequencias")
    public ResponseEntity<Map<String, String>> salvarFrequencias(
            @Valid @RequestBody LancamentoFrequenciaBatchRequest request,
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        professorService.salvarFrequencias(request, user.getId(), clientIp);
        return ResponseEntity.ok(Map.of("message", "Frequências registradas com sucesso e salvas em auditoria"));
    }

    @GetMapping("/turmas/{turmaId}/disciplinas/{disciplinaId}/relatorio")
    public ResponseEntity<Map<String, Object>> gerarRelatorio(
            @PathVariable Long turmaId,
            @PathVariable Long disciplinaId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(professorService.gerarRelatorioTurma(turmaId, disciplinaId, user.getId()));
    }
}
