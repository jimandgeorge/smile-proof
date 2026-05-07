-- Aggregated price summary per practice × treatment × payment type
CREATE VIEW practice_price_summary AS
SELECT
  pr.practice_id,
  pr.treatment_id,
  t.name        AS treatment_name,
  t.category    AS treatment_category,
  t.nhs_band    AS treatment_nhs_band,
  pr.payment_type,
  COUNT(*)::integer                                           AS report_count,
  ROUND(AVG(pr.amount_pence)::numeric, 0)::integer           AS avg_pence,
  MIN(pr.amount_pence)                                       AS min_pence,
  MAX(pr.amount_pence)                                       AS max_pence
FROM price_reports pr
JOIN treatments t ON t.id = pr.treatment_id
GROUP BY
  pr.practice_id,
  pr.treatment_id,
  t.name,
  t.category,
  t.nhs_band,
  pr.payment_type;
