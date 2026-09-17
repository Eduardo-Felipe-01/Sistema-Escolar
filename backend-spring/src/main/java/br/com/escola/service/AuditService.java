package br.com.escola.service;

import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.repository.secondary.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final JdbcTemplate mysqlJdbcTemplate;

    public void registrar(Long usuarioId,
                          String usuarioNome,
                          String usuarioRole,
                          String acao,
                          String entidade,
                          Long entidadeId,
                          String dadosAnteriores,
                          String dadosNovos,
                          String ipOrigem) {
        try {
            String sql = "INSERT INTO audit_logs (usuarioId, usuarioNome, usuarioRole, acao, entidade, entidadeId, dadosAnteriores, dadosNovos, ipOrigem, dataHora) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            mysqlJdbcTemplate.update(
                    sql,
                    usuarioId,
                    usuarioNome,
                    usuarioRole,
                    acao,
                    entidade,
                    entidadeId,
                    dadosAnteriores,
                    dadosNovos,
                    ipOrigem != null ? ipOrigem : "127.0.0.1",
                    LocalDateTime.now()
            );
            log.info("Auditoria registrada no MySQL secundário com sucesso: [Ação: {}, Entidade: {}, Usuário: {}]", acao, entidade, usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar auditoria secundária no MySQL: {}", e.getMessage(), e);
        }
    }
}
