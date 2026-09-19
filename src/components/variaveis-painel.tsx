import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { variaveisPorGrupo, preencherExemplo, variaveisInvalidas } from "@/lib/variaveis";
import { AlertTriangle } from "lucide-react";

export function VariaveisPainel({ onInserir }: { onInserir: (chave: string) => void }) {
  return (
    <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <div>
        <p className="text-sm font-semibold">Variáveis do CRM</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Clique para inserir no texto.</p>
      </div>
      {variaveisPorGrupo().map(({ grupo, itens }) => (
        <div key={grupo}>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{grupo}</p>
          <div className="flex flex-wrap gap-1.5">
            {itens.map((v) => (
              <Button
                key={v.chave}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 bg-card px-2 text-xs font-normal"
                onClick={() => onInserir(v.chave)}
              >
                {v.rotulo}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function VariaveisPrevia({ texto }: { texto: string }) {
  const invalidas = variaveisInvalidas(texto);
  return (
    <div className="space-y-2">
      <div className="rounded-xl border bg-card p-3 text-sm">
        {texto ? (
          <p className="whitespace-pre-wrap">{preencherExemplo(texto)}</p>
        ) : (
          <p className="text-muted-foreground">A prévia com valores de exemplo aparece aqui…</p>
        )}
      </div>
      {invalidas.length > 0 && (
        <p className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Variável não reconhecida:{" "}
            {invalidas.map((chave, i) => (
              <Badge key={chave} variant="outline" className="ml-1 font-mono text-[10px] font-normal">
                {`{{${chave}}}`}
              </Badge>
            )).map((el, i) => <span key={i}>{el}</span>)}
          </span>
        </p>
      )}
    </div>
  );
}
