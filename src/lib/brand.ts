import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_BRAND = {
  brand_name: "Amoras CRM",
  primary_color: "#A52C64",
  logo_url: null as string | null,
  favicon_url: null as string | null,
};

export async function getBrandSettings() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("brand_name, primary_color, logo_url, favicon_url")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data ?? DEFAULT_BRAND;
}

export async function getBrandAsset(path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from("brand-assets").download(path);
  if (error) return null;
  return URL.createObjectURL(data);
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number) {
  const part = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Mistura a cor da marca com branco (amount > 0) ou preto (amount < 0). */
export function shade(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  return toHex(r + (target - r) * t, g + (target - g) * t, b + (target - b) * t);
}

export function isDarkColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.62;
}

/** Escala de nove tons da cor da marca, do mais claro ao mais escuro. */
export function brandScale(hex: string) {
  return [0.92, 0.8, 0.62, 0.38, 0, -0.16, -0.32, -0.48, -0.64].map((a) => shade(hex, a));
}

/** Aplica a identidade visual em todo o sistema (menu, telas, botões, gráficos). */
export function applyBrandColor(color: string) {
  const root = document.documentElement;
  const onPrimary = isDarkColor(color) ? "#ffffff" : shade(color, -0.75);
  const foreground = shade(color, -0.78);

  const tokens: Record<string, string> = {
    "--background": shade(color, 0.94),
    "--foreground": foreground,
    "--card": shade(color, 0.985),
    "--card-foreground": foreground,
    "--popover": shade(color, 0.985),
    "--popover-foreground": foreground,

    "--primary": color,
    "--primary-foreground": onPrimary,
    "--ring": color,

    "--secondary": shade(color, 0.86),
    "--secondary-foreground": shade(color, -0.56),
    "--accent": shade(color, 0.78),
    "--accent-foreground": shade(color, -0.62),
    "--muted": shade(color, 0.9),
    "--muted-foreground": shade(color, -0.42),
    "--border": shade(color, 0.73),
    "--input": shade(color, 0.73),

    "--sidebar": shade(color, -0.56),
    "--sidebar-foreground": "#ffffff",
    "--sidebar-primary": color,
    "--sidebar-primary-foreground": onPrimary,
    "--sidebar-accent": shade(color, -0.3),
    "--sidebar-accent-foreground": "#ffffff",
    "--sidebar-border": shade(color, -0.38),
    "--sidebar-ring": color,

    "--chart-1": color,
    "--chart-2": shade(color, 0.35),
    "--chart-3": shade(color, -0.3),
    "--chart-4": shade(color, 0.62),
    "--chart-5": shade(color, -0.5),
  };

  for (const [name, value] of Object.entries(tokens)) {
    root.style.setProperty(name, value);
  }

  root.dataset["brandColor"] = color.toUpperCase();
}
