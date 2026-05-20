-- Homepage lead capture: patients who request matched practice recommendations
create table if not exists patient_leads (
  id                  uuid        primary key default gen_random_uuid(),
  email               text        not null,
  treatment_interest  text,
  postcode            text,
  source              text        not null default 'homepage',
  created_at          timestamptz not null default now()
);

alter table patient_leads enable row level security;

-- Anyone can submit a lead (anonymous)
create policy "public insert leads"
  on patient_leads for insert
  with check (true);

-- Only service role can read leads (no RLS SELECT for authenticated users — admin-only)
