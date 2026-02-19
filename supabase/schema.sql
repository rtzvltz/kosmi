-- Kosmi Database Schema voor Supabase

-- Schools tabel
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brin_code text,
  city text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Profiles tabel (gekoppeld aan auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text check (role in ('parent', 'student', 'school_admin')) not null,
  school_id uuid references schools(id),
  parent_id uuid references profiles(id),
  groep integer check (groep between 1 and 8),
  display_name text,
  points_total integer default 0,
  created_at timestamptz default now()
);

-- Subscriptions tabel
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  type text check (type in ('family', 'school')),
  status text check (status in ('active', 'cancelled', 'past_due')) default 'active',
  stripe_subscription_id text unique,
  stripe_customer_id text,
  child_count integer default 1,
  class_count integer default 1,
  started_at timestamptz default now(),
  ends_at timestamptz
);

-- Parent-Child links
create table parent_child_links (
  parent_id uuid references profiles(id) on delete cascade,
  child_id uuid references profiles(id) on delete cascade,
  primary key (parent_id, child_id)
);

-- Class assignments (klassen binnen een school)
create table class_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  class_label text not null,
  groep integer check (groep between 1 and 8),
  created_at timestamptz default now()
);

-- Class students (leerlingen per klas)
create table class_students (
  class_id uuid references class_assignments(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  primary key (class_id, student_id)
);

-- Points events (puntenoverzicht)
create table points_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  lesson_payload_id text,
  lesson_variant_groep integer,
  course_payload_id text,
  world_payload_id text,
  event_type text check (event_type in ('lesson_complete', 'depth_accessed', 'character_chat', 'course_complete', 'world_first_visit')),
  points_awarded integer not null,
  created_at timestamptz default now()
);

-- Lesson progress (voortgang per les)
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  lesson_payload_id text not null,
  completed boolean default false,
  depth_accessed boolean default false,
  reflection_answer text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(student_id, lesson_payload_id)
);

-- Indexes voor betere performance
create index idx_profiles_role on profiles(role);
create index idx_profiles_school_id on profiles(school_id);
create index idx_profiles_parent_id on profiles(parent_id);
create index idx_subscriptions_owner_id on subscriptions(owner_id);
create index idx_subscriptions_stripe_subscription_id on subscriptions(stripe_subscription_id);
create index idx_points_events_student_id on points_events(student_id);
create index idx_lesson_progress_student_id on lesson_progress(student_id);
create index idx_class_students_class_id on class_students(class_id);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
alter table schools enable row level security;
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table parent_child_links enable row level security;
alter table class_assignments enable row level security;
alter table class_students enable row level security;
alter table points_events enable row level security;
alter table lesson_progress enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Parents can view their children's profiles"
  on profiles for select
  using (
    exists (
      select 1 from parent_child_links
      where parent_id = auth.uid() and child_id = profiles.id
    )
  );

create policy "School admins can view students in their school"
  on profiles for select
  using (
    exists (
      select 1 from profiles as p
      where p.id = auth.uid()
      and p.role = 'school_admin'
      and p.school_id = profiles.school_id
    )
  );

-- Subscriptions policies
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (owner_id = auth.uid());

create policy "Users can update own subscriptions"
  on subscriptions for update
  using (owner_id = auth.uid());

-- Parent-child links policies
create policy "Parents can view their children links"
  on parent_child_links for select
  using (parent_id = auth.uid());

create policy "Parents can create children links"
  on parent_child_links for insert
  with check (parent_id = auth.uid());

-- Points events policies
create policy "Students can view own points"
  on points_events for select
  using (student_id = auth.uid());

create policy "Parents can view children's points"
  on points_events for select
  using (
    exists (
      select 1 from parent_child_links
      where parent_id = auth.uid() and child_id = points_events.student_id
    )
  );

-- Lesson progress policies
create policy "Students can view own progress"
  on lesson_progress for select
  using (student_id = auth.uid());

create policy "Students can update own progress"
  on lesson_progress for all
  using (student_id = auth.uid());

create policy "Parents can view children's progress"
  on lesson_progress for select
  using (
    exists (
      select 1 from parent_child_links
      where parent_id = auth.uid() and child_id = lesson_progress.student_id
    )
  );

-- Schools policies
create policy "School admins can view their school"
  on schools for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'school_admin'
      and profiles.school_id = schools.id
    )
  );

-- Class assignments policies
create policy "School admins can manage classes in their school"
  on class_assignments for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'school_admin'
      and profiles.school_id = class_assignments.school_id
    )
  );

-- Class students policies
create policy "School admins can manage students in their classes"
  on class_students for all
  using (
    exists (
      select 1 from class_assignments
      join profiles on profiles.school_id = class_assignments.school_id
      where profiles.id = auth.uid()
      and profiles.role = 'school_admin'
      and class_assignments.id = class_students.class_id
    )
  );

-- Function om punten te updaten
create or replace function update_profile_points()
returns trigger as $$
begin
  update profiles
  set points_total = (
    select coalesce(sum(points_awarded), 0)
    from points_events
    where student_id = new.student_id
  )
  where id = new.student_id;
  return new;
end;
$$ language plpgsql;

-- Trigger om punten automatisch bij te werken
create trigger update_points_trigger
  after insert on points_events
  for each row
  execute function update_profile_points();
