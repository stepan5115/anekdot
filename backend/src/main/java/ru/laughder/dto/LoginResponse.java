package ru.laughder.dto;

public record LoginResponse(String token, String tokenType, long expiresIn) {}
