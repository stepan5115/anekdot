package ru.laughder.repository;

import org.jdbi.v3.core.Jdbi;
import ru.laughder.dto.JokePatchRequest;
import ru.laughder.dto.JokeRequest;
import ru.laughder.model.Joke;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class JokeRepository {
    private final Jdbi jdbi;

    public JokeRepository(Jdbi jdbi) { this.jdbi = jdbi; }

    public List<Joke> findAll() {
        return jdbi.withHandle(h -> h.createQuery("SELECT * FROM jokes ORDER BY created_at DESC")
                .map((rs, ctx) -> map(rs)).list());
    }

    public Optional<Joke> findById(long id) {
        return jdbi.withHandle(h -> h.createQuery("SELECT * FROM jokes WHERE id = :id")
                .bind("id", id).map((rs, ctx) -> map(rs)).findOne());
    }

    public Joke create(JokeRequest request) {
        long id = jdbi.withHandle(h -> h.createUpdate("""
                INSERT INTO jokes (text, category, author, published_at, absurdity_level, adult)
                VALUES (:text, :category, :author, :publishedAt, :level, :adult)
                """).bind("text", request.text().trim())
                .bind("category", request.category().trim())
                .bind("author", request.author().trim())
                .bind("publishedAt", request.publishedAt())
                .bind("level", request.absurdityLevel())
                .bind("adult", request.adult())
                .executeAndReturnGeneratedKeys("id").mapTo(long.class).one());
        return findById(id).orElseThrow();
    }

    public Optional<Joke> replace(long id, JokeRequest request) {
        int changed = jdbi.withHandle(h -> h.createUpdate("""
                UPDATE jokes SET text=:text, category=:category, author=:author,
                  published_at=:publishedAt, absurdity_level=:level, adult=:adult
                WHERE id=:id
                """).bind("id", id).bind("text", request.text().trim())
                .bind("category", request.category().trim()).bind("author", request.author().trim())
                .bind("publishedAt", request.publishedAt()).bind("level", request.absurdityLevel())
                .bind("adult", request.adult()).execute());
        return changed == 0 ? Optional.empty() : findById(id);
    }

    public Optional<Joke> patch(long id, JokePatchRequest request) {
        int changed = jdbi.withHandle(h -> h.createUpdate("""
                UPDATE jokes SET
                  text=COALESCE(:text, text), category=COALESCE(:category, category),
                  author=COALESCE(:author, author), published_at=COALESCE(:publishedAt, published_at),
                  absurdity_level=COALESCE(:level, absurdity_level), adult=COALESCE(:adult, adult)
                WHERE id=:id
                """).bind("id", id)
                .bind("text", trim(request.text())).bind("category", trim(request.category()))
                .bind("author", trim(request.author())).bind("publishedAt", request.publishedAt())
                .bind("level", request.absurdityLevel()).bind("adult", request.adult()).execute());
        return changed == 0 ? Optional.empty() : findById(id);
    }

    public Optional<Joke> react(long id, boolean like) {
        String column = like ? "likes" : "dislikes";
        int changed = jdbi.withHandle(h -> h.createUpdate(
                "UPDATE jokes SET " + column + " = " + column + " + 1 WHERE id=:id")
                .bind("id", id).execute());
        return changed == 0 ? Optional.empty() : findById(id);
    }

    public boolean delete(long id) {
        return jdbi.withHandle(h -> h.createUpdate("DELETE FROM jokes WHERE id=:id")
                .bind("id", id).execute()) > 0;
    }

    private static String trim(String value) { return value == null ? null : value.trim(); }

    private static Joke map(ResultSet rs) throws SQLException {
        return new Joke(rs.getLong("id"), rs.getString("text"), rs.getString("category"),
                rs.getString("author"), rs.getObject("published_at", java.time.LocalDate.class),
                rs.getInt("absurdity_level"), rs.getBoolean("adult"), rs.getInt("likes"),
                rs.getInt("dislikes"), rs.getObject("created_at", java.time.OffsetDateTime.class));
    }
}

