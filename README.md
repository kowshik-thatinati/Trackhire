# 💼 JobTracker

> A full-stack job application tracking system built with **Spring Boot 3** and **React 18** — featuring JWT-based authentication, role-secured REST APIs, and an animated glassmorphism UI.

## 🚀 Quick Start

### 1. Backend (Spring Boot)
**Local Development (H2 - No Setup Required):**
```bash
cd jobtracker/jobtracker
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
*Note: Access H2 Console at `http://localhost:8080/h2-console`.*

**Production (MySQL - Railway Ready):**
The app is pre-configured to use MySQL via environment variables.
```bash
./mvnw spring-boot:run
```

### 2. Frontend (React + Vite)
```bash
cd job-tracker-ui
npm install
npm run dev
```
*Runs at `http://localhost:5173`.*

---

## ✨ Features
- **Secure Auth**: JWT-based authentication with BCrypt hashing.
- **Job Tracking**: Full CRUD for job applications (Applied, Interview, Offered, Rejected).
- **Dynamic Dashboard**: Real-time stats and glassmorphism UI.
- **Railway Ready**: Pre-configured for MySQL deployment.

## 🛠 Tech Stack
- **Backend**: Java 17, Spring Boot 3.5, Spring Security, JPA, MySQL/H2.
- **Frontend**: React 18, Vite, Vanilla CSS.

## 📡 API Endpoints
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `GET /jobs` - List user jobs
- `POST /jobs` - Add new job
- `PUT /jobs/{id}` - Update status
- `DELETE /jobs/{id}` - Remove job

---
*Built by Kowshik*
