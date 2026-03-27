-- Create votes table for hypothesis peer review
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (question in ('valuable_topic', 'sound_approach')),
  value boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (post_id, author_id, question)
);

-- Index for fetching all votes on a post
create index idx_votes_post_id on public.votes(post_id);

-- Index for checking if a specific user voted on a post
create index idx_votes_post_author on public.votes(post_id, author_id);

-- Voting deadline is computed in the application layer as created_at + 24h
-- No schema change needed on the posts table

-- Enable RLS
alter table public.votes enable row level security;

-- Anyone authenticated can read votes
create policy "Authenticated users can read votes"
  on public.votes for select
  to authenticated
  using (true);

-- Users can insert their own votes
create policy "Users can insert own votes"
  on public.votes for insert
  to authenticated
  with check (author_id = auth.uid());

-- Users can update their own votes
create policy "Users can update own votes"
  on public.votes for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Users can delete their own votes
create policy "Users can delete own votes"
  on public.votes for delete
  to authenticated
  using (author_id = auth.uid());
