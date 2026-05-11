# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw ./
COPY pom.xml ./
# Make the wrapper script executable
RUN chmod +x ./mvnw
# Download dependencies (this layer is cached)
RUN ./mvnw dependency:go-offline
# Copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar
# Expose the port (Render will override this via the PORT environment variable)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
