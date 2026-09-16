# Смехдер

«Смехдер» — шуточный Tinder для текстовых анекдотов и небольшое полноценное
CRUD-приложение. Анекдоты можно свайпать, оценивать, искать, создавать,
редактировать и удалять. Все функции доступны без регистрации и авторизации.

Проект рассчитан на простой запуск на одном компьютере или внутри домашней и
учебной локальной сети.

## Стек

- React + TypeScript + Vite
- Java 21 + Javalin + Jackson
- JDBI + PostgreSQL
- Flyway
- OpenAPI 3 + Swagger UI
- Docker Compose

## Быстрый запуск

Понадобятся Docker Engine и Docker Compose.

```bash
git clone git@github.com:stepan5115/anekdot.git
cd anekdot
docker compose up --build -d
```

После запуска доступны:

- интерфейс: <http://localhost:5173>
- REST API: <http://localhost:8080/api/jokes>
- OpenAPI JSON: <http://localhost:8080/openapi.json>
- Swagger UI: раздел «API» в интерфейсе

При первом запуске Flyway создаёт таблицу и загружает 100 демонстрационных
анекдотов. PostgreSQL хранит данные в Docker volume `postgres_data`.

Посмотреть состояние и логи:

```bash
docker compose ps
docker compose logs -f
```

Остановить приложение:

```bash
docker compose down
```

Удалить приложение вместе с локальной базой данных:

```bash
docker compose down -v
```

## Запуск в локальной сети

Узнайте локальный IP компьютера, на котором запущен Docker:

```bash
hostname -I
```

На другом устройстве в той же сети откройте:

```text
http://IP-КОМПЬЮТЕРА:5173
```

Например: `http://192.168.1.42:5173`. Frontend сам проксирует запросы к API
внутри Docker Compose, поэтому менять адрес API в исходниках не требуется.
Если страница не открывается, разрешите входящие TCP-подключения к порту `5173`
в локальном файрволе. Порт `8080` нужен снаружи только для прямого обращения к
REST API.

## REST API

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/jokes` | Получить все анекдоты |
| GET | `/api/jokes/{id}` | Получить один анекдот |
| POST | `/api/jokes` | Создать анекдот |
| PUT | `/api/jokes/{id}` | Полностью обновить анекдот |
| PATCH | `/api/jokes/{id}` | Частично обновить анекдот |
| DELETE | `/api/jokes/{id}` | Удалить анекдот |
| POST | `/api/jokes/{id}/reaction` | Поставить `LIKE` или `DISLIKE` |

Пример создания:

```json
{
  "text": "Текст анекдота",
  "category": "IT",
  "author": "Народное",
  "publishedAt": "2026-09-01",
  "absurdityLevel": 7,
  "adult": false
}
```

## Локальная разработка без полной пересборки Compose

Сначала запустите PostgreSQL:

```bash
docker compose up -d postgres
```

API:

```bash
cd backend
mvn package
java -jar target/laughder-api.jar
```

Frontend в другом терминале:

```bash
cd frontend
npm ci
npm run dev
```

Vite в режиме разработки проксирует `/api` и `/openapi.json` на
`http://localhost:8080`. При необходимости адрес можно изменить переменной
`VITE_PROXY_TARGET`.

## Особенности

- все CRUD-операции открыты и не требуют учётной записи;
- тело запросов и ответов передаётся в JSON;
- серверная валидация возвращает `400` в формате `error` + `details`;
- неизвестные записи возвращают `404`, удаление — `204`;
- PostgreSQL sequence не переиспользует удалённые идентификаторы;
- реакции увеличиваются атомарным SQL-запросом;
- просмотренные в текущем браузере карточки сохраняются в `localStorage`;
- приложение не содержит production-деплоя, TLS, доменной конфигурации или
  внешних облачных зависимостей.
