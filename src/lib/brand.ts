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

export function applyBrandColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty("--primary", color);
  root.style.setProperty("--ring", color);
  root.style.setProperty("--sidebar-primary", color);
  root.style.setProperty("--secondary", `color-mix(in srgb, ${color} 12%, var(--background))`);
  root.style.setProperty("--secondary-foreground", `color-mix(in srgb, ${color} 72%, var(--foreground))`);
  root.style.setProperty("--accent", `color-mix(in srgb, ${color} 16%, var(--background))`);
  root.style.setProperty("--accent-foreground", `color-mix(in srgb, ${color} 76%, var(--foreground))`);
}