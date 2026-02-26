-- ============================================================
-- ORDERS SYSTEM MIGRATION
-- ============================================================

-- 1. Add role field to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'author')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS bonus_balance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate referral codes for existing profiles
UPDATE public.profiles
SET referral_code = SUBSTRING(MD5(user_id::TEXT), 1, 8)
WHERE referral_code IS NULL;

-- Update handle_new_user to include role and referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email, phone, telegram_username, role, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'telegram_username',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    SUBSTRING(MD5(NEW.id::TEXT), 1, 8)
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Order parameters
  work_type      TEXT NOT NULL,
  subject        TEXT NOT NULL,
  deadline_days  INTEGER NOT NULL,
  title          TEXT,
  description    TEXT,
  price          INTEGER NOT NULL,

  -- Payment
  payment_id     TEXT,              -- YooKassa payment id
  payment_status TEXT,              -- YooKassa payment status

  -- Order lifecycle
  status         TEXT NOT NULL DEFAULT 'pending_payment'
                   CHECK (status IN (
                     'pending_payment',  -- created, awaiting payment
                     'paid',             -- payment received, visible to authors
                     'in_progress',      -- author accepted
                     'review',           -- author submitted work
                     'revision',         -- student requested changes
                     'completed',        -- student approved
                     'cancelled',        -- cancelled
                     'disputed'          -- in dispute
                   )),

  -- Dates
  deadline_date  TIMESTAMP WITH TIME ZONE,
  accepted_at    TIMESTAMP WITH TIME ZONE,
  submitted_at   TIMESTAMP WITH TIME ZONE,
  completed_at   TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Rating after completion
  student_rating    INTEGER CHECK (student_rating BETWEEN 1 AND 5),
  student_review    TEXT
);

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Students see their own orders
CREATE POLICY "Students can view own orders"
ON public.orders FOR SELECT
USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Authors see paid and their accepted orders
CREATE POLICY "Authors can view available and own orders"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'author'
  )
  AND (
    status = 'paid'
    OR author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Students can create orders
CREATE POLICY "Students can insert orders"
ON public.orders FOR INSERT
WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Students can update their own orders (rating, cancel)
CREATE POLICY "Students can update own orders"
ON public.orders FOR UPDATE
USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Authors can update orders (accept, submit, etc.)
CREATE POLICY "Authors can update orders they work on"
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'author'
  )
  AND (
    status = 'paid'
    OR author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- ============================================================
-- 3. ORDER MESSAGES (CHAT)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Participants of the order can read messages
CREATE POLICY "Order participants can view messages"
ON public.order_messages FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR author_id  IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Participants can insert messages
CREATE POLICY "Order participants can insert messages"
ON public.order_messages FOR INSERT
WITH CHECK (
  sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND order_id IN (
    SELECT id FROM public.orders
    WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR author_id  IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Participants can mark messages as read
CREATE POLICY "Order participants can update messages"
ON public.order_messages FOR UPDATE
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR author_id  IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- ============================================================
-- 4. ORDER FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   INTEGER,
  file_type   TEXT NOT NULL CHECK (file_type IN ('requirement', 'result')),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order participants can view files"
ON public.order_files FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR author_id  IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Order participants can insert files"
ON public.order_files FOR INSERT
WITH CHECK (
  uploader_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND order_id IN (
    SELECT id FROM public.orders
    WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR author_id  IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- ============================================================
-- 5. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ============================================================
-- 6. HELPER FUNCTION: get order stats for author
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_author_stats(p_author_id UUID)
RETURNS TABLE(
  total_orders BIGINT,
  completed_orders BIGINT,
  total_earned BIGINT,
  avg_rating NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COUNT(*)                           AS total_orders,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
    COALESCE(SUM(price) FILTER (WHERE status = 'completed'), 0)::BIGINT AS total_earned,
    ROUND(AVG(student_rating) FILTER (WHERE student_rating IS NOT NULL), 1) AS avg_rating
  FROM public.orders
  WHERE author_id = p_author_id;
$$;
