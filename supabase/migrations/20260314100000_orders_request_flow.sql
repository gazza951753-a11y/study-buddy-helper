-- ================================================================
-- Update orders for new "request first, pay later" flow
-- Run in Supabase SQL Editor
-- ================================================================

-- 1. Drop old status constraint and add 'new' status
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'new',              -- customer submitted request, awaiting admin review
    'pending_payment',  -- admin set price, payment link sent to customer
    'paid',             -- payment received
    'in_progress',      -- author working
    'review',           -- author submitted work
    'revision',         -- customer requested changes
    'completed',        -- completed and approved
    'cancelled',        -- cancelled
    'disputed'          -- in dispute
  ));

-- 2. Make price default to 0 (price is set by admin after review)
ALTER TABLE public.orders ALTER COLUMN price SET DEFAULT 0;

-- 3. Make student_id nullable (allow anonymous requests)
ALTER TABLE public.orders ALTER COLUMN student_id DROP NOT NULL;

-- 4. Add contact info fields for anonymous requesters
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS contact_name     text,
  ADD COLUMN IF NOT EXISTS contact_phone    text,
  ADD COLUMN IF NOT EXISTS contact_telegram text;

-- 5. Default new orders to 'new' status instead of 'pending_payment'
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'new';
