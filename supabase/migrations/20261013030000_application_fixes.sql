-- 1) Public applications go through a validated SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.submit_application(
  _course_id uuid,
  _full_name text,
  _email text,
  _phone text,
  _address text DEFAULT NULL,
  _education text DEFAULT NULL,
  _message text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ref text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = _course_id AND is_published) THEN
    RAISE EXCEPTION 'Invalid course';
  END IF;

  IF coalesce(length(trim(_full_name)), 0) = 0
     OR coalesce(length(trim(_phone)), 0) < 6
     OR coalesce(trim(_email), '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;

  INSERT INTO public.applications (course_id, full_name, email, phone, address, education, message)
  VALUES (
    _course_id,
    left(trim(_full_name), 120),
    left(trim(_email), 200),
    left(trim(_phone), 30),
    nullif(left(trim(coalesce(_address, '')), 300), ''),
    nullif(left(trim(coalesce(_education, '')), 200), ''),
    nullif(left(trim(coalesce(_message, '')), 2000), '')
  )
  RETURNING reference_code INTO _ref;

  RETURN _ref;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_application(uuid, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_application(uuid, text, text, text, text, text, text) TO anon, authenticated;

-- 2) No more direct inserts from the browser (status / admin_notes could be forged)
DROP POLICY IF EXISTS "anyone can apply" ON public.applications;
REVOKE INSERT ON public.applications FROM anon;

-- 3) Deleting a course must not wipe its applications and payments
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_course_id_fkey;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE RESTRICT;

-- 4) One payment record per application (remove existing duplicates first,
--    keeping the paid one if any, otherwise the oldest)
DELETE FROM public.payments p
USING (
  SELECT id,
         row_number() OVER (
           PARTITION BY application_id
           ORDER BY (status = 'paid') DESC, created_at ASC
         ) AS rn
  FROM public.payments
) d
WHERE p.id = d.id AND d.rn > 1;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_application_id_key UNIQUE (application_id);
