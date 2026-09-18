import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand } from "@/routes/auth";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/erro/403")({
  head: () => ({
    meta: [
      { title: "Acesso negado — Amoras CRM" },
      { name: "description", content: "Você não tem permissão para acessar esta página." },
      { property: "og:title", content: "Acesso negado — Amoras CRM" },
      { property: "og:description", content: "Você não tem permissão para acessar esta página." },
    ],
  }),
  component: () => (
    <AvisoLayout
      icon={ShieldAlert}
      codigo="403"
      titulo="Você não tem permissão para ver esta página"
      descricao="Parece que sua conta não tem acesso liberado para este recurso. Se acha que isso é um engano, fale com quem administra o sistema na sua empresa."
    />
  ),
});

export function AvisoLayout({
  icon: Icon,
  codigo,
  titulo,
  descricao,
}: {
  icon: React.ComponentType<{ className?: string }>;
  codigo?: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(1200px 600px at 80% -10%, oklch(0.93 0.05 340), transparent), var(--color-background)",
      }}
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          {codigo && (
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Erro {codigo}
            </p>
          )}
          <h1 className="mt-1 font-display text-xl font-bold">{titulo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{descricao}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/auth">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao início
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:suporte@exemplo.com">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Falar com o suporte
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
