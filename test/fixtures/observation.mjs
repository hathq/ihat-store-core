// Public synthetic fixture; no customer or private source data.
export const observation = {
 source: {
  sourceId: 'local',
  revision: 1,
  logicalOrigin: 'https://fixture.invalid/',
  signingKeyId: 'fixture',
  publicKeyHex: 'a'.repeat(64)
 },
 catalog: {
  sourceId:'local',catalogDigestSha256:'c'.repeat(64),artifactAcquisitionAvailable:true,
  categories:[{id:'c',termId:'term:c',name:'Category',summary:'Owner category'}],
  candidates: Array.from({length: 5}, (_, index) => ({
   repositoryId: 'hat-' + index,
   packageId: 'hat/example' + index,
   version: '0.10.0',
   packageSha256: String(index).repeat(64),
   name: 'Package ' + index,
   summary: 'Declarative source',
   categoryId: 'c',
   assurance: 'source-pinned',
   installed: index === 0,
   residenceScopes: []
  }))
 }
}

export const cloneObservation = () => structuredClone(observation)

export function changedObservation(change) {
 const value = cloneObservation()
 change(value)
 return value
}
export const rpc = async method => method==='hat/catalog/list'
 ? {catalog:structuredClone(observation.catalog)}
 : {registry:{revision:1,selectedSourceId:'local',sources:[structuredClone(observation.source)]}}
