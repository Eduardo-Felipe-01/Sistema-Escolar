package br.com.escola.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "cronogramas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cronograma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private LocalDate dataInicio;

    @Column(nullable = false)
    private LocalDate dataFim;

    @Column(nullable = false)
    private String tipo; // BIMESTRE, AVALIACAO, REUNIAO, FERIADO, CONSELHO

    private String descricao;
}
