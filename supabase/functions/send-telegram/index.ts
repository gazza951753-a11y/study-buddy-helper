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

// ── Telegram helpers ──

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

// Download file from Supabase Storage and upload to Telegram as binary multipart
async function sendTelegramDocumentBinary(
  botToken: string,
  chatId: string,
  fileUrl: string,
  fileName: string,
  caption: string,
) {
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) {
    console.warn(`Failed to download file ${fileName}: ${fileRes.status}`);
    return;
  }
  const fileBlob = await fileRes.blob();

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

// ── Email helper (Resend) ──

async function sendEmail(resendApiKey: string, data: TelegramRequest) {
  const filesHtml = data.attachmentNames?.length
    ? `<p><b>Вложения:</b> ${data.attachmentNames.join(", ")}</p>`
    : "";

  const html = `
    <h2>Новая заявка с сайта StudyAssist</h2>
    <p><b>Имя:</b> ${data.name}</p>
    <p><b>Контакт:</b> ${data.contact}</p>
    ${data.workType ? `<p><b>Тип работы:</b> ${data.workType}</p>` : ""}
    ${data.subject  ? `<p><b>Предмет/тема:</b> ${data.subject}</p>`  : ""}
    ${data.deadline ? `<p><b>Срок:</b> ${data.deadline}</p>` : ""}
    ${data.price    ? `<p><b>Расчётная цена:</b> ${data.price}</p>`  : ""}
    ${filesHtml}
    ${data.message  ? `<p><b>Сообщение:</b><br>${data.message.replace(/\n/g, "<br>")}</p>` : ""}
  `;

  // Build subject
  const parts = [data.workType, data.subject].filter(Boolean);
  const subject = parts.length
    ? `Новая заявка: ${parts.join(" — ")}`
    : "Новая заявка с сайта StudyAssist";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "StudyAssist <noreply@studyassist.ru>",
      to: ["support@studyassist.ru"],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.warn("Resend email failed:", err);
  } else {
    console.log("Email sent via Resend");
  }
}

// ── Main handler ──

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID   = Deno.env.get("TELEGRAM_CHAT_ID");
    const RESEND_API_KEY     = Deno.env.get("RESEND_API_KEY");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Telegram configuration is missing");
    }

    const data: TelegramRequest = await req.json();

    // ── 1. Telegram message ──
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

    // ── 2. Telegram file attachments (download + re-upload as binary) ──
    if (data.attachmentUrls?.length) {
      for (let i = 0; i < data.attachmentUrls.length; i++) {
        const fileUrl  = data.attachmentUrls[i];
        const fileName = data.attachmentNames?.[i] || `file_${i + 1}`;
        await sendTelegramDocumentBinary(
          TELEGRAM_BOT_TOKEN,
          TELEGRAM_CHAT_ID,
          fileUrl,
          fileName,
          `📎 ${escapeMarkdown(fileName)}`,
        );
      }
    }

    // ── 3. Email notification via Resend (non-fatal if key is missing) ──
    if (RESEND_API_KEY) {
      await sendEmail(RESEND_API_KEY, data);
    } else {
      console.warn("RESEND_API_KEY not set — skipping email notification");
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
