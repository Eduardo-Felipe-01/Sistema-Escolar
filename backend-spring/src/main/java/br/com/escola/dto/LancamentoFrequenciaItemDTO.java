package br.com.escola.dto;

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
public class LancamentoFrequenciaItemDTO {

    @NotNull(message = "Matrícula é obrigatória")
    private Long matriculaId;

    @NotNull(message = "Presenças é obrigatório")
    @Min(value = 0, message = "Presenças não podem ser negativas")
    private Integer presencas; // ex: 1 ou 2

    @NotNull(message = "Faltas é obrigatório")
    @Min(value = 0, message = "Faltas não podem ser negativas")
    private Integer faltas;    // ex: 0 ou 1 ou 2

    private Boolean justificada;

    private String observacao;
}
