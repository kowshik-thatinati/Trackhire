# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build
#   Pre-fetches dependencies in a cached layer before copying source,
#   so rebuilds that only change source code skip the slow dep-download step.
# ─────────────────────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy POM first and pre-fetch dependencies (this layer is cached)
COPY pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress -q

# Copy source and build the fat JAR
COPY src ./src
RUN mvn clean package --no-transfer-progress -DskipTests

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Runtime
#   Minimal Alpine JRE (~85 MB). Non-root user. Container-aware JVM flags.
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

# Respect container CPU/memory limits, improve startup entropy
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Health check via Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
