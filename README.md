# TaskManager — Personal Kanban Board (Monorepo)

TaskManager is a modern, premium web application designed for personal task management in a Kanban board format. Users can register, log in, and manage their tasks by dragging and dropping cards across columns: **To Do**, **In Progress**, and **Done**. Each task supports priority levels (LOW, MEDIUM, HIGH), descriptions, and deadlines.

The project is structured as a **monorepo** containing two main components:
- **`backend/`** — A secure REST API built with NestJS, Prisma, and PostgreSQL.
- **`frontend/`** — A responsive, high-performance user interface built with Next.js 16, React 19, and Tailwind CSS 4.

---

## 🚀 Key Features

* **Kanban Board Layout:** Interactive Drag-and-Drop board columns via `@hello-pangea/dnd` for smooth task transitions.
* **Full CRUD Capabilities:** Add, edit, delete, and view task details with a responsive modal window.
* **Overdue Indicators:** Tasks that pass their deadline are marked as overdue with alert UI styles.
* **Token-based Authentication:** Stateless authentication using JWT (JSON Web Tokens) with secure password hashing via `bcrypt`.
* **Optimistic UI Updates:** Experience zero-latency task movement and deletion thanks to optimistic React state management.
* **Full Test Coverage:** Unit and integration tests for both backend and frontend components.

---

## 🛠️ Technology Stack

### Backend
| Technology | Role |
| :--- | :--- |
| **NestJS (v11)** | Modular REST API framework |
| **TypeScript** | Static typing & scalability |
| **Prisma ORM** | Schema migration & type-safe queries |
| **PostgreSQL** | Relational Database |
| **Passport JWT** | Stateless token-based request authorization |
| **bcrypt** | Secure one-way password hashing |
| **class-validator** | DTO (Data Transfer Object) request payload validation |
| **Jest / Supertest** | Testing framework and HTTP assertion utility |

### Frontend
| Technology | Role |
| :--- | :--- |
| **Next.js 16 (App Router)** | React framework with file-based routing |
| **React 19** | Core UI component lifecycle and rendering |
| **Tailwind CSS 4** | Styling & layout system |
| **@hello-pangea/dnd** | Kanban drag-and-drop mechanics |
| **lucide-react** | SVG iconography |
| **Jest / React Testing Library** | Component and unit testing framework |

### Infrastructure
| Tool | Role |
| :--- | :--- |
| **Docker Compose** | Pre-configured local PostgreSQL container for development |

---

## 🏗️ Architecture

The project follows a standard client-server architecture with separation of concerns:

```
┌──────────────────┐       REST / JWT       ┌──────────────────┐       Prisma ORM       ┌──────────────────┐
│  Next.js Client  │ ─────────────────────▶ │    NestJS API    │ ─────────────────────▶ │ PostgreSQL DB    │
│  (Frontend)      │ ◀───────────────────── │    (Backend)     │ ◀───────────────────── │ (Docker Container│
└──────────────────┘          JSON          └──────────────────┘                        └──────────────────┘
```

* **Backend Modules:** Organized cleanly into `AuthModule` (registration, login, JWT issuance), `TasksModule` (task CRUD endpoints guarded by JWT authentication), and `PrismaModule` (database access client).
* **Frontend Structure:** Next.js pages handle routing. React components represent board columns (`KanbanBoard`), task items (`TaskCard`), and details editor (`TaskModal`). Access tokens and user profiles are stored in the client's `localStorage`.

---

## ⚙️ Local Setup Instructions

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js** (v18 or higher recommended)
* **Docker & Docker Compose**

### Setup Steps

1. **Install Dependencies**
   Run the package installer from the root workspace to install all packages for both the backend and frontend:
   ```bash
   npm run install:all
   ```

2. **Start the PostgreSQL Container**
   Spin up the PostgreSQL database container configured in `docker-compose.yml`:
   ```bash
   npm run db:up
   ```

3. **Configure Backend Environment Variables**
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/taskmanager"
   JWT_SECRET="your-development-jwt-secret-key"
   PORT=3001
   ```

4. **Run Database Migrations**
   Generate the Prisma client and apply the migrations to your PostgreSQL database:
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   cd ..
   ```

5. **Start the Backend API Server**
   Start the NestJS backend dev server from the root directory (runs on port `3001`):
   ```bash
   npm run backend:start
   ```

6. **Configure Frontend Environment Variables**
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

7. **Start the Frontend Next.js Server**
   Start the Next.js frontend dev server from the root directory (runs on port `3000`):
   ```bash
   npm run frontend:start
   ```

8. **View the Application**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Running Tests

You can execute tests for each individual module or run all tests simultaneously:

```bash
# Run NestJS backend unit tests
npm run backend:test

# Run Next.js frontend component tests
npm run frontend:test

# Run all tests across the entire project
npm test
```

---

## 📂 Project Directory Structure

```text
TaskManager/
├── docker-compose.yml         # Dev database container config
├── package.json               # Root monorepo scripts
├── backend/                   # NestJS REST API
│   ├── src/
│   │   ├── auth/              # Registration, login, and JWT strategies
│   │   ├── tasks/             # Task operations & permissions
│   │   ├── prisma/            # Prisma connection service
│   │   ├── app.module.ts
│   │   └── main.ts            # Entrypoint
│   └── prisma/
│       └── schema.prisma      # DB models and relations
└── frontend/                  # Next.js frontend application
    └── src/
        ├── app/               # App Router pages (login, register, home)
        ├── components/        # KanbanBoard, TaskCard, TaskModal
        ├── services/
        │   └── api.ts         # Generic fetch API helper
        └── types/
            └── index.ts       # Shared TypeScript models
```

---

## 🔒 Security Best Practices

* **Stateless JWT Authorization:** All endpoints under `/tasks` require a valid JWT token in the `Authorization: Bearer <token>` header. Token invalidation or expiration instantly triggers a logout on the client.
* **Password Hashing:** User passwords are encrypted using `bcrypt` (10 rounds) before being stored in the database.
* **CORS Settings:** In development, CORS is open. For production deployments, adjust the configuration in `backend/src/main.ts` to only authorize the frontend domain.
