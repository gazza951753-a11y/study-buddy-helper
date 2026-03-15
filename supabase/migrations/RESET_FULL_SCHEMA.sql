-- ============================================================
-- FULL SCHEMA RESET — StudyAssist
-- Запускать в Supabase SQL Editor после удаления всех таблиц
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Удалить всё старое (безопасно — IF EXISTS)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.order_files      CASCADE;
DROP TABLE IF EXISTS public.notifications    CASCADE;
DROP TABLE IF EXISTS public.order_messages   CASCADE;
DROP TABLE IF EXISTS public.orders           CASCADE;
DROP TABLE IF EXISTS public.site_content     CASCADE;
DROP TABLE IF EXISTS public.profiles         CASCADE;

-- Старые политики storage (удаляем ВСЕ возможные варианты названий)
DROP POLICY IF EXISTS "Anyone can upload order attachments"              ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read order attachments"   ON storage.objects;
DROP POLICY IF EXISTS "Service role can read all order attachments"      ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete order attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own uploads"       ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all order attachments"            ON storage.objects;

-- ─────────────────────────────────────────────────────────────
-- 1. profiles
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username          text NOT NULL,
  email             text NOT NULL,
  phone             text,
  telegram_username text,
  role              text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'author')),
  is_admin          boolean NOT NULL DEFAULT false,
  bio               text,
  specializations   text[],
  bonus_balance     integer NOT NULL DEFAULT 0,
  referral_code     text UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. orders  (актуальная схема — без старых ограничений)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- nullable: анонимные заявки
  author_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  work_type         text NOT NULL,
  subject           text NOT NULL,
  deadline_days     integer NOT NULL,
  title             text,
  description       text,
  price             integer NOT NULL DEFAULT 0,
  payment_id        text,
  payment_status    text,
  status            text NOT NULL DEFAULT 'new'
                    CHECK (status IN (
                      'new', 'pending_payment', 'paid',
                      'in_progress', 'review', 'revision',
                      'completed', 'cancelled', 'disputed'
                    )),
  -- Контактные данные (заполняются при подаче заявки)
  contact_name      text,
  contact_phone     text,
  contact_telegram  text,
  -- Прикреплённые файлы (signed URLs из Storage)
  attachment_urls   text[] DEFAULT '{}',
  -- Временны́е метки
  deadline_date     timestamptz,
  accepted_at       timestamptz,
  submitted_at      timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  -- Оценка заказчика
  student_rating    integer CHECK (student_rating BETWEEN 1 AND 5),
  student_review    text
);

-- ─────────────────────────────────────────────────────────────
-- 3. order_messages  (чат внутри заказа)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.order_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 4. site_content  (FAQ, отзывы, прочие настройки сайта)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.site_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL UNIQUE,
  label      text NOT NULL,
  value      jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Начальные данные: пустые FAQ и отзывы
INSERT INTO public.site_content (key, label, value) VALUES
  ('faq',          'Часто задаваемые вопросы', '[]'),
  ('user_reviews', 'Отзывы пользователей',     '[]')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 5. RLS — включаем для всех таблиц
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content  ENABLE ROW LEVEL SECURITY;

-- profiles: каждый видит свой профиль; admin — все
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));
CREATE POLICY "Service role full access to profiles"
  ON public.profiles FOR ALL USING (auth.role() = 'service_role');
-- Нужно для регистрации: новый пользователь создаёт свой профиль
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- orders: студент видит свои; admin — все; анонимные могут вставлять
CREATE POLICY "Students view own orders"
  ON public.orders FOR SELECT
  USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins view all orders"
  ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));
CREATE POLICY "Admins update all orders"
  ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));
CREATE POLICY "Anyone can insert order"
  ON public.orders FOR INSERT WITH CHECK (true);  -- анонимные заявки разрешены
CREATE POLICY "Service role full access to orders"
  ON public.orders FOR ALL USING (auth.role() = 'service_role');

-- order_messages: участники заказа
CREATE POLICY "Order participants view messages"
  ON public.order_messages FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
         OR author_id  IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );
CREATE POLICY "Order participants send messages"
  ON public.order_messages FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Service role full access to messages"
  ON public.order_messages FOR ALL USING (auth.role() = 'service_role');

-- site_content: публичное чтение; запись только admin
CREATE POLICY "Public can read site_content"
  ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can write site_content"
  ON public.site_content FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));
CREATE POLICY "Service role full access to site_content"
  ON public.site_content FOR ALL USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- 6. Storage bucket: order-attachments
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-attachments',
  'order-attachments',
  false,       -- приватный бакет, доступ по signed URL
  20971520,    -- 20 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'application/zip',
    'application/x-rar-compressed', 'application/x-zip-compressed',
    'application/octet-stream'  -- fallback для редких типов
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
CREATE POLICY "Anyone can upload order attachments"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'order-attachments');

CREATE POLICY "Authenticated users can read order attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-attachments');

CREATE POLICY "Admins can read all order attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'order-attachments'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );

CREATE POLICY "Service role can read all order attachments"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'order-attachments');

CREATE POLICY "Authenticated users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-attachments' AND owner = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 7. Вспомогательная функция: updated_at автообновление
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Готово! Таблицы созданы:
--   profiles, orders, order_messages, site_content
-- Storage bucket: order-attachments
-- Trigger: handle_new_user (авто-профиль при регистрации)
-- ─────────────────────────────────────────────────────────────
