# Wave 1 Handoff + Operational Model

Captured: 2026-08-07 20:22:31 AEST (+1000)

## Operational model in force

Current live roles are separation-of-duties and cannot be merged:

1. F_H / proxy role: this root session owns interpretation, review, and acceptance posture only. This role does not edit production code.
2. Worker role: implementation changes are done in the dedicated implementation lane only (historically via `codex-alt`), and only within bounded, F_H-approved cuts.
3. Independent review role: read-only reviewer(s) (main-account Max in this run) provide independent falsifier-first review and do not edit.
4. Evidence trail: posts under `.ai-workspace/comments/...` are review commentary and do not outrank `specification/`, `design/`, and acceptance candidates.

This handoff is the canonical continuity entry for any resumed session.

## Current repo snapshot (at handoff)

1. Repo: `/Users/jim/src/apps/abiogenesis-5-root-build`
2. Branch: `codex/t287-wave1`
3. HEAD: `dd935a1cd14a85c0a4871281def8af5e4d074019`
4. Working tree state: 51 tracked files modified, 18 untracked files, no freeze.
5. Last two stable hashes reported by worker:
   - binary diff SHA-256: `2f9a8fba6ab8543e00f6022ab05ad1f9303889071f0d9de677b843b80c893c5d`
   - status SHA-256: `4df6d15026ee22e730017b6318509d1f50b8825550985759989cfe0a67a91550`
6. Formal checkpoint/candidate context still at 1f6a86… (no update this run).
7. No commit was made, no freeze was made.

## What has been completed in this cycle (focus lane)

The last bounded repair lane reached green on focused F10 checks and is now ready for F_H review:

1. D17/D18 projected retry path completed and boundary checks tightened.
2. Exact projected-executor XOR path is retained with no caller-authored retry ingress.
3. D18 now validates admitted retry input/progress from exact event-derived route/attempt context.
4. GraphValidation gating and exception-safe D18 path are in place.
5. Physical tail binding now ties to adjacent route/attempt rows.
6. Fresh-process AX-F09 proof now reprojects D17 and executes projected D18 path in an installed environment.
7. Retry ownership/facts were reduced to event-calculus-only queries where appropriate.
8. Retry lifecycle/authority tests and focused AX-F09 proofs are green after edits.
9. `npm run build` and `git diff --check` passed at verification point.

## Wave 1 status and boundary

Wave 1 target remains A5-F10.

- Ticket progress remains: `8/34` (Wave 1 not complete).
- Waves: `0/5` accepted.
- Current status: implementation repairs are active in a focused lane.
- Not done yet: final full M5/governor suite, deterministic build/package, and formal F_H acceptance handoff.

## Open risk carried into the next handoff

1. Focused checks were green, but full-wave qualification remains outstanding.
2. A lot of prior review history exists; if any reviewer disagrees with this local ordering, it must be handled via explicit stop/review cycle before any new code edits.
3. Continue with same bounded rule:
   - no design resets unless an authority contradiction surfaces,
   - no full process changes from one review cycle to the next,
   - only restart from a documented, accepted F_H disposition.

## Next action sequence for the next session

1. Run focused test suite that was just completed if needed for revalidation of this cut.
2. Run full qualification sequence (conservation + R1–R10 + package + Governor + full M5) from the exact frozen candidate.
3. Produce a fresh receipt artifact.
4. Independent reviewer replays findings and returns pass/fail.
5. If pass, move A5-F10 state forward; if fail, return one bounded correction only.

## File map carried by this handoff

Primary active references

- `build_tenants/abiogenesis/typescript/code/src/abg/retry.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/traversal_route.ts`
- `build_tenants/abiogenesis/typescript/code/src/hog/execute.ts`
- `build_tenants/abiogenesis/typescript/code/src/hog/graph_execute.ts`
- `build_tenants/abiogenesis/typescript/code/src/public/operations.ts`
- `build_tenants/abiogenesis/typescript/test_env/falsifiers/runtime-f09*.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/t287-r6-retry-success-exit.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/m5-retry-lifecycle-authority.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/m5-event-calculus-runtime.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/fixtures/abi5-root-candidate-basis.json`

## Governance note

The system-level operational model is stable and should continue:

1. `specification/` and ratified design define authority and correctness.
2. code and tests are execution realization.
3. comments are context records only.
4. no authority claims are accepted from a single check run; independent review + serialized qualification remains mandatory before any freeze or release transition.
