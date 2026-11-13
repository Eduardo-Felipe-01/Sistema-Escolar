package br.com.escola;

import br.com.escola.domain.Frequencia;
import br.com.escola.domain.Matricula;
import br.com.escola.domain.StatusMatricula;
import br.com.escola.domain.User;
import br.com.escola.dto.FrequenciaResumoAlunoDTO;
import br.com.escola.repository.FrequenciaRepository;
import br.com.escola.repository.MatriculaRepository;
import br.com.escola.service.FrequenciaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FrequenciaServiceTest {

    @Mock
    private FrequenciaRepository frequenciaRepository;

    @Mock
    private MatriculaRepository matriculaRepository;

    private FrequenciaService service;

    @BeforeEach
    void setUp() {
        service = new FrequenciaService(frequenciaRepository, matriculaRepository);
    }

    @Test
    @DisplayName("Deve reprovar automaticamente por falta quando presença for menor que 75% em 10 aulas")
    void deveReprovarAutomaticamentePorFalta() {
        User aluno = User.builder().id(5L).nome("Rodrigo Matos Ribeiro").build();
        Matricula matricula = Matricula.builder()
                .id(10L)
                .aluno(aluno)
                .numeroChamada(5)
                .status(StatusMatricula.CURSANDO)
                .build();

        when(frequenciaRepository.findByMatriculaIdAndDisciplinaId(10L, 1L)).thenReturn(List.of(
                Frequencia.builder().presencas(5).faltas(5).build()
        ));

        FrequenciaResumoAlunoDTO resumo = service.calcularResumo(matricula, 1L);
        assertEquals(50.0, resumo.getTaxaPresenca());
        assertTrue(resumo.getReprovadoPorFalta());

        service.verificarEAtualizarReprovacaoPorFalta(matricula, 1L);
        assertEquals(StatusMatricula.REPROVADO_FALTA, matricula.getStatus());
        verify(matriculaRepository, times(1)).save(matricula);
    }

    @Test
    @DisplayName("Deve manter situação regular quando presença for igual ou superior a 75%")
    void deveManterRegularComPresencaSuficiente() {
        User aluno = User.builder().id(1L).nome("Lucas Gabriel Oliveira").build();
        Matricula matricula = Matricula.builder()
                .id(11L)
                .aluno(aluno)
                .numeroChamada(1)
                .status(StatusMatricula.CURSANDO)
                .build();

        when(frequenciaRepository.findByMatriculaIdAndDisciplinaId(11L, 1L)).thenReturn(List.of(
                Frequencia.builder().presencas(8).faltas(2).build()
        ));

        FrequenciaResumoAlunoDTO resumo = service.calcularResumo(matricula, 1L);
        assertEquals(80.0, resumo.getTaxaPresenca());
        assertFalse(resumo.getReprovadoPorFalta());
    }

    @Test
    @DisplayName("Deve validar com sucesso quando presencas + faltas for igual a aulasNoDia")
    void deveValidarConsistenciaComSucesso() {
        assertDoesNotThrow(() -> service.validarConsistencia(2, 2, 0));
        assertDoesNotThrow(() -> service.validarConsistencia(2, 1, 1));
        assertDoesNotThrow(() -> service.validarConsistencia(1, 0, 1));
    }

    @Test
    @DisplayName("Deve lançar exceção quando soma de presenças e faltas divergir de aulasNoDia")
    void deveLancarExcecaoQuandoSomaDivergir() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.validarConsistencia(2, 2, 1));
        assertTrue(ex.getMessage().contains("Inconsistência na frequência"));
    }

    @Test
    @DisplayName("Deve lançar exceção quando presencas ou faltas forem negativas")
    void deveLancarExcecaoQuandoValoresNegativos() {
        assertThrows(IllegalArgumentException.class,
                () -> service.validarConsistencia(1, -1, 2));
    }
}
