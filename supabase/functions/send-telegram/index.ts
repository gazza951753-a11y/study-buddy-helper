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
  /** Supabase Storage public/signed URLs for attached files */
  attachmentUrls?: string[];
  /** Original file names to show in Telegram caption */
  attachmentNames?: string[];
}

// Escape special characters for Telegram Markdown
function escapeMarkdown(text: string): string {
  if (!text) return "";
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
  const result = await res.json();
  if (!result.ok) {
    console.error("sendMessage failed:", result);
    throw new Error(`Telegram sendMessage: ${result.description}`);
  }
  return result;
}

async function sendTelegramDocument(
  botToken: string,
  chatId: string,
  fileUrl: string,
  caption: string,
) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      document: fileUrl,
      caption,
      parse_mode: "Markdown",
    }),
  });
  const result = await res.json();
  if (!result.ok) {
    // Non-fatal — Telegram may reject some file types by URL
    console.warn(`sendDocument failed for ${fileUrl}:`, result.description);
  }
  return result;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-telegram function");

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

    // ── Build main notification message ──
    let text = `📚 *Новая заявка с сайта!*\n\n`;
    text += `👤 *Имя:* ${escapeMarkdown(data.name)}\n`;
    text += `📞 *Контакт:* ${escapeMarkdown(data.contact)}\n`;

    if (data.workType) text += `📝 *Тип работы:* ${escapeMarkdown(data.workType)}\n`;
    if (data.subject)  text += `📖 *Тема:* ${escapeMarkdown(data.subject)}\n`;
    if (data.deadline) text += `⏰ *Срок:* ${escapeMarkdown(data.deadline)}\n`;
    if (data.price)    text += `💰 *Расчётная цена:* ${escapeMarkdown(data.price)}\n`;

    if (data.attachmentUrls && data.attachmentUrls.length > 0) {
      text += `\n📎 *Вложений:* ${data.attachmentUrls.length} файл(а)\n`;
    }

    if (data.message) {
      text += `\n💬 *Сообщение:*\n${escapeMarkdown(data.message)}`;
    }

    // 1. Send main message
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, text);

    // 2. Send each attached file as a separate document
    if (data.attachmentUrls && data.attachmentUrls.length > 0) {
      for (let i = 0; i < data.attachmentUrls.length; i++) {
        const fileUrl = data.attachmentUrls[i];
        const fileName = data.attachmentNames?.[i] || `Файл ${i + 1}`;
        const caption = `📎 Вложение ${i + 1}: ${escapeMarkdown(fileName)}`;
        await sendTelegramDocument(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, fileUrl, caption);
      }
    }

    console.log("Message(s) sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Заявка отправлена!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: any) {
    console.error("Error in send-telegram function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
