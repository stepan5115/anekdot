package ru.laughder.service;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.mindrot.jbcrypt.BCrypt;
import ru.laughder.config.SecurityConfig;
import ru.laughder.dto.LoginRequest;
import ru.laughder.dto.LoginResponse;
import ru.laughder.exception.ApiException;
import ru.laughder.repository.AdminRepository;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

public class AuthService {
    private final AdminRepository repository;
    private final SecurityConfig config;
    private final SecretKey key;

    public AuthService(AdminRepository repository, SecurityConfig config) {
        this.repository = repository;
        this.config = config;
        this.key = Keys.hmacShaKeyFor(config.jwtSecret().getBytes(StandardCharsets.UTF_8));
    }

    public void bootstrapAdmin() {
        if (!repository.hasAdmin()) {
            repository.create(config.adminLogin(), BCrypt.hashpw(config.adminPassword(), BCrypt.gensalt(12)));
            System.out.println("Создан первоначальный администратор: " + config.adminLogin());
        }
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.login() == null || request.password() == null
                || request.login().isBlank() || request.login().length() > 100
                || request.password().getBytes(StandardCharsets.UTF_8).length > 72) unauthorized();
        var admin = repository.findByLogin(request.login().trim()).orElseGet(() -> {
            BCrypt.hashpw(request.password(), BCrypt.gensalt(4));
            return null;
        });
        if (admin == null || !BCrypt.checkpw(request.password(), admin.passwordHash())) unauthorized();
        Instant now = Instant.now();
        Instant expires = now.plus(config.tokenTtl());
        String token = Jwts.builder().issuer("laughder").subject(admin.login()).claim("role", "ADMIN")
                .issuedAt(Date.from(now)).expiration(Date.from(expires)).signWith(key).compact();
        return new LoginResponse(token, "Bearer", config.tokenTtl().toSeconds());
    }

    public void verify(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) unauthorized();
        try {
            var claims = Jwts.parser().requireIssuer("laughder").verifyWith(key).build()
                    .parseSignedClaims(authorization.substring(7)).getPayload();
            if (!"ADMIN".equals(claims.get("role", String.class))) unauthorized();
        } catch (JwtException | IllegalArgumentException e) {
            unauthorized();
        }
    }

    private static void unauthorized() {
        throw new ApiException(401, "Unauthorized", List.of("Неверные учётные данные или JWT-токен"));
    }
}
