import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createAnalystSource } from '../server/analystSource.js'

function fakeYahoo(sequence) {
  let i = 0
  return {
    async quoteSummary() {
      const step = sequence[Math.min(i, sequence.length - 1)]
      i += 1
      if (step instanceof Error) throw step
      return step
    },
  }
}

const goodSummary = {
  financialData: {
    targetMeanPrice: 65, targetLowPrice: 60, targetHighPrice: 72,
    numberOfAnalystOpinions: 18, recommendationKey: 'strong_buy',
  },
  recommendationTrend: { trend: [{ strongBuy: 12, buy: 5, hold: 1, sell: 0, strongSell: 0 }] },
}

test('returns distribution and targets on success', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([goodSummary]), retries: 2, retryDelayMs: 0 })
  const r = await src.fetchAnalystConsensus('SUZB3')
  assert.equal(r.available, true)
  assert.equal(r.analystsCount, 18)
  assert.deepEqual(r.distribution, { strongBuy: 12, buy: 5, hold: 1, sell: 0, strongSell: 0 })
  assert.equal(r.targetMean, 65)
  assert.equal(r.stale, false)
})

test('retries transient failure then succeeds', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([new Error('504'), goodSummary]), retries: 2, retryDelayMs: 0 })
  const r = await src.fetchAnalystConsensus('SUZB3')
  assert.equal(r.available, true)
  assert.equal(r.stale, false)
})

test('serves last-good marked stale when all retries fail', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([goodSummary]), retries: 1, retryDelayMs: 0 })
  await src.fetchAnalystConsensus('SUZB3') // primes last-good
  // now make it always fail
  src._setYahoo(fakeYahoo([new Error('504')]))
  const r = await src.fetchAnalystConsensus('SUZB3')
  assert.equal(r.available, true)
  assert.equal(r.stale, true)
  assert.equal(r.analystsCount, 18)
})

test('unavailable when failing with no last-good', async () => {
  const src = createAnalystSource({ yahooFinance: fakeYahoo([new Error('504')]), retries: 1, retryDelayMs: 0 })
  const r = await src.fetchAnalystConsensus('XXXX3')
  assert.equal(r.available, false)
})
