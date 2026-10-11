# Using @hathq/ihat-store-local

Present HAT entries from an explicitly configured local catalog.

## Before you start

The package does not search the filesystem, fall back to a network source or install a role.

## First steps

Make the exact declared dependency artifacts available before installation. Local archives are excluded from Git; registry publication remains pending.

Run from the repository root:

```sh
pnpm install --frozen-lockfile
```

## How to assess the result

- Compose the common store model with a caller-supplied local RPC.
- Keep local catalog availability independent of online placement.

A passing source-level check establishes only what that check observes. Keep missing configuration, unavailable services and unverified deployment paths visible.

## Continue reading

[Repository overview](../README.md)
