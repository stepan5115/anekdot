package ru.laughder.repository;

import org.jdbi.v3.core.Jdbi;
import ru.laughder.model.Admin;

import java.util.Optional;

public class AdminRepository {
    private final Jdbi jdbi;

    public AdminRepository(Jdbi jdbi) { this.jdbi = jdbi; }

    public boolean hasAdmin() {
        return jdbi.withHandle(handle -> handle.createQuery("SELECT EXISTS(SELECT 1 FROM admins)")
                .mapTo(boolean.class).one());
    }

    public void create(String login, String passwordHash) {
        jdbi.useHandle(handle -> handle.createUpdate("INSERT INTO admins(login, password_hash) VALUES (:login, :hash)")
                .bind("login", login).bind("hash", passwordHash).execute());
    }

    public Optional<Admin> findByLogin(String login) {
        return jdbi.withHandle(handle -> handle.createQuery("SELECT id, login, password_hash FROM admins WHERE login=:login")
                .bind("login", login)
                .map((rs, ctx) -> new Admin(rs.getLong("id"), rs.getString("login"), rs.getString("password_hash")))
                .findOne());
    }
}
