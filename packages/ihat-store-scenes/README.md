# @hathq/ihat-store-scenes

Build declarative search and detail views for a HAT store.

## What you can do

- Render bounded page metadata.
- Attach exact installation-request actions to observed catalog entries.

## Current scope

The trusted renderer owns DOM and accessibility. Store packages do not provide arbitrary executable UI or grant installation authority.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

The declared dependencies use official npm registry versions: `@hathq/ihat-store-core` 0.10.0 and `@zixcel/projection-contracts` 0.10.0. This projection package provides ESM declarations for its store port and query/result shapes. Its own registry publication remains pending; source and candidate archive verification are recorded separately.

Use the package manager matching the checked-in lockfile and the Node.js version declared in `package.json` or the development configuration. Run from this repository:

```sh
pnpm install --frozen-lockfile
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Implementation and public interfaces](src) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)

## Release provenance

Starting with 0.10.1, releases use GitHub Actions OIDC trusted publishing from `hathq/ihat-store-core` (`publish-npm.yml`), without a stored npm publishing token. The workflow verifies reviewed archive hashes and requires npm provenance metadata. Check the published version on npm and verify registry signatures and provenance with `npm audit signatures` in an installed consumer project. Package runtime behavior and API contracts are unchanged by this release.
