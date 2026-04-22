# ==========================================
# Stage 1: Build Frontend (Next.js)
# ==========================================
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
RUN mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static
RUN if [ -d public ]; then cp -r public .next/standalone/public; fi

# ==========================================
# Stage 2: Build Backend (Spring Boot)
# ==========================================
FROM maven:3.9.8-eclipse-temurin-21 AS build-backend
WORKDIR /workspace
COPY backend/pom.xml ./
RUN mvn -q -B dependency:go-offline || true
COPY backend/src ./src
RUN mvn -q -B clean package -DskipTests

# ==========================================
# Stage 3: Final Runtime Image (All-in-One)
# ==========================================
FROM eclipse-temurin:21-jre-jammy

# Install Node.js 20, Python 3.11, and Supervisord
RUN apt-get update && apt-get install -y \
    curl \
    python3.11 \
    python3-pip \
    python3-venv \
    supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Setup Python AI Service
COPY ai-service/requirements.txt ./ai-service/
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir -r ai-service/requirements.txt
COPY ai-service/ ./ai-service/

# Setup Spring Boot Backend
COPY --from=build-backend /workspace/target/*.jar ./backend/app.jar

# Setup Next.js Frontend
COPY --from=build-frontend /app/.next/standalone ./frontend/
# Note: standalone includes server.js, but public folder must be next to it if we had one
RUN cp -r /app/frontend/public ./frontend/public || true

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Default environment variables
ENV HOSTNAME=0.0.0.0
# Next.js will use this PORT variable automatically
ENV PORT=3000

# Expose Frontend(3000), Backend(8080), AI Service(8000)
EXPOSE 3000 8080 8000

# Start Supervisor which manages all 3 services
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
