/** A verified owner observation; the store itself performs no signature verification. */
export interface CatalogSource {
 sourceId: string; revision: number; logicalOrigin: string
 signingKeyId: string; publicKeyHex: string
}
export interface PackageReference {
 repositoryId: string; packageId: string; version: string; packageSha256: string
}
export interface CatalogCandidate extends PackageReference {
 name: string; summary: string; categoryId: string; assurance: string
 installed: boolean; residenceScopes: readonly string[]
}
export interface CatalogCategory { id: string; termId: string; name: string; summary: string }
export interface Catalog {
 sourceId: string; catalogDigestSha256: string; artifactAcquisitionAvailable: boolean
 candidates: readonly CatalogCandidate[]; categories: readonly CatalogCategory[]
}
export interface CatalogObservation { source: CatalogSource; catalog: Catalog }
export interface StoreQuery {
 text?: string; categoryId?: string | null; order?: 'name' | 'repositoryId'
 cursor?: string | null; limit?: number
}
export interface StorePage {
 readonly revision: string; readonly queryRef: string; readonly items: readonly CatalogCandidate[]
 readonly nextCursor: string | null; readonly total: number
}
export interface InstallRequest {
 readonly method: 'hat/catalog/install'
 readonly params: { readonly repositoryId: string; readonly expected: {
  readonly sourceId: string; readonly sourceRevision: number
  readonly catalogDigestSha256: string; readonly packageSha256: string
 } }
}
export interface Store {
 readonly revision: string; readonly source: Readonly<CatalogSource>; readonly catalog: Readonly<Catalog>
 detail(reference: PackageReference): Readonly<CatalogCandidate>
 query(query?: StoreQuery): Readonly<StorePage>
 installation(reference: PackageReference): Readonly<InstallRequest>
}
