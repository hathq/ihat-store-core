# @hathq/ihat-store-core

Build HAT search and detail views from an explicitly observed catalog.

## What you can do

- Query bounded catalog results with revision-bound cursors.
- Create an exact installation request for owner review.

## Current scope

Search is literal filtering. The package prepares a request; it does not install a role or infer semantic meaning.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

Use the package manager matching the checked-in lockfile and the Node.js version declared in `package.json` or the development configuration. Run from this repository:

```sh
pnpm install --frozen-lockfile
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Implementation and public interfaces](src) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
