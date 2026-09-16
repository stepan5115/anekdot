package ru.laughder.exception;

import java.util.List;

public class ApiException extends RuntimeException {
    private final int status;
    private final String error;
    private final List<String> details;

    public ApiException(int status, String error, List<String> details) {
        super(details.isEmpty() ? error : details.getFirst());
        this.status = status;
        this.error = error;
        this.details = details;
    }

    public int status() { return status; }
    public String error() { return error; }
    public List<String> details() { return details; }
}

