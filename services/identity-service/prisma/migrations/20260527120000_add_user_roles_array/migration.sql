ALTER TABLE "user_profiles"
ADD COLUMN "roles" "UserRole"[] NOT NULL DEFAULT ARRAY['PARTICIPANT']::"UserRole"[];

UPDATE "user_profiles"
SET "roles" = ARRAY["role"]::"UserRole"[];
