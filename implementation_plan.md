# Implementation Plan: Personal Task Manager Monorepo

We will build a personal task manager web application with a Next.js frontend, NestJS backend, and PostgreSQL database. Users can register, log in, and manage their tasks on a Kanban board using columns: "To Do", "In Progress", and "Done". All tasks have a title, description, priority (Low, Medium, High), and a deadline. The frontend and backend will communicate over a protected REST API (JWT auth).

## User Review Required

Please review the proposed technology choices, directory structure, database schema, and verification plan.

> [!IMPORTANT]
> The backend requires a running PostgreSQL instance. We will configure a `docker-compose.yml` file at the project root to launch it. You will need Docker installed and running on your system to start the database container.

## Open Questions

Before starting execution, please confirm:
1. **Drag-and-Drop library:** Do you have a preferred library for Kanban drag-and-drop interactions? We propose using `@hello-pangea/dnd` (a modern TypeScript-compatible fork of `react-beautiful-dnd`).
2. **Mocking data/Database migrations:** Should we pre-populate the database with some seed data for demonstration? We plan to add a Prisma seed script to ease initial testing.
3. **Strict deadline behavior:** Are deadlines simple dates, or should there be visual warnings when a task is overdue? We propose displaying a warning badge for overdue tasks.

## Proposed Changes

We will organize the project in a monorepo structure inside the root directory `c:\Work\Projects\TaskManager`.

### Root Configuration

We will place Docker and workspace configurations at the root level.

#### [NEW] [docker-compose.yml](file:///c:/Work/Projects/TaskManager/docker-compose.yml)
- Configures a PostgreSQL service matching database credentials.

#### [NEW] [package.json](file:///c:/Work/Projects/TaskManager/package.json)
- Configures workspace scripts to run commands in both `/backend` and `/frontend`.

---

### Backend Service (NestJS)

A NestJS application using Prisma ORM to interact with PostgreSQL.

#### [NEW] [backend/package.json](file:///c:/Work/Projects/TaskManager/backend/package.json)
- Configures dependencies: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `@prisma/client`, `bcrypt`, `class-validator`, `jest`.

#### [NEW] [backend/prisma/schema.prisma](file:///c:/Work/Projects/TaskManager/backend/prisma/schema.prisma)
- Defines relational schema:
  - `User`: `id`, `email`, `passwordHash`, `name`, `tasks` (relation).
  - `Task`: `id`, `title`, `description`, `priority` (Enum: `LOW`, `MEDIUM`, `HIGH`), `status` (Enum: `TO_DO`, `IN_PROGRESS`, `DONE`), `deadline` (DateTime), `userId` (foreign key), `createdAt`, `updatedAt`.

#### [NEW] [backend/src/auth/auth.module.ts](file:///c:/Work/Projects/TaskManager/backend/src/auth/auth.module.ts)
- Configures authentication modules (Passport, JWT strategy, User repository/Prisma).

#### [NEW] [backend/src/auth/auth.controller.ts](file:///c:/Work/Projects/TaskManager/backend/src/auth/auth.controller.ts)
- `POST /auth/register`: User registration.
- `POST /auth/login`: User login, returning a JWT token.

#### [NEW] [backend/src/auth/auth.service.ts](file:///c:/Work/Projects/TaskManager/backend/src/auth/auth.service.ts)
- Handles hashing of passwords with `bcrypt`, user registration checks, and JWT generation.

#### [NEW] [backend/src/auth/jwt.strategy.ts](file:///c:/Work/Projects/TaskManager/backend/src/auth/jwt.strategy.ts)
- Validates the incoming JWT bearer token and injects the user details into the request context.

#### [NEW] [backend/src/tasks/tasks.module.ts](file:///c:/Work/Projects/TaskManager/backend/src/tasks/tasks.module.ts)
- Groups task CRUD capabilities.

#### [NEW] [backend/src/tasks/tasks.controller.ts](file:///c:/Work/Projects/TaskManager/backend/src/tasks/tasks.controller.ts)
- Protected endpoints (requires `@UseGuards(JwtAuthGuard)`):
  - `GET /tasks`: Retrieve all tasks for the logged-in user.
  - `POST /tasks`: Create a new task.
  - `PATCH /tasks/:id`: Update task properties (title, description, priority, deadline, status).
  - `DELETE /tasks/:id`: Delete a task.

#### [NEW] [backend/src/tasks/tasks.service.ts](file:///c:/Work/Projects/TaskManager/backend/src/tasks/tasks.service.ts)
- Tasks business logic: ownership checks, filtering, data manipulation.

#### [NEW] [backend/src/prisma/prisma.service.ts](file:///c:/Work/Projects/TaskManager/backend/src/prisma/prisma.service.ts)
- Extends PrismaClient to manage connection states cleanly with NestJS.

---

### Frontend Service (Next.js)

A Next.js single-page-like application inside the App Router structure, styled using Tailwind CSS and interactive micro-animations.

#### [NEW] [frontend/package.json](file:///c:/Work/Projects/TaskManager/frontend/package.json)
- Configures frontend dependencies: `lucide-react` (icons), `tailwindcss`, `postcss`, `autoprefixer`, `@hello-pangea/dnd`.

#### [NEW] [frontend/src/app/layout.tsx](file:///c:/Work/Projects/TaskManager/frontend/src/app/layout.tsx)
- Set up general structure, loading fonts (e.g. Inter), and layout.

#### [NEW] [frontend/src/app/page.tsx](file:///c:/Work/Projects/TaskManager/frontend/src/app/page.tsx)
- Main landing page/dashboard. Checks for JWT; redirects to `/login` if unauthenticated, otherwise renders the Kanban Board.

#### [NEW] [frontend/src/app/login/page.tsx](file:///c:/Work/Projects/TaskManager/frontend/src/app/login/page.tsx)
- Login form with validation and styling. On success, stores token and redirects to main dashboard.

#### [NEW] [frontend/src/app/register/page.tsx](file:///c:/Work/Projects/TaskManager/frontend/src/app/register/page.tsx)
- Registration form with validation.

#### [NEW] [frontend/src/components/KanbanBoard.tsx](file:///c:/Work/Projects/TaskManager/frontend/src/components/KanbanBoard.tsx)
- Renders three columns: "To Do", "In Progress", and "Done".
- Implements drag and drop behavior updating tasks instantly on the backend.

#### [NEW] [frontend/src/components/TaskCard.tsx](file:///c:/Work/Projects/TaskManager/frontend/src/components/TaskCard.tsx)
- Individual card for each task. Visual indicators for priority: Red (High), Amber (Medium), Gray/Blue (Low). Shows deadline with relative time indicator.

#### [NEW] [frontend/src/components/TaskModal.tsx](file:///c:/Work/Projects/TaskManager/frontend/src/components/TaskModal.tsx)
- Dialog to add or edit task details (title, description, priority, deadline).

---

## Verification Plan

### Automated Tests

We will cover backend and frontend business logic with Jest unit tests.

- **Backend Unit Tests:**
  - `backend/src/auth/auth.service.spec.ts`: Tests password hashing, token generation, error states (e.g. duplicate user registration).
  - `backend/src/tasks/tasks.service.spec.ts`: Tests task CRUD, ensuring users can only read, update, or delete their own tasks.
  - Run command: `npm run test` inside the `/backend` folder.

- **Frontend Unit Tests:**
  - `frontend/src/components/KanbanBoard.spec.tsx` or logic helpers: Test state filtering, tasks transition between columns.
  - Run command: `npm run test` inside the `/frontend` folder.

### Manual Verification

1. Start database: `docker compose up -d` at the root.
2. Run Prisma migrations: `npx prisma db push` inside `backend/`.
3. Start backend: `npm run start:dev` inside `backend/`.
4. Start frontend: `npm run dev` inside `frontend/`.
5. Open browser at `http://localhost:3000` to verify registration, login, task creation, editing, status changes via drag-and-drop, and logout.
