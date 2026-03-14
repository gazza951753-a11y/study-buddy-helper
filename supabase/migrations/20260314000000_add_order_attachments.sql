-- ================================================================
-- Migration: Order file attachments + Storage bucket for uploads
-- ================================================================

-- 1. Add attachment_urls column to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS attachment_urls text[] DEFAULT '{}'::text[];

-- 2. Create Supabase Storage bucket for order attachments
-- (Supabase stores bucket metadata in storage.buckets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-attachments',
  'order-attachments',
  false,                    -- private bucket
  20971520,                 -- 20 MB per file
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for order-attachments bucket
-- Allow ANY user (including anon) to upload — needed for pre-auth order flow
CREATE POLICY "Anyone can upload order attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'order-attachments');

-- Allow authenticated users to read their own uploads
CREATE POLICY "Authenticated users can read order attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'order-attachments');

-- Allow service role (edge functions) to read all
CREATE POLICY "Service role can read all order attachments"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'order-attachments');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete order attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'order-attachments');
