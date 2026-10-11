# @hathq/ihat-store-local

Present HAT entries from an explicitly configured local catalog.

## What you can do

- Compose the common store model with a caller-supplied local RPC.
- Keep local catalog availability independent of online placement.

## Current scope

The package does not search the filesystem, fall back to a network source or install a role.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

The manifest currently requires locally supplied package archives: `@hathq/ihat-store-core`, `@hathq/ihat-store-source`. These archives are excluded from Git. Obtain the exact approved dependency artifacts before installing; a fresh clone alone is not sufficient. Registry distribution remains pending.

Use the package manager matching the checked-in lockfile and the Node.js version declared in `package.json` or the development configuration. Run from this repository:

```sh
pnpm install --frozen-lockfile
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Implementation and public interfaces](src) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
