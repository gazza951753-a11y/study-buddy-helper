import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TelegramRequest {
  name: string;
  contact: string;
  subject?: string;
  message?: string;
  workType?: string;
  deadline?: string;
  price?: string;
}

async function sendEmailViaResend(data: TelegramRequest): Promise<void> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.warn("Resend not configured, skipping email notification");
    return;
  }

  const rows = [
    ["Имя", data.name],
    ["Контакт", data.contact],
    data.workType ? ["Тип работы", data.workType] : null,
    data.subject ? ["Тема", data.subject] : null,
    data.deadline ? ["Срок", data.deadline] : null,
    data.price ? ["Расчётная цена", data.price] : null,
    data.message ? ["Сообщение", data.message] : null,
  ]
    .filter(Boolean)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap">${label}:</td>` +
        `<td style="padding:8px 12px;color:#222">${value}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="background:#6366f1;color:#fff;margin:0;padding:20px 24px;border-radius:8px 8px 0 0">
        📚 Новая заявка с сайта
      </h2>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        ${rows}
      </table>
      <p style="color:#888;font-size:12px;margin-top:16px;text-align:center">
        Studyassist.ru — автоматическое уведомление
      </p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Studyassist <no-reply@studyassist.ru>",
      to: [ADMIN_EMAIL],
      subject: `Новая заявка: ${data.name}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
  } else {
    console.log("Email sent via Resend");
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-telegram function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    console.log("Bot token exists:", !!TELEGRAM_BOT_TOKEN);
    console.log("Chat ID exists:", !!TELEGRAM_CHAT_ID);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Missing Telegram configuration");
      throw new Error("Telegram configuration is missing");
    }

    const data: TelegramRequest = await req.json();
    console.log("Received form data:", { ...data, contact: "***hidden***" });

    // Format message for Telegram
    let text = `📚 *Новая заявка с сайта!*\n\n`;
    text += `👤 *Имя:* ${escapeMarkdown(data.name)}\n`;
    text += `📞 *Контакт:* ${escapeMarkdown(data.contact)}\n`;
    
    if (data.workType) {
      text += `📝 *Тип работы:* ${escapeMarkdown(data.workType)}\n`;
    }
    if (data.subject) {
      text += `📖 *Тема:* ${escapeMarkdown(data.subject)}\n`;
    }
    if (data.deadline) {
      text += `⏰ *Срок:* ${escapeMarkdown(data.deadline)}\n`;
    }
    if (data.price) {
      text += `💰 *Расчётная цена:* ${escapeMarkdown(data.price)}\n`;
    }
    if (data.message) {
      text += `\n💬 *Сообщение:*\n${escapeMarkdown(data.message)}`;
    }

    console.log("Sending message to Telegram...");
    
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: "Markdown",
        }),
      }
    );

    const telegramResult = await telegramResponse.json();
    console.log("Telegram API response:", telegramResult);

    if (!telegramResult.ok) {
      console.error("Telegram API error:", telegramResult);
      throw new Error(`Telegram API error: ${telegramResult.description}`);
    }

    console.log("Message sent successfully");

    // Send email notification via Resend (non-blocking)
    await sendEmailViaResend(data).catch((e) =>
      console.error("Email send error:", e)
    );

    return new Response(
      JSON.stringify({ success: true, message: "Заявка отправлена!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-telegram function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Escape special characters for Telegram Markdown
function escapeMarkdown(text: string): string {
  if (!text) return "";
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

serve(handler);
