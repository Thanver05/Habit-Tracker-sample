-- Run this migration in Supabase Studio's SQL Editor before using the app.

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  constraint habits_id_user_id_key unique (id, user_id)
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint habit_completions_habit_id_user_id_fkey
    foreign key (habit_id, user_id)
    references public.habits (id, user_id)
    on delete cascade,
  constraint habit_completions_one_per_day unique (habit_id, completed_on)
);

create index if not exists habits_user_id_created_at_idx
  on public.habits (user_id, created_at);

create index if not exists habit_completions_user_id_date_idx
  on public.habit_completions (user_id, completed_on desc);

alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

drop policy if exists "Users manage their own habits" on public.habits;
create policy "Users manage their own habits"
  on public.habits for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own completions" on public.habit_completions;
create policy "Users manage their own completions"
  on public.habit_completions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, delete on public.habit_completions to authenticated;