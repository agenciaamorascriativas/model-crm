# Completar telas: marca, perfil, contatos, funis, etapas, agenda e produtos

## 1. Marca — aplicar de verdade
O que você salvou está gravado (nome, cor #D03E80, logo e ícone). O que falha é a aplicação: hoje só 7 variáveis de cor são trocadas, e só depois que a tela de Marca ou o menu carrega.

- Aplicar a marca no carregamento do sistema, antes das telas aparecerem (menu, tela de acesso, botões, links, gráficos, modo escuro e ícone do navegador).
- Gerar a escala tonal completa a partir da cor escolhida, incluindo o tom do menu escuro e a cor do texto sobre a cor principal (contraste automático).
- Confirmar recarregando a página: cor, logo, ícone e nome permanecem.

## 2. Meu perfil — foto e dados reais
- "Trocar foto" passa a abrir o seletor de arquivo, validar tamanho/formato, mostrar prévia e salvar de verdade (espaço de arquivos próprio para avatares).
- Nome, cargo, telefone, idioma, fuso e assinatura passam a salvar no seu perfil e a aparecer no menu e na equipe.
- Remover a etiqueta "dados de exemplo" desta tela.

## 3. Formulário de contato completo
Campos conforme a referência: nome da pessoa, empresa, cargo, categoria, origem, e-mail, WhatsApp/telefone, CPF (opcional), tags, cidade, estado, endereço, LinkedIn, Instagram e observações — usados também na lista, na busca e na ficha do contato.

## 4. Funis — visão de vários funis
Tela "Funis" em cartões, como o original:
- Por funil: nome, etiqueta "Padrão", endereço do funil, descrição, contadores (abertos, atrasados, valor em aberto) e ações: Abrir funil, Renomear, Definir padrão, Arquivar, mover ordem.
- Botão "Novo funil" com nome, descrição e endereço.

## 5. Dentro do funil — recursos da origem
- Busca por título, filtros de responsável, status e tag, e marcação "apenas atrasados".
- Colunas com contador por coluna e "vazio" quando não há nada.
- Cartão do negócio: título, valor, dias sem resposta (destacado quando atrasado), responsável com iniciais (ou "sem responsável") e a coluna atual.
- Arrastar entre colunas e "Novo Lead" continuam funcionando.

## 6. Etapas do funil — papéis e uso pela IA
- Lista numerada com nome editável direto na linha, mover para cima/baixo e arquivar.
- Coluna "O que acontece nesta coluna": nada especial, aqui o cliente fecha, aqui o cliente desiste — com a regra de que cada funil tem só uma de fechamento e uma de perda (a marcação muda de lugar, não desaparece).
- Linha de apoio "O assistente usa esta etapa para «…»" com opção de mudar, para a IA e as pessoas trabalharem na mesma etapa.
- Textos explicativos iguais aos da referência.

## 7. Agenda — conexões e avisos (visual nesta fase)
- Aviso no topo sobre sincronização, com passos e endereço de retorno a cadastrar, para Google **e** Outlook, cada um com seu estado (não configurado / aguardando / conectado).
- Visões Dia, Semana e Mês, botão Hoje, navegação de período e abas Próximos, Aguardando confirmação, Passados, Cancelados.
- Lembretes e avisos: escolher quando avisar (ex.: 1 dia e 1 hora antes), por e-mail ou aviso interno, para quem (responsável, cliente, equipe) e modelo de mensagem. Configuração salva; o envio real fica para quando você ligar o domínio de e-mail.

## 8. Produtos e serviços
Uma única tela "Produtos e serviços" com campo de tipo (produto ou serviço), filtro por tipo e indicação visual do tipo na lista.

## Observações técnicas
- Marca: aplicar tokens de tema no carregamento do documento (claro e escuro) derivando a escala da cor salva; contraste calculado.
- Perfil e avatares: novo espaço de arquivos com acesso restrito ao próprio usuário; gravação em `profiles`.
- Contatos, funis, etapas: ampliar as tabelas (campos novos de contato; descrição/apelido/arquivado/ordem em funis; papel de fechamento/perda, mapeamento do assistente e arquivado em etapas), preservando o que já existe.
- Agenda: guardar preferências de lembretes e o estado das conexões; nenhuma credencial é pedida agora.
- Nenhuma referência proibida em código, textos ou metadados; varredura no fim.
