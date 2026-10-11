import type {SceneProjection} from '@zixcel/projection-contracts/client'

export interface PackageReference {
  readonly repositoryId:string
  readonly packageId:string
  readonly version:string
  readonly packageSha256:string
}
export interface Candidate extends PackageReference {
  readonly name:string
  readonly summary:string
  readonly categoryId:string
  readonly assurance:string
  readonly installed:boolean
  readonly residenceScopes:readonly string[]
}
export interface StoreQuery {
  readonly text?:string
  readonly categoryId?:string|null
  readonly order?:'name'|'repositoryId'
  readonly cursor?:string|null
  readonly limit?:number
}
export interface StorePage {
  readonly revision:string
  readonly queryRef:string
  readonly items:readonly Candidate[]
  readonly nextCursor:string|null
  readonly total:number
}
/** The existing core store port consumed by this projection producer. */
export interface SceneStore {
  readonly revision:string
  readonly source:{readonly sourceId:string;readonly logicalOrigin:string}
  readonly catalog:{readonly catalogDigestSha256:string;readonly artifactAcquisitionAvailable:boolean}
  query(query?:StoreQuery):StorePage
  installation(reference:PackageReference):{readonly method:string}
}
export function storeScene(store:SceneStore,query?:StoreQuery):{readonly snapshot:SceneProjection;readonly page:StorePage}
