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
  attachmentUrls?: string[];
  attachmentNames?: string[];
}

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

// Download file from URL and upload to Telegram as binary (multipart)
async function sendTelegramDocumentBinary(
  botToken: string,
  chatId: string,
  fileUrl: string,
  fileName: string,
  caption: string,
) {
  // 1. Download the file from Supabase Storage
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) {
    console.warn(`Failed to download file ${fileName}: ${fileRes.status}`);
    return;
  }
  const fileBlob = await fileRes.blob();

  // 2. Send to Telegram as multipart/form-data
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("parse_mode", "Markdown");
  form.append("document", fileBlob, fileName);

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: "POST",
    body: form,
  });
  const result = await res.json();
  if (!result.ok) {
    console.warn(`sendDocument failed for ${fileName}:`, result.description);
  }
  return result;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Telegram configuration is missing");
    }

    const data: TelegramRequest = await req.json();

    let text = `📚 *Новая заявка с сайта!*\n\n`;
    text += `👤 *Имя:* ${escapeMarkdown(data.name)}\n`;
    text += `📞 *Контакт:* ${escapeMarkdown(data.contact)}\n`;
    if (data.workType) text += `📝 *Тип работы:* ${escapeMarkdown(data.workType)}\n`;
    if (data.subject)  text += `📖 *Тема:* ${escapeMarkdown(data.subject)}\n`;
    if (data.deadline) text += `⏰ *Срок:* ${escapeMarkdown(data.deadline)}\n`;
    if (data.price)    text += `💰 *Расчётная цена:* ${escapeMarkdown(data.price)}\n`;
    if (data.attachmentUrls?.length) text += `\n📎 *Вложений:* ${data.attachmentUrls.length} файл(а)\n`;
    if (data.message)  text += `\n💬 *Сообщение:*\n${escapeMarkdown(data.message)}`;

    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, text);

    if (data.attachmentUrls?.length) {
      for (let i = 0; i < data.attachmentUrls.length; i++) {
        const fileUrl  = data.attachmentUrls[i];
        const fileName = data.attachmentNames?.[i] || `file_${i + 1}`;
        const caption  = `📎 ${escapeMarkdown(fileName)}`;
        await sendTelegramDocumentBinary(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, fileUrl, fileName, caption);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
