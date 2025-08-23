# Multi-stage Dockerfile for Kooora Backend
# Stage 1: Build stage
FROM maven:3.9.6-amazoncorretto-21 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies (for better layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime stage
FROM amazoncorretto:21-alpine

# Set labels for image metadata
LABEL maintainer="Kooora Team"
LABEL version="1.0.0"
LABEL description="Kooora Football Application Backend"

# Create app user for security
RUN addgroup -g 1001 -S kooora && \
    adduser -u 1001 -S kooora -G kooora

# Install required packages
RUN apk add --no-cache \
    curl \
    tzdata

# Set timezone (can be overridden with environment variable)
ENV TZ=UTC
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory and logs directory
RUN mkdir -p /app /var/log/kooora && \
    chown -R kooora:kooora /app /var/log/kooora

# Set working directory
WORKDIR /app

# Copy the JAR file from builder stage
COPY --from=builder /app/target/kooora-backend.jar app.jar

# Change ownership to app user
RUN chown kooora:kooora app.jar

# Switch to non-root user
USER kooora

# Expose port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM optimization arguments
ENV JAVA_OPTS="-Xmx1g -Xms512m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=prod"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
