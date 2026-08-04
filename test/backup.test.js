import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildBackup, parseBackup, isPayloadEmpty } from '../lib/backup.js'

const samplePayload = { portfolio: [{ ticker: 'PETR4' }], salesHistory: [], watchlist: [], alerts: [] }

test('buildBackup wraps payload in an envelope', () => {
  const b = buildBackup(samplePayload, '2026-08-04T10:00:00.000Z')
  assert.equal(b.app, 'invest-track')
  assert.equal(b.version, 1)
  assert.equal(b.exportedAt, '2026-08-04T10:00:00.000Z')
  assert.deepEqual(b.data, samplePayload)
})

test('parseBackup accepts a valid envelope', () => {
  const text = JSON.stringify(buildBackup(samplePayload, '2026-08-04T10:00:00.000Z'))
  const r = parseBackup(text)
  assert.equal(r.ok, true)
  assert.deepEqual(r.data.portfolio, samplePayload.portfolio)
})

test('parseBackup rejects invalid JSON', () => {
  const r = parseBackup('{not json')
  assert.equal(r.ok, false)
  assert.ok(r.error)
})

test('parseBackup rejects wrong app', () => {
  const r = parseBackup(JSON.stringify({ app: 'outra-coisa', version: 1, data: samplePayload }))
  assert.equal(r.ok, false)
})

test('parseBackup rejects unsupported version', () => {
  const r = parseBackup(JSON.stringify({ app: 'invest-track', version: 999, data: samplePayload }))
  assert.equal(r.ok, false)
})

test('parseBackup tolerates a raw payload with a portfolio array', () => {
  const r = parseBackup(JSON.stringify(samplePayload))
  assert.equal(r.ok, true)
  assert.equal(r.data.portfolio.length, 1)
})

test('parseBackup rejects empty text', () => {
  assert.equal(parseBackup('').ok, false)
})

test('isPayloadEmpty', () => {
  assert.equal(isPayloadEmpty({ portfolio: [], salesHistory: [], watchlist: [], alerts: [] }), true)
  assert.equal(isPayloadEmpty({}), true)
  assert.equal(isPayloadEmpty({ portfolio: [{ ticker: 'X' }] }), false)
  assert.equal(isPayloadEmpty({ portfolio: [], salesHistory: [{ id: 1 }] }), false)
})
