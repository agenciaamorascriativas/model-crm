import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inviteMember, setUserRole } from "@/lib/crm.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/equipe")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Equipe — Amoras CRM" },
      { name: "description", content: "Membros da equipe, cargos e acessos." },
      { property: "og:title", content: "Equipe — Amoras CRM" },
      { property: "og:description", content: "Membros da equipe, cargos e acessos." },
    ],
  }),
  component: EquipePage,
});

function EquipePage() {
  const queryClient = useQueryClient();
  const [inviting, setInviting] = useState(false);
  const meId = Route.useRouteContext().user.id;

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: myRole } = useQuery({
    queryKey: ["my-role", meId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", meId);
      if (error) throw error;
      return data.some((r) => r.role === "admin") ? "admin" : "member";
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
- };
  const [loadedRole, setLoadedRole] = useState<Profile | null>(null);
  void loadedRole;
  void setLoadedRole;
  void invalidate;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Equipe</h1>
          <p className="text-sm text-muted-foreground">
            {profiles?.length ?? 0} membros com acesso ao sistema
          </p>
        </div>
        {myRole === "admin" && (
          <Button onClick={() => setInviting(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar membro
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="rounded-2xl border bg-card py-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {(profiles ?? []).map((p) => (
          <MemberCard
            key={p.id}
            profile={p}
            isAdmin={myRole === "admin"}
            isMe={p.user_id === meId}
            onChanged={() => queryClient.invalidateQueries({ queryKey: ["profiles"] })}
          />
        ))}
      </div>

      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}

function MemberCard({
  profile,
  isAdmin,
  isMe,
  onChanged,
}: {
  profile: Profile;
  isAdmin: boolean;
  isMe: boolean;
  onChanged: () => void;
}) {
  const [role, setRole] = useState<"admin" | "member" | null>(null);
  const [saving, setSaving] = useState(false);

  const displayName = profile.full_name || profile.email?.split("@")[0] || "Membro";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function changeRole(next: "admin" | "member") {
    setSaving(true);
    try {
      await setUserRole({ data: { userId: profile.user_id, role: next } });
      setRole(next);
      toast.success(next === "admin" ? "Agora é administrador." : "Agora é membro.");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar o cargo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
      <Avatar className="h-11 w-11">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium">
          {displayName}
          {isMe && <span className="text-xs text-muted-foreground">(você)</span>}
        </p>
        <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
      </div>
      {isAdmin && !isMe ? (
        <select
          value={role ?? "member"}
          onChange={(e) => changeRole(e.target.value as "admin" | "member")}
          disabled={saving}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="member">Membro</option>
          <option value="admin">Administrador</option>
        </select>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          {role === "admin" || (role === null && isMe && isAdmin) ? "Administrador" : "Membro"}
        </Badge>
      )}
    </div>
  );
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [loadedOpen, setLoadedOpen] = useState(false);
  if (open && !loadedOpen) {
    setLoadedOpen(true);
    setFullName("");
    setEmail("");
    setPassword("");
  }
  if (!open && loadedOpen) setLoadedOpen(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await inviteMember({ data: { email, password, fullName } });
      toast.success("Acesso criado! Compartilhe o e-mail e a senha com a pessoa.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível criar o acesso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar membro</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Senha provisória (mín. 6 caracteres)</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A pessoa entra com esse e-mail e senha e pode trocar depois.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar acesso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
