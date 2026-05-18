# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build
#   Uses Maven image to resolve deps then compile.
#   Dependency layer is cached separately so rebuilds are fast.
# ─────────────────────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy POM first and pre-fetch all dependencies (cacheable layer)
COPY jobtracker/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress -q

# Copy source and build the fat JAR
COPY jobtracker/src ./src
RUN mvn clean package --no-transfer-progress -DskipTests

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Runtime
#   Minimal Alpine JRE image. Non-root user for security.
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Set ownership
RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

# JVM tuning: respect container CPU/memory limits
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
