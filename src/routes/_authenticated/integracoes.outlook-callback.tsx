import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { exchangeOutlookCode } from "@/lib/outlook.functions";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/integracoes/outlook-callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search["code"] === "string" ? (search["code"] as string) : undefined,
    state: typeof search["state"] === "string" ? (search["state"] as string) : undefined,
    error: typeof search["error"] === "string" ? (search["error"] as string) : undefined,
    error_description:
      typeof search["error_description"] === "string"
        ? (search["error_description"] as string)
        : undefined,
  }),
  head: () => ({
    meta: [{ title: "Conectando Outlook — Amoras CRM" }],
  }),
  component: OutlookCallbackPage,
});

function OutlookCallbackPage() {
  const { code, state, error, error_description } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processando" | "erro">("processando");
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    async function run() {
      if (error) {
        setStatus("erro");
        setMensagemErro(error_description || "A Microsoft recusou a conexão.");
        return;
      }
      const esperado = sessionStorage.getItem("outlook_oauth_state");
      sessionStorage.removeItem("outlook_oauth_state");
      if (!code || !state || state !== esperado) {
        setStatus("erro");
        setMensagemErro("Não foi possível confirmar esta conexão. Tente novamente.");
        return;
      }
      try {
        await exchangeOutlookCode({ data: { code } });
        toast.success("Outlook conectado.");
        navigate({ to: "/configuracoes/agenda" });
      } catch (err) {
        setStatus("erro");
        setMensagemErro(
          err instanceof Error ? err.message : "Não foi possível conectar o Outlook.",
        );
      }
    }
    run();
  }, [code, state, error, error_description, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {status === "processando" ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Conectando sua conta do Outlook...</p>
        </>
      ) : (
        <>
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="max-w-sm text-sm text-muted-foreground">{mensagemErro}</p>
          <a href="/configuracoes/agenda" className="text-sm font-medium text-primary underline">
            Voltar para Agenda
          </a>
        </>
      )}
    </div>
  );
}
