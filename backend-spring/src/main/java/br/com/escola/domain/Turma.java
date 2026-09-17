package br.com.escola.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "turmas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Integer anoLetivo;

    @Column(nullable = false)
    private String turno;

    private String sala;
}
