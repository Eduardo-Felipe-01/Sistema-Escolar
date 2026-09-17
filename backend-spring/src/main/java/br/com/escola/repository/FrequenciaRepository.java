package br.com.escola.repository;

import br.com.escola.domain.Frequencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FrequenciaRepository extends JpaRepository<Frequencia, Long> {
    List<Frequencia> findByMatriculaIdAndDisciplinaId(Long matriculaId, Long disciplinaId);
    Optional<Frequencia> findByMatriculaIdAndDisciplinaIdAndData(Long matriculaId, Long disciplinaId, LocalDate data);

    @Query("SELECT f FROM Frequencia f WHERE f.matricula.turma.id = :turmaId AND f.disciplina.id = :disciplinaId AND f.data = :data")
    List<Frequencia> findByTurmaAndDisciplinaAndData(@Param("turmaId") Long turmaId,
                                                    @Param("disciplinaId") Long disciplinaId,
                                                    @Param("data") LocalDate data);

    @Query("SELECT f FROM Frequencia f WHERE f.matricula.turma.id = :turmaId AND f.disciplina.id = :disciplinaId")
    List<Frequencia> findByTurmaAndDisciplina(@Param("turmaId") Long turmaId,
                                              @Param("disciplinaId") Long disciplinaId);

    @Query("SELECT f FROM Frequencia f WHERE f.matricula.aluno.id = :alunoId")
    List<Frequencia> findByAlunoId(@Param("alunoId") Long alunoId);
}
