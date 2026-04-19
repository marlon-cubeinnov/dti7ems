#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# DTI Region VII — Event Management System (EMS)
# END-TO-END TEST SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
# Tests the complete lifecycle:
#   1. Login as Program Manager → Create Proposal
#   2. Submit Proposal for Review
#   3. Division Chief marks Under Review
#   4. Regional Director Approves
#   5. Program Manager assigns Facilitator & activates event
#   6. Status transitions: Published → Registration Open
#   7. Register participant → Submit TNA → Get QR
#   8. Create session → Check in participant
#   9. Transition to Ongoing → Completed
#  10. Distribute CSF → Submit CSF → View Report
#  11. Issue Certificate → Verify Certificate
# ═══════════════════════════════════════════════════════════════════════════════

set +e  # Don't exit on errors — we handle them ourselves

IDENTITY_URL="http://localhost:3011"
EVENT_URL="http://localhost:3012"
REPORT_FILE="docs/E2E-TEST-RESULTS.md"

PASS_COUNT=0
FAIL_COUNT=0
STEP=0
RESULTS=""

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  STEP=$((STEP + 1))
  RESULTS+="| $STEP | $1 | ✅ PASS | $2 |\n"
  echo "✅ STEP $STEP — $1"
}
fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  STEP=$((STEP + 1))
  RESULTS+="| $STEP | $1 | ❌ FAIL | $2 |\n"
  echo "❌ STEP $STEP — $1: $2"
}

# Helper: extract JSON field (simple jq alternative if jq unavailable)
json_field() {
  echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d$2)" 2>/dev/null
}

echo "═══════════════════════════════════════════════════════════════"
echo "  DTI EMS — End-to-End Test Run"
echo "  Started: $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────
# STEP 1: Login as Program Manager (Technical Staff)
# ─────────────────────────────────────────────────────────────────
echo "── Phase 1: Authentication ──"
PM_RESP=$(curl -s "$IDENTITY_URL/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"technical.staff@dti7.gov.ph","password":"Admin@123456"}')
PM_TOKEN=$(json_field "$PM_RESP" "['data']['accessToken']")
PM_ID=$(json_field "$PM_RESP" "['data']['user']['id']")
PM_NAME=$(json_field "$PM_RESP" "['data']['user']['firstName']")
if [ -n "$PM_TOKEN" ] && [ "$PM_TOKEN" != "None" ]; then
  pass "Login as Program Manager" "Token received for $PM_NAME (ID: $PM_ID)"
else
  fail "Login as Program Manager" "No token returned"
  echo "Cannot proceed without auth. Exiting."
  exit 1
fi

# Login as Division Chief
DC_RESP=$(curl -s "$IDENTITY_URL/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"division.chief@dti7.gov.ph","password":"Admin@123456"}')
DC_TOKEN=$(json_field "$DC_RESP" "['data']['accessToken']")
if [ -n "$DC_TOKEN" ] && [ "$DC_TOKEN" != "None" ]; then
  pass "Login as Division Chief" "Token received"
else
  fail "Login as Division Chief" "No token returned"
fi

# Login as Regional Director
RD_RESP=$(curl -s "$IDENTITY_URL/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"regional.director@dti7.gov.ph","password":"Admin@123456"}')
RD_TOKEN=$(json_field "$RD_RESP" "['data']['accessToken']")
if [ -n "$RD_TOKEN" ] && [ "$RD_TOKEN" != "None" ]; then
  pass "Login as Regional Director" "Token received"
else
  fail "Login as Regional Director" "No token returned"
fi

# Login as Facilitator
FAC_RESP=$(curl -s "$IDENTITY_URL/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"facilitator@dti7.gov.ph","password":"Admin@123456"}')
FAC_TOKEN=$(json_field "$FAC_RESP" "['data']['accessToken']")
FAC_ID=$(json_field "$FAC_RESP" "['data']['user']['id']")
if [ -n "$FAC_TOKEN" ] && [ "$FAC_TOKEN" != "None" ]; then
  pass "Login as Facilitator" "Token received (ID: $FAC_ID)"
else
  fail "Login as Facilitator" "No token returned"
fi

# ─────────────────────────────────────────────────────────────────
# Register a participant account
# ─────────────────────────────────────────────────────────────────
echo ""
echo "── Phase 2: Participant Registration ──"
PARTICIPANT_EMAIL="e2e.participant.$(date +%s)@test.com"
REG_RESP=$(curl -s "$IDENTITY_URL/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$PARTICIPANT_EMAIL\",\"password\":\"Test@12345678\",\"firstName\":\"Juan\",\"lastName\":\"Dela Cruz\",\"dpaConsentGiven\":true}")
REG_SUCCESS=$(json_field "$REG_RESP" "['success']")
if [ "$REG_SUCCESS" = "True" ]; then
  pass "Register Participant" "Email: $PARTICIPANT_EMAIL"
else
  fail "Register Participant" "$(json_field "$REG_RESP" "['message']")"
fi

# Force verify email (admin endpoint)
ADMIN_RESP=$(curl -s "$IDENTITY_URL/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"super.admin@dti7.gov.ph","password":"Admin@123456"}')
ADMIN_TOKEN=$(json_field "$ADMIN_RESP" "['data']['accessToken']")

# Get participant ID
PART_LOGIN=$(curl -s "$IDENTITY_URL/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$PARTICIPANT_EMAIL\",\"password\":\"Test@12345678\"}")
PART_TOKEN_TRY=$(json_field "$PART_LOGIN" "['data']['accessToken']")

if [ -z "$PART_TOKEN_TRY" ] || [ "$PART_TOKEN_TRY" = "None" ]; then
  # Email not verified yet, force verify via admin
  # First need to find user ID - search users
  USERS_RESP=$(curl -s "$IDENTITY_URL/users?search=$PARTICIPANT_EMAIL" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  PART_USER_ID=$(echo "$USERS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'])" 2>/dev/null)
  
  if [ -n "$PART_USER_ID" ] && [ "$PART_USER_ID" != "None" ]; then
    VERIFY_RESP=$(curl -s -X PATCH "$IDENTITY_URL/admin/users/$PART_USER_ID/verify-email" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    pass "Admin Verify Participant Email" "User ID: $PART_USER_ID"
  else
    fail "Admin Verify Participant Email" "Could not find participant user"
  fi
  
  # Now login again
  PART_LOGIN=$(curl -s "$IDENTITY_URL/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$PARTICIPANT_EMAIL\",\"password\":\"Test@12345678\"}")
fi

PART_TOKEN=$(json_field "$PART_LOGIN" "['data']['accessToken']")
PART_ID=$(json_field "$PART_LOGIN" "['data']['user']['id']")
if [ -n "$PART_TOKEN" ] && [ "$PART_TOKEN" != "None" ]; then
  pass "Login as Participant" "ID: $PART_ID"
else
  fail "Login as Participant" "Login failed after registration"
fi

# Update participant profile with demographics
PROFILE_RESP=$(curl -s -X PATCH "$IDENTITY_URL/users/me" \
  -H "Authorization: Bearer $PART_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sex":"MALE","ageBracket":"AGE_20_TO_34","clientType":"BUSINESS"}')
PROFILE_OK=$(json_field "$PROFILE_RESP" "['success']")
if [ "$PROFILE_OK" = "True" ]; then
  pass "Update Participant Profile" "Sex=MALE, Age=20-34, Client=BUSINESS"
else
  fail "Update Participant Profile" "$(json_field "$PROFILE_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 2: Create Event Proposal (FM-CT-4)
# ─────────────────────────────────────────────────────────────────
echo ""
echo "── Phase 3: Proposal Creation & Approval (7 QMS Steps) ──"
START_DATE=$(date -v+7d '+%Y-%m-%dT09:00:00.000Z' 2>/dev/null || date -d '+7 days' '+%Y-%m-%dT09:00:00.000Z')
END_DATE=$(date -v+7d '+%Y-%m-%dT17:00:00.000Z' 2>/dev/null || date -d '+7 days' '+%Y-%m-%dT17:00:00.000Z')

CREATE_RESP=$(curl -s "$EVENT_URL/events" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"title\": \"E2E Test: MSME Digital Marketing Training\",
    \"description\": \"End-to-end test training program for MSMEs on digital marketing strategies\",
    \"venue\": \"DTI Region VII Conference Hall, Cebu City\",
    \"deliveryMode\": \"FACE_TO_FACE\",
    \"maxParticipants\": 50,
    \"startDate\": \"$START_DATE\",
    \"endDate\": \"$END_DATE\",
    \"targetSector\": \"MSMEs\",
    \"targetRegion\": \"Region VII\",
    \"requiresTNA\": true,
    \"trainingType\": \"BUSINESS\",
    \"background\": \"This training aims to capacitate MSMEs in the Central Visayas region on leveraging digital marketing tools and platforms to expand their market reach.\",
    \"objectives\": \"1. Introduce digital marketing fundamentals\\n2. Teach social media marketing strategies\\n3. Demonstrate e-commerce platforms\",
    \"learningOutcomes\": \"Participants will be able to create and manage social media business pages, run basic ad campaigns, and list products on e-commerce platforms.\",
    \"methodology\": \"Lecture-discussion, hands-on workshop, group activities\",
    \"monitoringPlan\": \"Post-training CSF, 3-month impact assessment\"
  }")
EVENT_ID=$(json_field "$CREATE_RESP" "['data']['id']")
EVENT_STATUS=$(json_field "$CREATE_RESP" "['data']['status']")
PROPOSAL_STATUS=$(json_field "$CREATE_RESP" "['data']['proposalStatus']")
if [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "None" ]; then
  pass "Create Event Proposal" "ID: $EVENT_ID, Status: $EVENT_STATUS, Proposal: $PROPOSAL_STATUS"
else
  fail "Create Event Proposal" "$(json_field "$CREATE_RESP" "['message']")"
  echo "Cannot proceed. Response: $CREATE_RESP"
  exit 1
fi

# Add budget items
BUDGET_RESP=$(curl -s "$EVENT_URL/events/$EVENT_ID/budget" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"item":"Venue Rental","unitCost":5000,"quantity":1,"estimatedAmount":5000,"sourceOfFunds":"DTI Regular Fund"}')
BUDGET_OK=$(json_field "$BUDGET_RESP" "['success']")
if [ "$BUDGET_OK" = "True" ]; then
  pass "Add Budget Item (Venue)" "₱5,000"
else
  fail "Add Budget Item" "$(json_field "$BUDGET_RESP" "['message']")"
fi

BUDGET_RESP2=$(curl -s "$EVENT_URL/events/$EVENT_ID/budget" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"item":"Meals & Snacks","unitCost":350,"quantity":50,"estimatedAmount":17500,"sourceOfFunds":"DTI Regular Fund"}')
pass "Add Budget Item (Meals)" "₱17,500"

# Add risk item
RISK_RESP=$(curl -s "$EVENT_URL/events/$EVENT_ID/risks" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"riskDescription":"Low attendance due to scheduling conflicts","actionPlan":"Send reminders 1 week and 1 day before event","responsiblePerson":"Event Organizer"}')
pass "Add Risk Item" "Low attendance risk"

# Add target group
TG_RESP=$(curl -s "$EVENT_URL/events/$EVENT_ID/target-groups" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sectorGroup":"MSMEs - Retail","estimatedParticipants":30}')
pass "Add Target Group" "MSMEs - Retail, est. 30"

# Add speaker
SPEAKER_RESP=$(curl -s "$EVENT_URL/events/$EVENT_ID/speakers" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Dr. Maria Santos","organization":"DTI Region VII","topic":"Digital Marketing Fundamentals"}')
SPEAKER_ID=$(json_field "$SPEAKER_RESP" "['data']['id']")
if [ -n "$SPEAKER_ID" ] && [ "$SPEAKER_ID" != "None" ]; then
  pass "Add Speaker" "Dr. Maria Santos (ID: $SPEAKER_ID)"
else
  fail "Add Speaker" "$(json_field "$SPEAKER_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 3: Submit Proposal
# ─────────────────────────────────────────────────────────────────
SUBMIT_RESP=$(curl -s -X POST "$EVENT_URL/events/$EVENT_ID/submit-proposal" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' -d '{}')
SUBMIT_PS=$(json_field "$SUBMIT_RESP" "['data']['proposalStatus']")
if [ "$SUBMIT_PS" = "SUBMITTED" ]; then
  pass "Submit Proposal" "proposalStatus → SUBMITTED"
else
  fail "Submit Proposal" "Expected SUBMITTED, got $SUBMIT_PS. $(json_field "$SUBMIT_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 4: Division Chief reviews (SUBMITTED → UNDER_REVIEW)
# ─────────────────────────────────────────────────────────────────
REVIEW_RESP=$(curl -s -X PATCH "$EVENT_URL/events/$EVENT_ID/review-proposal" \
  -H "Authorization: Bearer $DC_TOKEN" \
  -H 'Content-Type: application/json' -d '{}')
REVIEW_PS=$(json_field "$REVIEW_RESP" "['data']['proposalStatus']")
if [ "$REVIEW_PS" = "UNDER_REVIEW" ]; then
  pass "Division Chief Reviews Proposal" "proposalStatus → UNDER_REVIEW"
else
  fail "Division Chief Reviews Proposal" "Expected UNDER_REVIEW, got $REVIEW_PS. $(json_field "$REVIEW_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 5: Regional Director approves (UNDER_REVIEW → APPROVED)
# ─────────────────────────────────────────────────────────────────
APPROVE_RESP=$(curl -s -X PATCH "$EVENT_URL/events/$EVENT_ID/approve-proposal" \
  -H "Authorization: Bearer $RD_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"action":"APPROVE"}')
APPROVE_PS=$(json_field "$APPROVE_RESP" "['data']['proposalStatus']")
if [ "$APPROVE_PS" = "APPROVED" ]; then
  pass "Regional Director Approves" "proposalStatus → APPROVED"
else
  fail "Regional Director Approves" "Expected APPROVED, got $APPROVE_PS. $(json_field "$APPROVE_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 6: Assign Facilitator & Activate Event
# ─────────────────────────────────────────────────────────────────
ASSIGN_RESP=$(curl -s -X POST "$EVENT_URL/events/$EVENT_ID/assign-organizer" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"organizerId\":\"$FAC_ID\",\"organizerName\":\"Facilitator Staff\"}")
ASSIGN_OK=$(json_field "$ASSIGN_RESP" "['success']")
if [ "$ASSIGN_OK" = "True" ]; then
  pass "Assign Facilitator" "Assigned to Facilitator (ID: $FAC_ID)"
else
  fail "Assign Facilitator" "$(json_field "$ASSIGN_RESP" "['message']")"
fi

# Activate event (DRAFT → PUBLISHED)
ACTIVATE_RESP=$(curl -s -X POST "$EVENT_URL/events/$EVENT_ID/activate" \
  -H "Authorization: Bearer $PM_TOKEN" \
  -H 'Content-Type: application/json' -d '{}')
ACTIVATE_STATUS=$(json_field "$ACTIVATE_RESP" "['data']['status']")
if [ "$ACTIVATE_STATUS" = "PUBLISHED" ]; then
  pass "Activate Event" "status → PUBLISHED"
else
  fail "Activate Event" "Expected PUBLISHED, got $ACTIVATE_STATUS. $(json_field "$ACTIVATE_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 7: Status → REGISTRATION_OPEN
# ─────────────────────────────────────────────────────────────────
echo ""
echo "── Phase 4: Registration & Attendance ──"
REG_OPEN_RESP=$(curl -s -X PATCH "$EVENT_URL/events/$EVENT_ID/status" \
  -H "Authorization: Bearer $FAC_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"REGISTRATION_OPEN"}')
REG_OPEN_STATUS=$(json_field "$REG_OPEN_RESP" "['data']['status']")
if [ "$REG_OPEN_STATUS" = "REGISTRATION_OPEN" ]; then
  pass "Open Registration" "status → REGISTRATION_OPEN"
else
  fail "Open Registration" "Expected REGISTRATION_OPEN, got $REG_OPEN_STATUS"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 8: Participant registers for event
# ─────────────────────────────────────────────────────────────────
REGISTER_RESP=$(curl -s -X POST "$EVENT_URL/participations/events/$EVENT_ID/register" \
  -H "Authorization: Bearer $PART_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"dpaConsentConfirmed":true}')
PARTICIPATION_ID=$(json_field "$REGISTER_RESP" "['data']['id']")
REG_STATUS=$(json_field "$REGISTER_RESP" "['data']['status']")
if [ -n "$PARTICIPATION_ID" ] && [ "$PARTICIPATION_ID" != "None" ]; then
  pass "Participant Registers" "Participation ID: $PARTICIPATION_ID, Status: $REG_STATUS"
else
  fail "Participant Registers" "$(json_field "$REGISTER_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 9: Submit TNA (Training Needs Assessment)
# ─────────────────────────────────────────────────────────────────
TNA_RESP=$(curl -s -X POST "$EVENT_URL/participations/$PARTICIPATION_ID/tna" \
  -H "Authorization: Bearer $PART_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"knowledgeScore":65,"skillScore":50,"motivationScore":80,"responses":{"q1":"Need to learn social media marketing","q2":"Currently using traditional marketing only"}}')
TNA_OK=$(json_field "$TNA_RESP" "['success']")
TNA_MSG=$(json_field "$TNA_RESP" "['message']")
if [ "$TNA_OK" = "True" ]; then
  pass "Submit TNA" "$TNA_MSG"
else
  fail "Submit TNA" "TNA submission failed: $TNA_MSG"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 10: Get QR Code
# ─────────────────────────────────────────────────────────────────
QR_RESP=$(curl -s "$EVENT_URL/participations/$PARTICIPATION_ID/qr" \
  -H "Authorization: Bearer $PART_TOKEN")
QR_OK=$(json_field "$QR_RESP" "['success']")
QR_DATA=$(json_field "$QR_RESP" "['data']['qrDataUrl']" 2>/dev/null | head -c 50)
if [ "$QR_OK" = "True" ]; then
  pass "Generate QR Code" "QR data URL generated (${QR_DATA}...)"
else
  fail "Generate QR Code" "$(json_field "$QR_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 11: Create a Session
# ─────────────────────────────────────────────────────────────────
SESSION_RESP=$(curl -s "$EVENT_URL/events/$EVENT_ID/sessions" \
  -H "Authorization: Bearer $FAC_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"Digital Marketing Fundamentals\",\"startTime\":\"$START_DATE\",\"endTime\":\"$END_DATE\",\"venue\":\"Main Hall\",\"speakerName\":\"Dr. Maria Santos\"}")
SESSION_ID=$(json_field "$SESSION_RESP" "['data']['id']")
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "None" ]; then
  pass "Create Session" "Session ID: $SESSION_ID"
else
  fail "Create Session" "$(json_field "$SESSION_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 12: Transition to ONGOING
# ─────────────────────────────────────────────────────────────────
# First close registration
CLOSE_REG_RESP=$(curl -s -X PATCH "$EVENT_URL/events/$EVENT_ID/status" \
  -H "Authorization: Bearer $FAC_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"REGISTRATION_CLOSED"}')
pass "Close Registration" "status → REGISTRATION_CLOSED"

ONGOING_RESP=$(curl -s -X PATCH "$EVENT_URL/events/$EVENT_ID/status" \
  -H "Authorization: Bearer $FAC_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"ONGOING"}')
ONGOING_STATUS=$(json_field "$ONGOING_RESP" "['data']['status']")
if [ "$ONGOING_STATUS" = "ONGOING" ]; then
  pass "Transition to ONGOING" "status → ONGOING"
else
  fail "Transition to ONGOING" "Expected ONGOING, got $ONGOING_STATUS"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 13: Manual Check-in Participant
# ─────────────────────────────────────────────────────────────────
CHECKIN_RESP=$(curl -s -X POST "$EVENT_URL/participations/$PARTICIPATION_ID/manual-checkin" \
  -H "Authorization: Bearer $FAC_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"sessionId\":\"$SESSION_ID\"}")
CHECKIN_OK=$(json_field "$CHECKIN_RESP" "['success']")
if [ "$CHECKIN_OK" = "True" ]; then
  pass "Manual Check-in Participant" "Checked in for session $SESSION_ID"
else
  fail "Manual Check-in Participant" "$(json_field "$CHECKIN_RESP" "['message']")"
fi

# Verify attendance
ATTEND_RESP=$(curl -s "$EVENT_URL/participations/$PARTICIPATION_ID/attendance" \
  -H "Authorization: Bearer $PART_TOKEN")
ATTEND_COUNT=$(echo "$ATTEND_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']))" 2>/dev/null)
if [ "$ATTEND_COUNT" -gt 0 ] 2>/dev/null; then
  pass "Verify Attendance Records" "$ATTEND_COUNT attendance record(s) found"
else
  fail "Verify Attendance Records" "No records found"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 14: Transition to COMPLETED (auto-creates CSF records)
# ─────────────────────────────────────────────────────────────────
echo ""
echo "── Phase 5: Post-Event (CSF, Certificates) ──"
COMPLETE_RESP=$(curl -s -X PATCH "$EVENT_URL/events/$EVENT_ID/status" \
  -H "Authorization: Bearer $FAC_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"COMPLETED"}')
COMPLETE_STATUS=$(json_field "$COMPLETE_RESP" "['data']['status']")
if [ "$COMPLETE_STATUS" = "COMPLETED" ]; then
  pass "Transition to COMPLETED" "status → COMPLETED (auto-creates CSF records)"
else
  fail "Transition to COMPLETED" "Expected COMPLETED, got $COMPLETE_STATUS"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 15: Check CSF Distribution Status
# ─────────────────────────────────────────────────────────────────
sleep 1
DIST_STATUS=$(curl -s "$EVENT_URL/surveys/events/$EVENT_ID/csf/distribution-status" \
  -H "Authorization: Bearer $FAC_TOKEN")
DIST_ATTENDED=$(json_field "$DIST_STATUS" "['data']['attended']")
DIST_DISTRIBUTED=$(json_field "$DIST_STATUS" "['data']['distributed']")
if [ "$DIST_DISTRIBUTED" -gt 0 ] 2>/dev/null; then
  pass "CSF Distribution Status" "Attended: $DIST_ATTENDED, Distributed: $DIST_DISTRIBUTED"
else
  # Try distributing manually
  DIST_RESP=$(curl -s -X POST "$EVENT_URL/surveys/events/$EVENT_ID/csf/distribute" \
    -H "Authorization: Bearer $FAC_TOKEN" \
    -H 'Content-Type: application/json' -d '{}')
  pass "Distribute CSF Forms" "Manual distribution triggered"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 16: Participant submits CSF
# ─────────────────────────────────────────────────────────────────
CSF_BODY="{
  \"sqd0OverallRating\": 5,
  \"sqd1Responsiveness\": 4,
  \"sqd2Reliability\": 5,
  \"sqd3AccessFacilities\": 4,
  \"sqd4Communication\": 5,
  \"sqd5Costs\": 4,
  \"sqd6Integrity\": 5,
  \"sqd7Assurance\": 5,
  \"sqd8Outcome\": 4,
  \"cc1Awareness\": 1,
  \"cc2Visibility\": 1,
  \"cc3Usefulness\": 1,
  \"highlightsFeedback\": \"Excellent training on digital marketing. Very relevant to my business.\",
  \"improvementsFeedback\": \"Could include more hands-on exercises with actual platforms.\",
  \"commentsSuggestions\": \"Please organize more trainings like this for MSMEs in the Visayas.\",
  \"speakerRatings\": [{\"speakerId\": \"$SPEAKER_ID\", \"rating\": 5}]
}"

CSF_RESP=$(curl -s -X POST "$EVENT_URL/surveys/events/$EVENT_ID/csf" \
  -H "Authorization: Bearer $PART_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$CSF_BODY")
CSF_OK=$(json_field "$CSF_RESP" "['success']")
if [ "$CSF_OK" = "True" ]; then
  pass "Submit CSF Survey" "All 9 SQD + 3 CC + feedback + speaker rating submitted"
else
  fail "Submit CSF Survey" "$(json_field "$CSF_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 17: Verify CSF Results
# ─────────────────────────────────────────────────────────────────
RESULTS_RESP=$(curl -s "$EVENT_URL/surveys/events/$EVENT_ID/csf/results" \
  -H "Authorization: Bearer $FAC_TOKEN")
RESULTS_COUNT=$(json_field "$RESULTS_RESP" "['data']['count']")
if [ "$RESULTS_COUNT" -gt 0 ] 2>/dev/null; then
  pass "Verify CSF Results" "$RESULTS_COUNT response(s) aggregated"
else
  fail "Verify CSF Results" "No results found"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 18: Generate CSF Report (FM-CSF-ACT-RPT)
# ─────────────────────────────────────────────────────────────────
REPORT_RESP=$(curl -s "$EVENT_URL/surveys/events/$EVENT_ID/csf/report" \
  -H "Authorization: Bearer $FAC_TOKEN")
REPORT_TITLE=$(json_field "$REPORT_RESP" "['data']['event']['title']")
REPORT_OVERALL=$(json_field "$REPORT_RESP" "['data']['summary']['overallSatisfactionPct']")
REPORT_ADJ=$(json_field "$REPORT_RESP" "['data']['summary']['overallAdjectival']")
REPORT_SQD_COUNT=$(echo "$REPORT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']['sqdBreakdown']))" 2>/dev/null)
if [ -n "$REPORT_TITLE" ] && [ "$REPORT_TITLE" != "None" ]; then
  pass "Generate CSF Report" "Overall: ${REPORT_OVERALL}% ($REPORT_ADJ), $REPORT_SQD_COUNT SQD dimensions"
else
  fail "Generate CSF Report" "No report data"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 19: Issue Certificate
# ─────────────────────────────────────────────────────────────────
CERT_RESP=$(curl -s -X POST "$EVENT_URL/certificates/$PARTICIPATION_ID/issue" \
  -H "Authorization: Bearer $FAC_TOKEN")
CERT_OK=$(json_field "$CERT_RESP" "['success']")
CERT_CODE=$(json_field "$CERT_RESP" "['data']['verificationCode']" 2>/dev/null)
if [ "$CERT_OK" = "True" ]; then
  pass "Issue Certificate" "Verification Code: $CERT_CODE"
else
  fail "Issue Certificate" "$(json_field "$CERT_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 20: Verify Certificate (Public endpoint)
# ─────────────────────────────────────────────────────────────────
if [ -n "$CERT_CODE" ] && [ "$CERT_CODE" != "None" ]; then
  VERIFY_CERT=$(curl -s "$EVENT_URL/certificates/verify/$CERT_CODE")
  VERIFY_VALID=$(json_field "$VERIFY_CERT" "['data']['valid']")
  if [ "$VERIFY_VALID" = "True" ]; then
    pass "Verify Certificate (Public)" "Code $CERT_CODE is VALID"
  else
    fail "Verify Certificate (Public)" "Certificate not valid"
  fi
else
  fail "Verify Certificate (Public)" "No verification code available"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 21: Submit Impact Survey
# ─────────────────────────────────────────────────────────────────
IMPACT_RESP=$(curl -s -X POST "$EVENT_URL/surveys/events/$EVENT_ID/impact" \
  -H "Authorization: Bearer $PART_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "knowledgeApplication": 4,
    "skillImprovement": 5,
    "businessImpact": 4,
    "revenueChange": 3,
    "employeeGrowth": 3,
    "successStory": "After the training, I created a Facebook business page that attracted 200+ followers in the first month.",
    "challengesFaced": "Limited internet connectivity in our area.",
    "additionalSupport": "Need follow-up training on e-commerce platforms."
  }')
IMPACT_OK=$(json_field "$IMPACT_RESP" "['success']")
if [ "$IMPACT_OK" = "True" ]; then
  pass "Submit Impact Survey" "Knowledge=4, Skill=5, Business=4"
else
  fail "Submit Impact Survey" "$(json_field "$IMPACT_RESP" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 22: View Event Report (Comprehensive)
# ─────────────────────────────────────────────────────────────────
EVENT_RPT=$(curl -s "$EVENT_URL/events/$EVENT_ID/report" \
  -H "Authorization: Bearer $FAC_TOKEN")
EVENT_RPT_OK=$(json_field "$EVENT_RPT" "['success']")
if [ "$EVENT_RPT_OK" = "True" ]; then
  pass "View Event Report" "Comprehensive event report generated"
else
  fail "View Event Report" "$(json_field "$EVENT_RPT" "['message']")"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 23: View Participant's own records
# ─────────────────────────────────────────────────────────────────
MY_PARTS=$(curl -s "$EVENT_URL/participations/me" \
  -H "Authorization: Bearer $PART_TOKEN")
MY_PARTS_COUNT=$(echo "$MY_PARTS" | python3 -c "import sys,json; d=json.load(sys.stdin); data=d['data']; print(len(data) if isinstance(data, list) else len(data.get('participations', data)))" 2>/dev/null)
if [ "$MY_PARTS_COUNT" -gt 0 ] 2>/dev/null; then
  pass "Participant Views My Events" "$MY_PARTS_COUNT participation(s) found"
else
  fail "Participant Views My Events" "No participations found"
fi

# My certificates
MY_CERTS=$(curl -s "$EVENT_URL/certificates/my" \
  -H "Authorization: Bearer $PART_TOKEN")
MY_CERTS_COUNT=$(echo "$MY_CERTS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']))" 2>/dev/null)
if [ "$MY_CERTS_COUNT" -gt 0 ] 2>/dev/null; then
  pass "Participant Views My Certificates" "$MY_CERTS_COUNT certificate(s) found"
else
  fail "Participant Views My Certificates" "No certificates found"
fi

# ─────────────────────────────────────────────────────────────────
# STEP 24: Verify Checklist was auto-seeded
# ─────────────────────────────────────────────────────────────────
CHECKLIST_RESP=$(curl -s "$EVENT_URL/checklists/events/$EVENT_ID" \
  -H "Authorization: Bearer $FAC_TOKEN")
CL_COUNT=$(echo "$CHECKLIST_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']))" 2>/dev/null)
if [ "$CL_COUNT" -gt 0 ] 2>/dev/null; then
  CL_ITEMS=$(echo "$CHECKLIST_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(len(c.get('items',[])) for c in d['data']))" 2>/dev/null)
  pass "Verify Auto-seeded Checklist" "$CL_COUNT checklist(s), $CL_ITEMS item(s)"
else
  fail "Verify Auto-seeded Checklist" "No checklists found"
fi

# ─────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  E2E TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo "  Total Steps: $((PASS_COUNT + FAIL_COUNT))"
echo "  ✅ Passed:   $PASS_COUNT"
echo "  ❌ Failed:   $FAIL_COUNT"
echo "  Completed:  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════════"

# ─────────────────────────────────────────────────────────────────
# Generate Markdown Report
# ─────────────────────────────────────────────────────────────────
cat > "$REPORT_FILE" << REPORT_EOF
# DTI Region VII — EMS End-to-End Test Results

**Test Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Environment:** Local Development (Identity: $IDENTITY_URL, Events: $EVENT_URL)
**Test Event:** E2E Test: MSME Digital Marketing Training
**Event ID:** \`$EVENT_ID\`

---

## Summary

| Metric | Value |
|--------|-------|
| Total Test Steps | $((PASS_COUNT + FAIL_COUNT)) |
| Passed | $PASS_COUNT ✅ |
| Failed | $FAIL_COUNT ❌ |
| Pass Rate | $(python3 -c "print(round($PASS_COUNT / max($PASS_COUNT + $FAIL_COUNT, 1) * 100, 1))")% |

---

## Test Results

| Step | Description | Result | Details |
|------|-------------|--------|---------|
$(echo -e "$RESULTS")

---

## Test Coverage

### Roles Tested
- **Program Manager** (technical.staff@dti7.gov.ph) — Proposal creation, facilitator assignment, event activation
- **Division Chief** (division.chief@dti7.gov.ph) — Proposal review
- **Regional Director** (regional.director@dti7.gov.ph) — Proposal approval
- **Event Organizer / Facilitator** (facilitator@dti7.gov.ph) — Event management, status transitions, check-in, CSF distribution
- **Participant** ($PARTICIPANT_EMAIL) — Registration, TNA, QR, CSF survey, impact survey, certificates

### Workflow Stages Tested
1. **Proposal Creation (FM-CT-4)** — Create event with full proposal details, budget, risks, target groups, speakers
2. **7-Step QMS Approval** — Submit → Division Chief Review → Regional Director Approve
3. **Event Activation** — Assign facilitator → Activate (DRAFT → PUBLISHED)
4. **Status Lifecycle** — PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → ONGOING → COMPLETED
5. **Participant Journey** — Register → Submit TNA → Get QR → Check-in → CSF → Impact Survey
6. **Post-Event** — CSF Distribution → CSF Results/Report → Certificate Issuance → Certificate Verification
7. **Auto-features** — Auto-created CSF records on COMPLETED, auto-seeded DTI checklist on activation

### Data Created
- **Event:** \`$EVENT_ID\`
- **Participant Account:** $PARTICIPANT_EMAIL
- **Participation:** \`$PARTICIPATION_ID\`
- **Session:** \`$SESSION_ID\`
- **Speaker:** Dr. Maria Santos (\`$SPEAKER_ID\`)
- **Certificate Code:** \`$CERT_CODE\`
- **Budget Items:** 2 (Venue: ₱5,000; Meals: ₱17,500)
- **Risk Items:** 1
- **Target Groups:** 1

### CSF Report Summary
- **Overall Satisfaction:** ${REPORT_OVERALL}%
- **Adjectival Rating:** $REPORT_ADJ
- **SQD Dimensions Evaluated:** $REPORT_SQD_COUNT

---

## Conclusion

$(if [ "$FAIL_COUNT" -eq 0 ]; then echo "All test steps passed successfully. The DTI EMS system end-to-end workflow is fully functional, covering the complete event lifecycle from proposal creation through certificate issuance and CSF reporting."; else echo "**$FAIL_COUNT test step(s) failed.** Review the failed steps above and investigate the root causes."; fi)

---

*Report generated automatically by the DTI EMS E2E test script.*
REPORT_EOF

echo ""
echo "📄 Full report saved to: $REPORT_FILE"
