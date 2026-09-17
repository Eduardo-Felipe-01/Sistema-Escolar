package br.com.escola.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrequenciaResumoAlunoDTO {
    private Long matriculaId;
    private Long alunoId;
    private String alunoNome;
    private Integer numeroChamada;
    private Integer totalPresencas;
    private Integer totalFaltas;
    private Integer totalAulas;
    private Double taxaPresenca; // porcentagem (ex: 85.5%)
    private Boolean reprovadoPorFalta; // true se taxaPresenca < 75.0%
}
