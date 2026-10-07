# Primeiro Império

Protótipo de jogo de gestão empresarial em português. Administre uma cafeteria durante 30 dias: compre estoque, ajuste preços, invista em publicidade e contrate um atendente. Eventos afetam a demanda; dicas explicam margem, lucro e capital de giro.

## Executar

Requisitos: Python 3 e Node.js 18 ou superior para os testes. Sem dependências externas.

```sh
npm start
```

O servidor usa a porta 3000. Para testar a simulação: `npm test`.

## Publicar no GitHub Pages

O jogo é estático e usa caminhos relativos, compatíveis com a hospedagem em uma subpasta. No repositório, configure **Settings → Pages → Deploy from a branch → main → / (root)**. O arquivo `.nojekyll` permite servir os arquivos diretamente. O progresso é local ao navegador; um endereço de publicação diferente começa com armazenamento próprio, mas pode importar um backup.

Este primeiro protótipo tem uma loja, salvamento automático no navegador e uma economia simplificada. O mapa permite escolher a segunda cafeteria: Vila Jardim (R$ 1.400, +16 clientes base, +R$ 60/dia), Centro (R$ 1.800, +24 clientes, +R$ 90/dia) ou Estação (R$ 2.300, +34 clientes, +R$ 140/dia). Todas adicionam 25 vagas de atendimento. O mapa 2D permite caminhar com setas ou W A S D, ou com controles na tela. Visite pontos comerciais e use Escolher este bairro para comparar o investimento; explorar não gasta dinheiro nem avança o dia. Os cartões continuam disponíveis como alternativa. A posição do personagem não é salva. As lojas compartilham estoque, preços, marketing e reputação. Não inclui mundo 3D ou outros tipos de negócio. Salvamentos antigos são migrados automaticamente. A partida é retomada ao recarregar a página no mesmo navegador e endereço. Limpar os dados do navegador remove o progresso; não há sincronização entre dispositivos. Recomeçar substitui a partida salva após confirmação. Se o armazenamento estiver indisponível, o jogo avisa e continua em memória. Arte criada com HTML e CSS, sem recursos de outros jogos.

## Crédito empresarial

Contrato fictício: R$ 2.000 recebidos, 10 parcelas diárias de R$ 220, total R$ 2.200. Primeira cobrança no dia da contratação; disponível até o dia 21, um empréstimo ativo por vez. Quitação antecipada não tem desconto. Parcelas são exibidas separadas do lucro operacional e descontadas do caixa. A meta usa caixa menos dívida restante.

## Equipamentos e ponto de equilíbrio

Máquina profissional: R$ 900, +15 atendimentos/dia na rede, economia de R$ 20/dia na operação. Equipamento não altera o custo do estoque. Uma compra por partida, sem revenda. A oficina exibe a margem por venda e o número de vendas necessário para cobrir custos operacionais, sem parcelas ou investimentos. A economia isolada recuperaria o investimento em 45 dias: avalie capacidade ociosa, demanda e prazo restante.

## Jornada e relatório

Cinco conquistas acompanham vendas, dias lucrativos, atendimento completo, expansão e meta final. Não oferecem dinheiro. No término por dia 30 ou falta de caixa, o relatório mostra atendimento, vendas, lucro operacional e caixa líquido, com sugestões baseadas no resultado. Conquistas e relatório são recalculados da partida salva, inclusive saves anteriores.

## Planejamento diário

A previsão calcula movimento fraco (chuva), normal e forte (festival) com as decisões atuais. Mostra demanda, vendas possíveis, lucro operacional e caixa ao fechar, incluindo parcelas. Cenários usam as mesmas regras do dia real, sem sortear evento nem alterar o save. Alertas indicam estoque insuficiente, limite de capacidade e caixa negativo.

## Backup de partidas

Use **Baixar partida** para guardar um JSON, depois **Importar partida** para retomar no mesmo ou em outro navegador. Importar valida o arquivo (até 100 KB) e pede confirmação antes de substituir a partida atual. Backups de versões anteriores são migrados. O arquivo não é enviado a servidor; a importação ocorre no navegador. Limpar dados locais não apaga um backup já baixado.

## Navegação e análise

Quatro telas organizam operação, cidade, investimentos e resultados. O fim da partida abre Resultados automaticamente; recomeçar volta à Operação. O gráfico mostra lucro operacional diário, com prejuízos abaixo de zero e valores detalhados no diário.

## Cenários de partida

Em Resultados, escolha Início equilibrado (R$ 2.500 iniciais, meta R$ 5.000), Orçamento apertado (R$ 1.500, meta R$ 3.500) ou Expansão acelerada (R$ 4.000, meta R$ 9.000). Todos duram 30 dias e usam as mesmas regras econômicas. Selecionar não muda o jogo atual; iniciar pede confirmação e substitui o progresso. Recomeçar mantém o cenário. O cenário é preservado em saves e backups; versões anteriores são migradas para Início equilibrado.

## Fornecedores e estoque

Distribuidor local: R$ 8/unidade, mínimo 1. Atacado: R$ 6/unidade, mínimo 50. Limite de 1.000 unidades por compra, entrega imediata. O jogo usa FIFO: lotes antigos são vendidos primeiro e o lucro desconta seu custo real. Estoque não perece. O planejamento e o ponto de equilíbrio consideram os lotes disponíveis. Saves anteriores migram com custo de R$ 8 por unidade.

## Encomendas empresariais

Ofertas nos dias 5 (15 unidades a R$ 16), 12 (25 a R$ 16) e 20 (40 a R$ 17). Aceitar reserva uma entrega ao encerrar o mesmo dia, antes das vendas de balcão. Exige estoque e capacidade para o lote inteiro. Falha: sem receita da encomenda, multa de R$ 80 e perda de 8 pontos de reputação. Ignorar não tem penalidade; aceitar é definitivo. Previsões e diário incluem o pedido; save e backup preservam encomendas pendentes.

## Direção visual

Interface verde-escura e dourada, navegação lateral em telas grandes e controles compactos em celulares. A operação usa uma ilustração original gerada para o Café Aurora, em `assets/cafe-aurora.png`; é um cenário estático. A exploração continua disponível no mapa 2D da tela Cidade. Indicadores e decisões são HTML interativo, não textos embutidos na arte.
