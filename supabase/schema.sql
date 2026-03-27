create extension if not exists pgcrypto;

create table if not exists public.invest_track_users (
  id uuid primary key,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.invest_track_cloud_data (
  user_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists invest_track_users_email_idx
  on public.invest_track_users (email);
