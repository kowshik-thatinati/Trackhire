# JobTracker - 50 Interview Questions & Answers

> A comprehensive collection of medium to advanced interview questions about the JobTracker project, covering Spring Boot, React, JWT authentication, JPA, security, deployment, and best practices.

---

## Table of Contents
- [Spring Boot Architecture](#spring-boot-architecture)
- [Spring Security & JWT](#spring-security--jwt)
- [JPA & Database Design](#jpa--database-design)
- [React & Frontend](#react--frontend)
- [API Design & Best Practices](#api-design--best-practices)
- [Error Handling & Exception Management](#error-handling--exception-management)
- [Deployment & DevOps](#deployment--devops)
- [Security & Performance](#security--performance)
- [Design Patterns & Architecture](#design-patterns--architecture)
- [Troubleshooting & Scenarios](#troubleshooting--scenarios)

---

## Spring Boot Architecture

### 1. **Explain the layered architecture used in this Spring Boot application.**

**Answer:** The application follows a classic three-tier architecture:
- **Controller Layer**: Handles HTTP requests and responses (`AuthController`, `JobController`). It's responsible for request validation, calling the service layer, and returning appropriate HTTP responses.
- **Service Layer**: Contains business logic (`UserService`, `JobService`). It orchestrates operations, handles transactions, and delegates to repositories for data access.
- **Repository Layer**: Data access layer using Spring Data JPA (`UserRepository`, `JobRepository`). It abstracts database operations using JPA specifications.

This separation promotes testability, maintainability, and follows the Single Responsibility Principle. Each layer can be tested independently, and changes in one layer don't cascade to others.

### 2. **How does dependency injection work in this project?**

**Answer:** The project uses Spring's constructor-based dependency injection:
- `@Autowired` annotation on constructors (e.g., in `UserService`, `JobService`)
- Spring automatically provides the required dependencies at runtime
- For configuration classes like `SecurityConfig`, dependencies are injected through the constructor

**Best Practice:** Constructor injection is preferred over field injection because:
- It makes dependencies explicit and immutable (final fields)
- Enables easier unit testing (can mock dependencies)
- Ensures the object is always in a valid state after construction
- Works better with Spring's required dependency checking

### 3. **Explain the purpose of `@RestController` and `@RequestMapping` annotations.**

**Answer:** 
- `@RestController`: Combines `@Controller` and `@ResponseBody`. It tells Spring that all methods in this class return domain objects instead of views, which Spring automatically serializes to JSON. Used in `AuthController` and `JobController`.
- `@RequestMapping`: Maps HTTP requests to handler methods at the class level. In this project, `/auth` maps to `AuthController` and `/jobs` maps to `JobController`.

This eliminates the need to add `@ResponseBody` to every method individually and provides a clean RESTful API structure.

### 4. **How are profiles managed in this application?**

**Answer:** The application uses Spring profiles for environment-specific configuration:
- **Dev profile**: `application-dev.properties` uses H2 in-memory database with `ddl-auto=create-drop` for rapid development
- **Default profile**: `application.properties` uses MySQL with environment variables for production
- Activated via: `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`

This allows seamless switching between development and production environments without code changes. The H2 console is enabled only in dev mode for database inspection.

### 5. **What is the role of `@Entity` and `@Table` annotations in JPA?**

**Answer:** 
- `@Entity`: Marks a class as a JPA entity, meaning it represents a table in the database. Used in `User` and `Job` classes.
- `@Table`: Specifies the table name. Without it, JPA uses the class name as the table name. In this project, `User` maps to `users` table and `Job` maps to `jobs` table.

JPA then handles the ORM mapping, automatically generating SQL for CRUD operations based on these annotations.

---

## Spring Security & JWT

### 6. **Explain the JWT authentication flow in this application.**

**Answer:** The JWT flow works as follows:
1. **Registration/Login**: User sends credentials to `/auth/register` or `/auth/login`
2. **Token Generation**: `JwtUtil.generateToken()` creates a JWT with the user's email as subject, signed with HS256 algorithm
3. **Token Storage**: Frontend stores the JWT in `localStorage`
4. **Token Submission**: Frontend includes the token in the `Authorization: Bearer <token>` header for subsequent requests
5. **Token Validation**: `JwtAuthFilter` intercepts requests, extracts the token, validates it using `JwtUtil.validateToken()`, and sets the authentication in `SecurityContextHolder`
6. **Access Control**: Protected endpoints check the authentication context via `SecurityContextHolder.getContext().getAuthentication().getName()`

This stateless approach eliminates server-side session storage and enables horizontal scaling.

### 7. **Why is the session management policy set to STATELESS in SecurityConfig?**

**Answer:** `SessionCreationPolicy.STATELESS` is used because:
- JWT authentication doesn't require server-side sessions
- Each request is independently authenticated using the JWT token
- No HttpSession is created or used by Spring Security
- Enables stateless REST API design
- Improves scalability as servers don't need to share session state
- Reduces memory usage on the server

This is essential for modern microservices and cloud-native applications where horizontal scaling is common.

### 8. **How does `JwtAuthFilter` extend `OncePerRequestFilter` and why is this important?**

**Answer:** `OncePerRequestFilter` ensures the filter executes exactly once per request. This is crucial because:
- In some servlet containers, filters might be invoked multiple times (e.g., during request dispatches)
- JWT validation should happen only once per request to avoid performance overhead
- Prevents duplicate authentication checks
- Guarantees consistent behavior across different servlet containers

The filter extracts the JWT from the `Authorization` header, validates it, extracts the email, creates an `Authentication` object with `ROLE_USER` authority, and sets it in the security context.

### 9. **Explain the security configuration for public vs. protected endpoints.**

**Answer:** In `SecurityConfig`, endpoints are secured as follows:
- **Public endpoints**: `/`, `/health`, `/error`, `/auth/**`, `/h2-console/**` are permitted with `.requestMatchers().permitAll()`
- **Protected endpoints**: All other paths require authentication with `.anyRequest().authenticated()`
- **CSRF disabled**: Since it's a stateless JWT API, CSRF protection is disabled
- **H2 console frame options disabled**: Allows H2 console to load in iframes for development

The `JwtAuthFilter` is added before `UsernamePasswordAuthenticationFilter` to intercept requests before Spring's default authentication mechanism.

### 10. **How is password hashing implemented and why is BCrypt used?**

**Answer:** Password hashing is implemented using `BCryptPasswordEncoder`:
- Passwords are hashed during registration: `passwordEncoder.encode(password)` in `UserService.register()`
- Passwords are verified during login: `passwordEncoder.matches(rawPassword, hashedPassword)` in `UserService.login()`
- BCrypt is used because:
  - It automatically includes a random salt, preventing rainbow table attacks
  - It's computationally expensive (adaptive cost factor), slowing down brute-force attacks
  - It's a widely-adopted, battle-tested algorithm
  - Built into Spring Security with simple API

The `@JsonIgnore` annotation on the `password` field in `User` entity prevents the hashed password from being serialized in API responses.

### 11. **What happens if a JWT token expires? How is this handled?**

**Answer:** Currently, the application doesn't handle token expiration gracefully:
- `JwtUtil.generateToken()` sets expiration to 1 hour: `System.currentTimeMillis() + 1000 * 60 * 60`
- When an expired token is sent, `JwtUtil.validateToken()` throws an exception
- `JwtAuthFilter` catches the exception and returns `401 Unauthorized` with "Invalid Token" message
- The frontend would need to redirect to login page on 401 responses

**Improvement:** Implement token refresh mechanism with refresh tokens or short-lived access tokens with longer-lived refresh tokens for better UX.

---

## JPA & Database Design

### 12. **Explain the relationship between User and Job entities.**

**Answer:** It's a **Many-to-One** relationship from Job to User:
- `Job` entity has `@ManyToOne` annotation with `@JoinColumn(name = "user_id")`
- One User can have multiple Jobs
- Each Job belongs to exactly one User
- The foreign key `user_id` is stored in the `jobs` table
- `JobRepository.findByUserEmail()` uses this relationship to fetch jobs by user email

This design ensures data isolation - users can only access their own jobs, which is enforced in the service layer.

### 13. **How does JPA handle the ID generation strategy?**

**Answer:** The project uses `@GeneratedValue(strategy = GenerationType.IDENTITY)`:
- Uses the database's auto-increment feature (MySQL) or sequence (H2)
- The database generates the ID upon insert
- JPA retrieves the generated ID and populates the entity field
- Simple and works across different databases

Alternative strategies include `SEQUENCE` (database sequences), `TABLE` (separate table for ID generation), and `AUTO` (JPA chooses based on database).

### 14. **What is the difference between `ddl-auto=create-drop` and `ddl-auto=update`?**

**Answer:**
- **create-drop** (dev profile): Drops and recreates the schema on startup. Good for development as it ensures a clean slate, but loses all data on restart.
- **update** (production): Updates the schema based on entity changes without dropping data. Safer for production but can have limitations with complex schema changes.

**Other options:**
- `none`: No schema management (manual)
- `validate`: Validates schema against entities, doesn't make changes
- `create`: Creates schema on startup, doesn't drop on shutdown

### 15. **How are custom queries implemented in the repositories?**

**Answer:** Spring Data JPA provides query derivation from method names:
- `UserRepository.findByEmail(String email)`: Automatically generates SQL: `SELECT * FROM users WHERE email = ?`
- `JobRepository.findByUserEmail(String email)`: Generates SQL with JOIN to fetch jobs by user email

For complex queries, you can use:
- `@Query` annotation with JPQL or native SQL
- Specification API for dynamic queries
- Querydsl for type-safe queries

This convention-over-configuration approach reduces boilerplate code significantly.

### 16. **Explain the lazy loading vs. eager loading in JPA.**

**Answer:** 
- **Default**: `@ManyToOne` is EAGER, `@OneToMany` is LAZY
- **EAGER**: Fetches related entities immediately with the parent. Can cause N+1 query problems if not careful.
- **Lazy**: Fetches related entities only when accessed. Requires an active session or `@Transactional`.

In this project, the `@ManyToOne` relationship from Job to User is eager by default, meaning when you fetch a Job, the associated User is also fetched. This is acceptable here since we always need the user for authorization checks.

### 17. **How would you optimize database queries if the job list grows large?**

**Answer:** Optimization strategies:
- **Pagination**: Use `Pageable` in repository methods: `Page<Job> findByUserEmail(String email, Pageable pageable)`
- **Indexing**: Add `@Index` on frequently queried fields like `user_id`, `status`, `applied_date`
- **DTO Projection**: Use projection interfaces to fetch only needed fields instead of full entities
- **Caching**: Implement Spring Cache with Redis for frequently accessed data
- **Batch fetching**: Use `@EntityGraph` to specify fetch plans and avoid N+1 queries
- **Query optimization**: Use `EXPLAIN` to analyze query execution plans

Example with pagination:
```java
Page<Job> findByUserEmail(String email, Pageable pageable);
// Usage: repository.findByUserEmail(email, PageRequest.of(0, 20))
```

---

## React & Frontend

### 18. **Explain the state management approach used in the React frontend.**

**Answer:** The application uses React's built-in hooks for state management:
- **useState**: For local component state (jobs, loading states, form inputs, toast messages)
- **useEffect**: For side effects (fetching jobs on mount, token changes)
- **useCallback**: For memoizing functions to prevent unnecessary re-renders (loadJobs function)

This is a simple, lightweight approach suitable for small to medium applications. For larger apps, consider Redux, Zustand, or Context API for global state.

### 19. **How is JWT token managed on the frontend?**

**Answer:** JWT tokens are managed using `localStorage`:
- **Storage**: `localStorage.setItem("token", token)` after successful login in `api.js`
- **Retrieval**: `localStorage.getItem("token")` in `authHeaders()` function
- **Removal**: `localStorage.removeItem("token")` on logout
- **Usage**: Token is included in the `Authorization: Bearer <token>` header for all authenticated API calls

**Security Consideration:** `localStorage` is vulnerable to XSS attacks. More secure alternatives include:
- HttpOnly cookies (not accessible via JavaScript)
- Short-lived tokens with refresh token rotation
- Implementing Content Security Policy (CSP) headers

### 20. **Explain the view routing mechanism in App.jsx.**

**Answer:** The application uses conditional rendering for view management:
- State variable `view` determines which component to render: "home", "login", "register", or "dashboard"
- `getInitialView()` checks for token presence on load to determine initial view
- `useEffect` monitors token changes and updates view accordingly
- Each component receives callback functions to navigate between views (e.g., `onLogin`, `onLogout`)

This is a simple approach for small applications. For larger apps, React Router provides more robust routing with browser history management.

### 21. **How are API errors handled in the frontend?**

**Answer:** Error handling is implemented at multiple levels:
- **API layer**: `api.js` throws errors with descriptive messages when `!res.ok`
- **Component level**: Try-catch blocks in async functions (e.g., `handleAddJob`, `handleStatusChange`)
- **User feedback**: Toast notifications show success/error messages to users
- **Loading states**: Loading spinners during async operations prevent duplicate submissions

**Improvement:** Implement centralized error handling with axios interceptors or a custom hook to standardize error responses (e.g., 401 redirects to login, 403 shows permission errors).

### 22. **Explain the glassmorphism UI implementation.**

**Answer:** Glassmorphism is achieved through CSS:
- **Backdrop blur**: `backdrop-filter: blur(10px)` creates frosted glass effect
- **Semi-transparent backgrounds**: `background: rgba(255, 255, 255, 0.1)` for transparency
- **Border effects**: Subtle borders with `border: 1px solid rgba(255, 255, 255, 0.2)`
- **Shadows**: Layered shadows for depth
- **Animated background**: Moving blob elements create dynamic visual interest

This modern UI pattern provides visual hierarchy while maintaining content readability.

### 23. **How does the Dashboard component handle real-time updates?**

**Answer:** The Dashboard uses optimistic updates:
- **Add job**: Immediately adds the new job to the state array before API call completes, then updates with server response
- **Update status**: Updates local state immediately, then syncs with API
- **Delete job**: Removes from local state immediately, then calls API
- **Error handling**: If API fails, reverts changes and shows error toast

This provides instant user feedback and perceived performance. The `useCallback` hook memoizes the `loadJobs` function to prevent unnecessary re-renders.

### 24. **What is the purpose of the animated background elements?**

**Answer:** The animated background (`animated-bg`, `blob-extra` elements):
- Creates visual interest and modern aesthetic
- Uses CSS animations (`@keyframes`) for smooth movement
- Positioned behind content with `z-index: -1`
- Demonstrates CSS animation skills
- Provides engaging user experience

The blobs move in patterns to create a dynamic, living interface without distracting from the main content.

---

## API Design & Best Practices

### 25. **Explain the RESTful API design principles followed in this project.**

**Answer:** The API follows REST principles:
- **Resource-based URLs**: `/jobs` represents job resource collection
- **HTTP methods**: GET (retrieve), POST (create), PUT (update), DELETE (remove)
- **Stateless**: Each request contains all necessary information (JWT token)
- **JSON responses**: Consistent JSON format for all endpoints
- **Proper status codes**: 200 for success, 401 for unauthorized, 404 for not found, 409 for conflicts
- **Noun-based endpoints**: `/auth/register`, `/auth/login` instead of `/registerUser`

**Improvement**: Use HATEOAS (Hypermedia as the Engine of Application State) to include links to related resources in responses.

### 26. **Why are DTOs (Data Transfer Objects) used instead of exposing entities directly?**

**Answer:** DTOs provide several benefits:
- **Security**: Hides sensitive fields (password) from API responses
- **Validation**: Can add validation annotations specific to API input
- **Decoupling**: Changes to entity structure don't break API contracts
- **Flexibility**: Can combine multiple entities or transform data for API needs
- **Performance**: Can include only necessary fields, reducing payload size

In this project: `RegisterRequest`, `JobRequest`, `UserResponse` DTOs separate API contracts from domain models.

### 27. **How is CORS (Cross-Origin Resource Sharing) configured?**

**Answer:** CORS is configured in `CorsConfig`:
- **Allowed origins**: `setAllowedOriginPatterns(List.of("*"))` allows all origins (configure specific origins in production)
- **Allowed methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed headers**: All headers with `*`
- **Credentials**: Enabled with `setAllowCredentials(true)` for JWT cookies (if used)
- **Applied globally**: Via `corsConfigurationSource()` bean

This allows the React frontend (different origin) to communicate with the Spring Boot backend.

**Security Note**: In production, replace `*` with specific trusted origins to prevent CSRF attacks.

### 28. **Explain the authorization pattern used in JobController.**

**Answer:** Authorization is implemented through:
- **JWT authentication**: `JwtAuthFilter` validates token and sets authentication context
- **Email extraction**: `SecurityContextHolder.getContext().getAuthentication().getName()` retrieves the authenticated user's email
- **Ownership check**: Service layer verifies the job belongs to the authenticated user before update/delete operations
- **Role-based**: All authenticated users have `ROLE_USER` (could extend to roles like ADMIN)

This ensures users can only access their own data. The pattern is:
```
Controller: Extract email from security context
Service: Verify ownership before operation
Repository: Perform data access
```

### 29. **How would you implement API versioning in this project?**

**Answer:** API versioning strategies:
- **URL path versioning**: `/api/v1/jobs`, `/api/v2/jobs`
- **Header versioning**: `Accept: application/vnd.api.v1+json`
- **Query parameter versioning**: `/jobs?version=1`

**Implementation with URL versioning:**
```java
@RestController
@RequestMapping("/api/v1/jobs")
public class JobControllerV1 { ... }

@RestController
@RequestMapping("/api/v2/jobs")
public class JobControllerV2 { ... }
```

This allows breaking changes without affecting existing clients.

### 30. **What is the purpose of the HealthController?**

**Answer:** `HealthController` provides a health check endpoint:
- **Endpoint**: `/health` returns simple status
- **Purpose**: Used by orchestration tools (Kubernetes, Docker health checks) to verify the application is running
- **Load balancers**: Use health checks to route traffic only to healthy instances
- **Monitoring**: Integrated with monitoring systems for uptime tracking

**Improvement**: Use Spring Boot Actuator which provides comprehensive health indicators (database, disk space, etc.) at `/actuator/health`.

---

## Error Handling & Exception Management

### 31. **Explain the global exception handling mechanism.**

**Answer:** Exception handling is centralized using `@RestControllerAdvice`:
- **GlobalExceptionHandler**: Catches exceptions across all controllers
- **Specific handlers**: `@ExceptionHandler(UserAlreadyExistsException.class)` returns 409 Conflict
- **Default handling**: Spring Boot handles uncaught exceptions with default error responses
- **Custom exceptions**: `UserAlreadyExistsException` for domain-specific errors

**Benefits:**
- Consistent error response format
- Centralized error logging
- Separation of error handling from business logic
- Easy to add new exception handlers

**Improvement**: Create a standardized error response DTO with fields like `timestamp`, `status`, `error`, `message`, `path`.

### 32. **How are validation errors handled in the API?**

**Answer:** Currently, validation is minimal:
- Manual validation in services (e.g., checking if user exists)
- `@NotNull`, `@NotEmpty` annotations could be added to DTOs
- No automatic validation error handling

**Improvement:** Add Bean Validation:
```java
public class RegisterRequest {
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
```

Then add a validation exception handler in `GlobalExceptionHandler`.

### 33. **What happens when a user tries to access another user's job?**

**Answer:** The application implements ownership checks:
- In `JobService.updateJob()`: `if (!job.getUser().getEmail().equals(email))` throws 403 Forbidden
- In `JobService.deleteJob()`: Same ownership check
- Returns `ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this job")`

This prevents unauthorized access to data. The check is in the service layer, ensuring business logic enforcement regardless of how the service is called.

### 34. **How would you implement logging for debugging and monitoring?**

**Answer:** Logging implementation:
- **SLF4J with Logback**: Spring Boot's default logging framework
- **Log levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Configuration**: In `application.properties`:
```properties
logging.level.com.kowshik.jobtracker=DEBUG
logging.level.org.springframework.web=INFO
logging.file.name=app.log
```
- **Structured logging**: Use JSON format for log aggregation tools
- **Request logging**: Add logging filter to log all incoming requests
- **Error logging**: Log exceptions with stack traces in exception handlers

**Best Practice**: Use meaningful log messages with context (user ID, request ID) for troubleshooting.

---

## Deployment & DevOps

### 35. **Explain the multi-stage Docker build process.**

**Answer:** The Dockerfile uses multi-stage builds:
- **Build stage**:
  - Base image: `maven:3.9.6-eclipse-temurin-17`
  - Copies `pom.xml` and source code
  - Runs `mvn clean package -DskipTests` to build JAR
- **Run stage**:
  - Base image: `eclipse-temurin:17-jre-jammy` (smaller JRE-only image)
  - Copies only the JAR from build stage
  - Exposes port 8080
  - Sets entrypoint to run the JAR

**Benefits:**
- Smaller final image (no Maven, no build tools)
- Faster deployment (smaller image to push/pull)
- Better security (fewer vulnerabilities in final image)
- Separation of build and runtime dependencies

### 36. **How is the application configured for Railway deployment?**

**Answer:** Railway configuration:
- **Environment variables**: MySQL credentials (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`) and `JWT_SECRET`
- **Port configuration**: `server.port=${PORT:8080}` uses Railway's assigned port
- **Root directory**: Set to `/jobtracker` as Maven project is in subfolder
- **Database**: Railway provides managed MySQL instance
- **railway.json**: Configuration file for Railway deployment settings

This enables zero-configuration deployment to Railway's cloud platform.

### 37. **Explain the difference between H2 and MySQL database configurations.**

**Answer:**
- **H2 (development)**:
  - In-memory database: `jdbc:h2:mem:devdb`
  - No external setup required
  - `ddl-auto=create-drop` for clean schema on each restart
  - H2 console enabled at `/h2-console`
  - Fast for testing and development
  
- **MySQL (production)**:
  - Persistent database: `jdbc:mysql://host:port/db`
  - Requires external MySQL instance
  - `ddl-auto=update` for schema migration
  - Production-ready with ACID compliance
  - Better for large-scale applications

### 38. **How would you implement database migrations for production?**

**Answer:** Database migration strategies:
- **Flyway**: Version-controlled SQL migrations
- **Liquibase**: XML/JSON/YAML based migrations

**Flyway implementation:**
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

Create migration files in `src/main/resources/db/migration/`:
```
V1__Create_users_table.sql
V2__Create_jobs_table.sql
V3__Add_index_on_user_id.sql
```

Set `spring.jpa.hibernate.ddl-auto=validate` to let Flyway handle schema changes.

### 39. **What environment variables should be kept secret in production?**

**Answer:** Sensitive environment variables:
- `JWT_SECRET`: Secret key for JWT signing (use strong, random value)
- `MYSQLPASSWORD`: Database password
- `MYSQLUSER`: Database username (if not default)
- Any API keys for third-party services

**Best Practices:**
- Never commit secrets to version control
- Use secret management tools (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use different secrets for different environments
- Implement secret scanning in CI/CD pipeline

### 40. **How would you set up CI/CD for this project?**

**Answer:** CI/CD pipeline steps:
- **Source control**: GitHub/GitLab repository
- **Build stage**:
  - Run tests: `mvn test`
  - Build backend: `mvn package`
  - Build frontend: `npm run build`
- **Test stage**:
  - Unit tests
  - Integration tests
  - E2E tests with Playwright/Cypress
- **Deploy stage**:
  - Docker image build and push to registry
  - Deploy to Railway/AWS/Heroku
  - Run database migrations
  - Health check validation

**GitHub Actions example:**
```yaml
name: CI/CD
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Build with Maven
        run: mvn clean package
      - name: Run tests
        run: mvn test
```

---

## Security & Performance

### 41. **What security vulnerabilities exist in the current implementation and how would you fix them?**

**Answer:** Identified vulnerabilities and fixes:
- **JWT in localStorage**: Vulnerable to XSS. Fix: Use HttpOnly cookies or implement CSP
- **Weak JWT secret**: Default secret in code. Fix: Use strong environment variable, rotate regularly
- **CORS with * origin**: Allows any origin. Fix: Specify allowed origins in production
- **No rate limiting**: Vulnerable to brute force. Fix: Implement rate limiting with Spring Security or API Gateway
- **No input validation**: Missing validation on DTOs. Fix: Add Bean Validation annotations
- **CSRF disabled**: Acceptable for stateless JWT, but ensure proper CORS configuration
- **No HTTPS enforcement**: Fix: Configure SSL/TLS, redirect HTTP to HTTPS

### 42. **How would you implement rate limiting for the API?**

**Answer:** Rate limiting implementation:
- **Spring Boot Starter for Bucket4j**: Token bucket algorithm
- **Redis-backed**: Distributed rate limiting across multiple instances

**Implementation:**
```java
@Bean
public FilterRegistrationBean<RateLimitFilter> rateLimitFilter() {
    FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>();
    registration.setFilter(new RateLimitFilter());
    registration.addUrlPatterns("/api/*");
    return registration;
}
```

**Strategies:**
- Per IP rate limiting
- Per user rate limiting (after authentication)
- Different limits for different endpoints (e.g., stricter for login)

### 43. **Explain how to optimize the React application performance.**

**Answer:** Performance optimization techniques:
- **Code splitting**: Use `React.lazy()` and `Suspense` for lazy loading components
- **Memoization**: `React.memo()` for component memoization, `useMemo()` for expensive calculations
- **Virtualization**: For long lists, use react-window or react-virtualized
- **Image optimization**: Compress images, use WebP format, lazy load images
- **Bundle analysis**: Use webpack-bundle-analyzer to identify large dependencies
- **Tree shaking**: Remove unused code (Vite does this automatically)
- **Caching**: Implement service worker for offline caching
- **Minification**: Already handled by Vite build process

**Example with lazy loading:**
```jsx
const Dashboard = React.lazy(() => import('./components/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  );
}
```

### 44. **How would you implement caching in the Spring Boot application?**

**Answer:** Caching strategies:
- **Spring Cache abstraction**: `@Cacheable`, `@CacheEvict`, `@CachePut`
- **Redis**: Distributed cache for production
- **Caffeine**: In-memory cache for development

**Implementation:**
```java
@EnableCaching
@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new RedisCacheManager(redisTemplate());
    }
}

@Service
public class JobService {
    @Cacheable(value = "jobs", key = "#email")
    public List<Job> getJobs(String email) {
        return jobRepository.findByUserEmail(email);
    }
    
    @CacheEvict(value = "jobs", key = "#email")
    public Job addJob(String email, ...) {
        // Add job
    }
}
```

**Cache invalidation strategies:**
- Time-based expiration (TTL)
- Event-based invalidation on updates
- Manual invalidation when needed

---

## Design Patterns & Architecture

### 45. **What design patterns are used in this project?**

**Answer:** Identified design patterns:
- **Repository Pattern**: `UserRepository`, `JobRepository` abstract data access
- **Service Layer Pattern**: Business logic separation in `UserService`, `JobService`
- **DTO Pattern**: Data transfer objects for API contracts
- **Filter Pattern**: `JwtAuthFilter` for request pre-processing
- **Singleton Pattern**: Spring beans are singletons by default
- **Dependency Injection**: IoC container manages dependencies
- **Facade Pattern**: Controllers provide simplified interface to complex subsystems
- **Strategy Pattern**: Different authentication strategies (could be extended)

These patterns promote loose coupling, testability, and maintainability.

### 46. **How would you refactor the application to support multiple user roles (ADMIN, USER)?**

**Answer:** Role-based access control implementation:
- **Update User entity**: Add more roles or use enum
- **Modify JWT**: Include roles in token claims
- **Update SecurityConfig**: Add role-based authorization
- **Service layer**: Add role checks

**Implementation:**
```java
// In JwtUtil
public static String generateToken(String email, String role) {
    return Jwts.builder()
        .setSubject(email)
        .claim("role", role)
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
}

// In SecurityConfig
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .requestMatchers("/jobs/**").hasAnyRole("ADMIN", "USER")
)

// In JwtAuthFilter
List<SimpleGrantedAuthority> authorities = List.of(
    new SimpleGrantedAuthority("ROLE_" + role)
);
```

### 47. **Explain how to implement soft delete for jobs instead of hard delete.**

**Answer:** Soft delete implementation:
- **Add field to Job entity**:
```java
@Column(name = "deleted")
private Boolean deleted = false;

@Column(name = "deleted_at")
private LocalDateTime deletedAt;
```
- **Update repository**: Add custom query methods
```java
@Query("SELECT j FROM Job j WHERE j.deleted = false AND j.user.email = :email")
List<Job> findActiveJobsByEmail(@Param("email") String email);
```
- **Update service**: Set deleted flag instead of deleting
```java
public void softDeleteJob(Long id, String email) {
    Job job = jobRepository.findById(id).orElseThrow(...);
    job.setDeleted(true);
    job.setDeletedAt(LocalDateTime.now());
    jobRepository.save(job);
}
```
- **Benefits**: Data recovery, audit trail, referential integrity

---

## Troubleshooting & Scenarios

### 48. **A user reports they can't login after password reset. How would you debug this?**

**Answer:** Debugging steps:
1. **Check logs**: Look for authentication errors in application logs
2. **Verify user exists**: Query database to confirm user record exists
3. **Check password hash**: Verify password was properly hashed during reset
4. **Test authentication**: Manually test login with the credentials
5. **Check JWT generation**: Verify token is being generated correctly
6. **Frontend debugging**: Check browser console for errors, network tab for failed requests
7. **Token validation**: Test JWT validation with tools like jwt.io
8. **Database connection**: Ensure database is accessible and connection pool is healthy

**Common issues:**
- Password not hashed during reset
- User account locked or disabled
- JWT secret mismatch between environments
- Frontend not handling token correctly
- Browser blocking localStorage

### 49. **The application is slow when loading the dashboard with many jobs. How would you optimize it?**

**Answer:** Optimization approach:
1. **Database queries**:
   - Add EXPLAIN to analyze query execution
   - Add indexes on `user_id`, `status`, `applied_date`
   - Use pagination to limit results
   - Implement lazy loading for related entities
2. **Frontend**:
   - Implement virtual scrolling for job list
   - Add loading skeletons for perceived performance
   - Implement pagination/infinite scroll
   - Cache API responses with React Query or SWR
3. **Backend**:
   - Add database query caching
   - Implement response compression
   - Use DTO projections to reduce payload size
4. **Network**:
   - Enable HTTP/2
   - Use CDN for static assets
   - Implement API response caching

**Specific implementation:**
```java
// Pagination
@GetMapping
public Page<Job> getJobs(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) {
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    return jobService.getJobs(email, PageRequest.of(page, size));
}
```

### 50. **How would you handle database schema changes in production without downtime?**

**Answer:** Zero-downtime migration strategy:
1. **Backward-compatible changes**:
   - Add new columns with default values
   - Add new tables (don't drop old ones yet)
2. **Deploy application version 1**:
   - Application handles both old and new schema
   - Code checks for column existence
3. **Run data migration**:
   - Migrate data from old to new structure
   - Validate data integrity
4. **Deploy application version 2**:
   - Remove old schema references
   - Use only new schema
5. **Clean up**:
   - Drop old columns/tables after monitoring period

**Tools:**
- Flyway/Liquibase for version-controlled migrations
- Blue-green deployment for zero downtime
- Feature flags to enable new functionality gradually
- Rollback plan if migration fails

**Example migration script:**
```sql
-- V1__Add_location_column.sql
ALTER TABLE jobs ADD COLUMN location VARCHAR(255);

-- V2__Migrate_location_data.sql
UPDATE jobs SET location = 'Remote' WHERE location IS NULL;

-- V3__Make_location_not_null.sql
ALTER TABLE jobs MODIFY COLUMN location VARCHAR(255) NOT NULL;
```

---

## Conclusion

These 50 questions cover the essential aspects of the JobTracker project, from basic architecture to advanced troubleshooting scenarios. Understanding these concepts demonstrates a comprehensive knowledge of modern full-stack development with Spring Boot and React.

### Key Takeaways:
- **Architecture**: Layered design with separation of concerns
- **Security**: JWT-based stateless authentication with proper authorization
- **Database**: JPA with relationship mapping and query optimization
- **Frontend**: React hooks for state management and modern UI patterns
- **DevOps**: Docker containerization and cloud deployment
- **Best Practices**: Error handling, validation, caching, and performance optimization

This project serves as an excellent foundation for discussing real-world software engineering challenges and solutions in technical interviews.
