# Trazer o CRM do GitHub para cá (e rodar em Docker depois)

## O caminho escolhido

Seu CRM antigo é React/Next.js — a mesma família de tecnologia usada aqui. Isso significa que não precisamos começar do zero: dá para **copiar grande parte do código de verdade** (telas, componentes visuais e regras), adaptando só as peças que são exclusivas do Next.js.

## Fase 1 — Acesso ao repositório

1. Você conecta o GitHub pelo card que vou abrir no chat (login OAuth, um clique).
2. Com isso eu leio o repositório privado, mapeio as telas, funcionalidades e o modelo de dados, e te entrego um **inventário**: o que existe, o que serve e o que fica de fora.

## Fase 2 — Cortes

3. Com base no inventário, você marca o que não serve (você disse que tem muita coisa sobrando). Só então construímos, para não trazer lixo.

## Fase 3 — Migração do que serve

4. **Banco de dados e lógica**: recriamos a estrutura de dados aqui no backend gerenciado (Lovable Cloud), com permissões por usuário. As chamadas de API do Next.js viram funções no servidor desta plataforma — mesma lógica, formato novo.
5. **Telas e visual**: os componentes React do repositório são reaproveitados quase direto; páginas do Next.js viram rotas equivalentes aqui. Onde o CRM antigo usava recursos exclusivos do Next (carregamento no servidor, login próprio, imagens otimizadas), fazemos o equivalente desta plataforma.
6. **Login**: recriamos o acesso de usuários com o login gerenciado daqui (e-mail/senha, e Google se quiser).

## Fase 4 — Rodar no seu Portainer (depois)

7. Conectamos o projeto ao GitHub (sincronização automática de código).
8. O código exportado é padrão e roda em qualquer servidor: criamos um `Dockerfile` e um `docker-compose.yml` prontos para você subir no Portainer.
9. **Ressalva importante**: o container roda a interface e as regras do sistema, mas o banco de dados e o login continuam hospedados no backend gerenciado (nuvem). Se um dia quiser 100% no seu servidor, o caminho é migrar para um Supabase próprio — possível, mas é uma etapa separada.

## Ordem e economia

Nada é instalado ou pago antes da Fase 2. O único passo com custo é o backend gerenciado (Lovable Cloud), ativado na Fase 3, quando já soubermos exatamente o que construir.

## Detalhe técnico (se te interessar)

- O projeto aqui usa TanStack Start (React 19 + Vite), não Next.js. Componentes e hooks React migram direto; o que muda é o roteamento (`app/` do Next → `src/routes/`) e as rotas de API (→ funções de servidor via `createServerFn`).
- Não dá para importar o repositório inteiro automaticamente — a leitura é feita via API do GitHub, módulo por módulo, escolhendo o que vale copiar.
