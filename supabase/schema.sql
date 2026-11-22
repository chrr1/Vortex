-- ============================================================
-- VORTEX / DOMPETKU AI - DATABASE SCHEMA
-- Target Database: PostgreSQL (Supabase)
-- Based on: PRD.md Section 14 (Database Requirements) & Section 15 (Security / RLS)
-- ============================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 2. TABLE: profiles (Extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  currency text default 'IDR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 3. TABLE: wallets
-- ============================================================
create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  account_number text,
  initial_balance numeric not null default 0,
  currency text not null default 'IDR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "Users can view their own wallets"
  on public.wallets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own wallets"
  on public.wallets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own wallets"
  on public.wallets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own wallets"
  on public.wallets for delete
  using (auth.uid() = user_id);

-- Trigger: Automatically create profile & default wallets when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;

  -- Create default wallets for new user
  insert into public.wallets (user_id, name, initial_balance, currency)
  values 
    (new.id, 'Cash', 0, 'IDR'),
    (new.id, 'BCA', 0, 'IDR'),
    (new.id, 'DANA', 0, 'IDR');

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 4. TABLE: categories
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade, -- null = default system category
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Users can view system and their own categories"
  on public.categories for select
  using (is_system = true or auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id and is_system = false);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id and is_system = false);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id and is_system = false);

-- Seed default system categories
insert into public.categories (user_id, name, type, icon, is_system)
values
  (null, 'Makanan', 'expense', 'food', true),
  (null, 'Transportasi', 'expense', 'transport', true),
  (null, 'Hiburan', 'expense', 'entertainment', true),
  (null, 'Belanja', 'expense', 'shopping', true),
  (null, 'Tagihan', 'expense', 'bill', true),
  (null, 'Pemasukan', 'income', 'income', true),
  (null, 'Lainnya', 'expense', 'other', true)
on conflict do nothing;

-- ============================================================
-- 5. TABLE: transactions
-- ============================================================
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  category text,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric not null check (amount > 0),
  description text not null,
  transaction_date timestamptz not null default now(),
  input_method text not null check (input_method in ('manual', 'ai_chat', 'voice')) default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tx_user_date on public.transactions (user_id, transaction_date desc);
create index if not exists idx_tx_wallet on public.transactions (wallet_id);
create index if not exists idx_tx_category on public.transactions (category_id);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. TABLE: budgets
-- ============================================================
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade,
  category_name text,
  amount numeric not null check (amount > 0),
  period text not null default 'monthly',
  start_date date not null default date_trunc('month', current_date),
  end_date date not null default (date_trunc('month', current_date) + interval '1 month - 1 day')::date,
  created_at timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users can view their own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can manage their own budgets"
  on public.budgets for all
  using (auth.uid() = user_id);

-- ============================================================
-- 7. TABLE: financial_goals
-- ============================================================
create table if not exists public.financial_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  target_date date,
  description text,
  status text not null default 'in_progress' check (status in ('in_progress', 'achieved', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.financial_goals enable row level security;

create policy "Users can view their own goals"
  on public.financial_goals for select
  using (auth.uid() = user_id);

create policy "Users can manage their own goals"
  on public.financial_goals for all
  using (auth.uid() = user_id);

-- ============================================================
-- 8. TABLE: recurring_transactions
-- ============================================================
create table if not exists public.recurring_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null,
  next_run_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring_transactions enable row level security;

create policy "Users can manage their own recurring transactions"
  on public.recurring_transactions for all
  using (auth.uid() = user_id);

-- ============================================================
-- 9. TABLE: ai_conversations & ai_messages (Chat History)
-- ============================================================
create table if not exists public.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Percakapan Keuangan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;

create policy "Users can manage their own conversations"
  on public.ai_conversations for all
  using (auth.uid() = user_id);

create table if not exists public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_messages enable row level security;

create policy "Users can manage their own ai messages"
  on public.ai_messages for all
  using (
    exists (
      select 1 from public.ai_conversations c 
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 10. GRANTS: Memberikan izin akses standar ke role Supabase
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;

grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;
grant all privileges on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
