-- Patient-reported NHS availability on reviews
alter table reviews add column if not exists nhs_status text
  check (nhs_status in ('yes', 'no', 'unsure'));

-- Owner-managed current availability on practices
alter table practices add column if not exists nhs_accepting boolean;
alter table practices add column if not exists nhs_accepting_updated_at timestamptz;
