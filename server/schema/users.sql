-- schema/users.sql
-- Users table for signup/login (Textbook Tracker)

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  password_hash text not null,
  role          text not null default 'user'
                check (role in ('user', 'admin')),
  grade         integer check (grade between 8 and 12),
  class         text,
  created_at    timestamptz not null default now()
);

-- One account per email, and upper/lower case can't create duplicates
create unique index if not exists users_email_lower_idx
  on public.users (lower(email));

-- Lock the table: RLS on with NO policies on purpose.
-- Only the server's secret key can read or write it.
-- The publishable key (browser) gets nothing.
alter table public.users enable row level security;