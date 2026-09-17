package br.com.escola.domain.secondary;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long usuarioId;

    private String usuarioNome;

    @Column(nullable = false)
    private String tipoRelatorio; // BOLETIM_TURMA, FREQUENCIA_DISCIPLINA, DESEMPENHO_ALUNO

    @Column(columnDefinition = "TEXT")
    private String parametros;

    private Long alunoId;

    @Builder.Default
    private String statusValidacao = "PENDENTE"; // PENDENTE, VALIDADO_COORDENADOR

    private String validadoPor;

    private LocalDateTime dataValidacao;

    @Builder.Default
    private LocalDateTime dataEmissao = LocalDateTime.now();
}
