# SELF REVIEW: T-284 X-To-5 Correction Vector

**Author**: codex
**Observed at**: 2026-07-20T02:53:54Z
**Ticket**: T-284
**Subject**:
`.ai-workspace/comments/codex/20260720T023314Z_STRATEGY_t284_x_to_5_correction_vector.md`
**Subject SHA-256**:
`76864793039238e28bc5386704f92972e8c4964cfe283847d2d08d5c3d96539f`
**Verdict**: self-review complete; independent review required; no design or
implementation authority

## Review Method

The review compared four independent surfaces:

1. the accepted ABIogenesis 5.0 Product and GOALS basis;
2. the exact RC5 release note, source commit, package identity, and tests;
3. frozen X commit `676766a6`, including exact source and test comparisons; and
4. T-284 required outputs and closure conditions.

It also checked the current shared `SPEC_METHOD.md` migration taxonomy. The
selected strategy is a Fundamental Re-Adoption Migration from exact RC5, not an
in-place refactor or hard-break pruning wave over X.

## Findings Repaired During Self-Review

### 1. RC5 transport conservation was initially overstated

The first draft classified B07-B14 as `partial / retain`. Exact comparison
falsified that classification.

Frozen X contains none of:

- `AgentTransportRequest.lane` or `TransportCapabilityLane`;
- `worker_executes` / `closed_prompt_proof` dispatch distinction;
- `admitTransportAppendArgs` or four-agent append-argument bindings;
- `ABG_TS_WORKER_SANDBOX`; or
- the RC5 real-path worker-executes and invariant-shaped transport proofs.

X restored unconditional Claude `--safe-mode --tools ""` and treats observed
tool calls as contract failure. B07-B14 now classify X as `contradictory` or
`missing` and action `replace`: exact RC5 behavior is the construction source.

### 2. RC5 evidence boundaries were collapsed

The original B23 row conflated packed-byte qualification, live pre-snapshot
proof, predecessor evidence scope, and the no-preclaim boundary. B24-B26 now
preserve those as distinct obligations.

### 3. Target rows omitted the predecessor dimension

Feature, scenario, root, and carrier tables now carry an explicit 4.6 semantic
disposition. A shared metadata section binds every row to source evidence,
accepted target authority, current X evidence, confidence, and unresolved
decision without repeating identical columns.

### 4. The method-level migration class was implicit

The vector now states Fundamental Re-Adoption Migration and maps its finer X
actions to the method classes:

```text
retain             -> carry_across
refactor / replace -> rewrite
delete / archive   -> redundant as live implementation
create             -> no inherited implementation
```

This makes non-migration the default and prevents X from remaining ambient
authority.

### 5. Compiler naming needed a bounded distinction

The carrier census now separates prohibited executable lowering and plan
carriers from helpers whose useful interior is validation or relation binding.
The latter are `refactor`, not automatic deletion, and may retain no topology,
selection, or execution-plan authority.

## Reproduced Evidence

| Check | Result |
|---|---|
| X source status digest | `579a38fdf643393b9be99d730515f240c657e0402bb4690a91b46f9cbd67e439` |
| X worktree against frozen snapshot | no byte delta |
| X snapshot tree | `77a81cb16d196a016edca0af8d7ac7fd39d2e016` |
| remote archive ref | resolves to `676766a648066eaa69dce05f636d5ec98fb40dec` |
| X full-index binary patch SHA-256 | `9f82ab1842b08fb53ab0794637ca4f3dc9e38054a39851194b374c55a40402a8` |
| RC5 baseline rows | 26 |
| RC5 explicit exclusion rows | 8 |
| traversal rows | 40 plus one separate fibre-substitution differential |
| accepted feature rows | 17 |
| scenarios | 7 |
| root obligations | 10 |
| X carrier families | 34 |
| held ticket dispositions | 10 |
| `git diff --check` | pass |
| runtime/design files changed by T-284 | 0 |

The vector contains no `satisfied` target classification and no unresolved
semantic decision. That is conservative and consistent: the accepted Product
fixes semantics, while no installed direct-GTL 5.0 proof exists. Open choices
belong to M3 design and are not hidden Product ambiguity.

## Remaining Independent Review Questions

An independent reviewer must attempt to falsify:

1. whether every RC5 release claim and exclusion has a disposition;
2. whether clean RC5 is the lower-risk construction basis than pruning X;
3. whether any X carrier marked `retain` or `refactor` still carries prohibited
   topology, selection, controller, event, or closure authority;
4. whether any carrier marked `delete` has unassigned semantic value;
5. whether the 40 traversal rows, fibre differential, 17 features, seven
   scenarios, and R1-R10 are complete;
6. whether every held ticket claim has an explicit successor disposition; and
7. whether M3 can begin at Design without further Intent, Product, requirement,
   or Goal re-entry.

Until that review accepts the exact subject digest, T-284 remains active and
M3 remains blocked.
