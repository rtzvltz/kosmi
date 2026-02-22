-- Fix voor RLS recursie die een 500 fout veroorzaakt bij het inloggen
-- Voer dit uit in de Supabase SQL Editor

-- Stap 1: Maak helper functies aan die de profiles tabel lezen ZONDER RLS te triggeren
-- (security definer = functie draait als de eigenaar, niet als de ingelogde gebruiker)

create or replace function get_my_role()
returns text as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function get_my_school_id()
returns uuid as $$
  select school_id from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Stap 2: Verwijder de recursieve policies en vervang ze door niet-recursieve versies

-- Profiles: de zelf-refererende policy vervangen
drop policy if exists "School admins can view students in their school" on profiles;

create policy "School admins can view students in their school"
  on profiles for select
  using (
    get_my_role() = 'school_admin'
    and school_id = get_my_school_id()
  );

-- Schools: policy vervangen (queried profiles inside, ook recursief)
drop policy if exists "School admins can view their school" on schools;

create policy "School admins can view their school"
  on schools for select
  using (
    get_my_role() = 'school_admin'
    and id = get_my_school_id()
  );

-- Class assignments: policy vervangen
drop policy if exists "School admins can manage classes in their school" on class_assignments;

create policy "School admins can manage classes in their school"
  on class_assignments for all
  using (
    get_my_role() = 'school_admin'
    and school_id = get_my_school_id()
  );

-- Class students: policy vervangen
drop policy if exists "School admins can manage students in their classes" on class_students;

create policy "School admins can manage students in their classes"
  on class_students for all
  using (
    get_my_role() = 'school_admin'
    and exists (
      select 1 from class_assignments
      where class_assignments.id = class_students.class_id
        and class_assignments.school_id = get_my_school_id()
    )
  );

-- Stap 3: Voeg ontbrekende INSERT policy toe voor profielen
-- (zonder dit kunnen nieuwe gebruikers geen profiel aanmaken bij registratie)
drop policy if exists "Users can insert own profile" on profiles;

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Stap 4: Voeg INSERT policy toe voor scholen (nodig bij schoolregistratie)
drop policy if exists "Allow insert schools during registration" on schools;

create policy "Allow insert schools during registration"
  on schools for insert
  with check (true);
