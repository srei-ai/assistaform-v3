create extension if not exists "pgcrypto";

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  public_id uuid unique not null default gen_random_uuid(),
  title text not null,
  schema jsonb not null,
  created_at timestamptz default now()
);
alter table public.forms enable row level security;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  answers jsonb not null,
  mood text check (mood in ('neutral','positive','frustrated','worried','confused')),
  time_budget text check (time_budget in ('fast','five','more')),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz default now()
);
create index if not exists idx_submissions_form_id on public.submissions(form_id);
create index if not exists idx_submissions_created_at on public.submissions(created_at);
alter table public.submissions enable row level security;
