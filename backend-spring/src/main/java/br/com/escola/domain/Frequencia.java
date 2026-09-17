package br.com.escola.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "frequencias",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"matricula_id", "disciplina_id", "data"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Frequencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "disciplina_id", nullable = false)
    private Disciplina disciplina;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    @Builder.Default
    private Integer aulasNoDia = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer presencas = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer faltas = 0;

    @Builder.Default
    private Boolean justificada = false;

    private String observacao;

    @Builder.Default
    private LocalDateTime dataRegistro = LocalDateTime.now();
}
