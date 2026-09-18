import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/page-shell";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { AppSettings, Profile } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/configuracoes/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Geral — Amoras CRM" },
      { name: "description", content: "Identidade visual do sistema e seu perfil." },
      { property: "og:title", content: "Geral — Amoras CRM" },
      { property: "og:description", content: "Identidade visual do sistema e seu perfil." },
    ],
  }),
  component: ConfiguracoesGeralPage,
});

function ConfiguracoesGeralPage() {
  const user = Route.useRouteContext().user;

  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as AppSettings | null;
    },
  });

  const { data: myRole } = useQuery({
    queryKey: ["my-role", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.some((r) => r.role === "admin") ? "admin" : "member";
    },
  });

  return (
    <div className="space-y-6">
      <SettingsCard isAdmin={myRole === "admin"} settings={settings} />
      <ProfileCard />
    </div>
  );
}

function SettingsCard({
  isAdmin,
  settings,
}: {
  isAdmin: boolean;
  settings: AppSettings | null | undefined;
}) {
  const queryClient = useQueryClient();
  const [brandName, setBrandName] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentBrand = brandName ?? settings?.brand_name ?? "";
  const currentWhats = whatsapp ?? settings?.whatsapp_number ?? "";

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("app_settings")
        .update({ brand_name: currentBrand, whatsapp_number: currentWhats || null })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app_settings"] });
      toast.success("Configurações salvas.");
    },
    onError: () => {
      toast.error("Não foi possível salvar. Verifique se você é administrador.");
    },
  });

  return (
    <Panel
      title="Sistema"
      description={
        isAdmin
          ? "Estes dados aparecem para toda a equipe."
          : "Somente administradores podem alterar."
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nome do sistema</Label>
          <Input
            value={currentBrand}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={!isAdmin}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Número do WhatsApp do atendimento</Label>
          <Input
            value={currentWhats}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999"
            disabled={!isAdmin}
          />
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setSaving(true);
              save.mutate(undefined, { onSettled: () => setSaving(false) });
            }}
            disabled={saving || !settings}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        )}
      </div>
    </Panel>
  );
}

function ProfileCard() {
  const queryClient = useQueryClient();
  const user = Route.useRouteContext().user;

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const [fullName, setFullName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const currentName = fullName ?? profile?.full_name ?? "";

  return (
    <Panel title="Seu perfil" description={user.email}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input value={currentName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <Button
          onClick={async () => {
            setSaving(true);
            const { error } = await supabase
              .from("profiles")
              .update({ full_name: currentName })
              .eq("user_id", user.id);
            setSaving(false);
            if (error) {
              toast.error("Não foi possível salvar seu perfil.");
            } else {
              toast.success("Perfil atualizado.");
              queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
            }
          }}
          disabled={saving || !profile}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </Panel>
  );
}
