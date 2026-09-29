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

### 3. Database Migration & Seeding (Neon / PostgreSQL)

Once your Neon `DATABASE_URL` is configured in `backend/.env`:

```bash
# Apply migrations to your Neon database
npm run prisma:migrate --workspace=backend

# Or deploy existing migrations in CI/production:
npm run prisma:deploy --workspace=backend

# Seed initial admin and test user records:
npm run db:seed --workspace=backend
```

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

### Individual Services

```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

---

## Testing

```bash
# Backend unit tests (Jest)
npm run test

# End-to-end tests (Playwright)
npm run test:e2e
```

---

## Build

```bash
# Build both frontend and backend
npm run build
```
