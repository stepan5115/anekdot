package ru.laughder.dto;

import java.time.LocalDate;

public record JokeRequest(
        String text,
        String category,
        String author,
        LocalDate publishedAt,
        Integer absurdityLevel,
        Boolean adult
) {}

