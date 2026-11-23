-- Schema for the textbook catalog and allocation history.

create table if not exists public.subjects (
  name text not null
);

create table if not exists public.textbooks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  subject    text not null,
  grade      integer not null check (grade between 8 and 12),
  created_at timestamptz not null default now()
);

create table if not exists public.textbook_allocations (
  id                uuid primary key default gen_random_uuid(),
  allocation_number text not null unique,
  textbook_id       uuid not null references public.textbooks(id) on delete restrict,
  learner_id        text not null,
  allocated_at      timestamptz not null default now(),
  returned_at       timestamptz
);

create index if not exists textbook_allocations_learner_idx
  on public.textbook_allocations (learner_id);

create table if not exists public.spot_checks (
  id            uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references public.textbook_allocations(id) on delete cascade,
  checked_by    uuid references public.users(id) on delete set null,
  checked_at    timestamptz not null default now(),
  condition     text check (condition in ('new','good','fair','poor','damaged')),
  note          text
);

create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.users(id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  details    jsonb,
  created_at timestamptz not null default now()
);

alter table public.subjects enable row level security;
alter table public.textbooks enable row level security;
alter table public.textbook_allocations enable row level security;
alter table public.spot_checks enable row level security;
alter table public.activity_log enable row level security;

grant select on public.subjects to service_role;
grant select, insert, update, delete on public.textbooks to service_role;
grant select, insert, update, delete on public.textbook_allocations to service_role;
grant insert on public.activity_log to service_role;
