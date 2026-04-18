# DTI Region 7 — EMS & Industry Dashboard
## Implementation Plan v2.1 | April 16, 2026

> **Status:** Phase 1 complete. Phase 2 ~95% complete. Phase 3 ~60% complete (local dev). Impact Survey, Analytics, Enterprise Directory, Admin Settings, Cron Jobs all done. Remaining: hCaptcha, GCP infrastructure, AI/ML, ETL, Hardening.

---

## Current Implementation Status

| Layer | Status | Notes |
|---|---|---|
| Identity Service | ✅ Complete | Auth, Users, Enterprises — port 3011 |
| Event Service | ✅ Complete | Events, Sessions, Participations, QR, Certs, CSF, PDF — port 3012 |
| web-public | ✅ Complete | Public + Participant + Organizer portals in single app |
| shared-errors | ✅ Complete | Structured error codes shared package |
| shared-types | ✅ Complete | TypeScript interfaces |
| Notification Service | ✅ Complete | BullMQ + Resend email + Semaphore SMS — port 3013 |
| Survey Service | ✅ In event-service | CSF survey routes integrated into event-service |
| Document Service | ✅ In event-service | PDFKit certificate generation (no Puppeteer needed) |
| Analytics Service | ✅ In event-service | Admin analytics endpoints (overview, sectors, impact timeseries) |
| Directory Service | ✅ In identity-service | Public enterprise directory (search, sectors, stats) |
| GCP Infrastructure | ❌ Not started | Local dev only (Docker Compose) |
| CI/CD Pipeline | ❌ Not started | — |

---

## Technology Stack Decision

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | Complex form state (TNA), component reuse, strong ecosystem |
| **UI Framework** | Tailwind CSS + shadcn/ui | Utility-first, accessible, maps to DTI_DesignSystem tokens |
| **State Management** | TanStack Query + Zustand | Server state caching + lightweight client state |
| **Backend Runtime** | Node.js 20 LTS | High concurrency for registration spikes; async-first |
| **API Framework** | Fastify | Faster than Express, built-in schema validation (Zod) |
| **ORM** | Prisma | Type-safe PostgreSQL queries; migration-first workflow |
| **Database** | PostgreSQL 15 + PostGIS 3.4 + TimescaleDB | Single DB, three extensions covering all data needs |
| **Queue / Worker** | BullMQ + Redis | Survey/notification email/SMS dispatch; certificate jobs |
| **Message Bus** | HTTP fire-and-forget (Phase 3: Kafka) | Direct HTTP calls between services; Kafka planned for Phase 3 |
| **Search** | Elasticsearch 8.x | Public directory faceted search and geo-distance queries |
| **Documents** | PDFKit (in event-service) | PDF certificates — no Puppeteer/headless Chrome needed |
| **Auth** | JWT (RS256) + httpOnly cookies | Short-lived access tokens; Redis token blacklist |
| **Cloud** | GCP (asia-southeast1) | Cloud Run, Cloud SQL, GCS, Vertex AI, Cloud Monitoring |
| **IaC** | Terraform | Declarative cloud resource provisioning |
| **CI/CD** | GitHub Actions → GCP Cloud Build | Automated tests → staging → manual gate → production |
| **Observability** | OpenTelemetry + Grafana + PagerDuty | Distributed tracing, alerting, on-call |
| **ML Platform** | GCP Vertex AI | Model training, registry, and prediction endpoints |

---

## Repository Structure

```
dti-ems/
├── apps/
│   └── web-public/          # React 19 — Single SPA (Public + Participant + Organizer portals)
│                             # Role-based routing: /participant/*, /organizer/*
│                             # (Phase 3: web-admin/, web-dashboard/)
│
├── services/
│   ├── identity-service/    # Auth, User Profiles, Enterprises, Public Directory (port 3011)
│   ├── event-service/       # Events, Sessions, Participations, QR, Certificates,
│   │                        # CSF Surveys, Impact Surveys, Analytics, PDF Generation (port 3012)
│   └── notification-service/ # BullMQ workers — email (Resend), SMS (Semaphore) (port 3013)
│                             # (Phase 3: analytics-service/, directory-service/, etl-pipeline/)
│
├── packages/
│   ├── shared-types/        # TS interfaces from DBML schema
│   └── shared-errors/       # Structured error codes
│                             # (Phase 3: shared-events/, shared-ui/, shared-config/)
│
├── dsl_models/              # All DSL models (DBML, SDML, WDML, UXML, BLML, OTML, LRML, AIML)
├── grammars/                # DSL grammar specifications
└── docs/                    # Architecture docs, API docs, runbooks
│                             # (Phase 3: ml/, infra/terraform/, infra/kafka/)
```

---

## Phase 1 — MVP: Client Database + Registration ✅ COMPLETE (local dev)

**Goal:** Eliminate repeated data entry. A participant registers once and is pre-filled for all future events.

### Deliverables

#### Sprint 1–2: Foundation (Weeks 1–4)
- [ ] Provision GCP infrastructure via Terraform (Cloud SQL, Cloud Run, GCS, Redis, VPC)
- [ ] Set up GitHub Actions CI/CD pipeline with staging environment
- [x] Initialize PostgreSQL with `identity_schema` and `event_schema` (Prisma migrations) — Docker Compose, port 5433
- [ ] Set up Kong API Gateway with JWT plugin and rate limiting
- [ ] Configure OpenTelemetry collector → GCP Trace

#### Sprint 3–4: Identity Service (Weeks 5–8) ✅
- [x] `POST /auth/register` — email/password registration with DPA consent capture
- [x] `POST /auth/login` / `POST /auth/logout` — JWT issuance (RS256, 15-min expiry)
- [x] `POST /auth/refresh` — httpOnly cookie refresh with Redis blacklist check
- [x] `GET/PUT /users/:id` — Profile CRUD with field-level validation (Zod)
- [x] Email verification flow — tokenized link → mark `emailVerified = true`
- [x] Password reset flow — time-limited HMAC token via email
- [x] RBAC middleware — role guard for protected routes
- [x] `GET/POST/PATCH /enterprises` — Enterprise profile CRUD

#### Sprint 5–6: Event Service MVP (Weeks 9–12) ✅
- [x] `GET /events` / `GET /events/:id` — Public event listing with filtering (excludes DRAFT)
- [x] `GET /events/mine` — Organizer's own events (all statuses)
- [x] `POST /events` — Event creation (program_manager / event_organizer)
- [x] `PATCH /events/:id` — Update event detail
- [x] `PATCH /events/:id/status` — Workflow state transitions (BLML EventWorkflow)
- [x] `GET/POST /events/:id/sessions` — Session management
- [x] `GET /events/:id/participants` — Participant list (organizer)
- [x] `POST /participations/events/:eventId/register` — Registration with pre-fill from UserProfile
  - DPA consent gate, capacity check with auto-waitlist, enterprise linking
- [x] `GET /participations/events/:eventId/me` — Check own registration status
- [x] `GET /participations/me` — My registrations list
- [x] `GET /participations/:id` — Participation detail
- [x] `POST /participations/:id/tna` — TNA form submission + BLML composite score
- [x] `POST /participations/:id/confirm-rsvp` — RSVP confirmation gate after TNA

#### Sprint 7–8: Notification + Public UI (Weeks 13–16) ✅
- [x] BullMQ worker setup for email (Resend API) and SMS (Semaphore PH) — notification-service on port 3013
- [x] Notification templates: registration confirmation, RSVP reminder, CSF survey invite, certificate issued (4 HTML templates)
- [x] Public portal React app: Home → Event List → Event Detail → Registration Form → TNA → RSVP Confirmation
- [x] Design system setup (Tailwind CSS + custom design tokens)
- [x] Participant portal: Dashboard, My Profile, My Events, My QR, My Certificates
- [ ] hCaptcha on registration form

**Phase 1 Success Criteria:**
- [x] A participant registers once; their data pre-fills for subsequent events
- [x] DPA consent recorded with timestamp for 100% of new registrations
- [x] End-to-end registration flow tested with synthetic participants

---

## Phase 2 — Attendance, CSF, and Certificates ⚠️ IN PROGRESS (~95%)

**Goal:** Automate event-day operations and post-event survey/certificate issuance.

### Deliverables

#### Sprint 9–10: QR Attendance System (Weeks 17–20) ✅
- [x] `GET /participations/:id/qr` — **Permanent user-unique QR** (HMAC-SHA256 of userId, no expiry)
  - Architecture redesigned: one QR per person system-wide, shown for any registered event
- [x] `POST /participations/attendance/scan` — QR scan with `{ token, sessionId }` body
  - Verifies permanent HMAC token → extracts userId → finds participation by (userId, eventId)
  - Returns "not registered" if user has no valid participation for the scanned session's event
  - Records `AttendanceRecord`, promotes status → `ATTENDED`
- [x] Session management via `POST/GET /events/:id/sessions`
- [x] `POST /participations/:id/manual-checkin` — organizer manual fallback (audit logged)
- [x] Attendance completion → auto-creates certificate placeholder when all sessions attended
- [x] QR Scanner UI — `OrganizerQrScanner.tsx` (BarcodeDetector, session picker, result banner)
- [x] `GET /participations/:id/attendance` — attendance records per participation

#### Sprint 11–12: Certificate System (Weeks 21–24) ✅
- [x] `POST /certificates/:participationId/issue` — Manual issue by organizer (auto on full attendance)
- [x] `POST /certificates/bulk-issue/:eventId` — Bulk issue for all completed participants
- [x] `GET /certificates/my` — Participant's own certificates
- [x] `GET /certificates/:participationId` — Certificate detail
- [x] `PATCH /certificates/:participationId/revoke` — Revoke a certificate
- [x] `GET /certificates/verify/:code` — Public verification endpoint (no auth required)
- [x] `VerifyCertificate` public page — scannable verification URL
- [x] `MyCertificates` participant page — list with status badges
- [x] **PDF Certificate Generation** — PDFKit in event-service (no Puppeteer/document-service needed)
- [x] `GET /certificates/:participationId/pdf` — landscape A4 PDF with DTI branding, QR, verification code
- [x] "Download PDF" button in MyCertificates page
- [ ] GCS upload + time-limited signed URL for certificate PDF download (Phase 3 / GCP)

#### Sprint 13–14: CSF Survey (Weeks 25–28) ✅
- [x] CSF Survey integrated into event-service (no separate survey-service needed)
- [x] `POST /surveys/events/:eventId/csf` — Submit CSF response (participant, 1 per event)
- [x] `GET /surveys/events/:eventId/csf/me` — Check own survey status
- [x] `GET /surveys/events/:eventId/csf/results` — Aggregated results (organizer)
- [x] Auto-create: when event transitions to `COMPLETED` → create PENDING CsfSurveyResponse for all ATTENDED participants
- [x] Auto-dispatch: bulk CSF email invite via notification-service (1-hour delay in BullMQ)
- [x] Survey Response page (Participant portal) — star ratings (1–5 per dimension) + text fields
- [x] CSF Results View (Organizer console) — avg score bars, verbatim feedback panels
- [x] "Complete Survey" CTA in My Events for pending surveys
- [x] Survey expiry job — node-cron in event-service (CSF 14-day, Impact 30-day expiry)

#### Sprint 15–16: Organizer Console Completion (Weeks 29–32) ✅
- [x] Organizer Dashboard (`OrganizerDashboard.tsx`) — event stats, quick actions
- [x] Events list (`OrganizerEvents.tsx`) — all statuses, status transition actions
- [x] Event form (`OrganizerEventForm.tsx`) — create/edit with PHT timezone dates
- [x] Event detail (`OrganizerEventDetail.tsx`) — participants, certificates, attendance overview
- [x] QR Scanner (`OrganizerQrScanner.tsx`) — camera + manual check-in
- [x] Session management UI — add/delete sessions inline in event detail page
- [x] Participant list page (`OrganizerParticipantList.tsx`) — search, filter, pagination, CSV export
- [x] Export participants — ✅ via CSV button in participant list page
- [x] CSF Results view — `OrganizerCsfResults.tsx` with avg scores + verbatim panels

#### Notification Workers (cross-cutting) ✅
- [x] `notification-service/` — BullMQ + Redis workers (port 3013)
- [x] Email provider integration (Resend API — transactional, dry-run in dev)
- [x] SMS provider integration (Semaphore PH — dry-run without API key)
- [x] Queue jobs:
  - `registration-confirmation` — on `POST /register`
  - `rsvp-reminder` — via HTTP trigger (email + optional SMS)
  - `csf-dispatch` — 1 hour after event COMPLETED (via bulk-csf-invite, delayed job)
  - `certificate-issued` — on certificate issue
- [x] HTML email templates: registration, RSVP reminder, CSF survey invite, certificate issued, impact survey invite
- [x] `rsvp-reminder-7d` — 7 days before event start (node-cron in event-service, daily 08:00)
- [x] `rsvp-reminder-1d` — 1 day before event start (node-cron in event-service, daily 08:00)
- [x] `impact-survey-dispatch` — 180 days after event completion (node-cron in event-service, daily 09:00)

**Phase 2 Success Criteria:**
- [x] QR attendance scanning works at a live event (permanent QR, no replay risk)
- [x] CSF survey auto-dispatched within 1 hour of event completion for 100% of attendees
- [x] PDF certificates generated and downloadable within 5 minutes of event completion

---

## ⚡ Next Steps — Remaining Backlog

These are the concrete implementation tasks remaining, in priority order.

### ✅ COMPLETED (Phase 2)

The following items were completed in previous sprints:

1. **Session Management UI** — inline add/delete in `OrganizerEventDetail.tsx`, backend `DELETE /sessions/:id`
2. **Participant List Page** — `OrganizerParticipantList.tsx` with search, filter, pagination, CSV export
3. **Notification Service** — `services/notification-service/` (port 3013), BullMQ + Redis, Resend email + Semaphore SMS, 4 HTML templates, 5 trigger endpoints, fire-and-forget HTTP from event-service via `notify.ts`
4. **CSF Survey System** — integrated into event-service (no separate survey-service), `CsfSurveyResponse` Prisma model, auto-create on COMPLETED, `CsfSurvey.tsx` (participant star ratings), `OrganizerCsfResults.tsx` (aggregated results)
5. **PDF Certificate Generation** — PDFKit in event-service (no Puppeteer/document-service), `GET /certificates/:participationId/pdf` streams landscape A4 PDF, "Download PDF" button in `MyCertificates.tsx`

### Remaining Phase 2 Tasks

1. **hCaptcha on Registration Form** — add client-side hCaptcha widget to `RegisterForm.tsx`, server-side token verification in event-service `POST /register`
2. ~~**Survey Expiry Job**~~ ✅ Implemented as node-cron in event-service (`cron.ts`): CSF 14-day expiry, Impact 30-day expiry
3. ~~**RSVP Reminder Cron Jobs**~~ ✅ Implemented as node-cron in event-service (`cron.ts`): 7-day and 1-day reminders, daily at 08:00
4. **GCS Upload for Certificate PDFs** — upload generated PDFs to GCS bucket with time-limited signed download URLs (deferred to GCP infrastructure setup)

---

## Phase 3 — Impact Tracking + Industry Dashboard ⚠️ IN PROGRESS (~60% local dev)

**Goal:** 6-month longitudinal tracking and the living industry sector dashboard.

### Deliverables

#### Sprint 17–18: 6-Month Impact Survey (Weeks 33–36) ✅
- [x] node-cron scheduled job: 180-day post-event dispatch (`cron.ts` daily 09:00)
  - BLML rule: `DispatchImpactSurveyAt6Months`
  - Survey churn AI model integration: flag at-risk participants (deferred — Vertex AI)
- [x] Impact survey submission → `ImpactSurveyResponse` record created (surveys.ts)
- [x] `GET /surveys/events/:eventId/impact/results` — Impact data aggregation endpoints
- [x] Impact survey participant UI (`ImpactSurvey.tsx`) — star ratings, quantitative data, success stories
- [x] Impact survey email template + bulk invite notification trigger
- [x] Admin impact report (`/admin/reports/impact`) — averages, quantitative impact, success stories, by-event breakdown
- [ ] Survey Churn Predictor model training on initial data (deferred — Vertex AI)

#### Sprint 19–20: ETL Pipeline (Weeks 37–40) — Deferred to GCP
- [ ] ETL Cloud Run Job (nightly 02:00 PHT)
  - Extract from event_schema + survey_schema
  - Transform: deduplicate, normalize, compute activity scores
  - Load: upsert into analytics_schema
  - Sync: re-index Elasticsearch (enterprise_directory_v1)
  - Data quality gates (OTML: `ETLSuccessGate`)
- [ ] ETL Status monitoring page (Admin console)

#### Sprint 21–22: Analytics Service + Public Dashboard (Weeks 41–44) ✅ (SQL-based, local)
- [x] Analytics API endpoints: `GET /admin/analytics/overview`, `/analytics/sectors`, `/analytics/impact-timeseries`
- [x] Public Enterprise Directory — `GET /directory/enterprises` (identity-service, SQL-based search)
- [x] Public Directory page (`/directory`) — search, sector filter, stage filter, pagination
- [x] Directory stats + sectors endpoints (`/directory/stats`, `/directory/sectors`)
- [ ] Industry Dashboard — Regional heatmap (deferred — requires Leaflet + GeoJSON + PostGIS)
- [ ] Elasticsearch index setup and enterprise sync (deferred — using SQL search for now)

#### Sprint 23–24: Admin Console + Full Internal Dashboard (Weeks 45–48) ✅ (local)
- [x] Full Admin console React app
  - [x] User Management (role change, status toggle, email verification)
  - [x] Enterprise Management (verify, list, search, sector/stage filter)
  - [x] Reports page (CSF, Impact, Event Completion, Enterprise Training, Trends, DPA Compliance)
  - [x] Audit Log viewer (filter by user, entity type, action, date range)
  - [x] System Settings page (service health, queue config, auth, cron jobs, deployment)
- [x] Admin Dashboard with 8 stat cards, role/status breakdowns
- [ ] Internal Impact Tracking Dashboard (timeseries charts, cohort comparison — deferred)
- [ ] Policy Planning page (cluster zones, enabler coverage map — deferred)
- [x] DPA Compliance Report

#### Sprint 25–26: AI/ML Integration (Weeks 49–52) — Deferred to GCP
- [ ] TNA Module Recommender (Vertex AI training + canary deploy)
- [ ] Recommendation API integrated into TNA submission flow
- [ ] Ecosystem Clusterer batch pipeline → creative cluster / desert zone map
- [ ] Explainability UI: "Why was this recommended?" in TNA results
- [ ] Ethical AI audit: fairness metrics by region and gender (Fairlearn)

#### Sprint 27–28: Hardening + Performance (Weeks 53–56)
- [ ] Load testing: 500 concurrent registrations (Artillery.io)
- [ ] Security penetration test (OWASP methodology)
- [ ] DPA compliance review with DTI Legal
- [ ] Full DR drill (OTML: `BackupRecoveryWorkflow`)
- [ ] Documentation: API docs (OpenAPI), runbooks, user guides

**Phase 3 Success Criteria:**
- Impact survey data drives updated enterprise activity scores within 24 hours of submission
- Industry dashboard reflects current data within 24 hours of ETL run
- DTI staff can generate a full beneficiary impact report in < 2 minutes

---

## Team Structure

| Role | Responsibility |
|---|---|
| **Tech Lead (1)** | Architecture decisions, code reviews, DevOps escalation |
| **Frontend Engineers (2)** | React apps (public, participant, organizer, admin, dashboard) |
| **Backend Engineers (2)** | Node.js microservices, API design, Kafka consumers |
| **DevOps/Cloud Engineer (1)** | Terraform, GCP, CI/CD, monitoring, secrets |
| **QA Engineer (1)** | Automated tests, load testing, security checks |
| **ML Engineer (0.5–1, Phase 3)** | Vertex AI pipelines, model training and evaluation |

---

## Data Migration Plan (If Existing Data Exists)

1. **Audit existing data** — Identify spreadsheets, Google Forms, or legacy CSVs
2. **Map fields** → UserProfile, EnterpriseProfile, EventParticipation schema
3. **Cleanse** — Deduplicate emails, normalize names, flag missing DPA consent
4. **Bulk import script** — Prisma `createMany` with upsert logic
5. **Verify** — Row count reconciliation, admin spot-check
6. **DPA retrospective consent** — Email blast to existing contacts requesting DPA acknowledgment

---

## Key Integration APIs

| Integration | Tool | Config Location |
|---|---|---|
| Email | Resend (or SendGrid) | GCP Secret Manager |
| SMS | Semaphore PH | GCP Secret Manager |
| Push | Firebase Cloud Messaging | GCP Secret Manager |
| QR Generation | qrcode npm package (server-side) | EventService |
| PDF Generation | PDFKit | EventService (inline generation, no separate service) |
| Maps | Leaflet.js + Mapbox tiles | web-dashboard |
| Elasticsearch | @elastic/elasticsearch client | DirectoryService |
| Kafka | kafkajs (Phase 3) | Not used yet — HTTP fire-and-forget between services |
| Auth SSO (Future) | OpenID Connect (PhilSys / future gov SSO) | IdentityService |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Low impact survey response rate | High | High | Survey Churn AI model + SMS follow-up + incentive pilot |
| QR replay attacks | Medium | High | One-time token + audit log (SDML controls) |
| PII breach | Low | Critical | AES-256 + RBAC + DPA flow + audit trail |
| Registration surge DoS | High | Medium | Rate limiting + auto-scaling + BullMQ buffering |
| ETL data mismatch | Medium | Medium | Data quality gates + human review dashboard |
| AI model bias by region | Low | High | Fairlearn quarterly audit + human override |
| Low ML training data (Phase 3) | High | Medium | Bayesian prior fallback (BLML) until >1000 samples |
| DPA compliance gap | Low | Critical | DPA consent captured at registration + monthly DPA audit report |

---

## DSL Model Index

| File | Grammar | Purpose |
|---|---|---|
| [01-ems-dbml-v1.0.dbml](./01-ems-dbml-v1.0.dbml) | DBML v3.1 | All entities, relationships, workflows, permissions, events |
| [02-ems-sdml-v1.0.sdml](./02-ems-sdml-v1.0.sdml) | SDML v2.0 | Security model, threats, risks, controls (NIST CSF + DPA) |
| [03-ems-wdml-v1.0.wdml](./03-ems-wdml-v1.0.wdml) | WDML v3.3 | Design system tokens, pages, layouts for all apps |
| [04-ems-uxml-v1.0.uxml](./04-ems-uxml-v1.0.uxml) | UXML v3.1 | App structure, views, flows, components, user journeys |
| [05-ems-blml-v1.0.blml](./05-ems-blml-v1.0.blml) | BLML v1.1 | Business rules, formulas, decision tables, constraints |
| [06-ems-otml-v1.0.otml](./06-ems-otml-v1.0.otml) | OTML v1.7 | Cloud infrastructure, service nodes, pipelines, workflows |
| [07-ems-lrml-v1.0.lrml](./07-ems-lrml-v1.0.lrml) | LRML v1.0 | Datasets, metrics, reports, dashboards, styles |
| [08-ems-aiml-v1.0.aiml](./08-ems-aiml-v1.0.aiml) | AIML v2.1 | ML models, training pipelines, inference APIs, governance |
