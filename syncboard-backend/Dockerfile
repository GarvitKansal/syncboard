# Stage 1: Build JAR using Maven and Java 21
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy dependency files first for layer caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN ./mvnw dependency:go-offline -B

# Copy source code and package
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S syncgroup && adduser -S syncuser -G syncgroup
USER syncuser

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]