package br.com.escola.service;

import br.com.escola.domain.User;
import br.com.escola.dto.AuthResponse;
import br.com.escola.dto.LoginRequest;
import br.com.escola.repository.UserRepository;
import br.com.escola.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse autenticar(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas: e-mail não encontrado"));

        if (!passwordEncoder.matches(req.getSenha(), user.getSenha())) {
            throw new BadCredentialsException("Credenciais inválidas: senha incorreta");
        }

        if (Boolean.FALSE.equals(user.getAtivo())) {
            throw new BadCredentialsException("Usuário inativo no sistema");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getNome(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .nome(user.getNome())
                .email(user.getEmail())
                .role(user.getRole().name())
                .matricula(user.getMatricula())
                .build();
    }
}
