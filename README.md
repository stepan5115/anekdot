# Смехдер

«Смехдер» — мемный Tinder для текстовых анекдотов и полноценное CRUD-приложение для лабораторной работы. В режиме свайпов анекдоту можно поставить «Ахах» или «Баян», а в «Анекдотеке» — создавать, просматривать, редактировать и удалять записи.

## Стек

- React + TypeScript + Vite
- Java 21 + Javalin + Jackson
- JDBI + PostgreSQL
- Flyway
- OpenAPI 3 + Swagger UI
- Docker Compose

## Быстрый запуск

Требуются Docker и Docker Compose.

```bash
docker compose up --build
```

Первая сборка скачивает базовые образы и зависимости и поэтому занимает больше
времени. Maven-кэш сохраняется BuildKit между сборками; в логе отображается
прогресс загрузки зависимостей.

После запуска доступны:

- интерфейс: http://localhost:5173
- REST API: http://localhost:8080/api/jokes
- OpenAPI JSON: http://localhost:8080/openapi.json
- Swagger UI: раздел «API» в интерфейсе

При первом запуске Flyway создаст таблицу и добавит демонстрационные анекдоты. Данные PostgreSQL сохраняются в Docker volume `postgres_data`.

Остановка:

```bash
docker compose down
```

Удалить контейнеры вместе с данными:

```bash
docker compose down -v
```

## REST API

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/jokes` | Все анекдоты |
| GET | `/api/jokes/{id}` | Один анекдот |
| POST | `/api/jokes` | Создать |
| PUT | `/api/jokes/{id}` | Полностью обновить |
| PATCH | `/api/jokes/{id}` | Частично обновить |
| DELETE | `/api/jokes/{id}` | Удалить |
| POST | `/api/jokes/{id}/reaction` | Поставить `LIKE` или `DISLIKE` |

Пример создания:

```json
{
  "text": "Текст анекдота",
  "category": "IT",
  "author": "Народное",
  "publishedAt": "2025-09-01",
  "absurdityLevel": 7,
  "adult": false
}
```

## Локальная разработка

Для API нужна PostgreSQL с базой и пользователем `laughder` и паролем `laughder`. Параметры можно изменить переменными `DB_URL`, `DB_USER`, `DB_PASSWORD`, `PORT`, `CORS_ORIGIN`.

```bash
cd backend
mvn package
java -jar target/laughder-api.jar
```

В другом терминале:

```bash
cd frontend
npm install
npm run dev
```

Адрес API для клиента задаётся переменной `VITE_API_URL`.

## Особенности реализации

- тело всех запросов и ответов — JSON;
- серверная валидация возвращает `400` в едином формате `error` + `details`;
- неизвестные записи возвращают `404`;
- удаление возвращает `204`;
- PostgreSQL sequence не переиспользует удалённые идентификаторы;
- реакции увеличиваются атомарным SQL-запросом;
- клиент обновляет состояние без перезагрузки страницы;
- просмотренные в текущем браузере карточки сохраняются в `localStorage`.
