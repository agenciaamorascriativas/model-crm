import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/crm.functions";

const PROVIDERS = ["openai", "anthropic", "google"] as const;
type Provider = (typeof PROVIDERS)[number];

function maskKey(apiKey: string) {
  const tail = apiKey.slice(-4);
  const prefix = apiKey.startsWith("sk-ant-")
    ? "sk-ant-"
    : apiKey.startsWith("sk-")
      ? "sk-"
      : apiKey.slice(0, 4);
  return `${prefix}${"•".repeat(10)}${tail}`;
}

/** Salva (ou substitui) a chave própria de um provedor de IA. Apenas administradores. */
export const saveAiProviderCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        provider: z.enum(PROVIDERS),
        apiKey: z.string().min(8),
        models: z.record(z.string(), z.string()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("ai_provider_credentials").upsert(
      {
        provider: data.provider,
        api_key: data.apiKey,
        key_hint: maskKey(data.apiKey),
        active: true,
        models: (data.models ?? {}) as never,
      },
      { onConflict: "provider" },
    );
    if (error) throw new Error("Não foi possível salvar a chave.");
    return { ok: true };
  });

/** Ativa/desativa o uso da chave própria de um provedor (sem apagar a chave). Apenas administradores. */
export const setAiProviderActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ provider: z.enum(PROVIDERS), active: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ai_provider_credentials")
      .update({ active: data.active })
      .eq("provider", data.provider);
    if (error) throw new Error("Não foi possível atualizar o provedor.");
    return { ok: true };
  });

/** Remove a chave própria de um provedor, voltando para o padrão da plataforma. Apenas administradores. */
export const deleteAiProviderCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ provider: z.enum(PROVIDERS) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ai_provider_credentials")
      .delete()
      .eq("provider", data.provider);
    if (error) throw new Error("Não foi possível remover a chave.");
    return { ok: true };
  });

/** Lista os provedores configurados, sem nunca devolver a chave em texto puro. */
export const listAiProviderCredentials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ai_provider_credentials")
      .select("provider, key_hint, active, models, updated_at");
    if (error) throw new Error("Não foi possível carregar os provedores.");
    return data;
  });

async function pingOpenAi(apiKey: string) {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error("Chave da OpenAI inválida ou sem permissão.");
}

async function pingAnthropic(apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
  });
  if (!res.ok) throw new Error("Chave da Anthropic inválida ou sem permissão.");
}

async function pingGoogle(apiKey: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  );
  if (!res.ok) throw new Error("Chave do Google inválida ou sem permissão.");
}

/** Testa a chave salva de um provedor com uma chamada real e leve à API. Apenas administradores. */
export const testAiProviderCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ provider: z.enum(PROVIDERS) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("ai_provider_credentials")
      .select("api_key")
      .eq("provider", data.provider)
      .maybeSingle();
    if (error || !row) throw new Error("Nenhuma chave salva para este provedor.");

    const ping: Record<Provider, (key: string) => Promise<void>> = {
      openai: pingOpenAi,
      anthropic: pingAnthropic,
      google: pingGoogle,
    };
    await ping[data.provider](row.api_key);
    return { ok: true };
  });
