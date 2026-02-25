-- Allowlist of emails that should receive admin access automatically
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_emails'
      AND policyname = 'Admins can manage admin emails'
  ) THEN
    CREATE POLICY "Admins can manage admin emails"
      ON public.admin_emails FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Initial admin allowlist entry
INSERT INTO public.admin_emails (email)
VALUES ('gazza951753@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Keep profile creation trigger and assign admin role if email is allowlisted
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username, phone, telegram_username, is_admin)
  SELECT
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'username'), ''),
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'Пользователь'
    ),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'phone'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'telegram_username'), ''),
    EXISTS (
      SELECT 1
      FROM public.admin_emails ae
      WHERE lower(ae.email) = lower(COALESCE(NEW.email, ''))
    )
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  );

  RETURN NEW;
END;
$$;

-- Backfill profile rows for existing auth users
INSERT INTO public.profiles (user_id, email, username, phone, telegram_username, is_admin)
SELECT
  au.id,
  COALESCE(au.email, ''),
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data ->> 'username'), ''),
    split_part(COALESCE(au.email, ''), '@', 1),
    'Пользователь'
  ),
  NULLIF(TRIM(au.raw_user_meta_data ->> 'phone'), ''),
  NULLIF(TRIM(au.raw_user_meta_data ->> 'telegram_username'), ''),
  EXISTS (
    SELECT 1
    FROM public.admin_emails ae
    WHERE lower(ae.email) = lower(COALESCE(au.email, ''))
  )
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;

-- Sync existing profiles with allowlist
UPDATE public.profiles p
SET is_admin = EXISTS (
  SELECT 1
  FROM public.admin_emails ae
  WHERE lower(ae.email) = lower(p.email)
);
