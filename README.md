# 💼 JobTracker

> A full-stack job application tracking system built with **Spring Boot 3** and **React 18** — featuring JWT-based authentication, role-secured REST APIs, and an animated glassmorphism UI.

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.5.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/H2-Database-1316BF?style=for-the-badge&logo=h2&logoColor=white"/>
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Security Design](#-security-design)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment & Config](#-environment--config)
- [Frontend Overview](#-frontend-overview)
- [Auth Flow](#-auth-flow-end-to-end)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)

---

## 🔭 Overview

JobTracker is a **secure, full-stack web application** that allows users to manage their job applications throughout the hiring pipeline. Users register, authenticate via JWT, and can create, view, update, and delete their personal job records — all in isolation from other users.

The backend is a **stateless REST API** built with Spring Boot and Spring Security. The frontend is a **React SPA** with a premium animated glassmorphism UI.

---

## ✨ Features

### Authentication
- ✅ User registration with BCrypt password hashing
- ✅ Login returns a signed JWT (HMAC-SHA256)
- ✅ All protected endpoints require a valid `Authorization: Bearer <token>` header
- ✅ Stateless session management (no server-side sessions)

### Job Management
- ✅ Create job applications (company, role)
- ✅ View all jobs scoped to the authenticated user
- ✅ Update job status: `APPLIED → INTERVIEW → OFFERED → REJECTED`
- ✅ Delete jobs with ownership validation
- ✅ Applied date auto-stamped on creation

### Frontend UI
- ✅ Animated gradient background with floating blobs
- ✅ Glassmorphism card design (frosted glass)
- ✅ Real-time stats dashboard (Total / Applied / Interview / Offered)
- ✅ Status filter tabs
- ✅ Toast notifications for all actions
- ✅ Fully responsive layout

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Core language |
| Spring Boot | 3.5.0 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | ORM / database access layer |
| Hibernate | 6.x | JPA implementation |
| H2 Database | 2.x | In-memory relational database |
| JJWT (jjwt-api) | 0.11.5 | JWT generation & validation |
| BCryptPasswordEncoder | — | Password hashing |
| Maven | 3.x | Build & dependency management |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI component framework |
| Vite | 5.x | Dev server & build tool |
| Vanilla CSS | — | Styling, animations, design system |
| Google Fonts (Inter) | — | Typography |
| Fetch API | — | HTTP client (built-in browser API) |

---

## 🏛 Architecture

```
┌──────────────────────────────────────────────────┐
│                   REACT FRONTEND                 │
│          http://localhost:5173                   │
│                                                  │
│  App.jsx  →  Login / Register / Dashboard        │
│  api.js   →  All fetch() calls                   │
│  index.css → Design system + animations          │
└─────────────────────┬────────────────────────────┘
                      │ HTTPS / JSON
                      │ Authorization: Bearer <JWT>
┌─────────────────────▼────────────────────────────┐
│              SPRING BOOT REST API                │
│          http://localhost:8080                   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │          Security Filter Chain           │   │
│  │  JwtAuthFilter → SecurityContextHolder   │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼───────────────────────┐   │
│  │           REST Controllers               │   │
│  │   AuthController   │   JobController     │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼───────────────────────┐   │
│  │              Service Layer               │   │
│  │   UserService      │   JobService        │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼───────────────────────┐   │
│  │        Repository Layer (JPA)            │   │
│  │   UserRepository   │   JobRepository     │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼───────────────────────┐   │
│  │            H2 In-Memory DB               │   │
│  │        users table │ jobs table          │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
job_tracker/
│
├── jobtracker/jobtracker/                  ← Spring Boot (Maven Project)
│   ├── pom.xml                             ← Dependencies & build config
│   │
│   ├── src/main/resources/
│   │   └── application.properties          ← DB, JPA, server config
│   │
│   └── src/main/java/com/kowshik/jobtracker/
│       │
│       ├── JobtrackerApplication.java       ← @SpringBootApplication entry point
│       │
│       ├── config/
│       │   └── CorsConfig.java             ← CORS policy for React dev server
│       │
│       ├── controller/
│       │   ├── AuthController.java         ← POST /auth/register, POST /auth/login
│       │   └── JobController.java          ← GET/POST/PUT/DELETE /jobs
│       │
│       ├── dto/
│       │   ├── RegisterRequest.java        ← Request body: {email, password}
│       │   ├── JobRequest.java             ← Request body: {company, role}
│       │   └── UserResponse.java           ← Response body: {id, email}
│       │
│       ├── entity/
│       │   ├── User.java                   ← @Entity → users table
│       │   └── Job.java                    ← @Entity → jobs table (@ManyToOne User)
│       │
│       ├── exception/
│       │   ├── UserAlreadyExistsException.java
│       │   └── GlobalExceptionHandler.java ← @RestControllerAdvice
│       │
│       ├── repository/
│       │   ├── UserRepository.java         ← findByEmail()
│       │   └── JobRepository.java          ← findByUserEmail()
│       │
│       ├── security/
│       │   ├── JwtUtil.java                ← generateToken / extractEmail / validateToken
│       │   ├── JwtAuthFilter.java          ← OncePerRequestFilter — validates JWT
│       │   └── SecurityConfig.java         ← SecurityFilterChain, CORS, STATELESS
│       │
│       └── service/
│           ├── UserService.java            ← register() + login() logic
│           └── JobService.java             ← addJob / getJobs / updateJob / deleteJob
│
└── job-tracker-ui/                         ← React + Vite (Frontend)
    ├── index.html                          ← Root HTML, SEO meta, font preload
    ├── package.json
    │
    └── src/
        ├── main.jsx                        ← React root mount
        ├── index.css                       ← Full design system + animations
        ├── api.js                          ← All fetch() API calls
        ├── App.jsx                         ← View state machine + BG blobs
        │
        └── components/
            ├── Login.jsx                   ← Login form
            ├── Register.jsx                ← Register form
            └── Dashboard.jsx               ← Stats + job CRUD + filters
```

---

## 📡 API Reference

### Auth Endpoints (Public)

#### `POST /auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200 OK`:**
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

**Response `409 Conflict`** (email already exists):
```
Email already registered
```

---

#### `POST /auth/login`
Login and receive a JWT.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200 OK`:**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tI...
```
> The raw JWT string. Store it and send in `Authorization: Bearer <token>`.

---

### Job Endpoints (Protected — requires JWT)

All requests must include:
```
Authorization: Bearer <your_jwt_token>
```

#### `POST /jobs` — Create a job
**Request Body:**
```json
{
  "company": "Google",
  "role": "Software Engineer"
}
```
**Response `200 OK`:**
```json
{
  "id": 1,
  "company": "Google",
  "role": "Software Engineer",
  "status": "APPLIED",
  "appliedDate": "2026-04-29",
  "user": { "id": 1, "email": "user@example.com" }
}
```

---

#### `GET /jobs` — Get all jobs for logged-in user
**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "company": "Google",
    "role": "Software Engineer",
    "status": "APPLIED",
    "appliedDate": "2026-04-29"
  }
]
```

---

#### `PUT /jobs/{id}` — Update job status
**Request Body:**
```json
{
  "status": "INTERVIEW"
}
```
Valid values: `APPLIED` | `INTERVIEW` | `OFFERED` | `REJECTED`

**Response `200 OK`:** Updated job object.  
**Response `403 Forbidden`:** If job belongs to a different user.  
**Response `404 Not Found`:** If job ID doesn't exist.

---

#### `DELETE /jobs/{id}` — Delete a job
**Response `200 OK`:**
```
Job deleted successfully
```
**Response `403 Forbidden`:** If job belongs to a different user.

---

## 🔐 Security Design

### JWT Token Structure
```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user@example.com", "iat": ..., "exp": ... }
Signature: HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)
```

- Token expires in **1 hour**
- Secret key is 32+ characters (HMAC-SHA256 minimum)
- Token subject = user's email

### Request Filter Flow
```
Incoming HTTP Request
        ↓
JwtAuthFilter.doFilterInternal()
        ↓
Is path /auth/** or /h2-console/**?
  YES → pass through (no auth required)
  NO  ↓
Read Authorization header
  Missing/malformed → pass through (Spring Security will reject protected routes)
  Present ↓
Extract token → JwtUtil.validateToken()
  Invalid → 401 Unauthorized
  Valid   ↓
JwtUtil.extractEmail(token) → set SecurityContextHolder
        ↓
Request reaches Controller
Controller reads email: SecurityContextHolder.getContext().getAuthentication().getName()
```

### Password Storage
Passwords are **never stored in plain text**. BCrypt is used:
```
plain password → BCrypt.encode() → $2a$10$... (stored in DB)
login attempt  → BCrypt.matches(raw, hash) → true/false
```

---

## 🗄 Database Schema

### `users` table
| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| `email` | VARCHAR | NOT NULL, UNIQUE |
| `password` | VARCHAR | NOT NULL (BCrypt hash) |
| `role` | VARCHAR | NOT NULL, default = `USER` |

### `jobs` table
| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| `company` | VARCHAR | — |
| `role` | VARCHAR | — |
| `status` | VARCHAR | `APPLIED` / `INTERVIEW` / `OFFERED` / `REJECTED` |
| `applied_date` | DATE | Auto-set on creation |
| `user_id` | BIGINT | FOREIGN KEY → `users.id` |

> **Note:** H2 is an in-memory database. All data is lost on application restart. For production, replace with PostgreSQL or MySQL.

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+
- npm 9+

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/jobtracker.git
cd jobtracker
```

---

### 2. Start the Backend

```bash
cd jobtracker/jobtracker
./mvnw spring-boot:run
```

> Windows:
> ```powershell
> .\mvnw.cmd spring-boot:run
> ```

Backend starts at: **http://localhost:8080**  
H2 Console: **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:maindb`)

---

### 3. Start the Frontend

```bash
cd job-tracker-ui
npm install
npm run dev
```

Frontend starts at: **http://localhost:5173**

---

### 4. Test the App
1. Open **http://localhost:5173**
2. Click **"Create one"** → Register with email + password
3. Login → receive JWT (stored in `localStorage`)
4. Add job applications
5. Update status via dropdown
6. Delete jobs
7. Logout to clear session

---

## ⚙ Environment & Config

`src/main/resources/application.properties`:

```properties
# H2 in-memory database
spring.datasource.url=jdbc:h2:mem:maindb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Web Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Server
server.port=8080
```

`src/api.js` (Frontend):
```javascript
const BASE_URL = "http://localhost:8080";
// Change this to your production API URL when deploying
```

---

## 🎨 Frontend Overview

### Design System
The entire UI is driven by CSS custom properties (variables) defined in `index.css`:

```css
--primary:     #6366f1  /* Indigo */
--surface:     #ffffff  /* Card background */
--border:      #e0e7ff  /* Subtle indigo-tinted borders */
--text:        #1e1b4b  /* Deep navy text */
```

### Animated Background
Three layers of animation:
1. **Gradient shift** — 4-color gradient (`gradientShift` keyframe, 12s cycle)
2. **Pseudo-element blobs** — purple + pink blobs on `.animated-bg` (`blobFloat`, 10s)
3. **Extra blob divs** — sky-blue + mint green (`blobFloat` reversed, 14s/11s)

### Component Hierarchy
```
App.jsx
├── <div class="animated-bg"/>   ← CSS animated gradient layer
├── <div class="blob-extra-1"/>  ← Floating sky-blue blob
├── <div class="blob-extra-2"/>  ← Floating green blob
├── Login.jsx     (view: "login")
├── Register.jsx  (view: "register")
└── Dashboard.jsx (view: "dashboard")
    ├── Navbar
    ├── Stats Row (4 cards)
    ├── Add Job Form
    ├── Filter Tabs
    ├── Jobs Grid
    │   └── Job Card × N
    └── Toast Notification
```

---

## 🔄 Auth Flow (End-to-End)

```
REGISTER
User → POST /auth/register {email, password}
     → UserService.register()
     → BCrypt.encode(password)
     → userRepository.save(user)
     → Returns {id, email}

LOGIN
User → POST /auth/login {email, password}
     → UserService.login()
     → userRepository.findByEmail()
     → BCrypt.matches(rawPassword, hash)  ✓
     → JwtUtil.generateToken(email)
     → Returns JWT string
     → React: localStorage.setItem("token", jwt)

PROTECTED REQUEST
User → GET /jobs
     → Header: Authorization: Bearer eyJhbGc...
     → JwtAuthFilter intercepts
     → JwtUtil.validateToken(token) ✓
     → JwtUtil.extractEmail(token) → "user@example.com"
     → SecurityContextHolder.setAuthentication(...)
     → JobController.getJobs()
     → SecurityContext.getAuthentication().getName() → "user@example.com"
     → JobService.getJobs("user@example.com")
     → jobRepository.findByUserEmail("user@example.com")
     → Returns [job1, job2, ...]
```

---

## ⚠ Known Limitations

| Limitation | Details |
|---|---|
| **In-memory DB** | H2 data is lost on every server restart. Not suitable for production. |
| **JWT secret hardcoded** | The JWT secret is in source code. Should be externalized to environment variables. |
| **No token refresh** | JWT expires after 1 hour with no refresh mechanism. User must re-login. |
| **No email validation** | Registration accepts any string as email format-wise. |
| **No pagination** | All jobs are returned in one request. Could be slow with thousands of records. |

---

## 🔮 Future Improvements

- [ ] Replace H2 with **PostgreSQL** for persistent storage
- [ ] Move JWT secret to **environment variable** / secrets manager
- [ ] Add **token refresh** endpoint
- [ ] Add **notes / comments** field on job applications
- [ ] Add **interview date** and **recruiter contact** fields
- [ ] Implement **pagination** on GET /jobs
- [ ] Add **email notifications** for status changes
- [ ] Write **unit tests** (JUnit 5, Mockito) for service layer
- [ ] Write **integration tests** for controllers (MockMvc)
- [ ] Deploy backend to **Railway / Render**, frontend to **Vercel / Netlify**
- [ ] Add **OAuth2 login** (Google, GitHub)

---

## 👨‍💻 Author

**Kowshik**  
Built with Spring Boot 3 + React 18 + Vite + JWT + H2 + Glassmorphism CSS

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
