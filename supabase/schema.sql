create extension if not exists "pgcrypto";

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  public_id uuid unique not null default gen_random_uuid(),
  title text not null,
  schema jsonb not null,
  created_at timestamptz default now()
);

alter table public.forms enable row level security;
