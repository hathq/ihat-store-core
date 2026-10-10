import test from 'node:test'
import assert from 'node:assert/strict'
import * as source from '@hathq/ihat-store-source'
import {cloneObservation, rpc} from './fixtures/observation.mjs'

test('RPC order, locale and owner error identity are retained', async () => {
 const calls = []
 const result = await source.observeCatalog(async (method, params) => {
  calls.push([method, params])
  return rpc(method)
 }, {locale: 'ja'})
 assert.equal(result.source.sourceId, 'local')
 assert.deepEqual(calls, [['hat/catalog-source/list', {}], ['hat/catalog/list', {locale: 'ja'}],
  ['hat/catalog-source/list', {}]])
 const failure = Error('owner failure')
 await assert.rejects(source.observeCatalog(async () => {throw failure}), error => error === failure)
})
for (const mode of ['selection', 'catalog', 'missing']) {
 test(mode + ' retains its source error', async () => {
  let call = 0
  await assert.rejects(source.observeCatalog(async method => {
   const result = await rpc(method)
   call++
   if (mode === 'selection' && call === 3) result.registry.selectedSourceId = 'other'
   if (mode === 'catalog' && method === 'hat/catalog/list') result.catalog.sourceId = 'other'
   if (mode === 'missing' && call === 3) result.registry.sources = []
   return result
  }), {code: mode === 'missing' ? 'StoreSourceUnavailable' : 'StoreSourceChanged'})
 })
}
test('extra catalog fields pass through without transferring ownership', async () => {
 const observation = cloneObservation()
 observation.catalog.extension = {kind: 'retained'}
 const registry = {revision: 1, selectedSourceId: 'local', sources: [observation.source]}
 const result = await source.observeCatalog(async method => method === 'hat/catalog/list' ?
  {catalog: observation.catalog} : {registry})
 assert.equal(result.catalog.extension.kind, 'retained')
 assert.equal(result.catalog, observation.catalog)
})
test('source exports and public function arity are unchanged', () => {
 assert.deepEqual(Object.keys(source), ['observeCatalog'])
 assert.equal(source.observeCatalog.length, 1)
})
