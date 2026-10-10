import assert from 'node:assert/strict'
import test from 'node:test'
import {createStore} from '../src/index.mjs'
import {cloneObservation} from './fixtures/observation.mjs'

test('digest fields reject coercible arrays and objects instead of retaining invalid state',()=>{
 for(const target of ['source','catalog','candidate']) {
  for(const value of [['a'.repeat(64)], {toString:()=> 'a'.repeat(64)}]) {
   const observation=cloneObservation()
   if(target==='source')observation.source.publicKeyHex=value
   if(target==='catalog')observation.catalog.catalogDigestSha256=value
   if(target==='candidate')observation.catalog.candidates[0].packageSha256=value
   assert.throws(()=>createStore(observation),{code:'InvalidStoreObservation'})
  }
 }
})
