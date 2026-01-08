import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  description: string;
  orderId: string;
  customerEmail?: string;
  returnUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const shopId = Deno.env.get('YOOKASSA_SHOP_ID');
    const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');

    if (!shopId || !secretKey) {
      console.error('Missing YooKassa credentials');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, description, orderId, customerEmail, returnUrl }: PaymentRequest = await req.json();

    if (!amount || !description || !orderId || !returnUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, description, orderId, returnUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create idempotency key for safe retries
    const idempotencyKey = crypto.randomUUID();

    // YooKassa API request
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      description: description,
      metadata: {
        order_id: orderId
      },
      receipt: customerEmail ? {
        customer: {
          email: customerEmail
        },
        items: [
          {
            description: description.substring(0, 128),
            quantity: '1',
            amount: {
              value: amount.toFixed(2),
              currency: 'RUB'
            },
            vat_code: 1,
            payment_subject: 'service',
            payment_mode: 'full_prepayment'
          }
        ]
      } : undefined
    };

    console.log('Creating YooKassa payment:', { orderId, amount, description });

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${shopId}:${secretKey}`),
        'Idempotence-Key': idempotencyKey
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('YooKassa API error:', result);
      return new Response(
        JSON.stringify({ error: result.description || 'Payment creation failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment created successfully:', result.id);

    return new Response(
      JSON.stringify({
        paymentId: result.id,
        confirmationUrl: result.confirmation?.confirmation_url,
        status: result.status
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in yookassa-payment function:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
