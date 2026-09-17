# FluxShare

A full-stack **file transfer service** that lets users upload, download, list, and delete files through a modern web interface backed by a RESTful Go API.

<p align="center">
  <img src="Frontend/public/favicon.svg" alt="FluxShare Logo" width="128" />
</p>

---

## 🎯 Overview

FluxShare is a **self-hosted file-sharing application** built with a layered Go backend and a React + TypeScript frontend. Users can register, log in, and manage files through an authenticated dashboard. File metadata is persisted in **PostgreSQL**, actual file contents are stored in **MinIO** object storage, and authentication is handled via **JWT**.

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router |
| **Backend** | Go 1.26, Gin, Gin-swagger |
| **Database** | PostgreSQL 17 |
| **Object Storage** | MinIO |
| **Auth** | JWT (golang-jwt/v5) |
| **Containerization** | Docker + Docker Compose |
| **API Docs** | OpenAPI 3.0 (Swagger) |

---

## ✨ Features

- **🔐 User Authentication** — Secure registration and login with JWT-based sessions
- **📤 File Upload** — Multipart file upload with progress tracking
- **📋 File Listing** — Browse all uploaded files with metadata (name, size, type, status, date)
- **⬇️ File Download** — Download files by ID with automatic browser handling
- **🗑️ File Deletion** — Remove files (metadata + object storage) in one operation
- **📊 Dashboard** — Overview with stats cards (total files, storage used, etc.)
- **🎨 Modern UI** — Dark/light theme support, responsive design, toast notifications
- **📖 Swagger Documentation** — Interactive API docs at `/swagger`
- **🐳 Dockerized** — Fully containerized infrastructure via `docker-compose`

---

## 📁 Project Structure

```
FluxShare/
│
├── Backend/                              # Go API server
│   ├── cmd/server/main.go               # Application entry point
│   ├── internal/
│   │   ├── config/config.go             # Environment configuration (.env)
│   │   ├── database/postgres_database.go  # PostgreSQL connection & table creation
│   │   ├── handler/
│   │   │   ├── auth_handler.go          # Auth HTTP handlers (register/login)
│   │   │   └── file_handler.go          # File HTTP handlers (upload/list/download/delete)
│   │   ├── middleware/auth_middleware.go # JWT authentication middleware
│   │   ├── model/
│   │   │   ├── file.go                  # File domain model
│   │   │   ├── user.go                  # User domain model
│   │   │   ├── upload_request.go        # Upload request DTO
│   │   │   └── download_response.go     # Download response DTO
│   │   ├── repository/
│   │   │   ├── file_repository.go       # File metadata repository interface
│   │   │   ├── postgres_repository.go   # PostgreSQL file implementation
│   │   │   ├── user_repository.go       # User repository interface
│   │   │   ├── postgres_user_repository.go # PostgreSQL user implementation
│   │   │   └── memory_repository.go     # In-memory repository (for testing)
│   │   ├── router/router.go             # Gin router setup
│   │   ├── service/
│   │   │   ├── auth_service.go          # Auth business logic
│   │   │   └── file_service.go          # File business logic
│   │   ├── storage/
│   │   │   ├── object_storage.go        # Object storage interface
│   │   │   ├── minio_storage.go         # MinIO implementation
│   │   │   └── memory_storage.go        # In-memory storage (for testing)
│   │   └── auth/jwt.go                  # JWT token utilities
│   ├── docs/
│   │   ├── openapi.yaml                 # OpenAPI 3.0 specification
│   │   ├── swagger.json                 # Generated Swagger JSON
│   │   └── docs.go                      # Swagger doc generator bindings
│   ├── swagger-ui/                      # Swagger UI static assets
│   ├── .env                             # Environment variables
│   ├── docker-compose.yml               # PostgreSQL + MinIO containers
│   ├── Dockerfile                       # Backend container image
│   ├── go.mod / go.sum                  # Go dependencies
│   └── Readme.md                        # Backend-specific README
│
├── Frontend/                            # React + TypeScript frontend
│   ├── src/
│   │   ├── main.tsx                     # Application entry point
│   │   ├── App.tsx                      # Root component with routing
│   │   ├── api/
│   │   │   ├── auth.ts                  # Auth API calls (register/login)
│   │   │   └── files.ts                 # File API calls (upload/download/delete/stats)
│   │   ├── components/
│   │   │   ├── auth/AuthForm.tsx        # Login/Register form
│   │   │   ├── files/
│   │   │   │   ├── FileTable.tsx        # Files data table
│   │   │   │   ├── StatsCards.tsx       # Dashboard statistics
│   │   │   │   ├── UploadDropzone.tsx   # Drag-and-drop upload zone
│   │   │   │   └── UploadQueue.tsx      # Upload queue management
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx        # Main app shell
│   │   │   │   ├── Header.tsx           # Top header bar
│   │   │   │   └── Sidebar.tsx          # Navigation sidebar
│   │   │   └── ui/                      # Reusable UI components
│   │   │       ├── Button.tsx, ConfirmDialog.tsx, EmptyState.tsx
│   │   │       ├── FileIcon.tsx, ProgressBar.tsx, Skeleton.tsx
│   │   │       └── StatusBadge.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx          # Auth state (login/logout/user)
│   │   │   ├── ThemeContext.tsx         # Light/dark theme toggling
│   │   │   └── ToastContext.tsx         # Toast notification system
│   │   ├── pages/
│   │   │   ├── Login.tsx                # Login page
│   │   │   ├── Dashboard.tsx            # Dashboard home
│   │   │   ├── UploadPage.tsx           # File upload page
│   │   │   ├── FilesPage.tsx            # Files listing page
│   │   │   ├── FileDetailsPage.tsx      # Single file details
│   │   │   └── SettingsPage.tsx         # User settings
│   │   ├── styles/index.css             # Global styles & CSS variables
│   │   ├── types/index.ts               # Shared TypeScript types
│   │   └── utils/fileUtils.ts           # File utility helpers
│   ├── public/
│   │   ├── favicon.svg                  # Site favicon
│   │   └── icons.svg                    # Icon sprite
│   ├── dist/                            # Built production assets
│   ├── package.json                     # Node.js dependencies
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── vite.config.ts                   # Vite build configuration
│   └── README.md                        # Frontend-specific README
│
└── .gitignore
```

---

## 🏗️ Architecture

### Backend — 7-Layer Architecture

```
Client (Browser)
       │
       ▼
   HTTP Request
       │
       ▼
┌─────────────────────────────────────┐
│          Gin Router                  │
│  ┌─────────┐  ┌──────────────────┐  │
│  │ CORS    │  │ JWT Middleware   │  │
│  └────┬────┘  └───────┬──────────┘  │
└───────┼───────────────┼─────────────┘
        │               │
   ┌────▼────┐   ┌─────▼───────┐
   │  Auth   │   │   Files     │   Handler Layer
   │Handler  │   │  Handler    │
   └────┬────┘   └─────┬───────┘
        │               │
   ┌────▼────┐   ┌─────▼───────┐
   │ Auth    │   │  File       │   Service Layer
   │Service  │   │  Service    │
   └────┬────┘   └─────┬───────┘
        │               │
   ┌────▼────┐   ┌─────▼───────┐
   │UserRepo │   │  FileRepo   │   Repository Layer
   │(Postgres)│  │(Postgres)   │
   └────┬────┘   └─────┬───────┘
        │               │
   ┌────▼───────────────▼───────┐
   │     Object Storage          │   Storage Layer
   │     Interface               │
   │  ┌──────────┐  ┌─────────┐ │
   │  │  MinIO   │  │ Memory  │ │
   │  └──────────┘  └─────────┘ │
   └────────────────────────────┘
```

**Design Principles:**
- **Handlers** receive HTTP requests, parse input, and return responses
- **Services** contain business logic and orchestrate repositories/storage
- **Repositories** manage database queries (PostgreSQL)
- **Storage** manages file objects (MinIO / Memory)
- All dependencies flow through **interfaces**, enabling easy testing and swapping

### Frontend — Component Architecture

```
App (BrowserRouter, ThemeProvider, ToastProvider, AuthProvider)
  │
  ├── ProtectedRoute (guards authenticated routes)
  │     ├── AppLayout (Sidebar + Header + content area)
  │     │     ├── Dashboard      (StatsCards)
  │     │     ├── UploadPage     (UploadDropzone, UploadQueue)
  │     │     ├── FilesPage      (FileTable)
  │     │     ├── FileDetailsPage
  │     │     └── SettingsPage
  │     └── Login (AuthForm)
  │
  ├── Contexts: Auth, Theme, Toast
  ├── API: axios instances with interceptors
  └── Types: FileData, FileStatus, User, Toast
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user (`{ email, password }`) |
| POST | `/auth/login` | ❌ | Login user — returns `{ token }` |

### Files (protected — requires `Authorization: Bearer <JWT>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/files` | Upload a file (`multipart/form-data`) |
| GET | `/files` | List all uploaded files |
| GET | `/files/:id` | Download a file by ID |
| DELETE | `/files/:id` | Delete a file by ID |

### Documentation

| Path | Description |
|------|-------------|
| `/docs` | OpenAPI YAML spec |
| `/swagger` | Interactive Swagger UI |
| `/health` | Health check (`{ status: "UP" }`) |

---

## 🚀 Getting Started

### Prerequisites

- [Go](https://go.dev/dl/) 1.26+
- [Node.js](https://nodejs.org/) 20+ & npm
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FluxShare
```

### 2. Start Infrastructure (PostgreSQL + MinIO)

```bash
cd Backend
docker compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432` (user: `postgres`, pass: `postgres`, db: `filedb`)
- **MinIO Console** on `localhost:9001` (user: `minioadmin`, pass: `minioadmin`)
- **MinIO API** on `localhost:9000`

### 3. Run the Backend

```bash
cd Backend
go run ./cmd/server
```

The API server starts on `http://localhost:8080`.

### 4. Run the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The React app starts on `http://localhost:5173`.

### 5. Access the Application

- **App:** [http://localhost:5173](http://localhost:5173)
- **API:** [http://localhost:8080](http://localhost:8080)
- **Swagger UI:** [http://localhost:8080/swagger](http://localhost:8080/swagger)

---

## ⚙️ Configuration

All backend configuration is managed via `.env` in the `Backend/` directory:

```env
# Application
APP_PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=filedb

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=filedb

# Frontend & Auth
FRONTEND_HOST=http://localhost:5173
JWT_SECRET=All-the-bright-places
```

---

## 🐳 Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | `postgres:17-alpine` | 5432 | File metadata database |
| `minio` | `minio/minio:latest` | 9000 / 9001 | Object storage / Console |

```yaml
docker compose up -d     # Start all services
docker compose down      # Stop and remove containers
```

---

## 🛠️ Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `go run ./cmd/server` | Start the API server |
| `go mod tidy` | Clean up dependencies |
| `go build ./...` | Build all packages |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run Oxlint linter |
| `npm run preview` | Preview production build |

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| **User Registration** | ✅ Complete | Email + password, stored in PostgreSQL |
| **User Login** | ✅ Complete | JWT token returned |
| **File Upload** | ✅ Complete | Multipart → MinIO, metadata → PostgreSQL |
| **File Listing** | ✅ Complete | Returns all file metadata |
| **File Download** | ✅ Complete | Streams file from MinIO |
| **File Delete** | ✅ Complete | Removes metadata + object from MinIO |
| **JWT Auth Middleware** | ✅ Complete | Protects all file routes |
| **Swagger Docs** | ✅ Complete | Interactive API documentation |
| **Docker Infrastructure** | ✅ Complete | PostgreSQL + MinIO containerized |
| **Frontend Dashboard** | ✅ Complete | Stats overview |
| **Frontend Upload** | ✅ Complete | Drag-and-drop with progress bar |
| **Frontend File Table** | ✅ Complete | List, download, delete files |
| **Frontend Auth** | ✅ Complete | Login/Register with JWT storage |
| **Frontend Settings** | ⚠️ Placeholder | Scaffolded, basic implementation |
| **File Details Page** | ⚠️ Partial | Metadata display, download |
| **Frontend Themes** | ✅ Complete | Light/dark/system theme support |
| **Frontend Toast Notifications** | ✅ Complete | Success/error/info feedback |
| **Frontend Build** | ✅ Production Ready | Vite build outputs to `dist/` |
| **CORS Configuration** | ✅ Complete | Whitelisted to frontend origin |

---

## 🔑 Key Design Decisions

1. **PostgreSQL for metadata, MinIO for files** — Separating metadata from storage improves scalability and allows independent scaling of each layer.
2. **Interface-driven architecture** — The service layer depends on `Repository` and `ObjectStorage` interfaces, not concrete implementations. This makes it trivial to swap storage backends (e.g., swap MinIO for AWS S3) or use in-memory stores for testing.
3. **JWT-based authentication** — Stateless tokens eliminate server-side session overhead and work seamlessly across the API and any future clients.
4. **Layered dependency injection** — `main.go` wires all dependencies together, making the entire system explicit, testable, and maintainable.
5. **OpenAPI-first documentation** — The API spec lives alongside the code, ensuring documentation stays in sync.

---

## 📝 License

MIT — Created by Prateek
