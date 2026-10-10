import type {Catalog, CatalogObservation, CatalogSource} from '@hathq/ihat-store-core'
export interface SourceRegistry {
 revision: number; selectedSourceId: string; sources: readonly CatalogSource[]
}
/** Existing owner RPC endpoints; this adapter neither authenticates nor fetches by itself. */
export interface CatalogRpc {
 (method: 'hat/catalog-source/list', params: Record<string, never>): Promise<{registry: SourceRegistry}>
 (method: 'hat/catalog/list', params: {locale: string}): Promise<{catalog: Catalog}>
}
export function observeCatalog(rpc: CatalogRpc, options?: {locale?: string}): Promise<CatalogObservation>
