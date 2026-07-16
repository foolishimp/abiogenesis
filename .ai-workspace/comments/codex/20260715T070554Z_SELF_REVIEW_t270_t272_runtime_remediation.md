# T-270/T-272 Runtime Remediation Self-Review

**Date**: 2026-07-15
**Reviewer**: Codex implementation self-review
**Disposition**: implementation verified; independent closure review pending

## Scope

This review covers the six defects reported against the public catalog
invocation and F_H continuation integration. It does not close T-270 or T-272
and does not authorize DS-4.

## Finding Disposition

1. **Malformed F_P actor closure - repaired.** The actor start is followed by
   a blocked `actor_invocation_closed` event before transport or strict result
   admission errors leave the C-call. Tests cover the malformed attached-result
   path and reject untyped assessment rows.
2. **Nested `workflow.C` F_H continuation - repaired.** Basis admission records
   the exact replay seed and catalog authority. Resume reconstructs the
   root-to-child ancestry, continues the child receipt, folds its admitted
   output into the held parent C-call, and resumes each parent through the
   ordinary interpreter.
3. **Resume-side all-vector controller - removed.** Held-receipt recovery uses
   the opened interaction's vector, C-program plan, admission, locus, and
   receipt identities. Replay ancestry follows `workflow.C` evidence links;
   it does not infer a linear vector prefix or thread outputs by array order.
4. **Ordered GraphVector source tuples - repaired.** Each declared source is
   resolved in source order from either its graph-input coordinate or its one
   replay-admitted producer. Multi-source vectors receive one deterministic
   tuple identity while retaining distinct source payload and lineage refs.
5. **Legacy F_H truth - removed.** `fh_escalation` and `fh_escalated` are absent
   from runtime unions, producers, admission, projections, and generated public
   schemas. The only current path is held C-program receipt -> interaction ->
   response -> resume -> successor receipt -> interpreter continuation.
6. **Generated checkpoint evidence - repaired.** Public schemas, publication
   assets, the product toolchain manifest, and T-252 probe manifest were
   regenerated and independently checked against current source.

## Prime And Control Review

- Replay selects one current vector; no public catalog all-vector execution
  loop exists.
- Vector-wide iteration remains only in compile/preflight and read-model
  inventory code, before effects.
- F_P assessment-row admission is commonized between transport and selected
  result-contract admission.
- Public operation event-admission truth is authored by the operation register;
  SDK admission no longer reconstructs a second per-operation roster.
- Missing `workflow.C` routing is rejected by catalog-program preflight before
  effects.
- No backward-compatibility branch was retained, per the direct F_H ruling.

## Verification

- strict TypeScript build: passed
- GTL law: 82/82
- full semantic suite: 1748/1748
- T-223 publication lane: 70/70
- T-252 probe: passed; body and manifest digests match; one owned gap family
- T-257 focused and packed lanes: passed
- T-258 focused 14/14 and packed 1/1
- T-267 focused 60/60 and packed 1/1
- T-271 focused 57/57 and packed 1/1
- design gate: 90 diagrams across 30 files
- Prime gate: 7 accepted designs checked, zero failures
- public contracts: 82 schemas verified
- product publication: 40 generated assets verified from 1133 payload files
- `git diff --check`: passed

## Residual Boundary

The worktree remains intentionally uncommitted and unpushed for independent
review. The untracked `build_tenants/abiogenesis/typescript/node_modules`
symlink predates this remediation and is excluded from checkpoint content.
