package br.com.escola.repository;

import br.com.escola.domain.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    List<Matricula> findByTurmaIdOrderByNumeroChamadaAsc(Long turmaId);
    List<Matricula> findByAlunoId(Long alunoId);
    Optional<Matricula> findByTurmaIdAndAlunoId(Long turmaId, Long alunoId);
    long countByTurmaId(Long turmaId);
    boolean existsByAlunoId(Long alunoId);
    boolean existsByTurmaIdAndAlunoId(Long turmaId, Long alunoId);
}
