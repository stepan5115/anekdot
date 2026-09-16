package ru.laughder.config;

import org.flywaydb.core.Flyway;
import org.jdbi.v3.core.Jdbi;

public record DatabaseConfig(String url, String user, String password) {
    public static DatabaseConfig fromEnvironment() {
        return new DatabaseConfig(env("DB_URL", "jdbc:postgresql://localhost:5432/laughder"),
                env("DB_USER", "laughder"), env("DB_PASSWORD", "laughder"));
    }
    public void migrate() { Flyway.configure().dataSource(url, user, password).load().migrate(); }
    public Jdbi jdbi() { return Jdbi.create(url, user, password); }
    private static String env(String name, String fallback) {
        String value = System.getenv(name); return value == null || value.isBlank() ? fallback : value;
    }
}

