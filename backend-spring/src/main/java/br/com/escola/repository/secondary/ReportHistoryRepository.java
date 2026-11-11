package br.com.escola.repository.secondary;

import br.com.escola.domain.secondary.ReportHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ReportHistoryRepository extends MongoRepository<ReportHistory, String> {
    List<ReportHistory> findByUsuarioIdOrderByDataEmissaoDesc(Long usuarioId);
    List<ReportHistory> findByAlunoIdOrderByDataEmissaoDesc(Long alunoId);
    List<ReportHistory> findByAlunoIdOrTurmaIdInOrderByDataEmissaoDesc(Long alunoId, Collection<Long> turmaIds);
    List<ReportHistory> findTop50ByOrderByDataEmissaoDesc();
}
