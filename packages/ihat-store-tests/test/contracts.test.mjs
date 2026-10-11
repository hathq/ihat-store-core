import test from 'node:test'
import assert from 'node:assert/strict'
import {createStore,packageReference} from '@hathq/ihat-store-core'
import {observeCatalog} from '@hathq/ihat-store-source'
import {storeScene} from '@hathq/ihat-store-scenes'
import {localStore} from '@hathq/ihat-store-local'
import {webStore} from '@hathq/ihat-store-web'
const observation={source:{sourceId:'local',revision:1,logicalOrigin:'https://fixture.invalid/',signingKeyId:'fixture',publicKeyHex:'a'.repeat(64)},
 catalog:{sourceId:'local',catalogDigestSha256:'c'.repeat(64),artifactAcquisitionAvailable:true,categories:[{id:'c',termId:'term:c',name:'Category',summary:'Owner category'}],
 candidates:Array.from({length:5},(_,i)=>({repositoryId:'hat-'+i,packageId:'hat/example'+i,version:'0.10.0',packageSha256:String(i).repeat(64),name:'Package '+i,summary:'Declarative source',categoryId:'c',assurance:'source-pinned',installed:i===0,residenceScopes:[]}))}}
const rpc=async(method)=>method==='hat/catalog/list'?{catalog:structuredClone(observation.catalog)}:{registry:{revision:1,selectedSourceId:'local',sources:[structuredClone(observation.source)]}}
test('local and web observations yield identical package refs, sources, Scenes and exact install requests; bounded search never becomes meaning',async()=>{
 const local=await localStore(rpc),web=await webStore(async({maximumBytes})=>{assert.equal(maximumBytes,524288);return Buffer.from(JSON.stringify(await observeCatalog(rpc)))})
 assert.equal(local.revision,web.revision);assert.deepEqual(storeScene(local),storeScene(web))
 const first=local.query({limit:2}),second=local.query({limit:2,cursor:first.nextCursor}),third=local.query({limit:2,cursor:second.nextCursor})
 assert.deepEqual([...first.items,...second.items,...third.items].map(p=>p.repositoryId),['hat-0','hat-1','hat-2','hat-3','hat-4']);assert.equal(third.nextCursor,null)
 assert.deepEqual(local.query({text:'Package 3',categoryId:'c'}).items.map(p=>p.repositoryId),['hat-3'])
 const ref=packageReference(first.items[1]),request=local.installation(ref)
 assert.deepEqual(request,{method:'hat/catalog/install',params:{repositoryId:'hat-1',expected:{sourceId:'local',sourceRevision:1,catalogDigestSha256:'c'.repeat(64),packageSha256:'1'.repeat(64)}}})
 assert.deepEqual(local.detail({version:ref.version,packageSha256:ref.packageSha256,packageId:ref.packageId,repositoryId:ref.repositoryId}),first.items[1])
 for(const invalid of [{...ref,packageSha256:'9'.repeat(64)},{...ref,latest:true}])assert.throws(()=>local.installation(invalid))
 assert.throws(()=>local.installation(packageReference(first.items[0])),{code:'StoreInstallUnavailable'})
 for(const q of [{limit:33},{text:'x'.repeat(129)},{categoryId:'missing'},{cursor:'x'.repeat(257)},{cursor:first.nextCursor,order:'repositoryId'}])assert.throws(()=>local.query(q))
 const changed=structuredClone(observation);changed.catalog.candidates[1].installed=true
 assert.throws(()=>createStore(changed).query({cursor:first.nextCursor}),{code:'StaleStoreCursor'})
 assert.throws(()=>createStore({...observation,catalog:{...observation.catalog,candidates:Array(129).fill(first.items[0])}}),{code:'StoreLimitExceeded'})
 await assert.rejects(webStore(async()=>new Uint8Array(524289)),{code:'StoreLimitExceeded'})
 let calls=0;await assert.rejects(observeCatalog(async method=>{const value=await rpc(method);if(++calls===3)value.registry.revision=2;return value}),{code:'StoreSourceChanged'})
 const unavailable=structuredClone(observation);unavailable.catalog.artifactAcquisitionAvailable=false
 assert.equal(storeScene(createStore(unavailable)).snapshot.data.actions.filter(a=>a.commandRef==='hat/catalog/install').length,0)
 assert.equal(storeScene(local).snapshot.data.actions.filter(a=>a.commandRef==='hat/catalog/install').length,4)
})
