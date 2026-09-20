import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AntibanSettings } from "@/lib/types";

const DEFAULT_ANTIBAN: AntibanSettings = {
  enabled: true,
  max_per_minute: 20,
  jitter_min_seconds: 2,
  jitter_max_seconds: 6,
  window_start: "08:00",
  window_end: "20:00",
};

function dentroDaJanela(agora: Date, inicio: string, fim: string) {
  const hhmm = agora.toTimeString().slice(0, 5);
  return hhmm >= inicio && hhmm <= fim;
}

/**
 * Envia uma mensagem de WhatsApp aplicando as regras de antibanimento (throttle,
 * jitter e janela de horário) antes de gravar. Este é o ponto onde a chamada real
 * ao gateway (WAHA/Meta) entra quando estiver conectado — por enquanto só grava a
 * mensagem no banco.
 */
export const sendWhatsappMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ conversationId: z.string().uuid(), body: z.string().min(1) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: settings } = await supabaseAdmin
      .from("app_settings")
      .select("antiban_settings")
      .eq("id", 1)
      .maybeSingle();
    const cfg = (settings?.antiban_settings as unknown as AntibanSettings) ?? DEFAULT_ANTIBAN;

    if (cfg.enabled) {
      if (!dentroDaJanela(new Date(), cfg.window_start, cfg.window_end)) {
        throw new Error(
          `Fora do horário de envio configurado (${cfg.window_start}–${cfg.window_end}). A mensagem não foi enviada.`,
        );
      }

      const umMinutoAtras = new Date(Date.now() - 60_000).toISOString();
      const { count } = await supabaseAdmin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("direction", "saida")
        .gte("created_at", umMinutoAtras);
      if ((count ?? 0) >= cfg.max_per_minute) {
        throw new Error(
          "Limite de mensagens por minuto atingido (proteção contra banimento do número). Aguarde um instante.",
        );
      }

      const jitterMs =
        (cfg.jitter_min_seconds +
          Math.random() * (cfg.jitter_max_seconds - cfg.jitter_min_seconds)) *
        1000;
      await new Promise((resolve) => setTimeout(resolve, jitterMs));
    }

    const { error } = await supabaseAdmin.from("messages").insert({
      conversation_id: data.conversationId,
      direction: "saida",
      body: data.body,
      author_id: context.userId,
    });
    if (error) throw new Error("Não foi possível enviar a mensagem.");

    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", data.conversationId);

    return { ok: true };
  });

type ChatMessage = { role: "user" | "assistant"; content: string };

async function callAnthropic(apiKey: string, system: string, messages: ChatMessage[]) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      system,
      messages,
    }),
  });
  const body = (await res.json()) as {
    content?: { text?: string }[];
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(body.error?.message || "Falha ao gerar resposta com Anthropic.");
  return body.content?.[0]?.text?.trim() ?? "";
}

async function callOpenAi(apiKey: string, system: string, messages: ChatMessage[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(body.error?.message || "Falha ao gerar resposta com OpenAI.");
  return body.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callGoogle(apiKey: string, system: string, messages: ChatMessage[]) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
    },
  );
  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(body.error?.message || "Falha ao gerar resposta com Google.");
  return body.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

/**
 * Gera uma sugestão de resposta com IA para a conversa, usando o provedor com
 * chave própria ativa. Não envia nada — só devolve o texto para o atendente
 * revisar antes de enviar (o mesmo "draft de resposta" do Origin).
 */
export const generateWhatsappDraftReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ conversationId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cred } = await supabaseAdmin
      .from("ai_provider_credentials")
      .select("provider, api_key")
      .eq("active", true)
      .limit(1)
      .maybeSingle();
    if (!cred) {
      throw new Error(
        "Nenhum provedor de IA está ativo. Configure uma chave em Provedores e chaves.",
      );
    }

    const [{ data: settings }, { data: conversation }, { data: mensagens }] = await Promise.all([
      supabaseAdmin.from("app_settings").select("brand_name").eq("id", 1).maybeSingle(),
      supabaseAdmin
        .from("conversations")
        .select("contacts(name)")
        .eq("id", data.conversationId)
        .maybeSingle(),
      supabaseAdmin
        .from("messages")
        .select("direction, body")
        .eq("conversation_id", data.conversationId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const historico: ChatMessage[] = (mensagens ?? [])
      .slice()
      .reverse()
      .filter((m) => m.body)
      .map((m) => ({
        role: m.direction === "saida" ? "assistant" : "user",
        content: m.body as string,
      }));
    if (historico.length === 0) {
      throw new Error("Sem mensagens nesta conversa para basear uma sugestão.");
    }

    const nomeContato = (conversation?.contacts as { name?: string } | null)?.name ?? "o cliente";
    const nomeEmpresa = settings?.brand_name ?? "a empresa";
    const system = `Você é a assistente de atendimento da ${nomeEmpresa}, respondendo ${nomeContato} pelo WhatsApp. Seja cordial, objetiva e breve (no máximo 3 frases). Responda só com o texto da mensagem, sem saudações redundantes se a conversa já estiver em andamento.`;

    let texto: string;
    if (cred.provider === "anthropic") texto = await callAnthropic(cred.api_key, system, historico);
    else if (cred.provider === "openai") texto = await callOpenAi(cred.api_key, system, historico);
    else texto = await callGoogle(cred.api_key, system, historico);

    if (!texto) throw new Error("O provedor de IA não retornou nenhum texto.");
    return { text: texto };
  });
