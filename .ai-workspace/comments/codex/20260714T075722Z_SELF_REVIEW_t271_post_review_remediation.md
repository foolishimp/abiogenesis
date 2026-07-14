# T-271 Post-Review Remediation Self-Review

- ticket: T-271
- checkpoint: `3e726aa1`
- change_class: `requirement_reprice`
- status: remediation self-review passed; independent re-review required
- downstream gate: T-267 remains blocked

## Scope

This review evaluates the bounded repair of the five findings against
`f4ab3d4f`. It does not admit T-271 closure, public invocation, whole-program
conservation, capability publication, or T-267 implementation.

## Finding Dispositions

| Finding | Repair | Proof |
| --- | --- | --- |
| Retry bypassed retained C.retry | `coordinateCRetryAttempt` is the shared direct/complete coordinator. It derives the canonical policy, judgment, stop reason, and C-call close rows. Malformed output becomes a sealed failed-attempt receipt before a later attempt. | Malformed-output replay performs zero effects; retry receipts contain exact `c_call_judged: retry` and canonical policy evidence; forged policy evidence fails before effects. |
| C-call identity omitted compiled locus | CCALL-002/-004 now admit paired `programLocusRef` and complete `retryPath` on complete-program calls. The canonical mint, event carrier, admission, spine, and resolver preserve them. The flat compatibility tuple remains unchanged when both are absent. | Same-role loci mint different refs; real nested attempts `[1,1]` and `[2,1]` produce distinct C-call refs and replay exactly. |
| Result truth was erased | The compiler always counts a terminal workflow result and never clears an explicit result. Batch requests retain each task's result carrier and payload separately from terminal output. | Explicit result plus terminal workflow fails as `many`; changing task results while holding terminal output fixed changes only the batch result projection. |
| Batch projection was caller-owned | The callback was removed. Output and result refs derive separately from ordered admitted task truth, are receipt-sealed, and are rederived during replay. | Replay performs zero task effects; a resealed receipt with an altered result ref is rejected against deterministic task truth. |
| T-254 selection was not rederived | `compileCompleteCProgram` invokes the existing T-254 selection compiler and compares the complete binding, binding digest, selected candidate cardinality, and admitted selected program. | A valid alternate catalog program plus a fully resealed forged binding is rejected as an authority mismatch. |

## Additional Self-Review

The first repair pass sealed batch projection output but trusted a caller-
supplied resealed projection during replay. This self-review found and removed
that residual seam by rederiving the projection. It also tightened retry
receipt admission so `retry` cannot exist without canonical shared-policy
identity and evidence. These were fixed before this checkpoint was presented.

The attempted end-to-end fixture with duplicate authored `C.of.stageRole`
was discarded because existing admission law rejects that program. The
identity proof therefore uses the canonical mint for hypothetical same-role
loci, while the actual interpreter path proves distinct nested retry loci.
No requirement or test was weakened to admit an unlawful fixture.

## Verification

- `npm run test:semantic`: `1717/1717`.
- `npm run test:t271`: focused runtime/integration `56/56`, GTL `82/82`, packed
  API `1/1`.
- `npm run lint:semantic`: passed; GTL authority guard reports seven
  constructors and zero private fan-in imports.
- `npm run check:t252-consensus-probe`: passed; body digest
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`,
  manifest digest
  `sha256:2f7987957ae1e3143b6ef98e9cbb0f4fa5642d2222e9a6fee9ef1e60dc16eeb6`,
  two remaining gap families.
- `npm run check:abg-product-publication`: 82 schemas and 40 publication
  assets verified from 1118 payload files.
- `npm run check:ds-governance`: passed after the ticket/comment join; 19
  tickets and 63 commentary references checked.
- `npm run check:design-mermaid`: 66 diagrams across 22 files passed.
- `npm pack --dry-run --json`: passed.
- `git diff --check`: passed before the implementation checkpoint.

## Negative Record

After the extra replay repair, the first full-suite run reported four T-223
failures because `product-toolchain-manifest.json` still described the prior
payload set. No runtime assertion failed. The publication was regenerated,
the publication check passed, and the complete suite then passed `1717/1717`.

## Verdict

The bounded remediation passes self-review. T-271 remains active pending an
independent trace review of the five repaired joins. T-267 must not begin on
this self-review alone.
