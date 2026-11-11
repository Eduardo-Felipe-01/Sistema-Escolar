package br.com.escola.service;

import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.repository.secondary.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void registrar(Long usuarioId,
                          String usuarioNome,
                          String usuarioRole,
                          String acao,
                          String entidade,
                          Long entidadeId,
                          String dadosAnteriores,
                          String dadosNovos,
                          String ipOrigem) {
        registrar(usuarioId, usuarioNome, usuarioRole, null, acao, entidade, entidadeId, dadosAnteriores, dadosNovos, ipOrigem);
    }

    public void registrar(Long usuarioId,
                          String usuarioNome,
                          String usuarioRole,
                          Long alunoId,
                          String acao,
                          String entidade,
                          Long entidadeId,
                          String dadosAnteriores,
                          String dadosNovos,
                          String ipOrigem) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .usuarioId(usuarioId)
                    .usuarioNome(usuarioNome)
                    .usuarioRole(usuarioRole)
                    .alunoId(alunoId)
                    .acao(acao)
                    .entidade(entidade)
                    .entidadeId(entidadeId)
                    .dadosAnteriores(dadosAnteriores)
                    .dadosNovos(dadosNovos)
                    .ipOrigem(ipOrigem != null ? ipOrigem : "127.0.0.1")
                    .dataHora(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Auditoria registrada no MongoDB secundário com sucesso: [Ação: {}, Entidade: {}, Usuário: {}]", acao, entidade, usuarioNome);
        } catch (Exception e) {
            log.error("Erro ao registrar auditoria secundária no MongoDB: {}", e.getMessage(), e);
        }
    }
}
