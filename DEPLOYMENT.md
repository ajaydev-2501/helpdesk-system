# Deployment Guide

This is a **monorepo** but GitHub Pages **cannot** host it — GitHub Pages only serves static HTML files and has no support for running a Node.js/NestJS backend server.

The correct strategy is to **deploy the backend and frontend separately** to platforms that specialise in each:

| Part | Recommended Platform | Why |
|------|---------------------|-----|
| **Backend** (NestJS API) | [Railway](https://railway.app) | Free tier, native Node.js, runs `node dist/main`, reads env vars |
| **Frontend** (React/Vite) | [Vercel](https://vercel.com) | Best-in-class Vite support, free tier, auto-deploys from Git |
| **Database** (PostgreSQL) | [Neon](https://neon.tech) | Already configured — keep using your existing Neon DB |

> **Important:** You keep a **single GitHub repository** with both `backend/` and `frontend/` folders. Railway points at `backend/`, Vercel points at `frontend/`. One push deploys both automatically.

---

## Prerequisites

- [ ] Push your project to a GitHub repository
- [ ] Have your Neon `DATABASE_URL` ready (already in `backend/.env`)
- [ ] Create a free account on [Railway](https://railway.app) and [Vercel](https://vercel.com)

---

## Step 1 — Deploy the Backend to Railway

### 1.1 Create a new Railway project

1. Go to [railway.app](https://railway.app) ? **New Project** ? **Deploy from GitHub repo**
2. Select your repository
3. Railway will detect it as a Node.js project

### 1.2 Configure the Root Directory

In your Railway service settings:

- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `node dist/main`

> `prisma migrate deploy` applies any pending migrations on startup — safe to run on every deploy.

### 1.3 Set Environment Variables in Railway

Go to your service ? **Variables** ? add each one:

```env
DATABASE_URL=postgresql://neondb_owner:<password>@<your-neon-host>/neondb?sslmode=require&channel_binding=require
JWT_SECRET=<generate-a-strong-random-secret-min-32-chars>
JWT_EXPIRES_IN=1d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://<your-vercel-app>.vercel.app
```

> **CAUTION:** Change `JWT_SECRET` to a new strong random value for production. Never use the development secret.
> Generate one with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

> **Note:** Set `FRONTEND_URL` to your actual Vercel URL **after** Step 2. You can come back and update it.

### 1.4 Get your Railway Backend URL

After deploy, Railway gives you a public URL like:
```
https://mini-helpdesk-production.up.railway.app
```

Note this — you need it for the frontend environment variable.

---

## Step 2 — Deploy the Frontend to Vercel

### 2.1 Create a new Vercel project

1. Go to [vercel.com](https://vercel.com) ? **Add New Project** ? Import your GitHub repo
2. Vercel auto-detects Vite ?

### 2.2 Configure the Root Directory

In the Vercel project settings before deploying:

- **Root Directory**: `frontend`
- **Framework Preset**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.3 Set Environment Variables in Vercel

Go to **Settings ? Environment Variables** ? add:

```env
VITE_API_URL=https://<your-railway-app>.up.railway.app/api
```

Replace `<your-railway-app>` with your actual Railway URL from Step 1.4.

> **Important:** Vite bakes environment variables into the static bundle at build time. If you change `VITE_API_URL` later, you must **redeploy** the frontend.

### 2.4 Configure SPA Routing (Required!)

Vercel needs to redirect all routes to `index.html` for React Router to work.

Create this file at `frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without this file, refreshing any page like `/dashboard` or `/tickets` will return a **404**.

---

## Step 3 — Update CORS on the Backend

After Vercel gives you your frontend URL (e.g. `https://mini-helpdesk.vercel.app`), go back to Railway and update:

```env
FRONTEND_URL=https://mini-helpdesk.vercel.app
```

This ensures the NestJS CORS config allows requests from your live frontend.

---

## Step 4 — Post-Deployment Verification

Visit these URLs to confirm everything works:

| Check | URL | Expected |
|-------|-----|----------|
| Backend health | `https://<railway-url>/api/health` | `{"status":"ok"}` |
| API docs (Swagger) | `https://<railway-url>/api/docs` | Swagger UI loads |
| Frontend loads | `https://<vercel-url>` | Home page renders |
| Login works | `https://<vercel-url>/login` | Can log in with seeded credentials |

### Seeded Demo Credentials

If you ran `npm run db:seed` locally, these accounts exist in your Neon DB:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@helpdesk.local` | `Admin@123456` |
| User | `user@helpdesk.local` | `User@123456` |

---

## Auto-Deploy on Push

Once connected, every `git push` to your `main` branch automatically:
- **Railway** rebuilds and redeploys the backend
- **Vercel** rebuilds and redeploys the frontend

No manual steps needed after initial setup.

---

## Folder Structure Summary

```
mini-helpdesk-support-ticket-system/    <- single GitHub repo
+-- backend/                            <- deployed to Railway
¦   +-- src/
¦   +-- prisma/
¦   +-- dist/           (built by nest build)
¦   +-- package.json
+-- frontend/                           <- deployed to Vercel
¦   +-- src/
¦   +-- dist/           (built by vite build)
¦   +-- vercel.json     (SPA rewrite rule - MUST exist!)
¦   +-- package.json
+-- e2e/                                <- not deployed (test-only)
+-- package.json        (root monorepo)
```

---

## Troubleshooting

### `Cannot POST /api/auth/login` (CORS error in browser)
- Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly (no trailing slash)
- Redeploy the backend after changing the env var

### `401 Unauthorized` on all requests after login
- Check `JWT_SECRET` is set in Railway and is not empty
- Ensure `JWT_EXPIRES_IN` is a valid value like `1d` or `7d`

### Frontend shows blank page or 404 on refresh
- Make sure `frontend/vercel.json` exists with the rewrite rule
- Check the Vercel build logs for errors

### Database migrations not applied
- Confirm the build command in Railway includes `npx prisma migrate deploy`
- Check Railway deploy logs for any Prisma errors

### `Module not found` errors on Railway build
- Ensure **Root Directory** is set to `backend` in Railway service settings
- Check that `dist/` is not in `.gitignore` (it shouldn't be — the build creates it on Railway)
