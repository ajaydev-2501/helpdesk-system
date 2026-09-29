# Mini Helpdesk & Support Ticket System

A modern full-stack technical assessment project featuring a mini helpdesk and support ticket system. Built with a scalable NestJS backend, a high-performance React 19 frontend powered by Vite and Tailwind CSS, and end-to-end testing with Playwright.

---

## Architecture & Technology Stack

### Frontend
- **Framework**: React 19 with Vite & TypeScript
- **Routing**: React Router v7 (`react-router-dom`)
- **Styling**: Tailwind CSS
- **State & Data Fetching**: TanStack Query (React Query v5)
- **HTTP Client**: Axios (configured with interceptors & environment configuration)
- **Forms & Validation**: React Hook Form with Zod schema validation
- **Icons**: Lucide React

### Backend
- **Framework**: NestJS v11 with TypeScript (Strict mode)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **API Documentation**: OpenAPI / Swagger UI at `/api/docs`
- **Global API Prefix**: `/api`
- **Authentication**: JWT & Passport (`@nestjs/jwt`, `passport-jwt`, `bcrypt`)
- **Validation**: `class-validator` and `class-transformer` with global validation pipe
- **Testing**: Jest for backend unit and integration testing

### E2E Testing
- **Framework**: Playwright with TypeScript

---

## Project Structure

```text
helpdesk-system/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── prisma/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tickets/
│   │   ├── admin/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── e2e/
│   ├── fixtures/
│   ├── tests/
│   │   └── app.spec.ts
│   ├── package.json
│   ├── playwright.config.ts
│   └── tsconfig.json
├── README.md
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+ or v11+
- **PostgreSQL**: (Required when running Prisma migrations)

### 1. Installation

Install all dependencies across root, backend, frontend, and e2e workspaces:

```bash
npm install
```

> [!NOTE]
> **Windows Compatibility**: The project uses `bcryptjs` for password hashing to eliminate native C++ compilation (`node-gyp` / `node-pre-gyp`) and Visual Studio build tool dependencies on Windows machines and Node.js v20/v22+.

### 2. Environment Configuration

Copy the example environment files:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

#### Backend Environment Variables (`backend/.env`):
```env
# Neon PostgreSQL Connection URL
# Obtain from Neon Dashboard: https://console.neon.tech
DATABASE_URL=postgresql://<user>:<password>@<neon-hostname>/<dbname>?sslmode=require
JWT_SECRET=development-jwt-secret-replace-in-production
JWT_EXPIRES_IN=1d
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend Environment Variables (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Prisma Generation, Database Migration & Seeding

> [!IMPORTANT]
> **Mandatory Step**: You **must** run `npm run prisma:generate` before running `dev`, `build`, or `test`. TypeScript relies on the generated `@prisma/client` types (`Role`, `Status`, `Priority`, `User`, `TicketWhereInput`). If omitted, TypeScript will report `TS2305: Module '@prisma/client' has no exported member 'Role'`.

```bash
# 1. Generate Prisma Client types
npm run prisma:generate

# 2. Apply database migrations to PostgreSQL (Neon)
npm run prisma:migrate
# (In CI or production environments, use: npm run prisma:deploy)

# 3. Seed default admin, user, and demo ticket data
npm run db:seed
```

#### Default Seed Credentials

After running `npm run db:seed`, the database is populated with the following pre-configured credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@helpdesk.local` | `Admin@123456` | Full administrative access, ticket status updates, global analytics |
| **User** | `user@helpdesk.local` | `User@123456` | Create tickets, view/edit personal tickets, filter personal dashboard |

---

## Running the Application

### Development Mode (Both Frontend & Backend)
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Swagger Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

### Individual Services

```bash
# Run backend only (NestJS with watch mode on port 5000)
npm run dev:backend

# Run frontend only (Vite dev server on port 5173)
npm run dev:frontend
```

---

## Troubleshooting & Common Issues

### 1. `TS2305: Module '@prisma/client' has no exported member 'Role' / 'Status' / 'Priority'`
- **Cause**: The Prisma Client artifacts have not been generated yet.
- **Fix**: Run the generator script:
  ```bash
  npm run prisma:generate
  ```
  Then restart your dev server (`npm run dev`).

### 2. `'concurrently' is not recognized as an internal or external command`
- **Cause**: The root `npm install` failed or was interrupted (often due to native build tool errors like `node-pre-gyp`), leaving `node_modules/.bin` unpopulated.
- **Fix**: Run a clean install:
  ```powershell
  Remove-Item -Recurse -Force node_modules, backend/node_modules, frontend/node_modules -ErrorAction SilentlyContinue
  npm install
  npm run prisma:generate
  ```

### 3. `Error: listen EADDRINUSE: address already in use :::5000` (or `:::5173`)
- **Cause**: A previous Node.js process is still running and occupying port 5000 (backend) or 5173 (frontend).
- **Fix (Windows PowerShell)**:
  ```powershell
  # Find process occupying port 5000
  Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object OwningProcess

  # Terminate the process (replace <PID> with the OwningProcess ID)
  Stop-Process -Id <PID> -Force
  ```
  *(Repeat for port 5173 if needed)*

### 4. `TAR_ENTRY_ERROR ENOENT` / `EPERM: operation not permitted` during `npm install`
- **Cause**: Windows file locks by open terminals, running watch processes, or antivirus software holding open files inside `node_modules`.
- **Fix**: Stop all running terminal watch tasks (`Ctrl + C`), close VS Code / IDE terminals referencing the folder, and run:
  ```powershell
  npm cache clean --force
  npm install
  ```

---

## Authentication Architecture & Security

### Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account (`Role.USER`) | Public |
| `POST` | `/api/auth/login` | Authenticate user, set HTTP-only cookie, return JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile (omits `passwordHash`) | Authenticated |
| `POST` | `/api/auth/logout` | Clear HTTP-only session cookie | Public / Auth |

### Strategy: Secure HTTP-Only Cookie + Bearer Token Dual Extraction
- **Browser Security**: `POST /api/auth/login` sets an `access_token` cookie with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`. This completely mitigates token exfiltration via client-side XSS.
- **API & Swagger Interoperability**: `login` also returns `{ user, accessToken }` in the response JSON, and `JwtStrategy` inspects both `request.cookies['access_token']` and the `Authorization: Bearer <token>` header.
- **Claims**: JWT payload contains minimal necessary claims: `{ sub, email, role }`.
- **Authorization**: Protected routes use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(Role.ADMIN)`.
- **Throttling**: Rate limiting configured with `@nestjs/throttler` (default: 100 req/min global, 5 req/min on `/auth/register`, 10 req/min on `/auth/login`).
- **Validation**: Strict global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`.

---

## Testing

```bash
# Backend unit tests (Jest)
npm run test

# Backend test coverage
npm run test:backend -- --coverage

# End-to-end tests (Playwright)
npm run test:e2e
```

---

## Build & Typecheck

```bash
# Typecheck both frontend and backend
npm run typecheck

# Build both frontend and backend
npm run build
```
