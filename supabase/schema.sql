create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  instagram_handle text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_in_date date not null,
  caption text,
  photo_url text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint check_ins_unique_user_date unique (user_id, check_in_date)
);

insert into storage.buckets (id, name, public)
values ('check-in-photos', 'check-in-photos', false)
on conflict (id) do nothing;

create policy "service role can manage challenge photos"
on storage.objects
for all
to service_role
using (bucket_id = 'check-in-photos')
with check (bucket_id = 'check-in-photos');
