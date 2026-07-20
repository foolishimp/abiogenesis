# CHECKPOINT: T-284 X Freeze Manifest

**Author**: codex
**Observation time**: 2026-07-20T02:22:30Z
**Ticket**: T-284
**Status**: X frozen as immutable evidence; no implementation authority

## Source Worktree

| Field | Exact value |
|---|---|
| worktree | `/Users/jim/src/apps/abiogenesis-5-root-governor` |
| branch | `codex/5.0-root-governor-recovery` |
| source HEAD | `1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8` |
| source HEAD tree | `e3700c2a8c333eef520e07440a766a1150107713` |
| upstream delta | 0 ahead, 0 behind |
| tracked modified files | 13 |
| staged files | 0 |
| untracked files | 0 |

## Immutable Snapshot

A temporary Git index was populated from source HEAD and then overlaid with the
exact worktree bytes. `git commit-tree` created an evidence commit without
changing the source branch, index, or worktree.

| Field | Exact value |
|---|---|
| archive ref | `refs/heads/archive/t284-x-freeze-20260720T022230Z` |
| remote archive branch | `origin/archive/t284-x-freeze-20260720T022230Z` |
| snapshot commit | `676766a648066eaa69dce05f636d5ec98fb40dec` |
| snapshot tree | `77a81cb16d196a016edca0af8d7ac7fd39d2e016` |
| snapshot parent | `1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8` |
| worktree status SHA-256 before and after | `579a38fdf643393b9be99d730515f240c657e0402bb4690a91b46f9cbd67e439` |
| unstaged binary patch SHA-256 | `9f82ab1842b08fb53ab0794637ca4f3dc9e38054a39851194b374c55a40402a8` |
| unstaged binary patch bytes | 1,697,979 |
| staged patch SHA-256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| untracked inventory SHA-256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| modified-file content aggregate | `ceeb18c47c8a61fc509da26620a70ca7db3b32c4b31cbec76ba5d34129e8ad61` |

The source status digest was identical before and after snapshot creation.
Every current modified file matched the corresponding snapshot blob exactly.

## Modified Carrier Inventory

| Path | Bytes | SHA-256 |
|---|---:|---|
| `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/execution_declaration_compiler.ts` | 12,104 | `b4aa86af78d7eb4adf5eb45c05363ec36ea08e0570cf3b72f6d89174d7129747` |
| `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts` | 582,018 | `2e9d48591f629f6bf0159280a9ab19a754767dd8baee5d543ae7dc725ae8ffa6` |
| `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/hog_program_resolution.ts` | 10,884 | `6e56ad8e9a04e0a27b5cc559bc351b5d79db83a556d6cf23b227a59d0e8f94e1` |
| `build_tenants/abiogenesis/typescript/contracts/native/abg.contract.abg.executive.inventory.json` | 10,570 | `41b3892d59582b4e9ff14e0374e9dba6f4dd15344574a2886526490eb947f6a8` |
| `build_tenants/abiogenesis/typescript/contracts/native/abg.contract.abg.m03.inventory.json` | 34,208 | `53b69b955a62c57f58210dba6dd0fb799330f5312e15963ef9d9a0c3bbf7815d` |
| `build_tenants/abiogenesis/typescript/contracts/native/abg.contract.abg.requirements.inventory.json` | 11,135 | `03790888f7350f792caaa49d756c51cf1ba3420840afe7e12fdcadee1bccd265` |
| `build_tenants/abiogenesis/typescript/contracts/native/abg.contract.abg.transport.inventory.json` | 13,589 | `06923c7c418e5a3c6e9d90bb6ad412b4afe7595f9752e746f6517e0d25820293` |
| `build_tenants/abiogenesis/typescript/contracts/native/abg.contract.app.m04.inventory.json` | 49,312 | `7a33e5cc26f8a5f3074a99d8f865c946b0afcf3d9a1e6e6427a703093c8fd4bd` |
| `build_tenants/abiogenesis/typescript/contracts/native/abg.contract.qualification.m05.inventory.json` | 47,471 | `51cf9b11dff2c3ca515a9367e4df806842aaf2319b9d32f0b8d4cbecebfe80d4` |
| `build_tenants/abiogenesis/typescript/contracts/public-contract-catalog.json` | 276,081 | `526e844a510cdf571c33a97f709b9a755f3f73287b57c49836be986eaffbf1ec` |
| `build_tenants/abiogenesis/typescript/contracts/tenant-conformance-manifest.json` | 20,060 | `ea02810daf476ed41f10e80b3eed31eda3e7f5b0dde94df0baebe7b496189545` |
| `build_tenants/abiogenesis/typescript/product-toolchain-manifest.json` | 374,678 | `88fbd5895edc8c414d1984c672deb3961ffaed4544a3f717b56e5fee4666ac60` |
| `build_tenants/abiogenesis/typescript/test_env/tests/test_t254_graph_vector_c_program_selection.test.mjs` | 30,237 | `0355253c39e026e6be05c49561fbfa2b2adea46c3e6672776a0336bf4b6ca74e` |

## Authority Boundary

The archive commit preserves bytes only. It does not promote the dirty work,
make generated inventories current, accept compiled-plan authority, or
authorize implementation. T-284 must classify each semantic carrier under the
accepted Product before M3 design may consume any part of it.
