# Смехдер

React + Java 21/Javalin + PostgreSQL приложение с публичными анекдотами и
JWT-защищённой административной CRUD-страницей. В production весь трафик идёт
через nginx; API, frontend и БД наружу не публикуются.

## Авторизация

Чтение анекдотов и реакции публичны. `POST /api/jokes`, `PUT`, `PATCH` и
`DELETE /api/jokes/{id}` требуют `Authorization: Bearer <JWT>`. В интерфейсе
вход появляется при открытии «Анекдотеки». JWT хранится в `sessionStorage` и
исчезает при закрытии вкладки/браузера.

При старте API после Flyway-миграций проверяется таблица `admins`. Если в ней
нет ни одной записи, создаётся администратор из `ADMIN_LOGIN` и
`ADMIN_PASSWORD`; пароль сохраняется как BCrypt-хеш. При последующих стартах
аккаунт и пароль не перезаписываются. Поэтому изменение `ADMIN_PASSWORD` в
`.env` не меняет пароль уже созданного администратора.

Получить токен вручную:

```bash
curl -X POST https://YOUR_DOMAIN/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"login":"admin","password":"YOUR_PASSWORD"}'
```

## Первичное развёртывание на Ubuntu и DuckDNS

### 1. Домен и сеть

1. Создайте поддомен на <https://www.duckdns.org>, например
   `my-laughder.duckdns.org`, и направьте его на публичный IPv4 сервера.
2. Если сервер за роутером, пробросьте TCP 80 и 443 на сервер. В облаке также
   разрешите эти порты в security group.
3. Проверьте DNS: `dig +short my-laughder.duckdns.org` должен вернуть IP
   сервера. Let's Encrypt не выдаст сертификат, пока домен и порт 80 недоступны.

Для динамического IP можно обновлять DuckDNS раз в 5 минут (подставьте токен):

```bash
mkdir -p "$HOME/duckdns"
printf 'url="https://www.duckdns.org/update?domains=SUBDOMAIN&token=TOKEN&ip="\ncurl -fsS "$url"\n' > "$HOME/duckdns/update.sh"
chmod 700 "$HOME/duckdns/update.sh"
(crontab -l 2>/dev/null; echo '*/5 * * * * /home/USER/duckdns/update.sh >/dev/null 2>&1') | crontab -
```

### 2. Docker и firewall

Установите Docker Engine и Compose plugin по официальной инструкции Docker.
Затем откройте SSH до включения firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
docker --version
docker compose version
```

### 3. Проект и секреты

```bash
git clone git@github.com:stepan5115/anekdot.git
cd anekdot
cp .env.example .env
chmod 600 .env
openssl rand -base64 36   # значение для POSTGRES_PASSWORD
openssl rand -base64 48   # значение для JWT_SECRET
```

Отредактируйте `.env`: укажите домен без `https://`, email, случайные секреты,
логин и пароль администратора (минимум 12 символов). `.env` исключён из Git.
Не используйте значения из `.env.example`.

### 4. HTTP и первый сертификат

Сначала поднимите HTTP-конфигурацию nginx:

```bash
docker compose up -d --build
docker compose ps
curl http://YOUR_DOMAIN/health
```

Получите сертификат (Compose автоматически читает `DOMAIN` и email из `.env`,
но в shell их нужно загрузить явно):

```bash
set -a; . ./.env; set +a
docker compose --profile tools run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" --email "$LETSENCRYPT_EMAIL" \
  --agree-tos --no-eff-email
```

Теперь переключитесь на HTTPS-конфигурацию:

```bash
docker compose -f docker-compose.yml -f compose.https.yml up -d --force-recreate nginx
curl -I https://YOUR_DOMAIN
```

HTTP начнёт перенаправлять на HTTPS. Проверить API и логи:

```bash
docker compose -f docker-compose.yml -f compose.https.yml ps
docker compose -f docker-compose.yml -f compose.https.yml logs --tail=100 api nginx
```

### 5. Автопродление сертификата

Certbot безопасно ничего не меняет, если сертификат ещё не близок к истечению.
Добавьте root-cron (замените `/opt/anekdot` на абсолютный путь проекта):

```bash
sudo crontab -e
```

Строка для запуска ежедневно в 03:17 и перезагрузки nginx после проверки:

```cron
17 3 * * * cd /opt/anekdot && /usr/bin/docker compose -f docker-compose.yml -f compose.https.yml --profile tools run --rm certbot renew --webroot -w /var/www/certbot --quiet && /usr/bin/docker compose -f docker-compose.yml -f compose.https.yml exec -T nginx nginx -s reload >> /var/log/laughder-certbot.log 2>&1
```

Проверьте процедуру без выпуска сертификата:

```bash
docker compose -f docker-compose.yml -f compose.https.yml --profile tools run --rm certbot renew --dry-run --webroot -w /var/www/certbot
```

## Быстрое применение изменений на уже подготовленном сервере

Сертификаты, Docker volumes и `.env` сохраняются. Из каталога проекта:

```bash
git pull --ff-only
docker compose -f docker-compose.yml -f compose.https.yml up -d --build --remove-orphans
docker compose -f docker-compose.yml -f compose.https.yml ps
docker compose -f docker-compose.yml -f compose.https.yml logs --tail=100 api nginx
curl -fsS https://YOUR_DOMAIN/health
```

Flyway применит новые миграции при старте API. Не запускайте `docker compose
down -v`: ключ `-v` удалит базу и сертификаты. Перед рискованными обновлениями
сделайте backup:

```bash
set -a; . ./.env; set +a
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "backup-$(date +%F-%H%M).sql.gz"
```

## Локальная разработка

Создайте `.env` по примеру и укажите `DOMAIN=localhost`. Compose теперь также
работает только через nginx на <http://localhost>. Для hot reload запустите БД,
API и Vite отдельно, экспортировав обязательные переменные из `.env`:

```bash
docker compose up -d postgres
set -a; . ./.env; set +a; export CORS_ORIGIN=http://localhost:5173
cd backend && mvn package && java -jar target/laughder-api.jar
```

В другом терминале: `cd frontend && npm ci && npm run dev`. Vite проксирует API
на `localhost:8080`.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `DOMAIN` | DuckDNS-домен без протокола |
| `LETSENCRYPT_EMAIL` | email уведомлений Let's Encrypt |
| `POSTGRES_*` | имя БД, пользователь и пароль |
| `ADMIN_LOGIN`, `ADMIN_PASSWORD` | bootstrap первого администратора |
| `JWT_SECRET` | HMAC-ключ, не менее 32 байт |
| `JWT_TTL_HOURS` | срок JWT, по умолчанию 8 часов |

Секреты читаются процессами из окружения, которое Compose загружает из `.env`.
Само Java-приложение намеренно не парсит `.env`: это исключает случайное
попадание файла с секретами внутрь образа.
