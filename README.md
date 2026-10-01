# Placement-independent store domain

Package: `@hathq/ihat-store-core`, immutable development version **0.10.0**.

`createStore({catalog, source})` accepts a bounded owner observation. `query`, `detail` and `installation` return stable read models and an exact Hatter command request; they do not execute it. Package identity is the existing repository/package/version/SHA-256 tuple.

At most 128 candidates, 32 categories, 32 items per page, 128 UTF-8 query bytes and 256 cursor bytes are admitted. Cursors bind the full observed revision, query, ordering and offset. Changes invalidate cursors. Search is literal store filtering, never semantic inference or ranking written to sem-lang.

No semantic, control, installation, credential or renderer authority is transferred
to iHat. Acceptance and remaining work are recorded in
`docs/architecture/ihat-online-architecture.json` at the Wonderland root.
