-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARTICIPANT', 'ENTERPRISE_REPRESENTATIVE', 'PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "EnterpriseStage" AS ENUM ('IDEATION', 'VALIDATION', 'GROWTH', 'EXPANSION', 'MATURITY_EXIT');

-- CreateEnum
CREATE TYPE "MsmeLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_1_1', 'LEVEL_1_2', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'CEASED');

-- CreateEnum
CREATE TYPE "FormOfOrganization" AS ENUM ('SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'ASSOCIATION', 'CORPORATION', 'COOPERATIVE', 'WORKERS_RURAL_ASSOCIATION', 'ONE_PERSON_CORPORATION', 'FRANCHISE');

-- CreateEnum
CREATE TYPE "AssetSizeClassification" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "BusinessActivity" AS ENUM ('MANUFACTURING_PRODUCING', 'WHOLESALING_TRADING', 'RETAILING_TRADING', 'EXPORTING', 'IMPORTING', 'SERVICE');

-- CreateEnum
CREATE TYPE "EdtLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4');

-- CreateEnum
CREATE TYPE "RipplesStage" AS ENUM ('STAGE_5', 'STAGE_6', 'STAGE_7');

-- CreateEnum
CREATE TYPE "SmeraStage" AS ENUM ('STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4');

-- CreateEnum
CREATE TYPE "DigitalizationLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PARTICIPANT',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "mobile_number" TEXT,
    "region" TEXT,
    "province" TEXT,
    "city_municipality" TEXT,
    "barangay" TEXT,
    "name_suffix" TEXT,
    "sex" TEXT,
    "birth_date" TIMESTAMP(3),
    "age_bracket" TEXT,
    "employment_category" TEXT,
    "social_classification" TEXT,
    "client_type" TEXT,
    "job_title" TEXT,
    "industry_classification" TEXT,
    "dpa_consent_given" BOOLEAN NOT NULL DEFAULT false,
    "dpa_consent_at" TIMESTAMP(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "verify_token" TEXT,
    "verify_token_exp" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_exp" TIMESTAMP(3),
    "invite_token" TEXT,
    "invite_token_exp" TIMESTAMP(3),
    "invited_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cpms_id_number" TEXT,
    "old_cpms_id_number" TEXT,
    "philsys_number" TEXT,
    "tin_number" TEXT,
    "dti_konek_id_number" TEXT,
    "msme_level" "MsmeLevel",
    "level_zero_categories" TEXT[],
    "business_is_registered" BOOLEAN,
    "business_name" TEXT NOT NULL,
    "registered_business_name" TEXT,
    "trade_name" TEXT,
    "date_of_registration" TIMESTAMP(3),
    "registration_no" TEXT,
    "ipo_registration_number" TEXT,
    "business_registrations" JSONB,
    "business_permits" JSONB,
    "secondary_licenses" JSONB,
    "house_no" TEXT,
    "street_name" TEXT,
    "street_address" TEXT,
    "barangay" TEXT,
    "district" TEXT,
    "city_municipality" TEXT,
    "province" TEXT,
    "region" TEXT,
    "zip_code" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "business_email" TEXT,
    "business_phone" TEXT,
    "business_fax" TEXT,
    "website_url" TEXT,
    "social_media_facebook" TEXT,
    "social_media_instagram" TEXT,
    "social_media_linkedin" TEXT,
    "social_media_others" TEXT,
    "ecommerce_platforms" JSONB,
    "description" TEXT,
    "year_established" INTEGER,
    "form_of_organization" "FormOfOrganization",
    "asset_size_classification" "AssetSizeClassification",
    "primary_business_activity" "BusinessActivity",
    "secondary_business_activity" "BusinessActivity",
    "psic_section" TEXT,
    "psic_division" TEXT,
    "psic_group" TEXT,
    "priority_industry" TEXT,
    "industry_cluster_enhancement" TEXT,
    "industry_sector" TEXT NOT NULL,
    "industry_tags" TEXT[],
    "trade_association_affiliations" TEXT[],
    "stage" "EnterpriseStage" NOT NULL DEFAULT 'VALIDATION',
    "owner_prefix" TEXT,
    "owner_first_name" TEXT,
    "owner_middle_name" TEXT,
    "owner_last_name" TEXT,
    "owner_suffix" TEXT,
    "owner_birthdate" TIMESTAMP(3),
    "owner_citizenship" TEXT,
    "owner_sex" TEXT,
    "owner_civil_status" TEXT,
    "owner_social_classification" TEXT,
    "owner_house_no" TEXT,
    "owner_street_name" TEXT,
    "owner_barangay" TEXT,
    "owner_district" TEXT,
    "owner_city_municipality" TEXT,
    "owner_province" TEXT,
    "owner_region" TEXT,
    "owner_zip_code" TEXT,
    "edt_level" "EdtLevel",
    "ripples_stage" "RipplesStage",
    "smera_stage" "SmeraStage",
    "digitalization_level" "DigitalizationLevel",
    "digital_tools_used" JSONB,
    "has_email" BOOLEAN,
    "has_facebook" BOOLEAN,
    "initial_capitalization" DECIMAL(18,2),
    "initial_capitalization_year" INTEGER,
    "authorized_capital" DECIMAL(18,2),
    "subscribed_capital" DECIMAL(18,2),
    "paid_up_capital" DECIMAL(18,2),
    "asset_size_range" TEXT,
    "domestic_sales" DECIMAL(18,2),
    "export_sales" DECIMAL(18,4),
    "annual_revenue" DECIMAL(15,2),
    "domestic_markets" JSONB,
    "export_markets" JSONB,
    "import_markets" JSONB,
    "product_lines" JSONB,
    "product_certifications" JSONB,
    "ft_abled_male" INTEGER,
    "ft_abled_female" INTEGER,
    "ft_diff_abled_male" INTEGER,
    "ft_diff_abled_female" INTEGER,
    "ft_indigenous_male" INTEGER,
    "ft_indigenous_female" INTEGER,
    "ft_senior_male" INTEGER,
    "ft_senior_female" INTEGER,
    "pt_abled_male" INTEGER,
    "pt_abled_female" INTEGER,
    "pt_diff_abled_male" INTEGER,
    "pt_diff_abled_female" INTEGER,
    "pt_indigenous_male" INTEGER,
    "pt_indigenous_female" INTEGER,
    "pt_senior_male" INTEGER,
    "pt_senior_female" INTEGER,
    "employee_count" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_publicly_listed" BOOLEAN NOT NULL DEFAULT false,
    "profile_update_due" BOOLEAN NOT NULL DEFAULT true,
    "profile_last_updated_at" TIMESTAMP(3),
    "profile_last_updated_by" TEXT,
    "annual_update_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_update_logs" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_year" INTEGER NOT NULL,
    "update_type" TEXT NOT NULL,
    "changed_fields" JSONB NOT NULL,
    "snapshot_after" JSONB NOT NULL,
    "ip_address" TEXT,
    "notes" TEXT,

    CONSTRAINT "enterprise_update_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_memberships" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enterprise_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by" TEXT,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE INDEX "enterprise_update_logs_enterprise_id_idx" ON "enterprise_update_logs"("enterprise_id");

-- CreateIndex
CREATE INDEX "enterprise_update_logs_updated_by_idx" ON "enterprise_update_logs"("updated_by");

-- CreateIndex
CREATE INDEX "enterprise_update_logs_update_year_idx" ON "enterprise_update_logs"("update_year");

-- CreateIndex
CREATE INDEX "enterprise_update_logs_updated_at_idx" ON "enterprise_update_logs"("updated_at");

-- CreateIndex
CREATE INDEX "enterprise_memberships_user_id_idx" ON "enterprise_memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_memberships_enterprise_id_user_id_key" ON "enterprise_memberships"("enterprise_id", "user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "role_configs_name_key" ON "role_configs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_group_idx" ON "permissions"("group");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- AddForeignKey
ALTER TABLE "enterprise_profiles" ADD CONSTRAINT "enterprise_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_update_logs" ADD CONSTRAINT "enterprise_update_logs_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_memberships" ADD CONSTRAINT "enterprise_memberships_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprise_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_memberships" ADD CONSTRAINT "enterprise_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
