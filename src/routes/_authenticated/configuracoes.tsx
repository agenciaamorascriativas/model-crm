import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { PageContainer } from "@/components/page-shell";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configurações — Amoras CRM" },
      { name: "description", content: "Sua conta, os dados da empresa e quem tem acesso ao quê." },
      { property: "og:title", content: "Configurações — Amoras CRM" },
      { property: "og:description", content: "Sua conta, os dados da empresa e quem tem acesso ao quê." },
    ],
  }),
  component: ConfiguracoesLayout,
});

function ConfiguracoesLayout() {
  const location = useLocation();
  const isOverview = location.pathname === "/configuracoes" || location.pathname === "/configuracoes/";

  return (
    <PageContainer wide>
      {!isOverview && (
        <Link to="/configuracoes" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Configurações
        </Link>
      )}
      <Outlet />
    </PageContainer>
  );
}
