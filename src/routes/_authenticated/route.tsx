import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile } from "@/lib/crm.functions";
import { AppBrand } from "@/components/app-brand";
import { LogOut, Menu } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});


function AppLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const user = Route.useRouteContext().user;

  // Garante perfil + cargo assim que entra
  useEffect(() => {
    ensureProfile().catch((e) => console.error("ensureProfile", e));
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Você saiu da conta.");
      window.location.href = "/auth";
    },
  });

  const displayName = profile?.full_name || user.email || "Equipe";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-sidebar px-4 text-sidebar-foreground md:hidden">
        <AppBrand dark />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
            <SheetTitle className="sr-only">Menu principal</SheetTitle>
            <SidebarContent pathname={pathname} displayName={displayName} email={user.email ?? ""} initials={initials} onSignOut={() => signOut.mutate()} closeLinks />
          </SheetContent>
        </Sheet>
      </header>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <SidebarContent pathname={pathname} displayName={displayName} email={user.email ?? ""} initials={initials} onSignOut={() => signOut.mutate()} />
      </aside>
      <main className="min-h-screen min-w-0 pt-14 md:ml-60 md:pt-0">{children}</main>
    </div>
  );
}

function SidebarContent({ pathname, displayName, email, initials, onSignOut, closeLinks = false }: { pathname: string; displayName: string; email: string; initials: string; onSignOut: () => void; closeLinks?: boolean }) {
  return <>
    <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5"><AppBrand dark /></div>
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => <div key={group.label} className="space-y-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">{group.label}</p>
        {group.items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          const link = <Link key={to} to={to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")}>
            <Icon className="h-4 w-4 shrink-0" /><span className="truncate">{label}</span>
          </Link>;
          return closeLinks ? <SheetClose asChild key={to}>{link}</SheetClose> : link;
        })}
      </div>)}
    </nav>
    <div className="shrink-0 border-t border-sidebar-border p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <Avatar className="h-8 w-8"><AvatarFallback className="bg-sidebar-primary text-xs text-sidebar-primary-foreground">{initials}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{displayName}</p><p className="truncate text-xs text-sidebar-foreground/60">{email}</p></div>
      </div>
      <Button variant="ghost" size="sm" className="mt-1 w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground" onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />Sair
      </Button>
    </div>
  </>;
}
