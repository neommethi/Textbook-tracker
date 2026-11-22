-- schema/tables.sql  (run AFTER users.sql)

create table if not exists public.textbooks (
  id          uuid primary key default gen_random_uuid(),
  book_number text not null unique,
  title       text not null,
  subject     text not null,
  grade       integer check (grade between 8 and 12),
  condition   text not null default 'good'
              check (condition in ('new','good','fair','poor','damaged')),
  created_at  timestamptz not null default now()
);

create table if not exists public.allocations (
  id                 uuid primary key default gen_random_uuid(),
  textbook_id        uuid not null references public.textbooks(id) on delete restrict,
  learner_id         uuid not null references public.users(id) on delete restrict,
  issued_at          timestamptz not null default now(),
  issued_by          uuid references public.users(id) on delete set null,
  condition_issued   text not null default 'good'
                     check (condition_issued in ('new','good','fair','poor','damaged')),
  status             text not null default 'issued'
                     check (status in ('issued','returned','lost','found','damaged')),
  returned_at        timestamptz,
  returned_by        uuid references public.users(id) on delete set null,
  condition_returned text
                     check (condition_returned in ('new','good','fair','poor','damaged')),
  lost_at            timestamptz,
  fee_amount         numeric(8,2) check (fee_amount >= 0),
  fee_status         text not null default 'none'
                     check (fee_status in ('none','owed','paid','refund_due','refunded')),
  notes              text,
  created_at         timestamptz not null default now(),

  -- returned_at empty = book still out. Status must agree with that.
  constraint allocations_status_matches_return check (
    (returned_at is null     and status in ('issued','lost','damaged')) or
    (returned_at is not null and status in ('returned','found'))
  )
);

-- A copy can only be out with ONE learner at a time
create unique index if not exists allocations_one_open_per_book
  on public.allocations (textbook_id) where returned_at is null;

create index if not exists allocations_learner_idx on public.allocations (learner_id);

-- Spot checks (teacher calls names, learner reads out the number)
create table if not exists public.spot_checks (
  id            uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references public.allocations(id) on delete cascade,
  checked_by    uuid references public.users(id) on delete set null,
  checked_at    timestamptz not null default now(),
  condition     text check (condition in ('new','good','fair','poor','damaged')),
  note          text
);

-- History log: who did what, when
create table if not exists public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.users(id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  details    jsonb,
  created_at timestamptz not null default now()
);

-- Lock everything: RLS on, NO policies. Only the server's secret key gets in.
alter table public.textbooks    enable row level security;
alter table public.allocations  enable row level security;
alter table public.spot_checks  enable row level security;
alter table public.activity_log enable row level security;