create table if not exists public.transactions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  kos_id uuid not null,
  start_date date not null,
  duration_months integer not null,
  total_price bigint not null,
  ktp_number character varying(16) not null,
  status character varying(20) not null default 'pending'::character varying,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint transactions_pkey primary key (id),
  constraint transactions_kos_id_fkey foreign key (kos_id) references kos (id) on delete cascade,
  constraint transactions_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policy for users to view their own transactions
create policy "Users can view their own transactions" on public.transactions
  for select
  using (auth.uid() = user_id);

-- Policy for users to create transactions
create policy "Users can create transactions" on public.transactions
  for insert
  with check (auth.uid() = user_id);

-- Policy for admin/owners to view transactions for their kos (simplified for now, ideally checks kos ownership)
-- For now, let's allow users to see their own transactions. Admin logic can be added later or covered by general admin rules.
