-- Add personality_result column to quiz_results table
alter table public.quiz_results
add column personality_result varchar(10);

-- Create index for personality_result for faster queries
create index idx_quiz_results_personality_result on public.quiz_results(personality_result);

-- Add comment
comment on column public.quiz_results.personality_result is 'Final personality combination result (e.g., W1_I2)';
