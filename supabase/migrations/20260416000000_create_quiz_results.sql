-- Create quiz_results table for storing test submissions
create table public.quiz_results (
  id bigint primary key generated always as identity,
  user_uuid uuid not null,
  selected_options jsonb not null default '[]',
  scores jsonb not null default '{}',
  created_at timestamp with time zone not null default now()
);

-- Create indexes for better query performance
create index idx_quiz_results_user_uuid on public.quiz_results(user_uuid);
create index idx_quiz_results_created_at on public.quiz_results(created_at);

-- Enable RLS (Row Level Security)
alter table public.quiz_results enable row level security;

-- Policy: Anyone can insert their own results
create policy "Users can insert quiz results"
  on public.quiz_results
  for insert
  with check (true);

-- Policy: Anyone can read quiz results (anonymous analytics)
create policy "Anyone can read quiz results"
  on public.quiz_results
  for select
  using (true);

-- Add comment
comment on table public.quiz_results is 'Stores anonymous quiz submissions with UUID, selected options, scores, and timestamp';
