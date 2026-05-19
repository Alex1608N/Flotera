-- Parolele reale stau in schema auth.users din Supabase
-- public.users pentru business data
-- Dummy IDs

INSERT INTO users (id, email, name, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'alex.owner@flotera.ro', 'Alex (Owner)', 'OWNER');

INSERT INTO users (id, email, name, role)
VALUES ('22222222-2222-2222-2222-222222222222', 'dan.driver@flotera.ro', 'Dan (Sofer)', 'DRIVER');
