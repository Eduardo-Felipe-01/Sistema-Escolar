package br.com.escola.repository;

import br.com.escola.domain.Role;
import br.com.escola.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByMatricula(String matricula);
    List<User> findByRole(Role role);
    boolean existsByEmail(String email);
    boolean existsByMatricula(String matricula);
}
