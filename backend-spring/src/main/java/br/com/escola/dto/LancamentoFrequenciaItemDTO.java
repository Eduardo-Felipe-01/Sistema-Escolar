package br.com.escola.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LancamentoFrequenciaItemDTO {
    private Long matriculaId;
    private Integer presencas; // ex: 1 ou 2
    private Integer faltas;    // ex: 0 ou 1 ou 2
    private Boolean justificada;
    private String observacao;
}
