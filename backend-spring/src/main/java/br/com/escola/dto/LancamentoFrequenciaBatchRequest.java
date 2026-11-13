package br.com.escola.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LancamentoFrequenciaBatchRequest {

    @NotNull(message = "Turma é obrigatória")
    private Long turmaId;

    @NotNull(message = "Disciplina é obrigatória")
    private Long disciplinaId;

    @NotNull(message = "Data é obrigatória")
    @PastOrPresent(message = "Data da frequência não pode ser futura")
    private LocalDate data;

    @NotNull(message = "Número de aulas no dia é obrigatório")
    @Min(value = 1, message = "Mínimo de 1 aula no dia")
    @Max(value = 10, message = "Máximo de 10 aulas no dia")
    @Builder.Default
    private Integer aulasNoDia = 1;

    @NotEmpty(message = "A lista de alunos para frequência não pode ser vazia")
    @Valid
    private List<LancamentoFrequenciaItemDTO> itens;
}
