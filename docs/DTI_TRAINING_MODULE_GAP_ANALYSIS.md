# DTI Conduct of Training Module — Gap Analysis & Implementation Plan

**Date:** April 18, 2026
**Reference Procedure:** PR-CT-01 v3 — Conduct of Training (Effective January 02, 2026)
**System:** DTI Region 7 EMS (Node.js/Fastify + React 19 + PostgreSQL + Prisma)

---

## 1. Executive Summary

This document analyzes the DTI "Conduct of Training" procedure (PR-CT-01) and its associated forms against the current EMS (Events Management System) implementation. The procedure defines a **7-step process** for managing MSME trainings end-to-end.

As of April 2026, the EMS system has **~90% structural coverage** of this module following the completion of Sprints A through E. All 7 process steps now have functional implementations including: 9 SQD + 3 CC CSF surveys with speaker ratings, participant demographics, FM-CT-7 33-task checklist, Post-Activity Report with beneficiary groups, FM-CT-5 16-indicator impact evaluation with effectiveness report, full CSF report with demographic disaggregation, speaker management, and proposal/budget/risk/target-group workflows with approval chains.

### Current Coverage by Step

| Step | DTI Form | EMS Coverage | Status |
|---|---|---|---|
| 1. Proposal Preparation | FM-CT-4 | ~90% | ✅ Proposal fields, budget, risk register, target groups implemented |
| 2. Evaluation & Approval | — | ~80% | ✅ Submit/review/approve/reject workflow implemented |
| 3. Pre-Activity Checklist | FM-CT-7 | ~95% | ✅ 33-task template with isApplicable field |
| 4. Attendance | FM-CT-2A | ~85% | ✅ QR attendance + demographics on UserProfile |
| 5. CSF Survey | FM-CSF-ACT | ~95% | ✅ 9 SQD + 3 CC + speaker ratings + full report |
| 6. Post-Activity Report | FM-CT-6 | ~85% | ✅ PAR with beneficiary groups, status workflow |
| 7. Impact Evaluation | FM-CT-5 + FM-CT-3 | ~90% | ✅ 16 binary indicators + effectiveness report |

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
| Training Proposal entity (FM-CT-4) with 13 fields | ✅ Implemented | Event model extended with `background`, `objectives`, `learningOutcomes`, `methodology`, `monitoringPlan` fields (Sprint E) | DONE |
| Training categories/types | ✅ Implemented | `TrainingType` enum (BUSINESS, MANAGERIAL, ORGANIZATIONAL, ENTREPRENEURIAL, INTER_AGENCY) on Event model (Sprint E) | DONE |
| Budget line items (item, unit cost, quantity, estimated allocation, source of funds) | ✅ Implemented | `TrainingBudgetItem` model with full CRUD routes + UI (Sprint E) | DONE |
| Risk register (threats, opportunities, action plan, responsible person) | ✅ Implemented | `TrainingRiskItem` model with CRUD routes + UI (Sprint E) | DONE |
| Enterprise Development Track (EDT) level per target MSME group | ✅ Implemented | `TrainingTargetGroup` model with CRUD routes + UI (Sprint E) | DONE |
| Partner institution field | ✅ Implemented | `partnerInstitution` field on Event model (Sprint E) | DONE |
| TNA Tool (proposal-level 5-question screening + scoring matrix) | ⚠️ Partial | TNAResponse exists but is participant-level, not the DTI proposal-level screening instrument | MEDIUM |
| Approval workflow (Staff → Division Chief → PD → RD) | ✅ Implemented | `ProposalStatus` enum (DRAFT→SUBMITTED→UNDER_REVIEW→APPROVED/REJECTED) with submit/review/approve routes (Sprint E) | DONE |

---

### Step 2: Evaluation & Approval of Proposal (~80% covered)

**Procedure Requirements:**
- Evaluation based on client needs, guidelines, approved AWFP, COA rules
- Multi-level approval (Technical Divisions Chief, PD, and RD)

**What EMS Already Has:**
- `EventStatus` enum with operational states (DRAFT, PUBLISHED, etc.) — not approval states
- `RoleConfig` / `Permission` models exist (from roles & permissions feature) but not wired into event approval
- ✅ `ProposalStatus` enum: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED (Sprint E)
- ✅ Submit/review/approve/reject routes with role-based access (PROGRAM_MANAGER+) (Sprint E)
- ✅ `OrganizerProposal.tsx` page with approval workflow buttons and status badges (Sprint E)

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| Proposal evaluation criteria/checklist | ❌ Missing | No evaluation model | MEDIUM |
| Multi-level approval chain (Division Chief → PD → RD) | ✅ Implemented | Proposal submit/review/approve/reject workflow with role checks (Sprint E) | DONE |
| AWFP alignment check | ❌ Missing | No AWFP reference entity | LOW |
| COA compliance check | ❌ Missing | No compliance tracking | LOW |

---

### Step 3: Facilitate Pre-Activity Requirements (~95% covered)

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
- ✅ 33 default template items across 3 phases matching FM-CT-7 (Sprint B)
- ✅ `isApplicable` Boolean field on ChecklistItem (Sprint B)
- `OrganizerChecklist.tsx` UI with inline CRUD, comments, assignment

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| FM-CT-7 exact 33-task list across 3 phases | ✅ Implemented | 33-task template matching FM-CT-7 Pre/During/Post phases (Sprint B) | DONE |
| `is_applicable` (Yes/No) field per checklist item | ✅ Implemented | `isApplicable` Boolean field on ChecklistItem (Sprint B) | DONE |
| Responsible Person with DTI position/designation | ⚠️ Partial | Has `assignedTo` user ID but not position display | LOW |

---

### Step 4: Conduct of the Training (~85% covered)

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
- ✅ `sex`, `ageBracket`, `employmentCategory`, `socialClassification`, `clientType`, `nameSuffix` on UserProfile (Sprint A)
- ✅ Demographics form on `Profile.tsx` participant page (Sprint A)

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| **UserProfile: Sex** (Male/Female) | ✅ Implemented | `sex` field on UserProfile (Sprint A) | DONE |
| **UserProfile: Age bracket** (≤19, 20-34, 35-49, 50-64, ≥65) | ✅ Implemented | `ageBracket` field on UserProfile (Sprint A) | DONE |
| **UserProfile: Category** (Self-employed, Govt, Private, General Public) | ✅ Implemented | `employmentCategory` field on UserProfile (Sprint A) | DONE |
| **UserProfile: Social classification** (Abled, PWD, 4Ps, Youth, Senior Citizen, Indigenous Person, OFW, Others) | ✅ Implemented | `socialClassification` field on UserProfile (Sprint A) | DONE |
| **UserProfile: Client type** (Citizen, Business, Government) | ✅ Implemented | `clientType` field on UserProfile (Sprint A) | DONE |
| UserProfile: Name suffix | ✅ Implemented | `nameSuffix` field on UserProfile (Sprint A) | DONE |
| Signature capture | ❌ Missing | FM-CT-2A requires signature — could use digital signature or checkbox | LOW |
| Pre-test / Post-test score capture | ❌ Missing | No assessment model for during-training tests | MEDIUM |
| Photo/video documentation upload | ❌ Missing | No media attachment on Event | LOW |

---

### Step 5: Post-Training Evaluation — CSF (~95% covered)

**Procedure Requirements:**
- CSF Form (FM-CSF-ACT) with DPA consent, demographics, CC questions, 8 SQD dimensions, speaker ratings
- CSF Tabulation (FM-CSF-ACT-TAB)
- CSF Report (FM-CSF-ACT-RPT) with computed ratings, adjectival scale, demographic disaggregation

**What EMS Already Has:**
- `CsfSurveyResponse` model — one per participation, with status (PENDING/SUBMITTED/EXPIRED)
- ✅ 9 SQD fields: `sqd0OverallRating` through `sqd8Outcome` (1-5 scale) (Sprint A)
- ✅ 3 CC fields: `cc1Awareness` (1-4), `cc2Visibility` (1-4), `cc3Usefulness` (1-3) (Sprint A)
- ✅ `commentsSuggestions`, `reasonsForLowRating` text fields (Sprint A)
- ✅ `TrainingSpeaker` model + `CsfSpeakerRating` model with per-speaker per-response ratings (Sprint A)
- `highlightsFeedback`, `improvementsFeedback` text fields
- `expiresAt` field for survey expiration
- Auto-create on event COMPLETED → PENDING for all attendees
- Auto-dispatch CSF email via notification-service (1-hour BullMQ delay)
- Survey expiry cron job (14-day CSF, 30-day Impact)
- ✅ `CsfSurvey.tsx` participant page with 9 SQD + 3 CC + speaker ratings (Sprint A)
- ✅ `OrganizerCsfResults.tsx` with per-SQD breakdown table, adjectival ratings, CC distribution (Sprint A)
- ✅ `OrganizerCsfReport.tsx` full DTI report matching FM-CSF-ACT-RPT format (Sprint D)
- ✅ CSF report endpoint with demographics disaggregation via cross-schema query (Sprint D)
- ✅ Speaker management UI on OrganizerEventDetail (Sprint D)

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| **9 SQD dimensions** (Overall, Responsiveness, Reliability, Access & Facilities, Communication, Costs, Integrity, Assurance, Outcome) | ✅ Implemented | 9 SQD fields on CsfSurveyResponse + CsfSurvey.tsx UI (Sprint A) | DONE |
| **Citizen's Charter questions** (CC1: Awareness 4-option, CC2: Visibility 4-option, CC3: Usefulness 3-option) | ✅ Implemented | cc1Awareness, cc2Visibility, cc3Usefulness fields + UI (Sprint A) | DONE |
| **Per-speaker supplemental ratings** | ✅ Implemented | TrainingSpeaker + CsfSpeakerRating models with per-speaker ratings (Sprint A) | DONE |
| **DPA consent per survey** | ⚠️ Partial | UserProfile has `dpaConsentGiven` at registration but not per-survey consent | LOW |
| **Demographics on CSF response** | ✅ Implemented | Demographics queried from UserProfile via cross-schema SQL for report disaggregation (Sprint D) | DONE |
| **Comments/suggestions + reasons for low rating** | ✅ Implemented | `commentsSuggestions` + `reasonsForLowRating` fields (Sprint A) | DONE |
| **CSF Tabulation (FM-CSF-ACT-TAB)** | ✅ Implemented | Per-SQD count-by-rating-level tabulation in CSF results endpoint (Sprint A) | DONE |
| **CSF Report (FM-CSF-ACT-RPT)** | ✅ Implemented | Full CSF report endpoint + OrganizerCsfReport.tsx with rating %, adjectival ratings, demographics, speaker summary (Sprint D) | DONE |
| **CSF Report PDF export** | ❌ Missing | No PDF generation (PDFKit integration deferred) | LOW |

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

### Step 6: Prepare & Submit Post-Activity Report (~85% covered)

**Procedure Requirements:**
- Post-Activity Report (FM-CT-6 v2) with prescribed content
- Review by Division Chief
- Approval by PD/RD
- Submission to FAD and concerned offices

**What EMS Already Has:**
- ✅ `PostActivityReport` model with title, dateConducted, venue, highlightsOutcomes, fundUtilizationNotes, csfAssessmentObservations, improvementOpportunities, risk assessment fields (Sprint B)
- ✅ `PARBeneficiaryGroup` model with sectorGroup, male/female/seniorCitizen/PWD counts, EDT level, actualCount (Sprint B)
- ✅ PAR routes: `POST/GET /events/:id/par`, `PATCH /events/:id/par/status` with DRAFT→UNDER_REVIEW→APPROVED workflow (Sprint B)
- ✅ `OrganizerPostActivityReport.tsx` page with beneficiary groups, narrative sections, approval status (Sprint B)
- ✅ PAR quick action link on OrganizerEventDetail (Sprint B)

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| Post-Activity Report (PAR) entity with all fields | ✅ Implemented | PostActivityReport model with full CRUD + OrganizerPostActivityReport.tsx (Sprint B) | DONE |
| Beneficiary demographics breakdown (sector/group, male/female/senior/PWD counts, EDT level) | ✅ Implemented | PARBeneficiaryGroup model with all demographic counts (Sprint B) | DONE |
| Budget utilization table (item, approved, actual, difference) | ✅ Implemented | Links to TrainingBudgetItem with estimatedAmount + actualSpent tracking (Sprint E) | DONE |
| CSF assessment section | ⚠️ Partial | Editable observations field exists; auto-pull from CSF report not yet implemented | LOW |
| PAR approval workflow (Staff → Division Chief → PD/RD) | ✅ Implemented | Status workflow (DRAFT→UNDER_REVIEW→APPROVED) with status transition route (Sprint B) | DONE |
| Annex attachments (checklist, photos) | ❌ Missing | No document/media attachment | LOW |

---

### Step 7: Monitoring & Evaluation — 6 months (~90% covered)

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
- ✅ `TrainingEffectivenessEvaluation` model with 16 binary benefit indicators, assistance needs, effectiveness fields (Sprint C)
- ✅ `ImpactSurvey.tsx` participant page with FM-CT-5 sections: applied learnings, 16 benefit checkboxes with % fields, assistance checkboxes, effectiveness question (Sprint C)
- ✅ `OrganizerEffectivenessReport.tsx` tabulation page matching FM-CT-3 format with per-participant table and summary statistics (Sprint C)
- ✅ Effectiveness report quick action link on OrganizerEventDetail (Sprint C)
- Admin impact report (`/admin/reports/impact`) with averages and breakdown

**Gaps:**

| Requirement | EMS Status | Gap | Priority |
|---|---|---|---|
| **16 binary benefit indicators (Yes/No)** | ✅ Implemented | TrainingEffectivenessEvaluation model with all 16 boolean fields + percentage fields (Sprint C) | DONE |
| **"Applied learnings" (Yes/No)** | ✅ Implemented | `appliedLearnings` boolean field on TrainingEffectivenessEvaluation (Sprint C) | DONE |
| **"Training effective" (Yes/No + reason if No)** | ✅ Implemented | `trainingEffective` boolean + `ineffectiveReason` text field (Sprint C) | DONE |
| **Future training requests** (free text) | ✅ Implemented | `futureTrainingRequests` text field (Sprint C) | DONE |
| **Respondent info** (designation, company, date) | ✅ Implemented | `respondentDesignation`, `respondentCompany`, `dateAccomplished` fields (Sprint C) | DONE |
| **Tabulated Effectiveness Report (FM-CT-3)** | ✅ Implemented | OrganizerEffectivenessReport.tsx with per-participant tabulation and summary stats (Sprint C) | DONE |
| **Response rate validation (min 5%)** | ❌ Missing | No threshold check — response rate displayed but not enforced | LOW |
| **TEM approval workflow** (Staff → Division Chief → PD/RD → MAA) | ❌ Missing | No approval chain for effectiveness report | MEDIUM |

---

## 5. Cross-Cutting Gap: UserProfile Demographics — ✅ IMPLEMENTED (Sprint A)

The following fields have been added to `identity_schema.user_profiles` and are used across FM-CT-2A (attendance), FM-CSF-ACT (CSF), and the Post-Activity Report (PAR beneficiary counts):

| Field | Type | Used In | Status |
|---|---|---|---|
| `sex` | String (MALE, FEMALE) | FM-CT-2A, CSF Report, PAR | ✅ Implemented |
| `ageBracket` | String (AGE_19_OR_LOWER, AGE_20_TO_34, AGE_35_TO_49, AGE_50_TO_64, AGE_65_OR_HIGHER) | FM-CT-2A, CSF Report | ✅ Implemented |
| `employmentCategory` | String (SELF_EMPLOYED, EMPLOYED_GOVT, EMPLOYED_PRIVATE, GENERAL_PUBLIC) | FM-CT-2A | ✅ Implemented |
| `socialClassification` | String (ABLED, PWD, FOUR_PS, YOUTH, SENIOR_CITIZEN, INDIGENOUS_PERSON, OFW, OTHERS) | FM-CT-2A | ✅ Implemented |
| `clientType` | String (CITIZEN, BUSINESS, GOVERNMENT) | FM-CSF-ACT CC questions | ✅ Implemented |
| `nameSuffix` | String | FM-CT-2A | ✅ Implemented |

**Frontend:** Profile.tsx updated with demographics form. CSF report endpoint queries these fields via cross-schema SQL for disaggregated reporting.

---

## 6. Records Management Requirements (Section G of Procedure)

| Record | Retention | Access Level | EMS Status |
|---|---|---|---|
| Training Needs Analysis Tool | 2 years | Public upon request | ⚠️ TNAResponse exists (participant-level), no proposal-level TNA |
| Project/Training Proposal (FM-CT-4) | 2 years | Public upon request | ✅ Event extended with proposal fields + OrganizerProposal.tsx (Sprint E) |
| Training Monitoring Checklist (FM-CT-7) | 2 years | DTI Only | ✅ EventChecklist + ChecklistItem with 33-task template + isApplicable (Sprint B) |
| Attendance Sheet (FM-CT-2A) | 2 years | Confidential | ✅ AttendanceRecord + UserProfile demographics (Sprint A) |
| Invitation Letter | 2 years | Confidential | ❌ No invitation document tracking |
| Tabulated CSF Summary (FM-CSF-ACT-TAB/RPT) | 2 years | DTI Only | ✅ CSF results + full report endpoints + OrganizerCsfReport.tsx (Sprint A+D) |
| Filled-out CSF Forms (FM-CSF-ACT) | 2 years | Confidential | ✅ CsfSurveyResponse with 9 SQD + 3 CC + speaker ratings (Sprint A) |
| Post Activity Report (FM-CT-6) | 2 years | DTI Only | ✅ PostActivityReport + PARBeneficiaryGroup + OrganizerPostActivityReport.tsx (Sprint B) |

---

## 7. Monitoring & Measurements Requirements (Section H)

| Metric | When | Method | EMS Status |
|---|---|---|---|
| Customer Satisfaction (CSF) | After every activity | Retrieve filled-out CSF, summarize, include in PAR | ✅ CSF auto-dispatched + 9 SQD aggregated + full report + PAR integration |
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

### Sprint A: UserProfile Demographics + CSF Alignment — ✅ COMPLETED

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

**Effort:** ~5 days — ✅ Completed

---

### Sprint B: Checklist Alignment + Post-Activity Report — ✅ COMPLETED

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

**Effort:** ~5 days — ✅ Completed

---

### Sprint C: Impact Survey FM-CT-5 Alignment + Effectiveness Report — ✅ COMPLETED

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

**Effort:** ~4 days — ✅ Completed

---

### Sprint D: Training Speakers + CSF Report Generation — ✅ COMPLETED

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

**Effort:** ~4 days — ✅ Completed

---

### Sprint E: Proposal Workflow + Budget — ✅ COMPLETED

**Goal:** Implement the proposal preparation and approval workflow (Steps 1-2).

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

**Effort:** ~6 days — ✅ Completed

---

## 10. Priority Summary

| Priority | Sprint | Items | Status | Impact |
|---|---|---|---|---|
| **P0 — Must Have** | A | UserProfile demographics, CSF 9 SQD + 3 CC + speaker ratings, Profile UI, CSF Survey UI, CSF Results UI | ✅ DONE | Compliance with FM-CSF-ACT, FM-CT-2A |
| **P0 — Must Have** | B | FM-CT-7 checklist alignment (33 tasks), Post-Activity Report (FM-CT-6), PAR UI | ✅ DONE | Steps 3 + 6 complete |
| **P1 — Should Have** | C | FM-CT-5 benefit indicators, effectiveness evaluation, tabulated report (FM-CT-3), Impact Survey UI | ✅ DONE | Step 7 complete |
| **P1 — Should Have** | D | CSF Report generation (FM-CSF-ACT-RPT), speaker management | ✅ DONE | Full CSF compliance |
| **P2 — Nice to Have** | E | Proposal workflow (steps 1-2), budget items, risk register, EDT target groups | ✅ DONE | Full procedure compliance |

**All 5 sprints completed.** Remaining gaps are low-priority items: PDF export, per-survey DPA consent, signature capture, pre/post-test scoring, media attachments, accomplishment reports, and effectiveness report approval workflow.

---

## 11. Integration Points (EMS System)

| Integration | EMS Component | Status |
|---|---|---|
| **Auth & Users** | identity-service (port 3011) — JWT RS256 + RBAC | ✅ Exists |
| **Events & Sessions** | event-service (port 3012) — full CRUD + status workflow | ✅ Exists |
| **Notifications** | notification-service (port 3013) — BullMQ + email/SMS | ✅ Exists |
| **CSF Auto-Dispatch** | event-service cron + notification-service | ✅ Exists — 9 SQD aligned |
| **Impact Survey Dispatch** | event-service cron (180-day, daily 09:00) | ✅ Exists — FM-CT-5 aligned |
| **Certificate System** | event-service PDFKit + QR verification | ✅ Exists (unchanged) |
| **Checklist** | event-service EventChecklist / ChecklistItem | ✅ FM-CT-7 aligned (33 tasks) |
| **Demographics** | identity-service UserProfile + cross-schema SQL | ✅ 6 demographic fields |
| **Proposals** | event-service Event proposal fields + approval routes | ✅ Submit/review/approve workflow |
| **CSF Report** | event-service CSF report endpoint + OrganizerCsfReport | ✅ FM-CSF-ACT-RPT format |
| **Post-Activity Report** | event-service PostActivityReport + beneficiary groups | ✅ FM-CT-6 compliant |
| **Effectiveness** | event-service TrainingEffectivenessEvaluation + report | ✅ FM-CT-3 + FM-CT-5 compliant |
| **Roles & Permissions** | identity-service RoleConfig + Permission | ✅ Exists (can power approval workflows) |
| **Admin Analytics** | event-service /admin/analytics/* | ✅ Exists (extend for DTI metrics) |
| **Public Directory** | identity-service /directory/* | ✅ Exists (unchanged) |
