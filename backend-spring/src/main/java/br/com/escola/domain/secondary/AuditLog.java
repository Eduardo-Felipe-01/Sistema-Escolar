package br.com.escola.domain.secondary;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private String id;

    private Long usuarioId;

    private String usuarioNome;

    private String usuarioRole;

    private String acao; // LANCAMENTO_NOTA, ALTERACAO_NOTA, LANCAMENTO_FREQUENCIA, VALIDACAO_COORDENADOR, etc.

    private String entidade; // Nota, Frequencia, Usuario, Matricula

    private Long entidadeId;

    private String dadosAnteriores;

    private String dadosNovos;

    private String ipOrigem;

    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();
}
