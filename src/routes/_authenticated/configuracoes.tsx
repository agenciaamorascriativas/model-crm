import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { cn } from "@/lib/utils";
import type { LinkProps } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configurações — Amoras CRM" },
      { name: "description", content: "Preferências do sistema, marca, atendimento, integrações e segurança." },
      { property: "og:title", content: "Configurações — Amoras CRM" },
      { property: "og:description", content: "Preferências do sistema, marca, atendimento, integrações e segurança." },
    ],
  }),
  component: ConfiguracoesLayout,
});

type SubNavItem = { to: NonNullable<LinkProps["to"]>; label: string };
type SubNavGroup = { label: string; items: SubNavItem[] };

const SUBNAV: SubNavGroup[] = [
  {
    label: "Geral",
    items: [
      { to: "/configuracoes", label: "Geral" },
      { to: "/configuracoes/perfil", label: "Meu perfil" },
      { to: "/configuracoes/seguranca", label: "Segurança" },
      { to: "/configuracoes/notificacoes", label: "Notificações" },
    ],
  },
  {
    label: "Identidade e atendimento",
    items: [
      { to: "/configuracoes/marca", label: "Marca" },
      { to: "/configuracoes/atendimento", label: "Atendimento" },
      { to: "/configuracoes/etiquetas", label: "Etiquetas" },
      { to: "/configuracoes/modelos", label: "Modelos e assinaturas" },
      { to: "/configuracoes/agenda", label: "Agenda" },
      { to: "/configuracoes/funis", label: "Preferências do funil" },
    ],
  },
  {
    label: "Integrações",
    items: [
      { to: "/configuracoes/whatsapp", label: "WhatsApp" },
      { to: "/configuracoes/conversoes", label: "Conversões" },
      { to: "/configuracoes/meta-ads", label: "Meta Ads" },
      { to: "/configuracoes/conexoes", label: "Conexões" },
    ],
  },
  {
    label: "Avançado",
    items: [
      { to: "/configuracoes/api", label: "Chaves de API" },
      { to: "/configuracoes/webhooks", label: "Webhooks" },
      { to: "/configuracoes/atualizacao", label: "Atualização do sistema" },
    ],
  },
];

function ConfiguracoesLayout() {
  const location = useLocation();

  return (
    <PageContainer wide>
      <PageHeader
        title="Configurações"
        description="Ajuste o sistema, sua conta e as integrações do CRM."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          {SUBNAV.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-secondary font-medium text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
}
