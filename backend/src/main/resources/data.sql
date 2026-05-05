-- Deoarece folosim Supabase Auth, parolele reale vor sta în schema 'auth.users' a Supabase-ului.
-- Acest tabel 'public.users' este doar pentru datele noastre de business.
-- Inserăm niște id-uri dummy deocamdată.

INSERT INTO users (id, email, name, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'alex.owner@flotera.ro', 'Alex (Owner)', 'OWNER');

INSERT INTO users (id, email, name, role)
VALUES ('22222222-2222-2222-2222-222222222222', 'dan.driver@flotera.ro', 'Dan (Sofer)', 'DRIVER');
