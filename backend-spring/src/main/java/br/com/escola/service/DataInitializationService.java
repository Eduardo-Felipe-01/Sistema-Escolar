package br.com.escola.service;

import br.com.escola.domain.*;
import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.domain.secondary.ReportHistory;
import br.com.escola.repository.*;
import br.com.escola.repository.secondary.AuditLogRepository;
import br.com.escola.repository.secondary.ReportHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final TurmaDisciplinaProfessorRepository tdpRepository;
    private final MatriculaRepository matriculaRepository;
    private final NotaRepository notaRepository;
    private final FrequenciaRepository frequenciaRepository;
    private final CronogramaRepository cronogramaRepository;
    private final AuditLogRepository auditLogRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final CalculoMediaService calculoMediaService;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            garantirDadosSecundariosMongo();
            log.info("Banco de dados já populado. Pulando carga inicial.");
            return;
        }

        log.info("Iniciando semeadura de dados do Sistema de Gestão Escolar...");

        String senhaPadrao = passwordEncoder.encode("senha123");

        // 1. Usuários
        User coordenador = userRepository.save(User.builder()
                .nome("Ana Paula Silva")
                .email("coord.ana@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_COORDENADOR)
                .telefone("(11) 98765-4321")
                .matricula("COORD-001")
                .build());

        User profCarlos = userRepository.save(User.builder()
                .nome("Prof. Carlos Alberto Mendes")
                .email("prof.carlos@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_PROFESSOR)
                .telefone("(11) 97654-3210")
                .matricula("PROF-101")
                .build());

        User profFernanda = userRepository.save(User.builder()
                .nome("Profa. Fernanda Rocha")
                .email("prof.fernanda@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_PROFESSOR)
                .telefone("(11) 96543-2109")
                .matricula("PROF-102")
                .build());

        User alunoLucas = userRepository.save(User.builder()
                .nome("Lucas Gabriel Oliveira")
                .email("aluno.lucas@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_ALUNO)
                .telefone("(11) 95432-1098")
                .matricula("2026-ALU-001")
                .build());

        User alunaBeatriz = userRepository.save(User.builder()
                .nome("Beatriz Helena Santos")
                .email("aluno.beatriz@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_ALUNO)
                .telefone("(11) 94321-0987")
                .matricula("2026-ALU-002")
                .build());

        User alunoGabriel = userRepository.save(User.builder()
                .nome("Gabriel Souza Lima")
                .email("aluno.gabriel@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_ALUNO)
                .telefone("(11) 93210-9876")
                .matricula("2026-ALU-003")
                .build());

        User alunaMariana = userRepository.save(User.builder()
                .nome("Mariana Costa Ferreira")
                .email("aluno.mariana@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_ALUNO)
                .telefone("(11) 92109-8765")
                .matricula("2026-ALU-004")
                .build());

        User alunoRodrigo = userRepository.save(User.builder()
                .nome("Rodrigo Matos Ribeiro")
                .email("aluno.rodrigo@escola.com")
                .senha(senhaPadrao)
                .role(Role.ROLE_ALUNO)
                .telefone("(11) 91098-7654")
                .matricula("2026-ALU-005")
                .build());

        // 2. Turmas
        Turma turma3A = turmaRepository.save(Turma.builder()
                .nome("3º Ano A - Ensino Médio")
                .anoLetivo(2026)
                .turno("MATUTINO")
                .sala("Sala 301")
                .build());

        Turma turma2B = turmaRepository.save(Turma.builder()
                .nome("2º Ano B - Ensino Médio")
                .anoLetivo(2026)
                .turno("VESPERTINO")
                .sala("Sala 204")
                .build());

        // 3. Disciplinas
        Disciplina mat = disciplinaRepository.save(Disciplina.builder()
                .nome("Matemática")
                .cargaHoraria(80)
                .codigo("MAT-101")
                .build());

        Disciplina fis = disciplinaRepository.save(Disciplina.builder()
                .nome("Física")
                .cargaHoraria(60)
                .codigo("FIS-101")
                .build());

        // 4. Vínculo Professor -> Turma/Disciplina
        tdpRepository.save(TurmaDisciplinaProfessor.builder()
                .turma(turma3A)
                .disciplina(mat)
                .professor(profCarlos)
                .build());

        tdpRepository.save(TurmaDisciplinaProfessor.builder()
                .turma(turma2B)
                .disciplina(fis)
                .professor(profCarlos)
                .build());

        tdpRepository.save(TurmaDisciplinaProfessor.builder()
                .turma(turma3A)
                .disciplina(fis)
                .professor(profFernanda)
                .build());

        // 5. Matrículas no 3º Ano A
        Matricula matLucas = matriculaRepository.save(Matricula.builder()
                .turma(turma3A).aluno(alunoLucas).numeroChamada(1).status(StatusMatricula.CURSANDO).build());

        Matricula matBeatriz = matriculaRepository.save(Matricula.builder()
                .turma(turma3A).aluno(alunaBeatriz).numeroChamada(2).status(StatusMatricula.CURSANDO).build());

        Matricula matGabriel = matriculaRepository.save(Matricula.builder()
                .turma(turma3A).aluno(alunoGabriel).numeroChamada(3).status(StatusMatricula.CURSANDO).build());

        Matricula matMariana = matriculaRepository.save(Matricula.builder()
                .turma(turma3A).aluno(alunaMariana).numeroChamada(4).status(StatusMatricula.CURSANDO).build());

        Matricula matRodrigo = matriculaRepository.save(Matricula.builder()
                .turma(turma3A).aluno(alunoRodrigo).numeroChamada(5).status(StatusMatricula.CURSANDO).build());

        // 6. Lançamento inicial de Notas (1º Bimestre)
        criarNota(matLucas, mat, 1, 9.0, 8.5, 9.5, null);
        criarNota(matBeatriz, mat, 1, 7.5, 7.0, 8.0, null);
        criarNota(matGabriel, mat, 1, 4.5, 5.0, 5.5, 6.5); // Fez recuperação
        criarNota(matMariana, mat, 1, 8.0, 8.5, 9.0, null);
        criarNota(matRodrigo, mat, 1, 3.5, 4.0, 4.0, null); // Reprovado por nota

        // 7. Frequências com caso de reprovação por falta automática
        // Rodrigo faltou muito (5 faltas em 10 aulas = 50% de presença < 75%)
        LocalDate base = LocalDate.now().minusDays(10);
        for (int i = 0; i < 10; i++) {
            LocalDate dia = base.plusDays(i);
            frequenciaRepository.save(Frequencia.builder().matricula(matLucas).disciplina(mat).data(dia).aulasNoDia(1).presencas(1).faltas(0).build());
            frequenciaRepository.save(Frequencia.builder().matricula(matBeatriz).disciplina(mat).data(dia).aulasNoDia(1).presencas(1).faltas(0).build());
            frequenciaRepository.save(Frequencia.builder().matricula(matGabriel).disciplina(mat).data(dia).aulasNoDia(1).presencas(1).faltas(0).build());
            frequenciaRepository.save(Frequencia.builder().matricula(matMariana).disciplina(mat).data(dia).aulasNoDia(1).presencas(1).faltas(0).build());

            // Rodrigo: faltou em dias alternados
            int faltou = (i % 2 == 0) ? 1 : 0;
            frequenciaRepository.save(Frequencia.builder().matricula(matRodrigo).disciplina(mat).data(dia).aulasNoDia(1).presencas(1 - faltou).faltas(faltou).build());
        }

        // Rodrigo atinge Reprovação por Falta
        matRodrigo.setStatus(StatusMatricula.REPROVADO_FALTA);
        matriculaRepository.save(matRodrigo);

        // 8. Cronograma escolar
        cronogramaRepository.save(Cronograma.builder()
                .titulo("Início do 1º Bimestre Letivo")
                .dataInicio(LocalDate.now().minusMonths(2))
                .dataFim(LocalDate.now().minusMonths(2).plusDays(5))
                .tipo("BIMESTRE")
                .descricao("Abertura do ano letivo de 2026")
                .build());

        cronogramaRepository.save(Cronograma.builder()
                .titulo("Período de Avaliações Bimestrais")
                .dataInicio(LocalDate.now().minusDays(5))
                .dataFim(LocalDate.now().plusDays(2))
                .tipo("AVALIACAO")
                .descricao("Provas de Matemática, Física e Química")
                .build());

        // 9. Histórico inicial no MongoDB
        popularDadosSecundariosMongo(coordenador, profCarlos, alunoLucas, alunoRodrigo, turma3A, mat);

        log.info("Carga inicial concluída com sucesso! Usuários de teste prontos.");
    }

    private void garantirDadosSecundariosMongo() {
        if (reportHistoryRepository.count() == 0) {
            User coordenador = userRepository.findByEmail("coord.ana@escola.com").orElse(null);
            User profCarlos = userRepository.findByEmail("prof.carlos@escola.com").orElse(null);
            User alunoLucas = userRepository.findByEmail("aluno.lucas@escola.com").orElse(null);
            User alunoRodrigo = userRepository.findByEmail("aluno.rodrigo@escola.com").orElse(null);
            Turma turma3A = turmaRepository.findAll().stream().findFirst().orElse(null);
            Disciplina mat = disciplinaRepository.findAll().stream().findFirst().orElse(null);
            if (coordenador != null && profCarlos != null && alunoLucas != null && alunoRodrigo != null && turma3A != null && mat != null) {
                auditLogRepository.deleteAll();
                popularDadosSecundariosMongo(coordenador, profCarlos, alunoLucas, alunoRodrigo, turma3A, mat);
            }
        }
    }

    private void popularDadosSecundariosMongo(User coordenador, User profCarlos, User alunoLucas, User alunoRodrigo, Turma turma3A, Disciplina mat) {
        auditLogRepository.save(AuditLog.builder()
                .usuarioId(profCarlos.getId())
                .usuarioNome(profCarlos.getNome())
                .usuarioRole(Role.ROLE_PROFESSOR.name())
                .alunoId(alunoLucas.getId())
                .acao("LANCAMENTO_NOTA")
                .entidade("Nota")
                .entidadeId(1L)
                .dadosAnteriores("{}")
                .dadosNovos("{\"aluno\":\"Lucas Gabriel Oliveira\",\"disciplina\":\"Matemática\",\"bimestre\":1,\"media\":8.9,\"status\":\"APROVADO\"}")
                .ipOrigem("127.0.0.1")
                .dataHora(LocalDateTime.now().minusDays(3))
                .build());

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(coordenador.getId())
                .usuarioNome(coordenador.getNome())
                .usuarioRole(Role.ROLE_COORDENADOR.name())
                .alunoId(alunoLucas.getId())
                .acao("VALIDACAO_COORDENADOR")
                .entidade("Nota")
                .entidadeId(1L)
                .dadosAnteriores("{}")
                .dadosNovos("{\"status\":\"Homologado pela Coordenação\",\"aluno\":\"Lucas Gabriel Oliveira\"}")
                .ipOrigem("127.0.0.1")
                .dataHora(LocalDateTime.now().minusDays(1))
                .build());

        auditLogRepository.save(AuditLog.builder()
                .usuarioId(profCarlos.getId())
                .usuarioNome(profCarlos.getNome())
                .usuarioRole(Role.ROLE_PROFESSOR.name())
                .alunoId(alunoRodrigo.getId())
                .acao("LANCAMENTO_FREQUENCIA")
                .entidade("Frequencia")
                .entidadeId(5L)
                .dadosAnteriores("{}")
                .dadosNovos("{\"aluno\":\"Rodrigo Matos Ribeiro\",\"disciplina\":\"Matemática\",\"taxaPresenca\":50.0,\"alerta\":\"REPROVADO_FALTA\"}")
                .ipOrigem("127.0.0.1")
                .dataHora(LocalDateTime.now().minusHours(12))
                .build());

        reportHistoryRepository.save(ReportHistory.builder()
                .usuarioId(profCarlos.getId())
                .usuarioNome(profCarlos.getNome())
                .tipoRelatorio("BOLETIM_TURMA")
                .turmaId(turma3A.getId())
                .turmaNome(turma3A.getNome())
                .disciplinaNome(mat.getNome())
                .alunoId(alunoLucas.getId())
                .parametros(String.format("turmaId=%d,disciplinaId=%d", turma3A.getId(), mat.getId()))
                .statusValidacao("VALIDADO_COORDENADOR")
                .validadoPor(coordenador.getNome())
                .dataValidacao(LocalDateTime.now().minusDays(1))
                .dataEmissao(LocalDateTime.now().minusDays(2))
                .build());

        reportHistoryRepository.save(ReportHistory.builder()
                .usuarioId(profCarlos.getId())
                .usuarioNome(profCarlos.getNome())
                .tipoRelatorio("FREQUENCIA_DISCIPLINA")
                .turmaId(turma3A.getId())
                .turmaNome(turma3A.getNome())
                .disciplinaNome(mat.getNome())
                .parametros(String.format("turmaId=%d,disciplinaId=%d", turma3A.getId(), mat.getId()))
                .statusValidacao("PENDENTE")
                .dataEmissao(LocalDateTime.now().minusHours(6))
                .build());
    }

    private void criarNota(Matricula mat, Disciplina disc, int bimestre, double n1, double n2, double trab, Double rec) {
        CalculoMediaService.ResultadoMedia res = calculoMediaService.calcular(n1, n2, trab, rec);
        notaRepository.save(Nota.builder()
                .matricula(mat)
                .disciplina(disc)
                .bimestre(bimestre)
                .nota1(n1)
                .nota2(n2)
                .trabalho(trab)
                .recuperacao(rec)
                .mediaBimestre(res.media())
                .status(res.status())
                .observacoes("Lançamento inicial consolidado")
                .build());
    }
}
