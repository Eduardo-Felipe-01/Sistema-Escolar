package br.com.escola.repository;

import br.com.escola.domain.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {
    List<Nota> findByMatriculaId(Long matriculaId);
    List<Nota> findByMatriculaIdAndDisciplinaId(Long matriculaId, Long disciplinaId);
    Optional<Nota> findByMatriculaIdAndDisciplinaIdAndBimestre(Long matriculaId, Long disciplinaId, Integer bimestre);

    @Query("SELECT n FROM Nota n WHERE n.matricula.turma.id = :turmaId AND n.disciplina.id = :disciplinaId AND n.bimestre = :bimestre")
    List<Nota> findByTurmaAndDisciplinaAndBimestre(@Param("turmaId") Long turmaId,
                                                  @Param("disciplinaId") Long disciplinaId,
                                                  @Param("bimestre") Integer bimestre);

    @Query("SELECT n FROM Nota n WHERE n.matricula.turma.id = :turmaId AND n.disciplina.id = :disciplinaId")
    List<Nota> findByTurmaAndDisciplina(@Param("turmaId") Long turmaId,
                                        @Param("disciplinaId") Long disciplinaId);

    @Query("SELECT n FROM Nota n WHERE n.matricula.aluno.id = :alunoId")
    List<Nota> findByAlunoId(@Param("alunoId") Long alunoId);
}
