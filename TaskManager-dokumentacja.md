# TaskManager — Dokumentacja projektu

## 1. Opis projektu

TaskManager to aplikacja webowa do zarządzania zadaniami osobistymi w formie tablicy Kanban. Użytkownik rejestruje się, loguje, a następnie tworzy, edytuje, usuwa i przesuwa zadania między kolumnami **To Do → In Progress → Done**. Każde zadanie ma priorytet (LOW/MEDIUM/HIGH), opis i termin wykonania.

Projekt jest monorepo składającym się z dwóch niezależnych aplikacji:

- **backend/** — REST API (NestJS + Prisma + PostgreSQL)
- **frontend/** — interfejs użytkownika (Next.js + React + Tailwind)

---

## 2. Stos technologiczny

### Backend
| Technologia | Rola |
|---|---|
| NestJS | Framework API, architektura modułowa (kontroler/serwis) |
| TypeScript | Typowanie statyczne |
| Prisma ORM | Mapowanie obiektowo-relacyjne, migracje |
| PostgreSQL | Baza danych |
| JWT (passport-jwt) | Autoryzacja bezstanowa |
| bcrypt | Hashowanie haseł |
| class-validator | Walidacja DTO |
| Jest / Supertest | Testy jednostkowe i e2e |

### Frontend
| Technologia | Rola |
|---|---|
| Next.js 16 (App Router) | Framework React, routing plikowy |
| React 19 | Komponenty UI |
| TypeScript | Typowanie współdzielone z backendem |
| Tailwind CSS 4 | Stylowanie |
| @hello-pangea/dnd | Drag-and-drop na tablicy Kanban |
| lucide-react | Ikony |
| Jest + Testing Library | Testy komponentów |

### Infrastruktura
| Technologia | Rola |
|---|---|
| Docker Compose | Kontener PostgreSQL do developmentu |

---

## 3. Architektura

Aplikacja działa w modelu klient–serwer, trzy warstwy:

```
┌─────────────────┐      REST/JWT       ┌──────────────────┐      Prisma      ┌──────────────┐
│   Frontend       │ ───────────────────▶│   Backend         │ ────────────────▶│  PostgreSQL   │
│   (Next.js)      │◀─────────────────── │   (NestJS)        │◀──────────────── │   (Docker)    │
└─────────────────┘      JSON           └──────────────────┘                  └──────────────┘
```

### Backend — moduły NestJS
- `AppModule` — korzeń aplikacji, importuje pozostałe moduły.
- `AuthModule` — rejestracja, logowanie, wydawanie i weryfikacja JWT (`AuthController`, `AuthService`, `JwtStrategy`).
- `TasksModule` — CRUD zadań, chroniony `JwtAuthGuard` (`TasksController`, `TasksService`).
- `PrismaModule` — singleton klienta Prisma używany przez serwisy.

Wzorzec w każdym module: **Controller → Service → Prisma**. Kontroler odbiera żądanie i waliduje DTO, serwis zawiera logikę biznesową, Prisma wykonuje zapytania do bazy.

Dekorator `@GetUser()` wyciąga zalogowanego użytkownika z `request.user` (ustawionego przez `JwtStrategy`), dzięki czemu każdy endpoint zadań automatycznie operuje tylko na danych właściciela.

### Frontend — struktura
- `app/login`, `app/register`, `app/page.tsx` (tablica Kanban) — routing plikowy Next.js.
- `services/api.ts` — jedna funkcja `apiFetch()` obsługująca wszystkie wywołania API: dokleja nagłówek `Authorization`, parsuje błędy.
- `components/KanbanBoard`, `TaskCard`, `TaskModal` — komponenty UI.
- Stan lokalny (`useState`/`useEffect`), token i dane użytkownika w `localStorage`.

---

## 4. Model danych (Prisma)

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String?
  tasks        Task[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Priority { LOW MEDIUM HIGH }
enum Status   { TO_DO IN_PROGRESS DONE }

model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  priority    Priority @default(MEDIUM)
  status      Status   @default(TO_DO)
  deadline    DateTime
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Relacja 1-N: jeden użytkownik ma wiele zadań. Usunięcie użytkownika kaskadowo usuwa jego zadania.

---

## 5. Autoryzacja — rejestracja i logowanie

**Rejestracja `POST /auth/register`**
1. Frontend wysyła `email`, `password`, `name`.
2. `RegisterDto` + globalny `ValidationPipe` waliduje dane wejściowe.
3. `AuthService` sprawdza unikalność e-maila (`ConflictException` jeśli zajęty).
4. Hasło haszowane przez `bcrypt` (10 rund) — nigdy nie zapisywane w czystej postaci.
5. Odpowiedź zwraca tylko `id`, `email`, `name` (bez hasła/hasha).

**Logowanie `POST /auth/login`**
1. Frontend wysyła `email` + `password`.
2. `AuthService` porównuje hasło z hashem (`bcrypt.compare`).
3. Po sukcesie generowany jest JWT (payload `{ sub: userId, email }`, ważny 1 dzień).
4. Token + dane użytkownika zapisywane w `localStorage` frontendu.

**Autoryzacja kolejnych żądań**
- Każde żądanie do `/tasks` zawiera nagłówek `Authorization: Bearer <token>`.
- `JwtStrategy` weryfikuje podpis i datę wygaśnięcia tokena, sprawdza istnienie użytkownika w bazie.
- Po weryfikacji dane trafiają do `request.user`, skąd korzysta z nich `@GetUser()`.
- Token wygasły/nieprawidłowy → `401 Unauthorized` → frontend czyści `localStorage` i przekierowuje na `/login`.

Mechanizm jest **stateless** — serwer nie przechowuje sesji.

---

## 6. API — endpointy

### Auth
| Metoda | Endpoint | Opis | Autoryzacja |
|---|---|---|---|
| POST | `/auth/register` | Rejestracja nowego użytkownika | Brak |
| POST | `/auth/login` | Logowanie, zwraca JWT | Brak |

### Tasks (wymaga `Authorization: Bearer <token>`)
| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/tasks` | Lista zadań zalogowanego użytkownika |
| GET | `/tasks/:id` | Szczegóły jednego zadania |
| POST | `/tasks` | Utworzenie nowego zadania |
| PATCH | `/tasks/:id` | Aktualizacja zadania (np. zmiana statusu przy drag-and-drop) |
| DELETE | `/tasks/:id` | Usunięcie zadania |

---

## 7. Uruchomienie projektu lokalnie

### Wymagania
- Node.js
- Docker + Docker Compose

### Kroki

```bash
# 1. Zainstaluj zależności (backend + frontend)
npm run install:all

# 2. Uruchom bazę danych PostgreSQL w Dockerze
npm run db:up

# 3. Skonfiguruj zmienne środowiskowe backendu (backend/.env)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/taskmanager"
JWT_SECRET="twój-sekretny-klucz"
PORT=3001

# 4. Wygeneruj klienta Prisma i zastosuj migracje
cd backend
npx prisma generate
npx prisma migrate dev

# 5. Uruchom backend (z roota repo)
npm run backend:start   # http://localhost:3001

# 6. Skonfiguruj zmienne środowiskowe frontendu (frontend/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001

# 7. Uruchom frontend (z roota repo)
npm run frontend:start  # http://localhost:3000
```

### Zatrzymanie bazy danych
```bash
npm run db:down
```

---

## 8. Testy

```bash
npm run backend:test    # testy jednostkowe NestJS (Jest)
npm run frontend:test   # testy komponentów React (Jest + Testing Library)
npm test                # uruchamia oba zestawy testów
```

Backend posiada też testy e2e: `npm run test:e2e` (w katalogu `backend/`), sprawdzające pełne żądania HTTP przez Supertest.

---

## 9. Struktura katalogów (skrót)

```
TaskManager/
├── docker-compose.yml
├── package.json                 # skrypty zarządzające całym monorepo
├── backend/
│   ├── src/
│   │   ├── auth/                 # rejestracja, logowanie, JWT
│   │   ├── tasks/                # CRUD zadań
│   │   ├── prisma/               # PrismaService/PrismaModule
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── prisma/schema.prisma
└── frontend/
    └── src/
        ├── app/                   # login, register, tablica Kanban
        ├── components/            # KanbanBoard, TaskCard, TaskModal
        ├── services/api.ts        # klient HTTP
        └── types/index.ts         # typy współdzielone z backendem
```

---

## 10. Bezpieczeństwo — uwagi

- `JWT_SECRET` ma domyślną wartość zapasową w kodzie (`'super-secret-jwt-key-replace-in-production'`) — **w środowisku produkcyjnym musi być nadpisana zmienną środowiskową**.
- CORS w `main.ts` jest otwarty na wszystkie originy (`origin: '*'`) — do zmiany na konkretną domenę przed wdrożeniem produkcyjnym.
- Hasła nigdy nie są przechowywane w czystej postaci — tylko hash bcrypt.
