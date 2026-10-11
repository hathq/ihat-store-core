import type {CatalogObservation, PackageReference, Store} from './types/catalog.d.mts'
export type * from './types/catalog.d.mts'
export const limits: Readonly<{candidates:128;categories:32;page:32;queryBytes:128;cursorBytes:256;documentBytes:524288}>
export function packageReference(candidate: PackageReference): PackageReference
/** Validate and retain a finite catalog snapshot; installation remains owner-controlled. */
export function createStore(observation: CatalogObservation): Readonly<Store>
