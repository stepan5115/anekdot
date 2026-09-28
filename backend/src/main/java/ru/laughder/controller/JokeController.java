package ru.laughder.controller;

import io.javalin.http.Context;
import ru.laughder.dto.JokePatchRequest;
import ru.laughder.dto.JokeRequest;
import ru.laughder.dto.ReactionRequest;
import ru.laughder.exception.ApiException;
import ru.laughder.service.JokeService;
import ru.laughder.service.AuthService;

import java.net.URI;
import java.util.List;

public class JokeController {
    private final JokeService service;
    private final AuthService auth;
    public JokeController(JokeService service, AuthService auth) { this.service = service; this.auth = auth; }

    public void list(Context ctx) { ctx.json(service.findAll()); }
    public void get(Context ctx) { ctx.json(service.findById(id(ctx))); }
    public void create(Context ctx) {
        requireAdmin(ctx);
        var joke = service.create(ctx.bodyAsClass(JokeRequest.class));
        ctx.status(201).header("Location", URI.create("/api/jokes/" + joke.id()).toString()).json(joke);
    }
    public void replace(Context ctx) { requireAdmin(ctx); ctx.json(service.replace(id(ctx), ctx.bodyAsClass(JokeRequest.class))); }
    public void patch(Context ctx) { requireAdmin(ctx); ctx.json(service.patch(id(ctx), ctx.bodyAsClass(JokePatchRequest.class))); }
    public void react(Context ctx) {
        ctx.json(service.react(id(ctx), ctx.bodyAsClass(ReactionRequest.class).reaction()));
    }
    public void undoReaction(Context ctx) {
        ctx.json(service.undoReaction(id(ctx), ctx.bodyAsClass(ReactionRequest.class).reaction()));
    }
    public void delete(Context ctx) { requireAdmin(ctx); service.delete(id(ctx)); ctx.status(204); }

    private void requireAdmin(Context ctx) { auth.verify(ctx.header("Authorization")); }

    private long id(Context ctx) {
        try {
            long id = Long.parseLong(ctx.pathParam("id"));
            if (id < 1) throw new NumberFormatException();
            return id;
        } catch (NumberFormatException e) {
            throw new ApiException(400, "Invalid identifier", List.of("id должен быть положительным целым числом"));
        }
    }
}
