package ru.laughder.controller;

import io.javalin.http.Context;
import ru.laughder.dto.LoginRequest;
import ru.laughder.service.AuthService;

public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service) { this.service = service; }
    public void login(Context ctx) { ctx.json(service.login(ctx.bodyAsClass(LoginRequest.class))); }
    public void verify(Context ctx) { service.verify(ctx.header("Authorization")); ctx.status(204); }
}
