import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Garante que o usuário logado tem perfil e cargo.
 * O primeiro membro da equipe vira administrador.
 */
export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      const email = (context.claims?.email as string | undefined) ?? null;
      await supabaseAdmin.from("profiles").upsert({
        user_id: userId,
        email,
        full_name: email?.split("@")[0] ?? null,
      });
    }

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true });

    if (!count) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: "admin" },
        { onConflict: "user_id,role" },
      );
et   } else {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "member" }, { onConflict: "user_id,role" });
    }

    return { ok: true };
  });
