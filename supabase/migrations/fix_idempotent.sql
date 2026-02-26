-- ============================================================
-- IDEMPOTENT FIX SCRIPT
-- Run this in Supabase SQL Editor if migrations fail with
-- "already exists" errors. Safe to run multiple times.
-- ============================================================

-- ============================================================
-- DROP existing policies (IF EXISTS = no error if missing)
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile"        ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles"        ON public.profiles;

-- orders
DROP POLICY IF EXISTS "Students can view own orders"              ON public.orders;
DROP POLICY IF EXISTS "Authors can view available and own orders" ON public.orders;
DROP POLICY IF EXISTS "Students can insert orders"                ON public.orders;
DROP POLICY IF EXISTS "Students can update own orders"            ON public.orders;
DROP POLICY IF EXISTS "Authors can update orders they work on"    ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders"                ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders"              ON public.orders;

-- order_messages
DROP POLICY IF EXISTS "Order participants can view messages"   ON public.order_messages;
DROP POLICY IF EXISTS "Order participants can insert messages" ON public.order_messages;
DROP POLICY IF EXISTS "Order participants can update messages" ON public.order_messages;

-- order_files
DROP POLICY IF EXISTS "Order participants can view files"   ON public.order_files;
DROP POLICY IF EXISTS "Order participants can insert files" ON public.order_files;

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications"   ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- site_content
DROP POLICY IF EXISTS "Anyone can read site content"   ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;

-- ============================================================
-- DROP existing triggers (IF EXISTS)
-- ============================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at  ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created         ON auth.users;
DROP TRIGGER IF EXISTS update_orders_updated_at     ON public.orders;

-- ============================================================
-- MIGRATION 1: profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username           TEXT NOT NULL UNIQUE,
  email              TEXT NOT NULL,
  phone              TEXT,
  telegram_username  TEXT,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MIGRATION 2: orders system columns on profiles
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'author')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS bonus_balance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- ============================================================
-- MIGRATION 3: admin flag
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.get_author_stats(p_author_id UUID)
RETURNS TABLE(
  total_orders     BIGINT,
  completed_orders BIGINT,
  total_earned     BIGINT,
  avg_rating       NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COUNT(*)                                                              AS total_orders,
    COUNT(*)    FILTER (WHERE status = 'completed')                       AS completed_orders,
    COALESCE(SUM(price) FILTER (WHERE status = 'completed'), 0)::BIGINT  AS total_earned,
    ROUND(AVG(student_rating) FILTER (WHERE student_rating IS NOT NULL), 1) AS avg_rating
  FROM public.orders
  WHERE author_id = p_author_id;
$$;

-- ============================================================
-- TRIGGERS (recreate after drop)
-- ============================================================
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- POLICIES: profiles
-- ============================================================
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (public.is_admin());

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  work_type      TEXT NOT NULL,
  subject        TEXT NOT NULL,
  deadline_days  INTEGER NOT NULL,
  title          TEXT,
  description    TEXT,
  price          INTEGER NOT NULL,
  payment_id     TEXT,
  payment_status TEXT,
  status         TEXT NOT NULL DEFAULT 'pending_payment'
                   CHECK (status IN (
                     'pending_payment','paid','in_progress',
                     'review','revision','completed','cancelled','disputed'
                   )),
  deadline_date  TIMESTAMP WITH TIME ZONE,
  accepted_at    TIMESTAMP WITH TIME ZONE,
  submitted_at   TIMESTAMP WITH TIME ZONE,
  completed_at   TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  student_rating INTEGER CHECK (student_rating BETWEEN 1 AND 5),
  student_review TEXT
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POLICIES: orders
CREATE POLICY "Students can view own orders"
ON public.orders FOR SELECT
USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authors can view available and own orders"
ON public.orders FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'author')
  AND (
    status = 'paid'
    OR author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Students can insert orders"
ON public.orders FOR INSERT
WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can update own orders"
ON public.orders FOR UPDATE
USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authors can update orders they work on"
ON public.orders FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'author')
  AND (
    status = 'paid'
    OR author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (public.is_admin());

-- ============================================================
-- ORDER MESSAGES
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

CREATE POLICY "Order participants can view messages"
ON public.order_messages FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
       OR author_id  IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

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
-- ORDER FILES
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
-- NOTIFICATIONS
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
-- SITE CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  label      TEXT NOT NULL,
  value      JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Seed FAQ
INSERT INTO public.site_content (key, label, value)
VALUES (
  'faq',
  'Часто задаваемые вопросы',
  '[
    {"question": "Как происходит оплата и какие гарантии безопасности?", "answer": "Мы работаем по предоплате через проверенные платёжные системы: ЮMoney и СБП. Это защищает обе стороны — вы получаете чек и подтверждение платежа, а мы гарантируем выполнение заказа. Для крупных проектов возможна поэтапная оплата. Все транзакции безопасны и конфиденциальны."},
    {"question": "Какие гарантии вы предоставляете?", "answer": "Гарантируем уникальность работы (проверка по Антиплагиат), соблюдение сроков, бесплатные доработки по замечаниям преподавателя в течение 30 дней после сдачи."},
    {"question": "Можно ли срочно заказать работу?", "answer": "Да, выполняем срочные заказы от 1 дня. Стоимость срочного выполнения зависит от сложности и объёма работы. Уточните у менеджера."},
    {"question": "Как связаться с автором?", "answer": "Вы можете общаться с автором через личный кабинет или Telegram. Менеджер всегда на связи для решения любых вопросов."},
    {"question": "Что если работа не понравится преподавателю?", "answer": "Мы бесплатно внесём правки по замечаниям преподавателя. Наша цель — ваша успешная сдача, поэтому работаем до результата."},
    {"question": "Насколько уникальной будет работа?", "answer": "Каждая работа пишется индивидуально под ваше задание. Гарантируем уникальность от 70% по системе Антиплагиат (или выше по вашим требованиям)."},
    {"question": "Конфиденциальны ли мои данные?", "answer": "Абсолютно. Мы не передаём данные третьим лицам и не публикуем выполненные работы. Ваша безопасность — наш приоритет."}
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Generate referral codes for any existing profiles missing them
-- ============================================================
UPDATE public.profiles
SET referral_code = SUBSTRING(MD5(user_id::TEXT), 1, 8)
WHERE referral_code IS NULL;
