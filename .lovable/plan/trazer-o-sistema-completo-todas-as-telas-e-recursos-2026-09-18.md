# Trazer o sistema completo: todas as telas e recursos

Objetivo: este projeto passa a ser o **modelo** (template) do CRM. Cada cliente terá uma instalação própria na VPS dele, com banco próprio. Aqui construímos a versão de referência, com todas as telas e recursos do sistema atual.

## O que fica de fora (regra firme)

- Qualquer menção a Deskcomm
- Qualquer menção ao Rafael / autor
- Configuração da Hostgator
- Conexão com a Nuvemshop
- Painel de administração da plataforma (empresas, cobrança, consumo, administradores da plataforma) — sem sentido numa instalação por cliente

## Como vamos entregar

Primeiro o **visual de todas as telas** com dados de exemplo, para você ver o sistema inteiro; depois ligamos tudo ao banco, tela por tela. As telas de integrações externas ficam prontas para você colar as chaves quando tiver.

## Fase 1 — Visual de todas as telas (com dados de exemplo)

Blocos, na ordem:

1. **Atendimento** — caixa de conversas do WhatsApp, conversa aberta, fila, respostas rápidas, etiquetas, modelos de mensagem, canal oficial
2. **Contatos e vendas** — contatos, ficha do contato, funil (kanban), ficha do negócio, funis e estágios, produtos, atividades
3. **Agenda e tarefas** — calendário, compromissos, tarefas, página pública de agendamento
4. **IA (completo)** — visão geral, agentes (lista, criação, edição), habilidades, roteamento, base de conhecimento, memória, casos, propostas, follow-up (réguas e inscrições), execuções, provedores e credenciais, consumo, caixa de conversas da IA, evolução
5. **Relatórios** — painel inicial, métricas, análise, radar, auditoria
6. **Configurações** — perfil, segurança, notificações, marca (nome, logo, cores), atendimento, etiquetas, modelos, agenda, funis, WhatsApp, conversões, Meta Ads, chaves de API, webhooks, conexões, atualização
7. **Equipe e acesso** — membros, convite, aceitar convite, cargos e permissões
8. **Entrada e apoio** — login, cadastro, esqueci a senha, redefinir, verificação em duas etapas, primeiros passos (passo a passo de configuração), páginas de erro (403/500/503, acesso revogado), termos e privacidade
9. **Privacidade (LGPD)** — pedidos de dados, detalhe do pedido

Cada bloco entra com o menu lateral e os nomes já no vocabulário do cliente (Inbox → WhatsApp, e assim por diante).

## Fase 2 — Ligar ao banco e fazer funcionar

Na mesma ordem dos blocos: ampliar o banco (etiquetas, modelos, produtos, atividades, agentes de IA, follow-up, base de conhecimento, execuções, auditoria, notificações, chaves de API, webhooks, pedidos de privacidade), ligar cada tela aos dados reais, com permissões por cargo.

## Fase 3 — WhatsApp real e IA ligada

Conectar o WhatsApp ao gateway do seu servidor atual (mesmo número) e ligar os agentes de IA para responder de verdade.

## Fase 4 — Virar modelo instalável na VPS

Arquivos de Docker e instruções, com o banco e o login apontando para o servidor do cliente em vez da nuvem daqui. Cada novo cliente: cópia do projeto + banco novo na VPS dele.

## Detalhes técnicos

- Rotas TanStack Start em `src/routes/`, área logada sob `_authenticated/`; nomes de rota em português (`/whatsapp`, `/funil`, `/ia/agentes`, …).
- Fase 1 usa dados de exemplo em módulos locais (`src/lib/demo/*`), substituídos por queries na Fase 2 — nada de dados falsos permanecendo depois.
- Banco: migrações incrementais por bloco, sempre com RLS + GRANT; `app_settings` cresce para cobrir marca, atendimento e agenda.
- IA: começa pelo gateway de IA da plataforma; a tela de provedores/credenciais permite trocar por chave própria do cliente.
- Integrações externas (Meta Ads, Google, e-mail, WhatsApp): telas de configuração + guarda de credenciais; chamadas reais só quando as chaves existirem.
- Autoinstalação na VPS exige banco e login próprios (Supabase self-hosted) — feito na Fase 4, sem alterar as telas.
