import { createFileRoute } from "@tanstack/react-router";
import { AvisoLayout } from "@/routes/erro.403";
import { UserX } from "lucide-react";

export const Route = createFileRoute("/acesso-revogado")({
  head: () => ({
    meta: [
      { title: "Acesso revogado — Amoras CRM" },
      { name: "description", content: "Seu acesso a esta conta foi revogado." },
      { property: "og:title", content: "Acesso revogado — Amoras CRM" },
      { property: "og:description", content: "Seu acesso a esta conta foi revogado." },
    ],
  }),
  component: () => (
    <AvisoLayout
      icon={UserX}
      titulo="Seu acesso foi revogado"
      descricao="Um administrador removeu seu acesso a esta conta do CRM. Se você acredita que isso não deveria ter acontecido, entre em contato com quem administra sua empresa ou com o suporte."
    />
  ),
});
