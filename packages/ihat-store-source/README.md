# @hathq/ihat-store-source

Observe a Hatter owner's selected catalog while detecting source selection or registry revision changes during the read. Supply the authenticated owner RPC yourself; this adapter starts no service, opens no network connection and stores no credentials.

```sh
npm install @hathq/ihat-store-source
```

```typescript
import { observeCatalog, type CatalogRpc } from '@hathq/ihat-store-source'
import { createStore } from '@hathq/ihat-store-core'

async function searchOwnerCatalog(rpc: CatalogRpc) {
  const observation = await observeCatalog(rpc, { locale: 'en' })
  return createStore(observation).query({ text: 'mail', limit: 16 })
}
```

The adapter calls `hat/catalog-source/list`, `hat/catalog/list` and `hat/catalog-source/list` in that order. A changed selected source, source revision or catalog source is rejected. Missing selected sources remain unavailable. Owner RPC failures preserve their original identity.

Consistency checks do not verify signatures, grant trust to a publisher or replace owner authentication/admission. The owner must provide verified observations. Additional catalog metadata is preserved by the observation adapter; the separate store contract retains only its declared fields.

Node.js 22 or later and ESM are required. Type declarations describe the two owner RPC endpoint contracts. The shared store contract is obtained from the official npm registry; development can link the same exact version locally.

From the repository root, run `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run typecheck` and `pnpm -r --include-workspace-root test`.

[Security reporting](../../SECURITY.md) · [License](LICENSE) · [Notices](NOTICE)
