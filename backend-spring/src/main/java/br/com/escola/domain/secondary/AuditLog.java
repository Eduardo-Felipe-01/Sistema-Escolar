package br.com.escola.domain.secondary;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long usuarioId;

    private String usuarioNome;

    private String usuarioRole;

    @Column(nullable = false)
    private String acao; // LANCAMENTO_NOTA, ALTERACAO_NOTA, LANCAMENTO_FREQUENCIA, VALIDACAO_COORDENADOR, etc.

    @Column(nullable = false)
    private String entidade; // Nota, Frequencia, Usuario, Matricula

    private Long entidadeId;

    @Column(columnDefinition = "TEXT")
    private String dadosAnteriores;

    @Column(columnDefinition = "TEXT")
    private String dadosNovos;

    private String ipOrigem;

    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();
}
