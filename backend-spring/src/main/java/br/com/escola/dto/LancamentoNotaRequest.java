package br.com.escola.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LancamentoNotaRequest {
    @NotNull
    private Long matriculaId;

    @NotNull
    private Long disciplinaId;

    @NotNull
    private Integer bimestre; // 1 a 4

    private Double nota1;
    private Double nota2;
    private Double trabalho;
    private Double recuperacao;
    private String observacoes;
}
