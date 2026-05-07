CREATE OR REPLACE FUNCTION increment_helpful(rid uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = rid;
$$;

CREATE OR REPLACE FUNCTION decrement_helpful(rid uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = rid;
$$;
