# Runtime verification

[Repository policy CI](https://github.com/hathq/ihat-store-core/actions/workflows/oss-policy.yml) checks community, license and tracked-artifact policy.
[Product runtime CI](https://github.com/hathq/ihat-store-core/actions/workflows/product-quality.yml) runs the regression suite and records native Node/V8 coverage.
Inspect the run for the commit under review; no numeric coverage badge is asserted here.

Run from this repository with Node 24.11.0:

```sh
node --test --test-isolation=none test/*.test.mjs
```

24 synthetic regression cases passed locally against the existing runtime.
Tests use public fixtures and Node built-ins; no dependency installation is required.
The workflow pins the same Node version and preserves the existing repository-policy job.
Coverage measures the checked-in JavaScript runtime and does not prove security or E2E behavior.
