-- Lead capture: store patient enquiries sent via practice profile pages
create table if not exists practice_enquiries (
  id                  uuid        primary key default gen_random_uuid(),
  practice_id         uuid        not null references practices(id) on delete cascade,
  name                text        not null,
  email               text        not null,
  treatment_interest  text,
  message             text,
  read_at             timestamptz,
  created_at          timestamptz not null default now()
);

alter table practice_enquiries enable row level security;

-- Practice owners can read their own enquiries
create policy "owners read enquiries"
  on practice_enquiries for select
  using (
    practice_id in (
      select id from practices where claimed_by_user_id = auth.uid()
    )
  );

-- Anyone can submit an enquiry (anonymous lead capture)
create policy "public insert enquiries"
  on practice_enquiries for insert
  with check (true);
