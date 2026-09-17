package br.com.escola;

import br.com.escola.service.CalculoMediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculoMediaServiceTest {

    private CalculoMediaService service;

    @BeforeEach
    void setUp() {
        service = new CalculoMediaService();
    }

    @Test
    @DisplayName("Deve calcular média ponderada com aprovação direta (N1*0.4 + N2*0.4 + Trab*0.2)")
    void deveCalcularMediaComAprovacao() {
        // 8.0*0.4 = 3.2, 9.0*0.4 = 3.6, 10.0*0.2 = 2.0 => Total = 8.8
        CalculoMediaService.ResultadoMedia resultado = service.calcular(8.0, 9.0, 10.0, null);

        assertEquals(8.8, resultado.media());
        assertEquals("APROVADO", resultado.status());
    }

    @Test
    @DisplayName("Deve indicar recuperação quando média entre 4.0 e 5.9 sem nota de recuperação")
    void deveIndicarRecuperacao() {
        // 5.0*0.4 = 2.0, 5.0*0.4 = 2.0, 5.0*0.2 = 1.0 => Total = 5.0
        CalculoMediaService.ResultadoMedia resultado = service.calcular(5.0, 5.0, 5.0, null);

        assertEquals(5.0, resultado.media());
        assertEquals("RECUPERACAO", resultado.status());
    }

    @Test
    @DisplayName("Deve recalcular média com recuperação e aprovar se atingir 6.0")
    void deveAprovarAposRecuperacao() {
        // Base: 5.0. Com recuperação de 7.0 => (5.0 + 7.0) / 2 = 6.0
        CalculoMediaService.ResultadoMedia resultado = service.calcular(5.0, 5.0, 5.0, 7.0);

        assertEquals(6.0, resultado.media());
        assertEquals("APROVADO", resultado.status());
    }

    @Test
    @DisplayName("Deve indicar reprovação quando média final for menor que 4.0")
    void deveReprovarPorNota() {
        // 2.0*0.4 = 0.8, 3.0*0.4 = 1.2, 2.0*0.2 = 0.4 => Total = 2.4
        CalculoMediaService.ResultadoMedia resultado = service.calcular(2.0, 3.0, 2.0, null);

        assertEquals(2.4, resultado.media());
        assertEquals("REPROVADO", resultado.status());
    }
}
