package br.com.escola.service;

import br.com.escola.domain.*;
import br.com.escola.domain.secondary.AuditLog;
import br.com.escola.domain.secondary.ReportHistory;
import br.com.escola.dto.LancamentoNotaRequest;
import br.com.escola.dto.LancamentoNotaResponse;
import br.com.escola.repository.*;
import br.com.escola.repository.secondary.AuditLogRepository;
import br.com.escola.repository.secondary.ReportHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoordenadorService {

    private final UserRepository userRepository;
    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final MatriculaRepository matriculaRepository;
    private final TurmaDisciplinaProfessorRepository tdpRepository;
    private final NotaRepository notaRepository;
    private final CronogramaRepository cronogramaRepository;
    private final AuditLogRepository auditLogRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final ProfessorService professorService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    // --- ESTATÍSTICAS ---
    @Transactional(readOnly = true)
    public Map<String, Object> getEstatisticas() {
        long totalUsuarios = userRepository.count();
        long totalTurmas = turmaRepository.count();
        long totalDisciplinas = disciplinaRepository.count();
        List<User> professores = userRepository.findByRole(Role.ROLE_PROFESSOR);
        List<User> alunos = userRepository.findByRole(Role.ROLE_ALUNO);

        return Map.of(
                "totalUsuarios", totalUsuarios,
                "totalTurmas", totalTurmas,
                "totalDisciplinas", totalDisciplinas,
                "totalProfessores", professores.size(),
                "totalAlunos", alunos.size()
        );
    }

    // --- USUÁRIOS ---
    @Transactional(readOnly = true)
    public List<User> listarUsuarios() {
        return userRepository.findAll();
    }

    @Transactional("postgresTransactionManager")
    public User criarUsuario(User user, Long autorId, String autorNome, String ipOrigem) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("O e-mail do usuário é obrigatório.");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o e-mail: " + user.getEmail());
        }
        if (user.getMatricula() != null && !user.getMatricula().isBlank() && userRepository.existsByMatricula(user.getMatricula())) {
            throw new IllegalArgumentException("Já existe um usuário com o código de matrícula: " + user.getMatricula());
        }

        user.setSenha(passwordEncoder.encode(user.getSenha() != null && !user.getSenha().isBlank() ? user.getSenha() : "senha123"));
        user.setAtivo(true);
        if (user.getRole() == null) {
            user.setRole(Role.ROLE_ALUNO);
        }

        User salvo = userRepository.save(user);

        auditService.registrar(
                autorId,
                autorNome,
                Role.ROLE_COORDENADOR.name(),
                salvo.getRole() == Role.ROLE_ALUNO ? salvo.getId() : null,
                "CRIACAO_USUARIO",
                "Usuario",
                salvo.getId(),
                "{}",
                String.format("{\"nome\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}", salvo.getNome(), salvo.getEmail(), salvo.getRole()),
                ipOrigem
        );

        return salvo;
    }

    @Transactional("postgresTransactionManager")
    public User atualizarUsuario(Long id, Map<String, String> payload, Long autorId, String autorNome, String ipOrigem) {
        User existente = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        String dadosAnteriores = String.format("{\"nome\":\"%s\",\"role\":\"%s\",\"email\":\"%s\"}",
                existente.getNome(), existente.getRole(), existente.getEmail());

        if (payload.containsKey("nome") && payload.get("nome") != null && !payload.get("nome").isBlank()) {
            existente.setNome(payload.get("nome"));
        }
        if (payload.containsKey("email") && payload.get("email") != null && !payload.get("email").isBlank()) {
            String novoEmail = payload.get("email");
            if (!novoEmail.equalsIgnoreCase(existente.getEmail()) && userRepository.existsByEmail(novoEmail)) {
                throw new IllegalArgumentException("E-mail já utilizado por outro usuário: " + novoEmail);
            }
            existente.setEmail(novoEmail);
        }
        if (payload.containsKey("role") && payload.get("role") != null) {
            existente.setRole(Role.valueOf(payload.get("role")));
        }
        if (payload.containsKey("matricula")) {
            String novaMatricula = payload.get("matricula");
            if (novaMatricula != null && !novaMatricula.equals(existente.getMatricula()) && userRepository.existsByMatricula(novaMatricula)) {
                throw new IllegalArgumentException("Matrícula já utilizada: " + novaMatricula);
            }
            existente.setMatricula(novaMatricula);
        }
        if (payload.containsKey("telefone")) {
            existente.setTelefone(payload.get("telefone"));
        }
        if (payload.containsKey("ativo")) {
            existente.setAtivo(Boolean.parseBoolean(payload.get("ativo")));
        }

        User salvo = userRepository.save(existente);

        auditService.registrar(
                autorId,
                autorNome,
                Role.ROLE_COORDENADOR.name(),
                salvo.getRole() == Role.ROLE_ALUNO ? salvo.getId() : null,
                "ALTERACAO_PERFIL_USUARIO",
                "Usuario",
                salvo.getId(),
                dadosAnteriores,
                String.format("{\"nome\":\"%s\",\"role\":\"%s\",\"email\":\"%s\"}", salvo.getNome(), salvo.getRole(), salvo.getEmail()),
                ipOrigem
        );

        return salvo;
    }

    @Transactional("postgresTransactionManager")
    public void deletarUsuario(Long id, Long autorId, String autorNome, String ipOrigem) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));

        // Regra de integridade referencial: não deletar se tiver dependências
        if (user.getRole() == Role.ROLE_PROFESSOR && tdpRepository.existsByProfessorId(id)) {
            throw new IllegalStateException("Não é possível excluir o professor pois ele possui turmas e disciplinas vinculadas.");
        }

        if (user.getRole() == Role.ROLE_ALUNO && matriculaRepository.existsByAlunoId(id)) {
            throw new IllegalStateException("Não é possível excluir o aluno pois ele possui matrículas ativas em turmas.");
        }

        userRepository.deleteById(id);

        auditService.registrar(
                autorId,
                autorNome,
                Role.ROLE_COORDENADOR.name(),
                "EXCLUSAO_USUARIO",
                "Usuario",
                id,
                String.format("{\"nome\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}", user.getNome(), user.getEmail(), user.getRole()),
                "{}",
                ipOrigem
        );
    }

    // --- CRONOGRAMAS ---
    @Transactional(readOnly = true)
    public List<Cronograma> listarCronograma() {
        return cronogramaRepository.findAll();
    }

    @Transactional("postgresTransactionManager")
    public Cronograma criarCronograma(Cronograma cronograma, Long autorId, String autorNome, String ipOrigem) {
        if (cronograma.getDataFim() != null && cronograma.getDataInicio() != null && cronograma.getDataFim().isBefore(cronograma.getDataInicio())) {
            throw new IllegalArgumentException("A data de término do cronograma não pode ser anterior à data de início.");
        }

        Cronograma salvo = cronogramaRepository.save(cronograma);
        auditService.registrar(
                autorId,
                autorNome,
                Role.ROLE_COORDENADOR.name(),
                "CRIACAO_CRONOGRAMA",
                "Cronograma",
                salvo.getId(),
                "{}",
                String.format("{\"titulo\":\"%s\",\"tipo\":\"%s\",\"inicio\":\"%s\",\"fim\":\"%s\"}",
                        salvo.getTitulo(), salvo.getTipo(), salvo.getDataInicio(), salvo.getDataFim()),
                ipOrigem
        );
        return salvo;
    }

    @Transactional("postgresTransactionManager")
    public void deletarCronograma(Long id) {
        if (!cronogramaRepository.existsById(id)) {
            throw new IllegalArgumentException("Cronograma não encontrado: " + id);
        }
        cronogramaRepository.deleteById(id);
    }

    // --- TURMAS ---
    @Transactional(readOnly = true)
    public List<Turma> listarTurmas() {
        return turmaRepository.findAll();
    }

    @Transactional("postgresTransactionManager")
    public Turma criarTurma(Turma turma) {
        if (turma.getNome() == null || turma.getNome().isBlank()) {
            throw new IllegalArgumentException("O nome da turma é obrigatório.");
        }
        if (turma.getAnoLetivo() == null || turma.getAnoLetivo() < 2000) {
            throw new IllegalArgumentException("Ano letivo inválido.");
        }
        return turmaRepository.save(turma);
    }

    @Transactional("postgresTransactionManager")
    public Turma atualizarTurma(Long id, Turma turmaAtualizada) {
        Turma existente = turmaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Turma não encontrada: " + id));
        existente.setNome(turmaAtualizada.getNome());
        existente.setAnoLetivo(turmaAtualizada.getAnoLetivo());
        existente.setTurno(turmaAtualizada.getTurno());
        existente.setSala(turmaAtualizada.getSala());
        return turmaRepository.save(existente);
    }

    @Transactional("postgresTransactionManager")
    public void deletarTurma(Long turmaId) {
        if (matriculaRepository.countByTurmaId(turmaId) > 0) {
            throw new IllegalStateException("Não é possível excluir a turma pois existem alunos matriculados nela.");
        }
        if (tdpRepository.existsByTurmaId(turmaId)) {
            throw new IllegalStateException("Não é possível excluir a turma pois existem disciplinas e professores vinculados a ela.");
        }
        turmaRepository.deleteById(turmaId);
    }

    // --- DISCIPLINAS ---
    @Transactional(readOnly = true)
    public List<Disciplina> listarDisciplinas() {
        return disciplinaRepository.findAll();
    }

    @Transactional("postgresTransactionManager")
    public Disciplina criarDisciplina(Disciplina disciplina) {
        if (disciplina.getCodigo() != null && disciplinaRepository.findByCodigo(disciplina.getCodigo()).isPresent()) {
            throw new IllegalArgumentException("Já existe disciplina com o código informado: " + disciplina.getCodigo());
        }
        return disciplinaRepository.save(disciplina);
    }

    @Transactional("postgresTransactionManager")
    public Disciplina atualizarDisciplina(Long id, Disciplina dados) {
        Disciplina existente = disciplinaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada: " + id));
        existente.setNome(dados.getNome());
        existente.setCargaHoraria(dados.getCargaHoraria());
        existente.setCodigo(dados.getCodigo());
        return disciplinaRepository.save(existente);
    }

    @Transactional("postgresTransactionManager")
    public void deletarDisciplina(Long disciplinaId) {
        if (tdpRepository.existsByDisciplinaId(disciplinaId)) {
            throw new IllegalStateException("Não é possível excluir a disciplina pois ela está vinculada a turmas ativas.");
        }
        disciplinaRepository.deleteById(disciplinaId);
    }

    // --- MATRÍCULAS ---
    @Transactional("postgresTransactionManager")
    public Matricula matricularAluno(Long turmaId, Long alunoId, Integer numeroChamada) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new IllegalArgumentException("Turma não encontrada: " + turmaId));

        User aluno = userRepository.findById(alunoId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + alunoId));

        if (aluno.getRole() != Role.ROLE_ALUNO) {
            throw new IllegalArgumentException("Somente usuários com papel ALUNO podem ser matriculados.");
        }

        if (matriculaRepository.existsByTurmaIdAndAlunoId(turmaId, alunoId)) {
            throw new IllegalArgumentException("Este aluno já está matriculado nesta turma.");
        }

        int chamada = numeroChamada != null ? numeroChamada : (int) matriculaRepository.countByTurmaId(turmaId) + 1;

        Matricula matricula = Matricula.builder()
                .turma(turma)
                .aluno(aluno)
                .numeroChamada(chamada)
                .status(StatusMatricula.CURSANDO)
                .build();

        return matriculaRepository.save(matricula);
    }

    @Transactional("postgresTransactionManager")
    public void desmatricularAluno(Long matriculaId) {
        Matricula mat = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new IllegalArgumentException("Matrícula não encontrada: " + matriculaId));
        matriculaRepository.delete(mat);
    }

    // --- VÍNCULOS (TURMA x DISCIPLINA x PROFESSOR) ---
    @Transactional(readOnly = true)
    public List<TurmaDisciplinaProfessor> listarVinculos() {
        return tdpRepository.findAll();
    }

    @Transactional("postgresTransactionManager")
    public TurmaDisciplinaProfessor vincularProfessor(Long turmaId, Long disciplinaId, Long professorId) {
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new IllegalArgumentException("Turma não encontrada: " + turmaId));

        Disciplina disciplina = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada: " + disciplinaId));

        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new IllegalArgumentException("Professor não encontrado: " + professorId));

        if (professor.getRole() != Role.ROLE_PROFESSOR && professor.getRole() != Role.ROLE_COORDENADOR) {
            throw new IllegalArgumentException("O usuário selecionado deve ter perfil de PROFESSOR ou COORDENADOR.");
        }

        if (tdpRepository.existsByTurmaIdAndDisciplinaIdAndProfessorId(turmaId, disciplinaId, professorId)) {
            throw new IllegalArgumentException("Este vínculo entre professor, turma e disciplina já existe.");
        }

        TurmaDisciplinaProfessor vinculo = TurmaDisciplinaProfessor.builder()
                .turma(turma)
                .disciplina(disciplina)
                .professor(professor)
                .build();

        return tdpRepository.save(vinculo);
    }

    @Transactional("postgresTransactionManager")
    public void desvincularProfessor(Long vinculoId) {
        if (!tdpRepository.existsById(vinculoId)) {
            throw new IllegalArgumentException("Vínculo não encontrado: " + vinculoId);
        }
        tdpRepository.deleteById(vinculoId);
    }

    // --- ALTERAR NOTA (COORDENADOR) ---
    @Transactional("postgresTransactionManager")
    public LancamentoNotaResponse alterarNotaComoCoordenador(Long notaId, LancamentoNotaRequest req, Long coordenadorId, String ipOrigem) {
        Nota notaExistente = notaRepository.findById(notaId)
                .orElseThrow(() -> new IllegalArgumentException("Nota com ID " + notaId + " não encontrada no sistema."));

        // Garante que o payload aponta para a mesma matrícula e disciplina da nota
        req.setMatriculaId(notaExistente.getMatricula().getId());
        req.setDisciplinaId(notaExistente.getDisciplina().getId());
        if (req.getBimestre() == null) {
            req.setBimestre(notaExistente.getBimestre());
        }

        return professorService.salvarNota(req, coordenadorId, ipOrigem);
    }

    // --- RELATÓRIOS E AUDITORIA ---
    @Transactional(readOnly = true)
    public List<ReportHistory> listarRelatorios() {
        return reportHistoryRepository.findTop50ByOrderByDataEmissaoDesc();
    }

    @Transactional
    public ReportHistory validarRelatorio(String reportId, User coordenador, String ipOrigem) {
        ReportHistory rep = reportHistoryRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado: " + reportId));
        rep.setStatusValidacao("VALIDADO_COORDENADOR");
        rep.setValidadoPor(coordenador.getNome());
        rep.setDataValidacao(LocalDateTime.now());
        ReportHistory salvo = reportHistoryRepository.save(rep);

        auditService.registrar(
                coordenador.getId(),
                coordenador.getNome(),
                Role.ROLE_COORDENADOR.name(),
                rep.getAlunoId(),
                "VALIDACAO_COORDENADOR",
                "Relatorio",
                rep.getTurmaId() != null ? rep.getTurmaId() : 1L,
                "{\"status\":\"PENDENTE\"}",
                String.format("{\"tipo\":\"%s\",\"turma\":\"%s\",\"disciplina\":\"%s\",\"status\":\"VALIDADO_COORDENADOR\"}",
                        rep.getTipoRelatorio(),
                        rep.getTurmaNome() != null ? rep.getTurmaNome() : "-",
                        rep.getDisciplinaNome() != null ? rep.getDisciplinaNome() : "-"),
                ipOrigem
        );

        return salvo;
    }

    @Transactional(readOnly = true)
    public List<AuditLog> listarAuditoria() {
        return auditLogRepository.findTop50ByOrderByDataHoraDesc();
    }
}
