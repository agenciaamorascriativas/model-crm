import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarCheck, Mail, Bell, Loader2, Link2, Unlink } from "lucide-react";
import { toast } from "sonner";
import type { CalendarSync, ReminderSettings } from "@/lib/types";
import { disconnectOutlook } from "@/lib/outlook.functions";

function buildOutlookAuthUrl(state: string): string | null {
  const clientId = import.meta.env["VITE_OUTLOOK_CLIENT_ID"];
  const redirectUri = import.meta.env["VITE_OUTLOOK_REDIRECT_URI"];
  if (!clientId || !redirectUri) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: "offline_access Calendars.ReadWrite User.Read",
    state,
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

const OFFSETS: { value: string; label: string }[] = [
  { value: "1w", label: "1 semana antes" },
  { value: "1d", label: "1 dia antes" },
  { value: "3h", label: "3 horas antes" },
  { value: "1h", label: "1 hora antes" },
  { value: "15m", label: "15 minutos antes" },
];

const CHANNELS: { value: string; label: string }[] = [
  { value: "email", label: "E-mail" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "interno", label: "Aviso dentro do sistema" },
];

const RECIPIENTS: { value: string; label: string }[] = [
  { value: "responsavel", label: "Responsável pelo compromisso" },
  { value: "cliente", label: "Cliente / contato" },
  { value: "equipe", label: "Equipe toda" },
];

type Settings = {
  calendar_sync: CalendarSync;
  reminder_settings: ReminderSettings;
};

export function AgendaIntegracoes() {
  const queryClient = useQueryClient();
  const [dialogAberto, setDialogAberto] = useState<null | "google">(null);
  const [emailConta, setEmailConta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [conectandoOutlook, setConectandoOutlook] = useState(false);

  const { data } = useQuery({
    queryKey: ["app_settings", "agenda"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("calendar_sync, reminder_settings")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Settings | null;
    },
  });

  const [lembretes, setLembretes] = useState<ReminderSettings | null>(null);
  useEffect(() => {
    if (data?.reminder_settings) setLembretes(data.reminder_settings);
  }, [data]);

  const sync = data?.calendar_sync;

  async function salvarConexao(conectado: boolean) {
    setSalvando(true);
    const atual: CalendarSync = sync ?? {
      google: { status: "nao_configurado" },
      outlook: { status: "nao_configurado" },
    };
    const proximo: CalendarSync = {
      ...atual,
      google: conectado
        ? {
            status: "conectado",
            email: emailConta.trim() || null,
            connected_at: new Date().toISOString(),
          }
        : { status: "nao_configurado", email: null, connected_at: null },
    };
    const { error } = await supabase
      .from("app_settings")
      .update({ calendar_sync: proximo as unknown as never })
      .eq("id", 1);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar a conexão.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["app_settings", "agenda"] });
    setDialogAberto(null);
    setEmailConta("");
    toast.success(conectado ? "Conta do calendário vinculada." : "Conta desvinculada.");
  }

  function conectarOutlook() {
    const state = crypto.randomUUID();
    const url = buildOutlookAuthUrl(state);
    if (!url) {
      toast.error("Integração do Outlook ainda não configurada. Fale com o suporte.");
      return;
    }
    sessionStorage.setItem("outlook_oauth_state", state);
    window.location.href = url;
  }

  async function desconectarOutlook() {
    setConectandoOutlook(true);
    try {
      await disconnectOutlook();
      await queryClient.invalidateQueries({ queryKey: ["app_settings", "agenda"] });
      toast.success("Conta do Outlook desvinculada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível desconectar o Outlook.");
    } finally {
      setConectandoOutlook(false);
    }
  }

  async function salvarLembretes() {
    if (!lembretes) return;
    setSalvando(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ reminder_settings: lembretes as unknown as never })
      .eq("id", 1);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar os avisos.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["app_settings", "agenda"] });
    toast.success("Avisos da agenda salvos.");
  }

  function alternar(lista: string[], valor: string) {
    return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {(["google", "outlook"] as const).map((provider) => {
        const estado = sync?.[provider];
        const conectado = estado?.status === "conectado";
        const nome = provider === "google" ? "Google Agenda (Gmail)" : "Outlook Calendário";
        return (
          <div key={provider} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              {provider === "google" ? (
                <Mail className="h-4 w-4 text-primary" />
              ) : (
                <CalendarCheck className="h-4 w-4 text-primary" />
              )}
              <p className="font-display font-semibold">{nome}</p>
              <Badge variant={conectado ? "default" : "secondary"} className="ml-auto">
                {conectado ? "Conectado" : "Não conectado"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {conectado
                ? `Sincronizando com ${estado?.email ?? "conta vinculada"}.`
                : "Vincule a conta para que os compromissos apareçam nos dois lados."}
            </p>
            <div className="mt-4">
              {conectado ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={provider === "google" ? salvando : conectandoOutlook}
                  onClick={() =>
                    provider === "google" ? salvarConexao(false) : desconectarOutlook()
                  }
                >
                  <Unlink className="mr-1.5 h-3.5 w-3.5" /> Desconectar
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() =>
                    provider === "google" ? setDialogAberto("google") : conectarOutlook()
                  }
                >
                  <Link2 className="mr-1.5 h-3.5 w-3.5" /> Conectar
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <div className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-3">
        <div className="flex flex-wrap items-center gap-3">
          <Bell className="h-4 w-4 text-primary" />
          <p className="font-display font-semibold">Lembretes e avisos</p>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Switch
              checked={lembretes?.enabled ?? false}
              onCheckedChange={(v) => lembretes && setLembretes({ ...lembretes, enabled: v })}
            />
            Ativos
          </label>
        </div>

        {lembretes && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Quando avisar</Label>
                <div className="flex flex-wrap gap-2">
                  {OFFSETS.map((o) => (
                    <Badge
                      key={o.value}
                      role="button"
                      variant={lembretes.offsets.includes(o.value) ? "default" : "outline"}
                      onClick={() =>
                        setLembretes({
                          ...lembretes,
                          offsets: alternar(lembretes.offsets, o.value),
                        })
                      }
                    >
                      {o.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Por onde avisar</Label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((c) => (
                    <Badge
                      key={c.value}
                      role="button"
                      variant={lembretes.channels.includes(c.value) ? "default" : "outline"}
                      onClick={() =>
                        setLembretes({
                          ...lembretes,
                          channels: alternar(lembretes.channels, c.value),
                        })
                      }
                    >
                      {c.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quem recebe</Label>
                <div className="flex flex-wrap gap-2">
                  {RECIPIENTS.map((r) => (
                    <Badge
                      key={r.value}
                      role="button"
                      variant={lembretes.recipients.includes(r.value) ? "default" : "outline"}
                      onClick={() =>
                        setLembretes({
                          ...lembretes,
                          recipients: alternar(lembretes.recipients, r.value),
                        })
                      }
                    >
                      {r.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Texto do aviso</Label>
              <Textarea
                rows={3}
                maxLength={600}
                value={lembretes.template}
                onChange={(e) => setLembretes({ ...lembretes, template: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Você pode usar {"{{nome}}"}, {"{{titulo}}"} e {"{{quando}}"} no texto.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={salvarLembretes} disabled={salvando}>
                {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar avisos
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogAberto !== null} onOpenChange={(o) => !o && setDialogAberto(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Google Agenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>E-mail da conta</Label>
              <Input
                type="email"
                value={emailConta}
                onChange={(e) => setEmailConta(e.target.value)}
                placeholder="voce@gmail.com"
                maxLength={255}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A autorização definitiva da conta é feita na instalação do sistema no servidor do
              cliente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(null)}>
              Cancelar
            </Button>
            <Button disabled={salvando || !emailConta.trim()} onClick={() => salvarConexao(true)}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
