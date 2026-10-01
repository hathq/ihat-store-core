// Placement-independent catalog observation/query. No canonical writes.
import {createHash} from 'node:crypto'
export const limits=Object.freeze({candidates:128,categories:32,page:32,queryBytes:128,cursorBytes:256,documentBytes:524288})
const fail=code=>{throw Object.assign(Error(code),{code})}
const text=(v,n=512)=>{if(typeof v!=='string'||!v||Buffer.byteLength(v)>n||!v.isWellFormed())fail('InvalidStoreObservation');return v}
const digest=v=>{if(!/^[a-f0-9]{64}$/.test(v))fail('InvalidStoreObservation');return v}
const array=(v,n)=>{if(!Array.isArray(v)||v.length>n)fail('StoreLimitExceeded');return v}
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex')
const freeze=v=>{if(v&&typeof v==='object'){Object.freeze(v);for(const item of Object.values(v))freeze(item)}return v}
export function packageReference(candidate){return {repositoryId:candidate.repositoryId,packageId:candidate.packageId,version:candidate.version,packageSha256:candidate.packageSha256}}
export function createStore(observation){
 const c=observation?.catalog,s=observation?.source
 if(!c||!s||c.sourceId!==s.sourceId||!Number.isSafeInteger(s.revision)||s.revision<0)fail('InvalidStoreObservation')
 const source={sourceId:text(s.sourceId,128),revision:s.revision,logicalOrigin:text(s.logicalOrigin,2048),signingKeyId:text(s.signingKeyId,128),publicKeyHex:digest(s.publicKeyHex)}
 if(typeof c.artifactAcquisitionAvailable!=='boolean')fail('InvalidStoreObservation')
 const catalog={sourceId:source.sourceId,catalogDigestSha256:digest(c.catalogDigestSha256),artifactAcquisitionAvailable:c.artifactAcquisitionAvailable,
  candidates:array(c.candidates,limits.candidates).map(p=>{
   if(typeof p.installed!=='boolean')fail('InvalidStoreObservation')
   return {repositoryId:text(p.repositoryId,128),packageId:text(p.packageId,256),version:text(p.version,64),packageSha256:digest(p.packageSha256),name:text(p.name,256),summary:text(p.summary,4096),categoryId:text(p.categoryId,128),assurance:text(p.assurance,128),installed:p.installed,residenceScopes:array(p.residenceScopes,64).map(v=>text(v,32))}
  }),categories:array(c.categories,limits.categories).map(p=>({id:text(p.id,128),termId:text(p.termId,512),name:text(p.name,256),summary:text(p.summary,4096)}))}
 if(new Set(catalog.candidates.map(p=>p.repositoryId)).size!==catalog.candidates.length||new Set(catalog.categories.map(p=>p.id)).size!==catalog.categories.length||catalog.candidates.some(p=>!catalog.categories.some(g=>g.id===p.categoryId)))fail('InvalidStoreObservation')
 const retained={source,catalog};if(Buffer.byteLength(JSON.stringify(retained))>limits.documentBytes)fail('StoreLimitExceeded');freeze(retained)
 const revision=hash(retained)
 function detail(reference){
  const keys=['repositoryId','packageId','version','packageSha256']
  if(!reference||Object.keys(reference).length!==keys.length||!keys.every(k=>Object.hasOwn(reference,k)))fail('StorePackageUnavailable')
  const p=catalog.candidates.find(p=>keys.every(k=>p[k]===reference[k]));if(!p)fail('StorePackageUnavailable');return p
 }
 function query({text:query='',categoryId=null,order='name',cursor=null,limit=16}={}){
  if(typeof query!=='string'||Buffer.byteLength(query)>limits.queryBytes||!query.isWellFormed()||!['name','repositoryId'].includes(order)||!Number.isInteger(limit)||limit<1||limit>limits.page||categoryId!==null&&!catalog.categories.some(c=>c.id===categoryId))fail('InvalidStoreQuery')
  const selection=hash({query,categoryId,order}),items=catalog.candidates.filter(p=>(categoryId===null||p.categoryId===categoryId)&&[p.name,p.summary,p.repositoryId].some(v=>v.toLowerCase().includes(query.toLowerCase())))
   .sort((a,b)=>a[order]<b[order]?-1:a[order]>b[order]?1:a.repositoryId<b.repositoryId?-1:1)
  let offset=0
  if(cursor!==null){
   if(typeof cursor!=='string'||Buffer.byteLength(cursor)>limits.cursorBytes||!/^[A-Za-z0-9_-]+$/.test(cursor))fail('InvalidStoreCursor')
   let decoded;try{decoded=JSON.parse(Buffer.from(cursor,'base64url').toString('utf8'))}catch{fail('InvalidStoreCursor')}
   if(!decoded||Object.keys(decoded).sort().join(',')!=='offset,revision,selection'||decoded.revision!==revision||decoded.selection!==selection||!Number.isSafeInteger(decoded.offset)||decoded.offset<0||decoded.offset>=items.length)fail('StaleStoreCursor')
   offset=decoded.offset
  }
  const end=Math.min(offset+limit,items.length),next=end<items.length?Buffer.from(JSON.stringify({revision,selection,offset:end})).toString('base64url'):null
  return freeze({revision,queryRef:hash({query,categoryId,order,offset,limit}),items:items.slice(offset,end),nextCursor:next,total:items.length})
 }
 function installation(reference){const candidate=detail(reference);if(candidate.installed||!catalog.artifactAcquisitionAvailable)fail('StoreInstallUnavailable')
  return freeze({method:'hat/catalog/install',params:{repositoryId:candidate.repositoryId,expected:{sourceId:source.sourceId,sourceRevision:source.revision,catalogDigestSha256:catalog.catalogDigestSha256,packageSha256:candidate.packageSha256}}})}
 return Object.freeze({revision,source,catalog,detail,query,installation})
}
