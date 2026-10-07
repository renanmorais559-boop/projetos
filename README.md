# Primeiro Império

Protótipo de jogo de gestão empresarial em português. Administre uma cafeteria durante uma campanha de 30 dias e continue em modo livre: compre estoque, ajuste preços, invista em publicidade e contrate um atendente. Eventos afetam a demanda; dicas explicam margem, lucro e capital de giro.

## Executar

Requisitos: Python 3 e Node.js 18 ou superior para os testes. Sem dependências externas.

```sh
npm start
```

O servidor usa a porta 3000. Para testar a simulação: `npm test`.

## Publicar no GitHub Pages

O jogo é estático e usa caminhos relativos, compatíveis com a hospedagem em uma subpasta. No repositório, configure **Settings → Pages → Deploy from a branch → main → / (root)**. O arquivo `.nojekyll` permite servir os arquivos diretamente. O progresso é local ao navegador; um endereço de publicação diferente começa com armazenamento próprio, mas pode importar um backup.

Este protótipo começa com uma cafeteria, salvamento automático no navegador e uma economia simplificada. O mapa permite escolher a segunda cafeteria: Vila Jardim (R$ 1.400, +16 clientes base, +R$ 60/dia), Centro (R$ 1.800, +24 clientes, +R$ 90/dia) ou Estação (R$ 2.300, +34 clientes, +R$ 140/dia). Todas adicionam 25 vagas de atendimento. O mapa 2D permite caminhar com setas ou W A S D, ou com controles na tela. Visite pontos comerciais e use Escolher este bairro para comparar o investimento; explorar não gasta dinheiro nem avança o dia. Os cartões continuam disponíveis como alternativa. A posição do personagem não é salva. As lojas compartilham estoque, preços, marketing e reputação. Não inclui mundo 3D. Padaria e minimercado têm gestão própria e são liberados durante a campanha. Salvamentos antigos são migrados automaticamente. A partida é retomada ao recarregar a página no mesmo navegador e endereço. Limpar os dados do navegador remove o progresso; não há sincronização entre dispositivos. Recomeçar substitui a partida salva após confirmação. Se o armazenamento estiver indisponível, o jogo avisa e continua em memória. Interface em HTML e CSS com ilustração original do Café Aurora, sem recursos de outros jogos.

## Crédito empresarial

Contrato fictício: R$ 2.000 recebidos, 10 parcelas diárias de R$ 220, total R$ 2.200. Primeira cobrança no dia da contratação; disponível até o dia 21, um empréstimo ativo por vez. Quitação antecipada não tem desconto. Parcelas são exibidas separadas do lucro operacional e descontadas do caixa. A meta usa caixa menos dívida restante.

## Equipamentos e ponto de equilíbrio

Máquina profissional: R$ 900, +15 atendimentos/dia na rede, economia de R$ 20/dia na operação. Equipamento não altera o custo do estoque. Uma compra por partida, sem revenda. A oficina exibe a margem por venda e o número de vendas necessário para cobrir custos operacionais, sem parcelas ou investimentos. A economia isolada recuperaria o investimento em 45 dias: avalie capacidade ociosa, demanda e prazo restante.

## Jornada e relatório

Oito conquistas acompanham vendas, dias lucrativos, atendimento completo, expansão e meta final. Não oferecem dinheiro. No término por dia 30 ou falta de caixa, o relatório mostra atendimento, vendas, lucro operacional e caixa líquido, com sugestões baseadas no resultado. Conquistas e relatório são recalculados da partida salva, inclusive saves anteriores.

## Planejamento diário

A previsão calcula movimento fraco (chuva), normal e forte (festival) com as decisões atuais. Mostra demanda, vendas possíveis, lucro operacional e caixa ao fechar, incluindo parcelas. Cenários usam as mesmas regras do dia real, sem sortear evento nem alterar o save. Alertas indicam estoque insuficiente, limite de capacidade e caixa negativo.

## Backup de partidas

Use **Baixar partida** para guardar um JSON, depois **Importar partida** para retomar no mesmo ou em outro navegador. Importar valida o arquivo (até 1 MB) e pede confirmação antes de substituir a partida atual. Backups de versões anteriores são migrados. O arquivo não é enviado a servidor; a importação ocorre no navegador. Limpar dados locais não apaga um backup já baixado.

## Navegação e análise

Cinco telas organizam operação, cidade, investimentos e resultados. O fim da partida abre Resultados automaticamente; recomeçar volta à Operação. O gráfico mostra lucro operacional diário, com prejuízos abaixo de zero e valores detalhados no diário.

## Cenários de partida

Em Resultados, escolha Início equilibrado (R$ 2.500 iniciais, meta R$ 5.000), Orçamento apertado (R$ 1.500, meta R$ 3.500) ou Expansão acelerada (R$ 4.000, meta R$ 9.000). Todos duram 30 dias e usam as mesmas regras econômicas. Selecionar não muda o jogo atual; iniciar pede confirmação e substitui o progresso. Recomeçar mantém o cenário. O cenário é preservado em saves e backups; versões anteriores são migradas para Início equilibrado.

## Fornecedores e estoque

Distribuidor local: R$ 8/unidade, mínimo 1. Atacado: R$ 6/unidade, mínimo 50. Limite de 1.000 unidades por compra, entrega imediata. O jogo usa FIFO: lotes antigos são vendidos primeiro e o lucro desconta seu custo real. Estoque não perece. O planejamento e o ponto de equilíbrio consideram os lotes disponíveis. Saves anteriores migram com custo de R$ 8 por unidade.

## Encomendas empresariais

Ofertas nos dias 5 (15 unidades a R$ 16), 12 (25 a R$ 16) e 20 (40 a R$ 17). Aceitar reserva uma entrega ao encerrar o mesmo dia, antes das vendas de balcão. Exige estoque e capacidade para o lote inteiro. Falha: sem receita da encomenda, multa de R$ 80 e perda de 8 pontos de reputação. Ignorar não tem penalidade; aceitar é definitivo. Previsões e diário incluem o pedido; save e backup preservam encomendas pendentes.

## Direção visual

Interface verde-escura e dourada, navegação lateral em telas grandes e controles compactos em celulares. A operação usa uma ilustração original gerada para o Café Aurora, em `assets/cafe-aurora.png`; é um cenário estático. A exploração continua disponível no mapa 2D da tela Cidade. Indicadores e decisões são HTML interativo, não textos embutidos na arte.

## Versão 0.2 — diversificação e campanha

- **Padaria Pão da Vila**, disponível no dia 8: abertura R$ 2.000, estoque R$ 5/unidade, operação R$ 110/dia, equipe opcional R$ 80/dia.
- **Mini Mercado Horizonte**, disponível no dia 15: abertura R$ 2.800, estoque R$ 12/unidade, operação R$ 140/dia, equipe opcional R$ 90/dia.
- Cada negócio tem preço, estoque, equipe e reputação próprios. O caixa é compartilhado; avançar o dia opera todas as lojas. Abrir sem repor estoque gera despesas sem receita.
- Treinamento da cafeteria: dois níveis (R$ 300 / R$ 500), cada um acrescenta 8 de capacidade e R$ 20/dia de salários. Também melhora a reputação quando a demanda é atendida integralmente.
- Situações opcionais nos dias 7, 14 e 23: atendimento, divulgação, reclamação e apoio à comunidade. Gastos são pagos na decisão e ficam separados do lucro operacional.
- Expediente animado com opção de pular, resumo consolidado e comparação por loja. Preferência por movimento reduzido é respeitada.
- Guia de início, mentor contextual, marcos de desbloqueio e novas conquistas.
- Saves e backups antigos são migrados para a versão 9 sem reiniciar o progresso. A ilustração principal continua estática; personagens da animação do expediente são uma representação visual das vendas calculadas.

## Versão 0.3 — uma empresa que continua

- **Modo livre:** ao encerrar o dia 30 com caixa não negativo, use Continuar empresa em modo livre no relatório. Não exige alcançar a meta; conserva lojas, estoques, decisões, empréstimo e o resultado da campanha. A conquista da campanha reflete seu resultado no dia 30, mesmo que o caixa mude depois. Caixa negativo continua encerrando a empresa.
- **Aurora Tecnologia:** disponível no dia 40 em modo livre. Abertura R$ 5.500, estoque R$ 40/unidade, operação R$ 220/dia, atendente opcional R$ 140/dia. Preço inicial R$ 75, capacidade 20 ou 35 com equipe. A oitava conquista reconhece os três negócios independentes abertos.
- **Suspensão temporária:** negócios independentes podem parar de vender. Mantêm estoque, equipe configurada e reputação, pagando metade da operação diária (R$ 55 / R$ 70), sem salários. Retomar restaura a operação normal; a cafeteria permanece ativa.
- **Central de abastecimento:** estima estoque para 1, 2, 3, 5 ou 7 dias de movimento normal, respeita a capacidade e desconta mercadorias disponíveis. Compra todas as lojas ativas em uma transação; caixa insuficiente não causa compras parciais. Usa atacado na cafeteria quando a reposição tem pelo menos 50 unidades. Não é reposição automática: a compra precisa ser confirmada.
- **Painel financeiro:** receita, lucro, margem e atendimento dos últimos sete dias, com comparação após duas semanas completas e custos por negócio. Permite exportar CSV com linhas consolidadas e detalhes por loja.
- **Partidas longas:** conserva os últimos 120 dias detalhados e todos os totais da empresa. O gráfico mostra até 30 dias recentes; o diário começa nos últimos 10, com opções de 30 ou todos os disponíveis. Backups de até 1 MB incluem os totais, o resultado da campanha e o diário recente; saves anteriores migram para versão 10.
- **Encomendas e crédito:** no modo livre, propostas retornam nos dias 5, 12 e 20 de cada ciclo de 30 dias. O crédito fica disponível em qualquer dia, mantendo um contrato ativo por vez e as mesmas parcelas.

A economia permanece simplificada: mercadorias não perecem e não há revenda de lojas. Pausar conserva reputação porque não há atendimento no período. As compras conjuntas usam uma estimativa; eventos e mudanças de preço podem alterar o consumo.

## Versão 0.4 — planeje o ritmo do comércio

- **Calendário semanal no modo livre:** cada ramo tem variação conhecida de movimento de segunda a domingo. Sexta beneficia tecnologia e café; sábado, padaria e varejo; domingo reduz café e tecnologia. Os efeitos se somam à influência de preço, reputação e eventos aleatórios. A campanha inicial mantém seu equilíbrio anterior. Previsões, laboratório e reposição consideram o calendário.
- **Melhorias das lojas independentes:** dois níveis, cada um com +5 de capacidade e −R$ 10/dia de operação. Primeiro investimento: padaria R$ 850, mercado R$ 1.100, tecnologia R$ 1.600; segundo nível custa R$ 400 a mais. A manutenção de uma loja suspensa usa metade do custo reduzido. O cartão explica o prazo de retorno com a economia isolada; clientes adicionais dependem de demanda e estoque.
- **Desafios de sete dias:** em Resultados, escolha lucro operacional de R$ 2.000, atendimento de pelo menos 90% com 150 vendas, ou sete dias positivos. Um ativo por vez, desbloqueados no modo livre. O resultado aparece no resumo do expediente; medalhas são únicas por tipo e não concedem dinheiro. Falência encerra o desafio sem medalha. Progresso acompanha todo o grupo, usando totais acumulados para não depender da janela do diário.
- **Decisões recorrentes:** a partir do dia 33, a cada sete dias surgem parceria local, divulgação da cafeteria ou ação de atendimento. São opcionais e cada escolha vale uma vez. Parcerias e atendimento afetam a reputação das lojas ativas; negócios suspensos ficam de fora. A divulgação da cafeteria dura três dias.
- **Capital de giro:** em Investimentos, veja uma estimativa para três dias de reposição, operação e parcelas, sem contar vendas futuras. É uma orientação; não bloqueia caixa nem compra automaticamente. O painel financeiro distingue caixa gerado pelos expedientes e lucro operacional, deixando explícito que reposição e investimentos ainda reduzem o caixa.
- **Laboratório de estratégia:** teste preço, equipe e publicidade antes de decidir. Mostra vendas e lucro atual/proposto em movimento fraco, normal e forte, além do caixa consolidado da empresa. Experimentar não altera o save nem avança dias. Aplicar pede confirmação e muda apenas as decisões do negócio escolhido. Estoque, calendário, encomendas e melhorias são considerados. Rascunhos do laboratório não fazem parte do backup.
- Saves publicados nas versões anteriores migram automaticamente para versão 11, preservando campanhas, lojas, estoques, dívidas, históricos e totais. O registro detalhado de escolhas recentes fica limitado a 120, como o diário; desafios conquistados e o resultado da campanha continuam preservados.

O calendário é uma regra fictícia para praticar planejamento, não uma previsão do comércio real. Desafios usam lucro operacional; empréstimos não contam como receita. No laboratório, um preço maior pode melhorar margem por unidade e piorar o resultado se reduzir demais a demanda.
