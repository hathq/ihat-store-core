# Using @hathq/ihat-store-tests

Check that local and Web catalog placements produce consistent store views and interactions.

## Before you start

An installation-command spy checks request composition; it does not prove actual installation or production publication.

## First steps

Make the exact declared dependency artifacts available before installation. Local archives are excluded from Git; registry publication remains pending.

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm test
```

## How to assess the result

- Test bounded queries, stale sources and exact request identity.
- Observe browser rendering and cleanup against loopback sources.

A passing source-level check establishes only what that check observes. Keep missing configuration, unavailable services and unverified deployment paths visible.

## Continue reading

[Repository overview](../README.md)
