// Declarative iHat site projection. No HTML/components, installation or transport.
import {produce,scene,canonical} from '@hathq/projection-contracts'
import {packageReference} from '@hathq/ihat-store-core'
export function storeScene(store,query={}){
 const page=store.query(query),source={owner:'hatter/catalog',ref:store.source.sourceId,revision:store.revision,kind:'catalog'},key='ihat:store:'+page.queryRef
 const items=page.items.map(p=>({id:p.packageSha256,semanticRef:null,group:{kind:'structural',ref:p.categoryId},value:{...packageReference(p),name:p.name,summary:p.summary,categoryId:p.categoryId,assurance:p.assurance,installed:p.installed,source:store.source,publisher:null},evidence:[store.catalog.catalogDigestSha256],provenance:[store.source.logicalOrigin],resolutionRefs:[],visibility:'visible'}))
 const data=produce({key:'data:'+key,producer:{id:'ihat-store-scenes',version:'0.10.0',contract:'ihat/store/scenes',configuration:'catalog'},sources:[source],focus:source.ref,purpose:'HAT store',visibilityRef:'local-owner',limits:{}},[{source,items,relations:[],unresolved:[],truncated:page.nextCursor!==null}])
 const actions=page.items.filter(p=>!p.installed&&store.catalog.artifactAcquisitionAvailable).map(p=>{
  const request=store.installation(packageReference(p)),ref=canonical(request)
  return {id:'install:'+p.packageSha256,targetOwner:'hatter',commandRef:request.method,contextRefs:[p.repositoryId],sourceRefs:[source],label:'Install '+p.name,
   interaction:{ref,generation:store.revision,inputContractRef:'ihat:install:exact:0.10.0',input:{action:{operation_id:request.method,target:p.repositoryId,contract_revision:'ihat:install:exact:0.10.0',availability:{state:'available'},expected_revision_required:true,input_schema:{type:'object',fields:{},required:[]}},fields:{}}}}
 })
 actions.unshift({id:'query',targetOwner:'ihat',commandRef:'ihat/store/query',contextRefs:[],sourceRefs:[source],label:'Search store',interaction:{ref:'ihat:query',generation:store.revision,inputContractRef:'ihat:query:0.10.0',input:{action:{operation_id:'ihat/store/query',target:source.ref,contract_revision:'ihat:query:0.10.0',availability:{state:'available'},expected_revision_required:true,input_schema:{type:'object',fields:{query:{type:'string',max_length:128}},required:['query']}},fields:{query:{label:'Search packages',sensitive:false}}}}})
 return {snapshot:scene(data,{key,focus:source.ref,purpose:'HAT store',regions:[{id:'catalog',role:'Primary',itemIds:items.map(p=>p.id)}],
  presentation:items.map(p=>({itemId:p.id,titlePath:['name'],summaryPath:['summary'],fields:[
   {label:'Repository',valuePath:['repositoryId']},{label:'Package',valuePath:['packageId']},
   {label:'Version',valuePath:['version']},{label:'SHA-256',valuePath:['packageSha256']},
   {label:'Assurance',valuePath:['assurance']},{label:'Source',valuePath:['source','logicalOrigin']}
  ]})),actions}),page}
}
