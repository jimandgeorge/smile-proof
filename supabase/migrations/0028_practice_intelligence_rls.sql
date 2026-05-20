-- Lock owner-facing generated intelligence behind practice-owner RLS.
-- Service role/admin code bypasses RLS for generation and dashboard loading.

alter table practice_opportunity_insights enable row level security;

drop policy if exists "practice_opportunity_insights_owner_read" on practice_opportunity_insights;
create policy "practice_opportunity_insights_owner_read"
  on practice_opportunity_insights
  for select
  to authenticated
  using (
    exists (
      select 1
      from practices p
      where p.id = practice_opportunity_insights.practice_id
        and p.claimed_by_user_id = (select auth.uid())
    )
  );

drop policy if exists "practice_opportunity_insights_owner_update" on practice_opportunity_insights;
create policy "practice_opportunity_insights_owner_update"
  on practice_opportunity_insights
  for update
  to authenticated
  using (
    exists (
      select 1
      from practices p
      where p.id = practice_opportunity_insights.practice_id
        and p.claimed_by_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from practices p
      where p.id = practice_opportunity_insights.practice_id
        and p.claimed_by_user_id = (select auth.uid())
    )
  );
