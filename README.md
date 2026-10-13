# @hathq/ihat-store-core

Build immutable HAT catalog search/detail views from an owner-verified observation. Queries use bounded literal filtering, stable ordering and revision-bound cursors. Installation is an exact request for the owner to review, not an action performed by this package.

```sh
npm install @hathq/ihat-store-core@0.10.0
```

```typescript
import { createStore, packageReference } from '@hathq/ihat-store-core'
import type { CatalogObservation } from '@hathq/ihat-store-core'

// Obtain this observation through your authenticated catalog owner.
function searchCatalog(observation: CatalogObservation) {
  const store = createStore(observation)
  const page = store.query({ text: 'mail', order: 'name', limit: 16 })
  const first = page.items.find(candidate => !candidate.installed)
  return {
    page,
    request: first && store.catalog.artifactAcquisitionAvailable
      ? store.installation(packageReference(first)) : null
  }
}
```

The owner must verify signatures, publisher identity, source admission and catalog provenance before supplying the observation. This library validates finite field and document bounds, preserves declared assurance, copies the snapshot and deeply freezes retained state. It does not authenticate a publisher, fetch a catalog, install a package, execute code or infer semantic meaning.

## Interfaces and package boundaries

- `createStore`: retain a bounded observation and expose search/detail/installation-request operations.
- `packageReference`: select the exact repository/package/version/SHA-256 tuple.
- `limits`: explicit candidate, category, pagination, cursor and document budgets.
- `@hathq/ihat-store-source`: separate adapter for an explicitly supplied Hatter owner RPC; checks source consistency across reads.

Type declarations are shipped separately from the ESM implementation. Node.js 22 or later is required. Revision-bound cursors must be discarded after a catalog or query change. Run installation requests only through the owner's admission and authorization checks.

## Development

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run typecheck
pnpm -r --include-workspace-root test
pnpm audit --audit-level=low
```

Development links the exact contract version within this repository. Distribution manifests contain public registry versions and no sibling checkout requirement.

[Security reporting](SECURITY.md) · [License](LICENSE) · [Notices](NOTICE)

[OSS responsibility and source completion](docs/oss-source-contract.md) defines the supported package boundary and required acceptance. It does not declare unexecuted source, distribution or production checks complete.
