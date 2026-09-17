package br.com.escola.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LancamentoNotaResponse {
    private Long id;
    private Long matriculaId;
    private Long alunoId;
    private String alunoNome;
    private Integer numeroChamada;
    private Long disciplinaId;
    private String disciplinaNome;
    private Integer bimestre;
    private Double nota1;
    private Double nota2;
    private Double trabalho;
    private Double recuperacao;
    private Double mediaBimestre;
    private String status; // APROVADO, RECUPERACAO, REPROVADO
    private String observacoes;
}
