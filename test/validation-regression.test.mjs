import test from 'node:test'
import assert from 'node:assert/strict'
import {createStore,packageReference} from '@hathq/ihat-store-core'
import {changedObservation,cloneObservation} from './fixtures/observation.mjs'

const invalid = [
 ['source mismatch',v=>v.catalog.sourceId='other','InvalidStoreObservation'],
 ['negative revision',v=>v.source.revision=-1,'InvalidStoreObservation'],
 ['noninteger revision',v=>v.source.revision=1.5,'InvalidStoreObservation'],
 ['invalid digest',v=>v.source.publicKeyHex='not-a-digest','InvalidStoreObservation'],
 ['nonboolean availability',v=>v.catalog.artifactAcquisitionAvailable=1,'InvalidStoreObservation'],
 ['nonboolean installed',v=>v.catalog.candidates[0].installed=0,'InvalidStoreObservation'],
 ['too many candidates',v=>v.catalog.candidates=Array(129).fill(v.catalog.candidates[0]),'StoreLimitExceeded'],
 ['too many categories',v=>v.catalog.categories=Array(33).fill(v.catalog.categories[0]),'StoreLimitExceeded'],
 ['too many residences',v=>v.catalog.candidates[0].residenceScopes=Array(65).fill('local'),'StoreLimitExceeded'],
 ['duplicate repository',v=>v.catalog.candidates[1].repositoryId=v.catalog.candidates[0].repositoryId,'InvalidStoreObservation'],
 ['duplicate category',v=>v.catalog.categories.push({...v.catalog.categories[0]}),'InvalidStoreObservation'],
 ['unknown category',v=>v.catalog.candidates[0].categoryId='absent','InvalidStoreObservation'],
 ['ill formed string',v=>v.catalog.candidates[0].name='\ud800','InvalidStoreObservation'],
 ['UTF-8 byte limit',v=>v.catalog.candidates[0].name='é'.repeat(129),'InvalidStoreObservation']
]
for(const [name,change,code] of invalid)test(name,()=>{
 assert.throws(()=>createStore(changedObservation(change)),{name:'Error',message:code,code})
})

test('missing observation',()=>{
 assert.throws(()=>createStore(null),{code:'InvalidStoreObservation'})
})

test('candidate error before category error',()=>{
 const input=cloneObservation()
 input.catalog.candidates[0].installed=0
 input.catalog.categories=null
 assert.throws(()=>createStore(input),{code:'InvalidStoreObservation'})
})

test('observation is copied and deeply frozen without freezing the caller input',()=>{
 const input=cloneObservation()
 const store=createStore(input)
 const result=store.query()
 input.catalog.candidates[0].name='changed'
 assert.equal(store.catalog.candidates[0].name,'Package 0')
 assert.equal(Object.isFrozen(input.catalog),false)
 for(const value of [store,store.catalog,store.catalog.candidates,store.catalog.candidates[0],store.source,result,result.items])assert.ok(Object.isFrozen(value))
})

test('exact reference shape, key ordering and unavailable installation errors remain stable',()=>{
 const store=createStore(cloneObservation())
 const reference=packageReference(store.catalog.candidates[1])
 assert.deepEqual(Object.keys(reference),['repositoryId','packageId','version','packageSha256'])
 assert.equal(store.detail({...reference}).repositoryId,'hat-1')
 const reversed=Object.fromEntries(Object.entries(reference).reverse())
 assert.deepEqual(store.detail(reversed),store.detail(reference))
 for(const value of [null,{...reference,extra:true},{...reference,version:'0.11.0'},{...reference,packageSha256:'9'.repeat(64)}])assert.throws(()=>store.detail(value),{code:'StorePackageUnavailable'})
 assert.throws(()=>store.installation(packageReference(store.catalog.candidates[0])),{code:'StoreInstallUnavailable'})
})
