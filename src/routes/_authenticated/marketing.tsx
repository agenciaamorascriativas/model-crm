import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageContainer } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/marketing")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Marketing — Amoras CRM" },
    { name: "description", content: "Conversões, atribuição de vendas e campanhas." },
    { property: "og:title", content: "Marketing — Amoras CRM" },
    { property: "og:description", content: "Conversões, atribuição de vendas e campanhas." },
  ]}),
  component: () => <PageContainer wide><Outlet /></PageContainer>,
});