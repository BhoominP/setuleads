# Multi-stage Dockerfile for Spring Boot Backend on Render
# Stage 1: Build Jar using Maven & JDK 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java Runtime Environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/setuleads-backend-1.0.0.jar app.jar

# Render assigns dynamic PORT environment variable (default 8080)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
