-- ============================================================
-- ADMIN PANEL MIGRATION
-- ============================================================

-- 1. Add is_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. SECURITY DEFINER helper — checks if current user is admin
--    (SECURITY DEFINER bypasses RLS, so no infinite recursion)
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

-- 3. Admin policies for profiles
--    (existing "Users can view own profile" stays; this adds admin override)
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (public.is_admin());

-- 4. Admin policies for orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE
USING (public.is_admin());

-- 5. site_content table — stores editable site content (FAQ, etc.)
CREATE TABLE IF NOT EXISTS public.site_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  label      TEXT NOT NULL,
  value      JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous visitors) can read site content
CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Seed default FAQ
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
-- HOW TO MAKE YOURSELF ADMIN
-- Run this in Supabase SQL Editor:
--   UPDATE public.profiles SET is_admin = true WHERE email = 'your@email.com';
-- ============================================================
