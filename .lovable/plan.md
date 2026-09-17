# Reconstruir o CRM aqui — v1 com os 4 módulos escolhidos

## O que já foi feito

O repositório `crm-origin` (DeskcommCRM) foi lido por completo. É um projeto Next.js + Supabase com 23 módulos e 246 migrações de banco. Guardamos uma cópia de referência para consultar durante a construção.

**Importante:** o repositório pode voltar a ficar privado no GitHub agora — não vamos mais precisar de acesso externo.

## Estratégia

Não copiamos o projeto inteiro (são 23 módulos, e a maioria não serve). Reconstruímos aqui, módulo por módulo, apenas o que você escolheu, usando o código original como referência de regras e comportamento. A tecnologia aqui é React igual, o que muda é a "carcaça" (rotas e backend gerenciado daqui).

**Escopo da v1 (o que você marcou):**
1. WhatsApp + Contatos — caixa de conversas, contatos, tags e notas
2. CRM de vendas — Kanban de leads, pipelines e estágios
3. Agenda + Tarefas — compromissos e lista de tarefas
4. Equipe + Configurações — login, usuários, permissões e identidade visual

**Fica de fora por enquanto:** IA/agentes, anúncios, webhooks, integrações (Nuvemshop etc.), LGPD, radar, templates, painel admin, onboarding em múltiplas etapas. Entram depois, se você quiser.

## Regra de marca (firme)

Zero menções a Deskcomm ou ao autor: nenhum nome, logo, link ou crédito. Telas renomeadas para o vocabulário de vocês ("Inbox" → "WhatsApp" e assim por diante). No fim, uma varredura em todo o código procurando qualquer menção remanescente.

## Etapas de construção

1. **Base** — ativar o backend gerenciado (Lovable Cloud): login por e-mail/senha, tabela de cargos (admin/membro) e o banco de dados dos 4 módulos (contatos, conversas, leads/estágios, compromissos, tarefas), com permissões por usuário.
2. **Casca do sistema** — menu lateral com os itens renomeados, tela inicial e identidade visual de vocês (nome e logo configuráveis em Configurações; posso usar "Amoras CRM" como provisório).
3. **WhatsApp + Contatos** — lista de conversas, thread de mensagens, composer com notas e tags, painel do contato.
4. **CRM de vendas** — quadro Kanban com colunas de estágio, cards de lead, edição e histórico do lead.
5. **Agenda + Tarefas** — grade de compromissos com detalhes e lista de tarefas com responsável e prazo.
6. **Equipe + Configurações** — convite de usuários por e-mail, cargos, e telas de configuração (marca, estágios do funil, etiquetas).
7. **Varredura final** — procurar e remover qualquer referência ao sistema/autor antigo; conferir cada tela renomeada.

## Ressalva sobre o WhatsApp real

A v1 entrega a interface e os dados das conversas (como o sistema antigo funciona por dentro). Para **enviar e receber mensagens de verdade**, é preciso conectar um gateway de WhatsApp — o seu servidor atual (o que roda no Portainer) pode ser ligado ao sistema novo por webhook, sem trocar de número. Isso é uma etapa seguinte, depois que a interface estiver pronta.

## Sobre o Docker/Portainer (depois)

Ao final, conectamos o projeto ao GitHub e entregamos Dockerfile + compose prontos. O container roda a interface e as regras; o banco e o login ficam no backend gerenciado daqui (migração para banco próprio seria etapa separada).
