import test from 'node:test'
import assert from 'node:assert/strict'
import {createStore,packageReference} from '@hathq/ihat-store-core'
import {cloneObservation} from './fixtures/observation.mjs'

test('revision, query reference, cursor bytes and install serialization match the pre-refactor golden values',()=>{
 const store=createStore(cloneObservation())
 const page=store.query({limit:2})
 assert.equal(store.revision,'5915765a9f3503450887a24f50d9231dd911ac4c21a5e9f1e3f082a4101eaf87')
 assert.equal(page.queryRef,'e2e80e20ba8d744c170d3165b6710e459928b5104bf87e6f69d1130b5c967be9')
 assert.equal(page.nextCursor,'eyJyZXZpc2lvbiI6IjU5MTU3NjVhOWYzNTAzNDUwODg3YTI0ZjUwZDkyMzFkZDkxMWFjNGMyMWE1ZTlmMWUzZjA4MmE0MTAxZWFmODciLCJzZWxlY3Rpb24iOiIzN2M1ZGM4MTFjNDhiMTllZDhjMTU0YmM3M2RhMDkzMDA5MDE0YjNlYjQ0MDE5OTZkMWY5MmY5Mzk5YThhNDI1Iiwib2Zmc2V0IjoyfQ')
 assert.deepEqual(Object.keys(page),['revision','queryRef','items','nextCursor','total'])
 assert.equal(JSON.stringify(store.installation(packageReference(page.items[1]))),'{"method":"hat/catalog/install","params":{"repositoryId":"hat-1","expected":{"sourceId":"local","sourceRevision":1,"catalogDigestSha256":"cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc","packageSha256":"1111111111111111111111111111111111111111111111111111111111111111"}}}')
 const second=store.query({limit:2,cursor:page.nextCursor})
 assert.deepEqual(second.items.map(item=>item.repositoryId),['hat-2','hat-3'])
 assert.equal(second.revision,page.revision)
 assert.equal(second.total,5)
 const last=store.query({limit:2,cursor:second.nextCursor})
 assert.deepEqual(last.items.map(item=>item.repositoryId),['hat-4'])
 assert.equal(last.nextCursor,null)
})

test('cursor parsing preserves invalid syntax versus stale/incorrect shape errors',()=>{
 const store=createStore(cloneObservation())
 for(const cursor of ['',':',Buffer.from('{').toString('base64url'),'x'.repeat(257)])assert.throws(()=>store.query({cursor}),{code:'InvalidStoreCursor'})
 for(const data of [null,{},[],{revision:store.revision,selection:'wrong',offset:0},{revision:store.revision,selection:'wrong',offset:-1}])assert.throws(()=>store.query({cursor:Buffer.from(JSON.stringify(data)).toString('base64url')}),{code:'StaleStoreCursor'})
 const page=store.query({limit:2})
 const decoded=JSON.parse(Buffer.from(page.nextCursor,'base64url'))
 for(const offset of [-1,0.5,5,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>store.query({cursor:Buffer.from(JSON.stringify({...decoded,offset})).toString('base64url')}),{code:'StaleStoreCursor'})
 const changed=cloneObservation()
 changed.source.revision++
 assert.throws(()=>createStore(changed).query({cursor:page.nextCursor}),{code:'StaleStoreCursor'})
})

test('category membership, literal case folding and ordering remain unchanged',()=>{
 const store=createStore(cloneObservation())
 assert.equal(store.query({categoryId:'c'}).total,5)
 assert.equal(store.query({text:'pAcKaGe 2'}).items[0].repositoryId,'hat-2')
 assert.deepEqual(store.query({order:'repositoryId'}).items.map(x=>x.repositoryId),['hat-0','hat-1','hat-2','hat-3','hat-4'])
 assert.throws(()=>store.query({categoryId:'absent'}),{code:'InvalidStoreQuery'})
 const equalNames=cloneObservation()
 equalNames.catalog.candidates.forEach(p=>p.name='same')
 equalNames.catalog.candidates.reverse()
 assert.deepEqual(createStore(equalNames).query().items.map(x=>x.repositoryId),['hat-0','hat-1','hat-2','hat-3','hat-4'])
})
