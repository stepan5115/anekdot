package ru.laughder.service;

import ru.laughder.dto.JokePatchRequest;
import ru.laughder.dto.JokeRequest;
import ru.laughder.exception.ApiException;
import ru.laughder.model.Joke;
import ru.laughder.repository.JokeRepository;
import ru.laughder.validation.JokeValidator;

import java.util.List;

public class JokeService {
    private final JokeRepository repository;
    public JokeService(JokeRepository repository) { this.repository = repository; }

    public List<Joke> findAll() { return repository.findAll(); }
    public Joke findById(long id) { return repository.findById(id).orElseThrow(() -> notFound(id)); }
    public Joke create(JokeRequest request) { JokeValidator.validate(request); return repository.create(request); }
    public Joke replace(long id, JokeRequest request) {
        JokeValidator.validate(request);
        return repository.replace(id, request).orElseThrow(() -> notFound(id));
    }
    public Joke patch(long id, JokePatchRequest request) {
        JokeValidator.validate(request);
        return repository.patch(id, request).orElseThrow(() -> notFound(id));
    }
    public Joke react(long id, String reaction) {
        validateReaction(reaction);
        return repository.react(id, reaction.equals("LIKE")).orElseThrow(() -> notFound(id));
    }
    public Joke undoReaction(long id, String reaction) {
        validateReaction(reaction);
        return repository.undoReaction(id, reaction.equals("LIKE")).orElseThrow(() -> notFound(id));
    }
    private void validateReaction(String reaction) {
        if (reaction == null || !(reaction.equals("LIKE") || reaction.equals("DISLIKE"))) {
            throw new ApiException(400, "Validation failed", List.of("reaction должен быть LIKE или DISLIKE"));
        }
    }
    public void delete(long id) { if (!repository.delete(id)) throw notFound(id); }

    private ApiException notFound(long id) {
        return new ApiException(404, "Not found", List.of("Анекдот с id=" + id + " не найден"));
    }
}
