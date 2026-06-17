--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8 (Debian 15.8-1.pgdg110+1)
-- Dumped by pg_dump version 15.8 (Debian 15.8-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: event_schema; Type: SCHEMA; Schema: -; Owner: dti_ems
--

CREATE SCHEMA event_schema;


ALTER SCHEMA event_schema OWNER TO dti_ems;

--
-- Name: AttendanceMethod; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."AttendanceMethod" AS ENUM (
    'QR_SCAN',
    'MANUAL'
);


ALTER TYPE event_schema."AttendanceMethod" OWNER TO dti_ems;

--
-- Name: CertificateStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."CertificateStatus" AS ENUM (
    'PENDING',
    'GENERATED',
    'ISSUED',
    'REVOKED'
);


ALTER TYPE event_schema."CertificateStatus" OWNER TO dti_ems;

--
-- Name: ChecklistItemPriority; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."ChecklistItemPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE event_schema."ChecklistItemPriority" OWNER TO dti_ems;

--
-- Name: ChecklistItemStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."ChecklistItemStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'BLOCKED',
    'CANCELLED'
);


ALTER TYPE event_schema."ChecklistItemStatus" OWNER TO dti_ems;

--
-- Name: CsfSurveyStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."CsfSurveyStatus" AS ENUM (
    'PENDING',
    'SUBMITTED',
    'EXPIRED'
);


ALTER TYPE event_schema."CsfSurveyStatus" OWNER TO dti_ems;

--
-- Name: DeliveryMode; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."DeliveryMode" AS ENUM (
    'FACE_TO_FACE',
    'ONLINE',
    'HYBRID'
);


ALTER TYPE event_schema."DeliveryMode" OWNER TO dti_ems;

--
-- Name: EventPhase; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."EventPhase" AS ENUM (
    'PLANNING',
    'PREPARATION',
    'EXECUTION',
    'POST_EVENT'
);


ALTER TYPE event_schema."EventPhase" OWNER TO dti_ems;

--
-- Name: EventStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."EventStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'REGISTRATION_OPEN',
    'REGISTRATION_CLOSED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE event_schema."EventStatus" OWNER TO dti_ems;

--
-- Name: EventType; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."EventType" AS ENUM (
    'TRAINING',
    'EVENT'
);


ALTER TYPE event_schema."EventType" OWNER TO dti_ems;

--
-- Name: ImpactSurveyStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."ImpactSurveyStatus" AS ENUM (
    'SCHEDULED',
    'PENDING',
    'SUBMITTED',
    'EXPIRED'
);


ALTER TYPE event_schema."ImpactSurveyStatus" OWNER TO dti_ems;

--
-- Name: ParticipantStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."ParticipantStatus" AS ENUM (
    'REGISTERED',
    'TNA_PENDING',
    'RSVP_CONFIRMED',
    'ATTENDED',
    'COMPLETED',
    'NO_SHOW',
    'WAITLISTED',
    'CANCELLED'
);


ALTER TYPE event_schema."ParticipantStatus" OWNER TO dti_ems;

--
-- Name: PreProposalTnaStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."PreProposalTnaStatus" AS ENUM (
    'DRAFT',
    'FINALIZED'
);


ALTER TYPE event_schema."PreProposalTnaStatus" OWNER TO dti_ems;

--
-- Name: ProposalStatus; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."ProposalStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE event_schema."ProposalStatus" OWNER TO dti_ems;

--
-- Name: StaffRole; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."StaffRole" AS ENUM (
    'FACILITATOR',
    'CO_FACILITATOR',
    'RESOURCE_PERSON',
    'REGISTRATION_OFFICER',
    'LOGISTICS',
    'DOCUMENTATION',
    'SECRETARIAT',
    'IT_SUPPORT',
    'FINANCE',
    'OTHER'
);


ALTER TYPE event_schema."StaffRole" OWNER TO dti_ems;

--
-- Name: TnaRespondentType; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."TnaRespondentType" AS ENUM (
    'INDIVIDUAL',
    'BUSINESS_OWNER',
    'ORGANIZATION',
    'GOVERNMENT'
);


ALTER TYPE event_schema."TnaRespondentType" OWNER TO dti_ems;

--
-- Name: TrainingType; Type: TYPE; Schema: event_schema; Owner: dti_ems
--

CREATE TYPE event_schema."TrainingType" AS ENUM (
    'BUSINESS',
    'MANAGERIAL',
    'ORGANIZATIONAL',
    'ENTREPRENEURIAL',
    'INTER_AGENCY'
);


ALTER TYPE event_schema."TrainingType" OWNER TO dti_ems;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance_records; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.attendance_records (
    id text NOT NULL,
    participation_id text NOT NULL,
    session_id text NOT NULL,
    user_id text NOT NULL,
    method event_schema."AttendanceMethod" DEFAULT 'QR_SCAN'::event_schema."AttendanceMethod" NOT NULL,
    scanned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    scanned_by_user_id text
);


ALTER TABLE event_schema.attendance_records OWNER TO dti_ems;

--
-- Name: certificates; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.certificates (
    id text NOT NULL,
    participation_id text NOT NULL,
    user_id text NOT NULL,
    event_id text NOT NULL,
    status event_schema."CertificateStatus" DEFAULT 'PENDING'::event_schema."CertificateStatus" NOT NULL,
    storage_url text,
    verification_code text NOT NULL,
    generated_at timestamp(3) without time zone,
    issued_at timestamp(3) without time zone
);


ALTER TABLE event_schema.certificates OWNER TO dti_ems;

--
-- Name: checklist_comments; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.checklist_comments (
    id text NOT NULL,
    item_id text NOT NULL,
    author_id text NOT NULL,
    author_name text NOT NULL,
    content text NOT NULL,
    attachment_url text,
    link_url text,
    link_label text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.checklist_comments OWNER TO dti_ems;

--
-- Name: checklist_items; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.checklist_items (
    id text NOT NULL,
    checklist_id text NOT NULL,
    title text NOT NULL,
    description text,
    phase event_schema."EventPhase" DEFAULT 'PLANNING'::event_schema."EventPhase" NOT NULL,
    status event_schema."ChecklistItemStatus" DEFAULT 'NOT_STARTED'::event_schema."ChecklistItemStatus" NOT NULL,
    priority event_schema."ChecklistItemPriority" DEFAULT 'MEDIUM'::event_schema."ChecklistItemPriority" NOT NULL,
    due_date timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    completed_by text,
    is_applicable boolean,
    order_index integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    assignees jsonb DEFAULT '[]'::jsonb NOT NULL,
    parent_item_id text,
    wbs_code text
);


ALTER TABLE event_schema.checklist_items OWNER TO dti_ems;

--
-- Name: csf_speaker_ratings; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.csf_speaker_ratings (
    id text NOT NULL,
    csf_response_id text NOT NULL,
    speaker_id text NOT NULL,
    rating integer NOT NULL
);


ALTER TABLE event_schema.csf_speaker_ratings OWNER TO dti_ems;

--
-- Name: csf_survey_responses; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.csf_survey_responses (
    id text NOT NULL,
    participation_id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    status event_schema."CsfSurveyStatus" DEFAULT 'PENDING'::event_schema."CsfSurveyStatus" NOT NULL,
    sqd0_overall_rating integer,
    sqd1_responsiveness integer,
    sqd2_reliability integer,
    sqd3_access_facilities integer,
    sqd4_communication integer,
    sqd5_costs integer,
    sqd6_integrity integer,
    sqd7_assurance integer,
    sqd8_outcome integer,
    cc1_awareness integer,
    cc2_visibility integer,
    cc3_usefulness integer,
    highlights_feedback text,
    improvements_feedback text,
    comments_suggestions text,
    reasons_for_low_rating text,
    submitted_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.csf_survey_responses OWNER TO dti_ems;

--
-- Name: event_checklists; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.event_checklists (
    id text NOT NULL,
    event_id text NOT NULL,
    title text NOT NULL,
    description text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE event_schema.event_checklists OWNER TO dti_ems;

--
-- Name: event_materials; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.event_materials (
    id text NOT NULL,
    event_id text NOT NULL,
    title text NOT NULL,
    description text,
    drive_url text NOT NULL,
    uploaded_by text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    is_expired boolean DEFAULT false NOT NULL,
    expired_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.event_materials OWNER TO dti_ems;

--
-- Name: event_participations; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.event_participations (
    id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    enterprise_id text,
    enterprise_name text,
    status event_schema."ParticipantStatus" DEFAULT 'REGISTERED'::event_schema."ParticipantStatus" NOT NULL,
    participant_name text,
    participant_email text,
    registered_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rsvp_confirmed_at timestamp(3) without time zone,
    tna_completed_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    notes text
);


ALTER TABLE event_schema.event_participations OWNER TO dti_ems;

--
-- Name: event_sessions; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.event_sessions (
    id text NOT NULL,
    event_id text NOT NULL,
    title text NOT NULL,
    start_time timestamp(3) without time zone NOT NULL,
    end_time timestamp(3) without time zone NOT NULL,
    venue text,
    speaker_name text,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.event_sessions OWNER TO dti_ems;

--
-- Name: event_staff; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.event_staff (
    id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    user_name text NOT NULL,
    user_email text,
    role event_schema."StaffRole" DEFAULT 'FACILITATOR'::event_schema."StaffRole" NOT NULL,
    notes text,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assigned_by text NOT NULL
);


ALTER TABLE event_schema.event_staff OWNER TO dti_ems;

--
-- Name: events; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.events (
    id text NOT NULL,
    program_id text,
    title text NOT NULL,
    description text,
    venue text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    delivery_mode event_schema."DeliveryMode" DEFAULT 'FACE_TO_FACE'::event_schema."DeliveryMode" NOT NULL,
    online_link text,
    status event_schema."EventStatus" DEFAULT 'DRAFT'::event_schema."EventStatus" NOT NULL,
    max_participants integer,
    registration_deadline timestamp(3) without time zone,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    target_sector text,
    target_region text,
    requires_tna boolean DEFAULT true NOT NULL,
    organizer_id text NOT NULL,
    program_manager_id text,
    cover_image_url text,
    training_type event_schema."TrainingType",
    partner_institution text,
    background text,
    objectives text,
    learning_outcomes text,
    methodology text,
    monitoring_plan text,
    proposal_status event_schema."ProposalStatus" DEFAULT 'DRAFT'::event_schema."ProposalStatus" NOT NULL,
    proposal_submitted_at timestamp(3) without time zone,
    proposal_reviewed_by_id text,
    proposal_approved_by_id text,
    proposal_reviewed_at timestamp(3) without time zone,
    proposal_approved_at timestamp(3) without time zone,
    proposal_rejection_note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    assigned_organizer_id text,
    assigned_organizer_name text,
    approved_proposal_url text,
    event_type event_schema."EventType" DEFAULT 'TRAINING'::event_schema."EventType" NOT NULL,
    expected_outputs text
);


ALTER TABLE event_schema.events OWNER TO dti_ems;

--
-- Name: impact_survey_responses; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.impact_survey_responses (
    id text NOT NULL,
    participation_id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    status event_schema."ImpactSurveyStatus" DEFAULT 'SCHEDULED'::event_schema."ImpactSurveyStatus" NOT NULL,
    scheduled_at timestamp(3) without time zone NOT NULL,
    dispatched_at timestamp(3) without time zone,
    knowledge_application integer,
    skill_improvement integer,
    business_impact integer,
    revenue_change integer,
    employee_growth integer,
    success_story text,
    challenges_faced text,
    additional_support text,
    revenue_change_pct numeric(5,2),
    employee_count_before integer,
    employee_count_after integer,
    submitted_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.impact_survey_responses OWNER TO dti_ems;

--
-- Name: par_beneficiary_groups; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.par_beneficiary_groups (
    id text NOT NULL,
    report_id text NOT NULL,
    sector_group text NOT NULL,
    male_count integer DEFAULT 0 NOT NULL,
    female_count integer DEFAULT 0 NOT NULL,
    senior_citizen_count integer DEFAULT 0 NOT NULL,
    pwd_count integer DEFAULT 0 NOT NULL,
    edt_level text,
    actual_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE event_schema.par_beneficiary_groups OWNER TO dti_ems;

--
-- Name: post_activity_reports; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.post_activity_reports (
    id text NOT NULL,
    event_id text NOT NULL,
    title text NOT NULL,
    date_conducted text NOT NULL,
    venue text NOT NULL,
    highlights_outcomes text,
    fund_utilization_notes text,
    csf_assessment_observations text,
    improvement_opportunities text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    prepared_by_id text,
    reviewed_by_id text,
    approved_by_id text,
    date_prepared timestamp(3) without time zone,
    date_reviewed timestamp(3) without time zone,
    date_approved timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE event_schema.post_activity_reports OWNER TO dti_ems;

--
-- Name: pre_proposal_tnas; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.pre_proposal_tnas (
    id text NOT NULL,
    title text NOT NULL,
    sector text NOT NULL,
    target_region text,
    description text,
    status event_schema."PreProposalTnaStatus" DEFAULT 'DRAFT'::event_schema."PreProposalTnaStatus" NOT NULL,
    conducted_by text NOT NULL,
    conducted_by_name text,
    conducted_at timestamp(3) without time zone,
    summary text,
    recommended_topics text,
    linked_event_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    score_business_relevance integer,
    score_demand_msmes integer,
    score_performance_gap integer,
    score_skill_deficiency integer,
    score_urgency integer,
    screen_q1 boolean DEFAULT false NOT NULL,
    screen_q2 boolean DEFAULT false NOT NULL,
    screen_q3 boolean DEFAULT false NOT NULL,
    screen_q4 boolean DEFAULT false NOT NULL,
    screen_q5 boolean DEFAULT false NOT NULL
);


ALTER TABLE event_schema.pre_proposal_tnas OWNER TO dti_ems;

--
-- Name: programs; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.programs (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    sector text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE event_schema.programs OWNER TO dti_ems;

--
-- Name: proposal_attachments; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.proposal_attachments (
    id text NOT NULL,
    event_id text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    description text,
    uploaded_by text NOT NULL,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.proposal_attachments OWNER TO dti_ems;

--
-- Name: tna_respondents; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.tna_respondents (
    id text NOT NULL,
    tna_id text NOT NULL,
    respondent_type event_schema."TnaRespondentType" DEFAULT 'INDIVIDUAL'::event_schema."TnaRespondentType" NOT NULL,
    name text,
    organization text,
    sector text,
    region text,
    need_knowledge integer DEFAULT 3 NOT NULL,
    need_skills integer DEFAULT 3 NOT NULL,
    need_attitude integer DEFAULT 3 NOT NULL,
    preferred_topics text,
    preferred_mode text,
    preferred_schedule text,
    current_challenges text,
    additional_needs text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.tna_respondents OWNER TO dti_ems;

--
-- Name: tna_responses; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.tna_responses (
    id text NOT NULL,
    participation_id text NOT NULL,
    user_id text NOT NULL,
    knowledge_score numeric(5,2) NOT NULL,
    skill_score numeric(5,2) NOT NULL,
    motivation_score numeric(5,2) NOT NULL,
    composite_score numeric(5,2) NOT NULL,
    recommended_track text,
    responses jsonb DEFAULT '{}'::jsonb NOT NULL,
    submitted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.tna_responses OWNER TO dti_ems;

--
-- Name: training_budget_items; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.training_budget_items (
    id text NOT NULL,
    event_id text NOT NULL,
    item text NOT NULL,
    unit_cost numeric(12,2) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    estimated_amount numeric(12,2) NOT NULL,
    source_of_funds text,
    actual_spent numeric(12,2),
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.training_budget_items OWNER TO dti_ems;

--
-- Name: training_effectiveness_evaluations; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.training_effectiveness_evaluations (
    id text NOT NULL,
    impact_survey_response_id text NOT NULL,
    applied_learnings boolean,
    benefit_increased_sales boolean DEFAULT false NOT NULL,
    benefit_sales_pct numeric(5,2),
    benefit_increased_profit boolean DEFAULT false NOT NULL,
    benefit_profit_pct numeric(5,2),
    benefit_cost_reduction boolean DEFAULT false NOT NULL,
    benefit_cost_pct numeric(5,2),
    benefit_new_markets boolean DEFAULT false NOT NULL,
    benefit_productivity boolean DEFAULT false NOT NULL,
    benefit_manpower_welfare boolean DEFAULT false NOT NULL,
    benefit_standardized_op boolean DEFAULT false NOT NULL,
    benefit_bookkeeping boolean DEFAULT false NOT NULL,
    benefit_improved_mgmt boolean DEFAULT false NOT NULL,
    benefit_setup_business boolean DEFAULT false NOT NULL,
    benefit_expand_business boolean DEFAULT false NOT NULL,
    benefit_enhanced_capacity boolean DEFAULT false NOT NULL,
    benefit_adopt_technology boolean DEFAULT false NOT NULL,
    benefit_innovation boolean DEFAULT false NOT NULL,
    benefit_no_complaints boolean DEFAULT false NOT NULL,
    benefit_others text,
    needs_product_development boolean DEFAULT false NOT NULL,
    needs_loan_advisory boolean DEFAULT false NOT NULL,
    needs_others text,
    future_training_requests text,
    training_effective boolean,
    ineffective_reason text,
    respondent_designation text,
    respondent_company text,
    date_accomplished timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.training_effectiveness_evaluations OWNER TO dti_ems;

--
-- Name: training_effectiveness_reports; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.training_effectiveness_reports (
    id text NOT NULL,
    event_id text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    observations text,
    prepared_by_id text,
    reviewed_by_id text,
    approved_by_id text,
    submitted_to_maa_by_id text,
    date_prepared timestamp(3) without time zone,
    date_reviewed timestamp(3) without time zone,
    date_approved timestamp(3) without time zone,
    date_submitted_to_maa timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE event_schema.training_effectiveness_reports OWNER TO dti_ems;

--
-- Name: training_risk_items; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.training_risk_items (
    id text NOT NULL,
    event_id text NOT NULL,
    risk_description text NOT NULL,
    action_plan text,
    action_date timestamp(3) without time zone,
    responsible_person text,
    effectiveness text,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.training_risk_items OWNER TO dti_ems;

--
-- Name: training_speakers; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.training_speakers (
    id text NOT NULL,
    event_id text NOT NULL,
    name text NOT NULL,
    organization text,
    topic text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.training_speakers OWNER TO dti_ems;

--
-- Name: training_target_groups; Type: TABLE; Schema: event_schema; Owner: dti_ems
--

CREATE TABLE event_schema.training_target_groups (
    id text NOT NULL,
    event_id text NOT NULL,
    edt_level text,
    sector_group text NOT NULL,
    estimated_participants integer DEFAULT 0 NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE event_schema.training_target_groups OWNER TO dti_ems;

--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.attendance_records (id, participation_id, session_id, user_id, method, scanned_at, scanned_by_user_id) FROM stdin;
cmo4ffrfv002jsq0j060h5izd	cmo4ffr8g002dsq0jkn6nkvlb	cmo4ffrds002hsq0jqij13267	cmo4ffqox001rh97sicpq93hx	MANUAL	2026-04-18 14:23:00.522	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo4fm8cz001c13i65onmkgok	cmo4fm85h001613i6frvlogxd	cmo4fm8ap001a13i6swukdra4	cmo4fm7ho002mh97swd7ejic0	MANUAL	2026-04-18 14:28:02.386	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555go300bbbf08vzenec8c	cmo555fhj0077bf08062yinal	cmo555fgh0075bf08dxofg4a5	cmo554yt5000lex7qyixte2cl	MANUAL	2026-04-19 02:22:50.019	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gp600bdbf08ij89vtvx	cmo555fj9007bbf0828kybt32	cmo555fgh0075bf08dxofg4a5	cmo554yz1000qex7qdvbqy248	MANUAL	2026-04-19 02:22:50.057	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gq500bfbf08bavoipmb	cmo555fkc007fbf08etphgmfy	cmo555fgh0075bf08dxofg4a5	cmo554z4j000vex7q1oq94pkd	MANUAL	2026-04-19 02:22:50.093	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gr700bhbf08m710w0pt	cmo555fli007jbf082suvf5qw	cmo555fgh0075bf08dxofg4a5	cmo554z9c0010ex7qbkmvrue1	MANUAL	2026-04-19 02:22:50.13	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gs900bjbf082fn28o22	cmo555fml007nbf08wz432486	cmo555fgh0075bf08dxofg4a5	cmo554ze40015ex7qrrqry2yx	MANUAL	2026-04-19 02:22:50.168	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gtb00blbf084194kjze	cmo555fnq007rbf088e2kkabk	cmo555fgh0075bf08dxofg4a5	cmo554ziy001aex7q91ump9i0	MANUAL	2026-04-19 02:22:50.206	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gud00bnbf082gpxzc3f	cmo555fot007vbf08kupc7ncp	cmo555fgh0075bf08dxofg4a5	cmo554zns001fex7qey84l5wj	MANUAL	2026-04-19 02:22:50.245	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gvf00bpbf084qrgmjfd	cmo555fqi007zbf08lrruk7l6	cmo555fgh0075bf08dxofg4a5	cmo554zsp001kex7qyvjggvkt	MANUAL	2026-04-19 02:22:50.282	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gwg00brbf08ey5i3ubs	cmo555fru0083bf08cyckm2ol	cmo555fgh0075bf08dxofg4a5	cmo554zxn001pex7q0qm5ql5z	MANUAL	2026-04-19 02:22:50.319	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gxh00btbf084hlynxsp	cmo555ft30087bf08t0jnaqaz	cmo555fgh0075bf08dxofg4a5	cmo55502n001uex7q1xhmm0u6	MANUAL	2026-04-19 02:22:50.356	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gyi00bvbf08lz633yl3	cmo555fu9008bbf08jh0vr1kb	cmo555fgh0075bf08dxofg4a5	cmo55507n001zex7qhbbrvrpf	MANUAL	2026-04-19 02:22:50.393	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555gzj00bxbf08kxr58pqu	cmo555fvb008fbf082p7vbkaj	cmo555fgh0075bf08dxofg4a5	cmo5550cw0024ex7qhuaaneof	MANUAL	2026-04-19 02:22:50.43	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h0k00bzbf0823dk2r1t	cmo555fwe008jbf08a6e1h8r1	cmo555fgh0075bf08dxofg4a5	cmo5550hc0029ex7qrnpv4kdm	MANUAL	2026-04-19 02:22:50.467	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h1k00c1bf084711zmbl	cmo555fxk008nbf08rkpchl5s	cmo555fgh0075bf08dxofg4a5	cmo5550m4002eex7q9usd5an7	MANUAL	2026-04-19 02:22:50.503	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h2k00c3bf08gjgo1kml	cmo555fym008rbf080sgey834	cmo555fgh0075bf08dxofg4a5	cmo5550r1002jex7q7pf6lcna	MANUAL	2026-04-19 02:22:50.539	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h3k00c5bf08mdndv9fo	cmo555fzp008vbf085djtyarf	cmo555fgh0075bf08dxofg4a5	cmo5550vv002oex7q340uf20w	MANUAL	2026-04-19 02:22:50.575	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h4j00c7bf086uf99is4	cmo555g0t008zbf088kjde1vx	cmo555fgh0075bf08dxofg4a5	cmo55510n002tex7qkprywdc5	MANUAL	2026-04-19 02:22:50.61	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h5h00c9bf08du3wnmos	cmo555g1u0093bf083os1gbbz	cmo555fgh0075bf08dxofg4a5	cmo55515h002yex7qu97zuqp5	MANUAL	2026-04-19 02:22:50.645	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h6h00cbbf08xvdhi20m	cmo555g2x0097bf08vr1e847m	cmo555fgh0075bf08dxofg4a5	cmo5551a80033ex7q7a9ae4pb	MANUAL	2026-04-19 02:22:50.68	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h7g00cdbf08qjmbh9gv	cmo555g40009bbf08zxs1d22a	cmo555fgh0075bf08dxofg4a5	cmo5551f00038ex7q3bdiw464	MANUAL	2026-04-19 02:22:50.716	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h8h00cfbf08jap53aox	cmo555g53009fbf08unc2oh4w	cmo555fgh0075bf08dxofg4a5	cmo5551ju003dex7qw677xuzp	MANUAL	2026-04-19 02:22:50.753	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555h9i00chbf080c193lph	cmo555g65009jbf08tb5vo4n0	cmo555fgh0075bf08dxofg4a5	cmo5551op003iex7q64q5e9jh	MANUAL	2026-04-19 02:22:50.79	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555haj00cjbf08pz0om4bh	cmo555g79009nbf08zs0gjt0z	cmo555fgh0075bf08dxofg4a5	cmo5551ti003nex7qtz7hv881	MANUAL	2026-04-19 02:22:50.826	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hbk00clbf08nwj8916f	cmo555g8c009rbf08qzc4kk18	cmo555fgh0075bf08dxofg4a5	cmo5551yd003sex7quaibpbrx	MANUAL	2026-04-19 02:22:50.863	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hcj00cnbf08mbb9d4s2	cmo555g9h009vbf08vunga1vd	cmo555fgh0075bf08dxofg4a5	cmo555238003xex7qaeka0et6	MANUAL	2026-04-19 02:22:50.898	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hdj00cpbf08ywlgolvd	cmo555gak009zbf08xmagg0zz	cmo555fgh0075bf08dxofg4a5	cmo5552810042ex7qd4vnbvys	MANUAL	2026-04-19 02:22:50.935	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hek00crbf08qv89fcqo	cmo555gbn00a3bf08ho0rbkup	cmo555fgh0075bf08dxofg4a5	cmo5552cu0047ex7q66xj61no	MANUAL	2026-04-19 02:22:50.972	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hfl00ctbf081cgbw8pe	cmo555gcp00a7bf083lyprtsw	cmo555fgh0075bf08dxofg4a5	cmo5552hr004cex7q9922plh9	MANUAL	2026-04-19 02:22:51.008	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hha00cvbf08lm7jugex	cmo555gdt00abbf08jebdktph	cmo555fgh0075bf08dxofg4a5	cmo5552mm004hex7qqkfp5zh2	MANUAL	2026-04-19 02:22:51.07	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hid00cxbf08bzst7xt4	cmo555gev00afbf08dx597ymk	cmo555fgh0075bf08dxofg4a5	cmo5552rp004mex7qcfys3rdj	MANUAL	2026-04-19 02:22:51.108	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hjf00czbf08aps82go5	cmo555gg000ajbf085dkibndd	cmo555fgh0075bf08dxofg4a5	cmo5552wj004rex7qp77yh9hd	MANUAL	2026-04-19 02:22:51.146	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hkg00d1bf081lknczv7	cmo555gh300anbf08dwtbykda	cmo555fgh0075bf08dxofg4a5	cmo55531g004wex7qlbpost8b	MANUAL	2026-04-19 02:22:51.184	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hli00d3bf0844miy155	cmo555gi600arbf08666y1ss9	cmo555fgh0075bf08dxofg4a5	cmo55536b0051ex7qx1hup7wg	MANUAL	2026-04-19 02:22:51.221	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hmj00d5bf08hodzsptt	cmo555gjb00avbf08bz6m8hav	cmo555fgh0075bf08dxofg4a5	cmo5553b50056ex7qp47mnbao	MANUAL	2026-04-19 02:22:51.258	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hnj00d7bf0867mvi5s4	cmo555gkd00azbf08wkg0jy4g	cmo555fgh0075bf08dxofg4a5	cmo5553fx005bex7q3f5j2z8p	MANUAL	2026-04-19 02:22:51.294	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hoj00d9bf08r310w2en	cmo555gld00b3bf08bcld1004	cmo555fgh0075bf08dxofg4a5	cmo5553kr005gex7qcilsbk1s	MANUAL	2026-04-19 02:22:51.33	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555hpk00dbbf08diibitue	cmo555gmg00b7bf08bgbt2u31	cmo555fgh0075bf08dxofg4a5	cmo5553pq005lex7qro9des1m	MANUAL	2026-04-19 02:22:51.367	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555jxp00nlbf08787ufvvp	cmo555j7l00kxbf082905e1zj	cmo555j6w00kvbf08elmak0zk	cmo5556yj005tex7qalnw8g2m	MANUAL	2026-04-19 02:22:54.252	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555jyp00nnbf08hcscz8jf	cmo555j8k00l1bf08a7nop0ra	cmo555j6w00kvbf08elmak0zk	cmo55573d005yex7qcmbl9alc	MANUAL	2026-04-19 02:22:54.288	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555jzq00npbf08xzfb404f	cmo555j9l00l5bf08hzymv07p	cmo555j6w00kvbf08elmak0zk	cmo5557860063ex7q8znd7swt	MANUAL	2026-04-19 02:22:54.325	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k0r00nrbf08kvaltcwz	cmo555jal00l9bf08d3udp5p8	cmo555j6w00kvbf08elmak0zk	cmo5557cz0068ex7qqijcd7r1	MANUAL	2026-04-19 02:22:54.362	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k1p00ntbf08c8hojpc0	cmo555jbq00ldbf08e6iozfu4	cmo555j6w00kvbf08elmak0zk	cmo5557hs006dex7qlfv0x2ws	MANUAL	2026-04-19 02:22:54.396	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k2n00nvbf089yqqm4mv	cmo555jct00lhbf089o7ru14j	cmo555j6w00kvbf08elmak0zk	cmo5557mk006iex7qrgldfsi8	MANUAL	2026-04-19 02:22:54.431	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k3l00nxbf08ma6ibw91	cmo555jdw00llbf08e8rlx6nh	cmo555j6w00kvbf08elmak0zk	cmo5557rc006nex7qeg93hl17	MANUAL	2026-04-19 02:22:54.465	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k4i00nzbf08mm3wcpfk	cmo555jf000lpbf08ggb5cjzs	cmo555j6w00kvbf08elmak0zk	cmo5557w4006sex7qo2gkf7d5	MANUAL	2026-04-19 02:22:54.498	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k5q00o1bf08rvhu1e87	cmo555jg200ltbf08mjhud34d	cmo555j6w00kvbf08elmak0zk	cmo55580z006xex7qrbxe9oq0	MANUAL	2026-04-19 02:22:54.542	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k6n00o3bf08y2sldny7	cmo555jh500lxbf08h36hoq3t	cmo555j6w00kvbf08elmak0zk	cmo55585s0072ex7qqp4zao71	MANUAL	2026-04-19 02:22:54.575	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k7k00o5bf08rvoguz5h	cmo555ji900m1bf08fvism68y	cmo555j6w00kvbf08elmak0zk	cmo5558as0077ex7q1m6e90ty	MANUAL	2026-04-19 02:22:54.607	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k8h00o7bf082by2janz	cmo555jja00m5bf08fz0rz3b7	cmo555j6w00kvbf08elmak0zk	cmo5558fp007cex7qiku75o2h	MANUAL	2026-04-19 02:22:54.641	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555k9f00o9bf08aqzm2mtd	cmo555jkd00m9bf08745y7t9m	cmo555j6w00kvbf08elmak0zk	cmo5558kg007hex7qb8wk9tiy	MANUAL	2026-04-19 02:22:54.675	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kag00obbf08ef28vr1t	cmo555jle00mdbf0804j9cg56	cmo555j6w00kvbf08elmak0zk	cmo5558pa007mex7qxoleq3nw	MANUAL	2026-04-19 02:22:54.711	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kbh00odbf08lb9v0nd3	cmo555jmg00mhbf085xybsgeo	cmo555j6w00kvbf08elmak0zk	cmo5558u5007rex7qygaz5dks	MANUAL	2026-04-19 02:22:54.748	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kcj00ofbf08kkoprya4	cmo555jnh00mlbf08ttvknujd	cmo555j6w00kvbf08elmak0zk	cmo5558yx007wex7qf314tsay	MANUAL	2026-04-19 02:22:54.787	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kdl00ohbf08rxdz16q8	cmo555jon00mpbf087y39yfhy	cmo555j6w00kvbf08elmak0zk	cmo55593p0081ex7q8hgfd37l	MANUAL	2026-04-19 02:22:54.824	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kem00ojbf08x04mec4d	cmo555jpm00mtbf08pr8if51c	cmo555j6w00kvbf08elmak0zk	cmo55598i0086ex7qst477e0g	MANUAL	2026-04-19 02:22:54.861	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kfm00olbf0821z6sd1p	cmo555jqq00mxbf08c59b02o7	cmo555j6w00kvbf08elmak0zk	cmo5559db008bex7q1kvszvoq	MANUAL	2026-04-19 02:22:54.898	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kgn00onbf0890ssoxd6	cmo555jrs00n1bf08geninetu	cmo555j6w00kvbf08elmak0zk	cmo5559ia008gex7qdz79n4ky	MANUAL	2026-04-19 02:22:54.934	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555khn00opbf08r8kynb42	cmo555jst00n5bf08yjb5n2rm	cmo555j6w00kvbf08elmak0zk	cmo5559n5008lex7q85mcurd2	MANUAL	2026-04-19 02:22:54.971	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kio00orbf08rdbcowcg	cmo555jtv00n9bf08ho0qnpd1	cmo555j6w00kvbf08elmak0zk	cmo5559ry008qex7qickw9mfw	MANUAL	2026-04-19 02:22:55.007	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kjo00otbf08qgfy2xwh	cmo555jux00ndbf08ix175q9o	cmo555j6w00kvbf08elmak0zk	cmo5559ws008vex7qild8vb2g	MANUAL	2026-04-19 02:22:55.043	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo555kkp00ovbf08k7x79e2e	cmo555jw300nhbf0855bslp9y	cmo555j6w00kvbf08elmak0zk	cmo555a1r0090ex7qb2tuchwh	MANUAL	2026-04-19 02:22:55.08	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558305006s100gw7b9mahj	cmo5581ea0018100gygk39jop	cmo5581d00016100gr4djblp6	cmo5571h1000b7b0kvbhjo2t5	MANUAL	2026-04-19 02:24:52.276	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55831f006u100gd7t168fp	cmo5581g5001c100g9291taw7	cmo5581d00016100gr4djblp6	cmo5571o0000g7b0kq8y8ir80	MANUAL	2026-04-19 02:24:52.322	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55832j006w100gzo32n4px	cmo5581h8001g100gv2japujl	cmo5581d00016100gr4djblp6	cmo5571t5000l7b0kentb80n3	MANUAL	2026-04-19 02:24:52.362	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55833k006y100g0bfml1u9	cmo5581id001k100gij4y27q7	cmo5581d00016100gr4djblp6	cmo5571yb000q7b0kyr57hyi4	MANUAL	2026-04-19 02:24:52.4	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55834n0070100gx3dknagd	cmo5581ji001o100g69sjxolw	cmo5581d00016100gr4djblp6	cmo55723c000v7b0kt9gamfyc	MANUAL	2026-04-19 02:24:52.438	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55835u0072100g9rsyfpel	cmo5581kp001s100gy3g1zmil	cmo5581d00016100gr4djblp6	cmo55728g00107b0k2emi8bq4	MANUAL	2026-04-19 02:24:52.482	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55836w0074100gh69nuwzm	cmo5581lr001w100gvxb1acjc	cmo5581d00016100gr4djblp6	cmo5572dk00157b0kdfa27lz9	MANUAL	2026-04-19 02:24:52.519	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55837x0076100g5hpkmy6h	cmo5581mt0020100gvrk6pxb2	cmo5581d00016100gr4djblp6	cmo5572in001a7b0ksp15rne9	MANUAL	2026-04-19 02:24:52.556	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55838z0078100gh6rezdwi	cmo5581nu0024100gdr0ri3kt	cmo5581d00016100gr4djblp6	cmo5572o0001f7b0k89tsu6xz	MANUAL	2026-04-19 02:24:52.595	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583a1007a100guqdzjixh	cmo5581ox0028100gdt6yy7mu	cmo5581d00016100gr4djblp6	cmo5572t9001k7b0k3kfmnby5	MANUAL	2026-04-19 02:24:52.632	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583b2007c100g97tgp6yo	cmo5581q2002c100ga4fhw9t2	cmo5581d00016100gr4djblp6	cmo5572y2001p7b0knexk6yzp	MANUAL	2026-04-19 02:24:52.669	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583c5007e100g8efgrl3u	cmo5581r5002g100g0mk6h13k	cmo5581d00016100gr4djblp6	cmo557334001u7b0kbzti09g6	MANUAL	2026-04-19 02:24:52.709	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583d9007g100gyc8wf6vd	cmo5581s9002k100gytid3u5f	cmo5581d00016100gr4djblp6	cmo55738r001z7b0kj4tatqp6	MANUAL	2026-04-19 02:24:52.748	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583e9007i100gi5ewiw66	cmo5581tc002o100gsno4k1mt	cmo5581d00016100gr4djblp6	cmo5573dj00247b0k7ma9cuck	MANUAL	2026-04-19 02:24:52.784	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583fd007k100gsztul46b	cmo5581uh002s100getua5cmv	cmo5581d00016100gr4djblp6	cmo5573il00297b0kyp5up33v	MANUAL	2026-04-19 02:24:52.824	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583gg007m100gi8er6sby	cmo5581vo002w100g5qb3tmh1	cmo5581d00016100gr4djblp6	cmo5573no002e7b0kjcd13s63	MANUAL	2026-04-19 02:24:52.863	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583hg007o100gvegpzu9m	cmo5581ws0030100g0zcx8ctt	cmo5581d00016100gr4djblp6	cmo5573su002j7b0kkq6dcegm	MANUAL	2026-04-19 02:24:52.899	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583ii007q100gaxqmwgab	cmo5581xv0034100gf77ma6y6	cmo5581d00016100gr4djblp6	cmo5573xy002o7b0kvv0svdv4	MANUAL	2026-04-19 02:24:52.937	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583jn007s100gge55p6lv	cmo5581z20038100g9fpftbqm	cmo5581d00016100gr4djblp6	cmo557432002t7b0kqdzw4iem	MANUAL	2026-04-19 02:24:52.979	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583kp007u100g0gvla36s	cmo558207003c100g7vkly7uv	cmo5581d00016100gr4djblp6	cmo55747z002y7b0kjz1fnu5l	MANUAL	2026-04-19 02:24:53.016	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583lq007w100gqyra1vx5	cmo55821a003g100gfhjri1fs	cmo5581d00016100gr4djblp6	cmo5574d100337b0k8afjwtmw	MANUAL	2026-04-19 02:24:53.053	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583mu007y100g4xxldi5s	cmo55822g003k100gpfy4pyd3	cmo5581d00016100gr4djblp6	cmo5574i100387b0kfvaid90s	MANUAL	2026-04-19 02:24:53.093	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583nw0080100g96txcw2l	cmo55823l003o100grhuj8yq0	cmo5581d00016100gr4djblp6	cmo5574ml003d7b0kmjtbuqrf	MANUAL	2026-04-19 02:24:53.131	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583ox0082100g4sxlpgzy	cmo55824r003s100gpbe7yjiw	cmo5581d00016100gr4djblp6	cmo5574rj003i7b0k5ydw3yif	MANUAL	2026-04-19 02:24:53.168	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583q00084100gsbsb03xc	cmo55825v003w100gr0ufhhzz	cmo5581d00016100gr4djblp6	cmo5574wj003n7b0kbx2zukgw	MANUAL	2026-04-19 02:24:53.207	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583r30086100ghy8d9jvk	cmo5582710040100gsunqaf8k	cmo5581d00016100gr4djblp6	cmo55751l003s7b0kegzjo4yy	MANUAL	2026-04-19 02:24:53.246	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583se0088100gq842gr07	cmo5582850044100gdlaw97qp	cmo5581d00016100gr4djblp6	cmo55756n003x7b0kgjzb3ett	MANUAL	2026-04-19 02:24:53.293	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583td008a100gez8sws5g	cmo5582990048100g83xl6i50	cmo5581d00016100gr4djblp6	cmo5575br00427b0kv8okh7mt	MANUAL	2026-04-19 02:24:53.328	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583ub008c100gz1q9tuyb	cmo5582ad004c100g6uswrw72	cmo5581d00016100gr4djblp6	cmo5575gu00477b0kdds9zlux	MANUAL	2026-04-19 02:24:53.363	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583va008e100ga2hpmlul	cmo5582bk004g100ggav24yps	cmo5581d00016100gr4djblp6	cmo5575lx004c7b0khlyxsksq	MANUAL	2026-04-19 02:24:53.398	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583w9008g100gbbhbr9im	cmo5582cp004k100gwmgr2c81	cmo5581d00016100gr4djblp6	cmo5575r0004h7b0kyajvdogu	MANUAL	2026-04-19 02:24:53.433	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583xb008i100gyzho5561	cmo5582ds004o100gfg6we2jr	cmo5581d00016100gr4djblp6	cmo5575w8004m7b0ket3hahgg	MANUAL	2026-04-19 02:24:53.47	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583ye008k100g0h5csknp	cmo5582ew004s100grvomo1d7	cmo5581d00016100gr4djblp6	cmo557618004r7b0ky72og9g1	MANUAL	2026-04-19 02:24:53.509	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5583zf008m100gi9sb3k2k	cmo5582g0004w100gxnjd6ev6	cmo5581d00016100gr4djblp6	cmo55766a004w7b0kwqeixmek	MANUAL	2026-04-19 02:24:53.547	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55840g008o100g6gaypn8n	cmo5582h60050100gr5owf3rs	cmo5581d00016100gr4djblp6	cmo5576ba00517b0kuw8icfyf	MANUAL	2026-04-19 02:24:53.583	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55841i008q100g8rb9wo8d	cmo5582ia0054100gaujiejtb	cmo5581d00016100gr4djblp6	cmo5576g800567b0k51959kbc	MANUAL	2026-04-19 02:24:53.622	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55842l008s100gyfuve7dj	cmo5582je0058100gpmqxj98a	cmo5581d00016100gr4djblp6	cmo5576l9005b7b0koj92tvkz	MANUAL	2026-04-19 02:24:53.66	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55843m008u100gsg1o97gi	cmo5582kj005c100g5zvto7qv	cmo5581d00016100gr4djblp6	cmo5576qa005g7b0kne60f97z	MANUAL	2026-04-19 02:24:53.697	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55844m008w100gpxw1ac4b	cmo5582lo005g100g8lm8jloo	cmo5581d00016100gr4djblp6	cmo5576vf005l7b0k17daxswb	MANUAL	2026-04-19 02:24:53.733	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55845n008y100goex6cnz7	cmo5582ms005k100g5ygbnp8k	cmo5581d00016100gr4djblp6	cmo55770e005q7b0kojljgpyn	MANUAL	2026-04-19 02:24:53.771	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55846q0090100ge9rxfp22	cmo5582ny005o100g40vgx0q9	cmo5581d00016100gr4djblp6	cmo55775f005v7b0kp059dzs8	MANUAL	2026-04-19 02:24:53.809	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55847s0092100g2pmz4ejw	cmo5582p3005s100gqervwapd	cmo5581d00016100gr4djblp6	cmo5577ae00607b0klevd0zfm	MANUAL	2026-04-19 02:24:53.848	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55848s0094100g3ayb7yhk	cmo5582q9005w100gzf0xrnl0	cmo5581d00016100gr4djblp6	cmo5577fg00657b0kdllzm67d	MANUAL	2026-04-19 02:24:53.883	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55849t0096100g8a8t9dcf	cmo5582re0060100gkr433x16	cmo5581d00016100gr4djblp6	cmo5577ki006a7b0kolz2x63s	MANUAL	2026-04-19 02:24:53.92	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5584az0098100g7ic05uke	cmo5582sj0064100g71g8pfiu	cmo5581d00016100gr4djblp6	cmo5577po006f7b0ksfb43ija	MANUAL	2026-04-19 02:24:53.963	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5584bz009a100giq70sjzy	cmo5582tp0068100gcgp4gr6s	cmo5581d00016100gr4djblp6	cmo5577ur006k7b0kfacbbmvs	MANUAL	2026-04-19 02:24:53.998	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5584cy009c100g1emqw7vp	cmo5582us006c100gzslk9140	cmo5581d00016100gr4djblp6	cmo5577zt006p7b0k9z0eskqe	MANUAL	2026-04-19 02:24:54.034	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5584e1009e100gxlx6qk27	cmo5582vz006g100g879pxom0	cmo5581d00016100gr4djblp6	cmo55784y006u7b0kwklcko95	MANUAL	2026-04-19 02:24:54.072	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5584f4009g100gyr9yxch1	cmo5582x5006k100gryb6a8f5	cmo5581d00016100gr4djblp6	cmo5578a0006z7b0kmhakzq2j	MANUAL	2026-04-19 02:24:54.111	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5584g5009i100gdkq2p7m8	cmo5582ya006o100gquy8sumk	cmo5581d00016100gr4djblp6	cmo5578f200747b0k5coxzwrn	MANUAL	2026-04-19 02:24:54.148	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587jy00mt100gqfnfzr1l	cmo5585yn00h9100gvyufdfez	cmo5585xu00h7100g0mxg9tvj	cmo5578k700797b0kqu1qxb4n	MANUAL	2026-04-19 02:24:58.173	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587kz00mv100gpifx1qrk	cmo5585zt00hd100g9l4977wb	cmo5585xu00h7100g0mxg9tvj	cmo5578p8007e7b0kgfjxbq0n	MANUAL	2026-04-19 02:24:58.211	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587m100mx100govkbx11g	cmo55860x00hh100g59ns5ceu	cmo5585xu00h7100g0mxg9tvj	cmo5578ud007j7b0k63etegp0	MANUAL	2026-04-19 02:24:58.249	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587n100mz100g0f3giysg	cmo55862200hl100g08b15ed9	cmo5585xu00h7100g0mxg9tvj	cmo5578zi007o7b0kxmwvaz05	MANUAL	2026-04-19 02:24:58.285	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587o200n1100ghpoogrq6	cmo55863900hp100g4y9cn2mb	cmo5585xu00h7100g0mxg9tvj	cmo55794d007t7b0ki7masp1n	MANUAL	2026-04-19 02:24:58.322	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587p300n3100gtrygl848	cmo55864b00ht100gsx7g65xt	cmo5585xu00h7100g0mxg9tvj	cmo55799e007y7b0ktg6p3sqa	MANUAL	2026-04-19 02:24:58.358	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587q100n5100gi9yuppl0	cmo55865e00hx100g52ajgw4e	cmo5585xu00h7100g0mxg9tvj	cmo5579ei00837b0kiniospxb	MANUAL	2026-04-19 02:24:58.393	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587r000n7100gzq8vhak3	cmo55866i00i1100gjrhwv2vs	cmo5585xu00h7100g0mxg9tvj	cmo5579jk00887b0k636izhc1	MANUAL	2026-04-19 02:24:58.428	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587ry00n9100goej4ovfk	cmo55867l00i5100gfawx9w2d	cmo5585xu00h7100g0mxg9tvj	cmo5579oh008d7b0ksb0n73x5	MANUAL	2026-04-19 02:24:58.462	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587sx00nb100gi7qcijuj	cmo55868q00i9100gv95ikcy2	cmo5585xu00h7100g0mxg9tvj	cmo5579tg008i7b0k1kw4muf6	MANUAL	2026-04-19 02:24:58.496	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587tw00nd100gccqdvi1n	cmo55869u00id100g5waugjc4	cmo5585xu00h7100g0mxg9tvj	cmo5579yn008n7b0k7q7hq42b	MANUAL	2026-04-19 02:24:58.532	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587uy00nf100gs3s3t3q5	cmo5586ax00ih100gwdumcnhr	cmo5585xu00h7100g0mxg9tvj	cmo557a3q008s7b0kura2pryz	MANUAL	2026-04-19 02:24:58.569	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587w000nh100goioi1fn1	cmo5586c100il100gzo7ehlj9	cmo5585xu00h7100g0mxg9tvj	cmo557a8r008x7b0kumxiysoo	MANUAL	2026-04-19 02:24:58.607	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587x200nj100g65rdt68d	cmo5586d500ip100gp012cgg8	cmo5585xu00h7100g0mxg9tvj	cmo557ads00927b0knmecarda	MANUAL	2026-04-19 02:24:58.646	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587y600nl100g5477w8mq	cmo5586ea00it100gwy8aedwd	cmo5585xu00h7100g0mxg9tvj	cmo557ais00977b0kx4e4gspx	MANUAL	2026-04-19 02:24:58.686	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5587z700nn100gp5k7ni38	cmo5586fd00ix100g533t8cow	cmo5585xu00h7100g0mxg9tvj	cmo557anm009c7b0ki1jnb0li	MANUAL	2026-04-19 02:24:58.722	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55880900np100gtg6g31b7	cmo5586ge00j1100ge6mxbhsc	cmo5585xu00h7100g0mxg9tvj	cmo557ask009h7b0k0o9bciu0	MANUAL	2026-04-19 02:24:58.76	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55881b00nr100gdoazc260	cmo5586hj00j5100gpd6a3ngv	cmo5585xu00h7100g0mxg9tvj	cmo557ay3009m7b0kvf5e8dzf	MANUAL	2026-04-19 02:24:58.799	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55882e00nt100gkzj729ak	cmo5586im00j9100gcpjc03u1	cmo5585xu00h7100g0mxg9tvj	cmo557b2q009r7b0ko262ufn9	MANUAL	2026-04-19 02:24:58.837	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55883h00nv100gxy0mx1bn	cmo5586jr00jd100ggql43zcv	cmo5585xu00h7100g0mxg9tvj	cmo557b7r009w7b0kbwfm7b3j	MANUAL	2026-04-19 02:24:58.876	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55884h00nx100gnorg8o05	cmo5586kv00jh100ggd10xrxe	cmo5585xu00h7100g0mxg9tvj	cmo557bcs00a17b0kr5nkw7r1	MANUAL	2026-04-19 02:24:58.912	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55885i00nz100g0p6mldo4	cmo5586ly00jl100g6c7d8ebq	cmo5585xu00h7100g0mxg9tvj	cmo557bhs00a67b0k0skmm3d3	MANUAL	2026-04-19 02:24:58.95	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55886m00o1100gcxrppxwr	cmo5586nm00jp100gp57wmvij	cmo5585xu00h7100g0mxg9tvj	cmo557bmx00ab7b0kikcmojuy	MANUAL	2026-04-19 02:24:58.989	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55887r00o3100gmwle7cuh	cmo5586oq00jt100gqoyof6aj	cmo5585xu00h7100g0mxg9tvj	cmo557bs000ag7b0ka8y4wcev	MANUAL	2026-04-19 02:24:59.031	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55888s00o5100ghhyjwopr	cmo5586pv00jx100geil7tvqw	cmo5585xu00h7100g0mxg9tvj	cmo557bwz00al7b0kgepa3vbg	MANUAL	2026-04-19 02:24:59.068	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo55889v00o7100gc5nxsx56	cmo5586qz00k1100gw8ndmef6	cmo5585xu00h7100g0mxg9tvj	cmo557c2100aq7b0k71nd79qr	MANUAL	2026-04-19 02:24:59.107	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588az00o9100gxykfxo70	cmo5586s400k5100gk2m6y5he	cmo5585xu00h7100g0mxg9tvj	cmo557c7300av7b0kzqcqzhuv	MANUAL	2026-04-19 02:24:59.146	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588c000ob100g9rcgpyqm	cmo5586ta00k9100g6zclnyks	cmo5585xu00h7100g0mxg9tvj	cmo557cc900b07b0ku0k62661	MANUAL	2026-04-19 02:24:59.183	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588d200od100gmqi6mpn8	cmo5586ub00kd100gpnziacif	cmo5585xu00h7100g0mxg9tvj	cmo557cjc00b57b0kqsqn55ze	MANUAL	2026-04-19 02:24:59.221	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588e400of100gjtjqsnxq	cmo5586vc00kh100g4nck8hls	cmo5585xu00h7100g0mxg9tvj	cmo557cp300ba7b0kvn837k55	MANUAL	2026-04-19 02:24:59.26	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588f600oh100ghdzzq5bq	cmo5586wd00kl100gkftepn4k	cmo5585xu00h7100g0mxg9tvj	cmo557cu300bf7b0kx9dxt6e7	MANUAL	2026-04-19 02:24:59.298	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588g900oj100g8l0wibh9	cmo5586xi00kp100gt3h0p00c	cmo5585xu00h7100g0mxg9tvj	cmo557cys00bk7b0kiielhxzt	MANUAL	2026-04-19 02:24:59.336	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588hd00ol100gv0yeqbwz	cmo5586ym00kt100g8al5xj88	cmo5585xu00h7100g0mxg9tvj	cmo557d3x00bp7b0k2jjgus02	MANUAL	2026-04-19 02:24:59.376	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588if00on100gcph9m97z	cmo5586zr00kx100gotxpwydo	cmo5585xu00h7100g0mxg9tvj	cmo557d9400bu7b0k35ahh0vw	MANUAL	2026-04-19 02:24:59.415	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588jh00op100gnqxs2k4r	cmo55870t00l1100g7v258i0s	cmo5585xu00h7100g0mxg9tvj	cmo557def00bz7b0k05s9niu5	MANUAL	2026-04-19 02:24:59.452	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588kj00or100gj4mfs21i	cmo55871x00l5100gk61got6n	cmo5585xu00h7100g0mxg9tvj	cmo557djn00c47b0kusw3z20q	MANUAL	2026-04-19 02:24:59.491	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588lm00ot100g62l6qhsn	cmo55873200l9100gwiuxcbho	cmo5585xu00h7100g0mxg9tvj	cmo557doq00c97b0krpxcvkvk	MANUAL	2026-04-19 02:24:59.529	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588mn00ov100g45xadxj8	cmo55874600ld100g14uv2td2	cmo5585xu00h7100g0mxg9tvj	cmo557dtv00ce7b0kc384rbtl	MANUAL	2026-04-19 02:24:59.566	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588no00ox100g75ahpics	cmo55875t00lh100g3udoes1b	cmo5585xu00h7100g0mxg9tvj	cmo557dyx00cj7b0kfph6iiov	MANUAL	2026-04-19 02:24:59.604	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588op00oz100gl5brpyor	cmo55876z00ll100g9754b65a	cmo5585xu00h7100g0mxg9tvj	cmo557e4700co7b0kd2pnicoe	MANUAL	2026-04-19 02:24:59.64	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588pq00p1100g4esokz40	cmo55878300lp100g3uk1einv	cmo5585xu00h7100g0mxg9tvj	cmo557e9a00ct7b0ktrojio27	MANUAL	2026-04-19 02:24:59.677	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588qs00p3100gx7jm53j7	cmo55879900lt100g85hjb0ct	cmo5585xu00h7100g0mxg9tvj	cmo557eee00cy7b0knuk1wn5o	MANUAL	2026-04-19 02:24:59.716	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588rw00p5100gnn8jzu2e	cmo5587ae00lx100gfd9p3m5i	cmo5585xu00h7100g0mxg9tvj	cmo557ejd00d37b0ki6m5bywd	MANUAL	2026-04-19 02:24:59.756	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588sz00p7100gkp7w46ts	cmo5587bj00m1100g7milvt99	cmo5585xu00h7100g0mxg9tvj	cmo557eog00d87b0k0ghqgjbj	MANUAL	2026-04-19 02:24:59.794	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588u200p9100gs2079i2u	cmo5587co00m5100gbzjpz61s	cmo5585xu00h7100g0mxg9tvj	cmo557etk00dd7b0kjohsyogv	MANUAL	2026-04-19 02:24:59.833	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588v400pb100gx3fj8aqf	cmo5587ds00m9100gsc0ry87f	cmo5585xu00h7100g0mxg9tvj	cmo557eyr00di7b0ki25zagsl	MANUAL	2026-04-19 02:24:59.872	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588w700pd100gbe6dl66q	cmo5587ex00md100gfhc6fxer	cmo5585xu00h7100g0mxg9tvj	cmo557f3u00dn7b0kod1oq6g2	MANUAL	2026-04-19 02:24:59.91	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588x800pf100gt5l2ss84	cmo5587g100mh100geor9j4rx	cmo5585xu00h7100g0mxg9tvj	cmo557f8w00ds7b0km8qaj3kq	MANUAL	2026-04-19 02:24:59.947	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588y800ph100gqyiy8dop	cmo5587h700ml100gjdzhs2fk	cmo5585xu00h7100g0mxg9tvj	cmo557fdy00dx7b0kmyrsuqo5	MANUAL	2026-04-19 02:24:59.984	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo5588za00pj100gcxkugttd	cmo5587ib00mp100gohc3flqk	cmo5585xu00h7100g0mxg9tvj	cmo557fj600e27b0kmu5hibaw	MANUAL	2026-04-19 02:25:00.022	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558byf012l100gdixymtp8	cmo558aej00x1100gjfolfv6j	cmo558adq00wz100g6s8dpjqj	cmo557fo900e77b0ke9zfa12t	MANUAL	2026-04-19 02:25:03.878	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558bzh012n100gchqe8ym6	cmo558afo00x5100gs3vm0lew	cmo558adq00wz100g6s8dpjqj	cmo557ftg00ec7b0kcmazt6m0	MANUAL	2026-04-19 02:25:03.916	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c0i012p100gko7hxpl9	cmo558agt00x9100gm5mvm6x1	cmo558adq00wz100g6s8dpjqj	cmo557fz300eh7b0k8wx9a1ml	MANUAL	2026-04-19 02:25:03.954	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c1m012r100g0g5hdk0v	cmo558ahy00xd100gntftxvbq	cmo558adq00wz100g6s8dpjqj	cmo557g4o00em7b0kwsuhgib8	MANUAL	2026-04-19 02:25:03.993	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c2o012t100g6mr358g9	cmo558aj300xh100g8z4tartm	cmo558adq00wz100g6s8dpjqj	cmo557g9u00er7b0kit44dx7h	MANUAL	2026-04-19 02:25:04.031	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c3p012v100gsumw9ubv	cmo558ak600xl100gjekjcvyc	cmo558adq00wz100g6s8dpjqj	cmo557ggh00ew7b0k40hv462g	MANUAL	2026-04-19 02:25:04.069	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c4t012x100gvt2vfj1p	cmo558al900xp100gv1j60uks	cmo558adq00wz100g6s8dpjqj	cmo557gm200f17b0k5y2cnzco	MANUAL	2026-04-19 02:25:04.108	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c5v012z100ghy9rgggo	cmo558amd00xt100grcn8kif6	cmo558adq00wz100g6s8dpjqj	cmo557gr500f67b0k4oirdxy0	MANUAL	2026-04-19 02:25:04.147	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c6w0131100gz2qd861b	cmo558anh00xx100gb5uxncxh	cmo558adq00wz100g6s8dpjqj	cmo557gw200fb7b0kuqfs96g3	MANUAL	2026-04-19 02:25:04.183	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c7z0133100gunae8f7x	cmo558aol00y1100g48dofopy	cmo558adq00wz100g6s8dpjqj	cmo557h1700fg7b0kj56vcyx4	MANUAL	2026-04-19 02:25:04.222	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558c910135100g0vpa1wrh	cmo558apr00y5100g8nfpdh4h	cmo558adq00wz100g6s8dpjqj	cmo557h6h00fl7b0k7uz7uf06	MANUAL	2026-04-19 02:25:04.26	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ca30137100gvwqplg78	cmo558aqv00y9100g6ff3ursd	cmo558adq00wz100g6s8dpjqj	cmo557hbh00fq7b0k4s7i25n9	MANUAL	2026-04-19 02:25:04.299	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cb40139100g0n6yaq2l	cmo558ary00yd100gcwijtegf	cmo558adq00wz100g6s8dpjqj	cmo557hgj00fv7b0kk12soz29	MANUAL	2026-04-19 02:25:04.335	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cc8013b100gjsrsqk88	cmo558at300yh100gdbq8o492	cmo558adq00wz100g6s8dpjqj	cmo557hll00g07b0kani4bpyw	MANUAL	2026-04-19 02:25:04.375	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cd9013d100g73htzrmp	cmo558au800yl100gv1z95usv	cmo558adq00wz100g6s8dpjqj	cmo557hqv00g57b0k1d2v0a6m	MANUAL	2026-04-19 02:25:04.413	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cea013f100gufbrm5ng	cmo558ave00yp100go8zycrnx	cmo558adq00wz100g6s8dpjqj	cmo557hw000ga7b0k3sdb881u	MANUAL	2026-04-19 02:25:04.449	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cfe013h100gifmc992c	cmo558awi00yt100gy86m5xf4	cmo558adq00wz100g6s8dpjqj	cmo557i1000gf7b0kp6yh2vlz	MANUAL	2026-04-19 02:25:04.489	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cgh013j100ggirur2ru	cmo558axn00yx100g8codwgz8	cmo558adq00wz100g6s8dpjqj	cmo557i6600gk7b0kihbemw91	MANUAL	2026-04-19 02:25:04.529	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558chj013l100gvb2b736j	cmo558ayn00z1100gj9la6en1	cmo558adq00wz100g6s8dpjqj	cmo557iay00gp7b0ktcm58kic	MANUAL	2026-04-19 02:25:04.567	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cil013n100g59hqi4o8	cmo558azo00z5100g1qqcngw8	cmo558adq00wz100g6s8dpjqj	cmo557ig100gu7b0ktczurfm0	MANUAL	2026-04-19 02:25:04.605	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cjp013p100g1ucvo4fi	cmo558b0m00z9100g874y4oli	cmo558adq00wz100g6s8dpjqj	cmo557il600gz7b0kcp0gx5kg	MANUAL	2026-04-19 02:25:04.644	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cks013r100gjrl6oyby	cmo558b1k00zd100gx2p3yv2i	cmo558adq00wz100g6s8dpjqj	cmo557irb00h47b0kjdayxn8n	MANUAL	2026-04-19 02:25:04.683	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558clu013t100gfilu0c8x	cmo558b2l00zh100g26ftnrgo	cmo558adq00wz100g6s8dpjqj	cmo557iw900h97b0ke1qhuof5	MANUAL	2026-04-19 02:25:04.721	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cmy013v100gedmsqej7	cmo558b3o00zl100go66kmq7b	cmo558adq00wz100g6s8dpjqj	cmo557j1b00he7b0k7vn7huyx	MANUAL	2026-04-19 02:25:04.761	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558co0013x100gt53poo3d	cmo558b4v00zp100gammgk291	cmo558adq00wz100g6s8dpjqj	cmo557j6f00hj7b0k3wywe8f1	MANUAL	2026-04-19 02:25:04.799	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cp2013z100g3ab4fhox	cmo558b5z00zt100gf7e8zq2b	cmo558adq00wz100g6s8dpjqj	cmo557jbl00ho7b0kt5f05uiv	MANUAL	2026-04-19 02:25:04.837	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cq60141100g73oweeuk	cmo558b7400zx100gh9yer8zb	cmo558adq00wz100g6s8dpjqj	cmo557jgm00ht7b0k0dte78bw	MANUAL	2026-04-19 02:25:04.877	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cr80143100g2cwzflo9	cmo558b890101100g4jvjxrqx	cmo558adq00wz100g6s8dpjqj	cmo557jln00hy7b0k90dtt0wl	MANUAL	2026-04-19 02:25:04.915	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cs90145100g69rhxrkr	cmo558b9f0105100gmjzl4trs	cmo558adq00wz100g6s8dpjqj	cmo557jqg00i37b0kl4s918bi	MANUAL	2026-04-19 02:25:04.952	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ctb0147100g08atm7ip	cmo558bak0109100ghs1mhijw	cmo558adq00wz100g6s8dpjqj	cmo557jvj00i87b0kzu8b3y5q	MANUAL	2026-04-19 02:25:04.99	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cud0149100g8b05twpb	cmo558bbp010d100g8l6f3oou	cmo558adq00wz100g6s8dpjqj	cmo557k0q00id7b0kiyizzm66	MANUAL	2026-04-19 02:25:05.029	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cvf014b100g942fz2rl	cmo558bcw010h100gzt5veas6	cmo558adq00wz100g6s8dpjqj	cmo557k6900ii7b0kz59z58p6	MANUAL	2026-04-19 02:25:05.066	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cwj014d100g7071tc4n	cmo558be2010l100gsrq5mihy	cmo558adq00wz100g6s8dpjqj	cmo557kav00in7b0kvr819xm1	MANUAL	2026-04-19 02:25:05.106	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cxo014f100g7bi4hrvq	cmo558bf8010p100g9f7pnlgs	cmo558adq00wz100g6s8dpjqj	cmo557kfv00is7b0keethqpkw	MANUAL	2026-04-19 02:25:05.147	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558cyp014h100g8526t8u8	cmo558bgd010t100gauzzm84z	cmo558adq00wz100g6s8dpjqj	cmo557kl800ix7b0kmp825bgx	MANUAL	2026-04-19 02:25:05.184	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558czq014j100glvg3cwst	cmo558bhj010x100g4butgw7f	cmo558adq00wz100g6s8dpjqj	cmo557kqf00j27b0kfuug0kse	MANUAL	2026-04-19 02:25:05.222	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d0v014l100ge0s2wk8r	cmo558bij0111100gr4ljt1jj	cmo558adq00wz100g6s8dpjqj	cmo557kvz00j77b0k185bppnq	MANUAL	2026-04-19 02:25:05.263	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d1w014n100gog6shkgs	cmo558bjk0115100gys9c3qfv	cmo558adq00wz100g6s8dpjqj	cmo557l1d00jc7b0kgvzuo882	MANUAL	2026-04-19 02:25:05.299	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d2w014p100g605kk10r	cmo558bkj0119100gwjpg4jco	cmo558adq00wz100g6s8dpjqj	cmo557l6200jh7b0kru24b2xz	MANUAL	2026-04-19 02:25:05.336	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d3w014r100g6plb58je	cmo558bli011d100gocj6dqqh	cmo558adq00wz100g6s8dpjqj	cmo557lb900jm7b0kgkebn9y4	MANUAL	2026-04-19 02:25:05.371	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d4x014t100ggfq8brmz	cmo558bmk011h100ghk526qxv	cmo558adq00wz100g6s8dpjqj	cmo557lge00jr7b0kcryv2044	MANUAL	2026-04-19 02:25:05.408	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d5z014v100ge736vs0k	cmo558bnp011l100gem3guymp	cmo558adq00wz100g6s8dpjqj	cmo557llv00jw7b0kdcw9d3r3	MANUAL	2026-04-19 02:25:05.446	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d70014x100grm91y9qr	cmo558bos011p100gfmok7bzh	cmo558adq00wz100g6s8dpjqj	cmo557lr700k17b0k91md5id4	MANUAL	2026-04-19 02:25:05.484	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d84014z100gs7tzm9rw	cmo558bpw011t100gnind36ef	cmo558adq00wz100g6s8dpjqj	cmo557lwf00k67b0klnosqvfo	MANUAL	2026-04-19 02:25:05.524	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558d980151100giqjfgp7l	cmo558br0011x100geq6p3c6y	cmo558adq00wz100g6s8dpjqj	cmo557m1n00kb7b0k010r1b82	MANUAL	2026-04-19 02:25:05.563	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558dae0153100geowamujl	cmo558bs50121100g3gjlm3pd	cmo558adq00wz100g6s8dpjqj	cmo557m7000kg7b0kucmgdcte	MANUAL	2026-04-19 02:25:05.606	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558dbm0155100gxshbmlii	cmo558bta0125100g178c0urt	cmo558adq00wz100g6s8dpjqj	cmo557mc300kl7b0k0u5hs0ap	MANUAL	2026-04-19 02:25:05.649	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558dcq0157100g1avzbeek	cmo558buf0129100gf9cd7p2z	cmo558adq00wz100g6s8dpjqj	cmo557mhd00kq7b0k7lg31xm8	MANUAL	2026-04-19 02:25:05.69	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ddu0159100g1bdkk7h3	cmo558bvk012d100g38q3kkfa	cmo558adq00wz100g6s8dpjqj	cmo557mmh00kv7b0kuce8hh6r	MANUAL	2026-04-19 02:25:05.729	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558dex015b100gimk15t3h	cmo558bwo012h100gpfntl5mm	cmo558adq00wz100g6s8dpjqj	cmo557mrn00l07b0k2c81hsoh	MANUAL	2026-04-19 02:25:05.768	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gfs01j4100gc334szra	cmo558ew201dk100gbuubtka3	cmo558ev701di100gers5rixx	cmo557mwx00l57b0k9z24qbkl	MANUAL	2026-04-19 02:25:09.687	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ggv01j6100gqfwftzgf	cmo558ex801do100gcfu3vhri	cmo558ev701di100gers5rixx	cmo557n2100la7b0kju9en5sb	MANUAL	2026-04-19 02:25:09.727	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ghy01j8100gm8fv4x4y	cmo558eyd01ds100gebd5lhpw	cmo558ev701di100gers5rixx	cmo557n7400lf7b0kw1218vlt	MANUAL	2026-04-19 02:25:09.765	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gj101ja100g5pwxk0sb	cmo558ezi01dw100g6vs8j5cq	cmo558ev701di100gers5rixx	cmo557nc700lk7b0kzww6wx2e	MANUAL	2026-04-19 02:25:09.804	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gk401jc100gmtt5u69e	cmo558f0n01e0100gdgktp8bt	cmo558ev701di100gers5rixx	cmo557nhc00lp7b0kw7dai5g6	MANUAL	2026-04-19 02:25:09.843	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gl601je100ghsmvp3gl	cmo558f1t01e4100gnmkegn1j	cmo558ev701di100gers5rixx	cmo557nmf00lu7b0kjrdjn743	MANUAL	2026-04-19 02:25:09.881	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gm601jg100g634dcfe2	cmo558f2x01e8100gb21sd5lr	cmo558ev701di100gers5rixx	cmo557nrg00lz7b0kcasnmdvc	MANUAL	2026-04-19 02:25:09.918	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gn701ji100ggujhyxnd	cmo558f4101ec100g0dtn7a5m	cmo558ev701di100gers5rixx	cmo557nwi00m47b0kfd29d73k	MANUAL	2026-04-19 02:25:09.955	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558goa01jk100gx1qsrjya	cmo558f5501eg100gg1uo99ku	cmo558ev701di100gers5rixx	cmo557o1l00m97b0kbpc6t7nm	MANUAL	2026-04-19 02:25:09.994	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gpb01jm100gypm2nq9n	cmo558f6901ek100g4jpijdw2	cmo558ev701di100gers5rixx	cmo557o6n00me7b0k78fhb0k5	MANUAL	2026-04-19 02:25:10.031	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gqb01jo100gsfbax3qz	cmo558f7d01eo100gldaa3xd9	cmo558ev701di100gers5rixx	cmo557obw00mj7b0k5pzx9w36	MANUAL	2026-04-19 02:25:10.067	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558grf01jq100gxv93phch	cmo558f8j01es100gn7zuq6ch	cmo558ev701di100gers5rixx	cmo557ogs00mo7b0kc67x7k0i	MANUAL	2026-04-19 02:25:10.106	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gsi01js100g3twytw57	cmo558f9p01ew100g9xbncwg9	cmo558ev701di100gers5rixx	cmo557olp00mt7b0kjxf1w5lt	MANUAL	2026-04-19 02:25:10.145	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gtj01ju100g7dox11w6	cmo558fau01f0100gx3p0qr2x	cmo558ev701di100gers5rixx	cmo557oqo00my7b0kekoo7snp	MANUAL	2026-04-19 02:25:10.182	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gum01jw100gu111gedd	cmo558fby01f4100glwpanmbd	cmo558ev701di100gers5rixx	cmo557owd00n37b0k96pwtt86	MANUAL	2026-04-19 02:25:10.221	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gvq01jy100g313n64e4	cmo558fd101f8100gzsr8cvek	cmo558ev701di100gers5rixx	cmo557p1k00n87b0kznlszabt	MANUAL	2026-04-19 02:25:10.261	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gwr01k0100ghfq9n6ex	cmo558fe501fc100gpl8qt9tq	cmo558ev701di100gers5rixx	cmo557p6700nd7b0ku6rdvxlv	MANUAL	2026-04-19 02:25:10.299	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gxu01k2100glpyqimhh	cmo558ff601fg100g78olyeip	cmo558ev701di100gers5rixx	cmo557pb800ni7b0krdgjttot	MANUAL	2026-04-19 02:25:10.337	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558gyx01k4100geve6d6lz	cmo558fg601fk100gbhr4oy85	cmo558ev701di100gers5rixx	cmo557phb00nn7b0k0iqa5nxc	MANUAL	2026-04-19 02:25:10.376	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h0001k6100gsksmjrp4	cmo558fh701fo100gy2v63buk	cmo558ev701di100gers5rixx	cmo557pmi00ns7b0kzqav8xfj	MANUAL	2026-04-19 02:25:10.415	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h1001k8100gi7yge0d3	cmo558fib01fs100ghbuyd3zh	cmo558ev701di100gers5rixx	cmo557prm00nx7b0ks4xdwk7z	MANUAL	2026-04-19 02:25:10.451	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h2301ka100ghvnmtyqq	cmo558fjb01fw100gex2fv60s	cmo558ev701di100gers5rixx	cmo557pws00o27b0kcxns2k0z	MANUAL	2026-04-19 02:25:10.491	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h3601kc100g5b6l4c0d	cmo558fkb01g0100gm1b1i036	cmo558ev701di100gers5rixx	cmo557q1i00o77b0k8783jbnc	MANUAL	2026-04-19 02:25:10.529	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h4701ke100g8auuiv6b	cmo558fla01g4100gazr9iygq	cmo558ev701di100gers5rixx	cmo557q6f00oc7b0k3y8was5x	MANUAL	2026-04-19 02:25:10.566	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h5901kg100g24gps3lq	cmo558fm801g8100gryva7ved	cmo558ev701di100gers5rixx	cmo557qbo00oh7b0kdb0mb8av	MANUAL	2026-04-19 02:25:10.605	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h6d01ki100g1kab5iiu	cmo558fn601gc100glc7b36l1	cmo558ev701di100gers5rixx	cmo557qgf00om7b0kw6i0fijv	MANUAL	2026-04-19 02:25:10.644	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h7f01kk100g55qkonoy	cmo558fo601gg100g0whmgrqw	cmo558ev701di100gers5rixx	cmo557qlc00or7b0kjzjnla31	MANUAL	2026-04-19 02:25:10.682	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h8h01km100gc5af99un	cmo558fp701gk100gm652ns8o	cmo558ev701di100gers5rixx	cmo557qqe00ow7b0k1llohmfo	MANUAL	2026-04-19 02:25:10.721	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558h9l01ko100gxh7i0oxl	cmo558fqc01go100g7oyuluu7	cmo558ev701di100gers5rixx	cmo557qvg00p17b0kbvs44rl3	MANUAL	2026-04-19 02:25:10.76	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558han01kq100ghgqjtfnb	cmo558fri01gs100gnagwuzy0	cmo558ev701di100gers5rixx	cmo557r0i00p67b0k045twbt7	MANUAL	2026-04-19 02:25:10.799	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hbp01ks100go62ga4zp	cmo558fsm01gw100gqwt04fbk	cmo558ev701di100gers5rixx	cmo557r5q00pb7b0kuc91ln3z	MANUAL	2026-04-19 02:25:10.837	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hct01ku100glrcltesc	cmo558fts01h0100greq2txb3	cmo558ev701di100gers5rixx	cmo557ras00pg7b0kf375867f	MANUAL	2026-04-19 02:25:10.877	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hdv01kw100g5rlqo92w	cmo558fuw01h4100g4vnnv019	cmo558ev701di100gers5rixx	cmo557rfn00pl7b0kej55y9bk	MANUAL	2026-04-19 02:25:10.915	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hew01ky100g3xry5wqk	cmo558fw101h8100gr53x58od	cmo558ev701di100gers5rixx	cmo557rkr00pq7b0kbbtj1zwa	MANUAL	2026-04-19 02:25:10.951	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hfz01l0100g7k58wu9l	cmo558fx501hc100gdcex1mqw	cmo558ev701di100gers5rixx	cmo557rpw00pv7b0kvh4xon07	MANUAL	2026-04-19 02:25:10.991	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hh301l2100go1acvr04	cmo558fya01hg100ggix4wsgk	cmo558ev701di100gers5rixx	cmo557rux00q07b0k3h7jj7k3	MANUAL	2026-04-19 02:25:11.03	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hi301l4100gh8nxmzkk	cmo558fzf01hk100gccemxgxo	cmo558ev701di100gers5rixx	cmo557s0800q57b0k5c2vn2s6	MANUAL	2026-04-19 02:25:11.067	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hj601l6100gr5448jru	cmo558g0m01ho100ga4b60nk7	cmo558ev701di100gers5rixx	cmo557s4t00qa7b0kvz050jin	MANUAL	2026-04-19 02:25:11.105	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hkb01l8100gxtm0p2th	cmo558g1q01hs100g2wmxnqqv	cmo558ev701di100gers5rixx	cmo557s9r00qf7b0kv2j9wc4e	MANUAL	2026-04-19 02:25:11.147	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hld01la100g24doizez	cmo558g2w01hw100ghpmpmwwj	cmo558ev701di100gers5rixx	cmo557seu00qk7b0kjzngc5jp	MANUAL	2026-04-19 02:25:11.184	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hmh01lc100gmbh4463g	cmo558g4001i0100gxj9uaf6r	cmo558ev701di100gers5rixx	cmo557sjy00qp7b0kcbixu68x	MANUAL	2026-04-19 02:25:11.224	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hnk01le100gwzjq9kub	cmo558g5401i4100ggmpnk1vw	cmo558ev701di100gers5rixx	cmo557sp400qu7b0k6g4ofhl0	MANUAL	2026-04-19 02:25:11.264	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hol01lg100gngmvtuni	cmo558g6801i8100gplqcji02	cmo558ev701di100gers5rixx	cmo557su500qz7b0k1800gjp0	MANUAL	2026-04-19 02:25:11.3	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hpp01li100g8rxxtyfz	cmo558g7d01ic100gtqb5eo8i	cmo558ev701di100gers5rixx	cmo557szb00r47b0k09i82w3t	MANUAL	2026-04-19 02:25:11.34	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hqs01lk100gmb5tcf1d	cmo558g8h01ig100gt1tnpb9c	cmo558ev701di100gers5rixx	cmo557t4r00r97b0konzo0g13	MANUAL	2026-04-19 02:25:11.379	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hrt01lm100gzc0fxexu	cmo558g9m01ik100g0roowib3	cmo558ev701di100gers5rixx	cmo557t9u00re7b0kijdp5m56	MANUAL	2026-04-19 02:25:11.417	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hsw01lo100gpctursps	cmo558gap01io100gryn9n9z0	cmo558ev701di100gers5rixx	cmo557tez00rj7b0kiw7z270r	MANUAL	2026-04-19 02:25:11.455	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hty01lq100gle6calcr	cmo558gbt01is100gchq7ala5	cmo558ev701di100gers5rixx	cmo557tk200ro7b0k0q0bhpn0	MANUAL	2026-04-19 02:25:11.494	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558huz01ls100gl0s8ic1d	cmo558gcx01iw100guwc4dny4	cmo558ev701di100gers5rixx	cmo557tp800rt7b0ks8pu88qg	MANUAL	2026-04-19 02:25:11.531	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558hvz01lu100gdlc95wig	cmo558ge301j0100giv3qs821	cmo558ev701di100gers5rixx	cmo557tub00ry7b0k39n9mopk	MANUAL	2026-04-19 02:25:11.566	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l0a01z2100g3swcuwoc	cmo558jef01ti100gpf100hzj	cmo558jdm01tg100golpmyv7y	cmo557tze00s37b0knxgb0zgq	MANUAL	2026-04-19 02:25:15.61	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l1d01z4100gsnyz981f	cmo558jfk01tm100ghjyefpxv	cmo558jdm01tg100golpmyv7y	cmo557u4j00s87b0kojl3s945	MANUAL	2026-04-19 02:25:15.648	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l2f01z6100grzfags67	cmo558jgq01tq100g3cm5lb6d	cmo558jdm01tg100golpmyv7y	cmo557u9r00sd7b0kuzobggoq	MANUAL	2026-04-19 02:25:15.687	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l3h01z8100g4o7eonmt	cmo558jhw01tu100g24itup4k	cmo558jdm01tg100golpmyv7y	cmo557uet00si7b0kvne2djec	MANUAL	2026-04-19 02:25:15.725	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l4k01za100gw0de9klg	cmo558jj201ty100g3bvg8sas	cmo558jdm01tg100golpmyv7y	cmo557ujv00sn7b0kg8pxfsox	MANUAL	2026-04-19 02:25:15.764	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l5o01zc100gagkq2gys	cmo558jk801u2100ghu4hxqqv	cmo558jdm01tg100golpmyv7y	cmo557uoy00ss7b0kql7bfvw8	MANUAL	2026-04-19 02:25:15.803	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l7501ze100gp9w02zz7	cmo558jle01u6100ggsr1egu4	cmo558jdm01tg100golpmyv7y	cmo557uu000sx7b0krwou7vvt	MANUAL	2026-04-19 02:25:15.857	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l8a01zg100gne1anpig	cmo558jmk01ua100gi68c1onb	cmo558jdm01tg100golpmyv7y	cmo557uz300t27b0k6t32lb5v	MANUAL	2026-04-19 02:25:15.898	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558l9901zi100gchggi53o	cmo558jnp01ue100g43lr5ix4	cmo558jdm01tg100golpmyv7y	cmo557v4800t77b0k2mc5rfic	MANUAL	2026-04-19 02:25:15.933	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558la901zk100gn72mola2	cmo558jox01ui100gousqdl0g	cmo558jdm01tg100golpmyv7y	cmo557v9a00tc7b0k18ly995s	MANUAL	2026-04-19 02:25:15.968	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lb801zm100gspnunwfe	cmo558jq501um100gi3qx3atz	cmo558jdm01tg100golpmyv7y	cmo557vee00th7b0kqnj7luvr	MANUAL	2026-04-19 02:25:16.003	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lc901zo100gpa93np7v	cmo558jr901uq100grc89b840	cmo558jdm01tg100golpmyv7y	cmo557vjj00tm7b0kz8gnhpct	MANUAL	2026-04-19 02:25:16.04	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ldb01zq100gx9k67r8d	cmo558jsf01uu100gppejnptr	cmo558jdm01tg100golpmyv7y	cmo557von00tr7b0kpw9dyaf2	MANUAL	2026-04-19 02:25:16.078	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lec01zs100gh6huiuur	cmo558jtj01uy100gpeuk3ggr	cmo558jdm01tg100golpmyv7y	cmo557vup00tw7b0kka2z577m	MANUAL	2026-04-19 02:25:16.116	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lfg01zu100gprdhjn5y	cmo558jup01v2100gega0sqbc	cmo558jdm01tg100golpmyv7y	cmo557w0200u17b0ka55u5wp5	MANUAL	2026-04-19 02:25:16.155	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lgi01zw100g8nbgo79w	cmo558jvw01v6100g5wheu0u3	cmo558jdm01tg100golpmyv7y	cmo557w5600u67b0krc3w0c51	MANUAL	2026-04-19 02:25:16.194	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lhk01zy100gwxqmpl7v	cmo558jx201va100gp7n79qh9	cmo558jdm01tg100golpmyv7y	cmo557w9z00ub7b0k51iu0w8p	MANUAL	2026-04-19 02:25:16.232	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lin0200100gs9vaab21	cmo558jy701ve100gufipieuj	cmo558jdm01tg100golpmyv7y	cmo557wf100ug7b0kb984024b	MANUAL	2026-04-19 02:25:16.27	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ljr0202100g7vv5fjb5	cmo558jzc01vi100g3yspayqs	cmo558jdm01tg100golpmyv7y	cmo557wk700ul7b0kz02m7bt9	MANUAL	2026-04-19 02:25:16.31	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lku0204100gggtp4966	cmo558k0f01vm100gjhyj5ald	cmo558jdm01tg100golpmyv7y	cmo557wpj00uq7b0kwopo3104	MANUAL	2026-04-19 02:25:16.349	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558llv0206100gnt3zl13o	cmo558k1i01vq100gtdr46gqy	cmo558jdm01tg100golpmyv7y	cmo557wuo00uv7b0k4im8bj0e	MANUAL	2026-04-19 02:25:16.387	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lmy0208100g69rvx22d	cmo558k2n01vu100giy9tvu56	cmo558jdm01tg100golpmyv7y	cmo557wzr00v07b0kjf3w2l23	MANUAL	2026-04-19 02:25:16.426	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lo1020a100g22auz8hb	cmo558k3u01vy100gdbqrxv7e	cmo558jdm01tg100golpmyv7y	cmo557x4v00v57b0ka29aheyo	MANUAL	2026-04-19 02:25:16.464	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lp3020c100gcot4vjwg	cmo558k4z01w2100gp3v5ev5k	cmo558jdm01tg100golpmyv7y	cmo557xa300va7b0kdaoph27t	MANUAL	2026-04-19 02:25:16.502	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lq8020e100gxg4tfz7j	cmo558k6401w6100gv7ivamq2	cmo558jdm01tg100golpmyv7y	cmo557xf600vf7b0k6nf325ws	MANUAL	2026-04-19 02:25:16.543	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lra020g100g4ezprwlh	cmo558k7a01wa100go9mzl4cy	cmo558jdm01tg100golpmyv7y	cmo557xke00vk7b0kydwbgsas	MANUAL	2026-04-19 02:25:16.581	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lsc020i100g89se2zew	cmo558k8i01we100g5dqyj9xy	cmo558jdm01tg100golpmyv7y	cmo557xp400vp7b0k9gem5k8b	MANUAL	2026-04-19 02:25:16.62	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558ltf020k100gkw28g0zt	cmo558k9o01wi100gpjnr508b	cmo558jdm01tg100golpmyv7y	cmo557xu900vu7b0kp3g098mx	MANUAL	2026-04-19 02:25:16.658	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lui020m100gf08h96fz	cmo558kat01wm100gtj9671oa	cmo558jdm01tg100golpmyv7y	cmo557xzc00vz7b0kmmboa9u5	MANUAL	2026-04-19 02:25:16.697	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lvk020o100gouu459md	cmo558kbz01wq100gcc0952ot	cmo558jdm01tg100golpmyv7y	cmo557y4p00w47b0kcy626bah	MANUAL	2026-04-19 02:25:16.736	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lwn020q100g7a7u1c1k	cmo558kd301wu100ggv39jbwy	cmo558jdm01tg100golpmyv7y	cmo557y9j00w97b0kz60mqb0x	MANUAL	2026-04-19 02:25:16.775	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lxr020s100gl3hzp9nh	cmo558kec01wy100ge64hb0zx	cmo558jdm01tg100golpmyv7y	cmo557yen00we7b0kgagknyrb	MANUAL	2026-04-19 02:25:16.814	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lys020u100gmcrfpw3t	cmo558kfh01x2100gwylx1hzr	cmo558jdm01tg100golpmyv7y	cmo557yjr00wj7b0k93g5v46t	MANUAL	2026-04-19 02:25:16.852	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558lzv020w100gea819z6a	cmo558kgo01x6100ge5j3vc6l	cmo558jdm01tg100golpmyv7y	cmo557yot00wo7b0ker1evt5a	MANUAL	2026-04-19 02:25:16.89	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m0z020y100g3ed89wt6	cmo558khs01xa100gb22at26s	cmo558jdm01tg100golpmyv7y	cmo557ytx00wt7b0ku3vsvi6i	MANUAL	2026-04-19 02:25:16.93	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m210210100gvx1xch6h	cmo558kiy01xe100g1suv0mx8	cmo558jdm01tg100golpmyv7y	cmo557yz200wy7b0kukfrukpk	MANUAL	2026-04-19 02:25:16.968	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m340212100ggi1ql901	cmo558kk201xi100gfyoxdnxg	cmo558jdm01tg100golpmyv7y	cmo557z4700x37b0k193jisw5	MANUAL	2026-04-19 02:25:17.007	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m480214100gyn4hd9rv	cmo558kl701xm100g02qeyfwe	cmo558jdm01tg100golpmyv7y	cmo557z9600x87b0kxla3zvl5	MANUAL	2026-04-19 02:25:17.048	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m5c0216100gn5oaz9yw	cmo558kmd01xq100gygb1j38f	cmo558jdm01tg100golpmyv7y	cmo557zed00xd7b0kqrsc0fb2	MANUAL	2026-04-19 02:25:17.087	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m6g0218100gfb5o9rqg	cmo558kni01xu100gyxwbvq7c	cmo558jdm01tg100golpmyv7y	cmo557zji00xi7b0k56gau7l9	MANUAL	2026-04-19 02:25:17.128	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m7i021a100g3pfv4w48	cmo558kot01xy100gzi671glw	cmo558jdm01tg100golpmyv7y	cmo557zop00xn7b0k39c3nzfg	MANUAL	2026-04-19 02:25:17.166	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m8m021c100ggc20tc3p	cmo558kpw01y2100gi17iz11y	cmo558jdm01tg100golpmyv7y	cmo557zu900xs7b0kbb2lyyc3	MANUAL	2026-04-19 02:25:17.205	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558m9p021e100gyr1pbmlb	cmo558kqz01y6100glnw7okzs	cmo558jdm01tg100golpmyv7y	cmo557zyu00xx7b0kgs9475e5	MANUAL	2026-04-19 02:25:17.244	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558mar021g100gkqa8mf0k	cmo558ks001ya100gss5d07hj	cmo558jdm01tg100golpmyv7y	cmo55803r00y27b0kivnt8i8n	MANUAL	2026-04-19 02:25:17.282	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558mbt021i100gq4n01vvx	cmo558ksz01ye100g3axlmuh0	cmo558jdm01tg100golpmyv7y	cmo55808y00y77b0k07q4amg0	MANUAL	2026-04-19 02:25:17.321	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558mcv021k100gq0277sn8	cmo558ku101yi100g5wrzdepg	cmo558jdm01tg100golpmyv7y	cmo5580fe00yc7b0khj6mgnge	MANUAL	2026-04-19 02:25:17.358	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558mdw021m100g6fsahktg	cmo558kv601ym100gaqjtz3ma	cmo558jdm01tg100golpmyv7y	cmo5580kk00yh7b0kfejjlsyh	MANUAL	2026-04-19 02:25:17.396	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558mex021o100g2nq21uqe	cmo558kwb01yq100gw8wz7hzo	cmo558jdm01tg100golpmyv7y	cmo5580po00ym7b0kpwdoxgsu	MANUAL	2026-04-19 02:25:17.433	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558mg1021q100gufd8zmf8	cmo558kxg01yu100gryr0uyk9	cmo558jdm01tg100golpmyv7y	cmo5580uw00yr7b0kipuqllzh	MANUAL	2026-04-19 02:25:17.473	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmo558mh5021s100gme4f0iei	cmo558kyl01yy100gpcqmnjbw	cmo558jdm01tg100golpmyv7y	cmo55810700yw7b0k61bz2pxy	MANUAL	2026-04-19 02:25:17.512	9dcf607d-8d76-43c5-a486-db6b10eb99a0
cmocmamam002j1w8sxczdp5wa	cmocm39qm00271w8sedk78awx	cmocm5clw002h1w8sypv333ub	cmockq3hi001buxz7570ou2ax	QR_SCAN	2026-04-24 07:57:07.292	e4d48cc5-a05b-425c-9c89-57e4232c6db2
cmocme065002n1w8s61aldf5j	cmocm3aeo00291w8s2mo7jy5b	cmocm5clw002h1w8sypv333ub	cmocl3m6h001ouxz76nugd8fe	QR_SCAN	2026-04-24 07:59:45.244	e4d48cc5-a05b-425c-9c89-57e4232c6db2
cmp1zcns60013me1w6lmuk47j	cmp1yzo65000vme1wf4o7vbwz	cmp1zbcw4000zme1wfou82gz2	cmoebag5v0001e1ef35z9m1xm	QR_SCAN	2026-05-12 01:56:51.941	e4d48cc5-a05b-425c-9c89-57e4232c6db2
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.certificates (id, participation_id, user_id, event_id, status, storage_url, verification_code, generated_at, issued_at) FROM stdin;
cmo4fm9h0001i13i6fcjrfo84	cmo4fm85h001613i6frvlogxd	cmo4fm7ho002mh97swd7ejic0	cmo4fm7tl000013i65nq60ql9	ISSUED	\N	038B8FE78B19EA7A62A80868	2026-04-18 14:28:03.828	2026-04-18 14:28:03.828
cmo555il800ghbf08qm0ver3y	cmo555fhj0077bf08062yinal	cmo554yt5000lex7qyixte2cl	cmo555f9x005zbf0853edgeal	ISSUED	\N	AC685DFF494DB67F8E9140DA	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ild00gjbf08z15vm5z5	cmo555fj9007bbf0828kybt32	cmo554yz1000qex7qdvbqy248	cmo555f9x005zbf0853edgeal	ISSUED	\N	14B0B68DBE1E8D0A96E00876	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilh00glbf088lz25cqj	cmo555fkc007fbf08etphgmfy	cmo554z4j000vex7q1oq94pkd	cmo555f9x005zbf0853edgeal	ISSUED	\N	0F1BA7118C439577CF6FC647	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilk00gnbf084019xm0x	cmo555fli007jbf082suvf5qw	cmo554z9c0010ex7qbkmvrue1	cmo555f9x005zbf0853edgeal	ISSUED	\N	4E853D4C412328D17C7B67A0	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ill00gpbf080mijq3wm	cmo555fml007nbf08wz432486	cmo554ze40015ex7qrrqry2yx	cmo555f9x005zbf0853edgeal	ISSUED	\N	268EC409CB890BC77ADFA641	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilo00grbf08jfpzwbi2	cmo555fnq007rbf088e2kkabk	cmo554ziy001aex7q91ump9i0	cmo555f9x005zbf0853edgeal	ISSUED	\N	FD2A36B35B9334F7AC96AEA2	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilq00gtbf08yoibx9z6	cmo555fot007vbf08kupc7ncp	cmo554zns001fex7qey84l5wj	cmo555f9x005zbf0853edgeal	ISSUED	\N	6BC52E6E3D9E4E51262A0E2F	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ils00gvbf081h5llk7t	cmo555fqi007zbf08lrruk7l6	cmo554zsp001kex7qyvjggvkt	cmo555f9x005zbf0853edgeal	ISSUED	\N	25065A1B418B43ED4390D767	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilu00gxbf081dwlens4	cmo555fru0083bf08cyckm2ol	cmo554zxn001pex7q0qm5ql5z	cmo555f9x005zbf0853edgeal	ISSUED	\N	F9E3A78F56F180BD8663564C	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilv00gzbf08bpuvvenr	cmo555ft30087bf08t0jnaqaz	cmo55502n001uex7q1xhmm0u6	cmo555f9x005zbf0853edgeal	ISSUED	\N	865720494936E371AB482EE3	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilx00h1bf082f0mgers	cmo555fu9008bbf08jh0vr1kb	cmo55507n001zex7qhbbrvrpf	cmo555f9x005zbf0853edgeal	ISSUED	\N	8C5323D7AF59422CBD6CCF13	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ilz00h3bf0887fetf20	cmo555fvb008fbf082p7vbkaj	cmo5550cw0024ex7qhuaaneof	cmo555f9x005zbf0853edgeal	ISSUED	\N	E561F274ED67F7F321675842	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555im100h5bf08lvgujl1s	cmo555fwe008jbf08a6e1h8r1	cmo5550hc0029ex7qrnpv4kdm	cmo555f9x005zbf0853edgeal	ISSUED	\N	4362554685C27FF2ECEAAFA1	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555im200h7bf0813dluv6p	cmo555fxk008nbf08rkpchl5s	cmo5550m4002eex7q9usd5an7	cmo555f9x005zbf0853edgeal	ISSUED	\N	3287BE7C19E4D883CBA290FC	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555im400h9bf08t0k2peqt	cmo555fym008rbf080sgey834	cmo5550r1002jex7q7pf6lcna	cmo555f9x005zbf0853edgeal	ISSUED	\N	D6D7AEDE78F1E07C9BDBCC34	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555im600hbbf08ak205wqm	cmo555fzp008vbf085djtyarf	cmo5550vv002oex7q340uf20w	cmo555f9x005zbf0853edgeal	ISSUED	\N	0EB06BD05E3FCA64C8521E14	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555im700hdbf08ltae28u1	cmo555g0t008zbf088kjde1vx	cmo55510n002tex7qkprywdc5	cmo555f9x005zbf0853edgeal	ISSUED	\N	6F43268F1001568B204A8405	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555im900hfbf085c9p6g7y	cmo555g1u0093bf083os1gbbz	cmo55515h002yex7qu97zuqp5	cmo555f9x005zbf0853edgeal	ISSUED	\N	78042F64C9E3C28FB7E3D947	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imb00hhbf08i8617zc3	cmo555g2x0097bf08vr1e847m	cmo5551a80033ex7q7a9ae4pb	cmo555f9x005zbf0853edgeal	ISSUED	\N	1A4AACA8E973D650C7DA736C	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imc00hjbf089k0ctzjd	cmo555g40009bbf08zxs1d22a	cmo5551f00038ex7q3bdiw464	cmo555f9x005zbf0853edgeal	ISSUED	\N	E2D61BB660EB9EB0CBC6831B	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555ime00hlbf08xyizowwc	cmo555g53009fbf08unc2oh4w	cmo5551ju003dex7qw677xuzp	cmo555f9x005zbf0853edgeal	ISSUED	\N	744E02E34373DAA0AC82853C	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imf00hnbf08q9amd0ft	cmo555g65009jbf08tb5vo4n0	cmo5551op003iex7q64q5e9jh	cmo555f9x005zbf0853edgeal	ISSUED	\N	C99D8F4E3A9E032F0D89CF0B	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imh00hpbf08iz2er6xj	cmo555g79009nbf08zs0gjt0z	cmo5551ti003nex7qtz7hv881	cmo555f9x005zbf0853edgeal	ISSUED	\N	B362B0E835744EA0E7EC91CD	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imi00hrbf08dv18ge8v	cmo555g8c009rbf08qzc4kk18	cmo5551yd003sex7quaibpbrx	cmo555f9x005zbf0853edgeal	ISSUED	\N	086FC164A80877859E87D37D	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imk00htbf084mxuoakb	cmo555g9h009vbf08vunga1vd	cmo555238003xex7qaeka0et6	cmo555f9x005zbf0853edgeal	ISSUED	\N	C0CD4B06694933A20A62B2C7	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555iml00hvbf084sdj3jgy	cmo555gak009zbf08xmagg0zz	cmo5552810042ex7qd4vnbvys	cmo555f9x005zbf0853edgeal	ISSUED	\N	45CF85DA914C7B1EC5906CEE	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imn00hxbf08vfh4c2fn	cmo555gbn00a3bf08ho0rbkup	cmo5552cu0047ex7q66xj61no	cmo555f9x005zbf0853edgeal	ISSUED	\N	46955FC68C638D2878CA5753	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imo00hzbf0869t7rql9	cmo555gcp00a7bf083lyprtsw	cmo5552hr004cex7q9922plh9	cmo555f9x005zbf0853edgeal	ISSUED	\N	48825A544E6992051E5CE8ED	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imq00i1bf0857fesezk	cmo555gdt00abbf08jebdktph	cmo5552mm004hex7qqkfp5zh2	cmo555f9x005zbf0853edgeal	ISSUED	\N	BA117BA662D1141C394B3797	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imr00i3bf08jqm5e7um	cmo555gev00afbf08dx597ymk	cmo5552rp004mex7qcfys3rdj	cmo555f9x005zbf0853edgeal	ISSUED	\N	D5EA60AB990A6416FAC160E9	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imt00i5bf0844dls2hr	cmo555gg000ajbf085dkibndd	cmo5552wj004rex7qp77yh9hd	cmo555f9x005zbf0853edgeal	ISSUED	\N	BA0B31CE3E92CB0E80C1AB27	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imu00i7bf08er79dt3x	cmo555gh300anbf08dwtbykda	cmo55531g004wex7qlbpost8b	cmo555f9x005zbf0853edgeal	ISSUED	\N	958F69FC2D23B7650D9FEB11	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imv00i9bf08y52xph11	cmo555gi600arbf08666y1ss9	cmo55536b0051ex7qx1hup7wg	cmo555f9x005zbf0853edgeal	ISSUED	\N	A3E9904A0C3D7622DB9DF23A	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imx00ibbf08agiqxewv	cmo555gjb00avbf08bz6m8hav	cmo5553b50056ex7qp47mnbao	cmo555f9x005zbf0853edgeal	ISSUED	\N	98399F507DA06BF2E27AB3BC	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555imy00idbf08twats2av	cmo555gkd00azbf08wkg0jy4g	cmo5553fx005bex7q3f5j2z8p	cmo555f9x005zbf0853edgeal	ISSUED	\N	1BA0982C57F70DD99AB80A11	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555in000ifbf08tof7p5wb	cmo555gld00b3bf08bcld1004	cmo5553kr005gex7qcilsbk1s	cmo555f9x005zbf0853edgeal	ISSUED	\N	CCAF6E0DD4D1C4992147B15E	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo555in100ihbf08ftxlvjop	cmo555gmg00b7bf08bgbt2u31	cmo5553pq005lex7qro9des1m	cmo555f9x005zbf0853edgeal	ISSUED	\N	D100E6F7067B6E54FCBD478B	2026-04-19 02:22:52.508	2026-04-19 02:22:52.508
cmo5585lu00da100g7vb46wpu	cmo5581ea0018100gygk39jop	cmo5571h1000b7b0kvbhjo2t5	cmo55815b0000100gwzv2dbyo	ISSUED	\N	89FC3368675B1872D7E2EA02	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585lz00dc100ghkazej80	cmo5581g5001c100g9291taw7	cmo5571o0000g7b0kq8y8ir80	cmo55815b0000100gwzv2dbyo	ISSUED	\N	2808215F68A5E3E8BED313C1	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585m200de100g77gqpmkh	cmo5581h8001g100gv2japujl	cmo5571t5000l7b0kentb80n3	cmo55815b0000100gwzv2dbyo	ISSUED	\N	17790AF19B964EAB80FE7195	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585m500dg100gw8a3j8b0	cmo5581id001k100gij4y27q7	cmo5571yb000q7b0kyr57hyi4	cmo55815b0000100gwzv2dbyo	ISSUED	\N	F64379CA6984C2B47D5FE8EA	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585m700di100ggj86i6ja	cmo5581ji001o100g69sjxolw	cmo55723c000v7b0kt9gamfyc	cmo55815b0000100gwzv2dbyo	ISSUED	\N	568779B1C9965AC3798FE5D7	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585m900dk100gxwr52vsc	cmo5581kp001s100gy3g1zmil	cmo55728g00107b0k2emi8bq4	cmo55815b0000100gwzv2dbyo	ISSUED	\N	74E6C4DC5B8E1485067B3AD5	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mc00dm100gndb7ngd2	cmo5581lr001w100gvxb1acjc	cmo5572dk00157b0kdfa27lz9	cmo55815b0000100gwzv2dbyo	ISSUED	\N	7604A7E6097A83B26D587437	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585me00do100g4g6ph17a	cmo5581mt0020100gvrk6pxb2	cmo5572in001a7b0ksp15rne9	cmo55815b0000100gwzv2dbyo	ISSUED	\N	89A750C89E285BF85BDEAADB	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mh00dq100goi1xng7c	cmo5581nu0024100gdr0ri3kt	cmo5572o0001f7b0k89tsu6xz	cmo55815b0000100gwzv2dbyo	ISSUED	\N	0916EB334A5AD58709E46E98	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mj00ds100gh2rzybde	cmo5581ox0028100gdt6yy7mu	cmo5572t9001k7b0k3kfmnby5	cmo55815b0000100gwzv2dbyo	ISSUED	\N	9C97013BE48A8C8A98610DF0	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ml00du100gvfryvzp5	cmo5581q2002c100ga4fhw9t2	cmo5572y2001p7b0knexk6yzp	cmo55815b0000100gwzv2dbyo	ISSUED	\N	1BEF21A98FB4590475989FC5	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mn00dw100ggna7dmun	cmo5581r5002g100g0mk6h13k	cmo557334001u7b0kbzti09g6	cmo55815b0000100gwzv2dbyo	ISSUED	\N	B26A46CBE8C8E8F514A10F55	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mp00dy100g8hekapzq	cmo5581s9002k100gytid3u5f	cmo55738r001z7b0kj4tatqp6	cmo55815b0000100gwzv2dbyo	ISSUED	\N	9F697F2B9039E61A5D9DED65	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mq00e0100gjt78ivk0	cmo5581tc002o100gsno4k1mt	cmo5573dj00247b0k7ma9cuck	cmo55815b0000100gwzv2dbyo	ISSUED	\N	0B8A14D8D66462DFE9A6236E	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ms00e2100gfj3w3b8d	cmo5581uh002s100getua5cmv	cmo5573il00297b0kyp5up33v	cmo55815b0000100gwzv2dbyo	ISSUED	\N	C772AD908849E9FF96F97E0D	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mu00e4100g30qu2lus	cmo5581vo002w100g5qb3tmh1	cmo5573no002e7b0kjcd13s63	cmo55815b0000100gwzv2dbyo	ISSUED	\N	1028FAD69B40AB59C928F69A	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585mw00e6100gjoi6vwxg	cmo5581ws0030100g0zcx8ctt	cmo5573su002j7b0kkq6dcegm	cmo55815b0000100gwzv2dbyo	ISSUED	\N	34531BE4F811C035D4BE269A	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585my00e8100ggd112s8b	cmo5581xv0034100gf77ma6y6	cmo5573xy002o7b0kvv0svdv4	cmo55815b0000100gwzv2dbyo	ISSUED	\N	797FD6D87CC9059B9829FB7D	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585n000ea100g62oa0duj	cmo5581z20038100g9fpftbqm	cmo557432002t7b0kqdzw4iem	cmo55815b0000100gwzv2dbyo	ISSUED	\N	57F9AD51099C5844EB196C4A	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585n300ec100g18q2j5g7	cmo558207003c100g7vkly7uv	cmo55747z002y7b0kjz1fnu5l	cmo55815b0000100gwzv2dbyo	ISSUED	\N	59D7799AAB537AA709A4006B	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585n500ee100grreyal8d	cmo55821a003g100gfhjri1fs	cmo5574d100337b0k8afjwtmw	cmo55815b0000100gwzv2dbyo	ISSUED	\N	7253E373E75E6488565AD57C	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585n700eg100gkozpq6w0	cmo55822g003k100gpfy4pyd3	cmo5574i100387b0kfvaid90s	cmo55815b0000100gwzv2dbyo	ISSUED	\N	D1834BA915B010B6CE9C10A5	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585n800ei100guzty5thm	cmo55823l003o100grhuj8yq0	cmo5574ml003d7b0kmjtbuqrf	cmo55815b0000100gwzv2dbyo	ISSUED	\N	2DF14CD77CF944A1FD4C7331	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585na00ek100g0rr244yg	cmo55824r003s100gpbe7yjiw	cmo5574rj003i7b0k5ydw3yif	cmo55815b0000100gwzv2dbyo	ISSUED	\N	8D095C2B774B98D7F8721FA1	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nc00em100g3kqlanx7	cmo55825v003w100gr0ufhhzz	cmo5574wj003n7b0kbx2zukgw	cmo55815b0000100gwzv2dbyo	ISSUED	\N	CB7F82691D518D45F66988F1	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ne00eo100gw3wljeb9	cmo5582710040100gsunqaf8k	cmo55751l003s7b0kegzjo4yy	cmo55815b0000100gwzv2dbyo	ISSUED	\N	890AAAA96FA5DCEC2CE6EA6B	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ng00eq100g3ik0cyl0	cmo5582850044100gdlaw97qp	cmo55756n003x7b0kgjzb3ett	cmo55815b0000100gwzv2dbyo	ISSUED	\N	EDFDF32927ACD0159407DFA6	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ni00es100gsmv60unx	cmo5582990048100g83xl6i50	cmo5575br00427b0kv8okh7mt	cmo55815b0000100gwzv2dbyo	ISSUED	\N	697A1BEE060EFACF074180D8	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nk00eu100g5zniz6gz	cmo5582ad004c100g6uswrw72	cmo5575gu00477b0kdds9zlux	cmo55815b0000100gwzv2dbyo	ISSUED	\N	C38B2E394F88DD4238655277	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nm00ew100gmn9pqfor	cmo5582bk004g100ggav24yps	cmo5575lx004c7b0khlyxsksq	cmo55815b0000100gwzv2dbyo	ISSUED	\N	15E14B95ADDF6D15727ED7F5	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nn00ey100gqetzbns1	cmo5582cp004k100gwmgr2c81	cmo5575r0004h7b0kyajvdogu	cmo55815b0000100gwzv2dbyo	ISSUED	\N	AA498C6A9FBE29B68D0A134F	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585np00f0100giiymovmd	cmo5582ds004o100gfg6we2jr	cmo5575w8004m7b0ket3hahgg	cmo55815b0000100gwzv2dbyo	ISSUED	\N	6B42391F890F31107B23A053	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nr00f2100g1b1hg6hz	cmo5582ew004s100grvomo1d7	cmo557618004r7b0ky72og9g1	cmo55815b0000100gwzv2dbyo	ISSUED	\N	50BBB6A4104187C4C5B2C749	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nt00f4100gdhz5xjsq	cmo5582g0004w100gxnjd6ev6	cmo55766a004w7b0kwqeixmek	cmo55815b0000100gwzv2dbyo	ISSUED	\N	4572E2ABA061217D5A4445F4	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nu00f6100g1omczgq9	cmo5582h60050100gr5owf3rs	cmo5576ba00517b0kuw8icfyf	cmo55815b0000100gwzv2dbyo	ISSUED	\N	B4638EAEE916E5299D88B66F	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585nw00f8100gq4h0tfhz	cmo5582ia0054100gaujiejtb	cmo5576g800567b0k51959kbc	cmo55815b0000100gwzv2dbyo	ISSUED	\N	D140BEBB13A95D1DB1553A8E	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ny00fa100gp7q0rp14	cmo5582je0058100gpmqxj98a	cmo5576l9005b7b0koj92tvkz	cmo55815b0000100gwzv2dbyo	ISSUED	\N	D8F39B417AC52AF8500DE6FE	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585o000fc100gevfpvwbw	cmo5582kj005c100g5zvto7qv	cmo5576qa005g7b0kne60f97z	cmo55815b0000100gwzv2dbyo	ISSUED	\N	C500AC346FFBB3652895071B	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585o200fe100g8ugfaqmo	cmo5582lo005g100g8lm8jloo	cmo5576vf005l7b0k17daxswb	cmo55815b0000100gwzv2dbyo	ISSUED	\N	55B39BA40690FE13A96C73B8	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585o300fg100g1n9j585y	cmo5582ms005k100g5ygbnp8k	cmo55770e005q7b0kojljgpyn	cmo55815b0000100gwzv2dbyo	ISSUED	\N	BE24678F92991AF9FF6AFDB4	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585o500fi100ggyy19uyw	cmo5582ny005o100g40vgx0q9	cmo55775f005v7b0kp059dzs8	cmo55815b0000100gwzv2dbyo	ISSUED	\N	32BE5630CC64C4B195DA5204	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585o600fk100gf9g0748s	cmo5582p3005s100gqervwapd	cmo5577ae00607b0klevd0zfm	cmo55815b0000100gwzv2dbyo	ISSUED	\N	AF94AECB9AC6A18BBC13554C	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585o800fm100gmpfu13st	cmo5582q9005w100gzf0xrnl0	cmo5577fg00657b0kdllzm67d	cmo55815b0000100gwzv2dbyo	ISSUED	\N	EBD9E843007117F37D2E9CF9	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585o900fo100gznv3gskn	cmo5582re0060100gkr433x16	cmo5577ki006a7b0kolz2x63s	cmo55815b0000100gwzv2dbyo	ISSUED	\N	E927A88923D3B5D4122AA917	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ob00fq100giivdu7p7	cmo5582sj0064100g71g8pfiu	cmo5577po006f7b0ksfb43ija	cmo55815b0000100gwzv2dbyo	ISSUED	\N	4434236220F6D72BA026EFDD	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585od00fs100g7cluio2k	cmo5582tp0068100gcgp4gr6s	cmo5577ur006k7b0kfacbbmvs	cmo55815b0000100gwzv2dbyo	ISSUED	\N	B1D5BF9E5E6E60FFB4168374	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585of00fu100gc8rd6lcf	cmo5582us006c100gzslk9140	cmo5577zt006p7b0k9z0eskqe	cmo55815b0000100gwzv2dbyo	ISSUED	\N	1B6BDCDC2C24605438D49701	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585oh00fw100gjclnrh53	cmo5582vz006g100g879pxom0	cmo55784y006u7b0kwklcko95	cmo55815b0000100gwzv2dbyo	ISSUED	\N	86936B27A5731FF4F46CE276	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585oj00fy100g4fbi5ns5	cmo5582x5006k100gryb6a8f5	cmo5578a0006z7b0kmhakzq2j	cmo55815b0000100gwzv2dbyo	ISSUED	\N	9CF861C6AD21B0B640A0283B	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo5585ok00g0100g9wo2ygtd	cmo5582ya006o100gquy8sumk	cmo5578f200747b0k5coxzwrn	cmo55815b0000100gwzv2dbyo	ISSUED	\N	9E6C9C7257E534DEC13F77B3	2026-04-19 02:24:55.65	2026-04-19 02:24:55.65
cmo558a3d00t2100g6tkzmji6	cmo5585yn00h9100gvyufdfez	cmo5578k700797b0kqu1qxb4n	cmo5585r700g1100gkoseur2n	ISSUED	\N	397A4C87DE6D17087BC2D878	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3i00t4100gq6spe7uh	cmo5585zt00hd100g9l4977wb	cmo5578p8007e7b0kgfjxbq0n	cmo5585r700g1100gkoseur2n	ISSUED	\N	3C861F24A49881101965A636	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3l00t6100gg1iabthr	cmo55860x00hh100g59ns5ceu	cmo5578ud007j7b0k63etegp0	cmo5585r700g1100gkoseur2n	ISSUED	\N	A4419576BD4D0BA43847AB83	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3o00t8100g574aq9o0	cmo55862200hl100g08b15ed9	cmo5578zi007o7b0kxmwvaz05	cmo5585r700g1100gkoseur2n	ISSUED	\N	97F105709CA3636A1FFBBF7F	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3q00ta100gxtcpep32	cmo55863900hp100g4y9cn2mb	cmo55794d007t7b0ki7masp1n	cmo5585r700g1100gkoseur2n	ISSUED	\N	A615FCA9B5A4B5308EC86906	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3t00tc100gateuj933	cmo55864b00ht100gsx7g65xt	cmo55799e007y7b0ktg6p3sqa	cmo5585r700g1100gkoseur2n	ISSUED	\N	8FBA70B6B3B2EA9AB0D06F81	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3v00te100gcdc31ejg	cmo55865e00hx100g52ajgw4e	cmo5579ei00837b0kiniospxb	cmo5585r700g1100gkoseur2n	ISSUED	\N	85BF8502C8304E5916D33DD5	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3x00tg100g4qb4qyr0	cmo55866i00i1100gjrhwv2vs	cmo5579jk00887b0k636izhc1	cmo5585r700g1100gkoseur2n	ISSUED	\N	E49C4DB7406F509A958CEEB7	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a3z00ti100g56uxp89k	cmo55867l00i5100gfawx9w2d	cmo5579oh008d7b0ksb0n73x5	cmo5585r700g1100gkoseur2n	ISSUED	\N	513C7B122D624C1131BAC3EB	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4000tk100gvy3mjkhl	cmo55868q00i9100gv95ikcy2	cmo5579tg008i7b0k1kw4muf6	cmo5585r700g1100gkoseur2n	ISSUED	\N	56DAD5D8B60F7FE007808D65	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4200tm100gif10tr93	cmo55869u00id100g5waugjc4	cmo5579yn008n7b0k7q7hq42b	cmo5585r700g1100gkoseur2n	ISSUED	\N	8FF2F270FC3E097EEE487E0C	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4400to100gch3fywxw	cmo5586ax00ih100gwdumcnhr	cmo557a3q008s7b0kura2pryz	cmo5585r700g1100gkoseur2n	ISSUED	\N	B09F6108C1A389364004C68B	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4500tq100g56ioi4c6	cmo5586c100il100gzo7ehlj9	cmo557a8r008x7b0kumxiysoo	cmo5585r700g1100gkoseur2n	ISSUED	\N	C28DBDC70F2E4E2C5198AC56	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4600ts100g34wakhuj	cmo5586d500ip100gp012cgg8	cmo557ads00927b0knmecarda	cmo5585r700g1100gkoseur2n	ISSUED	\N	98C093EE722F3A926A6EE783	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4700tu100g9zkxd2pt	cmo5586ea00it100gwy8aedwd	cmo557ais00977b0kx4e4gspx	cmo5585r700g1100gkoseur2n	ISSUED	\N	7EBEFD9FB1584BC50519E977	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4700tw100gmpzd386y	cmo5586fd00ix100g533t8cow	cmo557anm009c7b0ki1jnb0li	cmo5585r700g1100gkoseur2n	ISSUED	\N	143971D457853984E4FC042F	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4800ty100gx6f3s050	cmo5586ge00j1100ge6mxbhsc	cmo557ask009h7b0k0o9bciu0	cmo5585r700g1100gkoseur2n	ISSUED	\N	13873E10D4EB7A0D46C4A220	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4a00u0100ghi8ycuyt	cmo5586hj00j5100gpd6a3ngv	cmo557ay3009m7b0kvf5e8dzf	cmo5585r700g1100gkoseur2n	ISSUED	\N	C5980D7A85EAA1C4CD21857D	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4b00u2100gh2lj2ff7	cmo5586im00j9100gcpjc03u1	cmo557b2q009r7b0ko262ufn9	cmo5585r700g1100gkoseur2n	ISSUED	\N	1DC555A613E90D088AC63ABA	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4d00u4100gn652tmq4	cmo5586jr00jd100ggql43zcv	cmo557b7r009w7b0kbwfm7b3j	cmo5585r700g1100gkoseur2n	ISSUED	\N	8A1FBFB75F4A144F689649A0	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4e00u6100gdxptckqp	cmo5586kv00jh100ggd10xrxe	cmo557bcs00a17b0kr5nkw7r1	cmo5585r700g1100gkoseur2n	ISSUED	\N	561DA591CAAD1EE3288BED35	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4f00u8100gscc8pqus	cmo5586ly00jl100g6c7d8ebq	cmo557bhs00a67b0k0skmm3d3	cmo5585r700g1100gkoseur2n	ISSUED	\N	B4BDEC9908FA77EC6CB1D2C3	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4g00ua100g9kkhov2a	cmo5586oq00jt100gqoyof6aj	cmo557bs000ag7b0ka8y4wcev	cmo5585r700g1100gkoseur2n	ISSUED	\N	F9C7704ABA7B71C2DFC32FFF	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4h00uc100gzn1ynjl6	cmo5586pv00jx100geil7tvqw	cmo557bwz00al7b0kgepa3vbg	cmo5585r700g1100gkoseur2n	ISSUED	\N	4062715A7CED7C95DE2F6739	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4i00ue100gvd0ev5jh	cmo5586qz00k1100gw8ndmef6	cmo557c2100aq7b0k71nd79qr	cmo5585r700g1100gkoseur2n	ISSUED	\N	A9E3D6AFCCAA5AC052B9F777	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4j00ug100g6zxj5xc0	cmo5586s400k5100gk2m6y5he	cmo557c7300av7b0kzqcqzhuv	cmo5585r700g1100gkoseur2n	ISSUED	\N	F24083C31E8F031507218D3A	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4k00ui100g6ce49mjt	cmo5586ta00k9100g6zclnyks	cmo557cc900b07b0ku0k62661	cmo5585r700g1100gkoseur2n	ISSUED	\N	6CBBF5EF3E43CAA7198917B9	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4l00uk100gb27dcf09	cmo5586ub00kd100gpnziacif	cmo557cjc00b57b0kqsqn55ze	cmo5585r700g1100gkoseur2n	ISSUED	\N	F84E35387EA0524F3F3E95FC	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4m00um100g23ssyb1c	cmo5586vc00kh100g4nck8hls	cmo557cp300ba7b0kvn837k55	cmo5585r700g1100gkoseur2n	ISSUED	\N	0AB12E24ECA411D0972FA53D	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4n00uo100g14u27qbk	cmo5586wd00kl100gkftepn4k	cmo557cu300bf7b0kx9dxt6e7	cmo5585r700g1100gkoseur2n	ISSUED	\N	5A48D98D692F56D463591AC3	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4o00uq100g0ism3rng	cmo5586xi00kp100gt3h0p00c	cmo557cys00bk7b0kiielhxzt	cmo5585r700g1100gkoseur2n	ISSUED	\N	1E71859AD013362B1AE73009	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4p00us100got4m3fjf	cmo5586ym00kt100g8al5xj88	cmo557d3x00bp7b0k2jjgus02	cmo5585r700g1100gkoseur2n	ISSUED	\N	2F3EB766647E020392C9ED02	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4q00uu100gytv4rfq0	cmo5586zr00kx100gotxpwydo	cmo557d9400bu7b0k35ahh0vw	cmo5585r700g1100gkoseur2n	ISSUED	\N	8D9E201A88898EFFCCB4BB62	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4r00uw100go796wtvs	cmo55870t00l1100g7v258i0s	cmo557def00bz7b0k05s9niu5	cmo5585r700g1100gkoseur2n	ISSUED	\N	2A8B079BB3D540712AD3F941	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4s00uy100gy4f7zdlj	cmo55871x00l5100gk61got6n	cmo557djn00c47b0kusw3z20q	cmo5585r700g1100gkoseur2n	ISSUED	\N	1D42B94DE660323E22DC7902	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4t00v0100gwrdqc6oi	cmo55873200l9100gwiuxcbho	cmo557doq00c97b0krpxcvkvk	cmo5585r700g1100gkoseur2n	ISSUED	\N	BAA41A8180D87EB09C4125D6	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4u00v2100g5kmqkyzl	cmo55874600ld100g14uv2td2	cmo557dtv00ce7b0kc384rbtl	cmo5585r700g1100gkoseur2n	ISSUED	\N	F26F0411B6B1646A537E583B	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4v00v4100gvf8a6bav	cmo55875t00lh100g3udoes1b	cmo557dyx00cj7b0kfph6iiov	cmo5585r700g1100gkoseur2n	ISSUED	\N	18023E2750E25F9BC313F73E	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4w00v6100gnf6ec0g2	cmo55876z00ll100g9754b65a	cmo557e4700co7b0kd2pnicoe	cmo5585r700g1100gkoseur2n	ISSUED	\N	625A8BE11E4D55F97714870D	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4w00v8100gzm4yhkxf	cmo5586nm00jp100gp57wmvij	cmo557bmx00ab7b0kikcmojuy	cmo5585r700g1100gkoseur2n	ISSUED	\N	92E6EBBD8AB0DA4B2FD57952	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4x00va100ghu7wf46u	cmo55878300lp100g3uk1einv	cmo557e9a00ct7b0ktrojio27	cmo5585r700g1100gkoseur2n	ISSUED	\N	2DACF9A13DA52AE7CB51BBC0	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4y00vc100ggwyvdd3s	cmo55879900lt100g85hjb0ct	cmo557eee00cy7b0knuk1wn5o	cmo5585r700g1100gkoseur2n	ISSUED	\N	89A896953A4084FF298BE6A5	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a4z00ve100gy9x41z4p	cmo5587ae00lx100gfd9p3m5i	cmo557ejd00d37b0ki6m5bywd	cmo5585r700g1100gkoseur2n	ISSUED	\N	78DFB6924FA3B3CD8FB764D5	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a5000vg100gxsygm2th	cmo5587bj00m1100g7milvt99	cmo557eog00d87b0k0ghqgjbj	cmo5585r700g1100gkoseur2n	ISSUED	\N	2490BBCF523491F17600C212	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a5100vi100gcsnigx6p	cmo5587co00m5100gbzjpz61s	cmo557etk00dd7b0kjohsyogv	cmo5585r700g1100gkoseur2n	ISSUED	\N	1853F43AC4AE1FA740F4C2FA	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a5200vk100gf5b8b418	cmo5587ds00m9100gsc0ry87f	cmo557eyr00di7b0ki25zagsl	cmo5585r700g1100gkoseur2n	ISSUED	\N	362FF3A4DB114C78517611BF	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a5300vm100gsqsm3aqh	cmo5587ex00md100gfhc6fxer	cmo557f3u00dn7b0kod1oq6g2	cmo5585r700g1100gkoseur2n	ISSUED	\N	5BCBFEBA98971E6A29FB8C4C	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a5400vo100gazm180o7	cmo5587g100mh100geor9j4rx	cmo557f8w00ds7b0km8qaj3kq	cmo5585r700g1100gkoseur2n	ISSUED	\N	40CE84560AC880758710A354	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a5500vq100gwekun17u	cmo5587h700ml100gjdzhs2fk	cmo557fdy00dx7b0kmyrsuqo5	cmo5585r700g1100gkoseur2n	ISSUED	\N	C1834F095AC15A5AD352FE9B	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558a5600vs100gq651q8x6	cmo5587ib00mp100gohc3flqk	cmo557fj600e27b0kmu5hibaw	cmo5585r700g1100gkoseur2n	ISSUED	\N	6638ED655E0DA546FF4A9280	2026-04-19 02:25:01.465	2026-04-19 02:25:01.465
cmo558el2019l100ggdci4sve	cmo558aej00x1100gjfolfv6j	cmo557fo900e77b0ke9zfa12t	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	7B70A576D3EE279554D0E368	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558el7019n100gvctfdvvs	cmo558afo00x5100gs3vm0lew	cmo557ftg00ec7b0kcmazt6m0	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	55249C25C182E524690D1AC5	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558ela019p100g4cdk5egy	cmo558agt00x9100gm5mvm6x1	cmo557fz300eh7b0k8wx9a1ml	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	02425C9721908DE83D0BEDA6	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elb019r100gnlxzxsp9	cmo558ahy00xd100gntftxvbq	cmo557g4o00em7b0kwsuhgib8	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	F5C4D7D6AC932BD55241D230	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558eld019t100g1tosvvux	cmo558aj300xh100g8z4tartm	cmo557g9u00er7b0kit44dx7h	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	51A96039CB12714CCD8073B8	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elf019v100grmrhsuu2	cmo558ak600xl100gjekjcvyc	cmo557ggh00ew7b0k40hv462g	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	D2F80EC3FB3DDC992188BE06	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elg019x100guq2k7d8u	cmo558al900xp100gv1j60uks	cmo557gm200f17b0k5y2cnzco	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	64ED1EF467B41F339BE42AA1	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elh019z100gv1zqx5l7	cmo558amd00xt100grcn8kif6	cmo557gr500f67b0k4oirdxy0	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	2D6D61B06E99CB80B9FABAC2	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558eli01a1100g5acs8ikq	cmo558anh00xx100gb5uxncxh	cmo557gw200fb7b0kuqfs96g3	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	3DE274F0C4F5ECC7883366ED	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elj01a3100g4cm1z47z	cmo558aol00y1100g48dofopy	cmo557h1700fg7b0kj56vcyx4	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	49B60408DAE66F9DF96432DA	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elk01a5100g7yue98in	cmo558apr00y5100g8nfpdh4h	cmo557h6h00fl7b0k7uz7uf06	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	B523FE06E3EEF77DA775A4E9	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558ell01a7100gdbejvdat	cmo558aqv00y9100g6ff3ursd	cmo557hbh00fq7b0k4s7i25n9	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	F2E178052587EE6B25EE9C46	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elm01a9100gd56bh91a	cmo558ary00yd100gcwijtegf	cmo557hgj00fv7b0kk12soz29	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	A1D45C2C31905036C9F8A8E0	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558eln01ab100gvdfjp11b	cmo558at300yh100gdbq8o492	cmo557hll00g07b0kani4bpyw	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	A8A850F276F69A0230076D81	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elo01ad100gsxbqo44u	cmo558au800yl100gv1z95usv	cmo557hqv00g57b0k1d2v0a6m	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	6979B5F7C1904966084AF5C7	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elp01af100gl096j82x	cmo558ave00yp100go8zycrnx	cmo557hw000ga7b0k3sdb881u	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	3EFC690BCCA78FD2A08916DF	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elp01ah100gwl35wakt	cmo558awi00yt100gy86m5xf4	cmo557i1000gf7b0kp6yh2vlz	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	9940FC00F006C4D0344D4BA0	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elq01aj100gzlrlzssc	cmo558axn00yx100g8codwgz8	cmo557i6600gk7b0kihbemw91	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	A201E7345548CDB1C45A82BA	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elr01al100g9sv145yc	cmo558ayn00z1100gj9la6en1	cmo557iay00gp7b0ktcm58kic	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	C42820C723FE2CFC0E86DFE1	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558els01an100g9ki6wu2a	cmo558b1k00zd100gx2p3yv2i	cmo557irb00h47b0kjdayxn8n	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	664079381D1B3CCC1F5BFF9A	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elt01ap100gqnig5eas	cmo558b2l00zh100g26ftnrgo	cmo557iw900h97b0ke1qhuof5	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	31A3ABCC308618FC00D3B5D7	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elu01ar100go9w5q0g7	cmo558b3o00zl100go66kmq7b	cmo557j1b00he7b0k7vn7huyx	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	765AE7F8B74D2F6AAF3A2031	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elv01at100ghvgmn0lp	cmo558b4v00zp100gammgk291	cmo557j6f00hj7b0k3wywe8f1	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	C86FA1283E49AD7AD93777E7	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elw01av100g4sommpsj	cmo558b5z00zt100gf7e8zq2b	cmo557jbl00ho7b0kt5f05uiv	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	F8C040740808B0C23654B520	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elx01ax100g9zq3647b	cmo558b7400zx100gh9yer8zb	cmo557jgm00ht7b0k0dte78bw	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	D8746BF8B13CFC5F5B99B5C8	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elx01az100gtvdhv4fw	cmo558b890101100g4jvjxrqx	cmo557jln00hy7b0k90dtt0wl	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	FB47F4920868AA4984C48C8F	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558ely01b1100g1ynpko6a	cmo558azo00z5100g1qqcngw8	cmo557ig100gu7b0ktczurfm0	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	AAF7FB8515469CFE5650B02A	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558elz01b3100gvmr2hhly	cmo558b0m00z9100g874y4oli	cmo557il600gz7b0kcp0gx5kg	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	8874205DB50D44171F845240	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em001b5100gug90i29z	cmo558b9f0105100gmjzl4trs	cmo557jqg00i37b0kl4s918bi	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	F18A8DE73BBFD1414A3243B6	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em101b7100goudta050	cmo558bak0109100ghs1mhijw	cmo557jvj00i87b0kzu8b3y5q	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	B0C15E7CEC74894491DA2ADA	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em201b9100g5830j7xf	cmo558bbp010d100g8l6f3oou	cmo557k0q00id7b0kiyizzm66	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	7259486EE4C9A552430E2666	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em201bb100gfi8o2jt3	cmo558bcw010h100gzt5veas6	cmo557k6900ii7b0kz59z58p6	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	8D075B31D016A5251576553A	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em301bd100gjhzsghuo	cmo558be2010l100gsrq5mihy	cmo557kav00in7b0kvr819xm1	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	362103E9B4487B4BD27E6B22	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em401bf100gp4bt9ou7	cmo558bf8010p100g9f7pnlgs	cmo557kfv00is7b0keethqpkw	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	7656B2082F594850A35AB838	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em501bh100gyyh321v4	cmo558bgd010t100gauzzm84z	cmo557kl800ix7b0kmp825bgx	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	A9BEC917DF066C3869707A9D	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em601bj100gwoictgtn	cmo558bhj010x100g4butgw7f	cmo557kqf00j27b0kfuug0kse	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	76C12ECFD83F63E48D7D7B29	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em701bl100gcu0bxo9r	cmo558bij0111100gr4ljt1jj	cmo557kvz00j77b0k185bppnq	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	2AD0E08E6E365850C4CF408A	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em801bn100gvrnxg3al	cmo558bjk0115100gys9c3qfv	cmo557l1d00jc7b0kgvzuo882	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	B50CE08D715B2D99F647B573	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em801bp100ghxsfvapu	cmo558bkj0119100gwjpg4jco	cmo557l6200jh7b0kru24b2xz	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	003D59B1073A20C8F98F4E29	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558em901br100gcaukh39w	cmo558bli011d100gocj6dqqh	cmo557lb900jm7b0kgkebn9y4	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	64819ADFD6556E3096073895	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558ema01bt100gng5rpf1f	cmo558bmk011h100ghk526qxv	cmo557lge00jr7b0kcryv2044	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	EF063687B573FA7856A98330	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emb01bv100ga7z8qmkc	cmo558bnp011l100gem3guymp	cmo557llv00jw7b0kdcw9d3r3	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	B8E08C5B4EFA26B9004E1872	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emc01bx100gqzqt4wnm	cmo558bos011p100gfmok7bzh	cmo557lr700k17b0k91md5id4	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	9317A5D263B802AC90A2F783	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emd01bz100gmhcun38u	cmo558bpw011t100gnind36ef	cmo557lwf00k67b0klnosqvfo	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	070BFAD913B58BBF30BA2DF9	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558eme01c1100g4cbemza5	cmo558br0011x100geq6p3c6y	cmo557m1n00kb7b0k010r1b82	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	2F0F3932AC0FFBFF5974376A	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emf01c3100gx8frkn00	cmo558bs50121100g3gjlm3pd	cmo557m7000kg7b0kucmgdcte	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	1540581B7FF89575BA737A3E	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emg01c5100g4k76tfi9	cmo558bta0125100g178c0urt	cmo557mc300kl7b0k0u5hs0ap	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	D0A17333E7C831AB5E686E2B	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emg01c7100g19q97di0	cmo558buf0129100gf9cd7p2z	cmo557mhd00kq7b0k7lg31xm8	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	78A4D6EBABB843311B698AE3	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emh01c9100g0ytt1xns	cmo558bvk012d100g38q3kkfa	cmo557mmh00kv7b0kuce8hh6r	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	D725CAC933738ADE0B260846	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558emi01cb100g1o2kqdn8	cmo558bwo012h100gpfntl5mm	cmo557mrn00l07b0k2c81hsoh	cmo558a7c00vt100gkftjgmsa	ISSUED	\N	4508FD8285DC41BD89CC6283	2026-04-19 02:25:07.286	2026-04-19 02:25:07.286
cmo558j2701pj100g9s7bm842	cmo558ew201dk100gbuubtka3	cmo557mwx00l57b0k9z24qbkl	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	02BCF28E39466DA6C97E080F	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2b01pl100g8ejpcsfr	cmo558ex801do100gcfu3vhri	cmo557n2100la7b0kju9en5sb	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	C246B2370998D3B1F8602A6D	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2e01pn100ggb8esale	cmo558eyd01ds100gebd5lhpw	cmo557n7400lf7b0kw1218vlt	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	43A54CBB8C89129870CDEB98	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2g01pp100gzcdfpmj9	cmo558ezi01dw100g6vs8j5cq	cmo557nc700lk7b0kzww6wx2e	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	6C0AA9D2933676AF11C6DBAE	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2i01pr100gf54uc7qg	cmo558f0n01e0100gdgktp8bt	cmo557nhc00lp7b0kw7dai5g6	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	9BD79F9255BCC9B2DD68B9BC	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2k01pt100gbs30gbqf	cmo558f1t01e4100gnmkegn1j	cmo557nmf00lu7b0kjrdjn743	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	152DBA506570285AE3637418	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2m01pv100gcc302usu	cmo558f2x01e8100gb21sd5lr	cmo557nrg00lz7b0kcasnmdvc	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	0D725EC2F1FB726CAB5DF1E0	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2o01px100g2gp3lqv5	cmo558f4101ec100g0dtn7a5m	cmo557nwi00m47b0kfd29d73k	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	966F4974D375B5F6B5ECA04F	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2q01pz100gfvvd0sac	cmo558f5501eg100gg1uo99ku	cmo557o1l00m97b0kbpc6t7nm	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	C81E6898D30524ABD0A943B0	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2s01q1100gy9n8g74l	cmo558f6901ek100g4jpijdw2	cmo557o6n00me7b0k78fhb0k5	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	00C7C3A2D94EFBBAD11D350D	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2u01q3100gbxjgag0c	cmo558f7d01eo100gldaa3xd9	cmo557obw00mj7b0k5pzx9w36	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	C5DCF6DF3E6C3CAA113AEC5E	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2w01q5100gfjmmbg4h	cmo558f8j01es100gn7zuq6ch	cmo557ogs00mo7b0kc67x7k0i	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	107E5B68F7502C4218CF5206	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j2y01q7100g33rsceyb	cmo558f9p01ew100g9xbncwg9	cmo557olp00mt7b0kjxf1w5lt	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	4A47B14050416DBA73DECFAC	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3001q9100g2snkj56z	cmo558fau01f0100gx3p0qr2x	cmo557oqo00my7b0kekoo7snp	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	B42D75E3861379F0EAA61C1D	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3201qb100g5dli69i8	cmo558fby01f4100glwpanmbd	cmo557owd00n37b0k96pwtt86	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	082FD9E4EBDE5D3741BA220F	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3301qd100gce3gy533	cmo558fd101f8100gzsr8cvek	cmo557p1k00n87b0kznlszabt	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	9D75E47348AE48DE16E49F33	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3501qf100g0na7c65a	cmo558fe501fc100gpl8qt9tq	cmo557p6700nd7b0ku6rdvxlv	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	4B3C3937948B7458275D451C	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3801qh100gnl561ttu	cmo558ff601fg100g78olyeip	cmo557pb800ni7b0krdgjttot	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	0785378F9D7108AD6162A7EA	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3a01qj100g2lfpi896	cmo558fg601fk100gbhr4oy85	cmo557phb00nn7b0k0iqa5nxc	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	BA5F3E265AE0E3175E2E3243	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3c01ql100g4kbk63z1	cmo558fh701fo100gy2v63buk	cmo557pmi00ns7b0kzqav8xfj	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	52DF2929C6ECAD2182CA598D	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3e01qn100gv61n8vo9	cmo558fib01fs100ghbuyd3zh	cmo557prm00nx7b0ks4xdwk7z	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	BD88566F2D4D51E998236B52	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3f01qp100gggcvsb5r	cmo558fjb01fw100gex2fv60s	cmo557pws00o27b0kcxns2k0z	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	9EB5AFD5A2B783D2B9C1C0B7	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3h01qr100gpo7onst0	cmo558fkb01g0100gm1b1i036	cmo557q1i00o77b0k8783jbnc	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	45DEF594008FCB2F2C8A9542	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3j01qt100gnpnhtjvz	cmo558fla01g4100gazr9iygq	cmo557q6f00oc7b0k3y8was5x	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	00E973AD3899DC26402ED160	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3k01qv100gb10xjah9	cmo558fm801g8100gryva7ved	cmo557qbo00oh7b0kdb0mb8av	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	EC615EE293816EC1345A1226	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3m01qx100gc2k9x37l	cmo558fn601gc100glc7b36l1	cmo557qgf00om7b0kw6i0fijv	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	2CAC942CB7B418B62C1C452B	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3o01qz100gj83q7ift	cmo558fo601gg100g0whmgrqw	cmo557qlc00or7b0kjzjnla31	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	02B3F081810A86F8FE779288	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3q01r1100gyd9ok6hj	cmo558fp701gk100gm652ns8o	cmo557qqe00ow7b0k1llohmfo	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	C5AB8AB7F6E67B0406575A80	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3t01r3100ghwju6lkk	cmo558fqc01go100g7oyuluu7	cmo557qvg00p17b0kbvs44rl3	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	227774C9029C0F09B0D5E942	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3v01r5100g6pn0jbld	cmo558fri01gs100gnagwuzy0	cmo557r0i00p67b0k045twbt7	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	CF56A56624FBA33F2FA40765	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3x01r7100ggs9mn2kt	cmo558fsm01gw100gqwt04fbk	cmo557r5q00pb7b0kuc91ln3z	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	DDAC2270ED13B84AE6357813	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j3z01r9100gf2ho86vj	cmo558fts01h0100greq2txb3	cmo557ras00pg7b0kf375867f	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	D50956B619F046F4C899EEB6	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4101rb100gkfxo4266	cmo558fuw01h4100g4vnnv019	cmo557rfn00pl7b0kej55y9bk	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	628CDE2854CD672E5090AA07	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4201rd100g8v68yx0s	cmo558fw101h8100gr53x58od	cmo557rkr00pq7b0kbbtj1zwa	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	CF1C864E8F5B3A3A242B25DC	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4401rf100gzx833wdq	cmo558fx501hc100gdcex1mqw	cmo557rpw00pv7b0kvh4xon07	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	5DD98593C6115DD9C390E9B3	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4701rh100g6bq12016	cmo558fya01hg100ggix4wsgk	cmo557rux00q07b0k3h7jj7k3	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	575A88623EAA3F8988781DFC	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4801rj100gbf7h4b58	cmo558fzf01hk100gccemxgxo	cmo557s0800q57b0k5c2vn2s6	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	BECCBA723B458922EAE578E1	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4a01rl100gp4d4hht8	cmo558g0m01ho100ga4b60nk7	cmo557s4t00qa7b0kvz050jin	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	E2C81F2796803264D73CB087	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4c01rn100gxcn0pc5b	cmo558g1q01hs100g2wmxnqqv	cmo557s9r00qf7b0kv2j9wc4e	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	C7D01018B544A3EC7BF79445	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4d01rp100gyzp2pmts	cmo558g2w01hw100ghpmpmwwj	cmo557seu00qk7b0kjzngc5jp	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	A191BB4A8F06EE87596D8D46	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4f01rr100gx8egyj7j	cmo558g4001i0100gxj9uaf6r	cmo557sjy00qp7b0kcbixu68x	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	D510990B32BA8627FA053FB1	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4h01rt100gu25q1pwq	cmo558g5401i4100ggmpnk1vw	cmo557sp400qu7b0k6g4ofhl0	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	338CF788EEB1D246DE9CBE58	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4i01rv100gffcd4rr1	cmo558g6801i8100gplqcji02	cmo557su500qz7b0k1800gjp0	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	F2F8702E245D8752F85931FF	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4k01rx100g2skh47jq	cmo558g7d01ic100gtqb5eo8i	cmo557szb00r47b0k09i82w3t	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	C13D68F09102733955136FBD	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4m01rz100gtfktpn7e	cmo558g8h01ig100gt1tnpb9c	cmo557t4r00r97b0konzo0g13	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	53E19AE419C0770128EDE7DF	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4o01s1100gb2azy8mo	cmo558g9m01ik100g0roowib3	cmo557t9u00re7b0kijdp5m56	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	C869A54DE29A070267ABE471	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4p01s3100gtupg1jrn	cmo558gap01io100gryn9n9z0	cmo557tez00rj7b0kiw7z270r	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	A7214E046EC074999F3C46C7	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4r01s5100g7xpf8c2q	cmo558gbt01is100gchq7ala5	cmo557tk200ro7b0k0q0bhpn0	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	B3AD2623F907CED38F2C7A64	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4s01s7100g4zpvy3ba	cmo558gcx01iw100guwc4dny4	cmo557tp800rt7b0ks8pu88qg	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	CCF7109DEDD7903C6D0771F8	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558j4u01s9100gdruvpbpf	cmo558ge301j0100giv3qs821	cmo557tub00ry7b0k39n9mopk	cmo558eoo01cc100g1zgfdf9a	ISSUED	\N	FB0E67D1689FE8C5D624E712	2026-04-19 02:25:13.086	2026-04-19 02:25:13.086
cmo558nmf025q100gmqa0f2fp	cmo558jef01ti100gpf100hzj	cmo557tze00s37b0knxgb0zgq	cmo558j7801sa100gb8g19tm3	ISSUED	\N	6054F058FC2E9D3A5F4C48D3	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nmj025s100gjdnaduqm	cmo558jfk01tm100ghjyefpxv	cmo557u4j00s87b0kojl3s945	cmo558j7801sa100gb8g19tm3	ISSUED	\N	1A12D5B82E550F5D8AE0ACAA	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nmn025u100gwrpwj8b7	cmo558jgq01tq100g3cm5lb6d	cmo557u9r00sd7b0kuzobggoq	cmo558j7801sa100gb8g19tm3	ISSUED	\N	14B3681BD88E5A59AA00E600	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nmq025w100g8e2appug	cmo558jhw01tu100g24itup4k	cmo557uet00si7b0kvne2djec	cmo558j7801sa100gb8g19tm3	ISSUED	\N	ADE843430A0C36217FCAD3FD	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nmt025y100gcomn0hx0	cmo558jj201ty100g3bvg8sas	cmo557ujv00sn7b0kg8pxfsox	cmo558j7801sa100gb8g19tm3	ISSUED	\N	1698B859896D650E09C6EBBD	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nmv0260100gvn0m9vvu	cmo558jk801u2100ghu4hxqqv	cmo557uoy00ss7b0kql7bfvw8	cmo558j7801sa100gb8g19tm3	ISSUED	\N	9BF8CD3D7544B1AB464FA7A0	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nmz0262100g5hch0goq	cmo558jmk01ua100gi68c1onb	cmo557uz300t27b0k6t32lb5v	cmo558j7801sa100gb8g19tm3	ISSUED	\N	D9BC06B1977B3068B13DAA35	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nn20264100geghx26mc	cmo558jnp01ue100g43lr5ix4	cmo557v4800t77b0k2mc5rfic	cmo558j7801sa100gb8g19tm3	ISSUED	\N	7D2416C3DED87704A4822575	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nn50266100gyawywkk9	cmo558jox01ui100gousqdl0g	cmo557v9a00tc7b0k18ly995s	cmo558j7801sa100gb8g19tm3	ISSUED	\N	3ADE8F23AF9D983C12EEC0BB	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nn70268100glyd68l2y	cmo558jq501um100gi3qx3atz	cmo557vee00th7b0kqnj7luvr	cmo558j7801sa100gb8g19tm3	ISSUED	\N	43DBA189658EAD10FEC74E3A	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nna026a100ge50bl6b7	cmo558jr901uq100grc89b840	cmo557vjj00tm7b0kz8gnhpct	cmo558j7801sa100gb8g19tm3	ISSUED	\N	4EDF8E3F5BF18349BAAE9F41	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnc026c100gz7l2xgx1	cmo558jsf01uu100gppejnptr	cmo557von00tr7b0kpw9dyaf2	cmo558j7801sa100gb8g19tm3	ISSUED	\N	FCA1B4BDFE00E61376195237	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nne026e100grsclbyro	cmo558jtj01uy100gpeuk3ggr	cmo557vup00tw7b0kka2z577m	cmo558j7801sa100gb8g19tm3	ISSUED	\N	FD5F2CABADDA3CEDECE8E6EE	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nng026g100ggvkixcro	cmo558jup01v2100gega0sqbc	cmo557w0200u17b0ka55u5wp5	cmo558j7801sa100gb8g19tm3	ISSUED	\N	62EB812315026571D6671D8E	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnj026i100g4g0r977b	cmo558jvw01v6100g5wheu0u3	cmo557w5600u67b0krc3w0c51	cmo558j7801sa100gb8g19tm3	ISSUED	\N	7B2B3518F79F4E6FB843698D	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnl026k100ggb6ip7id	cmo558jx201va100gp7n79qh9	cmo557w9z00ub7b0k51iu0w8p	cmo558j7801sa100gb8g19tm3	ISSUED	\N	FBD3618369E4525CFA0080CD	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnn026m100g5v8nqxuy	cmo558jy701ve100gufipieuj	cmo557wf100ug7b0kb984024b	cmo558j7801sa100gb8g19tm3	ISSUED	\N	BEA300F0FA720BD0664FE318	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnp026o100gjr2fje7g	cmo558jzc01vi100g3yspayqs	cmo557wk700ul7b0kz02m7bt9	cmo558j7801sa100gb8g19tm3	ISSUED	\N	0E5538D00A7E0EAAD9F0578A	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnr026q100gs9z3ofiz	cmo558k0f01vm100gjhyj5ald	cmo557wpj00uq7b0kwopo3104	cmo558j7801sa100gb8g19tm3	ISSUED	\N	ABE207150BC39B236936329E	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nns026s100gzwhhzc2k	cmo558k1i01vq100gtdr46gqy	cmo557wuo00uv7b0k4im8bj0e	cmo558j7801sa100gb8g19tm3	ISSUED	\N	AFA261850CDB8BA337423BF3	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnu026u100g1qjlupg1	cmo558k2n01vu100giy9tvu56	cmo557wzr00v07b0kjf3w2l23	cmo558j7801sa100gb8g19tm3	ISSUED	\N	E0FF28B2E97B40BA458B6E99	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nnw026w100grc1c5pbo	cmo558k3u01vy100gdbqrxv7e	cmo557x4v00v57b0ka29aheyo	cmo558j7801sa100gb8g19tm3	ISSUED	\N	D0AB24220943A14C36F2C47E	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nny026y100gxxawa7sw	cmo558k4z01w2100gp3v5ev5k	cmo557xa300va7b0kdaoph27t	cmo558j7801sa100gb8g19tm3	ISSUED	\N	A9A52A220863AF5D8A196FEF	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558no00270100gs06qd8oc	cmo558k6401w6100gv7ivamq2	cmo557xf600vf7b0k6nf325ws	cmo558j7801sa100gb8g19tm3	ISSUED	\N	D73C14CA506195D4E58BF506	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558no20272100gb1emsssm	cmo558k7a01wa100go9mzl4cy	cmo557xke00vk7b0kydwbgsas	cmo558j7801sa100gb8g19tm3	ISSUED	\N	387ECC095D79E4E7E49222A9	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558no40274100g1a8nynb1	cmo558k8i01we100g5dqyj9xy	cmo557xp400vp7b0k9gem5k8b	cmo558j7801sa100gb8g19tm3	ISSUED	\N	DC9A537F82F00CB316917F6A	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558no60276100gsmzczhkl	cmo558k9o01wi100gpjnr508b	cmo557xu900vu7b0kp3g098mx	cmo558j7801sa100gb8g19tm3	ISSUED	\N	AFDCA7FBE36C0E12CA054191	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558no80278100gs4g20zun	cmo558kat01wm100gtj9671oa	cmo557xzc00vz7b0kmmboa9u5	cmo558j7801sa100gb8g19tm3	ISSUED	\N	566FAF30094E3CAB60BECCB2	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558no9027a100ggszjmpd7	cmo558kbz01wq100gcc0952ot	cmo557y4p00w47b0kcy626bah	cmo558j7801sa100gb8g19tm3	ISSUED	\N	4833A235E96CCF8D76B52E8D	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nob027c100gjv8hd2up	cmo558kd301wu100ggv39jbwy	cmo557y9j00w97b0kz60mqb0x	cmo558j7801sa100gb8g19tm3	ISSUED	\N	993E3DCA0199B6814AF5A043	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nod027e100gbpr5r9fc	cmo558kec01wy100ge64hb0zx	cmo557yen00we7b0kgagknyrb	cmo558j7801sa100gb8g19tm3	ISSUED	\N	1916F486481CCE18BAC4DBD6	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nof027g100g6o518vug	cmo558kfh01x2100gwylx1hzr	cmo557yjr00wj7b0k93g5v46t	cmo558j7801sa100gb8g19tm3	ISSUED	\N	C16670E255A23EEF143F6223	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558noh027i100gllhp7m15	cmo558kgo01x6100ge5j3vc6l	cmo557yot00wo7b0ker1evt5a	cmo558j7801sa100gb8g19tm3	ISSUED	\N	79F6C0E1CD886DEFB7D82EEB	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nok027k100g9yfhltju	cmo558khs01xa100gb22at26s	cmo557ytx00wt7b0ku3vsvi6i	cmo558j7801sa100gb8g19tm3	ISSUED	\N	1890B57C7CECF4405B01CF91	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nom027m100gbj2b0vgu	cmo558kiy01xe100g1suv0mx8	cmo557yz200wy7b0kukfrukpk	cmo558j7801sa100gb8g19tm3	ISSUED	\N	9688B8E82F5FB0CD4170E2BF	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558noo027o100gefz14dta	cmo558kk201xi100gfyoxdnxg	cmo557z4700x37b0k193jisw5	cmo558j7801sa100gb8g19tm3	ISSUED	\N	DF48C7FDFE93D8BE675C9E8D	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558noq027q100gbasdo7gt	cmo558kl701xm100g02qeyfwe	cmo557z9600x87b0kxla3zvl5	cmo558j7801sa100gb8g19tm3	ISSUED	\N	927A4807EAC293E542B3E93E	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nor027s100guhlce5rx	cmo558kmd01xq100gygb1j38f	cmo557zed00xd7b0kqrsc0fb2	cmo558j7801sa100gb8g19tm3	ISSUED	\N	6D8C884A6DB71A2374DA938A	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558not027u100gmyd08pbh	cmo558jle01u6100ggsr1egu4	cmo557uu000sx7b0krwou7vvt	cmo558j7801sa100gb8g19tm3	ISSUED	\N	DFE1F3211C10BA61F270C1C9	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558nov027w100gvrwwkl3d	cmo558kni01xu100gyxwbvq7c	cmo557zji00xi7b0k56gau7l9	cmo558j7801sa100gb8g19tm3	ISSUED	\N	75A410805B895C2CE7B3AB97	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558now027y100g473ah99e	cmo558kot01xy100gzi671glw	cmo557zop00xn7b0k39c3nzfg	cmo558j7801sa100gb8g19tm3	ISSUED	\N	D1E1154C327FAB69D11552B7	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558noy0280100gd2809iam	cmo558kpw01y2100gi17iz11y	cmo557zu900xs7b0kbb2lyyc3	cmo558j7801sa100gb8g19tm3	ISSUED	\N	66AF65E56DBF43FE87E8BFE6	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558np10282100gl5s3hh2k	cmo558kqz01y6100glnw7okzs	cmo557zyu00xx7b0kgs9475e5	cmo558j7801sa100gb8g19tm3	ISSUED	\N	7D7873CEFC5B8E1FD48EA85C	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558np20284100gfl3l61wh	cmo558ks001ya100gss5d07hj	cmo55803r00y27b0kivnt8i8n	cmo558j7801sa100gb8g19tm3	ISSUED	\N	1898C7C14397B1FACB58257C	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558np40286100geos3ayq7	cmo558ksz01ye100g3axlmuh0	cmo55808y00y77b0k07q4amg0	cmo558j7801sa100gb8g19tm3	ISSUED	\N	6D316E91A0B57E45522D9B35	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558np60288100gvwpzqm6b	cmo558ku101yi100g5wrzdepg	cmo5580fe00yc7b0khj6mgnge	cmo558j7801sa100gb8g19tm3	ISSUED	\N	9ABBD531313C071847110E4C	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558np7028a100g94zc6n0p	cmo558kv601ym100gaqjtz3ma	cmo5580kk00yh7b0kfejjlsyh	cmo558j7801sa100gb8g19tm3	ISSUED	\N	139F8653B25BCAC1D9F998CF	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558np9028c100ga6eso3hz	cmo558kwb01yq100gw8wz7hzo	cmo5580po00ym7b0kpwdoxgsu	cmo558j7801sa100gb8g19tm3	ISSUED	\N	861B91ABEDBF8BD84E3C5C41	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558npa028e100gqfxhzjdh	cmo558kxg01yu100gryr0uyk9	cmo5580uw00yr7b0kipuqllzh	cmo558j7801sa100gb8g19tm3	ISSUED	\N	FE44ADC241C89003F789A947	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmo558npc028g100gnycztrwx	cmo558kyl01yy100gpcqmnjbw	cmo55810700yw7b0k61bz2pxy	cmo558j7801sa100gb8g19tm3	ISSUED	\N	298005227F13ECFA925E1C34	2026-04-19 02:25:18.999	2026-04-19 02:25:18.999
cmocmamdb002l1w8s84u2jwki	cmocm39qm00271w8sedk78awx	cmockq3hi001buxz7570ou2ax	cmocm26ej001b1w8syavkdvtc	PENDING	\N	7CD6B029187522F1ADC35254	\N	\N
cmocme06f002p1w8s7vo3d75q	cmocm3aeo00291w8s2mo7jy5b	cmocl3m6h001ouxz76nugd8fe	cmocm26ej001b1w8syavkdvtc	PENDING	\N	9458FE876B03BAD5ACDEF1C7	\N	\N
cmp1zcnsm0015me1wovsakdiu	cmp1yzo65000vme1wf4o7vbwz	cmoebag5v0001e1ef35z9m1xm	cmp171iiu00005ckaazxybh61	ISSUED	\N	1144D9643BEC6DDB903F9F89	2026-05-12 05:14:00.624	2026-05-12 05:14:00.624
\.


--
-- Data for Name: checklist_comments; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.checklist_comments (id, item_id, author_id, author_name, content, attachment_url, link_url, link_label, created_at) FROM stdin;
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.checklist_items (id, checklist_id, title, description, phase, status, priority, due_date, completed_at, completed_by, is_applicable, order_index, notes, created_at, updated_at, assignees, parent_item_id, wbs_code) FROM stdin;
cmo4e99l80002o680mu6ssswj	cmo4e99l80001o680on9atzhp	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l80003o680ix4zhudc	cmo4e99l80001o680on9atzhp	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l80004o680c0emwssp	cmo4e99l80001o680on9atzhp	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l80005o680azqvn478	cmo4e99l80001o680on9atzhp	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l80006o680tcvaj79y	cmo4e99l80001o680on9atzhp	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l80007o680kkite2gc	cmo4e99l80001o680on9atzhp	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l80008o680yu8js0t9	cmo4e99l80001o680on9atzhp	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l80009o6800qu1p2wr	cmo4e99l80001o680on9atzhp	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000ao680rnf4qzke	cmo4e99l80001o680on9atzhp	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000bo680tr1w91mv	cmo4e99l80001o680on9atzhp	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000co680y0ai1d52	cmo4e99l80001o680on9atzhp	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	10	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000do680hh01ooac	cmo4e99l80001o680on9atzhp	Conduct dry run / rehearsal if applicable	\N	PREPARATION	NOT_STARTED	LOW	\N	\N	\N	\N	11	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000eo680tis3eits	cmo4e99l80001o680on9atzhp	Setup venue / online platform	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	12	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000fo680knvd5z3x	cmo4e99l80001o680on9atzhp	Conduct registration and distribute materials	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000go6806qfs2jb3	cmo4e99l80001o680on9atzhp	Record attendance per session (FM-CT-2A)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000ho680k9inboh0	cmo4e99l80001o680on9atzhp	Monitor training flow and time management	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000io680owiy23f7	cmo4e99l80001o680on9atzhp	Document event (photos, recording)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	16	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000jo6803bmqvhfi	cmo4e99l80001o680on9atzhp	Facilitate open forum / Q&A sessions	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	17	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000ko680p54ezzyr	cmo4e99l80001o680on9atzhp	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000lo680ymupit7m	cmo4e99l80001o680on9atzhp	Distribute certificates to eligible participants	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	19	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000mo680hak0sm1v	cmo4e99l80001o680on9atzhp	Ensure compliance with health/safety protocols	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000no6802f8jnpt1	cmo4e99l80001o680on9atzhp	Collect signed attendance sheets	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000oo680h6z0kw7r	cmo4e99l80001o680on9atzhp	Tabulate CSF results (FM-CSF-ACT-TAB)	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	22	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000po680uizkycbs	cmo4e99l80001o680on9atzhp	Prepare CSF Report (FM-CSF-ACT-RPT)	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000qo6808h84alus	cmo4e99l80001o680on9atzhp	Compile attendance report	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000ro680x4rx6pk6	cmo4e99l80001o680on9atzhp	Prepare Post-Activity Report (FM-CT-6)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	25	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000so68090v591ld	cmo4e99l80001o680on9atzhp	Submit PAR to Division Chief for review	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000to680sp8vgzbn	cmo4e99l80001o680on9atzhp	Secure PAR approval from PD/RD	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	27	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000uo680fttm74pn	cmo4e99l80001o680on9atzhp	Submit PAR and annexes to FAD	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	28	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000vo680sbfleehq	cmo4e99l80001o680on9atzhp	File training documentation for records	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	29	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000wo680pva3z260	cmo4e99l80001o680on9atzhp	Schedule impact evaluation (FM-CT-5) at 6 months	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	30	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000xo6807ird1wtc	cmo4e99l80001o680on9atzhp	Prepare Effectiveness Report (FM-CT-3)	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	31	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4e99l9000yo680gryougpz	cmo4e99l80001o680on9atzhp	Submit Effectiveness Report to MAA	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	32	\N	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836	[]	\N	\N
cmo4ff7jb000dsq0jq0glo0u7	cmo4ff7j9000csq0jg9q1udjy	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000esq0jnm936a0j	cmo4ff7j9000csq0jg9q1udjy	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000fsq0j43d9aouc	cmo4ff7j9000csq0jg9q1udjy	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000gsq0j5bvn4j4g	cmo4ff7j9000csq0jg9q1udjy	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000hsq0jpiqtqjfh	cmo4ff7j9000csq0jg9q1udjy	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000isq0j4bax5kct	cmo4ff7j9000csq0jg9q1udjy	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000jsq0jtxvp6o2j	cmo4ff7j9000csq0jg9q1udjy	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000ksq0jsijtsqli	cmo4ff7j9000csq0jg9q1udjy	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000lsq0jbg7vvj5c	cmo4ff7j9000csq0jg9q1udjy	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000msq0jtwabcigg	cmo4ff7j9000csq0jg9q1udjy	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000nsq0j8pl5q7a6	cmo4ff7j9000csq0jg9q1udjy	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000osq0j9b9ifao5	cmo4ff7j9000csq0jg9q1udjy	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000psq0j1pnb074d	cmo4ff7j9000csq0jg9q1udjy	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000qsq0juma5kph3	cmo4ff7j9000csq0jg9q1udjy	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000rsq0jgmxt69kr	cmo4ff7j9000csq0jg9q1udjy	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000ssq0jvm7ht6h3	cmo4ff7j9000csq0jg9q1udjy	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000tsq0jllbvfmdn	cmo4ff7j9000csq0jg9q1udjy	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000usq0jvdiol8hz	cmo4ff7j9000csq0jg9q1udjy	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000vsq0j6gp12dyh	cmo4ff7j9000csq0jg9q1udjy	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000wsq0j3s5mmf8c	cmo4ff7j9000csq0jg9q1udjy	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000xsq0j9rxvevze	cmo4ff7j9000csq0jg9q1udjy	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000ysq0js2b30ztt	cmo4ff7j9000csq0jg9q1udjy	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb000zsq0j64lcov5i	cmo4ff7j9000csq0jg9q1udjy	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb0010sq0jbolj9fjb	cmo4ff7j9000csq0jg9q1udjy	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb0011sq0jgwwttogv	cmo4ff7j9000csq0jg9q1udjy	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb0012sq0jmbpllh1b	cmo4ff7j9000csq0jg9q1udjy	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jb0013sq0j8rgau7cs	cmo4ff7j9000csq0jg9q1udjy	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ff7jc0014sq0jt0lhe1s2	cmo4ff7j9000csq0jg9q1udjy	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-18 14:22:34.728	2026-04-18 14:22:34.728	[]	\N	\N
cmo4ffr6a001ksq0jy1lneibr	cmo4ffr66001jsq0j3zxcgkjg	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001lsq0jzahj6kug	cmo4ffr66001jsq0j3zxcgkjg	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001msq0jfwblu20l	cmo4ffr66001jsq0j3zxcgkjg	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001nsq0jtvxthkis	cmo4ffr66001jsq0j3zxcgkjg	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001osq0j7jn76a21	cmo4ffr66001jsq0j3zxcgkjg	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001psq0j3zvd2wu0	cmo4ffr66001jsq0j3zxcgkjg	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001qsq0jdnz47du2	cmo4ffr66001jsq0j3zxcgkjg	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001rsq0j3tlhrb32	cmo4ffr66001jsq0j3zxcgkjg	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001ssq0j5kjkxgiu	cmo4ffr66001jsq0j3zxcgkjg	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001tsq0jexck41po	cmo4ffr66001jsq0j3zxcgkjg	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001usq0j9en3i514	cmo4ffr66001jsq0j3zxcgkjg	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001vsq0jige87rkl	cmo4ffr66001jsq0j3zxcgkjg	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001wsq0jja0psr7c	cmo4ffr66001jsq0j3zxcgkjg	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001xsq0jn1o9ukqx	cmo4ffr66001jsq0j3zxcgkjg	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001ysq0jmu0uwrqw	cmo4ffr66001jsq0j3zxcgkjg	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a001zsq0jd4runnn1	cmo4ffr66001jsq0j3zxcgkjg	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0020sq0j1iqisvir	cmo4ffr66001jsq0j3zxcgkjg	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0021sq0jej5mkflz	cmo4ffr66001jsq0j3zxcgkjg	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0022sq0jtq59wsbh	cmo4ffr66001jsq0j3zxcgkjg	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0023sq0jhsqt80kr	cmo4ffr66001jsq0j3zxcgkjg	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0024sq0jz4itvw53	cmo4ffr66001jsq0j3zxcgkjg	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0025sq0j8rhzk3e1	cmo4ffr66001jsq0j3zxcgkjg	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0026sq0j64dmyt2i	cmo4ffr66001jsq0j3zxcgkjg	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0027sq0j19fqq2tj	cmo4ffr66001jsq0j3zxcgkjg	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0028sq0jx0avzg7m	cmo4ffr66001jsq0j3zxcgkjg	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a0029sq0j4nwas43r	cmo4ffr66001jsq0j3zxcgkjg	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a002asq0j2vrevgti	cmo4ffr66001jsq0j3zxcgkjg	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4ffr6a002bsq0je8uyqloo	cmo4ffr66001jsq0j3zxcgkjg	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-18 14:23:00.178	2026-04-18 14:23:00.178	[]	\N	\N
cmo4fm835000d13i62fpti3zt	cmo4fm833000c13i6dt9bxza9	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000e13i653j1mwh7	cmo4fm833000c13i6dt9bxza9	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000f13i6fwpojy7d	cmo4fm833000c13i6dt9bxza9	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000g13i6og5ysekg	cmo4fm833000c13i6dt9bxza9	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000h13i6q7g7btxj	cmo4fm833000c13i6dt9bxza9	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000i13i6xegvkufd	cmo4fm833000c13i6dt9bxza9	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000j13i6nsm7fzcp	cmo4fm833000c13i6dt9bxza9	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000k13i6megh3yaz	cmo4fm833000c13i6dt9bxza9	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000l13i6mhgdx7ah	cmo4fm833000c13i6dt9bxza9	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000m13i6mq0ytntj	cmo4fm833000c13i6dt9bxza9	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000n13i6rljik90z	cmo4fm833000c13i6dt9bxza9	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000o13i6wiqn4w06	cmo4fm833000c13i6dt9bxza9	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000p13i6unrxfpx3	cmo4fm833000c13i6dt9bxza9	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000q13i6d281widd	cmo4fm833000c13i6dt9bxza9	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000r13i6v3p8qwl9	cmo4fm833000c13i6dt9bxza9	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000s13i60jed5x1m	cmo4fm833000c13i6dt9bxza9	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000t13i6q8mdorab	cmo4fm833000c13i6dt9bxza9	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000u13i6jtit1c2n	cmo4fm833000c13i6dt9bxza9	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000v13i6mi73989t	cmo4fm833000c13i6dt9bxza9	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000w13i62dgtbwwq	cmo4fm833000c13i6dt9bxza9	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000x13i6cy6gu14o	cmo4fm833000c13i6dt9bxza9	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000y13i6kbmjjeu9	cmo4fm833000c13i6dt9bxza9	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835000z13i6wa98st0f	cmo4fm833000c13i6dt9bxza9	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835001013i6y2bo1opz	cmo4fm833000c13i6dt9bxza9	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835001113i6dk3k7w7l	cmo4fm833000c13i6dt9bxza9	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835001213i6q2pwvdpp	cmo4fm833000c13i6dt9bxza9	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835001313i6wxruw5an	cmo4fm833000c13i6dt9bxza9	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo4fm835001413i6f5ddkqu5	cmo4fm833000c13i6dt9bxza9	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-18 14:28:02.033	2026-04-18 14:28:02.033	[]	\N	\N
cmo553xal000dbf0806fqlsj4	cmo553xak000cbf0891vawxo7	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000ebf08zf71l0mc	cmo553xak000cbf0891vawxo7	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000fbf080oehisq0	cmo553xak000cbf0891vawxo7	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000gbf08s1ezv2hw	cmo553xak000cbf0891vawxo7	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000hbf08ke39vp24	cmo553xak000cbf0891vawxo7	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000ibf083vi5h1p0	cmo553xak000cbf0891vawxo7	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000jbf08q32ib3td	cmo553xak000cbf0891vawxo7	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000kbf080plivqpx	cmo553xak000cbf0891vawxo7	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000lbf0897bykwwr	cmo553xak000cbf0891vawxo7	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000mbf08s597fwgw	cmo553xak000cbf0891vawxo7	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000nbf08oiv3wg8x	cmo553xak000cbf0891vawxo7	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000obf08a9s6lper	cmo553xak000cbf0891vawxo7	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000pbf08pczmz5fe	cmo553xak000cbf0891vawxo7	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000qbf08n1mo9724	cmo553xak000cbf0891vawxo7	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xal000rbf08apjl1x41	cmo553xak000cbf0891vawxo7	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000sbf08yeceg5tt	cmo553xak000cbf0891vawxo7	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000tbf081ah7qwi1	cmo553xak000cbf0891vawxo7	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000ubf0865kymrtl	cmo553xak000cbf0891vawxo7	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000vbf08db6d2hox	cmo553xak000cbf0891vawxo7	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000wbf08j5f1yham	cmo553xak000cbf0891vawxo7	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000xbf08ehk31tdn	cmo553xak000cbf0891vawxo7	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000ybf08hwhdkius	cmo553xak000cbf0891vawxo7	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam000zbf08h4wlh65s	cmo553xak000cbf0891vawxo7	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam0010bf08qgh1nhof	cmo553xak000cbf0891vawxo7	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam0011bf08jr8784n7	cmo553xak000cbf0891vawxo7	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam0012bf080o6fzr39	cmo553xak000cbf0891vawxo7	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam0013bf08yrljjh9g	cmo553xak000cbf0891vawxo7	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xam0014bf085mxfth0i	cmo553xak000cbf0891vawxo7	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:21:38.254	2026-04-19 02:21:38.254	[]	\N	\N
cmo553xn0001kbf08t0p8wx91	cmo553xmy001jbf087hecbzjw	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001lbf08vbaouri6	cmo553xmy001jbf087hecbzjw	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001mbf08vd1s0nao	cmo553xmy001jbf087hecbzjw	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001nbf08vtbw7ei2	cmo553xmy001jbf087hecbzjw	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001obf08gz44nevb	cmo553xmy001jbf087hecbzjw	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001pbf08dqdaeigw	cmo553xmy001jbf087hecbzjw	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001qbf08oc1e3knl	cmo553xmy001jbf087hecbzjw	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001rbf08he93rzno	cmo553xmy001jbf087hecbzjw	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001sbf08cdaxhfbs	cmo553xmy001jbf087hecbzjw	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001tbf08zeyh63n9	cmo553xmy001jbf087hecbzjw	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001ubf086mdsixzi	cmo553xmy001jbf087hecbzjw	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001vbf08ipk0pvi3	cmo553xmy001jbf087hecbzjw	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001wbf08qhghy7v0	cmo553xmy001jbf087hecbzjw	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001xbf08cfuj0bq8	cmo553xmy001jbf087hecbzjw	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001ybf089zo2enib	cmo553xmy001jbf087hecbzjw	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0001zbf08zx87uq57	cmo553xmy001jbf087hecbzjw	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00020bf08z33eeqgj	cmo553xmy001jbf087hecbzjw	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00021bf08ruvwnggw	cmo553xmy001jbf087hecbzjw	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00022bf08zfxkjt2m	cmo553xmy001jbf087hecbzjw	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00023bf08sjpfysgf	cmo553xmy001jbf087hecbzjw	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00024bf08ubrxq9c7	cmo553xmy001jbf087hecbzjw	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00025bf08nkwmwc9i	cmo553xmy001jbf087hecbzjw	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00026bf08tsds4s1e	cmo553xmy001jbf087hecbzjw	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00027bf08ae5www7x	cmo553xmy001jbf087hecbzjw	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00028bf081unim314	cmo553xmy001jbf087hecbzjw	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn00029bf08uhkvc7ri	cmo553xmy001jbf087hecbzjw	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0002abf08js3p4xy0	cmo553xmy001jbf087hecbzjw	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xn0002bbf08peo48afx	cmo553xmy001jbf087hecbzjw	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:21:38.7	2026-04-19 02:21:38.7	[]	\N	\N
cmo553xyo002rbf08kqaa2lk6	cmo553xym002qbf08de0864tb	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002sbf088mp5woqm	cmo553xym002qbf08de0864tb	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002tbf08w5wd6uh7	cmo553xym002qbf08de0864tb	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002ubf08mplj0ur3	cmo553xym002qbf08de0864tb	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002vbf088gta6wz3	cmo553xym002qbf08de0864tb	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002wbf08bwsofxo0	cmo553xym002qbf08de0864tb	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002xbf08ntymt63o	cmo553xym002qbf08de0864tb	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002ybf088vmqg54q	cmo553xym002qbf08de0864tb	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo002zbf08offiruz0	cmo553xym002qbf08de0864tb	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0030bf089jhn7vls	cmo553xym002qbf08de0864tb	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0031bf08ftawdj76	cmo553xym002qbf08de0864tb	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0032bf08u3ws1yan	cmo553xym002qbf08de0864tb	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0033bf087s6gthk6	cmo553xym002qbf08de0864tb	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0034bf08dd7yzyko	cmo553xym002qbf08de0864tb	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0035bf08ecgg9suv	cmo553xym002qbf08de0864tb	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0036bf081uih5urg	cmo553xym002qbf08de0864tb	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0037bf08xda3lvmp	cmo553xym002qbf08de0864tb	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0038bf08qaut5il1	cmo553xym002qbf08de0864tb	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo0039bf08ruv7oefb	cmo553xym002qbf08de0864tb	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003abf08rzvf0mrc	cmo553xym002qbf08de0864tb	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003bbf08v4lrc4gv	cmo553xym002qbf08de0864tb	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003cbf08c7xj5f3b	cmo553xym002qbf08de0864tb	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003dbf082440n9s6	cmo553xym002qbf08de0864tb	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003ebf08dqfbbozu	cmo553xym002qbf08de0864tb	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003fbf08xqol06je	cmo553xym002qbf08de0864tb	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003gbf08zvs8449c	cmo553xym002qbf08de0864tb	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003hbf08ltvhlghl	cmo553xym002qbf08de0864tb	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553xyo003ibf08x51h02pl	cmo553xym002qbf08de0864tb	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:21:39.12	2026-04-19 02:21:39.12	[]	\N	\N
cmo553y9s003ybf08wd0ouux1	cmo553y9r003xbf08l0h98t3y	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s003zbf083ygvf3pr	cmo553y9r003xbf08l0h98t3y	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0040bf08mjaslipq	cmo553y9r003xbf08l0h98t3y	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0041bf08ffpwfa5h	cmo553y9r003xbf08l0h98t3y	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0042bf080xf1makk	cmo553y9r003xbf08l0h98t3y	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0043bf08kvyuv4f4	cmo553y9r003xbf08l0h98t3y	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0044bf08cfifgbwp	cmo553y9r003xbf08l0h98t3y	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0045bf084ef5333r	cmo553y9r003xbf08l0h98t3y	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0046bf08m8hl2t5a	cmo553y9r003xbf08l0h98t3y	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0047bf089q5mhozf	cmo553y9r003xbf08l0h98t3y	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0048bf08z3jtnvnc	cmo553y9r003xbf08l0h98t3y	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s0049bf08zevva1tl	cmo553y9r003xbf08l0h98t3y	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004abf08woa6s9ks	cmo553y9r003xbf08l0h98t3y	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004bbf08kinvgf08	cmo553y9r003xbf08l0h98t3y	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004cbf08amodpskv	cmo553y9r003xbf08l0h98t3y	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004dbf08ae5l1qm1	cmo553y9r003xbf08l0h98t3y	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004ebf08t3hgdmid	cmo553y9r003xbf08l0h98t3y	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004fbf084xbybkvv	cmo553y9r003xbf08l0h98t3y	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004gbf08ky01ckx1	cmo553y9r003xbf08l0h98t3y	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004hbf08du2fo5n3	cmo553y9r003xbf08l0h98t3y	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004ibf08s4xv7s99	cmo553y9r003xbf08l0h98t3y	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004jbf08yf415nzi	cmo553y9r003xbf08l0h98t3y	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004kbf08i899a20e	cmo553y9r003xbf08l0h98t3y	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004lbf08olinkk1z	cmo553y9r003xbf08l0h98t3y	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004mbf08dc0k1vdo	cmo553y9r003xbf08l0h98t3y	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004nbf084zl433a5	cmo553y9r003xbf08l0h98t3y	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004obf083vwp5rak	cmo553y9r003xbf08l0h98t3y	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553y9s004pbf08qoi5vtii	cmo553y9r003xbf08l0h98t3y	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:21:39.52	2026-04-19 02:21:39.52	[]	\N	\N
cmo553yle0055bf083t5rkoff	cmo553yld0054bf08chygt5dn	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle0056bf08vomrhllo	cmo553yld0054bf08chygt5dn	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle0057bf08jwkpm50f	cmo553yld0054bf08chygt5dn	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle0058bf08zma4h165	cmo553yld0054bf08chygt5dn	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle0059bf08t96dbohv	cmo553yld0054bf08chygt5dn	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005abf08hl25b9td	cmo553yld0054bf08chygt5dn	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005bbf08o3g5vyca	cmo553yld0054bf08chygt5dn	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005cbf08heowrrax	cmo553yld0054bf08chygt5dn	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005dbf08aw7ktc92	cmo553yld0054bf08chygt5dn	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005ebf08p423m8as	cmo553yld0054bf08chygt5dn	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005fbf087utzrvs7	cmo553yld0054bf08chygt5dn	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005gbf08bpv6q7tu	cmo553yld0054bf08chygt5dn	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005hbf084zgltpjo	cmo553yld0054bf08chygt5dn	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005ibf089punasoq	cmo553yld0054bf08chygt5dn	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005jbf08g1gx6fp2	cmo553yld0054bf08chygt5dn	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005kbf085oeisfq9	cmo553yld0054bf08chygt5dn	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005lbf087osdbfqi	cmo553yld0054bf08chygt5dn	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005mbf086f9xu88n	cmo553yld0054bf08chygt5dn	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005nbf082ga2344o	cmo553yld0054bf08chygt5dn	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005obf081g8nx4t1	cmo553yld0054bf08chygt5dn	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005pbf08sh7x79yt	cmo553yld0054bf08chygt5dn	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005qbf08ik5vskiv	cmo553yld0054bf08chygt5dn	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005rbf087xla30ef	cmo553yld0054bf08chygt5dn	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005sbf08gizlqr7p	cmo553yld0054bf08chygt5dn	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005tbf08fbplygko	cmo553yld0054bf08chygt5dn	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005ubf08dmtky7ol	cmo553yld0054bf08chygt5dn	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005vbf08a08nu5u3	cmo553yld0054bf08chygt5dn	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo553yle005wbf08kkp7zl6k	cmo553yld0054bf08chygt5dn	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:21:39.938	2026-04-19 02:21:39.938	[]	\N	\N
cmo555fez006cbf08135c2saq	cmo555fex006bbf08impdrv6e	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006dbf081y7u3zcv	cmo555fex006bbf08impdrv6e	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006ebf08t9vlwopj	cmo555fex006bbf08impdrv6e	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006fbf08a51iv9il	cmo555fex006bbf08impdrv6e	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006gbf08s09fogv1	cmo555fex006bbf08impdrv6e	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006hbf08binmm6e6	cmo555fex006bbf08impdrv6e	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006ibf08dgynn6hq	cmo555fex006bbf08impdrv6e	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006jbf08w41cq6qn	cmo555fex006bbf08impdrv6e	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006kbf08s2d36gq2	cmo555fex006bbf08impdrv6e	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006lbf08ue4ml5tu	cmo555fex006bbf08impdrv6e	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006mbf081eb8cf01	cmo555fex006bbf08impdrv6e	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006nbf0808nwlzuv	cmo555fex006bbf08impdrv6e	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006obf083uvbj0q3	cmo555fex006bbf08impdrv6e	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006pbf08ad44qckf	cmo555fex006bbf08impdrv6e	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006qbf08ln3f2mgc	cmo555fex006bbf08impdrv6e	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006rbf08u3r4im6b	cmo555fex006bbf08impdrv6e	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006sbf08d9dqrc47	cmo555fex006bbf08impdrv6e	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006tbf08rsnl2nib	cmo555fex006bbf08impdrv6e	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006ubf08yjg3m15q	cmo555fex006bbf08impdrv6e	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006vbf08yy29mv34	cmo555fex006bbf08impdrv6e	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006wbf087o0b5ya2	cmo555fex006bbf08impdrv6e	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006xbf08xq03zk1c	cmo555fex006bbf08impdrv6e	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006ybf0888p30c7j	cmo555fex006bbf08impdrv6e	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez006zbf0808djk6fp	cmo555fex006bbf08impdrv6e	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez0070bf0820lv04lj	cmo555fex006bbf08impdrv6e	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez0071bf089kzid2xw	cmo555fex006bbf08impdrv6e	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez0072bf08qi0vofz2	cmo555fex006bbf08impdrv6e	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555fez0073bf08sbrkdaqd	cmo555fex006bbf08impdrv6e	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:22:48.395	2026-04-19 02:22:48.395	[]	\N	\N
cmo555iu900ivbf08u8xs6bjk	cmo555iu700iubf08mlt3b0ju	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900iwbf087g77oryf	cmo555iu700iubf08mlt3b0ju	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900ixbf08x9visrbl	cmo555iu700iubf08mlt3b0ju	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900iybf08t0cwh4j2	cmo555iu700iubf08mlt3b0ju	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900izbf08xx1o10ek	cmo555iu700iubf08mlt3b0ju	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j0bf08odg9ziqw	cmo555iu700iubf08mlt3b0ju	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j1bf08c7kkr75z	cmo555iu700iubf08mlt3b0ju	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j2bf08xa4j4f4y	cmo555iu700iubf08mlt3b0ju	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j3bf08wa9z75gu	cmo555iu700iubf08mlt3b0ju	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j4bf08fzzmcwu7	cmo555iu700iubf08mlt3b0ju	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j5bf08mel89xo3	cmo555iu700iubf08mlt3b0ju	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j6bf08dym6h1i6	cmo555iu700iubf08mlt3b0ju	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j7bf08yutf15bb	cmo555iu700iubf08mlt3b0ju	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j8bf08oonxh6xs	cmo555iu700iubf08mlt3b0ju	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900j9bf08rt6bddfd	cmo555iu700iubf08mlt3b0ju	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jabf08h27ka78z	cmo555iu700iubf08mlt3b0ju	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jbbf088jfe93qo	cmo555iu700iubf08mlt3b0ju	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jcbf0822whce6d	cmo555iu700iubf08mlt3b0ju	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jdbf089s1f4ih6	cmo555iu700iubf08mlt3b0ju	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jebf086yue0auq	cmo555iu700iubf08mlt3b0ju	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jfbf08652uunbk	cmo555iu700iubf08mlt3b0ju	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jgbf080kiuqeoa	cmo555iu700iubf08mlt3b0ju	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jhbf08moif9ijx	cmo555iu700iubf08mlt3b0ju	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jibf08t2r10fsl	cmo555iu700iubf08mlt3b0ju	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jjbf08c2lmikna	cmo555iu700iubf08mlt3b0ju	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jkbf08y2asqvrb	cmo555iu700iubf08mlt3b0ju	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jlbf08pco1li0k	cmo555iu700iubf08mlt3b0ju	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555iu900jmbf083l6qw2j6	cmo555iu700iubf08mlt3b0ju	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:22:52.833	2026-04-19 02:22:52.833	[]	\N	\N
cmo555j5j00k2bf08zblnvc89	cmo555j5i00k1bf08ymbwvb9a	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00k3bf08th8kscai	cmo555j5i00k1bf08ymbwvb9a	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00k4bf081gh95g8w	cmo555j5i00k1bf08ymbwvb9a	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00k5bf08gohf6vl7	cmo555j5i00k1bf08ymbwvb9a	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00k6bf08gg6aiv86	cmo555j5i00k1bf08ymbwvb9a	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00k7bf085cr8bexb	cmo555j5i00k1bf08ymbwvb9a	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00k8bf08o7zbmtxj	cmo555j5i00k1bf08ymbwvb9a	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00k9bf08sxygnd29	cmo555j5i00k1bf08ymbwvb9a	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kabf08hze55c58	cmo555j5i00k1bf08ymbwvb9a	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kbbf08en231ilv	cmo555j5i00k1bf08ymbwvb9a	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kcbf08ajarv01i	cmo555j5i00k1bf08ymbwvb9a	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kdbf08sguuuoh8	cmo555j5i00k1bf08ymbwvb9a	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kebf08w6grhahn	cmo555j5i00k1bf08ymbwvb9a	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kfbf08xu75d9e1	cmo555j5i00k1bf08ymbwvb9a	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kgbf08flpxkyw4	cmo555j5i00k1bf08ymbwvb9a	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00khbf08xpns43fh	cmo555j5i00k1bf08ymbwvb9a	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kibf08pq1xcomx	cmo555j5i00k1bf08ymbwvb9a	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kjbf08q4vaquyd	cmo555j5i00k1bf08ymbwvb9a	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kkbf08nf9ox5g7	cmo555j5i00k1bf08ymbwvb9a	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00klbf08jkfchgsp	cmo555j5i00k1bf08ymbwvb9a	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kmbf0885aaklpd	cmo555j5i00k1bf08ymbwvb9a	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00knbf08cshi19zq	cmo555j5i00k1bf08ymbwvb9a	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kobf086xiej5af	cmo555j5i00k1bf08ymbwvb9a	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kpbf083psazi3x	cmo555j5i00k1bf08ymbwvb9a	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00kqbf08v0e97v1y	cmo555j5i00k1bf08ymbwvb9a	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00krbf08k1n5jmi6	cmo555j5i00k1bf08ymbwvb9a	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00ksbf084wct9hw7	cmo555j5i00k1bf08ymbwvb9a	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo555j5j00ktbf08ypj40gi2	cmo555j5i00k1bf08ymbwvb9a	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:22:53.24	2026-04-19 02:22:53.24	[]	\N	\N
cmo5581bg000d100gf22dhv2e	cmo5581bf000c100gn0ie2yb0	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bg000e100gfkqorclj	cmo5581bf000c100gn0ie2yb0	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000f100gar5uszle	cmo5581bf000c100gn0ie2yb0	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000g100g2lfk6uoz	cmo5581bf000c100gn0ie2yb0	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000h100gsxdljd4n	cmo5581bf000c100gn0ie2yb0	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000i100g24evw9ui	cmo5581bf000c100gn0ie2yb0	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000j100gowcsghf1	cmo5581bf000c100gn0ie2yb0	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000k100g0kkwbx4s	cmo5581bf000c100gn0ie2yb0	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000l100gq0rqtbc5	cmo5581bf000c100gn0ie2yb0	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000m100g21gii552	cmo5581bf000c100gn0ie2yb0	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000n100gi00krbre	cmo5581bf000c100gn0ie2yb0	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000o100gyjegcbst	cmo5581bf000c100gn0ie2yb0	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000p100gaxtsd5kf	cmo5581bf000c100gn0ie2yb0	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000q100gvp9zyndn	cmo5581bf000c100gn0ie2yb0	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000r100gx0erwx6k	cmo5581bf000c100gn0ie2yb0	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000s100gh4pa88cm	cmo5581bf000c100gn0ie2yb0	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000t100g4z195p06	cmo5581bf000c100gn0ie2yb0	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000u100glhi2i5kx	cmo5581bf000c100gn0ie2yb0	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000v100gyk516hri	cmo5581bf000c100gn0ie2yb0	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000w100g1kvq5ofu	cmo5581bf000c100gn0ie2yb0	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000x100ggfucxvdc	cmo5581bf000c100gn0ie2yb0	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000y100ghridc25w	cmo5581bf000c100gn0ie2yb0	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh000z100grx0753xj	cmo5581bf000c100gn0ie2yb0	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh0010100g0mcnah6e	cmo5581bf000c100gn0ie2yb0	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh0011100gxoji1r3b	cmo5581bf000c100gn0ie2yb0	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh0012100gmrotrkal	cmo5581bf000c100gn0ie2yb0	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh0013100gfkenj0ep	cmo5581bf000c100gn0ie2yb0	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5581bh0014100g75ynipxx	cmo5581bf000c100gn0ie2yb0	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:24:50.093	2026-04-19 02:24:50.093	[]	\N	\N
cmo5585wc00ge100g2l4zu6ix	cmo5585wb00gd100gsa2uu1fu	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gf100g9pnddzbn	cmo5585wb00gd100gsa2uu1fu	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gg100gdrgmzlan	cmo5585wb00gd100gsa2uu1fu	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gh100gvabv2sm6	cmo5585wb00gd100gsa2uu1fu	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gi100g3555rg4e	cmo5585wb00gd100gsa2uu1fu	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gj100ga5nasnkz	cmo5585wb00gd100gsa2uu1fu	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gk100g7xlws41n	cmo5585wb00gd100gsa2uu1fu	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gl100gkeyiy1of	cmo5585wb00gd100gsa2uu1fu	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gm100ga2txjmy1	cmo5585wb00gd100gsa2uu1fu	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gn100gcgi4lbb9	cmo5585wb00gd100gsa2uu1fu	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00go100gkuzge9qa	cmo5585wb00gd100gsa2uu1fu	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gp100gngpplru3	cmo5585wb00gd100gsa2uu1fu	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gq100gu4mekp8q	cmo5585wb00gd100gsa2uu1fu	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gr100gpa8pz8jl	cmo5585wb00gd100gsa2uu1fu	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gs100gg1n060f1	cmo5585wb00gd100gsa2uu1fu	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gt100g3qyt5p0y	cmo5585wb00gd100gsa2uu1fu	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gu100gagg9qpap	cmo5585wb00gd100gsa2uu1fu	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gv100ghfx9kyi6	cmo5585wb00gd100gsa2uu1fu	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gw100geoj9pse1	cmo5585wb00gd100gsa2uu1fu	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gx100gavv352lz	cmo5585wb00gd100gsa2uu1fu	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gy100gaietx0qw	cmo5585wb00gd100gsa2uu1fu	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00gz100gjqxcv11g	cmo5585wb00gd100gsa2uu1fu	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00h0100gur2uuz8q	cmo5585wb00gd100gsa2uu1fu	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00h1100ghh18bk8u	cmo5585wb00gd100gsa2uu1fu	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00h2100gz55l6qlj	cmo5585wb00gd100gsa2uu1fu	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00h3100g19j9cve8	cmo5585wb00gd100gsa2uu1fu	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00h4100g376fnpyx	cmo5585wb00gd100gsa2uu1fu	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo5585wc00h5100g3wznrgeq	cmo5585wb00gd100gsa2uu1fu	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:24:56.029	2026-04-19 02:24:56.029	[]	\N	\N
cmo558ac700w6100gk7evvvn6	cmo558ac600w5100gxrmpre7j	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700w7100g4z5b6ytj	cmo558ac600w5100gxrmpre7j	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700w8100gdzzh2bhd	cmo558ac600w5100gxrmpre7j	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700w9100gthhtd6ow	cmo558ac600w5100gxrmpre7j	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wa100gsefc6eps	cmo558ac600w5100gxrmpre7j	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wb100g04jnr34y	cmo558ac600w5100gxrmpre7j	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wc100g5b6igqhd	cmo558ac600w5100gxrmpre7j	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wd100g5kivq1n2	cmo558ac600w5100gxrmpre7j	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700we100ganwo13c4	cmo558ac600w5100gxrmpre7j	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wf100ghhkimocz	cmo558ac600w5100gxrmpre7j	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wg100gsp7vj3fm	cmo558ac600w5100gxrmpre7j	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wh100go91bjiiy	cmo558ac600w5100gxrmpre7j	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wi100gxe5cfntq	cmo558ac600w5100gxrmpre7j	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wj100g5yppdhhx	cmo558ac600w5100gxrmpre7j	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wk100gwmui5x1z	cmo558ac600w5100gxrmpre7j	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wl100gpdpwffw9	cmo558ac600w5100gxrmpre7j	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wm100gp6q3z5m8	cmo558ac600w5100gxrmpre7j	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wn100guko3dka5	cmo558ac600w5100gxrmpre7j	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wo100g1fly87tw	cmo558ac600w5100gxrmpre7j	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wp100gus4f8epb	cmo558ac600w5100gxrmpre7j	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wq100garntiua5	cmo558ac600w5100gxrmpre7j	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wr100g0hpiqp3n	cmo558ac600w5100gxrmpre7j	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700ws100gysnlazz8	cmo558ac600w5100gxrmpre7j	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wt100gejyxdwlg	cmo558ac600w5100gxrmpre7j	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wu100gz1ke6ge1	cmo558ac600w5100gxrmpre7j	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wv100g7836huuc	cmo558ac600w5100gxrmpre7j	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700ww100ghisot12s	cmo558ac600w5100gxrmpre7j	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558ac700wx100gc08ip3ym	cmo558ac600w5100gxrmpre7j	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:25:01.783	2026-04-19 02:25:01.783	[]	\N	\N
cmo558etn01cp100gupgz0aq7	cmo558etl01co100g73l27cj6	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cq100g43laco9e	cmo558etl01co100g73l27cj6	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cr100g9hvsqccc	cmo558etl01co100g73l27cj6	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cs100gb8b4m6cq	cmo558etl01co100g73l27cj6	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01ct100gkzs9sd3w	cmo558etl01co100g73l27cj6	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cu100g4yb8zcre	cmo558etl01co100g73l27cj6	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cv100gffqsvpd2	cmo558etl01co100g73l27cj6	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cw100gw8ro2dps	cmo558etl01co100g73l27cj6	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cx100gdlaw3kvr	cmo558etl01co100g73l27cj6	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cy100gegc0nllu	cmo558etl01co100g73l27cj6	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01cz100gebojg26w	cmo558etl01co100g73l27cj6	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d0100grxv32gm8	cmo558etl01co100g73l27cj6	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d1100gub0vm1dh	cmo558etl01co100g73l27cj6	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d2100ggvjb40te	cmo558etl01co100g73l27cj6	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d3100gg44prg9j	cmo558etl01co100g73l27cj6	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d4100gmuzcdsik	cmo558etl01co100g73l27cj6	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d5100gvdbosqox	cmo558etl01co100g73l27cj6	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d6100gqwd44u67	cmo558etl01co100g73l27cj6	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d7100gkwxzj861	cmo558etl01co100g73l27cj6	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d8100gjq0lroy3	cmo558etl01co100g73l27cj6	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01d9100gwk8ifz51	cmo558etl01co100g73l27cj6	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01da100gxsegitcu	cmo558etl01co100g73l27cj6	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01db100gmdcghtmm	cmo558etl01co100g73l27cj6	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01dc100gm50l9bdy	cmo558etl01co100g73l27cj6	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01dd100ghwypuuwe	cmo558etl01co100g73l27cj6	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01de100g36nml73i	cmo558etl01co100g73l27cj6	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01df100g9m5uyqum	cmo558etl01co100g73l27cj6	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558etn01dg100gljmhdwnj	cmo558etl01co100g73l27cj6	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:25:07.595	2026-04-19 02:25:07.595	[]	\N	\N
cmo558jc301sn100gbq60it4w	cmo558jc201sm100gime9mmh3	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301so100glof0k0ug	cmo558jc201sm100gime9mmh3	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sp100gn9bjtyy4	cmo558jc201sm100gime9mmh3	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sq100gyhl6kmeo	cmo558jc201sm100gime9mmh3	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sr100goi8sc80w	cmo558jc201sm100gime9mmh3	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301ss100gtuuy6yfw	cmo558jc201sm100gime9mmh3	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301st100gnjtcuwlw	cmo558jc201sm100gime9mmh3	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301su100gwiixt1dj	cmo558jc201sm100gime9mmh3	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sv100g4s306ezj	cmo558jc201sm100gime9mmh3	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sw100gcgjiymws	cmo558jc201sm100gime9mmh3	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sx100giwmt8hbv	cmo558jc201sm100gime9mmh3	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sy100gt9moc57g	cmo558jc201sm100gime9mmh3	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301sz100gw0gjd9bd	cmo558jc201sm100gime9mmh3	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t0100g2nqlcxw3	cmo558jc201sm100gime9mmh3	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t1100gz42tgwex	cmo558jc201sm100gime9mmh3	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t2100g89whc588	cmo558jc201sm100gime9mmh3	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t3100ggbdhkbdu	cmo558jc201sm100gime9mmh3	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t4100g52wzr5um	cmo558jc201sm100gime9mmh3	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t5100go2rn8dfw	cmo558jc201sm100gime9mmh3	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t6100g8ryrqwzq	cmo558jc201sm100gime9mmh3	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t7100gmkprxdap	cmo558jc201sm100gime9mmh3	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t8100g0sq2tava	cmo558jc201sm100gime9mmh3	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301t9100gpdcy1b6q	cmo558jc201sm100gime9mmh3	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301ta100gy6yix86e	cmo558jc201sm100gime9mmh3	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301tb100gozukvhwl	cmo558jc201sm100gime9mmh3	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301tc100gf8u1gqz2	cmo558jc201sm100gime9mmh3	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301td100gf4a50yp0	cmo558jc201sm100gime9mmh3	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmo558jc301te100g6ko5li5d	cmo558jc201sm100gime9mmh3	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-19 02:25:13.444	2026-04-19 02:25:13.444	[]	\N	\N
cmocl1h6a00071w8sa3m4dw27	cmocl1h5z00061w8somwpt6jl	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a00081w8sjcwlagnc	cmocl1h5z00061w8somwpt6jl	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a00091w8snjqttaiy	cmocl1h5z00061w8somwpt6jl	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000a1w8slr1wnpai	cmocl1h5z00061w8somwpt6jl	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000b1w8s9yntzqd2	cmocl1h5z00061w8somwpt6jl	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000c1w8s11aj9268	cmocl1h5z00061w8somwpt6jl	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000d1w8svl8zkhq1	cmocl1h5z00061w8somwpt6jl	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000e1w8s124qys3f	cmocl1h5z00061w8somwpt6jl	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000f1w8sn06wd6z3	cmocl1h5z00061w8somwpt6jl	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000g1w8s0ajuabnq	cmocl1h5z00061w8somwpt6jl	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000h1w8su7yigyqv	cmocl1h5z00061w8somwpt6jl	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000i1w8ss0ikrlmz	cmocl1h5z00061w8somwpt6jl	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000j1w8stzqr4m1m	cmocl1h5z00061w8somwpt6jl	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000k1w8scs9m0jid	cmocl1h5z00061w8somwpt6jl	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000l1w8s9u106yec	cmocl1h5z00061w8somwpt6jl	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000m1w8so2hwel08	cmocl1h5z00061w8somwpt6jl	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000n1w8s2ulz66gq	cmocl1h5z00061w8somwpt6jl	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000o1w8sbl6n9c16	cmocl1h5z00061w8somwpt6jl	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000p1w8sdmn4i53w	cmocl1h5z00061w8somwpt6jl	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000q1w8snzldq7ka	cmocl1h5z00061w8somwpt6jl	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000r1w8shww9v55f	cmocl1h5z00061w8somwpt6jl	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000s1w8sxuchr2ep	cmocl1h5z00061w8somwpt6jl	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000t1w8synoympy6	cmocl1h5z00061w8somwpt6jl	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6a000u1w8scib13utz	cmocl1h5z00061w8somwpt6jl	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6b000v1w8s97ik7tkz	cmocl1h5z00061w8somwpt6jl	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6b000w1w8srhso384v	cmocl1h5z00061w8somwpt6jl	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6b000x1w8svmvjekm0	cmocl1h5z00061w8somwpt6jl	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocl1h6b000y1w8scxqbc9i8	cmocl1h5z00061w8somwpt6jl	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-24 07:22:01.138	2026-04-24 07:22:01.138	[]	\N	\N
cmocm2m7n001e1w8sl1j6pr6d	cmocm2m7d001d1w8s7yvaq24c	Conduct Training Needs Analysis (TNA)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	0	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7n001f1w8sj08ohwho	cmocm2m7d001d1w8s7yvaq24c	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7n001g1w8s1wgkw2cf	cmocm2m7d001d1w8s7yvaq24c	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7n001h1w8sq6pz74zs	cmocm2m7d001d1w8s7yvaq24c	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7n001i1w8szvad9g9t	cmocm2m7d001d1w8s7yvaq24c	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7n001j1w8sfh2k6jnr	cmocm2m7d001d1w8s7yvaq24c	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7n001k1w8s0frmbs3v	cmocm2m7d001d1w8s7yvaq24c	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001l1w8smup6gmsv	cmocm2m7d001d1w8s7yvaq24c	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001m1w8su8zdbu73	cmocm2m7d001d1w8s7yvaq24c	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001n1w8sccy78hyz	cmocm2m7d001d1w8s7yvaq24c	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001o1w8s0frdwdhc	cmocm2m7d001d1w8s7yvaq24c	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001p1w8si9mj4cxp	cmocm2m7d001d1w8s7yvaq24c	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001q1w8s014xj6j8	cmocm2m7d001d1w8s7yvaq24c	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001r1w8sysjkvdhd	cmocm2m7d001d1w8s7yvaq24c	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001s1w8s88xf8i2p	cmocm2m7d001d1w8s7yvaq24c	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001t1w8s1ix12ics	cmocm2m7d001d1w8s7yvaq24c	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001u1w8sm474vd6e	cmocm2m7d001d1w8s7yvaq24c	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001v1w8sapf2lhom	cmocm2m7d001d1w8s7yvaq24c	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001w1w8s7oa0q3tk	cmocm2m7d001d1w8s7yvaq24c	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001x1w8sa01v0njj	cmocm2m7d001d1w8s7yvaq24c	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001y1w8s06d7jhr7	cmocm2m7d001d1w8s7yvaq24c	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o001z1w8swq5l9tet	cmocm2m7d001d1w8s7yvaq24c	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o00201w8spdfaqmu4	cmocm2m7d001d1w8s7yvaq24c	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o00211w8srsoyr3qu	cmocm2m7d001d1w8s7yvaq24c	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o00221w8sc9uwliz9	cmocm2m7d001d1w8s7yvaq24c	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o00231w8shedo8933	cmocm2m7d001d1w8s7yvaq24c	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o00241w8sxrinlx67	cmocm2m7d001d1w8s7yvaq24c	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmocm2m7o00251w8s1uemd0kx	cmocm2m7d001d1w8s7yvaq24c	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-04-24 07:50:53.939	2026-04-24 07:50:53.939	[]	\N	\N
cmp1yna9z0003me1wc99xqacj	cmp1yna9m0001me1wc7e8bhkp	Prepare Training Proposal (FM-CT-4)	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	1	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z0004me1wyzmfcqgt	cmp1yna9m0001me1wc7e8bhkp	Secure approval of Training Proposal	\N	PLANNING	NOT_STARTED	CRITICAL	\N	\N	\N	\N	2	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z0005me1wedk50vzp	cmp1yna9m0001me1wc7e8bhkp	Identify and confirm resource persons/speakers	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	3	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z0006me1wxh0n57n3	cmp1yna9m0001me1wc7e8bhkp	Prepare and send invitation letters	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	4	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z0007me1wshh2kfrw	cmp1yna9m0001me1wc7e8bhkp	Prepare training design/program of activities	\N	PLANNING	NOT_STARTED	HIGH	\N	\N	\N	\N	5	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z0008me1wglr7qzk6	cmp1yna9m0001me1wc7e8bhkp	Prepare training materials and handouts	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	6	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z0009me1wg858ok2w	cmp1yna9m0001me1wc7e8bhkp	Prepare and reproduce evaluation forms (FM-CSF-ACT)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	7	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z000ame1w2rk95ocj	cmp1yna9m0001me1wc7e8bhkp	Prepare attendance sheet (FM-CT-2A)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	8	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z000bme1wi606dtmr	cmp1yna9m0001me1wc7e8bhkp	Coordinate logistics (venue, meals, equipment)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	9	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z000cme1wc98jgvns	cmp1yna9m0001me1wc7e8bhkp	Coordinate with training partners / requesting institution	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	10	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z000dme1wxjzi9rpe	cmp1yna9m0001me1wc7e8bhkp	Conduct promotional activities (press release, caravan)	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	11	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z000eme1w4wtgjg2m	cmp1yna9m0001me1wc7e8bhkp	Prepare certificates of participation/completion	\N	PREPARATION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	12	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000fme1wwmbgea9j	cmp1yna9m0001me1wc7e8bhkp	Review Training Monitoring Checklist (FM-CT-7)	\N	PREPARATION	NOT_STARTED	HIGH	\N	\N	\N	\N	13	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000gme1w5ky0tfzn	cmp1yna9m0001me1wc7e8bhkp	Registration of participants on-site	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	14	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000hme1w9ef4b9nx	cmp1yna9m0001me1wc7e8bhkp	Opening program and orientation	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	15	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000ime1wsz4fr1ty	cmp1yna9m0001me1wc7e8bhkp	Conduct sessions as per agenda	\N	EXECUTION	NOT_STARTED	CRITICAL	\N	\N	\N	\N	16	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000jme1wi4jqgqc8	cmp1yna9m0001me1wc7e8bhkp	Monitor training module and program flow	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	17	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000kme1w3ndi4l3x	cmp1yna9m0001me1wc7e8bhkp	Distribute and collect CSF forms (FM-CSF-ACT)	\N	EXECUTION	NOT_STARTED	HIGH	\N	\N	\N	\N	18	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000lme1wxr8z171t	cmp1yna9m0001me1wc7e8bhkp	Document proceedings (photos, videos, minutes)	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	19	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000mme1wcmi6pcc8	cmp1yna9m0001me1wc7e8bhkp	Closing program	\N	EXECUTION	NOT_STARTED	MEDIUM	\N	\N	\N	\N	20	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000nme1w8khp800w	cmp1yna9m0001me1wc7e8bhkp	Consolidate attendance and registration records	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	21	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000ome1wk5i44q1k	cmp1yna9m0001me1wc7e8bhkp	Prepare Post-Activity Report (FM-CT-5)	\N	POST_EVENT	NOT_STARTED	CRITICAL	\N	\N	\N	\N	22	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000pme1wdvaf7o8i	cmp1yna9m0001me1wc7e8bhkp	Tabulate CSF Summary and Analysis	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	23	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000qme1wwaiejsov	cmp1yna9m0001me1wc7e8bhkp	Submit report to DTI Regional Office / MSMED Dev Division	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	24	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000rme1wjk648q5m	cmp1yna9m0001me1wc7e8bhkp	Provide feedback/technical support (follow-up mentoring)	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	25	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000sme1wugpcxtgv	cmp1yna9m0001me1wc7e8bhkp	Issue certificates to participants	\N	POST_EVENT	NOT_STARTED	HIGH	\N	\N	\N	\N	26	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1ynaa0000tme1wr4671wjz	cmp1yna9m0001me1wc7e8bhkp	File/archive training documents	\N	POST_EVENT	NOT_STARTED	MEDIUM	\N	\N	\N	\N	27	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:08.039	[]	\N	\N
cmp1yna9z0002me1wxehaw8lq	cmp1yna9m0001me1wc7e8bhkp	Conduct Training Needs Analysis (TNA)	\N	PLANNING	COMPLETED	CRITICAL	\N	2026-05-12 01:37:30.278	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	0	\N	2026-05-12 01:37:08.039	2026-05-12 01:37:30.279	[]	\N	\N
\.


--
-- Data for Name: csf_speaker_ratings; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.csf_speaker_ratings (id, csf_response_id, speaker_id, rating) FROM stdin;
cmo4ffse0002nsq0jt3tpjg8v	cmo4ffrhq002ksq0j9slh1d2u	cmo4ffr1p001hsq0jlue5w84q	5
cmo4fm9cu001g13i6sre7cgoc	cmo4fm8f3001d13i6rgkz356u	cmo4fm7y5000a13i6mdvs6okj	5
cmo555htd00efbf08nd6dkyui	cmo555hql00ddbf08eafml8o5	cmo555fbq0069bf08mhz1ucxq	5
cmo555hu700eibf08n3p7qr0n	cmo555hql00debf08ygjowmpl	cmo555fbq0069bf08mhz1ucxq	4
cmo555hv100elbf08s3ldkywi	cmo555hql00dfbf08ekb1l3um	cmo555fbq0069bf08mhz1ucxq	5
cmo555hwg00eobf08qxlx09qq	cmo555hql00dhbf08hhxjfmte	cmo555fbq0069bf08mhz1ucxq	4
cmo555hxv00erbf080afgyqsn	cmo555hql00djbf08ue2ls5px	cmo555fbq0069bf08mhz1ucxq	5
cmo555hyq00eubf08k51zbbon	cmo555hql00dkbf08hfo0xsgs	cmo555fbq0069bf08mhz1ucxq	5
cmo555hzm00exbf0823uewz5x	cmo555hql00dlbf08ign7sltl	cmo555fbq0069bf08mhz1ucxq	5
cmo555i0g00f0bf08a6ka7tno	cmo555hql00dmbf08xw804chb	cmo555fbq0069bf08mhz1ucxq	5
cmo555i1v00f3bf08fh0klbgf	cmo555hql00dobf08zuoshy43	cmo555fbq0069bf08mhz1ucxq	4
cmo555i2o00f6bf08v9n3j6fy	cmo555hql00dpbf08jb4hc7nb	cmo555fbq0069bf08mhz1ucxq	5
cmo555i4200f9bf08b5w8qhdb	cmo555hql00drbf08j02rtymu	cmo555fbq0069bf08mhz1ucxq	4
cmo555i4w00fcbf08ms7rqio2	cmo555hqm00dsbf083ezb7hgo	cmo555fbq0069bf08mhz1ucxq	5
cmo555i5p00ffbf08uhu5yz0y	cmo555hqm00dtbf08r443ela1	cmo555fbq0069bf08mhz1ucxq	4
cmo555i7400fibf08smlh7txo	cmo555hqm00dvbf08fdfsiikd	cmo555fbq0069bf08mhz1ucxq	4
cmo555i7x00flbf08jrt21c67	cmo555hqm00dwbf08go08wnsy	cmo555fbq0069bf08mhz1ucxq	5
cmo555i8r00fobf083wagh6rv	cmo555hqm00dxbf089p7yohnk	cmo555fbq0069bf08mhz1ucxq	4
cmo555ia500frbf083qfsu6qa	cmo555hqm00dzbf08jj3fye3r	cmo555fbq0069bf08mhz1ucxq	5
cmo555iaz00fubf08hbawvqh6	cmo555hqm00e0bf08vbsxw8c8	cmo555fbq0069bf08mhz1ucxq	4
cmo555ibr00fxbf0822m8jq0l	cmo555hqm00e1bf08wwaha4bz	cmo555fbq0069bf08mhz1ucxq	5
cmo555id600g0bf0873mryk8p	cmo555hqm00e3bf08i8g471py	cmo555fbq0069bf08mhz1ucxq	5
cmo555iel00g3bf08lwfzuch0	cmo555hqm00e5bf086fn1axrt	cmo555fbq0069bf08mhz1ucxq	5
cmo555iff00g6bf08smtmok4j	cmo555hqm00e6bf08g6in1k2i	cmo555fbq0069bf08mhz1ucxq	5
cmo555ig800g9bf08inafrgct	cmo555hqm00e7bf08atmvm75x	cmo555fbq0069bf08mhz1ucxq	4
cmo555ih000gcbf080bjf4y7y	cmo555hqm00e8bf08dkmcdbe9	cmo555fbq0069bf08mhz1ucxq	5
cmo555ihw00gfbf08xnau6cah	cmo555hqm00e9bf08u2mq2hfj	cmo555fbq0069bf08mhz1ucxq	4
cmo555kno00pmbf08l231qw3j	cmo555klq00owbf08epwavh7u	cmo555j2a00jzbf08nl6ye0u3	4
cmo555koh00ppbf083p2p278l	cmo555klq00oxbf08facd75oe	cmo555j2a00jzbf08nl6ye0u3	4
cmo555kqf00psbf08qkxd2o9a	cmo555klq00p0bf089z3gl4dq	cmo555j2a00jzbf08nl6ye0u3	4
cmo555krr00pvbf08anl4bgc8	cmo555klq00p2bf08tbfs5ece	cmo555j2a00jzbf08nl6ye0u3	5
cmo555ksj00pybf08dgoohupv	cmo555klq00p3bf083nylcbtl	cmo555j2a00jzbf08nl6ye0u3	4
cmo555ktc00q1bf0867wzck83	cmo555klq00p4bf08qcny1baa	cmo555j2a00jzbf08nl6ye0u3	5
cmo555kuq00q4bf08zn3e65e1	cmo555klq00p6bf08oj3490hp	cmo555j2a00jzbf08nl6ye0u3	5
cmo555kvl00q7bf08o4hzk25n	cmo555klq00p7bf08qtw18shi	cmo555j2a00jzbf08nl6ye0u3	5
cmo555kx000qabf088vr5d02u	cmo555klq00p9bf084zq3b6lc	cmo555j2a00jzbf08nl6ye0u3	4
cmo555kxt00qdbf08mdngf4tv	cmo555klq00pabf087v49t4mg	cmo555j2a00jzbf08nl6ye0u3	5
cmo555kza00qgbf08nf9uow96	cmo555klq00pcbf08q145w3yj	cmo555j2a00jzbf08nl6ye0u3	4
cmo555l0o00qjbf089z1exm6w	cmo555klq00pebf08exbsupig	cmo555j2a00jzbf08nl6ye0u3	4
cmo555l1h00qmbf08zy43y5u3	cmo555klq00pfbf08u0c94gqu	cmo555j2a00jzbf08nl6ye0u3	4
cmo555l2b00qpbf08f8dui3mg	cmo555klq00pgbf08v3zjcq17	cmo555j2a00jzbf08nl6ye0u3	4
cmo5584jm00az100g64iwwy9n	cmo5584h8009j100gfxgryrwl	cmo55817n000a100go0jffgd5	5
cmo5584lr00b2100gqzo4uc98	cmo5584h8009m100g7j7eojay	cmo55817n000a100go0jffgd5	5
cmo5584mn00b5100goxdxo9u6	cmo5584h8009n100gc4nkl42h	cmo55817n000a100go0jffgd5	4
cmo5584nj00b8100g0spucdpc	cmo5584h8009o100gy8rl7vgr	cmo55817n000a100go0jffgd5	4
cmo5584oz00bb100g8ysxffxv	cmo5584h8009q100gdj0yl489	cmo55817n000a100go0jffgd5	5
cmo5584pv00be100guem8fju1	cmo5584h8009r100gqcdh1w5c	cmo55817n000a100go0jffgd5	4
cmo5584s200bh100gexp193ny	cmo5584h8009u100g0dh1wx58	cmo55817n000a100go0jffgd5	5
cmo5584sv00bk100gpsxhwuhw	cmo5584h8009v100g5bml6nm4	cmo55817n000a100go0jffgd5	4
cmo5584uy00bn100g91h7u11b	cmo5584h9009y100grs0v3cx7	cmo55817n000a100go0jffgd5	5
cmo5584xn00bq100g94a777n9	cmo5584h900a2100g2afz17uh	cmo55817n000a100go0jffgd5	4
cmo5584yg00bt100g77geuy01	cmo5584h900a3100gpns15ri2	cmo55817n000a100go0jffgd5	4
cmo5584zt00bw100g9x1gulas	cmo5584h900a5100gf0l0hiaj	cmo55817n000a100go0jffgd5	4
cmo55851900bz100gvbj58o7t	cmo5584h900a7100gvr4vhfoz	cmo55817n000a100go0jffgd5	4
cmo55852300c2100gnkio7qi5	cmo5584h900a8100gxwb3tf8n	cmo55817n000a100go0jffgd5	5
cmo55853n00c5100gnm2qkt37	cmo5584h900aa100gxmqdjmr4	cmo55817n000a100go0jffgd5	4
cmo55854i00c8100gvkd27ofh	cmo5584h900ab100ga470mrr4	cmo55817n000a100go0jffgd5	5
cmo55855d00cb100gasqivnv1	cmo5584h900ac100gym1dmzgo	cmo55817n000a100go0jffgd5	5
cmo55856800ce100gfjgengse	cmo5584h900ad100gm56nxhcz	cmo55817n000a100go0jffgd5	4
cmo55857r00ch100gjkar2tif	cmo5584h900af100g19gawdz0	cmo55817n000a100go0jffgd5	5
cmo55859900ck100g8y1b3o60	cmo5584h900ah100gd5f2yoq8	cmo55817n000a100go0jffgd5	4
cmo5585a100cn100g0nlx308d	cmo5584h900ai100gpgvl6k15	cmo55817n000a100go0jffgd5	4
cmo5585ax00cq100g3uzfsahz	cmo5584h900aj100gvith18oq	cmo55817n000a100go0jffgd5	4
cmo5585cy00ct100g68i8oad1	cmo5584h900am100ghhg3dbaf	cmo55817n000a100go0jffgd5	4
cmo5585dq00cw100gz6ausc86	cmo5584h900an100g1qdypqev	cmo55817n000a100go0jffgd5	4
cmo5585f800cz100gfw6u48pd	cmo5584h900ap100gsgtptyn1	cmo55817n000a100go0jffgd5	5
cmo5585hx00d2100gxgv3t0i2	cmo5584h900at100gxp7mzzvr	cmo55817n000a100go0jffgd5	4
cmo5585iq00d5100g2nmo5we0	cmo5584h900au100gbm28xbt9	cmo55817n000a100go0jffgd5	5
cmo5585jl00d8100gwskwngxx	cmo5584h900av100glbkqt2fa	cmo55817n000a100go0jffgd5	4
cmo55892k00r0100gm5nfx0zc	cmo55890f00pk100gc3skkas2	cmo5585t800gb100g06o0741v	5
cmo55893d00r3100gpky78gl2	cmo55890f00pl100gn5n17kwq	cmo5585t800gb100g06o0741v	4
cmo55895h00r6100ghe1wscue	cmo55890f00po100gifsojihe	cmo5585t800gb100g06o0741v	4
cmo55896a00r9100gemd5ep6r	cmo55890f00pp100g5gp6zcpv	cmo5585t800gb100g06o0741v	5
cmo55897400rc100gmckywuiz	cmo55890f00pq100g8t59s9yf	cmo5585t800gb100g06o0741v	4
cmo55897y00rf100g6u49uzd4	cmo55890f00pr100gkzqzswxw	cmo5585t800gb100g06o0741v	5
cmo55899z00ri100gfdqxdq90	cmo55890f00pu100gnram0x2o	cmo5585t800gb100g06o0741v	4
cmo5589bg00rl100geby68o8i	cmo55890f00pw100g0gm8mapv	cmo5585t800gb100g06o0741v	5
cmo5589c900ro100g4251tcyj	cmo55890f00px100gt62wysm7	cmo5585t800gb100g06o0741v	4
cmo5589eb00rr100gglnvkl2b	cmo55890f00q0100gzu39q6pw	cmo5585t800gb100g06o0741v	4
cmo5589hl00ru100gzig41a2j	cmo55890f00q5100g9jr2lt3m	cmo5585t800gb100g06o0741v	5
cmo5589if00rx100gtaw0yewt	cmo55890f00qn100gm9skq78i	cmo5585t800gb100g06o0741v	4
cmo5589lp00s0100g9tey07o4	cmo55890f00qa100gmvgf3ras	cmo5585t800gb100g06o0741v	5
cmo5589nr00s3100gk44ptr3j	cmo55890f00qd100gf5abci22	cmo5585t800gb100g06o0741v	4
cmo5589p800s6100gbs4d042c	cmo55890f00qf100gap6u58u1	cmo5585t800gb100g06o0741v	4
cmo5589q100s9100gzl7oka1o	cmo55890f00qg100gei92wxkn	cmo5585t800gb100g06o0741v	4
cmo5589rh00sc100giomlxkvf	cmo55890f00qi100gyuyn1ehw	cmo5585t800gb100g06o0741v	5
cmo5589sb00sf100gyud9g8xl	cmo55890f00qj100g7u063sfr	cmo5585t800gb100g06o0741v	4
cmo5589t600si100g7m4cwjq4	cmo55890f00qk100gbct26xs8	cmo5585t800gb100g06o0741v	4
cmo5589ul00sl100gjbgm7381	cmo55890f00qm100gd0uin7tx	cmo5585t800gb100g06o0741v	4
cmo5589vf00so100g5b7che3n	cmo55890f00qo100gh1fgtyvg	cmo5585t800gb100g06o0741v	4
cmo5589wa00sr100ggmb2oqk2	cmo55890f00qp100g6dy1eo6m	cmo5585t800gb100g06o0741v	5
cmo5589x400su100gt9x1kbuk	cmo55890f00qq100glx48b4u7	cmo5585t800gb100g06o0741v	5
cmo5589z700sx100gxs0ok2kp	cmo55890f00qt100gpqm41ayd	cmo5585t800gb100g06o0741v	5
cmo558a0100t0100gitbmbbe5	cmo55890f00qu100gbk87rn7i	cmo5585t800gb100g06o0741v	4
cmo558dip016s100glgcqbapc	cmo558dg3015d100grz1xmiwk	cmo558a8z00w3100ggj9hi6q0	4
cmo558djg016v100gftu4rx4y	cmo558dg3015e100gl78l29tl	cmo558a8z00w3100ggj9hi6q0	4
cmo558dk6016y100g35uv14d7	cmo558dg3015f100g5u3x4if6	cmo558a8z00w3100ggj9hi6q0	4
cmo558dkw0171100gavc29jzu	cmo558dg3015g100gvfoiz32p	cmo558a8z00w3100ggj9hi6q0	4
cmo558dlm0174100g5uu03c3u	cmo558dg3015h100gbrjlgtxf	cmo558a8z00w3100ggj9hi6q0	5
cmo558dmd0177100gu3iv6875	cmo558dg3015i100g4si5yp3d	cmo558a8z00w3100ggj9hi6q0	5
cmo558dnt017a100gyc8fdcdf	cmo558dg3015k100go6io2g90	cmo558a8z00w3100ggj9hi6q0	5
cmo558dpa017d100gw5uy73uq	cmo558dg3015m100gdq4xk97i	cmo558a8z00w3100ggj9hi6q0	4
cmo558dqt017g100ghdxiys4h	cmo558dg3015o100gj6158z6c	cmo558a8z00w3100ggj9hi6q0	4
cmo558dro017j100gcx3s6jca	cmo558dg3015p100gy9j87yeg	cmo558a8z00w3100ggj9hi6q0	5
cmo558dsk017m100gv8huy9sq	cmo558dg3015q100g01rt6q81	cmo558a8z00w3100ggj9hi6q0	5
cmo558dtf017p100gnyctpowz	cmo558dg3015r100g34e0hw7q	cmo558a8z00w3100ggj9hi6q0	4
cmo558dua017s100g7be72kgx	cmo558dg3015s100giznb9hqo	cmo558a8z00w3100ggj9hi6q0	4
cmo558dvs017v100gzvk9ztus	cmo558dg3015u100gol4wj7l3	cmo558a8z00w3100ggj9hi6q0	4
cmo558dx9017y100g4eaz76j1	cmo558dg30163100gojonvexm	cmo558a8z00w3100ggj9hi6q0	5
cmo558dyp0181100ggpuskn3d	cmo558dg3015w100goln9z1tu	cmo558a8z00w3100ggj9hi6q0	4
cmo558dzj0184100g4dqvrnzx	cmo558dg3015x100gaht9wrc1	cmo558a8z00w3100ggj9hi6q0	5
cmo558e0d0187100ggrm13lve	cmo558dg3015y100ggs217j97	cmo558a8z00w3100ggj9hi6q0	4
cmo558e18018a100gj06leg4o	cmo558dg3015z100gvuiss02e	cmo558a8z00w3100ggj9hi6q0	5
cmo558e22018d100gz1d11iy1	cmo558dg30160100gyg2u4mhl	cmo558a8z00w3100ggj9hi6q0	5
cmo558e2w018g100gi1pqx0e6	cmo558dg30161100g1ru6433j	cmo558a8z00w3100ggj9hi6q0	5
cmo558e3p018j100gvy3vya8u	cmo558dg30164100gwp7okz09	cmo558a8z00w3100ggj9hi6q0	5
cmo558e54018m100g02ugl7d8	cmo558dg30166100g376issjs	cmo558a8z00w3100ggj9hi6q0	4
cmo558e5z018p100guf9z1ib2	cmo558dg30167100gsog5fhus	cmo558a8z00w3100ggj9hi6q0	4
cmo558e9a018s100gkh3m1pcm	cmo558dg3016c100gx33sywf1	cmo558a8z00w3100ggj9hi6q0	4
cmo558ea6018v100gy6idyl9o	cmo558dg3016d100gxc2pxyl6	cmo558a8z00w3100ggj9hi6q0	4
cmo558eb2018y100gq5iz3ygb	cmo558dg3016e100gep1entne	cmo558a8z00w3100ggj9hi6q0	4
cmo558ebx0191100gd7e55i4r	cmo558dg3016f100gu6e3ocxm	cmo558a8z00w3100ggj9hi6q0	4
cmo558ecr0194100gmp29c93i	cmo558dg3016g100g461xijbm	cmo558a8z00w3100ggj9hi6q0	5
cmo558edn0197100g4ixk0nxj	cmo558dg3016h100gv4w608vq	cmo558a8z00w3100ggj9hi6q0	4
cmo558eeh019a100gycj3pfj0	cmo558dg3016i100g6zuhi1et	cmo558a8z00w3100ggj9hi6q0	4
cmo558efc019d100gyx4qhkk8	cmo558dg3016j100gex4ffrcn	cmo558a8z00w3100ggj9hi6q0	5
cmo558egt019g100gfryf0jv3	cmo558dg3016l100gsp12kkty	cmo558a8z00w3100ggj9hi6q0	4
cmo558eho019j100gclqyu261	cmo558dg3016m100gplwfkbjl	cmo558a8z00w3100ggj9hi6q0	4
cmo558i0d01nb100gfzbu5jde	cmo558hx101lx100gpntr5r0d	cmo558eqa01cm100gkh5cv1ev	4
cmo558i1801ne100gsmnc9xtu	cmo558hx101ly100gz2v72m4h	cmo558eqa01cm100gkh5cv1ev	4
cmo558i2201nh100git4ne08u	cmo558hx101lz100gsy5r8xpu	cmo558eqa01cm100gkh5cv1ev	5
cmo558i2w01nk100g4sqez9fq	cmo558hx101m0100guszgkr3l	cmo558eqa01cm100gkh5cv1ev	5
cmo558i3s01nn100g170ql9hw	cmo558hx101m1100gsdfgvf0p	cmo558eqa01cm100gkh5cv1ev	5
cmo558i4m01nq100gtp9rlmds	cmo558hx101m2100gg2fib818	cmo558eqa01cm100gkh5cv1ev	4
cmo558i6301nt100g8o72w2b5	cmo558hx101m4100gs9rqvujn	cmo558eqa01cm100gkh5cv1ev	5
cmo558i8e01nw100gug4umw9u	cmo558hx101m6100gpu8nv34w	cmo558eqa01cm100gkh5cv1ev	5
cmo558ib601nz100glc0m6w61	cmo558hx101ma100gvhry9jaj	cmo558eqa01cm100gkh5cv1ev	4
cmo558ic101o2100guf9x5fxe	cmo558hx101mb100g23ptvlmk	cmo558eqa01cm100gkh5cv1ev	5
cmo558idj01o5100guqofwft4	cmo558hx101md100geg0r3ekj	cmo558eqa01cm100gkh5cv1ev	5
cmo558ifm01o8100g7vdvrvt0	cmo558hx101mg100gqqbi2j6v	cmo558eqa01cm100gkh5cv1ev	4
cmo558ih501ob100gn5or07bk	cmo558hx101mi100gknlqtkrv	cmo558eqa01cm100gkh5cv1ev	5
cmo558ii001oe100gw3mabu2y	cmo558hx101mj100g7u9mgjbo	cmo558eqa01cm100gkh5cv1ev	4
cmo558iiu01oh100g71yjbq77	cmo558hx101mk100gcwghltoa	cmo558eqa01cm100gkh5cv1ev	4
cmo558ijp01ok100gb3k25nlx	cmo558hx101ml100gvt3ddlay	cmo558eqa01cm100gkh5cv1ev	4
cmo558ikk01on100gfia36sf9	cmo558hx101mm100gtjt19fdx	cmo558eqa01cm100gkh5cv1ev	5
cmo558im101oq100g74c1bzsc	cmo558hx101mo100gb0kiedfh	cmo558eqa01cm100gkh5cv1ev	5
cmo558imv01ot100gkwwom600	cmo558hx101mp100gl4rbgnt7	cmo558eqa01cm100gkh5cv1ev	5
cmo558iq901ow100gjfd08mxp	cmo558hx101mu100g606bhggp	cmo558eqa01cm100gkh5cv1ev	5
cmo558it001oz100gj5e2hmb5	cmo558hx201my100gugi3c1v2	cmo558eqa01cm100gkh5cv1ev	4
cmo558iuj01p2100grqyk38em	cmo558hx201n0100gn3on31e5	cmo558eqa01cm100gkh5cv1ev	4
cmo558iw201p5100go95fo2kr	cmo558hx201n2100g39e3yd7c	cmo558eqa01cm100gkh5cv1ev	5
cmo558iww01p8100gsf2d0fqa	cmo558hx201n3100gyghsnoox	cmo558eqa01cm100gkh5cv1ev	5
cmo558ixq01pb100gneyuhys4	cmo558hx201n4100gu4rg0pgx	cmo558eqa01cm100gkh5cv1ev	4
cmo558izt01pe100goxcvzhj6	cmo558hx201n7100g8pqxqxo2	cmo558eqa01cm100gkh5cv1ev	5
cmo558j0o01ph100g99f76fk2	cmo558hx201n8100gclmhopjs	cmo558eqa01cm100gkh5cv1ev	4
cmo558mka0239100gvfus9hcy	cmo558mi7021t100gm71fo43u	cmo558j8x01sk100gl13ahskc	4
cmo558mmd023c100g8vvxv2kn	cmo558mi7021w100g9doa5qpz	cmo558j8x01sk100gl13ahskc	4
cmo558mn8023f100g48pu3vw0	cmo558mi7021x100goj6ij2up	cmo558j8x01sk100gl13ahskc	4
cmo558mo2023i100glp0lr7n4	cmo558mi7021y100gul8tutoq	cmo558j8x01sk100gl13ahskc	5
cmo558mow023l100g78735fyv	cmo558mi8022v100gfub1ykbv	cmo558j8x01sk100gl13ahskc	5
cmo558mpq023o100gnuf36cn7	cmo558mi7021z100gh0brav16	cmo558j8x01sk100gl13ahskc	5
cmo558mr7023r100gdhkmlsdd	cmo558mi70221100gqppbcw8c	cmo558j8x01sk100gl13ahskc	5
cmo558ms1023u100ga22vuc45	cmo558mi70222100gyeuj3dyq	cmo558j8x01sk100gl13ahskc	4
cmo558msw023x100gitref646	cmo558mi80223100gw5hy71qj	cmo558j8x01sk100gl13ahskc	5
cmo558mw80240100g97exarjh	cmo558mi80228100g888pfezg	cmo558j8x01sk100gl13ahskc	5
cmo558mx20243100ga1bzifsm	cmo558mi80229100gimzrahx5	cmo558j8x01sk100gl13ahskc	4
cmo558mxw0246100gvi32vcvu	cmo558mi8022a100gi0l1duyr	cmo558j8x01sk100gl13ahskc	5
cmo558myr0249100gkmd8r84n	cmo558mi8022b100gtymylksf	cmo558j8x01sk100gl13ahskc	5
cmo558n0u024c100gac8zakre	cmo558mi8022e100gb44k4hx0	cmo558j8x01sk100gl13ahskc	4
cmo558n1n024f100gad6opebx	cmo558mi8022f100g7oom9cae	cmo558j8x01sk100gl13ahskc	4
cmo558n2i024i100gwqkvz6v0	cmo558mi8022g100gvsyrgzf9	cmo558j8x01sk100gl13ahskc	5
cmo558n4i024l100gixaqk3mu	cmo558mi8022j100guw08v0vy	cmo558j8x01sk100gl13ahskc	5
cmo558n5b024o100gf5fhn3gy	cmo558mi8022k100gai956hyi	cmo558j8x01sk100gl13ahskc	4
cmo558n67024r100gx4hxkz66	cmo558mi8022l100g0yabuxf7	cmo558j8x01sk100gl13ahskc	4
cmo558n70024u100gi3lscsfy	cmo558mi8022m100ge1lhsjas	cmo558j8x01sk100gl13ahskc	5
cmo558n7v024x100g6aswtyi6	cmo558mi8022n100gilpigbgu	cmo558j8x01sk100gl13ahskc	5
cmo558n8p0250100gmfvs6xwa	cmo558mi8022o100gbdbx7fxp	cmo558j8x01sk100gl13ahskc	5
cmo558n9k0253100gc7my6989	cmo558mi8022p100gag3v71wy	cmo558j8x01sk100gl13ahskc	5
cmo558neb0256100gweelm4fn	cmo558mi8022x100g85azchdk	cmo558j8x01sk100gl13ahskc	4
cmo558ngb0259100g5i6omjpo	cmo558mi80230100gapeu14pv	cmo558j8x01sk100gl13ahskc	5
cmo558nh1025c100gsqtp24i5	cmo558mi80231100gorgly0wc	cmo558j8x01sk100gl13ahskc	4
cmo558nhs025f100ga72na2oc	cmo558mi80232100g69xgcpbb	cmo558j8x01sk100gl13ahskc	4
cmo558nj7025i100g8edq68ii	cmo558mi80234100g5dk3xc5g	cmo558j8x01sk100gl13ahskc	5
cmo558nk0025l100guibpkfk8	cmo558mi80235100gf29bdaax	cmo558j8x01sk100gl13ahskc	5
cmo558nkv025o100gq9avc7bt	cmo558mi80236100gcm37nqt3	cmo558j8x01sk100gl13ahskc	5
cmo567qpc0002vzcvw5sixg3w	cmo558dg3016b100gjaxbes3x	cmo558a8z00w3100ggj9hi6q0	3
cmocmhf77002u1w8sv74va9cg	cmocmeu2d002q1w8s6yza4t4m	cmocm57r7002f1w8srtzl18u6	5
cmocmi63z002x1w8ss74ud1op	cmocmeu2d002r1w8s1qdm2jzg	cmocm57r7002f1w8srtzl18u6	5
cmp1zemmf0019me1wi6hgk1if	cmp1zd2cf0016me1wt68v899x	cmp1zblmg0011me1wnm6vwjpc	2
\.


--
-- Data for Name: csf_survey_responses; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.csf_survey_responses (id, participation_id, event_id, user_id, status, sqd0_overall_rating, sqd1_responsiveness, sqd2_reliability, sqd3_access_facilities, sqd4_communication, sqd5_costs, sqd6_integrity, sqd7_assurance, sqd8_outcome, cc1_awareness, cc2_visibility, cc3_usefulness, highlights_feedback, improvements_feedback, comments_suggestions, reasons_for_low_rating, submitted_at, expires_at, created_at) FROM stdin;
cmo4ffrhq002ksq0j9slh1d2u	cmo4ffr8g002dsq0jkn6nkvlb	cmo4ffqxm0017sq0jpfl3sswp	cmo4ffqox001rh97sicpq93hx	SUBMITTED	5	4	5	4	5	4	5	5	4	1	1	1	Excellent training on digital marketing. Very relevant to my business.	Could include more hands-on exercises with actual platforms.	Please organize more trainings like this for MSMEs in the Visayas.	\N	2026-04-18 14:23:01.727	2026-05-02 14:23:00.59	2026-04-18 14:23:00.591
cmp1zd2cf0016me1wt68v899x	cmp1yzo65000vme1wf4o7vbwz	cmp171iiu00005ckaazxybh61	cmoebag5v0001e1ef35z9m1xm	SUBMITTED	1	2	3	3	2	3	1	1	2	1	2	2	\N	\N	ttest	test	2026-05-12 01:58:23.719	2026-06-11 01:57:10.814	2026-05-12 01:57:10.815
cmo4fm8f3001d13i6rgkz356u	cmo4fm85h001613i6frvlogxd	cmo4fm7tl000013i65nq60ql9	cmo4fm7ho002mh97swd7ejic0	SUBMITTED	5	4	5	4	5	4	5	5	4	1	1	1	Excellent training on digital marketing. Very relevant to my business.	Could include more hands-on exercises with actual platforms.	Please organize more trainings like this for MSMEs in the Visayas.	\N	2026-04-18 14:28:03.661	2026-05-02 14:28:02.462	2026-04-18 14:28:02.463
cmo558dg3015c100geb1zwyqe	cmo558aej00x1100gjfolfv6j	cmo558a7c00vt100gkftjgmsa	cmo557fo900e77b0ke9zfa12t	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo555hql00ddbf08eafml8o5	cmo555fj9007bbf0828kybt32	cmo555f9x005zbf0853edgeal	cmo554yz1000qex7qdvbqy248	SUBMITTED	5	4	5	5	4	\N	3	4	5	2	4	1	Speaker was engaging and answered all questions thoroughly	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.499	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00debf08ygjowmpl	cmo555fkc007fbf08etphgmfy	cmo555f9x005zbf0853edgeal	cmo554z4j000vex7q1oq94pkd	SUBMITTED	4	5	4	4	5	\N	4	4	4	2	4	1	Well-organized event with knowledgeable speakers	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.532	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dfbf08ekb1l3um	cmo555fli007jbf082suvf5qw	cmo555f9x005zbf0853edgeal	cmo554z9c0010ex7qbkmvrue1	SUBMITTED	5	5	3	5	5	\N	4	5	4	1	3	1	Great networking opportunity with fellow entrepreneurs	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.562	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dhbf08hhxjfmte	cmo555fnq007rbf088e2kkabk	cmo555f9x005zbf0853edgeal	cmo554ziy001aex7q91ump9i0	SUBMITTED	4	5	4	5	5	\N	3	4	5	3	3	1	This session gave me new ideas for my business	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.613	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00djbf08ue2ls5px	cmo555fqi007zbf08lrruk7l6	cmo555f9x005zbf0853edgeal	cmo554zsp001kex7qyvjggvkt	SUBMITTED	4	4	4	5	5	\N	3	4	3	4	1	3	Perfect venue and well-managed logistics	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.664	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dlbf08ign7sltl	cmo555ft30087bf08t0jnaqaz	cmo555f9x005zbf0853edgeal	cmo55502n001uex7q1xhmm0u6	SUBMITTED	5	5	3	4	5	\N	3	4	3	1	4	3	This session gave me new ideas for my business	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.726	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dobf08zuoshy43	cmo555fwe008jbf08a6e1h8r1	cmo555f9x005zbf0853edgeal	cmo5550hc0029ex7qrnpv4kdm	SUBMITTED	4	4	5	5	5	\N	5	5	3	2	2	3	The hands-on exercises were very helpful and practical	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.809	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00drbf08j02rtymu	cmo555fzp008vbf085djtyarf	cmo555f9x005zbf0853edgeal	cmo5550vv002oex7q340uf20w	SUBMITTED	5	4	4	4	4	\N	5	5	5	4	3	1	Well-organized event with knowledgeable speakers	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.887	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00dtbf08r443ela1	cmo555g1u0093bf083os1gbbz	cmo555f9x005zbf0853edgeal	cmo55515h002yex7qu97zuqp5	SUBMITTED	4	5	3	4	5	\N	4	5	4	2	4	2	Great networking opportunity with fellow entrepreneurs	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.946	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00dwbf08go08wnsy	cmo555g53009fbf08unc2oh4w	cmo555f9x005zbf0853edgeal	cmo5551ju003dex7qw677xuzp	SUBMITTED	5	4	5	5	4	\N	5	4	5	3	4	1	Well-organized event with knowledgeable speakers	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.026	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e0bf08vbsxw8c8	cmo555g9h009vbf08vunga1vd	cmo555f9x005zbf0853edgeal	cmo555238003xex7qaeka0et6	SUBMITTED	5	4	5	5	5	\N	5	5	4	3	2	1	Perfect venue and well-managed logistics	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.136	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e3bf08i8g471py	cmo555gcp00a7bf083lyprtsw	cmo555f9x005zbf0853edgeal	cmo5552hr004cex7q9922plh9	SUBMITTED	4	4	3	5	4	\N	5	5	3	3	1	2	Highly applicable training, will implement learnings immediately	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.215	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e6bf08g6in1k2i	cmo555gg000ajbf085dkibndd	cmo555f9x005zbf0853edgeal	cmo5552wj004rex7qp77yh9hd	SUBMITTED	5	5	5	5	4	\N	5	4	5	1	3	3	The hands-on exercises were very helpful and practical	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.296	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e8bf08dkmcdbe9	cmo555gi600arbf08666y1ss9	cmo555f9x005zbf0853edgeal	cmo55536b0051ex7qx1hup7wg	SUBMITTED	5	5	4	5	4	\N	3	4	3	1	2	3	The training materials were comprehensive and easy to follow	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.353	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dkbf08hfo0xsgs	cmo555fru0083bf08cyckm2ol	cmo555f9x005zbf0853edgeal	cmo554zxn001pex7q0qm5ql5z	SUBMITTED	5	5	4	5	5	\N	4	5	3	3	1	3	Very relevant to my business needs, learned a lot	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.694	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dmbf08xw804chb	cmo555fu9008bbf08jh0vr1kb	cmo555f9x005zbf0853edgeal	cmo55507n001zex7qhbbrvrpf	SUBMITTED	5	4	4	5	4	\N	3	5	5	3	3	1	Speaker was engaging and answered all questions thoroughly	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.757	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dpbf08jb4hc7nb	cmo555fxk008nbf08rkpchl5s	cmo555f9x005zbf0853edgeal	cmo5550m4002eex7q9usd5an7	SUBMITTED	4	5	4	4	5	\N	5	4	4	2	2	3	Well-organized event with knowledgeable speakers	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.837	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00dsbf083ezb7hgo	cmo555g0t008zbf088kjde1vx	cmo555f9x005zbf0853edgeal	cmo55510n002tex7qkprywdc5	SUBMITTED	4	5	4	4	5	\N	5	5	5	1	3	1	The hands-on exercises were very helpful and practical	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.917	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00dvbf08fdfsiikd	cmo555g40009bbf08zxs1d22a	cmo555f9x005zbf0853edgeal	cmo5551f00038ex7q3bdiw464	SUBMITTED	4	4	3	5	5	\N	4	5	3	3	2	1	Well-organized event with knowledgeable speakers	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:51.997	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00dxbf089p7yohnk	cmo555g65009jbf08tb5vo4n0	cmo555f9x005zbf0853edgeal	cmo5551op003iex7q64q5e9jh	SUBMITTED	4	5	5	5	5	\N	4	4	5	1	1	2	Very relevant to my business needs, learned a lot	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.057	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00dzbf08jj3fye3r	cmo555g8c009rbf08qzc4kk18	cmo555f9x005zbf0853edgeal	cmo5551yd003sex7quaibpbrx	SUBMITTED	4	5	3	5	5	\N	3	4	3	3	4	1	Very relevant to my business needs, learned a lot	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.106	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e1bf08wwaha4bz	cmo555gak009zbf08xmagg0zz	cmo555f9x005zbf0853edgeal	cmo5552810042ex7qd4vnbvys	SUBMITTED	5	5	3	4	5	\N	4	5	5	4	1	3	Great networking opportunity with fellow entrepreneurs	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.164	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e5bf086fn1axrt	cmo555gev00afbf08dx597ymk	cmo555f9x005zbf0853edgeal	cmo5552rp004mex7qcfys3rdj	SUBMITTED	5	4	4	5	4	\N	5	4	5	1	2	1	This session gave me new ideas for my business	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.266	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e7bf08atmvm75x	cmo555gh300anbf08dwtbykda	cmo555f9x005zbf0853edgeal	cmo55531g004wex7qlbpost8b	SUBMITTED	5	4	3	4	4	\N	5	5	3	3	2	3	Highly applicable training, will implement learnings immediately	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.325	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e9bf08u2mq2hfj	cmo555gjb00avbf08bz6m8hav	cmo555f9x005zbf0853edgeal	cmo5553b50056ex7qp47mnbao	SUBMITTED	4	5	4	5	4	\N	3	4	3	3	3	3	Perfect venue and well-managed logistics	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:52.385	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555klq00oybf08ddq5hl70	cmo555j9l00l5bf08hzymv07p	cmo555j0n00jpbf08zx94o2jr	cmo5557860063ex7q8znd7swt	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00owbf08epwavh7u	cmo555j7l00kxbf082905e1zj	cmo555j0n00jpbf08zx94o2jr	cmo5556yj005tex7qalnw8g2m	SUBMITTED	5	4	5	5	5	\N	3	5	3	4	4	2	Great networking opportunity with fellow entrepreneurs	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.187	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p2bf08tbfs5ece	cmo555jdw00llbf08e8rlx6nh	cmo555j0n00jpbf08zx94o2jr	cmo5557rc006nex7qeg93hl17	SUBMITTED	5	5	4	5	5	\N	3	5	4	3	4	2	The hands-on exercises were very helpful and practical	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.333	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p4bf08qcny1baa	cmo555jg200ltbf08mjhud34d	cmo555j0n00jpbf08zx94o2jr	cmo55580z006xex7qrbxe9oq0	SUBMITTED	5	5	3	5	5	\N	5	4	3	4	3	2	Great networking opportunity with fellow entrepreneurs	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.39	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p7bf08qtw18shi	cmo555jja00m5bf08fz0rz3b7	cmo555j0n00jpbf08zx94o2jr	cmo5558fp007cex7qiku75o2h	SUBMITTED	5	5	5	5	5	\N	4	5	3	1	4	3	Highly applicable training, will implement learnings immediately	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.47	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pabf087v49t4mg	cmo555jmg00mhbf085xybsgeo	cmo555j0n00jpbf08zx94o2jr	cmo5558u5007rex7qygaz5dks	SUBMITTED	5	4	3	4	4	\N	5	4	4	1	3	3	Excellent presentation and very informative session	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.55	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pebf08exbsupig	cmo555jqq00mxbf08c59b02o7	cmo555j0n00jpbf08zx94o2jr	cmo5559db008bex7q1kvszvoq	SUBMITTED	5	5	4	4	4	\N	5	5	5	1	2	1	Well-organized event with knowledgeable speakers	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.653	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pgbf08v3zjcq17	cmo555jst00n5bf08yjb5n2rm	cmo555j0n00jpbf08zx94o2jr	cmo5559n5008lex7q85mcurd2	SUBMITTED	5	4	3	4	5	\N	4	4	3	1	2	2	Speaker was engaging and answered all questions thoroughly	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.711	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00oxbf08facd75oe	cmo555j8k00l1bf08a7nop0ra	cmo555j0n00jpbf08zx94o2jr	cmo55573d005yex7qcmbl9alc	SUBMITTED	4	4	3	4	4	\N	3	5	4	4	3	3	Very relevant to my business needs, learned a lot	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.215	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p0bf089z3gl4dq	cmo555jbq00ldbf08e6iozfu4	cmo555j0n00jpbf08zx94o2jr	cmo5557hs006dex7qlfv0x2ws	SUBMITTED	4	4	5	5	5	\N	4	4	4	4	4	1	This session gave me new ideas for my business	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.284	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p3bf083nylcbtl	cmo555jf000lpbf08ggb5cjzs	cmo555j0n00jpbf08zx94o2jr	cmo5557w4006sex7qo2gkf7d5	SUBMITTED	5	5	4	4	4	\N	3	4	3	2	4	1	Very relevant to my business needs, learned a lot	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.36	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p6bf08oj3490hp	cmo555ji900m1bf08fvism68y	cmo555j0n00jpbf08zx94o2jr	cmo5558as0077ex7q1m6e90ty	SUBMITTED	5	4	5	4	4	\N	4	4	4	2	1	3	This session gave me new ideas for my business	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.44	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p9bf084zq3b6lc	cmo555jle00mdbf0804j9cg56	cmo555j0n00jpbf08zx94o2jr	cmo5558pa007mex7qxoleq3nw	SUBMITTED	5	4	5	5	5	\N	4	5	3	3	1	1	Speaker was engaging and answered all questions thoroughly	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.521	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pcbf08q145w3yj	cmo555jon00mpbf087y39yfhy	cmo555j0n00jpbf08zx94o2jr	cmo55593p0081ex7q8hgfd37l	SUBMITTED	4	4	3	5	4	\N	4	4	4	2	2	2	Perfect venue and well-managed logistics	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.603	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pfbf08u0c94gqu	cmo555jrs00n1bf08geninetu	cmo555j0n00jpbf08zx94o2jr	cmo5559ia008gex7qdz79n4ky	SUBMITTED	5	5	4	4	5	\N	4	5	3	1	4	1	Highly applicable training, will implement learnings immediately	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:22:55.682	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmocmeu2d002q1w8s6yza4t4m	cmocm3aeo00291w8s2mo7jy5b	cmocm26ej001b1w8syavkdvtc	cmocl3m6h001ouxz76nugd8fe	SUBMITTED	5	5	5	5	4	5	5	5	5	\N	\N	\N	\N	\N	k	k	2026-04-24 08:02:24.668	2026-05-24 08:00:23.989	2026-04-24 08:00:23.989
cmo5584h8009k100g1hetivyd	cmo5581g5001c100g9291taw7	cmo55815b0000100gwzv2dbyo	cmo5571o0000g7b0kq8y8ir80	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009n100gc4nkl42h	cmo5581ji001o100g69sjxolw	cmo55815b0000100gwzv2dbyo	cmo55723c000v7b0kt9gamfyc	SUBMITTED	4	4	4	4	5	\N	3	5	4	3	1	2	This session gave me new ideas for my business	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.38	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009q100gdj0yl489	cmo5581mt0020100gvrk6pxb2	cmo55815b0000100gwzv2dbyo	cmo5572in001a7b0ksp15rne9	SUBMITTED	5	4	5	4	4	\N	3	4	5	1	3	3	Very relevant to my business needs, learned a lot	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.464	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009u100g0dh1wx58	cmo5581r5002g100g0mk6h13k	cmo55815b0000100gwzv2dbyo	cmo557334001u7b0kbzti09g6	SUBMITTED	5	4	5	5	4	\N	4	4	4	4	3	1	Perfect venue and well-managed logistics	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.576	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a2100g2afz17uh	cmo558207003c100g7vkly7uv	cmo55815b0000100gwzv2dbyo	cmo55747z002y7b0kjz1fnu5l	SUBMITTED	5	4	5	4	5	\N	4	4	3	1	2	3	The hands-on exercises were very helpful and practical	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.777	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a5100gf0l0hiaj	cmo55823l003o100grhuj8yq0	cmo55815b0000100gwzv2dbyo	cmo5574ml003d7b0kmjtbuqrf	SUBMITTED	5	5	4	4	4	\N	3	4	4	4	2	3	Great networking opportunity with fellow entrepreneurs	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.856	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a8100gxwb3tf8n	cmo5582710040100gsunqaf8k	cmo55815b0000100gwzv2dbyo	cmo55751l003s7b0kegzjo4yy	SUBMITTED	4	4	5	4	5	\N	3	5	3	1	3	3	The hands-on exercises were very helpful and practical	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.936	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ab100ga470mrr4	cmo5582ad004c100g6uswrw72	cmo55815b0000100gwzv2dbyo	cmo5575gu00477b0kdds9zlux	SUBMITTED	4	4	4	4	5	\N	3	4	3	4	2	1	Great networking opportunity with fellow entrepreneurs	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.023	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ad100gm56nxhcz	cmo5582cp004k100gwmgr2c81	cmo55815b0000100gwzv2dbyo	cmo5575r0004h7b0kyajvdogu	SUBMITTED	5	5	4	5	4	\N	5	4	4	4	4	1	Perfect venue and well-managed logistics	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.084	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009j100gfxgryrwl	cmo5581ea0018100gygk39jop	cmo55815b0000100gwzv2dbyo	cmo5571h1000b7b0kvbhjo2t5	SUBMITTED	5	4	4	4	4	\N	5	5	4	1	4	3	Great networking opportunity with fellow entrepreneurs	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.267	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009m100g7j7eojay	cmo5581id001k100gij4y27q7	cmo55815b0000100gwzv2dbyo	cmo5571yb000q7b0kyr57hyi4	SUBMITTED	4	5	3	4	4	\N	4	5	5	4	4	3	The hands-on exercises were very helpful and practical	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.348	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009o100gy8rl7vgr	cmo5581kp001s100gy3g1zmil	cmo55815b0000100gwzv2dbyo	cmo55728g00107b0k2emi8bq4	SUBMITTED	5	4	3	4	4	\N	4	4	4	3	4	3	Well-organized event with knowledgeable speakers	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.411	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009r100gqcdh1w5c	cmo5581nu0024100gdr0ri3kt	cmo55815b0000100gwzv2dbyo	cmo5572o0001f7b0k89tsu6xz	SUBMITTED	5	4	3	4	4	\N	5	5	5	4	2	3	Excellent presentation and very informative session	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.496	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009v100g5bml6nm4	cmo5581s9002k100gytid3u5f	cmo55815b0000100gwzv2dbyo	cmo55738r001z7b0kj4tatqp6	SUBMITTED	5	4	3	5	5	\N	3	5	3	3	3	2	Excellent presentation and very informative session	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.604	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h9009y100grs0v3cx7	cmo5581vo002w100g5qb3tmh1	cmo55815b0000100gwzv2dbyo	cmo5573no002e7b0kjcd13s63	SUBMITTED	4	5	3	5	5	\N	3	5	4	1	4	1	Excellent presentation and very informative session	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.681	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a3100gpns15ri2	cmo55821a003g100gfhjri1fs	cmo55815b0000100gwzv2dbyo	cmo5574d100337b0k8afjwtmw	SUBMITTED	4	5	4	4	5	\N	5	4	3	1	4	3	Speaker was engaging and answered all questions thoroughly	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.806	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a7100gvr4vhfoz	cmo55825v003w100gr0ufhhzz	cmo55815b0000100gwzv2dbyo	cmo5574wj003n7b0kbx2zukgw	SUBMITTED	5	4	4	4	5	\N	5	5	5	1	3	1	Excellent presentation and very informative session	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.906	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900aa100gxmqdjmr4	cmo5582990048100g83xl6i50	cmo55815b0000100gwzv2dbyo	cmo5575br00427b0kv8okh7mt	SUBMITTED	4	4	3	4	5	\N	4	4	5	1	2	1	This session gave me new ideas for my business	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:54.993	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ac100gym1dmzgo	cmo5582bk004g100ggav24yps	cmo55815b0000100gwzv2dbyo	cmo5575lx004c7b0khlyxsksq	SUBMITTED	5	4	4	5	4	\N	5	4	4	2	1	1	Speaker was engaging and answered all questions thoroughly	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.054	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900af100g19gawdz0	cmo5582ew004s100grvomo1d7	cmo55815b0000100gwzv2dbyo	cmo557618004r7b0ky72og9g1	SUBMITTED	4	5	4	4	5	\N	4	5	4	1	4	1	Perfect venue and well-managed logistics	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.14	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ah100gd5f2yoq8	cmo5582h60050100gr5owf3rs	cmo55815b0000100gwzv2dbyo	cmo5576ba00517b0kuw8icfyf	SUBMITTED	5	5	4	5	5	\N	3	4	3	4	1	1	Excellent presentation and very informative session	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.194	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ai100gpgvl6k15	cmo5582ia0054100gaujiejtb	cmo55815b0000100gwzv2dbyo	cmo5576g800567b0k51959kbc	SUBMITTED	4	5	5	5	5	\N	3	5	3	4	3	1	Highly applicable training, will implement learnings immediately	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.224	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900aj100gvith18oq	cmo5582je0058100gpmqxj98a	cmo55815b0000100gwzv2dbyo	cmo5576l9005b7b0koj92tvkz	SUBMITTED	4	5	4	4	4	\N	3	4	3	3	3	2	Very relevant to my business needs, learned a lot	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.255	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900am100ghhg3dbaf	cmo5582ms005k100g5ygbnp8k	cmo55815b0000100gwzv2dbyo	cmo55770e005q7b0kojljgpyn	SUBMITTED	5	4	5	4	5	\N	4	4	4	2	1	3	Speaker was engaging and answered all questions thoroughly	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.329	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900an100g1qdypqev	cmo5582ny005o100g40vgx0q9	cmo55815b0000100gwzv2dbyo	cmo55775f005v7b0kp059dzs8	SUBMITTED	5	5	5	5	4	\N	3	4	3	4	3	3	Very relevant to my business needs, learned a lot	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.356	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ap100gsgtptyn1	cmo5582q9005w100gzf0xrnl0	cmo55815b0000100gwzv2dbyo	cmo5577fg00657b0kdllzm67d	SUBMITTED	5	5	4	5	5	\N	3	4	4	1	1	3	The training materials were comprehensive and easy to follow	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.408	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900at100gxp7mzzvr	cmo5582us006c100gzslk9140	cmo55815b0000100gwzv2dbyo	cmo5577zt006p7b0k9z0eskqe	SUBMITTED	4	5	5	4	4	\N	5	4	5	4	3	1	The training materials were comprehensive and easy to follow	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.505	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900av100glbkqt2fa	cmo5582x5006k100gryb6a8f5	cmo55815b0000100gwzv2dbyo	cmo5578a0006z7b0kmhakzq2j	SUBMITTED	4	5	3	5	4	\N	4	5	5	4	4	2	Great networking opportunity with fellow entrepreneurs	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.566	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900au100gbm28xbt9	cmo5582vz006g100g879pxom0	cmo55815b0000100gwzv2dbyo	cmo55784y006u7b0kwklcko95	SUBMITTED	5	5	4	4	5	\N	3	4	4	4	4	1	Highly applicable training, will implement learnings immediately	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:24:55.536	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo55890f00pm100gkja1cfol	cmo55860x00hh100g59ns5ceu	cmo5585r700g1100gkoseur2n	cmo5578ud007j7b0k63etegp0	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00po100gifsojihe	cmo55863900hp100g4y9cn2mb	cmo5585r700g1100gkoseur2n	cmo55794d007t7b0ki7masp1n	SUBMITTED	5	4	3	5	5	\N	4	4	5	3	4	2	The training materials were comprehensive and easy to follow	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.241	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pq100g8t59s9yf	cmo55865e00hx100g52ajgw4e	cmo5585r700g1100gkoseur2n	cmo5579ei00837b0kiniospxb	SUBMITTED	5	4	5	5	5	\N	4	5	3	3	4	3	Well-organized event with knowledgeable speakers	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.301	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pu100gnram0x2o	cmo55869u00id100g5waugjc4	cmo5585r700g1100gkoseur2n	cmo5579yn008n7b0k7q7hq42b	SUBMITTED	5	5	3	4	4	\N	3	5	5	1	3	1	Very relevant to my business needs, learned a lot	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.404	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q0100gzu39q6pw	cmo5586ge00j1100ge6mxbhsc	cmo5585r700g1100gkoseur2n	cmo557ask009h7b0k0o9bciu0	SUBMITTED	5	5	4	5	4	\N	4	5	4	4	3	3	The hands-on exercises were very helpful and practical	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.56	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qn100gm9skq78i	cmo5586nm00jp100gp57wmvij	cmo5585r700g1100gkoseur2n	cmo557bmx00ab7b0kikcmojuy	SUBMITTED	4	4	3	4	4	\N	4	4	3	4	3	1	Very relevant to my business needs, learned a lot	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.708	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qd100gf5abci22	cmo5586wd00kl100gkftepn4k	cmo5585r700g1100gkoseur2n	cmo557cu300bf7b0kx9dxt6e7	SUBMITTED	5	4	4	4	5	\N	3	4	5	4	4	1	The hands-on exercises were very helpful and practical	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.9	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qg100gei92wxkn	cmo5586zr00kx100gotxpwydo	cmo5585r700g1100gkoseur2n	cmo557d9400bu7b0k35ahh0vw	SUBMITTED	4	5	5	4	5	\N	4	5	4	2	2	2	Great networking opportunity with fellow entrepreneurs	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.983	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qj100g7u063sfr	cmo55873200l9100gwiuxcbho	cmo5585r700g1100gkoseur2n	cmo557doq00c97b0krpxcvkvk	SUBMITTED	5	5	3	4	5	\N	5	5	5	1	4	2	Perfect venue and well-managed logistics	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.064	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qo100gh1fgtyvg	cmo55878300lp100g3uk1einv	cmo5585r700g1100gkoseur2n	cmo557e9a00ct7b0ktrojio27	SUBMITTED	5	5	4	5	4	\N	4	4	4	4	1	2	Well-organized event with knowledgeable speakers	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.176	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qq100glx48b4u7	cmo5587ae00lx100gfd9p3m5i	cmo5585r700g1100gkoseur2n	cmo557ejd00d37b0ki6m5bywd	SUBMITTED	4	5	5	5	5	\N	3	5	4	4	4	1	Very relevant to my business needs, learned a lot	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.238	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qu100gbk87rn7i	cmo5587ex00md100gfhc6fxer	cmo5585r700g1100gkoseur2n	cmo557f3u00dn7b0kod1oq6g2	SUBMITTED	5	4	3	4	5	\N	3	4	4	4	4	1	Well-organized event with knowledgeable speakers	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.342	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pk100gc3skkas2	cmo5585yn00h9100gvyufdfez	cmo5585r700g1100gkoseur2n	cmo5578k700797b0kqu1qxb4n	SUBMITTED	4	5	4	4	4	\N	3	4	3	1	2	3	This session gave me new ideas for my business	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.137	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pl100gn5n17kwq	cmo5585zt00hd100g9l4977wb	cmo5585r700g1100gkoseur2n	cmo5578p8007e7b0kgfjxbq0n	SUBMITTED	5	4	5	5	5	\N	5	5	5	3	4	1	Great networking opportunity with fellow entrepreneurs	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.166	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pp100g5gp6zcpv	cmo55864b00ht100gsx7g65xt	cmo5585r700g1100gkoseur2n	cmo55799e007y7b0ktg6p3sqa	SUBMITTED	5	5	5	5	4	\N	5	4	5	2	4	2	The hands-on exercises were very helpful and practical	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.271	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pr100gkzqzswxw	cmo55866i00i1100gjrhwv2vs	cmo5585r700g1100gkoseur2n	cmo5579jk00887b0k636izhc1	SUBMITTED	4	5	5	4	4	\N	4	4	3	4	2	3	Highly applicable training, will implement learnings immediately	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.331	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pw100g0gm8mapv	cmo5586c100il100gzo7ehlj9	cmo5585r700g1100gkoseur2n	cmo557a8r008x7b0kumxiysoo	SUBMITTED	4	4	5	5	5	\N	5	5	3	4	4	3	Great networking opportunity with fellow entrepreneurs	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.457	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00px100gt62wysm7	cmo5586d500ip100gp012cgg8	cmo5585r700g1100gkoseur2n	cmo557ads00927b0knmecarda	SUBMITTED	4	5	3	5	4	\N	3	4	5	2	4	2	Perfect venue and well-managed logistics	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.486	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q5100g9jr2lt3m	cmo5586ly00jl100g6c7d8ebq	cmo5585r700g1100gkoseur2n	cmo557bhs00a67b0k0skmm3d3	SUBMITTED	4	4	5	4	4	\N	4	5	3	1	1	1	The hands-on exercises were very helpful and practical	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.678	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qa100gmvgf3ras	cmo5586ta00k9100g6zclnyks	cmo5585r700g1100gkoseur2n	cmo557cc900b07b0ku0k62661	SUBMITTED	5	5	4	4	5	\N	4	4	5	4	4	1	Very relevant to my business needs, learned a lot	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.826	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qf100gap6u58u1	cmo5586ym00kt100g8al5xj88	cmo5585r700g1100gkoseur2n	cmo557d3x00bp7b0k2jjgus02	SUBMITTED	4	4	5	5	5	\N	4	5	5	3	4	1	The hands-on exercises were very helpful and practical	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:00.953	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qi100gyuyn1ehw	cmo55871x00l5100gk61got6n	cmo5585r700g1100gkoseur2n	cmo557djn00c47b0kusw3z20q	SUBMITTED	4	5	3	5	4	\N	3	4	5	4	3	1	Very relevant to my business needs, learned a lot	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.035	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qk100gbct26xs8	cmo55874600ld100g14uv2td2	cmo5585r700g1100gkoseur2n	cmo557dtv00ce7b0kc384rbtl	SUBMITTED	5	4	4	4	4	\N	5	5	3	1	2	1	Very relevant to my business needs, learned a lot	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.095	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qm100gd0uin7tx	cmo55876z00ll100g9754b65a	cmo5585r700g1100gkoseur2n	cmo557e4700co7b0kd2pnicoe	SUBMITTED	5	5	3	4	5	\N	3	5	3	4	3	3	The hands-on exercises were very helpful and practical	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.147	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qp100g6dy1eo6m	cmo55879900lt100g85hjb0ct	cmo5585r700g1100gkoseur2n	cmo557eee00cy7b0knuk1wn5o	SUBMITTED	5	5	3	5	4	\N	3	5	3	1	2	3	Great networking opportunity with fellow entrepreneurs	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.207	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qt100gpqm41ayd	cmo5587ds00m9100gsc0ry87f	cmo5585r700g1100gkoseur2n	cmo557eyr00di7b0ki25zagsl	SUBMITTED	4	5	5	5	4	\N	5	4	4	3	2	1	Highly applicable training, will implement learnings immediately	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:01.312	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmocmeu2d002r1w8s1qdm2jzg	cmocm39qm00271w8sedk78awx	cmocm26ej001b1w8syavkdvtc	cmockq3hi001buxz7570ou2ax	SUBMITTED	5	5	5	5	5	5	5	5	5	1	1	1	\N	\N	\N	\N	2026-04-24 08:02:59.559	2026-05-24 08:00:23.989	2026-04-24 08:00:23.989
cmo558dg3015m100gdq4xk97i	cmo558apr00y5100g8nfpdh4h	cmo558a7c00vt100gkftjgmsa	cmo557h6h00fl7b0k7uz7uf06	SUBMITTED	4	5	4	5	4	\N	4	5	5	2	4	3	Great networking opportunity with fellow entrepreneurs	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.139	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015p100gy9j87yeg	cmo558at300yh100gdbq8o492	cmo558a7c00vt100gkftjgmsa	cmo557hll00g07b0kani4bpyw	SUBMITTED	5	5	3	4	5	\N	5	4	4	4	1	3	Excellent presentation and very informative session	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.224	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015r100g34e0hw7q	cmo558ave00yp100go8zycrnx	cmo558a7c00vt100gkftjgmsa	cmo557hw000ga7b0k3sdb881u	SUBMITTED	5	5	5	5	4	\N	5	4	3	3	2	1	Great networking opportunity with fellow entrepreneurs	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.287	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015w100goln9z1tu	cmo558b2l00zh100g26ftnrgo	cmo558a7c00vt100gkftjgmsa	cmo557iw900h97b0ke1qhuof5	SUBMITTED	5	4	3	5	5	\N	3	4	4	3	2	2	This session gave me new ideas for my business	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.479	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015y100ggs217j97	cmo558b4v00zp100gammgk291	cmo558a7c00vt100gkftjgmsa	cmo557j6f00hj7b0k3wywe8f1	SUBMITTED	5	4	4	4	4	\N	3	5	5	1	1	1	The hands-on exercises were very helpful and practical	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.538	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016b100gjaxbes3x	cmo558bhj010x100g4butgw7f	cmo558a7c00vt100gkftjgmsa	cmo557kqf00j27b0kfuug0kse	SUBMITTED	4	5	3	4	2	2	3	3	3	1	2	2	\N	\N	good job	strongly agree	2026-04-19 02:52:35.931	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo555hql00dcbf08x1bbffhq	cmo555fhj0077bf08062yinal	cmo555f9x005zbf0853edgeal	cmo554yt5000lex7qyixte2cl	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dgbf08ku3q9lka	cmo555fml007nbf08wz432486	cmo555f9x005zbf0853edgeal	cmo554ze40015ex7qrrqry2yx	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo558dg3015d100grz1xmiwk	cmo558afo00x5100gs3vm0lew	cmo558a7c00vt100gkftjgmsa	cmo557ftg00ec7b0kcmazt6m0	SUBMITTED	4	4	3	5	4	\N	5	4	4	2	2	1	Well-organized event with knowledgeable speakers	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:05.903	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015e100gl78l29tl	cmo558agt00x9100gm5mvm6x1	cmo558a7c00vt100gkftjgmsa	cmo557fz300eh7b0k8wx9a1ml	SUBMITTED	4	5	4	5	4	\N	3	4	4	1	4	1	Well-organized event with knowledgeable speakers	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:05.931	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015f100g5u3x4if6	cmo558ahy00xd100gntftxvbq	cmo558a7c00vt100gkftjgmsa	cmo557g4o00em7b0kwsuhgib8	SUBMITTED	4	5	4	5	4	\N	3	5	3	2	3	1	The training materials were comprehensive and easy to follow	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:05.957	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015g100gvfoiz32p	cmo558aj300xh100g8z4tartm	cmo558a7c00vt100gkftjgmsa	cmo557g9u00er7b0kit44dx7h	SUBMITTED	5	4	4	4	5	\N	3	5	5	4	2	2	The training materials were comprehensive and easy to follow	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:05.983	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015h100gbrjlgtxf	cmo558ak600xl100gjekjcvyc	cmo558a7c00vt100gkftjgmsa	cmo557ggh00ew7b0k40hv462g	SUBMITTED	4	4	4	4	5	\N	4	5	5	1	2	2	The hands-on exercises were very helpful and practical	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.009	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015i100g4si5yp3d	cmo558al900xp100gv1j60uks	cmo558a7c00vt100gkftjgmsa	cmo557gm200f17b0k5y2cnzco	SUBMITTED	4	5	5	4	5	\N	5	5	5	2	4	2	The hands-on exercises were very helpful and practical	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.035	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015k100go6io2g90	cmo558anh00xx100gb5uxncxh	cmo558a7c00vt100gkftjgmsa	cmo557gw200fb7b0kuqfs96g3	SUBMITTED	5	4	5	5	4	\N	4	5	4	1	3	3	Highly applicable training, will implement learnings immediately	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.086	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015o100gj6158z6c	cmo558ary00yd100gcwijtegf	cmo558a7c00vt100gkftjgmsa	cmo557hgj00fv7b0kk12soz29	SUBMITTED	4	5	5	4	4	\N	3	4	5	2	2	3	Speaker was engaging and answered all questions thoroughly	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.194	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015q100g01rt6q81	cmo558au800yl100gv1z95usv	cmo558a7c00vt100gkftjgmsa	cmo557hqv00g57b0k1d2v0a6m	SUBMITTED	4	4	5	5	4	\N	3	5	5	2	4	2	Speaker was engaging and answered all questions thoroughly	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.256	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015s100giznb9hqo	cmo558awi00yt100gy86m5xf4	cmo558a7c00vt100gkftjgmsa	cmo557i1000gf7b0kp6yh2vlz	SUBMITTED	5	5	3	4	5	\N	5	4	3	2	4	3	Highly applicable training, will implement learnings immediately	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.32	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015z100gvuiss02e	cmo558b5z00zt100gf7e8zq2b	cmo558a7c00vt100gkftjgmsa	cmo557jbl00ho7b0kt5f05uiv	SUBMITTED	4	4	4	5	5	\N	4	4	4	4	3	3	Very relevant to my business needs, learned a lot	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.569	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30164100gwp7okz09	cmo558b9f0105100gmjzl4trs	cmo558a7c00vt100gkftjgmsa	cmo557jqg00i37b0kl4s918bi	SUBMITTED	5	4	5	4	4	\N	3	5	4	2	2	1	Excellent presentation and very informative session	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.659	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30167100gsog5fhus	cmo558bcw010h100gzt5veas6	cmo558a7c00vt100gkftjgmsa	cmo557k6900ii7b0kz59z58p6	SUBMITTED	4	4	4	4	5	\N	4	4	3	2	4	2	The hands-on exercises were very helpful and practical	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.74	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016d100gxc2pxyl6	cmo558bjk0115100gys9c3qfv	cmo558a7c00vt100gkftjgmsa	cmo557l1d00jc7b0kgvzuo882	SUBMITTED	4	4	3	5	5	\N	3	5	5	2	4	3	The hands-on exercises were very helpful and practical	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.891	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016f100gu6e3ocxm	cmo558bli011d100gocj6dqqh	cmo558a7c00vt100gkftjgmsa	cmo557lb900jm7b0kgkebn9y4	SUBMITTED	4	5	3	5	4	\N	4	4	5	4	1	1	Great networking opportunity with fellow entrepreneurs	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.954	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016h100gv4w608vq	cmo558bnp011l100gem3guymp	cmo558a7c00vt100gkftjgmsa	cmo557llv00jw7b0kdcw9d3r3	SUBMITTED	4	5	4	5	5	\N	3	4	5	1	2	3	Speaker was engaging and answered all questions thoroughly	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:07.016	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016j100gex4ffrcn	cmo558bpw011t100gnind36ef	cmo558a7c00vt100gkftjgmsa	cmo557lwf00k67b0klnosqvfo	SUBMITTED	4	5	4	4	4	\N	3	4	3	1	3	2	Speaker was engaging and answered all questions thoroughly	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:07.077	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015u100gol4wj7l3	cmo558ayn00z1100gj9la6en1	cmo558a7c00vt100gkftjgmsa	cmo557iay00gp7b0ktcm58kic	SUBMITTED	5	5	3	5	5	\N	3	5	3	3	4	1	Excellent presentation and very informative session	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.372	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30163100gojonvexm	cmo558b0m00z9100g874y4oli	cmo558a7c00vt100gkftjgmsa	cmo557il600gz7b0kcp0gx5kg	SUBMITTED	5	4	3	4	4	\N	5	4	3	1	4	2	This session gave me new ideas for my business	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.425	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015x100gaht9wrc1	cmo558b3o00zl100go66kmq7b	cmo558a7c00vt100gkftjgmsa	cmo557j1b00he7b0k7vn7huyx	SUBMITTED	5	4	3	4	4	\N	5	5	4	2	2	1	Excellent presentation and very informative session	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.508	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30160100gyg2u4mhl	cmo558b7400zx100gh9yer8zb	cmo558a7c00vt100gkftjgmsa	cmo557jgm00ht7b0k0dte78bw	SUBMITTED	4	4	3	5	5	\N	3	5	4	2	2	3	The training materials were comprehensive and easy to follow	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.599	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30161100g1ru6433j	cmo558b890101100g4jvjxrqx	cmo558a7c00vt100gkftjgmsa	cmo557jln00hy7b0k90dtt0wl	SUBMITTED	5	4	3	4	5	\N	4	4	3	1	2	1	Highly applicable training, will implement learnings immediately	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.63	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30166100g376issjs	cmo558bbp010d100g8l6f3oou	cmo558a7c00vt100gkftjgmsa	cmo557k0q00id7b0kiyizzm66	SUBMITTED	4	5	4	5	5	\N	4	5	4	2	4	3	Perfect venue and well-managed logistics	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.709	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016c100gx33sywf1	cmo558bij0111100gr4ljt1jj	cmo558a7c00vt100gkftjgmsa	cmo557kvz00j77b0k185bppnq	SUBMITTED	5	5	3	5	5	\N	5	5	4	2	2	3	Great networking opportunity with fellow entrepreneurs	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.858	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016e100gep1entne	cmo558bkj0119100gwjpg4jco	cmo558a7c00vt100gkftjgmsa	cmo557l6200jh7b0kru24b2xz	SUBMITTED	5	4	3	4	5	\N	3	4	5	4	1	3	Speaker was engaging and answered all questions thoroughly	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.922	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016g100g461xijbm	cmo558bmk011h100ghk526qxv	cmo558a7c00vt100gkftjgmsa	cmo557lge00jr7b0kcryv2044	SUBMITTED	4	4	5	4	5	\N	3	5	4	3	4	3	Very relevant to my business needs, learned a lot	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:06.984	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016i100g6zuhi1et	cmo558bos011p100gfmok7bzh	cmo558a7c00vt100gkftjgmsa	cmo557lr700k17b0k91md5id4	SUBMITTED	5	5	5	5	5	\N	4	4	3	1	1	3	Speaker was engaging and answered all questions thoroughly	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:07.047	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016l100gsp12kkty	cmo558bs50121100g3gjlm3pd	cmo558a7c00vt100gkftjgmsa	cmo557m7000kg7b0kucmgdcte	SUBMITTED	5	4	4	5	4	\N	4	5	5	1	1	1	Excellent presentation and very informative session	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:07.13	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016m100gplwfkbjl	cmo558bta0125100g178c0urt	cmo558a7c00vt100gkftjgmsa	cmo557mc300kl7b0k0u5hs0ap	SUBMITTED	5	5	5	5	5	\N	4	5	5	3	3	3	Well-organized event with knowledgeable speakers	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:07.16	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo555hql00dibf08awn4gtev	cmo555fot007vbf08kupc7ncp	cmo555f9x005zbf0853edgeal	cmo554zns001fex7qey84l5wj	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hql00dnbf08clq1otll	cmo555fvb008fbf082p7vbkaj	cmo555f9x005zbf0853edgeal	cmo5550cw0024ex7qhuaaneof	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo558hx101m0100guszgkr3l	cmo558f1t01e4100gnmkegn1j	cmo558eoo01cc100g1zgfdf9a	cmo557nmf00lu7b0kjrdjn743	SUBMITTED	4	4	3	5	4	\N	4	5	5	1	1	2	The hands-on exercises were very helpful and practical	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:11.814	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m2100gg2fib818	cmo558f4101ec100g0dtn7a5m	cmo558eoo01cc100g1zgfdf9a	cmo557nwi00m47b0kfd29d73k	SUBMITTED	4	4	4	4	4	\N	3	4	3	4	4	1	This session gave me new ideas for my business	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:11.875	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m6100gpu8nv34w	cmo558f8j01es100gn7zuq6ch	cmo558eoo01cc100g1zgfdf9a	cmo557ogs00mo7b0kc67x7k0i	SUBMITTED	5	5	4	5	5	\N	5	4	4	3	1	3	Excellent presentation and very informative session	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.011	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mb100g23ptvlmk	cmo558fe501fc100gpl8qt9tq	cmo558eoo01cc100g1zgfdf9a	cmo557p6700nd7b0ku6rdvxlv	SUBMITTED	5	4	4	4	4	\N	4	4	4	4	4	2	Very relevant to my business needs, learned a lot	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.142	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mg100gqqbi2j6v	cmo558fjb01fw100gex2fv60s	cmo558eoo01cc100g1zgfdf9a	cmo557pws00o27b0kcxns2k0z	SUBMITTED	5	5	4	5	5	\N	5	5	5	3	2	3	The hands-on exercises were very helpful and practical	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.271	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101lx100gpntr5r0d	cmo558eyd01ds100gebd5lhpw	cmo558eoo01cc100g1zgfdf9a	cmo557n7400lf7b0kw1218vlt	SUBMITTED	5	4	4	4	4	\N	5	4	3	1	4	2	Highly applicable training, will implement learnings immediately	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:11.721	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101ly100gz2v72m4h	cmo558ezi01dw100g6vs8j5cq	cmo558eoo01cc100g1zgfdf9a	cmo557nc700lk7b0kzww6wx2e	SUBMITTED	5	5	5	5	5	\N	4	5	3	3	3	2	Excellent presentation and very informative session	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:11.753	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101lz100gsy5r8xpu	cmo558f0n01e0100gdgktp8bt	cmo558eoo01cc100g1zgfdf9a	cmo557nhc00lp7b0kw7dai5g6	SUBMITTED	4	4	3	4	4	\N	3	4	3	2	4	2	Very relevant to my business needs, learned a lot	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:11.783	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m1100gsdfgvf0p	cmo558f2x01e8100gb21sd5lr	cmo558eoo01cc100g1zgfdf9a	cmo557nrg00lz7b0kcasnmdvc	SUBMITTED	5	4	5	5	4	\N	4	4	3	3	2	3	Very relevant to my business needs, learned a lot	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:11.844	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m4100gs9rqvujn	cmo558f6901ek100g4jpijdw2	cmo558eoo01cc100g1zgfdf9a	cmo557o6n00me7b0k78fhb0k5	SUBMITTED	4	4	3	5	4	\N	5	4	3	1	1	2	The training materials were comprehensive and easy to follow	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:11.929	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101ma100gvhry9jaj	cmo558fd101f8100gzsr8cvek	cmo558eoo01cc100g1zgfdf9a	cmo557p1k00n87b0kznlszabt	SUBMITTED	4	4	4	4	5	\N	3	4	3	4	1	1	Speaker was engaging and answered all questions thoroughly	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.11	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101md100geg0r3ekj	cmo558fg601fk100gbhr4oy85	cmo558eoo01cc100g1zgfdf9a	cmo557phb00nn7b0k0iqa5nxc	SUBMITTED	4	4	3	5	4	\N	3	5	3	2	3	3	Highly applicable training, will implement learnings immediately	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.196	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mi100gknlqtkrv	cmo558fla01g4100gazr9iygq	cmo558eoo01cc100g1zgfdf9a	cmo557q6f00oc7b0k3y8was5x	SUBMITTED	4	5	5	4	4	\N	3	4	3	3	4	2	This session gave me new ideas for my business	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.325	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mj100g7u9mgjbo	cmo558fm801g8100gryva7ved	cmo558eoo01cc100g1zgfdf9a	cmo557qbo00oh7b0kdb0mb8av	SUBMITTED	4	4	5	5	5	\N	3	5	3	1	4	2	Excellent presentation and very informative session	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.357	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mk100gcwghltoa	cmo558fn601gc100glc7b36l1	cmo558eoo01cc100g1zgfdf9a	cmo557qgf00om7b0kw6i0fijv	SUBMITTED	4	5	4	5	4	\N	3	5	5	4	2	3	The hands-on exercises were very helpful and practical	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.387	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101ml100gvt3ddlay	cmo558fo601gg100g0whmgrqw	cmo558eoo01cc100g1zgfdf9a	cmo557qlc00or7b0kjzjnla31	SUBMITTED	4	5	3	4	4	\N	4	4	5	2	3	1	Perfect venue and well-managed logistics	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.419	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mm100gtjt19fdx	cmo558fp701gk100gm652ns8o	cmo558eoo01cc100g1zgfdf9a	cmo557qqe00ow7b0k1llohmfo	SUBMITTED	4	5	4	5	4	\N	4	4	5	3	3	2	Well-organized event with knowledgeable speakers	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.449	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mp100gl4rbgnt7	cmo558fsm01gw100gqwt04fbk	cmo558eoo01cc100g1zgfdf9a	cmo557r5q00pb7b0kuc91ln3z	SUBMITTED	5	5	5	5	4	\N	3	5	4	4	3	1	The hands-on exercises were very helpful and practical	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.532	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201my100gugi3c1v2	cmo558g2w01hw100ghpmpmwwj	cmo558eoo01cc100g1zgfdf9a	cmo557seu00qk7b0kjzngc5jp	SUBMITTED	4	5	4	5	5	\N	5	4	3	2	4	1	Highly applicable training, will implement learnings immediately	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.752	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n2100g39e3yd7c	cmo558g7d01ic100gtqb5eo8i	cmo558eoo01cc100g1zgfdf9a	cmo557szb00r47b0k09i82w3t	SUBMITTED	5	4	4	4	5	\N	4	4	3	1	2	2	The hands-on exercises were very helpful and practical	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.863	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n4100gu4rg0pgx	cmo558g9m01ik100g0roowib3	cmo558eoo01cc100g1zgfdf9a	cmo557t9u00re7b0kijdp5m56	SUBMITTED	5	4	4	5	5	\N	5	4	3	1	3	1	Well-organized event with knowledgeable speakers	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.923	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mo100gb0kiedfh	cmo558fri01gs100gnagwuzy0	cmo558eoo01cc100g1zgfdf9a	cmo557r0i00p67b0k045twbt7	SUBMITTED	5	5	4	5	5	\N	4	4	5	1	1	2	Perfect venue and well-managed logistics	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.502	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mu100g606bhggp	cmo558fya01hg100ggix4wsgk	cmo558eoo01cc100g1zgfdf9a	cmo557rux00q07b0k3h7jj7k3	SUBMITTED	4	5	4	5	5	\N	5	5	5	1	4	3	Well-organized event with knowledgeable speakers	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.653	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n0100gn3on31e5	cmo558g5401i4100ggmpnk1vw	cmo558eoo01cc100g1zgfdf9a	cmo557sp400qu7b0k6g4ofhl0	SUBMITTED	4	4	5	5	5	\N	5	4	5	4	4	3	This session gave me new ideas for my business	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.808	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n3100gyghsnoox	cmo558g8h01ig100gt1tnpb9c	cmo558eoo01cc100g1zgfdf9a	cmo557t4r00r97b0konzo0g13	SUBMITTED	5	5	3	4	4	\N	3	4	5	1	2	3	Speaker was engaging and answered all questions thoroughly	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.894	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n7100g8pqxqxo2	cmo558gcx01iw100guwc4dny4	cmo558eoo01cc100g1zgfdf9a	cmo557tp800rt7b0ks8pu88qg	SUBMITTED	5	4	3	5	5	\N	5	4	3	2	2	1	The hands-on exercises were very helpful and practical	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:12.998	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n8100gclmhopjs	cmo558ge301j0100giv3qs821	cmo558eoo01cc100g1zgfdf9a	cmo557tub00ry7b0k39n9mopk	SUBMITTED	5	4	4	4	5	\N	3	4	4	4	3	2	Highly applicable training, will implement learnings immediately	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:13.029	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo555hql00dqbf08v1bd3w0v	cmo555fym008rbf080sgey834	cmo555f9x005zbf0853edgeal	cmo5550r1002jex7q7pf6lcna	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00dubf08s1nmk8g3	cmo555g2x0097bf08vr1e847m	cmo555f9x005zbf0853edgeal	cmo5551a80033ex7q7a9ae4pb	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo558mi7021x100goj6ij2up	cmo558jj201ty100g3bvg8sas	cmo558j7801sa100gb8g19tm3	cmo557ujv00sn7b0kg8pxfsox	SUBMITTED	5	4	4	4	5	\N	5	5	3	1	3	1	This session gave me new ideas for my business	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.729	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi7021z100gh0brav16	cmo558jmk01ua100gi68c1onb	cmo558j7801sa100gb8g19tm3	cmo557uz300t27b0k6t32lb5v	SUBMITTED	5	5	5	5	4	\N	3	5	4	4	1	1	Great networking opportunity with fellow entrepreneurs	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.82	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80223100gw5hy71qj	cmo558jr901uq100grc89b840	cmo558j7801sa100gb8g19tm3	cmo557vjj00tm7b0kz8gnhpct	SUBMITTED	5	5	5	5	4	\N	3	4	3	3	2	2	Well-organized event with knowledgeable speakers	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.933	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80229100gimzrahx5	cmo558jy701ve100gufipieuj	cmo558j7801sa100gb8g19tm3	cmo557wf100ug7b0kb984024b	SUBMITTED	5	4	3	5	4	\N	4	5	3	1	1	2	Well-organized event with knowledgeable speakers	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.083	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022b100gtymylksf	cmo558k0f01vm100gjhyj5ald	cmo558j7801sa100gb8g19tm3	cmo557wpj00uq7b0kwopo3104	SUBMITTED	4	4	3	4	5	\N	3	5	4	1	1	2	The hands-on exercises were very helpful and practical	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.144	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022f100g7oom9cae	cmo558k4z01w2100gp3v5ev5k	cmo558j7801sa100gb8g19tm3	cmo557xa300va7b0kdaoph27t	SUBMITTED	5	5	4	5	4	\N	3	4	3	2	3	3	Well-organized event with knowledgeable speakers	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.249	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022j100guw08v0vy	cmo558k9o01wi100gpjnr508b	cmo558j7801sa100gb8g19tm3	cmo557xu900vu7b0kp3g098mx	SUBMITTED	5	4	3	5	4	\N	3	4	5	2	3	2	Speaker was engaging and answered all questions thoroughly	Would appreciate a follow-up session	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.352	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022m100ge1lhsjas	cmo558kd301wu100ggv39jbwy	cmo558j7801sa100gb8g19tm3	cmo557y9j00w97b0kz60mqb0x	SUBMITTED	4	4	3	4	4	\N	3	4	3	1	3	3	Speaker was engaging and answered all questions thoroughly	Maybe extend the training to two days	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.441	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022o100gbdbx7fxp	cmo558kfh01x2100gwylx1hzr	cmo558j7801sa100gb8g19tm3	cmo557yjr00wj7b0k93g5v46t	SUBMITTED	4	4	3	4	5	\N	4	5	3	4	3	3	Perfect venue and well-managed logistics	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.503	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo555hqm00dybf08fqsw3irj	cmo555g79009nbf08zs0gjt0z	cmo555f9x005zbf0853edgeal	cmo5551ti003nex7qtz7hv881	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo558mi7021t100gm71fo43u	cmo558jef01ti100gpf100hzj	cmo558j7801sa100gb8g19tm3	cmo557tze00s37b0knxgb0zgq	SUBMITTED	5	5	5	4	4	\N	3	5	5	1	2	1	Speaker was engaging and answered all questions thoroughly	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.622	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi7021w100g9doa5qpz	cmo558jhw01tu100g24itup4k	cmo558j7801sa100gb8g19tm3	cmo557uet00si7b0kvne2djec	SUBMITTED	5	4	3	4	4	\N	4	5	4	1	4	1	Great networking opportunity with fellow entrepreneurs	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.698	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi7021y100gul8tutoq	cmo558jk801u2100ghu4hxqqv	cmo558j7801sa100gb8g19tm3	cmo557uoy00ss7b0kql7bfvw8	SUBMITTED	5	4	3	5	4	\N	3	4	5	1	1	3	Very relevant to my business needs, learned a lot	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.76	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022v100gfub1ykbv	cmo558jle01u6100ggsr1egu4	cmo558j7801sa100gb8g19tm3	cmo557uu000sx7b0krwou7vvt	SUBMITTED	4	5	3	5	4	\N	3	4	4	3	4	1	This session gave me new ideas for my business	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.789	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi70221100gqppbcw8c	cmo558jox01ui100gousqdl0g	cmo558j7801sa100gb8g19tm3	cmo557v9a00tc7b0k18ly995s	SUBMITTED	5	4	5	4	5	\N	4	4	3	1	4	2	The training materials were comprehensive and easy to follow	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.872	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi70222100gyeuj3dyq	cmo558jq501um100gi3qx3atz	cmo558j7801sa100gb8g19tm3	cmo557vee00th7b0kqnj7luvr	SUBMITTED	4	5	4	5	4	\N	4	4	4	1	4	3	Great networking opportunity with fellow entrepreneurs	Additional resource materials for further reading	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:17.902	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80228100g888pfezg	cmo558jx201va100gp7n79qh9	cmo558j7801sa100gb8g19tm3	cmo557w9z00ub7b0k51iu0w8p	SUBMITTED	4	4	3	5	5	\N	3	4	3	4	3	3	Perfect venue and well-managed logistics	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.052	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022a100gi0l1duyr	cmo558jzc01vi100g3yspayqs	cmo558j7801sa100gb8g19tm3	cmo557wk700ul7b0kz02m7bt9	SUBMITTED	4	4	4	5	5	\N	4	5	5	3	4	3	Highly applicable training, will implement learnings immediately	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.114	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022e100gb44k4hx0	cmo558k3u01vy100gdbqrxv7e	cmo558j7801sa100gb8g19tm3	cmo557x4v00v57b0ka29aheyo	SUBMITTED	5	5	3	4	4	\N	4	4	5	1	1	2	Perfect venue and well-managed logistics	Could use more time for Q&A	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.219	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022g100gvsyrgzf9	cmo558k6401w6100gv7ivamq2	cmo558j7801sa100gb8g19tm3	cmo557xf600vf7b0k6nf325ws	SUBMITTED	5	5	4	4	4	\N	3	4	5	1	2	2	Speaker was engaging and answered all questions thoroughly	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.279	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022k100gai956hyi	cmo558kat01wm100gtj9671oa	cmo558j7801sa100gb8g19tm3	cmo557xzc00vz7b0kmmboa9u5	SUBMITTED	4	5	5	5	4	\N	4	4	5	3	4	3	Great networking opportunity with fellow entrepreneurs	More hands-on exercises would be beneficial	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.381	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022l100g0yabuxf7	cmo558kbz01wq100gcc0952ot	cmo558j7801sa100gb8g19tm3	cmo557y4p00w47b0kcy626bah	SUBMITTED	4	4	3	4	5	\N	3	4	3	3	2	3	The training materials were comprehensive and easy to follow	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.412	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022n100gilpigbgu	cmo558kec01wy100ge64hb0zx	cmo558j7801sa100gb8g19tm3	cmo557yen00we7b0kgagknyrb	SUBMITTED	4	5	5	5	5	\N	4	4	3	4	2	2	The hands-on exercises were very helpful and practical	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.472	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022p100gag3v71wy	cmo558kgo01x6100ge5j3vc6l	cmo558j7801sa100gb8g19tm3	cmo557yot00wo7b0ker1evt5a	SUBMITTED	5	4	3	4	4	\N	4	4	4	1	2	2	The hands-on exercises were very helpful and practical	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.533	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022x100g85azchdk	cmo558kot01xy100gzi671glw	cmo558j7801sa100gb8g19tm3	cmo557zop00xn7b0k39c3nzfg	SUBMITTED	5	5	3	4	4	\N	4	4	3	2	3	2	Very relevant to my business needs, learned a lot	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.706	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80230100gapeu14pv	cmo558ks001ya100gss5d07hj	cmo558j7801sa100gb8g19tm3	cmo55803r00y27b0kivnt8i8n	SUBMITTED	4	4	5	4	4	\N	3	4	5	1	3	3	Great networking opportunity with fellow entrepreneurs	Provide handouts in advance for better preparation	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.777	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80231100gorgly0wc	cmo558ksz01ye100g3axlmuh0	cmo558j7801sa100gb8g19tm3	cmo55808y00y77b0k07q4amg0	SUBMITTED	4	4	3	4	5	\N	5	4	5	2	4	1	Perfect venue and well-managed logistics	Include more interactive group activities	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.804	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80232100g69xgcpbb	cmo558ku101yi100g5wrzdepg	cmo558j7801sa100gb8g19tm3	cmo5580fe00yc7b0khj6mgnge	SUBMITTED	4	4	4	5	4	\N	3	5	4	3	3	3	Excellent presentation and very informative session	Include more case studies from local businesses	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.831	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80234100g5dk3xc5g	cmo558kwb01yq100gw8wz7hzo	cmo558j7801sa100gb8g19tm3	cmo5580po00ym7b0kpwdoxgsu	SUBMITTED	4	5	4	5	4	\N	4	5	3	3	3	1	Very relevant to my business needs, learned a lot	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.881	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80236100gcm37nqt3	cmo558kyl01yy100gpcqmnjbw	cmo558j7801sa100gb8g19tm3	cmo55810700yw7b0k61bz2pxy	SUBMITTED	5	5	5	4	4	\N	5	4	4	4	1	3	Speaker was engaging and answered all questions thoroughly	Consider offering online options for those who cannot attend in person	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.94	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80235100gf29bdaax	cmo558kxg01yu100gryr0uyk9	cmo558j7801sa100gb8g19tm3	cmo5580uw00yr7b0kipuqllzh	SUBMITTED	4	4	5	5	5	\N	4	4	5	4	1	1	Very relevant to my business needs, learned a lot	Break sessions could be a bit longer	Keep up the great work, DTI Region VII!	\N	2026-04-19 02:25:18.91	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo555hqm00e2bf08llaptbk9	cmo555gbn00a3bf08ho0rbkup	cmo555f9x005zbf0853edgeal	cmo5552cu0047ex7q66xj61no	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00e4bf08x2002ob7	cmo555gdt00abbf08jebdktph	cmo555f9x005zbf0853edgeal	cmo5552mm004hex7qqkfp5zh2	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00eabf08hpjie53t	cmo555gkd00azbf08wkg0jy4g	cmo555f9x005zbf0853edgeal	cmo5553fx005bex7q3f5j2z8p	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00ebbf0831axfyi5	cmo555gld00b3bf08bcld1004	cmo555f9x005zbf0853edgeal	cmo5553kr005gex7qcilsbk1s	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555hqm00ecbf08d9f7n59r	cmo555gmg00b7bf08bgbt2u31	cmo555f9x005zbf0853edgeal	cmo5553pq005lex7qro9des1m	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:51.405	2026-04-19 02:22:51.406
cmo555klq00ozbf08sedlfwc6	cmo555jal00l9bf08d3udp5p8	cmo555j0n00jpbf08zx94o2jr	cmo5557cz0068ex7qqijcd7r1	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p1bf08rxxazb1p	cmo555jct00lhbf089o7ru14j	cmo555j0n00jpbf08zx94o2jr	cmo5557mk006iex7qrgldfsi8	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p5bf08opkofcs6	cmo555jh500lxbf08h36hoq3t	cmo555j0n00jpbf08zx94o2jr	cmo55585s0072ex7qqp4zao71	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00p8bf08o9lcjaim	cmo555jkd00m9bf08745y7t9m	cmo555j0n00jpbf08zx94o2jr	cmo5558kg007hex7qb8wk9tiy	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pbbf08e4k7iqxr	cmo555jnh00mlbf08ttvknujd	cmo555j0n00jpbf08zx94o2jr	cmo5558yx007wex7qf314tsay	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pdbf08g98e1c1p	cmo555jpm00mtbf08pr8if51c	cmo555j0n00jpbf08zx94o2jr	cmo55598i0086ex7qst477e0g	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00phbf08zm8ebowz	cmo555jtv00n9bf08ho0qnpd1	cmo555j0n00jpbf08zx94o2jr	cmo5559ry008qex7qickw9mfw	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pibf08kjsiinmw	cmo555jux00ndbf08ix175q9o	cmo555j0n00jpbf08zx94o2jr	cmo5559ws008vex7qild8vb2g	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo555klq00pjbf08tpem7kop	cmo555jw300nhbf0855bslp9y	cmo555j0n00jpbf08zx94o2jr	cmo555a1r0090ex7qb2tuchwh	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:22:55.118	2026-04-19 02:22:55.118
cmo5584h8009l100g5vg02g69	cmo5581h8001g100gv2japujl	cmo55815b0000100gwzv2dbyo	cmo5571t5000l7b0kentb80n3	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009p100gfjb6tb8a	cmo5581lr001w100gvxb1acjc	cmo55815b0000100gwzv2dbyo	cmo5572dk00157b0kdfa27lz9	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009s100gpk4ef6yx	cmo5581ox0028100gdt6yy7mu	cmo55815b0000100gwzv2dbyo	cmo5572t9001k7b0k3kfmnby5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009t100gge4u7ke3	cmo5581q2002c100ga4fhw9t2	cmo55815b0000100gwzv2dbyo	cmo5572y2001p7b0knexk6yzp	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009w100gys5lnrdz	cmo5581tc002o100gsno4k1mt	cmo55815b0000100gwzv2dbyo	cmo5573dj00247b0k7ma9cuck	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h8009x100gw9doec0j	cmo5581uh002s100getua5cmv	cmo55815b0000100gwzv2dbyo	cmo5573il00297b0kyp5up33v	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h9009z100gb66lhe47	cmo5581ws0030100g0zcx8ctt	cmo55815b0000100gwzv2dbyo	cmo5573su002j7b0kkq6dcegm	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a0100gkf4im61l	cmo5581xv0034100gf77ma6y6	cmo55815b0000100gwzv2dbyo	cmo5573xy002o7b0kvv0svdv4	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a1100gw4152uat	cmo5581z20038100g9fpftbqm	cmo55815b0000100gwzv2dbyo	cmo557432002t7b0kqdzw4iem	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a4100glcjhz60y	cmo55822g003k100gpfy4pyd3	cmo55815b0000100gwzv2dbyo	cmo5574i100387b0kfvaid90s	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a6100gviszn3bb	cmo55824r003s100gpbe7yjiw	cmo55815b0000100gwzv2dbyo	cmo5574rj003i7b0k5ydw3yif	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900a9100g8pb45p8d	cmo5582850044100gdlaw97qp	cmo55815b0000100gwzv2dbyo	cmo55756n003x7b0kgjzb3ett	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ae100g8ygtol0a	cmo5582ds004o100gfg6we2jr	cmo55815b0000100gwzv2dbyo	cmo5575w8004m7b0ket3hahgg	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ag100gv8tq5xrl	cmo5582g0004w100gxnjd6ev6	cmo55815b0000100gwzv2dbyo	cmo55766a004w7b0kwqeixmek	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ak100gzs9ibtsf	cmo5582kj005c100g5zvto7qv	cmo55815b0000100gwzv2dbyo	cmo5576qa005g7b0kne60f97z	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900al100gog3hjmq5	cmo5582lo005g100g8lm8jloo	cmo55815b0000100gwzv2dbyo	cmo5576vf005l7b0k17daxswb	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ao100gfksdxk24	cmo5582p3005s100gqervwapd	cmo55815b0000100gwzv2dbyo	cmo5577ae00607b0klevd0zfm	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900aq100gazclkos6	cmo5582re0060100gkr433x16	cmo55815b0000100gwzv2dbyo	cmo5577ki006a7b0kolz2x63s	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900ar100gi4gr83sb	cmo5582sj0064100g71g8pfiu	cmo55815b0000100gwzv2dbyo	cmo5577po006f7b0ksfb43ija	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900as100gse3wdn5y	cmo5582tp0068100gcgp4gr6s	cmo55815b0000100gwzv2dbyo	cmo5577ur006k7b0kfacbbmvs	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo5584h900aw100ga94f5oef	cmo5582ya006o100gquy8sumk	cmo55815b0000100gwzv2dbyo	cmo5578f200747b0k5coxzwrn	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:24:54.188	2026-04-19 02:24:54.189
cmo55890f00qv100g666qedql	cmo5587g100mh100geor9j4rx	cmo5585r700g1100gkoseur2n	cmo557f8w00ds7b0km8qaj3kq	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pn100gkkcdxxf8	cmo55862200hl100g08b15ed9	cmo5585r700g1100gkoseur2n	cmo5578zi007o7b0kxmwvaz05	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00ps100g2lipa0o5	cmo55867l00i5100gfawx9w2d	cmo5585r700g1100gkoseur2n	cmo5579oh008d7b0ksb0n73x5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pt100gxdi27ush	cmo55868q00i9100gv95ikcy2	cmo5585r700g1100gkoseur2n	cmo5579tg008i7b0k1kw4muf6	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pv100gf3czm85d	cmo5586ax00ih100gwdumcnhr	cmo5585r700g1100gkoseur2n	cmo557a3q008s7b0kura2pryz	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00py100g4nnk0n4g	cmo5586ea00it100gwy8aedwd	cmo5585r700g1100gkoseur2n	cmo557ais00977b0kx4e4gspx	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00pz100gh6k9m7wn	cmo5586fd00ix100g533t8cow	cmo5585r700g1100gkoseur2n	cmo557anm009c7b0ki1jnb0li	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q1100giqiber9q	cmo5586hj00j5100gpd6a3ngv	cmo5585r700g1100gkoseur2n	cmo557ay3009m7b0kvf5e8dzf	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q2100gpouo0d7a	cmo5586im00j9100gcpjc03u1	cmo5585r700g1100gkoseur2n	cmo557b2q009r7b0ko262ufn9	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q3100gsly1pbd9	cmo5586jr00jd100ggql43zcv	cmo5585r700g1100gkoseur2n	cmo557b7r009w7b0kbwfm7b3j	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q4100gwzhtxbr9	cmo5586kv00jh100ggd10xrxe	cmo5585r700g1100gkoseur2n	cmo557bcs00a17b0kr5nkw7r1	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q6100g2brgz1g9	cmo5586oq00jt100gqoyof6aj	cmo5585r700g1100gkoseur2n	cmo557bs000ag7b0ka8y4wcev	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q7100g06jytfg2	cmo5586pv00jx100geil7tvqw	cmo5585r700g1100gkoseur2n	cmo557bwz00al7b0kgepa3vbg	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q8100gocpmk03s	cmo5586qz00k1100gw8ndmef6	cmo5585r700g1100gkoseur2n	cmo557c2100aq7b0k71nd79qr	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00q9100gj81rwv9q	cmo5586s400k5100gk2m6y5he	cmo5585r700g1100gkoseur2n	cmo557c7300av7b0kzqcqzhuv	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qb100gk64xifrw	cmo5586ub00kd100gpnziacif	cmo5585r700g1100gkoseur2n	cmo557cjc00b57b0kqsqn55ze	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qc100gxslkol2s	cmo5586vc00kh100g4nck8hls	cmo5585r700g1100gkoseur2n	cmo557cp300ba7b0kvn837k55	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qe100g4mnx8js3	cmo5586xi00kp100gt3h0p00c	cmo5585r700g1100gkoseur2n	cmo557cys00bk7b0kiielhxzt	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qh100g3n1mc2b9	cmo55870t00l1100g7v258i0s	cmo5585r700g1100gkoseur2n	cmo557def00bz7b0k05s9niu5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00ql100gn7l7l8to	cmo55875t00lh100g3udoes1b	cmo5585r700g1100gkoseur2n	cmo557dyx00cj7b0kfph6iiov	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qr100g6si0ja9i	cmo5587bj00m1100g7milvt99	cmo5585r700g1100gkoseur2n	cmo557eog00d87b0k0ghqgjbj	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qs100go5vctc05	cmo5587co00m5100gbzjpz61s	cmo5585r700g1100gkoseur2n	cmo557etk00dd7b0kjohsyogv	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qw100gndkftlpi	cmo5587h700ml100gjdzhs2fk	cmo5585r700g1100gkoseur2n	cmo557fdy00dx7b0kmyrsuqo5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo55890f00qx100gux4g8rx1	cmo5587ib00mp100gohc3flqk	cmo5585r700g1100gkoseur2n	cmo557fj600e27b0kmu5hibaw	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:00.062	2026-04-19 02:25:00.063
cmo558dg3015j100grt6oqkek	cmo558amd00xt100grcn8kif6	cmo558a7c00vt100gkftjgmsa	cmo557gr500f67b0k4oirdxy0	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015l100ge3idjeza	cmo558aol00y1100g48dofopy	cmo558a7c00vt100gkftjgmsa	cmo557h1700fg7b0kj56vcyx4	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015n100g75qo9mp7	cmo558aqv00y9100g6ff3ursd	cmo558a7c00vt100gkftjgmsa	cmo557hbh00fq7b0k4s7i25n9	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015t100gmb7cetla	cmo558axn00yx100g8codwgz8	cmo558a7c00vt100gkftjgmsa	cmo557i6600gk7b0kihbemw91	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3015v100gjcr8gtcm	cmo558b1k00zd100gx2p3yv2i	cmo558a7c00vt100gkftjgmsa	cmo557irb00h47b0kjdayxn8n	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30162100gpp2p9cg3	cmo558azo00z5100g1qqcngw8	cmo558a7c00vt100gkftjgmsa	cmo557ig100gu7b0ktczurfm0	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30165100gydyv547a	cmo558bak0109100ghs1mhijw	cmo558a7c00vt100gkftjgmsa	cmo557jvj00i87b0kzu8b3y5q	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30168100gx2jx8wks	cmo558be2010l100gsrq5mihy	cmo558a7c00vt100gkftjgmsa	cmo557kav00in7b0kvr819xm1	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg30169100g4oa5nyvx	cmo558bf8010p100g9f7pnlgs	cmo558a7c00vt100gkftjgmsa	cmo557kfv00is7b0keethqpkw	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016a100ghe9n92jj	cmo558bgd010t100gauzzm84z	cmo558a7c00vt100gkftjgmsa	cmo557kl800ix7b0kmp825bgx	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016k100gow04sbdq	cmo558br0011x100geq6p3c6y	cmo558a7c00vt100gkftjgmsa	cmo557m1n00kb7b0k010r1b82	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016n100g5yddeh99	cmo558buf0129100gf9cd7p2z	cmo558a7c00vt100gkftjgmsa	cmo557mhd00kq7b0k7lg31xm8	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016o100g0cnupaok	cmo558bvk012d100g38q3kkfa	cmo558a7c00vt100gkftjgmsa	cmo557mmh00kv7b0kuce8hh6r	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558dg3016p100go1d3jwo9	cmo558bwo012h100gpfntl5mm	cmo558a7c00vt100gkftjgmsa	cmo557mrn00l07b0k2c81hsoh	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:05.81	2026-04-19 02:25:05.811
cmo558hx101lv100gdgvkejkq	cmo558ew201dk100gbuubtka3	cmo558eoo01cc100g1zgfdf9a	cmo557mwx00l57b0k9z24qbkl	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101lw100gp35c014v	cmo558ex801do100gcfu3vhri	cmo558eoo01cc100g1zgfdf9a	cmo557n2100la7b0kju9en5sb	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m3100gfp3gqzs8	cmo558f5501eg100gg1uo99ku	cmo558eoo01cc100g1zgfdf9a	cmo557o1l00m97b0kbpc6t7nm	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m5100gqw2esvrd	cmo558f7d01eo100gldaa3xd9	cmo558eoo01cc100g1zgfdf9a	cmo557obw00mj7b0k5pzx9w36	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m7100gm4k8ubpp	cmo558f9p01ew100g9xbncwg9	cmo558eoo01cc100g1zgfdf9a	cmo557olp00mt7b0kjxf1w5lt	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m8100gdjv6u15j	cmo558fau01f0100gx3p0qr2x	cmo558eoo01cc100g1zgfdf9a	cmo557oqo00my7b0kekoo7snp	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101m9100gk64mb15i	cmo558fby01f4100glwpanmbd	cmo558eoo01cc100g1zgfdf9a	cmo557owd00n37b0k96pwtt86	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mc100gcsp7p56u	cmo558ff601fg100g78olyeip	cmo558eoo01cc100g1zgfdf9a	cmo557pb800ni7b0krdgjttot	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101me100gjxk1lfqt	cmo558fh701fo100gy2v63buk	cmo558eoo01cc100g1zgfdf9a	cmo557pmi00ns7b0kzqav8xfj	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mf100gccs6wx4q	cmo558fib01fs100ghbuyd3zh	cmo558eoo01cc100g1zgfdf9a	cmo557prm00nx7b0ks4xdwk7z	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mh100g99yxhd95	cmo558fkb01g0100gm1b1i036	cmo558eoo01cc100g1zgfdf9a	cmo557q1i00o77b0k8783jbnc	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mn100gy5jjw1nc	cmo558fqc01go100g7oyuluu7	cmo558eoo01cc100g1zgfdf9a	cmo557qvg00p17b0kbvs44rl3	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mq100gt7h7l74b	cmo558fts01h0100greq2txb3	cmo558eoo01cc100g1zgfdf9a	cmo557ras00pg7b0kf375867f	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mr100gu4awcmzz	cmo558fuw01h4100g4vnnv019	cmo558eoo01cc100g1zgfdf9a	cmo557rfn00pl7b0kej55y9bk	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101ms100gckt5i7ls	cmo558fw101h8100gr53x58od	cmo558eoo01cc100g1zgfdf9a	cmo557rkr00pq7b0kbbtj1zwa	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mt100gul4k3ovh	cmo558fx501hc100gdcex1mqw	cmo558eoo01cc100g1zgfdf9a	cmo557rpw00pv7b0kvh4xon07	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mv100gt4pwwrtl	cmo558fzf01hk100gccemxgxo	cmo558eoo01cc100g1zgfdf9a	cmo557s0800q57b0k5c2vn2s6	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mw100g6pufewoh	cmo558g0m01ho100ga4b60nk7	cmo558eoo01cc100g1zgfdf9a	cmo557s4t00qa7b0kvz050jin	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx101mx100g74x0il06	cmo558g1q01hs100g2wmxnqqv	cmo558eoo01cc100g1zgfdf9a	cmo557s9r00qf7b0kv2j9wc4e	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201mz100gnvqm0guz	cmo558g4001i0100gxj9uaf6r	cmo558eoo01cc100g1zgfdf9a	cmo557sjy00qp7b0kcbixu68x	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n1100gprf5ka91	cmo558g6801i8100gplqcji02	cmo558eoo01cc100g1zgfdf9a	cmo557su500qz7b0k1800gjp0	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n5100g4d99ycvx	cmo558gap01io100gryn9n9z0	cmo558eoo01cc100g1zgfdf9a	cmo557tez00rj7b0kiw7z270r	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558hx201n6100gxpsqi31o	cmo558gbt01is100gchq7ala5	cmo558eoo01cc100g1zgfdf9a	cmo557tk200ro7b0k0q0bhpn0	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:11.605	2026-04-19 02:25:11.606
cmo558mi8022t100g6cmz21dc	cmo558kl701xm100g02qeyfwe	cmo558j7801sa100gb8g19tm3	cmo557z9600x87b0kxla3zvl5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022u100grdjjwtzc	cmo558kmd01xq100gygb1j38f	cmo558j7801sa100gb8g19tm3	cmo557zed00xd7b0kqrsc0fb2	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi7021u100gmzfbdiwy	cmo558jfk01tm100ghjyefpxv	cmo558j7801sa100gb8g19tm3	cmo557u4j00s87b0kojl3s945	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi7021v100ghg2cfv6l	cmo558jgq01tq100g3cm5lb6d	cmo558j7801sa100gb8g19tm3	cmo557u9r00sd7b0kuzobggoq	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi70220100gyh15tfwl	cmo558jnp01ue100g43lr5ix4	cmo558j7801sa100gb8g19tm3	cmo557v4800t77b0k2mc5rfic	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80224100g8yilf1ih	cmo558jsf01uu100gppejnptr	cmo558j7801sa100gb8g19tm3	cmo557von00tr7b0kpw9dyaf2	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80225100g2rrj8ogm	cmo558jtj01uy100gpeuk3ggr	cmo558j7801sa100gb8g19tm3	cmo557vup00tw7b0kka2z577m	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80226100ghv7xc19d	cmo558jup01v2100gega0sqbc	cmo558j7801sa100gb8g19tm3	cmo557w0200u17b0ka55u5wp5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80227100gajay3ye0	cmo558jvw01v6100g5wheu0u3	cmo558j7801sa100gb8g19tm3	cmo557w5600u67b0krc3w0c51	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022c100gfk0tybp1	cmo558k1i01vq100gtdr46gqy	cmo558j7801sa100gb8g19tm3	cmo557wuo00uv7b0k4im8bj0e	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022d100gd2fuk6mh	cmo558k2n01vu100giy9tvu56	cmo558j7801sa100gb8g19tm3	cmo557wzr00v07b0kjf3w2l23	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022h100gr4x9em2i	cmo558k7a01wa100go9mzl4cy	cmo558j7801sa100gb8g19tm3	cmo557xke00vk7b0kydwbgsas	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022i100g3smn606s	cmo558k8i01we100g5dqyj9xy	cmo558j7801sa100gb8g19tm3	cmo557xp400vp7b0k9gem5k8b	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022q100go4jfpzo5	cmo558khs01xa100gb22at26s	cmo558j7801sa100gb8g19tm3	cmo557ytx00wt7b0ku3vsvi6i	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022r100grl2q3whs	cmo558kiy01xe100g1suv0mx8	cmo558j7801sa100gb8g19tm3	cmo557yz200wy7b0kukfrukpk	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022s100gmmmktkgx	cmo558kk201xi100gfyoxdnxg	cmo558j7801sa100gb8g19tm3	cmo557z4700x37b0k193jisw5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022w100gy87rw2wm	cmo558kni01xu100gyxwbvq7c	cmo558j7801sa100gb8g19tm3	cmo557zji00xi7b0k56gau7l9	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022y100gat9f3tul	cmo558kpw01y2100gi17iz11y	cmo558j7801sa100gb8g19tm3	cmo557zu900xs7b0kbb2lyyc3	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi8022z100g3vmb30uc	cmo558kqz01y6100glnw7okzs	cmo558j7801sa100gb8g19tm3	cmo557zyu00xx7b0kgs9475e5	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
cmo558mi80233100gwg240ifk	cmo558kv601ym100gaqjtz3ma	cmo558j7801sa100gb8g19tm3	cmo5580kk00yh7b0kfejjlsyh	EXPIRED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 02:25:17.551	2026-04-19 02:25:17.552
\.


--
-- Data for Name: event_checklists; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.event_checklists (id, event_id, title, description, created_by, created_at, updated_at) FROM stdin;
cmo4e99l80001o680on9atzhp	cmo4djivv00008ytwvg5kp95a	Event Checklist	\N	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-18 13:49:57.836	2026-04-18 13:49:57.836
cmo4ff7j9000csq0jg9q1udjy	cmo4ff7a90000sq0j3py5r6zc	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-18 14:22:34.726	2026-04-18 14:22:34.726
cmo4ffr66001jsq0j3zxcgkjg	cmo4ffqxm0017sq0jpfl3sswp	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-18 14:23:00.175	2026-04-18 14:23:00.175
cmo4fm833000c13i6dt9bxza9	cmo4fm7tl000013i65nq60ql9	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-18 14:28:02.032	2026-04-18 14:28:02.032
cmo553xak000cbf0891vawxo7	cmo553x4p0000bf08wscm80zn	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:21:38.253	2026-04-19 02:21:38.253
cmo553xmy001jbf087hecbzjw	cmo553xi40017bf08k1kzzfep	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:21:38.698	2026-04-19 02:21:38.698
cmo553xym002qbf08de0864tb	cmo553xts002ebf0899aueskl	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:21:39.119	2026-04-19 02:21:39.119
cmo553y9r003xbf08l0h98t3y	cmo553y50003lbf08v5q5dlpc	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:21:39.519	2026-04-19 02:21:39.519
cmo553yld0054bf08chygt5dn	cmo553yh0004sbf08bn61lcqs	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:21:39.937	2026-04-19 02:21:39.937
cmo555fex006bbf08impdrv6e	cmo555f9x005zbf0853edgeal	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:22:48.393	2026-04-19 02:22:48.393
cmo555iu700iubf08mlt3b0ju	cmo555ipb00iibf08ubpwnt83	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:22:52.831	2026-04-19 02:22:52.831
cmo555j5i00k1bf08ymbwvb9a	cmo555j0n00jpbf08zx94o2jr	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:22:53.239	2026-04-19 02:22:53.239
cmo5581bf000c100gn0ie2yb0	cmo55815b0000100gwzv2dbyo	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:24:50.092	2026-04-19 02:24:50.092
cmo5585wb00gd100gsa2uu1fu	cmo5585r700g1100gkoseur2n	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:24:56.028	2026-04-19 02:24:56.028
cmo558ac600w5100gxrmpre7j	cmo558a7c00vt100gkftjgmsa	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:25:01.782	2026-04-19 02:25:01.782
cmo558etl01co100g73l27cj6	cmo558eoo01cc100g1zgfdf9a	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:25:07.593	2026-04-19 02:25:07.593
cmo558jc201sm100gime9mmh3	cmo558j7801sa100gb8g19tm3	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	9cff5efd-7267-4c17-92f3-42c5741c619e	2026-04-19 02:25:13.442	2026-04-19 02:25:13.442
cmocl1h5z00061w8somwpt6jl	cmocl0xwk00041w8skllixjad	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	e4d48cc5-a05b-425c-9c89-57e4232c6db2	2026-04-24 07:22:01.128	2026-04-24 07:22:01.128
cmocm2m7d001d1w8s7yvaq24c	cmocm26ej001b1w8syavkdvtc	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	e4d48cc5-a05b-425c-9c89-57e4232c6db2	2026-04-24 07:50:53.929	2026-04-24 07:50:53.929
cmp1yna9m0001me1wc7e8bhkp	cmp171iiu00005ckaazxybh61	DTI Training Monitoring Checklist (FM-CT-7)	Standard DTI QMS checklist for Conduct of Training procedure.	e4d48cc5-a05b-425c-9c89-57e4232c6db2	2026-05-12 01:37:08.026	2026-05-12 01:37:08.026
\.


--
-- Data for Name: event_materials; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.event_materials (id, event_id, title, description, drive_url, uploaded_by, expires_at, is_expired, expired_at, created_at) FROM stdin;
\.


--
-- Data for Name: event_participations; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.event_participations (id, event_id, user_id, enterprise_id, enterprise_name, status, participant_name, participant_email, registered_at, rsvp_confirmed_at, tna_completed_at, completed_at, notes) FROM stdin;
cmocm3aeo00291w8s2mo7jy5b	cmocm26ej001b1w8syavkdvtc	cmocl3m6h001ouxz76nugd8fe	\N	\N	ATTENDED	Aubrey Cabanlit	aubreycabanlit@gmail.com	2026-04-24 07:51:25.295	2026-04-24 07:52:10.964	2026-04-24 07:52:10.964	\N	\N
cmo4ffr8g002dsq0jkn6nkvlb	cmo4ffqxm0017sq0jpfl3sswp	cmo4ffqox001rh97sicpq93hx	\N	\N	ATTENDED	Juan Dela Cruz	e2e.participant.1776522179@test.com	2026-04-18 14:23:00.255	2026-04-18 14:23:00.32	2026-04-18 14:23:00.32	\N	\N
cmo4fm85h001613i6frvlogxd	cmo4fm7tl000013i65nq60ql9	cmo4fm7ho002mh97swd7ejic0	\N	\N	COMPLETED	Juan Dela Cruz	e2e.participant.1776522481@test.com	2026-04-18 14:28:02.117	2026-04-18 14:28:02.182	2026-04-18 14:28:02.182	2026-04-18 14:28:03.828	\N
cmo555fhj0077bf08062yinal	cmo555f9x005zbf0853edgeal	cmo554yt5000lex7qyixte2cl	\N	\N	COMPLETED	Maria Reyes	scale.p0.1776565346@test.com	2026-04-19 02:22:48.487	2026-04-19 02:22:48.533	2026-04-19 02:22:48.533	2026-04-19 02:22:52.508	\N
cmo555fj9007bbf0828kybt32	cmo555f9x005zbf0853edgeal	cmo554yz1000qex7qdvbqy248	\N	\N	COMPLETED	Juan Santos	scale.p1.1776565346@test.com	2026-04-19 02:22:48.549	2026-04-19 02:22:48.576	2026-04-19 02:22:48.576	2026-04-19 02:22:52.508	\N
cmo555fkc007fbf08etphgmfy	cmo555f9x005zbf0853edgeal	cmo554z4j000vex7q1oq94pkd	\N	\N	COMPLETED	Ana Garcia	scale.p2.1776565346@test.com	2026-04-19 02:22:48.588	2026-04-19 02:22:48.616	2026-04-19 02:22:48.616	2026-04-19 02:22:52.508	\N
cmo555fli007jbf082suvf5qw	cmo555f9x005zbf0853edgeal	cmo554z9c0010ex7qbkmvrue1	\N	\N	COMPLETED	Pedro Cruz	scale.p3.1776565346@test.com	2026-04-19 02:22:48.63	2026-04-19 02:22:48.655	2026-04-19 02:22:48.655	2026-04-19 02:22:52.508	\N
cmo555fml007nbf08wz432486	cmo555f9x005zbf0853edgeal	cmo554ze40015ex7qrrqry2yx	\N	\N	COMPLETED	Rosa Bautista	scale.p4.1776565346@test.com	2026-04-19 02:22:48.669	2026-04-19 02:22:48.697	2026-04-19 02:22:48.697	2026-04-19 02:22:52.508	\N
cmo555fnq007rbf088e2kkabk	cmo555f9x005zbf0853edgeal	cmo554ziy001aex7q91ump9i0	\N	\N	COMPLETED	Carlos Mendoza	scale.p5.1776565346@test.com	2026-04-19 02:22:48.71	2026-04-19 02:22:48.737	2026-04-19 02:22:48.737	2026-04-19 02:22:52.508	\N
cmo555fot007vbf08kupc7ncp	cmo555f9x005zbf0853edgeal	cmo554zns001fex7qey84l5wj	\N	\N	COMPLETED	Elena Villanueva	scale.p6.1776565346@test.com	2026-04-19 02:22:48.749	2026-04-19 02:22:48.796	2026-04-19 02:22:48.796	2026-04-19 02:22:52.508	\N
cmo555fqi007zbf08lrruk7l6	cmo555f9x005zbf0853edgeal	cmo554zsp001kex7qyvjggvkt	\N	\N	COMPLETED	Miguel Flores	scale.p7.1776565346@test.com	2026-04-19 02:22:48.81	2026-04-19 02:22:48.845	2026-04-19 02:22:48.845	2026-04-19 02:22:52.508	\N
cmo555fru0083bf08cyckm2ol	cmo555f9x005zbf0853edgeal	cmo554zxn001pex7q0qm5ql5z	\N	\N	COMPLETED	Sofia Ramos	scale.p8.1776565346@test.com	2026-04-19 02:22:48.858	2026-04-19 02:22:48.888	2026-04-19 02:22:48.888	2026-04-19 02:22:52.508	\N
cmo555ft30087bf08t0jnaqaz	cmo555f9x005zbf0853edgeal	cmo55502n001uex7q1xhmm0u6	\N	\N	COMPLETED	Jose Torres	scale.p9.1776565346@test.com	2026-04-19 02:22:48.903	2026-04-19 02:22:48.93	2026-04-19 02:22:48.93	2026-04-19 02:22:52.508	\N
cmo555fvb008fbf082p7vbkaj	cmo555f9x005zbf0853edgeal	cmo5550cw0024ex7qhuaaneof	\N	\N	COMPLETED	Rafael Lopez	scale.p11.1776565346@test.com	2026-04-19 02:22:48.983	2026-04-19 02:22:49.01	2026-04-19 02:22:49.01	2026-04-19 02:22:52.508	\N
cmo555fwe008jbf08a6e1h8r1	cmo555f9x005zbf0853edgeal	cmo5550hc0029ex7qrnpv4kdm	\N	\N	COMPLETED	Teresa Rivera	scale.p12.1776565346@test.com	2026-04-19 02:22:49.021	2026-04-19 02:22:49.048	2026-04-19 02:22:49.048	2026-04-19 02:22:52.508	\N
cmo555fxk008nbf08rkpchl5s	cmo555f9x005zbf0853edgeal	cmo5550m4002eex7q9usd5an7	\N	\N	COMPLETED	Diego Hernandez	scale.p13.1776565346@test.com	2026-04-19 02:22:49.063	2026-04-19 02:22:49.09	2026-04-19 02:22:49.09	2026-04-19 02:22:52.508	\N
cmo555fym008rbf080sgey834	cmo555f9x005zbf0853edgeal	cmo5550r1002jex7q7pf6lcna	\N	\N	COMPLETED	Lucia Morales	scale.p14.1776565346@test.com	2026-04-19 02:22:49.102	2026-04-19 02:22:49.129	2026-04-19 02:22:49.129	2026-04-19 02:22:52.508	\N
cmo555fzp008vbf085djtyarf	cmo555f9x005zbf0853edgeal	cmo5550vv002oex7q340uf20w	\N	\N	COMPLETED	Antonio Castillo	scale.p15.1776565346@test.com	2026-04-19 02:22:49.141	2026-04-19 02:22:49.168	2026-04-19 02:22:49.168	2026-04-19 02:22:52.508	\N
cmo555g0t008zbf088kjde1vx	cmo555f9x005zbf0853edgeal	cmo55510n002tex7qkprywdc5	\N	\N	COMPLETED	Isabel Aquino	scale.p16.1776565346@test.com	2026-04-19 02:22:49.18	2026-04-19 02:22:49.206	2026-04-19 02:22:49.206	2026-04-19 02:22:52.508	\N
cmo555g1u0093bf083os1gbbz	cmo555f9x005zbf0853edgeal	cmo55515h002yex7qu97zuqp5	\N	\N	COMPLETED	Francisco Delgado	scale.p17.1776565346@test.com	2026-04-19 02:22:49.218	2026-04-19 02:22:49.245	2026-04-19 02:22:49.245	2026-04-19 02:22:52.508	\N
cmo555g2x0097bf08vr1e847m	cmo555f9x005zbf0853edgeal	cmo5551a80033ex7q7a9ae4pb	\N	\N	COMPLETED	Beatriz Enriquez	scale.p18.1776565346@test.com	2026-04-19 02:22:49.256	2026-04-19 02:22:49.283	2026-04-19 02:22:49.283	2026-04-19 02:22:52.508	\N
cmo555g40009bbf08zxs1d22a	cmo555f9x005zbf0853edgeal	cmo5551f00038ex7q3bdiw464	\N	\N	COMPLETED	Manuel Fernandez	scale.p19.1776565346@test.com	2026-04-19 02:22:49.295	2026-04-19 02:22:49.322	2026-04-19 02:22:49.322	2026-04-19 02:22:52.508	\N
cmo555g53009fbf08unc2oh4w	cmo555f9x005zbf0853edgeal	cmo5551ju003dex7qw677xuzp	\N	\N	COMPLETED	Patricia Perez	scale.p20.1776565346@test.com	2026-04-19 02:22:49.335	2026-04-19 02:22:49.36	2026-04-19 02:22:49.36	2026-04-19 02:22:52.508	\N
cmo555g65009jbf08tb5vo4n0	cmo555f9x005zbf0853edgeal	cmo5551op003iex7q64q5e9jh	\N	\N	COMPLETED	Ricardo Aguilar	scale.p21.1776565346@test.com	2026-04-19 02:22:49.373	2026-04-19 02:22:49.4	2026-04-19 02:22:49.4	2026-04-19 02:22:52.508	\N
cmo555g79009nbf08zs0gjt0z	cmo555f9x005zbf0853edgeal	cmo5551ti003nex7qtz7hv881	\N	\N	COMPLETED	Gloria Navarro	scale.p22.1776565346@test.com	2026-04-19 02:22:49.413	2026-04-19 02:22:49.44	2026-04-19 02:22:49.44	2026-04-19 02:22:52.508	\N
cmo555g8c009rbf08qzc4kk18	cmo555f9x005zbf0853edgeal	cmo5551yd003sex7quaibpbrx	\N	\N	COMPLETED	Fernando Rojas	scale.p23.1776565346@test.com	2026-04-19 02:22:49.452	2026-04-19 02:22:49.478	2026-04-19 02:22:49.478	2026-04-19 02:22:52.508	\N
cmo555g9h009vbf08vunga1vd	cmo555f9x005zbf0853edgeal	cmo555238003xex7qaeka0et6	\N	\N	COMPLETED	Pilar Salazar	scale.p24.1776565346@test.com	2026-04-19 02:22:49.493	2026-04-19 02:22:49.519	2026-04-19 02:22:49.519	2026-04-19 02:22:52.508	\N
cmo555gak009zbf08xmagg0zz	cmo555f9x005zbf0853edgeal	cmo5552810042ex7qd4vnbvys	\N	\N	COMPLETED	Emilio Mercado	scale.p25.1776565346@test.com	2026-04-19 02:22:49.532	2026-04-19 02:22:49.559	2026-04-19 02:22:49.559	2026-04-19 02:22:52.508	\N
cmo555gbn00a3bf08ho0rbkup	cmo555f9x005zbf0853edgeal	cmo5552cu0047ex7q66xj61no	\N	\N	COMPLETED	Dolores Pascual	scale.p26.1776565346@test.com	2026-04-19 02:22:49.571	2026-04-19 02:22:49.597	2026-04-19 02:22:49.597	2026-04-19 02:22:52.508	\N
cmo555gdt00abbf08jebdktph	cmo555f9x005zbf0853edgeal	cmo5552mm004hex7qqkfp5zh2	\N	\N	COMPLETED	Rosario Tolentino	scale.p28.1776565346@test.com	2026-04-19 02:22:49.649	2026-04-19 02:22:49.675	2026-04-19 02:22:49.675	2026-04-19 02:22:52.508	\N
cmo555gev00afbf08dx597ymk	cmo555f9x005zbf0853edgeal	cmo5552rp004mex7qcfys3rdj	\N	\N	COMPLETED	Andres Santiago	scale.p29.1776565346@test.com	2026-04-19 02:22:49.687	2026-04-19 02:22:49.714	2026-04-19 02:22:49.714	2026-04-19 02:22:52.508	\N
cmo555gg000ajbf085dkibndd	cmo555f9x005zbf0853edgeal	cmo5552wj004rex7qp77yh9hd	\N	\N	COMPLETED	Angela Manalo	scale.p30.1776565346@test.com	2026-04-19 02:22:49.728	2026-04-19 02:22:49.755	2026-04-19 02:22:49.755	2026-04-19 02:22:52.508	\N
cmo555gh300anbf08dwtbykda	cmo555f9x005zbf0853edgeal	cmo55531g004wex7qlbpost8b	\N	\N	COMPLETED	Roberto Ocampo	scale.p31.1776565346@test.com	2026-04-19 02:22:49.767	2026-04-19 02:22:49.793	2026-04-19 02:22:49.793	2026-04-19 02:22:52.508	\N
cmo555gi600arbf08666y1ss9	cmo555f9x005zbf0853edgeal	cmo55536b0051ex7qx1hup7wg	\N	\N	COMPLETED	Consuelo Valdez	scale.p32.1776565346@test.com	2026-04-19 02:22:49.806	2026-04-19 02:22:49.832	2026-04-19 02:22:49.832	2026-04-19 02:22:52.508	\N
cmo555gjb00avbf08bz6m8hav	cmo555f9x005zbf0853edgeal	cmo5553b50056ex7qp47mnbao	\N	\N	COMPLETED	Sergio Soriano	scale.p33.1776565346@test.com	2026-04-19 02:22:49.846	2026-04-19 02:22:49.873	2026-04-19 02:22:49.873	2026-04-19 02:22:52.508	\N
cmo555gkd00azbf08wkg0jy4g	cmo555f9x005zbf0853edgeal	cmo5553fx005bex7q3f5j2z8p	\N	\N	COMPLETED	Esperanza Paras	scale.p34.1776565346@test.com	2026-04-19 02:22:49.885	2026-04-19 02:22:49.91	2026-04-19 02:22:49.91	2026-04-19 02:22:52.508	\N
cmo555gld00b3bf08bcld1004	cmo555f9x005zbf0853edgeal	cmo5553kr005gex7qcilsbk1s	\N	\N	COMPLETED	Leonardo Bello	scale.p35.1776565346@test.com	2026-04-19 02:22:49.921	2026-04-19 02:22:49.947	2026-04-19 02:22:49.947	2026-04-19 02:22:52.508	\N
cmo555gmg00b7bf08bgbt2u31	cmo555f9x005zbf0853edgeal	cmo5553pq005lex7qro9des1m	\N	\N	COMPLETED	Margarita Espinosa	scale.p36.1776565346@test.com	2026-04-19 02:22:49.96	2026-04-19 02:22:49.987	2026-04-19 02:22:49.987	2026-04-19 02:22:52.508	\N
cmo555fu9008bbf08jh0vr1kb	cmo555f9x005zbf0853edgeal	cmo55507n001zex7qhbbrvrpf	\N	\N	COMPLETED	Carmen Gonzales	scale.p10.1776565346@test.com	2026-04-19 02:22:48.944	2026-04-19 02:22:48.97	2026-04-19 02:22:48.97	2026-04-19 02:22:52.508	\N
cmo555gcp00a7bf083lyprtsw	cmo555f9x005zbf0853edgeal	cmo5552hr004cex7q9922plh9	\N	\N	COMPLETED	Gabriel Domingo	scale.p27.1776565346@test.com	2026-04-19 02:22:49.609	2026-04-19 02:22:49.636	2026-04-19 02:22:49.636	2026-04-19 02:22:52.508	\N
cmocl4szv00101w8s3u3zv9v6	cmocl0xwk00041w8skllixjad	cmockq3hi001buxz7570ou2ax	\N	\N	RSVP_CONFIRMED	MARIAN KAREN  SOROPIA	MarianKarenSoropia@dti.gov.ph	2026-04-24 07:24:36.426	2026-04-24 07:26:47.963	2026-04-24 07:26:47.963	\N	\N
cmo5581ea0018100gygk39jop	cmo55815b0000100gwzv2dbyo	cmo5571h1000b7b0kvbhjo2t5	\N	\N	COMPLETED	Maria Reyes	scale.p0.1776565443@test.com	2026-04-19 02:24:50.194	2026-04-19 02:24:50.249	2026-04-19 02:24:50.249	2026-04-19 02:24:55.65	\N
cmo5581g5001c100g9291taw7	cmo55815b0000100gwzv2dbyo	cmo5571o0000g7b0kq8y8ir80	\N	\N	COMPLETED	Juan Santos	scale.p1.1776565443@test.com	2026-04-19 02:24:50.261	2026-04-19 02:24:50.288	2026-04-19 02:24:50.288	2026-04-19 02:24:55.65	\N
cmo5581h8001g100gv2japujl	cmo55815b0000100gwzv2dbyo	cmo5571t5000l7b0kentb80n3	\N	\N	COMPLETED	Ana Garcia	scale.p2.1776565443@test.com	2026-04-19 02:24:50.3	2026-04-19 02:24:50.327	2026-04-19 02:24:50.327	2026-04-19 02:24:55.65	\N
cmo5581id001k100gij4y27q7	cmo55815b0000100gwzv2dbyo	cmo5571yb000q7b0kyr57hyi4	\N	\N	COMPLETED	Pedro Cruz	scale.p3.1776565443@test.com	2026-04-19 02:24:50.341	2026-04-19 02:24:50.37	2026-04-19 02:24:50.37	2026-04-19 02:24:55.65	\N
cmo5581ji001o100g69sjxolw	cmo55815b0000100gwzv2dbyo	cmo55723c000v7b0kt9gamfyc	\N	\N	COMPLETED	Rosa Bautista	scale.p4.1776565443@test.com	2026-04-19 02:24:50.382	2026-04-19 02:24:50.41	2026-04-19 02:24:50.41	2026-04-19 02:24:55.65	\N
cmo5581kp001s100gy3g1zmil	cmo55815b0000100gwzv2dbyo	cmo55728g00107b0k2emi8bq4	\N	\N	COMPLETED	Carlos Mendoza	scale.p5.1776565443@test.com	2026-04-19 02:24:50.425	2026-04-19 02:24:50.452	2026-04-19 02:24:50.452	2026-04-19 02:24:55.65	\N
cmo555j7l00kxbf082905e1zj	cmo555j0n00jpbf08zx94o2jr	cmo5556yj005tex7qalnw8g2m	\N	\N	ATTENDED	Dolores Pascual	scale.p126.1776565346@test.com	2026-04-19 02:22:53.313	2026-04-19 02:22:53.338	2026-04-19 02:22:53.338	\N	\N
cmo555j8k00l1bf08a7nop0ra	cmo555j0n00jpbf08zx94o2jr	cmo55573d005yex7qcmbl9alc	\N	\N	ATTENDED	Gabriel Domingo	scale.p127.1776565346@test.com	2026-04-19 02:22:53.348	2026-04-19 02:22:53.373	2026-04-19 02:22:53.373	\N	\N
cmo555j9l00l5bf08hzymv07p	cmo555j0n00jpbf08zx94o2jr	cmo5557860063ex7q8znd7swt	\N	\N	ATTENDED	Rosario Tolentino	scale.p128.1776565346@test.com	2026-04-19 02:22:53.385	2026-04-19 02:22:53.41	2026-04-19 02:22:53.41	\N	\N
cmo555jal00l9bf08d3udp5p8	cmo555j0n00jpbf08zx94o2jr	cmo5557cz0068ex7qqijcd7r1	\N	\N	ATTENDED	Andres Santiago	scale.p129.1776565346@test.com	2026-04-19 02:22:53.421	2026-04-19 02:22:53.449	2026-04-19 02:22:53.449	\N	\N
cmo555jbq00ldbf08e6iozfu4	cmo555j0n00jpbf08zx94o2jr	cmo5557hs006dex7qlfv0x2ws	\N	\N	ATTENDED	Angela Manalo	scale.p130.1776565346@test.com	2026-04-19 02:22:53.462	2026-04-19 02:22:53.488	2026-04-19 02:22:53.488	\N	\N
cmo555jct00lhbf089o7ru14j	cmo555j0n00jpbf08zx94o2jr	cmo5557mk006iex7qrgldfsi8	\N	\N	ATTENDED	Roberto Ocampo	scale.p131.1776565346@test.com	2026-04-19 02:22:53.5	2026-04-19 02:22:53.527	2026-04-19 02:22:53.527	\N	\N
cmo555jdw00llbf08e8rlx6nh	cmo555j0n00jpbf08zx94o2jr	cmo5557rc006nex7qeg93hl17	\N	\N	ATTENDED	Consuelo Valdez	scale.p132.1776565346@test.com	2026-04-19 02:22:53.54	2026-04-19 02:22:53.567	2026-04-19 02:22:53.567	\N	\N
cmo555jf000lpbf08ggb5cjzs	cmo555j0n00jpbf08zx94o2jr	cmo5557w4006sex7qo2gkf7d5	\N	\N	ATTENDED	Sergio Soriano	scale.p133.1776565346@test.com	2026-04-19 02:22:53.58	2026-04-19 02:22:53.606	2026-04-19 02:22:53.606	\N	\N
cmo555jg200ltbf08mjhud34d	cmo555j0n00jpbf08zx94o2jr	cmo55580z006xex7qrbxe9oq0	\N	\N	ATTENDED	Esperanza Paras	scale.p134.1776565346@test.com	2026-04-19 02:22:53.618	2026-04-19 02:22:53.645	2026-04-19 02:22:53.645	\N	\N
cmo555jh500lxbf08h36hoq3t	cmo555j0n00jpbf08zx94o2jr	cmo55585s0072ex7qqp4zao71	\N	\N	ATTENDED	Leonardo Bello	scale.p135.1776565346@test.com	2026-04-19 02:22:53.657	2026-04-19 02:22:53.684	2026-04-19 02:22:53.684	\N	\N
cmo555ji900m1bf08fvism68y	cmo555j0n00jpbf08zx94o2jr	cmo5558as0077ex7q1m6e90ty	\N	\N	ATTENDED	Margarita Espinosa	scale.p136.1776565346@test.com	2026-04-19 02:22:53.697	2026-04-19 02:22:53.722	2026-04-19 02:22:53.722	\N	\N
cmo555jja00m5bf08fz0rz3b7	cmo555j0n00jpbf08zx94o2jr	cmo5558fp007cex7qiku75o2h	\N	\N	ATTENDED	Alejandro Montoya	scale.p137.1776565346@test.com	2026-04-19 02:22:53.734	2026-04-19 02:22:53.761	2026-04-19 02:22:53.761	\N	\N
cmo555jkd00m9bf08745y7t9m	cmo555j0n00jpbf08zx94o2jr	cmo5558kg007hex7qb8wk9tiy	\N	\N	ATTENDED	Remedios Cabrera	scale.p138.1776565346@test.com	2026-04-19 02:22:53.772	2026-04-19 02:22:53.799	2026-04-19 02:22:53.799	\N	\N
cmo555jle00mdbf0804j9cg56	cmo555j0n00jpbf08zx94o2jr	cmo5558pa007mex7qxoleq3nw	\N	\N	ATTENDED	Eduardo Guerrero	scale.p139.1776565346@test.com	2026-04-19 02:22:53.81	2026-04-19 02:22:53.836	2026-04-19 02:22:53.836	\N	\N
cmo555jmg00mhbf085xybsgeo	cmo555j0n00jpbf08zx94o2jr	cmo5558u5007rex7qygaz5dks	\N	\N	ATTENDED	Victoria Luna	scale.p140.1776565346@test.com	2026-04-19 02:22:53.848	2026-04-19 02:22:53.874	2026-04-19 02:22:53.874	\N	\N
cmo555jnh00mlbf08ttvknujd	cmo555j0n00jpbf08zx94o2jr	cmo5558yx007wex7qf314tsay	\N	\N	ATTENDED	Alfredo Alvarez	scale.p141.1776565346@test.com	2026-04-19 02:22:53.885	2026-04-19 02:22:53.915	2026-04-19 02:22:53.915	\N	\N
cmo555jon00mpbf087y39yfhy	cmo555j0n00jpbf08zx94o2jr	cmo55593p0081ex7q8hgfd37l	\N	\N	ATTENDED	Mercedes Molina	scale.p142.1776565346@test.com	2026-04-19 02:22:53.927	2026-04-19 02:22:53.952	2026-04-19 02:22:53.952	\N	\N
cmo555jpm00mtbf08pr8if51c	cmo555j0n00jpbf08zx94o2jr	cmo55598i0086ex7qst477e0g	\N	\N	ATTENDED	Lorenzo Vargas	scale.p143.1776565346@test.com	2026-04-19 02:22:53.962	2026-04-19 02:22:53.988	2026-04-19 02:22:53.988	\N	\N
cmo555jqq00mxbf08c59b02o7	cmo555j0n00jpbf08zx94o2jr	cmo5559db008bex7q1kvszvoq	\N	\N	ATTENDED	Aurora Ortega	scale.p144.1776565346@test.com	2026-04-19 02:22:54.001	2026-04-19 02:22:54.028	2026-04-19 02:22:54.028	\N	\N
cmo555jrs00n1bf08geninetu	cmo555j0n00jpbf08zx94o2jr	cmo5559ia008gex7qdz79n4ky	\N	\N	ATTENDED	Ramon Medina	scale.p145.1776565346@test.com	2026-04-19 02:22:54.04	2026-04-19 02:22:54.066	2026-04-19 02:22:54.066	\N	\N
cmo555jst00n5bf08yjb5n2rm	cmo555j0n00jpbf08zx94o2jr	cmo5559n5008lex7q85mcurd2	\N	\N	ATTENDED	Soledad Herrera	scale.p146.1776565346@test.com	2026-04-19 02:22:54.077	2026-04-19 02:22:54.103	2026-04-19 02:22:54.103	\N	\N
cmo555jtv00n9bf08ho0qnpd1	cmo555j0n00jpbf08zx94o2jr	cmo5559ry008qex7qickw9mfw	\N	\N	ATTENDED	Ernesto Jimenez	scale.p147.1776565346@test.com	2026-04-19 02:22:54.115	2026-04-19 02:22:54.141	2026-04-19 02:22:54.141	\N	\N
cmo555jux00ndbf08ix175q9o	cmo555j0n00jpbf08zx94o2jr	cmo5559ws008vex7qild8vb2g	\N	\N	ATTENDED	Josefina Fuentes	scale.p148.1776565346@test.com	2026-04-19 02:22:54.153	2026-04-19 02:22:54.18	2026-04-19 02:22:54.18	\N	\N
cmo555jw300nhbf0855bslp9y	cmo555j0n00jpbf08zx94o2jr	cmo555a1r0090ex7qb2tuchwh	\N	\N	ATTENDED	Arturo Paredes	scale.p149.1776565346@test.com	2026-04-19 02:22:54.195	2026-04-19 02:22:54.221	2026-04-19 02:22:54.221	\N	\N
cmo5581lr001w100gvxb1acjc	cmo55815b0000100gwzv2dbyo	cmo5572dk00157b0kdfa27lz9	\N	\N	COMPLETED	Elena Villanueva	scale.p6.1776565443@test.com	2026-04-19 02:24:50.463	2026-04-19 02:24:50.49	2026-04-19 02:24:50.49	2026-04-19 02:24:55.65	\N
cmo5581mt0020100gvrk6pxb2	cmo55815b0000100gwzv2dbyo	cmo5572in001a7b0ksp15rne9	\N	\N	COMPLETED	Miguel Flores	scale.p7.1776565443@test.com	2026-04-19 02:24:50.501	2026-04-19 02:24:50.526	2026-04-19 02:24:50.526	2026-04-19 02:24:55.65	\N
cmo5581nu0024100gdr0ri3kt	cmo55815b0000100gwzv2dbyo	cmo5572o0001f7b0k89tsu6xz	\N	\N	COMPLETED	Sofia Ramos	scale.p8.1776565443@test.com	2026-04-19 02:24:50.538	2026-04-19 02:24:50.565	2026-04-19 02:24:50.565	2026-04-19 02:24:55.65	\N
cmo5581q2002c100ga4fhw9t2	cmo55815b0000100gwzv2dbyo	cmo5572y2001p7b0knexk6yzp	\N	\N	COMPLETED	Carmen Gonzales	scale.p10.1776565443@test.com	2026-04-19 02:24:50.618	2026-04-19 02:24:50.645	2026-04-19 02:24:50.645	2026-04-19 02:24:55.65	\N
cmo5581r5002g100g0mk6h13k	cmo55815b0000100gwzv2dbyo	cmo557334001u7b0kbzti09g6	\N	\N	COMPLETED	Rafael Lopez	scale.p11.1776565443@test.com	2026-04-19 02:24:50.657	2026-04-19 02:24:50.684	2026-04-19 02:24:50.684	2026-04-19 02:24:55.65	\N
cmo5581s9002k100gytid3u5f	cmo55815b0000100gwzv2dbyo	cmo55738r001z7b0kj4tatqp6	\N	\N	COMPLETED	Teresa Rivera	scale.p12.1776565443@test.com	2026-04-19 02:24:50.697	2026-04-19 02:24:50.724	2026-04-19 02:24:50.724	2026-04-19 02:24:55.65	\N
cmo5581tc002o100gsno4k1mt	cmo55815b0000100gwzv2dbyo	cmo5573dj00247b0k7ma9cuck	\N	\N	COMPLETED	Diego Hernandez	scale.p13.1776565443@test.com	2026-04-19 02:24:50.736	2026-04-19 02:24:50.764	2026-04-19 02:24:50.764	2026-04-19 02:24:55.65	\N
cmo5581ox0028100gdt6yy7mu	cmo55815b0000100gwzv2dbyo	cmo5572t9001k7b0k3kfmnby5	\N	\N	COMPLETED	Jose Torres	scale.p9.1776565443@test.com	2026-04-19 02:24:50.577	2026-04-19 02:24:50.605	2026-04-19 02:24:50.605	2026-04-19 02:24:55.65	\N
cmo5581uh002s100getua5cmv	cmo55815b0000100gwzv2dbyo	cmo5573il00297b0kyp5up33v	\N	\N	COMPLETED	Lucia Morales	scale.p14.1776565443@test.com	2026-04-19 02:24:50.777	2026-04-19 02:24:50.806	2026-04-19 02:24:50.806	2026-04-19 02:24:55.65	\N
cmo5581vo002w100g5qb3tmh1	cmo55815b0000100gwzv2dbyo	cmo5573no002e7b0kjcd13s63	\N	\N	COMPLETED	Antonio Castillo	scale.p15.1776565443@test.com	2026-04-19 02:24:50.82	2026-04-19 02:24:50.848	2026-04-19 02:24:50.848	2026-04-19 02:24:55.65	\N
cmo5581ws0030100g0zcx8ctt	cmo55815b0000100gwzv2dbyo	cmo5573su002j7b0kkq6dcegm	\N	\N	COMPLETED	Isabel Aquino	scale.p16.1776565443@test.com	2026-04-19 02:24:50.86	2026-04-19 02:24:50.888	2026-04-19 02:24:50.888	2026-04-19 02:24:55.65	\N
cmo5581xv0034100gf77ma6y6	cmo55815b0000100gwzv2dbyo	cmo5573xy002o7b0kvv0svdv4	\N	\N	COMPLETED	Francisco Delgado	scale.p17.1776565443@test.com	2026-04-19 02:24:50.899	2026-04-19 02:24:50.927	2026-04-19 02:24:50.927	2026-04-19 02:24:55.65	\N
cmo5581z20038100g9fpftbqm	cmo55815b0000100gwzv2dbyo	cmo557432002t7b0kqdzw4iem	\N	\N	COMPLETED	Beatriz Enriquez	scale.p18.1776565443@test.com	2026-04-19 02:24:50.942	2026-04-19 02:24:50.97	2026-04-19 02:24:50.97	2026-04-19 02:24:55.65	\N
cmo558207003c100g7vkly7uv	cmo55815b0000100gwzv2dbyo	cmo55747z002y7b0kjz1fnu5l	\N	\N	COMPLETED	Manuel Fernandez	scale.p19.1776565443@test.com	2026-04-19 02:24:50.983	2026-04-19 02:24:51.01	2026-04-19 02:24:51.01	2026-04-19 02:24:55.65	\N
cmo55821a003g100gfhjri1fs	cmo55815b0000100gwzv2dbyo	cmo5574d100337b0k8afjwtmw	\N	\N	COMPLETED	Patricia Perez	scale.p20.1776565443@test.com	2026-04-19 02:24:51.022	2026-04-19 02:24:51.05	2026-04-19 02:24:51.05	2026-04-19 02:24:55.65	\N
cmo55822g003k100gpfy4pyd3	cmo55815b0000100gwzv2dbyo	cmo5574i100387b0kfvaid90s	\N	\N	COMPLETED	Ricardo Aguilar	scale.p21.1776565443@test.com	2026-04-19 02:24:51.064	2026-04-19 02:24:51.092	2026-04-19 02:24:51.092	2026-04-19 02:24:55.65	\N
cmo55823l003o100grhuj8yq0	cmo55815b0000100gwzv2dbyo	cmo5574ml003d7b0kmjtbuqrf	\N	\N	COMPLETED	Gloria Navarro	scale.p22.1776565443@test.com	2026-04-19 02:24:51.105	2026-04-19 02:24:51.133	2026-04-19 02:24:51.133	2026-04-19 02:24:55.65	\N
cmo55824r003s100gpbe7yjiw	cmo55815b0000100gwzv2dbyo	cmo5574rj003i7b0k5ydw3yif	\N	\N	COMPLETED	Fernando Rojas	scale.p23.1776565443@test.com	2026-04-19 02:24:51.147	2026-04-19 02:24:51.175	2026-04-19 02:24:51.175	2026-04-19 02:24:55.65	\N
cmo55825v003w100gr0ufhhzz	cmo55815b0000100gwzv2dbyo	cmo5574wj003n7b0kbx2zukgw	\N	\N	COMPLETED	Pilar Salazar	scale.p24.1776565443@test.com	2026-04-19 02:24:51.187	2026-04-19 02:24:51.215	2026-04-19 02:24:51.215	2026-04-19 02:24:55.65	\N
cmo5582710040100gsunqaf8k	cmo55815b0000100gwzv2dbyo	cmo55751l003s7b0kegzjo4yy	\N	\N	COMPLETED	Emilio Mercado	scale.p25.1776565443@test.com	2026-04-19 02:24:51.229	2026-04-19 02:24:51.257	2026-04-19 02:24:51.257	2026-04-19 02:24:55.65	\N
cmo5582850044100gdlaw97qp	cmo55815b0000100gwzv2dbyo	cmo55756n003x7b0kgjzb3ett	\N	\N	COMPLETED	Dolores Pascual	scale.p26.1776565443@test.com	2026-04-19 02:24:51.269	2026-04-19 02:24:51.296	2026-04-19 02:24:51.296	2026-04-19 02:24:55.65	\N
cmo5582990048100g83xl6i50	cmo55815b0000100gwzv2dbyo	cmo5575br00427b0kv8okh7mt	\N	\N	COMPLETED	Gabriel Domingo	scale.p27.1776565443@test.com	2026-04-19 02:24:51.309	2026-04-19 02:24:51.337	2026-04-19 02:24:51.337	2026-04-19 02:24:55.65	\N
cmo5582ad004c100g6uswrw72	cmo55815b0000100gwzv2dbyo	cmo5575gu00477b0kdds9zlux	\N	\N	COMPLETED	Rosario Tolentino	scale.p28.1776565443@test.com	2026-04-19 02:24:51.349	2026-04-19 02:24:51.379	2026-04-19 02:24:51.379	2026-04-19 02:24:55.65	\N
cmo5582bk004g100ggav24yps	cmo55815b0000100gwzv2dbyo	cmo5575lx004c7b0khlyxsksq	\N	\N	COMPLETED	Andres Santiago	scale.p29.1776565443@test.com	2026-04-19 02:24:51.392	2026-04-19 02:24:51.42	2026-04-19 02:24:51.42	2026-04-19 02:24:55.65	\N
cmo5582cp004k100gwmgr2c81	cmo55815b0000100gwzv2dbyo	cmo5575r0004h7b0kyajvdogu	\N	\N	COMPLETED	Angela Manalo	scale.p30.1776565443@test.com	2026-04-19 02:24:51.432	2026-04-19 02:24:51.459	2026-04-19 02:24:51.459	2026-04-19 02:24:55.65	\N
cmo5582ds004o100gfg6we2jr	cmo55815b0000100gwzv2dbyo	cmo5575w8004m7b0ket3hahgg	\N	\N	COMPLETED	Roberto Ocampo	scale.p31.1776565443@test.com	2026-04-19 02:24:51.472	2026-04-19 02:24:51.499	2026-04-19 02:24:51.499	2026-04-19 02:24:55.65	\N
cmo5582ew004s100grvomo1d7	cmo55815b0000100gwzv2dbyo	cmo557618004r7b0ky72og9g1	\N	\N	COMPLETED	Consuelo Valdez	scale.p32.1776565443@test.com	2026-04-19 02:24:51.512	2026-04-19 02:24:51.539	2026-04-19 02:24:51.539	2026-04-19 02:24:55.65	\N
cmo5582g0004w100gxnjd6ev6	cmo55815b0000100gwzv2dbyo	cmo55766a004w7b0kwqeixmek	\N	\N	COMPLETED	Sergio Soriano	scale.p33.1776565443@test.com	2026-04-19 02:24:51.552	2026-04-19 02:24:51.58	2026-04-19 02:24:51.58	2026-04-19 02:24:55.65	\N
cmo5582h60050100gr5owf3rs	cmo55815b0000100gwzv2dbyo	cmo5576ba00517b0kuw8icfyf	\N	\N	COMPLETED	Esperanza Paras	scale.p34.1776565443@test.com	2026-04-19 02:24:51.594	2026-04-19 02:24:51.622	2026-04-19 02:24:51.622	2026-04-19 02:24:55.65	\N
cmo5582ia0054100gaujiejtb	cmo55815b0000100gwzv2dbyo	cmo5576g800567b0k51959kbc	\N	\N	COMPLETED	Leonardo Bello	scale.p35.1776565443@test.com	2026-04-19 02:24:51.634	2026-04-19 02:24:51.661	2026-04-19 02:24:51.661	2026-04-19 02:24:55.65	\N
cmo5582je0058100gpmqxj98a	cmo55815b0000100gwzv2dbyo	cmo5576l9005b7b0koj92tvkz	\N	\N	COMPLETED	Margarita Espinosa	scale.p36.1776565443@test.com	2026-04-19 02:24:51.674	2026-04-19 02:24:51.701	2026-04-19 02:24:51.701	2026-04-19 02:24:55.65	\N
cmo5582kj005c100g5zvto7qv	cmo55815b0000100gwzv2dbyo	cmo5576qa005g7b0kne60f97z	\N	\N	COMPLETED	Alejandro Montoya	scale.p37.1776565443@test.com	2026-04-19 02:24:51.714	2026-04-19 02:24:51.743	2026-04-19 02:24:51.743	2026-04-19 02:24:55.65	\N
cmo5582lo005g100g8lm8jloo	cmo55815b0000100gwzv2dbyo	cmo5576vf005l7b0k17daxswb	\N	\N	COMPLETED	Remedios Cabrera	scale.p38.1776565443@test.com	2026-04-19 02:24:51.756	2026-04-19 02:24:51.783	2026-04-19 02:24:51.783	2026-04-19 02:24:55.65	\N
cmo5582ms005k100g5ygbnp8k	cmo55815b0000100gwzv2dbyo	cmo55770e005q7b0kojljgpyn	\N	\N	COMPLETED	Eduardo Guerrero	scale.p39.1776565443@test.com	2026-04-19 02:24:51.796	2026-04-19 02:24:51.824	2026-04-19 02:24:51.824	2026-04-19 02:24:55.65	\N
cmo5582ny005o100g40vgx0q9	cmo55815b0000100gwzv2dbyo	cmo55775f005v7b0kp059dzs8	\N	\N	COMPLETED	Victoria Luna	scale.p40.1776565443@test.com	2026-04-19 02:24:51.838	2026-04-19 02:24:51.865	2026-04-19 02:24:51.865	2026-04-19 02:24:55.65	\N
cmo5582p3005s100gqervwapd	cmo55815b0000100gwzv2dbyo	cmo5577ae00607b0klevd0zfm	\N	\N	COMPLETED	Alfredo Alvarez	scale.p41.1776565443@test.com	2026-04-19 02:24:51.879	2026-04-19 02:24:51.907	2026-04-19 02:24:51.907	2026-04-19 02:24:55.65	\N
cmo5582q9005w100gzf0xrnl0	cmo55815b0000100gwzv2dbyo	cmo5577fg00657b0kdllzm67d	\N	\N	COMPLETED	Mercedes Molina	scale.p42.1776565443@test.com	2026-04-19 02:24:51.921	2026-04-19 02:24:51.949	2026-04-19 02:24:51.949	2026-04-19 02:24:55.65	\N
cmo5582re0060100gkr433x16	cmo55815b0000100gwzv2dbyo	cmo5577ki006a7b0kolz2x63s	\N	\N	COMPLETED	Lorenzo Vargas	scale.p43.1776565443@test.com	2026-04-19 02:24:51.962	2026-04-19 02:24:51.99	2026-04-19 02:24:51.99	2026-04-19 02:24:55.65	\N
cmo5582sj0064100g71g8pfiu	cmo55815b0000100gwzv2dbyo	cmo5577po006f7b0ksfb43ija	\N	\N	COMPLETED	Aurora Ortega	scale.p44.1776565443@test.com	2026-04-19 02:24:52.003	2026-04-19 02:24:52.031	2026-04-19 02:24:52.031	2026-04-19 02:24:55.65	\N
cmo5582tp0068100gcgp4gr6s	cmo55815b0000100gwzv2dbyo	cmo5577ur006k7b0kfacbbmvs	\N	\N	COMPLETED	Ramon Medina	scale.p45.1776565443@test.com	2026-04-19 02:24:52.044	2026-04-19 02:24:52.071	2026-04-19 02:24:52.071	2026-04-19 02:24:55.65	\N
cmo5582us006c100gzslk9140	cmo55815b0000100gwzv2dbyo	cmo5577zt006p7b0k9z0eskqe	\N	\N	COMPLETED	Soledad Herrera	scale.p46.1776565443@test.com	2026-04-19 02:24:52.084	2026-04-19 02:24:52.112	2026-04-19 02:24:52.112	2026-04-19 02:24:55.65	\N
cmo5582vz006g100g879pxom0	cmo55815b0000100gwzv2dbyo	cmo55784y006u7b0kwklcko95	\N	\N	COMPLETED	Ernesto Jimenez	scale.p47.1776565443@test.com	2026-04-19 02:24:52.126	2026-04-19 02:24:52.155	2026-04-19 02:24:52.155	2026-04-19 02:24:55.65	\N
cmo5582x5006k100gryb6a8f5	cmo55815b0000100gwzv2dbyo	cmo5578a0006z7b0kmhakzq2j	\N	\N	COMPLETED	Josefina Fuentes	scale.p48.1776565443@test.com	2026-04-19 02:24:52.169	2026-04-19 02:24:52.197	2026-04-19 02:24:52.197	2026-04-19 02:24:55.65	\N
cmo5582ya006o100gquy8sumk	cmo55815b0000100gwzv2dbyo	cmo5578f200747b0k5coxzwrn	\N	\N	COMPLETED	Arturo Paredes	scale.p49.1776565443@test.com	2026-04-19 02:24:52.21	2026-04-19 02:24:52.237	2026-04-19 02:24:52.237	2026-04-19 02:24:55.65	\N
cmocl9vp700141w8sdh4tdtsf	cmocl0xwk00041w8skllixjad	cmocl3m6h001ouxz76nugd8fe	\N	\N	RSVP_CONFIRMED	Aubrey Cabanlit	aubreycabanlit@gmail.com	2026-04-24 07:28:33.21	2026-04-24 07:32:28.195	2026-04-24 07:32:28.195	\N	\N
cmo5585yn00h9100gvyufdfez	cmo5585r700g1100gkoseur2n	cmo5578k700797b0kqu1qxb4n	\N	\N	COMPLETED	Maria Reyes	scale.p50.1776565443@test.com	2026-04-19 02:24:56.111	2026-04-19 02:24:56.138	2026-04-19 02:24:56.138	2026-04-19 02:25:01.465	\N
cmo5585zt00hd100g9l4977wb	cmo5585r700g1100gkoseur2n	cmo5578p8007e7b0kgfjxbq0n	\N	\N	COMPLETED	Juan Santos	scale.p51.1776565443@test.com	2026-04-19 02:24:56.153	2026-04-19 02:24:56.18	2026-04-19 02:24:56.18	2026-04-19 02:25:01.465	\N
cmo55860x00hh100g59ns5ceu	cmo5585r700g1100gkoseur2n	cmo5578ud007j7b0k63etegp0	\N	\N	COMPLETED	Ana Garcia	scale.p52.1776565443@test.com	2026-04-19 02:24:56.193	2026-04-19 02:24:56.22	2026-04-19 02:24:56.22	2026-04-19 02:25:01.465	\N
cmo55862200hl100g08b15ed9	cmo5585r700g1100gkoseur2n	cmo5578zi007o7b0kxmwvaz05	\N	\N	COMPLETED	Pedro Cruz	scale.p53.1776565443@test.com	2026-04-19 02:24:56.234	2026-04-19 02:24:56.262	2026-04-19 02:24:56.262	2026-04-19 02:25:01.465	\N
cmo55863900hp100g4y9cn2mb	cmo5585r700g1100gkoseur2n	cmo55794d007t7b0ki7masp1n	\N	\N	COMPLETED	Rosa Bautista	scale.p54.1776565443@test.com	2026-04-19 02:24:56.276	2026-04-19 02:24:56.304	2026-04-19 02:24:56.304	2026-04-19 02:25:01.465	\N
cmo55864b00ht100gsx7g65xt	cmo5585r700g1100gkoseur2n	cmo55799e007y7b0ktg6p3sqa	\N	\N	COMPLETED	Carlos Mendoza	scale.p55.1776565443@test.com	2026-04-19 02:24:56.315	2026-04-19 02:24:56.342	2026-04-19 02:24:56.342	2026-04-19 02:25:01.465	\N
cmo55865e00hx100g52ajgw4e	cmo5585r700g1100gkoseur2n	cmo5579ei00837b0kiniospxb	\N	\N	COMPLETED	Elena Villanueva	scale.p56.1776565443@test.com	2026-04-19 02:24:56.354	2026-04-19 02:24:56.38	2026-04-19 02:24:56.38	2026-04-19 02:25:01.465	\N
cmo55866i00i1100gjrhwv2vs	cmo5585r700g1100gkoseur2n	cmo5579jk00887b0k636izhc1	\N	\N	COMPLETED	Miguel Flores	scale.p57.1776565443@test.com	2026-04-19 02:24:56.394	2026-04-19 02:24:56.421	2026-04-19 02:24:56.421	2026-04-19 02:25:01.465	\N
cmo55867l00i5100gfawx9w2d	cmo5585r700g1100gkoseur2n	cmo5579oh008d7b0ksb0n73x5	\N	\N	COMPLETED	Sofia Ramos	scale.p58.1776565443@test.com	2026-04-19 02:24:56.433	2026-04-19 02:24:56.46	2026-04-19 02:24:56.46	2026-04-19 02:25:01.465	\N
cmo55868q00i9100gv95ikcy2	cmo5585r700g1100gkoseur2n	cmo5579tg008i7b0k1kw4muf6	\N	\N	COMPLETED	Jose Torres	scale.p59.1776565443@test.com	2026-04-19 02:24:56.474	2026-04-19 02:24:56.502	2026-04-19 02:24:56.502	2026-04-19 02:25:01.465	\N
cmo5586ax00ih100gwdumcnhr	cmo5585r700g1100gkoseur2n	cmo557a3q008s7b0kura2pryz	\N	\N	COMPLETED	Rafael Lopez	scale.p61.1776565443@test.com	2026-04-19 02:24:56.553	2026-04-19 02:24:56.58	2026-04-19 02:24:56.58	2026-04-19 02:25:01.465	\N
cmo5586c100il100gzo7ehlj9	cmo5585r700g1100gkoseur2n	cmo557a8r008x7b0kumxiysoo	\N	\N	COMPLETED	Teresa Rivera	scale.p62.1776565443@test.com	2026-04-19 02:24:56.593	2026-04-19 02:24:56.621	2026-04-19 02:24:56.621	2026-04-19 02:25:01.465	\N
cmo5586d500ip100gp012cgg8	cmo5585r700g1100gkoseur2n	cmo557ads00927b0knmecarda	\N	\N	COMPLETED	Diego Hernandez	scale.p63.1776565443@test.com	2026-04-19 02:24:56.633	2026-04-19 02:24:56.66	2026-04-19 02:24:56.66	2026-04-19 02:25:01.465	\N
cmo5586ea00it100gwy8aedwd	cmo5585r700g1100gkoseur2n	cmo557ais00977b0kx4e4gspx	\N	\N	COMPLETED	Lucia Morales	scale.p64.1776565443@test.com	2026-04-19 02:24:56.673	2026-04-19 02:24:56.7	2026-04-19 02:24:56.7	2026-04-19 02:25:01.465	\N
cmo5586fd00ix100g533t8cow	cmo5585r700g1100gkoseur2n	cmo557anm009c7b0ki1jnb0li	\N	\N	COMPLETED	Antonio Castillo	scale.p65.1776565443@test.com	2026-04-19 02:24:56.713	2026-04-19 02:24:56.739	2026-04-19 02:24:56.739	2026-04-19 02:25:01.465	\N
cmo5586ge00j1100ge6mxbhsc	cmo5585r700g1100gkoseur2n	cmo557ask009h7b0k0o9bciu0	\N	\N	COMPLETED	Isabel Aquino	scale.p66.1776565443@test.com	2026-04-19 02:24:56.75	2026-04-19 02:24:56.777	2026-04-19 02:24:56.777	2026-04-19 02:25:01.465	\N
cmo5586hj00j5100gpd6a3ngv	cmo5585r700g1100gkoseur2n	cmo557ay3009m7b0kvf5e8dzf	\N	\N	COMPLETED	Francisco Delgado	scale.p67.1776565443@test.com	2026-04-19 02:24:56.791	2026-04-19 02:24:56.819	2026-04-19 02:24:56.819	2026-04-19 02:25:01.465	\N
cmo5586im00j9100gcpjc03u1	cmo5585r700g1100gkoseur2n	cmo557b2q009r7b0ko262ufn9	\N	\N	COMPLETED	Beatriz Enriquez	scale.p68.1776565443@test.com	2026-04-19 02:24:56.83	2026-04-19 02:24:56.856	2026-04-19 02:24:56.856	2026-04-19 02:25:01.465	\N
cmo5586jr00jd100ggql43zcv	cmo5585r700g1100gkoseur2n	cmo557b7r009w7b0kbwfm7b3j	\N	\N	COMPLETED	Manuel Fernandez	scale.p69.1776565443@test.com	2026-04-19 02:24:56.87	2026-04-19 02:24:56.898	2026-04-19 02:24:56.898	2026-04-19 02:25:01.465	\N
cmo5586kv00jh100ggd10xrxe	cmo5585r700g1100gkoseur2n	cmo557bcs00a17b0kr5nkw7r1	\N	\N	COMPLETED	Patricia Perez	scale.p70.1776565443@test.com	2026-04-19 02:24:56.911	2026-04-19 02:24:56.938	2026-04-19 02:24:56.938	2026-04-19 02:25:01.465	\N
cmo5586ly00jl100g6c7d8ebq	cmo5585r700g1100gkoseur2n	cmo557bhs00a67b0k0skmm3d3	\N	\N	COMPLETED	Ricardo Aguilar	scale.p71.1776565443@test.com	2026-04-19 02:24:56.95	2026-04-19 02:24:56.977	2026-04-19 02:24:56.977	2026-04-19 02:25:01.465	\N
cmo5586oq00jt100gqoyof6aj	cmo5585r700g1100gkoseur2n	cmo557bs000ag7b0ka8y4wcev	\N	\N	COMPLETED	Fernando Rojas	scale.p73.1776565443@test.com	2026-04-19 02:24:57.05	2026-04-19 02:24:57.078	2026-04-19 02:24:57.078	2026-04-19 02:25:01.465	\N
cmo5586pv00jx100geil7tvqw	cmo5585r700g1100gkoseur2n	cmo557bwz00al7b0kgepa3vbg	\N	\N	COMPLETED	Pilar Salazar	scale.p74.1776565443@test.com	2026-04-19 02:24:57.091	2026-04-19 02:24:57.118	2026-04-19 02:24:57.118	2026-04-19 02:25:01.465	\N
cmo5586qz00k1100gw8ndmef6	cmo5585r700g1100gkoseur2n	cmo557c2100aq7b0k71nd79qr	\N	\N	COMPLETED	Emilio Mercado	scale.p75.1776565443@test.com	2026-04-19 02:24:57.131	2026-04-19 02:24:57.159	2026-04-19 02:24:57.159	2026-04-19 02:25:01.465	\N
cmo5586s400k5100gk2m6y5he	cmo5585r700g1100gkoseur2n	cmo557c7300av7b0kzqcqzhuv	\N	\N	COMPLETED	Dolores Pascual	scale.p76.1776565443@test.com	2026-04-19 02:24:57.171	2026-04-19 02:24:57.199	2026-04-19 02:24:57.199	2026-04-19 02:25:01.465	\N
cmo5586ta00k9100g6zclnyks	cmo5585r700g1100gkoseur2n	cmo557cc900b07b0ku0k62661	\N	\N	COMPLETED	Gabriel Domingo	scale.p77.1776565443@test.com	2026-04-19 02:24:57.214	2026-04-19 02:24:57.24	2026-04-19 02:24:57.24	2026-04-19 02:25:01.465	\N
cmo5586vc00kh100g4nck8hls	cmo5585r700g1100gkoseur2n	cmo557cp300ba7b0kvn837k55	\N	\N	COMPLETED	Andres Santiago	scale.p79.1776565443@test.com	2026-04-19 02:24:57.288	2026-04-19 02:24:57.313	2026-04-19 02:24:57.313	2026-04-19 02:25:01.465	\N
cmo5586wd00kl100gkftepn4k	cmo5585r700g1100gkoseur2n	cmo557cu300bf7b0kx9dxt6e7	\N	\N	COMPLETED	Angela Manalo	scale.p80.1776565443@test.com	2026-04-19 02:24:57.325	2026-04-19 02:24:57.353	2026-04-19 02:24:57.353	2026-04-19 02:25:01.465	\N
cmo5586xi00kp100gt3h0p00c	cmo5585r700g1100gkoseur2n	cmo557cys00bk7b0kiielhxzt	\N	\N	COMPLETED	Roberto Ocampo	scale.p81.1776565443@test.com	2026-04-19 02:24:57.366	2026-04-19 02:24:57.393	2026-04-19 02:24:57.393	2026-04-19 02:25:01.465	\N
cmo5586ym00kt100g8al5xj88	cmo5585r700g1100gkoseur2n	cmo557d3x00bp7b0k2jjgus02	\N	\N	COMPLETED	Consuelo Valdez	scale.p82.1776565443@test.com	2026-04-19 02:24:57.406	2026-04-19 02:24:57.433	2026-04-19 02:24:57.433	2026-04-19 02:25:01.465	\N
cmo5586zr00kx100gotxpwydo	cmo5585r700g1100gkoseur2n	cmo557d9400bu7b0k35ahh0vw	\N	\N	COMPLETED	Sergio Soriano	scale.p83.1776565443@test.com	2026-04-19 02:24:57.446	2026-04-19 02:24:57.473	2026-04-19 02:24:57.473	2026-04-19 02:25:01.465	\N
cmo55870t00l1100g7v258i0s	cmo5585r700g1100gkoseur2n	cmo557def00bz7b0k05s9niu5	\N	\N	COMPLETED	Esperanza Paras	scale.p84.1776565443@test.com	2026-04-19 02:24:57.485	2026-04-19 02:24:57.513	2026-04-19 02:24:57.513	2026-04-19 02:25:01.465	\N
cmo55871x00l5100gk61got6n	cmo5585r700g1100gkoseur2n	cmo557djn00c47b0kusw3z20q	\N	\N	COMPLETED	Leonardo Bello	scale.p85.1776565443@test.com	2026-04-19 02:24:57.525	2026-04-19 02:24:57.553	2026-04-19 02:24:57.553	2026-04-19 02:25:01.465	\N
cmo55873200l9100gwiuxcbho	cmo5585r700g1100gkoseur2n	cmo557doq00c97b0krpxcvkvk	\N	\N	COMPLETED	Margarita Espinosa	scale.p86.1776565443@test.com	2026-04-19 02:24:57.566	2026-04-19 02:24:57.593	2026-04-19 02:24:57.593	2026-04-19 02:25:01.465	\N
cmo55874600ld100g14uv2td2	cmo5585r700g1100gkoseur2n	cmo557dtv00ce7b0kc384rbtl	\N	\N	COMPLETED	Alejandro Montoya	scale.p87.1776565443@test.com	2026-04-19 02:24:57.606	2026-04-19 02:24:57.652	2026-04-19 02:24:57.652	2026-04-19 02:25:01.465	\N
cmo55875t00lh100g3udoes1b	cmo5585r700g1100gkoseur2n	cmo557dyx00cj7b0kfph6iiov	\N	\N	COMPLETED	Remedios Cabrera	scale.p88.1776565443@test.com	2026-04-19 02:24:57.665	2026-04-19 02:24:57.693	2026-04-19 02:24:57.693	2026-04-19 02:25:01.465	\N
cmo55876z00ll100g9754b65a	cmo5585r700g1100gkoseur2n	cmo557e4700co7b0kd2pnicoe	\N	\N	COMPLETED	Eduardo Guerrero	scale.p89.1776565443@test.com	2026-04-19 02:24:57.707	2026-04-19 02:24:57.734	2026-04-19 02:24:57.734	2026-04-19 02:25:01.465	\N
cmo55869u00id100g5waugjc4	cmo5585r700g1100gkoseur2n	cmo5579yn008n7b0k7q7hq42b	\N	\N	COMPLETED	Carmen Gonzales	scale.p60.1776565443@test.com	2026-04-19 02:24:56.514	2026-04-19 02:24:56.541	2026-04-19 02:24:56.541	2026-04-19 02:25:01.465	\N
cmo5586ub00kd100gpnziacif	cmo5585r700g1100gkoseur2n	cmo557cjc00b57b0kqsqn55ze	\N	\N	COMPLETED	Rosario Tolentino	scale.p78.1776565443@test.com	2026-04-19 02:24:57.251	2026-04-19 02:24:57.277	2026-04-19 02:24:57.277	2026-04-19 02:25:01.465	\N
cmo5586nm00jp100gp57wmvij	cmo5585r700g1100gkoseur2n	cmo557bmx00ab7b0kikcmojuy	\N	\N	COMPLETED	Gloria Navarro	scale.p72.1776565443@test.com	2026-04-19 02:24:57.01	2026-04-19 02:24:57.038	2026-04-19 02:24:57.038	2026-04-19 02:25:01.465	\N
cmo55878300lp100g3uk1einv	cmo5585r700g1100gkoseur2n	cmo557e9a00ct7b0ktrojio27	\N	\N	COMPLETED	Victoria Luna	scale.p90.1776565443@test.com	2026-04-19 02:24:57.747	2026-04-19 02:24:57.775	2026-04-19 02:24:57.775	2026-04-19 02:25:01.465	\N
cmo55879900lt100g85hjb0ct	cmo5585r700g1100gkoseur2n	cmo557eee00cy7b0knuk1wn5o	\N	\N	COMPLETED	Alfredo Alvarez	scale.p91.1776565443@test.com	2026-04-19 02:24:57.788	2026-04-19 02:24:57.816	2026-04-19 02:24:57.816	2026-04-19 02:25:01.465	\N
cmo5587ae00lx100gfd9p3m5i	cmo5585r700g1100gkoseur2n	cmo557ejd00d37b0ki6m5bywd	\N	\N	COMPLETED	Mercedes Molina	scale.p92.1776565443@test.com	2026-04-19 02:24:57.829	2026-04-19 02:24:57.857	2026-04-19 02:24:57.857	2026-04-19 02:25:01.465	\N
cmo5587bj00m1100g7milvt99	cmo5585r700g1100gkoseur2n	cmo557eog00d87b0k0ghqgjbj	\N	\N	COMPLETED	Lorenzo Vargas	scale.p93.1776565443@test.com	2026-04-19 02:24:57.871	2026-04-19 02:24:57.898	2026-04-19 02:24:57.898	2026-04-19 02:25:01.465	\N
cmo5587co00m5100gbzjpz61s	cmo5585r700g1100gkoseur2n	cmo557etk00dd7b0kjohsyogv	\N	\N	COMPLETED	Aurora Ortega	scale.p94.1776565443@test.com	2026-04-19 02:24:57.912	2026-04-19 02:24:57.939	2026-04-19 02:24:57.939	2026-04-19 02:25:01.465	\N
cmo5587ds00m9100gsc0ry87f	cmo5585r700g1100gkoseur2n	cmo557eyr00di7b0ki25zagsl	\N	\N	COMPLETED	Ramon Medina	scale.p95.1776565443@test.com	2026-04-19 02:24:57.952	2026-04-19 02:24:57.98	2026-04-19 02:24:57.98	2026-04-19 02:25:01.465	\N
cmo5587ex00md100gfhc6fxer	cmo5585r700g1100gkoseur2n	cmo557f3u00dn7b0kod1oq6g2	\N	\N	COMPLETED	Soledad Herrera	scale.p96.1776565443@test.com	2026-04-19 02:24:57.993	2026-04-19 02:24:58.02	2026-04-19 02:24:58.02	2026-04-19 02:25:01.465	\N
cmo5587g100mh100geor9j4rx	cmo5585r700g1100gkoseur2n	cmo557f8w00ds7b0km8qaj3kq	\N	\N	COMPLETED	Ernesto Jimenez	scale.p97.1776565443@test.com	2026-04-19 02:24:58.032	2026-04-19 02:24:58.061	2026-04-19 02:24:58.061	2026-04-19 02:25:01.465	\N
cmo5587h700ml100gjdzhs2fk	cmo5585r700g1100gkoseur2n	cmo557fdy00dx7b0kmyrsuqo5	\N	\N	COMPLETED	Josefina Fuentes	scale.p98.1776565443@test.com	2026-04-19 02:24:58.075	2026-04-19 02:24:58.101	2026-04-19 02:24:58.101	2026-04-19 02:25:01.465	\N
cmo5587ib00mp100gohc3flqk	cmo5585r700g1100gkoseur2n	cmo557fj600e27b0kmu5hibaw	\N	\N	COMPLETED	Arturo Paredes	scale.p99.1776565443@test.com	2026-04-19 02:24:58.114	2026-04-19 02:24:58.141	2026-04-19 02:24:58.141	2026-04-19 02:25:01.465	\N
cmo558aej00x1100gjfolfv6j	cmo558a7c00vt100gkftjgmsa	cmo557fo900e77b0ke9zfa12t	\N	\N	COMPLETED	Maria Reyes	scale.p100.1776565443@test.com	2026-04-19 02:25:01.867	2026-04-19 02:25:01.895	2026-04-19 02:25:01.895	2026-04-19 02:25:07.286	\N
cmo558afo00x5100gs3vm0lew	cmo558a7c00vt100gkftjgmsa	cmo557ftg00ec7b0kcmazt6m0	\N	\N	COMPLETED	Juan Santos	scale.p101.1776565443@test.com	2026-04-19 02:25:01.908	2026-04-19 02:25:01.935	2026-04-19 02:25:01.935	2026-04-19 02:25:07.286	\N
cmo558agt00x9100gm5mvm6x1	cmo558a7c00vt100gkftjgmsa	cmo557fz300eh7b0k8wx9a1ml	\N	\N	COMPLETED	Ana Garcia	scale.p102.1776565443@test.com	2026-04-19 02:25:01.949	2026-04-19 02:25:01.977	2026-04-19 02:25:01.977	2026-04-19 02:25:07.286	\N
cmo558ahy00xd100gntftxvbq	cmo558a7c00vt100gkftjgmsa	cmo557g4o00em7b0kwsuhgib8	\N	\N	COMPLETED	Pedro Cruz	scale.p103.1776565443@test.com	2026-04-19 02:25:01.99	2026-04-19 02:25:02.017	2026-04-19 02:25:02.017	2026-04-19 02:25:07.286	\N
cmo558aj300xh100g8z4tartm	cmo558a7c00vt100gkftjgmsa	cmo557g9u00er7b0kit44dx7h	\N	\N	COMPLETED	Rosa Bautista	scale.p104.1776565443@test.com	2026-04-19 02:25:02.031	2026-04-19 02:25:02.058	2026-04-19 02:25:02.058	2026-04-19 02:25:07.286	\N
cmo558ak600xl100gjekjcvyc	cmo558a7c00vt100gkftjgmsa	cmo557ggh00ew7b0k40hv462g	\N	\N	COMPLETED	Carlos Mendoza	scale.p105.1776565443@test.com	2026-04-19 02:25:02.07	2026-04-19 02:25:02.097	2026-04-19 02:25:02.097	2026-04-19 02:25:07.286	\N
cmo558al900xp100gv1j60uks	cmo558a7c00vt100gkftjgmsa	cmo557gm200f17b0k5y2cnzco	\N	\N	COMPLETED	Elena Villanueva	scale.p106.1776565443@test.com	2026-04-19 02:25:02.109	2026-04-19 02:25:02.136	2026-04-19 02:25:02.136	2026-04-19 02:25:07.286	\N
cmo558amd00xt100grcn8kif6	cmo558a7c00vt100gkftjgmsa	cmo557gr500f67b0k4oirdxy0	\N	\N	COMPLETED	Miguel Flores	scale.p107.1776565443@test.com	2026-04-19 02:25:02.149	2026-04-19 02:25:02.176	2026-04-19 02:25:02.176	2026-04-19 02:25:07.286	\N
cmo558anh00xx100gb5uxncxh	cmo558a7c00vt100gkftjgmsa	cmo557gw200fb7b0kuqfs96g3	\N	\N	COMPLETED	Sofia Ramos	scale.p108.1776565443@test.com	2026-04-19 02:25:02.189	2026-04-19 02:25:02.216	2026-04-19 02:25:02.216	2026-04-19 02:25:07.286	\N
cmo558aol00y1100g48dofopy	cmo558a7c00vt100gkftjgmsa	cmo557h1700fg7b0kj56vcyx4	\N	\N	COMPLETED	Jose Torres	scale.p109.1776565443@test.com	2026-04-19 02:25:02.229	2026-04-19 02:25:02.257	2026-04-19 02:25:02.257	2026-04-19 02:25:07.286	\N
cmo558apr00y5100g8nfpdh4h	cmo558a7c00vt100gkftjgmsa	cmo557h6h00fl7b0k7uz7uf06	\N	\N	COMPLETED	Carmen Gonzales	scale.p110.1776565443@test.com	2026-04-19 02:25:02.271	2026-04-19 02:25:02.298	2026-04-19 02:25:02.298	2026-04-19 02:25:07.286	\N
cmo558aqv00y9100g6ff3ursd	cmo558a7c00vt100gkftjgmsa	cmo557hbh00fq7b0k4s7i25n9	\N	\N	COMPLETED	Rafael Lopez	scale.p111.1776565443@test.com	2026-04-19 02:25:02.311	2026-04-19 02:25:02.339	2026-04-19 02:25:02.339	2026-04-19 02:25:07.286	\N
cmo558ary00yd100gcwijtegf	cmo558a7c00vt100gkftjgmsa	cmo557hgj00fv7b0kk12soz29	\N	\N	COMPLETED	Teresa Rivera	scale.p112.1776565443@test.com	2026-04-19 02:25:02.35	2026-04-19 02:25:02.378	2026-04-19 02:25:02.378	2026-04-19 02:25:07.286	\N
cmo558at300yh100gdbq8o492	cmo558a7c00vt100gkftjgmsa	cmo557hll00g07b0kani4bpyw	\N	\N	COMPLETED	Diego Hernandez	scale.p113.1776565443@test.com	2026-04-19 02:25:02.391	2026-04-19 02:25:02.418	2026-04-19 02:25:02.418	2026-04-19 02:25:07.286	\N
cmo558ave00yp100go8zycrnx	cmo558a7c00vt100gkftjgmsa	cmo557hw000ga7b0k3sdb881u	\N	\N	COMPLETED	Antonio Castillo	scale.p115.1776565443@test.com	2026-04-19 02:25:02.474	2026-04-19 02:25:02.5	2026-04-19 02:25:02.5	2026-04-19 02:25:07.286	\N
cmo558awi00yt100gy86m5xf4	cmo558a7c00vt100gkftjgmsa	cmo557i1000gf7b0kp6yh2vlz	\N	\N	COMPLETED	Isabel Aquino	scale.p116.1776565443@test.com	2026-04-19 02:25:02.514	2026-04-19 02:25:02.542	2026-04-19 02:25:02.542	2026-04-19 02:25:07.286	\N
cmo558axn00yx100g8codwgz8	cmo558a7c00vt100gkftjgmsa	cmo557i6600gk7b0kihbemw91	\N	\N	COMPLETED	Francisco Delgado	scale.p117.1776565443@test.com	2026-04-19 02:25:02.555	2026-04-19 02:25:02.58	2026-04-19 02:25:02.58	2026-04-19 02:25:07.286	\N
cmo558ayn00z1100gj9la6en1	cmo558a7c00vt100gkftjgmsa	cmo557iay00gp7b0ktcm58kic	\N	\N	COMPLETED	Beatriz Enriquez	scale.p118.1776565443@test.com	2026-04-19 02:25:02.59	2026-04-19 02:25:02.618	2026-04-19 02:25:02.618	2026-04-19 02:25:07.286	\N
cmo558b1k00zd100gx2p3yv2i	cmo558a7c00vt100gkftjgmsa	cmo557irb00h47b0kjdayxn8n	\N	\N	COMPLETED	Ricardo Aguilar	scale.p121.1776565443@test.com	2026-04-19 02:25:02.696	2026-04-19 02:25:02.722	2026-04-19 02:25:02.722	2026-04-19 02:25:07.286	\N
cmo558b2l00zh100g26ftnrgo	cmo558a7c00vt100gkftjgmsa	cmo557iw900h97b0ke1qhuof5	\N	\N	COMPLETED	Gloria Navarro	scale.p122.1776565443@test.com	2026-04-19 02:25:02.733	2026-04-19 02:25:02.759	2026-04-19 02:25:02.759	2026-04-19 02:25:07.286	\N
cmo558b3o00zl100go66kmq7b	cmo558a7c00vt100gkftjgmsa	cmo557j1b00he7b0k7vn7huyx	\N	\N	COMPLETED	Fernando Rojas	scale.p123.1776565443@test.com	2026-04-19 02:25:02.772	2026-04-19 02:25:02.799	2026-04-19 02:25:02.799	2026-04-19 02:25:07.286	\N
cmo558b4v00zp100gammgk291	cmo558a7c00vt100gkftjgmsa	cmo557j6f00hj7b0k3wywe8f1	\N	\N	COMPLETED	Pilar Salazar	scale.p124.1776565443@test.com	2026-04-19 02:25:02.815	2026-04-19 02:25:02.843	2026-04-19 02:25:02.843	2026-04-19 02:25:07.286	\N
cmo558b5z00zt100gf7e8zq2b	cmo558a7c00vt100gkftjgmsa	cmo557jbl00ho7b0kt5f05uiv	\N	\N	COMPLETED	Emilio Mercado	scale.p125.1776565443@test.com	2026-04-19 02:25:02.855	2026-04-19 02:25:02.883	2026-04-19 02:25:02.883	2026-04-19 02:25:07.286	\N
cmo558b7400zx100gh9yer8zb	cmo558a7c00vt100gkftjgmsa	cmo557jgm00ht7b0k0dte78bw	\N	\N	COMPLETED	Dolores Pascual	scale.p126.1776565443@test.com	2026-04-19 02:25:02.896	2026-04-19 02:25:02.924	2026-04-19 02:25:02.924	2026-04-19 02:25:07.286	\N
cmo558b890101100g4jvjxrqx	cmo558a7c00vt100gkftjgmsa	cmo557jln00hy7b0k90dtt0wl	\N	\N	COMPLETED	Gabriel Domingo	scale.p127.1776565443@test.com	2026-04-19 02:25:02.937	2026-04-19 02:25:02.965	2026-04-19 02:25:02.965	2026-04-19 02:25:07.286	\N
cmo558au800yl100gv1z95usv	cmo558a7c00vt100gkftjgmsa	cmo557hqv00g57b0k1d2v0a6m	\N	\N	COMPLETED	Lucia Morales	scale.p114.1776565443@test.com	2026-04-19 02:25:02.432	2026-04-19 02:25:02.459	2026-04-19 02:25:02.459	2026-04-19 02:25:07.286	\N
cmo558azo00z5100g1qqcngw8	cmo558a7c00vt100gkftjgmsa	cmo557ig100gu7b0ktczurfm0	\N	\N	COMPLETED	Manuel Fernandez	scale.p119.1776565443@test.com	2026-04-19 02:25:02.628	2026-04-19 02:25:02.653	2026-04-19 02:25:02.653	2026-04-19 02:25:07.286	\N
cmo558b0m00z9100g874y4oli	cmo558a7c00vt100gkftjgmsa	cmo557il600gz7b0kcp0gx5kg	\N	\N	COMPLETED	Patricia Perez	scale.p120.1776565443@test.com	2026-04-19 02:25:02.662	2026-04-19 02:25:02.687	2026-04-19 02:25:02.687	2026-04-19 02:25:07.286	\N
cmo558b9f0105100gmjzl4trs	cmo558a7c00vt100gkftjgmsa	cmo557jqg00i37b0kl4s918bi	\N	\N	COMPLETED	Rosario Tolentino	scale.p128.1776565443@test.com	2026-04-19 02:25:02.979	2026-04-19 02:25:03.007	2026-04-19 02:25:03.007	2026-04-19 02:25:07.286	\N
cmo558bak0109100ghs1mhijw	cmo558a7c00vt100gkftjgmsa	cmo557jvj00i87b0kzu8b3y5q	\N	\N	COMPLETED	Andres Santiago	scale.p129.1776565443@test.com	2026-04-19 02:25:03.02	2026-04-19 02:25:03.048	2026-04-19 02:25:03.048	2026-04-19 02:25:07.286	\N
cmo558bbp010d100g8l6f3oou	cmo558a7c00vt100gkftjgmsa	cmo557k0q00id7b0kiyizzm66	\N	\N	COMPLETED	Angela Manalo	scale.p130.1776565443@test.com	2026-04-19 02:25:03.061	2026-04-19 02:25:03.088	2026-04-19 02:25:03.088	2026-04-19 02:25:07.286	\N
cmo558bcw010h100gzt5veas6	cmo558a7c00vt100gkftjgmsa	cmo557k6900ii7b0kz59z58p6	\N	\N	COMPLETED	Roberto Ocampo	scale.p131.1776565443@test.com	2026-04-19 02:25:03.104	2026-04-19 02:25:03.132	2026-04-19 02:25:03.132	2026-04-19 02:25:07.286	\N
cmo558be2010l100gsrq5mihy	cmo558a7c00vt100gkftjgmsa	cmo557kav00in7b0kvr819xm1	\N	\N	COMPLETED	Consuelo Valdez	scale.p132.1776565443@test.com	2026-04-19 02:25:03.146	2026-04-19 02:25:03.174	2026-04-19 02:25:03.174	2026-04-19 02:25:07.286	\N
cmo558bf8010p100g9f7pnlgs	cmo558a7c00vt100gkftjgmsa	cmo557kfv00is7b0keethqpkw	\N	\N	COMPLETED	Sergio Soriano	scale.p133.1776565443@test.com	2026-04-19 02:25:03.188	2026-04-19 02:25:03.216	2026-04-19 02:25:03.216	2026-04-19 02:25:07.286	\N
cmo558bgd010t100gauzzm84z	cmo558a7c00vt100gkftjgmsa	cmo557kl800ix7b0kmp825bgx	\N	\N	COMPLETED	Esperanza Paras	scale.p134.1776565443@test.com	2026-04-19 02:25:03.229	2026-04-19 02:25:03.259	2026-04-19 02:25:03.259	2026-04-19 02:25:07.286	\N
cmo558bhj010x100g4butgw7f	cmo558a7c00vt100gkftjgmsa	cmo557kqf00j27b0kfuug0kse	\N	\N	COMPLETED	Leonardo Bello	scale.p135.1776565443@test.com	2026-04-19 02:25:03.27	2026-04-19 02:25:03.298	2026-04-19 02:25:03.298	2026-04-19 02:25:07.286	\N
cmo558bij0111100gr4ljt1jj	cmo558a7c00vt100gkftjgmsa	cmo557kvz00j77b0k185bppnq	\N	\N	COMPLETED	Margarita Espinosa	scale.p136.1776565443@test.com	2026-04-19 02:25:03.307	2026-04-19 02:25:03.335	2026-04-19 02:25:03.335	2026-04-19 02:25:07.286	\N
cmo558bjk0115100gys9c3qfv	cmo558a7c00vt100gkftjgmsa	cmo557l1d00jc7b0kgvzuo882	\N	\N	COMPLETED	Alejandro Montoya	scale.p137.1776565443@test.com	2026-04-19 02:25:03.344	2026-04-19 02:25:03.37	2026-04-19 02:25:03.37	2026-04-19 02:25:07.286	\N
cmo558bkj0119100gwjpg4jco	cmo558a7c00vt100gkftjgmsa	cmo557l6200jh7b0kru24b2xz	\N	\N	COMPLETED	Remedios Cabrera	scale.p138.1776565443@test.com	2026-04-19 02:25:03.379	2026-04-19 02:25:03.404	2026-04-19 02:25:03.404	2026-04-19 02:25:07.286	\N
cmo558bli011d100gocj6dqqh	cmo558a7c00vt100gkftjgmsa	cmo557lb900jm7b0kgkebn9y4	\N	\N	COMPLETED	Eduardo Guerrero	scale.p139.1776565443@test.com	2026-04-19 02:25:03.414	2026-04-19 02:25:03.44	2026-04-19 02:25:03.44	2026-04-19 02:25:07.286	\N
cmo558bmk011h100ghk526qxv	cmo558a7c00vt100gkftjgmsa	cmo557lge00jr7b0kcryv2044	\N	\N	COMPLETED	Victoria Luna	scale.p140.1776565443@test.com	2026-04-19 02:25:03.452	2026-04-19 02:25:03.479	2026-04-19 02:25:03.479	2026-04-19 02:25:07.286	\N
cmo558bnp011l100gem3guymp	cmo558a7c00vt100gkftjgmsa	cmo557llv00jw7b0kdcw9d3r3	\N	\N	COMPLETED	Alfredo Alvarez	scale.p141.1776565443@test.com	2026-04-19 02:25:03.493	2026-04-19 02:25:03.52	2026-04-19 02:25:03.52	2026-04-19 02:25:07.286	\N
cmo558bos011p100gfmok7bzh	cmo558a7c00vt100gkftjgmsa	cmo557lr700k17b0k91md5id4	\N	\N	COMPLETED	Mercedes Molina	scale.p142.1776565443@test.com	2026-04-19 02:25:03.532	2026-04-19 02:25:03.56	2026-04-19 02:25:03.56	2026-04-19 02:25:07.286	\N
cmo558bpw011t100gnind36ef	cmo558a7c00vt100gkftjgmsa	cmo557lwf00k67b0klnosqvfo	\N	\N	COMPLETED	Lorenzo Vargas	scale.p143.1776565443@test.com	2026-04-19 02:25:03.572	2026-04-19 02:25:03.599	2026-04-19 02:25:03.599	2026-04-19 02:25:07.286	\N
cmo558br0011x100geq6p3c6y	cmo558a7c00vt100gkftjgmsa	cmo557m1n00kb7b0k010r1b82	\N	\N	COMPLETED	Aurora Ortega	scale.p144.1776565443@test.com	2026-04-19 02:25:03.612	2026-04-19 02:25:03.639	2026-04-19 02:25:03.639	2026-04-19 02:25:07.286	\N
cmo558bs50121100g3gjlm3pd	cmo558a7c00vt100gkftjgmsa	cmo557m7000kg7b0kucmgdcte	\N	\N	COMPLETED	Ramon Medina	scale.p145.1776565443@test.com	2026-04-19 02:25:03.653	2026-04-19 02:25:03.681	2026-04-19 02:25:03.681	2026-04-19 02:25:07.286	\N
cmo558bta0125100g178c0urt	cmo558a7c00vt100gkftjgmsa	cmo557mc300kl7b0k0u5hs0ap	\N	\N	COMPLETED	Soledad Herrera	scale.p146.1776565443@test.com	2026-04-19 02:25:03.694	2026-04-19 02:25:03.722	2026-04-19 02:25:03.722	2026-04-19 02:25:07.286	\N
cmo558buf0129100gf9cd7p2z	cmo558a7c00vt100gkftjgmsa	cmo557mhd00kq7b0k7lg31xm8	\N	\N	COMPLETED	Ernesto Jimenez	scale.p147.1776565443@test.com	2026-04-19 02:25:03.735	2026-04-19 02:25:03.763	2026-04-19 02:25:03.763	2026-04-19 02:25:07.286	\N
cmo558bvk012d100g38q3kkfa	cmo558a7c00vt100gkftjgmsa	cmo557mmh00kv7b0kuce8hh6r	\N	\N	COMPLETED	Josefina Fuentes	scale.p148.1776565443@test.com	2026-04-19 02:25:03.776	2026-04-19 02:25:03.803	2026-04-19 02:25:03.803	2026-04-19 02:25:07.286	\N
cmo558bwo012h100gpfntl5mm	cmo558a7c00vt100gkftjgmsa	cmo557mrn00l07b0k2c81hsoh	\N	\N	COMPLETED	Arturo Paredes	scale.p149.1776565443@test.com	2026-04-19 02:25:03.816	2026-04-19 02:25:03.844	2026-04-19 02:25:03.844	2026-04-19 02:25:07.286	\N
cmo558ew201dk100gbuubtka3	cmo558eoo01cc100g1zgfdf9a	cmo557mwx00l57b0k9z24qbkl	\N	\N	COMPLETED	Maria Reyes	scale.p150.1776565443@test.com	2026-04-19 02:25:07.682	2026-04-19 02:25:07.71	2026-04-19 02:25:07.71	2026-04-19 02:25:13.086	\N
cmo558ex801do100gcfu3vhri	cmo558eoo01cc100g1zgfdf9a	cmo557n2100la7b0kju9en5sb	\N	\N	COMPLETED	Juan Santos	scale.p151.1776565443@test.com	2026-04-19 02:25:07.724	2026-04-19 02:25:07.752	2026-04-19 02:25:07.752	2026-04-19 02:25:13.086	\N
cmo558ezi01dw100g6vs8j5cq	cmo558eoo01cc100g1zgfdf9a	cmo557nc700lk7b0kzww6wx2e	\N	\N	COMPLETED	Pedro Cruz	scale.p153.1776565443@test.com	2026-04-19 02:25:07.806	2026-04-19 02:25:07.833	2026-04-19 02:25:07.833	2026-04-19 02:25:13.086	\N
cmo558f0n01e0100gdgktp8bt	cmo558eoo01cc100g1zgfdf9a	cmo557nhc00lp7b0kw7dai5g6	\N	\N	COMPLETED	Rosa Bautista	scale.p154.1776565443@test.com	2026-04-19 02:25:07.847	2026-04-19 02:25:07.875	2026-04-19 02:25:07.875	2026-04-19 02:25:13.086	\N
cmo558f1t01e4100gnmkegn1j	cmo558eoo01cc100g1zgfdf9a	cmo557nmf00lu7b0kjrdjn743	\N	\N	COMPLETED	Carlos Mendoza	scale.p155.1776565443@test.com	2026-04-19 02:25:07.889	2026-04-19 02:25:07.916	2026-04-19 02:25:07.916	2026-04-19 02:25:13.086	\N
cmo558f2x01e8100gb21sd5lr	cmo558eoo01cc100g1zgfdf9a	cmo557nrg00lz7b0kcasnmdvc	\N	\N	COMPLETED	Elena Villanueva	scale.p156.1776565443@test.com	2026-04-19 02:25:07.929	2026-04-19 02:25:07.956	2026-04-19 02:25:07.956	2026-04-19 02:25:13.086	\N
cmo558f4101ec100g0dtn7a5m	cmo558eoo01cc100g1zgfdf9a	cmo557nwi00m47b0kfd29d73k	\N	\N	COMPLETED	Miguel Flores	scale.p157.1776565443@test.com	2026-04-19 02:25:07.969	2026-04-19 02:25:07.997	2026-04-19 02:25:07.997	2026-04-19 02:25:13.086	\N
cmo558f5501eg100gg1uo99ku	cmo558eoo01cc100g1zgfdf9a	cmo557o1l00m97b0kbpc6t7nm	\N	\N	COMPLETED	Sofia Ramos	scale.p158.1776565443@test.com	2026-04-19 02:25:08.009	2026-04-19 02:25:08.036	2026-04-19 02:25:08.036	2026-04-19 02:25:13.086	\N
cmo558f6901ek100g4jpijdw2	cmo558eoo01cc100g1zgfdf9a	cmo557o6n00me7b0k78fhb0k5	\N	\N	COMPLETED	Jose Torres	scale.p159.1776565443@test.com	2026-04-19 02:25:08.049	2026-04-19 02:25:08.076	2026-04-19 02:25:08.076	2026-04-19 02:25:13.086	\N
cmo558f7d01eo100gldaa3xd9	cmo558eoo01cc100g1zgfdf9a	cmo557obw00mj7b0k5pzx9w36	\N	\N	COMPLETED	Carmen Gonzales	scale.p160.1776565443@test.com	2026-04-19 02:25:08.089	2026-04-19 02:25:08.117	2026-04-19 02:25:08.117	2026-04-19 02:25:13.086	\N
cmo558f8j01es100gn7zuq6ch	cmo558eoo01cc100g1zgfdf9a	cmo557ogs00mo7b0kc67x7k0i	\N	\N	COMPLETED	Rafael Lopez	scale.p161.1776565443@test.com	2026-04-19 02:25:08.131	2026-04-19 02:25:08.159	2026-04-19 02:25:08.159	2026-04-19 02:25:13.086	\N
cmo558f9p01ew100g9xbncwg9	cmo558eoo01cc100g1zgfdf9a	cmo557olp00mt7b0kjxf1w5lt	\N	\N	COMPLETED	Teresa Rivera	scale.p162.1776565443@test.com	2026-04-19 02:25:08.173	2026-04-19 02:25:08.201	2026-04-19 02:25:08.201	2026-04-19 02:25:13.086	\N
cmo558eyd01ds100gebd5lhpw	cmo558eoo01cc100g1zgfdf9a	cmo557n7400lf7b0kw1218vlt	\N	\N	COMPLETED	Ana Garcia	scale.p152.1776565443@test.com	2026-04-19 02:25:07.765	2026-04-19 02:25:07.793	2026-04-19 02:25:07.793	2026-04-19 02:25:13.086	\N
cmo558fau01f0100gx3p0qr2x	cmo558eoo01cc100g1zgfdf9a	cmo557oqo00my7b0kekoo7snp	\N	\N	COMPLETED	Diego Hernandez	scale.p163.1776565443@test.com	2026-04-19 02:25:08.214	2026-04-19 02:25:08.241	2026-04-19 02:25:08.241	2026-04-19 02:25:13.086	\N
cmo558fby01f4100glwpanmbd	cmo558eoo01cc100g1zgfdf9a	cmo557owd00n37b0k96pwtt86	\N	\N	COMPLETED	Lucia Morales	scale.p164.1776565443@test.com	2026-04-19 02:25:08.254	2026-04-19 02:25:08.281	2026-04-19 02:25:08.281	2026-04-19 02:25:13.086	\N
cmo558fd101f8100gzsr8cvek	cmo558eoo01cc100g1zgfdf9a	cmo557p1k00n87b0kznlszabt	\N	\N	COMPLETED	Antonio Castillo	scale.p165.1776565443@test.com	2026-04-19 02:25:08.293	2026-04-19 02:25:08.32	2026-04-19 02:25:08.32	2026-04-19 02:25:13.086	\N
cmo558fe501fc100gpl8qt9tq	cmo558eoo01cc100g1zgfdf9a	cmo557p6700nd7b0ku6rdvxlv	\N	\N	COMPLETED	Isabel Aquino	scale.p166.1776565443@test.com	2026-04-19 02:25:08.333	2026-04-19 02:25:08.359	2026-04-19 02:25:08.359	2026-04-19 02:25:13.086	\N
cmo558ff601fg100g78olyeip	cmo558eoo01cc100g1zgfdf9a	cmo557pb800ni7b0krdgjttot	\N	\N	COMPLETED	Francisco Delgado	scale.p167.1776565443@test.com	2026-04-19 02:25:08.37	2026-04-19 02:25:08.396	2026-04-19 02:25:08.396	2026-04-19 02:25:13.086	\N
cmo558fg601fk100gbhr4oy85	cmo558eoo01cc100g1zgfdf9a	cmo557phb00nn7b0k0iqa5nxc	\N	\N	COMPLETED	Beatriz Enriquez	scale.p168.1776565443@test.com	2026-04-19 02:25:08.406	2026-04-19 02:25:08.433	2026-04-19 02:25:08.433	2026-04-19 02:25:13.086	\N
cmo558fh701fo100gy2v63buk	cmo558eoo01cc100g1zgfdf9a	cmo557pmi00ns7b0kzqav8xfj	\N	\N	COMPLETED	Manuel Fernandez	scale.p169.1776565443@test.com	2026-04-19 02:25:08.443	2026-04-19 02:25:08.47	2026-04-19 02:25:08.47	2026-04-19 02:25:13.086	\N
cmo558fib01fs100ghbuyd3zh	cmo558eoo01cc100g1zgfdf9a	cmo557prm00nx7b0ks4xdwk7z	\N	\N	COMPLETED	Patricia Perez	scale.p170.1776565443@test.com	2026-04-19 02:25:08.483	2026-04-19 02:25:08.509	2026-04-19 02:25:08.509	2026-04-19 02:25:13.086	\N
cmo558fjb01fw100gex2fv60s	cmo558eoo01cc100g1zgfdf9a	cmo557pws00o27b0kcxns2k0z	\N	\N	COMPLETED	Ricardo Aguilar	scale.p171.1776565443@test.com	2026-04-19 02:25:08.519	2026-04-19 02:25:08.544	2026-04-19 02:25:08.544	2026-04-19 02:25:13.086	\N
cmo558fkb01g0100gm1b1i036	cmo558eoo01cc100g1zgfdf9a	cmo557q1i00o77b0k8783jbnc	\N	\N	COMPLETED	Gloria Navarro	scale.p172.1776565443@test.com	2026-04-19 02:25:08.554	2026-04-19 02:25:08.58	2026-04-19 02:25:08.58	2026-04-19 02:25:13.086	\N
cmo558fla01g4100gazr9iygq	cmo558eoo01cc100g1zgfdf9a	cmo557q6f00oc7b0k3y8was5x	\N	\N	COMPLETED	Fernando Rojas	scale.p173.1776565443@test.com	2026-04-19 02:25:08.589	2026-04-19 02:25:08.614	2026-04-19 02:25:08.614	2026-04-19 02:25:13.086	\N
cmo558fm801g8100gryva7ved	cmo558eoo01cc100g1zgfdf9a	cmo557qbo00oh7b0kdb0mb8av	\N	\N	COMPLETED	Pilar Salazar	scale.p174.1776565443@test.com	2026-04-19 02:25:08.624	2026-04-19 02:25:08.648	2026-04-19 02:25:08.648	2026-04-19 02:25:13.086	\N
cmo558fn601gc100glc7b36l1	cmo558eoo01cc100g1zgfdf9a	cmo557qgf00om7b0kw6i0fijv	\N	\N	COMPLETED	Emilio Mercado	scale.p175.1776565443@test.com	2026-04-19 02:25:08.658	2026-04-19 02:25:08.683	2026-04-19 02:25:08.683	2026-04-19 02:25:13.086	\N
cmo558fo601gg100g0whmgrqw	cmo558eoo01cc100g1zgfdf9a	cmo557qlc00or7b0kjzjnla31	\N	\N	COMPLETED	Dolores Pascual	scale.p176.1776565443@test.com	2026-04-19 02:25:08.694	2026-04-19 02:25:08.72	2026-04-19 02:25:08.72	2026-04-19 02:25:13.086	\N
cmo558fp701gk100gm652ns8o	cmo558eoo01cc100g1zgfdf9a	cmo557qqe00ow7b0k1llohmfo	\N	\N	COMPLETED	Gabriel Domingo	scale.p177.1776565443@test.com	2026-04-19 02:25:08.731	2026-04-19 02:25:08.758	2026-04-19 02:25:08.758	2026-04-19 02:25:13.086	\N
cmo558fqc01go100g7oyuluu7	cmo558eoo01cc100g1zgfdf9a	cmo557qvg00p17b0kbvs44rl3	\N	\N	COMPLETED	Rosario Tolentino	scale.p178.1776565443@test.com	2026-04-19 02:25:08.772	2026-04-19 02:25:08.8	2026-04-19 02:25:08.8	2026-04-19 02:25:13.086	\N
cmo558fri01gs100gnagwuzy0	cmo558eoo01cc100g1zgfdf9a	cmo557r0i00p67b0k045twbt7	\N	\N	COMPLETED	Andres Santiago	scale.p179.1776565443@test.com	2026-04-19 02:25:08.814	2026-04-19 02:25:08.841	2026-04-19 02:25:08.841	2026-04-19 02:25:13.086	\N
cmo558fsm01gw100gqwt04fbk	cmo558eoo01cc100g1zgfdf9a	cmo557r5q00pb7b0kuc91ln3z	\N	\N	COMPLETED	Angela Manalo	scale.p180.1776565443@test.com	2026-04-19 02:25:08.854	2026-04-19 02:25:08.883	2026-04-19 02:25:08.883	2026-04-19 02:25:13.086	\N
cmo558fts01h0100greq2txb3	cmo558eoo01cc100g1zgfdf9a	cmo557ras00pg7b0kf375867f	\N	\N	COMPLETED	Roberto Ocampo	scale.p181.1776565443@test.com	2026-04-19 02:25:08.895	2026-04-19 02:25:08.923	2026-04-19 02:25:08.923	2026-04-19 02:25:13.086	\N
cmo558fuw01h4100g4vnnv019	cmo558eoo01cc100g1zgfdf9a	cmo557rfn00pl7b0kej55y9bk	\N	\N	COMPLETED	Consuelo Valdez	scale.p182.1776565443@test.com	2026-04-19 02:25:08.936	2026-04-19 02:25:08.964	2026-04-19 02:25:08.964	2026-04-19 02:25:13.086	\N
cmo558fx501hc100gdcex1mqw	cmo558eoo01cc100g1zgfdf9a	cmo557rpw00pv7b0kvh4xon07	\N	\N	COMPLETED	Esperanza Paras	scale.p184.1776565443@test.com	2026-04-19 02:25:09.017	2026-04-19 02:25:09.045	2026-04-19 02:25:09.045	2026-04-19 02:25:13.086	\N
cmo558fya01hg100ggix4wsgk	cmo558eoo01cc100g1zgfdf9a	cmo557rux00q07b0k3h7jj7k3	\N	\N	COMPLETED	Leonardo Bello	scale.p185.1776565443@test.com	2026-04-19 02:25:09.058	2026-04-19 02:25:09.086	2026-04-19 02:25:09.086	2026-04-19 02:25:13.086	\N
cmo558fzf01hk100gccemxgxo	cmo558eoo01cc100g1zgfdf9a	cmo557s0800q57b0k5c2vn2s6	\N	\N	COMPLETED	Margarita Espinosa	scale.p186.1776565443@test.com	2026-04-19 02:25:09.098	2026-04-19 02:25:09.128	2026-04-19 02:25:09.128	2026-04-19 02:25:13.086	\N
cmo558g0m01ho100ga4b60nk7	cmo558eoo01cc100g1zgfdf9a	cmo557s4t00qa7b0kvz050jin	\N	\N	COMPLETED	Alejandro Montoya	scale.p187.1776565443@test.com	2026-04-19 02:25:09.142	2026-04-19 02:25:09.17	2026-04-19 02:25:09.17	2026-04-19 02:25:13.086	\N
cmo558g1q01hs100g2wmxnqqv	cmo558eoo01cc100g1zgfdf9a	cmo557s9r00qf7b0kv2j9wc4e	\N	\N	COMPLETED	Remedios Cabrera	scale.p188.1776565443@test.com	2026-04-19 02:25:09.182	2026-04-19 02:25:09.211	2026-04-19 02:25:09.211	2026-04-19 02:25:13.086	\N
cmo558g2w01hw100ghpmpmwwj	cmo558eoo01cc100g1zgfdf9a	cmo557seu00qk7b0kjzngc5jp	\N	\N	COMPLETED	Eduardo Guerrero	scale.p189.1776565443@test.com	2026-04-19 02:25:09.224	2026-04-19 02:25:09.25	2026-04-19 02:25:09.25	2026-04-19 02:25:13.086	\N
cmo558g4001i0100gxj9uaf6r	cmo558eoo01cc100g1zgfdf9a	cmo557sjy00qp7b0kcbixu68x	\N	\N	COMPLETED	Victoria Luna	scale.p190.1776565443@test.com	2026-04-19 02:25:09.264	2026-04-19 02:25:09.291	2026-04-19 02:25:09.291	2026-04-19 02:25:13.086	\N
cmo558g5401i4100ggmpnk1vw	cmo558eoo01cc100g1zgfdf9a	cmo557sp400qu7b0k6g4ofhl0	\N	\N	COMPLETED	Alfredo Alvarez	scale.p191.1776565443@test.com	2026-04-19 02:25:09.304	2026-04-19 02:25:09.331	2026-04-19 02:25:09.331	2026-04-19 02:25:13.086	\N
cmo558g6801i8100gplqcji02	cmo558eoo01cc100g1zgfdf9a	cmo557su500qz7b0k1800gjp0	\N	\N	COMPLETED	Mercedes Molina	scale.p192.1776565443@test.com	2026-04-19 02:25:09.344	2026-04-19 02:25:09.372	2026-04-19 02:25:09.372	2026-04-19 02:25:13.086	\N
cmo558g7d01ic100gtqb5eo8i	cmo558eoo01cc100g1zgfdf9a	cmo557szb00r47b0k09i82w3t	\N	\N	COMPLETED	Lorenzo Vargas	scale.p193.1776565443@test.com	2026-04-19 02:25:09.385	2026-04-19 02:25:09.412	2026-04-19 02:25:09.412	2026-04-19 02:25:13.086	\N
cmo558g8h01ig100gt1tnpb9c	cmo558eoo01cc100g1zgfdf9a	cmo557t4r00r97b0konzo0g13	\N	\N	COMPLETED	Aurora Ortega	scale.p194.1776565443@test.com	2026-04-19 02:25:09.425	2026-04-19 02:25:09.452	2026-04-19 02:25:09.452	2026-04-19 02:25:13.086	\N
cmo558g9m01ik100g0roowib3	cmo558eoo01cc100g1zgfdf9a	cmo557t9u00re7b0kijdp5m56	\N	\N	COMPLETED	Ramon Medina	scale.p195.1776565443@test.com	2026-04-19 02:25:09.466	2026-04-19 02:25:09.493	2026-04-19 02:25:09.493	2026-04-19 02:25:13.086	\N
cmo558gap01io100gryn9n9z0	cmo558eoo01cc100g1zgfdf9a	cmo557tez00rj7b0kiw7z270r	\N	\N	COMPLETED	Soledad Herrera	scale.p196.1776565443@test.com	2026-04-19 02:25:09.504	2026-04-19 02:25:09.532	2026-04-19 02:25:09.532	2026-04-19 02:25:13.086	\N
cmo558gbt01is100gchq7ala5	cmo558eoo01cc100g1zgfdf9a	cmo557tk200ro7b0k0q0bhpn0	\N	\N	COMPLETED	Ernesto Jimenez	scale.p197.1776565443@test.com	2026-04-19 02:25:09.545	2026-04-19 02:25:09.572	2026-04-19 02:25:09.572	2026-04-19 02:25:13.086	\N
cmo558gcx01iw100guwc4dny4	cmo558eoo01cc100g1zgfdf9a	cmo557tp800rt7b0ks8pu88qg	\N	\N	COMPLETED	Josefina Fuentes	scale.p198.1776565443@test.com	2026-04-19 02:25:09.585	2026-04-19 02:25:09.613	2026-04-19 02:25:09.613	2026-04-19 02:25:13.086	\N
cmo558ge301j0100giv3qs821	cmo558eoo01cc100g1zgfdf9a	cmo557tub00ry7b0k39n9mopk	\N	\N	COMPLETED	Arturo Paredes	scale.p199.1776565443@test.com	2026-04-19 02:25:09.627	2026-04-19 02:25:09.655	2026-04-19 02:25:09.655	2026-04-19 02:25:13.086	\N
cmo558fw101h8100gr53x58od	cmo558eoo01cc100g1zgfdf9a	cmo557rkr00pq7b0kbbtj1zwa	\N	\N	COMPLETED	Sergio Soriano	scale.p183.1776565443@test.com	2026-04-19 02:25:08.977	2026-04-19 02:25:09.005	2026-04-19 02:25:09.005	2026-04-19 02:25:13.086	\N
cmo558jef01ti100gpf100hzj	cmo558j7801sa100gb8g19tm3	cmo557tze00s37b0knxgb0zgq	\N	\N	COMPLETED	Maria Reyes	scale.p200.1776565443@test.com	2026-04-19 02:25:13.527	2026-04-19 02:25:13.556	2026-04-19 02:25:13.556	2026-04-19 02:25:18.999	\N
cmo558jfk01tm100ghjyefpxv	cmo558j7801sa100gb8g19tm3	cmo557u4j00s87b0kojl3s945	\N	\N	COMPLETED	Juan Santos	scale.p201.1776565443@test.com	2026-04-19 02:25:13.568	2026-04-19 02:25:13.597	2026-04-19 02:25:13.597	2026-04-19 02:25:18.999	\N
cmo558jgq01tq100g3cm5lb6d	cmo558j7801sa100gb8g19tm3	cmo557u9r00sd7b0kuzobggoq	\N	\N	COMPLETED	Ana Garcia	scale.p202.1776565443@test.com	2026-04-19 02:25:13.61	2026-04-19 02:25:13.638	2026-04-19 02:25:13.638	2026-04-19 02:25:18.999	\N
cmo558jhw01tu100g24itup4k	cmo558j7801sa100gb8g19tm3	cmo557uet00si7b0kvne2djec	\N	\N	COMPLETED	Pedro Cruz	scale.p203.1776565443@test.com	2026-04-19 02:25:13.652	2026-04-19 02:25:13.68	2026-04-19 02:25:13.68	2026-04-19 02:25:18.999	\N
cmo558jj201ty100g3bvg8sas	cmo558j7801sa100gb8g19tm3	cmo557ujv00sn7b0kg8pxfsox	\N	\N	COMPLETED	Rosa Bautista	scale.p204.1776565443@test.com	2026-04-19 02:25:13.694	2026-04-19 02:25:13.721	2026-04-19 02:25:13.721	2026-04-19 02:25:18.999	\N
cmo558jmk01ua100gi68c1onb	cmo558j7801sa100gb8g19tm3	cmo557uz300t27b0k6t32lb5v	\N	\N	COMPLETED	Miguel Flores	scale.p207.1776565443@test.com	2026-04-19 02:25:13.819	2026-04-19 02:25:13.847	2026-04-19 02:25:13.847	2026-04-19 02:25:18.999	\N
cmo558jnp01ue100g43lr5ix4	cmo558j7801sa100gb8g19tm3	cmo557v4800t77b0k2mc5rfic	\N	\N	COMPLETED	Sofia Ramos	scale.p208.1776565443@test.com	2026-04-19 02:25:13.861	2026-04-19 02:25:13.889	2026-04-19 02:25:13.889	2026-04-19 02:25:18.999	\N
cmo558jox01ui100gousqdl0g	cmo558j7801sa100gb8g19tm3	cmo557v9a00tc7b0k18ly995s	\N	\N	COMPLETED	Jose Torres	scale.p209.1776565443@test.com	2026-04-19 02:25:13.905	2026-04-19 02:25:13.935	2026-04-19 02:25:13.935	2026-04-19 02:25:18.999	\N
cmo558jq501um100gi3qx3atz	cmo558j7801sa100gb8g19tm3	cmo557vee00th7b0kqnj7luvr	\N	\N	COMPLETED	Carmen Gonzales	scale.p210.1776565443@test.com	2026-04-19 02:25:13.948	2026-04-19 02:25:13.977	2026-04-19 02:25:13.977	2026-04-19 02:25:18.999	\N
cmo558jr901uq100grc89b840	cmo558j7801sa100gb8g19tm3	cmo557vjj00tm7b0kz8gnhpct	\N	\N	COMPLETED	Rafael Lopez	scale.p211.1776565443@test.com	2026-04-19 02:25:13.989	2026-04-19 02:25:14.017	2026-04-19 02:25:14.017	2026-04-19 02:25:18.999	\N
cmo558jsf01uu100gppejnptr	cmo558j7801sa100gb8g19tm3	cmo557von00tr7b0kpw9dyaf2	\N	\N	COMPLETED	Teresa Rivera	scale.p212.1776565443@test.com	2026-04-19 02:25:14.031	2026-04-19 02:25:14.058	2026-04-19 02:25:14.058	2026-04-19 02:25:18.999	\N
cmo558jtj01uy100gpeuk3ggr	cmo558j7801sa100gb8g19tm3	cmo557vup00tw7b0kka2z577m	\N	\N	COMPLETED	Diego Hernandez	scale.p213.1776565443@test.com	2026-04-19 02:25:14.071	2026-04-19 02:25:14.1	2026-04-19 02:25:14.1	2026-04-19 02:25:18.999	\N
cmo558jup01v2100gega0sqbc	cmo558j7801sa100gb8g19tm3	cmo557w0200u17b0ka55u5wp5	\N	\N	COMPLETED	Lucia Morales	scale.p214.1776565443@test.com	2026-04-19 02:25:14.113	2026-04-19 02:25:14.142	2026-04-19 02:25:14.142	2026-04-19 02:25:18.999	\N
cmo558jvw01v6100g5wheu0u3	cmo558j7801sa100gb8g19tm3	cmo557w5600u67b0krc3w0c51	\N	\N	COMPLETED	Antonio Castillo	scale.p215.1776565443@test.com	2026-04-19 02:25:14.156	2026-04-19 02:25:14.183	2026-04-19 02:25:14.183	2026-04-19 02:25:18.999	\N
cmo558jx201va100gp7n79qh9	cmo558j7801sa100gb8g19tm3	cmo557w9z00ub7b0k51iu0w8p	\N	\N	COMPLETED	Isabel Aquino	scale.p216.1776565443@test.com	2026-04-19 02:25:14.198	2026-04-19 02:25:14.226	2026-04-19 02:25:14.226	2026-04-19 02:25:18.999	\N
cmo558jy701ve100gufipieuj	cmo558j7801sa100gb8g19tm3	cmo557wf100ug7b0kb984024b	\N	\N	COMPLETED	Francisco Delgado	scale.p217.1776565443@test.com	2026-04-19 02:25:14.239	2026-04-19 02:25:14.266	2026-04-19 02:25:14.266	2026-04-19 02:25:18.999	\N
cmo558jzc01vi100g3yspayqs	cmo558j7801sa100gb8g19tm3	cmo557wk700ul7b0kz02m7bt9	\N	\N	COMPLETED	Beatriz Enriquez	scale.p218.1776565443@test.com	2026-04-19 02:25:14.28	2026-04-19 02:25:14.306	2026-04-19 02:25:14.306	2026-04-19 02:25:18.999	\N
cmo558k0f01vm100gjhyj5ald	cmo558j7801sa100gb8g19tm3	cmo557wpj00uq7b0kwopo3104	\N	\N	COMPLETED	Manuel Fernandez	scale.p219.1776565443@test.com	2026-04-19 02:25:14.319	2026-04-19 02:25:14.346	2026-04-19 02:25:14.346	2026-04-19 02:25:18.999	\N
cmo558k1i01vq100gtdr46gqy	cmo558j7801sa100gb8g19tm3	cmo557wuo00uv7b0k4im8bj0e	\N	\N	COMPLETED	Patricia Perez	scale.p220.1776565443@test.com	2026-04-19 02:25:14.358	2026-04-19 02:25:14.387	2026-04-19 02:25:14.387	2026-04-19 02:25:18.999	\N
cmo558k2n01vu100giy9tvu56	cmo558j7801sa100gb8g19tm3	cmo557wzr00v07b0kjf3w2l23	\N	\N	COMPLETED	Ricardo Aguilar	scale.p221.1776565443@test.com	2026-04-19 02:25:14.399	2026-04-19 02:25:14.428	2026-04-19 02:25:14.428	2026-04-19 02:25:18.999	\N
cmo558k3u01vy100gdbqrxv7e	cmo558j7801sa100gb8g19tm3	cmo557x4v00v57b0ka29aheyo	\N	\N	COMPLETED	Gloria Navarro	scale.p222.1776565443@test.com	2026-04-19 02:25:14.442	2026-04-19 02:25:14.47	2026-04-19 02:25:14.47	2026-04-19 02:25:18.999	\N
cmo558k6401w6100gv7ivamq2	cmo558j7801sa100gb8g19tm3	cmo557xf600vf7b0k6nf325ws	\N	\N	COMPLETED	Pilar Salazar	scale.p224.1776565443@test.com	2026-04-19 02:25:14.524	2026-04-19 02:25:14.552	2026-04-19 02:25:14.552	2026-04-19 02:25:18.999	\N
cmo558k7a01wa100go9mzl4cy	cmo558j7801sa100gb8g19tm3	cmo557xke00vk7b0kydwbgsas	\N	\N	COMPLETED	Emilio Mercado	scale.p225.1776565443@test.com	2026-04-19 02:25:14.566	2026-04-19 02:25:14.594	2026-04-19 02:25:14.594	2026-04-19 02:25:18.999	\N
cmo558k8i01we100g5dqyj9xy	cmo558j7801sa100gb8g19tm3	cmo557xp400vp7b0k9gem5k8b	\N	\N	COMPLETED	Dolores Pascual	scale.p226.1776565443@test.com	2026-04-19 02:25:14.61	2026-04-19 02:25:14.639	2026-04-19 02:25:14.639	2026-04-19 02:25:18.999	\N
cmo558k9o01wi100gpjnr508b	cmo558j7801sa100gb8g19tm3	cmo557xu900vu7b0kp3g098mx	\N	\N	COMPLETED	Gabriel Domingo	scale.p227.1776565443@test.com	2026-04-19 02:25:14.651	2026-04-19 02:25:14.68	2026-04-19 02:25:14.68	2026-04-19 02:25:18.999	\N
cmo558kat01wm100gtj9671oa	cmo558j7801sa100gb8g19tm3	cmo557xzc00vz7b0kmmboa9u5	\N	\N	COMPLETED	Rosario Tolentino	scale.p228.1776565443@test.com	2026-04-19 02:25:14.693	2026-04-19 02:25:14.722	2026-04-19 02:25:14.722	2026-04-19 02:25:18.999	\N
cmo558kbz01wq100gcc0952ot	cmo558j7801sa100gb8g19tm3	cmo557y4p00w47b0kcy626bah	\N	\N	COMPLETED	Andres Santiago	scale.p229.1776565443@test.com	2026-04-19 02:25:14.735	2026-04-19 02:25:14.762	2026-04-19 02:25:14.762	2026-04-19 02:25:18.999	\N
cmo558kd301wu100ggv39jbwy	cmo558j7801sa100gb8g19tm3	cmo557y9j00w97b0kz60mqb0x	\N	\N	COMPLETED	Angela Manalo	scale.p230.1776565443@test.com	2026-04-19 02:25:14.775	2026-04-19 02:25:14.804	2026-04-19 02:25:14.804	2026-04-19 02:25:18.999	\N
cmo558kec01wy100ge64hb0zx	cmo558j7801sa100gb8g19tm3	cmo557yen00we7b0kgagknyrb	\N	\N	COMPLETED	Roberto Ocampo	scale.p231.1776565443@test.com	2026-04-19 02:25:14.82	2026-04-19 02:25:14.848	2026-04-19 02:25:14.848	2026-04-19 02:25:18.999	\N
cmo558kfh01x2100gwylx1hzr	cmo558j7801sa100gb8g19tm3	cmo557yjr00wj7b0k93g5v46t	\N	\N	COMPLETED	Consuelo Valdez	scale.p232.1776565443@test.com	2026-04-19 02:25:14.861	2026-04-19 02:25:14.89	2026-04-19 02:25:14.89	2026-04-19 02:25:18.999	\N
cmo558kgo01x6100ge5j3vc6l	cmo558j7801sa100gb8g19tm3	cmo557yot00wo7b0ker1evt5a	\N	\N	COMPLETED	Sergio Soriano	scale.p233.1776565443@test.com	2026-04-19 02:25:14.903	2026-04-19 02:25:14.931	2026-04-19 02:25:14.931	2026-04-19 02:25:18.999	\N
cmo558khs01xa100gb22at26s	cmo558j7801sa100gb8g19tm3	cmo557ytx00wt7b0ku3vsvi6i	\N	\N	COMPLETED	Esperanza Paras	scale.p234.1776565443@test.com	2026-04-19 02:25:14.943	2026-04-19 02:25:14.972	2026-04-19 02:25:14.972	2026-04-19 02:25:18.999	\N
cmo558kiy01xe100g1suv0mx8	cmo558j7801sa100gb8g19tm3	cmo557yz200wy7b0kukfrukpk	\N	\N	COMPLETED	Leonardo Bello	scale.p235.1776565443@test.com	2026-04-19 02:25:14.986	2026-04-19 02:25:15.013	2026-04-19 02:25:15.013	2026-04-19 02:25:18.999	\N
cmo558kk201xi100gfyoxdnxg	cmo558j7801sa100gb8g19tm3	cmo557z4700x37b0k193jisw5	\N	\N	COMPLETED	Margarita Espinosa	scale.p236.1776565443@test.com	2026-04-19 02:25:15.026	2026-04-19 02:25:15.054	2026-04-19 02:25:15.054	2026-04-19 02:25:18.999	\N
cmo558kl701xm100g02qeyfwe	cmo558j7801sa100gb8g19tm3	cmo557z9600x87b0kxla3zvl5	\N	\N	COMPLETED	Alejandro Montoya	scale.p237.1776565443@test.com	2026-04-19 02:25:15.067	2026-04-19 02:25:15.095	2026-04-19 02:25:15.095	2026-04-19 02:25:18.999	\N
cmo558kmd01xq100gygb1j38f	cmo558j7801sa100gb8g19tm3	cmo557zed00xd7b0kqrsc0fb2	\N	\N	COMPLETED	Remedios Cabrera	scale.p238.1776565443@test.com	2026-04-19 02:25:15.109	2026-04-19 02:25:15.136	2026-04-19 02:25:15.136	2026-04-19 02:25:18.999	\N
cmocm39qm00271w8sedk78awx	cmocm26ej001b1w8syavkdvtc	cmockq3hi001buxz7570ou2ax	\N	\N	ATTENDED	MARIAN KAREN  SOROPIA	MarianKarenSoropia@dti.gov.ph	2026-04-24 07:51:24.43	2026-04-24 07:52:10.341	2026-04-24 07:52:10.341	\N	\N
cmp1yzo65000vme1wf4o7vbwz	cmp171iiu00005ckaazxybh61	cmoebag5v0001e1ef35z9m1xm	cmoebag660003e1ef7zh31npm	Cubeworks Technology Consulting and Solutions Inc.	COMPLETED	Marlon Ceniza	mtc@cubeworks.com.ph	2026-05-12 01:46:45.917	2026-05-12 01:46:57.311	2026-05-12 01:46:57.311	2026-05-12 05:14:00.652	\N
cmo558jk801u2100ghu4hxqqv	cmo558j7801sa100gb8g19tm3	cmo557uoy00ss7b0kql7bfvw8	\N	\N	COMPLETED	Carlos Mendoza	scale.p205.1776565443@test.com	2026-04-19 02:25:13.736	2026-04-19 02:25:13.764	2026-04-19 02:25:13.764	2026-04-19 02:25:18.999	\N
cmo558k4z01w2100gp3v5ev5k	cmo558j7801sa100gb8g19tm3	cmo557xa300va7b0kdaoph27t	\N	\N	COMPLETED	Fernando Rojas	scale.p223.1776565443@test.com	2026-04-19 02:25:14.482	2026-04-19 02:25:14.511	2026-04-19 02:25:14.511	2026-04-19 02:25:18.999	\N
cmo558jle01u6100ggsr1egu4	cmo558j7801sa100gb8g19tm3	cmo557uu000sx7b0krwou7vvt	\N	\N	COMPLETED	Elena Villanueva	scale.p206.1776565443@test.com	2026-04-19 02:25:13.778	2026-04-19 02:25:13.805	2026-04-19 02:25:13.805	2026-04-19 02:25:18.999	\N
cmo558kni01xu100gyxwbvq7c	cmo558j7801sa100gb8g19tm3	cmo557zji00xi7b0k56gau7l9	\N	\N	COMPLETED	Eduardo Guerrero	scale.p239.1776565443@test.com	2026-04-19 02:25:15.149	2026-04-19 02:25:15.182	2026-04-19 02:25:15.182	2026-04-19 02:25:18.999	\N
cmo558kot01xy100gzi671glw	cmo558j7801sa100gb8g19tm3	cmo557zop00xn7b0k39c3nzfg	\N	\N	COMPLETED	Victoria Luna	scale.p240.1776565443@test.com	2026-04-19 02:25:15.197	2026-04-19 02:25:15.224	2026-04-19 02:25:15.224	2026-04-19 02:25:18.999	\N
cmo558kpw01y2100gi17iz11y	cmo558j7801sa100gb8g19tm3	cmo557zu900xs7b0kbb2lyyc3	\N	\N	COMPLETED	Alfredo Alvarez	scale.p241.1776565443@test.com	2026-04-19 02:25:15.236	2026-04-19 02:25:15.265	2026-04-19 02:25:15.265	2026-04-19 02:25:18.999	\N
cmo558kqz01y6100glnw7okzs	cmo558j7801sa100gb8g19tm3	cmo557zyu00xx7b0kgs9475e5	\N	\N	COMPLETED	Mercedes Molina	scale.p242.1776565443@test.com	2026-04-19 02:25:15.275	2026-04-19 02:25:15.302	2026-04-19 02:25:15.302	2026-04-19 02:25:18.999	\N
cmo558ks001ya100gss5d07hj	cmo558j7801sa100gb8g19tm3	cmo55803r00y27b0kivnt8i8n	\N	\N	COMPLETED	Lorenzo Vargas	scale.p243.1776565443@test.com	2026-04-19 02:25:15.312	2026-04-19 02:25:15.337	2026-04-19 02:25:15.337	2026-04-19 02:25:18.999	\N
cmo558ksz01ye100g3axlmuh0	cmo558j7801sa100gb8g19tm3	cmo55808y00y77b0k07q4amg0	\N	\N	COMPLETED	Aurora Ortega	scale.p244.1776565443@test.com	2026-04-19 02:25:15.347	2026-04-19 02:25:15.373	2026-04-19 02:25:15.373	2026-04-19 02:25:18.999	\N
cmo558ku101yi100g5wrzdepg	cmo558j7801sa100gb8g19tm3	cmo5580fe00yc7b0khj6mgnge	\N	\N	COMPLETED	Ramon Medina	scale.p245.1776565443@test.com	2026-04-19 02:25:15.385	2026-04-19 02:25:15.413	2026-04-19 02:25:15.413	2026-04-19 02:25:18.999	\N
cmo558kv601ym100gaqjtz3ma	cmo558j7801sa100gb8g19tm3	cmo5580kk00yh7b0kfejjlsyh	\N	\N	COMPLETED	Soledad Herrera	scale.p246.1776565443@test.com	2026-04-19 02:25:15.426	2026-04-19 02:25:15.454	2026-04-19 02:25:15.454	2026-04-19 02:25:18.999	\N
cmo558kwb01yq100gw8wz7hzo	cmo558j7801sa100gb8g19tm3	cmo5580po00ym7b0kpwdoxgsu	\N	\N	COMPLETED	Ernesto Jimenez	scale.p247.1776565443@test.com	2026-04-19 02:25:15.467	2026-04-19 02:25:15.495	2026-04-19 02:25:15.495	2026-04-19 02:25:18.999	\N
cmo558kxg01yu100gryr0uyk9	cmo558j7801sa100gb8g19tm3	cmo5580uw00yr7b0kipuqllzh	\N	\N	COMPLETED	Josefina Fuentes	scale.p248.1776565443@test.com	2026-04-19 02:25:15.508	2026-04-19 02:25:15.536	2026-04-19 02:25:15.536	2026-04-19 02:25:18.999	\N
cmo558kyl01yy100gpcqmnjbw	cmo558j7801sa100gb8g19tm3	cmo55810700yw7b0k61bz2pxy	\N	\N	COMPLETED	Arturo Paredes	scale.p249.1776565443@test.com	2026-04-19 02:25:15.549	2026-04-19 02:25:15.577	2026-04-19 02:25:15.577	2026-04-19 02:25:18.999	\N
\.


--
-- Data for Name: event_sessions; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.event_sessions (id, event_id, title, start_time, end_time, venue, speaker_name, order_index, created_at) FROM stdin;
cmo4ff7qu0016sq0jauptp49c	cmo4ff7a90000sq0j3py5r6zc	Digital Marketing Fundamentals	2026-04-25 09:00:00	2026-04-25 17:00:00	Main Hall	Dr. Maria Santos	0	2026-04-18 14:22:34.999
cmo4ffrds002hsq0jqij13267	cmo4ffqxm0017sq0jpfl3sswp	Digital Marketing Fundamentals	2026-04-25 09:00:00	2026-04-25 17:00:00	Main Hall	Dr. Maria Santos	0	2026-04-18 14:23:00.448
cmo4fm8ap001a13i6swukdra4	cmo4fm7tl000013i65nq60ql9	Digital Marketing Fundamentals	2026-04-25 09:00:00	2026-04-25 17:00:00	Main Hall	Dr. Maria Santos	0	2026-04-18 14:28:02.305
cmo553xc10016bf087spodqp7	cmo553x4p0000bf08wscm80zn	E-Commerce Platform Management	2026-05-03 09:00:00	2026-05-03 17:00:00	Cebu IT Park, Cebu City	Engr. Roberto Lim	0	2026-04-19 02:21:38.306
cmo553xok002dbf089r214rat	cmo553xi40017bf08k1kzzfep	Business Registration & Compliance	2026-05-06 09:00:00	2026-05-06 17:00:00	DTI Negosyo Center, Mandaue City	Atty. Carmen Velasco	0	2026-04-19 02:21:38.756
cmo553y05003kbf08qgzk15j6	cmo553xts002ebf0899aueskl	Consumer Protection Law	2026-05-09 09:00:00	2026-05-09 17:00:00	Waterfront Cebu City Hotel	Dr. Patricia Reyes	0	2026-04-19 02:21:39.174
cmo553ybc004rbf0821ow2l8q	cmo553y50003lbf08v5q5dlpc	Export Documentation & Standards	2026-05-12 09:00:00	2026-05-12 17:00:00	Mactan Export Processing Zone Conference Hall	Prof. Eduardo Tan	0	2026-04-19 02:21:39.577
cmo553ymp005ybf08q9ttn514	cmo553yh0004sbf08bn61lcqs	Product Development & Branding	2026-05-15 09:00:00	2026-05-15 17:00:00	Bohol Cultural Center, Tagbilaran City	Ms. Gloria Mercado	0	2026-04-19 02:21:39.986
cmo555fgh0075bf08dxofg4a5	cmo555f9x005zbf0853edgeal	E-Commerce Platform Management	2026-05-03 09:00:00	2026-05-03 17:00:00	Cebu IT Park, Cebu City	Engr. Roberto Lim	0	2026-04-19 02:22:48.449
cmo555ivr00jobf084l0khv4o	cmo555ipb00iibf08ubpwnt83	Business Registration & Compliance	2026-05-06 09:00:00	2026-05-06 17:00:00	DTI Negosyo Center, Mandaue City	Atty. Carmen Velasco	0	2026-04-19 02:22:52.888
cmo555j6w00kvbf08elmak0zk	cmo555j0n00jpbf08zx94o2jr	Consumer Protection Law	2026-05-09 09:00:00	2026-05-09 17:00:00	Waterfront Cebu City Hotel	Dr. Patricia Reyes	0	2026-04-19 02:22:53.288
cmo5581d00016100gr4djblp6	cmo55815b0000100gwzv2dbyo	E-Commerce Platform Management	2026-05-03 09:00:00	2026-05-03 17:00:00	Cebu IT Park, Cebu City	Engr. Roberto Lim	0	2026-04-19 02:24:50.148
cmo5585xu00h7100g0mxg9tvj	cmo5585r700g1100gkoseur2n	Business Registration & Compliance	2026-05-06 09:00:00	2026-05-06 17:00:00	DTI Negosyo Center, Mandaue City	Atty. Carmen Velasco	0	2026-04-19 02:24:56.082
cmo558adq00wz100g6s8dpjqj	cmo558a7c00vt100gkftjgmsa	Consumer Protection Law	2026-05-09 09:00:00	2026-05-09 17:00:00	Waterfront Cebu City Hotel	Dr. Patricia Reyes	0	2026-04-19 02:25:01.838
cmo558ev701di100gers5rixx	cmo558eoo01cc100g1zgfdf9a	Export Documentation & Standards	2026-05-12 09:00:00	2026-05-12 17:00:00	Mactan Export Processing Zone Conference Hall	Prof. Eduardo Tan	0	2026-04-19 02:25:07.651
cmo558jdm01tg100golpmyv7y	cmo558j7801sa100gb8g19tm3	Product Development & Branding	2026-05-15 09:00:00	2026-05-15 17:00:00	Bohol Cultural Center, Tagbilaran City	Ms. Gloria Mercado	0	2026-04-19 02:25:13.499
cmoclo66l001a1w8sk4reskvb	cmocl0xwk00041w8skllixjad	financial analysis	2026-05-04 07:00:00	2026-05-04 09:00:00	dict	tough	0	2026-04-24 07:39:39.981
cmocm5clw002h1w8sypv333ub	cmocm26ej001b1w8syavkdvtc	jnkjn	2026-04-24 08:00:00	2026-04-24 08:05:00	dict	fasf	0	2026-04-24 07:53:01.461
cmp1zbcw4000zme1wfou82gz2	cmp171iiu00005ckaazxybh61	General Session	2026-05-12 01:55:00	2026-05-13 01:55:00	\N	Bryll Yu	0	2026-05-12 01:55:51.172
\.


--
-- Data for Name: event_staff; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.event_staff (id, event_id, user_id, user_name, user_email, role, notes, assigned_at, assigned_by) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.events (id, program_id, title, description, venue, latitude, longitude, delivery_mode, online_link, status, max_participants, registration_deadline, start_date, end_date, target_sector, target_region, requires_tna, organizer_id, program_manager_id, cover_image_url, training_type, partner_institution, background, objectives, learning_outcomes, methodology, monitoring_plan, proposal_status, proposal_submitted_at, proposal_reviewed_by_id, proposal_approved_by_id, proposal_reviewed_at, proposal_approved_at, proposal_rejection_note, created_at, updated_at, assigned_organizer_id, assigned_organizer_name, approved_proposal_url, event_type, expected_outputs) FROM stdin;
cmo4ff7a90000sq0j3py5r6zc	\N	E2E Test: MSME Digital Marketing Training	End-to-end test training program for MSMEs on digital marketing strategies	DTI Region VII Conference Hall, Cebu City	\N	\N	FACE_TO_FACE	\N	COMPLETED	50	\N	2026-04-25 09:00:00	2026-04-25 17:00:00	MSMEs	Region VII	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	\N	This training aims to capacitate MSMEs in the Central Visayas region on leveraging digital marketing tools and platforms to expand their market reach.	1. Introduce digital marketing fundamentals\n2. Teach social media marketing strategies\n3. Demonstrate e-commerce platforms	Participants will be able to create and manage social media business pages, run basic ad campaigns, and list products on e-commerce platforms.	Lecture-discussion, hands-on workshop, group activities	Post-training CSF, 3-month impact assessment	APPROVED	2026-04-18 14:22:34.587	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-18 14:22:34.62	2026-04-18 14:22:34.651	\N	2026-04-18 14:22:34.366	2026-04-18 14:22:35.15	9dcf607d-8d76-43c5-a486-db6b10eb99a0	Facilitator Staff	\N	TRAINING	\N
cmocm26ej001b1w8syavkdvtc	\N	idd mtg	dasdasdas	dsadsad	\N	\N	FACE_TO_FACE	\N	COMPLETED	20	2026-04-24 07:55:00	2026-04-24 08:00:00	2026-04-24 08:30:00	dasd	cebu	t	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	\N	ENTREPRENEURIAL	dsadsad	ok	hey	hi	no	csf	APPROVED	2026-04-24 07:50:35.677	\N	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	2026-04-24 07:50:37.614	\N	2026-04-24 07:50:33.449	2026-04-24 08:05:10.478	\N	\N	\N	TRAINING	\N
cmo4djivv00008ytwvg5kp95a	\N	Negosyo Hack	Test	DTI Region 7 Office	\N	\N	FACE_TO_FACE	\N	COMPLETED	50	2026-04-25 10:00:00	2026-04-27 01:00:00	2026-04-27 09:00:00	MSMEs	Cebu	f	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	DICT7	Background	Objectives	Learnings	Methodology	Monitor	APPROVED	2026-04-18 13:31:01.364	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	a8e05505-c1ba-4e2f-aa7b-c3be984c7d1e	2026-04-18 13:31:53.82	2026-04-18 13:32:57.098	\N	2026-04-18 13:29:56.824	2026-04-18 14:06:12.615	9dcf607d-8d76-43c5-a486-db6b10eb99a0	\N	\N	TRAINING	\N
cmp171iiu00005ckaazxybh61	\N	Test Training	Training Test	DTI Region 7	\N	\N	FACE_TO_FACE	\N	COMPLETED	100	2026-05-15 10:00:00	2026-05-18 01:00:00	2026-05-19 09:00:00	MSMEs	Region 7	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	DICT	Test	Test	Test	Test	Test	APPROVED	2026-05-12 01:31:29.585	\N	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	2026-05-12 01:36:58.53	\N	2026-05-11 12:44:22.655	2026-05-12 01:58:44.733	\N	\N	\N	TRAINING	\N
cmocl0xwk00041w8skllixjad	\N	CVIF CapDev: Financial Analysis	Capacitate proponents 	DICT-7	\N	\N	FACE_TO_FACE	\N	COMPLETED	30	2026-04-30 14:00:00	2026-05-04 07:00:00	2026-05-04 09:20:00	LGU	Cebu	t	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	\N	INTER_AGENCY	DICT	\N	\N	\N	\N	\N	APPROVED	2026-04-24 07:21:42.496	\N	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	2026-04-24 07:21:44.354	\N	2026-04-24 07:21:36.164	2026-05-12 01:36:20.282	9dcf607d-8d76-43c5-a486-db6b10eb99a0	Facilitator DTI7	\N	TRAINING	\N
cmo4ffqxm0017sq0jpfl3sswp	\N	E2E Test: MSME Digital Marketing Training	End-to-end test training program for MSMEs on digital marketing strategies	DTI Region VII Conference Hall, Cebu City	\N	\N	FACE_TO_FACE	\N	COMPLETED	50	\N	2026-04-25 09:00:00	2026-04-25 17:00:00	MSMEs	Region VII	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	\N	This training aims to capacitate MSMEs in the Central Visayas region on leveraging digital marketing tools and platforms to expand their market reach.	1. Introduce digital marketing fundamentals\n2. Teach social media marketing strategies\n3. Demonstrate e-commerce platforms	Participants will be able to create and manage social media business pages, run basic ad campaigns, and list products on e-commerce platforms.	Lecture-discussion, hands-on workshop, group activities	Post-training CSF, 3-month impact assessment	APPROVED	2026-04-18 14:23:00.042	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-18 14:23:00.075	2026-04-18 14:23:00.103	\N	2026-04-18 14:22:59.863	2026-04-18 14:23:00.585	9dcf607d-8d76-43c5-a486-db6b10eb99a0	Facilitator Staff	\N	TRAINING	\N
cmo4fm7tl000013i65nq60ql9	\N	E2E Test: MSME Digital Marketing Training	End-to-end test training program for MSMEs on digital marketing strategies	DTI Region VII Conference Hall, Cebu City	\N	\N	FACE_TO_FACE	\N	COMPLETED	50	\N	2026-04-25 09:00:00	2026-04-25 17:00:00	MSMEs	Region VII	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	\N	This training aims to capacitate MSMEs in the Central Visayas region on leveraging digital marketing tools and platforms to expand their market reach.	1. Introduce digital marketing fundamentals\n2. Teach social media marketing strategies\n3. Demonstrate e-commerce platforms	Participants will be able to create and manage social media business pages, run basic ad campaigns, and list products on e-commerce platforms.	Lecture-discussion, hands-on workshop, group activities	Post-training CSF, 3-month impact assessment	APPROVED	2026-04-18 14:28:01.884	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-18 14:28:01.92	2026-04-18 14:28:01.951	\N	2026-04-18 14:28:01.676	2026-04-18 14:28:02.457	9dcf607d-8d76-43c5-a486-db6b10eb99a0	Facilitator Staff	\N	TRAINING	\N
cmo555f9x005zbf0853edgeal	\N	E-Commerce Masterclass for MSMEs	Hands-on training for micro, small, and medium enterprises on setting up and managing online stores across major Philippine e-commerce platforms.	Cebu IT Park, Cebu City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-01 23:59:59	2026-05-03 09:00:00	2026-05-03 17:00:00	MSMEs	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	\N	Hands-on training for micro, small, and medium enterprises on setting up and managing online stores across major Philippine e-commerce platforms.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:22:48.303	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:22:48.328	2026-04-19 02:22:48.354	\N	2026-04-19 02:22:48.21	2026-04-19 02:22:51.402	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmp2nze95000090fgumpv8scg	\N	Test 10	Test	DTI Region 7 Conf Room	\N	\N	FACE_TO_FACE	\N	DRAFT	50	2026-05-15 13:26:00	2026-05-25 13:25:00	2026-05-27 13:26:00	MSME	\N	f	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	\N	BUSINESS	DOST	test	test	test	test	test	APPROVED	2026-05-12 13:27:33.518	e4d48cc5-a05b-425c-9c89-57e4232c6db2	e4d48cc5-a05b-425c-9c89-57e4232c6db2	2026-05-12 13:27:51.146	2026-05-12 13:27:59.711	\N	2026-05-12 13:26:23.464	2026-05-12 13:27:59.712	\N	\N	\N	TRAINING	\N
cmo55815b0000100gwzv2dbyo	\N	E-Commerce Masterclass for MSMEs	Hands-on training for micro, small, and medium enterprises on setting up and managing online stores across major Philippine e-commerce platforms.	Cebu IT Park, Cebu City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-01 23:59:59	2026-05-03 09:00:00	2026-05-03 17:00:00	MSMEs	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	\N	Hands-on training for micro, small, and medium enterprises on setting up and managing online stores across major Philippine e-commerce platforms.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:24:49.984	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:24:50.016	2026-04-19 02:24:50.052	\N	2026-04-19 02:24:49.871	2026-04-19 02:24:54.184	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo553x4p0000bf08wscm80zn	\N	E-Commerce Masterclass for MSMEs	Hands-on training for micro, small, and medium enterprises on setting up and managing online stores across major Philippine e-commerce platforms.	Cebu IT Park, Cebu City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-01 23:59:59	2026-05-03 09:00:00	2026-05-03 17:00:00	MSMEs	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	BUSINESS	\N	Hands-on training for micro, small, and medium enterprises on setting up and managing online stores across major Philippine e-commerce platforms.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:21:38.154	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:21:38.181	2026-04-19 02:21:38.206	\N	2026-04-19 02:21:38.018	2026-04-19 02:21:38.357	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo555ipb00iibf08ubpwnt83	\N	Negosyo Center Services Orientation	Orientation for stakeholders on the services available at DTI Negosyo Centers across Region VII, including business name registration, counseling, and mentoring.	DTI Negosyo Center, Mandaue City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-04 23:59:59	2026-05-06 09:00:00	2026-05-06 17:00:00	Startups	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	ENTREPRENEURIAL	\N	Orientation for stakeholders on the services available at DTI Negosyo Centers across Region VII, including business name registration, counseling, and mentoring.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:22:52.741	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:22:52.767	2026-04-19 02:22:52.793	\N	2026-04-19 02:22:52.656	2026-04-19 02:22:52.935	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo553xi40017bf08k1kzzfep	\N	Negosyo Center Services Orientation	Orientation for stakeholders on the services available at DTI Negosyo Centers across Region VII, including business name registration, counseling, and mentoring.	DTI Negosyo Center, Mandaue City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-04 23:59:59	2026-05-06 09:00:00	2026-05-06 17:00:00	Startups	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	ENTREPRENEURIAL	\N	Orientation for stakeholders on the services available at DTI Negosyo Centers across Region VII, including business name registration, counseling, and mentoring.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:21:38.609	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:21:38.635	2026-04-19 02:21:38.66	\N	2026-04-19 02:21:38.525	2026-04-19 02:21:38.805	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo553xts002ebf0899aueskl	\N	Consumer Rights and Protection Seminar	Public seminar on consumer rights under the Consumer Act of the Philippines, product standards, and how to file consumer complaints.	Waterfront Cebu City Hotel	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-07 23:59:59	2026-05-09 09:00:00	2026-05-09 17:00:00	Consumers	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	ORGANIZATIONAL	\N	Public seminar on consumer rights under the Consumer Act of the Philippines, product standards, and how to file consumer complaints.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:21:39.031	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:21:39.056	2026-04-19 02:21:39.082	\N	2026-04-19 02:21:38.945	2026-04-19 02:21:39.22	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo553y50003lbf08v5q5dlpc	\N	Export Readiness Training Program	Comprehensive training to prepare Cebuano enterprises for international trade, covering export documentation, compliance, and market access.	Mactan Export Processing Zone Conference Hall	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-10 23:59:59	2026-05-12 09:00:00	2026-05-12 17:00:00	Exporters	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	MANAGERIAL	\N	Comprehensive training to prepare Cebuano enterprises for international trade, covering export documentation, compliance, and market access.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:21:39.431	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:21:39.455	2026-04-19 02:21:39.48	\N	2026-04-19 02:21:39.348	2026-04-19 02:21:39.635	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo553yh0004sbf08bn61lcqs	\N	One Town, One Product (OTOP) Hub Workshop	Workshop for local artisans and producers to develop product lines, branding, and packaging for the OTOP program.	Bohol Cultural Center, Tagbilaran City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-13 23:59:59	2026-05-15 09:00:00	2026-05-15 17:00:00	Artisans	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	INTER_AGENCY	\N	Workshop for local artisans and producers to develop product lines, branding, and packaging for the OTOP program.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:21:39.855	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:21:39.88	2026-04-19 02:21:39.904	\N	2026-04-19 02:21:39.78	2026-04-19 02:21:40.029	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo555j0n00jpbf08zx94o2jr	\N	Consumer Rights and Protection Seminar	Public seminar on consumer rights under the Consumer Act of the Philippines, product standards, and how to file consumer complaints.	Waterfront Cebu City Hotel	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-07 23:59:59	2026-05-09 09:00:00	2026-05-09 17:00:00	Consumers	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	ORGANIZATIONAL	\N	Public seminar on consumer rights under the Consumer Act of the Philippines, product standards, and how to file consumer complaints.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:22:53.147	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:22:53.175	2026-04-19 02:22:53.206	\N	2026-04-19 02:22:53.063	2026-04-19 02:22:55.116	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo5585r700g1100gkoseur2n	\N	Negosyo Center Services Orientation	Orientation for stakeholders on the services available at DTI Negosyo Centers across Region VII, including business name registration, counseling, and mentoring.	DTI Negosyo Center, Mandaue City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-04 23:59:59	2026-05-06 09:00:00	2026-05-06 17:00:00	Startups	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	ENTREPRENEURIAL	\N	Orientation for stakeholders on the services available at DTI Negosyo Centers across Region VII, including business name registration, counseling, and mentoring.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:24:55.941	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:24:55.966	2026-04-19 02:24:55.991	\N	2026-04-19 02:24:55.844	2026-04-19 02:25:00.059	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo558a7c00vt100gkftjgmsa	\N	Consumer Rights and Protection Seminar	Public seminar on consumer rights under the Consumer Act of the Philippines, product standards, and how to file consumer complaints.	Waterfront Cebu City Hotel	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-07 23:59:59	2026-05-09 09:00:00	2026-05-09 17:00:00	Consumers	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	ORGANIZATIONAL	\N	Public seminar on consumer rights under the Consumer Act of the Philippines, product standards, and how to file consumer complaints.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:25:01.692	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:25:01.718	2026-04-19 02:25:01.744	\N	2026-04-19 02:25:01.608	2026-04-19 02:25:05.809	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo558eoo01cc100g1zgfdf9a	\N	Export Readiness Training Program	Comprehensive training to prepare Cebuano enterprises for international trade, covering export documentation, compliance, and market access.	Mactan Export Processing Zone Conference Hall	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-10 23:59:59	2026-05-12 09:00:00	2026-05-12 17:00:00	Exporters	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	MANAGERIAL	\N	Comprehensive training to prepare Cebuano enterprises for international trade, covering export documentation, compliance, and market access.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:25:07.499	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:25:07.525	2026-04-19 02:25:07.552	\N	2026-04-19 02:25:07.416	2026-04-19 02:25:11.601	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
cmo558j7801sa100gb8g19tm3	\N	One Town, One Product (OTOP) Hub Workshop	Workshop for local artisans and producers to develop product lines, branding, and packaging for the OTOP program.	Bohol Cultural Center, Tagbilaran City	\N	\N	FACE_TO_FACE	\N	COMPLETED	60	2026-05-13 23:59:59	2026-05-15 09:00:00	2026-05-15 17:00:00	Artisans	Region VII - Central Visayas	t	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	\N	INTER_AGENCY	\N	Workshop for local artisans and producers to develop product lines, branding, and packaging for the OTOP program.	1. Equip participants with practical knowledge\n2. Provide hands-on experience\n3. Build capacity for growth	Participants will gain practical skills and knowledge applicable to their respective sectors.	Lecture-discussion, workshops, hands-on activities, group exercises	Post-training CSF evaluation, 6-month impact assessment	APPROVED	2026-04-19 02:25:13.354	bdbe629a-bfc8-4d15-a2af-acefce96c0c5	00b78187-3858-4bea-ba8f-b415e3aa3e34	2026-04-19 02:25:13.379	2026-04-19 02:25:13.405	\N	2026-04-19 02:25:13.268	2026-04-19 02:25:17.548	9dcf607d-8d76-43c5-a486-db6b10eb99a0	DTI Facilitator	\N	TRAINING	\N
\.


--
-- Data for Name: impact_survey_responses; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.impact_survey_responses (id, participation_id, event_id, user_id, status, scheduled_at, dispatched_at, knowledge_application, skill_improvement, business_impact, revenue_change, employee_growth, success_story, challenges_faced, additional_support, revenue_change_pct, employee_count_before, employee_count_after, submitted_at, expires_at, created_at) FROM stdin;
cmo4ffskh002psq0jekb7uy5e	cmo4ffr8g002dsq0jkn6nkvlb	cmo4ffqxm0017sq0jpfl3sswp	cmo4ffqox001rh97sicpq93hx	SUBMITTED	2026-04-18 14:23:01.985	\N	4	5	4	3	3	After the training, I created a Facebook business page that attracted 200+ followers in the first month.	Limited internet connectivity in our area.	Need follow-up training on e-commerce platforms.	\N	\N	\N	2026-04-18 14:23:01.985	\N	2026-04-18 14:23:01.986
cmo4fm9je001k13i618lpa57o	cmo4fm85h001613i6frvlogxd	cmo4fm7tl000013i65nq60ql9	cmo4fm7ho002mh97swd7ejic0	SUBMITTED	2026-04-18 14:28:03.914	\N	4	5	4	3	3	After the training, I created a Facebook business page that attracted 200+ followers in the first month.	Limited internet connectivity in our area.	Need follow-up training on e-commerce platforms.	\N	\N	\N	2026-04-18 14:28:03.914	\N	2026-04-18 14:28:03.915
\.


--
-- Data for Name: par_beneficiary_groups; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.par_beneficiary_groups (id, report_id, sector_group, male_count, female_count, senior_citizen_count, pwd_count, edt_level, actual_count) FROM stdin;
cmp1zvr36001dme1wg40kaihx	cmp1zvr36001cme1wdafyu7j8	Information Technology & BPO	1	0	0	0		1
cmp2bkmqz0000yulztityfxmk	cmocjnftf00011w8sipg66r89	Information Technology & BPO	7	0	1	0		7
cmp2bkmqz0001yulza50sgkbx	cmocjnftf00011w8sipg66r89	Agriculture & Fishery	0	7	2	2		7
cmp2bkmr00002yulzmykh44r6	cmocjnftf00011w8sipg66r89	Retail & Wholesale Trade	6	0	1	0		6
cmp2bkmr00003yulz36b5aadq	cmocjnftf00011w8sipg66r89	Services	0	6	1	0		6
cmp2bkmr00004yulz5cn61n4x	cmocjnftf00011w8sipg66r89	Construction & Real Estate	6	0	2	0		6
cmp2bkmr00005yulzso9vmx4f	cmocjnftf00011w8sipg66r89	Manufacturing	0	6	1	1		6
cmp2bkmr00006yulzkretvim3	cmocjnftf00011w8sipg66r89	Food Processing	6	0	1	0		6
cmp2bkmr00007yulzifmht8b1	cmocjnftf00011w8sipg66r89	Tourism & Hospitality	0	6	1	0		6
\.


--
-- Data for Name: post_activity_reports; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.post_activity_reports (id, event_id, title, date_conducted, venue, highlights_outcomes, fund_utilization_notes, csf_assessment_observations, improvement_opportunities, status, prepared_by_id, reviewed_by_id, approved_by_id, date_prepared, date_reviewed, date_approved, created_at, updated_at) FROM stdin;
cmp1zvr36001cme1wdafyu7j8	cmp171iiu00005ckaazxybh61	Test Training	5/18/2026 - 5/19/2026	DTI Region 7	test	test	test	test	DRAFT	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	\N	2026-05-12 02:11:42.69	\N	\N	2026-05-12 02:11:42.691	2026-05-12 02:11:42.691
cmocjnftf00011w8sipg66r89	cmo558j7801sa100gb8g19tm3	One Town, One Product (OTOP) Hub Workshop	5/15/2026 - 5/16/2026	Bohol Cultural Center, Tagbilaran City	dasdasd	asdasd	dasdas	asdasd	UNDER_REVIEW	9cff5efd-7267-4c17-92f3-42c5741c619e	e4d48cc5-a05b-425c-9c89-57e4232c6db2	\N	2026-05-12 07:38:59.216	2026-04-24 06:43:11.892	\N	2026-04-24 06:43:06.579	2026-05-12 07:38:59.217
\.


--
-- Data for Name: pre_proposal_tnas; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.pre_proposal_tnas (id, title, sector, target_region, description, status, conducted_by, conducted_by_name, conducted_at, summary, recommended_topics, linked_event_id, created_at, updated_at, score_business_relevance, score_demand_msmes, score_performance_gap, score_skill_deficiency, score_urgency, screen_q1, screen_q2, screen_q3, screen_q4, screen_q5) FROM stdin;
cmp172boy00015cka3vsza690	Training Needs Survey	MSMEs	Region 7	Test	DRAFT	9cff5efd-7267-4c17-92f3-42c5741c619e	\N	2026-05-13 00:00:00	Test	Test	cmp171iiu00005ckaazxybh61	2026-05-11 12:45:00.467	2026-05-12 00:49:46.977	5	4	4	4	3	t	t	f	f	f
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.programs (id, title, description, sector, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proposal_attachments; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.proposal_attachments (id, event_id, file_name, file_url, file_size, mime_type, description, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- Data for Name: tna_respondents; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.tna_respondents (id, tna_id, respondent_type, name, organization, sector, region, need_knowledge, need_skills, need_attitude, preferred_topics, preferred_mode, preferred_schedule, current_challenges, additional_needs, created_at) FROM stdin;
\.


--
-- Data for Name: tna_responses; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.tna_responses (id, participation_id, user_id, knowledge_score, skill_score, motivation_score, composite_score, recommended_track, responses, submitted_at) FROM stdin;
cmo4ffra9002fsq0j6hcz9dfs	cmo4ffr8g002dsq0jkn6nkvlb	cmo4ffqox001rh97sicpq93hx	65.00	50.00	80.00	62.75	INTERMEDIATE	{"q1": "Need to learn social media marketing", "q2": "Currently using traditional marketing only"}	2026-04-18 14:23:00.321
cmo4fm87b001813i6attr87x8	cmo4fm85h001613i6frvlogxd	cmo4fm7ho002mh97swd7ejic0	65.00	50.00	80.00	62.75	INTERMEDIATE	{"q1": "Need to learn social media marketing", "q2": "Currently using traditional marketing only"}	2026-04-18 14:28:02.183
cmo555fiu0079bf08oa9bjqxk	cmo555fhj0077bf08062yinal	cmo554yt5000lex7qyixte2cl	83.00	64.00	95.00	78.40	INTERMEDIATE	{}	2026-04-19 02:22:48.534
cmo555fk1007dbf08i0fydpey	cmo555fj9007bbf0828kybt32	cmo554yz1000qex7qdvbqy248	90.00	90.00	61.00	82.75	ADVANCED	{}	2026-04-19 02:22:48.577
cmo555fl5007hbf08hrzfriir	cmo555fkc007fbf08etphgmfy	cmo554z4j000vex7q1oq94pkd	96.00	71.00	88.00	84.00	ADVANCED	{}	2026-04-19 02:22:48.617
cmo555fm8007lbf08is4ic7gd	cmo555fli007jbf082suvf5qw	cmo554z9c0010ex7qbkmvrue1	66.00	80.00	63.00	70.85	INTERMEDIATE	{}	2026-04-19 02:22:48.656
cmo555fnd007pbf08c3opvoug	cmo555fml007nbf08wz432486	cmo554ze40015ex7qrrqry2yx	87.00	80.00	87.00	84.20	ADVANCED	{}	2026-04-19 02:22:48.697
cmo555foi007tbf087inki6ym	cmo555fnq007rbf088e2kkabk	cmo554ziy001aex7q91ump9i0	90.00	76.00	92.00	84.90	ADVANCED	{}	2026-04-19 02:22:48.738
cmo555fq5007xbf08k5cgd2hb	cmo555fot007vbf08kupc7ncp	cmo554zns001fex7qey84l5wj	95.00	70.00	63.00	77.00	INTERMEDIATE	{}	2026-04-19 02:22:48.796
cmo555frh0081bf08q7ocsm6e	cmo555fqi007zbf08lrruk7l6	cmo554zsp001kex7qyvjggvkt	75.00	84.00	79.00	79.60	INTERMEDIATE	{}	2026-04-19 02:22:48.845
cmo555fso0085bf08clzyfgvb	cmo555fru0083bf08cyckm2ol	cmo554zxn001pex7q0qm5ql5z	95.00	82.00	94.00	89.55	ADVANCED	{}	2026-04-19 02:22:48.888
cmo555ftv0089bf08vcz2ow49	cmo555ft30087bf08t0jnaqaz	cmo55502n001uex7q1xhmm0u6	74.00	74.00	96.00	79.50	INTERMEDIATE	{}	2026-04-19 02:22:48.931
cmo555fuz008dbf08sse3rd7s	cmo555fu9008bbf08jh0vr1kb	cmo55507n001zex7qhbbrvrpf	92.00	96.00	63.00	86.35	ADVANCED	{}	2026-04-19 02:22:48.971
cmo555fw2008hbf08orit522c	cmo555fvb008fbf082p7vbkaj	cmo5550cw0024ex7qhuaaneof	85.00	89.00	82.00	85.85	ADVANCED	{}	2026-04-19 02:22:49.011
cmo555fx5008lbf08wbit5xo4	cmo555fwe008jbf08a6e1h8r1	cmo5550hc0029ex7qrnpv4kdm	93.00	87.00	78.00	86.85	ADVANCED	{}	2026-04-19 02:22:49.049
cmo555fya008pbf08juwenhrz	cmo555fxk008nbf08rkpchl5s	cmo5550m4002eex7q9usd5an7	65.00	79.00	73.00	72.60	INTERMEDIATE	{}	2026-04-19 02:22:49.09
cmo555fze008tbf083efjqjhe	cmo555fym008rbf080sgey834	cmo5550r1002jex7q7pf6lcna	90.00	91.00	70.00	85.40	ADVANCED	{}	2026-04-19 02:22:49.13
cmo555g0g008xbf08zeowqn0t	cmo555fzp008vbf085djtyarf	cmo5550vv002oex7q340uf20w	82.00	83.00	60.00	76.90	INTERMEDIATE	{}	2026-04-19 02:22:49.168
cmo555g1i0091bf08l60z2txh	cmo555g0t008zbf088kjde1vx	cmo55510n002tex7qkprywdc5	84.00	94.00	60.00	82.00	ADVANCED	{}	2026-04-19 02:22:49.206
cmo555g2m0095bf08rq2htv70	cmo555g1u0093bf083os1gbbz	cmo55515h002yex7qu97zuqp5	82.00	65.00	62.00	70.20	INTERMEDIATE	{}	2026-04-19 02:22:49.246
cmo555g3n0099bf089hvg63ab	cmo555g2x0097bf08vr1e847m	cmo5551a80033ex7q7a9ae4pb	84.00	62.00	73.00	72.45	INTERMEDIATE	{}	2026-04-19 02:22:49.283
cmo555g4q009dbf0879gjv8u0	cmo555g40009bbf08zxs1d22a	cmo5551f00038ex7q3bdiw464	96.00	90.00	92.00	92.60	ADVANCED	{}	2026-04-19 02:22:49.322
cmo555g5t009hbf08pdmugu64	cmo555g53009fbf08unc2oh4w	cmo5551ju003dex7qw677xuzp	88.00	71.00	75.00	77.95	INTERMEDIATE	{}	2026-04-19 02:22:49.361
cmo555g6x009lbf08vrrlzt8n	cmo555g65009jbf08tb5vo4n0	cmo5551op003iex7q64q5e9jh	74.00	66.00	80.00	72.30	INTERMEDIATE	{}	2026-04-19 02:22:49.401
cmo555g80009pbf083b25omwz	cmo555g79009nbf08zs0gjt0z	cmo5551ti003nex7qtz7hv881	71.00	64.00	77.00	69.70	INTERMEDIATE	{}	2026-04-19 02:22:49.441
cmo555g93009tbf080y8yueay	cmo555g8c009rbf08qzc4kk18	cmo5551yd003sex7quaibpbrx	66.00	70.00	67.00	67.85	INTERMEDIATE	{}	2026-04-19 02:22:49.479
cmo555ga8009xbf082h8hf3mc	cmo555g9h009vbf08vunga1vd	cmo555238003xex7qaeka0et6	98.00	67.00	78.00	80.60	ADVANCED	{}	2026-04-19 02:22:49.52
cmo555gbc00a1bf087mxz6j80	cmo555gak009zbf08xmagg0zz	cmo5552810042ex7qd4vnbvys	73.00	96.00	74.00	82.45	ADVANCED	{}	2026-04-19 02:22:49.559
cmo555gcd00a5bf08w8ufgjdh	cmo555gbn00a3bf08ho0rbkup	cmo5552cu0047ex7q66xj61no	73.00	76.00	72.00	73.95	INTERMEDIATE	{}	2026-04-19 02:22:49.597
cmo555gdg00a9bf08cdf4twd1	cmo555gcp00a7bf083lyprtsw	cmo5552hr004cex7q9922plh9	81.00	97.00	79.00	86.90	ADVANCED	{}	2026-04-19 02:22:49.636
cmo555gek00adbf08gnl6hfz7	cmo555gdt00abbf08jebdktph	cmo5552mm004hex7qqkfp5zh2	93.00	78.00	67.00	80.50	ADVANCED	{}	2026-04-19 02:22:49.676
cmo555gfn00ahbf085f9ijozc	cmo555gev00afbf08dx597ymk	cmo5552rp004mex7qcfys3rdj	90.00	99.00	61.00	86.35	ADVANCED	{}	2026-04-19 02:22:49.715
cmo555ggr00albf08arvk5wr9	cmo555gg000ajbf085dkibndd	cmo5552wj004rex7qp77yh9hd	60.00	61.00	69.00	62.65	INTERMEDIATE	{}	2026-04-19 02:22:49.755
cmo555ghu00apbf08vx7e02wl	cmo555gh300anbf08dwtbykda	cmo55531g004wex7qlbpost8b	88.00	70.00	94.00	82.30	ADVANCED	{}	2026-04-19 02:22:49.794
cmo555gix00atbf08p3euujje	cmo555gi600arbf08666y1ss9	cmo55536b0051ex7qx1hup7wg	60.00	81.00	89.00	75.65	INTERMEDIATE	{}	2026-04-19 02:22:49.833
cmo555gk200axbf08g0rnhsym	cmo555gjb00avbf08bz6m8hav	cmo5553b50056ex7qp47mnbao	67.00	98.00	77.00	81.90	ADVANCED	{}	2026-04-19 02:22:49.874
cmo555gl300b1bf08ydpd8t9j	cmo555gkd00azbf08wkg0jy4g	cmo5553fx005bex7q3f5j2z8p	90.00	78.00	66.00	79.20	INTERMEDIATE	{}	2026-04-19 02:22:49.911
cmo555gm400b5bf08rfdcum1m	cmo555gld00b3bf08bcld1004	cmo5553kr005gex7qcilsbk1s	89.00	75.00	99.00	85.90	ADVANCED	{}	2026-04-19 02:22:49.948
cmo555gn800b9bf08d1l6hcne	cmo555gmg00b7bf08bgbt2u31	cmo5553pq005lex7qro9des1m	78.00	90.00	96.00	87.30	ADVANCED	{}	2026-04-19 02:22:49.988
cmo555j8a00kzbf08lbpeesar	cmo555j7l00kxbf082905e1zj	cmo5556yj005tex7qalnw8g2m	83.00	61.00	61.00	68.70	INTERMEDIATE	{}	2026-04-19 02:22:53.338
cmo555j9900l3bf08lpf3gnhy	cmo555j8k00l1bf08a7nop0ra	cmo55573d005yex7qcmbl9alc	65.00	79.00	93.00	77.60	INTERMEDIATE	{}	2026-04-19 02:22:53.374
cmo555jab00l7bf08shco93s3	cmo555j9l00l5bf08hzymv07p	cmo5557860063ex7q8znd7swt	60.00	84.00	66.00	71.10	INTERMEDIATE	{}	2026-04-19 02:22:53.411
cmo555jbd00lbbf086mcngknp	cmo555jal00l9bf08d3udp5p8	cmo5557cz0068ex7qqijcd7r1	74.00	69.00	92.00	76.50	INTERMEDIATE	{}	2026-04-19 02:22:53.45
cmo555jch00lfbf08li2f7hf3	cmo555jbq00ldbf08e6iozfu4	cmo5557hs006dex7qlfv0x2ws	87.00	67.00	90.00	79.75	INTERMEDIATE	{}	2026-04-19 02:22:53.489
cmo555jdk00ljbf08jt5xqrmm	cmo555jct00lhbf089o7ru14j	cmo5557mk006iex7qrgldfsi8	66.00	79.00	83.00	75.45	INTERMEDIATE	{}	2026-04-19 02:22:53.528
cmo555jeo00lnbf08xho28rqm	cmo555jdw00llbf08e8rlx6nh	cmo5557rc006nex7qeg93hl17	93.00	93.00	69.00	87.00	ADVANCED	{}	2026-04-19 02:22:53.568
cmo555jfq00lrbf08gxk7sf4s	cmo555jf000lpbf08ggb5cjzs	cmo5557w4006sex7qo2gkf7d5	60.00	88.00	85.00	77.45	INTERMEDIATE	{}	2026-04-19 02:22:53.606
cmo555jgt00lvbf08jn43n7ia	cmo555jg200ltbf08mjhud34d	cmo55580z006xex7qrbxe9oq0	84.00	99.00	73.00	87.25	ADVANCED	{}	2026-04-19 02:22:53.645
cmo555jhx00lzbf08ku2ikvul	cmo555jh500lxbf08h36hoq3t	cmo55585s0072ex7qqp4zao71	97.00	89.00	95.00	93.30	ADVANCED	{}	2026-04-19 02:22:53.685
cmo555jiy00m3bf08s8go5yzt	cmo555ji900m1bf08fvism68y	cmo5558as0077ex7q1m6e90ty	78.00	89.00	87.00	84.65	ADVANCED	{}	2026-04-19 02:22:53.723
cmo555jk200m7bf08lan74d87	cmo555jja00m5bf08fz0rz3b7	cmo5558fp007cex7qiku75o2h	73.00	84.00	83.00	79.90	INTERMEDIATE	{}	2026-04-19 02:22:53.762
cmo555jl300mbbf08atwe2o18	cmo555jkd00m9bf08745y7t9m	cmo5558kg007hex7qb8wk9tiy	94.00	81.00	71.00	83.05	ADVANCED	{}	2026-04-19 02:22:53.799
cmo555jm400mfbf08hlg24jbm	cmo555jle00mdbf0804j9cg56	cmo5558pa007mex7qxoleq3nw	63.00	75.00	79.00	71.80	INTERMEDIATE	{}	2026-04-19 02:22:53.836
cmo555jn600mjbf08js4fyque	cmo555jmg00mhbf085xybsgeo	cmo5558u5007rex7qygaz5dks	72.00	97.00	94.00	87.50	ADVANCED	{}	2026-04-19 02:22:53.875
cmo555joc00mnbf08evwjy156	cmo555jnh00mlbf08ttvknujd	cmo5558yx007wex7qf314tsay	60.00	98.00	73.00	78.45	INTERMEDIATE	{}	2026-04-19 02:22:53.916
cmo555jpc00mrbf08lcj33m61	cmo555jon00mpbf087y39yfhy	cmo55593p0081ex7q8hgfd37l	79.00	76.00	67.00	74.80	INTERMEDIATE	{}	2026-04-19 02:22:53.953
cmo555jqd00mvbf08fjo65plw	cmo555jpm00mtbf08pr8if51c	cmo55598i0086ex7qst477e0g	60.00	70.00	84.00	70.00	INTERMEDIATE	{}	2026-04-19 02:22:53.989
cmo555jrg00mzbf08uza0o8m3	cmo555jqq00mxbf08c59b02o7	cmo5559db008bex7q1kvszvoq	67.00	97.00	91.00	85.00	ADVANCED	{}	2026-04-19 02:22:54.029
cmo555jsi00n3bf08s6laxrta	cmo555jrs00n1bf08geninetu	cmo5559ia008gex7qdz79n4ky	75.00	86.00	91.00	83.40	ADVANCED	{}	2026-04-19 02:22:54.066
cmo555jtj00n7bf08ubsufev1	cmo555jst00n5bf08yjb5n2rm	cmo5559n5008lex7q85mcurd2	68.00	98.00	90.00	85.50	ADVANCED	{}	2026-04-19 02:22:54.104
cmo555jum00nbbf0837qilq3w	cmo555jtv00n9bf08ho0qnpd1	cmo5559ry008qex7qickw9mfw	89.00	96.00	75.00	88.30	ADVANCED	{}	2026-04-19 02:22:54.142
cmo555jvp00nfbf08vokq9eg2	cmo555jux00ndbf08ix175q9o	cmo5559ws008vex7qild8vb2g	71.00	62.00	86.00	71.15	INTERMEDIATE	{}	2026-04-19 02:22:54.181
cmo555jwt00njbf08k3snx3ri	cmo555jw300nhbf0855bslp9y	cmo555a1r0090ex7qb2tuchwh	84.00	97.00	89.00	90.45	ADVANCED	{}	2026-04-19 02:22:54.221
cmo5581ft001a100ghpdw594g	cmo5581ea0018100gygk39jop	cmo5571h1000b7b0kvbhjo2t5	62.00	92.00	85.00	79.75	INTERMEDIATE	{}	2026-04-19 02:24:50.25
cmo5581gw001e100g0yxkk9zl	cmo5581g5001c100g9291taw7	cmo5571o0000g7b0kq8y8ir80	67.00	87.00	62.00	73.75	INTERMEDIATE	{}	2026-04-19 02:24:50.288
cmo5581hz001i100gwq6y73lx	cmo5581h8001g100gv2japujl	cmo5571t5000l7b0kentb80n3	78.00	83.00	65.00	76.75	INTERMEDIATE	{}	2026-04-19 02:24:50.328
cmo5581j6001m100gdrr688kq	cmo5581id001k100gij4y27q7	cmo5571yb000q7b0kyr57hyi4	73.00	62.00	88.00	72.35	INTERMEDIATE	{}	2026-04-19 02:24:50.37
cmo5581ka001q100gcmx6bxvc	cmo5581ji001o100g69sjxolw	cmo55723c000v7b0kt9gamfyc	72.00	78.00	61.00	71.65	INTERMEDIATE	{}	2026-04-19 02:24:50.41
cmo5581lg001u100g2vbye0nt	cmo5581kp001s100gy3g1zmil	cmo55728g00107b0k2emi8bq4	64.00	85.00	62.00	71.90	INTERMEDIATE	{}	2026-04-19 02:24:50.452
cmo5581mi001y100ggrrbf5et	cmo5581lr001w100gvxb1acjc	cmo5572dk00157b0kdfa27lz9	63.00	69.00	80.00	69.65	INTERMEDIATE	{}	2026-04-19 02:24:50.49
cmo5581nj0022100g6ky6gwqy	cmo5581mt0020100gvrk6pxb2	cmo5572in001a7b0ksp15rne9	62.00	83.00	64.00	70.90	INTERMEDIATE	{}	2026-04-19 02:24:50.527
cmo5581ol0026100gjklmmnwi	cmo5581nu0024100gdr0ri3kt	cmo5572o0001f7b0k89tsu6xz	93.00	92.00	77.00	88.60	ADVANCED	{}	2026-04-19 02:24:50.566
cmo5581pq002a100g61nrajxt	cmo5581ox0028100gdt6yy7mu	cmo5572t9001k7b0k3kfmnby5	84.00	80.00	77.00	80.65	ADVANCED	{}	2026-04-19 02:24:50.606
cmo5581qu002e100gg8xlx3x9	cmo5581q2002c100ga4fhw9t2	cmo5572y2001p7b0knexk6yzp	91.00	82.00	81.00	84.90	ADVANCED	{}	2026-04-19 02:24:50.646
cmo5581rx002i100gkfpykljq	cmo5581r5002g100g0mk6h13k	cmo557334001u7b0kbzti09g6	91.00	74.00	88.00	83.45	ADVANCED	{}	2026-04-19 02:24:50.684
cmo5581t1002m100g90ga1t62	cmo5581s9002k100gytid3u5f	cmo55738r001z7b0kj4tatqp6	69.00	71.00	78.00	72.05	INTERMEDIATE	{}	2026-04-19 02:24:50.725
cmo5581u5002q100g4vsarw5p	cmo5581tc002o100gsno4k1mt	cmo5573dj00247b0k7ma9cuck	89.00	82.00	82.00	84.45	ADVANCED	{}	2026-04-19 02:24:50.765
cmo5581vb002u100gpu8mckat	cmo5581uh002s100getua5cmv	cmo5573il00297b0kyp5up33v	92.00	66.00	97.00	82.85	ADVANCED	{}	2026-04-19 02:24:50.806
cmo5581wg002y100g2tm3alfx	cmo5581vo002w100g5qb3tmh1	cmo5573no002e7b0kjcd13s63	75.00	72.00	82.00	75.55	INTERMEDIATE	{}	2026-04-19 02:24:50.848
cmo5581xk0032100gmlywyvfy	cmo5581ws0030100g0zcx8ctt	cmo5573su002j7b0kkq6dcegm	96.00	63.00	69.00	76.05	INTERMEDIATE	{}	2026-04-19 02:24:50.888
cmo5581yo0036100gsu1spqvy	cmo5581xv0034100gf77ma6y6	cmo5573xy002o7b0kvv0svdv4	79.00	86.00	76.00	81.05	ADVANCED	{}	2026-04-19 02:24:50.928
cmo5581zv003a100g0wvdz6ek	cmo5581z20038100g9fpftbqm	cmo557432002t7b0kqdzw4iem	64.00	88.00	78.00	77.10	INTERMEDIATE	{}	2026-04-19 02:24:50.971
cmo55820y003e100gkl2ofad9	cmo558207003c100g7vkly7uv	cmo55747z002y7b0kjz1fnu5l	84.00	83.00	62.00	78.10	INTERMEDIATE	{}	2026-04-19 02:24:51.01
cmo558222003i100gsuob8yf6	cmo55821a003g100gfhjri1fs	cmo5574d100337b0k8afjwtmw	72.00	81.00	66.00	74.10	INTERMEDIATE	{}	2026-04-19 02:24:51.05
cmo558238003m100gcsulm4wr	cmo55822g003k100gpfy4pyd3	cmo5574i100387b0kfvaid90s	97.00	99.00	61.00	88.80	ADVANCED	{}	2026-04-19 02:24:51.092
cmo55824e003q100gcvzlwlit	cmo55823l003o100grhuj8yq0	cmo5574ml003d7b0kmjtbuqrf	63.00	76.00	98.00	76.95	INTERMEDIATE	{}	2026-04-19 02:24:51.133
cmo55825j003u100gmewms8l8	cmo55824r003s100gpbe7yjiw	cmo5574rj003i7b0k5ydw3yif	87.00	70.00	72.00	76.45	INTERMEDIATE	{}	2026-04-19 02:24:51.175
cmo55826n003y100gm7fk1jah	cmo55825v003w100gr0ufhhzz	cmo5574wj003n7b0kbx2zukgw	81.00	85.00	96.00	86.35	ADVANCED	{}	2026-04-19 02:24:51.216
cmo55827t0042100glz61qp04	cmo5582710040100gsunqaf8k	cmo55751l003s7b0kegzjo4yy	74.00	77.00	60.00	71.70	INTERMEDIATE	{}	2026-04-19 02:24:51.257
cmo55828x0046100gq1pn3let	cmo5582850044100gdlaw97qp	cmo55756n003x7b0kgjzb3ett	81.00	84.00	79.00	81.70	ADVANCED	{}	2026-04-19 02:24:51.297
cmo5582a2004a100gw1xyhavb	cmo5582990048100g83xl6i50	cmo5575br00427b0kv8okh7mt	96.00	72.00	84.00	83.40	ADVANCED	{}	2026-04-19 02:24:51.338
cmo5582b8004e100gceghtsr4	cmo5582ad004c100g6uswrw72	cmo5575gu00477b0kdds9zlux	63.00	69.00	89.00	71.90	INTERMEDIATE	{}	2026-04-19 02:24:51.38
cmo5582cc004i100gqbyqzzxj	cmo5582bk004g100ggav24yps	cmo5575lx004c7b0khlyxsksq	78.00	80.00	65.00	75.55	INTERMEDIATE	{}	2026-04-19 02:24:51.42
cmo5582dg004m100gsqbjqpqq	cmo5582cp004k100gwmgr2c81	cmo5575r0004h7b0kyajvdogu	76.00	74.00	64.00	72.20	INTERMEDIATE	{}	2026-04-19 02:24:51.46
cmo5582ek004q100gp5pfsr6e	cmo5582ds004o100gfg6we2jr	cmo5575w8004m7b0ket3hahgg	95.00	67.00	77.00	79.30	INTERMEDIATE	{}	2026-04-19 02:24:51.5
cmo5582fo004u100gnajfic93	cmo5582ew004s100grvomo1d7	cmo557618004r7b0ky72og9g1	68.00	92.00	85.00	81.85	ADVANCED	{}	2026-04-19 02:24:51.54
cmo5582gs004y100gsy6lb56s	cmo5582g0004w100gxnjd6ev6	cmo55766a004w7b0kwqeixmek	64.00	61.00	71.00	64.55	INTERMEDIATE	{}	2026-04-19 02:24:51.58
cmo5582hy0052100ghc5cpm3o	cmo5582h60050100gr5owf3rs	cmo5576ba00517b0kuw8icfyf	62.00	83.00	60.00	69.90	INTERMEDIATE	{}	2026-04-19 02:24:51.622
cmo5582j10056100g1192j83r	cmo5582ia0054100gaujiejtb	cmo5576g800567b0k51959kbc	98.00	67.00	96.00	85.10	ADVANCED	{}	2026-04-19 02:24:51.661
cmo5582k5005a100gf3hfnhy5	cmo5582je0058100gpmqxj98a	cmo5576l9005b7b0koj92tvkz	70.00	91.00	95.00	84.65	ADVANCED	{}	2026-04-19 02:24:51.701
cmo5582lb005e100gkxxr7cwd	cmo5582kj005c100g5zvto7qv	cmo5576qa005g7b0kne60f97z	71.00	88.00	98.00	84.55	ADVANCED	{}	2026-04-19 02:24:51.743
cmo5582mg005i100gmbq1oqf2	cmo5582lo005g100g8lm8jloo	cmo5576vf005l7b0k17daxswb	63.00	61.00	66.00	62.95	INTERMEDIATE	{}	2026-04-19 02:24:51.784
cmo5582nl005m100gcoi4s1qu	cmo5582ms005k100g5ygbnp8k	cmo55770e005q7b0kojljgpyn	88.00	69.00	91.00	81.15	ADVANCED	{}	2026-04-19 02:24:51.825
cmo5582oq005q100gg40xjoys	cmo5582ny005o100g40vgx0q9	cmo55775f005v7b0kp059dzs8	75.00	84.00	95.00	83.60	ADVANCED	{}	2026-04-19 02:24:51.866
cmo5582pw005u100gbpomcgf5	cmo5582p3005s100gqervwapd	cmo5577ae00607b0klevd0zfm	79.00	80.00	77.00	78.90	INTERMEDIATE	{}	2026-04-19 02:24:51.908
cmo5582r1005y100g6834t8wk	cmo5582q9005w100gzf0xrnl0	cmo5577fg00657b0kdllzm67d	76.00	93.00	99.00	88.55	ADVANCED	{}	2026-04-19 02:24:51.95
cmo5582s70062100gqnbibnna	cmo5582re0060100gkr433x16	cmo5577ki006a7b0kolz2x63s	79.00	60.00	68.00	68.65	INTERMEDIATE	{}	2026-04-19 02:24:51.991
cmo5582tb0066100gjm1qgtze	cmo5582sj0064100g71g8pfiu	cmo5577po006f7b0ksfb43ija	69.00	93.00	93.00	84.60	ADVANCED	{}	2026-04-19 02:24:52.031
cmo5582ug006a100g508bukl2	cmo5582tp0068100gcgp4gr6s	cmo5577ur006k7b0kfacbbmvs	64.00	92.00	74.00	77.70	INTERMEDIATE	{}	2026-04-19 02:24:52.072
cmo5582vl006e100gfoqrzyb4	cmo5582us006c100gzslk9140	cmo5577zt006p7b0k9z0eskqe	93.00	75.00	91.00	85.30	ADVANCED	{}	2026-04-19 02:24:52.113
cmo5582ws006i100gtyx32yy7	cmo5582vz006g100g879pxom0	cmo55784y006u7b0kwklcko95	87.00	98.00	99.00	94.40	ADVANCED	{}	2026-04-19 02:24:52.156
cmo5582xx006m100gk4v6h364	cmo5582x5006k100gryb6a8f5	cmo5578a0006z7b0kmhakzq2j	60.00	84.00	83.00	75.35	INTERMEDIATE	{}	2026-04-19 02:24:52.197
cmo5582z2006q100gsa33jtnv	cmo5582ya006o100gquy8sumk	cmo5578f200747b0k5coxzwrn	89.00	70.00	64.00	75.15	INTERMEDIATE	{}	2026-04-19 02:24:52.238
cmo5585zf00hb100gqfnmd7gs	cmo5585yn00h9100gvyufdfez	cmo5578k700797b0kqu1qxb4n	85.00	64.00	67.00	72.10	INTERMEDIATE	{}	2026-04-19 02:24:56.139
cmo55860l00hf100gc702jwhp	cmo5585zt00hd100g9l4977wb	cmo5578p8007e7b0kgfjxbq0n	91.00	90.00	98.00	92.35	ADVANCED	{}	2026-04-19 02:24:56.181
cmo55861p00hj100gvjec5zg0	cmo55860x00hh100g59ns5ceu	cmo5578ud007j7b0k63etegp0	69.00	73.00	77.00	72.60	INTERMEDIATE	{}	2026-04-19 02:24:56.221
cmo55862u00hn100gdpw434gn	cmo55862200hl100g08b15ed9	cmo5578zi007o7b0kxmwvaz05	62.00	90.00	66.00	74.20	INTERMEDIATE	{}	2026-04-19 02:24:56.262
cmo55864000hr100geqj1bfwx	cmo55863900hp100g4y9cn2mb	cmo55794d007t7b0ki7masp1n	98.00	91.00	64.00	86.70	ADVANCED	{}	2026-04-19 02:24:56.304
cmo55865300hv100gu0easuws	cmo55864b00ht100gsx7g65xt	cmo55799e007y7b0ktg6p3sqa	91.00	88.00	65.00	83.30	ADVANCED	{}	2026-04-19 02:24:56.343
cmo55866500hz100gilzvqzu9	cmo55865e00hx100g52ajgw4e	cmo5579ei00837b0kiniospxb	96.00	67.00	88.00	82.40	ADVANCED	{}	2026-04-19 02:24:56.381
cmo55867900i3100gkbzu9ohk	cmo55866i00i1100gjrhwv2vs	cmo5579jk00887b0k636izhc1	87.00	76.00	77.00	80.10	ADVANCED	{}	2026-04-19 02:24:56.421
cmo55868d00i7100gsiz607hj	cmo55867l00i5100gfawx9w2d	cmo5579oh008d7b0ksb0n73x5	98.00	81.00	95.00	90.45	ADVANCED	{}	2026-04-19 02:24:56.461
cmo55869i00ib100gbehhv9oy	cmo55868q00i9100gv95ikcy2	cmo5579tg008i7b0k1kw4muf6	77.00	63.00	77.00	71.40	INTERMEDIATE	{}	2026-04-19 02:24:56.502
cmo5586am00if100ggnfnqpp8	cmo55869u00id100g5waugjc4	cmo5579yn008n7b0k7q7hq42b	96.00	60.00	87.00	79.35	INTERMEDIATE	{}	2026-04-19 02:24:56.542
cmo5586bo00ij100gsry35g5x	cmo5586ax00ih100gwdumcnhr	cmo557a3q008s7b0kura2pryz	66.00	60.00	91.00	69.85	INTERMEDIATE	{}	2026-04-19 02:24:56.581
cmo5586ct00in100gnwsuj9j3	cmo5586c100il100gzo7ehlj9	cmo557a8r008x7b0kumxiysoo	96.00	63.00	62.00	74.30	INTERMEDIATE	{}	2026-04-19 02:24:56.621
cmo5586dx00ir100gtn4kwqai	cmo5586d500ip100gp012cgg8	cmo557ads00927b0knmecarda	65.00	83.00	84.00	76.95	INTERMEDIATE	{}	2026-04-19 02:24:56.661
cmo5586f100iv100g4cl90ztl	cmo5586ea00it100gwy8aedwd	cmo557ais00977b0kx4e4gspx	72.00	93.00	94.00	85.90	ADVANCED	{}	2026-04-19 02:24:56.701
cmo5586g400iz100gcid3sjtp	cmo5586fd00ix100g533t8cow	cmo557anm009c7b0ki1jnb0li	60.00	78.00	91.00	74.95	INTERMEDIATE	{}	2026-04-19 02:24:56.74
cmo5586h600j3100g6esc5b50	cmo5586ge00j1100ge6mxbhsc	cmo557ask009h7b0k0o9bciu0	73.00	85.00	63.00	75.30	INTERMEDIATE	{}	2026-04-19 02:24:56.778
cmo5586ib00j7100gq4su1ebl	cmo5586hj00j5100gpd6a3ngv	cmo557ay3009m7b0kvf5e8dzf	70.00	65.00	85.00	71.75	INTERMEDIATE	{}	2026-04-19 02:24:56.819
cmo5586jd00jb100gcxjewrez	cmo5586im00j9100gcpjc03u1	cmo557b2q009r7b0ko262ufn9	75.00	97.00	94.00	88.55	ADVANCED	{}	2026-04-19 02:24:56.857
cmo5586kj00jf100gudfjwh38	cmo5586jr00jd100ggql43zcv	cmo557b7r009w7b0kbwfm7b3j	84.00	75.00	78.00	78.90	INTERMEDIATE	{}	2026-04-19 02:24:56.899
cmo5586lm00jj100gek6xds70	cmo5586kv00jh100ggd10xrxe	cmo557bcs00a17b0kr5nkw7r1	85.00	74.00	98.00	83.85	ADVANCED	{}	2026-04-19 02:24:56.938
cmo5586mq00jn100ga9np4ymf	cmo5586ly00jl100g6c7d8ebq	cmo557bhs00a67b0k0skmm3d3	98.00	61.00	79.00	78.45	INTERMEDIATE	{}	2026-04-19 02:24:56.978
cmo5586of00jr100gipqas4v3	cmo5586nm00jp100gp57wmvij	cmo557bmx00ab7b0kikcmojuy	95.00	87.00	98.00	92.55	ADVANCED	{}	2026-04-19 02:24:57.039
cmo5586pi00jv100g85fs7dp1	cmo5586oq00jt100gqoyof6aj	cmo557bs000ag7b0ka8y4wcev	84.00	80.00	87.00	83.15	ADVANCED	{}	2026-04-19 02:24:57.078
cmo5586qn00jz100girsm9e3w	cmo5586pv00jx100geil7tvqw	cmo557bwz00al7b0kgepa3vbg	91.00	76.00	70.00	79.75	INTERMEDIATE	{}	2026-04-19 02:24:57.119
cmo5586rs00k3100g5ds2zr3d	cmo5586qz00k1100gw8ndmef6	cmo557c2100aq7b0k71nd79qr	89.00	92.00	97.00	92.20	ADVANCED	{}	2026-04-19 02:24:57.159
cmo5586sv00k7100g41pkwp1e	cmo5586s400k5100gk2m6y5he	cmo557c7300av7b0kzqcqzhuv	67.00	70.00	74.00	69.95	INTERMEDIATE	{}	2026-04-19 02:24:57.2
cmo5586u000kb100gdnrj7lrx	cmo5586ta00k9100g6zclnyks	cmo557cc900b07b0ku0k62661	89.00	60.00	72.00	73.15	INTERMEDIATE	{}	2026-04-19 02:24:57.24
cmo5586v100kf100geaxf3a54	cmo5586ub00kd100gpnziacif	cmo557cjc00b57b0kqsqn55ze	66.00	62.00	94.00	71.40	INTERMEDIATE	{}	2026-04-19 02:24:57.278
cmo5586w200kj100gz4ybi0ft	cmo5586vc00kh100g4nck8hls	cmo557cp300ba7b0kvn837k55	79.00	72.00	70.00	73.95	INTERMEDIATE	{}	2026-04-19 02:24:57.314
cmo5586x500kn100gdmnobg0g	cmo5586wd00kl100gkftepn4k	cmo557cu300bf7b0kx9dxt6e7	74.00	99.00	89.00	87.75	ADVANCED	{}	2026-04-19 02:24:57.353
cmo5586y900kr100g9745n58j	cmo5586xi00kp100gt3h0p00c	cmo557cys00bk7b0kiielhxzt	94.00	80.00	89.00	87.15	ADVANCED	{}	2026-04-19 02:24:57.393
cmo5586zd00kv100gdntyypf4	cmo5586ym00kt100g8al5xj88	cmo557d3x00bp7b0k2jjgus02	87.00	87.00	92.00	88.25	ADVANCED	{}	2026-04-19 02:24:57.433
cmo55870i00kz100gd4ojulop	cmo5586zr00kx100gotxpwydo	cmo557d9400bu7b0k35ahh0vw	78.00	80.00	86.00	80.80	ADVANCED	{}	2026-04-19 02:24:57.474
cmo55871m00l3100gabpf6vrt	cmo55870t00l1100g7v258i0s	cmo557def00bz7b0k05s9niu5	75.00	76.00	61.00	71.90	INTERMEDIATE	{}	2026-04-19 02:24:57.514
cmo55872p00l7100g4mt5204r	cmo55871x00l5100gk61got6n	cmo557djn00c47b0kusw3z20q	77.00	93.00	87.00	85.90	ADVANCED	{}	2026-04-19 02:24:57.553
cmo55873u00lb100gvefgcwt2	cmo55873200l9100gwiuxcbho	cmo557doq00c97b0krpxcvkvk	91.00	76.00	71.00	80.00	ADVANCED	{}	2026-04-19 02:24:57.594
cmo55875h00lf100g5seryg44	cmo55874600ld100g14uv2td2	cmo557dtv00ce7b0kc384rbtl	78.00	76.00	76.00	76.70	INTERMEDIATE	{}	2026-04-19 02:24:57.653
cmo55876l00lj100gg9al4du1	cmo55875t00lh100g3udoes1b	cmo557dyx00cj7b0kfph6iiov	71.00	66.00	75.00	70.00	INTERMEDIATE	{}	2026-04-19 02:24:57.694
cmo55877q00ln100gb4jh9jmd	cmo55876z00ll100g9754b65a	cmo557e4700co7b0kd2pnicoe	97.00	87.00	72.00	86.75	ADVANCED	{}	2026-04-19 02:24:57.734
cmo55878w00lr100gk6pg06o7	cmo55878300lp100g3uk1einv	cmo557e9a00ct7b0ktrojio27	73.00	69.00	61.00	68.40	INTERMEDIATE	{}	2026-04-19 02:24:57.776
cmo5587a000lv100gsiadh5ew	cmo55879900lt100g85hjb0ct	cmo557eee00cy7b0knuk1wn5o	94.00	82.00	76.00	84.70	ADVANCED	{}	2026-04-19 02:24:57.816
cmo5587b600lz100gihygyw6d	cmo5587ae00lx100gfd9p3m5i	cmo557ejd00d37b0ki6m5bywd	81.00	80.00	70.00	77.85	INTERMEDIATE	{}	2026-04-19 02:24:57.857
cmo5587cb00m3100gamt4cqk8	cmo5587bj00m1100g7milvt99	cmo557eog00d87b0k0ghqgjbj	76.00	91.00	64.00	79.00	INTERMEDIATE	{}	2026-04-19 02:24:57.899
cmo5587dg00m7100g5ee81t1r	cmo5587co00m5100gbzjpz61s	cmo557etk00dd7b0kjohsyogv	81.00	80.00	95.00	84.10	ADVANCED	{}	2026-04-19 02:24:57.94
cmo5587el00mb100gzdk0v9l1	cmo5587ds00m9100gsc0ry87f	cmo557eyr00di7b0ki25zagsl	78.00	98.00	72.00	84.50	ADVANCED	{}	2026-04-19 02:24:57.981
cmo5587fp00mf100gtvlfnw3n	cmo5587ex00md100gfhc6fxer	cmo557f3u00dn7b0kod1oq6g2	83.00	61.00	76.00	72.45	INTERMEDIATE	{}	2026-04-19 02:24:58.021
cmo5587gt00mj100gotd9cm6l	cmo5587g100mh100geor9j4rx	cmo557f8w00ds7b0km8qaj3kq	83.00	82.00	98.00	86.35	ADVANCED	{}	2026-04-19 02:24:58.061
cmo5587hy00mn100gjtrgsge0	cmo5587h700ml100gjdzhs2fk	cmo557fdy00dx7b0kmyrsuqo5	78.00	72.00	64.00	72.10	INTERMEDIATE	{}	2026-04-19 02:24:58.102
cmo5587j200mr100gzix5ldcu	cmo5587ib00mp100gohc3flqk	cmo557fj600e27b0kmu5hibaw	74.00	90.00	79.00	81.65	ADVANCED	{}	2026-04-19 02:24:58.142
cmo558afc00x3100ghisbz10z	cmo558aej00x1100gjfolfv6j	cmo557fo900e77b0ke9zfa12t	97.00	82.00	77.00	86.00	ADVANCED	{}	2026-04-19 02:25:01.896
cmo558agg00x7100ga4p6b2qt	cmo558afo00x5100gs3vm0lew	cmo557ftg00ec7b0kcmazt6m0	95.00	95.00	63.00	87.00	ADVANCED	{}	2026-04-19 02:25:01.936
cmo558ahl00xb100gw8mdwucz	cmo558agt00x9100gm5mvm6x1	cmo557fz300eh7b0k8wx9a1ml	96.00	84.00	60.00	82.20	ADVANCED	{}	2026-04-19 02:25:01.977
cmo558aiq00xf100g8wn8yf5p	cmo558ahy00xd100gntftxvbq	cmo557g4o00em7b0kwsuhgib8	98.00	91.00	82.00	91.20	ADVANCED	{}	2026-04-19 02:25:02.018
cmo558aju00xj100gy2qtfswo	cmo558aj300xh100g8z4tartm	cmo557g9u00er7b0kit44dx7h	88.00	63.00	72.00	74.00	INTERMEDIATE	{}	2026-04-19 02:25:02.058
cmo558aky00xn100gz2u7vulv	cmo558ak600xl100gjekjcvyc	cmo557ggh00ew7b0k40hv462g	97.00	64.00	85.00	80.80	ADVANCED	{}	2026-04-19 02:25:02.098
cmo558am100xr100gm70t6hgz	cmo558al900xp100gv1j60uks	cmo557gm200f17b0k5y2cnzco	84.00	88.00	72.00	82.60	ADVANCED	{}	2026-04-19 02:25:02.137
cmo558an400xv100g5kdjaetc	cmo558amd00xt100grcn8kif6	cmo557gr500f67b0k4oirdxy0	70.00	90.00	95.00	84.25	ADVANCED	{}	2026-04-19 02:25:02.177
cmo558ao800xz100gn0rnu33e	cmo558anh00xx100gb5uxncxh	cmo557gw200fb7b0kuqfs96g3	86.00	91.00	70.00	84.00	ADVANCED	{}	2026-04-19 02:25:02.216
cmo558ape00y3100g74jkk5we	cmo558aol00y1100g48dofopy	cmo557h1700fg7b0kj56vcyx4	87.00	67.00	95.00	81.00	ADVANCED	{}	2026-04-19 02:25:02.258
cmo558aqj00y7100gygr44gq3	cmo558apr00y5100g8nfpdh4h	cmo557h6h00fl7b0k7uz7uf06	90.00	75.00	82.00	82.00	ADVANCED	{}	2026-04-19 02:25:02.299
cmo558arn00yb100g7bm62y72	cmo558aqv00y9100g6ff3ursd	cmo557hbh00fq7b0k4s7i25n9	80.00	64.00	91.00	76.35	INTERMEDIATE	{}	2026-04-19 02:25:02.339
cmo558asq00yf100gldsqdlhl	cmo558ary00yd100gcwijtegf	cmo557hgj00fv7b0kk12soz29	86.00	92.00	91.00	89.65	ADVANCED	{}	2026-04-19 02:25:02.378
cmo558atv00yj100gi9d7fp4x	cmo558at300yh100gdbq8o492	cmo557hll00g07b0kani4bpyw	83.00	70.00	97.00	81.30	ADVANCED	{}	2026-04-19 02:25:02.419
cmo558av000yn100g4gkl1k1s	cmo558au800yl100gv1z95usv	cmo557hqv00g57b0k1d2v0a6m	78.00	64.00	80.00	72.90	INTERMEDIATE	{}	2026-04-19 02:25:02.46
cmo558aw500yr100gkjlqb9n3	cmo558ave00yp100go8zycrnx	cmo557hw000ga7b0k3sdb881u	91.00	97.00	94.00	94.15	ADVANCED	{}	2026-04-19 02:25:02.501
cmo558axa00yv100g7syfp0hc	cmo558awi00yt100gy86m5xf4	cmo557i1000gf7b0kp6yh2vlz	94.00	60.00	88.00	78.90	INTERMEDIATE	{}	2026-04-19 02:25:02.542
cmo558ayd00yz100gjmwpcgw8	cmo558axn00yx100g8codwgz8	cmo557i6600gk7b0kihbemw91	74.00	82.00	77.00	77.95	INTERMEDIATE	{}	2026-04-19 02:25:02.581
cmo558aze00z3100ggg1laej0	cmo558ayn00z1100gj9la6en1	cmo557iay00gp7b0ktcm58kic	90.00	99.00	91.00	93.85	ADVANCED	{}	2026-04-19 02:25:02.618
cmo558b0d00z7100g5eylgktg	cmo558azo00z5100g1qqcngw8	cmo557ig100gu7b0ktczurfm0	94.00	73.00	87.00	83.85	ADVANCED	{}	2026-04-19 02:25:02.653
cmo558b1b00zb100gajpes7ba	cmo558b0m00z9100g874y4oli	cmo557il600gz7b0kcp0gx5kg	85.00	95.00	70.00	85.25	ADVANCED	{}	2026-04-19 02:25:02.688
cmo558b2a00zf100gxlv2bqw1	cmo558b1k00zd100gx2p3yv2i	cmo557irb00h47b0kjdayxn8n	86.00	74.00	93.00	82.95	ADVANCED	{}	2026-04-19 02:25:02.723
cmo558b3c00zj100gmsj4yu4u	cmo558b2l00zh100g26ftnrgo	cmo557iw900h97b0ke1qhuof5	98.00	97.00	74.00	91.60	ADVANCED	{}	2026-04-19 02:25:02.76
cmo558b4g00zn100gqnl630u5	cmo558b3o00zl100go66kmq7b	cmo557j1b00he7b0k7vn7huyx	75.00	93.00	81.00	83.70	ADVANCED	{}	2026-04-19 02:25:02.8
cmo558b5n00zr100gt805szdk	cmo558b4v00zp100gammgk291	cmo557j6f00hj7b0k3wywe8f1	91.00	62.00	71.00	74.40	INTERMEDIATE	{}	2026-04-19 02:25:02.843
cmo558b6r00zv100gv4dix16u	cmo558b5z00zt100gf7e8zq2b	cmo557jbl00ho7b0kt5f05uiv	87.00	90.00	78.00	85.95	ADVANCED	{}	2026-04-19 02:25:02.883
cmo558b7w00zz100grbe3susj	cmo558b7400zx100gh9yer8zb	cmo557jgm00ht7b0k0dte78bw	63.00	71.00	93.00	73.70	INTERMEDIATE	{}	2026-04-19 02:25:02.924
cmo558b910103100grex5nncv	cmo558b890101100g4jvjxrqx	cmo557jln00hy7b0k90dtt0wl	93.00	95.00	91.00	93.30	ADVANCED	{}	2026-04-19 02:25:02.965
cmo558ba70107100ghl4l1vyo	cmo558b9f0105100gmjzl4trs	cmo557jqg00i37b0kl4s918bi	86.00	82.00	92.00	85.90	ADVANCED	{}	2026-04-19 02:25:03.007
cmo558bbc010b100gzsr3cxe3	cmo558bak0109100ghs1mhijw	cmo557jvj00i87b0kzu8b3y5q	80.00	63.00	99.00	77.95	INTERMEDIATE	{}	2026-04-19 02:25:03.048
cmo558bch010f100g8axzu9mm	cmo558bbp010d100g8l6f3oou	cmo557k0q00id7b0kiyizzm66	70.00	91.00	61.00	76.15	INTERMEDIATE	{}	2026-04-19 02:25:03.089
cmo558bdo010j100gnv5lg9bl	cmo558bcw010h100gzt5veas6	cmo557k6900ii7b0kz59z58p6	68.00	75.00	66.00	70.30	INTERMEDIATE	{}	2026-04-19 02:25:03.133
cmo558beu010n100gxng1rskr	cmo558be2010l100gsrq5mihy	cmo557kav00in7b0kvr819xm1	63.00	73.00	76.00	70.25	INTERMEDIATE	{}	2026-04-19 02:25:03.174
cmo558bg0010r100gu4yyvggg	cmo558bf8010p100g9f7pnlgs	cmo557kfv00is7b0keethqpkw	74.00	83.00	76.00	78.10	INTERMEDIATE	{}	2026-04-19 02:25:03.216
cmo558bh8010v100gl7r0aafo	cmo558bgd010t100gauzzm84z	cmo557kl800ix7b0kmp825bgx	61.00	68.00	69.00	65.80	INTERMEDIATE	{}	2026-04-19 02:25:03.26
cmo558bia010z100g378jdqfh	cmo558bhj010x100g4butgw7f	cmo557kqf00j27b0kfuug0kse	80.00	85.00	70.00	79.50	INTERMEDIATE	{}	2026-04-19 02:25:03.298
cmo558bjb0113100gj0v966pn	cmo558bij0111100gr4ljt1jj	cmo557kvz00j77b0k185bppnq	78.00	66.00	98.00	78.20	INTERMEDIATE	{}	2026-04-19 02:25:03.335
cmo558bka0117100gcqev43g9	cmo558bjk0115100gys9c3qfv	cmo557l1d00jc7b0kgvzuo882	91.00	62.00	98.00	81.15	ADVANCED	{}	2026-04-19 02:25:03.37
cmo558bl8011b100g6vykdzqb	cmo558bkj0119100gwjpg4jco	cmo557l6200jh7b0kru24b2xz	97.00	98.00	66.00	89.65	ADVANCED	{}	2026-04-19 02:25:03.404
cmo558bm9011f100g47gyvqog	cmo558bli011d100gocj6dqqh	cmo557lb900jm7b0kgkebn9y4	85.00	88.00	63.00	80.70	ADVANCED	{}	2026-04-19 02:25:03.441
cmo558bnc011j100gjik3zsnf	cmo558bmk011h100ghk526qxv	cmo557lge00jr7b0kcryv2044	60.00	72.00	84.00	70.80	INTERMEDIATE	{}	2026-04-19 02:25:03.48
cmo558boh011n100g1wagduzv	cmo558bnp011l100gem3guymp	cmo557llv00jw7b0kdcw9d3r3	68.00	77.00	60.00	69.60	INTERMEDIATE	{}	2026-04-19 02:25:03.521
cmo558bpk011r100gj49ulsyk	cmo558bos011p100gfmok7bzh	cmo557lr700k17b0k91md5id4	97.00	61.00	82.00	78.85	INTERMEDIATE	{}	2026-04-19 02:25:03.56
cmo558bqn011v100gdbvkd4rk	cmo558bpw011t100gnind36ef	cmo557lwf00k67b0klnosqvfo	92.00	85.00	94.00	89.70	ADVANCED	{}	2026-04-19 02:25:03.599
cmo558brs011z100g8l5ysjjy	cmo558br0011x100geq6p3c6y	cmo557m1n00kb7b0k010r1b82	73.00	96.00	67.00	80.70	ADVANCED	{}	2026-04-19 02:25:03.64
cmo558bsx0123100ggey022z4	cmo558bs50121100g3gjlm3pd	cmo557m7000kg7b0kucmgdcte	77.00	74.00	79.00	76.30	INTERMEDIATE	{}	2026-04-19 02:25:03.682
cmo558bu30127100geofvxrxv	cmo558bta0125100g178c0urt	cmo557mc300kl7b0k0u5hs0ap	65.00	86.00	94.00	80.65	ADVANCED	{}	2026-04-19 02:25:03.723
cmo558bv7012b100gv4jkcsaf	cmo558buf0129100gf9cd7p2z	cmo557mhd00kq7b0k7lg31xm8	78.00	80.00	83.00	80.05	ADVANCED	{}	2026-04-19 02:25:03.764
cmo558bwc012f100giw3k8csy	cmo558bvk012d100g38q3kkfa	cmo557mmh00kv7b0kuce8hh6r	97.00	90.00	95.00	93.70	ADVANCED	{}	2026-04-19 02:25:03.804
cmo558bxg012j100g91uxtpj5	cmo558bwo012h100gpfntl5mm	cmo557mrn00l07b0k2c81hsoh	96.00	79.00	79.00	84.95	ADVANCED	{}	2026-04-19 02:25:03.844
cmo558ewv01dm100g77xurgbe	cmo558ew201dk100gbuubtka3	cmo557mwx00l57b0k9z24qbkl	76.00	73.00	75.00	74.55	INTERMEDIATE	{}	2026-04-19 02:25:07.711
cmo558ey001dq100g7hun6svu	cmo558ex801do100gcfu3vhri	cmo557n2100la7b0kju9en5sb	89.00	90.00	79.00	86.90	ADVANCED	{}	2026-04-19 02:25:07.753
cmo558ez501du100gspkqhb82	cmo558eyd01ds100gebd5lhpw	cmo557n7400lf7b0kw1218vlt	82.00	85.00	82.00	83.20	ADVANCED	{}	2026-04-19 02:25:07.793
cmo558f0901dy100gwe4qe15v	cmo558ezi01dw100g6vs8j5cq	cmo557nc700lk7b0kzww6wx2e	76.00	74.00	89.00	78.45	INTERMEDIATE	{}	2026-04-19 02:25:07.833
cmo558f1g01e2100gghptq2fs	cmo558f0n01e0100gdgktp8bt	cmo557nhc00lp7b0kw7dai5g6	74.00	69.00	75.00	72.25	INTERMEDIATE	{}	2026-04-19 02:25:07.876
cmo558f2l01e6100gg01p9yj3	cmo558f1t01e4100gnmkegn1j	cmo557nmf00lu7b0kjrdjn743	60.00	75.00	65.00	67.25	INTERMEDIATE	{}	2026-04-19 02:25:07.917
cmo558f3p01ea100goyyr0i1k	cmo558f2x01e8100gb21sd5lr	cmo557nrg00lz7b0kcasnmdvc	92.00	93.00	64.00	85.40	ADVANCED	{}	2026-04-19 02:25:07.957
cmo558f4t01ee100gadbt40nt	cmo558f4101ec100g0dtn7a5m	cmo557nwi00m47b0kfd29d73k	71.00	63.00	64.00	66.05	INTERMEDIATE	{}	2026-04-19 02:25:07.997
cmo558f5w01ei100gqhrij2uy	cmo558f5501eg100gg1uo99ku	cmo557o1l00m97b0kbpc6t7nm	74.00	63.00	63.00	66.85	INTERMEDIATE	{}	2026-04-19 02:25:08.037
cmo558f7101em100g329rvibz	cmo558f6901ek100g4jpijdw2	cmo557o6n00me7b0k78fhb0k5	90.00	70.00	74.00	78.00	INTERMEDIATE	{}	2026-04-19 02:25:08.077
cmo558f8501eq100gbc20geo6	cmo558f7d01eo100gldaa3xd9	cmo557obw00mj7b0k5pzx9w36	66.00	68.00	73.00	68.55	INTERMEDIATE	{}	2026-04-19 02:25:08.117
cmo558f9c01eu100glbw25r1y	cmo558f8j01es100gn7zuq6ch	cmo557ogs00mo7b0kc67x7k0i	81.00	86.00	81.00	83.00	ADVANCED	{}	2026-04-19 02:25:08.16
cmo558fah01ey100gvkrv2gfx	cmo558f9p01ew100g9xbncwg9	cmo557olp00mt7b0kjxf1w5lt	64.00	87.00	61.00	72.45	INTERMEDIATE	{}	2026-04-19 02:25:08.201
cmo558fbm01f2100g0sjucfu2	cmo558fau01f0100gx3p0qr2x	cmo557oqo00my7b0kekoo7snp	94.00	82.00	69.00	82.95	ADVANCED	{}	2026-04-19 02:25:08.242
cmo558fcq01f6100gmwznxfqt	cmo558fby01f4100glwpanmbd	cmo557owd00n37b0k96pwtt86	88.00	79.00	74.00	80.90	ADVANCED	{}	2026-04-19 02:25:08.282
cmo558fdt01fa100gv51hurf4	cmo558fd101f8100gzsr8cvek	cmo557p1k00n87b0kznlszabt	97.00	93.00	68.00	88.15	ADVANCED	{}	2026-04-19 02:25:08.321
cmo558few01fe100g25wj1tdf	cmo558fe501fc100gpl8qt9tq	cmo557p6700nd7b0ku6rdvxlv	86.00	69.00	72.00	75.70	INTERMEDIATE	{}	2026-04-19 02:25:08.36
cmo558ffx01fi100gmck53svh	cmo558ff601fg100g78olyeip	cmo557pb800ni7b0krdgjttot	77.00	73.00	64.00	72.15	INTERMEDIATE	{}	2026-04-19 02:25:08.397
cmo558fgx01fm100gam3d9p4r	cmo558fg601fk100gbhr4oy85	cmo557phb00nn7b0k0iqa5nxc	83.00	91.00	81.00	85.70	ADVANCED	{}	2026-04-19 02:25:08.433
cmo558fhy01fq100gjmrszbmt	cmo558fh701fo100gy2v63buk	cmo557pmi00ns7b0kzqav8xfj	96.00	61.00	66.00	74.50	INTERMEDIATE	{}	2026-04-19 02:25:08.47
cmo558fj201fu100g82g3y94u	cmo558fib01fs100ghbuyd3zh	cmo557prm00nx7b0ks4xdwk7z	79.00	91.00	67.00	80.80	ADVANCED	{}	2026-04-19 02:25:08.51
cmo558fk101fy100g26f3svup	cmo558fjb01fw100gex2fv60s	cmo557pws00o27b0kcxns2k0z	96.00	81.00	96.00	90.00	ADVANCED	{}	2026-04-19 02:25:08.545
cmo558fl001g2100gaskb5j99	cmo558fkb01g0100gm1b1i036	cmo557q1i00o77b0k8783jbnc	66.00	63.00	66.00	64.80	INTERMEDIATE	{}	2026-04-19 02:25:08.58
cmo558flz01g6100gapu6nzkk	cmo558fla01g4100gazr9iygq	cmo557q6f00oc7b0k3y8was5x	80.00	64.00	90.00	76.10	INTERMEDIATE	{}	2026-04-19 02:25:08.615
cmo558fmx01ga100gkffzz9eo	cmo558fm801g8100gryva7ved	cmo557qbo00oh7b0kdb0mb8av	92.00	75.00	77.00	81.45	ADVANCED	{}	2026-04-19 02:25:08.649
cmo558fnv01ge100gag6w2039	cmo558fn601gc100glc7b36l1	cmo557qgf00om7b0kw6i0fijv	64.00	67.00	76.00	68.20	INTERMEDIATE	{}	2026-04-19 02:25:08.683
cmo558fow01gi100gcfd6gjnp	cmo558fo601gg100g0whmgrqw	cmo557qlc00or7b0kjzjnla31	76.00	91.00	81.00	83.25	ADVANCED	{}	2026-04-19 02:25:08.72
cmo558fpz01gm100g6dcyuz81	cmo558fp701gk100gm652ns8o	cmo557qqe00ow7b0k1llohmfo	68.00	65.00	96.00	73.80	INTERMEDIATE	{}	2026-04-19 02:25:08.759
cmo558fr401gq100g8zh5qo67	cmo558fqc01go100g7oyuluu7	cmo557qvg00p17b0kbvs44rl3	97.00	95.00	74.00	90.45	ADVANCED	{}	2026-04-19 02:25:08.8
cmo558fsa01gu100glo5jnv0m	cmo558fri01gs100gnagwuzy0	cmo557r0i00p67b0k045twbt7	84.00	84.00	73.00	81.25	ADVANCED	{}	2026-04-19 02:25:08.842
cmo558ftf01gy100gc2wgiitk	cmo558fsm01gw100gqwt04fbk	cmo557r5q00pb7b0kuc91ln3z	94.00	67.00	77.00	78.95	INTERMEDIATE	{}	2026-04-19 02:25:08.883
cmo558fuj01h2100ghrbe2o7p	cmo558fts01h0100greq2txb3	cmo557ras00pg7b0kf375867f	87.00	87.00	64.00	81.25	ADVANCED	{}	2026-04-19 02:25:08.923
cmo558fvo01h6100g47s64ehc	cmo558fuw01h4100g4vnnv019	cmo557rfn00pl7b0kej55y9bk	85.00	69.00	62.00	72.85	INTERMEDIATE	{}	2026-04-19 02:25:08.964
cmo558fwu01ha100g2grjd2z4	cmo558fw101h8100gr53x58od	cmo557rkr00pq7b0kbbtj1zwa	75.00	93.00	99.00	88.20	ADVANCED	{}	2026-04-19 02:25:09.006
cmo558fxx01he100guxu2o8cy	cmo558fx501hc100gdcex1mqw	cmo557rpw00pv7b0kvh4xon07	82.00	78.00	96.00	83.90	ADVANCED	{}	2026-04-19 02:25:09.045
cmo558fz201hi100gyth1tgsw	cmo558fya01hg100ggix4wsgk	cmo557rux00q07b0k3h7jj7k3	86.00	64.00	62.00	71.20	INTERMEDIATE	{}	2026-04-19 02:25:09.086
cmo558g0801hm100gu9c4kpsn	cmo558fzf01hk100gccemxgxo	cmo557s0800q57b0k5c2vn2s6	84.00	95.00	98.00	91.90	ADVANCED	{}	2026-04-19 02:25:09.128
cmo558g1e01hq100g8srg99k5	cmo558g0m01ho100ga4b60nk7	cmo557s4t00qa7b0kvz050jin	89.00	76.00	62.00	77.05	INTERMEDIATE	{}	2026-04-19 02:25:09.17
cmo558g2j01hu100gzbsgxdfg	cmo558g1q01hs100g2wmxnqqv	cmo557s9r00qf7b0kv2j9wc4e	88.00	76.00	78.00	80.70	ADVANCED	{}	2026-04-19 02:25:09.211
cmo558g3n01hy100gds81mvv4	cmo558g2w01hw100ghpmpmwwj	cmo557seu00qk7b0kjzngc5jp	76.00	62.00	82.00	71.90	INTERMEDIATE	{}	2026-04-19 02:25:09.25
cmo558g4s01i2100gfpdk4xac	cmo558g4001i0100gxj9uaf6r	cmo557sjy00qp7b0kcbixu68x	69.00	99.00	82.00	84.25	ADVANCED	{}	2026-04-19 02:25:09.292
cmo558g5w01i6100g5n0z1fd5	cmo558g5401i4100ggmpnk1vw	cmo557sp400qu7b0k6g4ofhl0	76.00	79.00	71.00	75.95	INTERMEDIATE	{}	2026-04-19 02:25:09.332
cmo558g7101ia100g8ouf2qwi	cmo558g6801i8100gplqcji02	cmo557su500qz7b0k1800gjp0	84.00	83.00	60.00	77.60	INTERMEDIATE	{}	2026-04-19 02:25:09.372
cmo558g8401ie100gva54fuav	cmo558g7d01ic100gtqb5eo8i	cmo557szb00r47b0k09i82w3t	73.00	68.00	94.00	76.25	INTERMEDIATE	{}	2026-04-19 02:25:09.413
cmo558g9901ii100g6xv81d9y	cmo558g8h01ig100gt1tnpb9c	cmo557t4r00r97b0konzo0g13	83.00	63.00	69.00	71.50	INTERMEDIATE	{}	2026-04-19 02:25:09.453
cmo558gad01im100go9v51hmx	cmo558g9m01ik100g0roowib3	cmo557t9u00re7b0kijdp5m56	91.00	76.00	93.00	85.50	ADVANCED	{}	2026-04-19 02:25:09.493
cmo558gbg01iq100g3k4gb2ch	cmo558gap01io100gryn9n9z0	cmo557tez00rj7b0kiw7z270r	91.00	88.00	85.00	88.30	ADVANCED	{}	2026-04-19 02:25:09.533
cmo558gcl01iu100gqmveiko7	cmo558gbt01is100gchq7ala5	cmo557tk200ro7b0k0q0bhpn0	65.00	85.00	79.00	76.50	INTERMEDIATE	{}	2026-04-19 02:25:09.573
cmo558gdq01iy100gywv1u7qz	cmo558gcx01iw100guwc4dny4	cmo557tp800rt7b0ks8pu88qg	70.00	66.00	91.00	73.65	INTERMEDIATE	{}	2026-04-19 02:25:09.614
cmo558gev01j2100g8tz464e8	cmo558ge301j0100giv3qs821	cmo557tub00ry7b0k39n9mopk	99.00	83.00	70.00	85.35	ADVANCED	{}	2026-04-19 02:25:09.655
cmo558jf801tk100gc2cs8ymi	cmo558jef01ti100gpf100hzj	cmo557tze00s37b0knxgb0zgq	67.00	86.00	69.00	75.10	INTERMEDIATE	{}	2026-04-19 02:25:13.556
cmo558jgd01to100gw2jcmk7m	cmo558jfk01tm100ghjyefpxv	cmo557u4j00s87b0kojl3s945	80.00	69.00	89.00	77.85	INTERMEDIATE	{}	2026-04-19 02:25:13.597
cmo558jhi01ts100gmp07tkv0	cmo558jgq01tq100g3cm5lb6d	cmo557u9r00sd7b0kuzobggoq	82.00	79.00	87.00	82.05	ADVANCED	{}	2026-04-19 02:25:13.639
cmo558jio01tw100gba4erltw	cmo558jhw01tu100g24itup4k	cmo557uet00si7b0kvne2djec	80.00	66.00	83.00	75.15	INTERMEDIATE	{}	2026-04-19 02:25:13.68
cmo558jju01u0100gbqs9i8ig	cmo558jj201ty100g3bvg8sas	cmo557ujv00sn7b0kg8pxfsox	75.00	70.00	78.00	73.75	INTERMEDIATE	{}	2026-04-19 02:25:13.722
cmo558jl001u4100gkwuca9p0	cmo558jk801u2100ghu4hxqqv	cmo557uoy00ss7b0kql7bfvw8	81.00	91.00	75.00	83.50	ADVANCED	{}	2026-04-19 02:25:13.765
cmo558jm601u8100g9wb82hjq	cmo558jle01u6100ggsr1egu4	cmo557uu000sx7b0krwou7vvt	95.00	79.00	84.00	85.85	ADVANCED	{}	2026-04-19 02:25:13.806
cmo558jnc01uc100ga6v3jaqm	cmo558jmk01ua100gi68c1onb	cmo557uz300t27b0k6t32lb5v	97.00	87.00	68.00	85.75	ADVANCED	{}	2026-04-19 02:25:13.848
cmo558joi01ug100gy376n6wc	cmo558jnp01ue100g43lr5ix4	cmo557v4800t77b0k2mc5rfic	77.00	61.00	78.00	70.85	INTERMEDIATE	{}	2026-04-19 02:25:13.89
cmo558jps01uk100gbliby47f	cmo558jox01ui100gousqdl0g	cmo557v9a00tc7b0k18ly995s	72.00	69.00	94.00	76.30	INTERMEDIATE	{}	2026-04-19 02:25:13.936
cmo558jqx01uo100gptirslsa	cmo558jq501um100gi3qx3atz	cmo557vee00th7b0kqnj7luvr	94.00	82.00	79.00	85.45	ADVANCED	{}	2026-04-19 02:25:13.977
cmo558js201us100gfvpf687k	cmo558jr901uq100grc89b840	cmo557vjj00tm7b0kz8gnhpct	87.00	61.00	85.00	76.10	INTERMEDIATE	{}	2026-04-19 02:25:14.018
cmo558jt701uw100gcbvcau74	cmo558jsf01uu100gppejnptr	cmo557von00tr7b0kpw9dyaf2	87.00	67.00	94.00	80.75	ADVANCED	{}	2026-04-19 02:25:14.059
cmo558juc01v0100gwheq9t3a	cmo558jtj01uy100gpeuk3ggr	cmo557vup00tw7b0kka2z577m	90.00	74.00	61.00	76.35	INTERMEDIATE	{}	2026-04-19 02:25:14.1
cmo558jvi01v4100g20ic2r8e	cmo558jup01v2100gega0sqbc	cmo557w0200u17b0ka55u5wp5	86.00	92.00	95.00	90.65	ADVANCED	{}	2026-04-19 02:25:14.142
cmo558jwo01v8100g2ipdnbb8	cmo558jvw01v6100g5wheu0u3	cmo557w5600u67b0krc3w0c51	69.00	64.00	61.00	65.00	INTERMEDIATE	{}	2026-04-19 02:25:14.184
cmo558jxv01vc100gymb7zex6	cmo558jx201va100gp7n79qh9	cmo557w9z00ub7b0k51iu0w8p	95.00	82.00	79.00	85.80	ADVANCED	{}	2026-04-19 02:25:14.227
cmo558jyy01vg100gkntgneek	cmo558jy701ve100gufipieuj	cmo557wf100ug7b0kb984024b	68.00	78.00	99.00	79.75	INTERMEDIATE	{}	2026-04-19 02:25:14.266
cmo558k0301vk100gas4u42uz	cmo558jzc01vi100g3yspayqs	cmo557wk700ul7b0kz02m7bt9	86.00	92.00	94.00	90.40	ADVANCED	{}	2026-04-19 02:25:14.307
cmo558k1601vo100gd4g5j9sr	cmo558k0f01vm100gjhyj5ald	cmo557wpj00uq7b0kwopo3104	75.00	90.00	75.00	81.00	ADVANCED	{}	2026-04-19 02:25:14.347
cmo558k2b01vs100g4sy8wgfi	cmo558k1i01vq100gtdr46gqy	cmo557wuo00uv7b0k4im8bj0e	87.00	64.00	90.00	78.55	INTERMEDIATE	{}	2026-04-19 02:25:14.387
cmo558k3g01vw100g78ekovwf	cmo558k2n01vu100giy9tvu56	cmo557wzr00v07b0kjf3w2l23	95.00	73.00	98.00	86.95	ADVANCED	{}	2026-04-19 02:25:14.428
cmo558k4m01w0100geuso29op	cmo558k3u01vy100gdbqrxv7e	cmo557x4v00v57b0ka29aheyo	68.00	72.00	62.00	68.10	INTERMEDIATE	{}	2026-04-19 02:25:14.47
cmo558k5r01w4100gqfw1o5j5	cmo558k4z01w2100gp3v5ev5k	cmo557xa300va7b0kdaoph27t	99.00	63.00	77.00	79.10	INTERMEDIATE	{}	2026-04-19 02:25:14.511
cmo558k6x01w8100gmgbtb49l	cmo558k6401w6100gv7ivamq2	cmo557xf600vf7b0k6nf325ws	64.00	83.00	72.00	73.60	INTERMEDIATE	{}	2026-04-19 02:25:14.553
cmo558k8301wc100g616mdsny	cmo558k7a01wa100go9mzl4cy	cmo557xke00vk7b0kydwbgsas	80.00	93.00	72.00	83.20	ADVANCED	{}	2026-04-19 02:25:14.595
cmo558k9b01wg100gw0gk1di7	cmo558k8i01we100g5dqyj9xy	cmo557xp400vp7b0k9gem5k8b	93.00	81.00	92.00	87.95	ADVANCED	{}	2026-04-19 02:25:14.639
cmo558kah01wk100gokwhapsg	cmo558k9o01wi100gpjnr508b	cmo557xu900vu7b0kp3g098mx	88.00	66.00	91.00	79.95	INTERMEDIATE	{}	2026-04-19 02:25:14.681
cmo558kbm01wo100gd2e77bly	cmo558kat01wm100gtj9671oa	cmo557xzc00vz7b0kmmboa9u5	63.00	70.00	87.00	71.80	INTERMEDIATE	{}	2026-04-19 02:25:14.722
cmo558kcr01ws100gcci2914k	cmo558kbz01wq100gcc0952ot	cmo557y4p00w47b0kcy626bah	64.00	94.00	70.00	77.50	INTERMEDIATE	{}	2026-04-19 02:25:14.763
cmo558kdx01ww100gaujl97za	cmo558kd301wu100ggv39jbwy	cmo557y9j00w97b0kz60mqb0x	86.00	61.00	87.00	76.25	INTERMEDIATE	{}	2026-04-19 02:25:14.804
cmo558kf401x0100g3gypj4ep	cmo558kec01wy100ge64hb0zx	cmo557yen00we7b0kgagknyrb	89.00	86.00	78.00	85.05	ADVANCED	{}	2026-04-19 02:25:14.849
cmo558kgb01x4100gkctfe9y5	cmo558kfh01x2100gwylx1hzr	cmo557yjr00wj7b0k93g5v46t	96.00	95.00	73.00	89.85	ADVANCED	{}	2026-04-19 02:25:14.891
cmo558khg01x8100golut7dch	cmo558kgo01x6100ge5j3vc6l	cmo557yot00wo7b0ker1evt5a	64.00	88.00	64.00	73.60	INTERMEDIATE	{}	2026-04-19 02:25:14.932
cmo558kik01xc100g6032kccw	cmo558khs01xa100gb22at26s	cmo557ytx00wt7b0ku3vsvi6i	93.00	97.00	72.00	89.35	ADVANCED	{}	2026-04-19 02:25:14.972
cmo558kjq01xg100g2wzr1dtz	cmo558kiy01xe100g1suv0mx8	cmo557yz200wy7b0kukfrukpk	72.00	85.00	71.00	76.95	INTERMEDIATE	{}	2026-04-19 02:25:15.014
cmo558kkv01xk100g3tk98dlm	cmo558kk201xi100gfyoxdnxg	cmo557z4700x37b0k193jisw5	85.00	86.00	77.00	83.40	ADVANCED	{}	2026-04-19 02:25:15.055
cmo558km001xo100gns58pvln	cmo558kl701xm100g02qeyfwe	cmo557z9600x87b0kxla3zvl5	90.00	75.00	75.00	80.25	ADVANCED	{}	2026-04-19 02:25:15.096
cmo558kn501xs100gyiby0hnh	cmo558kmd01xq100gygb1j38f	cmo557zed00xd7b0kqrsc0fb2	72.00	67.00	64.00	68.00	INTERMEDIATE	{}	2026-04-19 02:25:15.137
cmo558kof01xw100g77mrq7gb	cmo558kni01xu100gyxwbvq7c	cmo557zji00xi7b0k56gau7l9	91.00	81.00	65.00	80.50	ADVANCED	{}	2026-04-19 02:25:15.183
cmo558kpk01y0100gqxnhqyeq	cmo558kot01xy100gzi671glw	cmo557zop00xn7b0k39c3nzfg	85.00	69.00	67.00	74.10	INTERMEDIATE	{}	2026-04-19 02:25:15.225
cmo558kqp01y4100g2tswx5po	cmo558kpw01y2100gi17iz11y	cmo557zu900xs7b0kbb2lyyc3	88.00	93.00	89.00	90.25	ADVANCED	{}	2026-04-19 02:25:15.266
cmo558krq01y8100gj4gv6stg	cmo558kqz01y6100glnw7okzs	cmo557zyu00xx7b0kgs9475e5	97.00	96.00	75.00	91.10	ADVANCED	{}	2026-04-19 02:25:15.303
cmo558ksq01yc100gecc9yuk5	cmo558ks001ya100gss5d07hj	cmo55803r00y27b0kivnt8i8n	71.00	93.00	78.00	81.55	ADVANCED	{}	2026-04-19 02:25:15.338
cmo558ktq01yg100giisgbqvh	cmo558ksz01ye100g3axlmuh0	cmo55808y00y77b0k07q4amg0	62.00	98.00	73.00	79.15	INTERMEDIATE	{}	2026-04-19 02:25:15.374
cmo558kut01yk100g5c88n2s7	cmo558ku101yi100g5wrzdepg	cmo5580fe00yc7b0khj6mgnge	85.00	92.00	78.00	86.05	ADVANCED	{}	2026-04-19 02:25:15.413
cmo558kvy01yo100gf3g0fohj	cmo558kv601ym100gaqjtz3ma	cmo5580kk00yh7b0kfejjlsyh	87.00	75.00	79.00	80.20	ADVANCED	{}	2026-04-19 02:25:15.454
cmo558kx301ys100g3cbnvoh8	cmo558kwb01yq100gw8wz7hzo	cmo5580po00ym7b0kpwdoxgsu	95.00	73.00	75.00	81.20	ADVANCED	{}	2026-04-19 02:25:15.496
cmo558ky801yw100gk9p7izpk	cmo558kxg01yu100gryr0uyk9	cmo5580uw00yr7b0kipuqllzh	82.00	77.00	72.00	77.50	INTERMEDIATE	{}	2026-04-19 02:25:15.536
cmo558kzd01z0100g8o0v5xr0	cmo558kyl01yy100gpcqmnjbw	cmo55810700yw7b0k61bz2pxy	61.00	65.00	72.00	65.35	INTERMEDIATE	{}	2026-04-19 02:25:15.578
cmocl7mhr00121w8sv8m879uq	cmocl4szv00101w8s3u3zv9v6	cmockq3hi001buxz7570ou2ax	100.00	100.00	100.00	100.00	ADVANCED	{"k1": 10, "k2": 10, "k3": 10, "m1": 10, "m2": 10, "s1": 10, "s2": 10, "s3": 10}	2026-04-24 07:26:47.966
cmoclex0l00161w8s4rg6wzo3	cmocl9vp700141w8sdh4tdtsf	cmocl3m6h001ouxz76nugd8fe	100.00	100.00	100.00	100.00	ADVANCED	{"k1": 10, "k2": 10, "k3": 10, "m1": 10, "m2": 10, "s1": 10, "s2": 10, "s3": 10}	2026-04-24 07:32:28.196
cmocm495z002b1w8sunum344v	cmocm39qm00271w8sedk78awx	cmockq3hi001buxz7570ou2ax	100.00	100.00	100.00	100.00	ADVANCED	{"k1": 10, "k2": 10, "k3": 10, "m1": 10, "m2": 10, "s1": 10, "s2": 10, "s3": 10}	2026-04-24 07:52:10.342
cmocm49na002d1w8saukcb8f8	cmocm3aeo00291w8s2mo7jy5b	cmocl3m6h001ouxz76nugd8fe	100.00	100.00	100.00	100.00	ADVANCED	{"k1": 10, "k2": 10, "k3": 10, "m1": 10, "m2": 10, "s1": 10, "s2": 10, "s3": 10}	2026-04-24 07:52:10.965
cmp1yzwyp000xme1wxkx5q0fa	cmp1yzo65000vme1wf4o7vbwz	cmoebag5v0001e1ef35z9m1xm	67.00	67.00	70.00	67.75	growth	{"k1": 6, "k2": 7, "k3": 7, "m1": 6, "m2": 8, "s1": 6, "s2": 6, "s3": 8}	2026-05-12 01:46:57.313
\.


--
-- Data for Name: training_budget_items; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.training_budget_items (id, event_id, item, unit_cost, quantity, estimated_amount, source_of_funds, actual_spent, order_index, created_at) FROM stdin;
cmo4dk2f700028ytwfjvv4vw7	cmo4djivv00008ytwvg5kp95a	Bond Paper	10000.00	1	10000.00	Department	\N	0	2026-04-18 13:30:22.147
cmo4ff7cz0002sq0j0s1v5jly	cmo4ff7a90000sq0j3py5r6zc	Venue Rental	5000.00	1	5000.00	DTI Regular Fund	\N	0	2026-04-18 14:22:34.499
cmo4ff7dt0004sq0jmhjnfwch	cmo4ff7a90000sq0j3py5r6zc	Meals & Snacks	350.00	50	17500.00	DTI Regular Fund	\N	0	2026-04-18 14:22:34.529
cmo4ffqzr0019sq0jp8l3fy81	cmo4ffqxm0017sq0jpfl3sswp	Venue Rental	5000.00	1	5000.00	DTI Regular Fund	\N	0	2026-04-18 14:22:59.943
cmo4ffr0p001bsq0jji69aquk	cmo4ffqxm0017sq0jpfl3sswp	Meals & Snacks	350.00	50	17500.00	DTI Regular Fund	\N	0	2026-04-18 14:22:59.978
cmo4fm7wc000213i69xdz9v28	cmo4fm7tl000013i65nq60ql9	Venue Rental	5000.00	1	5000.00	DTI Regular Fund	\N	0	2026-04-18 14:28:01.788
cmo4fm7x7000413i6xqpqh6gw	cmo4fm7tl000013i65nq60ql9	Meals & Snacks	350.00	50	17500.00	DTI Regular Fund	\N	0	2026-04-18 14:28:01.82
cmo553x670002bf08wgm3j9hg	cmo553x4p0000bf08wscm80zn	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:38.095
cmo553x6j0004bf08z2qf8pwk	cmo553x4p0000bf08wscm80zn	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:38.107
cmo553xiu0019bf08qc9b2pbt	cmo553xi40017bf08k1kzzfep	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:38.551
cmo553xj4001bbf08ccduqh6a	cmo553xi40017bf08k1kzzfep	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:38.561
cmo553xui002gbf08uk18kuei	cmo553xts002ebf0899aueskl	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:38.971
cmo553xur002ibf08j14070ns	cmo553xts002ebf0899aueskl	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:38.979
cmo553y5q003nbf08e2fucktb	cmo553y50003lbf08v5q5dlpc	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:39.374
cmo553y5y003pbf085drp39iv	cmo553y50003lbf08v5q5dlpc	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:39.383
cmo553yho004ubf08ynw870v9	cmo553yh0004sbf08bn61lcqs	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:39.804
cmo553yhv004wbf081gjevwbg	cmo553yh0004sbf08bn61lcqs	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:21:39.812
cmo555fap0061bf08vh6dpcv7	cmo555f9x005zbf0853edgeal	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:22:48.242
cmo555fay0063bf08s0u0l3g4	cmo555f9x005zbf0853edgeal	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:22:48.25
cmo555iq100ikbf08dxw4epcv	cmo555ipb00iibf08ubpwnt83	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:22:52.682
cmo555iqa00imbf08054bviz7	cmo555ipb00iibf08ubpwnt83	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:22:52.691
cmo555j1b00jrbf08x0myd2ig	cmo555j0n00jpbf08zx94o2jr	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:22:53.088
cmo555j1k00jtbf08lkjs8ra3	cmo555j0n00jpbf08zx94o2jr	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:22:53.097
cmo55816c0002100gqooxj4a6	cmo55815b0000100gwzv2dbyo	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:24:49.909
cmo55816u0004100gfnwf247v	cmo55815b0000100gwzv2dbyo	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:24:49.926
cmo5585se00g3100gohmdpfl4	cmo5585r700g1100gkoseur2n	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:24:55.886
cmo5585sm00g5100go5y4pzjq	cmo5585r700g1100gkoseur2n	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:24:55.894
cmo558a8100vv100g948bvnkb	cmo558a7c00vt100gkftjgmsa	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:25:01.633
cmo558a8a00vx100gc19zlyat	cmo558a7c00vt100gkftjgmsa	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:25:01.642
cmo558epd01ce100g21bs7bxx	cmo558eoo01cc100g1zgfdf9a	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:25:07.441
cmo558epl01cg100g8ftujcpr	cmo558eoo01cc100g1zgfdf9a	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:25:07.449
cmo558j8101sc100gt7a5q6gu	cmo558j7801sa100gb8g19tm3	Venue Rental	8000.00	1	8000.00	DTI Regular Fund	\N	0	2026-04-19 02:25:13.298
cmo558j8a01se100g6up8e52j	cmo558j7801sa100gb8g19tm3	Meals & Snacks	400.00	50	20000.00	DTI Regular Fund	\N	0	2026-04-19 02:25:13.306
cmp2nztb9000290fgzydti0s4	cmp2nze95000090fgumpv8scg	Snacks	1000.00	10	10000.00	Budget	\N	0	2026-05-12 13:26:42.982
cmp2o0614000490fgruu1x0dh	cmp2nze95000090fgumpv8scg	Materials	500.00	50	25000.00	Budget	\N	1	2026-05-12 13:26:59.464
\.


--
-- Data for Name: training_effectiveness_evaluations; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.training_effectiveness_evaluations (id, impact_survey_response_id, applied_learnings, benefit_increased_sales, benefit_sales_pct, benefit_increased_profit, benefit_profit_pct, benefit_cost_reduction, benefit_cost_pct, benefit_new_markets, benefit_productivity, benefit_manpower_welfare, benefit_standardized_op, benefit_bookkeeping, benefit_improved_mgmt, benefit_setup_business, benefit_expand_business, benefit_enhanced_capacity, benefit_adopt_technology, benefit_innovation, benefit_no_complaints, benefit_others, needs_product_development, needs_loan_advisory, needs_others, future_training_requests, training_effective, ineffective_reason, respondent_designation, respondent_company, date_accomplished, created_at) FROM stdin;
\.


--
-- Data for Name: training_effectiveness_reports; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.training_effectiveness_reports (id, event_id, status, observations, prepared_by_id, reviewed_by_id, approved_by_id, submitted_to_maa_by_id, date_prepared, date_reviewed, date_approved, date_submitted_to_maa, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: training_risk_items; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.training_risk_items (id, event_id, risk_description, action_plan, action_date, responsible_person, effectiveness, order_index, created_at) FROM stdin;
cmo4dkdr100048ytwvpghnvay	cmo4djivv00008ytwvg5kp95a	risk	action	\N	person	\N	0	2026-04-18 13:30:36.829
cmo4ff7e20006sq0j4ypbdk08	cmo4ff7a90000sq0j3py5r6zc	Low attendance due to scheduling conflicts	Send reminders 1 week and 1 day before event	\N	Event Organizer	\N	0	2026-04-18 14:22:34.539
cmo4ffr10001dsq0j9rs0cyld	cmo4ffqxm0017sq0jpfl3sswp	Low attendance due to scheduling conflicts	Send reminders 1 week and 1 day before event	\N	Event Organizer	\N	0	2026-04-18 14:22:59.989
cmo4fm7xh000613i65727zdci	cmo4fm7tl000013i65nq60ql9	Low attendance due to scheduling conflicts	Send reminders 1 week and 1 day before event	\N	Event Organizer	\N	0	2026-04-18 14:28:01.83
cmo553x6q0006bf087xpchoqz	cmo553x4p0000bf08wscm80zn	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:21:38.115
cmo553xje001dbf084g5w1ph9	cmo553xi40017bf08k1kzzfep	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:21:38.57
cmo553xv1002kbf0890tkvmho	cmo553xts002ebf0899aueskl	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:21:38.989
cmo553y67003rbf08wb340wfn	cmo553y50003lbf08v5q5dlpc	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:21:39.391
cmo553yi2004ybf08tsacway8	cmo553yh0004sbf08bn61lcqs	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:21:39.818
cmo555fb70065bf08iiuk37xf	cmo555f9x005zbf0853edgeal	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:22:48.26
cmo555iqj00iobf08v1hwfl5r	cmo555ipb00iibf08ubpwnt83	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:22:52.7
cmo555j1t00jvbf08xa1uq5dj	cmo555j0n00jpbf08zx94o2jr	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:22:53.105
cmo5581740006100gx8d47e6r	cmo55815b0000100gwzv2dbyo	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:24:49.937
cmo5585st00g7100gt1bo76f1	cmo5585r700g1100gkoseur2n	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:24:55.902
cmo558a8i00vz100g6r3ylp74	cmo558a7c00vt100gkftjgmsa	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:25:01.651
cmo558ept01ci100gywg0sa9w	cmo558eoo01cc100g1zgfdf9a	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:25:07.457
cmo558j8i01sg100gkt27xq49	cmo558j7801sa100gb8g19tm3	Insufficient participant turnout	Early promotion via social media and Negosyo Centers	\N	Event Organizer	\N	0	2026-04-19 02:25:13.314
cmp2o0dca000690fg22ti02sr	cmp2nze95000090fgumpv8scg	Risk	Action	\N	Marlon	\N	0	2026-05-12 13:27:08.939
\.


--
-- Data for Name: training_speakers; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.training_speakers (id, event_id, name, organization, topic, display_order, created_at) FROM stdin;
cmo4ff7em000asq0ju40uqk6d	cmo4ff7a90000sq0j3py5r6zc	Dr. Maria Santos	DTI Region VII	Digital Marketing Fundamentals	0	2026-04-18 14:22:34.558
cmo4ffr1p001hsq0jlue5w84q	cmo4ffqxm0017sq0jpfl3sswp	Dr. Maria Santos	DTI Region VII	Digital Marketing Fundamentals	0	2026-04-18 14:23:00.013
cmo4fm7y5000a13i6mdvs6okj	cmo4fm7tl000013i65nq60ql9	Dr. Maria Santos	DTI Region VII	Digital Marketing Fundamentals	0	2026-04-18 14:28:01.853
cmo553x76000abf08dgdhb28k	cmo553x4p0000bf08wscm80zn	Engr. Roberto Lim	DTI Region VII	E-Commerce Platform Management	0	2026-04-19 02:21:38.131
cmo553xju001hbf08h7av6gie	cmo553xi40017bf08k1kzzfep	Atty. Carmen Velasco	DTI Region VII	Business Registration & Compliance	0	2026-04-19 02:21:38.587
cmo553xvj002obf0834gdi77z	cmo553xts002ebf0899aueskl	Dr. Patricia Reyes	DTI Region VII	Consumer Protection Law	0	2026-04-19 02:21:39.007
cmo553y6o003vbf08nqpv8nmv	cmo553y50003lbf08v5q5dlpc	Prof. Eduardo Tan	DTI Region VII	Export Documentation & Standards	0	2026-04-19 02:21:39.409
cmo553yif0052bf08d1nn8y0d	cmo553yh0004sbf08bn61lcqs	Ms. Gloria Mercado	DTI Region VII	Product Development & Branding	0	2026-04-19 02:21:39.832
cmo555fbq0069bf08mhz1ucxq	cmo555f9x005zbf0853edgeal	Engr. Roberto Lim	DTI Region VII	E-Commerce Platform Management	0	2026-04-19 02:22:48.278
cmo555ir100isbf08btmisjqt	cmo555ipb00iibf08ubpwnt83	Atty. Carmen Velasco	DTI Region VII	Business Registration & Compliance	0	2026-04-19 02:22:52.717
cmo555j2a00jzbf08nl6ye0u3	cmo555j0n00jpbf08zx94o2jr	Dr. Patricia Reyes	DTI Region VII	Consumer Protection Law	0	2026-04-19 02:22:53.123
cmo55817n000a100go0jffgd5	cmo55815b0000100gwzv2dbyo	Engr. Roberto Lim	DTI Region VII	E-Commerce Platform Management	0	2026-04-19 02:24:49.956
cmo5585t800gb100g06o0741v	cmo5585r700g1100gkoseur2n	Atty. Carmen Velasco	DTI Region VII	Business Registration & Compliance	0	2026-04-19 02:24:55.917
cmo558a8z00w3100ggj9hi6q0	cmo558a7c00vt100gkftjgmsa	Dr. Patricia Reyes	DTI Region VII	Consumer Protection Law	0	2026-04-19 02:25:01.667
cmo558eqa01cm100gkh5cv1ev	cmo558eoo01cc100g1zgfdf9a	Prof. Eduardo Tan	DTI Region VII	Export Documentation & Standards	0	2026-04-19 02:25:07.474
cmo558j8x01sk100gl13ahskc	cmo558j7801sa100gb8g19tm3	Ms. Gloria Mercado	DTI Region VII	Product Development & Branding	0	2026-04-19 02:25:13.33
cmoclfama00181w8smsql5msw	cmocl0xwk00041w8skllixjad	tough	dti	\N	0	2026-04-24 07:32:45.826
cmocm57r7002f1w8srtzl18u6	cmocm26ej001b1w8syavkdvtc	fasf	fsaf	saf	0	2026-04-24 07:52:55.172
cmp1zblmg0011me1wnm6vwjpc	cmp171iiu00005ckaazxybh61	Bryll Yu	\N	\N	0	2026-05-12 01:56:02.488
\.


--
-- Data for Name: training_target_groups; Type: TABLE DATA; Schema: event_schema; Owner: dti_ems
--

COPY event_schema.training_target_groups (id, event_id, edt_level, sector_group, estimated_participants, order_index, created_at) FROM stdin;
cmo4dkrd200068ytwde8mdy7f	cmo4djivv00008ytwvg5kp95a	EDT 1	Sector Groups	20	0	2026-04-18 13:30:54.47
cmo4ff7ed0008sq0jll89c01p	cmo4ff7a90000sq0j3py5r6zc	\N	MSMEs - Retail	30	0	2026-04-18 14:22:34.549
cmo4ffr1d001fsq0jyj076rqe	cmo4ffqxm0017sq0jpfl3sswp	\N	MSMEs - Retail	30	0	2026-04-18 14:23:00.001
cmo4fm7xs000813i68o4a6hor	cmo4fm7tl000013i65nq60ql9	\N	MSMEs - Retail	30	0	2026-04-18 14:28:01.841
cmo553x6y0008bf081lry408m	cmo553x4p0000bf08wscm80zn	\N	MSMEs	50	0	2026-04-19 02:21:38.123
cmo553xjm001fbf08gkdlch26	cmo553xi40017bf08k1kzzfep	\N	Startups	50	0	2026-04-19 02:21:38.578
cmo553xv9002mbf08lkeuel3l	cmo553xts002ebf0899aueskl	\N	Consumers	50	0	2026-04-19 02:21:38.998
cmo553y6f003tbf086zse0764	cmo553y50003lbf08v5q5dlpc	\N	Exporters	50	0	2026-04-19 02:21:39.4
cmo553yi90050bf08yddntxiv	cmo553yh0004sbf08bn61lcqs	\N	Artisans	50	0	2026-04-19 02:21:39.825
cmo555fbg0067bf08iveztuos	cmo555f9x005zbf0853edgeal	\N	MSMEs	50	0	2026-04-19 02:22:48.269
cmo555iqs00iqbf08c08v7cwf	cmo555ipb00iibf08ubpwnt83	\N	Startups	50	0	2026-04-19 02:22:52.709
cmo555j2200jxbf08hz5wqgz9	cmo555j0n00jpbf08zx94o2jr	\N	Consumers	50	0	2026-04-19 02:22:53.114
cmo55817e0008100giiqrdngh	cmo55815b0000100gwzv2dbyo	\N	MSMEs	50	0	2026-04-19 02:24:49.946
cmo5585t100g9100gr0t6b7t2	cmo5585r700g1100gkoseur2n	\N	Startups	50	0	2026-04-19 02:24:55.91
cmo558a8q00w1100gkhxwf29j	cmo558a7c00vt100gkftjgmsa	\N	Consumers	50	0	2026-04-19 02:25:01.659
cmo558eq101ck100gvndpz19k	cmo558eoo01cc100g1zgfdf9a	\N	Exporters	50	0	2026-04-19 02:25:07.466
cmo558j8p01si100g20u366rn	cmo558j7801sa100gb8g19tm3	\N	Artisans	50	0	2026-04-19 02:25:13.322
cmp2o0mqb000890fg8ll7f3ta	cmp2nze95000090fgumpv8scg	Level 1	4Ps	20	0	2026-05-12 13:27:21.108
cmp2o0rgj000a90fgs0rlrdaz	cmp2nze95000090fgumpv8scg	Level 1	OFW	20	1	2026-05-12 13:27:27.235
\.


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: checklist_comments checklist_comments_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.checklist_comments
    ADD CONSTRAINT checklist_comments_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: csf_speaker_ratings csf_speaker_ratings_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.csf_speaker_ratings
    ADD CONSTRAINT csf_speaker_ratings_pkey PRIMARY KEY (id);


--
-- Name: csf_survey_responses csf_survey_responses_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.csf_survey_responses
    ADD CONSTRAINT csf_survey_responses_pkey PRIMARY KEY (id);


--
-- Name: event_checklists event_checklists_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_checklists
    ADD CONSTRAINT event_checklists_pkey PRIMARY KEY (id);


--
-- Name: event_materials event_materials_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_materials
    ADD CONSTRAINT event_materials_pkey PRIMARY KEY (id);


--
-- Name: event_participations event_participations_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_participations
    ADD CONSTRAINT event_participations_pkey PRIMARY KEY (id);


--
-- Name: event_sessions event_sessions_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_sessions
    ADD CONSTRAINT event_sessions_pkey PRIMARY KEY (id);


--
-- Name: event_staff event_staff_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_staff
    ADD CONSTRAINT event_staff_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: impact_survey_responses impact_survey_responses_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.impact_survey_responses
    ADD CONSTRAINT impact_survey_responses_pkey PRIMARY KEY (id);


--
-- Name: par_beneficiary_groups par_beneficiary_groups_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.par_beneficiary_groups
    ADD CONSTRAINT par_beneficiary_groups_pkey PRIMARY KEY (id);


--
-- Name: post_activity_reports post_activity_reports_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.post_activity_reports
    ADD CONSTRAINT post_activity_reports_pkey PRIMARY KEY (id);


--
-- Name: pre_proposal_tnas pre_proposal_tnas_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.pre_proposal_tnas
    ADD CONSTRAINT pre_proposal_tnas_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: proposal_attachments proposal_attachments_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.proposal_attachments
    ADD CONSTRAINT proposal_attachments_pkey PRIMARY KEY (id);


--
-- Name: tna_respondents tna_respondents_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.tna_respondents
    ADD CONSTRAINT tna_respondents_pkey PRIMARY KEY (id);


--
-- Name: tna_responses tna_responses_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.tna_responses
    ADD CONSTRAINT tna_responses_pkey PRIMARY KEY (id);


--
-- Name: training_budget_items training_budget_items_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_budget_items
    ADD CONSTRAINT training_budget_items_pkey PRIMARY KEY (id);


--
-- Name: training_effectiveness_evaluations training_effectiveness_evaluations_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_effectiveness_evaluations
    ADD CONSTRAINT training_effectiveness_evaluations_pkey PRIMARY KEY (id);


--
-- Name: training_effectiveness_reports training_effectiveness_reports_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_effectiveness_reports
    ADD CONSTRAINT training_effectiveness_reports_pkey PRIMARY KEY (id);


--
-- Name: training_risk_items training_risk_items_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_risk_items
    ADD CONSTRAINT training_risk_items_pkey PRIMARY KEY (id);


--
-- Name: training_speakers training_speakers_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_speakers
    ADD CONSTRAINT training_speakers_pkey PRIMARY KEY (id);


--
-- Name: training_target_groups training_target_groups_pkey; Type: CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_target_groups
    ADD CONSTRAINT training_target_groups_pkey PRIMARY KEY (id);


--
-- Name: attendance_records_participation_id_session_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX attendance_records_participation_id_session_id_key ON event_schema.attendance_records USING btree (participation_id, session_id);


--
-- Name: certificates_participation_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX certificates_participation_id_key ON event_schema.certificates USING btree (participation_id);


--
-- Name: certificates_user_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX certificates_user_id_idx ON event_schema.certificates USING btree (user_id);


--
-- Name: certificates_verification_code_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX certificates_verification_code_idx ON event_schema.certificates USING btree (verification_code);


--
-- Name: certificates_verification_code_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX certificates_verification_code_key ON event_schema.certificates USING btree (verification_code);


--
-- Name: checklist_comments_item_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX checklist_comments_item_id_idx ON event_schema.checklist_comments USING btree (item_id);


--
-- Name: checklist_items_checklist_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX checklist_items_checklist_id_idx ON event_schema.checklist_items USING btree (checklist_id);


--
-- Name: checklist_items_parent_item_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX checklist_items_parent_item_id_idx ON event_schema.checklist_items USING btree (parent_item_id);


--
-- Name: checklist_items_phase_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX checklist_items_phase_idx ON event_schema.checklist_items USING btree (phase);


--
-- Name: checklist_items_status_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX checklist_items_status_idx ON event_schema.checklist_items USING btree (status);


--
-- Name: csf_speaker_ratings_csf_response_id_speaker_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX csf_speaker_ratings_csf_response_id_speaker_id_key ON event_schema.csf_speaker_ratings USING btree (csf_response_id, speaker_id);


--
-- Name: csf_survey_responses_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX csf_survey_responses_event_id_idx ON event_schema.csf_survey_responses USING btree (event_id);


--
-- Name: csf_survey_responses_participation_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX csf_survey_responses_participation_id_key ON event_schema.csf_survey_responses USING btree (participation_id);


--
-- Name: csf_survey_responses_status_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX csf_survey_responses_status_idx ON event_schema.csf_survey_responses USING btree (status);


--
-- Name: csf_survey_responses_user_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX csf_survey_responses_user_id_idx ON event_schema.csf_survey_responses USING btree (user_id);


--
-- Name: event_checklists_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_checklists_event_id_idx ON event_schema.event_checklists USING btree (event_id);


--
-- Name: event_materials_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_materials_event_id_idx ON event_schema.event_materials USING btree (event_id);


--
-- Name: event_materials_expires_at_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_materials_expires_at_idx ON event_schema.event_materials USING btree (expires_at);


--
-- Name: event_participations_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_participations_event_id_idx ON event_schema.event_participations USING btree (event_id);


--
-- Name: event_participations_event_id_user_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX event_participations_event_id_user_id_key ON event_schema.event_participations USING btree (event_id, user_id);


--
-- Name: event_participations_status_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_participations_status_idx ON event_schema.event_participations USING btree (status);


--
-- Name: event_participations_user_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_participations_user_id_idx ON event_schema.event_participations USING btree (user_id);


--
-- Name: event_staff_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_staff_event_id_idx ON event_schema.event_staff USING btree (event_id);


--
-- Name: event_staff_event_id_user_id_role_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX event_staff_event_id_user_id_role_key ON event_schema.event_staff USING btree (event_id, user_id, role);


--
-- Name: event_staff_user_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX event_staff_user_id_idx ON event_schema.event_staff USING btree (user_id);


--
-- Name: events_assigned_organizer_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX events_assigned_organizer_id_idx ON event_schema.events USING btree (assigned_organizer_id);


--
-- Name: events_organizer_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX events_organizer_id_idx ON event_schema.events USING btree (organizer_id);


--
-- Name: events_start_date_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX events_start_date_idx ON event_schema.events USING btree (start_date);


--
-- Name: events_status_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX events_status_idx ON event_schema.events USING btree (status);


--
-- Name: impact_survey_responses_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX impact_survey_responses_event_id_idx ON event_schema.impact_survey_responses USING btree (event_id);


--
-- Name: impact_survey_responses_participation_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX impact_survey_responses_participation_id_key ON event_schema.impact_survey_responses USING btree (participation_id);


--
-- Name: impact_survey_responses_scheduled_at_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX impact_survey_responses_scheduled_at_idx ON event_schema.impact_survey_responses USING btree (scheduled_at);


--
-- Name: impact_survey_responses_status_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX impact_survey_responses_status_idx ON event_schema.impact_survey_responses USING btree (status);


--
-- Name: impact_survey_responses_user_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX impact_survey_responses_user_id_idx ON event_schema.impact_survey_responses USING btree (user_id);


--
-- Name: post_activity_reports_event_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX post_activity_reports_event_id_key ON event_schema.post_activity_reports USING btree (event_id);


--
-- Name: pre_proposal_tnas_conducted_by_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX pre_proposal_tnas_conducted_by_idx ON event_schema.pre_proposal_tnas USING btree (conducted_by);


--
-- Name: pre_proposal_tnas_sector_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX pre_proposal_tnas_sector_idx ON event_schema.pre_proposal_tnas USING btree (sector);


--
-- Name: pre_proposal_tnas_status_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX pre_proposal_tnas_status_idx ON event_schema.pre_proposal_tnas USING btree (status);


--
-- Name: proposal_attachments_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX proposal_attachments_event_id_idx ON event_schema.proposal_attachments USING btree (event_id);


--
-- Name: tna_respondents_tna_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX tna_respondents_tna_id_idx ON event_schema.tna_respondents USING btree (tna_id);


--
-- Name: tna_responses_participation_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX tna_responses_participation_id_key ON event_schema.tna_responses USING btree (participation_id);


--
-- Name: training_budget_items_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX training_budget_items_event_id_idx ON event_schema.training_budget_items USING btree (event_id);


--
-- Name: training_effectiveness_evaluations_impact_survey_response_i_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX training_effectiveness_evaluations_impact_survey_response_i_key ON event_schema.training_effectiveness_evaluations USING btree (impact_survey_response_id);


--
-- Name: training_effectiveness_reports_event_id_key; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE UNIQUE INDEX training_effectiveness_reports_event_id_key ON event_schema.training_effectiveness_reports USING btree (event_id);


--
-- Name: training_risk_items_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX training_risk_items_event_id_idx ON event_schema.training_risk_items USING btree (event_id);


--
-- Name: training_speakers_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX training_speakers_event_id_idx ON event_schema.training_speakers USING btree (event_id);


--
-- Name: training_target_groups_event_id_idx; Type: INDEX; Schema: event_schema; Owner: dti_ems
--

CREATE INDEX training_target_groups_event_id_idx ON event_schema.training_target_groups USING btree (event_id);


--
-- Name: attendance_records attendance_records_participation_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.attendance_records
    ADD CONSTRAINT attendance_records_participation_id_fkey FOREIGN KEY (participation_id) REFERENCES event_schema.event_participations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_session_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.attendance_records
    ADD CONSTRAINT attendance_records_session_id_fkey FOREIGN KEY (session_id) REFERENCES event_schema.event_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certificates certificates_participation_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.certificates
    ADD CONSTRAINT certificates_participation_id_fkey FOREIGN KEY (participation_id) REFERENCES event_schema.event_participations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_comments checklist_comments_item_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.checklist_comments
    ADD CONSTRAINT checklist_comments_item_id_fkey FOREIGN KEY (item_id) REFERENCES event_schema.checklist_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_items checklist_items_checklist_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.checklist_items
    ADD CONSTRAINT checklist_items_checklist_id_fkey FOREIGN KEY (checklist_id) REFERENCES event_schema.event_checklists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_items checklist_items_parent_item_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.checklist_items
    ADD CONSTRAINT checklist_items_parent_item_id_fkey FOREIGN KEY (parent_item_id) REFERENCES event_schema.checklist_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: csf_speaker_ratings csf_speaker_ratings_csf_response_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.csf_speaker_ratings
    ADD CONSTRAINT csf_speaker_ratings_csf_response_id_fkey FOREIGN KEY (csf_response_id) REFERENCES event_schema.csf_survey_responses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: csf_speaker_ratings csf_speaker_ratings_speaker_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.csf_speaker_ratings
    ADD CONSTRAINT csf_speaker_ratings_speaker_id_fkey FOREIGN KEY (speaker_id) REFERENCES event_schema.training_speakers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: csf_survey_responses csf_survey_responses_participation_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.csf_survey_responses
    ADD CONSTRAINT csf_survey_responses_participation_id_fkey FOREIGN KEY (participation_id) REFERENCES event_schema.event_participations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_checklists event_checklists_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_checklists
    ADD CONSTRAINT event_checklists_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_materials event_materials_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_materials
    ADD CONSTRAINT event_materials_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_participations event_participations_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_participations
    ADD CONSTRAINT event_participations_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_sessions event_sessions_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_sessions
    ADD CONSTRAINT event_sessions_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_staff event_staff_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.event_staff
    ADD CONSTRAINT event_staff_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: events events_program_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.events
    ADD CONSTRAINT events_program_id_fkey FOREIGN KEY (program_id) REFERENCES event_schema.programs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: impact_survey_responses impact_survey_responses_participation_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.impact_survey_responses
    ADD CONSTRAINT impact_survey_responses_participation_id_fkey FOREIGN KEY (participation_id) REFERENCES event_schema.event_participations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: par_beneficiary_groups par_beneficiary_groups_report_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.par_beneficiary_groups
    ADD CONSTRAINT par_beneficiary_groups_report_id_fkey FOREIGN KEY (report_id) REFERENCES event_schema.post_activity_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_activity_reports post_activity_reports_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.post_activity_reports
    ADD CONSTRAINT post_activity_reports_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: proposal_attachments proposal_attachments_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.proposal_attachments
    ADD CONSTRAINT proposal_attachments_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tna_respondents tna_respondents_tna_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.tna_respondents
    ADD CONSTRAINT tna_respondents_tna_id_fkey FOREIGN KEY (tna_id) REFERENCES event_schema.pre_proposal_tnas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tna_responses tna_responses_participation_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.tna_responses
    ADD CONSTRAINT tna_responses_participation_id_fkey FOREIGN KEY (participation_id) REFERENCES event_schema.event_participations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_budget_items training_budget_items_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_budget_items
    ADD CONSTRAINT training_budget_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_effectiveness_evaluations training_effectiveness_evaluations_impact_survey_response__fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_effectiveness_evaluations
    ADD CONSTRAINT training_effectiveness_evaluations_impact_survey_response__fkey FOREIGN KEY (impact_survey_response_id) REFERENCES event_schema.impact_survey_responses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_effectiveness_reports training_effectiveness_reports_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_effectiveness_reports
    ADD CONSTRAINT training_effectiveness_reports_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_risk_items training_risk_items_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_risk_items
    ADD CONSTRAINT training_risk_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_speakers training_speakers_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_speakers
    ADD CONSTRAINT training_speakers_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: training_target_groups training_target_groups_event_id_fkey; Type: FK CONSTRAINT; Schema: event_schema; Owner: dti_ems
--

ALTER TABLE ONLY event_schema.training_target_groups
    ADD CONSTRAINT training_target_groups_event_id_fkey FOREIGN KEY (event_id) REFERENCES event_schema.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

