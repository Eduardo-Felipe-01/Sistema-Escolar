package br.com.escola.repository.secondary;

import br.com.escola.domain.secondary.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop50ByOrderByDataHoraDesc();
    List<AuditLog> findByUsuarioIdOrderByDataHoraDesc(Long usuarioId);
    List<AuditLog> findByEntidadeAndEntidadeIdOrderByDataHoraDesc(String entidade, Long entidadeId);
}
