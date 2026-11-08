package br.com.escola.domain.secondary;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "report_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportHistory {

    @Id
    private String id;

    private Long usuarioId;

    private String usuarioNome;

    private String tipoRelatorio; // BOLETIM_TURMA, FREQUENCIA_DISCIPLINA, DESEMPENHO_ALUNO

    private String parametros;

    private Long alunoId;

    @Builder.Default
    private String statusValidacao = "PENDENTE"; // PENDENTE, VALIDADO_COORDENADOR

    private String validadoPor;

    private LocalDateTime dataValidacao;

    @Builder.Default
    private LocalDateTime dataEmissao = LocalDateTime.now();
}
