import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
    } else {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "member" }, { onConflict: "user_id,role" });
    }

    return { ok: true };
  });

async function requireAdmin(userId: string) {
  const { data, error } = await (await import("@/integrations/supabase/client.server"))
    .supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) {
    throw new Error("Apenas administradores podem fazer isso.");
  }
}

/** Define o cargo de um membro da equipe. Apenas administradores. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), role: z.enum(["admin", "member"]) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (data.role === "member" && count === 1) {
      const { data: callerIsAdmin } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (callerIsAdmin) {
        throw new Error("Não é possível remover o último administrador.");
      }
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error("Não foi possível atualizar o cargo.");
    return { ok: true };
  });

/** Cria o acesso de um novo membro da equipe. Apenas administradores. */
export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        fullName: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (error || !created.user) {
      throw new Error("Não foi possível criar o acesso. Verifique se o e-mail já não está em uso.");
    }

    await supabaseAdmin.from("profiles").upsert({
      user_id: created.user.id,
      email: data.email,
      full_name: data.fullName,
    });
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: created.user.id, role: "member" },
      { onConflict: "user_id,role" },
    );

    return { ok: true };
  });
