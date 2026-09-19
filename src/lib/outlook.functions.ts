import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/crm.functions";
import type { CalendarSync } from "@/lib/types";

const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GRAPH_ME_URL = "https://graph.microsoft.com/v1.0/me";
const SCOPE = "offline_access Calendars.ReadWrite User.Read";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

function readOutlookEnv() {
  const clientId = process.env["OUTLOOK_CLIENT_ID"];
  const clientSecret = process.env["OUTLOOK_CLIENT_SECRET"];
  const redirectUri = process.env["OUTLOOK_REDIRECT_URI"];
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Integração do Outlook ainda não configurada. Peça ao suporte para cadastrar OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET e OUTLOOK_REDIRECT_URI.",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

async function salvarStatusConexao(email: string | null, conectado: boolean) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("calendar_sync")
    .eq("id", 1)
    .maybeSingle();
  const atual = (settings?.calendar_sync as unknown as CalendarSync) ?? {
    google: { status: "nao_configurado" },
    outlook: { status: "nao_configurado" },
  };
  const proximo: CalendarSync = {
    ...atual,
    outlook: conectado
      ? { status: "conectado", email, connected_at: new Date().toISOString() }
      : { status: "nao_configurado", email: null, connected_at: null },
  };
  await supabaseAdmin
    .from("app_settings")
    .update({ calendar_sync: proximo as unknown as never })
    .eq("id", 1);
}

/** Troca o "code" devolvido pela Microsoft por tokens e guarda a conexão. Apenas administradores. */
export const exchangeOutlookCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(1) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { clientId, clientSecret, redirectUri } = readOutlookEnv();

    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: data.code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope: SCOPE,
      }),
    });
    const token = (await tokenRes.json()) as TokenResponse;
    if (!tokenRes.ok || !token.access_token || !token.refresh_token) {
      throw new Error(
        token.error_description || "Não foi possível concluir a conexão com o Outlook.",
      );
    }

    const meRes = await fetch(GRAPH_ME_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = (await meRes.json()) as { mail?: string; userPrincipalName?: string };
    const email = me.mail || me.userPrincipalName || null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const expiresAt = new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString();
    const { error } = await supabaseAdmin.from("calendar_oauth_tokens").upsert(
      {
        provider: "outlook",
        account_email: email,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: expiresAt,
      },
      { onConflict: "provider" },
    );
    if (error) throw new Error("Não foi possível salvar a conexão com o Outlook.");

    await salvarStatusConexao(email, true);
    return { email };
  });

/** Remove a conexão do Outlook (tokens e status). Apenas administradores. */
export const disconnectOutlook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("calendar_oauth_tokens").delete().eq("provider", "outlook");
    await salvarStatusConexao(null, false);
    return { ok: true };
  });
