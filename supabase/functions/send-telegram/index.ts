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
