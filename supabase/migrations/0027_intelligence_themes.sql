alter table practice_opportunity_insights
  add column if not exists themes jsonb not null default '[]';
