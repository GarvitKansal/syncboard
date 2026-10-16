# Stage 1: Build JAR using Maven and Java 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Install maven directly
RUN apk add --no-cache maven

# Copy POM and download dependencies first for caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S syncgroup && adduser -S syncuser -G syncgroup
USER syncuser

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]