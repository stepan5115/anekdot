package ru.laughder.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record Joke(
        long id,
        String text,
        String category,
        String author,
        LocalDate publishedAt,
        int absurdityLevel,
        boolean adult,
        int likes,
        int dislikes,
        OffsetDateTime createdAt
) {}

