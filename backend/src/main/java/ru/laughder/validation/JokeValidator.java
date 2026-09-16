package ru.laughder.validation;

import ru.laughder.dto.JokePatchRequest;
import ru.laughder.dto.JokeRequest;
import ru.laughder.exception.ApiException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class JokeValidator {
    private JokeValidator() {}

    public static void validate(JokeRequest request) {
        List<String> errors = new ArrayList<>();
        text(request.text(), errors, true);
        string(request.category(), "Категория", 50, errors, true);
        string(request.author(), "Автор", 100, errors, true);
        date(request.publishedAt(), errors, true);
        level(request.absurdityLevel(), errors, true);
        if (request.adult() == null) errors.add("Поле adult обязательно");
        throwIfInvalid(errors);
    }

    public static void validate(JokePatchRequest request) {
        List<String> errors = new ArrayList<>();
        if (request.text() != null) text(request.text(), errors, false);
        if (request.category() != null) string(request.category(), "Категория", 50, errors, false);
        if (request.author() != null) string(request.author(), "Автор", 100, errors, false);
        if (request.publishedAt() != null) date(request.publishedAt(), errors, false);
        if (request.absurdityLevel() != null) level(request.absurdityLevel(), errors, false);
        throwIfInvalid(errors);
    }

    private static void text(String value, List<String> errors, boolean required) {
        string(value, "Текст анекдота", 2000, errors, required);
    }

    private static void string(String value, String name, int max, List<String> errors, boolean required) {
        if (value == null) { if (required) errors.add(name + " обязателен"); return; }
        if (value.isBlank()) errors.add(name + " не может быть пустым");
        if (value.length() > max) errors.add(name + " не может быть длиннее " + max + " символов");
    }

    private static void date(LocalDate value, List<String> errors, boolean required) {
        if (value == null) { if (required) errors.add("Дата публикации обязательна"); return; }
        if (value.isAfter(LocalDate.now())) errors.add("Дата публикации не может быть в будущем");
    }

    private static void level(Integer value, List<String> errors, boolean required) {
        if (value == null) { if (required) errors.add("Уровень абсурда обязателен"); return; }
        if (value < 1 || value > 10) errors.add("Уровень абсурда должен быть от 1 до 10");
    }

    private static void throwIfInvalid(List<String> errors) {
        if (!errors.isEmpty()) throw new ApiException(400, "Validation failed", errors);
    }
}
