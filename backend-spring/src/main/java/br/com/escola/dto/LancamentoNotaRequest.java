package br.com.escola.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    @NotNull(message = "Matrícula é obrigatória")
    private Long matriculaId;

    @NotNull(message = "Disciplina é obrigatória")
    private Long disciplinaId;

    @NotNull(message = "Bimestre é obrigatório")
    @Min(value = 1, message = "Bimestre deve ser entre 1 e 4")
    @Max(value = 4, message = "Bimestre deve ser entre 1 e 4")
    private Integer bimestre; // 1 a 4

    @DecimalMin(value = "0.0", message = "Nota 1 não pode ser inferior a 0.0")
    @DecimalMax(value = "10.0", message = "Nota 1 não pode ser superior a 10.0")
    private Double nota1;

    @DecimalMin(value = "0.0", message = "Nota 2 não pode ser inferior a 0.0")
    @DecimalMax(value = "10.0", message = "Nota 2 não pode ser superior a 10.0")
    private Double nota2;

    @DecimalMin(value = "0.0", message = "Nota do trabalho não pode ser inferior a 0.0")
    @DecimalMax(value = "10.0", message = "Nota do trabalho não pode ser superior a 10.0")
    private Double trabalho;

    @DecimalMin(value = "0.0", message = "Nota de recuperação não pode ser inferior a 0.0")
    @DecimalMax(value = "10.0", message = "Nota de recuperação não pode ser superior a 10.0")
    private Double recuperacao;

    private String observacoes;
}
