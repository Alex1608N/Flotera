---
stepsCompleted: ["step-01-init.md", "step-02-context.md", "step-03-starter.md", "step-04-decisions.md", "step-05-patterns.md", "step-06-structure.md", "step-07-validation.md", "step-08-complete.md"]
inputDocuments: ["_bmad-output/planning-artifacts/prd.md"]
workflowType: 'architecture'
project_name: 'Flotera'
user_name: 'Alex'
date: '2026-04-28'
lastStep: 8
status: 'complete'
completedAt: '2026-04-28'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Sistemul trebuie să suporte autentificare bazată pe roluri (Proprietar vs. Șofer), gestiunea completă a unei flote (CRUD pe vehicule), monitorizarea documentelor cu notificări persistente bazate pe logică duală (timp/kilometraj) și raportarea incidentelor direct de pe teren. Aceste cerințe dictează o arhitectură orientată pe API, capabilă să servească un client web responsiv.

**Non-Functional Requirements:**
Deciziile arhitecturale vor fi puternic influențate de:
- **Performanță:** LCP < 2.5s prin Code Splitting și lazy loading.
- **Securitate:** Hashing cu BCrypt pentru parole și JWT stocat exclusiv în cookie-uri sigure (HttpOnly, Secure), evitând localStorage pentru a preveni atacurile XSS.
- **Fiabilitate:** Sistemul web trebuie să gestioneze pierderea conexiunii la internet printr-o degradare grațioasă, folosind un cache offline (ex: React Query) care servește date "stale" și dezactivează acțiunile de mutare pentru a preveni inconsistențele.
- **Mentenabilitate:** Test coverage minim de 60% pe logica de expirare, necesită "Fat Services, Skinny Controllers" în Spring Boot, pentru a testa ușor logica în izolare.

**Scale & Complexity:**
Proiectul vizează flote mici (3-15 vehicule), deci volumul de date nu este o problemă de scalabilitate orizontală, ci una de integritate și securitate a accesului.
- Primary domain: Full-Stack Web Development (Java/Spring Boot Backend + React Frontend).
- Complexity level: Medium-High (datorită logicii duale de expirare și a accesului multi-rol).
- Estimated architectural components: ~4-5 componente majore (Auth Service, Fleet Manager, Notification/Expiration Engine, Incident Reporter, Frontend Dashboard).

### Technical Constraints & Dependencies

- Target-ul de dezvoltare este un mediu universitar, ceea ce impune o structură curată a codului și tehnologii standard (evitarea soluțiilor "over-engineered"). Se optează pentru evaluare dinamică (calcul "on-the-fly" în Postgres/Java) în loc de cron-jobs complexe, bazându-ne pe tranzacții ACID stricte.
- Interfața React trebuie să fie impecabilă pe dispozitive mobile (Mobile-First pentru fluxul șoferului) și să prevină request-urile invalide la sursă, mapând constrângerile backend-ului prin validare strictă pe frontend (ex: Zod/Yup).

### Cross-Cutting Concerns Identified

- **Autentificare și Autorizare:** Securizarea tuturor endpoint-urilor și filtrarea datelor în funcție de rol (Proprietar/Șofer) prin endpoint-uri distincte sau filtre bazate pe rol.
- **Validarea Datelor (Contract-First):** Prevenirea incoerențelor introduse manual, asigurându-ne că Frontend-ul și Backend-ul validează exact aceleași contracte de tip DTO.
- **Gestionarea Erorilor și Stării Rețelei:** Informarea clară a utilizatorului pe teren atunci când conexiunea e slabă, blocând mutațiile periculoase (Fault Tolerance).

## Starter Template Evaluation

### Primary Technology Domain

Full-Stack Web Development (Java/Spring Boot Backend + React Frontend)

### Starter Options Considered

Pentru partea de Frontend (React):
- **Vite:** Ideal pentru SPA-uri (Single Page Applications) precum dashboard-ul tău. Oferă un build instant, simplitate și un mediu excelent pentru începători. În 2026 a devenit standardul absolut, înlocuind Create React App (CRA).
- **Next.js:** Este standardul industriei pentru proiecte de producție unde SEO (indexarea pe Google) și Server-Side Rendering sunt critice, dar introduce o complexitate inutilă pentru un proiect de nivel universitar.

Pentru Backend (Java):
- **Spring Initializr:** Acesta este generatorul oficial și cel mai "curat" pentru a pune bazele unui proiect Spring Boot cu doar dependențele de care ai nevoie (Web, JPA, PostgreSQL Driver, Security).

### Selected Starter: React cu Vite (Frontend) și Spring Initializr (Backend)

**Rationale for Selection:**
Pentru proiectul tău, abordarea unui Monolit Hibrid este cea mai înțeleaptă decizie. Nu vrei să te complici cu Next.js, având în vedere că vei avea o aplicație privată și nu ai nevoie de indexare SEO. Alegerea Vite îți va face viața mai ușoară și mediul de dezvoltare super rapid. Iar pe Backend, Spring Initializr ne dă control total pe dependențele noastre. Este clar de înțeles și foarte ușor de documentat la examen.

**Initialization Commands:**

Pentru Frontend (React via Vite):
```bash
npm create vite@latest frontend -- --template react-ts
```

Pentru Backend (Spring Boot via curl / Spring Initializr API):
```bash
curl https://start.spring.io/starter.zip -d dependencies=web,data-jpa,postgresql,security,validation -d name=flotera -d bootVersion=3.4.x -o backend.zip
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- Java 21+ pentru Backend
- TypeScript (TSX) pe Frontend, garantând tipare stricte și consistență pe formulare.

**Styling Solution:**
- CSS Modules sau Tailwind CSS (în funcție de ce preferi pentru partea de "Semafor"). Recomand Vanilla CSS / Modules pentru a evita încărcarea inutilă.

**Build Tooling:**
- Rolldown / esbuild prin Vite pe Frontend (super rapid).
- Maven sau Gradle pe Backend.

**Testing Framework:**
- Vitest pentru frontend (compatibil 100% cu Vite).
- JUnit 5 / Mockito (livrate standard de Spring Boot) pentru Backend-ul nostru și cerința NFR de >60% test coverage.

**Code Organization:**
- Decuplare Backend / Frontend clară (proiecte separate în același repo sau repo-uri distincte).

**Development Experience:**
- Vite îți va asigura Hot Module Replacement (HMR) aproape instant - schimbi ceva la dashboard și vezi pe loc rezultatul.
- Spring Boot DevTools pentru reîncărcare rapidă la codul de Java.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data Architecture (Database hosting & ORM)
- Frontend State Management (for Offline capabilities)
- Infrastructure & Deployment Strategy

### Data Architecture

- **Decision:** **Supabase (Managed PostgreSQL 18.x)**
- **Rationale:** Prin utilizarea Supabase ca "Database-as-a-Service" obținem un mediu PostgreSQL gata configurat în cloud, evitând problemele de configurare locală și facilitând prezentarea. Spring Boot (via Hibernate/JPA) se va conecta la Supabase folosind datele de conectare standard JDBC. 
- **Affects:** Backend DB Connection, Deployment.

### Frontend Architecture

- **Decision:** **React Query (TanStack Query v5.x)**
- **Rationale:** Pentru a îndeplini cerința de "Graceful Degradation" (NFR5), React Query v5 (versiune stabilă din 2026) gestionează automat caching-ul și starea datelor, permițând interfeței să afișeze datele din memoria cache atunci când conexiunea e pierdută.
- **Affects:** Frontend State, UX.

### Infrastructure & Deployment

- **Decision:** **Vercel pentru Frontend + Hosting Backend dedicat (Java)**
- **Rationale:** Vercel este standardul pentru găzduirea aplicațiilor React (Vite). Pentru că aplicația folosește obligatoriu Java Spring Boot pe backend, API-ul va trebui găzduit separat pe o platformă compatibilă cu Java (precum Railway, Render, sau Fly.io) care să se lege la baza de date din Supabase. Frontend-ul de pe Vercel va consuma acest API.
- **Affects:** CI/CD, Deployment Pipelines.

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming Conventions (PostgreSQL):**
- **Regulă:** Tabele și coloane în `snake_case`, la plural pentru tabele.
- **Exemplu Corect:** `vehicles`, `maintenance_logs`, `owner_id`, `last_service_date`.

**Backend Naming Conventions (Java/Spring Boot):**
- **Regulă:** `PascalCase` pentru clase, `camelCase` pentru metode și variabile. Structură ierarhică clară.
- **Exemplu Corect:** `VehicleController.java`, `VehicleService.java`, `getVehiclesByOwner()`.

**API Naming Conventions:**
- **Regulă:** Endpoint-uri REST în `kebab-case`, plural, fără verbe în URL.
- **Exemplu Corect:** `GET /api/v1/vehicles`, `POST /api/v1/maintenance-logs`.
- **Anti-Pattern:** `GET /api/v1/getVehicles`.

**Frontend Naming Conventions (React/TS):**
- **Regulă:** `PascalCase` pentru componente și fișiere `.tsx`, `camelCase` pentru funcții și hook-uri.
- **Exemplu Corect:** `VehicleCard.tsx`, `useVehicles.ts`.

### Format Patterns

**API Response Formats:**
- **Succes:** Returnare directă a payload-ului JSON (fără wrapper `{ "data": ... }` inutil).
- **Eroare:** Format standardizat interceptat de `@RestControllerAdvice`.
  Exemplu: `{ "timestamp": "...", "status": 404, "error": "Not Found", "message": "Vehiculul nu există" }`

**Data Exchange Formats:**
- **Date/Time:** ISO-8601 UTC pentru toate transmisiile API (`YYYY-MM-DDTHH:mm:ssZ`). Formatarea locală se face exclusiv pe frontend.

### Communication Patterns

**State Management Patterns (React Query):**
- **Query Keys:** Array-uri ierarhice de la general la specific pentru invalidare precisă a cache-ului.
- **Exemplu Corect:** `['vehicles', ownerId]`, `['maintenance', vehicleId, 'logs']`.

### Enforcement Guidelines

**All AI Agents MUST:**
- Utiliza exclusiv `snake_case` în scripturile SQL/JPA.
- Implementa tratarea globală a erorilor pe backend (`@RestControllerAdvice`).
- Structura query-urile React Query folosind pattern-ul de array ierarhic.
- Respecta cu strictețe convențiile de denumire REST API stabilite.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
flotera/
├── .github/                      # CI/CD (ex: Vercel/Railway deploys)
├── docs/                         # Documentația proiectului (PRD, Arhitectură)
├── frontend/                     # REACT (Vite) APP
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env.local                # URL-ul de backend
│   ├── public/                   # Imagini mașini, PWA icons
│   └── src/
│       ├── api/                  # Configurare Axios și apeluri REST
│       │   ├── client.ts         # Interceptor pentru JWT
│       │   └── types/            # DTO-uri generate din backend
│       ├── components/           # Componente UI
│       │   ├── common/           # ErrorBoundary, Buttons, Inputs
│       │   └── features/         # Componente specifice (VehicleCard, TrafficLight)
│       ├── hooks/                # Custom React Query hooks (ex: useVehicles)
│       ├── pages/                # Paginile principale (Dashboard, Login)
│       ├── store/                # Starea globală (Zustand) dacă e nevoie
│       ├── utils/                # Funcții de formatare date
│       ├── App.tsx               # Entry point
│       └── main.tsx              # React DOM render
└── backend/                      # JAVA (Spring Boot) APP
    ├── pom.xml                   # Maven dependencies
    ├── src/
    │   ├── main/
    │   │   ├── java/com/flotera/
    │   │   │   ├── config/       # JWT Config, SecurityConfig
    │   │   │   ├── controller/   # REST Controllers (ex: VehicleController)
    │   │   │   ├── dto/          # Data Transfer Objects
    │   │   │   ├── exception/    # @ControllerAdvice pentru erori globale
    │   │   │   ├── model/        # Entități JPA (Vehicle, MaintenanceLog, User)
    │   │   │   ├── repository/   # Interfețe JPA (conexiune baza de date)
    │   │   │   └── service/      # Business Logic ("Fat Services")
    │   │   └── resources/
    │   │       ├── application.yml # Supabase DB connection config
    │   │       └── db/migration/   # Scripturi Flyway (V1__init.sql)
    │   └── test/                 # Teste (60% coverage target)
    │       └── java/com/flotera/
    │           ├── controller/   # Validare Endpoint-uri și DTO-uri (@WebMvcTest)
    │           ├── repository/   # Validare Query-uri baza de date (@DataJpaTest)
    │           ├── service/      # Validare Business Logic (Unit Tests cu Mockito)
    │           └── integration/  # Teste cap-la-cap pe fluxuri critice
```

*(Notă Frontend: Testele de UI - ex: Vitest/React Testing Library - vor fi co-localizate lângă componente și hook-uri, ex: `VehicleCard.test.tsx` în interiorul `/components/features/`)*

### Architectural Boundaries

**API Boundaries:**
- Toate cererile Frontend -> Backend trec prin `frontend/src/api/client.ts`. Acest fișier adaugă automat JWT-ul în cookie-uri.
- Frontend-ul nu are voie să acceseze baza de date direct, doar prin intermediul `backend/src/main/java/com/flotera/controller/`.

**Component Boundaries:**
- Componentele de UI (din `components/features/`) sunt "proaste" (dumb components) - ele doar primesc date și afișează.
- Logica de extragere a datelor (React Query) este izolată în `hooks/`.

**Data Boundaries:**
- Baza de date (PostgreSQL) este accesată EXCLUSIV de pachetul `repository` din Java.
- Controller-ele Java primesc date de la baza de date via Service, și returnează EXCLUSIV obiecte din pachetul `dto`, niciodată entități directe de bază de date (pentru a nu expune informații sensibile).

### Requirements to Structure Mapping

- **Auth (Proprietar/Șofer):** `frontend/src/pages/Login.tsx` -> `backend/.../controller/AuthController.java` -> `backend/.../service/AuthService.java`
- **Dashboard Semafor:** `frontend/src/pages/Dashboard.tsx` folosește `components/features/TrafficLight.tsx`
- **Validare expirare (Dual logic):** `backend/.../service/ExpirationEngineService.java` (aici vor fi grosul testelor JUnit).

## Architecture Validation Results

### Coherence Validation ✅
**Decision Compatibility:** Stack-ul ales (Spring Boot + React Vite + Supabase) funcționează coerent prin contracte clare (REST API).
**Pattern Consistency:** Pattern-ul "Fat Services" este direct susținut de structura de testare, asigurând un mediu favorabil atingerii NFR-urilor de mentenabilitate.
**Structure Alignment:** Granițele fizice (foldere separate `frontend/` și `backend/`) previn "scurgerea" de logică (implementation leakage) între client și server.

### Requirements Coverage Validation ✅
**Functional Requirements Coverage:** Toate cele 18 FR-uri au componente desemnate în structură (ex: `AuthController` pentru FR1, `ExpirationEngineService` pentru FR12).
**Non-Functional Requirements Coverage:** Securitatea este acoperită (BCrypt/JWT), performanța este garantată de Vite, iar fiabilitatea de React Query.

### Implementation Readiness Validation ✅
**Decision Completeness:** Echipele (și agenții AI) au comenzi clare de bootstrap și reguli de sintaxă stricte.
**Structure Completeness:** Arborele de proiect include explicit directoarele pentru testare cerute în QA.

### Gap Analysis Results
- *Minor Gap:* Providerul de cloud exact pentru Spring Boot nu a fost fixat (doar opțiuni: Railway/Render).
- *Mitigare:* Decizia este amânată pentru faza de deployment, deoarece codul generat va fi complet agnoscit față de cloud (Cloud-Agnostic).

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** HIGH

**Key Strengths:**
- Simplitate și separare clară a preocupărilor (Separation of Concerns).
- Testabilitate ridicată (DTO-uri stricte, servicii izolate).
- Protecție excelentă la erori de rețea (Offline caching pe frontend).

**Implementation Handoff (AI Agent Guidelines):**
1. Se respectă strict structura de foldere definită.
2. Nu se ignoră scrierea testelor (`*.test.tsx` sau `*Test.java`) alături de logica dezvoltată.
3. **First Step:** Rularea comenzilor de `npm create vite` și `curl https://start.spring.io` din secțiunea Starter Template.
