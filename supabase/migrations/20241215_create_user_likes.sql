-- Create user_likes table
create table if not exists public.user_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  kos_id uuid references public.kos(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, kos_id)
);

-- Enable RLS
alter table public.user_likes enable row level security;

-- Create policies
create policy "Users can view their own likes"
  on public.user_likes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own likes"
  on public.user_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.user_likes for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists user_likes_user_id_idx on public.user_likes(user_id);
create index if not exists user_likes_kos_id_idx on public.user_likes(kos_id);
