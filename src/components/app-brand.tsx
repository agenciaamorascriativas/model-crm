import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyBrandColor, getBrandAsset, getBrandSettings } from "@/lib/brand";

export function AppBrand({ dark = false }: { dark?: boolean }) {
  const { data: brand } = useQuery({ queryKey: ["app_settings", "brand"], queryFn: getBrandSettings });
  const { data: logo } = useQuery({
    queryKey: ["brand-asset", brand?.logo_url],
    queryFn: () => getBrandAsset(brand?.logo_url ?? null),
    enabled: Boolean(brand?.logo_url),
  });
  const { data: favicon } = useQuery({
    queryKey: ["brand-asset", brand?.favicon_url],
    queryFn: () => getBrandAsset(brand?.favicon_url ?? null),
    enabled: Boolean(brand?.favicon_url),
  });

  useEffect(() => {
    if (brand?.primary_color) applyBrandColor(brand.primary_color);
  }, [brand?.primary_color]);

  useEffect(() => {
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [favicon]);

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {logo ? (
        <img src={logo} alt="" className="h-9 w-9 shrink-0 object-contain" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ImagePlus className="h-4 w-4" />
        </div>
      )}
      <span className={cn("truncate font-display text-lg font-bold", dark ? "text-sidebar-foreground" : "text-foreground")}>
        {brand?.brand_name ?? "Amoras CRM"}
      </span>
    </div>
  );
}