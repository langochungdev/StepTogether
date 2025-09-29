# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# copy pom trước để cache dependency
COPY pom.xml .
RUN mvn dependency:go-offline -B

# copy source code
COPY src ./src

# build jar
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# copy file jar từ stage build
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
