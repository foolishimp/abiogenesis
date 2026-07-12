# SELF-REVIEW: T-252 Consensus Target Design

**Author:** codex
**Date:** 2026-07-12
**Boundary:** DS-1 design only
**Verdict:** ready for F_H target review; executable body remains blocked

## Scope Held

This phase changed only the T-252 work item and one M01/M03 three-view design.
It added no product code, schema implementation, executable GTL body, compiler
change, runtime change, plugin, service, CLI verb, catalog row, or release
claim.

## Self-Review Findings And Repairs

1. The current native `fan_out` carrier cannot type the required
   `ReviewerAssignmentVector -> AttributedFindingsVector` relation. The design
   and ticket now retain this as a pre-admission generic HOF blocker and forbid
   name/tag, cast, `promote`, fixed-cardinality, and hand-built wrapper
   workarounds.
2. Runtime worker identity was initially placed in an authored reviewer task.
   It was removed. GTL carries only the profile-local execution-selection ref;
   ABG alone creates the task `FpTransformRequest` and owns worker, backend,
   dispatch, and transport truth.
3. Initial reduction and post-submitter reassessment initially shared one
   semantic carrier. They are now distinct native variants. Only the
   post-submitter assessment retains the exact admitted response ref and can
   type `recurse_next_round`.
4. The state and sequence views now keep `C.retry` on one reviewer F_P contract
   and semantic round continuation on GTL `recurse` plus foldback. Neither can
   substitute for the other.
5. Reviewer, reducer, submitter-response, and reassessment raw F_P output all
   cross Standard F_P admission. Fan-out advances ordinal or completes the
   vector only after that admission; it never admits worker output itself.
6. C-call blocked and F_H-held truth remain outside graph-success carriers.
   Public contract-failure and escalation variants are later replay/read
   projections, not fabricated round dispositions.
7. Every non-actor sequence participant now maps to a domain boundary, and
   every state transition names its owning admission, compiler, interpreter,
   projection, or external phase act.
8. The axiom matrix now uses only `pass | fail | not_applicable`. It honestly
   records two failed current-line axioms: the native typed HOF relation and
   executable compiler/runtime coverage. Those failures prevent design
   acceptance for body implementation.
9. Compiler diagnostics are explicitly frontier-shaped. Closing an outer gap
   may expose inner gaps; path-addressed reconciliation, not decreasing gap
   count, measures progress.

## Verification

- Focused Mermaid gate: renderer `11.3.0`, exactly `3` diagrams, digest
  `sha256:97aba778d2e84b953d8cfc0f516b00bf0f504f892aa3c1f051c31e5a904c901b`.
- Registered-design regression gate: `9` files and `27` diagrams passed.
- T-251 gate mutation tests: `5/5` passed.
- `git diff --check`: passed.
- Two independent design audits reviewed the final carrier/category structure;
  the final exact-digest audit returned `PASS`.
- The four unrelated untracked M02/M04 self-build design drafts retain their
  pre-phase SHA-256 digests and were not staged or edited.

## Disposition

T-252 is `ready_for_fh_review`, not accepted and not implementation-complete.
F_H may accept the target architecture and route the singular generic typed
HOF prerequisite. Executable Consensus GTL authorship remains stopped until
that prerequisite closes and this design is re-reviewed against the resulting
native carrier. No runtime or Consensus-specific workaround is authorized.
