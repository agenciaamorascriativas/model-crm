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
