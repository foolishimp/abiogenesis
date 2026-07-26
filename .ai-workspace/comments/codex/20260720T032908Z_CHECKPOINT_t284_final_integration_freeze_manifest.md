# CHECKPOINT: T-284 Final-Integration Donor Freeze

**Author**: codex
**Observation time**: 2026-07-20T03:29:08Z
**Ticket**: T-284
**Status**: immutable donor evidence; no implementation authority

## Source Worktree

| Field | Exact value |
|---|---|
| worktree | `/Users/jim/src/apps/abiogenesis-5-final-integration` |
| branch | `codex/abiogenesis-5-final-integration` |
| source HEAD | `53b3a72cfb7b3f3773d2105d5cda06f06a96fe04` |
| source HEAD tree | `c9abddd5c1694c77575e5d6eda047093bb9cbcce` |
| remote branch tip | `232f7b2d` |
| local branch delta | 3 commits ahead |
| worktree entries | 346 |
| modified tracked entries | 188 |
| deleted tracked entries | 74 |
| untracked entries | 84 |
| staged entries | 0 |
| source status SHA-256 before and after | `77071fea8794d0a3b849a12560248f4096b2066c0a81062d291c8adf214fed72` |
| tracked full-index patch SHA-256 | `547e6e309113c3576820ceb973b785df9165b6e480b0ce6cbaf828bde36c9466` |
| untracked-name inventory SHA-256 | `b2159545fd2adda1043e516322f9ee9cdcf51e90a09efb2c88e239ba71d48288` |

## Immutable Worktree Snapshot

A temporary Git index was populated from source HEAD and overlaid with every
tracked deletion, tracked modification, and untracked non-ignored file. The
snapshot was created with `git commit-tree`; the source branch, index,
worktree, and stash list were not changed.

| Field | Exact value |
|---|---|
| archive ref | `refs/heads/archive/t284-final-integration-freeze-20260720T032908Z` |
| remote archive branch | `origin/archive/t284-final-integration-freeze-20260720T032908Z` |
| snapshot commit | `3c2d86d43d851fda0ce4a08a124beac2d3770f2d` |
| snapshot tree | `a887985026f9268beef1c8dfeae2c8c2e057b536` |
| snapshot parent | `53b3a72cfb7b3f3773d2105d5cda06f06a96fe04` |
| verification tree | `a887985026f9268beef1c8dfeae2c8c2e057b536` |

The remote ref resolves to the snapshot commit. Rebuilding the temporary index
after snapshot creation produced the same tree, and the source status digest
was unchanged.

## Rejected Prototype Stash

The branch carried one branch-local rejected prototype stash that was not
reachable from a remote ref. It is preserved separately so rejection does not
destroy evidence or accidentally make it a donor default.

| Field | Exact value |
|---|---|
| stash label | `rejected-t270-raw-af15-prototype-20260718` |
| stash commit | `d4d1a3cc838176b5f7f35e5371e8680f41aea816` |
| stash parents | `b67e26b2`, `37395cfe`, `07423109` |
| archive ref | `refs/heads/archive/t284-final-integration-stash-rejected-t270-20260720T032908Z` |
| remote archive branch | `origin/archive/t284-final-integration-stash-rejected-t270-20260720T032908Z` |
| tracked files | `t280_scenario09_one_surface_fixture.mjs`, `test_t280_one_surface_semantic_chain.test.mjs` |
| untracked files | `one_surface_execution_authority.ts`, `one_surface_execution_admission.ts` |
| disposition | `redundant` as live implementation; archive-only evidence |

## Donor Boundary

The integration line is not another realization base. Its committed transport
repairs `e736fa49` and `53b3a72c` are candidate donor evidence for the later
F_P slice because they restore RC5 transport contracts and bind the lane to
live plugins. No commit, dirty tree, generated output, test result, or rejected
stash enters the fresh 5.0 line without a T-284 carrier disposition and later
design-owned donor admission.
