package br.com.escola.repository;

import br.com.escola.domain.TurmaDisciplinaProfessor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TurmaDisciplinaProfessorRepository extends JpaRepository<TurmaDisciplinaProfessor, Long> {
    List<TurmaDisciplinaProfessor> findByProfessorId(Long professorId);
    List<TurmaDisciplinaProfessor> findByTurmaId(Long turmaId);
    Optional<TurmaDisciplinaProfessor> findByTurmaIdAndDisciplinaIdAndProfessorId(Long turmaId, Long disciplinaId, Long professorId);
    boolean existsByTurmaIdAndDisciplinaIdAndProfessorId(Long turmaId, Long disciplinaId, Long professorId);
    boolean existsByProfessorId(Long professorId);
    boolean existsByTurmaId(Long turmaId);
    boolean existsByDisciplinaId(Long disciplinaId);
}
