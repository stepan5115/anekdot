package ru.laughder.config;

import java.time.Duration;

public record SecurityConfig(String adminLogin, String adminPassword, String jwtSecret, Duration tokenTtl) {
    public static SecurityConfig fromEnvironment() {
        String login = required("ADMIN_LOGIN");
        String password = required("ADMIN_PASSWORD");
        String secret = required("JWT_SECRET");
        if (login.length() > 100) throw new IllegalStateException("ADMIN_LOGIN должен содержать не более 100 символов");
        int passwordBytes = password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
        if (passwordBytes < 12 || passwordBytes > 72) {
            throw new IllegalStateException("ADMIN_PASSWORD должен содержать от 12 до 72 байт");
        }
        if (secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET должен содержать не менее 32 байт");
        }
        long hours = Long.parseLong(System.getenv().getOrDefault("JWT_TTL_HOURS", "8"));
        if (hours < 1 || hours > 168) throw new IllegalStateException("JWT_TTL_HOURS должен быть от 1 до 168");
        return new SecurityConfig(login, password, secret, Duration.ofHours(hours));
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException("Не задана обязательная переменная " + name);
        return value;
    }
}
