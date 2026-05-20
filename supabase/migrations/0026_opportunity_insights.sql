create table if not exists practice_opportunity_insights (
  id              uuid        primary key default gen_random_uuid(),
  practice_id     uuid        not null references practices(id) on delete cascade,
  generated_at    timestamptz not null default now(),
  review_count    int         not null default 0,
  strengths       jsonb       not null default '[]',
  weaknesses      jsonb       not null default '[]',
  opportunities   jsonb       not null default '[]',
  category_scores jsonb       not null default '{}',
  unique(practice_id)
);
