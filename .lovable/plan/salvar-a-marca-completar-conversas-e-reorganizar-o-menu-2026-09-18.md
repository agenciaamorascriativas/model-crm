# Salvar a marca, completar Conversas e reorganizar o menu

## Objetivo
Transformar a configuração de Marca em um recurso realmente testável, aplicar a identidade visual salva em todo o CRM, incluir uma tela completa de ChatBot para futura conexão com o site e ajustar a navegação conforme o novo agrupamento.

## Alterações planejadas

### 1. Marca com salvamento real
- Substituir a mensagem de exemplo do botão **Salvar alterações** por gravação real.
- Persistir nome da empresa, cor principal, logo e ícone do navegador.
- Usar armazenamento de arquivos para logo e ícone, com validação de formato e limite de tamanho.
- Carregar os valores já salvos ao abrir a tela, mantendo as prévias atualizadas.
- Exibir estados claros de salvamento, sucesso e erro; permitir remover/substituir imagens.
- Aplicar a marca salva no CRM inteiro: nome e logo no menu, tela de acesso, cores dos controles e ícone do navegador.
- Atualizar a aparência imediatamente após salvar, sem exigir novo acesso.
- Restringir a edição da marca a administradores, mantendo a leitura necessária para exibi-la.

### 2. Retorno em Equipe e LGPD
- Adicionar **Voltar para Configurações** em Equipe e Privacidade (LGPD), seguindo o mesmo padrão já aprovado nas demais páginas.
- Preservar o acesso direto dessas páginas pelo menu principal.

### 3. Nova organização do menu
- Criar a seção **Conversas** com:
  - WhatsApp
  - ChatBot
- Manter a seção **Atendimento** e mover **Radar** para ela.
- Renomear **Vendas** para **CRM** e organizar nela:
  - Contatos
  - Funil de Vendas
  - Etapas do Funil (nome mais direto para a tela atual de funis e estágios)
  - Produtos
  - Atividades
- Retirar Radar de Relatórios; os demais relatórios permanecem no grupo atual.
- Manter Painel em Início, conforme aprovado.

### 4. Tela visual completa de ChatBot
- Criar uma página própria de ChatBot inspirada na referência, sem copiar a imagem.
- Incluir busca, lista de conversas de exemplo, contadores de mensagens e área de conversa selecionável.
- Mostrar dados básicos do visitante e histórico da conversa ao selecionar um item.
- Incluir as ações visuais esperadas: assumir atendimento humano, transformar em oportunidade e acessar a configuração do canal.
- Manter as conversas do ChatBot separadas das conversas do WhatsApp.
- Identificar claramente que a conexão real com o widget do site será feita em etapa futura.
- Garantir uso confortável em computador e celular.

## Dados e segurança
- Ampliar as configurações existentes da empresa para guardar a cor e o ícone, preservando os dados já cadastrados.
- Criar o espaço de armazenamento de identidade visual com regras de leitura e edição adequadas.
- Não ligar ainda o widget do site nem receber mensagens externas; a tela do ChatBot continuará usando dados de demonstração nesta fase.

## Validação
- Salvar uma identidade, recarregar a página e confirmar que nome, cor, logo e ícone permanecem.
- Confirmar a aplicação da marca no menu, acesso e controles principais.
- Testar remoção e troca de logo/ícone e mensagens de erro.
- Verificar os botões de retorno em Equipe e LGPD.
- Percorrer todos os itens dos novos grupos Conversas, Atendimento, CRM e Relatórios.
- Testar a seleção e as ações visuais da tela ChatBot em computador e celular.
- Fazer a varredura final das referências permanentemente proibidas.
