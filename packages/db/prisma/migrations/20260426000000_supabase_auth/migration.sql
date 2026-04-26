-- Migration: NextAuth → Supabase Auth
-- Removes password hashing, session management, and password reset tokens
-- (all now handled by Supabase Auth)

-- Drop Session table (was used by NextAuth JWT strategy)
DROP TABLE IF EXISTS "Session";

-- Drop PasswordResetToken table (Supabase handles password reset natively)
DROP TABLE IF EXISTS "PasswordResetToken";

-- Remove passwordHash column from User (credentials stored in Supabase Auth)
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
