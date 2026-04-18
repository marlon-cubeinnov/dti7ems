-- PostgreSQL init script — runs once on first container start
-- Creates separate schemas for each microservice

CREATE SCHEMA IF NOT EXISTS identity_schema;
CREATE SCHEMA IF NOT EXISTS event_schema;
CREATE SCHEMA IF NOT EXISTS survey_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;
CREATE SCHEMA IF NOT EXISTS analytics_schema;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Grant schema permissions to app user
GRANT ALL ON SCHEMA identity_schema TO dti_ems;
GRANT ALL ON SCHEMA event_schema TO dti_ems;
GRANT ALL ON SCHEMA survey_schema TO dti_ems;
GRANT ALL ON SCHEMA notification_schema TO dti_ems;
GRANT ALL ON SCHEMA analytics_schema TO dti_ems;
