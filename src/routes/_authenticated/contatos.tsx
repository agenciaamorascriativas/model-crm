import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Contact } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/contatos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Contatos — Amoras CRM" },
      { name: "description", content: "Gerencie os contatos da sua equipe." },
      { property: "og:title", content: "Contatos — Amoras CRM" },
      { property: "og:description", content: "Gerencie os contatos da sua equipe." },
    ],
  }),
  component: ContatosPage,
});

function ContatosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Contact[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts ?? [];
    return (contacts ?? []).filter((c) =>
      [c.name, c.phone, c.email, c.company, c.job_title, c.category, c.source, c.city, c.state, c.cpf].some((f) =>
        f?.toLowerCase().includes(q),
      ),
    );
  }, [contacts, search]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Contatos</h1>
          <p className="text-sm text-muted-foreground">
            {contacts?.length ?? 0} contatos cadastrados
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo contato
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, empresa, cidade, categoria..."
          className="pl-9"
        />
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa / cargo</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {c.name}
                  {c.category && <p className="text-xs font-normal text-muted-foreground">{c.category}</p>}
                </TableCell>
                <TableCell>
                  {c.company || "—"}
                  {c.job_title && <p className="text-xs text-muted-foreground">{c.job_title}</p>}
                </TableCell>
                <TableCell>
                  {c.phone || "—"}
                  {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                </TableCell>
                <TableCell>{[c.city, c.state].filter(Boolean).join(" / ") || "—"}</TableCell>
                <TableCell>{c.source || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(c.tags ?? []).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ContactDialog
        open={creating || !!editing}
        contact={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={invalidate}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir contato</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong>{deleting?.name}</strong>? As conversas
            vinculadas a ele também serão removidas.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleting) return;
                const { error } = await supabase.from("contacts").delete().eq("id", deleting.id);
                if (error) {
                  toast.error("Não foi possível excluir.");
                } else {
                  toast.success("Contato excluído.");
                  invalidate();
                  setDeleting(null);
                }
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContactDialog({
  open,
  contact,
  onClose,
  onSaved,
}: {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [cpf, setCpf] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Preenche ao abrir
  const [loadedFor, setLoadedFor] = useState<Contact | null | undefined>(undefined);
  if (open && loadedFor !== contact) {
    setLoadedFor(contact);
    setName(contact?.name ?? "");
    setPhone(contact?.phone ?? "");
    setEmail(contact?.email ?? "");
    setCompany(contact?.company ?? "");
    setJobTitle(contact?.job_title ?? "");
    setCategory(contact?.category ?? "");
    setSource(contact?.source ?? "");
    setCpf(contact?.cpf ?? "");
    setCity(contact?.city ?? "");
    setState(contact?.state ?? "");
    setAddress(contact?.address ?? "");
    setLinkedin(contact?.linkedin ?? "");
    setInstagram(contact?.instagram ?? "");
    setTags((contact?.tags ?? []).join(", "));
    setNotes(contact?.notes ?? "");
  }
  if (!open && loadedFor !== undefined) setLoadedFor(undefined);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      phone: phone || null,
      email: email || null,
      company: company || null,
      job_title: jobTitle || null,
      category: category || null,
      source: source || null,
      cpf: cpf || null,
      city: city || null,
      state: state || null,
      address: address || null,
      linkedin: linkedin || null,
      instagram: instagram || null,
      notes: notes || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const { error } = contact
      ? await supabase.from("contacts").update(payload).eq("id", contact.id)
      : await supabase.from("contacts").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o contato.");
    } else {
      toast.success(contact ? "Contato atualizado." : "Contato criado.");
      onSaved();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Editar contato" : "Novo contato"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nome *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} maxLength={80} placeholder="Ex.: Diretora comercial" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} maxLength={60} placeholder="Ex.: Cliente, Parceiro" />
            </div>
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} maxLength={60} placeholder="Ex.: Indicação, Instagram" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>WhatsApp / Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" maxLength={40} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label>CPF</Label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" maxLength={20} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cliente, quente" maxLength={200} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} maxLength={40} placeholder="Ex.: SP" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Endereço</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn</Label>
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} maxLength={200} placeholder="linkedin.com/in/..." />
            </div>
            <div className="space-y-1.5">
              <Label>Instagram</Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} maxLength={120} placeholder="@perfil" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
