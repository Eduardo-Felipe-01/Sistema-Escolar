package br.com.escola.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CalculoMediaService {

    public static final double MEDIA_MINIMA_APROVACAO = 6.0;
    public static final double MEDIA_MINIMA_RECUPERACAO = 4.0;

    /**
     * Calcula a média ponderada do bimestre:
     * N1 (peso 0.4), N2 (peso 0.4), Trabalho (peso 0.2).
     * Se houver nota de recuperação e a média for menor que 6.0,
     * recalcula a média considerando a nota de recuperação.
     */
    public ResultadoMedia calcular(Double n1, Double n2, Double trabalho, Double recuperacao) {
        double v1 = n1 != null ? n1 : 0.0;
        double v2 = n2 != null ? n2 : 0.0;
        double trab = trabalho != null ? trabalho : 0.0;

        // Média ponderada padrão
        double mediaBase = (v1 * 0.4) + (v2 * 0.4) + (trab * 0.2);

        double mediaFinal = mediaBase;

        // Se o aluno fez recuperação e precisava
        if (recuperacao != null && mediaBase < MEDIA_MINIMA_APROVACAO) {
            double mediaComRec = (mediaBase + recuperacao) / 2.0;
            mediaFinal = Math.max(mediaBase, mediaComRec);
        }

        // Arredondamento para 2 casas decimais
        BigDecimal bd = BigDecimal.valueOf(mediaFinal).setScale(2, RoundingMode.HALF_UP);
        mediaFinal = bd.doubleValue();

        String status;
        if (mediaFinal >= MEDIA_MINIMA_APROVACAO) {
            status = "APROVADO";
        } else if (mediaFinal >= MEDIA_MINIMA_RECUPERACAO) {
            status = "RECUPERACAO";
        } else {
            status = "REPROVADO";
        }

        return new ResultadoMedia(mediaFinal, status);
    }

    public record ResultadoMedia(Double media, String status) {}
}
