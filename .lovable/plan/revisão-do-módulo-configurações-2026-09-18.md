# Revisão do módulo Configurações

## Objetivo
Reorganizar Configurações para ficar mais amigável, clara e fiel às referências, preservando as soluções que ficaram melhores no projeto atual — especialmente horário de silêncio e resumo diário em Notificações.

## 1. Página inicial de Configurações
- Substituir o menu lateral interno por uma visão geral em cards clicáveis, seguindo a composição da imagem 1.
- Organizar os cards em três blocos:
  - **Sua Empresa:** Tipos de agendamento, Equipe, Distribuição de atendimento, Organização e Marca.
  - **Sua Conta:** Perfil, Segurança e Notificações.
  - **Dados e Acesso:** LGPD e Chaves de API.
- Cada card terá ícone, título e uma descrição curta, com boa adaptação para celular.
- Não incluir cobrança nem recursos que pertencem à administração da plataforma.

## 2. Marca
- Refazer a página com a hierarquia da imagem 2, sem copiar suas limitações.
- Permitir qualquer cor por seletor visual e código hexadecimal digitável.
- Gerar automaticamente uma escala tonal a partir da cor escolhida e mostrar quais tons serão usados nos botões e nos modos claro/escuro.
- Manter nome, logo e ícone do navegador.
- Preservar a ideia das prévias atuais, mas redesenhá-las como demonstrações mais fiéis do login, menu e controles nos modos claro e escuro.
- Mostrar formatos, tamanho permitido e estado de arquivo selecionado/removido com clareza.

## 3. Atendimento e distribuição
- Manter **Atendimento** como tela separada para horários de funcionamento, mensagens de saudação/ausência, tempo de espera e encerramento automático.
- Criar **Distribuição de atendimento** como tela própria, equivalente à imagem 3.
- Incluir as duas decisões independentes:
  - Quem recebe o cliente novo: “Cada um pega o que quiser” ou “Rodízio automático entre os atendentes”.
  - O que cada atendente enxerga: “Todos veem tudo”, “Os seus e os que ainda não têm dono” ou “Só os seus”.
- Usar opções grandes, com título e explicação dentro da área selecionável, deixando o estado escolhido evidente.

## 4. Notificações
- Manter a matriz de eventos e canais criada no projeto.
- Manter horário de silêncio e resumo diário.
- Ajustar apenas a entrada e a coerência visual com a nova página de cards.

## 5. Marketing, integrações e recursos técnicos
- Criar uma área própria **Marketing** no menu principal para Conversões e Meta Ads, retirando ambos de Configurações.
- Usar Marketing como ponto de entrada para atribuição de vendas, eventos de conversão, campanhas e futuras ferramentas comerciais relacionadas.
- Retirar Conexões, WhatsApp, Webhooks e Chaves de API da navegação interna de Configurações.
- Criar uma área própria **Integrações** no menu principal para Conexões, WhatsApp, Webhooks e recursos técnicos relacionados.
- Manter **Chaves de API** também acessível pelo card “Dados e Acesso”, por ser uma permissão da empresa, sem voltar ao antigo menu lateral desconfortável.

## 6. Organização das telas existentes
- Reaproveitar as telas e recursos já criados, alterando principalmente a entrada, os nomes e a distribuição dos assuntos.
- Garantir retorno fácil à visão geral de Configurações em todas as páginas internas.
- Preservar as URLs úteis sempre que possível e atualizar todos os acessos afetados.

## Validação
- Conferir a visão geral e as páginas de Marca, Distribuição, Atendimento e Notificações em desktop e celular.
- Testar todos os cards, seletores, campos de cor, prévias e retornos para Configurações.
- Verificar que nenhuma opção ficou duplicada ou perdida após mover a área técnica.
- Fazer a varredura obrigatória de nomes e referências proibidas antes de concluir.

## Limite desta etapa
Esta revisão continua usando dados de exemplo. Persistência real, uploads definitivos e aplicação global da marca entram quando ligarmos estas telas ao banco de cada cliente.
