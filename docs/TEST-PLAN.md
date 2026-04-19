# DTI Region 7 — EMS Dashboard
# Comprehensive System Test Plan
## Version 2.0 | April 18, 2026

---

## Table of Contents

1. [Test Overview](#1-test-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Test Accounts](#3-test-accounts)
4. [Test Cases by Module](#4-test-cases-by-module)
   - TC-01: User Registration (Individual)
   - TC-02: User Registration (Business)
   - TC-03: Employee Invite & Accept
   - TC-04: Email Verification
   - TC-05: Login/Logout & Session Management
   - TC-06: Password Reset
   - TC-07: User Profile Management
   - TC-08: Enterprise Profile Management
   - TC-09: Training Proposal Creation (Technical Staff)
   - TC-10: Proposal Approval Workflow (Division Chief → Regional Director)
   - TC-11: Facilitator Assignment (Technical Staff)
   - TC-12: Event Lifecycle (Status Transitions)
   - TC-13: Event Checklist (Planning & Preparation)
   - TC-14: Session Management
   - TC-15: Participant Registration
   - TC-16: TNA Assessment
   - TC-17: RSVP Confirmation
   - TC-18: QR Attendance Scanning
   - TC-19: Manual Check-In
   - TC-20: CSF Survey (Participant)
   - TC-21: Certificate Issuance & PDF
   - TC-22: Certificate Verification (Public)
   - TC-23: Impact Survey (6-Month)
   - TC-24: Staff Dashboard
   - TC-25: Organizer Event Report
   - TC-26: Organizer Reports Dashboard
   - TC-27: Admin Dashboard & User Management
   - TC-28: Admin Reports
   - TC-29: Public Enterprise Directory
   - TC-30: Notification System (Email/SMS)
   - TC-31: Cron Jobs (RSVP & Survey Reminders)
   - TC-32: End-to-End Full Event Lifecycle

---

## 1. Test Overview

### Purpose
Validate the full EMS platform from event planning through post-event reporting. This test plan covers the entire lifecycle: **Planning → Preparation → Execution → Post-Event Reporting**.

### Scope
- Identity Service (Auth, Users, Enterprises, Directory)
- Event Service (Events, Participations, Checklists, Surveys, Certificates, Analytics)
- Notification Service (Email, SMS via BullMQ)
- Web Public App (Public, Participant, Organizer, Admin portals)

### Test Approach
- **Functional testing** — each module tested independently
- **Integration testing** — end-to-end flows across services
- **Role-based testing** — verify each user role's permissions
- **Edge case testing** — error handling, validation, boundary conditions

---

## 2. Test Environment Setup

| Component | URL/Port | Notes |
|---|---|---|
| Web App | https://dti7ems.cubeworks.com.ph or http://localhost:5173 | Vite dev server |
| Identity API | http://localhost:3011 | Fastify |
| Event API | http://localhost:3012 | Fastify |
| Notification API | http://localhost:3013 | BullMQ workers |
| Mailpit (Test Email) | https://dti7ems-testmail.cubeworks.com.ph or http://localhost:8025 | Captures all emails |
| PostgreSQL | localhost:5433 | DB: dti_ems_dev |
| Redis | localhost:6379 | Sessions + BullMQ |

### Pre-requisites
1. All 3 services running
2. Mailpit running (Docker)
3. PostgreSQL and Redis running
4. Cloudflare tunnel active (for remote testing)

---

## 3. Test Accounts

Pre-seeded accounts (all use password `Admin@123456`):

| Role | Email | Display Title | Purpose |
|---|---|---|---|
| Super Admin | super.admin@dti7.gov.ph | Super Admin | Full system access |
| System Admin | system.admin@dti7.gov.ph | System Admin | System administration |
| Technical Staff | technical.staff@dti7.gov.ph | Technical Staff | Proposal creation, facilitator assignment, event oversight |
| Facilitator | facilitator@dti7.gov.ph | Facilitator | Event execution, checklist, QR scan, reports |
| Division Chief | division.chief@dti7.gov.ph | Division Chief | First-level proposal review |
| Regional Director | regional.director@dti7.gov.ph | Regional Director | Final proposal approval |
| Provincial Director | provincial.director@dti7.gov.ph | Provincial Director | Final proposal approval |

Create these additional accounts during testing:

| Role | Email | Purpose |
|---|---|---|
| Participant (Individual) | participant1@test.com | Standard participant flow |
| Participant (Individual) | participant2@test.com | Second participant (waitlist test) |
| Business Owner | owner@biztest.com | Business registration |
| Employee 1 | emp1@biztest.com | Invited via business registration |
| Employee 2 | emp2@biztest.com | Invited post-registration |

---

## 4. Test Cases by Module

---

### TC-01: User Registration (Individual)

**Precondition:** No existing account with test email

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/register` | Registration page loads with "Individual" and "Business" tabs | ☐ |
| 2 | Select "Individual" tab (default) | Individual registration form displayed | ☐ |
| 3 | Fill in: First Name, Last Name, Email, Password (8+ chars) | Fields accept input, password shows strength indicator | ☐ |
| 4 | Leave "I agree to DPA" unchecked, click Register | Form shows validation error — DPA required | ☐ |
| 5 | Check DPA, click Register | Success message: "Check your email to verify" | ☐ |
| 6 | Try registering same email again | Error: "Email already registered" | ☐ |
| 7 | Check Mailpit for verification email | Email received with verification link | ☐ |

---

### TC-02: User Registration (Business)

**Precondition:** No existing account with test email

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/register`, click "Business" tab | Business registration form with Owner + Enterprise + Employees sections | ☐ |
| 2 | Fill Owner section: Name, Email, Password, Mobile | Fields validated (email format, password length) | ☐ |
| 3 | Fill Enterprise: Business Name, Industry Sector, Stage | Required fields validated | ☐ |
| 4 | Click "Add Employee" — add emp1@biztest.com | Employee row appears with name, email, job title fields | ☐ |
| 5 | Add another employee emp2@biztest.com | Second employee row appears | ☐ |
| 6 | Remove second employee (trash icon) | Row removed | ☐ |
| 7 | Check DPA, click Register | Success: "Account created, employees invited" message | ☐ |
| 8 | Check Mailpit | Owner gets verification email, emp1 gets invite email | ☐ |
| 9 | Verify enterprise created properly | Enterprise profile linked to owner's account | ☐ |

---

### TC-03: Employee Invite & Accept

**Precondition:** TC-02 completed, invite email in Mailpit

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Open invite email from Mailpit | Email contains "Accept Invite" link | ☐ |
| 2 | Click accept-invite link | `/accept-invite?token=xxx` page loads | ☐ |
| 3 | Enter password, confirm password (mismatch) | Validation error: passwords don't match | ☐ |
| 4 | Enter matching password, check DPA box | Form ready to submit | ☐ |
| 5 | Click "Activate Account" | Success: "Account Activated" with login link | ☐ |
| 6 | Click "Go to Login" and login with emp1's email/password | Dashboard loads with Participant role | ☐ |
| 7 | Use same invite link again | Error: "Invite link is invalid or has expired" | ☐ |

---

### TC-04: Email Verification

**Precondition:** New user registered but not verified

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Open verification email from Mailpit | Contains verification link | ☐ |
| 2 | Click verification link | `/verify-email?token=xxx` → "Email verified" success | ☐ |
| 3 | Try login before verifying email | Error: "Email not verified" | ☐ |
| 4 | After verification, login | Login succeeds | ☐ |
| 5 | Click same verification link again | Error: "Invalid or expired token" | ☐ |

---

### TC-05: Login/Logout & Session Management

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/login` | Login form displayed | ☐ |
| 2 | Enter wrong password | Error: "Invalid credentials" | ☐ |
| 3 | Enter correct credentials | Redirect to appropriate dashboard based on role | ☐ |
| 4 | Verify JWT in localStorage | access_token present | ☐ |
| 5 | Wait 15+ minutes or clear access_token | Auto-refresh via httpOnly cookie | ☐ |
| 6 | Click Logout | Redirected to home, token cleared | ☐ |
| 7 | Try accessing protected route after logout | Redirected to login | ☐ |

---

### TC-06: Password Reset

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/forgot-password` | Email input form displayed | ☐ |
| 2 | Enter registered email, submit | Success: "Reset link sent" | ☐ |
| 3 | Enter non-existent email | Same success message (no enumeration) | ☐ |
| 4 | Open reset email in Mailpit | Contains reset link | ☐ |
| 5 | Click link → `/reset-password?token=xxx` | New password form | ☐ |
| 6 | Enter new password, submit | Success: "Password reset" | ☐ |
| 7 | Login with new password | Login succeeds | ☐ |
| 8 | Try old password | Error: "Invalid credentials" | ☐ |

---

### TC-07: User Profile Management

**Precondition:** Logged in as participant

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/profile` | Profile page with current user data | ☐ |
| 2 | Update First Name, Last Name | Fields update successfully | ☐ |
| 3 | Update mobile number | Format validated per Philippine standards | ☐ |
| 4 | Save changes | Success: "Profile updated" | ☐ |
| 5 | Refresh page | Updated data persists | ☐ |

---

### TC-08: Enterprise Profile Management

**Precondition:** Logged in as business owner (ENTERPRISE_REPRESENTATIVE)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | View enterprise profile | Business details displayed | ☐ |
| 2 | View members list | Owner shown with OWNER role | ☐ |
| 3 | Invite new employee | Invite email sent, member added with MEMBER role | ☐ |
| 4 | Remove a member | Member removed from enterprise | ☐ |

---

### TC-09: Training Proposal Creation (Technical Staff)

**Precondition:** Logged in as Technical Staff (technical.staff@dti7.gov.ph)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/organizer/dashboard` | Staff Dashboard with "New Proposal" button visible | ☐ |
| 2 | Click "New Proposal" | Proposal form with 3 sections: Training Info, Schedule & Logistics, Proposal Details | ☐ |
| 3 | Fill Training Info: Title, Program, Training Type, Description | Fields accept input | ☐ |
| 4 | Fill Schedule: Start Date, End Date, Delivery Mode, Venue, Max Participants, Target Sector | Fields validated (end ≥ start) | ☐ |
| 5 | Fill Proposal Details: Background, Objectives, Learning Outcomes, Methodology, Monitoring Plan | Textarea fields accept input | ☐ |
| 6 | Submit proposal | Proposal created with DRAFT status, proposalStatus=PENDING | ☐ |
| 7 | Verify proposal appears in "My Proposals" list | Proposal listed with PENDING badge | ☐ |
| 8 | View proposal detail page | All fields displayed under tabs: Proposal Details, Budget, Risk Register, Target Groups | ☐ |
| 9 | Edit proposal (while in DRAFT/PENDING) | Changes saved | ☐ |
| 10 | Login as Facilitator → Dashboard | "New Proposal" button NOT visible | ☐ |
| 11 | Login as Division Chief → Dashboard | "New Proposal" button NOT visible | ☐ |
| 12 | Login as Regional Director → Dashboard | "New Proposal" button NOT visible | ☐ |

---

### TC-10: Proposal Approval Workflow (Division Chief → Regional Director)

**Precondition:** TC-09 proposal exists in PENDING status

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as Division Chief | Sidebar shows "Proposals Queue" | ☐ |
| 2 | View proposals list | Pending proposals visible | ☐ |
| 3 | Open proposal detail | Proposal details displayed with approval controls | ☐ |
| 4 | Division Chief approves (or returns for revision) | Proposal status updated, forwarded to Regional Director | ☐ |
| 5 | Login as Regional Director | Sidebar shows "For Approval" | ☐ |
| 6 | View proposals list | DC-approved proposals visible | ☐ |
| 7 | Regional Director gives final approval | proposalStatus → APPROVED | ☐ |
| 8 | Login as Provincial Director | Can also approve (same as RD) | ☐ |
| 9 | Verify Facilitator cannot see approval controls | No approve/reject buttons | ☐ |

---

### TC-11: Facilitator Assignment (Technical Staff)

**Precondition:** Proposal in APPROVED status

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as Technical Staff | Navigate to approved proposal detail | ☐ |
| 2 | "Assign Facilitator" section visible | Search input and dropdown shown | ☐ |
| 3 | Search for facilitator by name | Matching facilitators appear in dropdown | ☐ |
| 4 | Select facilitator and click "Assign Facilitator" | Assignment saved, "Assigned" badge appears | ☐ |
| 5 | Login as Division Chief, view approved proposal | "Assign Facilitator" section NOT visible | ☐ |
| 6 | Login as Regional Director, view approved proposal | "Assign Facilitator" section NOT visible | ☐ |
| 7 | Login as Provincial Director, view approved proposal | "Assign Facilitator" section NOT visible | ☐ |
| 8 | Login as Facilitator, view approved proposal | "Assign Facilitator" section NOT visible | ☐ |
| 9 | Non-Technical Staff tries to assign via API | 403: "Only Technical Staff can assign a facilitator." | ☐ |

---

### TC-12: Event Lifecycle (Status Transitions)

**Precondition:** Approved proposal with assigned facilitator

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as assigned Facilitator | Event appears in "My Events" | ☐ |
| 2 | View event detail | Status buttons show: "Publish", "Cancel" | ☐ |
| 3 | Click "Publish" | Status → PUBLISHED | ☐ |
| 4 | Click "Open Registration" | Status → REGISTRATION_OPEN, event visible to public | ☐ |
| 5 | Register participants (TC-15) | Participants can register | ☐ |
| 6 | Click "Close Registration" | Status → REGISTRATION_CLOSED | ☐ |
| 7 | Click "Mark Ongoing" | Status → ONGOING | ☐ |
| 8 | Conduct attendance (TC-18/TC-19) | Attendance recorded | ☐ |
| 9 | Click "Mark Complete" | Status → COMPLETED, auto-creates CSF surveys | ☐ |
| 10 | Verify CSF surveys auto-created | PENDING CSF records for all ATTENDED participants | ☐ |
| 11 | Verify CSF email invites sent | Check Mailpit for survey invite emails | ☐ |
| 12 | Attempt invalid transition (COMPLETED → DRAFT) | Error: transition not allowed | ☐ |

---

### TC-13: Event Checklist (Planning & Preparation)

**Precondition:** Event created (any status)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/organizer/events/:id/checklist` | Checklist page loads | ☐ |
| 2 | No checklist exists → "Create Checklist" button shown | Prompt to create | ☐ |
| 3 | Click "Create Checklist" with template | Checklist created with 27 default items across 4 phases | ☐ |
| 4 | View Planning phase (7 items) | Items: objectives, target participants, dates, delivery mode, budget, speakers, agenda | ☐ |
| 5 | View Preparation phase (9 items) | Items: venue, invitations, materials, catering, certificates, AV, printing, registration area | ☐ |
| 6 | View Execution phase (5 items) | Items: setup, check-in, monitor, document, CSF | ☐ |
| 7 | View Post-Event phase (6 items) | Items: certificates, attendance report, CSF analysis, completion report, financial, filing | ☐ |
| 8 | Click circle icon to mark item COMPLETED | Status changes to COMPLETED with green checkmark | ☐ |
| 9 | Click green checkmark to un-complete | Status reverts to NOT_STARTED | ☐ |
| 10 | Use dropdown to set status to IN_PROGRESS | Status updates | ☐ |
| 11 | Use dropdown to set status to BLOCKED | Status shows warning icon | ☐ |
| 12 | Click "Add Task" → fill form → submit | New item appears in selected phase | ☐ |
| 13 | Assign a task to a person (name) | "👤 Name" shown on item | ☐ |
| 14 | Set due date for a task | "📅 Date" shown on item | ☐ |
| 15 | Set due date in the past (overdue) | Date shown in red | ☐ |
| 16 | Complete multiple items, check progress bar | Progress bar updates, phase completion pills update | ☐ |
| 17 | Delete a task (trash icon) | Item removed after confirmation | ☐ |
| 18 | Collapse/expand phases | Chevron toggles, items hidden/shown | ☐ |
| 19 | Complete all 27 items | Progress bar at 100%, green color | ☐ |

---

### TC-14: Session Management

**Precondition:** Event exists, logged in as Facilitator or Technical Staff

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | View event detail → Sessions section | "No sessions yet" shown | ☐ |
| 2 | Click "Add Session" | Form appears for title, venue, start/end times, speaker | ☐ |
| 3 | Fill session details, save | Session appears in list | ☐ |
| 4 | Add 2 more sessions | All 3 sessions listed in order | ☐ |
| 5 | Delete a session with no attendance | Session removed | ☐ |
| 6 | Try deleting a session with attendance records | Error: "Cannot delete a session that already has attendance" | ☐ |

---

### TC-15: Participant Registration

**Precondition:** Event in REGISTRATION_OPEN status

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | As public user, view event on `/events` | Event listed with "Register" option | ☐ |
| 2 | Click event → event detail page | Event details, sessions, register button | ☐ |
| 3 | Not logged in → click Register | Redirected to login | ☐ |
| 4 | Login as participant → return to event | Register button available | ☐ |
| 5 | Click Register, accept DPA | Registration successful, status = REGISTERED | ☐ |
| 6 | Check Mailpit | Registration confirmation email received | ☐ |
| 7 | Try registering same event again | Error: "Already registered" | ☐ |
| 8 | Set maxParticipants = 1, second participant registers | Second participant → WAITLISTED status | ☐ |
| 9 | View My Events | Event appears with status | ☐ |

---

### TC-16: TNA Assessment

**Precondition:** Participant registered for event with requiresTNA=true

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to My Events → event | "Complete TNA" button shown | ☐ |
| 2 | Click TNA → TNA form page | Knowledge, Skill, Motivation score inputs (0-100) | ☐ |
| 3 | Submit TNA scores (e.g., K:70, S:80, M:75) | Composite score calculated (0.35×70 + 0.40×80 + 0.25×75) = 75.25 | ☐ |
| 4 | Status changes to TNA_PENDING → can now RSVP | RSVP button appears | ☐ |

---

### TC-17: RSVP Confirmation

**Precondition:** TNA completed

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | View My Events → event | "Confirm RSVP" button shown | ☐ |
| 2 | Click Confirm RSVP | Status → RSVP_CONFIRMED | ☐ |
| 3 | Verify timestamp recorded | rsvpConfirmedAt populated | ☐ |

---

### TC-18: QR Attendance Scanning

**Precondition:** Event ONGOING, participant RSVP_CONFIRMED, sessions created

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | As participant, view QR Code page | Permanent QR code displayed (HMAC-SHA256 of userId) | ☐ |
| 2 | As organizer, go to `/organizer/events/:id/scan` | QR Scanner page with session picker | ☐ |
| 3 | Select a session from dropdown | Session selected | ☐ |
| 4 | Scan participant's QR code | "Check-in successful" — participant name displayed | ☐ |
| 5 | Scan same QR for same session again | "Already checked in" message | ☐ |
| 6 | Scan unregistered participant's QR | Error: "Not registered for this event" | ☐ |
| 7 | Scan all sessions for participant | Status → ATTENDED, attendance records created | ☐ |
| 8 | All sessions attended → auto-create certificate placeholder | Certificate record with PENDING status | ☐ |

---

### TC-19: Manual Check-In

**Precondition:** Event ONGOING, session selected

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | On QR scanner page, click "Manual Check-In" | Manual check-in interface | ☐ |
| 2 | Select participant from list | Participant selected | ☐ |
| 3 | Submit manual check-in | Attendance recorded, method=MANUAL | ☐ |
| 4 | Verify audit log | Manual check-in logged with organizer's userId | ☐ |

---

### TC-20: CSF Survey (Participant)

**Precondition:** Event COMPLETED, participant ATTENDED, CSF record PENDING

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Participant views My Events | "Complete Survey" CTA shown for completed event | ☐ |
| 2 | Click survey link | CSF form with star ratings (1-5) for Overall, Content, Facilitator, Logistics | ☐ |
| 3 | Fill all ratings + optional feedback text | Form validated | ☐ |
| 4 | Submit survey | Status → SUBMITTED, success message | ☐ |
| 5 | Try submitting again | Error: "Already submitted" | ☐ |
| 6 | Organizer views CSF results | Aggregate scores + verbatim feedback displayed | ☐ |

---

### TC-21: Certificate Issuance & PDF

**Precondition:** Event COMPLETED, participant ATTENDED

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Organizer clicks "Issue Certificates" on event detail | Bulk issue initiated | ☐ |
| 2 | Certificates created for all ATTENDED + COMPLETED participants | Certificate records with ISSUED status | ☐ |
| 3 | Check Mailpit | Certificate issued email sent to participants | ☐ |
| 4 | Participant views My Certificates | Certificate listed with status badge | ☐ |
| 5 | Click "Download PDF" | PDF downloaded — landscape A4, DTI branding, QR code, verification code | ☐ |
| 6 | Verify PDF contains: participant name, event title, date, verification code | All data present | ☐ |

---

### TC-22: Certificate Verification (Public)

**Precondition:** Certificate ISSUED with verification code

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/verify/<verification-code>` (no auth needed) | Certificate verification page | ☐ |
| 2 | Valid code | Shows: participant name, event, date, status = VALID | ☐ |
| 3 | Invalid/random code | Error: "Certificate not found" | ☐ |
| 4 | Revoked certificate code | Shows: status = REVOKED | ☐ |

---

### TC-23: Impact Survey (6-Month)

**Precondition:** Event completed 180+ days ago (or manually tested)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Cron job runs at 09:00 daily | Dispatches impact surveys for qualifying events | ☐ |
| 2 | Participant receives impact survey email | Email with link to survey | ☐ |
| 3 | Participant fills impact survey | Star ratings, revenue/employee metrics, success story | ☐ |
| 4 | Submit survey | Status → SUBMITTED | ☐ |
| 5 | Admin views impact report | Aggregated metrics, success stories, by-event breakdown | ☐ |

---

### TC-24: Staff Dashboard

**Precondition:** Logged in as Facilitator or Technical Staff

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/organizer/dashboard` | Dashboard with 4 stat cards | ☐ |
| 2 | Stats show: Total Events, Drafts, Open for Reg, Completed | Counts match actual data | ☐ |
| 3 | Upcoming Events list | Shows events sorted by date, max 5 | ☐ |
| 4 | As Technical Staff: "New Proposal" button visible | Navigates to proposal form | ☐ |
| 5 | As Facilitator: "New Proposal" button NOT visible | Only event management | ☐ |
| 6 | As Division Chief: "New Proposal" button NOT visible | Approver role only | ☐ |
| 7 | "View all" link works | Navigates to events list | ☐ |

---

### TC-25: Organizer Event Report

**Precondition:** Event exists (ideally COMPLETED for full data)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/organizer/events/:id/report` | Event report page loads | ☐ |
| 2 | Summary cards: Registered, Attended, Attendance Rate, Certificates Issued | All counts accurate | ☐ |
| 3 | Participation Breakdown section | Status counts match (REGISTERED, ATTENDED, etc.) | ☐ |
| 4 | Attendance by Session | Bar chart per session with count and percentage | ☐ |
| 5 | CSF Survey section | Average scores with star indicators, feedback quotes | ☐ |
| 6 | Checklist Progress section | Progress bar, phase breakdown | ☐ |
| 7 | Certificate Status section | Breakdown by PENDING/ISSUED/REVOKED | ☐ |

---

### TC-26: Organizer Reports Dashboard

**Precondition:** Multiple events exist in various statuses

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/organizer/reports` (sidebar → Reports) | Aggregate report dashboard | ☐ |
| 2 | Key Metrics: Total Events, Total Participants, Attendance Rate, Certificates | All counts accurate | ☐ |
| 3 | Event Status Breakdown | Pill badges with counts per status | ☐ |
| 4 | Average CSF Scores | Bar chart for Overall, Content, Facilitator, Logistics | ☐ |
| 5 | Performance Summary | Attended count, attendance %, certificates, CSF response rate | ☐ |
| 6 | Recent Completed Events table | Events with participants, attended, rate, CSF count | ☐ |
| 7 | "View Report →" link per event | Navigates to individual event report | ☐ |
| 8 | Technical Staff sees ALL events | Not filtered by organizerId | ☐ |
| 9 | Facilitator sees only OWN events | Filtered by organizerId | ☐ |

---

### TC-27: Admin Dashboard & User Management

**Precondition:** Logged in as SYSTEM_ADMIN

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/admin/dashboard` | 8 stat cards, role/status breakdowns | ☐ |
| 2 | Navigate to `/admin/users` | User list with search, role filter | ☐ |
| 3 | Change user role (e.g., PARTICIPANT → EVENT_ORGANIZER) | Role updated | ☐ |
| 4 | Suspend a user | User status → SUSPENDED, can't login | ☐ |
| 5 | Manually verify unverified user's email | emailVerified set to true | ☐ |
| 6 | Navigate to `/admin/enterprises` | Enterprise list with search, sector filter | ☐ |
| 7 | Verify an enterprise | Enterprise marked as verified | ☐ |
| 8 | Navigate to `/admin/audit-logs` | Audit log entries with filters | ☐ |
| 9 | Navigate to `/admin/settings` | System settings page with health checks | ☐ |

---

### TC-28: Admin Reports

**Precondition:** Completed events with CSF responses, certificates issued

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/admin/reports` → CSF Summary tab | System-wide + per-event CSF averages | ☐ |
| 2 | Impact Survey tab | Aggregated impact ratings, success stories, quantitative metrics | ☐ |
| 3 | Event Completion tab | Per-event: attendance rate, certification %, CSF response % | ☐ |
| 4 | Enterprise Training tab | Company-by-company training completion matrix | ☐ |
| 5 | Registration Trends tab | 12-month bar chart of registrations | ☐ |
| 6 | DPA Compliance tab | Total registrations, recent registrations | ☐ |

---

### TC-29: Public Enterprise Directory

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/directory` (no auth required) | Enterprise directory page | ☐ |
| 2 | Search by business name | Matching results displayed | ☐ |
| 3 | Filter by industry sector | Results filtered | ☐ |
| 4 | Filter by enterprise stage | Results filtered | ☐ |
| 5 | Pagination works | Navigate through pages | ☐ |
| 6 | View enterprise details | Name, sector, stage, member count | ☐ |

---

### TC-30: Notification System (Email/SMS)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Register a new user | Registration confirmation email in Mailpit | ☐ |
| 2 | Complete event → CSF dispatch (1hr delay) | CSF invite emails queued in BullMQ | ☐ |
| 3 | Issue certificates | Certificate issued email | ☐ |
| 4 | Invite employee | Employee invite email | ☐ |
| 5 | Verify email template formatting | HTML formatted, DTI branding, correct links | ☐ |
| 6 | Check BullMQ queue status | Jobs processed successfully (Redis) | ☐ |

---

### TC-31: Cron Jobs (RSVP & Survey Reminders)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Event starts in 7 days | RSVP reminder email sent (daily 08:00) | ☐ |
| 2 | Event starts in 1 day | Urgent RSVP reminder sent ("Tomorrow!") | ☐ |
| 3 | Event completed 180 days ago | Impact survey dispatched (daily 09:00) | ☐ |
| 4 | CSF survey 14+ days old with PENDING status | Status → EXPIRED (daily 02:00) | ☐ |
| 5 | Impact survey 30+ days old with PENDING status | Status → EXPIRED (daily 02:00) | ☐ |

---

### TC-32: End-to-End Full Event Lifecycle

This is the master test case that exercises the complete platform from start to finish.

**Duration:** ~30-45 minutes

#### Phase 1: Proposal & Approval

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as Technical Staff | Staff Dashboard, "New Proposal" button visible | ☐ |
| 2 | Create proposal: "Kapatid Training on Digital Marketing" | Proposal in DRAFT, proposalStatus=PENDING | ☐ |
| 3 | Set details: Venue: "DTI 7 Conference Room", Start: [future date], Sector: "IT-BPM", Max: 20 | Saved | ☐ |
| 4 | Fill proposal details: Background, Objectives, Learning Outcomes, Methodology | Saved | ☐ |
| 5 | Login as Division Chief | Proposal appears in "Proposals Queue" | ☐ |
| 6 | Review and approve proposal | Forwarded to Regional Director | ☐ |
| 7 | Login as Regional Director | Proposal appears in "For Approval" | ☐ |
| 8 | Final approval | proposalStatus → APPROVED | ☐ |

#### Phase 2: Facilitator Assignment & Planning

| # | Step | Expected Result | Status |
|---|---|---|---|
| 9 | Login as Technical Staff | View approved proposal | ☐ |
| 10 | Assign Facilitator (facilitator@dti7.gov.ph) | Facilitator assigned, "Assigned" badge shown | ☐ |
| 11 | Login as Facilitator | Event appears in "My Events" | ☐ |
| 12 | Go to Checklist → Create with template | 27 items across 4 phases | ☐ |
| 13 | Mark Planning tasks: objectives ✓, target ✓, date ✓, mode ✓ | Progress bar updates | ☐ |

#### Phase 3: Preparation

| # | Step | Expected Result | Status |
|---|---|---|---|
| 14 | Add 3 sessions to the event (AM Lecture, PM Workshop, Closing) | 3 sessions listed | ☐ |
| 15 | Publish event (DRAFT → PUBLISHED) | Status = PUBLISHED | ☐ |
| 16 | Open Registration (PUBLISHED → REGISTRATION_OPEN) | Event visible on public page | ☐ |
| 17 | Mark Preparation checklist items as complete | Preparation phase progress updates | ☐ |

#### Phase 4: Participant Registration

| # | Step | Expected Result | Status |
|---|---|---|---|
| 18 | Logout. Register new participant1 (Individual) | Account created, verification email sent | ☐ |
| 19 | Verify email via Mailpit link | Email verified | ☐ |
| 20 | Login as participant1, register for event | Status = REGISTERED | ☐ |
| 21 | Complete TNA (K:80, S:70, M:85) | Composite score calculated, TNA saved | ☐ |
| 22 | Confirm RSVP | Status = RSVP_CONFIRMED | ☐ |
| 23 | Register Business (owner+1 employee) | Business registered, employee invited | ☐ |
| 24 | Accept employee invite via Mailpit | Employee account activated | ☐ |
| 25 | Employee registers for same event | 2nd participant registered | ☐ |

#### Phase 5: Event Day (Execution)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 26 | Login as Facilitator, close registration | Status = REGISTRATION_CLOSED | ☐ |
| 27 | Mark event ONGOING | Status = ONGOING | ☐ |
| 28 | Mark Execution checklist items: setup ✓, check-in started | Progress updates | ☐ |
| 29 | Go to QR Scanner, select "AM Lecture" session | Scanner ready | ☐ |
| 30 | Scan participant1's QR code | "Check-in successful: [name]" | ☐ |
| 31 | Scan employee's QR code | "Check-in successful: [name]" | ☐ |
| 32 | Switch to "PM Workshop" session, scan both | Both checked in | ☐ |
| 33 | Switch to "Closing" session, scan both | All sessions attended | ☐ |
| 34 | Verify both participants now have ATTENDED status | Statuses updated | ☐ |

#### Phase 6: Post-Event

| # | Step | Expected Result | Status |
|---|---|---|---|
| 35 | Mark event COMPLETED | Status = COMPLETED | ☐ |
| 36 | Verify CSF surveys auto-created for both participants | 2 PENDING CSF records | ☐ |
| 37 | Check Mailpit for CSF invite emails | Emails received | ☐ |
| 38 | Login as participant1, complete CSF survey (ratings + feedback) | Survey submitted | ☐ |
| 39 | Login as employee, complete CSF survey | Survey submitted | ☐ |
| 40 | Login as Facilitator, issue certificates (bulk) | 2 certificates ISSUED | ☐ |
| 41 | Check Mailpit for certificate emails | Emails received | ☐ |
| 42 | Login as participant1, download certificate PDF | PDF opens with correct data | ☐ |
| 43 | Copy verification code from PDF, visit `/verify/<code>` | Public verification shows "VALID" | ☐ |

#### Phase 7: Reporting

| # | Step | Expected Result | Status |
|---|---|---|---|
| 44 | Login as Facilitator, view Event Report | Full report: 2 registered, 2 attended, 100% rate | ☐ |
| 45 | CSF section shows averaged scores from both surveys | Averages displayed with stars | ☐ |
| 46 | Checklist section shows completion progress | All phases visible | ☐ |
| 47 | Go to Reports dashboard (sidebar) | Aggregate metrics across own events | ☐ |
| 48 | Verify attendance rate, CSF response rate | Correct percentages | ☐ |
| 49 | Login as Technical Staff, check Reports | All events visible (not filtered) | ☐ |
| 50 | Login as Admin, check Admin Reports | All tabs populated with data | ☐ |
| 51 | Mark all Post-Event checklist items done | Checklist 100% complete | ☐ |

---

## 5. Role-Based Access Matrix

Verify each role can ONLY access their permitted routes:

| Feature | Participant | Ent. Rep. | Facilitator | Technical Staff | Division Chief | Regional Dir. | Provincial Dir. | System Admin | Super Admin |
|---|---|---|---|---|---|---|---|---|---|
| Public events list | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register for event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| TNA / RSVP / QR | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CSF / Impact Survey | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| My Certificates | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Proposal | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Review Proposals | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Facilitator | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Run Events (Manage) | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Event Checklist | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| QR Scanner | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Issue Certificates | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Organizer Reports | ❌ | ❌ | ✅ (own) | ✅ (all) | ❌ | ❌ | ❌ | ✅ (all) | ✅ (all) |
| Admin Dashboard | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin User Mgmt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin Reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Enterprise Directory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 6. Non-Functional Test Checklist

| # | Check | Expected | Status |
|---|---|---|---|
| 1 | All API endpoints validate input (Zod schemas) | Invalid input returns 400 with descriptive error | ☐ |
| 2 | Rate limiting works (300 req/min) | 429 returned on excess | ☐ |
| 3 | CORS restricts to allowed origins | Cross-origin blocked | ☐ |
| 4 | JWT expiry enforced (15 min) | 401 after expiry, auto-refresh works | ☐ |
| 5 | httpOnly refresh cookie | Cookie not accessible via JS | ☐ |
| 6 | DPA consent timestamp recorded | Every registration has dpaConsentGiven + timestamp | ☐ |
| 7 | Passwords hashed with argon2id | DB stores hash, not plaintext | ☐ |
| 8 | QR codes use HMAC-SHA256 | No user data exposed in QR token | ☐ |
| 9 | Certificate verification works without auth | Public endpoint, no token needed | ☐ |
| 10 | Mobile responsive (all pages) | Layout adapts to mobile viewport | ☐ |
| 11 | PHT timezone in dates | All dates show Philippine time | ☐ |
| 12 | CSV export downloads properly | File downloads with correct encoding | ☐ |
| 13 | PDF certificate renders correctly | Landscape A4, DTI branding, QR, verification code | ☐ |

---

## 7. Defect Tracking

| ID | Test Case | Description | Severity | Status |
|---|---|---|---|---|
| | | | | |

---

## 8. Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Tester | | | |
| Project Lead | | | |
| QA Lead | | | |

---

*Generated by DTI Region 7 EMS Dashboard — Test Plan v2.0*
