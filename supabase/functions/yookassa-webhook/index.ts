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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: YooKassaNotification = await req.json();

    console.log('Received YooKassa webhook:', {
      type: notification.type,
      event: notification.event,
      paymentId: notification.object?.id,
      status: notification.object?.status,
    });

    if (!notification.object || !notification.object.id) {
      console.error('Invalid notification structure');
      return new Response(
        JSON.stringify({ error: 'Invalid notification' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payment = notification.object;
    const orderId = payment.metadata?.order_id;

    // Init Supabase with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    switch (payment.status) {
      case 'succeeded': {
        console.log(`Payment ${payment.id} succeeded for order ${orderId}`);

        if (orderId) {
          // Update order status to 'paid' and save payment_id
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_id: payment.id,
              payment_status: 'succeeded',
            })
            .eq('id', orderId);

          if (error) {
            console.error('Failed to update order status:', error);
          } else {
            console.log(`Order ${orderId} marked as paid`);

            // Fetch order to notify student
            const { data: order } = await supabase
              .from('orders')
              .select('student_id, work_type, price')
              .eq('id', orderId)
              .single();

            if (order) {
              await supabase.from('notifications').insert({
                user_id: order.student_id,
                title: 'Оплата получена',
                body: `Ваш заказ оплачен на сумму ${Number(payment.amount.value).toLocaleString('ru-RU')} ₽. Исполнитель будет назначен в ближайшее время.`,
                link: `/order/${orderId}`,
              });
            }
          }
        }
        break;
      }

      case 'canceled': {
        console.log(`Payment ${payment.id} was canceled for order ${orderId}`);

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              payment_id: payment.id,
              payment_status: 'canceled',
            })
            .eq('id', orderId);
        }
        break;
      }

      default:
        console.log(`Payment ${payment.id} has status: ${payment.status}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Processing error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
