// Existing Hatter owner reads only. Placement does not become signing authority.
export async function observeCatalog(rpc,{locale='en'}={}){
 const before=(await rpc('hat/catalog-source/list',{})).registry
 const catalog=(await rpc('hat/catalog/list',{locale})).catalog
 const after=(await rpc('hat/catalog-source/list',{})).registry
 if(before.revision!==after.revision||before.selectedSourceId!==after.selectedSourceId||catalog.sourceId!==after.selectedSourceId)throw Object.assign(Error('StoreSourceChanged'),{code:'StoreSourceChanged'})
 const source=after.sources.find(s=>s.sourceId===after.selectedSourceId)
 if(!source)throw Object.assign(Error('StoreSourceUnavailable'),{code:'StoreSourceUnavailable'})
 return {catalog,source:{sourceId:source.sourceId,revision:after.revision,logicalOrigin:source.logicalOrigin,signingKeyId:source.signingKeyId,publicKeyHex:source.publicKeyHex}}
}
