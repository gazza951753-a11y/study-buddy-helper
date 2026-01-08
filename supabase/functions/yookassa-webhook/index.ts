import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YooKassaNotification {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    amount: {
      value: string;
      currency: string;
    };
    metadata?: {
      order_id?: string;
    };
    paid: boolean;
    captured_at?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: YooKassaNotification = await req.json();

    console.log('Received YooKassa webhook:', {
      type: notification.type,
      event: notification.event,
      paymentId: notification.object?.id,
      status: notification.object?.status
    });

    // Validate notification structure
    if (!notification.object || !notification.object.id) {
      console.error('Invalid notification structure');
      return new Response(
        JSON.stringify({ error: 'Invalid notification' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payment = notification.object;
    const orderId = payment.metadata?.order_id;

    // Log payment status change
    console.log(`Payment ${payment.id} status: ${payment.status}, order: ${orderId}`);

    // Handle different payment statuses
    switch (payment.status) {
      case 'succeeded':
        console.log(`Payment ${payment.id} succeeded for order ${orderId}`);
        // Here you can update order status in database
        // For example: await updateOrderStatus(orderId, 'paid');
        break;

      case 'canceled':
        console.log(`Payment ${payment.id} was canceled for order ${orderId}`);
        break;

      case 'waiting_for_capture':
        console.log(`Payment ${payment.id} waiting for capture`);
        break;

      default:
        console.log(`Payment ${payment.id} has status: ${payment.status}`);
    }

    // Always return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    // Still return 200 to prevent retries for malformed requests
    return new Response(
      JSON.stringify({ error: 'Processing error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
