# 🚚 Flotera — Fleet Management System

[![Vite](https://img.shields.io/badge/Vite-8A2BE2?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**Flotera** is a professional **Fleet Management System** designed to streamline operations, manage vehicles, track maintenance history, log incidents, and coordinate driver assignments. Built with a decoupled **Spring Boot** backend and an interactive **React & TypeScript** frontend, the platform integrates **Supabase** for secure authentication and cloud storage.

---

## 🌟 Key Features

*   **📊 Interactive Dashboard**: Visualizes real-time metrics, active fleet status, pending service tasks, and fleet distributions using interactive charts.
*   **🚗 Fleet Management**: Core CRUD functionality to register, edit, and track vehicle details including license plates, make/model, operational status, and mileage.
*   **🔧 Service History Log**: Tracks vehicle maintenance records, costs, service dates, and types (routine checks, repairs).
*   **⚠️ Incident Reporting**: Streamlines incident reporting with severity levels, descriptions, and file uploads.
*   **👥 Driver Assignments**: Allocates and manages driver assignments for fleet vehicles.
*   **🔐 Secure JWT Authentication**: Implements Supabase Auth on the client side with token validation in the Spring Boot backend using Spring Security.
*   **📁 File Storage**: Supports uploading incident-related images to either the local filesystem or a Supabase Storage bucket.

---

## 🏗️ Architecture & Data Flow

```
┌───────────────────┐               ┌────────────────────────┐
│   React Client    ├──────────────►│  Spring Boot Backend   │
│   (Vite + TS)     │  API (JWT)    │  (OAuth2 Resource)     │
└─────────┬─────────┘               └───────────┬────────────┘
          │                                     │
          ▼                                     ▼
┌───────────────────┐               ┌────────────────────────┐
│   Supabase Auth   │               │   PostgreSQL / H2 DB   │
└───────────────────┘               └────────────────────────┘
```

1.  **Authentication**: Users authenticate via Supabase. The React client attaches the resulting JWT token to the `Authorization` header of all subsequent API requests.
2.  **Authorization**: The Spring Boot backend acts as an OAuth2 Resource Server, validating token signatures locally.
3.  **Persistence**: The backend processes business logic and interacts with the database via Spring Data JPA.

---

## 🛠️ Technology Stack

### Frontend
*   **React 19 & TypeScript**
*   **Vite** (Build Tool)
*   **Tailwind CSS** (Styling)
*   **TanStack React Query v5** (Server State Management)
*   **Framer Motion** (Animations)
*   **Recharts** (Data Visualization)
*   **Lucide React** (Icons)
*   **Axios** (HTTP Client)

### Backend
*   **Java 17 & Spring Boot 4.x**
*   **Spring Security & OAuth2 Resource Server**
*   **Spring Data JPA**
*   **PostgreSQL** (Production DB)
*   **H2 Database** (Development DB)
*   **Docker** (Multi-stage containerization)

---

## 🚀 Getting Started

### 📋 Prerequisites
*   [Java Development Kit (JDK) 17+](https://adoptium.net/)
*   [Node.js (v18+) & npm](https://nodejs.org/)
*   [Supabase](https://supabase.com) account

---

### ⚙️ Backend Setup (Spring Boot)

1.  **Configure Environment Variables**:
    Create or export the following variables (or edit `backend/src/main/resources/application.properties`):

    ```properties
    SPRING_PROFILES_ACTIVE=prod
    SPRING_DATASOURCE_URL=jdbc:postgresql://<your-supabase-db-host>:5432/postgres
    SPRING_DATASOURCE_USERNAME=postgres
    SPRING_DATASOURCE_PASSWORD=<your-db-password>
    SPRING_JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect
    SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
    JWT_SECRET=<your-supabase-jwt-secret>
    STORAGE_TYPE=local
    ```

2.  **Run the Backend**:
    Navigate to the `backend` directory and run:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```
    The server will run on port `8080`.

---

### 💻 Frontend Setup (Vite + React)

1.  **Configure `.env.local`**:
    Create a `.env.local` file inside the `frontend` folder:
    ```env
    VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
    VITE_SUPABASE_ANON_KEY=<your-supabase-anonymous-public-key>
    ```

2.  **Install & Run**:
    Navigate to the `frontend` directory:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment

To build and package the backend into a container:

1.  **Build the Docker Image**:
    ```bash
    cd backend
    docker build -t flotera-backend .
    ```

2.  **Run the Container**:
    ```bash
    docker run -p 8080:8080 \
      -e SPRING_PROFILES_ACTIVE=local \
      -e JWT_SECRET=your_jwt_secret \
      flotera-backend
    ```

---

## 🌐 Production Deployment

### 💻 Frontend (Vercel)
The client application is hosted on **Vercel**.
*   **Build Settings**:
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
*   **Single Page Application (SPA) Routing**:
    To prevent 404 errors on page refresh, a `vercel.json` file is configured in the `frontend` root:
    ```json
    {
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```

### ☕ Backend (Render)
The Spring Boot server is deployed on **Render** as a Web Service.
*   **Build & Start Settings**:
    *   **Runtime**: `Docker` (Render automatically detects the `Dockerfile` in the repository root or subdirectory) or `Java`
    *   **Build Command**: `./mvnw clean package -DskipTests`
    *   **Start Command**: `java -jar target/*.jar`
*   **Environment Variables**:
    Configure the following variables on the Render Dashboard:
    *   `SPRING_PROFILES_ACTIVE=prod`
    *   `SPRING_DATASOURCE_URL` (your PostgreSQL connection string)
    *   `SPRING_DATASOURCE_USERNAME`
    *   `SPRING_DATASOURCE_PASSWORD`
    *   `JWT_SECRET` (Supabase JWT Secret)
    *   `STORAGE_TYPE=supabase` (or `local` if disk mount is configured)

