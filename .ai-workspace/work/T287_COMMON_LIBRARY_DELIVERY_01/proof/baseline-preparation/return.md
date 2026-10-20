# Baseline preparation return

Closed outcome: the exact preserved baseline built and packed successfully in the new `proof/baseline-build` copy. This establishes mechanical baseline readiness only. No tests, installed host, Product runtime/native execution, source repair, historical-resource operation, cleanup or Git mutation occurred.

Input source-manifest SHA256: `4f4fa05d92e306327f921dcaa6e14f81d851a84d8727b9c3fc391a30e66f37d9`. All 1,311 copied source files matched before build and remained unchanged afterward. The preserved snapshot also remains exact. All 936 protected main-tree build/contract/manifest files retain their before hashes.

Node `v24.7.0`, npm `11.5.1`, TypeScript `5.9.2`; exact package-lock SHA256 `df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12`. Offline dependency installation succeeded with scripts disabled and no network fallback. All 16 lock package versions and 4,576 installed dependency files/symlinks were inventoried; no mutable main-tree dependency link was used.

| Command in isolated tenant | Outcome | Wall time |
|---|---|---|
| `npm ci --offline --ignore-scripts --no-audit --no-fund` | Exit 0 | 668.36 ms |
| `node node_modules/typescript/bin/tsc -p tsconfig.json` | Exit 0 | 6,821.80 ms |
| `node scripts/generate-product-manifest.mjs` | Exit 0 | 24,847.94 ms |
| `npm pack --ignore-scripts --json --pack-destination <own artifacts>` | Exit 0 | 3,293.54 ms |

Exact executable paths, cwd, environment overrides, timestamps, stdout/stderr and return codes are retained under `commands/`. These are single mechanical command observations, not performance qualification.

Artifact: `artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz`, 10,676,374 bytes, SHA256 `192356a4291696de676128394d355e9a2d371c8828ba17d60d2daead79ac34b5`. All 5,267 archive files match their isolated staged bytes; npm integrity and shasum match the archive. The archive declares 70,662,393 unpacked bytes and bundles the exact runtime dependency population listed in `readiness.json`.

Generated manifest: `../baseline-build/build_tenants/abiogenesis/typescript/product-toolchain-manifest.json`, raw-byte SHA256 `1ab726a7c5bc47a9c46f9ae9992c44425b383832b3f2657580eb7222d08c91ee`; declared Product content digest `sha256:6fb24fc7a8f6297aed78fbf830fb8b8ea977f9e9212f70733493abcf66c0b1f3`. All 5,265 declared payload locators are present in the package. Raw manifest byte hash and declared Product content digest are distinct coordinates.

`readiness.json` SHA256 `b14c0e7d08f2f5c219550accf9b6ec18e3a9979edaa5803e8703ee724e6e1ea8`; `package-source-correspondence.json` SHA256 `d7673f821dbc3d1244a0567617bb03c1777bc19f7b680e40e5b0ee44a91258e0`; `toolchain-and-dependencies.json` SHA256 `18164e4340552720de87fbaae57c7ca85a1529d717c9b07961fce173aa3d1561`.

Return to Executive. Subsequent installation, candidate comparison or execution requires its separate bounded activation; neither L2 acceptance nor L4 evidence is inferred from this baseline package.
