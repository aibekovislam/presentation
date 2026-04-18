# Bolmo Frontend API Guide (Auth + Profile)

## 1) Быстрый доступ к Swagger

- UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`
- Базовый префикс API: `/v1`

Пример полного URL:
- `http://localhost:3000/v1/auth/login`

## 2) Авторизация запросов

Для защищенных endpoint используйте заголовок:

```http
Authorization: Bearer <accessToken>
```

Где взять `<accessToken>`:
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`

### Swagger Authorize (важно)

В Swagger (`/docs`) нажмите **Authorize** и вставьте в поле **только сам JWT access token**:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Не вставляйте префикс `Bearer ` вручную. Swagger добавляет его сам.

Если вставить `Bearer <token>`, в запрос уйдет `Bearer Bearer <token>` и вы получите `401`.

## 3) Рекомендуемый порядок интеграции

1. `POST /v1/auth/register`
2. `POST /v1/auth/verification/request`
3. `POST /v1/auth/verification/confirm`
4. `POST /v1/auth/login`
5. Работать с защищенными endpoint:
- `GET /v1/auth/me`
- `GET/PATCH /v1/users/me`
- `GET/PATCH/DELETE /v1/users/me/roommate-profile`
6. Когда `accessToken` истек:
- `POST /v1/auth/refresh`
7. При выходе:
- `POST /v1/auth/logout`

## 4) Auth endpoint'ы

### POST `/v1/auth/register`

Request:

```json
{
  "contact": "user@example.com",
  "password": "StrongPass123!",
  "termsAccepted": true,
  "marketingOptIn": false,
  "firstName": "Baimurat",
  "lastName": "User"
}
```

Response `201`:

```json
{
  "userId": "uuid",
  "contactType": "EMAIL",
  "contact": "user@example.com",
  "requiresVerification": true
}
```

### POST `/v1/auth/verification/request`

Request:

```json
{
  "contact": "user@example.com"
}
```

Response `200`:

```json
{
  "success": true,
  "expiresInSeconds": 600
}
```

Примечание:
- `debugCode` появляется только если включен `AUTH_EXPOSE_DEBUG_CODE=true`.

### POST `/v1/auth/verification/confirm`

Request:

```json
{
  "contact": "user@example.com",
  "code": "123456"
}
```

Response `200`:

```json
{
  "verified": true,
  "contactType": "EMAIL",
  "contact": "user@example.com"
}
```

### POST `/v1/auth/login`

Request:

```json
{
  "contact": "user@example.com",
  "password": "StrongPass123!"
}
```

Response `200`:

```json
{
  "userId": "uuid",
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "tokenType": "Bearer",
  "accessTokenTtl": "15m",
  "refreshTokenTtl": "30d"
}
```

### POST `/v1/auth/refresh`

Request:

```json
{
  "refreshToken": "jwt"
}
```

Response `200`: новый `accessToken` и новый `refreshToken`.

### POST `/v1/auth/logout`

Request:

```json
{
  "refreshToken": "jwt"
}
```

Response `200`:

```json
{
  "success": true
}
```

### GET `/v1/auth/me` (Bearer)

Response `200`:

```json
{
  "userId": "uuid",
  "firstName": "Baimurat",
  "lastName": "User",
  "avatarUrl": "https://cdn.example.com/avatar.png",
  "contact": "user@example.com",
  "contactType": "EMAIL",
  "contactVerified": true,
  "createdAt": "2026-03-19T00:00:00.000Z"
}
```

### POST `/v1/auth/password/change` (Bearer)

Request:

```json
{
  "currentPassword": "StrongPass123!",
  "newPassword": "NewStrongPass456!"
}
```

Response `200`:

```json
{
  "success": true,
  "forceRelogin": true,
  "revokedSessions": 2
}
```

Разница с reset:
- `password/change` используется, когда пользователь уже залогинен и знает текущий пароль.
- Требует `Authorization: Bearer <accessToken>`.

### POST `/v1/auth/password/reset/request`

Request:

```json
{
  "contact": "user@example.com"
}
```

Response `200`:

```json
{
  "success": true,
  "expiresInSeconds": 600
}
```

Смысл:
- это сценарий «забыл пароль» (пользователь еще не залогинен).
- сервер создает одноразовый код подтверждения для сброса пароля и отправляет его в канал контакта.

### POST `/v1/auth/password/reset/confirm`

Request:

```json
{
  "contact": "user@example.com",
  "code": "123456",
  "newPassword": "ResetStrongPass789!"
}
```

Response `200`:

```json
{
  "success": true,
  "forceRelogin": true,
  "revokedSessions": 2
}
```

Смысл:
- принимает `contact + code + newPassword`.
- после успеха обновляет пароль и инвалидирует активные сессии (force re-login).

## 5) Users/Profile endpoint'ы

### GET `/v1/users/me` (Bearer)

Response `200`:

```json
{
  "userId": "uuid",
  "firstName": "Baimurat",
  "lastName": "User",
  "avatarUrl": "https://cdn.example.com/avatar.png",
  "createdAt": "2026-03-19T00:00:00.000Z",
  "updatedAt": "2026-03-19T00:10:00.000Z"
}
```

### PATCH `/v1/users/me` (Bearer)

Request:

```json
{
  "firstName": "Baimurat",
  "lastName": "User",
  "avatarUrl": "https://cdn.example.com/avatar.png"
}
```

Response `200`: обновленный профиль пользователя.

### GET `/v1/users/me/roommate-profile` (Bearer)

Response `200`:

```json
{
  "exists": false,
  "profile": null
}
```

или

```json
{
  "exists": true,
  "profile": {
    "preferredGender": "ANY",
    "minAge": 22,
    "maxAge": 33,
    "smokingPolicy": "NO_SMOKING",
    "petsPolicy": "NEGOTIABLE",
    "guestsPolicy": "LIMITED",
    "notes": "Calm and clean flatmate preferred.",
    "createdAt": "2026-03-19T00:00:00.000Z",
    "updatedAt": "2026-03-19T00:10:00.000Z"
  }
}
```

Что такое `roommate-profile`:
- это профиль предпочтений пользователя к будущему соседу/сожителю.
- например: желаемый возрастной диапазон, отношение к курению/питомцам/гостям, дополнительные заметки.
- это не основной профиль аккаунта, а отдельный слой для matching/фильтрации в сценариях поиска сожителя.

### PATCH `/v1/users/me/roommate-profile` (Bearer)

Request (частичный апдейт):

```json
{
  "preferredGender": "ANY",
  "minAge": 22,
  "maxAge": 33,
  "smokingPolicy": "NO_SMOKING",
  "petsPolicy": "NEGOTIABLE",
  "guestsPolicy": "LIMITED",
  "notes": "Calm and clean flatmate preferred."
}
```

Response `200`: актуальное состояние roommate profile.

### DELETE `/v1/users/me/roommate-profile` (Bearer)

Response `200`:

```json
{
  "success": true,
  "deleted": true
}
```

Повторный `DELETE` тоже `200`:

```json
{
  "success": true,
  "deleted": false
}
```

## 6) Частые коды ошибок

- `400` — невалидный body/поля.
- `401` — отсутствует или невалидный токен.
- `409` — конфликт (например, контакт уже занят, или новый пароль совпадает со старым).
- `429` — rate limit (например, login brute-force или слишком частые code requests).

## 7) Практические рекомендации для фронта

- Храните `accessToken` in-memory, `refreshToken` в более защищенном хранилище.
- При `401` на защищенном endpoint пробуйте `refresh` один раз и повторяйте исходный запрос.
- Если `refresh` вернул `401`, делайте полный logout на фронте и редирект на login.
- Не опирайтесь на `debugCode` в production: это dev/test-флаг.

## 8) `.env` и `.env.example`

- `.env` — реальный локальный runtime-конфиг (секреты и значения для текущей машины).
- `.env.example` — шаблон (без рабочих секретов), чтобы показать какие переменные нужны проекту.
- Они могут отличаться: это нормально.
- Практика:
  - в `.env.example` держим полный список ключей и безопасные примеры;
  - в `.env` держим только нужное для запуска локально + реальные секреты;
  - `.env` в git не коммитим.



// BACKEND API НАХОДИТСЯ В http://localhost:3000/