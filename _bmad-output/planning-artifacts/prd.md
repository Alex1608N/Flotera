---
stepsCompleted: ["step-01-init", "step-01b-continue", "step-02-discovery.md", "step-02b-vision.md", "step-02c-executive-summary.md", "step-03-success.md", "step-04-journeys.md", "step-05-domain.md", "step-06-innovation.md", "step-07-project-type.md", "step-08-scoping.md", "step-09-functional.md", "step-10-nonfunctional.md", "step-11-polish.md"]
inputDocuments: ["_bmad-output/planning-artifacts/product-brief-flotera.md"]
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: Web App
  domain: Automotive (Fleet Management)
  complexity: High
  projectContext: greenfield
releaseMode: phased
workflowType: 'prd'
---

# Product Requirements Document - Flotera

**Author:** Alex
**Date:** 2026-04-27

## Executive Summary
Flotera este un prototip de platformă Web App (Responsive) pentru gestionarea flotelor auto (3-15 vehicule), dezvoltat în context Greenfield. Proiectul simulează un mediu de control activ unde datele de mentenanță și documentele legale (ITP, RCA, Rovinietă) declanșează notificări vizuale bazate pe praguri critice de timp și kilometraj, eliminând nevoia de monitorizare manuală.

## Product Innovation & Differentiators
- **Dashboard Vizual Intuitiv ("Semafor"):** Eliminarea complexității administrative printr-o interfață care prioritizează atenția utilizatorului folosind coduri de culori și fotografii reale.
- **Flux Colaborativ (Driver-as-a-Sensor):** Implementarea a două niveluri de acces care permit șoferilor să raporteze incidentele de pe teren, descentralizând mentenanța flotei.

## Success Criteria

### User Success
- Eficiență Matinală: Antreprenorul evaluează starea întregii flote în sub 10 secunde.
- Siguranță Legală: Zero incidente de expirare datorită alertelor persistente până la rezolvare.

### Business & Technical Success (University Project)
- Validare Funcțională: Demonstrarea fluxului complet de notificare (de la logica de expirare la UI).
- Integritate Tehnică: Backend Java (Spring Boot) robust și Frontend React complet responsiv.
- Acuratețe: Calcul precis al reviziilor folosind intervale duale (timp și kilometraj).

## Product Scope (Phased Delivery)

### Phase 1: MVP (Obiectiv Examen)
- Autentificare bazată pe roluri (Proprietar, Șofer).
- Dashboard vizual cu carduri și fotografii.
- Monitorizare documente (ITP, RCA, Rovinietă).
- Introducere manuală kilometraj și raportare probleme (text).
- Alerte in-app persistente.

### Phase 2: Growth (Post-Examen)
- Încărcare fotografii pentru raportare incidente.
- Istoric detaliat de service.
- Notificări push.

### Phase 3: Vision (Viitor)
- Automatizare prin GPS.
- Predictibilitate TCO (Total Cost of Ownership).
- Mentenanță predictivă.

## User Journeys

### 1. Călătoria Antreprenorului: "Liniștea de la cafea"
- **Scena de deschidere:** Proprietarul își bea cafeaua de dimineață. În trecut, simțea o anxietate constantă legată de conformitatea legală a flotei.
- **Acțiune:** Deschide Flotera pe telefonul mobil.
- **Momentul culminant:** Dashboard-ul afișează 12 carduri verzi și unul galben (ITP care expiră în 15 zile). Observă și o notificare roșie de la un șofer care semnalează o bătaie la direcție.
- **Rezoluție:** Programează intervențiile necesare imediat. Își continuă ziua relaxat, având confirmarea vizuală că totul este sub control.

### 2. Călătoria Șoferului: "Raportarea fără stres"
- **Scena de deschidere:** Un șofer observă un martor aprins în bord sau o problemă mecanică pe traseu.
- **Acțiune:** Trage pe dreapta și deschide aplicația (acces restricționat doar la vehiculul său).
- **Momentul culminant:** Folosește butonul rapid "Raportează problemă", adaugă o descriere scurtă și o poză.
- **Rezoluție:** Primește confirmarea că raportul a fost trimis. Șoferul se simte protejat, știind că a informat oficial managementul despre starea tehnică.

### 3. Călătoria de Administrare: "Onboarding-ul unui vehicul nou"
- **Scena de deschidere:** Flota se extinde cu un nou vehicul.
- **Acțiune:** Administratorul adaugă vehiculul în sistem.
- **Momentul culminant:** Introduce datele de identificare, fotografiază mașina și setează datele de expirare pentru documente.
- **Rezoluție:** În mai puțin de 2 minute, mașina este activă în sistem, iar algoritmii de monitorizare încep să urmărească automat termenele limită.

## Technical & Domain Requirements

### Arhitectură și Implementare (Student Edition)
- **Monolit Hibrid:** Backend Java (Spring Boot) + Frontend React SPA/MPA hibrid.
- **Bază de date:** PostgreSQL.
- **Comunicare:** REST API (JSON) securizat.

### Conformitate și Securitate (GDPR)
- Protecția datelor de identificare a vehiculelor și a șoferilor.
- Validări stricte de input (ex: prevenirea introducerii unui kilometraj descrescător).

## Functional Requirements

### 1. Managementul Utilizatorilor și Securitate
- **FR1:** Sistemul permite autentificarea (Login) separată pentru Proprietar și Șofer.
- **FR2:** Sistemul restricționează accesul Șoferului astfel încât acesta să vadă doar vehiculul asignat lui.
- **FR3:** Proprietarul poate vizualiza și gestiona datele întregii flote.

### 2. Gestionarea Flotei (Proprietar)
- **FR4:** Proprietarul poate adăuga un vehicul nou în sistem (Număr înmatriculare, model, an).
- **FR5:** Proprietarul poate încărca o fotografie pentru fiecare vehicul pentru identificare rapidă în dashboard.
- **FR6:** Proprietarul poate edita sau șterge vehiculele din flotă.

### 3. Monitorizarea Documentelor Legale
- **FR7:** Sistemul permite introducerea datelor de expirare pentru ITP, RCA și Rovinietă.
- **FR8:** Sistemul calculează automat timpul rămas până la expirarea fiecărui document.
- **FR9:** Sistemul afișează vizual (Verde/Galben/Roșu) starea fiecărui document în funcție de pragurile de timp definite.

### 4. Mentenanță și Kilometraj
- **FR10:** Proprietarul poate seta praguri de mentenanță (ex: revizie la 10.000 km sau 1 an).
- **FR11:** Sistemul permite actualizarea manuală a kilometrajului (odometru) pentru fiecare vehicul.
- **FR12:** Sistemul calculează și semnalează necesitatea reviziei pe baza pragului de kilometraj sau de timp (care survine primul).

### 5. Sistemul de Notificări și Dashboard
- **FR13:** Sistemul afișează un dashboard centralizat cu carduri vizuale pentru toate vehiculele.
- **FR14:** Sistemul generează notificări „in-app” (clopoțel) pentru documentele care se apropie de expirare.
- **FR15:** Alertele critice persistă în dashboard și în centrul de notificări până când datele de expirare sau kilometrajul sunt actualizate.

### 6. Raportare Incidente (Șofer)
- **FR16:** Șoferul poate raporta o problemă tehnică prin introducerea unui mesaj text scurt.
- **FR17:** Sistemul notifică imediat Proprietarul atunci când un șofer a raportat o problemă nouă.
- **FR18:** Proprietarul poate vizualiza lista de probleme raportate pentru fiecare vehicul în parte.

## Non-Functional Requirements

- **NFR1 (Performance):** LCP sub 2.5 secunde pe 4G (validabil prin Lighthouse).
- **NFR2 (Performance):** UI feedback sub 300ms la interacțiuni.
- **NFR3 (Security):** Parole stocate prin hashing BCrypt.
- **NFR4 (Security):** Endpoint-uri protejate via JWT.
- **NFR5 (Reliability):** Graceful degradation (mesaj clar) la pierderea conexiunii.
- **NFR6 (Maintainability):** Minimum 60% test coverage pentru logica de calcul a datelor de expirare.