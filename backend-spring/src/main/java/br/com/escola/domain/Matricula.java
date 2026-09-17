package br.com.escola.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "matriculas",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"turma_id", "aluno_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aluno_id", nullable = false)
    private User aluno;

    private Integer numeroChamada;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusMatricula status = StatusMatricula.CURSANDO;

    @Builder.Default
    private LocalDate dataMatricula = LocalDate.now();
}
