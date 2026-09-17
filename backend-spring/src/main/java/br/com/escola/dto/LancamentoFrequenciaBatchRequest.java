package br.com.escola.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
    @NotNull
    private Long turmaId;

    @NotNull
    private Long disciplinaId;

    @NotNull
    private LocalDate data;

    @Builder.Default
    private Integer aulasNoDia = 1;

    @NotEmpty
    private List<LancamentoFrequenciaItemDTO> itens;
}
