package br.com.escola.repository;

import br.com.escola.domain.Cronograma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CronogramaRepository extends JpaRepository<Cronograma, Long> {
    List<Cronograma> findByDataInicioBetweenOrderByDataInicioAsc(LocalDate start, LocalDate end);
}
