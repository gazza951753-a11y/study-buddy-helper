-- 1. Добавить колонку is_admin
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Вспомогательная функция для политик RLS
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

-- 3. Политики RLS для администратора (профили)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE USING (public.is_admin());

-- 4. Политики RLS для заказов
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE USING (public.is_admin());

-- 5. Таблица site_content для хранения FAQ
CREATE TABLE IF NOT EXISTS public.site_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  label      TEXT NOT NULL,
  value      JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Наполнить FAQ начальными данными
INSERT INTO public.site_content (key, label, value)
VALUES (
  'faq',
  'Часто задаваемые вопросы',
  '[{"question":"Как происходит оплата и какие гарантии безопасности?","answer":"Мы работаем по предоплате через проверенные платёжные системы: ЮMoney и СБП. Это защищает обе стороны — вы получаете чек и подтверждение платежа, а мы гарантируем выполнение заказа."},{"question":"Какие гарантии вы предоставляете?","answer":"Гарантируем уникальность работы (проверка по Антиплагиат), соблюдение сроков, бесплатные доработки по замечаниям преподавателя в течение 30 дней после сдачи."},{"question":"Можно ли срочно заказать работу?","answer":"Да, выполняем срочные заказы от 1 дня."},{"question":"Как связаться с автором?","answer":"Вы можете общаться с автором через личный кабинет или Telegram."},{"question":"Что если работа не понравится преподавателю?","answer":"Мы бесплатно внесём правки по замечаниям преподавателя."},{"question":"Насколько уникальной будет работа?","answer":"Гарантируем уникальность от 70% по системе Антиплагиат."},{"question":"Конфиденциальны ли мои данные?","answer":"Абсолютно. Мы не передаём данные третьим лицам и не публикуем выполненные работы."}]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- 7. Назначить себя администратором
UPDATE public.profiles SET is_admin = true WHERE email = 'gazza951753@gmail.com';
