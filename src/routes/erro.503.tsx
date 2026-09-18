import { createFileRoute } from "@tanstack/react-router";
import { AvisoLayout } from "@/routes/erro.403";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/erro/503")({
  head: () => ({
    meta: [
      { title: "Em manutenção — Amoras CRM" },
      { name: "description", content: "Estamos em manutenção programada, voltamos logo." },
      { property: "og:title", content: "Em manutenção — Amoras CRM" },
      { property: "og:description", content: "Estamos em manutenção programada, voltamos logo." },
    ],
  }),
  component: () => (
    <AvisoLayout
      icon={Wrench}
      codigo="503"
      titulo="Estamos em manutenção rápida"
      descricao="O sistema está passando por uma atualização programada e deve voltar ao normal em poucos minutos. Obrigado pela paciência."
    />
  ),
});
