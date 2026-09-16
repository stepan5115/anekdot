package ru.laughder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import ru.laughder.config.DatabaseConfig;
import ru.laughder.controller.JokeController;
import ru.laughder.dto.ErrorResponse;
import ru.laughder.exception.ApiException;
import ru.laughder.repository.JokeRepository;
import ru.laughder.service.JokeService;

import java.util.List;

public final class Application {
    private Application() {}

    public static void main(String[] args) {
        DatabaseConfig database = DatabaseConfig.fromEnvironment();
        database.migrate();
        JokeController jokes = new JokeController(new JokeService(new JokeRepository(database.jdbi())));
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        String origin = System.getenv().getOrDefault("CORS_ORIGIN", "http://localhost:5173");

        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson(mapper, false));
            config.bundledPlugins.enableCors(cors -> cors.addRule(rule -> rule.allowHost(origin)));
            config.routes.get("/health", ctx -> ctx.json(java.util.Map.of("status", "ok")));
            config.routes.get("/openapi.json", ctx -> ctx.contentType("application/json")
                    .result(Application.class.getResourceAsStream("/openapi.json")));
            config.routes.get("/api/jokes", jokes::list);
            config.routes.get("/api/jokes/{id}", jokes::get);
            config.routes.post("/api/jokes", jokes::create);
            config.routes.put("/api/jokes/{id}", jokes::replace);
            config.routes.patch("/api/jokes/{id}", jokes::patch);
            config.routes.post("/api/jokes/{id}/reaction", jokes::react);
            config.routes.delete("/api/jokes/{id}", jokes::delete);
            config.routes.exception(ApiException.class, (e, ctx) -> ctx.status(e.status())
                    .json(new ErrorResponse(e.error(), e.details())));
            config.routes.exception(JsonProcessingException.class, (e, ctx) -> ctx.status(400)
                    .json(new ErrorResponse("Invalid JSON", List.of("Тело запроса содержит некорректный JSON"))));
            config.routes.exception(Exception.class, (e, ctx) -> {
                e.printStackTrace();
                ctx.status(500).json(new ErrorResponse("Internal server error", List.of("Внутренняя ошибка сервера")));
            });
        });
        app.start(port);
    }
}
