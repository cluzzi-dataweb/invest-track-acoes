# Design — Consenso de analistas com convicção (Fase 1)

**Data:** 2026-08-04
**Status:** Aprovado (design), pendente implementação
**Escopo:** Fase 1 de 3 de "tornar o agente muito poderoso no consenso de analistas".

## Contexto

Hoje o consenso de analistas do app vem de **uma única fonte** (Yahoo Finance,
via `api/index.js` → `getAnalystConsensusByTicker`). Ela retorna preço-alvo
(médio/mín/máx), uma recomendação categórica (buy/hold/sell) e o número de
analistas. A decisão de compra/manter/venda usa quase só o `recommendationKey`,
ignorando a **distribuição completa** de opiniões que o Yahoo já fornece
(`recommendationTrend`: strongBuy/buy/hold/sell/strongSell). Além disso, a fonte
é instável (retorna 504 intermitentes) e a cobertura para a B3 é irregular.

Esta fase melhora a **qualidade e a robustez** do consenso usando apenas os
dados que já temos, e prepara a arquitetura para fontes adicionais (Fase 2).

### Decisões do brainstorm
- Escopo total desejado (3 fases): modelo inteligente + mais fontes + robustez.
- **Começar pela Fase 1** (modelo inteligente + robustez), com interface pronta
  para novas fontes.
- Saída do consenso: **rótulo graduado + score de convicção (0–100)**.
  Tendência/momento do humor dos analistas fica **fora** desta fase (YAGNI).
- **Consenso de alta convicção manda mais** na decisão final; a camada de risco
  (stop/alvo/trailing/técnico forte) só sobrepõe em risco real.
- UI: **badge enriquecido + coluna "Convicção"** em Minha Carteira e no Radar.

## Fora de escopo (Fase 1)
- Novas fontes de dados (Fase 2).
- Tendência/momento da distribuição ao longo do tempo.
- Persistir o consenso em localStorage/nuvem (o cache atual é suficiente).

## Seção 1 — Dados & interface de fonte

O backend passa a expor, além do que já retorna, a distribuição completa e os
alvos, num formato padronizado devolvido por uma função de fonte única:

```
fetchAnalystConsensus(ticker) -> {
  ticker,
  distribution: { strongBuy, buy, hold, sell, strongSell }, // contagens
  targetLow, targetMean, targetHigh,   // preços-alvo
  analystsCount,                        // nº de opiniões
  recommendationRaw,                    // string original da fonte (auditoria)
  available,                            // bool
  fetchedAt,                            // ISO timestamp
  stale                                 // bool (ver Seção 5)
}
```

- `fetchAnalystConsensus` é a **interface de fonte**. Hoje há uma única
  implementação (Yahoo). Na Fase 2, novas fontes implementam o mesmo contrato e
  um merge combina os resultados. Nenhum consumidor conhece "Yahoo" diretamente.
- O endpoint `/api/market/analyst/:ticker` passa a devolver esse objeto
  (mantendo o campo `recommendation` derivado por compatibilidade, ver Seção 2).

## Seção 2 — Cálculo do consenso + convicção

Função pura no frontend: `computeConsensus(analyst) -> { label, score, conviction, components }`.
Fica junto de `getFinalSignal` (mesma camada de decisão) e é a fonte de verdade
para UI e sinal.

### a) Rótulo graduado
Nota ponderada da distribuição (N = soma das contagens):

```
nota = (2*strongBuy + 1*buy + 0*hold - 1*sell - 2*strongSell) / N   // [-2, +2]
```

| nota           | rótulo        |
|----------------|---------------|
| ≥ 1.5          | COMPRA FORTE  |
| ≥ 0.5          | COMPRA        |
| > -0.5         | MANTER        |
| > -1.5         | VENDA         |
| ≤ -1.5         | VENDA FORTE   |

Se a distribuição não estiver disponível mas houver `recommendationRaw`, cai
num mapeamento categórico (equivalente ao `mapRecommendation` atual) e a
convicção fica limitada (ver componentes).

### b) Convicção (0–100)
Média ponderada de 3 componentes, cada um normalizado em [0, 1]:

1. **Cobertura** (`coverage`): `clamp(analystsCount / 15, 0, 1)` — 15+ = máximo.
2. **Concordância** (`agreement`): fração de analistas do lado do rótulo.
   - lado compra = `(strongBuy + buy) / N` se rótulo é COMPRA/COMPRA FORTE
   - lado manter = `hold / N` se rótulo é MANTER
   - lado venda = `(sell + strongSell) / N` se rótulo é VENDA/VENDA FORTE
3. **Aperto do alvo** (`tightness`): `clamp(1 - dispersion, 0, 1)`, onde
   `dispersion = (targetHigh - targetLow) / targetMean`. Alvos apertados = alto.
   Se faltarem `targetLow`/`targetHigh`/`targetMean`, o componente de aperto é
   **descartado** e seus 0.25 de peso são **redistribuídos proporcionalmente**
   entre cobertura e concordância (0.40/0.35 → ~0.533/0.467), de modo que a soma
   dos pesos continue 1.

```
conviction = round(100 * (0.40*coverage + 0.35*agreement + 0.25*tightness))
```

- **Constantes ajustáveis** (num objeto de config no topo do módulo):
  pesos `{coverage:0.40, agreement:0.35, tightness:0.25}`, limiar de cobertura
  máxima `15`, limiar de **alta convicção** `65`, limiares de rótulo acima.
- `components` retorna os três valores normalizados + os números crus, para o
  tooltip explicar ("17 analistas · 88% concordam · alvo apertado").

### Exemplo (SUZB3)
17 analistas, consenso forte de compra, alvo médio bem acima do preço →
rótulo **COMPRA FORTE**, convicção ~78 (cobertura alta, concordância alta,
dispersão moderada).

## Seção 3 — Influência na decisão final

`getFinalSignal` passa a considerar `computeConsensus` e o limiar de alta
convicção (`conviction >= 65`). Hierarquia:

1. **Risco forte real vence sempre** (inalterado): status VENDER (alvo/stop/
   trailing atingido), assimetria claramente negativa, venda técnica iminente
   com lucro → **VENDER**.
2. **Consenso de alta convicção** (novo, quando não há risco forte):
   - rótulo COMPRA/COMPRA FORTE + convicção ≥ 65 → **COMPRAR** (alertas técnicos
     leves — RSI, tendência — não seguram mais).
   - rótulo VENDA/VENDA FORTE + convicção ≥ 65 → **VENDER** se houver lucro/risco,
     senão **REDUZIR**.
3. **Melhorar preço médio** (mantido): faixa de recompra ou preço abaixo do médio
   com upside → **COMPRAR** (motivo "preco-medio"). Mantém a separação
   analistas × preço médio já implementada (`getBuyReason`).
4. **Convicção baixa (< 65)**: usa a lógica atual, mais equilibrada, sem forçar
   o consenso.

`getBuyReason` continua distinguindo "analistas" × "preco-medio"; um COMPRAR
vindo de alta convicção é "analistas".

## Seção 4 — UI

- **Badge de consenso** mostra o rótulo graduado (ex.: `▲ COMPRA FORTE`,
  `COMPRA`, `MANTER`, `VENDA`, `▼ VENDA FORTE`) com classes de cor existentes.
- Nova coluna **"Convicção"** (0–100) em **Minha Carteira** e no **Radar**,
  com **tooltip** detalhando os 3 componentes (nº analistas / % concordância /
  dispersão do alvo). Cor da convicção: alta (≥65) destaque positivo, média
  neutro, baixa apagada.
- Sem mudança de layout responsivo além da nova coluna (tabelas já rolam em
  telas estreitas).

## Seção 5 — Robustez

- **Retry automático** no backend em `fetchAnalystConsensus`: 2–3 tentativas com
  backoff curto quando o Yahoo devolve erro/504 (transitório, como observado).
- **Último-bom-valor**: o backend mantém o último resultado bom por ticker; se
  todas as tentativas falharem, devolve esse valor com `stale: true` e
  `fetchedAt` da última coleta boa, em vez de erro. A UI marca como
  "desatualizado". (Cache em memória da função serverless; aceitável nesta fase.)

## Seção 6 — Testes

- Unitários de `computeConsensus`:
  - distribuição fortemente compradora / vendedora / dividida;
  - poucos (2) vs muitos (20) analistas → efeito na cobertura;
  - alvos apertados vs dispersos → efeito no aperto;
  - sem distribuição (só `recommendationRaw`) → fallback e convicção limitada;
  - sem alvos → componente de aperto neutro e pesos redistribuídos.
- Unitários de `getFinalSignal`:
  - alta convicção compra sem risco → COMPRAR (mesmo com alerta técnico leve);
  - alta convicção venda → VENDER/REDUZIR;
  - risco forte (stop/alvo) sobrepõe alta convicção compra → VENDER;
  - convicção baixa → comportamento atual;
  - "melhorar preço médio" preservado e rotulado como "preco-medio".

## Arquitetura / arquivos afetados

- `api/index.js` (e/ou `server/` correspondente): `fetchAnalystConsensus`
  (interface + retry + último-bom-valor); endpoint devolve distribuição+alvos.
- `app.js`: `computeConsensus` (novo), ajuste de `getFinalSignal`,
  `getBuyReason` (compat), badge de consenso, coluna "Convicção" nas tabelas.
- CSS: estilo da coluna/indicador de convicção e do badge graduado.
- Testes: arquivo(s) de teste para `computeConsensus` e `getFinalSignal`.

## Riscos & mitigações
- **Cobertura B3 fraca** (distribuição vazia para algumas ações): fallback
  categórico + convicção limitada; não quebra o sinal.
- **Rebalanceamento do sinal** pode surpreender: limiares/pesos ficam em config
  ajustável e há testes cobrindo os casos-chave.
- **Cache efêmero na Vercel** limita o "último-bom-valor" entre cold starts;
  aceitável na Fase 1 (o retry resolve a maioria dos casos).
