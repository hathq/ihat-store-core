# @hathq/ihat-store-tests

Check that local and Web catalog placements produce consistent store views and interactions.

## What you can do

- Test bounded queries, stale sources and exact request identity.
- Observe browser rendering and cleanup against loopback sources.

## Current scope

An installation-command spy checks request composition; it does not prove actual installation or production publication.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

The manifest currently requires locally supplied package archives: `@hathq/ihat-store-core`, `@hathq/ihat-store-source`, `@hathq/ihat-store-scenes`, `@hathq/ihat-store-local`, `@hathq/ihat-store-web`, `@hathq/delivery-server`, `@hathq/delivery-client`. These archives are excluded from Git. Obtain the exact approved dependency artifacts before installing; a fresh clone alone is not sufficient. Registry distribution remains pending.

Use the package manager matching the checked-in lockfile and the Node.js version declared in `package.json` or the development configuration. Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm test
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Implementation and public interfaces](src) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
