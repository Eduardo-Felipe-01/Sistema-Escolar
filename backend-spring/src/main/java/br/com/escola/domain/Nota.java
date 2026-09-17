package br.com.escola.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notas",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"matricula_id", "disciplina_id", "bimestre"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nota {

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
    private Integer bimestre; // 1, 2, 3, 4

    private Double nota1;
    private Double nota2;
    private Double trabalho;
    private Double recuperacao;

    private Double mediaBimestre;

    private String status; // APROVADO, RECUPERACAO, REPROVADO

    private String observacoes;

    @Builder.Default
    private LocalDateTime dataLancamento = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime dataAtualizacao = LocalDateTime.now();
}
