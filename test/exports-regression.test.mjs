import test from 'node:test'
import assert from 'node:assert/strict'
import * as core from '@hathq/ihat-store-core'
import {cloneObservation} from './fixtures/observation.mjs'

test('public module exports, function arity and store property order remain unchanged', () => {
 assert.deepEqual(Object.keys(core), ['createStore', 'limits', 'packageReference'])
 for (const fn of [core.createStore, core.packageReference]) {
  assert.equal(fn.length, 1)
 }
 assert.deepEqual(Object.keys(core.createStore(cloneObservation())), [
  'revision', 'source', 'catalog', 'detail', 'query', 'installation'
 ])
})

test('bounded individual fields cannot bypass the aggregate document byte budget', () => {
 const input = cloneObservation()
 const candidate = input.catalog.candidates[0]
 input.catalog.candidates = Array.from({length: 128}, (_, index) => ({
  ...candidate,
  repositoryId: 'package-' + index,
  summary: 's'.repeat(4096),
  residenceScopes: Array(64).fill('scope'.padEnd(32, 'x'))
 }))
 assert.throws(() => core.createStore(input), {code: 'StoreLimitExceeded'})
})

test('valid residence scopes are retained and an unmatched literal query remains empty', () => {
 const input = cloneObservation()
 input.catalog.candidates[0].residenceScopes = ['local', 'web']
 const store = core.createStore(input)
 assert.deepEqual(store.catalog.candidates[0].residenceScopes, ['local', 'web'])
 const page = store.query({text: 'absent literal'})
 assert.deepEqual(page.items, [])
 assert.equal(page.total, 0)
 assert.equal(page.nextCursor, null)
})
