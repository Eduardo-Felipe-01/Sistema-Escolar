package br.com.escola.service;

import br.com.escola.domain.Frequencia;
import br.com.escola.domain.Matricula;
import br.com.escola.domain.StatusMatricula;
import br.com.escola.dto.FrequenciaResumoAlunoDTO;
import br.com.escola.repository.FrequenciaRepository;
import br.com.escola.repository.MatriculaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FrequenciaService {

    public static final double FREQUENCIA_MINIMA_EXIGIDA = 75.0; // 75% exigido por lei (LDB)

    private final FrequenciaRepository frequenciaRepository;
    private final MatriculaRepository matriculaRepository;

    /**
     * Calcula o resumo de frequência de uma matrícula em determinada disciplina
     */
    public FrequenciaResumoAlunoDTO calcularResumo(Matricula matricula, Long disciplinaId) {
        List<Frequencia> registros = frequenciaRepository.findByMatriculaIdAndDisciplinaId(
                matricula.getId(), disciplinaId);

        int totalPresencas = 0;
        int totalFaltas = 0;

        for (Frequencia f : registros) {
            totalPresencas += f.getPresencas();
            totalFaltas += f.getFaltas();
        }

        int totalAulas = totalPresencas + totalFaltas;
        double taxaPresenca = 100.0;

        if (totalAulas > 0) {
            double taxa = ((double) totalPresencas / totalAulas) * 100.0;
            BigDecimal bd = BigDecimal.valueOf(taxa).setScale(2, RoundingMode.HALF_UP);
            taxaPresenca = bd.doubleValue();
        }

        boolean reprovadoPorFalta = totalAulas >= 8 && taxaPresenca < FREQUENCIA_MINIMA_EXIGIDA;

        return FrequenciaResumoAlunoDTO.builder()
                .matriculaId(matricula.getId())
                .alunoId(matricula.getAluno().getId())
                .alunoNome(matricula.getAluno().getNome())
                .numeroChamada(matricula.getNumeroChamada())
                .totalPresencas(totalPresencas)
                .totalFaltas(totalFaltas)
                .totalAulas(totalAulas)
                .taxaPresenca(taxaPresenca)
                .reprovadoPorFalta(reprovadoPorFalta)
                .build();
    }

    /**
     * Atualiza o status da matrícula se a taxa de faltas violar a exigência mínima (Reprovação Automática por Falta)
     */
    @Transactional("postgresTransactionManager")
    public void verificarEAtualizarReprovacaoPorFalta(Matricula matricula, Long disciplinaId) {
        FrequenciaResumoAlunoDTO resumo = calcularResumo(matricula, disciplinaId);
        if (Boolean.TRUE.equals(resumo.getReprovadoPorFalta())) {
            if (matricula.getStatus() != StatusMatricula.REPROVADO_FALTA) {
                log.warn("Aluno {} atingiu reprovação automática por falta! Taxa: {}%",
                        matricula.getAluno().getNome(), resumo.getTaxaPresenca());
                matricula.setStatus(StatusMatricula.REPROVADO_FALTA);
                matriculaRepository.save(matricula);
            }
        }
    }
}
