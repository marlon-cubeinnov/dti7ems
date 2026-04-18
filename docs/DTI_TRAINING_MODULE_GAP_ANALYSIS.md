# DTI Conduct of Training Module — Gap Analysis & Implementation Plan

**Date:** April 18, 2026
**Reference Procedure:** PR-CT-01 v3 — Conduct of Training (Effective January 02, 2026)
**System:** DTI Region 7 EMS (Node.js/Fastify + React 19 + PostgreSQL + Prisma)

---

## 1. Executive Summary

This document analyzes the DTI "Conduct of Training" procedure (PR-CT-01) and its associated forms against the current EMS (Events Management System) implementation. The procedure defines a **7-step process** for managing MSME trainings end-to-end.

The EMS system has **~30% structural coverage** of this module. Strong infrastructure exists for event management, QR attendance, checklist tracking, survey submission, certificate generation, and notification dispatch. However, the DTI-specific content within those structures — CSF dimensions, impact survey indicators, participant demographics, proposal workflows, and reporting — does not match the procedure's requirements.

### Current Coverage by Step

| Step | DTI Form | EMS Coverage | Status |
|---|---|---|---|
| 1. Proposal Preparation | FM-CT-4 | ~25% | Basic event metadata only |
| 2. Evaluation & Approval | — | ~0% | No approval workflow |
| 3. Pre-Activity Checklist | FM-CT-7 | ~70% | Checklist framework exists (27/33 tasks) |
| 4. Attendance | FM-CT-2A | ~45% | QR attendance works; missing demographics |
| 5. CSF Survey | FM-CSF-ACT | ~20% | 4 ratings vs 9 SQD required |
| 6. Post-Activity Report | FM-CT-6 | ~0% | Entirely missing |
| 7. Impact Evaluation | FM-CT-5 + FM-CT-3 | ~30% | 5 Likert vs 16 binary indicators |

---

## 2. Documents Analyzed

| # | Document Code | Document Title | Purpose |
|---|---|---|---|
| 1 | PR-CT-01 v3 | Conduct of Training Procedure | Master procedure — 7-step SIPOC process flow |
| 2 | FM-CSF-ACT | Activity Based CSF Form | Client Satisfaction Feedback form (per-participant, per-activity) |
| 3 | FM-CSF-ACT-TAB | CSF Tabulation Sheet | Tabulation of CSF responses with demographics |
| 4 | FM-CSF-ACT-RPT | CSF Report | Summary report with satisfaction scores, CC analysis, demographics, speaker ratings |
| 5 | FM-CT-2A v1 | External Attendance Sheet | Participant attendance with demographics and social classification |
| 6 | FM-CT-3 v0 | Tabulated Training Effectiveness Forms | 6-month post-training effectiveness monitoring report |
| 7 | FM-CT-5 v1 | Training Monitoring and Evaluation Form | 6-month follow-up evaluation per participant |
| 8 | FM-CT-7 v0 | Training Monitoring Checklist | 33-task 3-phase operational checklist (Pre/During/Post) |

---

## 3. Procedure Process Flow (PR-CT-01)

The procedure defines 7 sequential steps:

```
1. Proposal Preparation
2. Evaluation & Approval of Proposal
3. Facilitate Pre-Activity Requirements
4. Conduct of the Training
5. Post-Training Evaluation (CSF)
6. Prepare & Submit Post-Activity Report
7. Monitoring & Evaluation (6 months after)
```

### SIPOC Model
- **Suppliers:** Interested participants, DTI Program Guidelines
- **Inputs:** TNA Tool, Stakeholder consultations, Industry Plan, MSME Dev Plan, CSF from clients, Approved AWFP
- **Process:** 7 steps above
- **Output:** Satisfactory Training Conducted
- **Customer:** Satisfied Trained MSMEs

---

## 4. Gap Analysis by Process Step

### Step 1: Proposal Preparation (~25% covered)

**Procedure Requirements:**
- Identification of training based on TNA, stakeholder requests, industry plans
- Conceptualization (business/managerial/organizational/entrepreneurial/inter-agency)
- Preparation of Project/Training Proposal (prescribed template FM-CT-4)
- Identification of resource person/trainer/facilitator
- Training Needs Analysis Tool (3-step: Screening → Scoring → Summary)

**What EMS Already Has:**
- `Event` model with title, startDate/endDate, venue, description, maxParticipants
- `DeliveryMode` enum (FACE_TO_FACE, ONLINE, HYBRID)
- `Event.targetSector`, `Event.targetRegion`
- `Event.organizerId`, `Event.programManagerId`
- `Event.requiresTNA` flag
- `TNAResponse` model (participant-level knowledge/skill/motivation scores)
- `Program` model for program linkage

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| Training Proposal entity (FM-CT-4) with 13 fields | ❌ Missing | No proposal entity separate from Event — need TrainingProposal with objectives, learning outcomes, background, methodology, monitoring plan | HIGH |
| Training categories/types | ❌ Missing | No Business/Managerial/Organizational/Entrepreneurial/InterAgency classification enum | HIGH |
| Budget line items (item, unit cost, quantity, estimated allocation, source of funds) | ❌ Missing | No budget model | HIGH |
| Risk register (threats, opportunities, action plan, responsible person) | ❌ Missing | No risk model per event | MEDIUM |
| Enterprise Development Track (EDT) level per target MSME group | ❌ Missing | No TrainingTargetGroup model | MEDIUM |
| Partner institution field | ❌ Missing | Not on Event model | MEDIUM |
| TNA Tool (proposal-level 5-question screening + scoring matrix) | ⚠️ Partial | TNAResponse exists but is participant-level, not the DTI proposal-level screening instrument | MEDIUM |
| Approval workflow (Staff → Division Chief → PD → RD) | ❌ Missing | EventStatus is operational (DRAFT→PUBLISHED), not an approval chain | HIGH |

---

### Step 2: Evaluation & Approval of Proposal (~0% covered)

**Procedure Requirements:**
- Evaluation based on client needs, guidelines, approved AWFP, COA rules
- Multi-level approval (Technical Divisions Chief, PD, and RD)

**What EMS Already Has:**
- `EventStatus` enum with operational states (DRAFT, PUBLISHED, etc.) — not approval states
- `RoleConfig` / `Permission` models exist (from roles & permissions feature) but not wired into event approval

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| Proposal evaluation criteria/checklist | ❌ Missing | No evaluation model | MEDIUM |
| Multi-level approval chain (Division Chief → PD → RD) | ❌ Missing | No approval workflow engine; could leverage existing RoleConfig for permission checks | HIGH |
| AWFP alignment check | ❌ Missing | No AWFP reference entity | LOW |
| COA compliance check | ❌ Missing | No compliance tracking | LOW |

---

### Step 3: Facilitate Pre-Activity Requirements (~70% covered)

**Procedure Requirements:**
- Coordination with training partners
- Invitation of stakeholders
- Promotional activities
- Logistics facilitation (venue, equipment, materials, food, accommodation)
- Review of Training Monitoring Checklist (FM-CT-7)

**What EMS Already Has:**
- `EventChecklist` + `ChecklistItem` models with full CRUD
- 4 phases: PLANNING, PREPARATION, EXECUTION, POST_EVENT (maps to FM-CT-7's Pre/During/Post)
- Status tracking: NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED, CANCELLED
- Priority levels: LOW, MEDIUM, HIGH, CRITICAL
- Assignee tracking (`assignedTo`, `assignedToName`) with StaffAutocomplete
- `dueDate`, `completedAt`, `completedBy`, `notes` fields
- `ChecklistComment` model with links
- 27 default template items across 4 phases
- `OrganizerChecklist.tsx` UI with inline CRUD, comments, assignment

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| FM-CT-7 exact 33-task list across 3 phases | ⚠️ Partial | EMS has 27 tasks across 4 phases — need to update template to include all 33 FM-CT-7 tasks | MEDIUM |
| `is_applicable` (Yes/No) field per checklist item | ❌ Missing | FM-CT-7 has an Applicable column — need boolean field on ChecklistItem | LOW |
| Responsible Person with DTI position/designation | ⚠️ Partial | Has `assignedTo` user ID but not position display | LOW |

---

### Step 4: Conduct of the Training (~45% covered)

**Procedure Requirements:**
- Management of conduct of activity
- Service provider oversight (food, accommodation, venue, equipment)
- Monitor training module/program flow
- Documentation (highlights, photos/videos, recording)
- Attendance with External Attendance Sheet (FM-CT-2A)

**What EMS Already Has:**
- `AttendanceRecord` model with participationId, sessionId, scannedAt, scannedByUserId
- `AttendanceMethod` enum: QR_SCAN, MANUAL
- HMAC-signed permanent QR per user — one QR for all events
- `EventSession` model for multi-session tracking
- `OrganizerQrScanner.tsx` with camera + manual check-in
- Participant name/email denormalized on `EventParticipation`

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| **UserProfile: Sex** (Male/Female) | ❌ Missing | Not on UserProfile — needed for FM-CT-2A and CSF disaggregation | HIGH |
| **UserProfile: Age bracket** (≤19, 20-34, 35-49, 50-64, ≥65) | ❌ Missing | No DOB or age bracket field | HIGH |
| **UserProfile: Category** (Self-employed, Govt, Private, General Public) | ❌ Missing | No employment classification | HIGH |
| **UserProfile: Social classification** (Abled, PWD, 4Ps, Youth, Senior Citizen, Indigenous Person, OFW, Others) | ❌ Missing | Critical for DTI disaggregated reporting | HIGH |
| **UserProfile: Client type** (Citizen, Business, Government) | ❌ Missing | Needed for CSF CC questions | MEDIUM |
| UserProfile: Name suffix | ❌ Missing | Has firstName, lastName, middleName but no suffix | LOW |
| Signature capture | ❌ Missing | FM-CT-2A requires signature — could use digital signature or checkbox | LOW |
| Pre-test / Post-test score capture | ❌ Missing | No assessment model for during-training tests | MEDIUM |
| Photo/video documentation upload | ❌ Missing | No media attachment on Event | LOW |

---

### Step 5: Post-Training Evaluation — CSF (~20% covered)

**Procedure Requirements:**
- CSF Form (FM-CSF-ACT) with DPA consent, demographics, CC questions, 8 SQD dimensions, speaker ratings
- CSF Tabulation (FM-CSF-ACT-TAB)
- CSF Report (FM-CSF-ACT-RPT) with computed ratings, adjectival scale, demographic disaggregation

**What EMS Already Has:**
- `CsfSurveyResponse` model — one per participation, with status (PENDING/SUBMITTED/EXPIRED)
- 4 rating fields: `overallRating`, `contentRating`, `facilitatorRating`, `logisticsRating` (1-5 scale)
- `highlightsFeedback`, `improvementsFeedback` text fields
- `expiresAt` field for survey expiration
- Auto-create on event COMPLETED → PENDING for all attendees
- Auto-dispatch CSF email via notification-service (1-hour BullMQ delay)
- Survey expiry cron job (14-day CSF, 30-day Impact)
- `CsfSurvey.tsx` participant page with star ratings
- `OrganizerCsfResults.tsx` with average score bars + verbatim feedback

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| **9 SQD dimensions** (Overall, Responsiveness, Reliability, Access & Facilities, Communication, Costs, Integrity, Assurance, Outcome) | ❌ Major mismatch | EMS has only 4 generic ratings — need to replace with 9 SQD fields on Prisma schema | HIGH |
| **Citizen's Charter questions** (CC1: Awareness 4-option, CC2: Visibility 4-option, CC3: Usefulness 3-option) | ❌ Missing | 3 new fields needed on CsfSurveyResponse | HIGH |
| **Per-speaker supplemental ratings** | ❌ Missing | No speaker entity or per-speaker rating model; EventSession has `speakerName` but no separate TrainingSpeaker or CSFSpeakerRating | HIGH |
| **DPA consent per survey** | ⚠️ Partial | UserProfile has `dpaConsentGiven` at registration but not per-survey consent | MEDIUM |
| **Demographics on CSF response** | ❌ Missing | FM-CSF-ACT captures sex, age, client type per response for disaggregated reporting | MEDIUM |
| **Comments/suggestions + reasons for low rating** | ⚠️ Partial | Has highlights/improvements but not general comments or low-rating reasons | LOW |
| **CSF Tabulation (FM-CSF-ACT-TAB)** | ❌ Missing | No per-SQD count-by-rating-level tabulation endpoint | HIGH |
| **CSF Report (FM-CSF-ACT-RPT)** | ❌ Missing | No computed CSF rating %, no adjectival ratings (Outstanding/VS/S/F/Unsatisfactory), no demographic disaggregation, no speaker summary | HIGH |

**CSF Rating Formula (from DTI documents):**
```
CSF Rating = sum(valid_responses) / (5 × count(valid_responses))
Adjectival Scale:
  90-100%  = Outstanding
  80-89%   = Very Satisfactory
  70-79%   = Satisfactory
  60-69%   = Fair
  Below 60% = Unsatisfactory
```

---

### Step 6: Prepare & Submit Post-Activity Report (~0% covered)

**Procedure Requirements:**
- Post-Activity Report (FM-CT-6 v2) with prescribed content
- Review by Division Chief
- Approval by PD/RD
- Submission to FAD and concerned offices

**What EMS Already Has:**
- Nothing — no PAR entity, no beneficiary groups, no budget utilization tracking

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| Post-Activity Report (PAR) entity with all fields | ❌ Missing | Need title, date, venue, highlights/outcomes, budget utilization, CSF observations, improvement opportunities, risk assessment | HIGH |
| Beneficiary demographics breakdown (sector/group, male/female/senior/PWD counts, EDT level) | ❌ Missing | Need PARBeneficiaryGroup model | HIGH |
| Budget utilization table (item, approved, actual, difference) | ❌ Missing | Links to budget items from proposal | HIGH |
| CSF assessment section | ❌ Missing | Should auto-pull from CSF report | MEDIUM |
| PAR approval workflow (Staff → Division Chief → PD/RD) | ❌ Missing | No approval chain | HIGH |
| Annex attachments (checklist, photos) | ❌ Missing | No document/media attachment | MEDIUM |

---

### Step 7: Monitoring & Evaluation — 6 months (~30% covered)

**Procedure Requirements:**
- Training Evaluation Form (FM-CT-5) per participant — min 5% response rate
- Tabulated Effectiveness Report (FM-CT-3)
- Review/approval workflow (Staff → Division Chief → PD/RD → MAA)

**What EMS Already Has:**
- `ImpactSurveyResponse` model with status lifecycle (SCHEDULED→PENDING→SUBMITTED→EXPIRED)
- 180-day auto-dispatch via cron job (daily 09:00)
- 5 Likert-scale ratings: `knowledgeApplication`, `skillImprovement`, `businessImpact`, `revenueChange`, `employeeGrowth`
- `revenueChangePct`, `employeeCountBefore`/`employeeCountAfter`
- `successStory`, `challengesFaced`, `additionalSupport` text fields
- `ImpactSurvey.tsx` participant page
- Admin impact report (`/admin/reports/impact`) with averages and breakdown

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| **16 binary benefit indicators (Yes/No)** | ❌ Major mismatch | EMS has 5 Likert ratings; FM-CT-5 requires 16 checkboxes: increased sales (%), profit (%), cost reduction (%), new markets, productivity, manpower welfare, standardized operation, bookkeeping, management, set-up business, expand business, enhanced capacity, adopt technology, innovation, no complaints, others | HIGH |
| **"Applied learnings" (Yes/No)** | ⚠️ Mismatch | EMS has `knowledgeApplication` as 1-5 Likert, not binary | MEDIUM |
| **"Training effective" (Yes/No + reason if No)** | ❌ Missing | No binary effectiveness field with reason | MEDIUM |
| **Future training requests** (free text) | ❌ Missing | No field | LOW |
| **Respondent info** (designation, company, date) | ❌ Missing | No respondent profile on survey response | LOW |
| **Tabulated Effectiveness Report (FM-CT-3)** | ❌ Missing | No per-participant tabulation with all 16 indicators | HIGH |
| **Response rate validation (min 5%)** | ❌ Missing | No threshold check | LOW |
| **TEM approval workflow** (Staff → Division Chief → PD/RD → MAA) | ❌ Missing | No approval chain | MEDIUM |

---

## 5. Cross-Cutting Gap: UserProfile Demographics

The following fields are missing from `identity_schema.user_profiles` and are needed across FM-CT-2A (attendance), FM-CSF-ACT (CSF), and the Post-Activity Report (PAR beneficiary counts):

| Field | Type | Used In | Priority |
|---|---|---|---|
| `sex` | Enum (MALE, FEMALE) | FM-CT-2A, CSF Report, PAR | HIGH |
| `dateOfBirth` or `ageBracket` | Date or Enum (AGE_19_OR_LOWER, AGE_20_TO_34, AGE_35_TO_49, AGE_50_TO_64, AGE_65_OR_HIGHER) | FM-CT-2A, CSF Report | HIGH |
| `employmentCategory` | Enum (SELF_EMPLOYED, EMPLOYED_GOVT, EMPLOYED_PRIVATE, GENERAL_PUBLIC) | FM-CT-2A | HIGH |
| `socialClassification` | Enum (ABLED, PWD, FOUR_PS, YOUTH, SENIOR_CITIZEN, INDIGENOUS_PERSON, OFW, OTHERS) | FM-CT-2A | HIGH |
| `clientType` | Enum (CITIZEN, BUSINESS, GOVERNMENT) | FM-CSF-ACT CC questions | MEDIUM |
| `nameSuffix` | String | FM-CT-2A | LOW |

---

## 6. Records Management Requirements (Section G of Procedure)

| Record | Retention | Access Level | EMS Status |
|---|---|---|---|
| Training Needs Analysis Tool | 2 years | Public upon request | ⚠️ TNAResponse exists (participant-level), no proposal-level TNA |
| Project/Training Proposal (FM-CT-4) | 2 years | Public upon request | ❌ No proposal entity |
| Training Monitoring Checklist (FM-CT-7) | 2 years | DTI Only | ✅ EventChecklist + ChecklistItem exist |
| Attendance Sheet (FM-CT-2A) | 2 years | Confidential | ✅ AttendanceRecord exists (missing demographics) |
| Invitation Letter | 2 years | Confidential | ❌ No invitation document tracking |
| Tabulated CSF Summary (FM-CSF-ACT-TAB/RPT) | 2 years | DTI Only | ❌ No tabulation/report entity |
| Filled-out CSF Forms (FM-CSF-ACT) | 2 years | Confidential | ✅ CsfSurveyResponse exists (insufficient fields) |
| Post Activity Report (FM-CT-6) | 2 years | DTI Only | ❌ No PAR entity |

---

## 7. Monitoring & Measurements Requirements (Section H)

| Metric | When | Method | EMS Status |
|---|---|---|---|
| Customer Satisfaction (CSF) | After every activity | Retrieve filled-out CSF, summarize, include in PAR | ⚠️ CSF auto-dispatched + aggregated but wrong dimensions |
| Timeliness of Training Conducted | End of semester | Accomplishment Reports | ❌ No accomplishment report module |
| No. of MSMEs Provided Training | End of training | Accomplishment Report / MSME Profile | ⚠️ Participant counts available via admin analytics but no MSME-specific tracking |

---

## 8. Proposed Data Model Changes

### New Models (event-service Prisma schema)

```prisma
// ─── Training Speakers ───────────────────────────
model TrainingSpeaker {
  id           String   @id @default(cuid())
  eventId      String
  name         String
  organization String?
  topic        String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())

  event          Event              @relation(fields: [eventId], references: [id])
  speakerRatings CsfSpeakerRating[]

  @@schema("event_schema")
}

// ─── CSF Speaker Rating (per-response, per-speaker) ──
model CsfSpeakerRating {
  id            String @id @default(cuid())
  csfResponseId String
  speakerId     String
  rating        Int    // 1-5

  csfResponse CsfSurveyResponse @relation(fields: [csfResponseId], references: [id])
  speaker     TrainingSpeaker    @relation(fields: [speakerId], references: [id])

  @@unique([csfResponseId, speakerId])
  @@schema("event_schema")
}

// ─── Post-Activity Report ────────────────────────
model PostActivityReport {
  id                        String    @id @default(cuid())
  eventId                   String    @unique
  title                     String
  dateConducted             String
  venue                     String
  highlightsOutcomes        String?   @db.Text
  fundUtilizationNotes      String?   @db.Text
  csfAssessmentObservations String?   @db.Text
  improvementOpportunities  String?   @db.Text
  status                    String    @default("DRAFT") // DRAFT, UNDER_REVIEW, APPROVED
  preparedById              String?
  reviewedById              String?
  approvedById              String?
  datePrepared              DateTime?
  dateReviewed              DateTime?
  dateApproved              DateTime?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  event             Event                  @relation(fields: [eventId], references: [id])
  beneficiaryGroups PARBeneficiaryGroup[]

  @@schema("event_schema")
}

model PARBeneficiaryGroup {
  id                 String @id @default(cuid())
  reportId           String
  sectorGroup        String
  maleCount          Int    @default(0)
  femaleCount        Int    @default(0)
  seniorCitizenCount Int    @default(0)
  pwdCount           Int    @default(0)
  edtLevel           String?
  actualCount        Int    @default(0)

  report PostActivityReport @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@schema("event_schema")
}

// ─── Training Effectiveness Evaluation (FM-CT-5, 6 months) ──
model TrainingEffectivenessEvaluation {
  id                        String    @id @default(cuid())
  impactSurveyResponseId    String    @unique
  appliedLearnings          Boolean?
  benefitIncreasedSales     Boolean   @default(false)
  benefitSalesPct           Decimal?  @db.Decimal(5,2)
  benefitIncreasedProfit    Boolean   @default(false)
  benefitProfitPct          Decimal?  @db.Decimal(5,2)
  benefitCostReduction      Boolean   @default(false)
  benefitCostPct            Decimal?  @db.Decimal(5,2)
  benefitNewMarkets         Boolean   @default(false)
  benefitProductivity       Boolean   @default(false)
  benefitManpowerWelfare    Boolean   @default(false)
  benefitStandardizedOp     Boolean   @default(false)
  benefitBookkeeping        Boolean   @default(false)
  benefitImprovedMgmt       Boolean   @default(false)
  benefitSetupBusiness      Boolean   @default(false)
  benefitExpandBusiness     Boolean   @default(false)
  benefitEnhancedCapacity   Boolean   @default(false)
  benefitAdoptTechnology    Boolean   @default(false)
  benefitInnovation         Boolean   @default(false)
  benefitNoComplaints       Boolean   @default(false)
  benefitOthers             String?
  needsProductDevelopment   Boolean   @default(false)
  needsLoanAdvisory         Boolean   @default(false)
  needsOthers               String?
  futureTrainingRequests    String?   @db.Text
  trainingEffective         Boolean?
  ineffectiveReason         String?   @db.Text
  respondentDesignation     String?
  respondentCompany         String?
  dateAccomplished          DateTime?
  createdAt                 DateTime  @default(now())

  impactSurveyResponse ImpactSurveyResponse @relation(fields: [impactSurveyResponseId], references: [id])

  @@schema("event_schema")
}
```

### Modified Models

**CsfSurveyResponse** — Replace 4 generic ratings with 9 SQD + 3 CC fields:
```prisma
// REMOVE: overallRating, contentRating, facilitatorRating, logisticsRating
// ADD:
  sqd0OverallRating    Int?  // 1-5 Likert
  sqd1Responsiveness   Int?
  sqd2Reliability      Int?
  sqd3AccessFacilities Int?
  sqd4Communication    Int?
  sqd5Costs            Int?  // typically N/A for training
  sqd6Integrity        Int?
  sqd7Assurance        Int?
  sqd8Outcome          Int?
  cc1Awareness         Int?  // 1-4
  cc2Visibility        Int?  // 1-4
  cc3Usefulness        Int?  // 1-3
  commentsSuggestions  String? @db.Text
  reasonsForLowRating  String? @db.Text
  speakerRatings       CsfSpeakerRating[]
```

**UserProfile** (identity-service) — Add demographic fields:
```prisma
  sex                   String?  // MALE, FEMALE
  ageBracket            String?  // AGE_19_OR_LOWER, AGE_20_TO_34, AGE_35_TO_49, AGE_50_TO_64, AGE_65_OR_HIGHER
  employmentCategory    String?  // SELF_EMPLOYED, EMPLOYED_GOVT, EMPLOYED_PRIVATE, GENERAL_PUBLIC
  socialClassification  String?  // ABLED, PWD, FOUR_PS, YOUTH, SENIOR_CITIZEN, INDIGENOUS_PERSON, OFW, OTHERS
  clientType            String?  // CITIZEN, BUSINESS, GOVERNMENT
  nameSuffix            String?
```

**ChecklistItem** — Add FM-CT-7 field:
```prisma
  isApplicable Boolean? // FM-CT-7 "Applicable (Yes or No)" column
```

---

## 9. Implementation Plan

### Sprint A: UserProfile Demographics + CSF Alignment (Week 1)

**Goal:** Close the demographics gap and align CSF survey with DTI's 9 SQD + CC requirements.

**Backend — identity-service:**
1. Add 6 demographic fields to `UserProfile` Prisma schema: `sex`, `ageBracket`, `employmentCategory`, `socialClassification`, `clientType`, `nameSuffix`
2. Run `prisma db push`
3. Update `PUT /users/:id` to accept and validate new fields (Zod enums)
4. Update `GET /users/:id` to return new fields

**Backend — event-service:**
1. Migrate `CsfSurveyResponse` schema:
   - Remove: `overallRating`, `contentRating`, `facilitatorRating`, `logisticsRating`
   - Add: `sqd0OverallRating` through `sqd8Outcome` (9 Int fields), `cc1Awareness`, `cc2Visibility`, `cc3Usefulness`, `commentsSuggestions`, `reasonsForLowRating`
2. Add `TrainingSpeaker` model + `CsfSpeakerRating` model
3. Run `prisma db push`
4. Update `POST /surveys/events/:eventId/csf` to accept new SQD/CC fields + speaker ratings
5. Update `GET /surveys/events/:eventId/csf/results` to compute:
   - Per-SQD: count by rating level, CSF rating %, adjectival rating
   - CC1/CC2/CC3 distribution
   - Speaker average ratings
   - Demographic disaggregation (sex, age, client type)
6. Add `GET/POST /events/:id/speakers` — CRUD for training speakers
7. Update CSF auto-create logic (unchanged, just new fields default to null)

**Frontend — web-public:**
1. Update `ProfilePage.tsx` — add sex, age bracket, category, social classification, client type fields
2. Update `CsfSurvey.tsx` — replace 4 star ratings with:
   - CC1/CC2/CC3 radio questions (Citizen's Charter)
   - 9 SQD criteria with 5-point radio buttons (SA/A/N/D/SD)
   - Dynamic speaker supplemental ratings
   - Comments/suggestions text area
3. Update `OrganizerCsfResults.tsx` — show:
   - Per-SQD breakdown table with % and adjectival ratings
   - CC distribution
   - Speaker satisfaction
   - Sex/age/client type disaggregation

**Effort:** ~5 days

---

### Sprint B: Checklist Alignment + Post-Activity Report (Week 2)

**Goal:** Align checklist with FM-CT-7 exactly and implement the Post-Activity Report (FM-CT-6).

**Backend — event-service:**
1. Add `isApplicable` Boolean field to `ChecklistItem` schema
2. Update default checklist template to all 33 FM-CT-7 tasks (mapped to 3 phases):
   - Part 1 Pre-Training (12 items) → PLANNING + PREPARATION phases
   - Part 2 Actual Training (10 items) → EXECUTION phase
   - Part 3 Post-Training (11 items) → POST_EVENT phase
3. Add `PostActivityReport` + `PARBeneficiaryGroup` models
4. Run `prisma db push`
5. Create PAR routes (`/events/:id/par`):
   - `POST /events/:id/par` — create/update PAR (auto-populates title, date, venue from event)
   - `GET /events/:id/par` — get PAR with beneficiary groups
   - `PATCH /events/:id/par/status` — status transitions (DRAFT → UNDER_REVIEW → APPROVED)
6. PAR auto-population endpoint: pull CSF summary, attendance counts by demographics

**Frontend — web-public:**
1. Update `OrganizerChecklist.tsx` — add `isApplicable` toggle (Y/N) per task
2. Create `OrganizerPostActivityReport.tsx` page:
   - Auto-filled header (title, date, venue from event)
   - Beneficiary groups table (sector/group rows with M/F/Senior/PWD/EDT columns)
   - Highlights/outcomes narrative rich text
   - Budget utilization table (if budget items exist)
   - CSF assessment section (auto-pulled from CSF results with editable observations)
   - Improvement opportunities narrative
   - Risk assessment effectiveness table
   - Approval status bar with workflow buttons
3. Add route: `/organizer/events/:id/par` → `OrganizerPostActivityReport`
4. Add "Post-Activity Report" button/tab on `OrganizerEventDetail.tsx`

**Effort:** ~5 days

---

### Sprint C: Impact Survey FM-CT-5 Alignment + Effectiveness Report (Week 3)

**Goal:** Add the DTI's 16 binary benefit indicators alongside existing Likert ratings, and implement the Tabulated Training Effectiveness Report (FM-CT-3).

**Backend — event-service:**
1. Add `TrainingEffectivenessEvaluation` model (linked 1:1 to ImpactSurveyResponse)
2. Run `prisma db push`
3. Update `POST /surveys/events/:eventId/impact` to accept FM-CT-5 fields:
   - `appliedLearnings` (boolean)
   - 16 benefit indicator booleans + 3 percentage fields
   - `needsProductDevelopment`, `needsLoanAdvisory`, `needsOthers`
   - `futureTrainingRequests`
   - `trainingEffective`, `ineffectiveReason`
   - `respondentDesignation`, `respondentCompany`
4. Update `GET /surveys/events/:eventId/impact/results` to aggregate:
   - Count of each benefit indicator (Yes/No totals)
   - Average percentages for sales/profit/cost
   - Applied learnings rate
   - Effectiveness rate
   - Assistance needed summary
5. Add `/surveys/events/:eventId/impact/effectiveness-report` — structured data matching FM-CT-3:
   - Per-participant row with all 16 indicators
   - Response rate vs 5% threshold
   - Summary statistics
6. Add effectiveness report status tracking (Draft → UnderReview → Approved → SubmittedToMAA)

**Frontend — web-public:**
1. Update `ImpactSurvey.tsx` — add FM-CT-5 sections:
   - "Were you able to apply the learnings?" (Yes/No)
   - 16 benefit checkboxes with optional % fields for a/b/c
   - Additional assistance needed checkboxes
   - Future training requests text area
   - "Do you think the training is effective?" (Yes/No + reason if No)
   - Respondent info fields
2. Create `OrganizerEffectivenessReport.tsx` — tabulation view matching FM-CT-3:
   - Per-participant table with all indicators
   - Summary statistics cards
   - Response rate indicator (flag if below 5%)
   - Approval workflow buttons
3. Add route: `/organizer/events/:id/effectiveness` → `OrganizerEffectivenessReport`
4. Add tab/link on `OrganizerEventDetail.tsx`

**Effort:** ~4 days

---

### Sprint D: Training Speakers + CSF Report Generation (Week 4)

**Goal:** Polish the CSF reporting layer to match FM-CSF-ACT-RPT format and add speaker management.

**Backend — event-service:**
1. Add CSF report generation endpoint: `GET /surveys/events/:eventId/csf/report`
   - Report Summary: Total Responses, Total Clients, Retrieval Rate, Overall Satisfaction, Adjectival Rating
   - Per-SQD satisfaction breakdown (count per rating level)
   - Per-SQD CSF Rating % with adjectival
   - Speaker-level satisfaction summary
   - CC1/CC2/CC3 response distribution
   - Sex disaggregation with distribution counts
   - Age group distribution
   - Client type distribution
2. Add CSF report PDF generation (optional — PDFKit, matching FM-CSF-ACT-RPT layout)

**Frontend — web-public:**
1. Create `OrganizerCsfReport.tsx` — full DTI CSF report matching FM-CSF-ACT-RPT:
   - Report header with event details
   - Summary cards (total responses, retrieval rate, overall satisfaction)
   - SQD breakdown table with colored rating bars
   - Speaker satisfaction table
   - CC distribution pie/bar charts
   - Demographic charts (sex, age, client type)
   - Improvement actions table (editable)
   - Export to PDF button
2. Add speaker management UI on `OrganizerEventDetail.tsx` (add/remove speakers with name, org, topic)
3. Add route: `/organizer/events/:id/csf-report` → `OrganizerCsfReport`

**Effort:** ~4 days

---

### Sprint E (Future): Proposal Workflow + Budget (Weeks 5-6)

**Goal:** Implement the proposal preparation and approval workflow (Steps 1-2). This is lower priority since the existing Event creation flow partially covers it.

**Backend — event-service:**
1. Extend `Event` model with proposal fields OR create separate `TrainingProposal` model:
   - `trainingType` enum (BUSINESS, MANAGERIAL, ORGANIZATIONAL, ENTREPRENEURIAL, INTER_AGENCY)
   - `partnerInstitution`, `learningOutcomes`, `methodology`, `monitoringPlan` fields
   - `approvalStatus` enum (DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED)
   - `submittedAt`, `reviewedById`, `approvedById` timestamps
2. Add `TrainingBudgetItem` model (item, unitCost, quantity, estimated, source, actualSpent)
3. Add `TrainingRiskItem` model (risk, actionPlan, actionDate, responsiblePerson, effectiveness)
4. Add `TrainingTargetGroup` model (edtLevel, sectorGroup, estimatedParticipants)
5. Create proposal approval routes:
   - `POST /events/:id/submit-proposal` — submit for review
   - `PATCH /events/:id/review-proposal` — Division Chief review
   - `PATCH /events/:id/approve-proposal` — PD/RD approval

**Frontend — web-public:**
1. Extend `OrganizerEventForm.tsx` with proposal-specific tabs:
   - Training Type selector
   - Learning Outcomes rich text
   - Methodology & Monitoring Plan
   - Budget Items table (inline add/edit)
   - Risk Register table
   - Target Groups table (EDT level, sector, count)
2. Create approval workflow UI with status display and action buttons
3. Add budget utilization tracking after event completion (actual vs planned)

**Effort:** ~6 days

---

## 10. Priority Summary

| Priority | Sprint | Items | Effort | Impact |
|---|---|---|---|---|
| **P0 — Must Have** | A | UserProfile demographics, CSF 9 SQD + 3 CC + speaker ratings, Profile UI, CSF Survey UI, CSF Results UI | ~5 days | Unlocks compliance with FM-CSF-ACT, FM-CT-2A |
| **P0 — Must Have** | B | FM-CT-7 checklist alignment (33 tasks), Post-Activity Report (FM-CT-6), PAR UI | ~5 days | Unlocks steps 3 + 6 |
| **P1 — Should Have** | C | FM-CT-5 benefit indicators, effectiveness evaluation, tabulated report (FM-CT-3), Impact Survey UI | ~4 days | Completes step 7 |
| **P1 — Should Have** | D | CSF Report generation (FM-CSF-ACT-RPT), speaker management, report PDF export | ~4 days | Full CSF compliance |
| **P2 — Nice to Have** | E | Proposal workflow (steps 1-2), budget items, risk register, EDT target groups | ~6 days | Full procedure compliance |

**Total estimated effort: ~24 days (5 sprints across ~5 weeks)**

---

## 11. Integration Points (EMS System)

| Integration | EMS Component | Status |
|---|---|---|
| **Auth & Users** | identity-service (port 3011) — JWT RS256 + RBAC | ✅ Exists |
| **Events & Sessions** | event-service (port 3012) — full CRUD + status workflow | ✅ Exists |
| **Notifications** | notification-service (port 3013) — BullMQ + email/SMS | ✅ Exists |
| **CSF Auto-Dispatch** | event-service cron + notification-service | ✅ Exists (needs SQD realignment) |
| **Impact Survey Dispatch** | event-service cron (180-day, daily 09:00) | ✅ Exists |
| **Certificate System** | event-service PDFKit + QR verification | ✅ Exists (unchanged) |
| **Checklist** | event-service EventChecklist / ChecklistItem | ✅ Exists (needs FM-CT-7 alignment) |
| **Roles & Permissions** | identity-service RoleConfig + Permission | ✅ Exists (can power approval workflows) |
| **Admin Analytics** | event-service /admin/analytics/* | ✅ Exists (extend for DTI metrics) |
| **Public Directory** | identity-service /directory/* | ✅ Exists (unchanged) |
