-- Update or insert admin user
-- Password: Pislis@123

-- First, update the old admin if it exists
UPDATE users 
SET email = 'pisliskontint@gmail.com',
    password = '$2a$12$aHnSBkxOHTLiNY0ecKS3s.09r1CV0qtCdKwOeIu00ZX3SrfFFsGBC',
    role = 'admin',
    password_set = true
WHERE email = 'admin@darwin.edu';

-- If no admin exists, insert new one
INSERT INTO users (name, email, password, role, password_set)
VALUES (
  'Admin',
  'pisliskontint@gmail.com',
  '$2a$12$aHnSBkxOHTLiNY0ecKS3s.09r1CV0qtCdKwOeIu00ZX3SrfFFsGBC',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;
