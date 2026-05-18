# 💼 TrackHire — Production-Grade Job Tracker

> A full-stack job application tracker built with **Spring Boot 3** + **React 19**, featuring JWT authentication, a complete **DevOps pipeline** (CI/CD, Docker, Actuator), and a glassmorphism UI — deployed free on Render + Vercel.

[![Backend CI/CD](https://github.com/kowshik-thatinati/Trackhire/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/kowshik-thatinati/Trackhire/actions/workflows/backend-ci.yml)
[![Frontend CI/CD](https://github.com/kowshik-thatinati/Trackhire/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/kowshik-thatinati/Trackhire/actions/workflows/frontend-ci.yml)

---

## 📐 System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│   React 19 + Vite (Vercel CDN)                           │
│   └── api.js  →  REST calls with JWT Bearer token        │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼──────────────────────────────┐
│                    API GATEWAY LAYER                     │
│   Spring Boot 3.2 on Render                              │
│   ├── JwtAuthFilter    (validates every request)         │
│   ├── RequestLoggingFilter (logs method/path/status/ms)  │
│   ├── GlobalExceptionHandler (ApiResponse error format)  │
│   └── Spring Boot Actuator  (/actuator/health)           │
└───────────────────────────┬──────────────────────────────┘
                            │ JPA / Hibernate
┌───────────────────────────▼──────────────────────────────┐
│                    DATA LAYER                            │
│   Render (prod)   → PostgreSQL (Render managed DB)       │
│   Docker Compose  → MySQL (local dev only)               │
│   Local dev       → H2 in-memory (zero setup)            │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline Flow

```
Git push to main
       │
       ├─► paths: jobtracker/** or Dockerfile
       │          │
       │    ┌─────▼─────────────────────────────┐
       │    │  BACKEND PIPELINE                  │
       │    │  1. 🧪 Maven test (H2, dev profile) │
       │    │  2. 🐳 Docker build + push Hub      │
       │    │     kowshik2004/jobtracker-backend  │
       │    │  3. 🚀 Render deploy hook (POST)    │
       │    └───────────────────────────────────┘
       │
       └─► paths: job-tracker-ui/**
                  │
            ┌─────▼─────────────────────────────┐
            │  FRONTEND PIPELINE                 │
            │  1. npm ci (cached node_modules)   │
            │  2. vite build (VITE_API_URL baked)│
            │  3. 🚀 Vercel --prebuilt deploy     │
            └───────────────────────────────────┘
```

Each pipeline only triggers on changes to its own directory — no wasted runs.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2.5 |
| Security | Spring Security, JWT (JJWT 0.11.5), BCrypt |
| Persistence | Spring Data JPA, PostgreSQL (Render), MySQL (Docker), H2 (dev) |
| Observability | Spring Boot Actuator, Logback structured logging |
| Frontend | React 19, Vite, Vanilla CSS (glassmorphism) |
| Containerisation | Docker (multi-stage, Alpine JRE, non-root) |
| CI/CD | GitHub Actions |
| Hosting | Render (backend + PostgreSQL), Vercel (frontend) |

---

## 🚀 Quick Start

### Option A — Local Dev with H2 (zero setup)

```bash
# Backend
cd jobtracker
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# → runs at http://localhost:8080
# → H2 console at http://localhost:8080/h2-console

# Frontend (separate terminal)
cd job-tracker-ui
cp .env.example .env.local        # VITE_API_URL=http://localhost:8080
npm install && npm run dev
# → runs at http://localhost:5173
```

### Option B — Full Stack with Docker Compose (MySQL)

```bash
cp .env.example .env              # fill in your values
docker-compose up --build
# Backend  → http://localhost:8080
# Frontend → http://localhost:5173
# MySQL    → localhost:3306
```

---

## ⚙️ Environment Configuration

### Backend — Render Profile (`SPRING_PROFILES_ACTIVE=render`)

| Variable | Example | Source | Description |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `render` | Set manually | Activates PostgreSQL profile |
| `JWT_SECRET` | auto-generated | `render.yaml` auto-generates | HMAC-SHA256 signing key |
| `DB_HOST` | `dpg-xxx.render.com` | Auto-injected by Render | PostgreSQL hostname |
| `DB_PORT` | `5432` | Auto-injected by Render | PostgreSQL port |
| `DB_NAME` | `jobtracker` | Auto-injected by Render | Database name |
| `DB_USER` | `kowshik` | Auto-injected by Render | DB user |
| `DB_PASSWORD` | `<random>` | Auto-injected by Render | DB password |

### Docker Compose Profile (`SPRING_PROFILES_ACTIVE=prod`, local only)

| Variable | Example | Description |
|---|---|---|
| `MYSQLHOST` | `mysql` | MySQL service hostname |
| `MYSQLPORT` | `3306` | MySQL port |
| `MYSQLDATABASE` | `jobtracker` | Database name |
| `MYSQLUSER` | `kowshik` | DB user |
| `MYSQLPASSWORD` | `secret` | DB password |
| `JWT_SECRET` | `32+ char string` | HMAC-SHA256 signing key |

### Frontend — `.env.local` / Vercel Environment Variables

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `https://jobtracker-backend.onrender.com` | Render backend URL |

---

## 🔑 Required GitHub Secrets

Set these in **Settings → Secrets → Actions** in your GitHub repo:

| Secret | Used By | How to Get |
|---|---|---|
| `DOCKERHUB_USERNAME` | Backend CI | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Backend CI | Docker Hub → Account Settings → Access Tokens |
| `RENDER_DEPLOY_HOOK_URL` | Backend CI | Render Dashboard → Service → Settings → Deploy Hook |
| `VERCEL_TOKEN` | Frontend CI | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Frontend CI | `vercel whoami` or Vercel project settings |
| `VERCEL_PROJECT_ID` | Frontend CI | Vercel project settings |
| `VITE_API_URL` | Frontend CI | Your Render backend URL (e.g. `https://jobtracker-backend.onrender.com`) |

---

## 📡 API Reference

All responses follow the standard envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2025-05-18T14:00:00"
}
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Get JWT token |
| GET | `/jobs` | ✅ | List your jobs |
| POST | `/jobs` | ✅ | Add a new job |
| PUT | `/jobs/{id}` | ✅ | Update job status |
| DELETE | `/jobs/{id}` | ✅ | Delete a job |
| GET | `/actuator/health` | ❌ | Service health check |
| GET | `/actuator/info` | ❌ | App version info |

---

## 🐳 Docker

```bash
# Build image manually
docker build -t jobtracker-backend .

# Run with env vars
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e MYSQLHOST=host.docker.internal \
  -e MYSQLPORT=3306 \
  -e MYSQLDATABASE=jobtracker \
  -e MYSQLUSER=root \
  -e MYSQLPASSWORD=root123 \
  -e JWT_SECRET=my-32-char-secret-replace-me!! \
  jobtracker-backend
```

**Image optimisations:**
- Multi-stage build — only the JRE layer ships (no Maven/JDK in prod)
- Alpine JRE base (~85 MB vs ~250 MB Jammy)
- Maven dep-cache layer — rebuilds skip dependency download
- Non-root `appuser` — no process runs as root
- `HEALTHCHECK` via `/actuator/health`
- `-XX:+UseContainerSupport` — JVM respects Docker memory limits

---

## 🔍 Observability

**Health check:**
```bash
curl https://jobtracker-backend.onrender.com/actuator/health
# {"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"}}}
```

**Structured request logs (prod):**
```
{"time":"2025-05-18T14:00:01","level":"INFO","logger":"RequestLoggingFilter","msg":"[REQUEST] POST /auth/login | Status: 200 | Duration: 42ms | User: anonymous"}
{"time":"2025-05-18T14:00:05","level":"INFO","logger":"AuthController","msg":"[AUTH] Login success for: ko***@gmail.com"}
```

**Auth event logs:**
- `[AUTH] Login success for: ko***@gmail.com`
- `[AUTH] Login FAILED for: un***@test.com`
- `[AUTH] Registration success for: ne***@gmail.com`

---

## 🚢 Deployment

### Render (Backend) — Option A: Blueprint (Recommended)
1. Commit `render.yaml` to your repo (already done)
2. Render Dashboard → **New → Blueprint** → connect GitHub repo
3. Render automatically provisions the web service + PostgreSQL database
4. Set `JWT_SECRET` manually if not auto-generated
5. Copy the **Deploy Hook URL** from Service → Settings → Deploy Hook
6. Add it as GitHub secret `RENDER_DEPLOY_HOOK_URL`
7. Push to `main` → GitHub Actions tests → Docker push → Render redeploys

### Render (Backend) — Option B: Manual Docker Deploy
1. Render Dashboard → New Web Service → Connect repo
2. Runtime: **Docker**, Dockerfile path: `./jobtracker/Dockerfile`
3. Add a free PostgreSQL database → copy connection vars
4. Set env vars: `SPRING_PROFILES_ACTIVE=render`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`
5. Copy Deploy Hook URL → add as `RENDER_DEPLOY_HOOK_URL` GitHub secret

### Vercel (Frontend)
1. Import `job-tracker-ui` folder as Vercel project
2. Set `VITE_API_URL` → your Render backend URL (e.g. `https://jobtracker-backend.onrender.com`)
3. Add GitHub secrets → push to `main` → pipeline deploys automatically

> **Note:** Render free tier spins down after 15 min of inactivity. First request after sleep may take ~30s to respond.

---

*Built by Kowshik Thatinati*
