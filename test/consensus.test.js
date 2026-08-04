import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeConsensus, consensusLabelFromScore } from '../lib/consensus.js'

test('label from score thresholds', () => {
  assert.equal(consensusLabelFromScore(2), 'COMPRA FORTE')
  assert.equal(consensusLabelFromScore(1.5), 'COMPRA FORTE')
  assert.equal(consensusLabelFromScore(1), 'COMPRA')
  assert.equal(consensusLabelFromScore(0), 'MANTER')
  assert.equal(consensusLabelFromScore(-1), 'VENDA')
  assert.equal(consensusLabelFromScore(-2), 'VENDA FORTE')
  assert.equal(consensusLabelFromScore(NaN), 'MANTER')
})

test('strong buy distribution with many analysts and tight targets = high conviction', () => {
  const r = computeConsensus({
    distribution: { strongBuy: 12, buy: 5, hold: 1, sell: 0, strongSell: 0 },
    analystsCount: 18,
    targetMin: 60, targetMean: 65, targetMax: 72,
  })
  assert.equal(r.label, 'COMPRA FORTE')
  assert.equal(r.score, 29 / 18)
  assert.equal(r.available, true)
  assert.ok(r.conviction >= 70, `conviction ${r.conviction} should be >= 70`)
  assert.equal(r.highConviction, true)
})

test('split distribution with few analysts = low conviction, MANTER', () => {
  const r = computeConsensus({
    distribution: { strongBuy: 1, buy: 1, hold: 2, sell: 1, strongSell: 1 },
    analystsCount: 6,
    targetMin: 10, targetMean: 20, targetMax: 40,
  })
  assert.equal(r.label, 'MANTER')
  assert.ok(r.conviction < 65, `conviction ${r.conviction} should be < 65`)
  assert.equal(r.highConviction, false)
})

test('no distribution falls back to raw recommendation with limited conviction', () => {
  const r = computeConsensus({
    recommendationRaw: 'buy',
    analystsCount: 10,
    targetMin: 12, targetMean: 15, targetMax: 18,
  })
  assert.equal(r.label, 'COMPRA')
  assert.equal(r.components.hasDistribution, false)
  // agreement is neutral (0.5) without a distribution
  assert.equal(r.components.agreement, 0.5)
})

test('missing targets: tightness weight is redistributed, still computes', () => {
  const r = computeConsensus({
    distribution: { strongBuy: 10, buy: 4, hold: 1, sell: 0, strongSell: 0 },
    analystsCount: 15,
  })
  assert.equal(r.components.hasTargets, false)
  assert.equal(r.components.tightness, 0)
  assert.ok(r.conviction >= 80, `conviction ${r.conviction} should be high without targets`)
})

test('unavailable when no data at all', () => {
  const r = computeConsensus({})
  assert.equal(r.available, false)
  assert.equal(r.conviction, 0)
})
