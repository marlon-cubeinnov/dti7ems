# DTI EMS — Comprehensive Codebase Research for User Manual

> **Purpose:** Structured research summary of ALL UI pages, routing, roles, features, and workflows. This is raw material for writing a user manual — not the manual itself.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Access Matrix](#2-user-roles--access-matrix)
3. [Application Architecture](#3-application-architecture)
4. [Navigation & Layouts](#4-navigation--layouts)
5. [Public Pages (Unauthenticated)](#5-public-pages-unauthenticated)
6. [Authentication Pages](#6-authentication-pages)
7. [Participant Portal](#7-participant-portal)
8. [Organizer / Staff Portal](#8-organizer--staff-portal)
9. [Admin Panel (Integrated)](#9-admin-panel-integrated)
10. [Standalone Admin Console (web-admin)](#10-standalone-admin-console-web-admin)
11. [Event Lifecycle & DTI QMS 5-Step Process](#11-event-lifecycle--dti-qms-5-step-process)
12. [Proposal Workflow](#12-proposal-workflow)
13. [Report Workflows](#13-report-workflows)
14. [Survey & Feedback System](#14-survey--feedback-system)
15. [Certificate System](#15-certificate-system)
16. [Enterprise Directory](#16-enterprise-directory)
17. [System Configuration & Settings](#17-system-configuration--settings)

---

## 1. System Overview

**System Name:** DTI Region 7 Events Management System (DTI EMS)
**Organization:** Department of Trade and Industry, Region VII — Central Visayas, Cebu City, Philippines
**Purpose:** End-to-end management of DTI training events for MSMEs, from proposal creation to post-training effectiveness evaluation.

### Technical Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | React + React Router v6 |
| State Management | Zustand (auth), TanStack React Query (server state) |
| Styling | Tailwind CSS, Lucide React icons |
| Build Tool | Vite |
| Backend | Fastify (Node.js) |
| Database | PostgreSQL (port 5433 via Docker) |
| ORM | Prisma |
| Cache/Queue | Redis, BullMQ |
| Email | Resend API (production), Mailpit (development) |
| SMS | Semaphore PH |
| Auth | JWT RS256 (15min access, 7-day refresh, httpOnly cookies) |
| QR Scanning | html5-qrcode |
| Monorepo | pnpm workspaces + Turborepo |

### Frontend Applications

| App | Port | Path | Purpose |
|-----|------|------|---------|
| `web-public` | 5173 | `apps/web-public` | Main application — public, participant, organizer, and admin portals |
| `web-admin` | (separate) | `apps/web-admin` | Standalone admin console for SYSTEM_ADMIN / SUPER_ADMIN only |

### Backend Services

| Service | Port | Purpose |
|---------|------|---------|
| Identity Service | 3011 | Auth, users, enterprises, audit logs |
| Event Service | 3012 | Events, participations, attendance, certificates, surveys, checklists |
| Notification Service | 3013 | Email/SMS queues |

### Database Schemas

| Schema | Tables |
|--------|--------|
| `identity_schema` | user_profiles, enterprise_profiles, audit_logs |
| `event_schema` | events, programs, event_sessions, event_participations, tna_responses, attendance_records, certificates |

---

## 2. User Roles & Access Matrix

### All Roles (9 total)

| Role Enum | Display Label | Portal Access | Key Capabilities |
|-----------|--------------|---------------|-----------------|
| `PARTICIPANT` | Participant | Participant Portal | Browse/register events, complete TNA, view QR, submit CSF/Impact surveys, download certificates |
| `ENTERPRISE_REPRESENTATIVE` | Enterprise Rep | Participant Portal | Same as Participant + manages enterprise profile, can invite employees during registration |
| `EVENT_ORGANIZER` | Facilitator | Organizer Portal | View assigned events, manage QR check-in, manage checklists; **cannot** create proposals/events |
| `PROGRAM_MANAGER` | Technical Staff | Organizer Portal | Create proposals/events, manage all events, assign facilitators, create reports |
| `DIVISION_CHIEF` | Technical Divisions Chief | Organizer Portal | Review submitted proposals, review PAR/TEM reports |
| `REGIONAL_DIRECTOR` | Provincial/Regional Director | Organizer Portal | Approve/reject proposals, approve PAR/TEM reports |
| `PROVINCIAL_DIRECTOR` | Provincial Director | Organizer Portal | Same as Regional Director |
| `SYSTEM_ADMIN` | System Admin | Organizer + Admin Portal | Full system access, all organizer capabilities + admin functions |
| `SUPER_ADMIN` | Super Admin | Organizer + Admin Portal | Same as System Admin (highest privilege) |

### Portal Routing Logic (ProtectedRoute.tsx)

- If **not authenticated** → redirect to `/login`
- If authenticated but **wrong role** for route:
  - Organizer roles → redirect to `/organizer/dashboard`
  - Participant roles → redirect to `/dashboard`
- **Organizer roles** = PROGRAM_MANAGER, EVENT_ORGANIZER, DIVISION_CHIEF, REGIONAL_DIRECTOR, PROVINCIAL_DIRECTOR, SYSTEM_ADMIN, SUPER_ADMIN
- **Participant roles** = PARTICIPANT, ENTERPRISE_REPRESENTATIVE
- **Admin roles** = SYSTEM_ADMIN, SUPER_ADMIN

---

## 3. Application Architecture

### Route Structure (web-public App.tsx)

```
PUBLIC ROUTES (PublicLayout):
  /                          → Home
  /events                    → Event List
  /events/:id                → Event Detail
  /login                     → Login
  /register                  → Registration (Individual/Business)
  /verify-email              → Email Verification Status
  /forgot-password           → Forgot Password
  /reset-password            → Reset Password
  /accept-invite             → Accept Employee Invitation
  /verify/:code              → Certificate Verification
  /directory                 → Enterprise Directory

ORGANIZER ROUTES (ProtectedRoute → OrganizerLayout):
  /organizer/dashboard       → Staff Dashboard
  /organizer/proposals       → Proposal List
  /organizer/proposals/new   → New Proposal (EventForm)
  /organizer/proposals/:id   → View Proposal
  /organizer/proposals/:id/edit → Edit Proposal
  /organizer/events          → Event List (Staff)
  /organizer/events/new      → New Event (EventForm)
  /organizer/events/:id      → Event Detail (Management Hub)
  /organizer/events/:id/edit → Edit Event
  /organizer/events/:id/scan → QR Scanner
  /organizer/events/:id/participants → Participant List
  /organizer/events/:id/csf-results  → CSF Results
  /organizer/events/:id/csf-report   → CSF Report (ARTA format)
  /organizer/events/:id/checklist    → Checklist Management
  /organizer/events/:id/report       → Event Report
  /organizer/events/:id/par          → Post-Activity Report
  /organizer/events/:id/effectiveness → Effectiveness Report
  /organizer/events/:id/proposal     → Proposal View
  /organizer/reports         → Reports & Analytics
  /organizer/profile         → Staff Profile

ADMIN ROUTES (within Organizer, admin roles only):
  /admin/dashboard           → Admin Dashboard
  /admin/users               → User Management
  /admin/enterprises         → Enterprise Management
  /admin/events              → Events Overview
  /admin/audit-logs          → Audit Logs
  /admin/reports             → System Reports
  /admin/roles               → Roles & Permissions
  /admin/settings            → System Settings

PARTICIPANT ROUTES (ProtectedRoute → ParticipantLayout):
  /dashboard                 → Participant Dashboard
  /my-events                 → My Events
  /my-events/:participationId/tna    → Training Needs Assessment
  /my-events/:participationId/qr     → My QR Code
  /my-events/:participationId/csf    → CSF Survey
  /my-events/:participationId/impact → Impact Survey
  /my-certificates           → My Certificates
  /profile                   → Profile
```

### Standalone Admin Console (web-admin App.tsx)

```
/login                       → Admin Login
AdminGuard (SYSTEM_ADMIN or SUPER_ADMIN only):
  /                          → Dashboard
  /users                     → Users
  /enterprises               → Enterprises
  /events                    → Events
  /audit-logs                → Audit Logs
  /reports                   → Reports
```

---

## 4. Navigation & Layouts

### PublicLayout (Unauthenticated/Public Pages)

**Header (sticky, bg-dti-blue):**
- Logo: DTI logo + "DTI Region 7 / Events Management" text
- Nav links (pill style): Home | Events | Directory (only if authenticated)
- Auth state:
  - If logged in: [FirstName] link → `/dashboard` | "Log out" button
  - If not logged in: "Log in" link | "Register" button (accent style)

**Footer (bg-dti-blue-dark):**
- 3-column grid:
  - DTI Region 7 address (Cebu City, Philippines)
  - Quick Links: Browse Events, Enterprise Directory, Create Account
  - Data Privacy notice (RA 10173)
- Copyright: "© {year} Department of Trade and Industry Region 7. All rights reserved."

### ParticipantLayout

**Header (sticky, bg-dti-blue):**
- Logo: DTI logo + "DTI Region 7 EMS"
- Nav links: Home | Events | Directory
- User name display + "Log out" button

**Sidebar (left, 192px, hidden on mobile):**
- Dashboard
- My Events
- My Certificates
- Profile

### OrganizerLayout

**Header (sticky, bg-dti-blue):**
- Logo: DTI logo + "DTI Region 7 EMS"
- Nav links: Home | Events | Directory
- User name + role badge (e.g., "Technical Staff", "Facilitator") + "Log out" button

**Sidebar (left, 208px, hidden on mobile) — varies by role:**

**PROGRAM_MANAGER (Technical Staff):**
- Dashboard
- My Proposals
- New Proposal (+ icon)
- My Events
- Reports

**EVENT_ORGANIZER (Facilitator):**
- Dashboard
- My Events
- Reports

**DIVISION_CHIEF:**
- Dashboard
- Proposals Queue

**REGIONAL_DIRECTOR / PROVINCIAL_DIRECTOR:**
- Dashboard
- For Approval

**SYSTEM_ADMIN / SUPER_ADMIN (additional):**
- (PM_NAV items above)
- ── separator ──
- My Profile
- ── separator ──
- **Admin** section header:
  - Admin Dashboard
  - Users
  - Enterprises
  - All Events
  - Audit Logs
  - Reports
  - Roles & Permissions
  - Settings

### AdminLayout (Standalone web-admin)

**Header:** "DTI EMS Admin" (Shield icon, dti-orange background)
**Sidebar nav:** Dashboard | Users | Enterprises | Events | Audit Logs | Reports
**User display:** Name + role badge, logout button
**Responsive:** Mobile hamburger menu

---

## 5. Public Pages (Unauthenticated)

### 5.1 Home Page (`/`)

**Hero Section:**
- Heading: "Empowering MSMEs in Central Visayas"
- Subheading: "DTI Region 7 — Central Visayas"
- Description: Access training events, register as participant or enterprise
- CTA buttons:
  - "Browse Events" → `/events` (outlined)
  - "Create Account" → `/register` (primary)

**Stats Bar (4 metrics):**
- 250+ Events
- 15,000+ MSMEs Trained
- 6 Provinces
- 12 Industry Sectors

**Upcoming Events:** Grid of 6 event cards from the events API

**Bottom CTA:** "Ready to grow your business?" → `/register`

### 5.2 Event List (`/events`)

**Filters:**
- Search input (text)
- Sector dropdown: Manufacturing, Food Processing, Tourism, ICT, Agriculture, Retail, Services
- Mode dropdown: Face to Face, Online, Hybrid

**Display:** Grid of EventCard components with pagination

### 5.3 Event Detail (`/events/:id`)

**Main Content:**
- Event title (large heading)
- Event description
- Sessions list: each shows title, time range, speaker name

**Sidebar:**
- Date (formatted)
- Venue (for FACE_TO_FACE or HYBRID)
- "This event is available online" notice (for ONLINE or HYBRID)
- Slots: "{current}/{max} slots filled"
- TNA notice: "This event requires a Training Needs Assessment before confirming your RSVP" (if TNA required)
- DPA consent checkbox (RA 10173 - Data Privacy Act of 2012) — required before registration
- "Register for this Event" button
- OR "✓ You are registered for this event" badge (if already registered)
- OR "Log in to register" / "Create an account" links (if not authenticated)

### 5.4 Certificate Verification (`/verify/:code`)

**Input:** Verification code field (uppercase, monospace font)
**Button:** "Verify Certificate"
**Results:**
- Valid (green): event title, date, venue, issued date
- Invalid/revoked (red): error message

### 5.5 Enterprise Directory (`/directory`)

**Hero:** "Enterprise Directory" heading with description

**Stage Filter Cards:** 5 clickable cards with icons and counts:
- Pre-Startup | Startup | Growth | Expansion | Mature

**Filters:**
- Search input (business name)
- Sector dropdown filter

**Grid:** Enterprise cards showing:
- Business name
- Industry sector
- Stage badge
- Region
- Employee count

---

## 6. Authentication Pages

### 6.1 Login (`/login`)

**Form fields:**
- Email (placeholder: user@example.com)
- Password
- "Forgot password?" link → `/forgot-password`

**Buttons:** "Sign in"
**Links:** "Don't have an account? Create one" → `/register`
**Post-login redirect:**
- Organizer roles → `/organizer/dashboard`
- Participant/Enterprise roles → `/dashboard`

### 6.2 Register (`/register`)

**Two tabs:** Individual | Business

**Individual Registration Fields:**
- First Name (required)
- Last Name (required)
- Email (required)
- Mobile Number (required)
- Region (dropdown, 17 Philippine regions, default: "Region VII — Central Visayas")
- Password (min 10 chars, must include uppercase + number)
- Confirm Password
- DPA consent checkbox (RA 10173)

**Business Registration (additional fields):**
- Business Name (required)
- Industry Sector (dropdown, 13 options: Manufacturing, Food Processing, Tourism & Hospitality, ICT & Digital, Agriculture & Fisheries, Retail & Wholesale, Services, Handicrafts, Furniture, Garments & Textiles, Chemicals, Metals & Engineering, Others)
- Trade Name
- Registration Number
- TIN
- Stage (dropdown: Pre-Startup, Startup, Growth, Expansion, Mature)
- Employee Count

**Employee Invitations (Business tab only):**
- Repeatable rows: Email, First Name, Last Name, Job Title
- "+ Add Employee" button
- Invited employees receive email to `/accept-invite`

**Success message:** "Verification email sent. Check your inbox." + Mailpit link (dev mode)

### 6.3 Verify Email (`/verify-email`)

Displays email verification status message. Instructions to check inbox.

### 6.4 Forgot Password (`/forgot-password`)

**Form:** Email input
**Button:** "Send Reset Link"
**Success:** "If an account exists with this email, a reset link has been sent."

### 6.5 Reset Password (`/reset-password`)

**Form:** New Password + Confirm Password (same validation as register)
**Token:** From URL query parameter
**Button:** "Reset Password"

### 6.6 Accept Invite (`/accept-invite`)

**Purpose:** For employees invited during business registration
**Token:** From URL query parameter
**Form:** Set Password + Confirm Password + DPA consent
**Button:** "Activate Account"

---

## 7. Participant Portal

### 7.1 Dashboard (`/dashboard`)

**Greeting:** "Good day, {firstName}! 👋"

**3 Stat Cards:**
- Events Registered (count)
- Completed (count)
- Certificates (count)

**Recent Events List:**
- Each shows event title, date, venue
- Status badges: COMPLETED (green), RSVP_CONFIRMED (blue), WAITLISTED (yellow)

### 7.2 My Events (`/my-events`)

**List of participations** with contextual CTAs per status:

| Participation Status | Available Actions |
|---------------------|-------------------|
| REGISTERED | "Complete TNA →" link (if TNA required) |
| RSVP_CONFIRMED | "📱 My QR Code" link |
| ATTENDED | CSF/Impact survey links |
| Any | TNA Score display (if completed) |

**Conditional CTAs:**
- "📋 Complete Feedback Survey →" (when CSF status is PENDING)
- "Survey Submitted ✓" (when CSF completed)
- "📊 Complete Impact Survey →" (when impact status is PENDING)
- "Impact Survey Submitted ✓" (when impact completed)
- "Certificate Issued ✓" (when certificate exists)

### 7.3 Training Needs Assessment (TNA) (`/my-events/:participationId/tna`)

**3 Question Groups (scale 1-10, circular buttons):**

**Knowledge (3 questions):**
1. Understanding of relevant business concepts
2. Knowledge of industry best practices
3. Awareness of available DTI programs and services

**Skills (3 questions):**
1. Ability to apply business skills effectively
2. Proficiency in using relevant tools and technology
3. Capability to manage business operations

**Motivation (2 questions):**
1. Level of motivation to improve business performance
2. Willingness to adopt new strategies and innovations

**Scoring:** Computes average score per group and composite score
**Submit button:** "Submit TNA & Confirm RSVP"
**Note:** "Your answers are used for training design only. There are no right or wrong answers."

### 7.4 My QR Code (`/my-events/:participationId/qr`)

**Display:**
- Event title and date
- Status badge (RSVP_CONFIRMED or ATTENDED)
- QR code image (permanent personal QR code)
- Instruction: "Show this to the facilitator for scanning."
- **Only available** when status is RSVP_CONFIRMED or ATTENDED

### 7.5 CSF Survey (`/my-events/:participationId/csf`)

**ARTA-format Client Satisfaction Feedback**

**Section 1: Citizen's Charter (CC)**
- CC1 - Awareness (4 radio options):
  1. "I know what a CC is and I saw this office's CC."
  2. "I know what a CC is but I did NOT see this office's CC."
  3. "I learned of the CC only when I saw this office's CC."
  4. "I do not know what a CC is and I did not see one in this office."
- CC2 - Visibility (4 radio options):
  1. Easy to see
  2. Somewhat easy to see
  3. Difficult to see
  4. Not visible at all
- CC3 - Usefulness (3 radio options):
  1. Helped very much
  2. Somewhat helped
  3. Did not help

**Section 2: Service Quality Dimensions (SQD0-SQD8, 1-5 Likert scale each):**
- SQD0: Overall Satisfaction
- SQD1: Responsiveness
- SQD2: Reliability
- SQD3: Access & Facilities
- SQD4: Communication
- SQD5: Costs (optional/"if applicable")
- SQD6: Integrity
- SQD7: Assurance
- SQD8: Outcome

**Section 3: Speaker Ratings**
- Per-speaker 1-5 star rating

**Section 4: Open-ended Feedback**
- Highlights/What did you like? (textarea)
- Suggestions for improvement (textarea)
- Comments/Suggestions (textarea)
- Reasons for low rating (textarea, conditional)

### 7.6 Impact Survey (`/my-events/:participationId/impact`)

**6-month post-training impact assessment**

**Star Ratings (1-5 each):**
- Knowledge Application
- Skill Improvement
- Business Impact
- Revenue Change
- Employee Growth

**Quantitative Data:**
- Revenue Change % (number input)
- Employees Before (number input)
- Employees After (number input)

**Open-ended:**
- Success Story (textarea)
- Challenges Faced (textarea)
- Additional Support Needed (textarea)

**FM-CT-5 Training Effectiveness Evaluation:**
- Applied learnings? (Yes/No)
- 15 Benefit indicator checkboxes (each with percentage field):
  - Increased sales
  - Increased profit
  - Cost reduction
  - Accessed new markets
  - Improved productivity
  - Improved manpower welfare
  - Standardized operations
  - Started/improved bookkeeping
  - Improved management
  - Set up new business
  - Expanded business
  - Enhanced capacity
  - Adopted technology
  - Innovation
  - No customer complaints
- Additional assistance needs: product development, loan advisory (checkboxes)
- Future training requests (textarea)
- Training effective? (Yes/No + reason)

### 7.7 My Certificates (`/my-certificates`)

**Certificate display** with full DTI certificate rendering:
- Header: "Republic of the Philippines"
- DTI logo
- "Certificate of Completion"
- Participant's full name
- Event title
- Venue
- Date range
- Verification code
- Regional Director signature line

**Actions per certificate:**
- "🖨️ Print / Preview" button
- "⬇️ Download PDF" button
- "Verify Certificate" link → `/verify/:code`

### 7.8 Profile (`/profile`)

**Section 1: Personal Information**
- First Name, Last Name, Middle Name
- Suffix
- Sex (dropdown)
- Age Bracket (dropdown)
- Client Type (dropdown)
- Employment Category (dropdown)
- Social Classification (dropdown)
- Mobile Number
- Email (read-only)

**Section 2: Address**
- Region
- Province
- City/Municipality
- Barangay

**Section 3: Professional**
- Job Title
- Industry Sector

**Section 4: Enterprise Membership** (if applicable)

**Buttons:** "Save Changes" | "Discard"

---

## 8. Organizer / Staff Portal

### 8.1 Staff Dashboard (`/organizer/dashboard`)

**Heading:** "Staff Dashboard"
**4 Stat Cards:**
- Total Events
- Drafts
- Open for Reg.
- Completed

**"New Proposal" button** — only visible to PROGRAM_MANAGER, SYSTEM_ADMIN, SUPER_ADMIN

**Upcoming Events list** — links to event detail pages

**Role-specific behavior:**
- EVENT_ORGANIZER sees "My Assigned Events" label
- PROGRAM_MANAGER sees "Technical Staff" label

### 8.2 Proposal List (`/organizer/proposals`)

**Page title varies by role:**
- DIVISION_CHIEF: "Proposals for Review"
- REGIONAL_DIRECTOR/PROVINCIAL_DIRECTOR: "Proposals for Approval"
- Others: "My Proposals"

**"New Proposal" button** — only for PROGRAM_MANAGER, SYSTEM_ADMIN, SUPER_ADMIN

**Table columns:** Title | Training Date | Mode | Proposal Status | Actions

**Proposal Statuses:** DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
(Color-coded badges: gray, blue, yellow, green, red)

**Actions:**
- View (all roles)
- Review (DIVISION_CHIEF, REGIONAL_DIRECTOR, PROVINCIAL_DIRECTOR)
- Edit (PROGRAM_MANAGER + admin, only if DRAFT or REJECTED)

### 8.3 Event/Proposal Form (`/organizer/proposals/new`, `/organizer/events/new`, edit variants)

**Blocked for EVENT_ORGANIZER role** — "Facilitators cannot create proposals"

**Section 1: Training Information**
- Title (text)
- Description (textarea)
- Training Type (dropdown): Business, Managerial, Organizational, Entrepreneurial, Inter-Agency
- Partner Institution (text, e.g., "DOST-7, TESDA")

**Section 2: Schedule & Logistics**
- Delivery Mode (dropdown): Face to Face, Online, Hybrid
- Venue (text, for F2F/Hybrid)
- Online Link (text, for Online/Hybrid)
- Start Date/Time (datetime)
- End Date/Time (datetime)
- Registration Deadline (datetime)
- Max Participants (number)
- Target Sector (dropdown)
- Target Region (dropdown)
- ☐ Requires TNA (checkbox)

**Section 3: Proposal Details**
- Background/Rationale (textarea)
- Objectives (textarea)
- Expected Learning Outcomes (textarea)
- Methodology (textarea)
- Monitoring & Evaluation Plan (textarea)

### 8.4 Proposal Detail (`/organizer/proposals/:id`, `/organizer/events/:id/proposal`)

**4 Tabs:**
1. **Proposal Details** — view/edit all proposal fields
2. **Budget ({count})** — line items: Item, Unit Cost, Quantity, Estimated Amount, Source of Funds, Actual Spent
3. **Risk Register ({count})** — items: Risk Description, Action Plan, Responsible Person
4. **Target Groups ({count})** — items: EDT Level, Sector Group, Estimated Participants

**Status badge:** DRAFT / SUBMITTED / UNDER_REVIEW / APPROVED / REJECTED

**Rejection Note:** displayed if proposal was rejected

**Role-specific action buttons:**

| Role | Available Actions |
|------|------------------|
| PROGRAM_MANAGER / Admin | "Save Proposal", "Submit for Review" (if DRAFT/REJECTED) |
| DIVISION_CHIEF / Admin | "Mark Under Review" (if SUBMITTED) |
| REGIONAL_DIRECTOR / PROVINCIAL_DIRECTOR / SUPER_ADMIN | "Approve" / "Reject" (if SUBMITTED/UNDER_REVIEW) |

**Step 3 — Activate Event (when APPROVED + event is DRAFT):**
- Green dashed panel with Rocket icon
- "Step 3 — Facilitate Pre-Activity Requirements"
- Description: "Activating the event will publish it and auto-generate the DTI Training Monitoring Checklist (FM-CT-7)"
- "Activate Event & Start Pre-Activity" button

**Assign Facilitator (when APPROVED, for PROGRAM_MANAGER/Admin):**
- Staff search autocomplete → filters by EVENT_ORGANIZER role
- "Assign Facilitator" button
- Shows assigned facilitator name when set

### 8.5 Event Management Hub (`/organizer/events/:id`)

**Quick Action Cards (contextual visibility):**
- Edit Event → edit form
- Participants → participant list
- QR / Check-In (ONGOING only) → QR scanner
- Checklist → checklist management
- Report → event report
- Proposal → proposal view
- CSF Results (COMPLETED only) → CSF results
- CSF Report (COMPLETED only) → ARTA CSF report
- Post-Activity Report (COMPLETED only) → PAR
- Effectiveness (COMPLETED only) → effectiveness report

**DTI QMS 5-Step Progress Banner:**
1. ✅ Prepare Proposal
2. ✅ Evaluate & Approve
3. ✅ Pre-Activity Requirements
4. ✅ Conduct Activity
5. ✅ Post-Training Evaluation

**Status Transition Buttons** — advance event status (role-gated)

**"Issue Certificates" Button** — appears when attended participants > 0

**Session Management:**
- Add/edit/delete sessions
- Fields: Title, Start Time, End Time, Venue, Speaker

**Speaker Management:**
- Add/delete speakers
- Fields: Name, Organization, Topic

**CSF Distribution:** Toggle to send CSF survey link

**Participant List:** Inline display with status badges

### 8.6 Staff Event List (`/organizer/events`)

**Table columns:** Title | Date | Mode | Status | Actions

**Actions per event:**
- View button
- Edit button
- Participants button
- "Move to…" status dropdown

**Status Transitions Allowed:**
```
DRAFT → [PUBLISHED, CANCELLED]
PUBLISHED → [REGISTRATION_OPEN, CANCELLED]
REGISTRATION_OPEN → [REGISTRATION_CLOSED, ONGOING, CANCELLED]
REGISTRATION_CLOSED → [ONGOING, CANCELLED]
ONGOING → [COMPLETED, CANCELLED]
```

**Role labeling:**
- EVENT_ORGANIZER: sees "My Assigned Events"
- PROGRAM_MANAGER: sees "Technical Staff"

### 8.7 QR Scanner (`/organizer/events/:id/scan`)

**Prerequisites:** Event must be ONGOING

**Interface:**
- Session selector dropdown
- Camera viewer: "Start Camera" / "Stop Camera" toggle
- QR code auto-detection via html5-qrcode library
- Scan result display: green (success) or red (error)

**Manual Fallback:**
- "Manual Check-in" section
- Text input: "Enter Participation ID"
- "Check In" button

### 8.8 Participant List (`/organizer/events/:id/participants`)

**Filters:**
- Search (name or email)
- Status dropdown: All, REGISTERED, WAITLISTED, RSVP_PENDING, RSVP_CONFIRMED, ATTENDED, NO_SHOW, CANCELLED

**"Export CSV" button** — downloads participant list as CSV file

**Table columns:** Name | Email | Status | TNA Score | Sessions | Certificate | Registered

**Participation Statuses (color-coded):**
- REGISTERED (blue)
- WAITLISTED (yellow)
- RSVP_PENDING (orange)
- RSVP_CONFIRMED (green)
- ATTENDED (teal)
- NO_SHOW (red)
- CANCELLED (gray)

**Pagination** with page controls

### 8.9 Checklist Management (`/organizer/events/:id/checklist`)

**4 Phases:** PLANNING | PREPARATION | EXECUTION | POST_EVENT

**Checklist Item Fields:**
- Title (text)
- Description (textarea)
- Phase (dropdown)
- Status: NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED, CANCELLED
- Priority: LOW, MEDIUM, HIGH, CRITICAL
- Assigned To (staff autocomplete search with role labels: Facilitator, Technical Staff, Div. Chief, etc.)
- Due Date (date picker)
- Notes (textarea)
- Comments with links

**Actions:**
- "Create from Template" — seeds standard DTI checklist items (FM-CT-7)
- "Create Blank" — empty checklist
- CRUD operations on individual items
- Status toggling per item

### 8.10 Event Report (`/organizer/events/:id/report`)

**Summary Cards (4):**
- Registered (count)
- Attended (count)
- Attendance Rate (%)
- Certificates Issued (count)

**Sections:**
1. **Participation Breakdown** — counts by status (REGISTERED, WAITLISTED, etc.)
2. **Attendance by Session** — per-session bar charts (name, count, %)
3. **Customer Satisfaction (CSF)** — 4 averages (Overall, Content, Facilitator, Logistics) with star ratings + verbatim feedback (Highlights, Improvements)
4. **Preparation Checklist Progress** — completion bar + per-phase counts
5. **Certificate Status** — breakdown by status

### 8.11 CSF Results (`/organizer/events/:id/csf-results`)

**SQD Rating Breakdown Table:**
- Columns: Dimension | 1 | 2 | 3 | 4 | 5 | CSF % | Rating
- Rows: SQD0–SQD8
- Adjectival ratings: Outstanding (green), Very Satisfactory (blue), Satisfactory (yellow), Fair (orange), Unsatisfactory (red)

**Citizen's Charter Responses:**
- CC1 Awareness, CC2 Visibility, CC3 Usefulness distributions

**Speaker Satisfaction:**
- Per-speaker: name, avg rating, count, progress bar

**Verbatim Feedback (4 columns):**
- What participants liked
- Suggestions for improvement
- Comments/Suggestions
- Reasons for low ratings

### 8.12 CSF Report — ARTA Format (`/organizer/events/:id/csf-report`)

**Official DTI ARTA CSF Report (FM-CSF-ACT-RPT)**

**Toolbar:** "← Back to Event" | "Print / Export PDF" button

**Letterhead:**
- "Republic of the Philippines"
- "Department of Trade and Industry"
- "Region VII — Central Visayas"
- "Client Satisfaction Feedback (CSF) — Activity Report"
- "FM-CSF-ACT-RPT | Anti-Red Tape Authority (ARTA) Prescribed Format"

**Part I: Activity Information** — table: Title, Date, Venue, Target Sector, Region

**Part II: Survey Summary** — Total Clients, Total Responses, Retrieval Rate, Overall Satisfaction Score

**Part III: SQD Breakdown** — detailed per-dimension table with full SQD question text, rating counts 1-5, CSF %, adjectival

**Part IV: Citizen's Charter** — CC1/CC2/CC3 distributions with labels

**Part V: Speaker Summary** — per-speaker: Name, Organization, Topic, Avg Rating, CSF %, Count

**Part VI: Demographics** — Sex, Age Bracket, Client Type distributions

**Part VII: Feedback** — Highlights, Improvements, Comments, Low Rating Reasons

### 8.13 Post-Activity Report — PAR (`/organizer/events/:id/par`)

**Form Reference:** FM-CT-6

**Status badge:** Draft | Under Review | Approved

**Section 1: Report Details**
- Title of Activity (text)
- Date Conducted (text)
- Venue (text)

**Section 2: Beneficiary Demographics (table)**
- Repeatable rows: Sector/Group | Male | Female | Senior | PWD | EDT Level | Actual Count
- "+ Add Group" button

**Section 3: Report Narratives**
- Highlights / Key Outcomes (textarea)
- Fund Utilization Notes (textarea)
- CSF Assessment Observations (textarea)
- Improvement Opportunities (textarea)

**Section 4: Signatories**
- Prepared by: Technical Staff (name, date)
- Reviewed by: Technical Divisions Chief (name, date)
- Approved by: PD/RD (name, date)

**Workflow Buttons:**

| Role | Action | Status Transition |
|------|--------|------------------|
| Staff (EO/PM/Admin) | "Create/Update Report" | — |
| Staff | "Submit for Review (Div. Chief)" | DRAFT → UNDER_REVIEW |
| Division Chief | "Mark as Reviewed" | UNDER_REVIEW → APPROVED |
| PD/RD | "Approve & Submit to FAD" | UNDER_REVIEW → APPROVED |

### 8.14 Effectiveness Report (`/organizer/events/:id/effectiveness`)

**Form Reference:** FM-CT-5 (Training Effectiveness Monitoring)

**Header:** "Training Effectiveness Report (FM-CT-5)"
**Subtitle:** "Step 7 — Monitoring and Evaluation · Collect 6 months after conduct of training"

**Status badge:** Draft | Under Review | Approved | Submitted to MAA

**Step 7 TEM Report Panel (indigo-bordered):**
- Badge: "7" (indigo circle)
- Description of ONE DTI QMS requirements
- Response threshold indicator: "✓ Response threshold met ({rate}% ≥ 5%)" (green) or "⚠ Response threshold NOT met ({rate}% < 5%)" (amber)
- "Tabulation Summary & Analysis" textarea

**Workflow Buttons:**

| Role | Action | Status Transition |
|------|--------|------------------|
| Staff | "Save/Update Report" | — |
| Staff | "Submit for Review (Div. Chief)" | DRAFT → UNDER_REVIEW |
| Division Chief | "Mark as Reviewed (Forward to PD/RD)" | UNDER_REVIEW → APPROVED |
| PD/RD | "Approve" | UNDER_REVIEW → APPROVED |
| PD/RD | "Submit to MAA (ManCom Agenda)" | APPROVED → SUBMITTED_TO_MAA |

**Signatories (4 columns):**
- Prepared by (Technical Staff)
- Reviewed by (Division Chief)
- Approved by (PD/RD)
- Submitted to MAA (For ManCom)

**Summary Cards (4):** Total Participants | Responses | Response Rate | Effectiveness Rate

**Applied Learnings:** Yes/No count cards
**Training Effective?:** Yes/No count cards

**Benefit Indicators Summary Table:** Indicator | Yes | No | Rate

**Individual Evaluations Table:** # | Submitted | Applied? | Effective? | Designation | Company | Benefits

### 8.15 Reports & Analytics (`/organizer/reports`)

**Key Metrics Cards (4):**
- Total Events
- Total Participants
- Attendance Rate (%)
- Certificates Issued

**Event Status Breakdown:** Status pills with counts

**Average CSF Scores:** 4 progress bars (Overall, Content, Facilitator, Logistics) + CSF Response Rate %

**Performance Summary:**
- Attended Participants (count)
- Overall Attendance Rate (% with color coding: ≥80% green, ≥50% yellow, <50% red)
- Total Certificates (count)
- CSF Response Rate (% with color coding)

**Recent Completed Events Table:**
Event | Date | Participants | Attended | Rate | CSF | "View Report →"

---

## 9. Admin Panel (Integrated in web-public)

### 9.1 Admin Dashboard (`/admin/dashboard`)

**Same structure as standalone admin dashboard.**

**8 Stat Cards (2 rows of 4):**
Row 1: Total Users (active count) | Enterprises (verified count) | Total Events (completed count) | Registrations (last 30d)
Row 2: Certificates Issued | CSF Response Rate | Attendance Records | Pending Users (suspended count)

**Users by Role** — sorted list (role → count)
**Events by Status** — sorted list (status → count)
**Quick Info:** Recent signups count + unverified enterprise count

### 9.2 User Management (`/admin/users`)

**Filters:** Search (name/email) | Status (Active/Pending/Suspended/Deactivated) | Role (all 9 roles)

**Table columns:** Name | Email | Role | Status | Joined | Actions

**Role Display Labels:** Participant, Enterprise Rep, Technical Staff, Facilitator, Division Chief, Regional Director, Provincial Director, System Admin, Super Admin

**Actions:**
- Change Role (UserCog icon) → modal with role dropdown
- Verify Email (MailCheck icon) — for unverified users
- Suspend/Reactivate (ShieldOff/ShieldCheck) → requires reason text

**Pagination**

### 9.3 Enterprise Management (`/admin/enterprises`)

**Filters:** Search (business name/TIN) | Stage (PRE_STARTUP/STARTUP/GROWTH/EXPANSION/MATURE) | Verified (true/false)

**Table columns:** Business Name (+ trade name) | Sector | Stage | Owner | Verified (✓/✗) | Listed (globe icon) | Registered | Actions

**Actions:**
- "Verify" — for unverified enterprises
- "List"/"Unlist" — toggle public directory visibility (`isPubliclyListed`)

**Pagination**

### 9.4 Events Overview (`/admin/events`)

**Read-only view** — no status change actions

**Filters:** Search | Status (all 7 statuses)

**Table columns:** Event (title + venue + sector) | Status | Mode (F2F/Online/Hybrid) | Date | Participants (count/max) | Sessions

**Pagination**

### 9.5 Audit Logs (`/admin/audit-logs`)

**Filters:** Entity Type (UserProfile/EnterpriseProfile) | Action text filter

**List view** (not table):
- Each entry: action badge (color-coded) + entity type:id + actor name + timestamp
- Expandable "View details"/"Hide details" showing JSON before/after data

**Action colors:** STATUS_CHANGE=yellow, ROLE_CHANGE=purple, ENTERPRISE=teal, LOGIN=blue

**Pagination**

### 9.6 Reports (`/admin/reports`)

**6 Tabbed Reports:**

| Tab | Content |
|-----|---------|
| CSF Summary | System-wide averages (Overall/Content/Facilitator/Logistics) + per-event breakdown table |
| Impact Survey | System-wide averages (Knowledge/Skill/Business/Revenue/Employee) + quantitative data (avg revenue change %, avg employee growth) + success stories + per-event breakdown |
| Event Completion | Table: Event, Date, Registered, Attended, Att. Rate, Certified, CSF Rate |
| Enterprise Training | Enterprise-specific training analytics |
| Registration Trends | Bar chart, last 12 months |
| DPA Compliance | Total registrations, recent 90 days count |

### 9.7 Roles & Permissions (`/admin/roles`)

**Header:** "Roles & Permissions" with Shield icon + role count

**Buttons:**
- "Seed Defaults" (RefreshCw icon) — re-initializes default roles and permissions
- "Create Role" (Plus icon)

**Permission Groups (color-coded):**
Users, Events, Participants, Attendance, Certificates, Surveys, Checklists, Enterprises, Reports, Admin, Notifications

**Role Management:**
- Click role → view assigned permissions
- "Edit Permissions" → checkbox matrix by permission group (collapsible groups)
- Save permissions button
- Edit role (label, description)
- Delete role (non-system roles only; system roles show Lock icon)
- Create custom role: Name (auto-uppercased), Label, Description

### 9.8 System Settings (`/admin/settings`)

**Read-only system health dashboard (8 sections):**

| Section | Details |
|---------|---------|
| Microservices | Identity (3011), Event (3012), Notification (3013), Frontend (5173) — all showing status |
| Database | PostgreSQL (5433), Redis (6379), user/enterprise/event counts |
| Notification Providers | Email: Resend API, SMS: Semaphore PH, queue names |
| Authentication | RS256 JWT, 15min access TTL, 7-day refresh TTL, httpOnly+SameSite cookies |
| Scheduled Jobs (Cron) | Impact Survey Dispatch (Daily 09:00), Survey Expiry Check (Daily 02:00), RSVP Reminders (Daily 08:00) |
| System Health | Active/Pending/Suspended users, Unverified enterprises — with warning indicators |
| Survey & Impact Metrics | CSF/Impact response rates, certificates issued |
| Deployment | Environment (Local Dev), Cloud (GCP Planned), Tunnel (Cloudflare), Phase 3 |

---

## 10. Standalone Admin Console (web-admin)

Separate React application at `apps/web-admin`. Mirrors much of the integrated admin panel but runs independently.

**Login:** "DTI EMS Admin Console" with Shield icon. Email placeholder: "admin@dti.gov.ph". Only allows SYSTEM_ADMIN and SUPER_ADMIN roles.

**Pages:** Dashboard, Users, Enterprises, Events, Audit Logs, Reports — same functionality as integrated admin pages (§9.1–9.6).

**Key difference:** Uses separate auth store and API client (`apps/web-admin/src/lib/api.ts`).

---

## 11. Event Lifecycle & DTI QMS 5-Step Process

### Event Status Flow

```
DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → ONGOING → COMPLETED
  ↓         ↓              ↓                    ↓                 ↓
CANCELLED  CANCELLED     CANCELLED           CANCELLED         CANCELLED
```

### DTI QMS 5-Step Process (displayed on Event Detail hub)

| Step | Name | Description | System Actions |
|------|------|-------------|----------------|
| 1 | Prepare Proposal | Technical Staff creates event + proposal with budget, risks, targets | Event created as DRAFT; proposal saved |
| 2 | Evaluate & Approve | Division Chief reviews → PD/RD approves/rejects | Proposal: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED |
| 3 | Pre-Activity Requirements | Activate event (DRAFT→PUBLISHED), auto-generates FM-CT-7 checklist | Event published; checklist seeded with DTI standard items |
| 4 | Conduct Activity | Open registration, QR attendance scanning, session management | REGISTRATION_OPEN → ONGOING; attendance recorded |
| 5 | Post-Training Evaluation | CSF surveys, certificates, PAR, effectiveness monitoring | CSF distributed; certificates issued; PAR/TEM submitted |

### Proposal Status Flow

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED
          ↓              ↓              |
        (rejected)    (rejected)     Activate Event
          ↓              ↓
       REJECTED       REJECTED → can resubmit (return to DRAFT editing)
```

### Participation Status Flow

```
REGISTERED → (TNA if required) → RSVP_CONFIRMED → ATTENDED → (surveys) → Certificate
     ↓                                                ↓
  WAITLISTED                                       NO_SHOW
     ↓
  CANCELLED
```

---

## 12. Proposal Workflow

### Step-by-Step Process

1. **Technical Staff** (PROGRAM_MANAGER) creates event + fills proposal details
2. **Technical Staff** clicks "Submit for Review" → status: SUBMITTED
3. **Division Chief** reviews, clicks "Mark Under Review" → status: UNDER_REVIEW
4. **Regional Director / Provincial Director** reviews:
   - "Approve" → status: APPROVED
   - "Reject" → status: REJECTED (with rejection note)
5. If REJECTED, Technical Staff can edit and resubmit
6. If APPROVED:
   - Technical Staff can **assign a Facilitator** (EVENT_ORGANIZER)
   - Technical Staff clicks **"Activate Event & Start Pre-Activity"** → event DRAFT→PUBLISHED, FM-CT-7 checklist auto-generated

---

## 13. Report Workflows

### Post-Activity Report (PAR) — FM-CT-6

**Steps (mapped to DTI QMS Step 6):**

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 6.1 | Staff (EO/PM) | Create/update PAR with demographics, narratives, budget notes | DRAFT |
| 6.2 | Staff | Submit for Division Chief review | DRAFT → UNDER_REVIEW |
| 6.3 | Division Chief | Mark as reviewed, forward to PD/RD | UNDER_REVIEW → APPROVED |
| 6.4 | PD/RD | Approve & submit to FAD | UNDER_REVIEW → APPROVED |

### Training Effectiveness Monitoring (TEM) — FM-CT-5

**Steps (mapped to DTI QMS Step 7):**

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 7.1 | System | Collect FM-CT-5 forms 6 months after training | Data collection |
| 7.2 | Staff | Tabulate results, write summary & analysis | DRAFT |
| 7.3a | Staff | Submit for Division Chief review | DRAFT → UNDER_REVIEW |
| 7.3b | Division Chief | Mark reviewed, forward to PD/RD | UNDER_REVIEW → APPROVED |
| 7.3c | PD/RD | Approve | UNDER_REVIEW → APPROVED |
| 7.4 | PD/RD | Submit to MAA for ManCom agenda | APPROVED → SUBMITTED_TO_MAA |

**Threshold Requirement:** Minimum 5% response rate of total participants

---

## 14. Survey & Feedback System

### Survey Types

| Survey | Form Ref | When Triggered | Who Fills | Content |
|--------|----------|---------------|-----------|---------|
| TNA | — | Before RSVP confirmation | Participant | 8 questions (Knowledge/Skills/Motivation) on 1-10 scale |
| CSF | FM-CSF-ACT | After event completion | Participant | Citizen's Charter (CC1-3) + SQD (0-8) + Speaker ratings + Open-ended |
| Impact | FM-CT-5 | 6 months after event | Participant | Star ratings + Quantitative data + Benefits checklist + Open-ended |

### Automated Jobs

- **Impact Survey Dispatch:** Daily at 09:00 — sends surveys to eligible participants
- **Survey Expiry Check:** Daily at 02:00 — marks expired surveys
- **RSVP Reminders:** Daily at 08:00 — sends reminder notifications

---

## 15. Certificate System

### Certificate Details Displayed

- "Republic of the Philippines" header
- DTI logo
- "Certificate of Completion"
- Participant's full name
- Event title
- Venue
- Date range (start – end)
- Unique verification code
- Regional Director signature line

### Certificate Actions

- **Issue Certificates** — organizer triggers from event management hub (when attended > 0)
- **Print/Preview** — participant can print
- **Download PDF** — participant can download
- **Verify** — public verification at `/verify/:code`

### Certificate Statuses

- PENDING
- ISSUED
- REVOKED

---

## 16. Enterprise Directory

### Registration

During business account registration, these fields are collected:
- Business Name, Trade Name, Industry Sector (13 options), Registration Number, TIN
- Stage (5 levels: Pre-Startup → Mature)
- Employee Count
- Employee Invitations (email, name, job title)

### Directory Display

- Public page at `/directory`
- Stage filter cards with icons and counts
- Search + sector filter
- Enterprise cards: business name, sector, stage, region, employee count
- Only displays enterprises where `isPubliclyListed = true`

### Admin Controls

- Verify enterprises (admin)
- Toggle public listing (admin: "List"/"Unlist" buttons)

---

## 17. System Configuration & Settings

### Notification Configuration

| Provider | Service | Queue |
|----------|---------|-------|
| Resend API | Email delivery | notification-email |
| Semaphore PH | SMS delivery | notification-sms |

### Authentication Settings

| Setting | Value |
|---------|-------|
| Algorithm | RS256 (asymmetric JWT) |
| Access Token TTL | 15 minutes |
| Refresh Token TTL | 7 days |
| Cookie Security | httpOnly + SameSite |

### Scheduled Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| Impact Survey Dispatch | Daily 09:00 | Send impact surveys to eligible participants |
| Survey Expiry Check | Daily 02:00 | Mark expired survey windows |
| RSVP Reminders | Daily 08:00 | Send RSVP reminder notifications |

### Infrastructure

| Component | Configuration |
|-----------|--------------|
| PostgreSQL | Port 5433 (Docker) |
| Redis | Port 6379 |
| Identity Service | Port 3011 |
| Event Service | Port 3012 |
| Notification Service | Port 3013 |
| Frontend | Port 5173 |
| Cloud | GCP (Planned) |
| Tunnel | Cloudflare |

---

## Appendix: Industry Sectors

Used in registration, event targeting, and enterprise directory:

1. Manufacturing
2. Food Processing
3. Tourism & Hospitality
4. ICT & Digital
5. Agriculture & Fisheries
6. Retail & Wholesale
7. Services
8. Handicrafts
9. Furniture
10. Garments & Textiles
11. Chemicals
12. Metals & Engineering
13. Others

## Appendix: Philippine Regions (Registration Dropdown)

17 regions available, default: "Region VII — Central Visayas"

## Appendix: Enterprise Stages

1. PRE_STARTUP — Pre-Startup
2. STARTUP — Startup
3. GROWTH — Growth
4. EXPANSION — Expansion
5. MATURE — Mature

## Appendix: Training Types

1. BUSINESS — Business
2. MANAGERIAL — Managerial
3. ORGANIZATIONAL — Organizational
4. ENTREPRENEURIAL — Entrepreneurial
5. INTER_AGENCY — Inter-Agency

## Appendix: DTI Form References

| Form Code | Name | Used In |
|-----------|------|---------|
| FM-CSF-ACT | Client Satisfaction Feedback — Activity | CSF Survey + CSF Report |
| FM-CSF-ACT-RPT | CSF Activity Report | CSF Report (ARTA format) |
| FM-CT-5 | Training Effectiveness Monitoring | Impact Survey + Effectiveness Report |
| FM-CT-6 | Post-Activity Report | Post-Activity Report (PAR) |
| FM-CT-7 | Training Monitoring Checklist | Checklist Management |
