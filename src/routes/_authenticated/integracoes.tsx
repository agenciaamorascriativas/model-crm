import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageContainer } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/integracoes")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Integrações — Amoras CRM" },
    { name: "description", content: "Conexões técnicas e canais externos do CRM." },
    { property: "og:title", content: "Integrações — Amoras CRM" },
    { property: "og:description", content: "Conexões técnicas e canais externos do CRM." },
  ]}),
  component: () => <PageContainer wide><Outlet /></PageContainer>,
});