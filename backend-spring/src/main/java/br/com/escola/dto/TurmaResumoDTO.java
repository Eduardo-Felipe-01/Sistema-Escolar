package br.com.escola.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TurmaResumoDTO {
    private Long id;
    private String nome;
    private Integer anoLetivo;
    private String turno;
    private String sala;
    private Long disciplinaId;
    private String disciplinaNome;
    private Integer totalAlunos;
}
